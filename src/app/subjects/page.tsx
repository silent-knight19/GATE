"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { syllabus, type Subject } from "@/lib/data/syllabus"
import { useAppStore } from "@/lib/store"
import { SubjectCard } from "@/components/subject-card"

function filterSubjects(subjects: Subject[], query: string): Subject[] {
  if (!query.trim()) return subjects
  const q = query.toLowerCase()
  return subjects.filter(s => s.name.toLowerCase().includes(q))
}

export default function SubjectsPage() {
  const router = useRouter()
  const [query, setQuery] = useState("")

  const getSubjectProgress = useAppStore(s => s.getSubjectProgress)
  const overall = useAppStore(s => s.getOverallProgress)()

  const filtered = useMemo(() => filterSubjects(syllabus, query), [query])

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-4 md:p-6">
      <title>GATE CSE 2027 Subjects List & Individual Progress</title>
      <meta name="description" content="Explore subject-wise syllabus progress, average mark weights, and topic checklists for GATE 2027 Computer Science & Information Technology." />
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Subjects</h1>
          <p className="text-xs text-muted-foreground">
            {overall.completed}/{overall.total} topics &middot; {overall.percent}%
          </p>
        </div>
        <div className="h-1 max-w-[120px] flex-1 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-foreground/70 transition-all"
            style={{ width: `${overall.percent}%` }}
          />
        </div>
      </div>

      <input
        type="text"
        placeholder="Filter subjects..."
        value={query}
        onChange={e => setQuery(e.target.value)}
        className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(subject => (
          <SubjectCard
            key={subject.id}
            subject={subject}
            progress={getSubjectProgress(subject.id)}
            onClick={() => router.push(`/subjects/${subject.id}`)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No subjects match your filter.
        </p>
      )}
    </div>
  )
}
