"use client"

import { useMemo } from "react"
import type { Task, DailyTaskGroup } from "@/lib/store"
import { cn } from "@/lib/utils"
import { syllabus } from "@/lib/data/syllabus"
import { CheckCircle2, Circle, Plus, Trash2, Pencil } from "lucide-react"
import { format } from "date-fns"

interface TodayHeroProps {
  group: DailyTaskGroup | undefined
  todayStr: string
  onToggleTask: (taskId: string) => void
  onAddTask: () => void
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
}

/**
 * Returns the subject name and color for a given subject ID.
 */
function getSubjectMeta(subjectId: string) {
  const sub = syllabus.find((s) => s.id === subjectId)
  return { name: sub?.shortName || subjectId, color: sub?.color || "#6b7280" }
}

/**
 * Full-width "Today" hero section with progress ring and
 * chronological list of tasks with exact times.
 */
export function TodayHero({
  group,
  todayStr,
  onToggleTask,
  onAddTask,
  onEditTask,
  onDeleteTask,
}: TodayHeroProps) {
  const tasks = useMemo(() => {
    const raw = group?.tasks || []
    return [...raw].sort((a, b) => {
      const timeA = a.startTime || "00:00"
      const timeB = b.startTime || "00:00"
      return timeA.localeCompare(timeB)
    })
  }, [group])

  const completed = tasks.filter((t) => t.completed).length
  const total = tasks.length
  const completedHours = tasks.filter((t) => t.completed).reduce((s, t) => s + t.estimatedHours, 0)
  const totalHours = tasks.reduce((s, t) => s + t.estimatedHours, 0)

  // Progress ring values
  const progressPercent = total > 0 ? (completed / total) * 100 : 0
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference

  const dayDate = new Date(todayStr + "T00:00:00")

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border px-5 py-4">
        {/* Progress Ring */}
        <div className="relative flex size-20 shrink-0 items-center justify-center">
          <svg className="size-20 -rotate-90" viewBox="0 0 80 80">
            <circle
              cx="40" cy="40" r={radius}
              fill="none" stroke="currentColor"
              className="text-muted/40"
              strokeWidth="5"
            />
            <circle
              cx="40" cy="40" r={radius}
              fill="none"
              className={cn(
                "transition-all duration-700",
                progressPercent === 100 ? "text-green-500" : "text-foreground"
              )}
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <span className="absolute text-sm font-bold tabular-nums text-foreground">
            {completed}/{total}
          </span>
        </div>

        {/* Today Info */}
        <div className="flex-1 flex items-start justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Today</h2>
            <p className="text-xs text-muted-foreground">
              {format(dayDate, "EEEE, MMMM d")}
            </p>
            <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
              <span>
                <span className="font-medium text-foreground">{completedHours.toFixed(1)}</span>
                {" / "}{totalHours.toFixed(1)}h studied
              </span>
              {total > 0 && (
                <span className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                  progressPercent === 100
                    ? "bg-green-500/15 text-green-500"
                    : progressPercent > 0
                      ? "bg-amber-500/15 text-amber-500"
                      : "bg-muted text-muted-foreground"
                )}>
                  {Math.round(progressPercent)}%
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onAddTask}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
          >
            <Plus className="size-3.5" />
            Add Task
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="p-3">
        {total === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No tasks for today. Click <strong>Add Task</strong> to start planning.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onToggle={() => onToggleTask(task.id)}
                onEdit={() => onEditTask(task)}
                onDelete={() => onDeleteTask(task.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Individual task row with toggle, exact time, subject badge, and action menu.
 */
function TaskRow({
  task,
  onToggle,
  onEdit,
  onDelete,
}: {
  task: Task
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const subject = getSubjectMeta(task.subjectId)

  // Format time display. Fallback to timeSlot if startTime is missing (legacy tasks)
  let timeDisplay = ""
  if (task.startTime && task.endTime) {
    timeDisplay = `${task.startTime} – ${task.endTime}`
  } else if (task.timeSlot) {
    timeDisplay = task.timeSlot.charAt(0).toUpperCase() + task.timeSlot.slice(1)
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all hover:bg-muted/40",
        task.completed ? "border-transparent opacity-50" : "border-border/50 bg-background/50 shadow-sm"
      )}
    >
      <button onClick={onToggle} className="shrink-0 mt-0.5 self-start">
        {task.completed ? (
          <CheckCircle2 className="size-4 text-green-500" />
        ) : (
          <Circle className="size-4 text-muted-foreground/40" />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
          <span className={cn("text-sm font-medium", task.completed && "line-through text-muted-foreground")}>
            {task.title}
          </span>
          <span className="shrink-0 font-mono text-[11px] font-medium text-muted-foreground">
            {timeDisplay}
            <span className="ml-2 text-foreground/40 font-normal">({task.estimatedHours.toFixed(2)}h)</span>
          </span>
        </div>
        
        <div className="mt-1.5 flex items-center gap-1.5">
          <span
            className="inline-flex items-center gap-1 rounded border px-1.5 py-[2px] text-[10px] font-medium"
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
            "rounded px-1.5 py-[2px] text-[10px] font-medium",
            task.type === "revision" && "bg-purple-500/10 text-purple-500",
            task.type === "study" && "bg-blue-500/10 text-blue-500",
            task.type === "practice" && "bg-cyan-500/10 text-cyan-500",
            task.type === "mock" && "bg-orange-500/10 text-orange-500",
          )}>
            {task.type}
          </span>
          <span className={cn(
            "rounded px-1.5 py-[2px] text-[10px] font-medium",
            task.priority === "high" && "text-red-500",
            task.priority === "medium" && "text-amber-500",
            task.priority === "low" && "text-green-500",
          )}>
            {task.priority} priority
          </span>
        </div>
      </div>

      {/* Action buttons — visible on hover */}
      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 self-start mt-0.5">
        <button
          onClick={onEdit}
          className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Edit task"
        >
          <Pencil className="size-3" />
        </button>
        <button
          onClick={onDelete}
          className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
          title="Delete task"
        >
          <Trash2 className="size-3" />
        </button>
      </div>
    </div>
  )
}
