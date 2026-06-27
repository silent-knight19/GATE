<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:firebase-security-config -->
## Firebase Console — Required Manual Configuration

These steps cannot be done in code and must be performed in the Firebase Console
(https://console.firebase.google.com/project/gate-tracker-e1a99):

### 1. App Check Enforcement (Critical)
- Go to **App Check** → **Apps** → Register a web app
- Choose **reCAPTCHA v3** as the attestation provider
- Copy the generated Site Key
- Paste it into `src/lib/firebase.ts` replacing `YOUR_RECAPTCHA_V3_SITE_KEY`
- Under **App Check** → **Enforce**, toggle enforcement ON for:
  - Cloud Firestore
  - Cloud Storage
  - Firebase Authentication

### 2. Budget Alerts (High)
- Go to **Usage & Billing** → **Budget alerts**
- Create alerts at 50%, 80%, and 95% of your plan&apos;s quota

### 3. Authentication Settings (Medium)
- Go to **Authentication** → **Settings** → **User Actions**
- Enable **Email Enumeration Protection**
- Under **Sign-in providers**, ensure only **Google** is enabled
- Disable Email/Password, Phone, and Anonymous if enabled

### 4. Firestore Security Rules Deployment
After any changes to `firestore.rules`, deploy with:
```bash
firebase deploy --only firestore:rules
```

### 5. Storage Security Rules Deployment
After creating/modifying `storage.rules`, deploy with:
```bash
firebase deploy --only storage
```
<!-- END:firebase-security-config -->
