"use client"

import React from "react"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

interface ErrorPieChartProps {
  errors: Array<{ errorType: string; count: number }>
}

const COLORS: Record<string, string> = {
  conceptual: "#ef4444",
  calculation: "#f97316",
  time_management: "#eab308",
  silly: "#6366f1",
  guessed: "#22c55e",
}

const LABELS: Record<string, string> = {
  conceptual: "Conceptual",
  calculation: "Calculation",
  time_management: "Time Mgmt",
  silly: "Silly",
  guessed: "Guessed",
}

export const ErrorPieChart = React.memo(function ErrorPieChart({ errors }: ErrorPieChartProps) {
  if (errors.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No error data yet.
      </div>
    )
  }

  const total = errors.reduce((s, e) => s + e.count, 0)

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={errors}
            dataKey="count"
            nameKey="errorType"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            strokeWidth={0}
          >
            {errors.map((entry) => (
              <Cell
                key={entry.errorType}
                fill={COLORS[entry.errorType] || "#6b7280"}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "13px",
            }}
            formatter={(value) => {
              const v = Number(value)
              return [
                `${v} (${total > 0 ? Math.round((v / total) * 100) : 0}%)`,
                LABELS[errors.find((e) => e.count === v)?.errorType || ""] || "Error",
              ]
            }}
          />
          <Legend
            formatter={(value: string) => (
              <span className="text-xs text-muted-foreground">
                {LABELS[value] || value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
})
