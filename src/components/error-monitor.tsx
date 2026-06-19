'use client'

import { useEffect } from 'react'

const LOG_PREFIX = '[GATE Tracker]'

export function ErrorMonitor() {
  useEffect(() => {
    function handleError(event: ErrorEvent) {
      const msg = event.error?.message || event.message || 'Unknown error'
      console.error(`${LOG_PREFIX} Uncaught error:`, msg, event.error?.stack)
    }

    function handleRejection(event: PromiseRejectionEvent) {
      const reason = event.reason?.message || event.reason || 'Unknown rejection'
      console.error(`${LOG_PREFIX} Unhandled rejection:`, reason)
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [])

  return null
}
