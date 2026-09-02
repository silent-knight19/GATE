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
            Method: Score = 350 + 550×(M - Mq)/(Mt - Mq) where Mq (General 30 for 2026 per IIT Guwahati gate2026.iitg.ac.in/cut-off.html, 28.5 for 2027 projected) and Mt (79 for 2026 mean top 0.1% provisional — topper 92.57 &gt; Mt so &gt;1000 capped, hence 90→~990+, 85→967; 79 chosen for 72-78 tough / 78-82 easier regime, pending Statistical Report, 79 for 2027 projected). Rank via log-linear interpolation of verified 2026 anchors (92.57→1/1000, 85→7/967, 65→350/743, 59→750/676, 45→3500/518) per PW/careers360/zollege consensus for 211k appeared. Category affects qualification threshold, not AIR curve.
          </p>
        </div>
      </section>
    </>
  )
}
