"use client"

import * as React from "react"
import { Palette, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PrintOptions {
  color: boolean
  doubleSided: boolean
}

interface PrintOptionsV3Props {
  value: PrintOptions
  onChange: (options: PrintOptions) => void
  disabled?: boolean
}

export function PrintOptionsV3({
  value,
  onChange,
  disabled = false,
}: PrintOptionsV3Props) {
  const handleColorChange = (color: boolean) => {
    onChange({ ...value, color })
  }

  const handleDoubleSidedChange = (doubleSided: boolean) => {
    onChange({ ...value, doubleSided })
  }

  return (
    <div className="space-y-2">
      {/* Color Printing Option */}
      <label
        className={cn(
          "flex items-center gap-3 p-3 border-2 cursor-pointer transition-all",
          value.color
            ? "border-teal-primary bg-teal-primary/5"
            : "border-charcoal/30 bg-white hover:border-charcoal/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        style={{ borderRadius: "2px" }}
      >
        <div
          className={cn(
            "flex h-5 w-5 flex-shrink-0 items-center justify-center border-2 transition-colors",
            value.color ? "border-teal-primary bg-teal-primary" : "border-charcoal/40 bg-white"
          )}
          style={{ borderRadius: "2px" }}
        >
          {value.color && (
            <svg
              className="h-3 w-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <input
          type="checkbox"
          className="sr-only"
          checked={value.color}
          onChange={(e) => handleColorChange(e.target.checked)}
          disabled={disabled}
        />
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Palette className="h-4 w-4 text-charcoal/60 flex-shrink-0" strokeWidth={2} />
          <div className="min-w-0">
            <p className="font-mono text-xs font-bold text-charcoal">Color Printing</p>
            <p className="font-mono text-[10px] text-charcoal/50">
              Print your letter in full color
            </p>
          </div>
        </div>
      </label>

      {/* Double-Sided Option */}
      <label
        className={cn(
          "flex items-center gap-3 p-3 border-2 cursor-pointer transition-all",
          value.doubleSided
            ? "border-teal-primary bg-teal-primary/5"
            : "border-charcoal/30 bg-white hover:border-charcoal/50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        style={{ borderRadius: "2px" }}
      >
        <div
          className={cn(
            "flex h-5 w-5 flex-shrink-0 items-center justify-center border-2 transition-colors",
            value.doubleSided ? "border-teal-primary bg-teal-primary" : "border-charcoal/40 bg-white"
          )}
          style={{ borderRadius: "2px" }}
        >
          {value.doubleSided && (
            <svg
              className="h-3 w-3 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <input
          type="checkbox"
          className="sr-only"
          checked={value.doubleSided}
          onChange={(e) => handleDoubleSidedChange(e.target.checked)}
          disabled={disabled}
        />
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <BookOpen className="h-4 w-4 text-charcoal/60 flex-shrink-0" strokeWidth={2} />
          <div className="min-w-0">
            <p className="font-mono text-xs font-bold text-charcoal">Double-Sided</p>
            <p className="font-mono text-[10px] text-charcoal/50">
              Print on both sides of the paper
            </p>
          </div>
        </div>
      </label>
    </div>
  )
}
