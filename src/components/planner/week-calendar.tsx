"use client"

import type { Task } from "@/lib/store"
import { format, startOfWeek, addDays } from "date-fns"
import { cn } from "@/lib/utils"
import { syllabus } from "@/lib/data/syllabus"

interface WeekCalendarProps {
  tasks: Task[]
}

function getSubjectColor(subjectId: string): string {
  const sub = syllabus.find((s) => s.id === subjectId)
  return sub?.color || "#6b7280"
}

function getSubjectName(subjectId: string): string {
  const sub = syllabus.find((s) => s.id === subjectId)
  return sub?.name || subjectId
}

export function WeekCalendar({ tasks }: WeekCalendarProps) {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {days.map((day) => {
        const dayStr = format(day, "yyyy-MM-dd")
        const dayTasks = tasks.filter((t) => t.date === dayStr && !t.completed)
        const isToday = format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
        const isWeekend = day.getDay() === 0 || day.getDay() === 6

        return (
          <div
            key={dayStr}
            className={cn(
              "flex flex-col gap-1 rounded-lg border p-2 min-h-[100px]",
              isToday && "border-foreground/30 bg-muted/30",
              isWeekend && !isToday && "bg-muted/20"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-medium text-muted-foreground uppercase">
                {format(day, "EEE")}
              </span>
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-full text-[11px] font-medium",
                  isToday && "bg-foreground text-background"
                )}
              >
                {format(day, "d")}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              {dayTasks.slice(0, 4).map((task) => (
                <span
                  key={task.id}
                  className="truncate rounded px-1 py-[1px] text-[10px] font-medium text-white"
                  style={{ backgroundColor: getSubjectColor(task.subjectId) }}
                  title={task.title}
                >
                  {task.title.replace("Study ", "")}
                </span>
              ))}
              {dayTasks.length > 4 && (
                <span className="text-[10px] text-muted-foreground">
                  +{dayTasks.length - 4} more
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
