import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { format, startOfWeek, addDays } from 'date-fns'
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
  type: 'study' | 'revision' | 'mock' | 'practice'
  timeSlot?: 'morning' | 'afternoon' | 'evening'
  startTime?: string
  endTime?: string
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

export interface SyncStatus {
  state: 'saved' | 'saving' | 'error'
  lastError: string | null
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
  clearAllTasks: () => void
  completeTask: (groupId: string, taskId: string) => void
  completeTaskOnTimer: (topicId: string) => void
  addCustomTask: (task: Omit<Task, 'id'>) => void
  updateTask: (groupDate: string, taskId: string, updates: Partial<Omit<Task, 'id'>>) => void
  removeTask: (groupDate: string, taskId: string) => void
  getTodayTasks: () => DailyTaskGroup | undefined
  getUpcomingTasks: () => DailyTaskGroup[]
  getWeekDates: (date?: Date) => string[]

  plannerSettings: PlannerSettings
  updateSettings: (settings: Partial<PlannerSettings>) => void

  revisionHistory: RevisionEntry[]
  markRevised: (topicId: string, confidence?: number) => void
  updateConfidence: (topicId: string, confidence: number) => void
  getTopicsNeedingRevision: () => RevisionEntry[]
  getStalenessMap: () => Record<string, number>

  syncStatus: SyncStatus
  setSyncStatus: (status: Partial<SyncStatus>) => void

  appState: AppState
  toggleTheme: () => void
  toggleSidebar: () => void
  completeOnboarding: () => void

  timerState: {
    startTime: number | null
    accumulated: number
    isRunning: boolean
    selectedSubjectId: string
    selectedTopicId: string
  }
  setTimerState: (state: Partial<{
    startTime: number | null
    accumulated: number
    isRunning: boolean
    selectedSubjectId: string
    selectedTopicId: string
  }>) => void
  resetTimer: () => void
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

const initialTimerState = {
  startTime: null as number | null,
  accumulated: 0,
  isRunning: false,
  selectedSubjectId: '',
  selectedTopicId: '',
}

export function stripFunctions(state: AppStore): Record<string, unknown> {
  const allowed: (keyof AppStore)[] = [
    'user', 'topicsProgress', 'logs', 'tests', 'dailyTasks',
    'weeklyTargets', 'plannerSettings', 'revisionHistory', 'appState',
  ]
  const result: Record<string, unknown> = {}
  for (const key of allowed) {
    result[key] = state[key]
  }
  return result
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
          category: '',
          college: '',
          year: 2027,
          working: false,
          workHours: 0,
          studyHours: 0,
          targetRank: 0,
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
          const current = get().topicsProgress[topicId] || 'not_started'
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
            logs: [...state.logs, { ...entry, date: format(new Date(), 'yyyy-MM-dd') }]
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
                hours[subject.shortName] = (hours[subject.shortName] || 0) + log.hours
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
          const refDate = date ? new Date(date + 'T00:00:00') : new Date()
          const mon = startOfWeek(refDate, { weekStartsOn: 1 })
          const weekDates: string[] = Array.from({ length: 7 }, (_, i) => format(addDays(mon, i), 'yyyy-MM-dd'))

          const progress = get().topicsProgress
          const weak = get().plannerSettings.weakSubjects
          const strong = get().plannerSettings.strongSubjects
          const availableHours = get().plannerSettings.availableHours

          const revisionHistory = get().revisionHistory
          const topicRevisionDate: Record<string, string> = {}
          const topicConfidence: Record<string, number> = {}
          for (const r of revisionHistory) {
            topicRevisionDate[r.topicId] = r.lastRevised
            topicConfidence[r.topicId] = r.confidence
          }

          const pendingTopics: Array<{ subjectId: string; topicId: string; topicName: string; score: number }> = []
          const now = new Date()
          for (const subject of syllabus) {
            for (const topic of subject.topics) {
              const status = progress[topic.id]
              if (status === 'completed' || status === 'mastered') {
                const lastRev = topicRevisionDate[topic.id]
                if (lastRev) {
                  const days = Math.round((now.getTime() - new Date(lastRev).getTime()) / 86400000)
                  const conf = topicConfidence[topic.id] || 3
                  const threshold = conf >= 4 ? 14 : conf >= 3 ? 7 : 3
                  if (days >= threshold) {
                    pendingTopics.push({ subjectId: subject.id, topicId: topic.id, topicName: `Revise ${topic.name}`, score: -5 })
                  }
                } else {
                  pendingTopics.push({ subjectId: subject.id, topicId: topic.id, topicName: `Revise ${topic.name}`, score: -5 })
                }
                continue
              }
              if (status === 'not_started' || status === 'in_progress') {
                let score = 0
                if (weak.includes(subject.id)) score -= 3
                if (strong.includes(subject.id)) score += 1
                pendingTopics.push({ subjectId: subject.id, topicId: topic.id, topicName: topic.name, score })
              }
            }
          }

          pendingTopics.sort((a, b) => a.score - b.score)

          const slots: { key: 'morning' | 'afternoon' | 'evening'; label: string; maxHours: number }[] = []
          if (availableHours >= 1.5) {
            const m = Math.min(2, availableHours * 0.35)
            slots.push({ key: 'morning', label: 'Morning', maxHours: Math.round(m * 2) / 2 })
          }
          if (availableHours >= 3) {
            const a = Math.min(2.5, availableHours * 0.4)
            slots.push({ key: 'afternoon', label: 'Afternoon', maxHours: Math.round(a * 2) / 2 })
          }
          if (availableHours >= 4.5) {
            const e = Math.min(1.5, availableHours * 0.25)
            slots.push({ key: 'evening', label: 'Evening', maxHours: Math.round(e * 2) / 2 })
          }
          if (slots.length === 0) {
            slots.push({ key: 'morning', label: 'Morning', maxHours: availableHours })
          }

          const subjectDayCount: Record<string, Set<number>> = {}
          const topicIndexRef: Record<string, number> = {}
          const dailyGroups: DailyTaskGroup[] = []
          let topicIdx = 0

          for (let d = 0; d < 7; d++) {
            const dayDate = weekDates[d]
            const dayTasks: Task[] = []

            for (const slot of slots) {
              if (topicIdx >= pendingTopics.length) break
              let hoursLeft = slot.maxHours
              while (hoursLeft >= 0.5 && topicIdx < pendingTopics.length) {
                const t = pendingTopics[topicIdx]
                const taskHours = Math.min(hoursLeft, 1.5)
                const isRevision = t.topicName.startsWith('Revise ')
                const type: Task['type'] = isRevision ? 'revision' : 'study'
                const priority: Task['priority'] = t.score <= -3 ? 'high' : t.score <= 0 ? 'medium' : 'low'

                dayTasks.push({
                  id: generateId(),
                  title: isRevision ? t.topicName : `Study ${t.topicName}`,
                  subjectId: t.subjectId,
                  topicId: t.topicId,
                  estimatedHours: Math.round(taskHours * 2) / 2,
                  priority,
                  completed: false,
                  date: dayDate,
                  type,
                  timeSlot: slot.key,
                })

                hoursLeft -= taskHours
                topicIdx++
                if (!isRevision) break
              }
            }

            dailyGroups.push({
              date: dayDate,
              dayName: format(new Date(dayDate + 'T00:00:00'), 'EEEE'),
              tasks: dayTasks,
              totalHours: dayTasks.reduce((s, t) => s + t.estimatedHours, 0),
              completedHours: 0,
            })
          }

          set(state => {
            const existing = state.dailyTasks.filter(g => !weekDates.includes(g.date))
            return { dailyTasks: [...existing, ...dailyGroups] }
          })
        },

        clearAllTasks: () => set({ dailyTasks: [] }),

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

        /**
         * Adds a manually created task to the planner.
         * Creates a new day group if one doesn't exist for the task's date.
         */
        addCustomTask: (task) => {
          const newTask: Task = { ...task, id: generateId() }
          set(state => {
            const existing = state.dailyTasks.find(g => g.date === task.date)
            if (existing) {
              const updatedTasks = [...existing.tasks, newTask]
              return {
                dailyTasks: state.dailyTasks.map(g =>
                  g.date === task.date
                    ? {
                        ...g,
                        tasks: updatedTasks,
                        totalHours: updatedTasks.reduce((s, t) => s + t.estimatedHours, 0),
                        completedHours: updatedTasks.filter(t => t.completed).reduce((s, t) => s + t.estimatedHours, 0),
                      }
                    : g
                ),
              }
            }
            const newGroup: DailyTaskGroup = {
              date: task.date,
              dayName: format(new Date(task.date + 'T00:00:00'), 'EEEE'),
              tasks: [newTask],
              totalHours: newTask.estimatedHours,
              completedHours: 0,
            }
            return { dailyTasks: [...state.dailyTasks, newGroup] }
          })
        },

        /**
         * Updates fields on an existing task.
         * Recalculates group totals after the update.
         */
        updateTask: (groupDate, taskId, updates) =>
          set(state => ({
            dailyTasks: state.dailyTasks.map(g => {
              if (g.date !== groupDate) return g
              const tasks = g.tasks.map(t =>
                t.id === taskId ? { ...t, ...updates } : t
              )
              return {
                ...g,
                tasks,
                totalHours: tasks.reduce((s, t) => s + t.estimatedHours, 0),
                completedHours: tasks.filter(t => t.completed).reduce((s, t) => s + t.estimatedHours, 0),
              }
            })
          })),

        /**
         * Removes a task from a day group.
         * Removes the group entirely if it becomes empty.
         */
        removeTask: (groupDate, taskId) =>
          set(state => {
            const updated = state.dailyTasks.map(g => {
              if (g.date !== groupDate) return g
              const tasks = g.tasks.filter(t => t.id !== taskId)
              return {
                ...g,
                tasks,
                totalHours: tasks.reduce((s, t) => s + t.estimatedHours, 0),
                completedHours: tasks.filter(t => t.completed).reduce((s, t) => s + t.estimatedHours, 0),
              }
            }).filter(g => g.tasks.length > 0)
            return { dailyTasks: updated }
          }),

        completeTaskOnTimer: (topicId) =>
          set(state => {
            const today = format(new Date(), 'yyyy-MM-dd')
            return {
              dailyTasks: state.dailyTasks.map(g => {
                if (g.date !== today) return g
                const tasks = g.tasks.map(t => {
                  if (t.topicId === topicId && !t.completed) {
                    return { ...t, completed: true }
                  }
                  return t
                })
                return {
                  ...g,
                  tasks,
                  completedHours: tasks.filter(t => t.completed).reduce((s, t) => s + t.estimatedHours, 0),
                }
              })
            }
          }),

        getTodayTasks: () => {
          const today = format(new Date(), 'yyyy-MM-dd')
          return get().dailyTasks.find(g => g.date === today)
        },

        getUpcomingTasks: () => {
          const today = format(new Date(), 'yyyy-MM-dd')
          return get().dailyTasks
            .filter(g => g.date >= today)
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(0, 7)
        },

        getWeekDates: (date?: Date) => {
          const ref = date || new Date()
          const mon = startOfWeek(ref, { weekStartsOn: 1 })
          return Array.from({ length: 7 }, (_, i) => format(addDays(mon, i), 'yyyy-MM-dd'))
        },

        plannerSettings: {
          availableHours: 6,
          strongSubjects: [],
          weakSubjects: [],
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

        syncStatus: { state: 'saved', lastError: null },
  setSyncStatus: (status) =>
    set(state => ({
      syncStatus: { ...state.syncStatus, ...status }
    })),

  timerState: { ...initialTimerState },
        setTimerState: (partial) =>
          set(state => ({
            timerState: { ...state.timerState, ...partial }
          })),
        resetTimer: () =>
          set({
            timerState: { ...initialTimerState }
          }),
      }
    },
    {
      name: 'gateee-store',
      partialize: (state) => {
        const { timerState: _timer, syncStatus: _sync, ...rest } = state
        return rest
      },
      merge: (persisted, current) => {
        const p = persisted as Partial<AppStore>
        return {
          ...current,
          ...p,
          topicsProgress: {
            ...current.topicsProgress,
            ...(p.topicsProgress || {}),
          },
        }
      },
    }
  )
)
