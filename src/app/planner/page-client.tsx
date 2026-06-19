"use client"

import { useMemo, useState, useCallback } from "react"
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
import { Settings, RefreshCw, CalendarDays, CalendarRange, Plus, AlertTriangle } from "lucide-react"
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

  const overall = useMemo(() => getOverallProgress(), [topicsProgress, getOverallProgress])
  const todayStr = useMemo(() => format(new Date(), "yyyy-MM-dd"), [])

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

  const selectedDayGroup = useMemo(
    () => dailyTasks.find((g) => g.date === selectedDay),
    [dailyTasks, selectedDay]
  )

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
          <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="size-4" />
          </Button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Planner Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground flex justify-between">
                <span>Daily Available Hours</span>
                <span className="text-primary">{plannerSettings.availableHours} hours</span>
              </label>
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted-foreground">1</span>
                <div className="flex-1">
                  <Slider.Root
                    value={plannerSettings.availableHours}
                    onValueChange={(v) => handleSliderChange(v, "availableHours")}
                    min={1}
                    max={12}
                    className="relative flex h-5 w-full touch-none items-center"
                  >
                    <Slider.Track className="relative h-1.5 w-full rounded-full bg-muted">
                      <Slider.Indicator className="absolute h-full rounded-full bg-primary" />
                    </Slider.Track>
                    <Slider.Thumb className="block size-5 rounded-full border-2 border-primary bg-background shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50" />
                  </Slider.Root>
                </div>
                <span className="text-xs text-muted-foreground">12</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <label className="text-sm font-medium text-foreground">Subject Priorities</label>
                <span className="text-[10px] text-muted-foreground">Click to toggle: Neutral → Weak → Strong</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {subjectIds.map((id) => {
                  const name = getSubjectName(id)
                  const isStrong = plannerSettings.strongSubjects.includes(id)
                  const isWeak = plannerSettings.weakSubjects.includes(id)
                  
                  return (
                    <button
                      key={id}
                      onClick={() => cycleSubjectState(id)}
                      className={`flex items-center justify-between rounded-md border px-2.5 py-2 text-xs transition-colors ${
                        isStrong
                          ? "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400"
                          : isWeak
                            ? "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
                            : "border-border bg-background text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <span className="truncate pr-2 font-medium">{name}</span>
                      <span className="shrink-0 text-[10px] uppercase tracking-wider opacity-60">
                        {isStrong ? "Strong" : isWeak ? "Weak" : "Neutral"}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-primary/10 flex justify-end">
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => setShowClearAllConfirm(true)}
              >
                Clear All Tasks
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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
    </div>
  )
}
