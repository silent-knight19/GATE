"use client"

import { useState } from "react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { useAppStore } from "@/lib/store"
import { syllabus } from "@/lib/data/syllabus"
import { Plus, X } from "lucide-react"

interface SubjectEntry {
  subject: string
  marks: number
}

interface ErrorEntry {
  subject: string
  topic: string
  errorType: string
  count: number
}

const ERROR_TYPES = [
  { value: "conceptual", label: "Conceptual" },
  { value: "calculation", label: "Calculation" },
  { value: "time_management", label: "Time Management" },
  { value: "silly", label: "Silly" },
  { value: "guessed", label: "Guessed" },
]

let idCounter = 0
function genId() {
  idCounter++
  return `mt_${Date.now()}_${idCounter}`
}

export function MockTestLogger() {
  const addMockTest = useAppStore((s) => s.addMockTest)

  const [open, setOpen] = useState(false)
  const [source, setSource] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [totalMarks, setTotalMarks] = useState(100)
  const [marksObtained, setMarksObtained] = useState(0)
  const [subjectBreakdown, setSubjectBreakdown] = useState<SubjectEntry[]>([])
  const [errors, setErrors] = useState<ErrorEntry[]>([])

  const subjectNames = syllabus.map((s) => s.shortName)

  function addSubjectEntry() {
    setSubjectBreakdown((prev) => [...prev, { subject: "", marks: 0 }])
  }

  function updateSubjectEntry(index: number, field: keyof SubjectEntry, value: string | number) {
    setSubjectBreakdown((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value as never }
      return next
    })
  }

  function removeSubjectEntry(index: number) {
    setSubjectBreakdown((prev) => prev.filter((_, i) => i !== index))
  }

  function addErrorEntry() {
    setErrors((prev) => [
      ...prev,
      { subject: "", topic: "", errorType: "conceptual", count: 1 },
    ])
  }

  function updateErrorEntry(index: number, field: keyof ErrorEntry, value: string | number) {
    setErrors((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value as never }
      return next
    })
  }

  function removeErrorEntry(index: number) {
    setErrors((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit() {
    if (!source || !date) return
    if (totalMarks <= 0) return
    if (marksObtained < 0 || marksObtained > totalMarks) return
    if (source.trim().length > 500) return

    const breakdown: Record<string, number> = {}
    for (const entry of subjectBreakdown) {
      if (entry.subject && entry.marks >= 0) {
        breakdown[entry.subject] = (breakdown[entry.subject] || 0) + entry.marks
      }
    }

    addMockTest({
      id: genId(),
      source: source.trim(),
      date,
      totalMarks,
      marksObtained,
      subjectBreakdown: breakdown,
      errorAnalysis: errors
        .filter((e) => e.subject)
        .map((e) => ({
          subject: e.subject,
          topic: e.topic,
          errorType: e.errorType,
          count: Math.max(0, e.count),
        })),
    })

    setSource("")
    setDate(new Date().toISOString().split("T")[0])
    setMarksObtained(0)
    setSubjectBreakdown([])
    setErrors([])
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="default" />}>
        <Plus className="size-4" />
        Log New Mock Test
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Log Mock Test</DialogTitle>
          <DialogDescription>
            Record your mock test results for analysis.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Source</label>
              <Input
                placeholder="e.g. Made Easy Test Series"
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Total Marks</label>
              <Input
                type="number"
                value={totalMarks}
                onChange={(e) => setTotalMarks(Number(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Marks Obtained</label>
              <Input
                type="number"
                value={marksObtained}
                onChange={(e) => setMarksObtained(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">
                Subject Breakdown
              </label>
              <Button variant="ghost" size="xs" onClick={addSubjectEntry}>
                <Plus className="size-3" />
                Add
              </Button>
            </div>
            {subjectBreakdown.map((entry, i) => (
              <div key={i} className="flex items-center gap-2">
                <Select
                  value={entry.subject}
                  onValueChange={(v) => updateSubjectEntry(i, "subject", v ?? "")}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjectNames.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Marks"
                  className="w-20"
                  value={entry.marks || ""}
                  onChange={(e) =>
                    updateSubjectEntry(i, "marks", Number(e.target.value))
                  }
                />
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => removeSubjectEntry(i)}
                >
                  <X className="size-3" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-muted-foreground">
                Error Analysis
              </label>
              <Button variant="ghost" size="xs" onClick={addErrorEntry}>
                <Plus className="size-3" />
                Add
              </Button>
            </div>
            {errors.map((entry, i) => (
              <div key={i} className="flex items-center gap-2">
                <Select
                  value={entry.subject}
                  onValueChange={(v) => updateErrorEntry(i, "subject", v ?? "")}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjectNames.map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Topic"
                  className="flex-1"
                  value={entry.topic}
                  onChange={(e) => updateErrorEntry(i, "topic", e.target.value)}
                />
                <Select
                  value={entry.errorType}
                  onValueChange={(v) =>
                    updateErrorEntry(i, "errorType", v ?? "conceptual")
                  }
                >
                  <SelectTrigger className="w-28">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ERROR_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  className="w-14"
                  value={entry.count}
                  onChange={(e) =>
                    updateErrorEntry(i, "count", Number(e.target.value))
                  }
                />
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => removeErrorEntry(i)}
                >
                  <X className="size-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button onClick={handleSubmit}>Save Test</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
