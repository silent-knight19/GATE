'use client'

import React, { useState, useMemo } from 'react'
import { marksToRankDetailed, rankToMarksDetailed } from '@/lib/calculators'
import { GATE_CS_STATS } from '@/lib/data/gateStats'
import { syllabus } from '@/lib/data/syllabus'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { MarksGauge } from './marks-gauge'
import { TrendingUp, Target, ArrowUp } from 'lucide-react'

const CATEGORIES = ['General', 'OBC', 'EWS', 'SC', 'ST', 'PwD'] as const
type YearMode = 2026 | 2027

function YearToggle({ year, onChange }: { year: YearMode; onChange: (y: YearMode) => void }) {
  return (
    <div className="flex rounded-lg bg-muted p-1">
      <button onClick={() => onChange(2026)} className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${year === 2026 ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}>2026 Verified</button>
      <button onClick={() => onChange(2027)} className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${year === 2027 ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'}`}>2027 Predicted</button>
    </div>
  )
}

export const TargetTracker = React.memo(function TargetTracker() {
  const [marks, setMarks] = useState(50)
  const [category, setCategory] = useState('General')
  const [targetRank, setTargetRank] = useState(500)
  const [year, setYear] = useState<YearMode>(2026)

  const current = useMemo(() => marksToRankDetailed(marks, category, year), [marks, category, year])
  const required = useMemo(() => rankToMarksDetailed(targetRank, category, year), [targetRank, category, year])
  const stat = GATE_CS_STATS[year]

  const gap = useMemo(() => {
    const marksNeeded = Math.max(0, Math.round((required.marks - marks) * 10) / 10)
    const scoreDiff = Math.max(0, Math.round((required.score - current.score) * 100) / 100)
    return {
      marksNeeded,
      scoreDiff,
      isOnTrack: marks >= required.marks,
      bandLow: required.band.low,
      bandHigh: required.band.high,
    }
  }, [marks, required, current])

  const roiSubjects = useMemo(() => {
    const volatilityW: Record<string, number> = { stable: 1, moderate: 1.08, volatile: 1.15 }
    return syllabus
      .filter((s) => s.id !== 'ga')
      .map((s) => {
        // Assume current coverage proportional to marks/100; more marks → more coverage
        const coverage = Math.min(1, marks / 100 + 0.1) // offset so low marks still have some coverage model
        const remaining = 1 - coverage
        const potentialGain = s.avgMarks * remaining
        const weight = volatilityW[s.volatility] ?? 1
        const roi = s.weightage * potentialGain * weight
        const currentEstimate = s.avgMarks * coverage
        return { ...s, currentEstimate, potentialGain, roi }
      })
      .sort((a, b) => b.roi - a.roi)
  }, [marks])

  return (
    <div className="space-y-6">
      <YearToggle year={year} onChange={setYear} />
      <p className="text-xs text-muted-foreground">
        {stat.organizingInstitute} • {year} • Mq {stat.Mq.General} ( {category}: {current.MqCategory}) • Mt {stat.Mt} • {stat.confidence} {year === 2027 ? 'projection band ±2 marks' : 'verified (gate2026.iitg.ac.in)'}
      </p>

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
              <p className="text-[10px] text-muted-foreground">Score {current.score} [{current.scoreBand.low}–{current.scoreBand.high}] • {current.qualified ? `Qualified • rank ${current.expectedRank?.toLocaleString()} [${current.rankRange?.low.toLocaleString()}–${current.rankRange?.high.toLocaleString()}]` : `Not qualified (<${current.MqCategory})`}</p>
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
                  {current.qualified && current.expectedRank ? `${current.expectedRank.toLocaleString()} [${current.rankRange?.low.toLocaleString()}–${current.rankRange?.high.toLocaleString()}]` : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Current Score</span>
                <span className="font-mono tabular-nums">{current.score} [{current.scoreBand.low}–{current.scoreBand.high}]</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Confidence</span>
                <span>{current.confidence} • {year === 2027 ? 'predicted band' : 'verified'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Target</CardTitle>
            <p className="text-xs text-muted-foreground">Inverse via log-linear anchors, then official score formula. Band = ±2 marks (±{year===2027?'3':'2'} for projected year).</p>
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
                <span className="font-mono font-bold tabular-nums">{required.marks} [{gap.bandLow}–{gap.bandHigh}]</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Projected Score</span>
                <span className="font-mono tabular-nums">{required.score} [{required.scoreBand.low}–{required.scoreBand.high}]</span>
              </div>
              <p className="text-[10px] text-muted-foreground">{required.method}</p>
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
                  {targetRank.toLocaleString()} (need {required.marks} [{gap.bandLow}–{gap.bandHigh}]).
                </p>
              ) : (
                <div className="space-y-1 text-sm">
                  <p className="text-muted-foreground">
                    You need{' '}
                    <span className="font-mono font-medium text-foreground">
                      {gap.marksNeeded}
                    </span>{' '}
                    more marks to reach rank {targetRank.toLocaleString()} (band {gap.bandLow}–{gap.bandHigh}).
                  </p>
                  <p className="text-muted-foreground">
                    Score gap:{' '}
                    <span className="font-mono font-medium text-foreground">
                      {gap.scoreDiff}
                    </span>{' '}
                    points — plan for the high end of band to absorb normalization.
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
          <p className="text-xs text-muted-foreground">ROI = weightage × potential gain × volatility. Prioritize high-ROI when gap is large.</p>
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
                        {s.volatility === 'volatile' && <span className="text-[10px] text-amber-600">volatile</span>}
                      </div>
                    </td>
                    <td className="px-3 py-2 font-mono text-xs tabular-nums">
                      {s.weightage}%
                    </td>
                    <td className="px-3 py-2 font-mono text-xs tabular-nums">
                      {s.currentEstimate.toFixed(1)}
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
                      ) : i < 6 ? (
                        <span className="text-xs text-amber-600">Medium</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Low</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            ROI uses remaining marks × weightage × volatility. GA excluded. Focus on top-3 when you need +5-10 marks; volatile subjects need buffer.
          </p>
        </CardContent>
      </Card>
    </div>
  )
})
