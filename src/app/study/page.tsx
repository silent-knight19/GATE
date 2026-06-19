import type { Metadata } from "next"
import PageClient from "./page-client"

export const metadata: Metadata = {
  title: "Study Timer & Activity Logger",
  description:
    "Log daily study sessions, track subject-wise study hours, maintain study streaks, and build consistent preparation habits for GATE CSE 2027.",
  keywords: [
    "GATE study timer",
    "daily study log",
    "study streak tracker",
    "GATE preparation habits",
  ],
  alternates: {
    canonical: "https://gate-tracker-e1a99.web.app/study",
  },
  openGraph: {
    title: "Study Timer & Activity Logger | GATE CSE 2027 Tracker",
    description:
      "Log daily study sessions, track subject-wise study hours, maintain study streaks, and build consistent preparation habits for GATE CSE 2027.",
  },
  twitter: {
    title: "Study Timer & Activity Logger | GATE CSE 2027 Tracker",
    description:
      "Log daily study sessions, track subject-wise study hours, maintain study streaks, and build consistent preparation habits for GATE CSE 2027.",
  },
}

export default function Page() {
  return <PageClient />
}
