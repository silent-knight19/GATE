"use client"

import { BookOpen, TrendingUp, Zap, BarChart3 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useAppStore } from "@/lib/store"

function ProgressRing({ percent, size = 40, strokeWidth = 4, color }: { percent: number; size?: number; strokeWidth?: number; color?: string }) {
  const r = (size - strokeWidth) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (percent / 100) * circ
  return (
    <svg width={size} height={size} className="-rotate-90 shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color ?? "hsl(var(--primary))"}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
      />
    </svg>
  )
}

function StatCard({
  icon,
  label,
  value,
  sub,
  ring,
  trend,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  ring?: number
  trend?: "up" | "down"
}) {
  return (
    <Card className="flex-1 min-w-0">
      <CardContent className="flex items-start gap-3 pt-4">
        {ring !== undefined ? (
          <div className="relative shrink-0">
            <ProgressRing percent={ring} color={ring < 40 ? "#ef4444" : ring < 70 ? "#eab308" : "#22c55e"} />
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold tabular-nums">
              {ring}%
            </span>
          </div>
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold tabular-nums leading-tight">
            {value}
            {trend && (
              <TrendingUp
                className={`ml-1 inline h-4 w-4 ${trend === "down" ? "rotate-180 text-destructive" : "text-green-500"}`}
              />
            )}
          </p>
          <p className="truncate text-xs text-muted-foreground">{sub}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function MetricsCards() {
  const topicsProgress = useAppStore((s) => s.topicsProgress)
  const tests = useAppStore((s) => s.tests)
  const logs = useAppStore((s) => s.logs)

  const topicList = Object.values(topicsProgress)
  const completed = topicList.filter((s) => s === "completed" || s === "mastered").length
  const total = topicList.length
  const syllabusPct = total > 0 ? Math.round((completed / total) * 100) : 0

  const dateSet = new Set(logs.map((l) => l.date))
  let streak = 0
  const today = new Date()
  while (dateSet.has(today.toISOString().split("T")[0])) {
    streak++
    today.setDate(today.getDate() - 1)
  }

  const totalHours = logs.reduce((sum, l) => sum + l.hours, 0)

  const scores = tests.map((m) => m.marksObtained)
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0
  const trend = scores.length >= 2 ? (scores[scores.length - 1] >= scores[scores.length - 2] ? "up" as const : "down" as const) : undefined

  const weeklyHours = totalHours > 0 ? Math.round(totalHours / 4) : 0

  return (
    <div className="flex flex-wrap gap-3">
      <StatCard
        icon={<BookOpen className="h-5 w-5" />}
        label="Syllabus Progress"
        value={total > 0 ? `${syllabusPct}%` : "0%"}
        sub={total > 0 ? `${completed} / ${total} topics` : "No topics started"}
        ring={total > 0 ? syllabusPct : 0}
      />
      <StatCard
        icon={<BarChart3 className="h-5 w-5" />}
        label="Mock Average"
        value={scores.length > 0 ? `${avgScore}%` : "—"}
        sub={scores.length > 0 ? `Best: ${bestScore}%` : "No tests taken"}
        trend={trend}
      />
      <StatCard
        icon={<Zap className="h-5 w-5" />}
        label="Study Streak"
        value={streak > 0 ? `${streak}d` : "0d"}
        sub={totalHours > 0 ? `${weeklyHours}h / week` : "No study time logged"}
      />
    </div>
  )
}
