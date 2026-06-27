import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for GATE CSE 2027 Preparation Tracker — how we collect, use, and protect your data.",
  alternates: {
    canonical: "https://gate-tracker-e1a99.web.app/privacy",
  },
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 p-6 md:p-10">
      <div>
        <h1 className="text-2xl font-bold">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground">Last updated: June 27, 2026</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">1. Information We Collect</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          When you sign in with Google, we receive your name, email address, and profile photo
          from Google Firebase Authentication. This information is stored in Firestore database
          and is used solely to personalize your experience on the platform.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We also collect and store data you voluntarily provide while using the application:
        </p>
        <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
          <li>Syllabus progress and topic statuses</li>
          <li>Daily study logs (hours studied, subjects, topics)</li>
          <li>Mock test scores and error analysis</li>
          <li>Study planner tasks and settings</li>
          <li>Revision history and confidence ratings</li>
          <li>User profile information (category, college, target rank, etc.)</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">2. How We Use Your Data</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your data is used exclusively to provide the core functionality of the application:
        </p>
        <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
          <li>Display your syllabus progress and study analytics</li>
          <li>Generate study plans and revision schedules</li>
          <li>Calculate readiness scores and rank predictions</li>
          <li>Persist your data across sessions via Firebase Firestore</li>
        </ul>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We do not sell, rent, or share your personal data with third parties.
          We do not use your data for advertising, profiling, or any purpose
          beyond the stated functionality of the application.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">3. Data Storage and Security</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your data is stored in Firebase Firestore and Firebase Authentication,
          both part of Google Cloud Platform. Data is encrypted in transit (TLS)
          and at rest. We implement the following security measures:
        </p>
        <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
          <li>Firestore Security Rules restrict each user&apos;s access to only their own data</li>
          <li>Authentication is handled by Google Firebase Auth with OAuth 2.0</li>
          <li>No server-side code runs that could introduce additional vulnerabilities</li>
          <li>Local data cached in your browser (localStorage) is cleared on sign-out</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">4. Your Rights</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          You have the right to:
        </p>
        <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
          <li><strong>Access</strong> — View all data stored about you by signing in</li>
          <li><strong>Export</strong> — Download your data from Firestore via Firebase Console</li>
          <li><strong>Delete</strong> — Delete your account and all associated data. Contact us at the email below</li>
          <li><strong>Withdraw consent</strong> — Sign out and clear your browser data at any time</li>
        </ul>
        <p className="text-sm text-muted-foreground leading-relaxed">
          To request account deletion or data export, email:{' '}
          <a href="mailto:privacy@gate-tracker-e1a99.web.app" className="text-primary hover:underline">
            privacy@gate-tracker-e1a99.web.app
          </a>
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">5. Third-Party Services</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This application uses the following third-party services:
        </p>
        <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
          <li><strong>Google Firebase</strong> (Authentication, Firestore, Hosting) — Privacy policy:{' '}
            <a href="https://firebase.google.com/support/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
              firebase.google.com/support/privacy
            </a>
          </li>
          <li><strong>Google Sign-In</strong> — Privacy policy:{' '}
            <a href="https://policies.google.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
              policies.google.com/privacy
            </a>
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">6. Cookies and Local Storage</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This application does not use cookies for tracking. We use browser localStorage
          to persist your session preferences (theme) and provide offline resilience
          (sync backup). No tracking scripts, analytics cookies, or third-party trackers
          are used.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">7. Contact</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          For privacy concerns, data deletion requests, or security vulnerability reports:
        </p>
        <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
          <li>Email: <a href="mailto:privacy@gate-tracker-e1a99.web.app" className="text-primary hover:underline">privacy@gate-tracker-e1a99.web.app</a></li>
          <li>Security: <a href="/.well-known/security.txt" className="text-primary hover:underline">/.well-known/security.txt</a></li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">8. Changes to This Policy</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          We may update this privacy policy from time to time. Changes will be posted
          on this page with an updated &quot;Last updated&quot; date.
        </p>
      </section>
    </div>
  )
}
