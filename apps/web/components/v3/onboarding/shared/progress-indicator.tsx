"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  className?: string
}

/**
 * Progress indicator for onboarding flow
 * Shows dots that fill as user progresses through steps
 */
export function ProgressIndicator({
  currentStep,
  totalSteps,
  className,
}: ProgressIndicatorProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <motion.div
          key={index}
          className="relative"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.05, type: "spring" }}
        >
          <motion.div
            className={cn(
              "w-3 h-3 border-2 border-charcoal transition-colors duration-300",
              index === currentStep
                ? "bg-duck-yellow"
                : index < currentStep
                  ? "bg-teal-primary"
                  : "bg-white"
            )}
            style={{ borderRadius: "50%" }}
            animate={
              index === currentStep ? { scale: [1, 1.2, 1] } : {}
            }
            transition={
              index === currentStep
                ? { duration: 1.5, repeat: Infinity }
                : {}
            }
          />
          {/* Connection line */}
          {index < totalSteps - 1 && (
            <div
              className={cn(
                "absolute top-1/2 left-full w-3 h-0.5 -translate-y-1/2",
                index < currentStep ? "bg-teal-primary" : "bg-charcoal/20"
              )}
            />
          )}
        </motion.div>
      ))}
    </div>
  )
}
