"use client"

import { cn } from "@/lib/utils"

interface VelocityGaugeProps {
  currentVelocity: number
  requiredVelocity: number
  isOnTrack: boolean
}

export function VelocityGauge({
  currentVelocity,
  requiredVelocity,
  isOnTrack,
}: VelocityGaugeProps) {
  const maxVelocity = Math.max(currentVelocity, requiredVelocity, 1)
  const currentPercent = (currentVelocity / maxVelocity) * 100
  const requiredPercent = (requiredVelocity / maxVelocity) * 100

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Topics per week</span>
        <span className="font-mono font-medium tabular-nums text-foreground">
          {currentVelocity.toFixed(1)} / {requiredVelocity.toFixed(1)}
        </span>
      </div>

      <div className="relative h-6">
        <div className="absolute inset-0 rounded-full bg-muted" />
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
            isOnTrack ? "bg-green-500" : "bg-red-500"
          )}
          style={{ width: `${Math.min(currentPercent, 100)}%` }}
        />
        <div
          className="absolute inset-y-0 w-0.5 bg-foreground/60 transition-all"
          style={{ left: `${Math.min(requiredPercent, 100)}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-medium text-white mix-blend-difference">
            {isOnTrack ? "On Track" : "Behind"}
          </span>
        </div>
      </div>

      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>0</span>
        <span>Required: {requiredVelocity.toFixed(1)}</span>
        <span>{maxVelocity.toFixed(1)}</span>
      </div>
    </div>
  )
}
