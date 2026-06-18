'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProcessStep } from '@/components/counselling/process-step'
import { DocumentChecklist } from '@/components/counselling/document-checklist'
import { CalendarIcon, ClipboardListIcon, GraduationCapIcon, BookOpenIcon, FileTextIcon } from 'lucide-react'

const TABS = [
  { value: 'coap', label: 'COAP Process', icon: ClipboardListIcon },
  { value: 'ccmt', label: 'CCMT Process', icon: GraduationCapIcon },
  { value: 'strategy', label: 'College Strategy', icon: BookOpenIcon },
  { value: 'documents', label: 'Document Checklist', icon: FileTextIcon },
  { value: 'timeline', label: 'Post-GATE Timeline', icon: CalendarIcon },
] as const

function CoapProcess() {
  const steps = [
    { step: 1, title: 'GATE 2027 Results Declaration', description: 'Results announced in March 2027. Check your GATE score, rank, and category.' },
    { step: 2, title: 'COAP Registration', description: 'Register on the COAP (Common Offer Acceptance Portal) portal. Pay registration fee if applicable.' },
    { step: 3, title: 'Institute Applications', description: 'Apply individually to IITs, IISc, and other participating institutes through their respective portals.' },
    { step: 4, title: 'Shortlist Declaration', description: 'Institutes release shortlists based on GATE score, category, and academic profile for further rounds.' },
    { step: 5, title: 'Interview / Written Test', description: 'Some institutes conduct interviews or written tests as part of the selection process.' },
    { step: 6, title: 'Offer Release', description: 'Institutes release admission offers through COAP in multiple rounds.' },
    { step: 7, title: 'Offer Acceptance', description: 'Accept, upgrade, or reject offers through COAP. Pay seat acceptance fee to confirm.' },
    { step: 8, title: 'Reporting & Document Verification', description: 'Report to the allotted institute with original documents for verification and fee payment.' },
  ]

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>What is COAP?</CardTitle>
          <CardDescription>
            Common Offer Acceptance Portal (COAP) is the centralized platform for M.Tech/ME admissions to IITs and IISc. It allows candidates to manage admission offers from multiple institutes transparently.
          </CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>COAP Process Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {steps.map((s, i) => (
            <ProcessStep
              key={s.step}
              step={s.step}
              title={s.title}
              description={s.description}
              isLast={i === steps.length - 1}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function CcmtProcess() {
  const steps = [
    { step: 1, title: 'CCMT Registration', description: 'Register on the CCMT (Centralized Counselling for M.Tech) portal during the registration window (May–June 2027).' },
    { step: 2, title: 'Choice Filling', description: 'Fill in your preferences for NITs, IIITs, and GFTIs. You can select up to 500 choices.' },
    { step: 3, title: 'Document Upload', description: 'Upload scanned copies of all required documents including GATE scorecard, academic certificates, and category certificate.' },
    { step: 4, title: 'Fee Payment', description: 'Pay the registration fee (varies by category) to confirm participation.' },
    { step: 5, title: 'Seat Allocation (Round 1–6)', description: 'Seats are allocated based on GATE score, category, and preferences in multiple rounds.' },
    { step: 6, title: 'Accept / Float / Withdraw', description: 'After each round, you can accept the allotted seat, float for upgrade, or withdraw from counselling.' },
    { step: 7, title: 'Reporting to Institute', description: 'Report to the final allotted institute with original documents for verification within the stipulated date.' },
  ]

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>What is CCMT?</CardTitle>
          <CardDescription>
            Centralized Counselling for M.Tech (CCMT) is the centralized admission process for NITs, IIITs, and GFTIs participating through GATE. It streamlines the entire admission process in one portal.
          </CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>CCMT Process Steps</CardTitle>
        </CardHeader>
        <CardContent>
          {steps.map((s, i) => (
            <ProcessStep
              key={s.step}
              step={s.step}
              title={s.title}
              description={s.description}
              isLast={i === steps.length - 1}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function CollegeStrategy() {
  const tiers = [
    {
      name: 'Dream (AIR 1–300)',
      description: 'Top IITs + IISc + IIIT Hyderabad',
      tip: 'Focus on interview preparation. Apply early to all top institutes through COAP.',
      color: 'text-green-600',
    },
    {
      name: 'Target (AIR 300–1500)',
      description: 'New IITs + Top NITs + IIIT Bangalore/Delhi',
      tip: 'Fill diverse choices in CCMT. Consider specialization over institute brand.',
      color: 'text-blue-600',
    },
    {
      name: 'Safe (AIR 1500–5000)',
      description: 'NITs + IIITs + DTU/NSUT',
      tip: 'Maximize CCMT choices. Apply to PSUs as a backup.',
      color: 'text-yellow-600',
    },
    {
      name: 'Backup (AIR 5000+)',
      description: 'GFTIs + Private institutes + PSUs',
      tip: 'Apply to all GFTIs through CCMT. Explore PSU recruitment and direct PhD programs.',
      color: 'text-orange-600',
    },
  ]

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>College Selection Strategy</CardTitle>
          <CardDescription>
            Choose institutes based on your expected rank range. Use the College Predictor tool for personalized recommendations.
          </CardDescription>
        </CardHeader>
      </Card>
      {tiers.map(t => (
        <Card key={t.name}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>{t.name}</CardTitle>
            </div>
            <CardDescription>{t.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-2 text-sm">
              <Badge variant="outline" className="shrink-0 mt-0.5">Tip</Badge>
              <p className="text-muted-foreground">{t.tip}</p>
            </div>
          </CardContent>
        </Card>
      ))}
      <Card>
        <CardHeader>
          <CardTitle>Key Considerations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2"><span className="text-foreground font-medium">•</span> Research specialization offerings — not all institutes offer all specializations.</li>
            <li className="flex gap-2"><span className="text-foreground font-medium">•</span> Check placement records and average packages for your specialization.</li>
            <li className="flex gap-2"><span className="text-foreground font-medium">•</span> Consider location and campus facilities for a 2-year program.</li>
            <li className="flex gap-2"><span className="text-foreground font-medium">•</span> Use the COAP float option to upgrade without losing current offer.</li>
            <li className="flex gap-2"><span className="text-foreground font-medium">•</span> Apply to PSUs simultaneously — many recruit through GATE score.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

function Timeline() {
  const events = [
    { date: 'Mar 2027', title: 'GATE 2027 Results', description: 'GATE 2027 scorecard released. Know your rank and score.' },
    { date: 'Mar–Apr 2027', title: 'COAP Registration Opens', description: 'Register on COAP portal. Start applying to IITs and IISc.' },
    { date: 'Apr 2027', title: 'IIT Interview Calls', description: 'IITs start sending interview shortlists. Prepare for technical interviews.' },
    { date: 'May 2027', title: 'CCMT Registration', description: 'CCMT portal opens for NIT, IIIT, GFTI admissions. Fill choices carefully.' },
    { date: 'May–Jun 2027', title: 'COAP Offer Rounds', description: 'COAP offer rounds begin. Accept, float, or reject offers.' },
    { date: 'Jun–Jul 2027', title: 'CCMT Allotment Rounds', description: 'Multiple seat allocation rounds through CCMT.' },
    { date: 'Jul 2027', title: 'PSU Recruitment Drive', description: 'Major PSUs begin recruitment drives through GATE score.' },
    { date: 'Jul–Aug 2027', title: 'Institute Reporting', description: 'Report to allotted institute for document verification and admission.' },
    { date: 'Aug 2027', title: 'Academic Session Begins', description: 'M.Tech/ME programs start across institutes.' },
  ]

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Post-GATE Timeline</CardTitle>
          <CardDescription>Key milestones after GATE 2027 results</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardContent className="pt-4">
          <div className="relative">
            <div className="absolute left-[103px] top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-4">
              {events.map((e, i) => (
                <div key={i} className="relative flex items-start gap-4">
                  <div className="w-[100px] shrink-0 pt-0.5 text-right">
                    <span className="text-xs font-semibold text-muted-foreground">{e.date}</span>
                  </div>
                  <div className="relative z-10 flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background -ml-[10px]">
                    <div className="size-2 rounded-full bg-primary" />
                  </div>
                  <div className="min-w-0 flex-1 pb-4">
                    <h4 className="text-sm font-medium">{e.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{e.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function CounsellingPage() {
  const [tab, setTab] = useState('coap')

  return (
    <div className="mx-auto max-w-4xl space-y-5 p-4 md:p-6">
      <title>GATE 2027 COAP & CCMT Counselling Guide | GATE CSE</title>
      <meta name="description" content="Step-by-step admission timelines and counselling guide for COAP (IITs/IISc) and CCMT (NITs/IIITs) based on GATE 2027 scores." />
      <div>
        <h1 className="text-lg font-semibold text-foreground">Counselling Guide</h1>
        <p className="text-xs text-muted-foreground">COAP, CCMT, college strategy & document preparation</p>
      </div>

      <div className="rounded-lg bg-muted p-1">
        <div className="flex gap-1">
          {TABS.map(t => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={cn(
                "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1.5",
                tab === t.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <t.icon className="size-4" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {tab === 'coap' && <CoapProcess />}
      {tab === 'ccmt' && <CcmtProcess />}
      {tab === 'strategy' && <CollegeStrategy />}
      {tab === 'documents' && (
        <Card>
          <CardHeader>
            <CardTitle>Document Checklist</CardTitle>
            <CardDescription>Track your document preparation for counselling</CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentChecklist />
          </CardContent>
        </Card>
      )}
      {tab === 'timeline' && <Timeline />}
    </div>
  )
}
