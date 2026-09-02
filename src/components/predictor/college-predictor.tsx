'use client'

import React, { useState, useMemo } from 'react'
import { marksToRankDetailed } from '@/lib/calculators'
import { COLLEGE_CUTOFFS } from '@/lib/data/collegeCutoffs'
import { GATE_CS_STATS } from '@/lib/data/gateStats'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { MarksGauge } from './marks-gauge'
import { Info } from 'lucide-react'

const CATEGORIES = ['General', 'OBC', 'EWS', 'SC', 'ST'] as const
type Category = typeof CATEGORIES[number]
type YearMode = 2026 | 2027

const TIER_FILTERS = [
  { value: 'all', label: 'All Institutes' },
  { value: 'IIT', label: 'IITs (COAP)' },
  { value: 'NIT', label: 'NITs (CCMT)' },
  { value: 'IIIT', label: 'IIITs' },
  { value: 'GFTI', label: 'GFTIs' },
] as const

const TIER_ORDER: Array<'IIT' | 'NIT' | 'IIIT' | 'GFTI'> = ['IIT', 'NIT', 'IIIT', 'GFTI']

const TIER_INFO: Record<string, { label: string; short: string }> = {
  IIT: { label: 'IITs — via COAP', short: 'IIT' },
  NIT: { label: 'NITs — via CCMT', short: 'NIT' },
  IIIT: { label: 'Indian Institutes of Information Technology', short: 'IIIT' },
  GFTI: { label: 'Government Funded Technical Institutes', short: 'GFTI' },
}

type Status = 'safe' | 'borderline' | 'reach'

const STATUS: Record<Status, { label: string; class: string }> = {
  safe: { label: 'Safe', class: 'bg-green-500/10 text-green-600 border-green-500/20' },
  borderline: { label: 'Borderline', class: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
  reach: { label: 'Reach', class: 'bg-red-500/10 text-red-600 border-red-500/20' },
}

function getStatus(score: number, closing: number): Status {
  const delta = score - closing
  if (delta >= 25) return 'safe'
  if (delta >= -15) return 'borderline'
  return 'reach'
}

function CollegeCard({ college, score, closing, opening, source, projected }: { college: { name: string; tier: string; city: string; state: string; specializations: string[] }; score: number; closing: number; opening?: number; source: string; projected?: boolean }) {
  const status = getStatus(score, closing)
  const cfg = STATUS[status]
  const delta = Math.round(score - closing)
  return (
    <div className="flex items-start justify-between rounded-lg border p-3 transition-colors hover:bg-muted/30">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{college.tier}</span>
          <span className="truncate text-sm font-medium">{college.name}</span>
          {projected && <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-medium text-amber-700 ring-1 ring-amber-500/20">projected</span>}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {college.city}, {college.state} • Closing {closing} {opening ? `• R1 ${opening}` : ''} • Δ {delta >= 0 ? `+${delta}` : delta}
        </p>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {college.specializations.map((s) => (
            <span key={s} className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {s}
            </span>
          ))}
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground/70 truncate max-w-[260px]">{source}</p>
      </div>
      <div className="ml-3 flex shrink-0 flex-col items-end gap-1">
        <Badge variant="outline" className={cfg.class}>
          {cfg.label}
        </Badge>
        <span className="text-[10px] text-muted-foreground tabular-nums">needs {closing}+</span>
      </div>
    </div>
  )
}

function YearToggle({ year, onChange }: { year: YearMode; onChange: (y: YearMode) => void }) {
  return (
    <div className="flex rounded-lg bg-muted p-1">
      <button onClick={() => onChange(2026)} className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium ${year===2026?'bg-background shadow-sm': 'text-muted-foreground'}`}>2026 Verified</button>
      <button onClick={() => onChange(2027)} className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium ${year===2027?'bg-background shadow-sm': 'text-muted-foreground'}`}>2027 Predicted</button>
    </div>
  )
}

export const CollegePredictor = React.memo(function CollegePredictor() {
  const [marks, setMarks] = useState(60)
  const [category, setCategory] = useState<Category>('General')
  const [tierFilter, setTierFilter] = useState('all')
  const [year, setYear] = useState<YearMode>(2026)

  const predicted = useMemo(() => marksToRankDetailed(marks, category, year), [marks, category, year])
  const score = predicted.score
  const stat = GATE_CS_STATS[year]

  const groups = useMemo(() => {
    const filtered = COLLEGE_CUTOFFS.filter(c => c.year === year && c.category === category && (tierFilter === 'all' || c.tier === tierFilter))
    // Deduplicate by name keep latest (should be unique per year+category)
    const byName = new Map<string, typeof filtered[0]>()
    for (const c of filtered) {
      if (!byName.has(c.name)) byName.set(c.name, c)
    }
    const list = Array.from(byName.values())
    const map: Record<string, typeof list> = {}
    for (const t of TIER_ORDER) {
      const items = list.filter(c => c.tier === t).sort((a,b)=> b.closing - a.closing)
      if (items.length) map[t]=items
    }
    return map
  }, [tierFilter, year, category])

  return (
    <div className="space-y-6">
      <YearToggle year={year} onChange={setYear} />
      <p className="text-xs text-muted-foreground">{stat.organizingInstitute} • {year} {year===2027?'projected +12 trend': 'verified OR-CR last round'} • Category {category} • Mq {predicted.MqCategory} • Mt {predicted.Mt} • Score {score} [{predicted.scoreBand.low}-{predicted.scoreBand.high}]</p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Marks</label>
            <Badge variant="outline" className="font-mono tabular-nums">{marks}</Badge>
          </div>
          <Slider value={[marks]} onValueChange={(v)=> setMarks(Array.isArray(v)?v[0]:v)} min={0} max={100} />
          <MarksGauge marks={marks} />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Category</label>
          <Select value={category} onValueChange={(v)=> v && setCategory(v as Category)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>{CATEGORIES.map(c=> <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <p className="text-[10px] text-muted-foreground">Filters CCMT/COAP category cutoffs</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Institute Type</label>
          <Select value={tierFilter} onValueChange={(v)=> v!==null && setTierFilter(v)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>{TIER_FILTERS.map(t=> <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Year</label>
          <Select value={String(year)} onValueChange={(v)=> setYear(Number(v) as YearMode)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="2026">2026 Verified</SelectItem>
              <SelectItem value="2027">2027 Predicted</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">Your Predicted Rank ({category})</p>
          <p className="font-mono text-2xl font-bold tabular-nums">{predicted.qualified && predicted.expectedRank ? predicted.expectedRank.toLocaleString() : 'Not Qualified'}</p>
          <p className="text-xs text-muted-foreground">GATE score: <span className="font-mono">{score}</span> [{predicted.scoreBand.low}-{predicted.scoreBand.high}] {predicted.confidence} • {predicted.qualified?`Qualified`: `Need ${predicted.MqCategory}+`}</p>
        </div>
        <div className="flex gap-3 text-xs">
          <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-green-500"/> Safe (+25)</span>
          <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-yellow-500"/> Borderline (-15..+25)</span>
          <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-red-500"/> Reach</span>
        </div>
      </div>

      {!predicted.qualified && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-800 dark:text-red-200">
          Not qualified in {category} (need {predicted.MqCategory}). College cutoffs require valid GATE score ≥350. Increase marks to qualify first.
        </div>
      )}

      {Object.entries(groups).map(([tier, colleges]) => (
        <Card key={tier}>
          <CardHeader>
            <CardTitle>{TIER_INFO[tier]?.label ?? tier}</CardTitle>
            <p className="text-xs text-muted-foreground">{year===2026?'Verified OR-CR last round':'Projected 2027 +12 trend from 2026'} • {category} • {colleges.length} institutes</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {colleges.map((c)=> (
              <CollegeCard key={c.id} college={c} score={score} closing={c.closing} opening={c.opening} source={c.source} projected={c.projected} />
            ))}
          </CardContent>
        </Card>
      ))}

      {Object.keys(groups).length===0 && (
        <div className="py-12 text-center">
          <p className="text-sm text-muted-foreground">No colleges match your current filters.</p>
          <p className="mt-1 text-xs text-muted-foreground">Try adjusting marks, category, institute type or year.</p>
        </div>
      )}

      <Card>
        <CardContent className="pt-6 text-xs leading-relaxed text-muted-foreground">
          <div className="flex gap-1.5 items-center font-medium text-foreground"><Info className="size-3"/> Method & Sources</div>
          <p className="mt-2">COAP cutoffs are closing GATE scores for M.Tech CSE (CSE/related). CCMT cutoffs are last-round closing scores from <a href="https://ccmt.admissions.nic.in/or-cr" className="underline" target="_blank">ccmt.admissions.nic.in/or-cr</a>. IIT trend 2023→2025 shown via stored 2023/2024 estimates; 2027 projected +12 accounts for rising competition (Trichy 637→747). Category offsets from observed gaps: OBC -65, EWS -45, SC -180, ST -270. Verify on official portal for your exact branch/category before applying.</p>
        </CardContent>
      </Card>
    </div>
  )
})
