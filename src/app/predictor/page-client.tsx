'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { MarksConverter } from '@/components/predictor/marks-converter'
import { CollegePredictor } from '@/components/predictor/college-predictor'
import { TargetTracker } from '@/components/predictor/target-tracker'

const TABS = [
  { value: 'converter', label: 'Marks → Score → Rank' },
  { value: 'college', label: 'College Predictor' },
  { value: 'target', label: 'Target Tracker' },
] as const

export default function PredictorPage() {
  const router = useRouter()
  const [tab, setTab] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '')
      if (hash && TABS.some(t => t.value === hash)) return hash
    }
    return 'converter'
  })

  const handleTabChange = (value: string) => {
    setTab(value)
    router.replace(`/predictor#${value}`, { scroll: false })
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-4 md:p-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground">Predictors</h1>
        <p className="text-xs text-muted-foreground">Marks conversion, college prediction & target tracking tools</p>
      </div>

      <div className="rounded-lg bg-muted p-1">
        <div className="flex gap-1">
          {TABS.map(t => (
            <button
              key={t.value}
              onClick={() => handleTabChange(t.value)}
              className={cn(
                "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                tab === t.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'converter' && <MarksConverter />}
      {tab === 'college' && <CollegePredictor />}
      {tab === 'target' && <TargetTracker />}
    </div>
  )
}
