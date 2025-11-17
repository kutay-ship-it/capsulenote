"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"
import { calculatePresetDate, formatDate } from "../lib/dateCalculations"
import type { ArriveInSelectorProps } from "../types"

const presets = [
  { label: '6m', value: '6m' as const },
  { label: '1y', value: '1y' as const },
  { label: '3y', value: '3y' as const },
  { label: '5y', value: '5y' as const },
]

export function ArriveInSelector({ value, mode, onChange }: ArriveInSelectorProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  const handlePresetClick = (preset: '6m' | '1y' | '3y' | '5y') => {
    const date = calculatePresetDate(preset)
    onChange(date, 'preset', preset)
  }

  const handleCustomDateSelect = (date: Date | undefined) => {
    if (date) {
      onChange(date, 'custom')
      setIsCalendarOpen(false)
    }
  }

  return (
    <div className="space-y-3">
      <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
        Arrive In
      </label>

      {/* Preset buttons */}
      <div className="grid grid-cols-4 gap-2">
        {presets.map((preset) => (
          <Button
            key={preset.value}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handlePresetClick(preset.value)}
            className={cn(
              "h-9 font-mono text-sm",
              mode === 'preset' && value && "border-purple-600 bg-purple-50 text-purple-900"
            )}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      {/* Custom date picker */}
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              mode === 'custom' && "border-purple-600 bg-purple-50 text-purple-900"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {mode === 'custom' && value ? formatDate(value) : 'Custom date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value || undefined}
            onSelect={handleCustomDateSelect}
            initialFocus
            disabled={(date) => date < new Date()}
          />
        </PopoverContent>
      </Popover>

      {/* Selected date display */}
      {value && (
        <p className="text-sm text-gray-600">
          <span className="font-medium">Selected:</span> {formatDate(value)}
        </p>
      )}
    </div>
  )
}
