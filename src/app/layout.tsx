import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";
import { FirestoreSync } from "@/lib/firestore-sync";
import { LayoutClient } from "@/components/layout/layout-client";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://gate-tracker-e1a99.web.app"),
  title: {
    default: "GATE CSE 2027 Preparation Tracker & Syllabus Planner",
    template: "%s | GATE 2027 Tracker"
  },
  description: "Track your GATE 2027 Computer Science & Information Technology preparation. Free syllabus tracker, daily study logger, mock test analytics, and GATE rank predictor.",
  keywords: [
    "GATE 2027",
    "GATE CSE 2027",
    "GATE preparation tracker",
    "GATE Computer Science syllabus",
    "GATE CSE syllabus tracker",
    "GATE mock test analyzer",
    "GATE rank predictor",
    "IIT Roorkee GATE 2027",
    "GATE study logs",
    "GATE CS preparation website",
    "GATE CSE 2027 study planner"
  ],
  authors: [{ name: "GATE CSE Aspirant" }],
  creator: "GATE Tracker Team",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://gate-tracker-e1a99.web.app",
    title: "GATE CSE 2027 Prep Tracker & Syllabus Planner",
    description: "Track your GATE 2027 CS & IT preparation with our interactive syllabus planner, study logs, and mock test analytics.",
    siteName: "GATE CSE 2027 Tracker",
  },
  twitter: {
    card: "summary_large_image",
    title: "GATE CSE 2027 Prep Tracker & Syllabus Planner",
    description: "An interactive tracker, planner, and analyzer for GATE CSE 2027 aspirants.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {/* SoftwareApplication schema — tells Google this is a free educational web app */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "GATE CSE 2027 Preparation Tracker",
              "url": "https://gate-tracker-e1a99.web.app",
              "operatingSystem": "All",
              "applicationCategory": "EducationalApplication",
              "description": "An interactive syllabus tracker, study logger, mock test analyzer, and rank predictor for GATE 2027 Computer Science exam preparation.",
              "offers": {
                "@type": "Offer",
                "price": "0.00",
                "priceCurrency": "INR"
              },
              "featureList": [
                "GATE syllabus topic-by-topic tracker",
                "Daily study logger with streak tracking",
                "Mock test score analyzer and error analysis",
                "GATE rank predictor and marks converter",
                "Subject weightage analysis (2021–2025)",
                "PSU recruitment tracker",
                "COAP and CCMT counselling guide"
              ]
            })
          }}
        />
        {/* Organization schema — E-E-A-T signal for Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "GATE CSE 2027 Tracker",
              "url": "https://gate-tracker-e1a99.web.app",
              "description": "Free all-in-one preparation tracker for GATE CSE 2027 aspirants."
            })
          }}
        />
        {/* WebSite schema — helps Google understand site structure */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "GATE CSE 2027 Tracker",
              "url": "https://gate-tracker-e1a99.web.app",
              "description": "Track your GATE 2027 Computer Science preparation with a free interactive tracker."
            })
          }}
        />
        <ThemeProvider>
          <TooltipProvider>
            <AuthProvider>
              <FirestoreSync />
              <LayoutClient>{children}</LayoutClient>
            </AuthProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
