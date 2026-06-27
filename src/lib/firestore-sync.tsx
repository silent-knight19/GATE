'use client'

import { useEffect, useCallback } from 'react'
import { doc, setDoc, onSnapshot, type DocumentSnapshot } from 'firebase/firestore'
import { db, isConfigured } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'
import { useAppStore, stripFunctions } from '@/lib/store'
import type { StudyLogEntry, MockTest, RevisionEntry, DailyTaskGroup } from '@/lib/store'
import type { TopicStatus } from '@/lib/data/syllabus'

/** How long to wait after the last user-initiated change before flushing to Firestore. */
const SAVE_DEBOUNCE_MS = 2000
const STORE_FIELD = 'store'
const PENDING_KEY = 'gateee-sync-pending'
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 5000

/** How long to wait before reconnecting the snapshot listener on error. */
const SNAPSHOT_RECONNECT_BASE_MS = 1000
const SNAPSHOT_RECONNECT_MAX_MS = 16000

/** How often to verify the snapshot listener is alive (belt-and-suspenders). */
const HEALTH_CHECK_INTERVAL_MS = 30000

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildPayload(state: ReturnType<typeof useAppStore.getState>): Record<string, unknown> {
  const payload = stripFunctions(state)
  delete payload.syncStatus
  delete payload.timerState
  delete payload.setTimerState
  return payload
}

const DATA_KEYS = [
  'user', 'topicsProgress', 'logs', 'tests', 'dailyTasks',
  'weeklyTargets', 'plannerSettings', 'revisionHistory', 'appState',
] as const

function hasDataChanged(
  prev: ReturnType<typeof useAppStore.getState>,
  next: ReturnType<typeof useAppStore.getState>,
): boolean {
  for (const key of DATA_KEYS) {
    if (prev[key] !== next[key]) return true
  }
  return false
}

// ---------------------------------------------------------------------------
// Array merge helpers — deduplicate entries so concurrent edits are merged
// instead of last-writer-wins.
// ---------------------------------------------------------------------------

function logEntryKey(e: StudyLogEntry): string {
  return `${e.date}|${e.subjectId}|${e.topicId}|${e.hours}|${e.activityType}`
}

function mergeLogs(
  local: StudyLogEntry[],
  remote: StudyLogEntry[],
): StudyLogEntry[] {
  const seen = new Set<string>()
  const result: StudyLogEntry[] = []
  for (const e of remote) {
    const k = logEntryKey(e)
    if (!seen.has(k)) { seen.add(k); result.push(e) }
  }
  for (const e of local) {
    const k = logEntryKey(e)
    if (!seen.has(k)) { seen.add(k); result.push(e) }
  }
  return result.slice(-5000)
}

function mergeTests(local: MockTest[], remote: MockTest[]): MockTest[] {
  const byId = new Map<string, MockTest>()
  for (const t of remote) byId.set(t.id, t)
  for (const t of local) {
    if (!byId.has(t.id)) byId.set(t.id, t)
  }
  return [...byId.values()].slice(-500)
}

function mergeRevisions(
  local: RevisionEntry[],
  remote: RevisionEntry[],
): RevisionEntry[] {
  const byTopic = new Map<string, RevisionEntry>()
  for (const r of remote) byTopic.set(r.topicId, r)
  for (const r of local) {
    const existing = byTopic.get(r.topicId)
    if (!existing || r.revisionCount > existing.revisionCount) {
      byTopic.set(r.topicId, r)
    }
  }
  return [...byTopic.values()].slice(-2000)
}

function mergeDailyTasks(
  local: DailyTaskGroup[],
  remote: DailyTaskGroup[],
): DailyTaskGroup[] {
  const byDate = new Map<string, DailyTaskGroup>()
  for (const g of remote) byDate.set(g.date, g)
  for (const g of local) {
    const existing = byDate.get(g.date)
    if (!existing) {
      byDate.set(g.date, g)
    } else {
      const taskById = new Map<string, (typeof existing.tasks)[0]>()
      for (const t of existing.tasks) taskById.set(t.id, t)
      for (const t of g.tasks) {
        if (!taskById.has(t.id)) taskById.set(t.id, t)
      }
      const mergedTasks = [...taskById.values()]
      byDate.set(g.date, {
        ...existing,
        tasks: mergedTasks,
        totalHours: mergedTasks.reduce((s, t) => s + t.estimatedHours, 0),
        completedHours: mergedTasks.filter(t => t.completed).reduce((s, t) => s + t.estimatedHours, 0),
      })
    }
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date)).slice(-365)
}

function mergeTopicsProgress(
  local: Record<string, TopicStatus>,
  remote: Record<string, TopicStatus>,
): Record<string, TopicStatus> {
  const STATUS_ORDER: TopicStatus[] = ['not_started', 'in_progress', 'completed', 'mastered']
  const merged = { ...local }
  for (const [topicId, remoteStatus] of Object.entries(remote)) {
    const localStatus = merged[topicId]
    if (!localStatus || STATUS_ORDER.indexOf(remoteStatus) > STATUS_ORDER.indexOf(localStatus)) {
      merged[topicId] = remoteStatus
    }
  }
  return merged
}

// ---------------------------------------------------------------------------
// Module-level mutable state — avoids the need for ref-during-render patterns.
// Updated by useEffect inside the component.
// ---------------------------------------------------------------------------

let _currentUser: ReturnType<typeof useAuth>['user'] = null
let _setSyncStatus: ((status: Partial<import('@/lib/store').SyncStatus>) => void) | null = null
let _saveTimer: ReturnType<typeof setTimeout> | null = null
let _retryTimer: ReturnType<typeof setTimeout> | null = null
let _saveRetryCount = 0
let _isSaving = false
let _isDirty = false
let _applyingRemote = false
let _prevState: ReturnType<typeof useAppStore.getState> | null = null
let _unsubscribeSnapshot: (() => void) | null = null
let _snapshotErrorCount = 0
let _snapshotReconnectTimer: ReturnType<typeof setTimeout> | null = null
let _loadInProgress = false
let _healthCheckTimer: ReturnType<typeof setInterval> | null = null

// ---------------------------------------------------------------------------
// doSave — always reads the CURRENT store state at call-time.
// ---------------------------------------------------------------------------

async function doSave() {
  if (!_currentUser) return
  if (_isSaving) return

  _isSaving = true
  _isDirty = false

  const freshState = useAppStore.getState()

  try {
    _setSyncStatus?.({ state: 'saving', lastError: null })
    const payload = buildPayload(freshState)
    const ref = doc(db!, 'users', _currentUser.uid)
    await setDoc(ref, { [STORE_FIELD]: payload }, { merge: true })
    _saveRetryCount = 0
    try { localStorage.removeItem(PENDING_KEY) } catch { /* ignore */ }
    _setSyncStatus?.({ state: 'saved' })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown save error'

    if (_saveRetryCount < MAX_RETRIES) {
      _saveRetryCount++
      _isDirty = true
      _setSyncStatus?.({
        state: 'saving',
        lastError: `Retrying (${_saveRetryCount}/${MAX_RETRIES})...`,
      })
      _retryTimer = setTimeout(() => { doSave() }, RETRY_DELAY_MS)
    } else {
      _saveRetryCount = 0
      _setSyncStatus?.({ state: 'error', lastError: msg })
    }
  } finally {
    _isSaving = false
  }
}

// ---------------------------------------------------------------------------
// scheduleSave — debounces saves. Called by the subscription.
// ---------------------------------------------------------------------------

function scheduleSave() {
  _isDirty = true
  if (_saveTimer) clearTimeout(_saveTimer)
  _saveRetryCount = 0
  _saveTimer = setTimeout(() => { doSave() }, SAVE_DEBOUNCE_MS)
}

// ---------------------------------------------------------------------------
// Manual refresh hook
// ---------------------------------------------------------------------------

let _manualRefresh: (() => Promise<void>) | null = null

export function triggerFirestoreRefresh(): Promise<void> {
  return _manualRefresh?.() ?? Promise.resolve()
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FirestoreSync() {
  const { user } = useAuth()
  const setSyncStatus = useAppStore((s) => s.setSyncStatus)

  // Keep module-level state in sync with the latest React values.
  useEffect(() => { _currentUser = user }, [user])
  useEffect(() => { _setSyncStatus = setSyncStatus }, [setSyncStatus])

  // ------------------------------------------------------------------
  // applyRemoteSnapshot — merges remote Firestore data into local store
  // using intelligent field-level merge instead of wholesale replacement.
  // ------------------------------------------------------------------
  const applyRemoteSnapshot = useCallback(
    (remote: Record<string, unknown>) => {
      const current = useAppStore.getState()

      const remoteTopics = (remote.topicsProgress || {}) as Record<string, TopicStatus>

      _applyingRemote = true
      useAppStore.setState({
        user: (remote.user as typeof current.user) || current.user,
        topicsProgress: mergeTopicsProgress(current.topicsProgress, remoteTopics),
        logs: mergeLogs(current.logs, (remote.logs as StudyLogEntry[]) || []),
        tests: mergeTests(current.tests, (remote.tests as MockTest[]) || []),
        revisionHistory: mergeRevisions(
          current.revisionHistory,
          (remote.revisionHistory as RevisionEntry[]) || [],
        ),
        dailyTasks: mergeDailyTasks(
          current.dailyTasks,
          (remote.dailyTasks as DailyTaskGroup[]) || [],
        ),
        weeklyTargets: (remote.weeklyTargets as typeof current.weeklyTargets) || current.weeklyTargets,
        plannerSettings: (remote.plannerSettings as typeof current.plannerSettings) || current.plannerSettings,
        appState: (remote.appState as typeof current.appState) || current.appState,
      } as Partial<typeof current>)

      _prevState = useAppStore.getState()
      setTimeout(() => { _applyingRemote = false }, 0)
    },
    [],
  )

  // ------------------------------------------------------------------
  // Snapshot handler — called by onSnapshot for both initial and
  // subsequent real-time updates.
  // ------------------------------------------------------------------
  const handleSnapshot = useCallback(
    async (snap: DocumentSnapshot) => {
      // If the document truly doesn't exist yet, seed it with current local data.
      // But if the document exists without a store field, just wait — don't overwrite.
      if (!snap.exists()) {
        if (!_isSaving && _currentUser) {
          const current = useAppStore.getState()
          const payload = buildPayload(current)
          try {
            const ref = doc(db!, 'users', _currentUser.uid)
            await setDoc(ref, { [STORE_FIELD]: payload }, { merge: true })
            _setSyncStatus?.({ state: 'saved', lastError: null })
          } catch {
            // Will be retried by the save subscription
          }
        }
        return
      }

      const remote = snap.data()[STORE_FIELD] as Record<string, unknown> | undefined
      if (!remote) {
        // Document exists but store field is missing — skip to avoid wiping remote data.
        _setSyncStatus?.({ state: 'saved' })
        return
      }

      applyRemoteSnapshot(remote)

      try {
        const freshPayload = buildPayload(useAppStore.getState())
        localStorage.setItem(PENDING_KEY, JSON.stringify(freshPayload))
      } catch { /* ignore quota errors */ }

      _setSyncStatus?.({ state: 'saved' })
    },
    [applyRemoteSnapshot],
  )

  // ------------------------------------------------------------------
  // subscribeToFirestore — sets up the real-time onSnapshot listener.
  // ------------------------------------------------------------------
  const subscribeToFirestore = useCallback(() => {
    if (!db || !_currentUser) return

    // Clear any pending reconnect timer since we're about to create a fresh listener.
    if (_snapshotReconnectTimer) {
      clearTimeout(_snapshotReconnectTimer)
      _snapshotReconnectTimer = null
    }

    _loadInProgress = true
    _setSyncStatus?.({ state: 'saving', lastError: null })

    try {
      const ref = doc(db, 'users', _currentUser.uid)
      const unsub = onSnapshot(
        ref,
        (snap) => {
          _snapshotErrorCount = 0
          handleSnapshot(snap)
          _loadInProgress = false
          _prevState = useAppStore.getState()
        },
        (error) => {
          const msg = error instanceof Error ? error.message : 'Snapshot error'
          _setSyncStatus?.({ state: 'error', lastError: msg })
          _loadInProgress = false
          _unsubscribeSnapshot = null

          // Reconnect with exponential backoff.
          _snapshotErrorCount++
          const delay = Math.min(
            SNAPSHOT_RECONNECT_BASE_MS * Math.pow(2, _snapshotErrorCount - 1),
            SNAPSHOT_RECONNECT_MAX_MS,
          )
          _snapshotReconnectTimer = setTimeout(() => {
            _snapshotReconnectTimer = null
            subscribeToFirestore()
          }, delay)
        },
      )
      _unsubscribeSnapshot = unsub
      _loadInProgress = false
    } catch {
      _loadInProgress = false
    }
  }, [handleSnapshot])

  // Expose for the manual refresh button.
  useEffect(() => {
    _manualRefresh = async () => {
      if (_snapshotReconnectTimer) {
        clearTimeout(_snapshotReconnectTimer)
        _snapshotReconnectTimer = null
      }
      _snapshotErrorCount = 0
      if (!_unsubscribeSnapshot) {
        subscribeToFirestore()
      }
      _setSyncStatus?.({ state: 'saving', lastError: null })
    }
    return () => { _manualRefresh = null }
  }, [subscribeToFirestore])

  // ------------------------------------------------------------------
  // Flush any pending save that was stashed to localStorage on a
  // previous unload. This closes the gap where a user closes the tab
  // during the debounce window.
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!isConfigured || !db || !user) return

    try {
      const raw = localStorage.getItem(PENDING_KEY)
      if (raw) {
        const stashed = JSON.parse(raw)
        const ref = doc(db, 'users', user.uid)
        setDoc(ref, { [STORE_FIELD]: stashed }, { merge: true })
          .then(() => localStorage.removeItem(PENDING_KEY))
          .catch(() => { /* will be retried on next visit */ })
      }
    } catch { /* malformed JSON or localStorage error — ignore */ }
  }, [user])

  // ------------------------------------------------------------------
  // Set up real-time listener on sign-in (after zustand hydration).
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!isConfigured || !db || !user) {
      if (_unsubscribeSnapshot) {
        _unsubscribeSnapshot()
        _unsubscribeSnapshot = null
      }
      if (_snapshotReconnectTimer) {
        clearTimeout(_snapshotReconnectTimer)
        _snapshotReconnectTimer = null
      }
      _loadInProgress = false
      _snapshotErrorCount = 0
      return
    }

    if (useAppStore.persist.hasHydrated()) {
      _prevState = useAppStore.getState()
      subscribeToFirestore()
    } else {
      const unsub = useAppStore.persist.onFinishHydration(() => {
        _prevState = useAppStore.getState()
        subscribeToFirestore()
      })
      return () => { unsub() }
    }

    return () => {
      if (_unsubscribeSnapshot) {
        _unsubscribeSnapshot()
        _unsubscribeSnapshot = null
      }
      if (_snapshotReconnectTimer) {
        clearTimeout(_snapshotReconnectTimer)
        _snapshotReconnectTimer = null
      }
      _loadInProgress = false
      _snapshotErrorCount = 0
    }
  }, [user, subscribeToFirestore])

  // ------------------------------------------------------------------
  // Subscribe to store changes. ONLY schedules a save when actual data
  // keys change — ignores syncStatus/timerState to prevent loops.
  // Skips saves triggered by our own remote snapshot application.
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!isConfigured || !db || !user) return

    const unsub = useAppStore.subscribe((state) => {
      if (_applyingRemote) return

      if (_prevState && !hasDataChanged(_prevState, state)) {
        return
      }
      _prevState = state

      scheduleSave()
    })

    return () => {
      unsub()
      if (_saveTimer) { clearTimeout(_saveTimer); _saveTimer = null }
      if (_retryTimer) { clearTimeout(_retryTimer); _retryTimer = null }
    }
  }, [user])

  // ------------------------------------------------------------------
  // Periodic health check — ensures the snapshot listener is alive.
  // If it's been lost for any reason, reconnects automatically.
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!isConfigured || !db || !user) return

    _healthCheckTimer = setInterval(() => {
      if (!_unsubscribeSnapshot && !_loadInProgress && !_snapshotReconnectTimer) {
        subscribeToFirestore()
      }
    }, HEALTH_CHECK_INTERVAL_MS)

    return () => {
      if (_healthCheckTimer) {
        clearInterval(_healthCheckTimer)
        _healthCheckTimer = null
      }
    }
  }, [user, subscribeToFirestore])

  // ------------------------------------------------------------------
  // Stash unsaved changes to localStorage on page unload so they can
  // be flushed to Firestore on the next visit.
  // ------------------------------------------------------------------
  useEffect(() => {
    function stashIfDirty() {
      if (!_isDirty) return
      try {
        const payload = buildPayload(useAppStore.getState())
        localStorage.setItem(PENDING_KEY, JSON.stringify(payload))
      } catch { /* ignore quota errors */ }
    }

    function onBeforeUnload() {
      stashIfDirty()
    }

    function onVisibilityHidden() {
      if (document.visibilityState === 'hidden') stashIfDirty()
    }

    window.addEventListener('beforeunload', onBeforeUnload)
    document.addEventListener('visibilitychange', onVisibilityHidden)

    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      document.removeEventListener('visibilitychange', onVisibilityHidden)
    }
  }, [])

  return null
}
