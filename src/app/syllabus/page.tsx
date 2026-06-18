"use client"

import { useMemo } from "react"
import { syllabus } from "@/lib/data/syllabus"
import { useAppStore } from "@/lib/store"
import { SubjectCard } from "@/components/syllabus/subject-card"

export default function SyllabusPage() {
  const topicsProgress = useAppStore((s) => s.topicsProgress)
  const cycleTopicStatus = useAppStore((s) => s.cycleTopicStatus)
  const getSubjectProgress = useAppStore((s) => s.getSubjectProgress)
  const getOverallProgress = useAppStore((s) => s.getOverallProgress)

  const overall = useMemo(() => getOverallProgress(), [topicsProgress])

  const stats = useMemo(() => {
    let completed = 0
    let inProgress = 0
    let notStarted = 0
    for (const status of Object.values(topicsProgress)) {
      if (status === "completed" || status === "mastered") completed++
      else if (status === "in_progress") inProgress++
      else notStarted++
    }
    return {
      totalSubjects: syllabus.length,
      completed,
      inProgress,
      notStarted,
    }
  }, [topicsProgress])

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-4 md:p-6">
      <title>GATE CSE 2027 Syllabus Tracker & Completion Status</title>
      <meta name="description" content="Detailed topic-by-topic syllabus breakdown for GATE CSE 2027. Track your progress, review key topics, and plan your study milestones." />
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            Syllabus Tracker
          </h1>
          <p className="text-xs text-muted-foreground">
            {overall.completed}/{overall.total} topics &middot; {overall.percent}%
          </p>
        </div>
        <div className="h-1 max-w-[160px] flex-1 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-foreground/70 transition-all"
            style={{ width: `${overall.percent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border bg-card p-3">
          <span className="text-xs text-muted-foreground">Total Subjects</span>
          <p className="mt-1 font-mono text-xl font-semibold text-foreground">
            {stats.totalSubjects}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-3">
          <span className="text-xs text-muted-foreground">Completed</span>
          <p className="mt-1 font-mono text-xl font-semibold text-green-500">
            {stats.completed}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-3">
          <span className="text-xs text-muted-foreground">In Progress</span>
          <p className="mt-1 font-mono text-xl font-semibold text-blue-500">
            {stats.inProgress}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-3">
          <span className="text-xs text-muted-foreground">Not Started</span>
          <p className="mt-1 font-mono text-xl font-semibold text-gray-500">
            {stats.notStarted}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {syllabus.map((subject) => (
          <SubjectCard
            key={subject.id}
            subject={subject}
            progress={getSubjectProgress(subject.id)}
            topicStatuses={topicsProgress}
            onCycleTopic={cycleTopicStatus}
          />
        ))}
      </div>
    </div>
  )
}
