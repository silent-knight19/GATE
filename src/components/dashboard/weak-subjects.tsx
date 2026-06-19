"use client"

import React, { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppStore } from "@/lib/store"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts"

const SUBJECT_ORDER = [
  "General Aptitude", "Engineering Mathematics", "Discrete Mathematics", "Digital Logic",
  "Computer Organization & Architecture", "Programming & Data Structures",
  "Algorithms", "Theory of Computation", "Compiler Design",
  "Operating Systems", "Databases", "Computer Networks",
]

const SUBJECT_LABELS: Record<string, string> = {
  "General Aptitude": "GA",
  "Engineering Mathematics": "EM",
  "Discrete Mathematics": "DM",
  "Digital Logic": "DL",
  "Computer Organization & Architecture": "COA",
  "Programming & Data Structures": "PDS",
  "Algorithms": "Algo",
  "Theory of Computation": "TOC",
  "Compiler Design": "CD",
  "Operating Systems": "OS",
  "Databases": "DB",
  "Computer Networks": "CN",
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: { fullName: string; marks: number; maxPossible: number; pct: number } }[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border bg-card p-2 text-xs shadow-lg">
      <p className="font-medium">{d.fullName}</p>
      <p>{d.marks} / {d.maxPossible} ({d.pct}%)</p>
    </div>
  )
}

function WeakSubjects() {
  const tests = useAppStore((s) => s.tests)
  const maxPossible = 15

  const subjects = useMemo(() => {
    if (!tests.length) return []

    const sums: Record<string, { sum: number; count: number }> = {}
    for (const test of tests) {
      for (const [name, marks] of Object.entries(test.subjectBreakdown)) {
        if (!sums[name]) sums[name] = { sum: 0, count: 0 }
        sums[name].sum += (marks as number)
        sums[name].count++
      }
    }

    return Object.entries(sums)
      .map(([name, { sum, count }]) => {
        const avg = sum / count
        const pct = Math.round((avg / maxPossible) * 100)
        return {
          name: SUBJECT_LABELS[name] ?? name,
          fullName: name,
          marks: Math.round(avg * 10) / 10,
          pct,
          maxPossible,
          color: pct >= 70 ? "#22c55e" : pct >= 50 ? "#eab308" : "#ef4444",
        }
      })
      .sort((a, b) => SUBJECT_ORDER.indexOf(a.fullName) - SUBJECT_ORDER.indexOf(b.fullName))
  }, [tests])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subject-wise Performance</CardTitle>
      </CardHeader>
      <CardContent>
        {subjects.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">No mock test data yet</p>
              <p className="text-xs text-muted-foreground mt-1">Take a mock test to see your subject-wise breakdown</p>
            </div>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={subjects}
                layout="vertical"
                margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
              >
                <XAxis type="number" domain={[0, maxPossible]} hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  width={40}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="marks" barSize={16} radius={[0, 4, 4, 0]}>
                  {subjects.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default React.memo(WeakSubjects)
