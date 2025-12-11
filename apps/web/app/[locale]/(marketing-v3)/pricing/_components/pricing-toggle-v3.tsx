"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface PricingToggleV3Props {
  isYearly: boolean
  onToggle: () => void
  monthlyLabel?: string
  yearlyLabel?: string
  savingsLabel?: string
}

export function PricingToggleV3({
  isYearly,
  onToggle,
  monthlyLabel = "MONTHLY",
  yearlyLabel = "YEARLY",
  savingsLabel = "SAVE 40%",
}: PricingToggleV3Props) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
      {/* Monthly Label */}
      <span
        className={cn(
          "font-mono text-xs sm:text-sm uppercase tracking-wider transition-colors duration-200",
          !isYearly ? "text-charcoal font-bold" : "text-charcoal/50"
        )}
      >
        {monthlyLabel}
      </span>

      {/* Toggle Switch - Responsive sizing */}
      <button
        onClick={onToggle}
        className={cn(
          "relative h-10 w-[72px] sm:h-[52px] sm:w-[100px] border-2 border-charcoal bg-off-white",
          "transition-colors duration-200 cursor-pointer",
          "hover:bg-cream",
          "focus:outline-none focus:ring-2 focus:ring-duck-blue focus:ring-offset-2"
        )}
        style={{ borderRadius: "2px" }}
        aria-label={isYearly ? "Switch to monthly billing" : "Switch to yearly billing"}
      >
        {/* Track Pattern */}
        <div className="absolute inset-0 flex items-center justify-between px-1.5 sm:px-2">
          <div className={cn(
            "h-1.5 w-1.5 sm:h-2 sm:w-2 border border-charcoal/30 transition-opacity",
            !isYearly ? "opacity-0" : "opacity-100"
          )} style={{ borderRadius: "2px" }} />
          <div className={cn(
            "h-1.5 w-1.5 sm:h-2 sm:w-2 border border-charcoal/30 transition-opacity",
            isYearly ? "opacity-0" : "opacity-100"
          )} style={{ borderRadius: "2px" }} />
        </div>

        {/* Animated Knob - Responsive sizing */}
        <motion.div
          className={cn(
            "absolute top-1 h-[30px] w-[32px] sm:h-[42px] sm:w-[46px] border-2 border-charcoal",
            isYearly ? "bg-duck-blue" : "bg-duck-yellow"
          )}
          style={{ borderRadius: "2px" }}
          animate={{
            x: isYearly ? 34 : 4,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        >
          {/* Knob Inner Detail */}
          <div className="flex h-full items-center justify-center">
            <div className="flex gap-0.5">
              <div className="h-3.5 sm:h-5 w-0.5 bg-charcoal/30" />
              <div className="h-3.5 sm:h-5 w-0.5 bg-charcoal/30" />
              <div className="h-3.5 sm:h-5 w-0.5 bg-charcoal/30" />
            </div>
          </div>
        </motion.div>
      </button>

      {/* Yearly Label with Savings Badge */}
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "font-mono text-xs sm:text-sm uppercase tracking-wider transition-colors duration-200",
            isYearly ? "text-charcoal font-bold" : "text-charcoal/50"
          )}
        >
          {yearlyLabel}
        </span>

        {/* Animated Savings Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
          animate={{
            scale: isYearly ? 1 : 0.9,
            opacity: isYearly ? 1 : 0.5,
            rotate: isYearly ? 0 : -5,
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
          }}
          className={cn(
            "px-1.5 sm:px-2 py-0.5 sm:py-1 border-2 border-charcoal bg-teal-primary",
            "font-mono text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-white",
            "shadow-[2px_2px_0_theme(colors.charcoal)]"
          )}
          style={{ borderRadius: "2px" }}
        >
          {savingsLabel}
        </motion.div>
      </div>
    </div>
  )
}
