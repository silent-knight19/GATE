"use client"

import React, { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppStore } from "@/lib/store"
import { syllabus } from "@/lib/data/syllabus"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts"

interface TooltipPayload {
  payload: { name: string; errors: number; tests: number }
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border bg-card p-3 text-xs shadow-lg space-y-1">
      <p className="font-medium text-sm">{d.name}</p>
      <p className="text-muted-foreground">{d.errors} errors across {d.tests} tests</p>
    </div>
  )
}

function SubjectErrorBreakdown() {
  const tests = useAppStore((s) => s.tests)

  const data = useMemo(() => {
    const subjectMap: Record<string, { errors: number; tests: Set<string> }> = {}
    for (const subject of syllabus) {
      subjectMap[subject.id] = { errors: 0, tests: new Set() }
    }

    for (const test of tests) {
      if (test.subjectBreakdown) {
        for (const [subjectId, marks] of Object.entries(test.subjectBreakdown)) {
          if (!subjectMap[subjectId]) continue
          const maxPerSubject = test.totalMarks / Object.keys(test.subjectBreakdown).length
          const errors = Math.max(0, Math.round((maxPerSubject - marks) / 2))
          subjectMap[subjectId].errors += errors
          subjectMap[subjectId].tests.add(test.id)
        }
      }
    }

    return Object.entries(subjectMap)
      .map(([id, val]) => {
        const sub = syllabus.find((s) => s.id === id)
        return {
          name: sub?.shortName || id,
          errors: val.errors,
          tests: val.tests.size,
          color: sub?.color || "#6b7280",
        }
      })
      .filter((s) => s.tests > 0)
      .sort((a, b) => b.errors - a.errors)
  }, [tests])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Errors by Subject</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-sm text-muted-foreground">Take mock tests with subject breakdown to see errors by subject</p>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} stroke="hsl(var(--muted-foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="errors" barSize={20} radius={[0, 4, 4, 0]}>
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
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

export default React.memo(SubjectErrorBreakdown)
