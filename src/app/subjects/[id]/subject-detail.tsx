"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, TrendingUp, BarChart3, Target, Clock } from "lucide-react"
import type { Subject, TopicStatus } from "@/lib/data/syllabus"
import { subjectStats } from "@/lib/data/subject-stats"
import { useAppStore } from "@/lib/store"
import { TopicRow } from "@/components/topic-row"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts"

const frequencyColors: Record<string, string> = {
  very_high: "text-orange-500 bg-orange-500/10",
  high: "text-amber-500 bg-amber-500/10",
  medium: "text-blue-500 bg-blue-500/10",
  low: "text-gray-500 bg-gray-500/10",
}

const frequencyLabels: Record<string, string> = {
  very_high: "Very High",
  high: "High",
  medium: "Medium",
  low: "Low",
}

export function SubjectDetail({ subject }: { subject: Subject }) {
  const router = useRouter()
  const topicsProgress = useAppStore((s) => s.topicsProgress)
  const cycleTopicStatus = useAppStore((s) => s.cycleTopicStatus)
  const logs = useAppStore((s) => s.logs)
  const tests = useAppStore((s) => s.tests)

  const total = subject.topics.length
  const completed = subject.topics.filter(
    (t) => topicsProgress[t.id] === "completed" || topicsProgress[t.id] === "mastered"
  ).length
  const inProgress = subject.topics.filter((t) => topicsProgress[t.id] === "in_progress").length
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0

  const topics = subject.topics.map((t) => ({
    id: t.id,
    name: t.name,
    status: (topicsProgress[t.id] || "not_started") as TopicStatus,
    avgMarks: t.avgMarks,
    frequency: t.frequency,
    hours: t.hours,
  }))

  const stats = subjectStats.find((s) => s.id === subject.id)

  const subHours = logs.filter((l) => l.subjectId === subject.id).reduce((s, l) => s + l.hours, 0)

  const testScores = tests
    .filter((t) => subject.name in t.subjectBreakdown)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((t) => ({
      date: new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      score: t.subjectBreakdown[subject.name] || 0,
    }))

  const maxYearMarks = Math.max(...subject.yearMarks.map((y) => y.marks), 1)

  const yearChartData = subject.yearMarks.map((ym) => ({
    year: String(ym.year),
    marks: ym.marks,
    questions: ym.questions,
  }))

  const topicFrequencyData = topics
    .map((t) => ({
      name: t.name,
      marks: t.avgMarks,
      frequency: t.frequency,
      hours: t.hours,
      status: t.status,
      statusScore:
        t.status === "mastered" ? 4 : t.status === "completed" ? 3 : t.status === "in_progress" ? 2 : 1,
      priorityScore: (t.frequency === "very_high" ? 4 : t.frequency === "high" ? 3 : t.frequency === "medium" ? 2 : 1) * (1 - (t.status === "mastered" || t.status === "completed" ? 0.8 : 0)),
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore)

  return (
    <div className="mx-auto max-w-4xl space-y-5 p-4 md:p-6">
      <button
        onClick={() => router.push("/subjects")}
        className="flex h-6 items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3" />
        Back to subjects
      </button>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="size-4 rounded-full" style={{ backgroundColor: subject.color }} />
          <div>
            <h1 className="text-xl font-bold text-foreground">{subject.name}</h1>
            <p className="text-xs text-muted-foreground">
              {stats ? `~${stats.avgMarks} marks avg (2021-2025) · ${stats.weightage}% weightage` : `${subject.avgMarks} marks avg`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-xs font-medium">{subject.weightage}%</span>
          <span
            className={`rounded-full px-1.5 py-[1px] text-[10px] font-medium uppercase tracking-wider ${
              subject.volatility === "stable" ? "text-emerald-500 bg-emerald-500/10" :
              subject.volatility === "moderate" ? "text-amber-500 bg-amber-500/10" :
              "text-red-500 bg-red-500/10"
            }`}
          >
            {subject.volatility}
          </span>
          <span className={subject.trend === "up" ? "text-emerald-500" : subject.trend === "down" ? "text-red-500" : "text-muted-foreground"}>
            {subject.trend === "up" ? "↑" : subject.trend === "down" ? "↓" : "→"}
          </span>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-xl glass p-3 text-center">
          <p className="text-xs text-muted-foreground">Progress</p>
          <p className="text-xl font-bold tabular-nums">{percent}%</p>
          <p className="text-[10px] text-muted-foreground">{completed}/{total} topics</p>
        </div>
        <div className="rounded-xl glass p-3 text-center">
          <p className="text-xs text-muted-foreground">In Progress</p>
          <p className="text-xl font-bold tabular-nums text-blue-500">{inProgress}</p>
          <p className="text-[10px] text-muted-foreground">{total - completed - inProgress} remaining</p>
        </div>
        <div className="rounded-xl glass p-3 text-center">
          <p className="text-xs text-muted-foreground">Study Hours</p>
          <p className="text-xl font-bold tabular-nums">{subHours}h</p>
          <p className="text-[10px] text-muted-foreground">logged</p>
        </div>
        <div className="rounded-xl glass p-3 text-center">
          <p className="text-xs text-muted-foreground">Est. Marks</p>
          <p className="text-xl font-bold tabular-nums" style={{ color: subject.color }}>
            {percent > 0 ? Math.round((subject.avgMarks * percent) / 100) : "—"}
          </p>
          <p className="text-[10px] text-muted-foreground">of ~{subject.avgMarks}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
          <span>Overall Progress</span>
          <span className="font-mono tabular-nums">{completed}/{total} ({percent}%)</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${percent}%`, backgroundColor: subject.color }}
          />
        </div>
      </div>

      {/* Year-wise marks comparison */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <BarChart3 className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">Year-wise Marks Distribution (2021-2025)</span>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={yearChartData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                formatter={(value) => [`${value} marks`]}
              />
              <Bar dataKey="marks" fill={subject.color} radius={[4, 4, 0, 0]} barSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Average: {subject.avgMarks} marks | Highest: {Math.max(...subject.yearMarks.map((y) => y.marks))} marks
        </div>
      </div>

      {/* Topic priority overview */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <Target className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">Topics — Priority Order</span>
        </div>
        <div className="space-y-1">
          {topicFrequencyData.map((t, i) => (
            <div key={t.name} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted/30 transition-colors">
              <span className="w-5 text-[10px] font-medium text-muted-foreground">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-foreground">{t.name}</span>
                  <span className={`rounded px-1 text-[9px] font-medium ${frequencyColors[t.frequency] || ''}`}>
                    {frequencyLabels[t.frequency]}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span>~{t.marks} marks</span>
                  <span>{t.hours}h</span>
                  <span>{t.status === "not_started" ? "NS" : t.status === "in_progress" ? "IP" : t.status === "completed" ? "OK" : "M"}</span>
                </div>
              </div>
              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary shrink-0">
                <div className="h-full rounded-full bg-foreground/50" style={{ width: `${(t.priorityScore / Math.max(...topicFrequencyData.map((d) => d.priorityScore))) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mock test performance for this subject */}
      {testScores.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">Mock Test Performance ({subject.name})</span>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={testScores} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="score" stroke={subject.color} strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Topic progression */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Clock className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">Topic Details</span>
        </div>
        <div className="space-y-0.5">
          {topics.map((t) => {
            const topicData = subject.topics.find((st) => st.id === t.id)
            return (
              <TopicRow
                key={t.id}
                topic={{
                  id: t.id,
                  name: t.name,
                  status: t.status,
                  avgMarks: topicData?.avgMarks ?? 0,
                  frequency: topicData?.frequency ?? "medium",
                  hours: topicData?.hours ?? 0,
                  prerequisites: topicData?.prerequisites ?? [],
                }}
                onCycle={() => cycleTopicStatus(t.id)}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
