"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppStore } from "@/lib/store"
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
} from "recharts"

interface TooltipPayloadEntry {
  payload: { date: string; score: number; source: string }
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadEntry[] }) {
  if (!active || !payload?.length) return null
  const entry = payload[0].payload
  return (
    <div className="rounded-lg border bg-card p-3 text-sm shadow-lg">
      <p className="font-medium">{entry.date}</p>
      <p className="text-muted-foreground">Score: <span className="font-medium text-foreground">{entry.score}%</span></p>
      <p className="text-xs text-muted-foreground">{entry.source}</p>
    </div>
  )
}

export default function PerformanceChart() {
  const tests = useAppStore((s) => s.tests)
  const user = useAppStore((s) => s.user)

  const data = useMemo(() =>
    [...tests]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((m) => ({
        date: new Date(m.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        score: m.marksObtained,
        source: m.source,
      })),
    [tests],
  )

  const targetScore = user.targetScore

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mock Test Performance</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">No mock tests logged yet</p>
              <p className="text-xs text-muted-foreground mt-1">Log your first test to see your performance trend</p>
            </div>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip content={<CustomTooltip />} />
                {targetScore > 0 && (
                  <ReferenceLine y={targetScore} stroke="#22c55e" strokeDasharray="6 4" strokeWidth={1.5}
                    label={{ value: `Target ${targetScore}%`, position: "right", fontSize: 10, fill: "#22c55e" }}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#scoreGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
