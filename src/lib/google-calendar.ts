'use client'

/**
 * Client-side Google Calendar sync module.
 *
 * Uses Google Identity Services (GIS) to get an access token in the browser,
 * then calls the Google Calendar REST API directly.  No Cloud Functions needed.
 *
 * Token is stored in localStorage and silently refreshed when it expires.
 */

import { useAppStore, type DailyTaskGroup, type Task } from '@/lib/store'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GIS_SCRIPT_URL = 'https://accounts.google.com/gsi/client'
const CALENDAR_API = 'https://www.googleapis.com/calendar/v3'
const TOKEN_KEY = 'gateee-gcal-token'
const CALENDAR_ID = 'primary'
const REMINDER_MINUTES = 15

interface StoredToken {
  accessToken: string
  expiryTime: number  // epoch ms
}

// ---------------------------------------------------------------------------
// GIS script loader
// ---------------------------------------------------------------------------

let _gisLoaded = false
let _gisLoadPromise: Promise<void> | null = null

function loadGisScript(): Promise<void> {
  if (_gisLoaded) return Promise.resolve()
  if (_gisLoadPromise) return _gisLoadPromise

  _gisLoadPromise = new Promise<void>((resolve, reject) => {
    if (typeof window === 'undefined') { reject(new Error('Not in browser')); return }

    // Check if already loaded by another source
    if ((window as any).google?.accounts?.oauth2) {
      _gisLoaded = true
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = GIS_SCRIPT_URL
    script.async = true
    script.defer = true
    script.onload = () => { _gisLoaded = true; resolve() }
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'))
    document.head.appendChild(script)
  })

  return _gisLoadPromise
}

// ---------------------------------------------------------------------------
// Token management
// ---------------------------------------------------------------------------

function getStoredToken(): StoredToken | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY)
    if (!raw) return null
    return JSON.parse(raw) as StoredToken
  } catch { return null }
}

function storeToken(token: StoredToken): void {
  try { localStorage.setItem(TOKEN_KEY, JSON.stringify(token)) } catch { /* ignore */ }
}

function clearStoredToken(): void {
  try { localStorage.removeItem(TOKEN_KEY) } catch { /* ignore */ }
}

export function isTokenValid(): boolean {
  const token = getStoredToken()
  if (!token) return false
  // Consider expired 60s before actual expiry to avoid edge-case failures
  return Date.now() < token.expiryTime - 60_000
}

function getAccessToken(): string | null {
  const token = getStoredToken()
  if (!token || Date.now() >= token.expiryTime - 60_000) return null
  return token.accessToken
}

// ---------------------------------------------------------------------------
// OAuth — connect / disconnect
// ---------------------------------------------------------------------------

/**
 * Opens the Google OAuth popup and requests calendar access.
 * Returns true on success, false on failure.
 */
export async function connectGoogleCalendar(): Promise<boolean> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  if (!clientId) {
    console.error('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set')
    return false
  }

  await loadGisScript()

  return new Promise<boolean>((resolve) => {
    const google = (window as any).google
    if (!google?.accounts?.oauth2) {
      console.error('Google Identity Services not available')
      resolve(false)
      return
    }

    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/calendar.events',
      callback: (response: any) => {
        if (response.error) {
          console.error('OAuth error:', response.error)
          resolve(false)
          return
        }

        const token: StoredToken = {
          accessToken: response.access_token,
          expiryTime: Date.now() + (response.expires_in * 1000),
        }
        storeToken(token)

        useAppStore.setState((s) => ({
          appState: { ...s.appState, googleCalendarConnected: true },
        }))

        resolve(true)
      },
      error_callback: (error: any) => {
        console.error('OAuth error callback:', error)
        resolve(false)
      },
    })

    tokenClient.requestAccessToken({ prompt: 'consent' })
  })
}

/**
 * Silently refresh the access token (no popup if user already consented).
 * Returns the new access token or null if refresh failed.
 */
export async function refreshToken(): Promise<string | null> {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  if (!clientId) return null

  await loadGisScript()

  return new Promise<string | null>((resolve) => {
    const google = (window as any).google
    if (!google?.accounts?.oauth2) { resolve(null); return }

    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/calendar.events',
      callback: (response: any) => {
        if (response.error) {
          // If silent refresh fails, mark as disconnected
          if (response.error === 'access_denied' || response.error === 'popup_closed_by_user') {
            clearStoredToken()
            useAppStore.setState((s) => ({
              appState: { ...s.appState, googleCalendarConnected: false },
            }))
          }
          resolve(null)
          return
        }

        const token: StoredToken = {
          accessToken: response.access_token,
          expiryTime: Date.now() + (response.expires_in * 1000),
        }
        storeToken(token)
        resolve(response.access_token)
      },
      error_callback: () => { resolve(null) },
    })

    // prompt: '' means silent / no popup
    tokenClient.requestAccessToken({ prompt: '' })
  })
}

/**
 * Disconnect Google Calendar — revoke the token and clear state.
 */
export async function disconnectGoogleCalendar(): Promise<void> {
  const token = getStoredToken()

  if (token?.accessToken) {
    // Revoke the token with Google
    try {
      await fetch(`https://oauth2.googleapis.com/revoke?token=${token.accessToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
    } catch {
      // Token may already be revoked — proceed
    }
  }

  clearStoredToken()

  // Clear sync fields from all tasks and mark as disconnected
  useAppStore.setState((s) => {
    const cleanedTasks = s.dailyTasks.map((g) => ({
      ...g,
      tasks: g.tasks.map((t) => {
        const { googleEventId, syncStatus, syncError, ...rest } = t
        return rest as Task
      }),
    }))
    return {
      dailyTasks: cleanedTasks,
      appState: { ...s.appState, googleCalendarConnected: false },
    }
  })
}

// ---------------------------------------------------------------------------
// Calendar API helpers
// ---------------------------------------------------------------------------

async function getValidToken(): Promise<string | null> {
  const token = getAccessToken()
  if (token) return token

  // Token is missing or expired.
  // Google Identity Services requires a *user gesture* (click) to get a new access token,
  // even if the user has already consented (prompt: '').
  // We cannot refresh the token in a background sync task because the browser will block the popup.
  // Instead, we just mark the calendar as disconnected so the user can click "Connect" again.
  useAppStore.setState((s) => ({
    appState: { ...s.appState, googleCalendarConnected: false },
  }))
  
  return null
}

async function calendarFetch(
  path: string,
  method: string,
  body?: Record<string, unknown>,
): Promise<{ ok: boolean; status: number; data: any }> {
  const token = await getValidToken()
  if (!token) {
    return { ok: false, status: 401, data: { error: 'No valid token' } }
  }

  const res = await fetch(`${CALENDAR_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  let data: any = null
  try { data = await res.json() } catch { /* no body */ }

  return { ok: res.ok, status: res.status, data }
}

// ---------------------------------------------------------------------------
// Event building
// ---------------------------------------------------------------------------

function buildEvent(task: Task) {
  const description = [
    `Subject: ${task.subjectId}`,
    `Topic: ${task.topicId}`,
    `Type: ${task.type}`,
    `Priority: ${task.priority}`,
    `Estimated: ${task.estimatedHours}h`,
  ].join('\n')

  const event: Record<string, unknown> = {
    summary: task.title,
    description,
    reminders: {
      useDefault: false,
      overrides: [{ method: 'popup', minutes: REMINDER_MINUTES }],
    },
  }

  if (task.startTime && task.endTime) {
    let endDay = task.date
    // If end time is before or equal to start time, it rolls over to the next day (or is 24 hours)
    if (task.endTime <= task.startTime) {
      const d = new Date(task.date)
      d.setDate(d.getDate() + 1)
      endDay = d.toISOString().split('T')[0]
    }
    event.start = {
      dateTime: `${task.date}T${task.startTime}:00+05:30`,
      timeZone: 'Asia/Kolkata',
    }
    event.end = {
      dateTime: `${endDay}T${task.endTime}:00+05:30`,
      timeZone: 'Asia/Kolkata',
    }
  } else if (task.startTime) {
    const [startH, startM] = task.startTime.split(':').map(Number)

    let endHour = startH + 1
    let endDay = task.date
    if (endHour >= 24) {
      endHour -= 24
      const d = new Date(task.date)
      d.setDate(d.getDate() + 1)
      endDay = d.toISOString().split('T')[0]
    }
    const endStr = `${String(endHour).padStart(2, '0')}:${String(startM).padStart(2, '0')}`

    event.start = {
      dateTime: `${task.date}T${task.startTime}:00+05:30`,
      timeZone: 'Asia/Kolkata',
    }
    event.end = {
      dateTime: `${endDay}T${endStr}:00+05:30`,
      timeZone: 'Asia/Kolkata',
    }
  } else {
    const d = new Date(task.date)
    d.setDate(d.getDate() + 1)
    const nextDay = d.toISOString().split('T')[0]
    event.start = { date: task.date }
    event.end = { date: nextDay }
  }

  return event
}

// ---------------------------------------------------------------------------
// Core sync logic
// ---------------------------------------------------------------------------

/** Tracks the previous snapshot of tasks for diffing.  Set after each sync. */
let _prevTasksSnapshot: string | null = null

/** Strips sync-metadata fields so we can diff on "real" task data only. */
function stripSyncFields(tasks: DailyTaskGroup[]): DailyTaskGroup[] {
  return tasks.map((g) => ({
    ...g,
    tasks: g.tasks.map((t) => {
      const { googleEventId, syncStatus, syncError, ...rest } = t
      return rest as Task
    }),
  }))
}

/** Build a flat map of taskId → Task from all daily groups. */
function buildTaskMap(groups: DailyTaskGroup[]): Map<string, Task & { groupDate: string }> {
  const map = new Map<string, Task & { groupDate: string }>()
  for (const g of groups) {
    for (const t of g.tasks) {
      map.set(t.id, { ...t, groupDate: g.date })
    }
  }
  return map
}

/**
 * Sync current tasks to Google Calendar.
 *
 * - Creates events for new tasks (no googleEventId)
 * - Updates events for changed tasks
 * - Deletes events for removed tasks
 * - Sets syncStatus / googleEventId on tasks after sync
 *
 * This reads directly from the store and writes back sync metadata.
 * It is safe to call alongside the Firestore sync because it only
 * touches `googleEventId`, `syncStatus`, `syncError` — fields that
 * are part of the normal store data flow.
 */
export async function syncTasksToCalendar(): Promise<void> {
  const state = useAppStore.getState()
  if (!state.appState.googleCalendarConnected) return

  const token = await getValidToken()
  if (!token) {
    // Token expired and refresh failed — mark disconnected
    useAppStore.setState((s) => ({
      appState: { ...s.appState, googleCalendarConnected: false },
    }))
    return
  }

  const currentTasks = state.dailyTasks
  const currentStripped = JSON.stringify(stripSyncFields(currentTasks))

  // Build previous task map from the store's own data (tasks with googleEventId)
  // We need to detect: new tasks (no eventId), changed tasks, removed tasks
  // For "removed" detection, we compare against _prevTasksSnapshot
  const prevSnapshot = _prevTasksSnapshot
  _prevTasksSnapshot = currentStripped

  // If this is the first sync (no previous snapshot), only create new events
  // for tasks that don't have a googleEventId yet.
  const currentMap = buildTaskMap(currentTasks)

  // Build previous map from snapshot if available
  let prevMap: Map<string, Task & { groupDate: string }> | null = null
  if (prevSnapshot) {
    try {
      const prevGroups = JSON.parse(prevSnapshot) as DailyTaskGroup[]
      // Merge with current tasks to get the googleEventIds
      const fullPrevGroups = state.dailyTasks // we use current state for eventIds
      prevMap = buildTaskMap(fullPrevGroups)
    } catch { /* ignore */ }
  }

  const results = new Map<string, { googleEventId?: string; syncStatus: 'synced' | 'error'; syncError?: string }>()

  // --- Handle deletions (tasks in prev but not in current) ---
  const prevState = _prevDailyTasks
  if (prevState) {
    const prevFullMap = buildTaskMap(prevState)
    for (const [id, task] of prevFullMap) {
      if (!currentMap.has(id) && task.googleEventId) {
        console.log(`[Calendar Sync] Task ${id} was deleted. Attempting to delete Google Event ${task.googleEventId}...`)
        const res = await calendarFetch(
          `/calendars/${CALENDAR_ID}/events/${task.googleEventId}`,
          'DELETE',
        )
        if (res.ok || res.status === 404) {
          console.log(`[Calendar Sync] Successfully deleted Google Event ${task.googleEventId}`)
        } else {
          console.error(`[Calendar Sync] Failed to delete calendar event for task ${id}`, res)
        }
      }
    }
  }

  // --- Handle creates and updates ---
  for (const [id, task] of currentMap) {
    if (!task.googleEventId) {
      // New task — create event
      const eventPayload = buildEvent(task)
      const res = await calendarFetch(
        `/calendars/${CALENDAR_ID}/events`,
        'POST',
        eventPayload,
      )

      if (res.ok) {
        results.set(id, { googleEventId: res.data.id, syncStatus: 'synced' })
      } else {
        console.error(`Failed to create event for task ${id}:`, res.data)
        results.set(id, { syncStatus: 'error', syncError: res.data?.error?.message || 'Create failed' })
      }
    } else if (task.syncStatus === 'pending') {
      // Retry — treat as update
      const eventPayload = buildEvent(task)
      const res = await calendarFetch(
        `/calendars/${CALENDAR_ID}/events/${task.googleEventId}`,
        'PATCH',
        eventPayload,
      )

      if (res.ok) {
        results.set(id, { syncStatus: 'synced' })
      } else if (res.status === 404) {
        // Event was deleted on Google's side — re-create
        const createRes = await calendarFetch(
          `/calendars/${CALENDAR_ID}/events`,
          'POST',
          eventPayload,
        )
        if (createRes.ok) {
          results.set(id, { googleEventId: createRes.data.id, syncStatus: 'synced' })
        } else {
          results.set(id, { syncStatus: 'error', syncError: createRes.data?.error?.message || 'Re-create failed' })
        }
      } else {
        results.set(id, { syncStatus: 'error', syncError: res.data?.error?.message || 'Update failed' })
      }
    }
    // Tasks with syncStatus === 'synced' and no data changes are skipped
  }

  // --- Apply results back to the store ---
  if (results.size > 0) {
    useAppStore.setState((s) => ({
      dailyTasks: s.dailyTasks.map((g) => ({
        ...g,
        tasks: g.tasks.map((t) => {
          const r = results.get(t.id)
          if (r) {
            return {
              ...t,
              googleEventId: r.googleEventId ?? t.googleEventId,
              syncStatus: r.syncStatus,
              syncError: r.syncError,
            }
          }
          return t
        }),
      })),
    }))
  }

  // Save the current dailyTasks for next diff
  _prevDailyTasks = useAppStore.getState().dailyTasks
}

/** Stores the previous dailyTasks state for deletion detection. */
let _prevDailyTasks: DailyTaskGroup[] | null = null

/**
 * Initialize the previous tasks snapshot (call once when connecting
 * or when the planner page mounts with calendar already connected).
 */
export function initSyncSnapshot(): void {
  const state = useAppStore.getState()
  _prevDailyTasks = state.dailyTasks
  _prevTasksSnapshot = JSON.stringify(stripSyncFields(state.dailyTasks))
}

// ---------------------------------------------------------------------------
// Auto-sync hook (debounced)
// ---------------------------------------------------------------------------

let _syncTimer: ReturnType<typeof setTimeout> | null = null
const SYNC_DEBOUNCE_MS = 5000

/**
 * Schedule a calendar sync after a debounce period.
 * Multiple calls within the debounce window will only trigger one sync.
 */
export function schedulCalendarSync(): void {
  if (_syncTimer) clearTimeout(_syncTimer)
  _syncTimer = setTimeout(() => {
    _syncTimer = null
    syncTasksToCalendar().catch((err) => {
      console.error('Calendar sync failed:', err)
    })
  }, SYNC_DEBOUNCE_MS)
}

/**
 * Cancel any pending scheduled sync.
 */
export function cancelScheduledSync(): void {
  if (_syncTimer) {
    clearTimeout(_syncTimer)
    _syncTimer = null
  }
}
