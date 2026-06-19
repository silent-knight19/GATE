'use client'

import React, { useState, useMemo } from 'react'
import { marksToRank } from '@/lib/calculators'
import { categoryQualifyingRatios, gateCs2025Stats, rankMapping } from '@/lib/data/rankMapping'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { MarksGauge } from './marks-gauge'
import { Info } from 'lucide-react'

const CATEGORIES = ['General', 'OBC', 'EWS', 'SC', 'ST', 'PwD'] as const

export const MarksConverter = React.memo(function MarksConverter() {
  const [marks, setMarks] = useState(60)
  const [category, setCategory] = useState('General')

  const result = useMemo(() => {
    return marksToRank(marks, category)
  }, [marks, category])

  const referenceTable = useMemo(() => {
    return rankMapping
      .filter((e) => e.category === 'General')
      .filter((e, i, arr) => i === 0 || e.minMarks !== arr[i - 1].minMarks)
      .map((e) => ({
        ...e,
        scoreMid: Math.round((e.minScore + e.maxScore) / 2),
        rankMid: Math.round((e.minRank + e.maxRank) / 2),
      }))
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Marks → Score → Rank</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Raw Marks (out of 100)</label>
                <Badge variant="outline" className="font-mono text-base tabular-nums">
                  {marks}
                </Badge>
              </div>
              <Slider value={[marks]} onValueChange={(v) => setMarks(Array.isArray(v) ? v[0] : v)} min={0} max={100} />
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
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">GATE Score</span>
                <span className="font-mono text-lg font-bold tabular-nums">{result.score}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Expected Rank</span>
                <span className="font-mono text-lg font-bold tabular-nums">
                  {result.expectedRank.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Category-adjusted range</span>
                <span className="font-mono tabular-nums">
                  {result.minRank.toLocaleString()} – {result.maxRank.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              GATE score uses the official score formula calibrated with GATE 2025 CS statistics.
              Rank is an all-India planning estimate because official GATE reports do not publish a
              complete marks-to-AIR table.
            </p>
            <div className="mt-3 rounded-lg border bg-muted/30 p-3 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                <Info className="size-3" />
                Qualifying Mark Ratios
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {Object.entries(categoryQualifyingRatios).map(([cat, mult]) => (
                  <span key={cat} className="text-muted-foreground">
                    {cat}: ×{mult}
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                AIR is not category-adjusted. Ratios affect qualifying marks only. GATE 2025 CS:
                {` ${gateCs2025Stats.appeared.toLocaleString()} appeared, ${gateCs2025Stats.qualified.toLocaleString()} qualified.`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estimated Reference Table (CS)</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Marks
                </th>
                <th className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Score
                </th>
                <th className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Rank Range
                </th>
                <th className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Mid Rank
                </th>
              </tr>
            </thead>
            <tbody>
              {referenceTable.map((e, i) => (
                <tr
                  key={i}
                  className="border-b border-border/40 transition-colors hover:bg-muted/40"
                >
                  <td className="px-3 py-2 font-mono text-xs tabular-nums">
                    {e.minMarks}–{e.maxMarks}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs tabular-nums">
                    {e.minScore}–{e.maxScore}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs tabular-nums">
                    {e.minRank.toLocaleString()}–{e.maxRank.toLocaleString()}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs tabular-nums">
                    {e.rankMid.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
})
