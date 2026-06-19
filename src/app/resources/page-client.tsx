"use client"

import { useMemo, useState } from "react"
import { Search, BookOpen, ExternalLink, GraduationCap, Star, FlaskConical, FileText, Calendar, Award, Library, Play } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { subjectResources, generalResources, contributor, type ResourceLink, type Textbook, type SubjectResources } from "@/lib/data/resources"

type SectionType = 'youtube' | 'revision' | 'nptel' | 'textbook' | 'pyqs' | 'tests'

const sectionMeta: { key: SectionType; icon: React.ReactNode; label: string }[] = [
  { key: 'youtube',  icon: <Play className="size-3.5" />,     label: 'YouTube' },
  { key: 'revision', icon: <BookOpen className="size-3.5" />,  label: 'Revision & PYQs' },
  { key: 'nptel',    icon: <GraduationCap className="size-3.5" />, label: 'NPTEL' },
  { key: 'textbook', icon: <FileText className="size-3.5" />,  label: 'Textbooks' },
  { key: 'pyqs',     icon: <Star className="size-3.5" />,      label: 'Topicwise PYQs' },
  { key: 'tests',    icon: <FlaskConical className="size-3.5" />, label: 'Free Tests' },
]

function getSectionItems(subject: SubjectResources, key: SectionType): ResourceLink[] | Textbook[] {
  switch (key) {
    case 'youtube':  return subject.youtubePlaylists
    case 'revision': return subject.revisionPyqs
    case 'nptel':    return subject.nptelLectures
    case 'textbook': return subject.textbooks
    case 'pyqs':     return subject.topicwisePyqs
    case 'tests':    return subject.freeTests
  }
}

function LinkChip({ link }: { link: ResourceLink }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/30 px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <span className="truncate max-w-[220px]">{link.title}</span>
      <ExternalLink className="size-2.5 shrink-0 opacity-40" />
    </a>
  )
}

function TextbookBlock({ book }: { book: Textbook }) {
  return (
    <div className="rounded-md border border-border bg-muted/30 px-2 py-1 text-xs">
      <span className="font-medium text-foreground">{book.name}</span>
      {book.edition && <span className="ml-1 text-muted-foreground">({book.edition})</span>}
      {book.chapters && <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground/60">{book.chapters}</p>}
    </div>
  )
}

function SubjectModal({ subject, open, onClose }: { subject: SubjectResources | null; open: boolean; onClose: () => void }) {
  if (!subject) return null
  const sections = sectionMeta.filter(s => getSectionItems(subject, s.key).length > 0)

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{subject.shortName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {sections.map(s => {
            const items = getSectionItems(subject, s.key)
            if (items.length === 0) return null
            return (
              <div key={s.key} className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  {s.icon}
                  <span>{s.label}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground/50">({items.length})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {s.key === 'textbook'
                    ? (items as Textbook[]).map((b, i) => <TextbookBlock key={i} book={b} />)
                    : (items as ResourceLink[]).map((l, i) => <LinkChip key={i} link={l} />)
                  }
                </div>
              </div>
            )
          })}

          {subject.additional && subject.additional.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Star className="size-3.5" />
                <span>Additional</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {subject.additional.map((l, i) => <LinkChip key={i} link={l} />)}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

const tabs = [
  { id: 'all', label: 'All Subjects' },
  { id: 'core', label: 'Core CS' },
  { id: 'math', label: 'Math & Aptitude' },
]

const coreSubjects = ['os', 'coa', 'cn', 'cd', 'toc', 'c', 'ds', 'algo', 'dl', 'dbms']
const mathSubjects = ['dm', 'la', 'prob', 'calc', 'aptitude']

export default function ResourcesPage() {
  const [query, setQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [selectedSubject, setSelectedSubject] = useState<SubjectResources | null>(null)

  const filtered = useMemo(() => {
    let list = subjectResources
    if (activeTab === 'core') list = list.filter(s => coreSubjects.includes(s.id))
    else if (activeTab === 'math') list = list.filter(s => mathSubjects.includes(s.id))
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(s => s.name.toLowerCase().includes(q))
    }
    return list
  }, [query, activeTab])

  const totalItems = useMemo(
    () => filtered.reduce((acc, s) => acc + sectionMeta.reduce((a, m) => a + getSectionItems(s, m.key).length, 0), 0),
    [filtered]
  )

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-4 md:p-6">
      <div className="space-y-3">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Resources</h1>
          <p className="text-xs text-muted-foreground">
            Curated by{' '}
            <a href={contributor.linkedin} target="_blank" rel="noopener noreferrer" className="font-medium text-foreground hover:underline">
              {contributor.name}
            </a>
            {' '}·{' '}
            <a href={contributor.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">LinkedIn</a>
            {' · '}
            <a href={contributor.youtube} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">YouTube</a>
          </p>
        </div>
        <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
          <p className="text-xs text-muted-foreground/70 leading-relaxed">
            Subject-wise YouTube playlists, NPTEL lectures, standard textbooks with relevant chapters, topicwise PYQs, and free mock tests curated from topper recommendations for GATE CSE preparation.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{filtered.length} subjects · {totalItems} resources</p>
        <div className="flex gap-1 rounded-lg border border-border bg-muted/30 p-0.5">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                activeTab === tab.id ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search subjects..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filtered.map(subject => {
          const count = sectionMeta.reduce((acc, s) => acc + getSectionItems(subject, s.key).length, 0)
          return (
            <button
              key={subject.id}
              onClick={() => setSelectedSubject(subject)}
              className="flex flex-col gap-1 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-muted/50"
            >
              <span className="text-sm font-medium text-foreground leading-tight">{subject.shortName}</span>
              <span className="text-[11px] text-muted-foreground">{count} item{count !== 1 ? 's' : ''}</span>
            </button>
          )
        })}
        {filtered.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-muted-foreground">No subjects match your search.</p>
        )}
      </div>

      <SubjectModal
        subject={selectedSubject}
        open={selectedSubject !== null}
        onClose={() => setSelectedSubject(null)}
      />

      <GeneralResourcesSection />
    </div>
  )
}

function GeneralResourcesSection() {
  const mocks = generalResources.fullLengthMocks
  const pyps = generalResources.previousYearPapers
  const notes = generalResources.notes

  const yearGroups = [
    { label: '2024', papers: pyps.filter(p => p.title.includes('2024')) },
    { label: '2023', papers: pyps.filter(p => p.title.includes('2023')) },
    { label: '2022', papers: pyps.filter(p => p.title.includes('2022')) },
    { label: '2021', papers: pyps.filter(p => p.title.includes('2021')) },
    { label: '2020', papers: pyps.filter(p => p.title.includes('2020')) },
    { label: '2019', papers: pyps.filter(p => p.title.includes('2019')) },
    { label: '2018', papers: pyps.filter(p => p.title.includes('2018')) },
    { label: '2017', papers: pyps.filter(p => p.title.includes('2017')) },
    { label: '2015-16', papers: pyps.filter(p => p.title.includes('2016') || p.title.includes('2015')) },
  ].filter(g => g.papers.length > 0)

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-foreground">General Resources</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Award className="size-3.5" />
            <span className="font-medium text-foreground">Mock Tests</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {mocks.map((l, i) => <LinkChip key={i} link={l} />)}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-3">
          <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="size-3.5" />
            <span className="font-medium text-foreground">Previous Year Papers</span>
          </div>
          <div className="space-y-1.5">
            {yearGroups.map(group => (
              <div key={group.label}>
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">{group.label}</span>
                <div className="mt-0.5 flex flex-wrap gap-1">
                  {group.papers.map((l, i) => <LinkChip key={i} link={l} />)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-3">
          <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Library className="size-3.5" />
            <span className="font-medium text-foreground">Notes</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {notes.map((l, i) => <LinkChip key={i} link={l} />)}
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground/50">
        All resources verified for GATE CSE 2027 preparation
      </p>
    </div>
  )
}
