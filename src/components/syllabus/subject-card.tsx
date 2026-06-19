"use client"

import React, { useState } from "react"
import type { Subject } from "@/lib/data/syllabus"
import { ProgressRing } from "@/components/syllabus/progress-ring"
import { ChevronRight } from "lucide-react"

interface SubjectCardProps {
  subject: Subject
  progress: { completed: number; total: number; percent: number }
  topicStatuses: Record<string, string>
  onCycleTopic: (topicId: string) => void
}

const statusColors: Record<string, string> = {
  not_started: "bg-gray-500",
  in_progress: "bg-blue-500",
  completed: "bg-green-500",
  mastered: "bg-purple-500",
}

export const SubjectCard = React.memo(function SubjectCard({
  subject,
  progress,
  topicStatuses,
  onCycleTopic,
}: SubjectCardProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-xl border border-border bg-card transition-[border-color,box-shadow] hover:border-foreground/20 hover:shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left outline-none"
      >
        <div
          className="size-3 shrink-0 rounded-full"
          style={{ backgroundColor: subject.color }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-foreground">
              {subject.name}
            </span>
            <span className="shrink-0 rounded-full bg-secondary px-1.5 py-[1px] text-[10px] font-medium text-muted-foreground">
              {subject.weightage}%
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${progress.percent}%`,
                  backgroundColor: subject.color,
                }}
              />
            </div>
            <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
              {progress.completed}/{progress.total}
            </span>
          </div>
        </div>
        <ProgressRing
          percent={progress.percent}
          size={40}
          strokeWidth={3}
          color={subject.color}
        />
        <ChevronRight
          className={`size-4 shrink-0 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`}
        />
      </button>
      {open && (
        <div className="border-t border-border px-4 py-2">
          {subject.topics.map((topic) => {
            const status = topicStatuses[topic.id] || "not_started"
            return (
              <button
                key={topic.id}
                onClick={() => onCycleTopic(topic.id)}
                className="flex w-full items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 text-left text-sm transition-[transform,border-color,background-color] hover:border-border hover:bg-muted/50 active:scale-[0.99]"
              >
                <div
                  className={`size-2 shrink-0 rounded-full ${statusColors[status] || "bg-gray-500"}`}
                />
                <span className="flex-1 truncate text-foreground">
                  {topic.name}
                </span>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {topic.avgMarks}
                </span>
                <span
                  className={`rounded px-1 py-[1px] text-[10px] font-medium ${
                    topic.frequency === "very_high"
                      ? "text-orange-500 bg-orange-500/10"
                      : topic.frequency === "high"
                        ? "text-amber-500 bg-amber-500/10"
                        : topic.frequency === "medium"
                          ? "text-blue-500 bg-blue-500/10"
                          : "text-gray-500 bg-gray-500/10"
                  }`}
                >
                  {topic.frequency === "very_high"
                    ? "VH"
                    : topic.frequency === "high"
                      ? "H"
                      : topic.frequency === "medium"
                        ? "M"
                        : "L"}
                </span>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {topic.hours}h
                </span>
                <span
                  className={`rounded px-1 py-[1px] text-[10px] font-medium uppercase tracking-wider ${
                    status === "not_started"
                      ? "text-gray-500 bg-gray-500/10"
                      : status === "in_progress"
                        ? "text-blue-500 bg-blue-500/10"
                        : status === "completed"
                          ? "text-green-500 bg-green-500/10"
                          : "text-purple-500 bg-purple-500/10"
                  }`}
                >
                  {status === "not_started"
                    ? "NS"
                    : status === "in_progress"
                      ? "IP"
                      : status === "completed"
                        ? "Ok"
                        : "M"}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
})
