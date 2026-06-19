import type { Metadata } from "next"
import PageClient from "./page-client"

export const metadata: Metadata = {
  title: "Progress Hub & Daily Study Tracker",
  description:
    "View overall and subject-wise completion stats, study hours, mock test performance, and weekly study heatmaps for GATE CSE 2027.",
  keywords: [
    "study progress",
    "completion stats",
    "weekly heatmap",
    "mock test performance",
    "GATE preparation hub",
  ],
  alternates: {
    canonical: "https://gate-tracker-e1a99.web.app/progress",
  },
  openGraph: {
    title: "Progress Hub & Daily Study Tracker | GATE CSE 2027 Tracker",
    description:
      "View overall and subject-wise completion stats, study hours, mock test performance, and weekly study heatmaps for GATE CSE 2027.",
  },
  twitter: {
    title: "Progress Hub & Daily Study Tracker | GATE CSE 2027 Tracker",
    description:
      "View overall and subject-wise completion stats, study hours, mock test performance, and weekly study heatmaps for GATE CSE 2027.",
  },
}

export default function Page() {
  return <PageClient />
}
