"use client"

import * as React from "react"
import { format, addMonths, addYears, setMonth, setDate } from "date-fns"
import { Calendar as CalendarIcon, Gift, Sparkles, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePreset {
  id: string
  label: string
  sublabel?: string
  date: Date
  icon?: React.ReactNode
  featured?: boolean
}

interface DateSelectorV3Props {
  value?: Date
  onChange: (date: Date) => void
  userBirthday?: Date
  minDate?: Date
  disabled?: boolean
}

function calculateNextBirthday(birthday: Date): Date {
  const today = new Date()
  const currentYear = today.getFullYear()

  // Set birthday to this year
  let nextBirthday = new Date(currentYear, birthday.getMonth(), birthday.getDate())

  // If birthday has passed this year, use next year
  if (nextBirthday <= today) {
    nextBirthday = new Date(currentYear + 1, birthday.getMonth(), birthday.getDate())
  }

  return nextBirthday
}

function calculateNextNewYear(): Date {
  const today = new Date()
  return new Date(today.getFullYear() + 1, 0, 1) // January 1st of next year
}

export function DateSelectorV3({
  value,
  onChange,
  userBirthday,
  minDate,
  disabled = false,
}: DateSelectorV3Props) {
  const t = useTranslations("schedule.dateSelector")
  const [calendarOpen, setCalendarOpen] = React.useState(false)
  const today = new Date()

  // Generate preset dates
  const quickPresets: DatePreset[] = [
    {
      id: "6months",
      label: t("presets.6months"),
      sublabel: format(addMonths(today, 6), "MMM yyyy"),
      date: addMonths(today, 6),
    },
    {
      id: "1year",
      label: t("presets.1year"),
      sublabel: format(addYears(today, 1), "MMM yyyy"),
      date: addYears(today, 1),
      featured: true,
    },
    {
      id: "3years",
      label: t("presets.3years"),
      sublabel: format(addYears(today, 3), "MMM yyyy"),
      date: addYears(today, 3),
    },
    {
      id: "5years",
      label: t("presets.5years"),
      sublabel: format(addYears(today, 5), "MMM yyyy"),
      date: addYears(today, 5),
    },
  ]

  const meaningfulPresets: DatePreset[] = [
    ...(userBirthday
      ? [
          {
            id: "birthday",
            label: t("presets.nextBirthday"),
            sublabel: format(calculateNextBirthday(userBirthday), "MMM d, yyyy"),
            date: calculateNextBirthday(userBirthday),
            icon: <Gift className="h-4 w-4" strokeWidth={2} />,
          },
        ]
      : []),
    {
      id: "newyear",
      label: t("presets.newYear"),
      sublabel: format(calculateNextNewYear(), "MMM d, yyyy"),
      date: calculateNextNewYear(),
      icon: <Sparkles className="h-4 w-4" strokeWidth={2} />,
    },
    {
      id: "10years",
      label: t("presets.10years"),
      sublabel: format(addYears(today, 10), "MMM yyyy"),
      date: addYears(today, 10),
      icon: <Clock className="h-4 w-4" strokeWidth={2} />,
    },
  ]

  const handlePresetClick = (preset: DatePreset) => {
    if (disabled) return
    onChange(preset.date)
  }

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date && !disabled) {
      onChange(date)
      setCalendarOpen(false)
    }
  }

  const isSelected = (date: Date) => {
    if (!value) return false
    return (
      date.getFullYear() === value.getFullYear() &&
      date.getMonth() === value.getMonth() &&
      date.getDate() === value.getDate()
    )
  }

  return (
    <div className="space-y-6">
      {/* Section Title */}
      <div className="text-center">
        <h3 className="font-mono text-lg font-bold uppercase tracking-wider text-charcoal">
          {t("title")}
        </h3>
        <p className="mt-1 font-mono text-xs text-charcoal/60 uppercase tracking-wider">
          {t("subtitle")}
        </p>
      </div>

      {/* Quick Picks */}
      <div className="space-y-3">
        <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50">
          {t("quickPicks")}
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {quickPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handlePresetClick(preset)}
              disabled={disabled}
              className={cn(
                "relative flex flex-col items-center gap-1 border-2 border-charcoal p-3 font-mono transition-all duration-150",
                "hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
                isSelected(preset.date)
                  ? "bg-duck-blue text-charcoal shadow-[4px_4px_0_theme(colors.charcoal)] -translate-y-0.5"
                  : preset.featured
                    ? "bg-duck-yellow/20 shadow-[2px_2px_0_theme(colors.charcoal)] hover:bg-duck-blue/30"
                    : "bg-white shadow-[2px_2px_0_theme(colors.charcoal)] hover:bg-duck-blue/20",
                disabled && "opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-[2px_2px_0_theme(colors.charcoal)]"
              )}
              style={{ borderRadius: "2px" }}
            >
              {preset.featured && !isSelected(preset.date) && (
                <div
                  className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center border-2 border-charcoal bg-duck-yellow"
                  style={{ borderRadius: "2px" }}
                >
                  <Sparkles className="h-3 w-3 text-charcoal" strokeWidth={3} />
                </div>
              )}
              <span className="text-xs font-bold uppercase tracking-wider">
                {preset.label}
              </span>
              <span className="text-[10px] text-charcoal/60">
                {preset.sublabel}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Meaningful Dates */}
      <div className="space-y-3">
        <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50">
          {t("meaningfulDates")}
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {meaningfulPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handlePresetClick(preset)}
              disabled={disabled}
              className={cn(
                "relative flex items-center gap-3 border-2 border-charcoal p-3 font-mono transition-all duration-150",
                "hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
                isSelected(preset.date)
                  ? "bg-duck-blue text-charcoal shadow-[4px_4px_0_theme(colors.charcoal)] -translate-y-0.5"
                  : "bg-white shadow-[2px_2px_0_theme(colors.charcoal)] hover:bg-duck-blue/20",
                disabled && "opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-[2px_2px_0_theme(colors.charcoal)]"
              )}
              style={{ borderRadius: "2px" }}
            >
              {preset.icon && (
                <div
                  className={cn(
                    "flex h-9 w-9 flex-shrink-0 items-center justify-center border-2 border-charcoal",
                    isSelected(preset.date) ? "bg-white" : "bg-duck-yellow/30"
                  )}
                  style={{ borderRadius: "2px" }}
                >
                  {preset.icon}
                </div>
              )}
              <div className="flex-1 text-left">
                <span className="block text-xs font-bold uppercase tracking-wider">
                  {preset.label}
                </span>
                <span className="block text-[10px] text-charcoal/60">
                  {preset.sublabel}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Picker */}
      <div className="space-y-3">
        <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50">
          {t("customDate")}
        </p>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              className={cn(
                "flex w-full items-center justify-between border-2 border-charcoal bg-white p-4 font-mono transition-all duration-150",
                "hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
                "shadow-[2px_2px_0_theme(colors.charcoal)]",
                calendarOpen && "shadow-[4px_4px_0_theme(colors.charcoal)] -translate-y-0.5 border-duck-blue",
                disabled && "opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-[2px_2px_0_theme(colors.charcoal)]"
              )}
              style={{ borderRadius: "2px" }}
            >
              <span className="text-sm uppercase tracking-wider text-charcoal/60">
                {t("pickDate")}
              </span>
              <div
                className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-duck-cream"
                style={{ borderRadius: "2px" }}
              >
                <CalendarIcon className="h-5 w-5 text-charcoal" strokeWidth={2} />
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 border-2 border-charcoal bg-white"
            style={{
              borderRadius: "2px",
              boxShadow: "-8px 8px 0px 0px rgb(56, 56, 56)",
            }}
            align="center"
          >
            <Calendar
              mode="single"
              selected={value}
              onSelect={handleCalendarSelect}
              disabled={(date) => {
                if (minDate) {
                  return date < minDate
                }
                // Can't schedule in the past
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                return date < today
              }}
              initialFocus
              className="font-mono"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Birthday prompt if not set */}
      {!userBirthday && (
        <div
          className="flex items-center gap-3 border-2 border-dashed border-duck-yellow/50 bg-duck-yellow/10 p-3"
          style={{ borderRadius: "2px" }}
        >
          <Gift className="h-5 w-5 text-duck-yellow flex-shrink-0" strokeWidth={2} />
          <p className="font-mono text-[10px] text-charcoal/60 leading-relaxed">
            {t("birthdayHint")}
          </p>
        </div>
      )}
    </div>
  )
}
