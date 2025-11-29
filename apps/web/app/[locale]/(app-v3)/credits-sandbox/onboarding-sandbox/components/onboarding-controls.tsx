"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { OnboardingVariation } from "./types"
import { Sparkles, BookOpen, Zap, RotateCcw } from "lucide-react"

interface OnboardingControlsProps {
  variation: OnboardingVariation
  setVariation: (v: OnboardingVariation) => void
  onReset: () => void
}

const VARIATIONS: { id: OnboardingVariation; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: "ritual",
    label: "Time Capsule Ritual",
    icon: <Sparkles className="h-4 w-4" strokeWidth={2} />,
    description: "Multi-step ceremonial experience",
  },
  {
    id: "narrative",
    label: "Timeline Narrative",
    icon: <BookOpen className="h-4 w-4" strokeWidth={2} />,
    description: "Scroll-driven storytelling",
  },
  {
    id: "quick",
    label: "Quick Start",
    icon: <Zap className="h-4 w-4" strokeWidth={2} />,
    description: "Minimal friction, fast action",
  },
]

export function OnboardingControls({
  variation,
  setVariation,
  onReset,
}: OnboardingControlsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-2 border-charcoal bg-white p-4 shadow-[4px_4px_0_theme(colors.charcoal)]"
      style={{ borderRadius: "2px" }}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Variation Selector */}
        <div className="flex flex-col gap-3">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal/50">
            Select Variation
          </span>
          <div className="flex flex-wrap gap-2">
            {VARIATIONS.map((v) => (
              <button
                key={v.id}
                onClick={() => setVariation(v.id)}
                className={cn(
                  "flex items-center gap-2 border-2 border-charcoal px-3 py-2 font-mono text-xs uppercase tracking-wider transition-all",
                  "hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
                  variation === v.id
                    ? "bg-duck-yellow text-charcoal shadow-[3px_3px_0_theme(colors.charcoal)]"
                    : "bg-white text-charcoal shadow-[2px_2px_0_theme(colors.charcoal)]"
                )}
                style={{ borderRadius: "2px" }}
              >
                {v.icon}
                <span className="hidden sm:inline">{v.label}</span>
                <span className="sm:hidden">{v.id}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={onReset}
          className={cn(
            "flex items-center gap-2 border-2 border-charcoal bg-cream px-3 py-2 font-mono text-xs uppercase tracking-wider transition-all",
            "hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
            "shadow-[2px_2px_0_theme(colors.charcoal)]"
          )}
          style={{ borderRadius: "2px" }}
        >
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
          Reset
        </button>
      </div>

      {/* Current Variation Description */}
      <div className="mt-4 pt-4 border-t-2 border-dashed border-charcoal/10">
        <p className="font-mono text-xs text-charcoal/60">
          <span className="font-bold text-charcoal">
            {VARIATIONS.find((v) => v.id === variation)?.label}:
          </span>{" "}
          {VARIATIONS.find((v) => v.id === variation)?.description}
        </p>
      </div>
    </motion.div>
  )
}
