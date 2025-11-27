"use client"

import { useState, useTransition, useMemo, useEffect, useCallback } from "react"
import {
  Check,
  ChevronsUpDown,
  Clock,
  Globe,
  Loader2,
  Search,
  Sun,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import {
  getUTCOffsetString,
  getTimezoneAbbreviation,
  observesDST,
} from "@/lib/timezone"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"

// ============================================================================
// TIMEZONE DATA
// ============================================================================

interface TimezoneOption {
  value: string
  city: string
  region: string
}

const TIMEZONE_GROUPS: { label: string; timezones: TimezoneOption[] }[] = [
  {
    label: "Americas",
    timezones: [
      { value: "America/New_York", city: "New York", region: "Eastern" },
      { value: "America/Chicago", city: "Chicago", region: "Central" },
      { value: "America/Denver", city: "Denver", region: "Mountain" },
      { value: "America/Los_Angeles", city: "Los Angeles", region: "Pacific" },
      { value: "America/Phoenix", city: "Phoenix", region: "Arizona" },
      { value: "America/Anchorage", city: "Anchorage", region: "Alaska" },
      { value: "Pacific/Honolulu", city: "Honolulu", region: "Hawaii" },
      { value: "America/Toronto", city: "Toronto", region: "Eastern" },
      { value: "America/Vancouver", city: "Vancouver", region: "Pacific" },
      { value: "America/Mexico_City", city: "Mexico City", region: "Central" },
      { value: "America/Sao_Paulo", city: "São Paulo", region: "Brasília" },
      { value: "America/Buenos_Aires", city: "Buenos Aires", region: "Argentina" },
      { value: "America/Lima", city: "Lima", region: "Peru" },
      { value: "America/Bogota", city: "Bogotá", region: "Colombia" },
    ],
  },
  {
    label: "Europe",
    timezones: [
      { value: "Europe/London", city: "London", region: "GMT/BST" },
      { value: "Europe/Paris", city: "Paris", region: "CET" },
      { value: "Europe/Berlin", city: "Berlin", region: "CET" },
      { value: "Europe/Rome", city: "Rome", region: "CET" },
      { value: "Europe/Madrid", city: "Madrid", region: "CET" },
      { value: "Europe/Amsterdam", city: "Amsterdam", region: "CET" },
      { value: "Europe/Brussels", city: "Brussels", region: "CET" },
      { value: "Europe/Vienna", city: "Vienna", region: "CET" },
      { value: "Europe/Stockholm", city: "Stockholm", region: "CET" },
      { value: "Europe/Warsaw", city: "Warsaw", region: "CET" },
      { value: "Europe/Prague", city: "Prague", region: "CET" },
      { value: "Europe/Zurich", city: "Zurich", region: "CET" },
      { value: "Europe/Istanbul", city: "Istanbul", region: "TRT" },
      { value: "Europe/Moscow", city: "Moscow", region: "MSK" },
      { value: "Europe/Athens", city: "Athens", region: "EET" },
      { value: "Europe/Helsinki", city: "Helsinki", region: "EET" },
      { value: "Europe/Lisbon", city: "Lisbon", region: "WET" },
    ],
  },
  {
    label: "Asia & Pacific",
    timezones: [
      { value: "Asia/Dubai", city: "Dubai", region: "GST" },
      { value: "Asia/Kolkata", city: "Mumbai", region: "IST" },
      { value: "Asia/Bangkok", city: "Bangkok", region: "ICT" },
      { value: "Asia/Singapore", city: "Singapore", region: "SGT" },
      { value: "Asia/Hong_Kong", city: "Hong Kong", region: "HKT" },
      { value: "Asia/Shanghai", city: "Shanghai", region: "CST" },
      { value: "Asia/Tokyo", city: "Tokyo", region: "JST" },
      { value: "Asia/Seoul", city: "Seoul", region: "KST" },
      { value: "Asia/Jakarta", city: "Jakarta", region: "WIB" },
      { value: "Asia/Manila", city: "Manila", region: "PHT" },
      { value: "Asia/Taipei", city: "Taipei", region: "CST" },
      { value: "Australia/Sydney", city: "Sydney", region: "AEST" },
      { value: "Australia/Melbourne", city: "Melbourne", region: "AEST" },
      { value: "Australia/Brisbane", city: "Brisbane", region: "AEST" },
      { value: "Australia/Perth", city: "Perth", region: "AWST" },
      { value: "Pacific/Auckland", city: "Auckland", region: "NZST" },
    ],
  },
  {
    label: "Africa & Middle East",
    timezones: [
      { value: "Africa/Cairo", city: "Cairo", region: "EET" },
      { value: "Africa/Johannesburg", city: "Johannesburg", region: "SAST" },
      { value: "Africa/Lagos", city: "Lagos", region: "WAT" },
      { value: "Africa/Nairobi", city: "Nairobi", region: "EAT" },
      { value: "Africa/Casablanca", city: "Casablanca", region: "WET" },
      { value: "Asia/Jerusalem", city: "Jerusalem", region: "IST" },
      { value: "Asia/Riyadh", city: "Riyadh", region: "AST" },
      { value: "Asia/Tehran", city: "Tehran", region: "IRST" },
    ],
  },
  {
    label: "Universal",
    timezones: [
      { value: "UTC", city: "UTC", region: "Coordinated Universal Time" },
    ],
  },
]

// Flatten for easier searching
const ALL_TIMEZONES = TIMEZONE_GROUPS.flatMap((group) =>
  group.timezones.map((tz) => ({ ...tz, group: group.label }))
)

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatTimeForTimezone(timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date())
  } catch {
    return "--:--"
  }
}

function formatDateForTimezone(timezone: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(new Date())
  } catch {
    return ""
  }
}

// ============================================================================
// TIMEZONE OPTION COMPONENT
// ============================================================================

interface TimezoneOptionItemProps {
  timezone: TimezoneOption & { group: string }
  isSelected: boolean
  onClick: () => void
  currentTime: string
}

function TimezoneOptionItem({
  timezone,
  isSelected,
  onClick,
  currentTime,
}: TimezoneOptionItemProps) {
  const offset = getUTCOffsetString(timezone.value)
  const hasDST = observesDST(timezone.value)

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 text-left transition-all",
        "border-2 border-transparent hover:border-charcoal hover:bg-duck-yellow/10",
        isSelected && "border-charcoal bg-duck-yellow/20"
      )}
      style={{ borderRadius: "2px" }}
    >
      {/* Selection indicator */}
      <div
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center border-2 border-charcoal",
          isSelected ? "bg-charcoal" : "bg-white"
        )}
        style={{ borderRadius: "2px" }}
      >
        {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </div>

      {/* City & Region */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-charcoal truncate">
            {timezone.city}
          </span>
          {hasDST && (
            <Sun className="h-3 w-3 text-duck-yellow shrink-0" strokeWidth={2} />
          )}
        </div>
        <span className="font-mono text-[10px] text-charcoal/50 uppercase tracking-wider">
          {timezone.region}
        </span>
      </div>

      {/* GMT Offset */}
      <div
        className="shrink-0 px-2 py-1 bg-charcoal/5 font-mono text-[10px] font-bold text-charcoal uppercase"
        style={{ borderRadius: "2px" }}
      >
        {offset}
      </div>

      {/* Current Time */}
      <div className="shrink-0 font-mono text-sm font-bold text-teal-primary tabular-nums">
        {currentTime}
      </div>
    </button>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface TimezoneSelectV3Props {
  value: string
  onSave: (value: string) => Promise<{ success: boolean }>
  successMessage?: string
  errorMessage?: string
  className?: string
}

export function TimezoneSelectV3({
  value,
  onSave,
  successMessage = "Timezone updated",
  errorMessage = "Failed to update timezone",
  className,
}: TimezoneSelectV3Props) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedValue, setSelectedValue] = useState(value)
  const [isPending, startTransition] = useTransition()
  const [currentTime, setCurrentTime] = useState<Date>(new Date())

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  // Reset selected value when value prop changes
  useEffect(() => {
    setSelectedValue(value)
  }, [value])

  // Get display info for selected timezone
  const selectedTimezone = useMemo(() => {
    const found = ALL_TIMEZONES.find((tz) => tz.value === selectedValue)
    return (
      found || {
        value: selectedValue,
        city: selectedValue,
        region: "",
        group: "Other",
      }
    )
  }, [selectedValue])

  // Filter timezones based on search
  const filteredGroups = useMemo(() => {
    if (!search.trim()) return TIMEZONE_GROUPS

    const searchLower = search.toLowerCase()
    return TIMEZONE_GROUPS.map((group) => ({
      ...group,
      timezones: group.timezones.filter(
        (tz) =>
          tz.city.toLowerCase().includes(searchLower) ||
          tz.region.toLowerCase().includes(searchLower) ||
          tz.value.toLowerCase().includes(searchLower)
      ),
    })).filter((group) => group.timezones.length > 0)
  }, [search])

  // Handle timezone selection
  const handleSelect = useCallback(
    (timezoneValue: string) => {
      setSelectedValue(timezoneValue)

      startTransition(async () => {
        const result = await onSave(timezoneValue)
        if (result.success) {
          setOpen(false)
          setSearch("")
          toast.success(successMessage)
        } else {
          // Revert selection on failure
          setSelectedValue(value)
          toast.error(errorMessage)
        }
      })
    },
    [onSave, value, successMessage, errorMessage]
  )

  // Cancel and close
  const handleCancel = useCallback(() => {
    setSelectedValue(value)
    setSearch("")
    setOpen(false)
  }, [value])

  // Format times (memoized with currentTime dependency for updates)
  const timeCache = useMemo(() => {
    const cache: Record<string, string> = {}
    ALL_TIMEZONES.forEach((tz) => {
      cache[tz.value] = formatTimeForTimezone(tz.value)
    })
    return cache
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTime])

  const selectedTimeDisplay = formatTimeForTimezone(selectedValue)
  const selectedDateDisplay = formatDateForTimezone(selectedValue)
  const selectedOffset = getUTCOffsetString(selectedValue)
  const selectedAbbr = getTimezoneAbbreviation(selectedValue)
  const selectedHasDST = observesDST(selectedValue)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          disabled={isPending}
          className={cn(
            "group w-full flex items-center gap-4 p-4 text-left",
            "border-2 border-charcoal bg-white transition-all",
            "hover:shadow-[2px_2px_0_theme(colors.charcoal)] hover:-translate-y-0.5",
            "focus:outline-none focus:shadow-[2px_2px_0_theme(colors.charcoal)]",
            isPending && "opacity-70 cursor-not-allowed",
            className
          )}
          style={{ borderRadius: "2px" }}
        >
          {/* Globe Icon */}
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center bg-duck-blue border-2 border-charcoal"
            style={{ borderRadius: "2px" }}
          >
            <Globe className="h-5 w-5 text-charcoal" strokeWidth={2} />
          </div>

          {/* Timezone Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-charcoal truncate">
                {selectedTimezone.city}
              </span>
              <span
                className="shrink-0 px-2 py-0.5 bg-charcoal font-mono text-[10px] font-bold text-white uppercase"
                style={{ borderRadius: "2px" }}
              >
                {selectedOffset}
              </span>
              {selectedHasDST && (
                <span
                  className="shrink-0 flex items-center gap-1 px-2 py-0.5 bg-duck-yellow font-mono text-[10px] font-bold text-charcoal uppercase"
                  style={{ borderRadius: "2px" }}
                  title="This timezone observes Daylight Saving Time"
                >
                  <Sun className="h-3 w-3" strokeWidth={2} />
                  DST
                </span>
              )}
            </div>
            <span className="font-mono text-xs text-charcoal/50">
              {selectedTimezone.region} ({selectedAbbr})
            </span>
          </div>

          {/* Live Clock Display */}
          <div className="shrink-0 text-right">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-charcoal/40" strokeWidth={2} />
              <span className="font-mono text-xl font-bold text-teal-primary tabular-nums">
                {selectedTimeDisplay}
              </span>
            </div>
            <span className="font-mono text-[10px] text-charcoal/50 uppercase tracking-wider">
              {selectedDateDisplay}
            </span>
          </div>

          {/* Chevron */}
          {isPending ? (
            <Loader2 className="h-5 w-5 shrink-0 text-charcoal/50 animate-spin" />
          ) : (
            <ChevronsUpDown
              className="h-5 w-5 shrink-0 text-charcoal/50 group-hover:text-charcoal transition-colors"
              strokeWidth={2}
            />
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0 border-2 border-charcoal shadow-[4px_4px_0_theme(colors.charcoal)]"
        style={{ borderRadius: "2px" }}
        align="start"
        sideOffset={8}
      >
        {/* Search Input */}
        <div className="p-3 border-b-2 border-charcoal bg-off-white">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal/50"
              strokeWidth={2}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search timezones..."
              className="w-full pl-10 pr-10 py-2 font-mono text-sm text-charcoal placeholder:text-charcoal/40 bg-white border-2 border-charcoal focus:outline-none focus:border-duck-blue"
              style={{ borderRadius: "2px" }}
              autoFocus
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/50 hover:text-charcoal"
              >
                <X className="h-4 w-4" strokeWidth={2} />
              </button>
            )}
          </div>
        </div>

        {/* Timezone List */}
        <ScrollArea className="h-[320px]">
          <div className="p-2">
            {filteredGroups.length === 0 ? (
              <div className="p-4 text-center">
                <p className="font-mono text-sm text-charcoal/50">
                  No timezones found
                </p>
              </div>
            ) : (
              filteredGroups.map((group) => (
                <div key={group.label} className="mb-4 last:mb-0">
                  {/* Group Header */}
                  <div
                    className="sticky top-0 z-10 px-3 py-2 mb-1 bg-duck-cream font-mono text-[10px] font-bold text-charcoal/70 uppercase tracking-wider"
                    style={{ borderRadius: "2px" }}
                  >
                    {group.label}
                  </div>

                  {/* Group Items */}
                  <div className="space-y-1">
                    {group.timezones.map((tz) => (
                      <TimezoneOptionItem
                        key={tz.value}
                        timezone={{ ...tz, group: group.label }}
                        isSelected={selectedValue === tz.value}
                        onClick={() => handleSelect(tz.value)}
                        currentTime={timeCache[tz.value] || "--:--"}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer with Cancel */}
        <div className="p-3 border-t-2 border-charcoal bg-off-white flex items-center justify-between">
          <div className="flex items-center gap-2 text-charcoal/50">
            <Sun className="h-3.5 w-3.5" strokeWidth={2} />
            <span className="font-mono text-[10px] uppercase tracking-wider">
              DST: Daylight Saving Time
            </span>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal border-2 border-charcoal bg-white hover:bg-coral/20 transition-colors"
            style={{ borderRadius: "2px" }}
          >
            Cancel
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
