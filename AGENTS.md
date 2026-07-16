<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:firebase-security-config -->
## Firebase Console — Required Manual Configuration

These steps cannot be done in code and must be performed in the Firebase Console
(https://console.firebase.google.com/project/gate-tracker-e1a99):

### 1. Budget Alerts (High)
- Go to **Usage & Billing** → **Budget alerts**
- Create alerts at 50%, 80%, and 95% of your plan&apos;s quota

### 2. Authentication Settings (Medium)
- Go to **Authentication** → **Settings** → **User Actions**
- Enable **Email Enumeration Protection**
- Under **Sign-in providers**, ensure only **Google** is enabled
- Disable Email/Password, Phone, and Anonymous if enabled

### 3. Firestore Security Rules Deployment
After any changes to `firestore.rules`, deploy with:
```bash
firebase deploy --only firestore:rules
```

### 4. Storage Security Rules Deployment
After creating/modifying `storage.rules`, deploy with:
```bash
firebase deploy --only storage
```

### 5. Google Calendar Sync (Client-Side) — Required Setup

#### 5a. Google Cloud Console — Enable Calendar API
- Go to https://console.cloud.google.com/apis/library/calendar-json.googleapis.com
- Ensure the project `gate-tracker-e1a99` is selected
- Click **Enable**

#### 5b. Google Cloud Console — OAuth Consent & Credentials
- Go to **APIs & Services** → **OAuth consent screen**
- Add scope: `https://www.googleapis.com/auth/calendar.events`
- Add your email as a test user
- Go to **Credentials** → **Create Credentials** → **OAuth client ID**
- Application type: **Web application**
- **Authorized JavaScript origins**: `http://localhost:3000` and `https://gate-tracker-e1a99.web.app`
- No redirect URIs needed (client-side flow uses popup)

#### 5c. Environment Variable
Add to `.env.local`:
```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id-here
```

#### 5d. Deployment commands
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy hosting
npm run build && firebase deploy --only hosting
```
<!-- END:firebase-security-config -->
