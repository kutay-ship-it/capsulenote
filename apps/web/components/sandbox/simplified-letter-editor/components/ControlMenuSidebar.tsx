"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Loader2, Send } from "lucide-react"
import { ArriveInSelector } from "./ArriveInSelector"
import { WritingAmbienceSelector } from "./WritingAmbienceSelector"
import { TemplateSelector } from "./TemplateSelector"
import type { TemplateData, AmbienceOption } from "../types"

interface ControlMenuSidebarProps {
  email: string
  onEmailChange: (email: string) => void
  arriveInDate: Date | null
  arriveInMode: 'preset' | 'custom'
  onArriveInChange: (date: Date | null, mode: 'preset' | 'custom', preset?: '6m' | '1y' | '3y' | '5y') => void
  ambience: AmbienceOption
  onAmbienceChange: (ambience: AmbienceOption) => void
  onTemplateSelect: (template: TemplateData) => void
  onSchedule: () => void
  isScheduling: boolean
  errors: Record<string, string>
}

export function ControlMenuSidebar({
  email,
  onEmailChange,
  arriveInDate,
  arriveInMode,
  onArriveInChange,
  ambience,
  onAmbienceChange,
  onTemplateSelect,
  onSchedule,
  isScheduling,
  errors,
}: ControlMenuSidebarProps) {
  return (
    <div className="sticky top-0 h-screen overflow-y-auto border-l border-gray-200 bg-gray-50 p-6">
      <div className="space-y-6">
        {/* Arrive In Selector */}
        <div>
          <ArriveInSelector
            value={arriveInDate}
            mode={arriveInMode}
            onChange={onArriveInChange}
          />
          {errors.arriveInDate && (
            <p className="mt-1 text-xs text-red-600">{errors.arriveInDate}</p>
          )}
        </div>

        <Separator />

        {/* Email Address */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-gray-600">
            Email Address
          </label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-xs text-red-600">{errors.email}</p>
          )}
        </div>

        <Separator />

        {/* Writing Ambience */}
        <WritingAmbienceSelector
          value={ambience}
          onChange={onAmbienceChange}
        />

        <Separator />

        {/* Templates */}
        <TemplateSelector onSelect={onTemplateSelect} />

        <Separator />

        {/* Schedule Button */}
        <div className="space-y-3">
          <Button
            type="button"
            onClick={onSchedule}
            disabled={isScheduling}
            className="w-full bg-purple-600 py-6 text-base font-semibold hover:bg-purple-700"
            size="lg"
          >
            {isScheduling ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Scheduling...
              </>
            ) : (
              <>
                <Send className="mr-2 h-5 w-5" />
                Schedule Letter
              </>
            )}
          </Button>

          {errors.content && (
            <p className="text-xs text-red-600">{errors.content}</p>
          )}

          <p className="text-center text-xs text-gray-500">
            Auto-saved locally
          </p>
        </div>
      </div>
    </div>
  )
}
