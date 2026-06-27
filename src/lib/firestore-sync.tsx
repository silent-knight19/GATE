'use client'

import { useEffect, useRef, useCallback } from 'react'
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
  // Remote first (authoritative), then fill in any local-only entries.
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
      // Merge tasks within the same day — union by task id.
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
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryCountRef = useRef(0)
  const isLoadingRef = useRef(false)
  const loadInProgressRef = useRef(false)
  const prevStateRef = useRef<ReturnType<typeof useAppStore.getState> | null>(null)
  const isSavingRef = useRef(false)
  const isDirtyRef = useRef(false)
  const unsubscribeRef = useRef<(() => void) | null>(null)
  /** True while we're applying a remote snapshot — suppresses save trigger. */
  const applyingRemoteRef = useRef(false)

  const setSyncStatus = useAppStore((s) => s.setSyncStatus)

  // ------------------------------------------------------------------
  // doSave — always reads the CURRENT store state at call-time.
  // ------------------------------------------------------------------
  const doSave = useCallback(async () => {
    if (!db || !user) return
    if (isSavingRef.current) return

    isSavingRef.current = true
    isDirtyRef.current = false

    const freshState = useAppStore.getState()

    try {
      setSyncStatus({ state: 'saving', lastError: null })
      const payload = buildPayload(freshState)
      const ref = doc(db, 'users', user.uid)
      await setDoc(ref, { [STORE_FIELD]: payload }, { merge: true })
      retryCountRef.current = 0
      try { localStorage.removeItem(PENDING_KEY) } catch { /* ignore */ }
      setSyncStatus({ state: 'saved' })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown save error'

      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current++
        isDirtyRef.current = true
        setSyncStatus({
          state: 'saving',
          lastError: `Retrying (${retryCountRef.current}/${MAX_RETRIES})...`,
        })
        retryTimerRef.current = setTimeout(() => { doSaveRef.current() }, RETRY_DELAY_MS)
      } else {
        retryCountRef.current = 0
        setSyncStatus({ state: 'error', lastError: msg })
      }
    } finally {
      isSavingRef.current = false
    }
  }, [user, setSyncStatus])

  const doSaveRef = useRef<() => void>()
  doSaveRef.current = doSave

  // ------------------------------------------------------------------
  // scheduleSave — debounces saves. Called by the subscription.
  // ------------------------------------------------------------------
  const scheduleSave = useCallback(() => {
    isDirtyRef.current = true
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    retryCountRef.current = 0
    saveTimerRef.current = setTimeout(() => {
      doSaveRef.current()
    }, SAVE_DEBOUNCE_MS)
  }, [])

  // ------------------------------------------------------------------
  // applyRemoteSnapshot — merges remote Firestore data into local store
  // using intelligent field-level merge instead of wholesale replacement.
  // ------------------------------------------------------------------
  const applyRemoteSnapshot = useCallback(
    (remote: Record<string, unknown>) => {
      const current = useAppStore.getState()

      const remoteTopics = (remote.topicsProgress || {}) as Record<string, TopicStatus>

      applyingRemoteRef.current = true
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

      // Update baseline so the subscription doesn't re-trigger a save.
      prevStateRef.current = useAppStore.getState()
      // Allow one tick for React to flush before re-enabling save triggers.
      setTimeout(() => { applyingRemoteRef.current = false }, 0)
    },
    [],
  )

  // ------------------------------------------------------------------
  // Snapshot handler — called by onSnapshot for both initial and
  // subsequent real-time updates.
  // ------------------------------------------------------------------
  const handleSnapshot = useCallback(
    async (snap: DocumentSnapshot) => {
      if (!snap.exists() || !snap.data()?.[STORE_FIELD]) {
        // Remote is empty — push local state up so other devices get it.
        if (!isSavingRef.current) {
          const current = useAppStore.getState()
          const payload = buildPayload(current)
          try {
            const ref = doc(db!, 'users', user!.uid)
            await setDoc(ref, { [STORE_FIELD]: payload }, { merge: true })
            setSyncStatus({ state: 'saved' })
          } catch {
            // Will be retried by the subscription
          }
        }
        return
      }

      const remote = snap.data()[STORE_FIELD] as Record<string, unknown>
      applyRemoteSnapshot(remote)

      // Update the pending stash so it reflects the latest merged state
      // (guards against a crash between snapshot and next save).
      try {
        const freshPayload = buildPayload(useAppStore.getState())
        localStorage.setItem(PENDING_KEY, JSON.stringify(freshPayload))
      } catch { /* ignore quota errors */ }

      setSyncStatus({ state: 'saved' })
    },
    [user, applyRemoteSnapshot, setSyncStatus],
  )

  // ------------------------------------------------------------------
  // subscribeToFirestore — sets up the real-time onSnapshot listener.
  // ------------------------------------------------------------------
  const subscribeToFirestore = useCallback(() => {
    if (!db || !user) return
    if (loadInProgressRef.current) return

    loadInProgressRef.current = true
    isLoadingRef.current = true
    setSyncStatus({ state: 'saving', lastError: null })

    try {
      const ref = doc(db, 'users', user.uid)
      const unsub = onSnapshot(
        ref,
        (snap) => {
          handleSnapshot(snap)
          loadInProgressRef.current = false
          setTimeout(() => {
            isLoadingRef.current = false
            prevStateRef.current = useAppStore.getState()
          }, 500)
        },
        (error) => {
          const msg = error instanceof Error ? error.message : 'Snapshot error'
          setSyncStatus({ state: 'error', lastError: msg })
          loadInProgressRef.current = false
          setTimeout(() => { isLoadingRef.current = false }, 500)
        },
      )
      unsubscribeRef.current = unsub
    } catch {
      loadInProgressRef.current = false
      setTimeout(() => { isLoadingRef.current = false }, 500)
    }
  }, [user, handleSnapshot, setSyncStatus])

  // Expose for the manual refresh button.
  useEffect(() => {
    _manualRefresh = async () => {
      // Re-fetch: unsubscribe then re-subscribe, or just do a one-shot read
      // if already subscribed (onSnapshot will deliver the latest anyway).
      if (!unsubscribeRef.current) {
        subscribeToFirestore()
      }
      // If already subscribed, onSnapshot already delivers changes.
      // But force a status indicator for the manual refresh UX.
      setSyncStatus({ state: 'saving', lastError: null })
    }
    return () => { _manualRefresh = null }
  }, [subscribeToFirestore, setSyncStatus])

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
      // Clean up listener on sign-out.
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
      return
    }

    if (useAppStore.persist.hasHydrated()) {
      prevStateRef.current = useAppStore.getState()
      subscribeToFirestore()
    } else {
      const unsub = useAppStore.persist.onFinishHydration(() => {
        prevStateRef.current = useAppStore.getState()
        subscribeToFirestore()
      })
      return () => { unsub() }
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
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
      if (isLoadingRef.current) return
      if (applyingRemoteRef.current) return

      if (prevStateRef.current && !hasDataChanged(prevStateRef.current, state)) {
        return
      }
      prevStateRef.current = state

      scheduleSave()
    })

    return () => {
      unsub()
      if (saveTimerRef.current) { clearTimeout(saveTimerRef.current); saveTimerRef.current = null }
      if (retryTimerRef.current) { clearTimeout(retryTimerRef.current); retryTimerRef.current = null }
    }
  }, [user, scheduleSave])

  // ------------------------------------------------------------------
  // Stash unsaved changes to localStorage on page unload so they can
  // be flushed to Firestore on the next visit.
  // ------------------------------------------------------------------
  useEffect(() => {
    function stashIfDirty() {
      if (!isDirtyRef.current) return
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
