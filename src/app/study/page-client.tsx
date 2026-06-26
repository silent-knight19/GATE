"use client"

import { useMemo, useState, useEffect } from "react"
import { useAppStore } from "@/lib/store"
import { syllabus } from "@/lib/data/syllabus"
import { StudyTimer } from "@/components/study/study-timer"
import { StreakDisplay } from "@/components/study/streak-display"
import { WeeklyChart } from "@/components/study/weekly-chart"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { subDays, format } from "date-fns"

function getSubjectForLog(subjectId: string): string {
  const sub = syllabus.find((s) => s.id === subjectId)
  return sub?.shortName || subjectId
}

export default function StudyPage() {
  const logs = useAppStore((s) => s.logs)
  const getStreak = useAppStore((s) => s.getStreak)

  const [mounted, setMounted] = useState(false)
  const [todayDate, setTodayDate] = useState(() => format(new Date(), "yyyy-MM-dd"))

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setTodayDate((prev) => {
        const now = format(new Date(), "yyyy-MM-dd")
        return now !== prev ? now : prev
      })
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const totalHours = useMemo(
    () => mounted ? logs.reduce((sum, l) => sum + l.hours, 0) : 0,
    [logs, mounted]
  )

  const hoursBySubject = useMemo(() => {
    if (!mounted) return {}
    const hours: Record<string, number> = {}
    for (const log of logs) {
      const sub = syllabus.find((s) => s.id === log.subjectId)
      if (sub) {
        hours[sub.shortName] = (hours[sub.shortName] || 0) + log.hours
      }
    }
    return hours
  }, [logs, mounted])

  const streak = useMemo(() => mounted ? getStreak() : 0, [getStreak, logs, mounted])

  const todayLogs = useMemo(
    () =>
      mounted
        ? logs
            .filter((l) => l.date === todayDate)
            .sort((a, b) => b.hours - a.hours)
        : [],
    [logs, todayDate, mounted]
  )

  const recentLogs = useMemo(
    () =>
      mounted
        ? [...logs]
            .sort((a, b) => b.date.localeCompare(a.date) || b.hours - a.hours)
            .slice(0, 20)
        : [],
    [logs, mounted]
  )

  const weeklyStats = useMemo(() => {
    if (!mounted) return { weekHours: 0, daysStudied: 0 }
    const weekAgo = subDays(new Date(), 7)
    const weekLogs = logs.filter(
      (l) => new Date(l.date + "T00:00:00") >= weekAgo
    )
    const weekHours = weekLogs.reduce((s, l) => s + l.hours, 0)
    const daysStudied = new Set(weekLogs.map((l) => l.date)).size
    return { weekHours, daysStudied }
  }, [logs, mounted])

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-4 md:p-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Study Logger</h1>
        <p className="text-xs text-muted-foreground">
          {totalHours.toFixed(2)}h total &middot; {streak}-day streak &middot;{" "}
          {weeklyStats.weekHours.toFixed(2)}h this week
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StudyTimer />
        </div>
        <StreakDisplay streak={streak} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Log</CardTitle>
          </CardHeader>
          <CardContent>
            {todayLogs.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No study sessions logged today.
              </p>
            ) : (
              <div className="space-y-1">
                {todayLogs.map((log, i) => {
                  const topic = syllabus
                    .flatMap((s) => s.topics)
                    .find((t) => t.id === log.topicId)
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-foreground">
                          {topic?.name || log.topicId}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getSubjectForLog(log.subjectId)}
                        </p>
                      </div>
                      <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                        {log.hours.toFixed(2)}h
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentLogs.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No study activity yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="px-2 py-1.5 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        Date
                      </th>
                      <th className="px-2 py-1.5 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        Topic
                      </th>
                      <th className="px-2 py-1.5 text-right text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        Hours
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLogs.map((log, i) => {
                      const topic = syllabus
                        .flatMap((s) => s.topics)
                        .find((t) => t.id === log.topicId)
                      return (
                        <tr
                          key={i}
                          className="border-b border-border/40 transition-colors hover:bg-muted/40"
                        >
                          <td className="px-2 py-1.5 font-mono text-xs">
                            {log.date}
                          </td>
                          <td className="max-w-[200px] truncate px-2 py-1.5 text-xs text-muted-foreground">
                            {getSubjectForLog(log.subjectId)} &rsaquo;{" "}
                            {topic?.name || log.topicId}
                          </td>
                          <td className="px-2 py-1.5 text-right font-mono text-xs">
                            {log.hours.toFixed(2)}h
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <WeeklyChart />
    </div>
  )
}
