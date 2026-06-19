"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"

interface SubjectInfo {
  id: string
  name: string
  color: string
  topics: number
  weightage: number
}

const subjectData: SubjectInfo[] = [
  { id: "ga", name: "General Aptitude", color: "#6366f1", topics: 3, weightage: 15 },
  { id: "em", name: "Engineering Mathematics", color: "#8b5cf6", topics: 5, weightage: 7 },
  { id: "dm", name: "Discrete Mathematics", color: "#a855f7", topics: 5, weightage: 8 },
  { id: "dl", name: "Digital Logic", color: "#ec4899", topics: 4, weightage: 5 },
  { id: "coa", name: "Computer Organization", color: "#f43f5e", topics: 6, weightage: 10 },
  { id: "pds", name: "Programming & Data Structures", color: "#f97316", topics: 8, weightage: 12 },
  { id: "algo", name: "Algorithms", color: "#eab308", topics: 7, weightage: 8 },
  { id: "toc", name: "Theory of Computation", color: "#84cc16", topics: 5, weightage: 8 },
  { id: "cd", name: "Compiler Design", color: "#22c55e", topics: 7, weightage: 5 },
  { id: "os", name: "Operating Systems", color: "#14b8a6", topics: 8, weightage: 9 },
  { id: "db", name: "Databases", color: "#06b6d4", topics: 6, weightage: 8 },
  { id: "cn", name: "Computer Networks", color: "#3b82f6", topics: 7, weightage: 10 },
]

const totalTopics = subjectData.reduce((s, sub) => s + sub.topics, 0)
const totalSubjects = subjectData.length

const weightageData = [
  { subject: "Programming & Data Structures", marks: "10–12" },
  { subject: "Algorithms", marks: "8–10" },
  { subject: "Computer Networks", marks: "8–10" },
  { subject: "Operating Systems", marks: "8–10" },
  { subject: "Databases", marks: "8–10" },
  { subject: "Computer Organization", marks: "8–10" },
  { subject: "Theory of Computation", marks: "5–7" },
  { subject: "Compiler Design", marks: "5–7" },
  { subject: "Discrete Mathematics", marks: "5–8" },
  { subject: "Engineering Mathematics", marks: "5–8" },
  { subject: "General Aptitude", marks: "15" },
]

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay)
    return () => clearTimeout(t)
  }, [delay])
  return (
    <div
      className={`transition-all duration-500 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      {children}
    </div>
  )
}

function StaggerRow({ children, index }: { children: React.ReactNode; index: number }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80 + index * 30)
    return () => clearTimeout(t)
  }, [index])
  return (
    <div
      className={`transition-all duration-500 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
    >
      {children}
    </div>
  )
}

export default function PageClient() {
  const router = useRouter()
  const { user, signInWithGoogle } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(id)
  }, [])

  const handleStart = async () => {
    if (user) {
      router.push("/dashboard")
    } else {
      await signInWithGoogle()
      router.push("/dashboard")
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-14 items-center justify-between border-b border-border px-6">
        <Link href="/" className="font-mono text-sm font-bold tracking-tight text-foreground/60 no-underline">
          GATE CSE 2027
        </Link>
        {mounted && (
          <Button size="sm" onClick={handleStart}>
            Start tracking
          </Button>
        )}
      </header>

      <main className="flex flex-1 flex-col items-center px-6 py-16">
        <div className="w-full max-w-lg">
          <FadeIn delay={50}>
            <h1 className="text-2xl font-bold leading-snug tracking-tight md:text-4xl">
              GATE CSE 2027
              <br />
              Preparation Tracker
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {totalTopics} topics across {totalSubjects} subjects. Track syllabus progress, log
              study hours, analyze mocks, and predict rank — free.
            </p>
          </FadeIn>

          <FadeIn delay={150}>
            <div className="mt-8 grid grid-cols-4 gap-px overflow-hidden rounded-lg border bg-border text-center text-sm">
              <div className="bg-card px-2 py-3">
                <p className="text-lg font-bold leading-tight">{totalTopics}</p>
                <p className="text-[10px] text-muted-foreground">Topics</p>
              </div>
              <div className="bg-card px-2 py-3">
                <p className="text-lg font-bold leading-tight">{totalSubjects}</p>
                <p className="text-[10px] text-muted-foreground">Subjects</p>
              </div>
              <div className="bg-card px-2 py-3">
                <p className="text-lg font-bold leading-tight">~550</p>
                <p className="text-[10px] text-muted-foreground">Hours</p>
              </div>
              <div className="bg-card px-2 py-3">
                <p className="text-lg font-bold leading-tight">100</p>
                <p className="text-[10px] text-muted-foreground">Marks</p>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={250}>
            <div className="mt-8 overflow-hidden rounded-xl border border-border">
              <div className="border-b border-border bg-secondary/50 px-4 py-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Subject
                  </span>
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Marks
                  </span>
                </div>
              </div>
              <div className="divide-y divide-border text-sm">
                {weightageData.map((row, i) => (
                  <StaggerRow key={row.subject} index={i}>
                    <div className="flex items-center justify-between px-4 py-2.5 transition-colors hover:bg-muted/30">
                      <span>{row.subject}</span>
                      <span className="ml-4 font-mono text-xs text-muted-foreground tabular-nums">
                        {row.marks}
                      </span>
                    </div>
                  </StaggerRow>
                ))}
              </div>
            </div>
            <p className="mt-2 text-right text-xs text-muted-foreground">
              5-year average &middot; Core subjects (85 marks)
            </p>
          </FadeIn>

          <FadeIn delay={350}>
            <div className="mt-10">
              {subjectData
                .filter((s) => s.topics > 0)
                .map((sub, i) => (
                  <StaggerRow key={sub.id} index={i}>
                    <div className="flex items-center gap-3 py-1.5 text-sm">
                      <div
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: sub.color }}
                      />
                      <span className="flex-1">{sub.name}</span>
                      <span className="font-mono text-xs tabular-nums text-muted-foreground">
                        {sub.topics} topics
                      </span>
                      <span className="font-mono text-[10px] tabular-nums text-muted-foreground/60">
                        {sub.weightage} marks
                      </span>
                    </div>
                  </StaggerRow>
                ))}
            </div>
          </FadeIn>

          <FadeIn delay={450}>
            <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div className="text-muted-foreground">Syllabus tracking</div>
              <div className="text-right font-medium">Topic by topic</div>
              <div className="text-muted-foreground">Daily study logs</div>
              <div className="text-right font-medium">Hours + streaks</div>
              <div className="text-muted-foreground">Mock test analysis</div>
              <div className="text-right font-medium">Scores + errors</div>
              <div className="text-muted-foreground">Rank prediction</div>
              <div className="text-right font-medium">AIR + colleges</div>
              <div className="text-muted-foreground">PSU recruitment</div>
              <div className="text-right font-medium">Jobs + cutoffs</div>
              <div className="text-muted-foreground">Counselling guide</div>
              <div className="text-right font-medium">COAP + CCMT</div>
            </div>
          </FadeIn>

          <FadeIn delay={550}>
            <div className="mt-10 flex flex-col gap-2 sm:flex-row">
              <Button onClick={handleStart} className="flex-1">
                Start tracking
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  await signInWithGoogle()
                  router.push("/dashboard")
                }}
                className="flex-1"
              >
                Sign in with Google
              </Button>
            </div>
          </FadeIn>
        </div>
      </main>

      <footer className="border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">
        Free for GATE CSE aspirants
      </footer>
    </div>
  )
}
