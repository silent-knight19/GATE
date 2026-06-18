"use client"

import { usePathname } from "next/navigation"
import { Menu, Sun, Moon, LogIn, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { useAuth } from "@/lib/auth-context"

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/syllabus": "Syllabus",
  "/mocks": "Mock Tests",
  "/planner": "Study Planner",
  "/study": "Study Logger",
  "/predictor": "Predictors",
  "/predictor/converter": "Marks Converter",
  "/predictor/rank": "Rank Predictor",
  "/predictor/college": "College Predictor",
  "/psu": "PSU Tracker",
  "/counselling": "Counselling",
}

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const { user, signInWithGoogle, signOut } = useAuth()

  let title = TITLES[pathname] || "GATE CSE 2027"

  if (!title) {
    for (const [prefix, name] of Object.entries(TITLES)) {
      if (pathname.startsWith(prefix) && prefix !== "/") {
        title = name
        break
      }
    }
  }

  return (
    <header className="sticky top-0 z-20 flex h-12 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
      <Button
        variant="ghost"
        size="icon-sm"
        className="md:hidden"
        onClick={onMenuClick}
        aria-label="Open sidebar"
      >
        <Menu className="size-4" />
      </Button>

      <h1 className="text-sm font-medium text-foreground">
        {title}
      </h1>

      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
        </Button>
        {user ? (
          <div className="flex items-center gap-1">
            <span className="hidden sm:inline text-xs text-muted-foreground max-w-[100px] truncate">
              {user.displayName || user.email}
            </span>
            <Button variant="ghost" size="icon-sm" onClick={signOut} aria-label="Sign out">
              <LogOut className="size-4" />
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={signInWithGoogle} className="gap-1.5">
            <LogIn className="size-3.5" />
            <span className="hidden sm:inline text-xs">Sign in</span>
          </Button>
        )}
      </div>
    </header>
  )
}
