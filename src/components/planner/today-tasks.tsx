"use client"

import type { Task } from "@/lib/store"
import { cn } from "@/lib/utils"
import { syllabus } from "@/lib/data/syllabus"
import { Checkbox } from "@base-ui/react/checkbox"

interface TodayTasksProps {
  tasks: Task[]
  onToggle: (taskId: string) => void
}

const priorityColors: Record<string, string> = {
  high: "text-red-500 bg-red-500/10 border-red-500/20",
  medium: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  low: "text-green-500 bg-green-500/10 border-green-500/20",
}

function getSubjectName(subjectId: string): { name: string; color: string } {
  const sub = syllabus.find((s) => s.id === subjectId)
  return {
    name: sub?.name || subjectId,
    color: sub?.color || "#6b7280",
  }
}

function getTopicName(topicId: string): string {
  for (const sub of syllabus) {
    const topic = sub.topics.find((t) => t.id === topicId)
    if (topic) return topic.name
  }
  return topicId
}

export function TodayTasks({ tasks, onToggle }: TodayTasksProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-sm text-muted-foreground">
        <p>No tasks for today.</p>
        <p className="text-xs">Click Generate to create tasks.</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {tasks.map((task) => {
        const subject = getSubjectName(task.subjectId)
        return (
          <div
            key={task.id}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2 transition-all hover:bg-muted/50",
              task.completed && "opacity-50"
            )}
          >
            <Checkbox.Root
              checked={task.completed}
              onCheckedChange={() => onToggle(task.id)}
              className="flex size-4 shrink-0 items-center justify-center rounded border border-input bg-transparent transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-checked:bg-primary data-checked:text-primary-foreground data-checked:border-primary"
            >
              <Checkbox.Indicator className="flex items-center justify-center">
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 5L4 7L8 3" />
                </svg>
              </Checkbox.Indicator>
            </Checkbox.Root>
            <div className="flex-1 min-w-0">
              <span
                className={cn(
                  "text-sm",
                  task.completed && "line-through text-muted-foreground"
                )}
              >
                {task.title}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className="inline-flex items-center gap-1 rounded border px-1 py-[1px] text-[10px] font-medium"
                  style={{
                    borderColor: subject.color + "40",
                    backgroundColor: subject.color + "15",
                    color: subject.color,
                  }}
                >
                  <span
                    className="size-1.5 rounded-full"
                    style={{ backgroundColor: subject.color }}
                  />
                  {subject.name}
                </span>
                <span
                  className={cn(
                    "rounded border px-1 py-[1px] text-[10px] font-medium",
                    priorityColors[task.priority] || priorityColors.medium
                  )}
                >
                  {task.priority}
                </span>
              </div>
            </div>
            <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
              {task.estimatedHours}h
            </span>
          </div>
        )
      })}
    </div>
  )
}
