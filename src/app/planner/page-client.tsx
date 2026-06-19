"use client"

import { useMemo, useState, useCallback } from "react"
import { useAppStore } from "@/lib/store"
import type { PlannerSettings } from "@/lib/store"
import { syllabus } from "@/lib/data/syllabus"
import { calculateVelocity } from "@/lib/calculators"
import { TodayTasks } from "@/components/planner/today-tasks"
import { WeekCalendar } from "@/components/planner/week-calendar"
import { VelocityGauge } from "@/components/planner/velocity-gauge"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@base-ui/react/slider"
import { Settings, RefreshCw } from "lucide-react"
import { format } from "date-fns"

function getTodayStr() {
  return format(new Date(), "yyyy-MM-dd")
}

function getSubjectName(subjectId: string): string {
  const sub = syllabus.find((s) => s.id === subjectId)
  return sub?.name || subjectId
}

export default function PlannerPage() {
  const topicsProgress = useAppStore((s) => s.topicsProgress)
  const getOverallProgress = useAppStore((s) => s.getOverallProgress)

  const dailyTasks = useAppStore((s) => s.dailyTasks)
  const completeTask = useAppStore((s) => s.completeTask)
  const generateDailyTasks = useAppStore((s) => s.generateDailyTasks)

  const plannerSettings = useAppStore((s) => s.plannerSettings)
  const updateSettings = useAppStore((s) => s.updateSettings)

  const [showSettings, setShowSettings] = useState(false)

  const overall = useMemo(() => getOverallProgress(), [topicsProgress, getOverallProgress])

  const todayGroup = useMemo(
    () => dailyTasks.find((g) => g.date === getTodayStr()),
    [dailyTasks]
  )

  const todayTasks = useMemo(() => todayGroup?.tasks || [], [todayGroup])

  const weekTasks = useMemo(
    () => dailyTasks.flatMap((g) => g.tasks),
    [dailyTasks]
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
      Math.floor(
        (new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      )
    )
    const gateDate = new Date(2027, 1, 6)
    const totalDays = Math.floor(
      (gateDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    return calculateVelocity(completedTopics, totalTopics, daysElapsed, totalDays)
  }, [completedTopics, totalTopics])

  const handleToggleTask = useCallback(
    (taskId: string) => {
      if (todayGroup) {
        completeTask(todayGroup.date, taskId)
      }
    },
    [todayGroup, completeTask]
  )

  const handleGenerateTasks = useCallback(() => {
    generateDailyTasks()
  }, [generateDailyTasks])

  const handleSliderChange = useCallback(
    (value: number, field: keyof PlannerSettings) => {
      updateSettings({ [field]: value })
    },
    [updateSettings]
  )

  const subjectIds = syllabus.map((s) => s.id)

  function toggleStrongSubject(subjectId: string) {
    const current = plannerSettings.strongSubjects
    if (current.includes(subjectId)) {
      updateSettings({ strongSubjects: current.filter((s) => s !== subjectId) })
    } else {
      updateSettings({
        strongSubjects: [...current, subjectId],
        weakSubjects: plannerSettings.weakSubjects.filter((s) => s !== subjectId),
      })
    }
  }

  function toggleWeakSubject(subjectId: string) {
    const current = plannerSettings.weakSubjects
    if (current.includes(subjectId)) {
      updateSettings({ weakSubjects: current.filter((s) => s !== subjectId) })
    } else {
      updateSettings({
        weakSubjects: [...current, subjectId],
        strongSubjects: plannerSettings.strongSubjects.filter((s) => s !== subjectId),
      })
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            Study Planner
          </h1>
          <p className="text-xs text-muted-foreground">
            {todayTasks.filter((t) => t.completed).length}/{todayTasks.length}{" "}
            tasks completed today
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleGenerateTasks}>
            <RefreshCw className="size-3" />
            Generate
          </Button>
          <Button variant="outline" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="size-4" />
            Settings
          </Button>
        </div>
      </div>

      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle>Planner Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Daily Available Hours: {plannerSettings.availableHours}
              </label>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">1</span>
                <div className="flex-1">
                  <Slider.Root
                    value={plannerSettings.availableHours}
                    onValueChange={(v) =>
                      handleSliderChange(v, "availableHours")
                    }
                    min={1}
                    max={12}
                    className="relative flex h-5 w-full touch-none items-center"
                  >
                    <Slider.Track className="relative h-1 w-full rounded-full bg-muted">
                      <Slider.Indicator className="absolute h-full rounded-full bg-foreground" />
                    </Slider.Track>
                    <Slider.Thumb className="block size-4 rounded-full border border-foreground/20 bg-background shadow-sm transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50" />
                  </Slider.Root>
                </div>
                <span className="text-xs text-muted-foreground">12</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Strong Subjects (click to toggle)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {subjectIds.map((id) => {
                  const name = getSubjectName(id)
                  return (
                    <button
                      key={id}
                      onClick={() => toggleStrongSubject(id)}
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors ${
                        plannerSettings.strongSubjects.includes(id)
                          ? "bg-green-500/20 text-green-600 dark:text-green-400"
                          : plannerSettings.weakSubjects.includes(id)
                            ? "bg-red-500/20 text-red-600 dark:text-red-400"
                            : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {name}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Weak Subjects (click to toggle)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {subjectIds.map((id) => {
                  const name = getSubjectName(id)
                  return (
                    <button
                      key={id}
                      onClick={() => toggleWeakSubject(id)}
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors ${
                        plannerSettings.weakSubjects.includes(id)
                          ? "bg-red-500/20 text-red-600 dark:text-red-400"
                          : plannerSettings.strongSubjects.includes(id)
                            ? "bg-green-500/20 text-green-600 dark:text-green-400"
                            : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {name}
                    </button>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today&apos;s Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <TodayTasks tasks={todayTasks} onToggle={handleToggleTask} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Velocity</CardTitle>
          </CardHeader>
          <CardContent>
            <VelocityGauge
              currentVelocity={velocity.currentVelocity}
              requiredVelocity={velocity.requiredVelocity}
              isOnTrack={velocity.isOnTrack}
            />
            <div className="mt-3 space-y-1 border-t pt-3">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-mono text-foreground">
                  {completedTopics}/{totalTopics}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Overall</span>
                <span className="font-mono text-foreground">
                  {overall.percent}%
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Predicted</span>
                <span className="font-mono text-foreground">
                  {velocity.predictedCompletionDate.toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric" }
                  )}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <WeekCalendar tasks={weekTasks} />
        </CardContent>
      </Card>
    </div>
  )
}
