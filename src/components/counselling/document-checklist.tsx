'use client'

import { useState, useMemo } from 'react'
import { ProgressTrack, ProgressIndicator } from '@/components/ui/progress'
import { CheckIcon, FileTextIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DocumentItem {
  id: string
  name: string
  category: string
}

const DOCUMENTS: DocumentItem[] = [
  { id: 'gate_scorecard', name: 'GATE 2027 Scorecard', category: 'Examination' },
  { id: 'admit_card', name: 'GATE 2027 Admit Card', category: 'Examination' },
  { id: '10_marksheet', name: 'Class 10 Mark Sheet', category: 'Academic' },
  { id: '12_marksheet', name: 'Class 12 Mark Sheet', category: 'Academic' },
  { id: 'degree_certificate', name: 'B.E./B.Tech Degree Certificate', category: 'Academic' },
  { id: 'all_sem_marksheets', name: 'All Semester Mark Sheets', category: 'Academic' },
  { id: 'category_certificate', name: 'Category Certificate (SC/ST/OBC/EWS)', category: 'Identity' },
  { id: 'pwd_certificate', name: 'PwD Certificate (if applicable)', category: 'Identity' },
  { id: 'photo_id', name: 'Government Photo ID (Aadhaar/PAN/Passport)', category: 'Identity' },
  { id: 'passport_photo', name: 'Recent Passport-size Photographs', category: 'Identity' },
  { id: 'bonafide', name: 'Bonafide Certificate from Current Institute', category: 'Institute' },
  { id: 'character_cert', name: 'Character Certificate', category: 'Institute' },
  { id: 'migration_cert', name: 'Migration Certificate', category: 'Institute' },
  { id: 'gap_affidavit', name: 'Gap Year Affidavit (if applicable)', category: 'Other' },
  { id: 'income_cert', name: 'Income Certificate (for fee waiver)', category: 'Other' },
  { id: 'sponsorship', name: 'Sponsorship Certificate (if sponsored)', category: 'Other' },
  { id: 'noc', name: 'NOC from Employer (if employed)', category: 'Other' },
  { id: 'medical_cert', name: 'Medical Fitness Certificate', category: 'Other' },
]

const CATEGORIES = ['Examination', 'Academic', 'Identity', 'Institute', 'Other']

export function DocumentChecklist() {
  const [checked, setChecked] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const progress = useMemo(() => {
    const total = DOCUMENTS.length
    const done = checked.size
    return { total, done, pct: total > 0 ? Math.round((done / total) * 100) : 0 }
  }, [checked])

  const grouped = useMemo(() => {
    const groups: Record<string, DocumentItem[]> = {}
    for (const cat of CATEGORIES) {
      groups[cat] = DOCUMENTS.filter(d => d.category === cat)
    }
    return groups
  }, [])

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex w-full items-center justify-between">
          <span className="text-sm font-medium">Document Preparation Progress</span>
          <span className="text-sm text-muted-foreground tabular-nums">{progress.done}/{progress.total}</span>
        </div>
        <div className="relative flex h-2 w-full items-center overflow-x-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all rounded-full"
            style={{ width: `${progress.pct}%` }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {CATEGORIES.map(cat => {
          const docs = grouped[cat]
          if (!docs || docs.length === 0) return null
          const catDone = docs.filter(d => checked.has(d.id)).length
          return (
            <div key={cat}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{cat}</h4>
                <span className="text-xs text-muted-foreground">{catDone}/{docs.length}</span>
              </div>
              <div className="space-y-1">
                {docs.map(doc => {
                  const isChecked = checked.has(doc.id)
                  return (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => toggle(doc.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left text-sm transition-all',
                        isChecked
                          ? 'border-green-500/30 bg-green-500/5'
                          : 'border-border bg-card hover:bg-muted/50',
                      )}
                    >
                      <div
                        className={cn(
                          'flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                          isChecked
                            ? 'border-green-500 bg-green-500 text-white'
                            : 'border-muted-foreground/30',
                        )}
                      >
                        {isChecked && <CheckIcon className="size-3" />}
                      </div>
                      <FileTextIcon className={cn('size-4 shrink-0', isChecked ? 'text-green-600' : 'text-muted-foreground')} />
                      <span className={cn(isChecked && 'line-through text-muted-foreground')}>{doc.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
