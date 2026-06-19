"use client"

import React, { useMemo } from "react"
import { subDays, format } from "date-fns"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { useAppStore } from "@/lib/store"
import { syllabus } from "@/lib/data/syllabus"

const SUBJECT_COLORS: Record<string, string> = {
  "General Aptitude": "#6366f1",
  "Engineering Mathematics": "#8b5cf6",
  "Digital Logic": "#ec4899",
  "Computer Organization & Architecture": "#f97316",
  "Programming & Data Structures": "#22c55e",
  Algorithms: "#14b8a6",
  "Theory of Computation": "#e11d48",
  "Compiler Design": "#d946ef",
  "Operating Systems": "#06b6d4",
  Databases: "#84cc16",
  "Computer Networks": "#f43f5e",
}

function getSubjectNameForLog(subjectId: string): string | null {
  const sub = syllabus.find((s) => s.id === subjectId)
  return sub?.shortName || null
}

export const WeeklyChart = React.memo(function WeeklyChart() {
  const logs = useAppStore((s) => s.logs)

  const weeklyData = useMemo(() => {
    const days: {
      day: string
      label: string
      subjects: Record<string, number>
    }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = subDays(new Date(), i)
      const dayStr = format(d, "yyyy-MM-dd")
      const label = format(d, "EEE")
      const dayLogs = logs.filter((l) => l.date === dayStr)
      const subjects: Record<string, number> = {}
      for (const log of dayLogs) {
        const sub = getSubjectNameForLog(log.subjectId)
        if (sub) {
          subjects[sub] = (subjects[sub] || 0) + log.hours
        }
      }
      days.push({ day: dayStr, label, subjects })
    }
    return days
  }, [logs])

  const subjectTotals = useMemo(() => {
    const totals: Record<string, number> = {}
    for (const log of logs) {
      const sub = getSubjectNameForLog(log.subjectId)
      if (sub) {
        totals[sub] = (totals[sub] || 0) + log.hours
      }
    }
    return Object.entries(totals)
      .map(([name, hours]) => ({ name, hours }))
      .sort((a, b) => b.hours - a.hours)
  }, [logs])

  const stackedData = weeklyData.map((d) => ({
    day: d.label,
    ...d.subjects,
  }))

  const allSubjectsInStack = Array.from(
    new Set(weeklyData.flatMap((d) => Object.keys(d.subjects)))
  )

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="rounded-xl border bg-card p-4">
        <h3 className="mb-3 text-sm font-medium text-foreground">
          Hours by Day
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stackedData}
              margin={{ top: 4, right: 4, bottom: 4, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
              />
              <XAxis
                dataKey="day"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
              />
              {allSubjectsInStack.map((subject) => (
                <Bar
                  key={subject}
                  dataKey={subject}
                  stackId="a"
                  fill={SUBJECT_COLORS[subject] || "#6b7280"}
                  radius={[2, 2, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <h3 className="mb-3 text-sm font-medium text-foreground">
          Hours by Subject
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={subjectTotals}
                dataKey="hours"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={70}
                innerRadius={40}
                strokeWidth={0}
              >
                {subjectTotals.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={SUBJECT_COLORS[entry.name] || "#6b7280"}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
              />
              <Legend
                formatter={(value: string) => (
                  <span className="text-xs text-muted-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
})
