"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"

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

function StaggerRow({ children, index }: { children: React.ReactNode; index: number }) {
  const [visible, setVisible] = useState(false)
  const [reduced, setReduced] = useState(true)
  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    const t = setTimeout(() => setVisible(true), 80 + index * 30)
    return () => clearTimeout(t)
  }, [index])
  if (reduced) return <div>{children}</div>
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
    setMounted(true)
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
      {/* Nav — matches sidebar header */}
      <header className="flex h-14 items-center justify-between border-b border-border px-6">
        <span className="font-mono text-sm font-bold tracking-tight text-foreground/60">
          GATE CSE 2027
        </span>
        {mounted && (
          <Button size="sm" onClick={handleStart}>
            Start tracking
          </Button>
        )}
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg">
          {/* Hero */}
          <h1 className="text-2xl font-bold leading-snug tracking-tight md:text-4xl">
            GATE CSE 2027
            <br />
            Preparation Tracker
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Plan your syllabus, log daily study hours, analyze mock tests, and predict your rank.
            Free for every aspirant.
          </p>

          {/* Weightage table — the signature element */}
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

          {/* Feature flow — text only */}
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

          {/* CTA */}
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
        </div>
      </main>

      {/* Footer — minimal */}
      <footer className="border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">
        Free for GATE CSE aspirants
      </footer>
    </div>
  )
}
