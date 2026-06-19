import type { Metadata } from "next"
import PageClient from "./page-client"

export const metadata: Metadata = {
  title: "GATE CSE 2027 Tracker — Free Study Planner & Rank Predictor",
  description:
    "Track your GATE Computer Science 2027 preparation with a free all-in-one tracker. Interactive syllabus planner, daily study logger, mock test analytics, rank predictor, subject weightage, PSU tracker & more. No sign-up needed to explore.",
  keywords: [
    "GATE CSE 2027",
    "GATE preparation tracker",
    "GATE study planner",
    "GATE CSE syllabus tracker",
    "GATE rank predictor",
    "GATE CSE study log",
    "GATE Computer Science preparation",
    "GATE 2027 tracker",
    "GATE marks converter",
    "GATE subject weightage",
  ],
  openGraph: {
    title: "GATE CSE 2027 Preparation Tracker — Free All-in-One Study Planner",
    description:
      "Track your GATE Computer Science 2027 preparation with a free all-in-one tracker. Syllabus planner, study logger, mock analytics, rank predictor & more.",
    url: "https://gate-tracker-e1a99.web.app",
    siteName: "GATE CSE 2027 Tracker",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GATE CSE 2027 Preparation Tracker — Free Study Planner",
    description:
      "Interactive syllabus tracker, study logs, mock test analyzer & rank predictor for GATE CSE 2027 aspirants.",
  },
  alternates: {
    canonical: "https://gate-tracker-e1a99.web.app/",
  },
}

export default function Home() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is GATE CSE 2027?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "GATE (Graduate Aptitude Test in Engineering) CSE 2027 is the Computer Science & Information Technology paper of the national-level engineering exam conducted by IIT Madras for the 2027 cycle. It is used for M.Tech admissions to IITs, NITs, and IIITs, as well as PSU recruitment.",
        },
      },
      {
        "@type": "Question",
        "name": "Is this GATE CSE tracker free to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, completely free. All features — syllabus tracking, study logging, mock test analytics, rank predictor, and more — are available at no cost. Your data syncs to the cloud via Google sign-in.",
        },
      },
      {
        "@type": "Question",
        "name": "How does the GATE rank predictor work?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Our rank predictor uses historical GATE score-to-rank data from previous years to estimate your All India Rank (AIR) based on your expected marks. It also shows likely college cutoffs for IITs, NITs, and IIITs.",
        },
      },
      {
        "@type": "Question",
        "name": "What subjects are covered in the syllabus tracker?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "All 10+ GATE CSE subjects are covered: Programming & Data Structures, Algorithms, Operating Systems, Computer Networks, Databases, Theory of Computation, Compiler Design, Digital Logic, Computer Organization, Engineering Mathematics, and General Aptitude.",
        },
      },
      {
        "@type": "Question",
        "name": "Can I track my study hours and streaks?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. The Study Logger lets you log daily study sessions by subject and topic, tracks your study streaks, and visualizes your weekly study hours with charts and heatmaps.",
        },
      },
      {
        "@type": "Question",
        "name": "What is the difference between COAP and CCMT counselling?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "COAP (Common Offer Acceptance Portal) is for IIT and IISc admissions — you apply to each IIT separately and manage offers via COAP. CCMT (Centralized Counselling for M.Tech) is for NITs, IIITs, and GFTIs — you fill a single preference list for all participating institutes.",
        },
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <PageClient />
    </>
  )
}
