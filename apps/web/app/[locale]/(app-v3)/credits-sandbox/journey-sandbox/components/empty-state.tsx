"use client"

import { motion } from "framer-motion"
import { PenLine, Clock, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  variant?: "minimal" | "illustrated"
  className?: string
}

export function EmptyState({ variant = "illustrated", className }: EmptyStateProps) {
  if (variant === "minimal") {
    return (
      <div className={cn("text-center py-16", className)}>
        <p className="font-mono text-sm text-charcoal/60">
          Your journey begins with a single letter.
        </p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("flex flex-col items-center justify-center py-16 px-8", className)}
    >
      {/* Illustration */}
      <div className="relative mb-8">
        {/* Background Circle */}
        <motion.div
          className="absolute inset-0 bg-teal-primary/10"
          style={{ borderRadius: "50%" }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Main Container */}
        <div
          className="relative w-40 h-40 border-4 border-charcoal bg-white flex items-center justify-center shadow-[6px_6px_0_theme(colors.charcoal)]"
          style={{ borderRadius: "2px" }}
        >
          {/* Inner Dashed Border */}
          <div
            className="absolute inset-3 border-2 border-dashed border-charcoal/20"
            style={{ borderRadius: "2px" }}
          />

          {/* Icon */}
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <PenLine className="h-12 w-12 text-charcoal/30" strokeWidth={1.5} />
          </motion.div>

          {/* Floating Sparkle */}
          <motion.div
            className="absolute -top-3 -right-3"
            animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div
              className="bg-duck-yellow border-2 border-charcoal p-1.5 shadow-[2px_2px_0_theme(colors.charcoal)]"
              style={{ borderRadius: "2px" }}
            >
              <Sparkles className="h-4 w-4 text-charcoal" strokeWidth={2} />
            </div>
          </motion.div>

          {/* Floating Clock */}
          <motion.div
            className="absolute -bottom-3 -left-3"
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
          >
            <div
              className="bg-duck-blue border-2 border-charcoal p-1.5 shadow-[2px_2px_0_theme(colors.charcoal)]"
              style={{ borderRadius: "2px" }}
            >
              <Clock className="h-4 w-4 text-charcoal" strokeWidth={2} />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Text */}
      <div className="text-center space-y-4 max-w-sm">
        <h3 className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal">
          Your Journey Awaits
        </h3>
        <p className="font-mono text-sm text-charcoal/60 leading-relaxed">
          Write a letter to your future self and watch your personal timeline come to life.
          Every word you write today becomes a gift you'll receive tomorrow.
        </p>

        {/* Dashed Separator */}
        <div className="w-24 mx-auto border-t-2 border-dashed border-charcoal/20" />

        {/* CTA Hint */}
        <p className="font-mono text-xs text-charcoal/40 uppercase tracking-wider">
          Begin with a single letter
        </p>
      </div>
    </motion.div>
  )
}
