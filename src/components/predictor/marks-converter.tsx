'use client'

import React, { useState, useMemo } from 'react'
import { marksToRankDetailed, marksToScoreDetailed } from '@/lib/calculators'
import { GATE_CS_STATS } from '@/lib/data/gateStats'
import { RANK_ANCHORS_2026, RANK_ANCHORS_2027 } from '@/lib/data/rankAnchors'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { MarksGauge } from './marks-gauge'
import { Info, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'

const CATEGORIES = ['General', 'OBC', 'EWS', 'SC', 'ST', 'PwD'] as const
type YearMode = 2026 | 2027

function YearToggle({ year, onChange }: { year: YearMode; onChange: (y: YearMode) => void }) {
  return (
    <div className="flex rounded-lg bg-muted p-1">
      <button
        onClick={() => onChange(2026)}
        className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${year === 2026 ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
      >
        2026 Verified
      </button>
      <button
        onClick={() => onChange(2027)}
        className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${year === 2027 ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
      >
        2027 Predicted
      </button>
    </div>
  )
}

export const MarksConverter = React.memo(function MarksConverter() {
  const [marks, setMarks] = useState(60)
  const [category, setCategory] = useState('General')
  const [year, setYear] = useState<YearMode>(2026)

  const result = useMemo(() => marksToRankDetailed(marks, category, year), [marks, category, year])
  const scoreInfo = useMemo(() => marksToScoreDetailed(marks, year), [marks, year])
  const stat = GATE_CS_STATS[year]

  const referenceAnchors = useMemo(() => (year === 2026 ? RANK_ANCHORS_2026 : RANK_ANCHORS_2027).filter((a) => a.marks >= 40), [year])

  const isPredicted = year === 2027

  return (
    <div className="space-y-6">
      <YearToggle year={year} onChange={setYear} />
      {isPredicted ? (
        <div className="flex gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-800 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          <span>
            2027 is a projection (Mq {stat.Mq.General} ±2, Mt {stat.Mt} ±3). Use as planning band. Verified values will replace after IIT Madras publishes the 2027 report.
          </span>
        </div>
      ) : (
        <div className="flex gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-3 text-xs leading-relaxed text-green-800 dark:text-green-200">
          <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" />
          <span>
            2026 verified — IIT Guwahati gate2026.iitg.ac.in/cut-off.html (CS 259922 registered, 211020 appeared, cutoffs Gen 30, OBC 27, SC 20, topper Maninder 92.57→1000). Mt {stat.Mt} provisional pending statistical report; score band ±25 covers uncertainty.
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Marks → Score → Rank</CardTitle>
            <p className="text-xs text-muted-foreground">
              {stat.organizingInstitute} • {year} • {stat.confidence} • {stat.source}
            </p>
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
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Qualifying {category}: {result.MqCategory}</span>
                <span>Mt (top 0.1%): {result.Mt} {year===2026?'*prov.':''}</span>
              </div>
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

            <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
              <div className="flex items-center gap-2">
                {result.qualified ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-500/20 dark:text-green-300">
                    <CheckCircle2 className="size-3" /> Qualified ({category})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-500/20 dark:text-red-300">
                    <XCircle className="size-3" /> Not Qualified — below {result.MqCategory}
                  </span>
                )}
                <span className="ml-auto text-[10px] text-muted-foreground">{result.confidence} confidence • {isPredicted ? 'projected' : 'verified'}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">GATE Score</span>
                <div className="text-right">
                  <span className="font-mono text-lg font-bold tabular-nums">{result.score}</span>
                  <span className="ml-2 text-xs tabular-nums text-muted-foreground">[{result.scoreBand.low}–{result.scoreBand.high}]</span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">Formula: {scoreInfo.method} → {result.score} (clamped 0–1000, topper 1000)</p>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Expected Rank</span>
                <div className="text-right">
                  {result.qualified && result.expectedRank ? (
                    <>
                      <span className="font-mono text-lg font-bold tabular-nums">{result.expectedRank.toLocaleString()}</span>
                      {result.rankRange && (
                        <span className="ml-2 text-xs tabular-nums text-muted-foreground">
                          [{result.rankRange.low.toLocaleString()}–{result.rankRange.high.toLocaleString()}]
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-sm font-medium text-muted-foreground">— No AIR (not qualified)</span>
                  )}
                </div>
              </div>
              {result.qualified && result.percentile !== null && (
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Percentile (est.)</span>
                  <span className="font-mono tabular-nums">{result.percentile.toFixed(2)}%ile • {stat.appeared.toLocaleString()} appeared</span>
                </div>
              )}
              {!result.qualified && (
                <p className="text-xs text-muted-foreground">
                  Marks below {result.MqCategory} do not receive AIR. You would need +{(result.MqCategory - marks).toFixed(1)} marks to qualify in {category}.
                </p>
              )}
            </div>

            <div className="rounded-lg border bg-muted/10 p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <Info className="size-3" /> How this is calculated
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Score uses official brochure formula with 2026 verified Mq=30, Mt=79 (mean top 0.1% provisional; topper 92.57 &gt; Mt so score &gt;1000 capped to 1000, hence 90→~990+). Rank uses log-linear interpolation of 2026 verified anchors (92.57→1/1000, 85→7/967, 65→350/743, 59→750/676, 53→1500/608, 45→3500/518) per PW/careers360/zollege consensus for 211k appeared — not arbitrary brackets. Example: 60 marks → Score 350+550×30/49≈687, Rank ~1200 (within 500-1000 band). Band ±12 reflects session normalization.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reference Anchors ({year} {isPredicted ? 'projected' : 'verified'})</CardTitle>
            <p className="text-xs text-muted-foreground">Tap to set marks. 2026: 92.57→1/1000, 85→7/967, 65→350/743, 59→750/676, 45→3500/518 — 211k appeared (PW/careers360 consensus).</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="px-2 py-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Marks</th>
                    <th className="px-2 py-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Score</th>
                    <th className="px-2 py-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Rank</th>
                  </tr>
                </thead>
                <tbody>
                  {referenceAnchors.map((a, i) => (
                    <tr
                      key={i}
                      onClick={() => setMarks(a.marks)}
                      className="cursor-pointer border-b border-border/40 transition-colors hover:bg-muted/40"
                    >
                      <td className="px-2 py-1.5 font-mono text-xs tabular-nums">{a.marks}</td>
                      <td className="px-2 py-1.5 font-mono text-xs tabular-nums">{a.score}</td>
                      <td className="px-2 py-1.5 font-mono text-xs tabular-nums">{a.rank.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5">
              <p className="text-xs font-medium">Why not a single rank?</p>
              <p className="text-xs text-muted-foreground">
                CSE is 2 sessions (normalization). Same raw 70 can map to slightly different normalized marks. Plus appeared jumped 170k (2025) → 211k (2026). We show interval ±20-35% calibrated to year.
              </p>
              <p className="text-[10px] text-muted-foreground">Sources: gate2026.iitg.ac.in/cut-off.html (CS 259922 reg 211020 app), all-india-rank.html (Maninder 92.57); statistical report pending for Mt; anchors use verified topper + scaled 2025 distribution.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
})
