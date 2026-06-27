"use client"

import React, { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppStore } from "@/lib/store"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts"
import { subWeeks, startOfWeek, format } from "date-fns"

interface TooltipPayload {
  payload: { week: string; hours: number; sessions: number }
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border bg-card p-3 text-xs shadow-lg space-y-1">
      <p className="font-medium text-sm">Week of {d.week}</p>
      <p>{d.hours.toFixed(2)} hours</p>
      {d.sessions > 0 && <p className="text-muted-foreground">{d.sessions} sessions</p>}
    </div>
  )
}

function WeeklyStudyHours() {
  const logs = useAppStore((s) => s.logs)
  const plannerSettings = useAppStore((s) => s.plannerSettings)

  const data = useMemo(() => {
    const weekMap: Record<string, { hours: number; sessions: number }> = {}
    const today = new Date()
    for (let i = 11; i >= 0; i--) {
      const weekStart = startOfWeek(subWeeks(today, i), { weekStartsOn: 1 })
      const key = format(weekStart, "MMM d")
      weekMap[key] = { hours: 0, sessions: 0 }
    }

    for (const log of logs) {
      const d = new Date(log.date + "T00:00:00")
      const ws = startOfWeek(d, { weekStartsOn: 1 })
      const key = format(ws, "MMM d")
      if (weekMap[key]) {
        weekMap[key].hours += log.hours
        weekMap[key].sessions++
      }
    }

    const arr = Object.entries(weekMap).map(([week, vals]) => ({
      week,
      hours: Math.round(vals.hours * 10) / 10,
      sessions: vals.sessions,
    }))
    return arr
  }, [logs])

  const weeklyTarget = plannerSettings.availableHours * 7

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Study Hours</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 || data.every((d) => d.hours === 0) ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-sm text-muted-foreground">Log study sessions to see weekly trends</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={256}>
              <BarChart data={data} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" interval={0} angle={-20} textAnchor="end" height={40} />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip content={<CustomTooltip />} />
                {weeklyTarget > 0 && (
                  <ReferenceLine y={weeklyTarget} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: "Target", position: "right", fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                )}
                <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

export default React.memo(WeeklyStudyHours)
