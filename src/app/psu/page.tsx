import type { Metadata } from "next"
import PageClient from "./page-client"

export const metadata: Metadata = {
  title: "PSU Recruitment Tracker & Cutoffs",
  description:
    "Track PSU job opportunities recruiting through GATE 2027. View salary ranges, eligibility criteria, selection process, and expected cutoffs.",
  keywords: [
    "PSU recruitment",
    "GATE jobs",
    "PSU cutoffs",
    "government jobs through GATE",
    "PSU salary",
  ],
  alternates: {
    canonical: "https://gate-tracker-e1a99.web.app/psu",
  },
  openGraph: {
    title: "PSU Recruitment Tracker & Cutoffs | GATE CSE 2027 Tracker",
    description:
      "Track PSU job opportunities recruiting through GATE 2027. View salary ranges, eligibility criteria, selection process, and expected cutoffs.",
  },
  twitter: {
    title: "PSU Recruitment Tracker & Cutoffs | GATE CSE 2027 Tracker",
    description:
      "Track PSU job opportunities recruiting through GATE 2027. View salary ranges, eligibility criteria, selection process, and expected cutoffs.",
  },
}

export default function Page() {
  return <PageClient />
}
