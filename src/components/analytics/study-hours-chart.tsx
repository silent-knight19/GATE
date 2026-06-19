"use client"

import React, { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppStore } from "@/lib/store"
import { syllabus } from "@/lib/data/syllabus"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: { subject: string; hours: number; sessions: number } }[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border bg-card p-2 text-xs shadow-lg">
      <p className="font-medium">{d.subject}</p>
      <p>{d.hours.toFixed(2)} hours studied</p>
      {d.sessions > 0 && <p className="text-muted-foreground">{d.sessions} sessions</p>}
    </div>
  )
}

function StudyHoursChart() {
  const logs = useAppStore((s) => s.logs)

  const data = useMemo(() => {
    const subjectMap: Record<string, { hours: number; sessions: number }> = {}
    for (const log of logs) {
      const subject = syllabus.find((s) => s.id === log.subjectId)
      const name = subject?.shortName ?? log.subjectId
      if (!subjectMap[name]) subjectMap[name] = { hours: 0, sessions: 0 }
      subjectMap[name].hours += log.hours
      subjectMap[name].sessions++
    }
    return Object.entries(subjectMap)
      .map(([subject, vals]) => ({
        subject,
        hours: Math.round(vals.hours * 10) / 10,
        sessions: vals.sessions,
      }))
      .sort((a, b) => b.hours - a.hours)
  }, [logs])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Study Hours by Subject</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-sm text-muted-foreground">Log study sessions to see hours by subject</p>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="subject" tick={{ fontSize: 11 }} width={90} stroke="hsl(var(--muted-foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default React.memo(StudyHoursChart)
