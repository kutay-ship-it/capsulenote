"use client"

import { format } from "date-fns"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface NowIndicatorProps {
  variant?: "horizontal" | "vertical" | "badge" | "dot"
  className?: string
}

export function NowIndicator({ variant = "horizontal", className }: NowIndicatorProps) {
  const now = new Date()

  if (variant === "horizontal") {
    return (
      <div className={cn("relative w-full py-8", className)}>
        {/* The Line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-teal-primary" />

        {/* NOW Badge */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="relative">
            {/* Shadow Layer */}
            <div
              className="absolute top-1 left-1 w-full h-full bg-charcoal"
              style={{ borderRadius: "2px" }}
            />
            {/* Badge */}
            <div
              className="relative flex items-center gap-2 bg-teal-primary border-2 border-teal-primary px-4 py-2"
              style={{ borderRadius: "2px" }}
            >
              {/* Pulse Dot */}
              <motion.div
                className="w-2 h-2 bg-white"
                style={{ borderRadius: "50%" }}
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="font-mono text-xs font-bold uppercase tracking-[0.15em] text-white">
                Now
              </span>
            </div>
          </div>
        </motion.div>

        {/* Date Below */}
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2">
          <span
            className="font-mono text-[11px] font-bold text-teal-primary bg-cream px-2 py-1 border border-teal-primary/30"
            style={{ borderRadius: "2px" }}
          >
            {format(now, "MMMM d, yyyy")}
          </span>
        </div>
      </div>
    )
  }

  if (variant === "vertical") {
    return (
      <div className={cn("relative h-full flex flex-col items-center", className)}>
        {/* The Line */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-1 bg-teal-primary" />

        {/* NOW Badge (horizontal orientation for vertical line) */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
          animate={{ x: [-3, 0, -3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="relative">
            <div
              className="absolute top-1 left-1 w-full h-full bg-charcoal"
              style={{ borderRadius: "2px" }}
            />
            <div
              className="relative flex items-center gap-2 bg-teal-primary border-2 border-teal-primary px-4 py-2"
              style={{ borderRadius: "2px" }}
            >
              <motion.div
                className="w-2 h-2 bg-white"
                style={{ borderRadius: "50%" }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="font-mono text-xs font-bold uppercase tracking-[0.15em] text-white">
                Now
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  if (variant === "badge") {
    return (
      <motion.div
        className={cn("inline-flex", className)}
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="relative">
          <div
            className="absolute top-0.5 left-0.5 w-full h-full bg-charcoal"
            style={{ borderRadius: "2px" }}
          />
          <div
            className="relative flex items-center gap-2 bg-teal-primary border-2 border-charcoal px-3 py-1.5"
            style={{ borderRadius: "2px" }}
          >
            <motion.div
              className="w-2 h-2 bg-white"
              style={{ borderRadius: "50%" }}
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-white">
              Today: {format(now, "MMM d")}
            </span>
          </div>
        </div>
      </motion.div>
    )
  }

  // dot variant
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      {/* Pulse Ring */}
      <motion.div
        className="absolute w-8 h-8 border-2 border-teal-primary"
        style={{ borderRadius: "50%" }}
        animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      {/* Dot */}
      <div
        className="w-4 h-4 bg-teal-primary border-2 border-white shadow-md"
        style={{ borderRadius: "50%" }}
      />
    </div>
  )
}
