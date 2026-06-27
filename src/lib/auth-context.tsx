'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut, type User } from 'firebase/auth'
import { auth, googleProvider, isConfigured } from '@/lib/firebase'

interface AuthContextValue {
  user: User | null
  loading: boolean
  error: string | null
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  error: null,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  clearError: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isConfigured || !auth) return
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    if (isConfigured && auth) return
    const id = setTimeout(() => setLoading(false), 0)
    return () => clearTimeout(id)
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (!auth || !googleProvider) return
    try {
      setError(null)
      await signInWithPopup(auth, googleProvider)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sign in failed'
      if (msg.includes('popup-blocked') || msg.includes('popup closed')) {
        setError('Popup blocked. Please allow popups for this site or try again.')
      } else {
        setError('Sign in failed. Please try again.')
      }
      throw err
    }
  }, [])

  const clearLocalAppData = useCallback(() => {
    try {
      localStorage.removeItem('gateee-store')
      localStorage.removeItem('gateee-sync-pending')
      localStorage.removeItem('gateee-theme')
    } catch {
      // localStorage access may fail in some environments
    }
  }, [])

  const signOut = useCallback(async () => {
    if (!auth) return
    try {
      clearLocalAppData()
      await firebaseSignOut(auth)
    } catch (err: unknown) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Sign out error:', err)
      }
    }
  }, [clearLocalAppData])

  const clearError = useCallback(() => setError(null), [])

  return (
    <AuthContext.Provider value={{ user, loading, error, signInWithGoogle, signOut, clearError }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
