"use client"

import type { DailyTaskGroup, Task } from "@/lib/store"
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths,
} from "date-fns"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, ChevronDown, Clock, CalendarDays, ExternalLink, Calendar as CalendarIcon, Trash2 } from "lucide-react"
import { useState } from "react"

interface MonthCalendarProps {
  groups: DailyTaskGroup[]
  onSelectDay: (date: string) => void
  onAddTask?: (date: string) => void
  onEditTask?: (date: string, task: Task) => void
  onDeleteTask?: (date: string, taskId: string) => void
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export function MonthCalendar({ groups, onSelectDay, onAddTask, onEditTask, onDeleteTask }: MonthCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const todayStr = format(new Date(), "yyyy-MM-dd")
  const [localSelectedDay, setLocalSelectedDay] = useState(todayStr)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 }) // Sunday start
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const isCurrentMonth = isSameMonth(new Date(), currentDate)

  const getTaskColor = (type: Task['type'], priority: Task['priority']) => {
    if (priority === 'high') return 'bg-destructive text-destructive-foreground border-destructive/30'
    if (type === 'study') return 'bg-orange-500 text-orange-950 border-orange-500/30'
    if (type === 'revision') return 'bg-primary text-primary-foreground border-primary/30'
    if (type === 'practice') return 'bg-purple-500 text-purple-950 border-purple-500/30'
    return 'bg-lime-500 text-lime-950 border-lime-500/30' 
  }

  const selectedGroup = groups.find((g) => g.date === localSelectedDay)
  const sortedTasks = [...(selectedGroup?.tasks || [])].sort((a, b) => {
    if (!a.startTime) return 1
    if (!b.startTime) return -1
    return a.startTime.localeCompare(b.startTime)
  })

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full w-full">
      {/* LEFT: Calendar Grid */}
      <div className="flex flex-col flex-1 space-y-4">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3 text-lg font-medium text-foreground">
            <div className="flex items-center gap-1 cursor-pointer hover:text-foreground/80 transition-colors">
              {format(currentDate, "MMMM")} <ChevronDown className="size-4 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-1 cursor-pointer hover:text-foreground/80 transition-colors">
              {format(currentDate, "yyyy")} <ChevronDown className="size-4 text-muted-foreground" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentDate((d) => subMonths(d, 1))}
              className="flex size-7 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => setCurrentDate((d) => addMonths(d, 1))}
              className="flex size-7 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="space-y-3">
          {/* Weekdays */}
          <div className="grid grid-cols-7 gap-1 md:gap-3">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-[10px] md:text-[11px] font-medium text-muted-foreground text-center md:text-left md:pl-3">
                <span className="hidden md:inline">{d}</span>
                <span className="md:hidden">{d.slice(0, 3)}</span>
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 md:gap-3">
            {days.map((day) => {
              const dayStr = format(day, "yyyy-MM-dd")
              const group = groups.find((g) => g.date === dayStr)
              const inMonth = isSameMonth(day, currentDate)
              const isTodayDay = isToday(day)
              const isSelected = localSelectedDay === dayStr
              
              return (
                <button
                  key={dayStr}
                  onClick={() => setLocalSelectedDay(dayStr)}
                  disabled={!inMonth}
                  className={cn(
                    "relative flex flex-col rounded-xl md:rounded-2xl p-1.5 md:p-3 min-h-[70px] md:min-h-[110px] transition-all text-left overflow-hidden border",
                    inMonth ? "opacity-100" : "opacity-30",
                    isSelected 
                      ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.2)] border-primary" 
                      : isTodayDay
                        ? "bg-muted/50 border-primary/50 border-dashed hover:bg-muted"
                        : "bg-muted/30 border-transparent hover:bg-muted/60 hover:border-border/50"
                  )}
                >
                  <span className={cn(
                    "text-xs md:text-[15px] font-medium mb-1 md:mb-2 ml-1",
                    isSelected ? "text-primary-foreground" : isTodayDay ? "text-primary" : "text-foreground"
                  )}>
                    {format(day, "d")}
                  </span>

                  {/* Task indicators */}
                  <div className="mt-auto space-y-1 overflow-hidden w-full hidden md:block">
                    {group?.tasks.slice(0, 3).map((t, i) => (
                      <div key={t.id || i} className="flex items-center gap-1.5 text-[9px] w-full">
                        <div className={cn("w-1 h-2.5 rounded-full shrink-0 opacity-90", getTaskColor(t.type, t.priority).split(' ')[0])} />
                        <span className={cn(
                          "truncate flex-1 font-medium",
                          isSelected ? "text-primary-foreground/90" : "text-muted-foreground"
                        )}>{t.title}</span>
                      </div>
                    ))}
                    {(group?.tasks.length || 0) > 3 && (
                      <div className={cn(
                        "text-[9px] pl-2.5 font-medium",
                        isSelected ? "text-primary-foreground/70" : "text-muted-foreground/60"
                      )}>
                        +{group!.tasks.length - 3} more
                      </div>
                    )}
                  </div>

                  {/* Mobile Task indicators (dots only) */}
                  <div className="mt-auto flex flex-wrap gap-1 md:hidden">
                    {group?.tasks.slice(0, 3).map((t, i) => (
                      <div key={t.id || i} className={cn("size-1.5 rounded-full", getTaskColor(t.type, t.priority).split(' ')[0])} />
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* RIGHT: Scheduled Timeline Panel */}
      <div className="w-full xl:w-[280px] flex flex-col space-y-4 border-t xl:border-t-0 xl:border-l border-border/50 pt-6 xl:pt-0 xl:pl-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-foreground">Scheduled</h3>
            <p className="text-sm text-muted-foreground font-medium">
              {format(new Date(localSelectedDay + "T00:00:00"), "d MMMM, yyyy")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex size-7 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
              <CalendarIcon className="size-3.5" />
            </button>
            <div className="flex items-center">
              <button 
                onClick={() => {
                  const d = new Date(localSelectedDay + "T00:00:00")
                  d.setDate(d.getDate() - 1)
                  setLocalSelectedDay(format(d, "yyyy-MM-dd"))
                }}
                className="flex size-7 items-center justify-center rounded-l-full border border-border border-r-0 bg-card text-muted-foreground hover:bg-muted transition-colors"
              >
                <ChevronLeft className="size-3.5" />
              </button>
              <button 
                onClick={() => {
                  const d = new Date(localSelectedDay + "T00:00:00")
                  d.setDate(d.getDate() + 1)
                  setLocalSelectedDay(format(d, "yyyy-MM-dd"))
                }}
                className="flex size-7 items-center justify-center rounded-r-full border border-border bg-card text-muted-foreground hover:bg-muted transition-colors"
              >
                <ChevronRight className="size-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-5">
          {sortedTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm">
              <p>No tasks scheduled.</p>
            </div>
          ) : (
            sortedTasks.map((task) => {
              const bgClass = getTaskColor(task.type, task.priority).split(' ')[0]
              
              return (
                <div key={task.id} className="relative group">
                  {/* Time marker */}
                  {task.startTime && (
                    <div className="text-[11px] font-semibold text-muted-foreground mb-2 flex items-center gap-3">
                      <span>{task.startTime}</span>
                      <div className="flex-1 h-px bg-border/40" />
                    </div>
                  )}
                  
                  {/* Event Card */}
                  <div 
                    onClick={() => onEditTask?.(localSelectedDay, task)}
                    className="relative flex flex-col rounded-xl bg-muted/40 border border-border/50 overflow-hidden cursor-pointer hover:bg-muted transition-colors"
                  >
                    {/* Top Colored Border */}
                    <div className={cn("h-1.5 w-[90%] mx-auto rounded-b-md opacity-90", bgClass)} />
                    
                    <div className="p-3 pt-2">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-foreground text-sm">{task.title}</h4>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            onDeleteTask?.(localSelectedDay, task.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-all rounded-md hover:bg-destructive/10"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                      
                      <p className="text-[11px] text-muted-foreground mb-4 font-medium line-clamp-1">
                        {task.subjectId} • {task.topicId}
                      </p>
                      
                      <div className="flex items-center justify-between border-t border-border/50 pt-2.5">
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                          <Clock className="size-3" />
                          <span>
                            {task.startTime || '??:??'} - {task.endTime || '??:??'}
                          </span>
                        </div>
                        <div className="text-[10px] text-muted-foreground font-medium bg-background px-1.5 py-0.5 rounded shadow-sm border border-border/30">
                          {task.estimatedHours} {task.estimatedHours === 1 ? 'hr' : 'hrs'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
