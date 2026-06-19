"use client"

import React, { useMemo } from "react"
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameDay, isSameMonth, isFuture, isToday,
  subDays,
} from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function ConsistencyHeatmap() {
  const logs = useAppStore((s) => s.logs)

  const { dateHoursMap, totalDays, activeDays, months } = useMemo(() => {
    const map: Record<string, number> = {}
    for (const log of logs) {
      map[log.date] = (map[log.date] || 0) + log.hours
    }

    const today = new Date()
    const startDate = subDays(today, 44)

    const months: { name: string; days: Date[] }[] = []
    let m = startOfMonth(startDate)
    const last = endOfMonth(today)
    while (m <= last) {
      const monthEnd = endOfMonth(m)
      const monthStart = startOfMonth(m)
      const calStart = startOfWeek(monthStart)
      const calEnd = endOfWeek(monthEnd)
      const days = eachDayOfInterval({ start: calStart, end: calEnd }).filter(
        (d) => d >= startDate && d <= today,
      )
      if (days.length > 0) {
        months.push({ name: format(m, "MMM yyyy"), days })
      }
      m = new Date(m.getFullYear(), m.getMonth() + 1, 1)
    }

    let totalDays = 0
    let activeDays = 0
    const d = new Date(startDate)
    while (d <= today) {
      const key = format(d, "yyyy-MM-dd")
      totalDays++
      if ((map[key] || 0) > 0) activeDays++
      d.setDate(d.getDate() + 1)
    }

    return { dateHoursMap: map, totalDays, activeDays, months }
  }, [logs])

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
          <div className="space-y-4">
            {months.map((month) => (
              <div key={month.name} className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground">{month.name}</div>
                <div className="grid grid-cols-7 gap-0.5">
                  {WEEKDAYS.map((d) => (
                    <div
                      key={d}
                      className="text-center text-[9px] font-medium text-muted-foreground/50 uppercase tracking-wider py-0.5"
                    >
                      {d}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-0.5">
                  {month.days.map((day) => {
                    const key = format(day, "yyyy-MM-dd")
                    const hours = dateHoursMap[key] || 0
                    const thisMonthFuture = isFuture(day) && !isToday(day)

                    return (
                      <div
                        key={key}
                        className={cn(
                          "flex items-center justify-center rounded text-[11px] h-7 w-full transition-colors",
                          !isSameMonth(day, new Date()) && "text-muted-foreground/20",
                          thisMonthFuture && "text-muted-foreground/25 bg-muted/30",
                          !thisMonthFuture && hours >= 3 && "bg-green-500 text-white font-medium",
                          !thisMonthFuture && hours >= 1 && hours < 3 && "bg-green-400/60 text-white",
                          !thisMonthFuture && hours > 0 && hours < 1 && "bg-green-300/30 text-foreground",
                          !thisMonthFuture && hours === 0 && !isToday(day) && "text-muted-foreground/30",
                          isToday(day) && "ring-1 ring-inset ring-foreground/40",
                        )}
                        title={`${format(day, "MMM d")}: ${hours.toFixed(2)}h`}
                      >
                        {format(day, "d")}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-0.5">
                {[
                  "text-muted-foreground/30 bg-muted/0",
                  "bg-green-300/30 text-foreground",
                  "bg-green-400/60 text-white",
                  "bg-green-500 text-white font-medium",
                ].map((c) => (
                  <div key={c} className={cn("size-3 rounded-sm", c)} />
                ))}
              </div>
              <span>More</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default React.memo(ConsistencyHeatmap)
