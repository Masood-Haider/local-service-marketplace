import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Sun, Moon } from "lucide-react"

interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className, showLabel = true }) => {
  // Check localStorage or default to light mode
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem("theme")
    if (saved) return saved === "dark"
    return false // Default to light mode as requested
  })

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      root.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }, [isDark])

  const toggleTheme = () => {
    setIsDark((prev) => !prev)
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className={`h-8 px-2.5 gap-2 text-xs font-semibold rounded-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-xs ${className || ""}`}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle Light/Dark Theme"
    >
      {isDark ? (
        <>
          <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-in spin-in-180 duration-200" />
          {showLabel && <span className="hidden sm:inline">Light Mode</span>}
        </>
      ) : (
        <>
          <Moon className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300 shrink-0 animate-in spin-in-180 duration-200" />
          {showLabel && <span className="hidden sm:inline">Dark Mode</span>}
        </>
      )}
    </Button>
  )
}
