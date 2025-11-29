"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
  variant?: "dots" | "bar" | "numbered"
  className?: string
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  variant = "dots",
  className,
}: ProgressIndicatorProps) {
  const progress = (currentStep / (totalSteps - 1)) * 100

  if (variant === "bar") {
    return (
      <div className={cn("w-full", className)}>
        <div
          className="relative h-3 w-full bg-charcoal/10 border-2 border-charcoal overflow-hidden"
          style={{ borderRadius: "2px" }}
        >
          <motion.div
            className="absolute inset-y-0 left-0 bg-teal-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          {/* Dashed pattern overlay */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(56,56,56,0.3) 4px, rgba(56,56,56,0.3) 8px)",
            }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="font-mono text-[10px] text-charcoal/50 uppercase tracking-wider">
            Step {currentStep + 1}
          </span>
          <span className="font-mono text-[10px] text-charcoal/50 uppercase tracking-wider">
            {totalSteps} total
          </span>
        </div>
      </div>
    )
  }

  if (variant === "numbered") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {Array.from({ length: totalSteps }).map((_, index) => (
          <motion.div
            key={index}
            className={cn(
              "relative flex items-center justify-center w-8 h-8 border-2 border-charcoal font-mono text-xs font-bold transition-colors",
              index <= currentStep
                ? "bg-teal-primary text-white"
                : "bg-white text-charcoal/30"
            )}
            style={{ borderRadius: "2px" }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            {index < currentStep ? (
              <motion.svg
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <polyline points="20 6 9 17 4 12" />
              </motion.svg>
            ) : (
              index + 1
            )}
            {/* Shadow layer */}
            {index <= currentStep && (
              <div
                className="absolute -bottom-1 -right-1 w-full h-full bg-charcoal -z-10"
                style={{ borderRadius: "2px" }}
              />
            )}
          </motion.div>
        ))}
      </div>
    )
  }

  // Default: dots variant
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
              index === currentStep
                ? { scale: [1, 1.2, 1] }
                : {}
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
