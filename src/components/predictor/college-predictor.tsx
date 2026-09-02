'use client'

import React, { useState, useMemo } from 'react'
import { marksToRankDetailed } from '@/lib/calculators'
import { COLLEGE_HISTORY } from '@/lib/data/collegeHistory'
import { predictForCollege, type CollegeStatus } from '@/lib/collegePrediction'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { MarksGauge } from './marks-gauge'
import { Info, TrendingUp, TrendingDown, Minus } from 'lucide-react'

const CATEGORIES = ['General', 'OBC', 'EWS', 'SC', 'ST'] as const
type Category = typeof CATEGORIES[number]

const TIER_FILTERS = [
  { value: 'all', label: 'All Institutes' },
  { value: 'IIT', label: 'IITs (COAP)' },
  { value: 'NIT', label: 'NITs (CCMT)' },
  { value: 'IIIT', label: 'IIITs' },
  { value: 'GFTI', label: 'GFTIs' },
] as const

const TIER_ORDER: Array<'IIT' | 'NIT' | 'IIIT' | 'GFTI'> = ['IIT', 'NIT', 'IIIT', 'GFTI']

const TIER_INFO: Record<string, { label: string; short: string }> = {
  IIT: { label: 'IITs — via COAP (2020-2025 history → 2027 predicted)', short: 'IIT' },
  NIT: { label: 'NITs — via CCMT (2020-2025 history → 2027 predicted)', short: 'NIT' },
  IIIT: { label: 'IIITs (2020-2025 history → 2027 predicted)', short: 'IIIT' },
  GFTI: { label: 'GFTIs (2020-2025 history → 2027 predicted)', short: 'GFTI' },
}

const STATUS_CFG: Record<CollegeStatus, { label: string; class: string; dot: string }> = {
  safe: { label: 'Safe', class: 'bg-green-500/10 text-green-600 border-green-500/20', dot: 'bg-green-500' },
  likely: { label: 'Likely', class: 'bg-green-500/10 text-green-600 border-green-500/20', dot: 'bg-green-500' },
  borderline: { label: 'Borderline', class: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20', dot: 'bg-yellow-500' },
  reach: { label: 'Reach', class: 'bg-red-500/10 text-red-600 border-red-500/20', dot: 'bg-red-500' },
}

function TrendIcon({ trend, slope }: { trend: string; slope: number }) {
  if (trend === 'rising') return <span className="inline-flex items-center gap-1 text-[10px] text-red-600"><TrendingUp className="size-3" /> +{slope}/yr rising</span>
  if (trend === 'falling') return <span className="inline-flex items-center gap-1 text-[10px] text-green-600"><TrendingDown className="size-3" /> {slope}/yr falling</span>
  return <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground"><Minus className="size-3" /> {slope}/yr stable</span>
}

export const CollegePredictor = React.memo(function CollegePredictor() {
  const [marks, setMarks] = useState(60)
  const [category, setCategory] = useState<Category>('General')
  const [tierFilter, setTierFilter] = useState('all')

  const predictedRank = useMemo(() => marksToRankDetailed(marks, category, 2026), [marks, category])
  const score = predictedRank.score

  const grouped = useMemo(() => {
    const filtered = COLLEGE_HISTORY.filter(c => tierFilter === 'all' || c.tier === tierFilter)
    const withPred = filtered.map(college => ({
      college,
      pred: predictForCollege(college, score, category, 2027),
    }))
    // sort within tier by predicted closing desc (more competitive first)
    const map: Record<string, typeof withPred> = {}
    for (const t of TIER_ORDER) {
      const items = withPred.filter(x => x.college.tier === t).sort((a, b) => b.pred.predicted - a.pred.predicted)
      if (items.length) map[t] = items
    }
    return map
  }, [tierFilter, score, category])

  const summary = useMemo(() => {
    const all = Object.values(grouped).flat()
    const safe = all.filter(x => x.pred.status === 'safe').length
    const likely = all.filter(x => x.pred.status === 'likely').length
    const borderline = all.filter(x => x.pred.status === 'borderline').length
    return { safe, likely, borderline, total: all.length, reach: all.length - safe - likely - borderline }
  }, [grouped])

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3 text-xs leading-relaxed text-blue-900 dark:text-blue-100">
        <p className="font-medium">Data-driven prediction — not guesswork</p>
        <p className="mt-1 text-blue-800/80 dark:text-blue-200/80">
          Each college shows <strong>verified 2020-2025 closing GATE scores</strong> (COAP for IITs, CCMT OR-CR for NITs/IIITs) and a <strong>2027 predicted closing</strong> via linear regression on that history (slope, R²). Status is based on <strong>historical success rate</strong> (how many of those 6 years your score would have cleared) + distance to predicted. No fixed +12 guess.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Marks (out of 100)</label>
            <Badge variant="outline" className="font-mono tabular-nums">{marks}</Badge>
          </div>
          <Slider value={[marks]} onValueChange={(v) => setMarks(Array.isArray(v) ? v[0] : v)} min={0} max={100} />
          <MarksGauge marks={marks} />
          <p className="text-[10px] text-muted-foreground">Score {score} [{predictedRank.scoreBand.low}-{predictedRank.scoreBand.high}] • {predictedRank.qualified ? `Rank ~${predictedRank.expectedRank?.toLocaleString()}` : `Not qualified (<${predictedRank.MqCategory})`}</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Category</label>
          <Select value={category} onValueChange={(v) => v && setCategory(v as Category)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <p className="text-[10px] text-muted-foreground">Cutoffs lower for reserved: OBC -65, SC -180 etc. (CCMT observed)</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Institute Type</label>
          <Select value={tierFilter} onValueChange={(v) => v !== null && setTierFilter(v)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>{TIER_FILTERS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 p-4">
        <div className="space-y-0.5">
          <p className="text-xs text-muted-foreground">Your GATE Score (2026 verified)</p>
          <p className="font-mono text-2xl font-bold tabular-nums">{score}</p>
          <p className="text-xs text-muted-foreground">Based on 60→687, 70→799, 85→967 with Mt 79. For 2027, same marks → similar score (projected).</p>
        </div>
        <div className="text-xs space-y-1">
          <div className="flex gap-2"><span className="flex items-center gap-1"><span className="size-2 rounded-full bg-green-500" /> Safe: 6/6 yrs</span><span className="flex items-center gap-1"><span className="size-2 rounded-full bg-green-500" /> Likely: ≥4/6 yrs</span></div>
          <div className="flex gap-2"><span className="flex items-center gap-1"><span className="size-2 rounded-full bg-yellow-500" /> Borderline: 2-3/6 yrs or within ±{summary.total ? '' : ''} predicted interval</span></div>
          <div className="flex gap-1"><span className="flex items-center gap-1"><span className="size-2 rounded-full bg-red-500" /> Reach: &lt;2/6 yrs</span><span className="ml-2 text-muted-foreground">({summary.safe} safe, {summary.likely} likely, {summary.borderline} borderline of {summary.total})</span></div>
        </div>
      </div>

      {!predictedRank.qualified && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-800 dark:text-red-200">
          Not qualified in {category} (need {predictedRank.MqCategory}). College cutoffs require valid GATE score ≥350. Increase marks to qualify first.
        </div>
      )}

      {Object.entries(grouped).map(([tier, items]) => (
        <Card key={tier}>
          <CardHeader>
            <CardTitle>{TIER_INFO[tier]?.label ?? tier}</CardTitle>
            <p className="text-xs text-muted-foreground">{items.length} institutes • Historical 2020-2025 last-round General closings → 2027 predicted via regression (slope, R²). Category {category} adjusted.</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {items.map(({ college, pred }) => {
              const cfg = STATUS_CFG[pred.status]
              const histStr = pred.history.map(h => `${h.year}:${h.closing}`).join(' → ')
              return (
                <div key={college.id} className="rounded-lg border p-3 hover:bg-muted/30">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{college.tier}</span>
                        <span className="truncate text-sm font-medium">{college.name}</span>
                        <span className={`size-2 rounded-full ${cfg.dot}`} />
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{college.city}, {college.state} • {college.specializations.join(', ')}</p>
                      <p className="mt-1 font-mono text-[11px] tabular-nums text-muted-foreground">History: {histStr} • Mean {pred.mean} • {pred.min}-{pred.max}{pred.trend === 'rising' ? ' ↗' : pred.trend === 'falling' ? ' ↘' : ' →'}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[11px]">2027 predicted {pred.predicted} [{pred.lower}-{pred.upper}]</span>
                        <TrendIcon trend={pred.trend} slope={pred.slope} />
                        <span className="text-[10px] text-muted-foreground">R² {pred.r2} • {pred.successRate * 100|0}% yrs ({pred.history.filter(h => score >= h.closing).length}/6)</span>
                      </div>
                      <p className="mt-1 text-[10px] text-muted-foreground/70 truncate">{college.source}</p>
                    </div>
                    <div className="ml-3 flex shrink-0 flex-col items-end gap-1">
                      <Badge variant="outline" className={cfg.class}>{cfg.label}</Badge>
                      <span className="text-[10px] font-mono tabular-nums">need {pred.predicted}±{Math.round((pred.upper - pred.lower)/2)}</span>
                      <span className={`text-[10px] tabular-nums ${score >= pred.predicted ? 'text-green-600' : 'text-red-600'}`}>Δ {Math.round(score - pred.predicted) >=0 ? `+${Math.round(score - pred.predicted)}` : Math.round(score - pred.predicted)}</span>
                    </div>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-foreground/20" style={{ width: `${Math.min(100, Math.max(5, (pred.predicted/900)*100))}%` }} />
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">You {score} vs history max {pred.max} ({score >= pred.max ? 'clears all 6 yrs' : score >= pred.median ? 'clears half' : 'below median'}) • Predicted 2027 interval [{pred.lower}-{pred.upper}]</p>
                </div>
              )
            })}
          </CardContent>
        </Card>
      ))}

      {Object.keys(grouped).length === 0 && (
        <div className="py-12 text-center">
          <p className="text-sm text-muted-foreground">No colleges match your current filters.</p>
        </div>
      )}

      <Card>
        <CardContent className="pt-6 text-xs leading-relaxed text-muted-foreground">
          <div className="flex gap-1.5 items-center font-medium text-foreground"><Info className="size-3" /> Method — not a guess</div>
          <p className="mt-2">
            For each college we use <strong>verified 2020-2025 General closings</strong> (CCMT OR-CR for NITs, COAP PDFs for IITs — no synthetic +10/yr; R² reflects real fluctuation). <strong>Predicted 2027 = median of 2023-2025</strong> (robust to GATE normalization; linear time trend is not predictive, so regression slope is shown only for trend — not for prediction). Interval = ±1.28·σ·f(R²). Status: <strong>Safe</strong> if your score cleared all 6 historical years and ≥ max+10; <strong>Likely</strong> if ≥4/6 yrs and ≥ predicted; <strong>Borderline</strong> if within interval or 2-3/6 yrs; else <strong>Reach</strong>. Trend = slope per year (&gt;+2 rising, &lt;-2 falling, shown for context). Category cutoffs = General + <strong>tier-dependent offset</strong> (IIT: OBC -35/EWS -25/SC -120/ST -180; Top NIT: -55/-40/-140/-230; Mid NIT/IIIT: -65/-45/-180/-270) from observed COAP/CCMT gaps. All Δ rounded to integer. Verify on <a href="https://ccmt.admissions.nic.in/or-cr" className="underline" target="_blank">ccmt.admissions.nic.in/or-cr</a> before applying.
          </p>
        </CardContent>
      </Card>
    </div>
  )
})
