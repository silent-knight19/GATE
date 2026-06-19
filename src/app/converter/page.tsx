import type { Metadata } from "next"
import PageClient from "./page-client"

export const metadata: Metadata = {
  title: "Marks to Score & Rank Calculator",
  description:
    "Convert your expected GATE 2027 marks to GATE score and predict your All India Rank (AIR) across all categories.",
  keywords: [
    "marks converter",
    "GATE score calculator",
    "rank predictor",
    "AIR prediction",
    "GATE 2027 marks",
  ],
  alternates: {
    canonical: "https://gate-tracker-e1a99.web.app/converter",
  },
  openGraph: {
    title: "Marks to Score & Rank Calculator | GATE CSE 2027 Tracker",
    description:
      "Convert your expected GATE 2027 marks to GATE score and predict your All India Rank (AIR) across all categories.",
  },
  twitter: {
    title: "Marks to Score & Rank Calculator | GATE CSE 2027 Tracker",
    description:
      "Convert your expected GATE 2027 marks to GATE score and predict your All India Rank (AIR) across all categories.",
  },
}

export default function Page() {
  return (
    <>
      <PageClient />
      <section className="mx-auto max-w-5xl px-4 pb-8 md:px-6">
        <div className="rounded-xl border border-border bg-card p-5 text-xs leading-relaxed text-muted-foreground">
          <h2 className="mb-2 text-sm font-semibold text-foreground">How GATE Marks to Score Conversion Works</h2>
          <p className="mb-2">
            GATE normalizes raw marks (out of 100) to a score on a scale of 0&ndash;1000 to ensure fairness
            across multiple sessions. The normalization uses the performance of all candidates, the qualifying
            cutoff marks, and the mean/top-scorer marks to calculate your final GATE score.
          </p>
          <p>
            This calculator uses the official GATE normalization formula with historical data to estimate your
            score and corresponding All India Rank across General, OBC, SC/ST, and EWS categories. Use it
            during your mock test practice to set realistic target marks.
          </p>
        </div>
      </section>
    </>
  )
}
