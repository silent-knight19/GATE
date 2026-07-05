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
      { year: 2026, marks: 15 },
    ],
    avgMarks: 15,
    trend: 'stable',
    volatility: 'low',
  },
  {
    subjectId: 'em',
    subjectName: 'Engineering Mathematics',
    yearMarks: [
      { year: 2022, marks: 7 },
      { year: 2023, marks: 4 },
      { year: 2024, marks: 8 },
      { year: 2025, marks: 8 },
      { year: 2026, marks: 6 },
    ],
    avgMarks: 6.6,
    trend: 'stable',
    volatility: 'medium',
  },
  {
    subjectId: 'dl',
    subjectName: 'Digital Logic',
    yearMarks: [
      { year: 2022, marks: 3 },
      { year: 2023, marks: 6 },
      { year: 2024, marks: 5 },
      { year: 2025, marks: 5 },
      { year: 2026, marks: 5 },
    ],
    avgMarks: 4.8,
    trend: 'up',
    volatility: 'medium',
  },
  {
    subjectId: 'coa',
    subjectName: 'Computer Organization & Architecture',
    yearMarks: [
      { year: 2022, marks: 9 },
      { year: 2023, marks: 12 },
      { year: 2024, marks: 9 },
      { year: 2025, marks: 9 },
      { year: 2026, marks: 8 },
    ],
    avgMarks: 9.4,
    trend: 'down',
    volatility: 'medium',
  },
  {
    subjectId: 'pds',
    subjectName: 'Programming & Data Structures',
    yearMarks: [
      { year: 2022, marks: 9 },
      { year: 2023, marks: 11 },
      { year: 2024, marks: 8 },
      { year: 2025, marks: 10 },
      { year: 2026, marks: 11 },
    ],
    avgMarks: 9.8,
    trend: 'stable',
    volatility: 'medium',
  },
  {
    subjectId: 'algo',
    subjectName: 'Algorithms',
    yearMarks: [
      { year: 2022, marks: 7 },
      { year: 2023, marks: 6 },
      { year: 2024, marks: 8 },
      { year: 2025, marks: 8 },
      { year: 2026, marks: 7 },
    ],
    avgMarks: 7.2,
    trend: 'stable',
    volatility: 'low',
  },
  {
    subjectId: 'toc',
    subjectName: 'Theory of Computation',
    yearMarks: [
      { year: 2022, marks: 7 },
      { year: 2023, marks: 9 },
      { year: 2024, marks: 7 },
      { year: 2025, marks: 9 },
      { year: 2026, marks: 8 },
    ],
    avgMarks: 8,
    trend: 'stable',
    volatility: 'medium',
  },
  {
    subjectId: 'cd',
    subjectName: 'Compiler Design',
    yearMarks: [
      { year: 2022, marks: 4 },
      { year: 2023, marks: 5 },
      { year: 2024, marks: 8 },
      { year: 2025, marks: 5 },
      { year: 2026, marks: 6 },
    ],
    avgMarks: 5.6,
    trend: 'stable',
    volatility: 'medium',
  },
  {
    subjectId: 'os',
    subjectName: 'Operating Systems',
    yearMarks: [
      { year: 2022, marks: 9 },
      { year: 2023, marks: 7 },
      { year: 2024, marks: 10 },
      { year: 2025, marks: 8 },
      { year: 2026, marks: 9 },
    ],
    avgMarks: 8.6,
    trend: 'stable',
    volatility: 'medium',
  },
  {
    subjectId: 'db',
    subjectName: 'Databases',
    yearMarks: [
      { year: 2022, marks: 7 },
      { year: 2023, marks: 5 },
      { year: 2024, marks: 8 },
      { year: 2025, marks: 8 },
      { year: 2026, marks: 8 },
    ],
    avgMarks: 7.2,
    trend: 'up',
    volatility: 'medium',
  },
  {
    subjectId: 'cn',
    subjectName: 'Computer Networks',
    yearMarks: [
      { year: 2022, marks: 11 },
      { year: 2023, marks: 8 },
      { year: 2024, marks: 9 },
      { year: 2025, marks: 10 },
      { year: 2026, marks: 10 },
    ],
    avgMarks: 9.6,
    trend: 'stable',
    volatility: 'medium',
  },
]
