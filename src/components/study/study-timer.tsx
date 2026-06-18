"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { useAppStore } from "@/lib/store"
import { syllabus } from "@/lib/data/syllabus"
import { Play, Pause, Square } from "lucide-react"

export function StudyTimer() {
  const addLogEntry = useAppStore((s) => s.addLogEntry)

  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [selectedSubjectId, setSelectedSubjectId] = useState("")
  const [selectedTopicId, setSelectedTopicId] = useState("")

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const selectedSubject = syllabus.find((s) => s.id === selectedSubjectId)
  const topics = selectedSubject?.topics || []

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => s + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning])

  const handleStart = useCallback(() => {
    if (!selectedTopicId) return
    setIsRunning(true)
  }, [selectedTopicId])

  const handlePause = useCallback(() => {
    setIsRunning(false)
  }, [])

  const handleStop = useCallback(() => {
    setIsRunning(false)
    const hours = Math.round((seconds / 60) * 10) / 10 / 60
    if (selectedTopicId && selectedSubjectId && hours > 0) {
      addLogEntry({
        subjectId: selectedSubjectId,
        topicId: selectedTopicId,
        hours,
        activityType: "study",
      })
    }
    setSeconds(0)
  }, [selectedTopicId, selectedSubjectId, seconds, addLogEntry])

  const displayHours = Math.floor(seconds / 3600)
  const displayMinutes = Math.floor((seconds % 3600) / 60)
  const displaySecs = seconds % 60

  const loggingHours =
    seconds > 0
      ? Math.round((seconds / 60) * 10) / 10 / 60
      : 0

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-6">
      <div className="font-mono text-4xl font-bold tabular-nums tracking-wider text-foreground">
        {String(displayHours).padStart(2, "0")}:
        {String(displayMinutes).padStart(2, "0")}:
        {String(displaySecs).padStart(2, "0")}
      </div>

      <div className="flex w-full gap-2">
        <Select
          value={selectedSubjectId}
          onValueChange={(v) => {
            setSelectedSubjectId(v ?? "")
            setSelectedTopicId("")
          }}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            {syllabus.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={selectedTopicId}
          onValueChange={(v) => setSelectedTopicId(v ?? "")}
          disabled={!selectedSubjectId}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={selectedSubjectId ? "Topic" : "Select subject first"} />
          </SelectTrigger>
          <SelectContent>
            {topics.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        {!isRunning ? (
          <Button
            variant="default"
            onClick={handleStart}
            disabled={!selectedTopicId}
          >
            <Play className="size-4" />
            Start
          </Button>
        ) : (
          <Button variant="outline" onClick={handlePause}>
            <Pause className="size-4" />
            Pause
          </Button>
        )}
        <Button
          variant="secondary"
          onClick={handleStop}
          disabled={seconds === 0}
        >
          <Square className="size-4" />
          Stop & Log
        </Button>
      </div>

      {seconds > 0 && (
        <p className="text-xs text-muted-foreground">
          Logging: {loggingHours >= 1 ? loggingHours.toFixed(1) : `${Math.round(seconds / 60)} min`}
        </p>
      )}
    </div>
  )
}
