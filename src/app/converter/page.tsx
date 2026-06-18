'use client'

import { useState, useMemo } from 'react'
import { marksToScore, marksToRank, rankToMarks } from '@/lib/calculators'
import { rankMapping } from '@/lib/data/rankMapping'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

const CATEGORIES = ['General', 'OBC', 'EWS', 'SC', 'ST', 'PwD'] as const

function Thermometer({ marks }: { marks: number }) {
  const pct = Math.min(100, Math.max(0, marks))
  const color = pct >= 80 ? '#22c55e' : pct >= 60 ? '#3b82f6' : pct >= 40 ? '#f59e0b' : '#ef4444'
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-4 flex-1 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="font-mono text-sm font-bold w-12 text-right">{marks}</span>
    </div>
  )
}

export default function ConverterPage() {
  const [marks, setMarks] = useState(60)
  const [category, setCategory] = useState<string>('General')
  const [targetRank, setTargetRank] = useState(500)
  const [rankCategory, setRankCategory] = useState<string>('General')

  const result = useMemo(() => {
    const score = marksToScore(marks)
    const rank = marksToRank(marks, category)
    return { ...rank, score }
  }, [marks, category])

  const required = useMemo(() => {
    return rankToMarks(targetRank, rankCategory)
  }, [targetRank, rankCategory])

  const referenceTable = useMemo(() => {
    const seen = new Set<number>()
    const uniq = rankMapping.filter((e) => {
      if (e.category !== 'General') return false
      const key = e.minMarks
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    return uniq.map((e) => {
      const scoreMid = Math.round((e.minScore + e.maxScore) / 2)
      const rankMid = Math.round((e.minRank + e.maxRank) / 2)
      return { ...e, scoreMid, rankMid }
    })
  }, [])

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Converter</h1>
        <p className="text-sm text-muted-foreground">GATE CS score and estimated AIR planning tools</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
          <CardTitle>Marks {'->'} Score {'->'} Estimated AIR</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Marks (out of 100)</label>
              <input
                type="range"
                min={0}
                max={100}
                value={marks}
                onChange={(e) => setMarks(Number(e.target.value))}
                className="mt-2 w-full"
              />
              <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span className="font-mono font-bold text-foreground">{marks}</span>
                <span>100</span>
              </div>
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
                <span className="font-mono font-bold">{result.score}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Estimated AIR</span>
                <span className="font-mono font-bold">
                  {result.expectedRank.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Range: {result.minRank.toLocaleString()} – {result.maxRank.toLocaleString()}</span>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Marks gauge</p>
              <Thermometer marks={marks} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
          <CardTitle>Marks Required Calculator</CardTitle>
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
                <span className="font-mono font-bold">{required.marks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Projected Score</span>
                <span className="font-mono font-bold">{required.score}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estimated Marks {'->'} Score {'->'} AIR Reference</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Marks</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Score</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Rank Range</th>
                <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Mid Rank</th>
              </tr>
            </thead>
            <tbody>
              {referenceTable.map((e, i) => (
                <tr key={i} className="border-b border-border/40 hover:bg-muted/40 transition-colors">
                  <td className="px-3 py-2 font-mono text-xs">{e.minMarks}–{e.maxMarks}</td>
                  <td className="px-3 py-2 font-mono text-xs">{e.minScore}–{e.maxScore}</td>
                  <td className="px-3 py-2 font-mono text-xs">{e.minRank.toLocaleString()}–{e.maxRank.toLocaleString()}</td>
                  <td className="px-3 py-2 font-mono text-xs">{e.rankMid.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
