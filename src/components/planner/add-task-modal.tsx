"use client"

import { useState, useEffect, useMemo } from "react"
import { syllabus } from "@/lib/data/syllabus"
import type { Task } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { X, Clock } from "lucide-react"

interface AddTaskModalProps {
  open: boolean
  onClose: () => void
  onSave: (task: Omit<Task, "id">) => void
  /** If provided, the modal opens in edit mode with pre-filled values */
  editingTask?: Task | null
  /** Callback when delete is clicked (only when editing) */
  onDelete?: (taskId: string) => void
  /** Pre-selected date for new tasks */
  defaultDate?: string
}

const TASK_TYPES: { value: Task["type"]; label: string }[] = [
  { value: "study", label: "Study" },
  { value: "revision", label: "Revision" },
  { value: "practice", label: "Practice" },
  { value: "mock", label: "Mock Test" },
]

const PRIORITIES: { value: Task["priority"]; label: string; color: string }[] = [
  { value: "high", label: "High", color: "bg-red-500/20 text-red-500 border-red-500/30" },
  { value: "medium", label: "Medium", color: "bg-amber-500/20 text-amber-500 border-amber-500/30" },
  { value: "low", label: "Low", color: "bg-green-500/20 text-green-500 border-green-500/30" },
]

function calculateHours(start: string, end: string): number {
  if (!start || !end) return 1.5
  const [sh, sm] = start.split(":").map(Number)
  const [eh, em] = end.split(":").map(Number)
  let diff = (eh + em / 60) - (sh + sm / 60)
  if (diff < 0) diff += 24 // Handles crossing midnight
  return Math.max(0.25, Math.round(diff * 4) / 4) // Round to nearest 0.25h
}

function getCurrentRoundedTime(offsetHours = 0): string {
  const d = new Date()
  d.setHours(d.getHours() + offsetHours)
  d.setMinutes(Math.round(d.getMinutes() / 15) * 15) // Round to nearest 15 mins
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`
}

/**
 * Modal for creating or editing a planner task.
 * Supports exact start and end times.
 */
export function AddTaskModal({
  open,
  onClose,
  onSave,
  editingTask,
  onDelete,
  defaultDate,
}: AddTaskModalProps) {
  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], [])

  const [subjectId, setSubjectId] = useState("")
  const [topicId, setTopicId] = useState("")
  const [title, setTitle] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [type, setType] = useState<Task["type"]>("study")
  const [priority, setPriority] = useState<Task["priority"]>("medium")
  const [date, setDate] = useState(todayStr)

  // Confirm delete state
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  // Reset form when modal opens or editingTask changes
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!open) return
    if (editingTask) {
      setSubjectId(editingTask.subjectId)
      setTopicId(editingTask.topicId)
      setTitle(editingTask.title)
      setStartTime(editingTask.startTime || "09:00")
      setEndTime(editingTask.endTime || "10:30")
      setType(editingTask.type)
      setPriority(editingTask.priority)
      setDate(editingTask.date)
    } else {
      setSubjectId("")
      setTopicId("")
      setTitle("")
      setStartTime(getCurrentRoundedTime(0))
      setEndTime(getCurrentRoundedTime(1.5))
      setType("study")
      setPriority("medium")
      setDate(defaultDate || todayStr)
    }
    setShowConfirmDelete(false)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [open, editingTask, defaultDate, todayStr])

  const topics = useMemo(() => {
    const sub = syllabus.find((s) => s.id === subjectId)
    return sub?.topics || []
  }, [subjectId])

  // Auto-generate title when subject/topic/type changes (only for new tasks)
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (editingTask) return
    if (!topicId) return
    const topic = topics.find((t) => t.id === topicId)
    if (!topic) return
    const prefix = type === "revision" ? "Revise" : type === "mock" ? "Mock:" : "Study"
    setTitle(`${prefix} ${topic.name}`)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [topicId, type, topics, editingTask])

  function handleSave() {
    if (!title.trim() || !date || !startTime || !endTime) return
    
    onSave({
      title: title.trim(),
      subjectId: subjectId || "general",
      topicId: topicId || "custom",
      estimatedHours: calculateHours(startTime, endTime),
      priority,
      completed: editingTask?.completed || false,
      date,
      type,
      startTime,
      endTime,
    })
    onClose()
  }

  if (!open) return null

  const isEditing = !!editingTask
  const computedHours = calculateHours(startTime, endTime)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-xl border border-border bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">
            {isEditing ? "Edit Task" : "Add Task"}
          </h2>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        {/* Body */}
        <div className="space-y-4 p-4">
          {/* Date & Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as Task["type"])}
                className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              >
                {TASK_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Time Selection */}
          <div>
            <label className="mb-1 flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>Time</span>
              <span className="flex items-center gap-1 text-[10px] text-primary">
                <Clock className="size-3" />
                {computedHours.toFixed(2)}h duration
              </span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
              <span className="text-muted-foreground">to</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Subject</label>
            <select
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value)
                setTopicId("")
              }}
              className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            >
              <option value="">Select subject...</option>
              {syllabus.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.shortName}
                </option>
              ))}
            </select>
          </div>

          {/* Topic */}
          {subjectId && (
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Topic</label>
              <select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              >
                <option value="">Select topic...</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Study Binary Trees"
              className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Priority</label>
            <div className="flex gap-1.5">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPriority(p.value)}
                  className={`flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                    priority === p.value ? p.color : "border-border text-muted-foreground"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <div>
            {isEditing && onDelete && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                onClick={() => setShowConfirmDelete(true)}
              >
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!title.trim() || !startTime || !endTime}>
              {isEditing ? "Save Changes" : "Add Task"}
            </Button>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={showConfirmDelete}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        onConfirm={() => {
          if (editingTask && onDelete) {
            onDelete(editingTask.id)
            setShowConfirmDelete(false)
            onClose()
          }
        }}
        onCancel={() => setShowConfirmDelete(false)}
      />
    </div>
  )
}
