import type { Metadata } from "next"
import PageClient from "./page-client"

export const metadata: Metadata = {
  title: "Rank, College & PSU Predictor — GATE CSE 2027",
  description:
    "Calculate your GATE score with the official 350+550×(M-Mq)/(Mt-Mq) formula, predict AIR with verified 2026 vs 2027 predicted predicted bands, find IIT/NIT/IIIT cutoffs by category (COAP/CCMT) and PSU eligibility — dual-tab reliable.",
  keywords: [
    "GATE rank predictor",
    "GATE score calculator official formula",
    "college predictor",
    "PSU predictor GATE CSE",
    "IIT NIT IIIT cutoff",
    "COAP CCMT cutoff",
    "GATE 2026 vs 2027",
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
            2022&ndash;2026.
          </p>
          <p>
            The College Predictor shows IITs via COAP and NITs/IIITs via CCMT with category-wise closing scores (General/OBC/EWS/SC/ST) and 2026 verified vs 2027 predicted trend, with Safe/Borderline/Reach bands. PSU Tracker lists ONGC, IOCL, NTPC, etc. score thresholds by category. All outputs show score bands and rank intervals to reflect normalization uncertainty — use as planning range, verify on official portals (gate2027.iitm.ac.in, ccmt.admissions.nic.in, coap).
          </p>
          <p className="mt-2 text-[11px]">
            Method: Score = 350 + 550×(M - Mq)/(Mt - Mq) where Mq (General 30 for 2026, 28.5 for 2027) and Mt (85.2 for 2026, 84.5 for 2027) per IIT Roorkee statistical report. Rank via log-linear interpolation of verified anchors (85+→top10, 75→120, 60→2100). Category affects qualification threshold, not AIR curve. Sources linked in each tab.
          </p>
        </div>
      </section>
    </>
  )
}
