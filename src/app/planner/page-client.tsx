"use client"

import { useMemo, useState, useCallback, useEffect, useRef } from "react"
import { useAppStore, type Task, type PlannerSettings } from "@/lib/store"
import { syllabus } from "@/lib/data/syllabus"
import { calculateVelocity } from "@/lib/calculators"
import { TodayHero } from "@/components/planner/today-hero"
import { WeekCalendar } from "@/components/planner/week-calendar"
import { MonthCalendar } from "@/components/planner/month-calendar"
import { DayView } from "@/components/planner/day-view"
import { VelocityGauge } from "@/components/planner/velocity-gauge"
import { RevisionQueue } from "@/components/planner/revision-queue"
import { AddTaskModal } from "@/components/planner/add-task-modal"
import { ConfirmModal } from "@/components/ui/confirm-modal"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@base-ui/react/slider"
import { Settings, RefreshCw, CalendarDays, CalendarRange, Plus, AlertTriangle, ExternalLink, CheckCircle2, XCircle } from "lucide-react"
import {
  connectGoogleCalendar,
  disconnectGoogleCalendar,
  initSyncSnapshot,
  schedulCalendarSync,
  cancelScheduledSync,
} from "@/lib/google-calendar"
import { format } from "date-fns"

function getSubjectName(subjectId: string): string {
  const sub = syllabus.find((s) => s.id === subjectId)
  return sub?.shortName || subjectId
}

export default function PlannerPage() {
  const topicsProgress = useAppStore((s) => s.topicsProgress)
  const getOverallProgress = useAppStore((s) => s.getOverallProgress)

  const dailyTasks = useAppStore((s) => s.dailyTasks)
  const completeTask = useAppStore((s) => s.completeTask)
  const addCustomTask = useAppStore((s) => s.addCustomTask)
  const updateTask = useAppStore((s) => s.updateTask)
  const removeTask = useAppStore((s) => s.removeTask)
  const clearAllTasks = useAppStore((s) => s.clearAllTasks)

  const plannerSettings = useAppStore((s) => s.plannerSettings)
  const updateSettings = useAppStore((s) => s.updateSettings)

  const logs = useAppStore((s) => s.logs)
  const retrySync = useAppStore((s) => s.retrySync)
  const appState = useAppStore((s) => s.appState)

  const [showSettings, setShowSettings] = useState(false)
  const [viewMode, setViewMode] = useState<"week" | "month">("week")
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<{ task: Task, date: string } | null>(null)
  const [defaultDate, setDefaultDate] = useState<string | undefined>(undefined)

  // Confirmation states
  const [taskToDelete, setTaskToDelete] = useState<{ date: string, taskId: string } | null>(null)
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false)

  // Notification state (replaces alert())
  const [notification, setNotification] = useState<string | null>(null)

  useEffect(() => {
    if (!notification) return
    const id = setTimeout(() => setNotification(null), 3000)
    return () => clearTimeout(id)
  }, [notification])

  const overall = useMemo(() => getOverallProgress(), [topicsProgress, getOverallProgress])
  const [todayStr, setTodayStr] = useState(() => format(new Date(), "yyyy-MM-dd"))

  useEffect(() => {
    const interval = setInterval(() => {
      setTodayStr((prev) => {
        const now = format(new Date(), "yyyy-MM-dd")
        return now !== prev ? now : prev
      })
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const todayGroup = useMemo(
    () => dailyTasks.find((g) => g.date === todayStr),
    [dailyTasks, todayStr]
  )

  const completedTopics = useMemo(
    () =>
      Object.values(topicsProgress).filter(
        (s) => s === "completed" || s === "mastered"
      ).length,
    [topicsProgress]
  )

  const totalTopics = useMemo(
    () => syllabus.reduce((s, sub) => s + sub.topics.length, 0),
    []
  )

  const velocity = useMemo(() => {
    const startDate = new Date("2026-01-15")
    const daysElapsed = Math.max(
      1,
      Math.floor((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    )
    const gateDate = new Date(2027, 1, 6)
    const totalDays = Math.floor(
      (gateDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    return calculateVelocity(completedTopics, totalTopics, daysElapsed, totalDays)
  }, [completedTopics, totalTopics])

  // Task Actions
  const handleToggleTask = useCallback((date: string, taskId: string) => {
    completeTask(date, taskId)
  }, [completeTask])

  const handleAddTask = useCallback((date: string) => {
    setDefaultDate(date)
    setEditingTask(null)
    setIsModalOpen(true)
  }, [])

  const handleEditTask = useCallback((date: string, task: Task) => {
    setEditingTask({ task, date })
    setIsModalOpen(true)
  }, [])

  const handleDeleteTask = useCallback((date: string, taskId: string) => {
    setTaskToDelete({ date, taskId })
  }, [])

  const confirmDeleteTask = useCallback(() => {
    if (taskToDelete) {
      removeTask(taskToDelete.date, taskToDelete.taskId)
      setTaskToDelete(null)
    }
  }, [taskToDelete, removeTask])

  const handleSaveModal = useCallback((taskData: Omit<Task, "id">) => {
    if (editingTask) {
      updateTask(editingTask.date, editingTask.task.id, taskData)
    } else {
      addCustomTask(taskData)
    }
  }, [editingTask, updateTask, addCustomTask])

  // Settings logic
  const handleSliderChange = useCallback((value: number, field: keyof PlannerSettings) => {
    updateSettings({ [field]: value })
  }, [updateSettings])

  const subjectIds = syllabus.map((s) => s.id)

  function cycleSubjectState(subjectId: string) {
    const isStrong = plannerSettings.strongSubjects.includes(subjectId)
    const isWeak = plannerSettings.weakSubjects.includes(subjectId)

    if (isStrong) {
      // Strong -> Neutral
      updateSettings({ strongSubjects: plannerSettings.strongSubjects.filter((s) => s !== subjectId) })
    } else if (isWeak) {
      // Weak -> Strong
      updateSettings({
        weakSubjects: plannerSettings.weakSubjects.filter((s) => s !== subjectId),
        strongSubjects: [...plannerSettings.strongSubjects, subjectId],
      })
    } else {
      // Neutral -> Weak
      updateSettings({ weakSubjects: [...plannerSettings.weakSubjects, subjectId] })
    }
  }

  // Google Calendar handlers
  const [isConnecting, setIsConnecting] = useState(false)

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

  // Auto-sync: watch dailyTasks and trigger calendar sync after debounce
  const prevTasksRef = useRef(dailyTasks)
  useEffect(() => {
    if (!appState.googleCalendarConnected) return

    // On mount with calendar connected, initialize the snapshot
    initSyncSnapshot()

    return () => {
      cancelScheduledSync()
    }
  }, [appState.googleCalendarConnected])

  useEffect(() => {
    if (!appState.googleCalendarConnected) return
    if (prevTasksRef.current === dailyTasks) return
    prevTasksRef.current = dailyTasks

    // Schedule a sync after 5s debounce
    schedulCalendarSync()
  }, [dailyTasks, appState.googleCalendarConnected])

  const selectedDayGroup = useMemo(
    () => dailyTasks.find((g) => g.date === selectedDay),
    [dailyTasks, selectedDay]
  )

  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="mx-auto max-w-6xl space-y-5 p-4 md:p-6 pb-20 animate-pulse">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-muted rounded" />
            <div className="h-4 w-80 bg-muted rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-24 bg-muted rounded" />
            <div className="h-8 w-8 bg-muted rounded" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px] mt-6">
          <div className="space-y-5">
            <div className="h-[250px] bg-muted rounded-lg" />
            <div className="h-[400px] bg-muted rounded-lg" />
          </div>
          <div className="space-y-5">
            <div className="h-[200px] bg-muted rounded-lg" />
            <div className="h-[300px] bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-4 md:p-6 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Study Planner</h1>
          <p className="text-sm text-muted-foreground">
            Plan your weeks, track your daily tasks, and maintain your velocity.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="default" size="sm" onClick={() => handleAddTask(todayStr)}>
            <Plus className="size-4 mr-1" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px]">
        {/* Left Column: Today Hero & Calendar */}
        <div className="space-y-5">
          {/* Today Hero (Full width of left column) */}
          <TodayHero
            group={todayGroup}
            todayStr={todayStr}
            onToggleTask={(taskId) => handleToggleTask(todayStr, taskId)}
            onAddTask={() => handleAddTask(todayStr)}
            onEditTask={(task) => handleEditTask(todayStr, task)}
            onDeleteTask={(taskId) => handleDeleteTask(todayStr, taskId)}
            onRetrySync={(taskId) => retrySync(todayStr, taskId)}
          />

          {/* Calendar */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Schedule</CardTitle>
                <div className="flex items-center gap-1 rounded-lg border p-0.5">
                  <button
                    onClick={() => setViewMode("week")}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      viewMode === "week" ? "bg-muted text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <CalendarDays className="size-3.5 inline mr-1" />
                    Week
                  </button>
                  <button
                    onClick={() => setViewMode("month")}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      viewMode === "month" ? "bg-muted text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <CalendarRange className="size-3.5 inline mr-1" />
                    Month
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {viewMode === "week" ? (
                <div className="overflow-x-auto pb-2">
                  <WeekCalendar
                    groups={dailyTasks}
                    onToggleTask={handleToggleTask}
                    onSelectDay={setSelectedDay}
                    onAddTask={(date) => handleAddTask(date)}
                    onEditTask={(date, task) => handleEditTask(date, task)}
                    onDeleteTask={(date, taskId) => handleDeleteTask(date, taskId)}
                  />
                </div>
              ) : (
                <MonthCalendar
                  groups={dailyTasks}
                  onSelectDay={setSelectedDay}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Widgets */}
        <div className="space-y-5">
          {/* Velocity Gauge */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Pace Tracker</CardTitle>
            </CardHeader>
            <CardContent>
              <VelocityGauge
                currentVelocity={velocity.currentVelocity}
                requiredVelocity={velocity.requiredVelocity}
                isOnTrack={velocity.isOnTrack}
              />
              <div className="mt-4 space-y-2 border-t border-border pt-4">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Topics Completed</span>
                  <span className="font-mono font-medium text-foreground">
                    {completedTopics} <span className="text-muted-foreground">/ {totalTopics}</span>
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Syllabus Covered</span>
                  <span className="font-mono font-medium text-foreground">
                    {overall.percent}%
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Target Completion</span>
                  <span className="font-mono font-medium text-foreground">
                    {velocity.predictedCompletionDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Revision Queue */}
          <RevisionQueue
            onAddRevisionTask={(topicId, subjectId, topicName) => {
              addCustomTask({
                title: `Revise ${topicName}`,
                subjectId,
                topicId,
                estimatedHours: 1,
                priority: "high",
                completed: false,
                date: todayStr,
                type: "revision",
                timeSlot: "evening",
              })
              alert("Added revision task to today's schedule!")
              setNotification("Added revision task to today's schedule!")
            }}
          />
        </div>
      </div>

      {/* Day View Slide-out / Modal */}
      {selectedDay && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl">
            <DayView
              group={selectedDayGroup}
              date={selectedDay}
              onToggleTask={handleToggleTask}
              onAddTask={() => handleAddTask(selectedDay)}
              onEditTask={(task) => handleEditTask(selectedDay, task)}
              onDeleteTask={(taskId) => handleDeleteTask(selectedDay, taskId)}
              onRetrySync={(taskId) => retrySync(selectedDay, taskId)}
              onClose={() => setSelectedDay(null)}
            />
          </div>
        </div>
      )}

      {/* Add/Edit Task Modal */}
      <AddTaskModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModal}
        onDelete={(taskId) => {
          if (editingTask) {
            handleDeleteTask(editingTask.date, taskId)
          }
        }}
        editingTask={editingTask?.task}
        defaultDate={defaultDate}
      />

      <ConfirmModal
        open={!!taskToDelete}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDeleteTask}
        onCancel={() => setTaskToDelete(null)}
      />

      <ConfirmModal
        open={showClearAllConfirm}
        title="Clear All Tasks"
        description="Are you sure you want to delete ALL tasks from your schedule? This will wipe your entire plan and cannot be undone."
        confirmText="Clear Schedule"
        onConfirm={() => {
          clearAllTasks()
          setShowClearAllConfirm(false)
          setShowSettings(false)
        }}
        onCancel={() => setShowClearAllConfirm(false)}
      />
      
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-medium text-primary shadow-lg backdrop-blur-md">
          {notification}
        </div>
      )}
    </div>
  )
}
