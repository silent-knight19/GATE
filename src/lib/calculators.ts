import { gateCs2025Stats } from '@/lib/data/rankMapping'
import { getMqForCategory, getStatForYear } from '@/lib/data/gateStats'
import { getAnchorsForYear, interpolateRank, interpolateMarksForRank, getRankBand, getScoreBand } from '@/lib/data/rankAnchors'
import { COLLEGE_CUTOFFS as NEW_CUTOFFS } from '@/lib/data/collegeCutoffs'
import type { Subject } from '@/lib/data/syllabus'

// Re-export for backward compat — deprecated, use gateStats
export { gateCs2025Stats }

export interface RankPrediction {
  minRank: number
  maxRank: number
  expectedRank: number | null
  score: number
  // new fields — optional for backward compat
  qualified?: boolean
  scoreBand?: { low: number; high: number }
  rankRange?: { low: number; high: number } | null
  percentile?: number | null
  confidence?: 'high' | 'medium' | 'low'
  year?: number
  Mt?: number
  Mq?: number
  MqCategory?: number
  method?: string
}

export interface DetailedPrediction extends RankPrediction {
  score: number
  scoreBand: { low: number; high: number }
  qualified: boolean
  expectedRank: number | null
  rankRange: { low: number; high: number } | null
  percentile: number | null
  confidence: 'high' | 'medium' | 'low'
  year: number
  Mt: number
  Mq: number
  MqCategory: number
  method: string
  minRank: number
  maxRank: number
}

export interface VelocityResult {
  currentVelocity: number
  requiredVelocity: number
  velocityGap: number
  isOnTrack: boolean
  predictedCompletionDate: Date
}

export interface ReadinessInput {
  syllabusProgress: number
  mockScoreTrend: number[]
  revisionCoverage: number
  consistency: number
}

export interface ConsistencyResult {
  score: number
  streak: number
  averageDaily: number
}

export interface DailyTask {
  subjectId: string
  topicId: string
  topicName: string
  hours: number
  priority: 'high' | 'medium' | 'low'
}

export interface BurnoutResult {
  risk: 'low' | 'medium' | 'high'
  score: number
  recommendation: string
}

export interface TimeAllocationEntry {
  subjectId: string
  subjectName: string
  weightage: number
  allocatedHours: number
  priority: number
}

export interface CountdownResult {
  days: number
  hours: number
  minutes: number
  studyDays: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// ── Official GATE Score Formula ─────────────────────────────────────────────
// Score = 350 + 550 * (M - MqGen) / (Mt - MqGen)
// MqGen = General qualifying marks for that year, Mt = mean top 0.1% , Sq=350 St=900
// Per GATE 2027 Information Brochure v1.1: Score = Sq + (St-Sq)*(M-Mq)/(Mt-Mq)
// Category does NOT change formula denominator; it changes qualification threshold MqCategory
export function marksToScoreDetailed(marks: number, year: number = 2026): { score: number; band: { low: number; high: number }; Mq: number; Mt: number; method: string } {
  const clamped = clamp(marks, 0, 100)
  const stat = getStatForYear(year)
  const Mq = stat.Mq.General
  const Mt = stat.Mt
  const denom = Math.max(1, Mt - Mq)
  const rawScore = 350 + 550 * (clamped - Mq) / denom
  const score = Math.round(clamp(rawScore, 0, 1000) * 100) / 100
  const band = getScoreBand(score, year)
  const method = `Score = 350 + 550×(M - ${Mq})/(Mt ${Mt} - ${Mq})`
  return { score, band, Mq, Mt, method }
}

// Backward compat: marksToScore(marks) uses 2026 verified
export function marksToScore(marks: number): number {
  return marksToScoreDetailed(marks, 2026).score
}

export function marksToScoreForYear(marks: number, year: number): number {
  return marksToScoreDetailed(marks, year).score
}

// ── Marks → Rank (reliable) ─────────────────────────────────────────────────
// Uses official score + log-linear rank anchors. Category affects qualification,
// NOT the marks→rank curve directly (AIR is category-agnostic). We show qualified flag.
export function marksToRankDetailed(marks: number, category: string = 'General', year: number = 2026): DetailedPrediction {
  const clamped = clamp(marks, 0, 100)
  const stat = getStatForYear(year)
  const MqGen = stat.Mq.General
  const MqCategory = getMqForCategory(year, category)
  const Mt = stat.Mt
  const qualified = clamped >= MqCategory

  const { score, band: scoreBand } = marksToScoreDetailed(clamped, year)

  const anchors = getAnchorsForYear(year)
  let expectedRank: number | null = null
  let rankRange: { low: number; high: number } | null = null
  let confidence: 'high' | 'medium' | 'low' = 'high'
  let minRank = 1
  let maxRank = stat.appeared

  if (qualified) {
    const interp = interpolateRank(clamped, anchors)
    expectedRank = interp.rank
    const band = getRankBand(interp.rank, year)
    rankRange = { low: band.low, high: band.high }
    confidence = band.confidence
    minRank = band.low
    maxRank = band.high
  } else {
    // Not qualified: no AIR (GATE only ranks qualified)
    expectedRank = null
    rankRange = null
    confidence = 'low'
    minRank = stat.qualified + 1
    maxRank = stat.appeared
  }

  const percentile = expectedRank ? Math.max(0, Math.min(99.99, (1 - expectedRank / stat.appeared) * 100)) : null

  return {
    score,
    scoreBand: scoreBand,
    qualified,
    expectedRank,
    rankRange,
    percentile: percentile !== null ? Math.round(percentile * 100) / 100 : null,
    confidence,
    year,
    Mt,
    Mq: MqGen,
    MqCategory,
    method: `Official formula + log-linear anchors (${year} ${stat.confidence})`,
    minRank,
    maxRank,
  }
}

// Backward compat wrapper: returns old shape but with improved values
export function marksToRank(marks: number, category: string = 'General'): RankPrediction {
  const d = marksToRankDetailed(marks, category, 2026)
  // Old callers expect non-null expectedRank; if not qualified fallback to maxRank
  const expected = d.expectedRank ?? d.maxRank
  const range = d.rankRange ?? { low: d.minRank, high: d.maxRank }
  return {
    minRank: range.low,
    maxRank: range.high,
    expectedRank: expected,
    score: d.score,
    qualified: d.qualified,
    scoreBand: d.scoreBand,
    rankRange: d.rankRange,
    percentile: d.percentile,
    confidence: d.confidence,
    year: d.year,
    Mt: d.Mt,
    Mq: d.Mq,
    MqCategory: d.MqCategory,
    method: d.method,
  }
}

export function marksToRankForYear(marks: number, category: string = 'General', year: number = 2026): DetailedPrediction {
  return marksToRankDetailed(marks, category, year)
}

// ── Rank → Marks (inverse) ──────────────────────────────────────────────────
export function rankToMarksDetailed(targetRank: number, category: string = 'General', year: number = 2026): { marks: number; score: number; band: { low: number; high: number }; scoreBand: { low: number; high: number }; method: string } {
  const anchors = getAnchorsForYear(year)
  const stat = getStatForYear(year)
  const { marks, score: anchorScore } = interpolateMarksForRank(targetRank, anchors)
  // Recompute score via official formula for consistency (anchorScore vs formula may differ slightly)
  const { score } = marksToScoreDetailed(marks, year)
  const marksBand = targetRank <= 100 ? { low: Math.max(0, Math.round((marks - 2) * 10) / 10), high: Math.min(100, Math.round((marks + 2) * 10) / 10) } : { low: Math.max(0, Math.round((marks - 3) * 10) / 10), high: Math.min(100, Math.round((marks + 3) * 10) / 10) }
  const scoreBand = getScoreBand(score, year)
  // Category does not change marks needed for a given AIR; qualification threshold separate
  void category
  void stat
  void anchorScore
  return { marks, score, band: marksBand, scoreBand, method: `Inverse log-linear anchors (${year})` }
}

// Backward compat
export function rankToMarks(targetRank: number, _category: string = 'General'): { marks: number; score: number } {
  const d = rankToMarksDetailed(targetRank, _category, 2026)
  return { marks: d.marks, score: d.score }
}

export function rankToMarksForYear(targetRank: number, category: string = 'General', year: number = 2026): ReturnType<typeof rankToMarksDetailed> {
  return rankToMarksDetailed(targetRank, category, year)
}

// ── College helpers ─────────────────────────────────────────────────────────
// Backward compat COLLEGES (simple list) — generated from NEW_CUTOFFS 2025 General
export interface College {
  id: string
  name: string
  tier: 'IIT' | 'NIT' | 'IIIT' | 'GFTI'
  specializations: string[]
  city: string
  state: string
  cutoffScore: number
  cutoffSource: string
}

export const COLLEGES: College[] = (() => {
  const seen = new Set<string>()
  const list: College[] = []
  for (const c of NEW_CUTOFFS) {
    if (c.year !== 2025 || c.category !== 'General') continue
    if (seen.has(c.name)) continue
    seen.add(c.name)
    list.push({
      id: c.id.split('-').slice(0, 2).join('-') || c.id, // base id
      name: c.name,
      tier: c.tier,
      specializations: c.specializations,
      city: c.city,
      state: c.state,
      cutoffScore: c.closing,
      cutoffSource: c.source,
    })
  }
  // Ensure stable order by cutoff desc
  return list.sort((a, b) => b.cutoffScore - a.cutoffScore)
})()

export function getDaysUntilExam(targetDate?: Date, excludeWeekends?: boolean): CountdownResult {
  const GATE_2027 = new Date(2027, 1, 6)
  const target = targetDate ?? GATE_2027
  const now = new Date()

  if (now > target) {
    return { days: 0, hours: 0, minutes: 0, studyDays: 0 }
  }

  const diffMs = target.getTime() - now.getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  let studyDays = days
  if (excludeWeekends) {
    let count = 0
    const d = new Date(now)
    for (let i = 0; i < days; i++) {
      const day = d.getDay()
      if (day !== 0 && day !== 6) count++
      d.setDate(d.getDate() + 1)
    }
    studyDays = count
  }

  return { days, hours, minutes, studyDays }
}

export function calculateVelocity(
  completedTopics: number,
  totalTopics: number,
  daysElapsed: number,
  totalDays: number,
): VelocityResult {
  const safeDaysElapsed = Math.max(1, daysElapsed)
  const safeTotalDays = Math.max(1, totalDays)

  const currentVelocity = (completedTopics / safeDaysElapsed) * 7

  const remainingTopics = Math.max(0, totalTopics - completedTopics)
  const remainingDays = Math.max(1, safeTotalDays - daysElapsed)
  const requiredVelocity = remainingTopics / (remainingDays / 7)

  const velocityGap = requiredVelocity - currentVelocity
  const isOnTrack = currentVelocity >= requiredVelocity

  const weeksToComplete = requiredVelocity > 0 ? remainingTopics / requiredVelocity : 0
  const predictedDays = Math.round(weeksToComplete * 7)
  const predictedCompletionDate = new Date(Date.now() + Math.max(1, predictedDays) * 86400000)

  return {
    currentVelocity: Math.round(currentVelocity * 100) / 100,
    requiredVelocity: Math.round(requiredVelocity * 100) / 100,
    velocityGap: Math.round(velocityGap * 100) / 100,
    isOnTrack,
    predictedCompletionDate,
  }
}

export function calculateReadinessScore(input: ReadinessInput): number {
  const { syllabusProgress, mockScoreTrend, revisionCoverage, consistency } = input

  const syllabusScore = clamp(syllabusProgress, 0, 100) * 0.3

  const avgMockScore =
    mockScoreTrend.length > 0
      ? mockScoreTrend.reduce((a, b) => a + b, 0) / mockScoreTrend.length
      : 0
  const normalizedMock = clamp((avgMockScore / 100) * 100, 0, 100)
  const mockScore = normalizedMock * 0.35

  const revisionScore = clamp(revisionCoverage, 0, 100) * 0.2

  const consistencyScore = clamp(consistency, 0, 100) * 0.15

  const total = Math.round((syllabusScore + mockScore + revisionScore + consistencyScore) * 100) / 100

  return clamp(total, 0, 100)
}

export function calculateConsistencyScore(
  studyLogs: { date: Date; hoursStudied: number; topicsCovered: string[] }[],
): ConsistencyResult {
  if (studyLogs.length === 0) {
    return { score: 0, streak: 0, averageDaily: 0 }
  }

  const sorted = [...studyLogs].sort((a, b) => a.date.getTime() - b.date.getTime())

  const totalHours = sorted.reduce((sum, log) => sum + log.hoursStudied, 0)
  const averageDaily = Math.round((totalHours / sorted.length) * 100) / 100

  let streak = 0
  const today = new Date()
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()

  for (let i = sorted.length - 1; i >= 0; i--) {
    const logDate = new Date(sorted[i].date.getFullYear(), sorted[i].date.getMonth(), sorted[i].date.getDate()).getTime()
    const expectedDate = streak === 0 ? todayDate : todayDate - streak * 86400000
    const diff = Math.round((expectedDate - logDate) / 86400000)
    if (diff <= 1 && sorted[i].hoursStudied > 0) {
      streak++
    } else {
      break
    }
  }

  const streakScore = clamp((streak / 30) * 30, 0, 30)

  const sortedDates = sorted.map((l) =>
    new Date(l.date.getFullYear(), l.date.getMonth(), l.date.getDate()).getTime(),
  )
  const uniqueDays = new Set(sortedDates).size
  const firstDate = sortedDates[0]
  const lastDate = sortedDates[sortedDates.length - 1]
  const totalPeriod = Math.max(1, Math.round((lastDate - firstDate) / 86400000) + 1)
  const daysStudiedScore = clamp((uniqueDays / totalPeriod) * 30, 0, 30)

  const hoursList = sorted.map((l) => l.hoursStudied)
  const mean = hoursList.reduce((a, b) => a + b, 0) / hoursList.length
  const variance = hoursList.reduce((sum, h) => sum + (h - mean) ** 2, 0) / hoursList.length
  const stdDev = Math.sqrt(variance)
  const consistencyPenalty = clamp(stdDev * 3, 0, 20)
  const stdDevScore = clamp(20 - consistencyPenalty, 0, 20)

  const weekendLogs = sorted.filter((l) => {
    const d = l.date.getDay()
    return d === 0 || d === 6
  })
  const weekendHours = weekendLogs.reduce((sum, l) => sum + l.hoursStudied, 0)
  const totalUniqueWeekends = weekendLogs.filter(
    (l, i, arr) =>
      arr.findIndex(
        (x) =>
          new Date(x.date.getFullYear(), x.date.getMonth(), x.date.getDate()).getTime() ===
          new Date(l.date.getFullYear(), l.date.getMonth(), l.date.getDate()).getTime(),
      ) === i,
  ).length
  const idealWeekendHours = totalUniqueWeekends * (averageDaily * 0.6)
  const weekendRatio =
    idealWeekendHours > 0
      ? clamp((weekendHours / idealWeekendHours) * 20, 0, 20)
      : 0

  const totalScore = clamp(
    Math.round((streakScore + daysStudiedScore + stdDevScore + weekendRatio) * 100) / 100,
    0,
    100,
  )

  return { score: totalScore, streak, averageDaily }
}

export function generateStudyPlan(
  userSettings: { availableHours: number; weakSubjects: string[]; strongSubjects: string[] },
  syllabusData: Subject[],
  currentProgress: Record<string, string>,
): DailyTask[] {
  const { availableHours, weakSubjects, strongSubjects } = userSettings
  const tasks: DailyTask[] = []

  const pendingTopics: Array<{ subject: Subject; topicIndex: number; topic: Subject['topics'][0] }> = []

  for (const subject of syllabusData) {
    for (let i = 0; i < subject.topics.length; i++) {
      const topic = subject.topics[i]
      const status = currentProgress[topic.id]
      if (status === 'not_started' || status === 'in_progress') {
        pendingTopics.push({ subject, topicIndex: i, topic })
      }
    }
  }

  pendingTopics.sort((a, b) => {
    const aWeak = weakSubjects.includes(a.subject.id) ? 0 : 1
    const bWeak = weakSubjects.includes(b.subject.id) ? 0 : 1
    if (aWeak !== bWeak) return aWeak - bWeak
    const aStrong = strongSubjects.includes(a.subject.id) ? 1 : 0
    const bStrong = strongSubjects.includes(b.subject.id) ? 1 : 0
    if (aStrong !== bStrong) return aStrong - bStrong
    return b.topic.weightage - a.topic.weightage
  })

  let remainingHours = availableHours
  for (const item of pendingTopics) {
    if (remainingHours <= 0) break
    const hours = Math.min(item.topic.hours * 0.5, remainingHours)
    tasks.push({
      subjectId: item.subject.id,
      topicId: item.topic.id,
      topicName: item.topic.name,
      hours: Math.round(hours * 10) / 10,
      priority: weakSubjects.includes(item.subject.id) ? 'high' : 'medium',
    })
    remainingHours -= hours
  }

  return tasks
}

export function calculateBurnoutRisk(
  consecutiveHighIntensityDays: number,
  mockScoreTrend: number[],
  averageStudyHours: number,
): BurnoutResult {
  const intensityScore = clamp(consecutiveHighIntensityDays / 7, 0, 1) * 40

  let trendScore = 0
  if (mockScoreTrend.length >= 2) {
    const recent = mockScoreTrend.slice(-3)
    const improving = recent.length >= 2 && recent[recent.length - 1] > recent[0]
    trendScore = improving ? 10 : 25
  } else {
    trendScore = 15
  }

  const hoursScore = averageStudyHours > 8 ? 30 : averageStudyHours > 6 ? 20 : 10

  const total = intensityScore + trendScore + hoursScore

  let risk: 'low' | 'medium' | 'high'
  let recommendation: string

  if (total >= 60) {
    risk = 'high'
    recommendation = 'Take a rest day. Your intensity and hours are unsustainable.'
  } else if (total >= 35) {
    risk = 'medium'
    recommendation = 'Consider reducing study hours or taking a lighter day.'
  } else {
    risk = 'low'
    recommendation = 'Your current pace is sustainable. Keep going!'
  }

  return { risk, score: Math.round(total), recommendation }
}

export function calculateTimeAllocation(
  availableDays: number,
  availableHoursPerDay: number,
  syllabusData: Subject[],
  userWeakness: string[],
): TimeAllocationEntry[] {
  const totalHours = availableDays * availableHoursPerDay

  const entries: TimeAllocationEntry[] = syllabusData.map(subject => {
    const isWeak = userWeakness.includes(subject.id)
    const weakMultiplier = isWeak ? 1.3 : 1
    const baseAllocation = (subject.weightage / 100) * totalHours * weakMultiplier
    const priority = isWeak ? subject.topics.filter(t => t.frequency === 'very_high').length : 0

    return {
      subjectId: subject.id,
      subjectName: subject.shortName,
      weightage: subject.weightage,
      allocatedHours: Math.round(baseAllocation * 10) / 10,
      priority,
    }
  })

  const totalAllocated = entries.reduce((s, e) => s + e.allocatedHours, 0)
  const factor = totalHours / (totalAllocated || 1)

  return entries.map(e => ({
    ...e,
    allocatedHours: Math.round(e.allocatedHours * factor * 10) / 10,
  }))
}
