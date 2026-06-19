"use client"

import React, { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppStore } from "@/lib/store"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { subDays, format } from "date-fns"

interface TooltipPayload {
  payload: { date: string; planned: number; completed: number; pct: number }
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border bg-card p-3 text-xs shadow-lg space-y-1">
      <p className="font-medium text-sm">{d.date}</p>
      <p className="text-muted-foreground">Planned: {d.planned.toFixed(1)}h</p>
      <p className="text-green-500">Completed: {d.completed.toFixed(1)}h</p>
      <p>Completion: {d.pct}%</p>
    </div>
  )
}

function TaskCompletionRate() {
  const dailyTasks = useAppStore((s) => s.dailyTasks)

  const data = useMemo(() => {
    const today = new Date()
    const result: { date: string; planned: number; completed: number; pct: number }[] = []
    for (let i = 13; i >= 0; i--) {
      const d = subDays(today, i)
      const dateStr = format(d, "yyyy-MM-dd")
      const group = dailyTasks.find((g) => g.date === dateStr)
      const planned = group?.totalHours || 0
      const completed = group?.completedHours || 0
      result.push({
        date: format(d, "MMM d"),
        planned: Math.round(planned * 10) / 10,
        completed: Math.round(completed * 10) / 10,
        pct: planned > 0 ? Math.round((completed / planned) * 100) : 0,
      })
    }
    return result
  }, [dailyTasks])

  const hasData = data.some((d) => d.planned > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Completion (14 days)</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-sm text-muted-foreground">Generate daily tasks in Planner to track completion</p>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" interval={1} />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="completed" stackId="a" fill="#22c55e" barSize={16} radius={[0, 0, 0, 0]} />
                <Bar dataKey="planned" stackId="a" fill="hsl(var(--muted))" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="size-2.5 rounded bg-green-500" /> Completed</span>
          <span className="flex items-center gap-1"><span className="size-2.5 rounded bg-muted" /> Planned</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default React.memo(TaskCompletionRate)
