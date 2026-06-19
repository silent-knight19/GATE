import type { Metadata } from "next"
import PageClient from "./page-client"

export const metadata: Metadata = {
  title: "COAP & CCMT Counselling Guide",
  description:
    "Step-by-step admission timelines and counselling guide for GATE CSE 2027. COAP process, CCMT registration, college strategy, and document checklist.",
  keywords: [
    "COAP counselling",
    "CCMT counselling",
    "GATE admission process",
    "college selection strategy",
    "GATE 2027 counselling document checklist",
  ],
  alternates: {
    canonical: "https://gate-tracker-e1a99.web.app/counselling",
  },
  openGraph: {
    title: "COAP & CCMT Counselling Guide | GATE CSE 2027 Tracker",
    description:
      "Step-by-step admission timelines and counselling guide for GATE CSE 2027. COAP process, CCMT registration, college strategy, and document checklist.",
  },
  twitter: {
    title: "COAP & CCMT Counselling Guide | GATE CSE 2027 Tracker",
    description:
      "Step-by-step admission timelines and counselling guide for GATE CSE 2027. COAP process, CCMT registration, college strategy, and document checklist.",
  },
}

export default function Page() {
  return <PageClient />
}
