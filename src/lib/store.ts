import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TopicStatus } from '@/lib/data/syllabus'
import { syllabus } from '@/lib/data/syllabus'

export interface StudyLogEntry {
  date: string
  subjectId: string
  topicId: string
  hours: number
  activityType: 'study' | 'revision' | 'practice' | 'mock'
}

export interface ErrorEntry {
  subject: string
  topic: string
  errorType: string
  count: number
}

export interface MockTest {
  id: string
  source: string
  date: string
  totalMarks: number
  marksObtained: number
  subjectBreakdown: Record<string, number>
  errorAnalysis: ErrorEntry[]
}

export interface Task {
  id: string
  title: string
  subjectId: string
  topicId: string
  estimatedHours: number
  priority: 'high' | 'medium' | 'low'
  completed: boolean
  date: string
}

export interface DailyTaskGroup {
  date: string
  dayName: string
  tasks: Task[]
  totalHours: number
  completedHours: number
}

export interface WeeklyTarget {
  weekStart: string
  weekEnd: string
  totalHours: number
  subjects: Record<string, number>
  mockTestPlanned: boolean
}

export interface PlannerSettings {
  availableHours: number
  strongSubjects: string[]
  weakSubjects: string[]
  preferredStudyTime: 'morning' | 'afternoon' | 'evening' | 'night'
}

export interface RevisionEntry {
  topicId: string
  lastRevised: string
  confidence: number
  revisionCount: number
}

export interface AppState {
  theme: 'dark' | 'light'
  sidebarOpen: boolean
  onboardingComplete: boolean
}

export interface UserProfile {
  name: string
  email: string
  category: string
  college: string
  year: number
  working: boolean
  workHours: number
  studyHours: number
  targetRank: number
  targetScore: number
  targetCollege: string
}

interface AppStore {
  user: UserProfile
  updateProfile: (profile: Partial<UserProfile>) => void
  setTarget: (target: Partial<Pick<UserProfile, 'targetRank' | 'targetScore' | 'targetCollege'>>) => void

  topicsProgress: Record<string, TopicStatus>
  setTopicStatus: (topicId: string, status: TopicStatus) => void
  cycleTopicStatus: (topicId: string) => void
  getSubjectProgress: (subjectId: string) => { completed: number; total: number; percent: number }
  getOverallProgress: () => { completed: number; mastered: number; total: number; percent: number; notStarted: number; inProgress: number }
  getTopicsForSubject: (subjectId: string) => { id: string; name: string; status: TopicStatus }[]

  logs: StudyLogEntry[]
  addLogEntry: (entry: Omit<StudyLogEntry, 'date'>) => void
  removeLogEntry: (index: number) => void
  getStreak: () => number
  getTotalHours: () => number
  getHoursBySubject: () => Record<string, number>
  getAverageDailyHours: () => number

  tests: MockTest[]
  addMockTest: (test: MockTest) => void
  removeMockTest: (id: string) => void
  getMockTrend: () => { date: string; marks: number }[]
  getSubjectWeakness: () => { subject: string; avgMarks: number; maxMarks: number }[]
  getErrorProfile: () => { errorType: string; totalCount: number }[]

  dailyTasks: DailyTaskGroup[]
  weeklyTargets: WeeklyTarget[]
  generateDailyTasks: (date?: string) => void
  completeTask: (groupId: string, taskId: string) => void
  generateWeeklyPlan: () => void
  getTodayTasks: () => DailyTaskGroup | undefined
  getUpcomingTasks: () => DailyTaskGroup[]

  plannerSettings: PlannerSettings
  updateSettings: (settings: Partial<PlannerSettings>) => void

  revisionHistory: RevisionEntry[]
  markRevised: (topicId: string, confidence?: number) => void
  updateConfidence: (topicId: string, confidence: number) => void
  getTopicsNeedingRevision: () => RevisionEntry[]
  getStalenessMap: () => Record<string, number>

  appState: AppState
  toggleTheme: () => void
  toggleSidebar: () => void
  completeOnboarding: () => void
}

function getAllTopicIds(): string[] {
  return syllabus.flatMap(s => s.topics.map(t => t.id))
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10)
}

function getDayName(dateStr: string): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[new Date(dateStr).getDay()]
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => {
      const initialStatuses: Record<string, TopicStatus> = {}
      for (const id of getAllTopicIds()) {
        initialStatuses[id] = 'not_started'
      }

      return {
        user: {
          name: '',
          email: '',
          category: 'General',
          college: '',
          year: 2027,
          working: false,
          workHours: 0,
          studyHours: 6,
          targetRank: 500,
          targetScore: 0,
          targetCollege: '',
        },

        updateProfile: (profile) =>
          set(state => ({ user: { ...state.user, ...profile } })),

        setTarget: (target) =>
          set(state => ({ user: { ...state.user, ...target } })),

        topicsProgress: initialStatuses,

        setTopicStatus: (topicId, status) =>
          set(state => ({
            topicsProgress: { ...state.topicsProgress, [topicId]: status }
          })),

        cycleTopicStatus: (topicId) => {
          const current = get().topicsProgress[topicId]
          const order: TopicStatus[] = ['not_started', 'in_progress', 'completed', 'mastered']
          const nextIndex = (order.indexOf(current) + 1) % order.length
          set(state => ({
            topicsProgress: { ...state.topicsProgress, [topicId]: order[nextIndex] }
          }))
        },

        getSubjectProgress: (subjectId) => {
          const subject = syllabus.find(s => s.id === subjectId)
          if (!subject) return { completed: 0, total: 0, percent: 0 }
          const total = subject.topics.length
          const completed = subject.topics.filter(
            t => {
              const s = get().topicsProgress[t.id]
              return s === 'completed' || s === 'mastered'
            }
          ).length
          return { completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 }
        },

        getOverallProgress: () => {
          const allTopics = getAllTopicIds()
          const total = allTopics.length
          let notStarted = 0
          let inProgress = 0
          let completed = 0
          let mastered = 0
          for (const id of allTopics) {
            const s = get().topicsProgress[id]
            if (s === 'not_started') notStarted++
            else if (s === 'in_progress') inProgress++
            else if (s === 'completed') completed++
            else if (s === 'mastered') mastered++
          }
          const done = completed + mastered
          return { completed, mastered, total, notStarted, inProgress, percent: total > 0 ? Math.round((done / total) * 100) : 0 }
        },

        getTopicsForSubject: (subjectId) => {
          const subject = syllabus.find(s => s.id === subjectId)
          if (!subject) return []
          return subject.topics.map(t => ({
            id: t.id,
            name: t.name,
            status: get().topicsProgress[t.id] || 'not_started'
          }))
        },

        logs: [],

        addLogEntry: (entry) =>
          set(state => ({
            logs: [...state.logs, { ...entry, date: new Date().toISOString().split('T')[0] }]
          })),

        removeLogEntry: (index) =>
          set(state => ({
            logs: state.logs.filter((_, i) => i !== index)
          })),

        getStreak: () => {
          const logs = get().logs
          if (logs.length === 0) return 0
          const dateSet = new Set(logs.map(l => l.date))
          const sorted = Array.from(dateSet).sort().reverse()
          let streak = 0
          const today = new Date()
          for (let i = 0; i < sorted.length; i++) {
            const expected = new Date(today)
            expected.setDate(expected.getDate() - i)
            const expectedStr = expected.toISOString().split('T')[0]
            if (sorted[i] === expectedStr) {
              streak++
            } else {
              break
            }
          }
          return streak
        },

        getTotalHours: () =>
          get().logs.reduce((sum, l) => sum + l.hours, 0),

        getHoursBySubject: () => {
          const hours: Record<string, number> = {}
          for (const log of get().logs) {
            for (const subject of syllabus) {
              if (subject.id === log.subjectId) {
                hours[subject.name] = (hours[subject.name] || 0) + log.hours
                break
              }
            }
          }
          return hours
        },

        getAverageDailyHours: () => {
          const logs = get().logs
          if (logs.length === 0) return 0
          const uniqueDays = new Set(logs.map(l => l.date)).size
          const totalHours = logs.reduce((sum, l) => sum + l.hours, 0)
          return uniqueDays > 0 ? Math.round((totalHours / uniqueDays) * 100) / 100 : 0
        },

        tests: [],

        addMockTest: (test) =>
          set(state => ({ tests: [...state.tests, test] })),

        removeMockTest: (id) =>
          set(state => ({ tests: state.tests.filter(t => t.id !== id) })),

        getMockTrend: () =>
          get().tests
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(t => ({ date: t.date, marks: t.marksObtained })),

        getSubjectWeakness: () => {
          const tests = get().tests
          const subjectScores: Record<string, { total: number; count: number }> = {}
          for (const test of tests) {
            for (const [subject, marks] of Object.entries(test.subjectBreakdown)) {
              if (!subjectScores[subject]) subjectScores[subject] = { total: 0, count: 0 }
              subjectScores[subject].total += marks
              subjectScores[subject].count++
            }
          }
          return Object.entries(subjectScores).map(([subject, data]) => ({
            subject,
            avgMarks: data.count > 0 ? Math.round((data.total / data.count) * 100) / 100 : 0,
            maxMarks: 15,
          })).sort((a, b) => a.avgMarks - b.avgMarks)
        },

        getErrorProfile: () => {
          const errorCounts: Record<string, number> = {}
          for (const test of get().tests) {
            for (const error of test.errorAnalysis) {
              errorCounts[error.errorType] = (errorCounts[error.errorType] || 0) + error.count
            }
          }
          return Object.entries(errorCounts).map(([errorType, totalCount]) => ({
            errorType,
            totalCount,
          })).sort((a, b) => b.totalCount - a.totalCount)
        },

        dailyTasks: [],

        weeklyTargets: [],

        generateDailyTasks: (date?: string) => {
          const targetDate = date || new Date().toISOString().split('T')[0]
          const progress = get().topicsProgress
          const weak = get().plannerSettings.weakSubjects
          const strong = get().plannerSettings.strongSubjects

          const pendingTopics: Array<{ subjectId: string; topicId: string; topicName: string }> = []
          for (const subject of syllabus) {
            for (const topic of subject.topics) {
              const status = progress[topic.id]
              if (status === 'not_started' || status === 'in_progress') {
                pendingTopics.push({
                  subjectId: subject.id,
                  topicId: topic.id,
                  topicName: topic.name,
                })
              }
            }
          }

          pendingTopics.sort((a, b) => {
            const aWeak = weak.includes(a.subjectId) ? -1 : 0
            const bWeak = weak.includes(b.subjectId) ? -1 : 0
            if (aWeak !== bWeak) return aWeak - bWeak
            const aStrong = strong.includes(a.subjectId) ? 1 : 0
            const bStrong = strong.includes(b.subjectId) ? 1 : 0
            if (aStrong !== bStrong) return aStrong - bStrong
            return 0
          })

          const tasks: Task[] = pendingTopics.slice(0, 4).map((t, i) => ({
            id: generateId(),
            title: `Study ${t.topicName}`,
            subjectId: t.subjectId,
            topicId: t.topicId,
            estimatedHours: i === 0 ? 2 : 1.5,
            priority: i === 0 ? 'high' : i <= 2 ? 'medium' : 'low',
            completed: false,
            date: targetDate,
          }))

          set(state => {
            const existing = state.dailyTasks.filter(g => g.date !== targetDate)
            const group: DailyTaskGroup = {
              date: targetDate,
              dayName: getDayName(targetDate),
              tasks,
              totalHours: tasks.reduce((s, t) => s + t.estimatedHours, 0),
              completedHours: 0,
            }
            return { dailyTasks: [...existing, group] }
          })
        },

        completeTask: (groupId, taskId) =>
          set(state => ({
            dailyTasks: state.dailyTasks.map(g => {
              if (g.date !== groupId) return g
              const tasks = g.tasks.map(t =>
                t.id === taskId ? { ...t, completed: !t.completed } : t
              )
              return {
                ...g,
                tasks,
                completedHours: tasks.filter(t => t.completed).reduce((s, t) => s + t.estimatedHours, 0),
              }
            })
          })),

        generateWeeklyPlan: () => {
          const weak = get().plannerSettings.weakSubjects
          const strong = get().plannerSettings.strongSubjects
          const availableHours = get().plannerSettings.availableHours

          const subjectsHours: Record<string, number> = {}
          for (const subject of syllabus) {
            const isWeak = weak.includes(subject.id)
            const isStrong = strong.includes(subject.id)
            const weight = isWeak ? 0.15 : isStrong ? 0.05 : 0.1
            subjectsHours[subject.id] = Math.round(availableHours * weight * 7 * 10) / 10
          }

          const totalPlanned = Object.values(subjectsHours).reduce((a, b) => a + b, 0)
          const factor = (availableHours * 7) / (totalPlanned || 1)
          for (const key of Object.keys(subjectsHours)) {
            subjectsHours[key] = Math.round(subjectsHours[key] * factor * 10) / 10
          }

          const today = new Date()
          const weekStart = new Date(today)
          weekStart.setDate(today.getDate() - today.getDay())
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekStart.getDate() + 6)

          const target: WeeklyTarget = {
            weekStart: weekStart.toISOString().split('T')[0],
            weekEnd: weekEnd.toISOString().split('T')[0],
            totalHours: availableHours * 7,
            subjects: subjectsHours,
            mockTestPlanned: today.getDay() === 6 || today.getDay() === 0,
          }

          set(state => ({
            weeklyTargets: [...state.weeklyTargets, target]
          }))
        },

        getTodayTasks: () => {
          const today = new Date().toISOString().split('T')[0]
          return get().dailyTasks.find(g => g.date === today)
        },

        getUpcomingTasks: () => {
          const today = new Date().toISOString().split('T')[0]
          return get().dailyTasks
            .filter(g => g.date >= today)
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(0, 7)
        },

        plannerSettings: {
          availableHours: 6,
          strongSubjects: ['ga', 'dl'],
          weakSubjects: ['algo', 'cn', 'cd'],
          preferredStudyTime: 'morning',
        },

        updateSettings: (settings) =>
          set(state => ({
            plannerSettings: { ...state.plannerSettings, ...settings }
          })),

        revisionHistory: [],

        markRevised: (topicId, confidence = 3) =>
          set(state => {
            const existing = state.revisionHistory.findIndex(r => r.topicId === topicId)
            const entry: RevisionEntry = {
              topicId,
              lastRevised: new Date().toISOString().split('T')[0],
              confidence,
              revisionCount: existing >= 0 ? state.revisionHistory[existing].revisionCount + 1 : 1,
            }
            const updated = [...state.revisionHistory]
            if (existing >= 0) {
              updated[existing] = entry
            } else {
              updated.push(entry)
            }
            return { revisionHistory: updated }
          }),

        updateConfidence: (topicId, confidence) =>
          set(state => ({
            revisionHistory: state.revisionHistory.map(r =>
              r.topicId === topicId ? { ...r, confidence } : r
            )
          })),

        getTopicsNeedingRevision: () => {
          const now = new Date()
          return get().revisionHistory.filter(r => {
            const revised = new Date(r.lastRevised)
            const daysSince = Math.round((now.getTime() - revised.getTime()) / 86400000)
            const threshold = r.confidence >= 4 ? 14 : r.confidence >= 3 ? 7 : 3
            return daysSince >= threshold
          })
        },

        getStalenessMap: () => {
          const now = new Date()
          const map: Record<string, number> = {}
          for (const r of get().revisionHistory) {
            const revised = new Date(r.lastRevised)
            map[r.topicId] = Math.round((now.getTime() - revised.getTime()) / 86400000)
          }
          return map
        },

        appState: {
          theme: 'dark',
          sidebarOpen: false,
          onboardingComplete: false,
        },

        toggleTheme: () =>
          set(state => ({
            appState: { ...state.appState, theme: state.appState.theme === 'dark' ? 'light' : 'dark' }
          })),

        toggleSidebar: () =>
          set(state => ({
            appState: { ...state.appState, sidebarOpen: !state.appState.sidebarOpen }
          })),

        completeOnboarding: () =>
          set(state => ({
            appState: { ...state.appState, onboardingComplete: true }
          })),
      }
    },
    { name: 'gateee-store' }
  )
)
