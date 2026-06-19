"use client"

import React, { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppStore } from "@/lib/store"
import { syllabus } from "@/lib/data/syllabus"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

interface TooltipPayload {
  payload: { name: string; completed: number; inProgress: number; notStarted: number; mastered: number }
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border bg-card p-3 text-xs shadow-lg space-y-1">
      <p className="font-medium text-sm">{d.name}</p>
      <p className="text-green-500">Completed: {d.completed}</p>
      <p className="text-blue-500">Mastered: {d.mastered}</p>
      <p className="text-amber-500">In Progress: {d.inProgress}</p>
      <p className="text-muted-foreground">Not Started: {d.notStarted}</p>
    </div>
  )
}

function SubjectProgressDetailed() {
  const topicsProgress = useAppStore((s) => s.topicsProgress)

  const data = useMemo(() => {
    return syllabus.map((sub) => {
      let completed = 0, mastered = 0, inProgress = 0, notStarted = 0
      for (const topic of sub.topics) {
        const status = topicsProgress[topic.id]
        if (status === "completed") completed++
        else if (status === "mastered") mastered++
        else if (status === "in_progress") inProgress++
        else notStarted++
      }
      return {
        name: sub.shortName,
        completed,
        mastered,
        inProgress,
        notStarted,
        total: sub.topics.length,
        pct: sub.topics.length > 0 ? Math.round(((completed + mastered) / sub.topics.length) * 100) : 0,
        color: sub.color,
      }
    }).sort((a, b) => b.pct - a.pct)
  }, [topicsProgress])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subject Progress</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-sm text-muted-foreground">No syllabus data</p>
          </div>
        ) : (
          <div className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" domain={[0, 'dataMax']} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={110} stroke="hsl(var(--muted-foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="notStarted" stackId="a" fill="hsl(var(--muted))" barSize={24} radius={[0, 0, 0, 0]} />
                <Bar dataKey="inProgress" stackId="a" fill="#eab308" radius={[0, 0, 0, 0]} />
                <Bar dataKey="completed" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
                <Bar dataKey="mastered" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="size-2.5 rounded bg-muted" /> Not started</span>
          <span className="flex items-center gap-1"><span className="size-2.5 rounded bg-yellow-500" /> In progress</span>
          <span className="flex items-center gap-1"><span className="size-2.5 rounded bg-green-500" /> Completed</span>
          <span className="flex items-center gap-1"><span className="size-2.5 rounded bg-blue-500" /> Mastered</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default React.memo(SubjectProgressDetailed)
