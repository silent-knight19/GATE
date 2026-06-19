# GATE CSE 2027 Preparation Tracker

An all-in-one free tracker for GATE Computer Science 2027 aspirants. Track syllabus progress, log study hours, analyze mock tests, predict rank, and monitor PSU recruitment — all synced to the cloud.

## Features

- **Syllabus Tracker** — Topic-by-topic breakdown with revision cycle tracking
- **Study Logger** — Daily study sessions with streaks and weekly charts
- **Mock Test Analyzer** — Score trends, error analysis, and subject weakness detection
- **Rank Predictor** — Marks to score/rank conversion, college cutoff predictor
- **PSU Recruitment Tracker** — Salary, eligibility, and cutoff info for PSUs hiring through GATE
- **Counselling Guide** — Step-by-step COAP and CCMT process
- **Subject Weightage** — 5-year marks distribution analysis
- **Cloud Sync** — Progress saved via Firebase (Google sign-in)

## Tech Stack

- [Next.js](https://nextjs.org) 16 (App Router, static export)
- React 19
- TypeScript
- Tailwind CSS v4
- Firebase (Auth + Firestore)
- Zustand (state management)
- Recharts (charts)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
```

Static export outputs to `out/`.

## Deployment

Deployed via Firebase Hosting. The static export in `out/` is deployed to `gate-tracker-e1a99.web.app`.
