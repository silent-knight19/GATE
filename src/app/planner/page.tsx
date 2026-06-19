import type { Metadata } from "next"
import PageClient from "./page-client"

export const metadata: Metadata = {
  title: "Weekly Study Planner & Task Scheduler",
  description:
    "Generate adaptive daily study plans, set weekly targets, track study velocity, and stay on schedule for GATE CSE 2027.",
  keywords: [
    "study planner",
    "weekly scheduler",
    "daily task planner",
    "study velocity",
    "GATE CSE timetable",
  ],
  alternates: {
    canonical: "https://gate-tracker-e1a99.web.app/planner",
  },
  openGraph: {
    title: "Weekly Study Planner & Task Scheduler | GATE CSE 2027 Tracker",
    description:
      "Generate adaptive daily study plans, set weekly targets, track study velocity, and stay on schedule for GATE CSE 2027.",
  },
  twitter: {
    title: "Weekly Study Planner & Task Scheduler | GATE CSE 2027 Tracker",
    description:
      "Generate adaptive daily study plans, set weekly targets, track study velocity, and stay on schedule for GATE CSE 2027.",
  },
}

export default function Page() {
  return <PageClient />
}
