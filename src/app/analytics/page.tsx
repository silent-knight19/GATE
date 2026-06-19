import type { Metadata } from "next"
import MetricsCards from "@/components/dashboard/metrics-cards"
import ReadinessScore from "@/components/dashboard/readiness-score"
import PerformanceChart from "@/components/dashboard/performance-chart"
import WeakSubjects from "@/components/dashboard/weak-subjects"
import SubjectProgressDetailed from "@/components/analytics/subject-progress-detailed"
import WeeklyStudyHours from "@/components/analytics/weekly-study-hours"
import RevisionCoverage from "@/components/analytics/revision-coverage"
import TaskCompletionRate from "@/components/analytics/task-completion-rate"
import PlannedVsActual from "@/components/analytics/planned-vs-actual"
import SubjectErrorBreakdown from "@/components/analytics/subject-error-breakdown"
import ScoreDistribution from "@/components/analytics/score-distribution"
import ErrorAnalysis from "@/components/analytics/error-analysis"
import ConsistencyHeatmap from "@/components/analytics/consistency-heatmap"

export const metadata: Metadata = {
  title: "Analytics & Readiness Insights",
  description: "Comprehensive analytics of your GATE 2027 preparation — syllabus progress, study hours, revision coverage, mock test performance, and more.",
  keywords: ["GATE analytics", "GATE 2027 readiness score", "GATE study heatmap", "weak subjects GATE"],
  alternates: {
    canonical: "https://gate-tracker-e1a99.web.app/analytics",
  },
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Your complete preparation journey at a glance</p>
      </div>

      <MetricsCards />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ReadinessScore />
        </div>
        <div className="lg:col-span-2">
          <SubjectProgressDetailed />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <WeeklyStudyHours />
        <ConsistencyHeatmap />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PerformanceChart />
        <ScoreDistribution />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RevisionCoverage />
        <WeakSubjects />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <PlannedVsActual />
        <TaskCompletionRate />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ErrorAnalysis />
        <SubjectErrorBreakdown />
      </div>
    </div>
  )
}
