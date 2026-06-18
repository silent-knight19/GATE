'use client'

const ZONES = [
  { max: 30, color: '#ef4444', label: 'Poor' },
  { max: 50, color: '#f97316', label: 'Below Average' },
  { max: 70, color: '#eab308', label: 'Average' },
  { max: 85, color: '#84cc16', label: 'Good' },
  { max: 100, color: '#22c55e', label: 'Excellent' },
]

export function MarksGauge({ marks, showLabel = true }: { marks: number; showLabel?: boolean }) {
  const pct = Math.min(100, Math.max(0, marks))
  const zone = ZONES.find(z => pct <= z.max) ?? ZONES[ZONES.length - 1]

  return (
    <div className="space-y-1.5">
      <div className="relative h-3 w-full rounded-full bg-muted overflow-hidden">
        {(() => {
          let prev = 0
          return ZONES.map((z, i) => {
            const w = ((z.max - prev) / 100) * 100
            const el = (
              <div
                key={i}
                className="absolute inset-y-0 transition-opacity duration-300 first:rounded-l-full last:rounded-r-full"
                style={{
                  left: `${prev}%`,
                  width: `${w}%`,
                  backgroundColor: z.color,
                  opacity: pct >= prev ? (pct >= z.max ? 0.8 : 0.4) : 0.12,
                }}
              />
            )
            prev = z.max
            return el
          })
        })()}
        <div
          className="absolute top-1/2 -translate-y-1/2 size-3.5 rounded-full border-2 border-white bg-foreground shadow-md transition-all duration-300"
          style={{ left: `calc(${pct}% - 7px)` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0</span>
          <span className="font-medium text-foreground">{zone.label}</span>
          <span>100</span>
        </div>
      )}
    </div>
  )
}
