import type { Metadata } from "next"
import PageClient from "./page-client"

export const metadata: Metadata = {
  title: "Mock Test Analytics & Error Analysis",
  description:
    "Log and analyze your GATE 2027 mock test scores. Track score trends, identify error patterns, and find weak subjects with detailed analytics.",
  keywords: [
    "mock test analytics",
    "error analysis",
    "score trends",
    "weak subjects",
    "GATE mock performance",
  ],
  alternates: {
    canonical: "https://gate-tracker-e1a99.web.app/mocks",
  },
  openGraph: {
    title: "Mock Test Analytics & Error Analysis | GATE CSE 2027 Tracker",
    description:
      "Log and analyze your GATE 2027 mock test scores. Track score trends, identify error patterns, and find weak subjects with detailed analytics.",
  },
  twitter: {
    title: "Mock Test Analytics & Error Analysis | GATE CSE 2027 Tracker",
    description:
      "Log and analyze your GATE 2027 mock test scores. Track score trends, identify error patterns, and find weak subjects with detailed analytics.",
  },
}

export default function Page() {
  return <PageClient />
}
