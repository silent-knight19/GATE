"use client"

import type { DailyTaskGroup, Task } from "@/lib/store"
import { format, startOfWeek, addDays, isSameDay, addWeeks, subWeeks, isSameWeek } from "date-fns"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface WeekCalendarProps {
  groups: DailyTaskGroup[]
  onToggleTask: (date: string, taskId: string) => void
  onSelectDay: (date: string) => void
  onAddTask: (date: string) => void
  onEditTask: (date: string, task: Task) => void
  onDeleteTask: (date: string, taskId: string) => void
}

const HOUR_HEIGHT = 38; // Pixels per hour
const START_HOUR = 7; // Calendar starts at 7 AM

function getMinutes(timeStr?: string): number | null {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

function calculatePosition(task: Task) {
  let startMins = getMinutes(task.startTime);
  let endMins = getMinutes(task.endTime);

  if (startMins === null) {
    if (task.timeSlot === 'morning') { startMins = 9 * 60; endMins = 11 * 60; }
    else if (task.timeSlot === 'afternoon') { startMins = 14 * 60; endMins = 16 * 60; }
    else if (task.timeSlot === 'evening') { startMins = 19 * 60; endMins = 21 * 60; }
    else { startMins = 10 * 60; endMins = 11 * 60; }
  }
  
  if (endMins === null || endMins <= startMins) {
    endMins = startMins + Math.max(60, (task.estimatedHours || 1) * 60);
  }
  
  // Calculate relative minutes based on START_HOUR
  let relStart = startMins - START_HOUR * 60;
  if (relStart < 0) relStart += 24 * 60;

  let relEnd = endMins - START_HOUR * 60;
  if (relEnd < 0) relEnd += 24 * 60;

  // If task spans past relative midnight
  if (relEnd <= relStart && endMins !== startMins) {
    relEnd += 24 * 60;
  }
  
  const top = (relStart / 60) * HOUR_HEIGHT;
  const height = ((relEnd - relStart) / 60) * HOUR_HEIGHT;
  return { top, height, startStr: formatMins(startMins), endStr: formatMins(endMins) };
}

function formatMins(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function formatHourAMPM(hour: number) {
  if (hour === 0) return "12:00 AM";
  if (hour === 12) return "12:00 PM";
  return hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`;
}

function getTaskColorClass(type: Task['type'], priority: Task['priority']) {
  if (priority === 'high') return 'bg-[#c6443e] text-white hover:bg-[#c6443e]/90' // Red
  if (type === 'study') return 'bg-[#3b7ede] text-white hover:bg-[#3b7ede]/90' // Blue
  if (type === 'revision') return 'bg-[#4b3c99] text-white hover:bg-[#4b3c99]/90' // Purple
  if (type === 'practice') return 'bg-[#d88734] text-white hover:bg-[#d88734]/90' // Orange
  return 'bg-[#44b568] text-white hover:bg-[#44b568]/90' // Green
}

export function WeekCalendar({ groups, onToggleTask, onSelectDay, onAddTask, onEditTask, onDeleteTask }: WeekCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const scrollRef = useRef<HTMLDivElement>(null)

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const hours = Array.from({ length: 24 }, (_, i) => (i + START_HOUR) % 24)

  // Auto-scroll to top on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [])

  return (
    <div className="flex flex-col h-[640px] bg-black rounded-[24px] border border-white/[0.05] overflow-hidden relative">
      {/* Header Panel */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.04] bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setCurrentDate((d) => subWeeks(d, 1))}
            className="bg-transparent border-white/10 text-gray-300 hover:bg-white/5"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm font-medium text-white min-w-[140px] text-center">
            {format(weekStart, "MMM d")} – {format(addDays(weekStart, 6), "MMM d, yyyy")}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setCurrentDate((d) => addWeeks(d, 1))}
            className="bg-transparent border-white/10 text-gray-300 hover:bg-white/5"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentDate(new Date())}
          className="text-xs text-gray-400 hover:text-white hover:bg-white/5"
        >
          Today
        </Button>
      </div>

      {/* Days Header Row */}
      <div className="grid grid-cols-[72px_1fr] border-b border-white/[0.04] bg-black/80 backdrop-blur-md z-20">
        <div className="flex items-center justify-center">
          <span className="text-xs font-medium text-gray-400">GMT+4</span>
        </div>
        <div className="flex-1 grid grid-cols-7 gap-3 py-4 pr-4">
          {days.map((day) => {
            const isToday = isSameDay(day, new Date())
            return (
              <div key={day.toISOString()} className="flex justify-center">
                <button
                  onClick={() => onSelectDay(format(day, "yyyy-MM-dd"))}
                  className={cn(
                    "px-4 py-2.5 rounded-full text-sm font-medium transition-colors w-full max-w-[120px] whitespace-nowrap",
                    isToday
                      ? "bg-white text-black shadow-md"
                      : "bg-white/5 text-gray-300 hover:bg-white/10"
                  )}
                >
                  {format(day, "EEE d")}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Scrollable Time Grid */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto relative scroll-smooth">
        <div className="flex relative min-w-[800px]" style={{ height: `${24 * HOUR_HEIGHT}px` }}>
          
          {/* Time Labels (Y-axis) */}
          <div className="w-[72px] shrink-0 relative z-10 bg-black/40 backdrop-blur-sm">
            {hours.map((hour, idx) => (
              <div 
                key={hour} 
                className="absolute w-full flex justify-center text-[11px] font-medium text-gray-400 -translate-y-1/2" 
                style={{ top: idx * HOUR_HEIGHT }}
              >
                {formatHourAMPM(hour)}
              </div>
            ))}
          </div>

          {/* Grid Area */}
          <div className="flex-1 grid grid-cols-7 gap-3 relative pr-4">
            
            {/* Horizontal Grid Lines */}
            {hours.map((hour, idx) => (
              <div 
                key={hour}
                className="absolute w-full border-t border-white/[0.04] pointer-events-none"
                style={{ top: idx * HOUR_HEIGHT }}
              />
            ))}

            {/* Event Columns */}
            {days.map((day) => {
              const dayStr = format(day, "yyyy-MM-dd")
              const group = groups.find((g) => g.date === dayStr)
              const tasks = group?.tasks || []

              return (
                <div 
                  key={dayStr} 
                  className="relative h-full border-l border-white/[0.02] first:border-l-0"
                  onClick={() => onAddTask(dayStr)}
                >
                  {/* Clickable background column */}
                  <div className="absolute inset-0 hover:bg-white/[0.02] cursor-pointer transition-colors" />

                  {/* Tasks */}
                  {tasks.map((task) => {
                    const { top, height, startStr, endStr } = calculatePosition(task)
                    const colorClass = getTaskColorClass(task.type, task.priority)

                    return (
                      <div
                        key={task.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          onEditTask(dayStr, task)
                        }}
                        className={cn(
                          "absolute w-full rounded-[14px] p-2.5 shadow-sm overflow-hidden cursor-pointer group/task transition-all border border-white/10 hover:shadow-lg hover:z-10",
                          colorClass,
                          task.completed && "opacity-50 border-dashed"
                        )}
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          // Small gap between adjacent blocks
                          marginTop: '1px',
                          height: `calc(${height}px - 2px)`
                        }}
                      >
                        <h4 className="font-semibold text-[13px] leading-tight mb-1">
                          {task.title}
                        </h4>
                        
                        {height > 40 && (
                          <div className="text-[11px] font-medium opacity-80 mb-2">
                            {startStr} – {endStr}
                          </div>
                        )}

                        {height > 70 && (
                          <p className="text-[10px] font-medium opacity-70 line-clamp-2">
                            {task.subjectId} • {task.topicId}
                          </p>
                        )}

                        {/* Hover Actions */}
                        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 transition-opacity group-hover/task:opacity-100">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeleteTask(dayStr, task.id)
                            }}
                            className="p-1.5 rounded-md bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-colors"
                            title="Delete task"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
