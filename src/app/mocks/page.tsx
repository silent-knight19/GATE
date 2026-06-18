"use client"

import { useMemo, useState } from "react"
import { useAppStore } from "@/lib/store"
import { MockTestLogger } from "@/components/mocks/mock-test-logger"
import { ScoreTrendChart } from "@/components/mocks/score-trend-chart"
import { ErrorPieChart } from "@/components/mocks/error-pie-chart"
import { SubjectRadar } from "@/components/mocks/subject-radar"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronRight,
  Trash2,
} from "lucide-react"

const errorTypeLabels: Record<string, string> = {
  conceptual: "Conceptual",
  calculation: "Calculation",
  time_management: "Time Mgmt",
  silly: "Silly",
  guessed: "Guessed",
}

const errorTypeColors: Record<string, string> = {
  conceptual: "text-red-500 bg-red-500/10",
  calculation: "text-orange-500 bg-orange-500/10",
  time_management: "text-yellow-500 bg-yellow-500/10",
  silly: "text-indigo-500 bg-indigo-500/10",
  guessed: "text-green-500 bg-green-500/10",
}

export default function MocksPage() {
  const tests = useAppStore((s) => s.tests)
  const removeMockTest = useAppStore((s) => s.removeMockTest)
  const getMockTrend = useAppStore((s) => s.getMockTrend)
  const getSubjectWeakness = useAppStore((s) => s.getSubjectWeakness)
  const getErrorProfile = useAppStore((s) => s.getErrorProfile)

  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})

  const trendData = useMemo(
    () => getMockTrend().map((t) => ({ date: t.date, marksObtained: t.marks })),
    [tests]
  )
  const subjectWeakness = useMemo(() => getSubjectWeakness(), [tests])
  const errorProfile = useMemo(() => getErrorProfile(), [tests])

  const stats = useMemo(() => {
    if (tests.length === 0) {
      return {
        totalTests: 0,
        avgScore: 0,
        highest: 0,
        lowest: 0,
        trend: "stable" as const,
        trendPercent: 0,
      }
    }
    const scores = tests.map((m) => m.marksObtained)
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
    const sorted = [...tests].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    const recent = sorted.slice(-3)
    const recentAvg =
      recent.length > 0
        ? recent.reduce((s, m) => s + m.marksObtained, 0) / recent.length
        : avg
    const trend = recentAvg > avg ? ("up" as const) : recentAvg < avg ? ("down" as const) : ("stable" as const)
    const trendPercent =
      avg > 0 ? Math.round(((recentAvg - avg) / avg) * 100) : 0

    return {
      totalTests: tests.length,
      avgScore: Math.round(avg * 10) / 10,
      highest: Math.max(...scores),
      lowest: Math.min(...scores),
      trend,
      trendPercent,
    }
  }, [tests])

  const latestSubjectScores = useMemo(() => {
    if (tests.length === 0) return {}
    const latest = tests.reduce((latest, m) =>
      new Date(m.date) > new Date(latest.date) ? m : latest
    )
    return latest.subjectBreakdown
  }, [tests])

  const improvingErrorType = useMemo(() => {
    if (tests.length < 2) return null
    const sorted = [...tests].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    const half = Math.floor(sorted.length / 2)
    const firstHalf = sorted.slice(0, half)
    const secondHalf = sorted.slice(-half)

    const typeChange: Record<string, number> = {}
    const allTypes = new Set<string>()
    for (const test of sorted) {
      for (const e of test.errorAnalysis) allTypes.add(e.errorType)
    }

    for (const type of allTypes) {
      const firstCount = firstHalf.reduce(
        (s, t) =>
          s + t.errorAnalysis.filter((e) => e.errorType === type).reduce((c, e) => c + e.count, 0),
        0
      )
      const secondCount = secondHalf.reduce(
        (s, t) =>
          s + t.errorAnalysis.filter((e) => e.errorType === type).reduce((c, e) => c + e.count, 0),
        0
      )
      typeChange[type] = secondCount - firstCount
    }

    const best = Object.entries(typeChange).sort(([, a], [, b]) => a - b)[0]
    if (!best) return null
    return {
      errorType: best[0],
      change: best[1],
    }
  }, [tests])

  const sortedTests = useMemo(
    () =>
      [...tests].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [tests]
  )

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            Mock Test Analytics
          </h1>
          <p className="text-xs text-muted-foreground">
            Track and analyze your mock test performance
          </p>
        </div>
        <MockTestLogger />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Total Tests</p>
            <p className="mt-1 font-mono text-xl font-semibold text-foreground">
              {stats.totalTests}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center gap-1.5">
              <p className="text-xs text-muted-foreground">Average Score</p>
              {stats.trend === "up" ? (
                <TrendingUp className="size-3 text-green-500" />
              ) : stats.trend === "down" ? (
                <TrendingDown className="size-3 text-red-500" />
              ) : (
                <Minus className="size-3 text-muted-foreground" />
              )}
            </div>
            <p className="mt-1 font-mono text-xl font-semibold text-foreground">
              {stats.avgScore}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {stats.trendPercent > 0 ? "+" : ""}
              {stats.trendPercent}% recent trend
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Highest</p>
            <p className="mt-1 font-mono text-xl font-semibold text-green-500">
              {stats.highest}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Lowest</p>
            <p className="mt-1 font-mono text-xl font-semibold text-red-500">
              {stats.lowest}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Score Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ScoreTrendChart data={trendData} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Subject Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(latestSubjectScores).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(latestSubjectScores)
                  .sort(([, a], [, b]) => b - a)
                  .map(([subject, score]) => (
                    <div key={subject} className="flex items-center gap-2">
                      <span className="flex-1 text-xs text-foreground">
                        {subject}
                      </span>
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted sm:w-32">
                        <div
                          className="h-full rounded-full bg-foreground/70 transition-all"
                          style={{
                            width: `${(score / Math.max(...Object.values(latestSubjectScores), 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="w-6 text-right font-mono text-xs tabular-nums text-muted-foreground">
                        {score}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No subject data yet.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subject Radar</CardTitle>
          </CardHeader>
          <CardContent>
            <SubjectRadar subjectScores={latestSubjectScores} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Error Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ErrorPieChart
              errors={errorProfile.map((e) => ({
                errorType: e.errorType,
                count: e.totalCount,
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Improvement Insight</CardTitle>
          </CardHeader>
          <CardContent>
            {improvingErrorType ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Most improved error type:
                </p>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={
                      errorTypeColors[improvingErrorType.errorType] || ""
                    }
                  >
                    {errorTypeLabels[improvingErrorType.errorType] ||
                      improvingErrorType.errorType}
                  </Badge>
                  <span className="font-mono text-sm text-green-500">
                    {improvingErrorType.change < 0
                      ? `${Math.abs(improvingErrorType.change)} fewer`
                      : `${improvingErrorType.change} more`}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {improvingErrorType.change < 0
                    ? "Great job reducing these errors!"
                    : "Focus on reducing these errors in upcoming tests."}
                </p>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Take more tests to see improvement insights.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test History</CardTitle>
        </CardHeader>
        <CardContent>
          {sortedTests.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No mock tests logged yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Date
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Source
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Score
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      %
                    </th>
                    <th className="w-10" />
                  </tr>
                </thead>
                <tbody>
                  {sortedTests.map((test) => {
                    const isExpanded = expandedRows[test.id]
                    const pct =
                      test.totalMarks > 0
                        ? Math.round(
                            (test.marksObtained / test.totalMarks) * 100
                          )
                        : 0
                    return (
                      <>
                        <tr
                          key={test.id}
                          className="border-b border-border/40 transition-colors hover:bg-muted/40"
                        >
                          <td className="px-3 py-2 font-mono text-xs">
                            {test.date}
                          </td>
                          <td className="px-3 py-2 text-xs text-muted-foreground">
                            {test.source}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-xs">
                            {test.marksObtained}/{test.totalMarks}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-xs">
                            <span
                              className={
                                pct >= 60
                                  ? "text-green-500"
                                  : pct >= 40
                                    ? "text-amber-500"
                                    : "text-red-500"
                              }
                            >
                              {pct}%
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() =>
                                  setExpandedRows((prev) => ({
                                    ...prev,
                                    [test.id]: !prev[test.id],
                                  }))
                                }
                              >
                                {isExpanded ? (
                                  <ChevronDown className="size-3" />
                                ) : (
                                  <ChevronRight className="size-3" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => removeMockTest(test.id)}
                              >
                                <Trash2 className="size-3 text-muted-foreground hover:text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${test.id}_details`}>
                            <td colSpan={5} className="px-3 py-2">
                              <div className="rounded-lg bg-muted/50 p-3">
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                  <div>
                                    <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                      Subject Breakdown
                                    </p>
                                    <div className="space-y-1">
                                      {Object.entries(test.subjectBreakdown)
                                        .sort(([, a], [, b]) => b - a)
                                        .map(([subj, marks]) => (
                                          <div
                                            key={subj}
                                            className="flex items-center justify-between text-xs"
                                          >
                                            <span className="text-muted-foreground">
                                              {subj}
                                            </span>
                                            <span className="font-mono tabular-nums">
                                              {marks}
                                            </span>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                  <div>
                                    <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                      Errors
                                    </p>
                                    {test.errorAnalysis.length > 0 ? (
                                      <div className="space-y-1">
                                        {test.errorAnalysis.map((e, i) => (
                                          <div
                                            key={i}
                                            className="flex items-center justify-between text-xs"
                                          >
                                            <span className="text-muted-foreground">
                                              {e.subject} &middot; {e.topic}
                                            </span>
                                            <Badge
                                              variant="secondary"
                                              className={
                                                errorTypeColors[e.errorType] ||
                                                ""
                                              }
                                            >
                                              {errorTypeLabels[e.errorType] ||
                                                e.errorType}
                                              &nbsp;x{e.count}
                                            </Badge>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-xs text-muted-foreground">
                                        No errors recorded.
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
