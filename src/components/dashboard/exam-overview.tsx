"use client"

import React, { useMemo, useState } from "react"
import { BookOpen, GraduationCap, Calendar, Clock, BarChart3, ExternalLink } from "lucide-react"
import { subjectStats, EXAM_INFO, getShortSubjectName } from "@/lib/data/subject-stats"
import Link from "next/link"

function ExamOverview() {
  const [sortBy, setSortBy] = useState<"weightage" | "hours">("weightage")

  const subjects = useMemo(() => {
    if (sortBy === "weightage") {
      return [...subjectStats].sort((a, b) => b.weightage - a.weightage)
    } else {
      return [...subjectStats].sort((a, b) => b.studyHours - a.studyHours)
    }
  }, [sortBy])

  const maxWeightage = useMemo(() => Math.max(...subjectStats.map((s) => s.weightage)), [])
  const maxHours = useMemo(() => Math.max(...subjectStats.map((s) => s.studyHours)), [])

  return (
    <div className="space-y-4">
      {/* Exam quick info */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">GATE CSE 2027 — Exam Overview</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Total Marks</p>
            <p className="text-lg font-bold tabular-nums">{EXAM_INFO.totalMarks}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Questions</p>
            <p className="text-lg font-bold tabular-nums">{EXAM_INFO.totalQuestions}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Duration</p>
            <p className="text-lg font-bold tabular-nums">{EXAM_INFO.durationMinutes} min</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Exam Date</p>
            <p className="text-lg font-bold tabular-nums">Feb 7, 2027</p>
          </div>
        </div>
      </div>


      {/* Subject weightage / time bars */}
      <div className="glass rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold animate-fade-in-up">
              {sortBy === "weightage" ? "Subject Weightage (5-Year Average 2022-2026)" : "Estimated Study Time Required"}
            </h2>
          </div>
          <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-0.5 border border-border/50 self-start sm:self-auto">
            <button
              onClick={() => setSortBy("weightage")}
              className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                sortBy === "weightage"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Weightage
            </button>
            <button
              onClick={() => setSortBy("hours")}
              className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                sortBy === "hours"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Time Required
            </button>
          </div>
        </div>

        <div className="space-y-2.5">
          {subjects.map((s) => (
            <div key={s.id} className="flex items-center gap-2">
              <Link href={`/subjects/${s.id}`} className="w-32 shrink-0 text-xs font-bold truncate hover:underline" style={{ color: s.color }}>
                {getShortSubjectName(s.name)}
              </Link>
              <div className="flex-1 h-4 overflow-hidden rounded-full bg-secondary relative">
                <div
                  className="h-full rounded-full transition-[width] duration-500 ease-out"
                  style={{
                    width: `${((sortBy === "weightage" ? s.weightage / maxWeightage : s.studyHours / maxHours)) * 100}%`,
                    backgroundColor: s.color
                  }}
                />
                {sortBy === "weightage" && (
                  <span className="absolute inset-0 flex items-center px-2 text-[9px] font-medium text-white/70">
                    {s.trend === "up" ? "↑" : s.trend === "down" ? "↓" : "→"}
                  </span>
                )}
              </div>
              {sortBy === "weightage" ? (
                <>
                  <span className="w-12 text-right text-xs font-mono font-bold tabular-nums text-muted-foreground">{s.weightage}%</span>
                  <span className="w-12 text-right text-xs font-mono font-bold tabular-nums text-muted-foreground">~{s.avgMarks}m</span>
                </>
              ) : (
                <span className="w-24 text-right text-xs font-mono font-bold tabular-nums text-muted-foreground">~{s.studyHours} hours</span>
              )}
            </div>
          ))}
        </div>

        <p className="mt-3 text-[10px] text-muted-foreground leading-normal">
          {sortBy === "weightage"
            ? "Bars show relative weightage. Trend arrows: ↑ increasing, ↓ decreasing, → stable over 5 years. Click subject name for detailed analysis."
            : "Bars show relative study/practice hours recommended for GATE mastery. Click subject name for detailed syllabus details."}
        </p>
      </div>
    </div>
  )
}

export default React.memo(ExamOverview)
