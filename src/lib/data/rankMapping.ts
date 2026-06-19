export interface RankEntry {
  minMarks: number
  maxMarks: number
  minScore: number
  maxScore: number
  minRank: number
  maxRank: number
  category: 'General'
}

// Backward compatibility alias
export type RankMappingEntry = RankEntry

export interface CollegeRef {
  name: string
  tier: 'IIT' | 'NIT' | 'IIIT' | 'GFTI' | 'Private' | 'Deemed'
  category: 'General' | 'OBC' | 'EWS' | 'SC' | 'ST' | 'PwD'
  specializations: string[]
}

const GENERAL_RANKS: Omit<RankEntry, 'category'>[] = [
  { minMarks: 85, maxMarks: 100, minScore: 918, maxScore: 1000, minRank: 1, maxRank: 10 },
  { minMarks: 80, maxMarks: 85, minScore: 867, maxScore: 918, minRank: 10, maxRank: 50 },
  { minMarks: 75, maxMarks: 80, minScore: 816, maxScore: 867, minRank: 50, maxRank: 100 },
  { minMarks: 70, maxMarks: 75, minScore: 765, maxScore: 816, minRank: 100, maxRank: 250 },
  { minMarks: 65, maxMarks: 70, minScore: 714, maxScore: 765, minRank: 250, maxRank: 500 },
  { minMarks: 60, maxMarks: 65, minScore: 663, maxScore: 714, minRank: 500, maxRank: 1000 },
  { minMarks: 55, maxMarks: 60, minScore: 613, maxScore: 663, minRank: 1000, maxRank: 2000 },
  { minMarks: 50, maxMarks: 55, minScore: 562, maxScore: 613, minRank: 2000, maxRank: 3500 },
  { minMarks: 45, maxMarks: 50, minScore: 511, maxScore: 562, minRank: 3500, maxRank: 6000 },
  { minMarks: 40, maxMarks: 45, minScore: 460, maxScore: 511, minRank: 6000, maxRank: 9500 },
  { minMarks: 35, maxMarks: 40, minScore: 409, maxScore: 460, minRank: 9500, maxRank: 14000 },
  { minMarks: 30, maxMarks: 35, minScore: 358, maxScore: 409, minRank: 14000, maxRank: 20000 },
  { minMarks: 25, maxMarks: 30, minScore: 307, maxScore: 358, minRank: 20000, maxRank: 27518 },
  { minMarks: 0, maxMarks: 25, minScore: 0, maxScore: 307, minRank: 27518, maxRank: 170825 },
]

export type CandidateCategory = 'General' | 'OBC' | 'EWS' | 'SC' | 'ST' | 'PwD'

export const categoryQualifyingRatios: Record<CandidateCategory, number> = {
  General: 1,
  OBC: 0.9,
  EWS: 0.9,
  SC: 2 / 3,
  ST: 2 / 3,
  PwD: 2 / 3,
}

export const gateCs2025Stats = {
  registered: 207851,
  appeared: 170825,
  qualified: 27518,
  qualifyingMarksGeneral: 29.2,
  qualifyingMarksObcEws: 26.2,
  qualifyingMarksScStPwd: 19.4,
  topMeanMarks: 83.24,
  source:
    'GATE 2025 Statistical and Performance Report, IIT Roorkee; GATE 2026 Information Brochure score formula.',
}

export const rankMapping: RankEntry[] = GENERAL_RANKS.map((entry) => ({
  ...entry,
  category: 'General',
}))
