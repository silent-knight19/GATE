'use client'

import { useState, useMemo } from 'react'
import { marksToRank } from '@/lib/calculators'
import { COLLEGES, type College } from '@/lib/calculators'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { MarksGauge } from './marks-gauge'

const CATEGORIES = ['General', 'OBC', 'EWS', 'SC', 'ST', 'PwD'] as const

const TIER_FILTERS = [
  { value: 'all', label: 'All Institutes' },
  { value: 'IIT', label: 'IITs' },
  { value: 'NIT', label: 'NITs' },
  { value: 'IIIT', label: 'IIITs' },
  { value: 'GFTI', label: 'GFTIs' },
] as const

const TIER_ORDER: College['tier'][] = ['IIT', 'NIT', 'IIIT', 'GFTI']

const TIER_INFO: Record<string, { label: string; short: string }> = {
  IIT: { label: 'Indian Institutes of Technology', short: 'IIT' },
  NIT: { label: 'National Institutes of Technology', short: 'NIT' },
  IIIT: { label: 'Indian Institutes of Information Technology', short: 'IIIT' },
  GFTI: { label: 'Government Funded Technical Institutes', short: 'GFTI' },
}

type Status = 'safe' | 'borderline' | 'reach'

const STATUS: Record<Status, { label: string; class: string }> = {
  safe: {
    label: 'Safe',
    class: 'bg-green-500/10 text-green-600 border-green-500/20',
  },
  borderline: {
    label: 'Borderline',
    class: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  },
  reach: {
    label: 'Reach',
    class: 'bg-red-500/10 text-red-600 border-red-500/20',
  },
}

function getStatus(score: number, cutoff: number): Status {
  if (score >= cutoff + 50) return 'safe'
  if (score >= cutoff) return 'borderline'
  return 'reach'
}

function CollegeCard({ college, score }: { college: College; score: number }) {
  const status = getStatus(score, college.cutoffScore)
  const cfg = STATUS[status]

  return (
    <div className="flex items-start justify-between rounded-lg border p-3 transition-colors hover:bg-muted/30">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {college.tier}
          </span>
          <span className="truncate text-sm font-medium">{college.name}</span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {college.city}, {college.state}
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {college.specializations.map((s) => (
            <span
              key={s}
              className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
      <div className="ml-3 flex shrink-0 flex-col items-end gap-1">
        <Badge variant="outline" className={cfg.class}>
          {cfg.label}
        </Badge>
        <span className="text-[10px] text-muted-foreground tabular-nums">
          Score: {college.cutoffScore.toLocaleString()}+
        </span>
        <span className="max-w-28 text-right text-[10px] text-muted-foreground">
          {college.cutoffSource}
        </span>
      </div>
    </div>
  )
}

export function CollegePredictor() {
  const [marks, setMarks] = useState(60)
  const [category, setCategory] = useState('General')
  const [tierFilter, setTierFilter] = useState('all')

  const predictedRank = useMemo(
    () => marksToRank(marks, category),
    [marks, category],
  )

  const groups = useMemo(() => {
    let list = COLLEGES
    if (tierFilter !== 'all') {
      list = list.filter((c) => c.tier === tierFilter)
    }
    const map: Record<string, College[]> = {}
    for (const t of TIER_ORDER) {
      const items = list.filter((c) => c.tier === t)
      if (items.length > 0) {
        map[t] = items
      }
    }
    return map
  }, [tierFilter])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Marks</label>
            <Badge variant="outline" className="font-mono tabular-nums">
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

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Institute Type</label>
          <Select value={tierFilter} onValueChange={(v) => v !== null && setTierFilter(v)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIER_FILTERS.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">Your Predicted Rank</p>
          <p className="font-mono text-2xl font-bold tabular-nums">
            {predictedRank.expectedRank.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">
            GATE score: <span className="font-mono">{predictedRank.score}</span>
          </p>
        </div>
        <div className="flex gap-3 text-xs">
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-green-500" /> Safe
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-yellow-500" /> Borderline
          </span>
          <span className="flex items-center gap-1">
            <span className="size-2 rounded-full bg-red-500" /> Reach
          </span>
        </div>
      </div>

      {Object.entries(groups).map(([tier, colleges]) => (
        <Card key={tier}>
          <CardHeader>
            <CardTitle>{TIER_INFO[tier]?.label ?? tier}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {colleges.map((college) => (
              <CollegeCard
                key={college.id}
                college={college}
                score={predictedRank.score}
              />
            ))}
          </CardContent>
        </Card>
      ))}

      {Object.keys(groups).length === 0 && (
        <div className="py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No colleges match your current filters.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try adjusting your marks, category, or institute type.
          </p>
        </div>
      )}
    </div>
  )
}
