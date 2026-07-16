"use client"

import type { DailyTaskGroup, Task } from "@/lib/store"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { syllabus } from "@/lib/data/syllabus"
import { CheckCircle2, Circle, X, Pencil, Trash2, Plus, Check, RefreshCw, AlertCircle } from "lucide-react"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"

interface DayViewProps {
  group: DailyTaskGroup | undefined
  date: string
  onToggleTask: (date: string, taskId: string) => void
  onAddTask: () => void
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  onRetrySync?: (taskId: string) => void
  onClose: () => void
}

function getSubjectMeta(subjectId: string) {
  const sub = syllabus.find((s) => s.id === subjectId)
  return { name: sub?.shortName || subjectId, color: sub?.color || "#6b7280" }
}

export function DayView({ group, date, onToggleTask, onAddTask, onEditTask, onDeleteTask, onRetrySync, onClose }: DayViewProps) {
  const dayDate = new Date(date + "T00:00:00")
  const dayName = format(dayDate, "EEEE, MMMM d")

  const { tasks, completedHours, totalHours } = useMemo(() => {
    const raw = group?.tasks || []
    const sorted = [...raw].sort((a, b) => {
      const timeA = a.startTime || "00:00"
      const timeB = b.startTime || "00:00"
      return timeA.localeCompare(timeB)
    })
    return {
      tasks: sorted,
      completedHours: sorted.filter((t) => t.completed).reduce((s, t) => s + t.estimatedHours, 0),
      totalHours: sorted.reduce((s, t) => s + t.estimatedHours, 0),
    }
  }, [group])

  return (
    <div className="rounded-xl border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{dayName}</h3>
          <p className="text-xs text-muted-foreground">
            {completedHours.toFixed(1)} / {totalHours.toFixed(1)}h planned
          </p>
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onClose}>
          <X className="size-4" />
        </Button>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex justify-end mb-2">
          <Button variant="outline" size="sm" onClick={onAddTask}>
            <Plus className="size-3.5 mr-1" />
            Add Task
          </Button>
        </div>

        {tasks.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No tasks planned for this day.
          </p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => {
              const subject = getSubjectMeta(task.subjectId)
              
              let timeDisplay = ""
              if (task.startTime && task.endTime) {
                timeDisplay = `${task.startTime} – ${task.endTime}`
              } else if (task.timeSlot) {
                timeDisplay = task.timeSlot.charAt(0).toUpperCase() + task.timeSlot.slice(1)
              }

              return (
                <div
                  key={task.id}
                  className={cn(
                    "group flex items-center gap-3 w-full rounded-lg border border-transparent bg-background/50 px-3 py-2.5 transition-all hover:border-border",
                    task.completed && "opacity-50"
                  )}
                >
                  <button onClick={() => onToggleTask(date, task.id)} className="shrink-0 mt-0.5 self-start">
                    {task.completed ? (
                      <CheckCircle2 className="size-4 text-green-500" />
                    ) : (
                      <Circle className="size-4 text-muted-foreground/40" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <p className={cn(
                        "text-sm font-medium truncate",
                        task.completed && "line-through text-muted-foreground"
                      )}>
                        {task.title}
                      </p>
                      <span className="shrink-0 font-mono text-[11px] font-medium text-muted-foreground">
                        {timeDisplay}
                        <span className="ml-2 text-foreground/40 font-normal">({task.estimatedHours.toFixed(2)}h)</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className="inline-flex items-center gap-1 rounded border px-1 py-[1px] text-[10px] font-medium"
                        style={{
                          borderColor: subject.color + "40",
                          backgroundColor: subject.color + "15",
                          color: subject.color,
                        }}
                      >
                        <span className="size-1.5 rounded-full" style={{ backgroundColor: subject.color }} />
                        {subject.name}
                      </span>
                      <span className={cn(
                        "rounded px-1 py-[1px] text-[10px] font-medium",
                        task.priority === "high" && "text-red-500 bg-red-500/10",
                        task.priority === "medium" && "text-amber-500 bg-amber-500/10",
                        task.priority === "low" && "text-green-500 bg-green-500/10",
                      )}>
                        {task.priority}
                      </span>
                      <span className={cn(
                        "rounded px-1 py-[1px] text-[10px] font-medium",
                        task.type === "revision" && "text-purple-500 bg-purple-500/10",
                        task.type === "study" && "text-blue-500 bg-blue-500/10",
                        task.type === "practice" && "text-cyan-500 bg-cyan-500/10",
                        task.type === "mock" && "text-orange-500 bg-orange-500/10",
                      )}>
                        {task.type}
                      </span>
                    </div>
                  </div>

                  {/* Sync status badge */}
                  <div className="shrink-0 self-start mt-1 mr-1">
                    {task.syncStatus === 'pending' && (
                      <span title="Syncing..."><RefreshCw className="size-3 text-muted-foreground animate-spin" /></span>
                    )}
                    {task.syncStatus === 'synced' && (
                      <span title="Synced to Google Calendar"><Check className="size-3 text-green-500" /></span>
                    )}
                    {task.syncStatus === 'error' && onRetrySync && (
                      <button
                        onClick={() => onRetrySync(task.id)}
                        className="group relative"
                        title={task.syncError || "Sync failed — click to retry"}
                      >
                        <AlertCircle className="size-3 text-red-500 hover:text-red-400 transition-colors" />
                      </button>
                    )}
                  </div>

                  {/* Hover Actions */}
                  <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 self-start mt-0.5">
                    <button
                      onClick={() => onEditTask(task)}
                      className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      title="Edit task"
                    >
                      <Pencil className="size-3" />
                    </button>
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                      title="Delete task"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
