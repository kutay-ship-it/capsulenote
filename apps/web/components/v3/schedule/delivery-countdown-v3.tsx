"use client"

import * as React from "react"
import { format, differenceInDays, differenceInWeeks, differenceInMonths, differenceInYears } from "date-fns"
import { ChevronDown, ChevronUp, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface DeliveryCountdownV3Props {
  deliveryDate: Date
  timezone: string
  showTimeline?: boolean
  onToggleTimeline?: () => void
  dstWarning?: string
}

function getCountdownUnits(deliveryDate: Date) {
  const now = new Date()
  const totalDays = differenceInDays(deliveryDate, now)
  const weeks = differenceInWeeks(deliveryDate, now)
  const months = differenceInMonths(deliveryDate, now)
  const years = differenceInYears(deliveryDate, now)

  // Determine which units to show based on duration
  if (totalDays < 7) {
    return [
      { value: totalDays, label: totalDays === 1 ? "DAY" : "DAYS" },
      { value: totalDays * 24, label: "HOURS" },
    ]
  } else if (totalDays < 60) {
    return [
      { value: totalDays, label: "DAYS" },
      { value: weeks, label: weeks === 1 ? "WEEK" : "WEEKS" },
    ]
  } else if (months < 24) {
    return [
      { value: totalDays, label: "DAYS" },
      { value: weeks, label: "WEEKS" },
      { value: months, label: months === 1 ? "MONTH" : "MONTHS" },
    ]
  } else {
    return [
      { value: totalDays, label: "DAYS" },
      { value: weeks, label: "WEEKS" },
      { value: months, label: "MONTHS" },
      { value: years, label: years === 1 ? "YEAR" : "YEARS" },
    ]
  }
}

function formatTimezone(timezone: string): string {
  try {
    const now = new Date()
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      timeZoneName: "short",
    })
    const parts = formatter.formatToParts(now)
    const tzPart = parts.find((part) => part.type === "timeZoneName")
    return tzPart?.value || timezone
  } catch {
    return timezone
  }
}

export function DeliveryCountdownV3({
  deliveryDate,
  timezone,
  showTimeline = false,
  onToggleTimeline,
  dstWarning,
}: DeliveryCountdownV3Props) {
  const countdownUnits = getCountdownUnits(deliveryDate)
  const formattedDate = format(deliveryDate, "EEEE, MMMM d, yyyy")
  const formattedTime = format(deliveryDate, "h:mm a")
  const shortTimezone = formatTimezone(timezone)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center">
        <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50">
          Delivering In
        </p>
      </div>

      {/* Countdown Numbers */}
      <div
        className="border-4 border-charcoal bg-white p-4 shadow-[4px_4px_0_theme(colors.charcoal)]"
        style={{ borderRadius: "2px" }}
      >
        <div className="flex items-center justify-center divide-x-2 divide-charcoal/20">
          {countdownUnits.map((unit, index) => (
            <motion.div
              key={unit.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "flex flex-col items-center px-4 py-2",
                index === 0 && "pl-0",
                index === countdownUnits.length - 1 && "pr-0"
              )}
            >
              <span className="font-mono text-3xl font-bold text-charcoal tabular-nums sm:text-4xl">
                {unit.value.toLocaleString()}
              </span>
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/60">
                {unit.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Full Date & Time */}
      <div className="text-center space-y-1">
        <p className="font-mono text-sm font-bold text-charcoal">
          {formattedDate}
        </p>
        <p className="font-mono text-sm text-charcoal/70">
          at {formattedTime}
        </p>
        <p className="font-mono text-xs text-charcoal/50">
          {timezone} ({shortTimezone})
        </p>
      </div>

      {/* DST Warning */}
      <AnimatePresence>
        {dstWarning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className="flex items-start gap-3 border-2 border-duck-yellow bg-duck-yellow/20 p-3"
              style={{ borderRadius: "2px" }}
            >
              <AlertTriangle className="h-4 w-4 text-charcoal flex-shrink-0 mt-0.5" strokeWidth={2} />
              <p className="font-mono text-[10px] text-charcoal/70 leading-relaxed">
                {dstWarning}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Timeline Details */}
      {onToggleTimeline && (
        <button
          type="button"
          onClick={onToggleTimeline}
          className={cn(
            "flex w-full items-center justify-center gap-2 border-2 border-charcoal/30 bg-off-white p-2 font-mono text-xs uppercase tracking-wider text-charcoal/60 transition-all duration-150",
            "hover:border-charcoal/50 hover:text-charcoal",
            showTimeline && "bg-charcoal/5"
          )}
          style={{ borderRadius: "2px" }}
        >
          <span>{showTimeline ? "Hide Journey Details" : "Show Journey Details"}</span>
          {showTimeline ? (
            <ChevronUp className="h-4 w-4" strokeWidth={2} />
          ) : (
            <ChevronDown className="h-4 w-4" strokeWidth={2} />
          )}
        </button>
      )}
    </div>
  )
}
