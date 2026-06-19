import type { Metadata } from "next"
import PageClient from "./page-client"

export const metadata: Metadata = {
  title: "Resources | GATE CSE",
  description:
    "Curated study resources for GATE CSE including YouTube playlists, NPTEL lectures, textbooks, PYQs, mock tests, and more.",
  keywords: [
    "GATE CSE resources",
    "GATE study material",
    "subject-wise resources",
    "GATE PYQs",
    "NPTEL lectures",
  ],
  alternates: {
    canonical: "https://gate-tracker-e1a99.web.app/resources",
  },
  openGraph: {
    title: "Resources | GATE CSE 2027 Tracker",
    description:
      "Curated study resources for GATE CSE including YouTube playlists, NPTEL lectures, textbooks, PYQs, mock tests, and more.",
  },
  twitter: {
    title: "Resources | GATE CSE 2027 Tracker",
    description:
      "Curated study resources for GATE CSE including YouTube playlists, NPTEL lectures, textbooks, PYQs, mock tests, and more.",
  },
}

export default function Page() {
  return <PageClient />
}
