import type { Metadata } from "next"
import PageClient from "./page-client"

export const metadata: Metadata = {
  title: "Rank & College Predictor",
  description:
    "Calculate your GATE score, predict your All India Rank (AIR), and find matching IITs, NITs, and IIITs based on historical GATE cutoff trends.",
  keywords: [
    "GATE rank predictor",
    "college predictor",
    "IIT NIT IIIT cutoff",
    "GATE score calculator",
    "target rank tracker",
  ],
  alternates: {
    canonical: "https://gate-tracker-e1a99.web.app/predictor",
  },
  openGraph: {
    title: "Rank & College Predictor | GATE CSE 2027 Tracker",
    description:
      "Calculate your GATE score, predict your All India Rank (AIR), and find matching IITs, NITs, and IIITs based on historical GATE cutoff trends.",
  },
  twitter: {
    title: "Rank & College Predictor | GATE CSE 2027 Tracker",
    description:
      "Calculate your GATE score, predict your All India Rank (AIR), and find matching IITs, NITs, and IIITs based on historical GATE cutoff trends.",
  },
}

export default function Page() {
  return (
    <>
      <PageClient />
      <section className="mx-auto max-w-5xl px-4 pb-8 md:px-6">
        <div className="rounded-xl border border-border bg-card p-5 text-xs leading-relaxed text-muted-foreground">
          <h2 className="mb-2 text-sm font-semibold text-foreground">About the GATE Rank Predictor</h2>
          <p className="mb-2">
            This tool helps GATE CSE 2027 aspirants estimate their All India Rank (AIR) from expected marks.
            It converts raw marks (out of 100) to a normalized GATE score (out of 1000) using the official
            normalization formula, then maps it to an estimated rank range based on historical data from
            2021&ndash;2025.
          </p>
          <p>
            The College Predictor tab shows which IITs, NITs, and IIITs you may be eligible for based on
            historical GATE CSE cutoff trends. The Target Tracker lets you set a goal rank and see the marks
            you need to achieve it. All predictions are estimates and should be used for planning purposes only.
          </p>
        </div>
      </section>
    </>
  )
}
