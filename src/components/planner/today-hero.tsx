"use client"

import { useMemo } from "react"
import type { Task, DailyTaskGroup } from "@/lib/store"
import { cn } from "@/lib/utils"
import { syllabus } from "@/lib/data/syllabus"
import { CheckCircle2, Circle, Plus, Trash2, Pencil, Check, RefreshCw, AlertCircle } from "lucide-react"
import { format } from "date-fns"

interface TodayHeroProps {
  group: DailyTaskGroup | undefined
  todayStr: string
  onToggleTask: (taskId: string) => void
  onAddTask: () => void
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  onRetrySync?: (taskId: string) => void
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
  onRetrySync,
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
    <div className="rounded-[24px] border border-white/[0.05] bg-black overflow-hidden relative">
      {/* Subtle top glow */}
      <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-[#3b7ede]/40 to-transparent opacity-50" />

      {/* Header */}
      <div className="flex items-center gap-6 border-b border-white/[0.04] px-8 py-7 bg-black/40 backdrop-blur-sm">
        
        {/* Progress Ring */}
        <div className="relative flex size-24 shrink-0 items-center justify-center">
          <svg className="size-24 -rotate-90" viewBox="0 0 80 80">
            <circle
              cx="40" cy="40" r={radius}
              fill="none" stroke="currentColor"
              className="text-white/[0.05]"
              strokeWidth="5"
            />
            <circle
              cx="40" cy="40" r={radius}
              fill="none"
              className={cn(
                "transition-all duration-1000 ease-out",
                progressPercent === 100 ? "text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)]" : "text-[#3b7ede]"
              )}
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ filter: 'drop-shadow(0px 0px 4px rgba(59,126,222,0.4))' }}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-xl font-bold tabular-nums text-white leading-tight">
              {completed}/{total}
            </span>
          </div>
        </div>

        {/* Today Info */}
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Today</h2>
            <p className="text-sm font-medium text-gray-500 mt-0.5">
              {format(dayDate, "EEEE, MMMM d")}
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs font-medium text-gray-400">
              <div className="flex items-center bg-white/[0.03] border border-white/[0.05] rounded-full px-2.5 py-1">
                <span className="text-white mr-1">{completedHours.toFixed(1)}</span>
                <span className="opacity-60">/ {totalHours.toFixed(1)}h studied</span>
              </div>
              {total > 0 && (
                <span className={cn(
                  "rounded-full px-2.5 py-1",
                  progressPercent === 100
                    ? "bg-green-500/10 text-green-400 border border-green-500/20"
                    : progressPercent > 0
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : "bg-white/[0.03] border border-white/[0.05] text-gray-500"
                )}>
                  {Math.round(progressPercent)}% completed
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onAddTask}
            className="shrink-0 flex items-center gap-2 rounded-xl bg-[#3b7ede] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_15px_rgba(59,126,222,0.3)] hover:bg-[#3b7ede]/90 hover:shadow-[0_0_20px_rgba(59,126,222,0.5)] transition-all"
          >
            <Plus className="size-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="p-4 sm:p-6 bg-black">
        {total === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center border border-dashed border-white/[0.05] rounded-[16px] bg-white/[0.01]">
            <p className="text-gray-400 font-medium mb-1">No tasks for today</p>
            <p className="text-xs text-gray-500">
              Click <strong className="text-gray-300">Add Task</strong> to start planning your day.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onToggle={() => onToggleTask(task.id)}
                onEdit={() => onEditTask(task)}
                onDelete={() => onDeleteTask(task.id)}
                onRetrySync={onRetrySync}
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
  onRetrySync,
}: {
  task: Task
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
  onRetrySync?: (taskId: string) => void
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
        "group flex items-start gap-4 rounded-[16px] border px-4 py-3.5 transition-all",
        task.completed 
          ? "border-transparent bg-white/[0.01] opacity-50 grayscale" 
          : "border-white/[0.03] bg-black hover:bg-white/[0.02] hover:border-white/[0.06] shadow-sm"
      )}
    >
      <button onClick={onToggle} className="shrink-0 mt-[2px] transition-transform hover:scale-110">
        {task.completed ? (
          <CheckCircle2 className="size-4.5 text-green-500" />
        ) : (
          <Circle className="size-4.5 text-gray-500 hover:text-gray-300" />
        )}
      </button>

      <div className="min-w-0 flex-1 flex flex-col justify-center">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4 w-full">
          <span className={cn(
            "text-[15px] font-semibold tracking-tight transition-colors", 
            task.completed ? "line-through text-gray-500" : "text-gray-100 group-hover:text-white"
          )}>
            {task.title}
          </span>
          <span className="shrink-0 font-mono text-[11px] font-semibold text-gray-400 bg-white/[0.03] px-2 py-0.5 rounded-md border border-white/[0.05]">
            {timeDisplay}
            <span className="ml-1.5 text-gray-600 font-medium">({task.estimatedHours.toFixed(2)}h)</span>
          </span>
        </div>
        
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            style={{
              borderColor: subject.color + "20",
              backgroundColor: subject.color + "10",
              color: subject.color,
            }}
          >
            <span className="size-1.5 rounded-full shadow-sm" style={{ backgroundColor: subject.color }} />
            {subject.name}
          </span>
          <span className={cn(
            "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
            task.type === "revision" && "bg-purple-500/10 text-purple-400 border-purple-500/20",
            task.type === "study" && "bg-blue-500/10 text-blue-400 border-blue-500/20",
            task.type === "practice" && "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
            task.type === "mock" && "bg-orange-500/10 text-orange-400 border-orange-500/20",
          )}>
            {task.type}
          </span>
          <span className={cn(
            "rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
            task.priority === "high" && "bg-red-500/10 text-red-400 border-red-500/20",
            task.priority === "medium" && "bg-amber-500/10 text-amber-400 border-amber-500/20",
            task.priority === "low" && "bg-green-500/10 text-green-400 border-green-500/20",
          )}>
            {task.priority} priority
          </span>
        </div>
      </div>

      {/* Sync status badge */}
      <div className="shrink-0 flex flex-col items-center gap-1 mt-1">
        {task.syncStatus === 'pending' && (
          <span title="Syncing..."><RefreshCw className="size-3.5 text-gray-500 animate-spin" /></span>
        )}
        {task.syncStatus === 'synced' && (
          <span title="Synced to Google Calendar"><Check className="size-3.5 text-green-500/70" /></span>
        )}
        {task.syncStatus === 'error' && onRetrySync && (
          <button
            onClick={() => onRetrySync(task.id)}
            className="group relative"
            title={task.syncError || "Sync failed — click to retry"}
          >
            <AlertCircle className="size-3.5 text-red-500/80 hover:text-red-400 transition-colors" />
          </button>
        )}

        {/* Action buttons — visible on hover */}
        <div className="flex shrink-0 flex-col items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 sm:flex-row mt-1 sm:mt-0">
          <button
            onClick={onEdit}
            className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-white/[0.05] hover:text-white"
            title="Edit task"
          >
            <Pencil className="size-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
            title="Delete task"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
