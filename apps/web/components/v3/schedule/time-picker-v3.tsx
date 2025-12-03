"use client"

import * as React from "react"
import { Clock, Globe, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface TimePickerV3Props {
  value: string // "HH:mm" format
  onChange: (time: string) => void
  timezone: string
  disabled?: boolean
}

// Common time presets
const TIME_PRESETS = [
  { label: "MORNING", value: "09:00", description: "9:00 AM" },
  { label: "NOON", value: "12:00", description: "12:00 PM" },
  { label: "EVENING", value: "18:00", description: "6:00 PM" },
]

function formatTimezone(timezone: string): { full: string; short: string } {
  try {
    const now = new Date()
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "long",
    })
    const shortFormatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "short",
    })

    const parts = formatter.formatToParts(now)
    const shortParts = shortFormatter.formatToParts(now)

    const fullPart = parts.find((part) => part.type === "timeZoneName")
    const shortPart = shortParts.find((part) => part.type === "timeZoneName")

    return {
      full: fullPart?.value || timezone,
      short: shortPart?.value || timezone,
    }
  } catch {
    return { full: timezone, short: timezone }
  }
}

function formatTimeDisplay(time: string): string {
  if (!time) return ""
  const parts = time.split(":").map(Number)
  const hours = parts[0] ?? 9
  const minutes = parts[1] ?? 0
  const ampm = hours >= 12 ? "PM" : "AM"
  const displayHours = hours % 12 || 12
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`
}

export function TimePickerV3({
  value,
  onChange,
  timezone,
  disabled = false,
}: TimePickerV3Props) {
  const timezoneInfo = formatTimezone(timezone)
  const displayTime = formatTimeDisplay(value)

  const handlePresetClick = (presetValue: string) => {
    if (disabled) return
    onChange(presetValue)
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50">
          Delivery Time
        </p>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1.5 font-mono text-[10px] text-charcoal/50 hover:text-charcoal transition-colors"
              >
                <Globe className="h-3 w-3" strokeWidth={2} />
                <span>{timezoneInfo.short}</span>
                <Info className="h-3 w-3" strokeWidth={2} />
              </button>
            </TooltipTrigger>
            <TooltipContent
              className="border-2 border-charcoal bg-white p-3 font-mono"
              style={{
                borderRadius: "2px",
                boxShadow: "-4px 4px 0px 0px rgb(56, 56, 56)",
              }}
            >
              <p className="text-xs text-charcoal">
                <span className="font-bold">Your timezone:</span>
                <br />
                {timezoneInfo.full}
              </p>
              <p className="mt-2 text-[10px] text-charcoal/60">
                Delivery time is based on your local timezone.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Time Presets */}
      <div className="grid grid-cols-3 gap-2">
        {TIME_PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => handlePresetClick(preset.value)}
            disabled={disabled}
            className={cn(
              "relative flex flex-col items-center gap-1 border-2 border-charcoal p-3 font-mono transition-all duration-150",
              "hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
              value === preset.value
                ? "bg-duck-blue text-charcoal shadow-[4px_4px_0_theme(colors.charcoal)] -translate-y-0.5"
                : "bg-white shadow-[2px_2px_0_theme(colors.charcoal)] hover:bg-duck-blue/20",
              disabled && "opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-[2px_2px_0_theme(colors.charcoal)]"
            )}
            style={{ borderRadius: "2px" }}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {preset.label}
            </span>
            <span className="text-xs text-charcoal/70">
              {preset.description}
            </span>
          </button>
        ))}
      </div>

      {/* Custom Time Input */}
      <div className="space-y-2">
        <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50">
          Or choose exact time
        </p>
        <div
          className={cn(
            "flex items-center gap-3 border-2 border-charcoal bg-white p-3 transition-all duration-150",
            "focus-within:shadow-[4px_4px_0_theme(colors.charcoal)] focus-within:-translate-y-0.5 focus-within:border-duck-blue",
            "shadow-[2px_2px_0_theme(colors.charcoal)]",
            disabled && "opacity-50"
          )}
          style={{ borderRadius: "2px" }}
        >
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center border-2 border-charcoal bg-duck-cream"
            style={{ borderRadius: "2px" }}
          >
            <Clock className="h-5 w-5 text-charcoal" strokeWidth={2} />
          </div>
          <input
            type="time"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={cn(
              "flex-1 bg-transparent font-mono text-lg font-bold text-charcoal",
              "focus:outline-none",
              "disabled:cursor-not-allowed"
            )}
          />
          {displayTime && (
            <span className="font-mono text-sm text-charcoal/60 hidden sm:block">
              {displayTime}
            </span>
          )}
        </div>
      </div>

      {/* Timezone Display */}
      <div
        className="flex items-center gap-2 border-2 border-dashed border-charcoal/20 bg-off-white p-2"
        style={{ borderRadius: "2px" }}
      >
        <Globe className="h-4 w-4 text-charcoal/40" strokeWidth={2} />
        <p className="font-mono text-[10px] text-charcoal/50">
          Time shown in <span className="font-bold text-charcoal/70">{timezone}</span>
        </p>
      </div>
    </div>
  )
}
