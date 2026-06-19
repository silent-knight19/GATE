"use client"

import { useMemo } from "react"
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, format, isSameDay, isSameMonth, isFuture, isToday,
} from "date-fns"
import { useAppStore } from "@/lib/store"
import { Flame } from "lucide-react"
import { cn } from "@/lib/utils"

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

interface StreakDisplayProps {
  streak: number
}

export function StreakDisplay({ streak }: StreakDisplayProps) {
  const logs = useAppStore((s) => s.logs)

  const dateHoursMap = useMemo(() => {
    const map: Record<string, number> = {}
    for (const log of logs) {
      map[log.date] = (map[log.date] || 0) + log.hours
    }
    return map
  }, [logs])

  const today = useMemo(() => new Date(), [])
  const monthStart = useMemo(() => startOfMonth(today), [today])
  const monthEnd = useMemo(() => endOfMonth(today), [today])
  const calStart = useMemo(() => startOfWeek(monthStart), [monthStart])
  const calEnd = useMemo(() => endOfWeek(monthEnd), [monthEnd])

  const days = useMemo(
    () => eachDayOfInterval({ start: calStart, end: calEnd }),
    [calStart, calEnd]
  )

  const monthName = useMemo(() => format(today, "MMMM yyyy"), [today])

  return (
    <div className="space-y-3 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame
            className={cn(
              "size-5",
              streak >= 7 ? "text-orange-500" : streak >= 3 ? "text-amber-500" : "text-muted-foreground"
            )}
          />
          <span className="text-lg font-bold tabular-nums text-foreground">{streak}</span>
          <span className="text-sm text-muted-foreground">day streak</span>
        </div>
        <span className="text-xs font-medium text-muted-foreground">{monthName}</span>
      </div>

      <div className="space-y-1">
        <div className="grid grid-cols-7 gap-0.5">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-[9px] font-medium text-muted-foreground/50 uppercase tracking-wider py-0.5">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd")
            const hours = dateHoursMap[key] || 0
            const inMonth = isSameMonth(day, today)
            const thisMonthFuture = inMonth && isFuture(day) && !isToday(day)

            return (
              <div
                key={key}
                className={cn(
                  "flex items-center justify-center rounded text-[11px] h-7 w-full transition-colors",
                  !inMonth && "text-muted-foreground/20",
                  thisMonthFuture && "text-muted-foreground/25 bg-muted/30",
                  !thisMonthFuture && inMonth && hours >= 3 && "bg-green-500 text-white font-medium",
                  !thisMonthFuture && inMonth && hours >= 1 && hours < 3 && "bg-green-400/60 text-white",
                  !thisMonthFuture && inMonth && hours > 0 && hours < 1 && "bg-green-300/30 text-foreground",
                  !thisMonthFuture && inMonth && hours === 0 && "text-muted-foreground/40",
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

      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-0.5">
          {[
            "bg-muted text-muted-foreground/40",
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
  )
}
