"use client"

import React, { useMemo } from "react"
import { useAppStore, type RevisionEntry } from "@/lib/store"
import { syllabus } from "@/lib/data/syllabus"
import { Clock, Plus, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface RevisionQueueProps {
  onAddRevisionTask: (topicId: string, subjectId: string, topicName: string) => void
}

/**
 * Returns the subject name, color, and topic name for a given topic ID.
 */
function getTopicMeta(topicId: string) {
  for (const sub of syllabus) {
    const topic = sub.topics.find((t) => t.id === topicId)
    if (topic) {
      return { subjectName: sub.shortName, subjectColor: sub.color, topicName: topic.name, subjectId: sub.id }
    }
  }
  return { subjectName: "Unknown", subjectColor: "#6b7280", topicName: topicId, subjectId: "" }
}

/**
 * Calculates how many days since a given date string.
 */
function daysSince(dateStr: string): number {
  return Math.round((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

/**
 * Panel showing topics that are overdue for spaced revision.
 * Sorted by urgency (most overdue first).
 */
export const RevisionQueue = React.memo(function RevisionQueue({ onAddRevisionTask }: RevisionQueueProps) {
  const revisionHistory = useAppStore((s) => s.revisionHistory)
  const getTopicsNeedingRevision = useAppStore((s) => s.getTopicsNeedingRevision)

  const overdueTopics = useMemo(() => {
    const topics = getTopicsNeedingRevision()
    return topics
      .map((r) => ({
        ...r,
        days: daysSince(r.lastRevised),
        ...getTopicMeta(r.topicId),
      }))
      .sort((a, b) => b.days - a.days)
  }, [revisionHistory, getTopicsNeedingRevision])

  if (overdueTopics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5">
            <Clock className="size-3.5" />
            Revision Queue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-3 text-center text-xs text-muted-foreground">
            No topics are due for revision right now. 🎉
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <Clock className="size-3.5" />
          Revision Queue
          <span className="ml-auto rounded-full bg-red-500/15 px-1.5 py-0.5 text-[10px] font-medium text-red-500">
            {overdueTopics.length} due
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {overdueTopics.slice(0, 8).map((topic) => (
            <div
              key={topic.topicId}
              className="group flex items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 transition-all hover:border-border hover:bg-muted/30"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-foreground">{topic.topicName}</p>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span
                    className="inline-flex items-center gap-1 rounded border px-1 py-[1px] text-[10px] font-medium"
                    style={{
                      borderColor: topic.subjectColor + "40",
                      backgroundColor: topic.subjectColor + "15",
                      color: topic.subjectColor,
                    }}
                  >
                    {topic.subjectName}
                  </span>
                  <span className={cn(
                    "text-[10px] font-medium",
                    topic.days >= 14 ? "text-red-500" : topic.days >= 7 ? "text-amber-500" : "text-muted-foreground"
                  )}>
                    {topic.days}d ago
                  </span>
                  <ConfidenceStars level={topic.confidence} />
                </div>
              </div>

              <button
                onClick={() => onAddRevisionTask(topic.topicId, topic.subjectId, topic.topicName)}
                className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-foreground/10 hover:text-foreground group-hover:opacity-100"
                title="Add revision task to today"
              >
                <Plus className="size-3.5" />
              </button>
            </div>
          ))}
          {overdueTopics.length > 8 && (
            <p className="pt-1 text-center text-[10px] text-muted-foreground">
              +{overdueTopics.length - 8} more topics due
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
})

/**
 * Renders 1-5 mini stars indicating confidence level.
 */
function ConfidenceStars({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-px">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "size-2",
            i < level ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"
          )}
        />
      ))}
    </div>
  )
}
