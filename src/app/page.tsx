import type { Metadata } from "next"
import { syllabus } from "@/lib/data/syllabus"
import PageClient from "./page-client"

const totalSubjects = syllabus.length
const totalTopics = syllabus.reduce((s, sub) => s + sub.topics.length, 0)
const totalHours = syllabus.reduce((s, sub) => s + sub.topics.reduce((t, topic) => t + topic.hours, 0), 0)

export const metadata: Metadata = {
  title: "GATE CSE 2027 Tracker — Free All-in-One Study Planner & Rank Predictor",
  description:
    `Prepare for GATE Computer Science 2027 with this free tracker. Across ${totalSubjects} subjects and ${totalTopics} topics (≈${totalHours}h of material), plan your syllabus, log daily study, analyze mocks, predict rank, and track PSU recruitment — all in one dashboard. No sign-up needed.`,
  keywords: [
    "GATE CSE 2027 preparation tracker",
    "GATE Computer Science study planner free",
    "GATE 2027 rank predictor",
    "GATE CSE syllabus planner",
    "GATE mock test analyzer",
    "GATE study streak tracker",
    "GATE marks to rank converter",
    "GATE subject weightage analysis",
    "GATE PSU recruitment tracker",
    "GATE COAP counselling guide",
    "GATE CCE CSE preparation",
    "IIT Madras GATE 2027 tracker",
    "GATE CSE topic-wise syllabus",
  ],
  openGraph: {
    title: "GATE CSE 2027 Tracker — Free Syllabus Planner, Logger & Rank Predictor",
    description:
      `All ${totalSubjects} subjects · ${totalTopics} topics · ~${totalHours}h of material. Track your GATE CSE 2027 prep with a free interactive dashboard — syllabus planner, daily study logs, mock analytics, and rank predictor.`,
    url: "https://gate-tracker-e1a99.web.app",
    siteName: "GATE CSE 2027 Tracker",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GATE CSE 2027 Preparation Tracker — Free All-in-One Planner",
    description:
      `Free GATE CSE 2027 tracker with syllabus planner, study logs, mock analysis, rank predictor & more. ${totalTopics} topics across ${totalSubjects} subjects.`,
  },
  alternates: {
    canonical: "https://gate-tracker-e1a99.web.app/",
  },
}

export default function Home() {
  const siteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "GATE CSE 2027 Tracker",
    url: "https://gate-tracker-e1a99.web.app",
    description:
      `Free all-in-one preparation tracker for GATE CSE 2027. Plan ${totalTopics} topics across ${totalSubjects} subjects, log daily study, analyze mocks, and predict rank.`,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://gate-tracker-e1a99.web.app/syllabus?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  }

  const appSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "GATE CSE 2027 Preparation Tracker",
    url: "https://gate-tracker-e1a99.web.app",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    description:
      `Free all-in-one dashboard for GATE CSE 2027 aspirants. Track ${totalTopics} topics across ${totalSubjects} subjects, log daily study hours, analyze mock tests, predict rank, and monitor PSU recruitment.`,
    featureList: [
      "Interactive syllabus progress tracker",
      "Daily study logger with streak tracking",
      "Mock test score & error analyzer",
      "GATE rank predictor with college cutoffs",
      "Subject-wise weightage & trend analysis",
      "Exam countdown and readiness scoring",
    ],
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://gate-tracker-e1a99.web.app" },
      { "@type": "ListItem", position: 2, name: "Syllabus", item: "https://gate-tracker-e1a99.web.app/syllabus" },
      { "@type": "ListItem", position: 3, name: "Dashboard", item: "https://gate-tracker-e1a99.web.app/dashboard" },
    ],
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is GATE CSE 2027?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "GATE (Graduate Aptitude Test in Engineering) CSE 2027 is the Computer Science & Information Technology paper of the national-level engineering exam conducted by IIT Madras for the 2027 cycle. It is used for M.Tech admissions to IITs, NITs, and IIITs, as well as PSU recruitment.",
        },
      },
      {
        "@type": "Question",
        name: "Is this GATE CSE tracker free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, completely free. All features — syllabus tracking, study logging, mock test analytics, rank predictor, and more — are available at no cost. Your data syncs to the cloud via Google sign-in.",
        },
      },
      {
        "@type": "Question",
        name: "How does the GATE rank predictor work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our rank predictor uses historical GATE score-to-rank data from previous years to estimate your All India Rank (AIR) based on your expected marks. It also shows likely college cutoffs for IITs, NITs, and IIITs.",
        },
      },
      {
        "@type": "Question",
        name: `What subjects are covered in the syllabus tracker?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `All ${totalSubjects} GATE CSE subjects are covered: Programming & Data Structures, Algorithms, Operating Systems, Computer Networks, Databases, Theory of Computation, Compiler Design, Digital Logic, Computer Organization, Engineering Mathematics, and General Aptitude.`,
        },
      },
      {
        "@type": "Question",
        name: "Can I track my study hours and streaks?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. The Study Logger lets you log daily study sessions by subject and topic, tracks your study streaks, and visualizes your weekly study hours with charts and heatmaps.",
        },
      },
      {
        "@type": "Question",
        name: "What is the difference between COAP and CCMT counselling?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "COAP (Common Offer Acceptance Portal) is for IIT and IISc admissions — you apply to each IIT separately and manage offers via COAP. CCMT (Centralized Counselling for M.Tech) is for NITs, IIITs, and GFTIs — you fill a single preference list for all participating institutes.",
        },
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <PageClient />
    </>
  )
}
