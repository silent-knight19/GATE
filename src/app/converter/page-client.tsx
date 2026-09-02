'use client'

import { useState, useMemo } from 'react'
import { marksToRankDetailed, rankToMarksDetailed, marksToScoreDetailed } from '@/lib/calculators'
import { GATE_CS_STATS } from '@/lib/data/gateStats'
import { RANK_ANCHORS_2026, RANK_ANCHORS_2027 } from '@/lib/data/rankAnchors'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'

const CATEGORIES = ['General', 'OBC', 'EWS', 'SC', 'ST', 'PwD'] as const
type YearMode = 2026 | 2027

function YearToggle({ year, onChange }: { year: YearMode; onChange: (y: YearMode) => void }) {
  return (
    <div className="flex rounded-lg bg-muted p-1 w-fit">
      <button onClick={() => onChange(2026)} className={`rounded-md px-3 py-1.5 text-xs font-medium ${year===2026?'bg-background shadow-sm':'text-muted-foreground'}`}>2026 Verified</button>
      <button onClick={() => onChange(2027)} className={`rounded-md px-3 py-1.5 text-xs font-medium ${year===2027?'bg-background shadow-sm':'text-muted-foreground'}`}>2027 Predicted</button>
    </div>
  )
}

export default function ConverterPage() {
  const [marks, setMarks] = useState(60)
  const [category, setCategory] = useState<string>('General')
  const [targetRank, setTargetRank] = useState(500)
  const [rankCategory, setRankCategory] = useState<string>('General')
  const [year, setYear] = useState<YearMode>(2026)

  const result = useMemo(() => marksToRankDetailed(marks, category, year), [marks, category, year])
  const scoreInfo = useMemo(() => marksToScoreDetailed(marks, year), [marks, year])
  const required = useMemo(() => rankToMarksDetailed(targetRank, rankCategory, year), [targetRank, rankCategory, year])
  const stat = GATE_CS_STATS[year]

  const referenceTable = useMemo(() => {
    const anchors = year === 2026 ? RANK_ANCHORS_2026 : RANK_ANCHORS_2027
    return anchors.filter(a=> a.marks>=40).map(a=> ({ marks:a.marks, score:a.score, rank:a.rank }))
  }, [year])

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Converter</h1>
          <p className="text-sm text-muted-foreground">GATE CS score and estimated AIR — {stat.organizingInstitute} {year} {stat.confidence} {year===2027? '± band' : ''}</p>
        </div>
        <YearToggle year={year} onChange={setYear} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
          <CardTitle>Marks → Score → Estimated AIR</CardTitle>
          <p className="text-xs text-muted-foreground">{scoreInfo.method} • Mq {result.Mq} • Mt {result.Mt}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Marks (out of 100)</label>
              <Slider value={[marks]} onValueChange={(v)=> setMarks(Array.isArray(v)? v[0]: v)} min={0} max={100} className="mt-2" />
              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span className="font-mono font-bold text-foreground">{marks} • Score {result.score} [{result.scoreBand.low}-{result.scoreBand.high}]</span>
                <span>100</span>
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">Qualifying {category}: {result.MqCategory} • {result.qualified?'Qualified':'Not qualified'}</div>
            </div>

            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-lg border bg-card px-3 py-2 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">GATE Score</span>
                <span className="font-mono font-bold">{result.score} <span className="text-xs font-normal text-muted-foreground">[{result.scoreBand.low}-{result.scoreBand.high}]</span></span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Estimated AIR</span>
                <span className="font-mono font-bold">
                  {result.qualified && result.expectedRank ? `${result.expectedRank.toLocaleString()} [${result.rankRange?.low.toLocaleString()}–${result.rankRange?.high.toLocaleString()}]` : '— Not qualified'}
                </span>
              </div>
              {result.qualified && result.percentile !== null && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Percentile</span><span>{result.percentile.toFixed(2)}% • {stat.appeared.toLocaleString()} appeared</span>
                </div>
              )}
              <p className="text-[10px] text-muted-foreground">{result.method} • {result.confidence} confidence</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
          <CardTitle>Marks Required for Target Rank</CardTitle>
          <p className="text-xs text-muted-foreground">{required.method}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Target Rank</label>
              <input
                type="number"
                min={1}
                max={50000}
                value={targetRank}
                onChange={(e) => setTargetRank(Math.max(1, Number(e.target.value)))}
                className="mt-1 w-full rounded-lg border bg-card px-3 py-2 text-sm font-mono"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Category</label>
              <select
                value={rankCategory}
                onChange={(e) => setRankCategory(e.target.value)}
                className="mt-1 w-full rounded-lg border bg-card px-3 py-2 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Required Marks</span>
                <span className="font-mono font-bold">{required.marks} <span className="text-xs font-normal">[{required.band.low}-{required.band.high}]</span></span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Projected Score</span>
                <span className="font-mono font-bold">{required.score} <span className="text-xs font-normal">[{required.scoreBand.low}-{required.scoreBand.high}]</span></span>
              </div>
              <p className="text-[10px] text-muted-foreground">Band ±2-3 marks for session normalization.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estimated Marks → Score → AIR Reference ({year})</CardTitle>
          <p className="text-xs text-muted-foreground">Verified anchors — click to set marks. {year===2027?'Projected 2027 uses 2026 shape +5% rank inflation':''}</p>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Marks</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Score</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Rank</th>
              </tr>
            </thead>
            <tbody>
              {referenceTable.map((e, i) => (
                <tr key={i} onClick={()=> setMarks(e.marks)} className="cursor-pointer border-b border-border/40 hover:bg-muted/40 transition-colors">
                  <td className="px-3 py-2 font-mono text-xs">{e.marks}</td>
                  <td className="px-3 py-2 font-mono text-xs">{e.score}</td>
                  <td className="px-3 py-2 font-mono text-xs">{e.rank.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
