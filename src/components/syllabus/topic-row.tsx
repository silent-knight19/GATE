"use client"

import React from "react"
import type { TopicStatus } from "@/lib/data/syllabus"
import { cn } from "@/lib/utils"

interface TopicRowProps {
  topic: {
    id: string
    name: string
    status: TopicStatus
    avgMarks: number
    frequency: string
    hours: number
    weightage: number
    prerequisites: string[]
  }
  onCycle: () => void
}

const statusColors: Record<TopicStatus, string> = {
  not_started: "bg-gray-500",
  in_progress: "bg-blue-500",
  completed: "bg-green-500",
  mastered: "bg-purple-500",
}

const statusLabels: Record<TopicStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
  mastered: "Mastered",
}

const statusBadgeColors: Record<TopicStatus, string> = {
  not_started: "text-gray-500 bg-gray-500/10",
  in_progress: "text-blue-500 bg-blue-500/10",
  completed: "text-green-500 bg-green-500/10",
  mastered: "text-purple-500 bg-purple-500/10",
}

const freqColors: Record<string, string> = {
  very_high: "text-orange-500 bg-orange-500/10",
  high: "text-amber-500 bg-amber-500/10",
  medium: "text-blue-500 bg-blue-500/10",
  low: "text-gray-500 bg-gray-500/10",
}

const freqLabels: Record<string, string> = {
  very_high: "VH",
  high: "H",
  medium: "M",
  low: "L",
}

export const TopicRow = React.memo(function TopicRow({ topic, onCycle }: TopicRowProps) {
  return (
    <button
      onClick={onCycle}
      className="flex w-full items-center gap-2 rounded-lg border border-transparent px-2.5 py-1.5 text-left text-sm transition-[transform,border-color,background-color] hover:border-border hover:bg-muted/50 active:scale-[0.99]"
    >
      <div
        className={cn("size-2 shrink-0 rounded-full", statusColors[topic.status])}
      />
      <span className="flex-1 truncate text-foreground">{topic.name}</span>
      <span className="font-mono text-xs tabular-nums text-muted-foreground">
        {topic.avgMarks}
      </span>
      <span
        className={cn(
          "rounded px-1 py-[1px] text-[10px] font-medium",
          freqColors[topic.frequency] || freqColors.medium
        )}
      >
        {freqLabels[topic.frequency] || "M"}
      </span>
      <span className="font-mono text-xs tabular-nums text-muted-foreground">
        {topic.hours}h
      </span>
      <span
        className={cn(
          "rounded px-1 py-[1px] text-[10px] font-medium uppercase tracking-wider",
          statusBadgeColors[topic.status]
        )}
      >
        {topic.status === "not_started"
          ? "NS"
          : topic.status === "in_progress"
            ? "IP"
            : topic.status === "completed"
              ? "Ok"
              : "M"}
      </span>
    </button>
  )
})
