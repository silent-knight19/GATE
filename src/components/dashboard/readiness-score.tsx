"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { calculateReadinessScore } from "@/lib/calculators"
import { useAppStore } from "@/lib/store"

function getColor(score: number) {
  if (score < 40) return "#ef4444"
  if (score < 60) return "#eab308"
  if (score < 80) return "#3b82f6"
  return "#22c55e"
}

function getLabel(score: number) {
  if (score < 40) return "Needs Focus"
  if (score < 60) return "Developing"
  if (score < 80) return "On Track"
  return "Ready"
}

export default function ReadinessScore() {
  const [animatedScore, setAnimatedScore] = useState(0)
  const topicsProgress = useAppStore((s) => s.topicsProgress)
  const tests = useAppStore((s) => s.tests)
  const logs = useAppStore((s) => s.logs)
  const revisionHistory = useAppStore((s) => s.revisionHistory)

  const topicList = Object.values(topicsProgress)
  const total = topicList.length
  const completed = topicList.filter((s) => s === "completed" || s === "mastered").length
  const syllabusPct = total > 0 ? Math.round((completed / total) * 100) : 0
  const mockTrend = tests.map((m) => m.marksObtained)
  const revisionCoverage = total > 0 ? Math.round((revisionHistory.length / total) * 100) : 0

  const logDates = logs.map((l) => ({
    date: new Date(l.date),
    hoursStudied: l.hours,
    topicsCovered: [l.topicId],
  }))

  const last7 = logDates.slice(-7)
  const avgHoursLastWeek = last7.length > 0
    ? Math.round((last7.reduce((s, l) => s + l.hoursStudied, 0) / 7) * 10) / 10
    : 0
  const consistency = Math.min(avgHoursLastWeek * 12, 100)

  const score = syllabusPct === 0 && tests.length === 0 && logs.length === 0
    ? 0
    : calculateReadinessScore({
        syllabusProgress: syllabusPct,
        mockScoreTrend: mockTrend,
        revisionCoverage,
        consistency,
      })

  useEffect(() => {
    const duration = 1000
    const steps = 60
    const increment = score / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= score) {
        setAnimatedScore(score)
        clearInterval(timer)
      } else {
        setAnimatedScore(Math.round(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [score])

  const radius = 80
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animatedScore / 100) * circumference
  const color = getColor(animatedScore)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Readiness Score</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="relative">
          <svg width="200" height="200" className="-rotate-90">
            <circle cx="100" cy="100" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="12" />
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 0.1s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold" style={{ color }}>
              {Math.round(animatedScore)}
            </span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
        </div>
        <div
          className="rounded-full px-3 py-1 text-xs font-medium"
          style={{ backgroundColor: `${color}20`, color }}
        >
          {getLabel(animatedScore)}
        </div>
        <p className="text-center text-xs text-muted-foreground">
          {score === 0
            ? "Start studying and logging progress to see your readiness score."
            : `Top 500 rankers typically score 80+. Gap to close: `}
          {score > 0 && <span className="font-medium">{(80 - score).toFixed(0)} pts</span>}
        </p>
      </CardContent>
    </Card>
  )
}
