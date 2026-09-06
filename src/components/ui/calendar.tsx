import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface CalendarProps {
  selected?: Date | null
  onSelect?: (date: Date) => void
  className?: string
  minDate?: Date
}

export const Calendar: React.FC<CalendarProps> = ({
  selected,
  onSelect,
  className,
  minDate = new Date(),
}) => {
  const effectiveMinDate = React.useMemo(() => {
    if (!minDate) return null
    const d = new Date(minDate)
    d.setHours(0, 0, 0, 0)
    return d
  }, [minDate])

  const [currentMonth, setCurrentMonth] = React.useState(() => {
    if (selected) {
      return new Date(selected.getFullYear(), selected.getMonth(), 1)
    }
    if (effectiveMinDate) {
      return new Date(effectiveMinDate.getFullYear(), effectiveMinDate.getMonth(), 1)
    }
    return new Date()
  })

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  const firstDayIndex = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const canGoPrev = React.useMemo(() => {
    if (!effectiveMinDate) return true
    const currentMonthStart = new Date(year, month, 1, 0, 0, 0, 0)
    const minMonthStart = new Date(
      effectiveMinDate.getFullYear(),
      effectiveMinDate.getMonth(),
      1,
      0,
      0,
      0,
      0
    )
    return currentMonthStart > minMonthStart
  }, [year, month, effectiveMinDate])

  const prevMonth = () => {
    if (!canGoPrev) return
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  const isToday = (day: number) => {
    const today = new Date()
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    )
  }

  const isSelected = (day: number) => {
    if (!selected) return false
    return (
      selected.getDate() === day &&
      selected.getMonth() === month &&
      selected.getFullYear() === year
    )
  }

  const isPast = (day: number) => {
    if (!effectiveMinDate) return false
    const date = new Date(year, month, day, 0, 0, 0, 0)
    return date < effectiveMinDate
  }

  const handleSelectDay = (day: number) => {
    if (isPast(day)) return
    const newDate = new Date(year, month, day)
    if (onSelect) {
      onSelect(newDate)
    }
  }

  return (
    <div className={cn("p-3 w-72 bg-card rounded-xl border border-border select-none", className)}>
      {/* Month & Year Navigation */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-sm font-bold text-foreground">
          {monthNames[month]} {year}
        </span>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 disabled:opacity-20 disabled:cursor-not-allowed"
            onClick={prevMonth}
            disabled={!canGoPrev}
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={nextMonth}
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((wd) => (
          <span key={wd} className="text-[11px] font-semibold text-muted-foreground py-1">
            {wd}
          </span>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="h-8 w-8" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const selectedDay = isSelected(day)
          const past = isPast(day)
          const today = isToday(day)

          return (
            <button
              key={`day-${day}`}
              type="button"
              disabled={past}
              onClick={() => handleSelectDay(day)}
              className={cn(
                "h-8 w-8 mx-auto rounded-lg text-xs font-medium transition-all flex items-center justify-center",
                past && "text-muted-foreground/30 line-through cursor-not-allowed pointer-events-none opacity-40 select-none",
                !past && !selectedDay && "hover:bg-accent text-foreground hover:text-accent-foreground cursor-pointer",
                today && !selectedDay && "border border-primary/40 font-bold text-primary",
                selectedDay && "bg-primary text-primary-foreground font-bold shadow-xs scale-105"
              )}
              aria-disabled={past}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
