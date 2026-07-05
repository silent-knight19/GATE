'use client'

import { useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import { syllabus } from '@/lib/data/syllabus'
import { subjectStats, EXAM_INFO, getShortSubjectName } from '@/lib/data/subject-stats'
import { useAppStore } from '@/lib/store'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronRight, BookOpen, Clock, Target, TrendingUp, Zap, BarChart3 } from 'lucide-react'
import { subDays, format } from 'date-fns'
import Link from 'next/link'

const statusColors: Record<string, string> = {
  not_started: 'bg-gray-500/20 text-gray-500',
  in_progress: 'bg-blue-500/20 text-blue-500',
  completed: 'bg-green-500/20 text-green-500',
  mastered: 'bg-purple-500/20 text-purple-500',
}

export default function ProgressPage() {
  const topicsProgress = useAppStore((s) => s.topicsProgress)
  const logs = useAppStore((s) => s.logs)
  const tests = useAppStore((s) => s.tests)

  const [expandedSubject, setExpandedSubject] = useState<string | null>(null)

  const overall = useMemo(() => {
    const allTopics = syllabus.flatMap((s) => s.topics.map((t) => t.id))
    const total = allTopics.length
    let notStarted = 0, inProgress = 0, completed = 0, mastered = 0
    for (const id of allTopics) {
      const s = topicsProgress[id]
      if (s === 'not_started') notStarted++
      else if (s === 'in_progress') inProgress++
      else if (s === 'completed') completed++
      else if (s === 'mastered') mastered++
    }
    const done = completed + mastered
    return { total, notStarted, inProgress, completed, mastered, percent: total > 0 ? Math.round((done / total) * 100) : 0 }
  }, [topicsProgress])

  const totalHours = useMemo(() => logs.reduce((s, l) => s + l.hours, 0), [logs])

  const streak = useMemo(() => {
    const getStreak = useAppStore.getState().getStreak
    return getStreak()
  }, [logs])

  const weeklyHours = useMemo(() => {
    const days: { day: string; hours: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i)
      days.push({
        day: format(d, 'EEE'),
        hours: logs.filter((l) => l.date === format(d, 'yyyy-MM-dd')).reduce((s, l) => s + l.hours, 0),
      })
    }
    return days
  }, [logs])

  const avgScore = useMemo(() => {
    const scores = tests.map((t) => t.marksObtained)
    return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
  }, [tests])

  const subjectProgress = useMemo(() => {
    return syllabus.map((sub) => {
      const total = sub.topics.length
      const completed = sub.topics.filter((t) => topicsProgress[t.id] === 'completed' || topicsProgress[t.id] === 'mastered').length
      const inProgress = sub.topics.filter((t) => topicsProgress[t.id] === 'in_progress').length
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0
      const subHours = logs.filter((l) => l.subjectId === sub.id).reduce((s, l) => s + l.hours, 0)
      const stats = subjectStats.find((st) => st.id === sub.id)
      const topics = sub.topics.map((t) => ({
        id: t.id,
        name: t.name,
        status: topicsProgress[t.id] || 'not_started',
        avgMarks: t.avgMarks,
        frequency: t.frequency,
        hours: t.hours,
      }))
      return { ...sub, completed, inProgress, total, percent, subHours, stats, topics }
    })
  }, [topicsProgress, logs])

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Progress Hub</h1>
        <p className="text-sm text-muted-foreground">
          Complete tracking of your GATE CSE 2027 preparation
        </p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Target className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Syllabus</p>
              <p className="text-lg font-bold tabular-nums">{overall.percent}%</p>
              <p className="text-[10px] text-muted-foreground">{overall.completed + overall.mastered}/{overall.total} topics</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
              <Clock className="size-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Study Hours</p>
              <p className="text-lg font-bold tabular-nums">{totalHours.toFixed(2)}h</p>
              <p className="text-[10px] text-muted-foreground">{streak}-day streak</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
              <Zap className="size-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Mock Average</p>
              <p className="text-lg font-bold tabular-nums">{avgScore > 0 ? `${avgScore}%` : '—'}</p>
              <p className="text-[10px] text-muted-foreground">{tests.length} tests taken</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <TrendingUp className="size-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Days to GATE</p>
              <p className="text-lg font-bold tabular-nums">{Math.round((new Date(2027, 1, 7).getTime() - new Date().getTime()) / 86400000)}</p>
              <p className="text-[10px] text-muted-foreground">Feb 7, 2027</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exam info banner */}
      <Card className="bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 border-indigo-500/20">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-4">
          <div className="flex items-center gap-4">
            <BookOpen className="size-5 text-indigo-400" />
            <div>
              <p className="text-sm font-medium">GATE CSE 2027 Exam</p>
              <p className="text-xs text-muted-foreground">{EXAM_INFO.totalMarks} marks · {EXAM_INFO.totalQuestions} questions · {EXAM_INFO.durationMinutes} min</p>
            </div>
          </div>
          <div className="flex gap-2">
            {EXAM_INFO.questionTypes.map((qt) => (
              <Badge key={qt} variant="outline" className="text-[10px]">{qt}</Badge>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>GA: {EXAM_INFO.generalAptitudeMarks} marks</span>
            <span>·</span>
            <span>EM: {EXAM_INFO.engineeringMathematicsMarks} marks</span>
            <span>·</span>
            <span>Core: {EXAM_INFO.coreSubjectsMarks} marks</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject list */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Subject-wise Progress</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {overall.notStarted} not started · {overall.inProgress} in progress · {overall.completed} done · {overall.mastered} mastered
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {syllabus.map((sub) => {
                const p = subjectProgress.find((s) => s.id === sub.id)!
                return (
                  <div key={sub.id}>
                    <div
                      className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2.5 cursor-pointer hover:bg-muted/40 transition-colors"
                      onClick={() => setExpandedSubject(expandedSubject === sub.id ? null : sub.id)}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: sub.color }} />
                        <Link href={`/subjects/${sub.id}`} className="text-sm font-medium truncate hover:underline" onClick={(e) => e.stopPropagation()}>
                          {sub.shortName}
                        </Link>
                        {p.stats && (
                          <span className="text-[10px] text-muted-foreground shrink-0">~{p.stats.avgMarks} marks</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
                            <div className="h-full rounded-full transition-[width]" style={{ width: `${p.percent}%`, backgroundColor: sub.color }} />
                          </div>
                          <span className="text-xs tabular-nums text-muted-foreground w-8 text-right">{p.percent}%</span>
                        </div>
                        <span className="text-xs text-muted-foreground tabular-nums">{p.completed}/{p.total}</span>
                        <span className="text-[10px] text-muted-foreground tabular-nums">{p.subHours.toFixed(2)}h</span>
                        {expandedSubject === sub.id ? <ChevronDown className="size-3.5 text-muted-foreground" /> : <ChevronRight className="size-3.5 text-muted-foreground" />}
                      </div>
                    </div>
                    {expandedSubject === sub.id && (
                      <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-border/40 pl-3">
                        {p.topics.map((t) => (
                          <div key={t.id} className="flex items-center justify-between rounded px-2 py-1 text-xs hover:bg-muted/30">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className={`size-1.5 rounded-full ${t.status === 'not_started' ? 'bg-gray-500' : t.status === 'in_progress' ? 'bg-blue-500' : t.status === 'completed' ? 'bg-green-500' : 'bg-purple-500'}`} />
                              <span className="truncate text-muted-foreground">{t.name}</span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-mono text-[10px] text-muted-foreground">{t.avgMarks}m</span>
                              <span className={`rounded px-1 text-[9px] font-medium ${t.frequency === 'very_high' ? 'text-orange-500 bg-orange-500/10' : t.frequency === 'high' ? 'text-amber-500 bg-amber-500/10' : t.frequency === 'medium' ? 'text-blue-500 bg-blue-500/10' : 'text-gray-500 bg-gray-500/10'}`}>
                                {t.frequency === 'very_high' ? 'VH' : t.frequency === 'high' ? 'H' : t.frequency === 'medium' ? 'M' : 'L'}
                              </span>
                              <span className={`rounded px-1.5 py-[1px] text-[9px] font-medium uppercase tracking-wider ${statusColors[t.status] || 'bg-gray-500/20 text-gray-500'}`}>
                                {t.status === 'not_started' ? 'NS' : t.status === 'in_progress' ? 'IP' : t.status === 'completed' ? 'OK' : 'M'}
                              </span>
                            </div>
                          </div>
                        ))}
                        <Link href={`/subjects/${sub.id}`} className="block text-[10px] text-muted-foreground hover:text-primary px-2 py-1">
                          View detailed analysis →
                        </Link>
                      </div>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          {/* Weekly hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="size-4" />
                <span>Weekly Hours</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={weeklyHours} margin={{ top: 0, right: 0, bottom: 0, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                    <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Topic status distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="size-4" />
                <span>Status Breakdown</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: 'Not Started', count: overall.notStarted, color: 'bg-gray-500' },
                { label: 'In Progress', count: overall.inProgress, color: 'bg-blue-500' },
                { label: 'Completed', count: overall.completed, color: 'bg-green-500' },
                { label: 'Mastered', count: overall.mastered, color: 'bg-purple-500' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={`size-2.5 rounded-full ${item.color}`} />
                  <span className="flex-1 text-xs text-muted-foreground">{item.label}</span>
                  <span className="text-xs font-medium tabular-nums">{item.count}</span>
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${(item.count / overall.total) * 100}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick links */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="size-4" />
                <span>Quick Links</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Link href="/syllabus" className="rounded-lg border border-border/60 px-3 py-2 text-center text-xs hover:bg-muted/50 transition-colors">
                Syllabus
              </Link>
              <Link href="/mocks" className="rounded-lg border border-border/60 px-3 py-2 text-center text-xs hover:bg-muted/50 transition-colors">
                Mock Tests
              </Link>
              <Link href="/analytics" className="rounded-lg border border-border/60 px-3 py-2 text-center text-xs hover:bg-muted/50 transition-colors">
                Analytics
              </Link>
              <Link href="/study" className="rounded-lg border border-border/60 px-3 py-2 text-center text-xs hover:bg-muted/50 transition-colors">
                Study Logger
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
