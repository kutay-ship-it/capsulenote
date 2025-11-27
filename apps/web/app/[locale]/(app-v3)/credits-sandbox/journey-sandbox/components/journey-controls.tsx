"use client"

import { cn } from "@/lib/utils"
import type { Variation, JourneyState } from "./types"
import {
  Minimize2,
  Grid3X3,
  Theater,
  Waves,
  Leaf,
} from "lucide-react"

interface JourneyControlsProps {
  variation: Variation
  setVariation: (v: Variation) => void
  state: JourneyState
  setState: (s: JourneyState) => void
}

const VARIATIONS: { id: Variation; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: "minimal",
    label: "Minimal",
    icon: <Minimize2 className="h-4 w-4" strokeWidth={2} />,
    description: "Clean vertical timeline",
  },
  {
    id: "archive",
    label: "Archive",
    icon: <Grid3X3 className="h-4 w-4" strokeWidth={2} />,
    description: "Dense grid overview",
  },
  {
    id: "theater",
    label: "Theater",
    icon: <Theater className="h-4 w-4" strokeWidth={2} />,
    description: "Dramatic stage presentation",
  },
  {
    id: "river",
    label: "River",
    icon: <Waves className="h-4 w-4" strokeWidth={2} />,
    description: "Flowing meditative journey",
  },
  {
    id: "garden",
    label: "Garden",
    icon: <Leaf className="h-4 w-4" strokeWidth={2} />,
    description: "Growth visualization",
  },
]

const STATES: { id: JourneyState; label: string; count: string }[] = [
  { id: "empty", label: "Empty", count: "0" },
  { id: "few", label: "Few", count: "3" },
  { id: "normal", label: "Normal", count: "8" },
  { id: "many", label: "Many", count: "20" },
]

export function JourneyControls({
  variation,
  setVariation,
  state,
  setState,
}: JourneyControlsProps) {
  return (
    <div
      className="border-2 border-charcoal bg-white p-6 shadow-[4px_4px_0_theme(colors.charcoal)]"
      style={{ borderRadius: "2px" }}
    >
      <div className="space-y-6">
        {/* Variation Selector */}
        <div>
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal mb-3">
            Journey Style
          </h3>
          <div className="flex flex-wrap gap-2">
            {VARIATIONS.map((v) => (
              <button
                key={v.id}
                onClick={() => setVariation(v.id)}
                className={cn(
                  "flex items-center gap-2 border-2 border-charcoal px-3 py-2 font-mono text-xs uppercase tracking-wider transition-all",
                  "hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
                  variation === v.id
                    ? "bg-duck-yellow text-charcoal shadow-[2px_2px_0_theme(colors.charcoal)]"
                    : "bg-white text-charcoal shadow-[2px_2px_0_theme(colors.charcoal)]"
                )}
                style={{ borderRadius: "2px" }}
                title={v.description}
              >
                {v.icon}
                <span className="hidden sm:inline">{v.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* State Simulator */}
        <div>
          <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal mb-3">
            Letter Count
          </h3>
          <div className="flex flex-wrap gap-2">
            {STATES.map((s) => (
              <button
                key={s.id}
                onClick={() => setState(s.id)}
                className={cn(
                  "flex items-center gap-2 border-2 border-charcoal px-3 py-2 font-mono text-xs uppercase tracking-wider transition-all",
                  "hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
                  state === s.id
                    ? "bg-teal-primary text-white shadow-[2px_2px_0_theme(colors.charcoal)]"
                    : "bg-white text-charcoal shadow-[2px_2px_0_theme(colors.charcoal)]"
                )}
                style={{ borderRadius: "2px" }}
              >
                <span>{s.label}</span>
                <span
                  className={cn(
                    "px-1.5 py-0.5 text-[10px] font-bold",
                    state === s.id
                      ? "bg-white/20 text-white"
                      : "bg-charcoal/10 text-charcoal"
                  )}
                  style={{ borderRadius: "2px" }}
                >
                  {s.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Current Selection Info */}
        <div className="border-t-2 border-dashed border-charcoal/20 pt-4">
          <div className="flex items-center gap-4 font-mono text-xs text-charcoal/60">
            <span>
              <strong className="text-charcoal">Style:</strong>{" "}
              {VARIATIONS.find((v) => v.id === variation)?.description}
            </span>
            <span className="w-1 h-1 bg-charcoal/30" style={{ borderRadius: "50%" }} />
            <span>
              <strong className="text-charcoal">Letters:</strong>{" "}
              {STATES.find((s) => s.id === state)?.count}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
