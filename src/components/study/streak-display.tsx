"use client"

import { useMemo } from "react"
import { startOfMonth, eachDayOfInterval, format, isSameDay } from "date-fns"
import { useAppStore } from "@/lib/store"
import { Flame } from "lucide-react"
import { cn } from "@/lib/utils"

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

  const days = useMemo(() => {
    const today = new Date()
    const start = startOfMonth(today)
    return eachDayOfInterval({ start, end: today }).reverse().slice(0, 30)
  }, [])

  return (
    <div className="space-y-3 rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2">
        <Flame
          className={cn(
            "size-5",
            streak >= 7
              ? "text-orange-500"
              : streak >= 3
                ? "text-amber-500"
                : "text-muted-foreground"
          )}
        />
        <span className="text-lg font-bold tabular-nums text-foreground">
          {streak}
        </span>
        <span className="text-sm text-muted-foreground">day streak</span>
      </div>

      <div className="grid grid-cols-10 gap-1">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd")
          const hours = dateHoursMap[key] || 0
          const isTodayFlag = isSameDay(day, new Date())

          return (
            <div
              key={key}
              className={cn(
                "aspect-square rounded-sm transition-colors",
                hours >= 3
                  ? "bg-green-500"
                  : hours >= 1
                    ? "bg-green-400/60"
                    : hours > 0
                      ? "bg-green-300/30"
                      : "bg-muted",
                isTodayFlag && "ring-1 ring-foreground"
              )}
              title={`${format(day, "MMM d")}: ${hours}h`}
            />
          )
        })}
      </div>

      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-0.5">
          {["bg-muted", "bg-green-300/30", "bg-green-400/60", "bg-green-500"].map(
            (c) => (
              <div key={c} className={cn("size-3 rounded-sm", c)} />
            )
          )}
        </div>
        <span>More</span>
      </div>
    </div>
  )
}
