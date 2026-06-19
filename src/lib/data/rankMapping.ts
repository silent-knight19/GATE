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
  { minMarks: 85, maxMarks: 100, minScore: 920, maxScore: 1000, minRank: 1, maxRank: 15 },
  { minMarks: 75, maxMarks: 85, minScore: 830, maxScore: 920, minRank: 15, maxRank: 100 },
  { minMarks: 70, maxMarks: 75, minScore: 780, maxScore: 830, minRank: 100, maxRank: 250 },
  { minMarks: 65, maxMarks: 70, minScore: 730, maxScore: 780, minRank: 250, maxRank: 500 },
  { minMarks: 60, maxMarks: 65, minScore: 670, maxScore: 730, minRank: 500, maxRank: 1000 },
  { minMarks: 55, maxMarks: 60, minScore: 600, maxScore: 670, minRank: 1000, maxRank: 1800 },
  { minMarks: 50, maxMarks: 55, minScore: 540, maxScore: 600, minRank: 1800, maxRank: 3500 },
  { minMarks: 45, maxMarks: 50, minScore: 480, maxScore: 540, minRank: 3500, maxRank: 6000 },
  { minMarks: 40, maxMarks: 45, minScore: 420, maxScore: 480, minRank: 6000, maxRank: 10000 },
  { minMarks: 35, maxMarks: 40, minScore: 360, maxScore: 420, minRank: 10000, maxRank: 16000 },
  { minMarks: 28, maxMarks: 35, minScore: 280, maxScore: 360, minRank: 16000, maxRank: 28000 },
  { minMarks: 0, maxMarks: 28, minScore: 0, maxScore: 280, minRank: 28000, maxRank: 170825 },
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
