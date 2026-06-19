"use client"

import React, { useState, useEffect } from "react"
import { getDaysUntilExam } from "@/lib/calculators"
import { Card } from "@/components/ui/card"

const quotes = [
  "The only way to do great work is to love what you do.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "Don't watch the clock; do what it does. Keep going.",
  "Every expert was once a beginner.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "It always seems impossible until it's done.",
  "Discipline is the bridge between goals and accomplishment.",
  "Start where you are. Use what you have. Do what you can.",
  "Hard work beats talent when talent doesn't work hard.",
  "You don't have to be great to start, but you have to start to be great.",
]

function CountdownCard() {
  const [timeLeft, setTimeLeft] = useState(() =>
    getDaysUntilExam(new Date(2027, 1, 6))
  )
  const [elapsedPercent, setElapsedPercent] = useState(0)
  const [displayDays, setDisplayDays] = useState(0)

  const quote = quotes[new Date().getDate() % quotes.length]

  useEffect(() => {
    const start = new Date(2026, 0, 1).getTime()
    const exam = new Date(2027, 1, 6).getTime()
    const total = exam - start

    const tick = () => {
      const now = Date.now()
      setTimeLeft(getDaysUntilExam(new Date(2027, 1, 6)))
      setElapsedPercent(
        Math.min(100, Math.max(0, ((now - start) / total) * 100))
      )
    }

    tick()
    const interval = setInterval(tick, 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const target = timeLeft.days
    const duration = 1200
    const steps = 40
    const increment = target / steps
    let step = 0
    const timer = setInterval(() => {
      step++
      setDisplayDays(Math.min(Math.round(increment * step), target))
      if (step >= steps) clearInterval(timer)
    }, duration / steps)
    return () => clearInterval(timer)
  }, [timeLeft.days])

  const radius = 52
  const circumference = 2 * Math.PI * radius
  const elapsedOffset = circumference - (elapsedPercent / 100) * circumference

  return (
    <Card className="relative overflow-hidden p-8">
      <div className="flex items-center gap-8">
        <div className="relative shrink-0">
          <svg width="128" height="128" className="-rotate-90">
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
            />
            <circle
              cx="64"
              cy="64"
              r={radius}
              fill="none"
              stroke="url(#countdownGrad)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={elapsedOffset}
              style={{ transition: "stroke-dashoffset 1s ease" }}
            />
            <defs>
              <linearGradient
                id="countdownGrad"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--muted-foreground))" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black tabular-nums text-foreground">
              {displayDays}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              days
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight">GATE 2027</h2>
            <div className="mt-1 flex items-center gap-2">
              <div className="size-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-muted-foreground">
                Countdown active
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="rounded-lg bg-muted px-3 py-1.5">
              <span className="text-lg font-bold tabular-nums text-foreground">
                {timeLeft.hours}
              </span>
              <span className="ml-1 text-xs text-muted-foreground">hrs</span>
            </div>
            <div className="rounded-lg bg-muted px-3 py-1.5">
              <span className="text-lg font-bold tabular-nums text-foreground">
                {timeLeft.minutes}
              </span>
              <span className="ml-1 text-xs text-muted-foreground">min</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Time elapsed</span>
              <span className="font-medium text-foreground">
                {Math.round(elapsedPercent)}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground transition-all duration-1000"
                style={{
                  width: `${elapsedPercent}%`,
                  opacity: 0.7,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 border-t pt-4">
        <p className="text-xs italic text-muted-foreground leading-relaxed">
          &ldquo;{quote}&rdquo;
        </p>
      </div>
    </Card>
  )
}

export default React.memo(CountdownCard)
