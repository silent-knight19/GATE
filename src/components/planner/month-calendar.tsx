"use client"

import type { DailyTaskGroup } from "@/lib/store"
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths,
} from "date-fns"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface MonthCalendarProps {
  groups: DailyTaskGroup[]
  onSelectDay: (date: string) => void
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export function MonthCalendar({ groups, onSelectDay }: MonthCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const isCurrentMonth = isSameMonth(new Date(), currentDate)

  return (
    <div className="space-y-3">
      {/* Navigation Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setCurrentDate((d) => subMonths(d, 1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm font-medium text-foreground min-w-[120px] text-center">
            {format(currentDate, "MMMM yyyy")}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setCurrentDate((d) => addMonths(d, 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
        {!isCurrentMonth && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
            className="text-xs"
          >
            Today
          </Button>
        )}
      </div>

      {/* Grid */}
      <div className="space-y-2">
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-[10px] font-medium text-muted-foreground/50 uppercase py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dayStr = format(day, "yyyy-MM-dd")
            const group = groups.find((g) => g.date === dayStr)
            const inMonth = isSameMonth(day, currentDate)
            const isTodayDay = isToday(day)
            const completedCount = group?.tasks.filter((t) => t.completed).length || 0
            const totalCount = group?.tasks.length || 0

            return (
              <button
                key={dayStr}
                onClick={() => onSelectDay(dayStr)}
                disabled={!inMonth}
                className={cn(
                  "flex flex-col items-center justify-center rounded-lg border p-1.5 min-h-[56px] transition-colors",
                  !inMonth && "border-transparent text-muted-foreground/15",
                  inMonth && !isTodayDay && "border-border hover:bg-muted/40",
                  isTodayDay && "border-foreground/40 bg-muted/30",
                )}
              >
                <span className={cn(
                  "text-xs font-medium",
                  isTodayDay ? "text-foreground" : inMonth ? "text-muted-foreground" : ""
                )}>
                  {format(day, "d")}
                </span>
                {totalCount > 0 && (
                  <div className="flex items-center gap-0.5 mt-1">
                    {completedCount === totalCount ? (
                      <span className="size-1.5 rounded-full bg-green-500" />
                    ) : completedCount > 0 ? (
                      <span className="size-1.5 rounded-full bg-amber-500" />
                    ) : (
                      <span className="size-1.5 rounded-full bg-muted-foreground/30" />
                    )}
                    <span className="text-[8px] text-muted-foreground/60">{totalCount}</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
