'use client'

import { useEffect, useRef, useCallback } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db, isConfigured } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'
import { useAppStore, stripFunctions } from '@/lib/store'
import type { TopicStatus } from '@/lib/data/syllabus'

const SAVE_DEBOUNCE_MS = 3000
const STORE_FIELD = 'store'
const PENDING_KEY = 'gateee-sync-pending'
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 5000

/**
 * Builds the Firestore-safe payload from current store state.
 * Strips functions, syncStatus, and timerState.
 */
function buildPayload(state: ReturnType<typeof useAppStore.getState>): Record<string, unknown> {
  const payload = stripFunctions(state)
  delete payload.syncStatus
  delete payload.timerState
  delete payload.setTimerState
  return payload
}

export function FirestoreSync() {
  const { user } = useAuth()
  const initialized = useRef(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingSaveRef = useRef(false)
  const retryCountRef = useRef(0)
  const setSyncStatus = useAppStore((s) => s.setSyncStatus)

  /**
   * Saves the current store state to Firestore.
   * On failure, automatically retries up to MAX_RETRIES times.
   */
  const doSave = useCallback(async (state: ReturnType<typeof useAppStore.getState>) => {
    if (!db || !user) return
    try {
      pendingSaveRef.current = false
      setSyncStatus({ state: 'saving', lastError: null })
      const payload = buildPayload(state)
      const ref = doc(db, 'users', user.uid)
      await setDoc(ref, { [STORE_FIELD]: payload }, { merge: true })
      retryCountRef.current = 0
      setSyncStatus({ state: 'saved' })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown save error'

      // Retry on transient failures (network errors, timeouts)
      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current++
        pendingSaveRef.current = true
        setSyncStatus({ state: 'saving', lastError: `Retrying (${retryCountRef.current}/${MAX_RETRIES})...` })
        retryTimerRef.current = setTimeout(() => {
          doSave(useAppStore.getState())
        }, RETRY_DELAY_MS)
      } else {
        retryCountRef.current = 0
        pendingSaveRef.current = false
        setSyncStatus({ state: 'error', lastError: msg })
      }
    }
  }, [user, setSyncStatus])

  /**
   * Flushes any pending save from localStorage that was stashed
   * during a beforeunload event in a previous session.
   */
  const flushPendingSave = useCallback(async () => {
    if (!db || !user) return
    try {
      const raw = localStorage.getItem(PENDING_KEY)
      if (!raw) return
      const payload = JSON.parse(raw)
      const ref = doc(db, 'users', user.uid)
      await setDoc(ref, { [STORE_FIELD]: payload }, { merge: true })
      localStorage.removeItem(PENDING_KEY)
    } catch {
      // If flushing the stashed data fails, leave it for next attempt.
      // It will be overwritten once a normal save succeeds.
    }
  }, [user])

  // Load data from Firestore when user signs in
  useEffect(() => {
    if (!isConfigured || !db || !user) {
      initialized.current = false
      return
    }

    async function loadFromFirestore() {
      try {
        if (!db || !user) return

        // First, flush any pending save from a previous session
        await flushPendingSave()

        const ref = doc(db, 'users', user.uid)
        const snap = await getDoc(ref)
        const current = useAppStore.getState()

        if (snap.exists() && snap.data()[STORE_FIELD]) {
          const remote = snap.data()[STORE_FIELD] as Record<string, unknown>

          const mergedTopics: Record<string, TopicStatus> = {
            ...current.topicsProgress,
            ...(remote.topicsProgress as Record<string, TopicStatus> || {}),
          }

          const mergeArray = <T,>(
            remoteArr: T[],
            localArr: T[],
            key: (item: T) => string,
          ): T[] => {
            const remoteKeys = new Set(remoteArr.map(key))
            const localUnique = localArr.filter(i => !remoteKeys.has(key(i)))
            return [...remoteArr, ...localUnique]
          }

          useAppStore.setState({
            user: { ...current.user, ...(remote.user as typeof current.user || {}) },
            plannerSettings: { ...current.plannerSettings, ...(remote.plannerSettings as typeof current.plannerSettings || {}) },
            appState: { ...current.appState, ...(remote.appState as typeof current.appState || {}) },
            topicsProgress: mergedTopics,
            logs: mergeArray(remote.logs as typeof current.logs || [], current.logs, l => `${l.date}-${l.topicId}-${l.activityType}`),
            tests: mergeArray(remote.tests as typeof current.tests || [], current.tests, t => t.id),
            revisionHistory: mergeArray(remote.revisionHistory as typeof current.revisionHistory || [], current.revisionHistory, r => r.topicId),
            dailyTasks: mergeArray(remote.dailyTasks as typeof current.dailyTasks || [], current.dailyTasks, g => g.date),
            weeklyTargets: mergeArray(remote.weeklyTargets as typeof current.weeklyTargets || [], current.weeklyTargets, w => w.weekStart),
          } as Partial<typeof current>)

          setSyncStatus({ state: 'saved' })
        } else {
          // First-time user: push local state up to Firestore
          const payload = buildPayload(current)
          await setDoc(ref, { [STORE_FIELD]: payload }, { merge: true })
          setSyncStatus({ state: 'saved' })
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown load error'
        setSyncStatus({ state: 'error', lastError: msg })
      }
    }

    if (!initialized.current) {
      initialized.current = true
      if (useAppStore.persist.hasHydrated()) {
        loadFromFirestore()
      } else {
        const unsub = useAppStore.persist.onFinishHydration(() => {
          loadFromFirestore()
        })
        return () => { unsub() }
      }
    }
  }, [user, setSyncStatus, flushPendingSave])

  // Subscribe to store changes and debounce saves
  useEffect(() => {
    if (!isConfigured || !db || !user) return

    const unsub = useAppStore.subscribe((state) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      pendingSaveRef.current = true
      retryCountRef.current = 0
      saveTimerRef.current = setTimeout(() => doSave(state), SAVE_DEBOUNCE_MS)
    })

    return () => {
      unsub()
      if (saveTimerRef.current) { clearTimeout(saveTimerRef.current); saveTimerRef.current = null }
      if (retryTimerRef.current) { clearTimeout(retryTimerRef.current); retryTimerRef.current = null }
    }
  }, [user, doSave])

  // On tab close, stash unsaved data to localStorage AND try sendBeacon to Firestore
  useEffect(() => {
    function onBeforeUnload() {
      if (!pendingSaveRef.current) return

      const state = useAppStore.getState()
      const payload = buildPayload(state)

      // Always stash to localStorage as a safety net
      try {
        localStorage.setItem(PENDING_KEY, JSON.stringify(payload))
      } catch {
        // localStorage is full or unavailable — nothing we can do
      }

      // Also try to flush to Firestore via sendBeacon for immediate persistence
      if (user && db) {
        try {
          const beaconPayload = JSON.stringify({
            uid: user.uid,
            data: payload,
          })
          navigator.sendBeacon('/api/sync-beacon', beaconPayload)
        } catch {
          // sendBeacon failed — localStorage backup is our fallback
        }
      }
    }

    // Also flush on page visibility change (mobile browsers kill tabs without beforeunload)
    function onVisibilityChange() {
      if (document.visibilityState === 'hidden' && pendingSaveRef.current) {
        onBeforeUnload()
      }
    }

    window.addEventListener('beforeunload', onBeforeUnload)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [user])

  return null
}
