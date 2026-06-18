"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppStore } from "@/lib/store"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"

const COLORS = ["#ef4444", "#eab308", "#3b82f6", "#22c55e", "#a855f7", "#f97316"]

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border bg-card p-2 text-xs shadow-lg">
      <p className="font-medium">{d.name}</p>
      <p>{d.value} errors ({d.percent}%)</p>
    </div>
  )
}

export default function ErrorAnalysis() {
  const tests = useAppStore((s) => s.tests)

  const data = useMemo(() => {
    const errorCounts: Record<string, number> = {}
    for (const test of tests) {
      for (const error of test.errorAnalysis) {
        errorCounts[error.errorType] = (errorCounts[error.errorType] || 0) + error.count
      }
    }
    const total = Object.values(errorCounts).reduce((s, c) => s + c, 0)
    return Object.entries(errorCounts)
      .map(([name, value]) => ({ name, value, percent: total > 0 ? Math.round((value / total) * 100) : 0 }))
      .sort((a, b) => b.value - a.value)
  }, [tests])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Error Type Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-sm text-muted-foreground">Analyze mock test errors to see patterns</p>
          </div>
        ) : (
          <div className="flex h-64 items-center gap-4">
            <div className="h-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" paddingAngle={2}>
                    {data.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5">
              {data.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2 text-xs">
                  <div className="size-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-muted-foreground">{entry.name}</span>
                  <span className="font-medium tabular-nums">{entry.percent}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
