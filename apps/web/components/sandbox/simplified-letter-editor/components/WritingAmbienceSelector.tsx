"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { WritingAmbienceSelectorProps, AmbienceOption } from "../types"

const ambienceOptions: Array<{ value: AmbienceOption; label: string; icon: string }> = [
  { value: 'none', label: 'None', icon: '🔇' },
  { value: 'rain', label: 'Rain', icon: '🌧️' },
  { value: 'cafe', label: 'Cafe', icon: '☕' },
  { value: 'forest', label: 'Forest', icon: '🌲' },
  { value: 'ocean', label: 'Ocean', icon: '🌊' },
  { value: 'white-noise', label: 'White Noise', icon: '📻' },
]

export function WritingAmbienceSelector({ value, onChange }: WritingAmbienceSelectorProps) {
  const selectedOption = ambienceOptions.find(opt => opt.value === value)

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wide text-gray-600">
        Writing Ambience
      </label>

      <Select value={value} onValueChange={(val) => onChange(val as AmbienceOption)}>
        <SelectTrigger className="w-full">
          <SelectValue>
            {selectedOption && (
              <span className="flex items-center gap-2">
                <span>{selectedOption.icon}</span>
                <span>{selectedOption.label}</span>
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {ambienceOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <span className="flex items-center gap-2">
                <span>{option.icon}</span>
                <span>{option.label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {value !== 'none' && (
        <p className="text-xs text-gray-500">
          🎵 Ambience active (audio simulation)
        </p>
      )}
    </div>
  )
}
