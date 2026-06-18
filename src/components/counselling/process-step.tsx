'use client'

import { cn } from '@/lib/utils'
import { CheckIcon } from 'lucide-react'

interface ProcessStepProps {
  step: number
  title: string
  description: string
  isActive?: boolean
  isCompleted?: boolean
  isLast?: boolean
  children?: React.ReactNode
}

export function ProcessStep({
  step,
  title,
  description,
  isActive = false,
  isCompleted = false,
  isLast = false,
  children,
}: ProcessStepProps) {
  return (
    <div className="relative flex gap-4 pb-8 last:pb-0">
      {!isLast && (
        <div
          className={cn(
            'absolute left-[15px] top-8 w-0.5 h-[calc(100%-32px)]',
            isCompleted ? 'bg-primary' : 'bg-border',
          )}
        />
      )}

      <div className="flex flex-col items-center">
        <div
          className={cn(
            'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors',
            isCompleted && 'border-primary bg-primary text-primary-foreground',
            isActive && !isCompleted && 'border-primary bg-primary/10 text-primary',
            !isActive && !isCompleted && 'border-border bg-background text-muted-foreground',
          )}
        >
          {isCompleted ? <CheckIcon className="size-4" /> : step}
        </div>
      </div>

      <div className="min-w-0 flex-1 pt-0.5">
        <h3 className={cn('text-sm font-medium', isActive && 'text-primary')}>{title}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        {children && <div className="mt-2">{children}</div>}
      </div>
    </div>
  )
}
