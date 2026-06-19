"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppStore } from "@/lib/store"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { subWeeks, startOfWeek, format } from "date-fns"

interface TooltipPayload {
  payload: { week: string; planned: number; studied: number; pct: number }
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border bg-card p-3 text-xs shadow-lg space-y-1">
      <p className="font-medium text-sm">Week of {d.week}</p>
      <p className="text-muted-foreground">Planned: {d.planned.toFixed(1)}h</p>
      <p className="text-green-500">Studied: {d.studied.toFixed(1)}h</p>
      <p>Adherence: {d.pct}%</p>
    </div>
  )
}

export default function PlannedVsActual() {
  const dailyTasks = useAppStore((s) => s.dailyTasks)
  const logs = useAppStore((s) => s.logs)

  const data = useMemo(() => {
    const weekPlanned: Record<string, number> = {}
    for (const g of dailyTasks) {
      const d = new Date(g.date + "T00:00:00")
      const ws = startOfWeek(d, { weekStartsOn: 1 })
      const key = format(ws, "MMM d")
      weekPlanned[key] = (weekPlanned[key] || 0) + g.totalHours
    }

    const weekStudied: Record<string, number> = {}
    for (const log of logs) {
      const d = new Date(log.date + "T00:00:00")
      const ws = startOfWeek(d, { weekStartsOn: 1 })
      const key = format(ws, "MMM d")
      weekStudied[key] = (weekStudied[key] || 0) + log.hours
    }

    const today = new Date()
    const allKeys = new Set([...Object.keys(weekPlanned), ...Object.keys(weekStudied)])
    for (let i = 3; i >= 0; i--) {
      const ws = startOfWeek(subWeeks(today, i), { weekStartsOn: 1 })
      allKeys.add(format(ws, "MMM d"))
    }

    return Array.from(allKeys).sort((a, b) => {
      const pa = new Date(a + " 2026")
      const pb = new Date(b + " 2026")
      return pa.getTime() - pb.getTime()
    }).map((week) => {
      const planned = weekPlanned[week] || 0
      const studied = weekStudied[week] || 0
      return {
        week,
        planned: Math.round(planned * 10) / 10,
        studied: Math.round(studied * 10) / 10,
        pct: planned > 0 ? Math.round((studied / planned) * 100) : 0,
      }
    })
  }, [dailyTasks, logs])

  const hasData = data.some((d) => d.planned > 0 || d.studied > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Planned vs Studied</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-sm text-muted-foreground">Generate plans and log study time to see comparison</p>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="planned" fill="hsl(var(--muted))" barSize={20} radius={[3, 3, 0, 0]} />
                <Bar dataKey="studied" fill="hsl(var(--primary))" barSize={20} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="size-2.5 rounded bg-muted" /> Planned hours</span>
          <span className="flex items-center gap-1"><span className="size-2.5 rounded bg-primary" /> Studied hours</span>
        </div>
      </CardContent>
    </Card>
  )
}
