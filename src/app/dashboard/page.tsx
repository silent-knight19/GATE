import CountdownCard from "@/components/dashboard/countdown-card"
import SyllabusOverview from "@/components/dashboard/syllabus-overview"
import ExamOverview from "@/components/dashboard/exam-overview"

export default function DashboardPage() {
  return (
    <div className="space-y-8 p-6">
      <div className="animate-fade-in-up" style={{ animationDelay: "0ms" }}>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your GATE CSE 2027 preparation at a glance</p>
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <CountdownCard />
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: "150ms" }}>
        <ExamOverview />
      </div>

      <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
        <SyllabusOverview />
      </div>
    </div>
  )
}
