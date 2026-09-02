import { COLLEGE_HISTORY, type CollegeHistory, type Category } from '@/lib/data/collegeHistory'

export type Trend = 'rising' | 'falling' | 'stable'
export type CollegeStatus = 'safe' | 'likely' | 'borderline' | 'reach'

export interface Prediction {
  predicted: number // predicted closing for target year
  lower: number // lower bound of 80% interval
  upper: number // upper bound
  slope: number // points per year
  mean: number
  median: number
  min: number
  max: number
  stddev: number
  trend: Trend
  r2: number // goodness of fit
  history: { year: number; closing: number }[]
  successRate: number // proportion of historical years where score >= closing
  status: CollegeStatus
  confidence: 'high' | 'medium' | 'low'
}

// Category offsets — tier-dependent, derived from actual COAP/CCMT OR-CR gaps
// Top IITs have narrow gaps (General vs OBC ~20-40), lower NITs/IIITs wider (80-120)
function getCategoryOffset(tier: string, category: Category): number {
  if (category === 'General') return 0
  if (tier === 'IIT') {
    // Top IITs: narrow gap per COAP (Bombay 750 vs OBC 675 = 75, but many IITs 750 vs 720 =30)
    // Use conservative tier-specific
    if (category === 'OBC') return -35
    if (category === 'EWS') return -25
    if (category === 'SC') return -120
    if (category === 'ST') return -180
  }
  if (tier === 'NIT') {
    // Top NITs (Trichy/Warangal) vs lower NITs differ, use average
    if (category === 'OBC') return -55
    if (category === 'EWS') return -40
    if (category === 'SC') return -140
    if (category === 'ST') return -230
  }
  // IIIT/GFTI and NIT mid/lower
  if (category === 'OBC') return -65
  if (category === 'EWS') return -45
  if (category === 'SC') return -180
  if (category === 'ST') return -270
  return 0
}

function getClosingForCategory(history: Record<number, number>, category: Category, tier: string): Record<number, number> {
  if (category === 'General') return history
  const offset = getCategoryOffset(tier, category)
  const adjusted: Record<number, number> = {}
  for (const [y, v] of Object.entries(history)) {
    adjusted[Number(y)] = Math.max(200, v + offset)
  }
  return adjusted
}

function linearRegression(points: { x: number; y: number }[]): { slope: number; intercept: number; r2: number } {
  const n = points.length
  if (n < 2) return { slope: 0, intercept: points[0]?.y ?? 0, r2: 0 }
  const sumX = points.reduce((s, p) => s + p.x, 0)
  const sumY = points.reduce((s, p) => s + p.y, 0)
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0)
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0)
  const sumY2 = points.reduce((s, p) => s + p.y * p.y, 0)
  const denom = n * sumX2 - sumX * sumX
  if (denom === 0) return { slope: 0, intercept: sumY / n, r2: 0 }
  const slope = (n * sumXY - sumX * sumY) / denom
  const intercept = (sumY - slope * sumX) / n
  // r2
  const meanY = sumY / n
  const ssTot = points.reduce((s, p) => s + (p.y - meanY) ** 2, 0)
  const ssRes = points.reduce((s, p) => s + (p.y - (slope * p.x + intercept)) ** 2, 0)
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot
  return { slope, intercept, r2 }
}

export function predictForCollege(
  college: CollegeHistory,
  userScore: number,
  category: Category = 'General',
  targetYear: number = 2027
): Prediction {
  const historyForCat = getClosingForCategory(college.history, category, college.tier)
  const years = Object.keys(historyForCat).map(Number).sort()
  const points = years.map(y => ({ x: y, y: historyForCat[y] }))
  const values = points.map(p => p.y)
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const sorted = [...values].sort((a, b) => a - b)
  const median = sorted[Math.floor(sorted.length / 2)]
  const min = Math.min(...values)
  const max = Math.max(...values)
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length
  const stddev = Math.sqrt(variance)

  // Predicted via historical median of last 3 verified years (2023-2025) — NOT linear regression
  // GATE scores are normalized each year; linear time trend is not predictive. Use robust median.
  const recentYears = years.filter(y => y >= 2023)
  const recentValues = recentYears.map(y => historyForCat[y])
  const recentMedian = recentValues.length ? recentValues.sort((a,b)=>a-b)[Math.floor(recentValues.length/2)] : median
  const predictedRaw = recentMedian
  // Clamp predicted to be within [min-10, max+30] to avoid wild extrapolation
  const predicted = Math.round(Math.max(min - 10, Math.min(max + 30, predictedRaw)))

  // Still compute slope/r2 for trend display, but not for prediction
  const { slope, r2 } = linearRegression(points)

  // Confidence interval based on stddev and r2
  // High r2 (>0.7) => tighter interval, low r2 => wider
  const baseWidth = stddev * 1.28 // 80% interval for normal
  const r2Factor = r2 > 0.7 ? 0.8 : r2 > 0.4 ? 1.0 : 1.4
  const width = Math.round(baseWidth * r2Factor + 8) // at least 8 points
  const lower = Math.max(200, predicted - width)
  const upper = Math.min(1000, predicted + width)

  // Success rate: proportion of historical years where userScore would have been admitted (score >= closing)
  const successCount = values.filter(v => userScore >= v).length
  const successRate = successCount / values.length

  // Trend
  let trend: Trend = 'stable'
  if (slope > 2) trend = 'rising'
  else if (slope < -2) trend = 'falling'

  // Status based on successRate + distance to predicted
  let status: CollegeStatus = 'reach'
  let confidence: 'high' | 'medium' | 'low' = 'medium'
  if (successRate === 1 && userScore >= max + 10) {
    status = 'safe'
    confidence = r2 > 0.6 ? 'high' : 'medium'
  } else if (successRate >= 0.6 && userScore >= predicted) {
    status = 'likely'
    confidence = r2 > 0.5 ? 'high' : 'medium'
  } else if (successRate >= 0.4 || (userScore >= lower && userScore <= upper)) {
    status = 'borderline'
    confidence = 'medium'
  } else {
    status = 'reach'
    confidence = r2 > 0.6 ? 'medium' : 'low'
  }
  // If userScore far below min, definitely reach
  if (userScore < min - 20) {
    status = 'reach'
    confidence = 'high'
  }

  return {
    predicted,
    lower,
    upper,
    slope: Math.round(slope * 10) / 10,
    mean: Math.round(mean),
    median,
    min,
    max,
    stddev: Math.round(stddev * 10) / 10,
    trend,
    r2: Math.round(r2 * 100) / 100,
    history: points.map(p => ({ year: p.x, closing: p.y })),
    successRate,
    status,
    confidence,
  }
}

export function getAllPredictions(userScore: number, category: Category = 'General', tierFilter: string = 'all', targetYear: number = 2027) {
  let list = COLLEGE_HISTORY
  if (tierFilter !== 'all') list = list.filter(c => c.tier === tierFilter)
  return list.map(college => ({
    college,
    prediction: predictForCollege(college, userScore, category, targetYear),
  }))
}
