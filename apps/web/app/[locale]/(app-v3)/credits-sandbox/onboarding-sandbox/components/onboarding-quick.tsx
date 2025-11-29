"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { FlowIllustration } from "./shared/capsule-illustration"
import { QUICK_BENEFITS } from "./types"
import { X, Check, Lock, Mail, Calendar, ArrowRight, Sparkles } from "lucide-react"

interface OnboardingQuickProps {
  onComplete: () => void
  onSkip: () => void
}

const BENEFIT_ICONS = {
  lock: Lock,
  mail: Mail,
  calendar: Calendar,
}

/**
 * ONBOARDING QUICK - "The Speedrun"
 *
 * Minimal friction, fast to action.
 * For users who want to jump right in.
 *
 * Features:
 * - Single modal view (no steps)
 * - Quick visual of the concept
 * - Essential trust badges
 * - Immediate CTA
 * - Contextual tooltips during first use
 */
export function OnboardingQuick({ onComplete, onSkip }: OnboardingQuickProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className="relative w-full max-w-md bg-cream border-3 border-charcoal shadow-[8px_8px_0_theme(colors.charcoal)]"
      style={{ borderRadius: "2px", borderWidth: "3px" }}
    >
      {/* Close Button */}
      <button
        onClick={onSkip}
        className="absolute top-3 right-3 p-1.5 hover:bg-charcoal/5 transition-colors z-10"
        style={{ borderRadius: "2px" }}
      >
        <X className="h-4 w-4 text-charcoal/40" />
      </button>

      {/* Content */}
      <div className="p-6 md:p-8">
        {/* Logo / Brand Mark */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-6"
        >
          <div
            className="w-10 h-10 bg-duck-yellow border-2 border-charcoal flex items-center justify-center shadow-[2px_2px_0_theme(colors.charcoal)]"
            style={{ borderRadius: "2px" }}
          >
            <span className="text-lg">✨</span>
          </div>
          <div>
            <h2 className="font-mono text-lg font-bold uppercase tracking-wide text-charcoal">
              Capsule Note
            </h2>
            <p className="font-mono text-[10px] text-charcoal/50 uppercase tracking-wider">
              Letters to your future self
            </p>
          </div>
        </motion.div>

        {/* Hero Visual - The Flow */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div
            className="bg-white border-2 border-charcoal p-4 shadow-[3px_3px_0_theme(colors.charcoal)]"
            style={{ borderRadius: "2px" }}
          >
            <FlowIllustration className="scale-90" />

            {/* Simple tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center font-mono text-xs text-charcoal/60 mt-4 pt-4 border-t border-dashed border-charcoal/10"
            >
              Write now. Receive later. It&apos;s that simple.
            </motion.p>
          </div>
        </motion.div>

        {/* Quick Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2 mb-6"
        >
          {QUICK_BENEFITS.map((benefit, index) => {
            const Icon = BENEFIT_ICONS[benefit.icon as keyof typeof BENEFIT_ICONS]
            return (
              <motion.div
                key={benefit.icon}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div
                  className="w-6 h-6 bg-teal-primary/10 border border-teal-primary/30 flex items-center justify-center"
                  style={{ borderRadius: "2px" }}
                >
                  <Check className="h-3.5 w-3.5 text-teal-primary" strokeWidth={2.5} />
                </div>
                <span className="font-mono text-xs text-charcoal/70">
                  {benefit.text}
                </span>
              </motion.div>
            )
          })}
        </motion.div>

        {/* CTA Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={onComplete}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "w-full flex items-center justify-center gap-2 border-2 border-charcoal bg-teal-primary text-white px-6 py-3 font-mono text-sm font-bold uppercase tracking-wider",
            "shadow-[4px_4px_0_theme(colors.charcoal)]",
            "hover:shadow-[6px_6px_0_theme(colors.charcoal)]",
            "transition-shadow"
          )}
          style={{ borderRadius: "2px" }}
        >
          Write Your First Letter
          <ArrowRight className="h-4 w-4" />
        </motion.button>

        {/* Skip Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-4"
        >
          <button
            onClick={onSkip}
            className="font-mono text-[10px] text-charcoal/40 uppercase tracking-wider hover:text-charcoal/60 transition-colors"
          >
            Maybe later
          </button>
        </motion.div>
      </div>

      {/* Bottom Accent Bar */}
      <div className="h-2 bg-gradient-to-r from-duck-yellow via-teal-primary to-coral" />
    </motion.div>
  )
}

// Variant: Even quicker with tooltip hint
export function OnboardingQuickMinimal({ onComplete, onSkip }: OnboardingQuickProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className="relative w-full max-w-sm bg-cream border-3 border-charcoal shadow-[6px_6px_0_theme(colors.charcoal)]"
      style={{ borderRadius: "2px", borderWidth: "3px" }}
    >
      {/* Close */}
      <button
        onClick={onSkip}
        className="absolute top-2 right-2 p-1 hover:bg-charcoal/5 transition-colors z-10"
        style={{ borderRadius: "2px" }}
      >
        <X className="h-3.5 w-3.5 text-charcoal/40" />
      </button>

      <div className="p-5">
        {/* Icon + Headline */}
        <div className="flex items-start gap-3 mb-4">
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring" }}
            className="w-12 h-12 bg-duck-yellow border-2 border-charcoal flex items-center justify-center shadow-[2px_2px_0_theme(colors.charcoal)]"
            style={{ borderRadius: "2px" }}
          >
            <Sparkles className="h-6 w-6 text-charcoal" />
          </motion.div>

          <div className="flex-1">
            <h3 className="font-mono text-base font-bold uppercase tracking-wide text-charcoal">
              Write to Future You
            </h3>
            <p className="font-mono text-[10px] text-charcoal/50 mt-1">
              Schedule letters for any date. We&apos;ll deliver them to your inbox.
            </p>
          </div>
        </div>

        {/* Mini Visual */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-3 py-4 mb-4 border-y border-dashed border-charcoal/10"
        >
          <div
            className="w-10 h-10 bg-duck-yellow/50 border border-charcoal/30 flex items-center justify-center"
            style={{ borderRadius: "2px" }}
          >
            <span className="text-base">✍️</span>
          </div>
          <motion.div
            animate={{ x: [0, 3, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ArrowRight className="h-4 w-4 text-charcoal/30" />
          </motion.div>
          <div
            className="w-10 h-10 bg-teal-primary/20 border border-charcoal/30 flex items-center justify-center"
            style={{ borderRadius: "2px" }}
          >
            <span className="text-base">💌</span>
          </div>
        </motion.div>

        {/* Quick Trust */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center gap-4 mb-4"
        >
          <div className="flex items-center gap-1">
            <Lock className="h-3 w-3 text-teal-primary" />
            <span className="font-mono text-[9px] text-charcoal/50">Encrypted</span>
          </div>
          <div className="w-1 h-1 bg-charcoal/20" style={{ borderRadius: "50%" }} />
          <div className="flex items-center gap-1">
            <Mail className="h-3 w-3 text-teal-primary" />
            <span className="font-mono text-[9px] text-charcoal/50">Email delivery</span>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={onComplete}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "w-full border-2 border-charcoal bg-teal-primary text-white py-2.5 font-mono text-xs font-bold uppercase tracking-wider",
            "shadow-[3px_3px_0_theme(colors.charcoal)]",
            "hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
            "transition-shadow"
          )}
          style={{ borderRadius: "2px" }}
        >
          Get Started
        </motion.button>
      </div>
    </motion.div>
  )
}
