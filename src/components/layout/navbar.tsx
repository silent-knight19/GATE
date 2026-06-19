"use client"

import { usePathname } from "next/navigation"
import { Menu, Sun, Moon, LogIn, LogOut, Cloud, CloudOff, Loader2, AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useTheme } from "@/components/theme-provider"
import { useAuth } from "@/lib/auth-context"
import { useAppStore } from "@/lib/store"

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
  "/resources": "Resources",
  "/counselling": "Counselling",
}

export function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const { user, error: authError, signInWithGoogle, signOut, clearError } = useAuth()
  const syncStatus = useAppStore((s) => s.syncStatus)

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
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-4 border-b border-border/40 bg-background/70 px-4 md:px-6 backdrop-blur-xl supports-backdrop-filter:bg-background/60 transition-colors duration-300">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden size-8 hover:bg-secondary"
          onClick={onMenuClick}
          aria-label="Open sidebar"
        >
          <Menu className="size-4" />
        </Button>

        <div className="flex flex-col">
          <h1 className="text-[15px] font-semibold tracking-tight text-foreground/90">
            {title}
          </h1>
          <span className="hidden md:inline-block text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">
            Gate CSE 2027 Tracker
          </span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        {user && (
          <div className="hidden sm:flex items-center justify-center rounded-full bg-secondary/50 p-1.5 backdrop-blur-sm mr-2 transition-all" title={
            syncStatus.state === 'saving' ? 'Saving...' :
            syncStatus.state === 'error' ? `Sync error: ${syncStatus.lastError || 'Unknown'}` :
            'All changes saved'
          }>
            {syncStatus.state === 'saving' ? (
              <Loader2 className="size-3.5 text-muted-foreground animate-spin" />
            ) : syncStatus.state === 'error' ? (
              <CloudOff className="size-3.5 text-destructive" />
            ) : (
              <Cloud className="size-3.5 text-emerald-500" />
            )}
          </div>
        )}

        {authError && (
          <div className="flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive ring-1 ring-inset ring-destructive/20">
            <AlertTriangle className="size-3" />
            <span className="max-w-[150px] truncate">{authError}</span>
            <button onClick={clearError} className="ml-1 hover:text-destructive/80 transition-colors">
              <X className="size-3" />
            </button>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-full hover:bg-secondary"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
        </Button>
        
        <div className="h-4 w-px bg-border/50 hidden sm:block mx-1" />

        {user ? (
          <div className="flex items-center gap-2 pl-1">
            <Avatar size="sm" className="hidden sm:flex ring-1 ring-border/50">
              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User profile"} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <Button 
              variant="ghost" 
              size="icon" 
              className="size-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" 
              onClick={signOut} 
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        ) : (
          <Button variant="default" size="sm" onClick={signInWithGoogle} className="gap-2 h-8 px-4 rounded-full text-xs font-medium shadow-sm transition-transform active:scale-95">
            <LogIn className="size-3.5" />
            <span className="hidden sm:inline">Sign in</span>
          </Button>
        )}
      </div>
    </header>
  )
}
