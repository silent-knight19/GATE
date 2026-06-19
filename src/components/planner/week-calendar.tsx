"use client"

import type { DailyTaskGroup, Task } from "@/lib/store"
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks, isSameWeek } from "date-fns"
import { cn } from "@/lib/utils"
import { syllabus } from "@/lib/data/syllabus"
import { CheckCircle2, Circle, Plus, ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface WeekCalendarProps {
  groups: DailyTaskGroup[]
  onToggleTask: (date: string, taskId: string) => void
  onSelectDay: (date: string) => void
  onAddTask: (date: string) => void
  onEditTask: (date: string, task: Task) => void
  onDeleteTask: (date: string, taskId: string) => void
}

function getSubjectColor(subjectId: string): string {
  const sub = syllabus.find((s) => s.id === subjectId)
  return sub?.color || "#6b7280"
}

export function WeekCalendar({ groups, onToggleTask, onSelectDay, onAddTask, onEditTask, onDeleteTask }: WeekCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const isCurrentWeek = isSameWeek(new Date(), currentDate, { weekStartsOn: 1 })

  return (
    <div className="space-y-3">
      {/* Navigation Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setCurrentDate((d) => subWeeks(d, 1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm font-medium text-foreground min-w-[140px] text-center">
            {format(weekStart, "MMM d")} – {format(addDays(weekStart, 6), "MMM d, yyyy")}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setCurrentDate((d) => addWeeks(d, 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
        {!isCurrentWeek && (
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
      <div className="grid grid-cols-7 gap-1.5 min-w-[700px]">
        {days.map((day) => {
          const dayStr = format(day, "yyyy-MM-dd")
          const group = groups.find((g) => g.date === dayStr)
          const isToday = isSameDay(day, new Date())
          const isWeekend = day.getDay() === 0 || day.getDay() === 6
          
          const tasks = [...(group?.tasks || [])].sort((a, b) => {
            const timeA = a.startTime || "00:00"
            const timeB = b.startTime || "00:00"
            return timeA.localeCompare(timeB)
          })

          return (
            <div
              key={dayStr}
              className={cn(
                "group/day flex flex-col rounded-lg border min-h-[280px] transition-colors hover:border-foreground/20",
                isToday && "border-foreground/30 bg-muted/20",
                isWeekend && !isToday && "bg-muted/10"
              )}
            >
              <button
                onClick={() => onSelectDay(dayStr)}
                className="flex items-center justify-between px-2 py-1.5 border-b border-border sticky top-0 bg-card z-10 transition-colors hover:bg-muted/50 rounded-t-lg"
              >
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
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
              </button>

              <div className="flex flex-col gap-1 p-1 flex-1 relative">
                {tasks.length === 0 ? (
                  <div className="flex items-center justify-center flex-1 text-[10px] text-muted-foreground/30 italic">
                    No tasks
                  </div>
                ) : (
                  <div className="space-y-1">
                    {tasks.map((task) => {
                      // Compact time display for week view
                      let timeDisplay = ""
                      if (task.startTime && task.endTime) {
                        timeDisplay = `${task.startTime.replace(":00", "")}-${task.endTime.replace(":00", "")}`
                      } else if (task.timeSlot) {
                        timeDisplay = task.timeSlot.slice(0, 3)
                      }
                      
                      return (
                        <div
                          key={task.id}
                          className={cn(
                            "group/task relative flex flex-col gap-0.5 rounded border border-border/50 bg-background/50 px-1.5 py-1 w-full text-left transition-colors hover:border-border hover:bg-muted",
                            task.completed && "opacity-40 border-transparent bg-transparent"
                          )}
                          title={`${task.title} (${timeDisplay})`}
                        >
                          <div className="flex items-start gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onToggleTask(dayStr, task.id)
                              }}
                              className="shrink-0 mt-0.5"
                            >
                              {task.completed ? (
                                <CheckCircle2 className="size-2.5 text-green-500" />
                              ) : (
                                <Circle className="size-2.5 text-muted-foreground/40" />
                              )}
                            </button>
                            <span
                              className="truncate text-[10px] font-medium leading-tight"
                              style={{ color: getSubjectColor(task.subjectId) }}
                            >
                              {task.title.replace(/^(Study |Revise )/, "")}
                            </span>
                          </div>
                          {timeDisplay && (
                            <span className="text-[8px] text-muted-foreground ml-3.5">
                              {timeDisplay}
                            </span>
                          )}

                          {/* Hover Actions */}
                          <div className="absolute right-1 top-1 bottom-1 flex flex-col justify-center gap-1 opacity-0 transition-opacity group-hover/task:opacity-100 bg-muted/80 backdrop-blur-sm rounded px-0.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onEditTask(dayStr, task)
                              }}
                              className="text-muted-foreground hover:text-foreground"
                              title="Edit task"
                            >
                              <Pencil className="size-2.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                onDeleteTask(dayStr, task.id)
                              }}
                              className="text-muted-foreground hover:text-red-500"
                              title="Delete task"
                            >
                              <Trash2 className="size-2.5" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Add button overlay */}
                <div className="absolute bottom-6 right-2 opacity-0 transition-opacity group-hover/day:opacity-100">
                   <button
                    onClick={() => onAddTask(dayStr)}
                    className="flex size-6 items-center justify-center rounded-full bg-foreground text-background shadow-md hover:scale-105 transition-transform"
                    title="Add task to this day"
                   >
                     <Plus className="size-3" />
                   </button>
                </div>

                {group && group.tasks.length > 0 && (
                  <div className="mt-auto pt-1 border-t border-border/40">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[9px] text-muted-foreground/60">
                        {group.completedHours.toFixed(2)}/{group.totalHours.toFixed(2)}h
                      </span>
                      <span className={cn(
                        "text-[9px] font-medium",
                        group.completedHours >= group.totalHours
                          ? "text-green-500"
                          : group.completedHours > 0
                            ? "text-amber-500"
                            : "text-muted-foreground/40"
                      )}>
                        {group.totalHours > 0
                          ? Math.round((group.completedHours / group.totalHours) * 100)
                          : 0}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
