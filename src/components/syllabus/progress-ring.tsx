"use client"

import { cn } from "@/lib/utils"

interface ProgressRingProps {
  percent: number
  size?: number
  strokeWidth?: number
  color?: string
  className?: string
}

export function ProgressRing({
  percent,
  size = 48,
  strokeWidth = 4,
  color = "#6366f1",
  className,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <svg
      width={size}
      height={size}
      className={cn("shrink-0 -rotate-90", className)}
      viewBox={`0 0 ${size} ${size}`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="hsl(var(--muted))"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-500"
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy="0.35em"
        className="fill-foreground text-[10px] font-semibold tabular-nums"
        transform={`rotate(90 ${size / 2} ${size / 2})`}
      >
        {Math.round(percent)}%
      </text>
    </svg>
  )
}
