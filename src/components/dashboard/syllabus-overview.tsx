"use client"

import { Card } from "@/components/ui/card"
import { useAppStore } from "@/lib/store"
import { syllabus } from "@/lib/data/syllabus"
import { getShortSubjectName } from "@/lib/data/subject-stats"
import Link from "next/link"
import { useEffect, useState } from "react"
import {
  Brain,
  Pi,
  Binary,
  Cpu,
  Layers,
  Code2,
  Workflow,
  Atom,
  RefreshCw,
  Terminal,
  Database,
  Globe,
} from "lucide-react"

const subjectIcons: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  ga: Brain,
  em: Pi,
  dm: Binary,
  dl: Cpu,
  coa: Layers,
  pds: Code2,
  algo: Workflow,
  toc: Atom,
  cd: RefreshCw,
  os: Terminal,
  db: Database,
  cn: Globe,
}

function MiniRing({
  percent,
  size = 56,
  strokeWidth = 5,
  color,
  delay = 0,
  icon: Icon,
}: {
  percent: number
  size?: number
  strokeWidth?: number
  color: string
  delay?: number
  icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>
}) {
  const [animated, setAnimated] = useState(0)
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (animated / 100) * circ

  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 800
      const steps = 30
      const inc = percent / steps
      let step = 0
      const interval = setInterval(() => {
        step++
        setAnimated(Math.min(Math.round(inc * step), percent))
        if (step >= steps) clearInterval(interval)
      }, duration / steps)
      return () => clearInterval(interval)
    }, delay)
    return () => clearTimeout(timer)
  }, [percent, delay])

  return (
    <div className="relative">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center rounded-full transition-colors duration-200 group-hover:bg-muted/10">
        {Icon ? (
          <Icon className="size-5 transition-transform duration-200 group-hover:scale-110" style={{ color }} />
        ) : (
          <span className="text-xs font-bold tabular-nums text-foreground/80">
            {percent}%
          </span>
        )}
      </div>
    </div>
  )
}

function OverallRing({ percent }: { percent: number }) {
  const [animated, setAnimated] = useState(0)
  const radius = 70
  const circ = 2 * Math.PI * radius
  const offset = circ - (animated / 100) * circ

  useEffect(() => {
    const duration = 1400
    const steps = 50
    const inc = percent / steps
    let step = 0
    const interval = setInterval(() => {
      step++
      setAnimated(Math.min(Math.round(inc * step), percent))
      if (step >= steps) clearInterval(interval)
    }, duration / steps)
    return () => clearInterval(interval)
  }, [percent])

  function getColor(p: number) {
    if (p < 30) return "#ef4444"
    if (p < 60) return "#eab308"
    if (p < 80) return "#3b82f6"
    return "#22c55e"
  }

  return (
    <div className="relative mx-auto">
      <svg width="180" height="180" className="-rotate-90">
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="12"
        />
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="url(#overallGrad)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1.2s ease" }}
        />
        <defs>
          <linearGradient
            id="overallGrad"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-4xl font-black tabular-nums"
          style={{ color: getColor(animated) }}
        >
          {animated}%
        </span>
        <span className="text-xs text-muted-foreground">overall</span>
      </div>
    </div>
  )
}

export default function SyllabusOverview() {
  const topicsProgress = useAppStore((s) => s.topicsProgress)

  const subjects = syllabus.map((subject, i) => {
    const total = subject.topics.length
    const completed = subject.topics.filter(
      (t) =>
        topicsProgress[t.id] === "completed" ||
        topicsProgress[t.id] === "mastered"
    ).length
    const inProgress = subject.topics.filter(
      (t) => topicsProgress[t.id] === "in_progress"
    ).length
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0
    return { ...subject, completed, inProgress, total, percent, index: i }
  })

  const overall = subjects.reduce(
    (acc, s) => ({
      completed: acc.completed + s.completed,
      inProgress: acc.inProgress + s.inProgress,
      total: acc.total + s.total,
    }),
    { completed: 0, inProgress: 0, total: 0 }
  )
  const overallPercent =
    overall.total > 0
      ? Math.round((overall.completed / overall.total) * 100)
      : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-2xl border bg-card p-6">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">Overall Progress</h3>
          <p className="text-xs text-muted-foreground">
            {overall.completed} completed &middot; {overall.inProgress} in
            progress &middot;{" "}
            {overall.total - overall.completed - overall.inProgress} remaining
          </p>
        </div>
        <OverallRing percent={overallPercent} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {subjects.map((subject, i) => {
          const SubjectIcon = subjectIcons[subject.id]
          return (
            <Link
              key={subject.id}
              href={`/subjects/${subject.id}`}
              className="group relative overflow-hidden rounded-xl border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className="absolute inset-x-0 top-0 h-1 rounded-t-xl"
                style={{ backgroundColor: subject.color }}
              />

              <div className="relative flex flex-col items-center gap-3">
                <MiniRing
                  percent={subject.percent}
                  color={subject.color}
                  delay={i * 80}
                  icon={SubjectIcon}
                />
                <div className="space-y-1 text-center">
                  <p className="text-xs font-bold leading-tight text-foreground/90 line-clamp-2">
                    {getShortSubjectName(subject.name)}
                  </p>
                  <p className="text-[10px] font-medium tabular-nums text-muted-foreground flex items-center justify-center gap-1">
                    <span>{subject.percent}%</span>
                    <span className="text-muted-foreground/30">&middot;</span>
                    <span>
                      {subject.completed}/{subject.total}
                      {subject.inProgress > 0 && (
                        <span className="text-blue-500">
                          {" "}
                          +{subject.inProgress}
                        </span>
                      )}
                    </span>
                  </p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
