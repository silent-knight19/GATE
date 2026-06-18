import MetricsCards from "@/components/dashboard/metrics-cards"
import ReadinessScore from "@/components/dashboard/readiness-score"
import PerformanceChart from "@/components/dashboard/performance-chart"
import WeakSubjects from "@/components/dashboard/weak-subjects"
import StudyHoursChart from "@/components/analytics/study-hours-chart"
import ScoreDistribution from "@/components/analytics/score-distribution"
import ErrorAnalysis from "@/components/analytics/error-analysis"
import ConsistencyHeatmap from "@/components/analytics/consistency-heatmap"
import BurnoutIndicator from "@/components/analytics/burnout-indicator"

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground">Deep analysis of your preparation</p>
      </div>

      <MetricsCards />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ReadinessScore />
        <BurnoutIndicator />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <PerformanceChart />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <WeakSubjects />
        <StudyHoursChart />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ScoreDistribution />
        <ErrorAnalysis />
      </div>

      <ConsistencyHeatmap />
    </div>
  )
}
