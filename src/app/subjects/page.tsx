import type { Metadata } from "next"
import PageClient from "./page-client"

export const metadata: Metadata = {
  title: "Subjects & Topic Progress",
  description:
    "Explore subject-wise syllabus progress, average mark weights, and topic checklists for GATE 2027 Computer Science & Information Technology.",
  keywords: [
    "GATE CSE subjects",
    "topic progress tracker",
    "syllabus progress",
    "subject-wise marks",
  ],
  alternates: {
    canonical: "https://gate-tracker-e1a99.web.app/subjects",
  },
  openGraph: {
    title: "Subjects & Topic Progress | GATE CSE 2027 Tracker",
    description:
      "Explore subject-wise syllabus progress, average mark weights, and topic checklists for GATE 2027 Computer Science & Information Technology.",
  },
  twitter: {
    title: "Subjects & Topic Progress | GATE CSE 2027 Tracker",
    description:
      "Explore subject-wise syllabus progress, average mark weights, and topic checklists for GATE 2027 Computer Science & Information Technology.",
  },
}

export default function Page() {
  return <PageClient />
}
