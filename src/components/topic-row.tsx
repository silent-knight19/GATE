import React from "react"
import type { TopicStatus } from '@/lib/data/syllabus'

interface TopicRowProps {
  topic: {
    id: string
    name: string
    status: TopicStatus
    avgMarks: number
    frequency: string
    hours: number
    prerequisites: string[]
  }
  onCycle: () => void
}

const statusColors: Record<TopicStatus, string> = {
  not_started: 'bg-gray-500',
  in_progress: 'bg-blue-500',
  completed: 'bg-green-500',
  mastered: 'bg-purple-500',
}

const statusLabels: Record<TopicStatus, string> = {
  not_started: 'NS',
  in_progress: 'IP',
  completed: 'Ok',
  mastered: 'M',
}

const freqColors: Record<string, string> = {
  very_high: 'text-orange-500 bg-orange-500/10',
  high: 'text-amber-500 bg-amber-500/10',
  medium: 'text-blue-500 bg-blue-500/10',
  low: 'text-gray-500 bg-gray-500/10',
}

export const TopicRow = React.memo(function TopicRow({ topic, onCycle }: TopicRowProps) {
  return (
    <button
      onClick={onCycle}
      className="flex w-full items-center gap-2 rounded-lg border border-transparent px-2.5 py-1.5 text-left text-sm transition-[transform,border-color,background-color] hover:border-border hover:bg-muted/50 active:scale-[0.99]"
    >
      <div className={`size-2 shrink-0 rounded-full ${statusColors[topic.status]}`} />
      <span className="flex-1 truncate text-foreground">{topic.name}</span>
      <span className="font-mono text-xs tabular-nums text-muted-foreground">
        {topic.avgMarks}
      </span>
      <span className={`rounded px-1 py-[1px] text-[10px] font-medium ${freqColors[topic.frequency] || freqColors.medium}`}>
        {topic.frequency === 'very_high' ? 'VH' : topic.frequency === 'high' ? 'H' : topic.frequency === 'medium' ? 'M' : 'L'}
      </span>
      <span className="font-mono text-xs tabular-nums text-muted-foreground">
        {topic.hours}h
      </span>
      <span className={`text-[10px] font-medium uppercase tracking-wider rounded px-1 py-[1px] ${
        topic.status === 'not_started' ? 'text-gray-500 bg-gray-500/10' :
        topic.status === 'in_progress' ? 'text-blue-500 bg-blue-500/10' :
        topic.status === 'completed' ? 'text-green-500 bg-green-500/10' :
        'text-purple-500 bg-purple-500/10'
      }`}>
        {statusLabels[topic.status]}
      </span>
    </button>
  )
})
