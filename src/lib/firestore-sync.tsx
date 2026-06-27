'use client'

import { useEffect, useRef, useCallback } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db, isConfigured } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'
import { useAppStore, stripFunctions } from '@/lib/store'

const SAVE_DEBOUNCE_MS = 3000
const STORE_FIELD = 'store'
const PENDING_KEY = 'gateee-sync-pending'
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 5000
/** Minimum ms between visibility-triggered re-fetches to avoid hammering Firestore. */
const VISIBILITY_REFETCH_COOLDOWN_MS = 30_000

function buildPayload(state: ReturnType<typeof useAppStore.getState>): Record<string, unknown> {
  const payload = stripFunctions(state)
  delete payload.syncStatus
  delete payload.timerState
  delete payload.setTimerState
  return payload
}

/**
 * Exposed for the manual refresh button in the navbar.
 * Returns a promise that resolves when the load completes (or fails).
 */
let _manualRefresh: (() => Promise<void>) | null = null

export function triggerFirestoreRefresh(): Promise<void> {
  return _manualRefresh?.() ?? Promise.resolve()
}

export function FirestoreSync() {
  const { user } = useAuth()
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingSaveRef = useRef(false)
  const retryCountRef = useRef(0)
  /**
   * While true, all store subscription events are suppressed (they were caused
   * by our own loadFromFirestore setState and must not be saved back).
   * Reset 500 ms after load completes to let React flush all updates.
   */
  const isLoadingRef = useRef(false)
  const loadInProgressRef = useRef(false)
  const lastLoadTimeRef = useRef(0)
  const setSyncStatus = useAppStore((s) => s.setSyncStatus)

  const doSaveRef = useRef<((state: ReturnType<typeof useAppStore.getState>) => Promise<void>) | null>(null)

  const doSave = useCallback(async (state: ReturnType<typeof useAppStore.getState>) => {
    if (!db || !user) return
    try {
      pendingSaveRef.current = false
      setSyncStatus({ state: 'saving', lastError: null })
      const payload = buildPayload(state)
      const ref = doc(db, 'users', user.uid)
      await setDoc(ref, { [STORE_FIELD]: payload }, { merge: true })
      retryCountRef.current = 0
      localStorage.removeItem(PENDING_KEY)
      setSyncStatus({ state: 'saved' })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown save error'

      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current++
        pendingSaveRef.current = true
        setSyncStatus({ state: 'saving', lastError: `Retrying (${retryCountRef.current}/${MAX_RETRIES})...` })
        retryTimerRef.current = setTimeout(() => {
          doSaveRef.current?.(useAppStore.getState())
        }, RETRY_DELAY_MS)
      } else {
        retryCountRef.current = 0
        pendingSaveRef.current = false
        setSyncStatus({ state: 'error', lastError: msg })
      }
    }
  }, [user, setSyncStatus])

  useEffect(() => {
    doSaveRef.current = doSave
  }, [doSave])

  const loadFromFirestore = useCallback(async () => {
    if (!db || !user) return
    if (loadInProgressRef.current) return

    loadInProgressRef.current = true
    // Suppress all save events triggered by setState below
    isLoadingRef.current = true
    setSyncStatus({ state: 'saving', lastError: null })

    try {
      const current = useAppStore.getState()
      const ref = doc(db, 'users', user.uid)
      const snap = await getDoc(ref)

      if (snap.exists() && snap.data()[STORE_FIELD]) {
        const remote = snap.data()[STORE_FIELD] as Record<string, unknown>

        const remoteTopics = (remote.topicsProgress || {}) as Record<string, string>
        const mergedTopics = {
          ...current.topicsProgress,
          ...remoteTopics,
        }

        useAppStore.setState({
          user: (remote.user as typeof current.user) || current.user,
          topicsProgress: mergedTopics,
          logs: (remote.logs as typeof current.logs) || current.logs,
          tests: (remote.tests as typeof current.tests) || current.tests,
          revisionHistory: (remote.revisionHistory as typeof current.revisionHistory) || current.revisionHistory,
          dailyTasks: (remote.dailyTasks as typeof current.dailyTasks) || current.dailyTasks,
          weeklyTargets: (remote.weeklyTargets as typeof current.weeklyTargets) || current.weeklyTargets,
          plannerSettings: (remote.plannerSettings as typeof current.plannerSettings) || current.plannerSettings,
          appState: (remote.appState as typeof current.appState) || current.appState,
        } as Partial<typeof current>)

        setSyncStatus({ state: 'saved' })
      } else if (snap.exists()) {
        const payload = buildPayload(current)
        await setDoc(ref, { [STORE_FIELD]: payload }, { merge: true })
        setSyncStatus({ state: 'saved' })
      } else {
        // No Firestore document yet (first-time user on this account) —
        // upload local state so other devices can pick it up.
        const payload = buildPayload(current)
        await setDoc(ref, { [STORE_FIELD]: payload }, { merge: true })
        setSyncStatus({ state: 'saved' })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown load error'
      setSyncStatus({ state: 'error', lastError: msg })
    } finally {
      loadInProgressRef.current = false
      lastLoadTimeRef.current = Date.now()
      // Wait for React to flush all state updates before re-enabling saves,
      // so we don't immediately overwrite Firestore with stale local data.
      setTimeout(() => {
        isLoadingRef.current = false
      }, 500)
    }
  }, [user, setSyncStatus])

  useEffect(() => {
    _manualRefresh = loadFromFirestore
    return () => { _manualRefresh = null }
  }, [loadFromFirestore])

  // Load data from Firestore when user signs in or changes.
  useEffect(() => {
    if (!isConfigured || !db || !user) return

    if (useAppStore.persist.hasHydrated()) {
      loadFromFirestore()
    } else {
      const unsub = useAppStore.persist.onFinishHydration(() => {
        loadFromFirestore()
      })
      return () => { unsub() }
    }
  }, [user, loadFromFirestore])

  // Re-fetch from Firestore whenever the tab becomes visible again.
  // This is the key fix for cross-device sync: if you log data on device A,
  // switching back to device B's tab will pull the latest Firestore data.
  useEffect(() => {
    if (!isConfigured || !db || !user) return

    function handleVisibilityChange() {
      if (document.visibilityState !== 'visible') return
      const msSinceLastLoad = Date.now() - lastLoadTimeRef.current
      if (msSinceLastLoad < VISIBILITY_REFETCH_COOLDOWN_MS) return
      loadFromFirestore()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [user, loadFromFirestore])

  // Subscribe to store changes and debounce saves.
  // Skip events that are triggered by our own loadFromFirestore() call.
  useEffect(() => {
    if (!isConfigured || !db || !user) return

    const unsub = useAppStore.subscribe((state) => {
      if (isLoadingRef.current) {
        // This change was caused by our remote load — don't echo it back to Firestore.
        return
      }

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      pendingSaveRef.current = true
      retryCountRef.current = 0
      saveTimerRef.current = setTimeout(() => doSaveRef.current?.(state), SAVE_DEBOUNCE_MS)
    })

    return () => {
      unsub()
      if (saveTimerRef.current) { clearTimeout(saveTimerRef.current); saveTimerRef.current = null }
      if (retryTimerRef.current) { clearTimeout(retryTimerRef.current); retryTimerRef.current = null }
    }
  }, [user, doSave])

  useEffect(() => {
    function stashPending() {
      if (!pendingSaveRef.current) return

      const state = useAppStore.getState()
      const payload = buildPayload(state)

      try {
        localStorage.setItem(PENDING_KEY, JSON.stringify(payload))
      } catch {
      }
    }

    function onBeforeUnload() {
      stashPending()
    }

    function onVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        stashPending()
      }
    }

    window.addEventListener('beforeunload', onBeforeUnload)
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  return null
}
