'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Building2, Globe, MapPin, Calendar, Users, IndianRupeeIcon, X } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export interface CutoffEntry {
  category: string
  score: string
}

export interface PSU {
  id: string
  name: string
  fullName: string
  website: string
  salaryRange: string
  salaryMin: number
  eligibility: string
  recruitmentPeriod: string
  selectionProcess: string
  vacancies: string
  sector: string
  status: 'active' | 'upcoming' | 'closed'
  expectedCutoffs?: CutoffEntry[]
}

interface PsuCardProps {
  psu: PSU
}

function formatSalary(salaryRange: string): string {
  const digits = salaryRange.replace(/[^0-9\-]/g, '')
  return `₹${digits} LPA`
}

export const PsuCard = React.memo(function PsuCard({ psu }: PsuCardProps) {
  const [open, setOpen] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [open])

  const statusColors: Record<string, string> = {
    active: 'bg-green-500/10 text-green-600 border-green-500/20',
    upcoming: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    closed: 'bg-muted text-muted-foreground border-border',
  }

  return (
    <>
      <Card
        className="cursor-pointer hover:ring-2 hover:ring-ring/50 transition-all"
        onClick={() => setOpen(true)}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Building2 className="size-4 shrink-0 text-muted-foreground" />
                <CardTitle className="truncate">{psu.name}</CardTitle>
              </div>
              <CardDescription className="mt-0.5 line-clamp-1">{psu.fullName}</CardDescription>
            </div>
            <Badge variant="outline" className={`shrink-0 ${statusColors[psu.status]}`}>
              {psu.status.charAt(0).toUpperCase() + psu.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <IndianRupeeIcon className="size-3.5" />
            <span className="font-medium text-foreground">{formatSalary(psu.salaryRange)}</span>
            <span className="mx-1">·</span>
            <MapPin className="size-3.5" />
            <span>Pan India</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="size-3.5" />
            <span>{psu.recruitmentPeriod}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="size-3.5" />
            <span>{psu.vacancies}</span>
          </div>
        </CardContent>
      </Card>

      <dialog
        ref={dialogRef}
        className="z-50 rounded-xl border border-border bg-card p-0 shadow-xl w-[calc(100%-2rem)] sm:max-w-lg max-h-[85vh]"
        onClick={(e) => {
          if (e.target === dialogRef.current) setOpen(false)
        }}
        onClose={() => setOpen(false)}
      >
        <div className="max-h-[85vh] overflow-y-auto p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="size-5 text-muted-foreground" />
              <div>
                <h2 className="text-lg font-semibold text-foreground">{psu.name}</h2>
                <p className="text-sm text-muted-foreground">{psu.fullName}</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Sector</span>
                <p className="font-medium text-foreground">{psu.sector}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Salary Range</span>
                <p className="font-medium text-foreground">{psu.salaryRange}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Status</span>
                <Badge variant="outline" className={statusColors[psu.status]}>
                  {psu.status.charAt(0).toUpperCase() + psu.status.slice(1)}
                </Badge>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Vacancies</span>
                <p className="font-medium text-foreground">{psu.vacancies}</p>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Eligibility</span>
              <p className="text-sm text-foreground">{psu.eligibility}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Recruitment Period</span>
              <p className="text-sm text-foreground">{psu.recruitmentPeriod}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Selection Process</span>
              <p className="text-sm text-foreground">{psu.selectionProcess}</p>
            </div>

            {psu.expectedCutoffs && psu.expectedCutoffs.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs text-muted-foreground">Expected GATE Cutoffs (Score / Marks)</span>
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-3 py-1.5 text-left text-xs font-medium text-muted-foreground">Category</th>
                        <th className="px-3 py-1.5 text-left text-xs font-medium text-muted-foreground">Expected Cutoff</th>
                      </tr>
                    </thead>
                    <tbody>
                      {psu.expectedCutoffs.map((c, i) => (
                        <tr key={i} className={i < psu.expectedCutoffs!.length - 1 ? 'border-b border-border' : ''}>
                          <td className="px-3 py-1.5 text-foreground">{c.category}</td>
                          <td className="px-3 py-1.5 font-mono text-foreground">{c.score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <a
              href={psu.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <Globe className="size-4" />
              Visit official website
            </a>
          </div>
        </div>
      </dialog>
    </>
  )
})
