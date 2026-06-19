'use client'

import { useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts'
import { syllabus } from '@/lib/data/syllabus'
import { subjectWeightages } from '@/lib/data/examData'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'

type SortKey = 'subject' | 2021 | 2022 | 2023 | 2024 | 2025 | 'avg' | 'trend'
type SortDir = 'asc' | 'desc'

const YEARS = [2021, 2022, 2023, 2024, 2025] as const

function getBarColor(val: number): string {
  if (val > 9) return '#22c55e'
  if (val >= 7) return '#3b82f6'
  if (val >= 5) return '#f59e0b'
  return '#ef4444'
}

function TrendIcon({ trend, change }: { trend: string; change: number }) {
  if (trend === 'up') return <ArrowUp className="inline h-3.5 w-3.5 text-green-500" />
  if (trend === 'down') return <ArrowDown className="inline h-3.5 w-3.5 text-red-500" />
  return <Minus className="inline h-3.5 w-3.5 text-yellow-500" />
}

function SortHeader({ k, sortKey, sortDir, onSort, children }: { k: SortKey; sortKey: SortKey; sortDir: SortDir; onSort: (key: SortKey) => void; children: React.ReactNode }) {
  return (
    <th
      className="cursor-pointer select-none px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
      onClick={() => onSort(k)}
    >
      {children}
      {sortKey === k && <span className="ml-1">{sortDir === 'asc' ? '\u2191' : '\u2193'}</span>}
    </th>
  )
}

export default function WeightagePage() {
  const [sortKey, setSortKey] = useState<SortKey>('avg')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const rows = useMemo(() => {
    return syllabus
      .filter((s) => s.id !== 'ga')
      .map((s) => {
        const sw = subjectWeightages.find((w) => w.subjectId === s.id)
        const yearMap: Record<number, number> = {}
        for (const ym of s.yearMarks) {
          yearMap[ym.year] = ym.marks
        }
        const marks2021 = yearMap[2021] ?? 0
        const marks2022 = yearMap[2022] ?? 0
        const marks2023 = yearMap[2023] ?? 0
        const marks2024 = yearMap[2024] ?? 0
        const marks2025 = yearMap[2025] ?? 0
        const avg = s.avgMarks
        const trend = sw?.trend ?? 'stable'
        const first = marks2021
        const last = marks2025
        const change = last - first
        return {
          subject: s.shortName,
          subjectId: s.id,
          color: s.color,
          2021: marks2021,
          2022: marks2022,
          2023: marks2023,
          2024: marks2024,
          2025: marks2025,
          avg,
          trend,
          change,
          changeStr: change >= 0 ? `+${change}` : `${change}`,
        }
      })
  }, [])

  const sorted = useMemo(() => {
    const data = [...rows]
    data.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'subject') {
        cmp = a.subject.localeCompare(b.subject)
      } else if (sortKey === 'trend') {
        cmp = a.trend.localeCompare(b.trend)
      } else {
        cmp = (a[sortKey] as number) - (b[sortKey] as number)
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return data
  }, [rows, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const avgChartData = useMemo(
    () =>
      rows.map((r) => ({ subject: r.subject, avg: r.avg, fill: getBarColor(r.avg) })),
    [rows],
  )

  const yearCompareData = useMemo(() => {
    return rows.map((r) => ({
      subject: r.subject,
      2021: r[2021],
      2022: r[2022],
      2023: r[2023],
      2024: r[2024],
      2025: r[2025],
    }))
  }, [rows])

  const highest = useMemo(() => {
    let best = rows[0]
    for (const r of rows) {
      if (r.avg > best.avg) best = r
    }
    return best
  }, [rows])

  const volatile = useMemo(() => {
    let v = rows[0]
    let maxRange = 0
    for (const r of rows) {
      const vals = [r[2021], r[2022], r[2023], r[2024], r[2025]]
      const mn = Math.min(...vals)
      const mx = Math.max(...vals)
      const range = mx - mn
      if (range > maxRange) {
        maxRange = range
        v = r
      }
    }
    return { ...v, min: Math.min(...[v[2021], v[2022], v[2023], v[2024], v[2025]]), max: Math.max(...[v[2021], v[2022], v[2023], v[2024], v[2025]]) }
  }, [rows])

  const improved = useMemo(() => {
    let best = rows[0]
    for (const r of rows) {
      if (r.change > best.change) best = r
    }
    return best
  }, [rows])

  const lowest = useMemo(() => {
    let worst = rows[0]
    for (const r of rows) {
      if (r.avg < worst.avg) worst = r
    }
    return worst
  }, [rows])

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Weightage Analysis</h1>
        <p className="text-sm text-muted-foreground">5-year marks distribution (2021–2025)</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subject Weightage Table</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <SortHeader k="subject" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort}>Subject</SortHeader>
                <SortHeader k={2021} sortKey={sortKey} sortDir={sortDir} onSort={toggleSort}>2021</SortHeader>
                <SortHeader k={2022} sortKey={sortKey} sortDir={sortDir} onSort={toggleSort}>2022</SortHeader>
                <SortHeader k={2023} sortKey={sortKey} sortDir={sortDir} onSort={toggleSort}>2023</SortHeader>
                <SortHeader k={2024} sortKey={sortKey} sortDir={sortDir} onSort={toggleSort}>2024</SortHeader>
                <SortHeader k={2025} sortKey={sortKey} sortDir={sortDir} onSort={toggleSort}>2025</SortHeader>
                <SortHeader k="avg" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort}>Avg</SortHeader>
                <SortHeader k="trend" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort}>Trend</SortHeader>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => {
                const vals = [r[2021], r[2022], r[2023], r[2024], r[2025]]
                return (
                  <tr key={r.subjectId} className="border-b border-border/40 hover:bg-muted/40 transition-colors">
                    <td className="px-3 py-2.5 font-medium">{r.subject}</td>
                    {vals.map((v, i) => (
                      <td
                        key={i}
                        className={`px-3 py-2.5 font-mono text-xs ${
                          v >= 10 ? 'text-green-500' : v >= 6 ? '' : 'text-amber-500'
                        }`}
                      >
                        {v}
                      </td>
                    ))}
                    <td className="px-3 py-2.5 font-mono text-xs font-bold">{r.avg}</td>
                    <td className="px-3 py-2.5 font-mono text-xs whitespace-nowrap">
                      <TrendIcon trend={r.trend} change={r.change} />
                      <span className={`ml-1 ${r.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {r.changeStr}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Average Marks by Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={avgChartData} margin={{ top: 8, right: 8, bottom: 16, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="subject"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '13px',
                    }}
                  />
                  <Bar dataKey="avg" radius={[4, 4, 0, 0]}>
                    {avgChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Year Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearCompareData} margin={{ top: 8, right: 8, bottom: 16, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="subject"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '13px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  {YEARS.map((y) => (
                    <Bar key={y} dataKey={String(y)} radius={[2, 2, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Highest Avg Weightage</p>
              <p className="mt-1 text-lg font-bold">{highest.subject}</p>
              <p className="text-sm text-muted-foreground">{highest.avg} marks</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Most Volatile</p>
              <p className="mt-1 text-lg font-bold">{volatile.subject}</p>
              <p className="text-sm text-muted-foreground">range: {volatile.min}–{volatile.max}</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Most Improved</p>
              <p className="mt-1 text-lg font-bold">{improved.subject}</p>
              <p className={`text-sm ${improved.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {improved.changeStr}
              </p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Lowest Avg</p>
              <p className="mt-1 text-lg font-bold">{lowest.subject}</p>
              <p className="text-sm text-muted-foreground">{lowest.avg} marks</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
