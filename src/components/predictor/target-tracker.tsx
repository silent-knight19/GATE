'use client'

import { useState, useMemo } from 'react'
import { marksToRank, rankToMarks } from '@/lib/calculators'
import { syllabus } from '@/lib/data/syllabus'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { MarksGauge } from './marks-gauge'
import { TrendingUp, Target, ArrowUp } from 'lucide-react'

const CATEGORIES = ['General', 'OBC', 'EWS', 'SC', 'ST', 'PwD'] as const

export function TargetTracker() {
  const [marks, setMarks] = useState(50)
  const [category, setCategory] = useState('General')
  const [targetRank, setTargetRank] = useState(500)

  const current = useMemo(() => marksToRank(marks, category), [marks, category])
  const required = useMemo(() => rankToMarks(targetRank, category), [targetRank, category])

  const gap = useMemo(() => {
    const marksNeeded = Math.max(0, Math.round((required.marks - marks) * 10) / 10)
    return {
      marksNeeded,
      scoreDiff: Math.max(0, Math.round((required.score - current.score) * 100) / 100),
      isOnTrack: marks >= required.marks,
    }
  }, [marks, required, current])

  const roiSubjects = useMemo(() => {
    return syllabus
      .filter((s) => s.id !== 'ga')
      .map((s) => {
        const currentEstimate = (marks / 100) * s.avgMarks
        const potentialGain = Math.max(0, s.avgMarks - currentEstimate)
        const roi = s.weightage * potentialGain
        return { ...s, currentEstimate, potentialGain, roi }
      })
      .sort((a, b) => b.roi - a.roi)
  }, [marks])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Current Marks</label>
                <Badge variant="outline" className="font-mono text-base tabular-nums">
                  {marks}
                </Badge>
              </div>
              <Slider
                value={[marks]}
                onValueChange={(v) => setMarks(Array.isArray(v) ? v[0] : v)}
                min={0}
                max={100}
              />
              <MarksGauge marks={marks} />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Category</label>
              <Select value={category} onValueChange={(v) => v !== null && setCategory(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Current Estimated Rank</span>
                <span className="font-mono font-bold tabular-nums">
                  {current.expectedRank.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Current Score</span>
                <span className="font-mono tabular-nums">{current.score}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Target</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Target Rank</label>
              <Input
                type="number"
                min={1}
                max={50000}
                value={targetRank}
                onChange={(e) => setTargetRank(Math.max(1, Number(e.target.value)))}
                className="font-mono"
              />
            </div>

            <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Required Marks</span>
                <span className="font-mono font-bold tabular-nums">{required.marks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Projected Score</span>
                <span className="font-mono tabular-nums">{required.score}</span>
              </div>
            </div>

            <div
              className={`rounded-lg border p-4 space-y-2 ${
                gap.isOnTrack
                  ? 'border-green-500/20 bg-green-500/10'
                  : 'border-red-500/20 bg-red-500/10'
              }`}
            >
              <div className="flex items-center gap-2">
                {gap.isOnTrack ? (
                  <TrendingUp className="size-4 text-green-600" />
                ) : (
                  <Target className="size-4 text-red-600" />
                )}
                <span className="text-sm font-medium">
                  {gap.isOnTrack ? 'On Track' : 'Gap Analysis'}
                </span>
              </div>

              {gap.isOnTrack ? (
                <p className="text-sm text-muted-foreground">
                  Your current marks already meet the requirement for rank{' '}
                  {targetRank.toLocaleString()}.
                </p>
              ) : (
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">
                    You need{' '}
                    <span className="font-mono font-medium text-foreground">
                      {gap.marksNeeded}
                    </span>{' '}
                    more marks to reach rank {targetRank.toLocaleString()}.
                  </p>
                  <p className="text-muted-foreground">
                    Score gap:{' '}
                    <span className="font-mono font-medium text-foreground">
                      {gap.scoreDiff}
                    </span>{' '}
                    points
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subject ROI — Focus Areas for Maximum Impact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Subject
                  </th>
                  <th className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Weightage
                  </th>
                  <th className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Est. Current
                  </th>
                  <th className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Potential Gain
                  </th>
                  <th className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    ROI
                  </th>
                </tr>
              </thead>
              <tbody>
                {roiSubjects.map((s, i) => (
                  <tr
                    key={s.id}
                    className="border-b border-border/40 transition-colors hover:bg-muted/40"
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="size-2.5 rounded-full"
                          style={{ backgroundColor: s.color }}
                        />
                        <span className="font-medium">{s.shortName}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs tabular-nums">
                      {s.weightage}%
                    </td>
                    <td className="px-3 py-2 font-mono text-xs tabular-nums">
                      {s.avgMarks.toFixed(1)}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs tabular-nums text-green-600">
                      +{s.potentialGain.toFixed(1)}
                    </td>
                    <td className="px-3 py-2">
                      {i < 3 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                          <ArrowUp className="size-3" />
                          High
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Medium</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            ROI = weightage × potential gain. Focus on high-ROI subjects for maximum rank
            improvement.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
