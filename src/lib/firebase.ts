import { initializeApp, getApps } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const isConfigured = firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your_api_key_here'

let app: ReturnType<typeof initializeApp> | null = null
let auth: ReturnType<typeof getAuth> | null = null
let db: ReturnType<typeof getFirestore> | null = null
let googleProvider: GoogleAuthProvider | null = null

if (isConfigured && typeof window !== 'undefined') {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  auth = getAuth(app)
  db = getFirestore(app)
  googleProvider = new GoogleAuthProvider()
  googleProvider.setCustomParameters({ prompt: 'select_account' })

  // Firebase App Check — prevents API abuse from unauthorized clients.
  // Get a reCAPTCHA v3 site key from https://console.firebase.google.com → App Check
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider('6Lc5dzgtAAAAAOzEILhf6JcwlnJaJqwOqaldFril'),
      isTokenAutoRefreshEnabled: true,
    })
  } catch {
    // App Check initialization failure should not block the app
  }
}

export { app, auth, db, googleProvider, isConfigured }
