import React from "react"
import type { Subject } from '@/lib/data/syllabus'

interface SubjectCardProps {
  subject: Subject
  progress: { completed: number; total: number; percent: number }
  onClick?: () => void
}

function Sparkline({ yearMarks }: { yearMarks: { year: number; marks: number }[] }) {
  const maxMarks = Math.max(...yearMarks.map(y => y.marks), 1)
  return (
    <div className="flex items-end gap-[2px] h-8">
      {yearMarks.map(y => {
        const h = Math.max(4, (y.marks / maxMarks) * 28)
        return (
          <div
            key={y.year}
            className="w-[6px] rounded-sm bg-current opacity-70 transition-all group-hover/card:opacity-100"
            style={{ height: h }}
            title={`${y.year}: ${y.marks}`}
          />
        )
      })}
    </div>
  )
}

const volatilityColors: Record<string, string> = {
  stable: 'text-emerald-500',
  moderate: 'text-amber-500',
  volatile: 'text-red-500',
}

const volatilityBg: Record<string, string> = {
  stable: 'bg-emerald-500/10',
  moderate: 'bg-amber-500/10',
  volatile: 'bg-red-500/10',
}

export const SubjectCard = React.memo(function SubjectCard({ subject, progress, onClick }: SubjectCardProps) {
  return (
    <button
      onClick={onClick}
      className="group/card flex flex-col gap-2 rounded-xl border border-border bg-card p-3 text-left transition-[transform,border-color,box-shadow] hover:border-foreground/20 hover:shadow-sm active:scale-[0.98]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: subject.color }}
          />
          <span className="truncate text-sm font-medium text-foreground">
            {subject.name}
          </span>
        </div>
        <span
          className={`shrink-0 rounded-full px-1.5 py-[1px] text-[10px] font-medium uppercase tracking-wider ${volatilityColors[subject.volatility]} ${volatilityBg[subject.volatility]}`}
        >
          {subject.volatility}
        </span>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-2xl font-semibold tracking-tight text-foreground">
            {subject.avgMarks}
          </span>
          <span className="text-xs text-muted-foreground">avg</span>
        </div>
        <Sparkline yearMarks={subject.yearMarks} />
      </div>

      <div className="flex items-center gap-2">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-foreground/70 transition-all"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
        <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
          {progress.completed}/{progress.total}
        </span>
      </div>
    </button>
  )
})
