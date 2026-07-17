'use client'

import { useEffect, useCallback, useRef } from 'react'
import { doc, setDoc, onSnapshot, type DocumentSnapshot } from 'firebase/firestore'
import { db, isConfigured } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'
import { useAppStore, stripFunctions } from '@/lib/store'
import type { StudyLogEntry, MockTest, RevisionEntry, DailyTaskGroup } from '@/lib/store'
import type { TopicStatus } from '@/lib/data/syllabus'

const SAVE_DEBOUNCE_MS = 2000
const STORE_FIELD = 'store'
const PENDING_KEY = 'gateee-sync-pending'
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 5000
const SNAPSHOT_RECONNECT_DELAY_MS = 3000

// Helpers
// ---------------------------------------------------------------------------

function removeUndefined(obj: any): any {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(removeUndefined);
  const result: any = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) {
      result[k] = removeUndefined(v);
    }
  }
  return result;
}

function buildPayload(state: ReturnType<typeof useAppStore.getState>): Record<string, unknown> {
  const payload = stripFunctions(state)
  delete payload.syncStatus
  delete payload.timerState
  delete payload.setTimerState
  return removeUndefined(payload)
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

function logEntryKey(e: StudyLogEntry): string {
  if (e.id) return `id:${e.id}`
  return `${e.date}|${e.subjectId}|${e.topicId}|${e.hours}|${e.activityType}`
}

function mergeLogs(local: StudyLogEntry[], remote: StudyLogEntry[]): StudyLogEntry[] {
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

function mergeRevisions(local: RevisionEntry[], remote: RevisionEntry[]): RevisionEntry[] {
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

function mergeDailyTasks(local: DailyTaskGroup[], remote: DailyTaskGroup[]): DailyTaskGroup[] {
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
  return { ...local, ...remote }
}

// ---------------------------------------------------------------------------
// Module-level manual refresh — must live outside the component so
// triggerFirestoreRefresh() works from the navbar button.
// ---------------------------------------------------------------------------

let _manualRefresh: (() => Promise<void>) | null = null

export function triggerFirestoreRefresh(): Promise<void> {
  return _manualRefresh?.() ?? Promise.resolve()
}

// ---------------------------------------------------------------------------
// doSave / scheduleSave — module-level to avoid hook-inside-hook issues with
// the subscription callback which fires outside React's render cycle.
// ---------------------------------------------------------------------------

/** Track which DATA_KEYS have been modified locally but not yet saved to Firestore.
 *  Remote data from onSnapshot will NOT override dirty fields, preventing the
 *  "data vanishes" / "revert on sync" bugs. Cleared after a successful doSave(). */
const _dirtyFields = new Set<string>()

/** True while the PENDING_KEY flush is merging stashed data into the store.
 *  The store subscription must skip dirty-field tracking during this window,
 *  otherwise the stashed (potentially stale) data would be protected instead
 *  of yielding to the fresher Firestore snapshot that follows. */
let _applyingPendingData = false

let _saveUserId: string | null = null
let _saveTimer: ReturnType<typeof setTimeout> | null = null
let _saveRetryTimer: ReturnType<typeof setTimeout> | null = null
let _saveRetryCount = 0
let _isSaving = false
let _isDirty = false
let _setSyncStatus: ((status: Partial<import('@/lib/store').SyncStatus>) => void) | null = null

async function doSave() {
  if (!_saveUserId || _isSaving) return

  if (_dirtyFields.size === 0) {
    _isDirty = false
    return
  }

  _isSaving = true
  _isDirty = false

  try {
    _setSyncStatus?.({ state: 'saving', lastError: null })
    const payload = buildPayload(useAppStore.getState())
    const ref = doc(db!, 'users', _saveUserId)
    await setDoc(ref, { [STORE_FIELD]: payload }, { merge: true })
    _dirtyFields.clear()
    _saveRetryCount = 0
    _setSyncStatus?.({ state: 'saved' })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown save error'
    if (_saveRetryCount < MAX_RETRIES) {
      _saveRetryCount++
      _isDirty = true
      _setSyncStatus?.({ state: 'saving', lastError: `Retrying (${_saveRetryCount}/${MAX_RETRIES})...` })
      _saveRetryTimer = setTimeout(() => { doSave() }, RETRY_DELAY_MS)
    } else {
      _saveRetryCount = 0
      _setSyncStatus?.({ state: 'error', lastError: msg })
    }
  } finally {
    _isSaving = false
  }
}

function scheduleSave() {
  _isDirty = true
  if (_saveTimer) clearTimeout(_saveTimer)
  _saveRetryCount = 0
  _saveTimer = setTimeout(() => { doSave() }, SAVE_DEBOUNCE_MS)
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FirestoreSync() {
  const { user } = useAuth()
  const setSyncStatus = useAppStore((s) => s.setSyncStatus)

  // Keep module-level vars in sync with latest React values.
  useEffect(() => { _setSyncStatus = setSyncStatus }, [setSyncStatus])
  useEffect(() => { _saveUserId = user?.uid ?? null }, [user])

  // Refs for connection state within this component instance.
  const unsubRef = useRef<(() => void) | null>(null)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const applyingRemoteRef = useRef(false)
  const prevStateRef = useRef<ReturnType<typeof useAppStore.getState> | null>(null)
  const listenerCountRef = useRef(0)

  // ------------------------------------------------------------------
  // subscribeToFirestore
  // applyRemoteSnapshot
  // ------------------------------------------------------------------
  const applyRemote = useCallback((remote: Record<string, unknown>) => {
    const current = useAppStore.getState()

    applyingRemoteRef.current = true
    const updates: Record<string, unknown> = {}

    if (!_dirtyFields.has('user'))
      updates.user = (remote.user as typeof current.user) || current.user
    if (!_dirtyFields.has('topicsProgress'))
      updates.topicsProgress = mergeTopicsProgress(current.topicsProgress, (remote.topicsProgress || {}) as Record<string, TopicStatus>)
    if (!_dirtyFields.has('logs')) {
      updates.logs = mergeLogs(current.logs, (remote.logs as StudyLogEntry[]) || [])
    }
    if (!_dirtyFields.has('tests'))
      updates.tests = mergeTests(current.tests, (remote.tests as MockTest[]) || [])
    if (!_dirtyFields.has('revisionHistory'))
      updates.revisionHistory = mergeRevisions(current.revisionHistory, (remote.revisionHistory as RevisionEntry[]) || [])
    if (!_dirtyFields.has('dailyTasks'))
      updates.dailyTasks = mergeDailyTasks(current.dailyTasks, (remote.dailyTasks as DailyTaskGroup[]) || [])
    if (!_dirtyFields.has('weeklyTargets'))
      updates.weeklyTargets = (remote.weeklyTargets as typeof current.weeklyTargets) || current.weeklyTargets
    if (!_dirtyFields.has('plannerSettings'))
      updates.plannerSettings = (remote.plannerSettings as typeof current.plannerSettings) || current.plannerSettings
    if (!_dirtyFields.has('appState'))
      updates.appState = (remote.appState as typeof current.appState) || current.appState

    if (Object.keys(updates).length > 0) {
      useAppStore.setState(updates as Partial<typeof current>)
    }

    prevStateRef.current = useAppStore.getState()
    applyingRemoteRef.current = false
  }, [])

  // ------------------------------------------------------------------
  // handleSnapshot
  // ------------------------------------------------------------------
  const handleSnap = useCallback((snap: DocumentSnapshot) => {
    if (!snap.exists()) {
      if (!_isSaving && _saveUserId) {
        const payload = buildPayload(useAppStore.getState())
        setDoc(doc(db!, 'users', _saveUserId), { [STORE_FIELD]: payload }, { merge: true }).catch(() => {})
        setSyncStatus({ state: 'saved' })
      }
      return
    }

    const remote = snap.data()[STORE_FIELD] as Record<string, unknown> | undefined
    if (!remote) return

    applyRemote(remote)

    try {
      localStorage.setItem(PENDING_KEY, JSON.stringify(buildPayload(useAppStore.getState())))
    } catch { /* ignore */ }

    setSyncStatus({ state: 'saved' })
  }, [applyRemote, setSyncStatus])

  // Keep mutable refs so subscribe() never needs to re-create just because
  // handleSnap / setSyncStatus changed reference (which happens on every
  // render that calls setSyncStatus, creating an infinite listener storm:
  // snapshot → setSyncStatus → re-render → new subscribe → new listener → …).
  const handleSnapRef = useRef(handleSnap)
  handleSnapRef.current = handleSnap
  const setSyncStatusRef = useRef(setSyncStatus)
  setSyncStatusRef.current = setSyncStatus

  // ------------------------------------------------------------------
  // subscribeToFirestore
  // ------------------------------------------------------------------
  const subscribe = useCallback(() => {
    if (!db || !user?.uid) return

    // Clear pending reconnect.
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }

    // Unsubscribe any existing listener before creating a new one.
    if (unsubRef.current) {
      unsubRef.current()
      unsubRef.current = null
    }

    const uid = user.uid
    const ref = doc(db, 'users', uid)
    const count = ++listenerCountRef.current

    const sSync = setSyncStatusRef.current
    const hSnap = handleSnapRef.current

    sSync({ state: 'saving', lastError: null })

    const unsub = onSnapshot(
      ref,
      (snap) => {
        // Ignore if this listener was superseded by a newer one.
        if (count !== listenerCountRef.current) return

        hSnap(snap)
        prevStateRef.current = useAppStore.getState()
      },
      (error) => {
        if (count !== listenerCountRef.current) return

        const msg = error instanceof Error ? error.message : 'Snapshot error'
        sSync({ state: 'error', lastError: msg })
        unsubRef.current = null

        reconnectTimerRef.current = setTimeout(() => {
          reconnectTimerRef.current = null
          subscribe()
        }, SNAPSHOT_RECONNECT_DELAY_MS)
      },
    )

    unsubRef.current = unsub
  }, [user])

  // ------------------------------------------------------------------
  // Set up listener when user becomes available.
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!isConfigured || !db || !user) {
      if (unsubRef.current) {
        unsubRef.current()
        unsubRef.current = null
      }
      return
    }

    const doSubscribe = () => {
      _dirtyFields.clear()
      prevStateRef.current = useAppStore.getState()
      subscribe()
    }

    if (useAppStore.persist.hasHydrated()) {
      doSubscribe()
    } else {
      const unsub = useAppStore.persist.onFinishHydration(() => doSubscribe())
      return () => { unsub() }
    }

    return () => {
      if (unsubRef.current) {
        unsubRef.current()
        unsubRef.current = null
      }
    }
  }, [user, subscribe])

  // ------------------------------------------------------------------
  // Subscribe to local store changes and schedule saves.
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!isConfigured || !db || !user) return

    _dirtyFields.clear()
    prevStateRef.current = useAppStore.getState()

    const unsub = useAppStore.subscribe((state) => {
      if (applyingRemoteRef.current || _applyingPendingData) {
        prevStateRef.current = state
        return
      }
      if (prevStateRef.current && !hasDataChanged(prevStateRef.current, state)) return

      const prev = prevStateRef.current
      if (prev) {
        for (const key of DATA_KEYS) {
          if (prev[key] !== state[key]) {
            _dirtyFields.add(key)
          }
        }
      }

      prevStateRef.current = state

      if (_dirtyFields.size > 0) {
        scheduleSave()
      }
    })

    return () => {
      unsub()
      if (_saveTimer) { clearTimeout(_saveTimer); _saveTimer = null }
      if (_saveRetryTimer) { clearTimeout(_saveRetryTimer); _saveRetryTimer = null }
    }
  }, [user])

  // ------------------------------------------------------------------
  // Expose manual refresh — always force-reconnects the listener.
  // ------------------------------------------------------------------
  useEffect(() => {
    _manualRefresh = async () => {
      subscribe()
      setSyncStatus({ state: 'saving', lastError: null })
    }
    return () => { _manualRefresh = null }
  }, [subscribe])

  // ------------------------------------------------------------------
  // Absorb stashed data from a previous unload into the local store so
  // the normal save-and-snapshot flow handles it.  Writing directly to
  // Firestore here would race ahead of the first snapshot and potentially
  // overwrite newer server data from other devices.
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!isConfigured || !db || !user) return

    try {
      const raw = localStorage.getItem(PENDING_KEY)
      if (!raw) return
      localStorage.removeItem(PENDING_KEY)

      const stashed = JSON.parse(raw) as Record<string, unknown>

      _applyingPendingData = true
      useAppStore.setState(stashed)
      _applyingPendingData = false
    } catch { /* ignore */ }
  }, [user])

  // ------------------------------------------------------------------
  // Stash unsaved changes on unload.
  // ------------------------------------------------------------------
  useEffect(() => {
    function stashIfDirty() {
      if (!_isDirty) return
      try {
        localStorage.setItem(PENDING_KEY, JSON.stringify(buildPayload(useAppStore.getState())))
      } catch { /* ignore */ }
    }

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') stashIfDirty()
    }

    window.addEventListener('beforeunload', stashIfDirty)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', stashIfDirty)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  // ------------------------------------------------------------------
  // Health check — ensure the listener is alive every 30s.
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!isConfigured || !db || !user) return

    const id = setInterval(() => {
      if (!unsubRef.current && !reconnectTimerRef.current) {
        subscribe()
      }
    }, 30000)

    return () => clearInterval(id)
  }, [user, subscribe])

  return null
}
