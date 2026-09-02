export interface ExamInfo {
  conductingInstitute: string
  examDates: string[]
  notificationDate: string
  registrationWindow: string
  admitCardDate: string
  resultDate: string
  duration: string
  totalMarks: number
  questionTypes: string[]
  markingScheme: { mcq1Mark: number; mcq2Mark: number }
  scoreValidity: string
}

export const examInfo: ExamInfo = {
  conductingInstitute: 'To be announced for GATE 2027; GATE 2026 was organized by IIT Guwahati',
  examDates: [
    'GATE 2027 dates not officially announced',
    'Verified baseline: GATE 2026 was held on February 7, 8, 14, and 15, 2026',
  ],
  notificationDate: 'To be announced',
  registrationWindow: 'To be announced',
  admitCardDate: 'To be announced',
  resultDate: 'To be announced',
  duration: '3 hours',
  totalMarks: 100,
  questionTypes: [
    'MCQ (negative marking)',
    'MSQ (no negative marking)',
    'NAT (no negative marking)',
  ],
  markingScheme: { mcq1Mark: -1 / 3, mcq2Mark: -2 / 3 },
  scoreValidity: '3 years',
}

/**
 * Subject weightages — verified against 2022–2026 audit (see verifiedPapers.ts).
 * 2022/2023/2026-CS1: VERIFIED (2026-CS1 partial, sums to 85 per source table, 15 marks unclassified)
 * 2024/2025: UNVERIFIED legacy estimates — retained for continuity, must not be treated as audited.
 * CS1/CS2 kept separate in canonical dataset; this 5-year table uses CS1 for 2024-2026 for legacy compatibility.
 * See src/lib/data/verifiedPapers.ts for 8-paper dataset and sources.
 */

export interface SubjectWeightage {
  subjectId: string
  subjectName: string
  yearMarks: { year: number; marks: number }[]
  avgMarks: number
  trend: 'up' | 'down' | 'stable'
  volatility: 'low' | 'medium' | 'high'
}

export const subjectWeightages: SubjectWeightage[] = [
  {
    subjectId: 'ga',
    subjectName: 'General Aptitude',
    yearMarks: [
      { year: 2022, marks: 15 },
      { year: 2023, marks: 15 },
      { year: 2024, marks: 15 },
      { year: 2025, marks: 15 },
      { year: 2026, marks: 15 }
    ],
    avgMarks: 15,
    trend: 'stable',
    volatility: 'low'
  },
  {
    subjectId: 'em',
    subjectName: 'Engineering Mathematics',
    yearMarks: [
      { year: 2022, marks: 6 },
      { year: 2023, marks: 7 },
      { year: 2024, marks: 8 },
      { year: 2025, marks: 8 },
      { year: 2026, marks: 4 }
    ],
    avgMarks: 6.6,
    trend: 'down',
    volatility: 'medium'
  },
  {
    subjectId: 'dm',
    subjectName: 'Discrete Mathematics',
    yearMarks: [
      { year: 2022, marks: 9 },
      { year: 2023, marks: 9 },
      { year: 2024, marks: 5 },
      { year: 2025, marks: 5 },
      { year: 2026, marks: 5 }
    ],
    avgMarks: 6.6,
    trend: 'down',
    volatility: 'medium',
  },
  {
    subjectId: 'dl',
    subjectName: 'Digital Logic',
    yearMarks: [
      { year: 2022, marks: 5 },
      { year: 2023, marks: 8 },
      { year: 2024, marks: 5 },
      { year: 2025, marks: 5 },
      { year: 2026, marks: 5 }
    ],
    avgMarks: 5.6,
    trend: 'stable',
    volatility: 'medium'
  },
  {
    subjectId: 'coa',
    subjectName: 'Computer Organization & Architecture',
    yearMarks: [
      { year: 2022, marks: 8 },
      { year: 2023, marks: 7 },
      { year: 2024, marks: 9 },
      { year: 2025, marks: 9 },
      { year: 2026, marks: 8 }
    ],
    avgMarks: 8.2,
    trend: 'stable',
    volatility: 'low'
  },
  {
    subjectId: 'pds',
    subjectName: 'Programming & Data Structures',
    yearMarks: [
      { year: 2022, marks: 9 },
      { year: 2023, marks: 10 },
      { year: 2024, marks: 8 },
      { year: 2025, marks: 10 },
      { year: 2026, marks: 9 }
    ],
    avgMarks: 9.2,
    trend: 'stable',
    volatility: 'low'
  },
  {
    subjectId: 'algo',
    subjectName: 'Algorithms',
    yearMarks: [
      { year: 2022, marks: 9 },
      { year: 2023, marks: 6 },
      { year: 2024, marks: 8 },
      { year: 2025, marks: 8 },
      { year: 2026, marks: 8 }
    ],
    avgMarks: 7.8,
    trend: 'stable',
    volatility: 'medium'
  },
  {
    subjectId: 'toc',
    subjectName: 'Theory of Computation',
    yearMarks: [
      { year: 2022, marks: 10 },
      { year: 2023, marks: 9 },
      { year: 2024, marks: 7 },
      { year: 2025, marks: 9 },
      { year: 2026, marks: 7 }
    ],
    avgMarks: 8.4,
    trend: 'down',
    volatility: 'medium'
  },
  {
    subjectId: 'cd',
    subjectName: 'Compiler Design',
    yearMarks: [
      { year: 2022, marks: 5 },
      { year: 2023, marks: 7 },
      { year: 2024, marks: 8 },
      { year: 2025, marks: 5 },
      { year: 2026, marks: 5 }
    ],
    avgMarks: 6.0,
    trend: 'stable',
    volatility: 'medium'
  },
  {
    subjectId: 'os',
    subjectName: 'Operating Systems',
    yearMarks: [
      { year: 2022, marks: 6 },
      { year: 2023, marks: 9 },
      { year: 2024, marks: 10 },
      { year: 2025, marks: 8 },
      { year: 2026, marks: 6 }
    ],
    avgMarks: 7.8,
    trend: 'stable',
    volatility: 'medium'
  },
  {
    subjectId: 'db',
    subjectName: 'Databases',
    yearMarks: [
      { year: 2022, marks: 7 },
      { year: 2023, marks: 5 },
      { year: 2024, marks: 8 },
      { year: 2025, marks: 8 },
      { year: 2026, marks: 7 }
    ],
    avgMarks: 7.0,
    trend: 'stable',
    volatility: 'medium'
  },
  {
    subjectId: 'cn',
    subjectName: 'Computer Networks',
    yearMarks: [
      { year: 2022, marks: 11 },
      { year: 2023, marks: 8 },
      { year: 2024, marks: 9 },
      { year: 2025, marks: 10 },
      { year: 2026, marks: 6 }
    ],
    avgMarks: 8.8,
    trend: 'down',
    volatility: 'high'
  },
]
