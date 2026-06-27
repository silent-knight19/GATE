"use client"

import React, { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppStore } from "@/lib/store"
import { syllabus } from "@/lib/data/syllabus"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

interface TooltipPayload {
  payload: { name: string; revised: number; needsRevision: number; total: number; pct: number }
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border bg-card p-3 text-xs shadow-lg space-y-1">
      <p className="font-medium text-sm">{d.name}</p>
      <p className="text-green-500">Revised: {d.revised}</p>
      <p className="text-amber-500">Needs revision: {d.needsRevision}</p>
      <p className="text-muted-foreground">Coverage: {d.pct}%</p>
    </div>
  )
}

function RevisionCoverage() {
  const topicsProgress = useAppStore((s) => s.topicsProgress)
  const revisionHistory = useAppStore((s) => s.revisionHistory)

  const data = useMemo(() => {
    const revMap: Record<string, { lastRevised: string; confidence: number }> = {}
    for (const r of revisionHistory) {
      revMap[r.topicId] = { lastRevised: r.lastRevised, confidence: r.confidence }
    }

    const now = new Date()
    return syllabus.map((sub) => {
      let revised = 0, needsRevision = 0, total = 0
      for (const topic of sub.topics) {
        const status = topicsProgress[topic.id]
        if (status === "completed" || status === "mastered") {
          total++
          const rev = revMap[topic.id]
          if (rev) {
            const days = Math.round((now.getTime() - new Date(rev.lastRevised).getTime()) / 86400000)
            const threshold = rev.confidence >= 4 ? 14 : rev.confidence >= 3 ? 7 : 3
            if (days < threshold) revised++
            else needsRevision++
          } else {
            needsRevision++
          }
        }
      }
      return {
        name: sub.shortName,
        revised,
        needsRevision,
        total,
        pct: total > 0 ? Math.round((revised / total) * 100) : 0,
      }
    }).filter((s) => s.total > 0)
  }, [topicsProgress, revisionHistory])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revision Coverage</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-sm text-muted-foreground">Start revising topics to see coverage</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={256}>
              <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} stroke="hsl(var(--muted-foreground))" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revised" stackId="a" fill="#22c55e" barSize={20} radius={[0, 0, 0, 0]} />
                <Bar dataKey="needsRevision" stackId="a" fill="#eab308" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
        )}
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="size-2.5 rounded bg-green-500" /> Up to date</span>
          <span className="flex items-center gap-1"><span className="size-2.5 rounded bg-yellow-500" /> Needs revision</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default React.memo(RevisionCoverage)
