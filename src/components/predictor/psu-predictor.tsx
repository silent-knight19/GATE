'use client'

import React, { useState, useMemo } from 'react'
import { marksToRankDetailed } from '@/lib/calculators'
import { GATE_CS_STATS } from '@/lib/data/gateStats'
import { PSU_CUTOFFS, getPSUThreshold } from '@/lib/data/psuCutoffs'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { MarksGauge } from './marks-gauge'
import { Building2, Info } from 'lucide-react'

const CATEGORIES = ['General', 'OBC', 'EWS', 'SC', 'ST'] as const
type Category = typeof CATEGORIES[number]
type YearMode = 2026 | 2027

function YearToggle({ year, onChange }: { year: YearMode; onChange: (y: YearMode) => void }) {
  return (
    <div className="flex rounded-lg bg-muted p-1">
      <button onClick={() => onChange(2026)} className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium ${year===2026?'bg-background shadow-sm': 'text-muted-foreground'}`}>2026 Verified</button>
      <button onClick={() => onChange(2027)} className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium ${year===2027?'bg-background shadow-sm': 'text-muted-foreground'}`}>2027 Predicted</button>
    </div>
  )
}

type PSUStatus = 'safe' | 'borderline' | 'below'
function getStatus(delta: number): PSUStatus {
  if (delta >= 30) return 'safe'
  if (delta >= -10) return 'borderline'
  return 'below'
}
const STATUS_CFG: Record<PSUStatus, { label: string; class: string }> = {
  safe: { label: 'Eligible', class: 'bg-green-500/10 text-green-600 border-green-500/20' },
  borderline: { label: 'Borderline', class: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
  below: { label: 'Below cutoff', class: 'bg-red-500/10 text-red-600 border-red-500/20' },
}

export const PsuPredictor = React.memo(function PsuPredictor() {
  const [marks, setMarks] = useState(65)
  const [category, setCategory] = useState<Category>('General')
  const [year, setYear] = useState<YearMode>(2026)

  const pred = useMemo(() => marksToRankDetailed(marks, category, year), [marks, category, year])
  const score = pred.score
  const stat = GATE_CS_STATS[year]

  const ranked = useMemo(() => {
    const list = PSU_CUTOFFS.map(psu => {
      const thr = getPSUThreshold(psu, category)
      const delta = Math.round(score - thr)
      const status = getStatus(delta)
      return { psu, thr, delta, status }
    }).sort((a,b)=> {
      const order: Record<PSUStatus, number> = { safe:0, borderline:1, below:2 }
      if (order[a.status] !== order[b.status]) return order[a.status]-order[b.status]
      return a.thr - b.thr
    })
    return list
  }, [score, category])

  const summary = useMemo(()=> {
    const safe = ranked.filter(r=> r.status==='safe').length
    const border = ranked.filter(r=> r.status==='borderline').length
    return { safe, border, total: ranked.length }
  }, [ranked])

  return (
    <div className="space-y-6">
      <YearToggle year={year} onChange={setYear} />
      <p className="text-xs text-muted-foreground">
        {stat.organizingInstitute} • {year} {year===2027?'projected':'verified'} • Mq {pred.MqCategory} • Mt {pred.Mt} • Score {score} [{pred.scoreBand.low}-{pred.scoreBand.high}] • PSUs use GATE Score (0-1000), current-year only
      </p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Marks</label>
            <Badge variant="outline" className="font-mono tabular-nums">{marks}</Badge>
          </div>
          <Slider value={[marks]} onValueChange={(v)=> setMarks(Array.isArray(v)? v[0]: v)} min={0} max={100} />
          <MarksGauge marks={marks} />
          <p className="text-[10px] text-muted-foreground">Score {score} • {pred.qualified?'Qualified':'Not qualified (<'+pred.MqCategory+')'}</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Category</label>
          <Select value={category} onValueChange={(v)=> v && setCategory(v as Category)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>{CATEGORIES.map(c=> <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
          <p className="text-[10px] text-muted-foreground">PSU thresholds relax ~40-90 for reserved</p>
        </div>

        <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium"><Building2 className="size-3.5"/> Eligibility Summary</div>
          <div className="flex gap-2 text-xs">
            <span className="rounded-full bg-green-500/10 px-2 py-1 text-green-700 ring-1 ring-green-500/20">{summary.safe} Eligible</span>
            <span className="rounded-full bg-yellow-500/10 px-2 py-1 text-yellow-700 ring-1 ring-yellow-500/20">{summary.border} Borderline</span>
            <span className="rounded-full bg-muted px-2 py-1">{summary.total - summary.safe - summary.border} Below</span>
          </div>
          <p className="text-[10px] text-muted-foreground">Score {score} vs thresholds for {category} • {year===2027?'2027 projected thresholds (indicative)':'2026 verified thresholds'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {ranked.map(({psu, thr, delta, status})=> {
          const cfg = STATUS_CFG[status]
          return (
            <Card key={psu.id} className={`${status==='safe'?'border-green-500/20': status==='borderline'?'border-yellow-500/20':''}`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-sm flex items-center gap-2">{psu.name} <span className="text-xs font-normal text-muted-foreground">{psu.tier}</span></CardTitle>
                    <p className="text-xs text-muted-foreground">{psu.fullName}</p>
                  </div>
                  <Badge variant="outline" className={cfg.class}>{cfg.label}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Threshold ({category})</span><span className="font-mono font-medium">{thr} • Δ {delta>=0?`+${delta}`:delta}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Your Score</span><span className="font-mono">{score} [{pred.scoreBand.low}-{pred.scoreBand.high}]</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Salary</span><span>{psu.salaryRange}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Period</span><span>{psu.period} • {psu.vacancies} vacancies</span></div>
                <p className="text-[10px] leading-relaxed text-muted-foreground">{psu.notes} <a href={psu.website} target="_blank" className="underline">Official</a> • {psu.source}</p>
                <div className="flex flex-wrap gap-1">{psu.disciplines.map(d=> <span key={d} className="rounded-full bg-muted px-1.5 py-0.5 text-[10px]">{d}</span>)}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardContent className="pt-6 text-xs leading-relaxed text-muted-foreground">
          <div className="flex gap-1.5 items-center font-medium text-foreground"><Info className="size-3"/> Reliability Note</div>
          <p className="mt-2">PSUs shortlist on GATE Score (0-1000) for current year only, not rank or marks. Scores 700+ needed for ONGC/IOCL CSE; 600+ for BHEL/PGCIL/CIL. Category relaxation applied per notification but actual shortlisting also depends on vacancies and interview. This is indicative planning — always check each PSU&apos;s career page (links above) for exact year and discipline cutoff.</p>
        </CardContent>
      </Card>
    </div>
  )
})
