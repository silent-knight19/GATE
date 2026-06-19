"use client"

import React, { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppStore } from "@/lib/store"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

const bins = [
  { min: 0, max: 20, label: "0-20" },
  { min: 21, max: 40, label: "21-40" },
  { min: 41, max: 60, label: "41-60" },
  { min: 61, max: 80, label: "61-80" },
  { min: 81, max: 100, label: "81-100" },
]

interface TooltipPayloadEntry {
  payload: { range: string; count: number }
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayloadEntry[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border bg-card p-2 text-xs shadow-lg">
      <p className="font-medium">{d.range}</p>
      <p>{d.count} test{d.count !== 1 ? "s" : ""}</p>
    </div>
  )
}

function ScoreDistribution() {
  const tests = useAppStore((s) => s.tests)

  const data = useMemo(() => {
    const counts = bins.map((bin) => ({
      range: bin.label,
      count: tests.filter((t) => t.marksObtained >= bin.min && t.marksObtained <= bin.max).length,
    }))
    return counts
  }, [tests])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Score Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {tests.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-sm text-muted-foreground">Take mock tests to see score distribution</p>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default React.memo(ScoreDistribution)
