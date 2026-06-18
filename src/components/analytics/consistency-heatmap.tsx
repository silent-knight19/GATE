"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppStore } from "@/lib/store"

export default function ConsistencyHeatmap() {
  const logs = useAppStore((s) => s.logs)

  const { weeks, maxHours, totalDays, activeDays } = useMemo(() => {
    const dayMap: Record<string, number> = {}
    for (const log of logs) {
      dayMap[log.date] = (dayMap[log.date] || 0) + log.hours
    }

    const end = new Date()
    const start = new Date(end)
    start.setDate(start.getDate() - 83)

    const weeks: { days: { date: string; hours: number; day: number }[] }[] = []
    const current = new Date(start)
    let maxHours = 0
    let totalDays = 0
    let activeDays = 0

    while (current <= end) {
      const dateStr = current.toISOString().split("T")[0]
      const hours = dayMap[dateStr] || 0
      if (hours > maxHours) maxHours = hours
      totalDays++
      if (hours > 0) activeDays++

      const dayOfWeek = current.getDay()
      if (dayOfWeek === 0) {
        weeks.push({ days: [] })
      }
      if (weeks.length === 0) {
        weeks.push({ days: [] })
      }
      weeks[weeks.length - 1].days.push({ date: dateStr, hours, day: dayOfWeek })
      current.setDate(current.getDate() + 1)
    }

    return { weeks, maxHours, totalDays, activeDays }
  }, [logs])

  function getOpacity(hours: number): string {
    if (hours === 0) return "bg-secondary"
    const intensity = Math.min(hours / (maxHours || 1), 1)
    if (intensity < 0.25) return "bg-primary/20"
    if (intensity < 0.5) return "bg-primary/40"
    if (intensity < 0.75) return "bg-primary/60"
    return "bg-primary/80"
  }

  const dayLabels = ["", "Mon", "", "Wed", "", "Fri", ""]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Study Consistency</span>
          <span className="text-sm font-normal text-muted-foreground">
            {activeDays}/{totalDays} days active
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm text-muted-foreground">Log study sessions to see consistency</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex gap-0.5">
              <div className="mr-1 flex flex-col gap-0.5">
                {dayLabels.map((label, i) => (
                  <div key={i} className="h-3 text-[9px] text-muted-foreground leading-3">
                    {label}
                  </div>
                ))}
              </div>
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-0.5">
                  {week.days.map((day) => (
                    <div
                      key={day.date}
                      className={`size-3 rounded-sm ${getOpacity(day.hours)}`}
                      title={`${day.date}: ${day.hours}h`}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
              <span>Less</span>
              <div className="size-3 rounded-sm bg-secondary" />
              <div className="size-3 rounded-sm bg-primary/20" />
              <div className="size-3 rounded-sm bg-primary/40" />
              <div className="size-3 rounded-sm bg-primary/60" />
              <div className="size-3 rounded-sm bg-primary/80" />
              <span>More</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
