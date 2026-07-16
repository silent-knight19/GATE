"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { format } from "date-fns"
import { syllabus } from "@/lib/data/syllabus"
import type { Task } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { X, Clock, RefreshCw, CheckCircle2, Calendar, Tag, BookOpen, Hash, Flag, Trash2 } from "lucide-react"
import { useAppStore } from "@/lib/store"
import {
  connectGoogleCalendar,
  disconnectGoogleCalendar,
  initSyncSnapshot,
  cancelScheduledSync
} from "@/lib/google-calendar"
import { GoogleCalendarIcon } from "@/components/planner/google-calendar-icon"

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
  const todayStr = format(new Date(), "yyyy-MM-dd")

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
  const [isConnecting, setIsConnecting] = useState(false)
  const appState = useAppStore((state) => state.appState)

  const handleConnectGoogle = useCallback(async () => {
    setIsConnecting(true)
    try {
      const success = await connectGoogleCalendar()
      if (success) {
        initSyncSnapshot()
      }
    } finally {
      setIsConnecting(false)
    }
  }, [])

  const handleDisconnectGoogle = useCallback(async () => {
    cancelScheduledSync()
    await disconnectGoogleCalendar()
  }, [])

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 transition-all duration-300">
      <div className="w-full max-w-[500px] rounded-[24px] border border-white/[0.08] bg-black shadow-2xl overflow-hidden relative">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/5 text-gray-500 hover:text-gray-300 transition-colors z-10"
        >
          <X className="size-5" />
        </button>

        {/* Hero Title Input */}
        <div className="pt-10 px-8 pb-6 border-b border-white/[0.04]">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What do you want to achieve?"
            className="w-full bg-transparent text-2xl font-bold text-white placeholder-gray-600 outline-none"
            autoFocus
          />
        </div>

        {/* Property Grid */}
        <div className="px-8 py-6 space-y-6">
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            
            {/* Date */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar className="size-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Date</span>
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white/[0.03] hover:bg-white/[0.06] border border-transparent hover:border-white/[0.05] focus:border-[#3b7ede] focus:bg-white/[0.02] rounded-xl px-3 py-2.5 text-sm text-gray-200 outline-none transition-all cursor-pointer"
              />
            </div>

            {/* Type */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-gray-400">
                <Tag className="size-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Type</span>
              </div>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as Task["type"])}
                className="w-full bg-white/[0.03] hover:bg-white/[0.06] border border-transparent hover:border-white/[0.05] focus:border-[#3b7ede] focus:bg-white/[0.02] rounded-xl px-3 py-2.5 text-sm text-gray-200 outline-none transition-all cursor-pointer appearance-none"
              >
                {TASK_TYPES.map(t => <option key={t.value} value={t.value} className="bg-black">{t.label}</option>)}
              </select>
            </div>

            {/* Time */}
            <div className="col-span-2 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock className="size-4" />
                  <span className="text-xs font-medium uppercase tracking-wider">Time</span>
                </div>
                <span className="text-xs font-medium text-[#3b7ede] bg-[#3b7ede]/10 px-2.5 py-0.5 rounded-full">
                  {computedHours.toFixed(2)}h
                </span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="flex-1 bg-white/[0.03] hover:bg-white/[0.06] border border-transparent hover:border-white/[0.05] focus:border-[#3b7ede] focus:bg-white/[0.02] rounded-xl px-3 py-2.5 text-sm text-gray-200 outline-none transition-all cursor-pointer"
                />
                <span className="text-gray-600 font-medium">—</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="flex-1 bg-white/[0.03] hover:bg-white/[0.06] border border-transparent hover:border-white/[0.05] focus:border-[#3b7ede] focus:bg-white/[0.02] rounded-xl px-3 py-2.5 text-sm text-gray-200 outline-none transition-all cursor-pointer"
                />
              </div>
            </div>

            {/* Subject */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-gray-400">
                <BookOpen className="size-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Subject</span>
              </div>
              <select
                value={subjectId}
                onChange={(e) => { setSubjectId(e.target.value); setTopicId("") }}
                className="w-full bg-white/[0.03] hover:bg-white/[0.06] border border-transparent hover:border-white/[0.05] focus:border-[#3b7ede] focus:bg-white/[0.02] rounded-xl px-3 py-2.5 text-sm text-gray-200 outline-none transition-all cursor-pointer appearance-none"
              >
                <option value="" className="bg-black">None</option>
                {syllabus.map(s => <option key={s.id} value={s.id} className="bg-black">{s.shortName}</option>)}
              </select>
            </div>

            {/* Topic */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-gray-400">
                <Hash className="size-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Topic</span>
              </div>
              <select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                disabled={!subjectId}
                className="w-full bg-white/[0.03] hover:bg-white/[0.06] border border-transparent hover:border-white/[0.05] focus:border-[#3b7ede] focus:bg-white/[0.02] rounded-xl px-3 py-2.5 text-sm text-gray-200 outline-none transition-all cursor-pointer appearance-none disabled:opacity-50"
              >
                <option value="" className="bg-black">None</option>
                {topics.map(t => <option key={t.id} value={t.id} className="bg-black">{t.name}</option>)}
              </select>
            </div>

            {/* Priority */}
            <div className="col-span-2 flex flex-col gap-2 pt-2">
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Flag className="size-4" />
                <span className="text-xs font-medium uppercase tracking-wider">Priority</span>
              </div>
              <div className="flex gap-3">
                {PRIORITIES.map((p) => {
                  const isActive = priority === p.value
                  return (
                    <button
                      key={p.value}
                      onClick={() => setPriority(p.value)}
                      className={`flex-1 rounded-xl border py-2.5 text-xs font-semibold transition-all ${
                        isActive 
                          ? p.color.split(" ").map(c => c.replace("/20", "/15").replace("/30", "/20")).join(" ") + " shadow-sm ring-1 ring-current/20" 
                          : "border-transparent bg-white/[0.03] text-gray-400 hover:bg-white/[0.06] hover:text-gray-300"
                      }`}
                    >
                      {p.label}
                    </button>
                  )
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 py-5 border-t border-white/[0.04] bg-black/20">
          <div className="flex items-center gap-4">
            {isEditing && onDelete && (
              <button
                onClick={() => setShowConfirmDelete(true)}
                className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                title="Delete Task"
              >
                <Trash2 className="size-4.5" />
              </button>
            )}
            <button
              onClick={appState.googleCalendarConnected ? handleDisconnectGoogle : handleConnectGoogle}
              disabled={isConnecting}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors border ${
                appState.googleCalendarConnected 
                  ? "bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20"
                  : "bg-white/[0.03] border-white/5 text-gray-400 hover:bg-white/[0.08]"
              }`}
            >
              {isConnecting ? <RefreshCw className="size-3 animate-spin" /> : appState.googleCalendarConnected ? <CheckCircle2 className="size-3" /> : <GoogleCalendarIcon className="size-3" />}
              {appState.googleCalendarConnected ? "Calendar Synced" : "Sync Calendar"}
            </button>
          </div>
          
          <button
            onClick={handleSave}
            disabled={!title.trim() || !startTime || !endTime}
            className="px-6 py-2.5 rounded-xl bg-[#3b7ede] text-white text-sm font-semibold shadow-[0_0_15px_rgba(59,126,222,0.4)] hover:bg-[#3b7ede]/90 hover:shadow-[0_0_20px_rgba(59,126,222,0.6)] disabled:opacity-50 disabled:shadow-none transition-all"
          >
            {isEditing ? "Save Changes" : "Create Task"}
          </button>
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
