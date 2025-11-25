"use client"

import { useState, useTransition, useMemo } from "react"
import { Pencil, Check, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Common timezones grouped by region
const TIMEZONE_GROUPS = [
  {
    label: "Americas",
    timezones: [
      { value: "America/New_York", label: "Eastern Time (US & Canada)" },
      { value: "America/Chicago", label: "Central Time (US & Canada)" },
      { value: "America/Denver", label: "Mountain Time (US & Canada)" },
      { value: "America/Los_Angeles", label: "Pacific Time (US & Canada)" },
      { value: "America/Anchorage", label: "Alaska" },
      { value: "Pacific/Honolulu", label: "Hawaii" },
      { value: "America/Toronto", label: "Toronto" },
      { value: "America/Vancouver", label: "Vancouver" },
      { value: "America/Mexico_City", label: "Mexico City" },
      { value: "America/Sao_Paulo", label: "Sao Paulo" },
      { value: "America/Buenos_Aires", label: "Buenos Aires" },
    ],
  },
  {
    label: "Europe",
    timezones: [
      { value: "Europe/London", label: "London" },
      { value: "Europe/Paris", label: "Paris" },
      { value: "Europe/Berlin", label: "Berlin" },
      { value: "Europe/Rome", label: "Rome" },
      { value: "Europe/Madrid", label: "Madrid" },
      { value: "Europe/Amsterdam", label: "Amsterdam" },
      { value: "Europe/Brussels", label: "Brussels" },
      { value: "Europe/Vienna", label: "Vienna" },
      { value: "Europe/Stockholm", label: "Stockholm" },
      { value: "Europe/Warsaw", label: "Warsaw" },
      { value: "Europe/Istanbul", label: "Istanbul" },
      { value: "Europe/Moscow", label: "Moscow" },
    ],
  },
  {
    label: "Asia & Pacific",
    timezones: [
      { value: "Asia/Dubai", label: "Dubai" },
      { value: "Asia/Kolkata", label: "Mumbai, Kolkata" },
      { value: "Asia/Bangkok", label: "Bangkok" },
      { value: "Asia/Singapore", label: "Singapore" },
      { value: "Asia/Hong_Kong", label: "Hong Kong" },
      { value: "Asia/Shanghai", label: "Shanghai" },
      { value: "Asia/Tokyo", label: "Tokyo" },
      { value: "Asia/Seoul", label: "Seoul" },
      { value: "Australia/Sydney", label: "Sydney" },
      { value: "Australia/Melbourne", label: "Melbourne" },
      { value: "Pacific/Auckland", label: "Auckland" },
    ],
  },
  {
    label: "Africa & Middle East",
    timezones: [
      { value: "Africa/Cairo", label: "Cairo" },
      { value: "Africa/Johannesburg", label: "Johannesburg" },
      { value: "Africa/Lagos", label: "Lagos" },
      { value: "Africa/Nairobi", label: "Nairobi" },
      { value: "Asia/Jerusalem", label: "Jerusalem" },
      { value: "Asia/Riyadh", label: "Riyadh" },
    ],
  },
]

interface TimezoneSelectProps {
  value: string
  onSave: (value: string) => Promise<{ success: boolean }>
  emptyText?: string
  successMessage?: string
  errorMessage?: string
}

export function TimezoneSelect({
  value,
  onSave,
  emptyText = "Not set",
  successMessage = "Timezone updated",
  errorMessage = "Failed to update timezone",
}: TimezoneSelectProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const [isPending, startTransition] = useTransition()

  // Get display label for current value
  const displayLabel = useMemo(() => {
    for (const group of TIMEZONE_GROUPS) {
      const found = group.timezones.find((tz) => tz.value === value)
      if (found) return found.label
    }
    return value || emptyText
  }, [value, emptyText])

  const handleSave = () => {
    startTransition(async () => {
      const result = await onSave(editValue)
      if (result.success) {
        setIsEditing(false)
        toast.success(successMessage)
      } else {
        toast.error(errorMessage)
      }
    })
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Select value={editValue} onValueChange={setEditValue} disabled={isPending}>
          <SelectTrigger
            className="flex-1 border-2 border-charcoal font-mono"
            style={{ borderRadius: "2px" }}
          >
            <SelectValue placeholder="Select timezone" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {TIMEZONE_GROUPS.map((group) => (
              <div key={group.label}>
                <div className="px-2 py-1.5 text-xs font-semibold text-gray-secondary">
                  {group.label}
                </div>
                {group.timezones.map((tz) => (
                  <SelectItem
                    key={tz.value}
                    value={tz.value}
                    className="font-mono text-sm"
                  >
                    {tz.label}
                  </SelectItem>
                ))}
              </div>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isPending}
          className="border-2 border-charcoal bg-duck-yellow text-charcoal hover:bg-duck-yellow/80"
          style={{ borderRadius: "2px" }}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Check className="h-4 w-4" />
          )}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCancel}
          disabled={isPending}
          className="border-2 border-charcoal"
          style={{ borderRadius: "2px" }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between">
      <p className="font-mono text-sm text-charcoal sm:text-base">{displayLabel}</p>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsEditing(true)}
        className="text-charcoal hover:bg-duck-yellow/20"
      >
        <Pencil className="h-4 w-4" />
        <span className="sr-only">Edit timezone</span>
      </Button>
    </div>
  )
}
