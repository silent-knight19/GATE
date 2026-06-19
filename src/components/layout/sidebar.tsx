"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  BookOpen,
  Target,
  Calendar,
  ClipboardList,
  Calculator,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  ScrollText,
  BarChart3,
  Sun,
  Moon,
  TrendingUp,
  Library,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useTheme } from "@/components/theme-provider"

interface NavItem {
  label: string
  icon: React.ElementType
  href: string
  children?: { label: string; href: string }[]
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Analytics", icon: BarChart3, href: "/analytics" },
  { label: "Progress Hub", icon: TrendingUp, href: "/progress" },
  { label: "Syllabus", icon: BookOpen, href: "/syllabus" },
  { label: "Mock Tests", icon: Target, href: "/mocks" },
  { label: "Study Planner", icon: Calendar, href: "/planner" },
  { label: "Study Logger", icon: ClipboardList, href: "/study" },
  {
    label: "Predictors",
    icon: Calculator,
    href: "/predictor",
    children: [
      { label: "Marks Converter", href: "/predictor#converter" },
      { label: "Rank Predictor", href: "/predictor#target" },
      { label: "College Predictor", href: "/predictor#college" },
    ],
  },
  { label: "PSU Tracker", icon: GraduationCap, href: "/psu" },
  { label: "Resources", icon: Library, href: "/resources" },
  { label: "Counselling", icon: ScrollText, href: "/counselling" },
]

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const [expanded, setExpanded] = useState<string | null>(() => {
    for (const item of navItems) {
      if (item.children && item.children.some(c => pathname === c.href.split('#')[0] || (c.href !== "/" && pathname.startsWith(c.href.split('#')[0])))) {
        return item.label
      }
    }
    return null
  })

  const isActive = (href: string) => {
    const base = href.split('#')[0]
    if (pathname === base) return true
    if (base !== "/" && pathname.startsWith(base)) return true
    return false
  }

  const toggleExpand = (label: string) => {
    setExpanded(prev => prev === label ? null : label)
  }

  return (
    <div className="flex h-full flex-col border-r border-border bg-background">
      <div className="flex h-14 shrink-0 items-center border-b border-border px-4">
        <span className="font-mono text-[14.4px] font-bold tracking-tight text-foreground/60">
          GATE CSE 2027
        </span>
      </div>

      <nav className="flex flex-col gap-1 overflow-y-auto p-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          const hasChildren = item.children && item.children.length > 0
          const isExpanded = expanded === item.label

          return (
            <div key={item.label}>
              {hasChildren ? (
                <button
                  onClick={() => toggleExpand(item.label)}
                  className={cn(
                    "flex h-10 w-full items-center gap-3 rounded-md px-3 text-[16.8px] font-bold transition-colors",
                    active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  <Icon className="size-[17px] shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isExpanded ? (
                    <ChevronDown className="size-[14.4px] shrink-0" />
                  ) : (
                    <ChevronRight className="size-[14.4px] shrink-0" />
                  )}
                </button>
              ) : (
                <Link
                  href={item.href}
                  onClick={onNavClick}
                  className={cn(
                    "flex h-10 items-center gap-3 rounded-md px-3 text-[16.8px] font-bold transition-colors",
                    active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  <Icon className="size-[17px] shrink-0" />
                  <span>{item.label}</span>
                </Link>
              )}

              {hasChildren && isExpanded && (
                <div className="ml-[18px] mt-1 flex flex-col gap-1 border-l border-border pl-2.5">
                  {item.children!.map((child) => {
                    const childActive = pathname === child.href || pathname.startsWith(child.href + "/")
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={onNavClick}
                        className={cn(
                          "flex h-[34px] items-center gap-2.5 rounded-md px-3 text-[14.4px] font-bold transition-colors",
                          childActive
                            ? "bg-secondary text-foreground"
                            : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                        )}
                      >
                        {child.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

    </div>
  )
}

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      <aside className="hidden md:flex md:w-[270px] md:flex-col md:fixed md:inset-y-0 md:z-30">
        <SidebarContent />
      </aside>

      <Sheet open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose() }}>
        <SheetContent side="left" className="w-[270px] p-0" showCloseButton={false}>
          <SidebarContent onNavClick={onClose} />
        </SheetContent>
      </Sheet>
    </>
  )
}
