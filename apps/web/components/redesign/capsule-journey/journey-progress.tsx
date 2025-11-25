"use client"

import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import type { JourneyPhase } from "./capsule-journey"

interface JourneyProgressProps {
  currentPhase: JourneyPhase
  onBack?: () => void
}

const phases = [
  { id: 1, label: "When" },
  { id: 2, label: "Inspire" },
  { id: 3, label: "Write" },
  { id: 4, label: "Seal" },
]

export function JourneyProgress({ currentPhase, onBack }: JourneyProgressProps) {
  return (
    <div className="sticky top-0 z-40 bg-cream/95 backdrop-blur-sm border-b border-charcoal/10">
      <div className="mx-auto max-w-3xl px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Back button */}
          <button
            onClick={onBack}
            disabled={currentPhase === 1}
            className={cn(
              "flex items-center gap-2 font-mono text-sm uppercase tracking-wide transition-opacity",
              currentPhase === 1
                ? "opacity-0 pointer-events-none"
                : "opacity-100 hover:text-teal-primary"
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          {/* Phase indicators */}
          <div className="flex items-center gap-2">
            {phases.map((phase, index) => (
              <div key={phase.id} className="flex items-center">
                {/* Phase dot */}
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 font-mono text-xs font-semibold transition-all duration-300",
                    phase.id === currentPhase
                      ? "border-teal-primary bg-teal-primary text-white scale-110"
                      : phase.id < currentPhase
                        ? "border-teal-primary bg-teal-primary/20 text-teal-primary"
                        : "border-charcoal/30 bg-white text-charcoal/50"
                  )}
                >
                  {phase.id < currentPhase ? "✓" : phase.id}
                </div>

                {/* Connector line */}
                {index < phases.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 w-6 sm:w-10 transition-colors duration-300",
                      phase.id < currentPhase
                        ? "bg-teal-primary"
                        : "bg-charcoal/20"
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Spacer for balance */}
          <div className="w-16" />
        </div>

        {/* Phase label */}
        <p className="mt-2 text-center font-mono text-xs uppercase tracking-widest text-gray-secondary">
          {phases.find((p) => p.id === currentPhase)?.label}
        </p>
      </div>
    </div>
  )
}
