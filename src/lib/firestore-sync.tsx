'use client'

import { useEffect, useRef } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db, isConfigured } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'
import { useAppStore } from '@/lib/store'

const SYNC_DELAY = 2000
const STORE_FIELD = 'store'

export function FirestoreSync() {
  const { user } = useAuth()
  const initialized = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!isConfigured || !db || !user) {
      initialized.current = false
      return
    }

    const uid = user.uid
    const _db = db

    async function loadFromFirestore() {
      try {
        const ref = doc(_db, 'users', uid)
        const snap = await getDoc(ref)
        if (snap.exists() && snap.data()[STORE_FIELD]) {
          const data = snap.data()[STORE_FIELD]
          useAppStore.setState(data)
        }
      } catch (err) {
        console.error('Firestore load error:', err)
      }
    }

    if (!initialized.current) {
      initialized.current = true
      loadFromFirestore()
    }

    const unsub = useAppStore.subscribe((state) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(async () => {
        try {
          const ref = doc(_db, 'users', uid)
          await setDoc(ref, { [STORE_FIELD]: state }, { merge: true })
        } catch (err) {
          console.error('Firestore save error:', err)
        }
      }, SYNC_DELAY)
    })

    return () => {
      unsub()
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [user])

  return null
}
