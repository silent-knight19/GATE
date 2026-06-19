"use client"

import React, { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppStore } from "@/lib/store"
import { calculateBurnoutRisk } from "@/lib/calculators"

function BurnoutIndicator() {
  const logs = useAppStore((s) => s.logs)
  const tests = useAppStore((s) => s.tests)

  const result = useMemo(() => {
    const dailyHours: Record<string, number> = {}
    for (const log of logs) {
      dailyHours[log.date] = (dailyHours[log.date] || 0) + log.hours
    }

    const sortedDates = Object.keys(dailyHours).sort().reverse()
    let highIntensityStreak = 0
    const today = new Date()
    for (let i = 0; i < sortedDates.length; i++) {
      const expected = new Date(today)
      expected.setDate(expected.getDate() - i)
      const expectedStr = expected.toISOString().split("T")[0]
      if (sortedDates[i] !== expectedStr) break
      const hours = dailyHours[sortedDates[i]]
      if (hours >= 8) {
        highIntensityStreak++
      } else if (hours > 0) {
        break
      }
    }

    const mockTrend = [...tests].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((t) => t.marksObtained)
    const avgHours = logs.length > 0
      ? Math.round((logs.reduce((s, l) => s + l.hours, 0) / logs.length) * 10) / 10
      : 0

    return calculateBurnoutRisk(highIntensityStreak, mockTrend, avgHours)
  }, [logs, tests])

  const colorMap: Record<string, string> = {
    low: "#22c55e",
    medium: "#eab308",
    high: "#ef4444",
  }

  const bgMap: Record<string, string> = {
    low: "bg-green-500/10 text-green-600",
    medium: "bg-yellow-500/10 text-yellow-600",
    high: "bg-red-500/10 text-red-600",
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Burnout Risk</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <svg width="80" height="80" className="-rotate-90">
              <circle cx="40" cy="40" r="32" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
              <circle
                cx="40"
                cy="40"
                r="32"
                fill="none"
                stroke={colorMap[result.risk]}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 32}
                strokeDashoffset={2 * Math.PI * 32 * (1 - result.score / 100)}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold" style={{ color: colorMap[result.risk] }}>
                {result.score}
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${bgMap[result.risk]}`}>
              {result.risk.charAt(0).toUpperCase() + result.risk.slice(1)}
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">{result.recommendation}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default React.memo(BurnoutIndicator)
