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

  const [elapsedMs, setElapsedMs] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [selectedSubjectId, setSelectedSubjectId] = useState("")
  const [selectedTopicId, setSelectedTopicId] = useState("")

  const startTimeRef = useRef<number | null>(null)
  const accumulatedRef = useRef(0)
  const frameRef = useRef<number | null>(null)

  const selectedSubject = syllabus.find((s) => s.id === selectedSubjectId)
  const topics = selectedSubject?.topics || []

  const tick = useCallback(() => {
    if (startTimeRef.current === null) return
    const now = Date.now()
    setElapsedMs(accumulatedRef.current + (now - startTimeRef.current))
    frameRef.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now()
      frameRef.current = requestAnimationFrame(tick)
    } else {
      if (startTimeRef.current !== null) {
        accumulatedRef.current += Date.now() - startTimeRef.current
        startTimeRef.current = null
      }
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
        frameRef.current = null
      }
    }
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    }
  }, [isRunning, tick])

  const handleStart = useCallback(() => {
    if (!selectedTopicId) return
    setIsRunning(true)
  }, [selectedTopicId])

  const handlePause = useCallback(() => {
    setIsRunning(false)
  }, [])

  const handleStop = useCallback(() => {
    setIsRunning(false)
    const hours = Math.round((elapsedMs / 60000) * 10) / 10 / 60
    if (selectedTopicId && selectedSubjectId && hours > 0) {
      addLogEntry({
        subjectId: selectedSubjectId,
        topicId: selectedTopicId,
        hours,
        activityType: "study",
      })
    }
    setElapsedMs(0)
    accumulatedRef.current = 0
    startTimeRef.current = null
  }, [selectedTopicId, selectedSubjectId, elapsedMs, addLogEntry])

  const totalSeconds = Math.floor(elapsedMs / 1000)
  const displayHours = Math.floor(totalSeconds / 3600)
  const displayMinutes = Math.floor((totalSeconds % 3600) / 60)
  const displaySecs = totalSeconds % 60

  const loggingHours =
    elapsedMs > 0
      ? Math.round((elapsedMs / 60000) * 10) / 10 / 60
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
          disabled={elapsedMs === 0}
        >
          <Square className="size-4" />
          Stop & Log
        </Button>
      </div>

      {elapsedMs > 0 && (
        <p className="text-xs text-muted-foreground">
          Logging: {loggingHours >= 1 ? loggingHours.toFixed(1) : `${Math.round(elapsedMs / 60000)} min`}
        </p>
      )}
    </div>
  )
}
