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
  const completeTaskOnTimer = useAppStore((s) => s.completeTaskOnTimer)
  const timerState = useAppStore((s) => s.timerState)
  const setTimerState = useAppStore((s) => s.setTimerState)
  const resetTimer = useAppStore((s) => s.resetTimer)

  const [elapsedMs, setElapsedMs] = useState(0)
  const [localSubjectId, setLocalSubjectId] = useState(timerState.selectedSubjectId || "")
  const [localTopicId, setLocalTopicId] = useState(timerState.selectedTopicId || "")

  const frameRef = useRef<number | null>(null)
  const startTimeRef = useRef(timerState.startTime)
  const accumulatedRef = useRef(timerState.accumulated)

  useEffect(() => {
    startTimeRef.current = timerState.startTime
    accumulatedRef.current = timerState.accumulated
  }, [timerState.startTime, timerState.accumulated])

  const selectedSubject = syllabus.find((s) => s.id === localSubjectId)
  const topics = selectedSubject?.topics || []

  const tickRef = useRef<() => void>(undefined)

  const tick = useCallback(() => {
    if (startTimeRef.current === null) return
    const now = Date.now()
    setElapsedMs(accumulatedRef.current + (now - startTimeRef.current))
    frameRef.current = requestAnimationFrame(tickRef.current!)
  }, [])

  useEffect(() => {
    tickRef.current = tick
  }, [tick])

  const startFrame = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(tickRef.current!)
  }, [])

  const stopFrame = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
  }, [])

  useEffect(() => {
    if (timerState.isRunning && timerState.startTime !== null) {
      startFrame()
    } else {
      stopFrame()
    }
    return stopFrame
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerState.isRunning, timerState.startTime])

  useEffect(() => {
    function onVisibilityChange() {
      if (document.hidden) {
        stopFrame()
      } else if (timerState.isRunning && timerState.startTime !== null) {
        startFrame()
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerState.isRunning, timerState.startTime, startFrame, stopFrame])

  const handleStart = useCallback(() => {
    if (!localTopicId) return
    const now = Date.now()
    setTimerState({
      isRunning: true,
      startTime: now,
      accumulated: timerState.accumulated,
      selectedSubjectId: localSubjectId,
      selectedTopicId: localTopicId,
    })
    setElapsedMs(timerState.accumulated)
  }, [localTopicId, localSubjectId, setTimerState, timerState.accumulated])

  const handlePause = useCallback(() => {
    if (timerState.startTime === null) return
    const now = Date.now()
    const acc = timerState.accumulated + (now - timerState.startTime)
    setElapsedMs(acc)
    setTimerState({
      isRunning: false,
      startTime: null,
      accumulated: acc,
    })
  }, [timerState, setTimerState])

  const handleStop = useCallback(() => {
    const now = Date.now()
    const startTime = startTimeRef.current
    const accumulated = accumulatedRef.current
    const finalAccumulated = accumulated + (startTime !== null ? now - startTime : 0)
    const hours = Math.round((finalAccumulated / 3600000) * 100) / 100
    if (localTopicId && localSubjectId && finalAccumulated >= 60000) {
      addLogEntry({
        subjectId: localSubjectId,
        topicId: localTopicId,
        hours,
        activityType: "study",
      })
      completeTaskOnTimer(localTopicId)
    }
    setElapsedMs(0)
    resetTimer()
  }, [localTopicId, localSubjectId, addLogEntry, completeTaskOnTimer, resetTimer])

  const totalSeconds = Math.floor(elapsedMs / 1000)
  const displayHours = Math.floor(totalSeconds / 3600)
  const displayMinutes = Math.floor((totalSeconds % 3600) / 60)
  const displaySecs = totalSeconds % 60

  const loggingHours =
    elapsedMs > 0
      ? elapsedMs / 60000 / 60
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
          value={localSubjectId}
          onValueChange={(v) => {
            setLocalSubjectId(v ?? "")
            setLocalTopicId("")
          }}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            {syllabus.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.shortName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={localTopicId}
          onValueChange={(v) => setLocalTopicId(v ?? "")}
          disabled={!localSubjectId}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={localSubjectId ? "Topic" : "Select subject first"} />
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
        {!timerState.isRunning ? (
          <Button
            variant="default"
            onClick={handleStart}
            disabled={!localTopicId}
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
          Logging: {loggingHours >= 1 ? loggingHours.toFixed(2) : `${Math.round(elapsedMs / 60000)} min`}
        </p>
      )}
    </div>
  )
}
