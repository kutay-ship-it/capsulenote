"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { RITUAL_STEPS, DELIVERY_PRESETS } from "./types"
import { ProgressIndicator } from "./shared/progress-indicator"
import { TrustBadges } from "./shared/trust-badges"
import { CapsuleIllustration, FlowIllustration } from "./shared/capsule-illustration"
import {
  X,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  PenTool,
  Calendar,
  Mail,
  Check,
  Clock,
} from "lucide-react"

interface OnboardingRitualProps {
  onComplete: () => void
  onSkip: () => void
}

/**
 * ONBOARDING RITUAL - "The Time Capsule"
 *
 * A multi-step ceremonial onboarding experience.
 * Each step builds emotional connection and explains the value.
 *
 * Steps:
 * 1. Welcome - Introduce the concept with animated capsule
 * 2. How It Works - Show the write → seal → receive flow
 * 3. Security - Build trust with encryption badges
 * 4. First Capsule - Let user choose delivery timing
 * 5. Ready - Final CTA with celebration
 */
export function OnboardingRitual({ onComplete, onSkip }: OnboardingRitualProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)

  const totalSteps = RITUAL_STEPS.length

  const goNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const stepVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <StepWelcome />
      case 1:
        return <StepHowItWorks />
      case 2:
        return <StepSecurity />
      case 3:
        return (
          <StepFirstCapsule
            selectedPreset={selectedPreset}
            onSelectPreset={setSelectedPreset}
          />
        )
      case 4:
        return <StepReady />
      default:
        return null
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative w-full max-w-2xl bg-cream border-3 border-charcoal shadow-[8px_8px_0_theme(colors.charcoal)]"
      style={{ borderRadius: "2px", borderWidth: "3px" }}
    >
      {/* Header with Progress */}
      <div className="flex items-center justify-between p-4 border-b-2 border-dashed border-charcoal/20">
        <ProgressIndicator
          currentStep={currentStep}
          totalSteps={totalSteps}
          variant="dots"
        />
        <button
          onClick={onSkip}
          className="p-1.5 hover:bg-charcoal/5 transition-colors"
          style={{ borderRadius: "2px" }}
        >
          <X className="h-4 w-4 text-charcoal/40" />
        </button>
      </div>

      {/* Content Area */}
      <div className="relative overflow-hidden" style={{ minHeight: "400px" }}>
        <AnimatePresence mode="wait" custom={currentStep}>
          <motion.div
            key={currentStep}
            custom={currentStep}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="p-6 md:p-8"
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer with Navigation */}
      <div className="flex items-center justify-between p-4 border-t-2 border-dashed border-charcoal/20">
        {/* Back Button */}
        <div>
          {currentStep > 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={goBack}
              className={cn(
                "flex items-center gap-2 border-2 border-charcoal bg-white px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all",
                "hover:-translate-y-0.5 hover:shadow-[3px_3px_0_theme(colors.charcoal)]",
                "shadow-[2px_2px_0_theme(colors.charcoal)]"
              )}
              style={{ borderRadius: "2px" }}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </motion.button>
          )}
        </div>

        {/* Skip Link */}
        <button
          onClick={onSkip}
          className="font-mono text-[10px] text-charcoal/40 uppercase tracking-wider hover:text-charcoal/60 transition-colors"
        >
          Skip for now
        </button>

        {/* Next/Complete Button */}
        <motion.button
          onClick={goNext}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "flex items-center gap-2 border-2 border-charcoal px-6 py-2.5 font-mono text-sm font-bold uppercase tracking-wider transition-all",
            "shadow-[3px_3px_0_theme(colors.charcoal)]",
            "hover:shadow-[5px_5px_0_theme(colors.charcoal)]",
            currentStep === totalSteps - 1
              ? "bg-teal-primary text-white"
              : "bg-duck-yellow text-charcoal"
          )}
          style={{ borderRadius: "2px" }}
        >
          {currentStep === totalSteps - 1 ? (
            <>
              Start Writing
              <Sparkles className="h-4 w-4" />
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}

// Step 1: Welcome
function StepWelcome() {
  return (
    <div className="flex flex-col items-center text-center">
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", delay: 0.1 }}
      >
        <CapsuleIllustration state="closed" size="lg" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="font-mono text-2xl md:text-3xl font-bold uppercase tracking-wide text-charcoal mt-6 mb-3"
      >
        Welcome to Your<br />Time Capsule
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="font-mono text-sm text-charcoal/60 max-w-md leading-relaxed"
      >
        Write letters to your future self. Seal them with a date. Wait.
        Then rediscover your own words when you need them most.
      </motion.p>

      {/* Decorative elements */}
      <motion.div
        className="flex items-center gap-2 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <span className="w-8 h-0.5 bg-charcoal/20" />
        <span className="font-mono text-[10px] text-charcoal/30 uppercase tracking-wider">
          Begin the ritual
        </span>
        <span className="w-8 h-0.5 bg-charcoal/20" />
      </motion.div>
    </div>
  )
}

// Step 2: How It Works
function StepHowItWorks() {
  const steps = [
    { icon: PenTool, label: "Write", description: "Pour your thoughts into a letter", color: "bg-duck-yellow" },
    { icon: Calendar, label: "Seal", description: "Choose when to receive it", color: "bg-duck-blue" },
    { icon: Mail, label: "Receive", description: "Get it via email or mail", color: "bg-teal-primary" },
  ]

  return (
    <div className="flex flex-col items-center text-center">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 bg-charcoal text-white px-3 py-1 mb-6"
        style={{ borderRadius: "2px" }}
      >
        <span className="font-mono text-[10px] uppercase tracking-wider">How It Works</span>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full">
        {steps.map((step, index) => {
          const Icon = step.icon
          return (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.15 }}
              className="relative"
            >
              <div
                className={cn(
                  "border-2 border-charcoal p-4 bg-white shadow-[3px_3px_0_theme(colors.charcoal)]"
                )}
                style={{ borderRadius: "2px" }}
              >
                {/* Step number */}
                <div
                  className="absolute -top-3 -left-3 w-8 h-8 bg-charcoal text-white flex items-center justify-center font-mono text-sm font-bold"
                  style={{ borderRadius: "50%" }}
                >
                  {index + 1}
                </div>

                {/* Icon */}
                <div
                  className={cn(
                    "w-12 h-12 mx-auto flex items-center justify-center border-2 border-charcoal mb-3",
                    step.color
                  )}
                  style={{ borderRadius: "2px" }}
                >
                  <Icon className="h-6 w-6 text-charcoal" strokeWidth={2} />
                </div>

                {/* Label */}
                <h4 className="font-mono text-sm font-bold uppercase tracking-wide text-charcoal mb-1">
                  {step.label}
                </h4>

                {/* Description */}
                <p className="font-mono text-[10px] text-charcoal/50">
                  {step.description}
                </p>
              </div>

              {/* Arrow to next step */}
              {index < steps.length - 1 && (
                <motion.div
                  className="hidden md:block absolute top-1/2 -right-5 -translate-y-1/2 z-10"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.15 }}
                >
                  <ArrowRight className="h-5 w-5 text-charcoal/30" />
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="font-mono text-xs text-charcoal/40 mt-6"
      >
        Simple as that. Your future self will thank you.
      </motion.p>
    </div>
  )
}

// Step 3: Security
function StepSecurity() {
  return (
    <div className="flex flex-col items-center text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-20 h-20 bg-teal-primary/10 border-2 border-teal-primary flex items-center justify-center mb-6"
        style={{ borderRadius: "50%" }}
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-4xl">🔐</span>
        </motion.div>
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal mb-2"
      >
        Your Words Are Safe
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="font-mono text-sm text-charcoal/60 mb-6 max-w-md"
      >
        Every letter is encrypted before it leaves your device.
        Not even we can read what you write.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full"
      >
        <TrustBadges variant="cards" />
      </motion.div>
    </div>
  )
}

// Step 4: First Capsule
function StepFirstCapsule({
  selectedPreset,
  onSelectPreset,
}: {
  selectedPreset: string | null
  onSelectPreset: (id: string) => void
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <motion.h3
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal mb-2"
      >
        Choose Your First Capsule
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="font-mono text-xs text-charcoal/50 mb-6"
      >
        When would you like to receive your first letter?
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        {DELIVERY_PRESETS.map((preset, index) => (
          <motion.button
            key={preset.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
            onClick={() => onSelectPreset(preset.id)}
            className={cn(
              "relative border-2 border-charcoal p-4 text-left transition-all",
              "hover:-translate-y-1 hover:shadow-[5px_5px_0_theme(colors.charcoal)]",
              selectedPreset === preset.id
                ? "bg-duck-yellow shadow-[4px_4px_0_theme(colors.charcoal)]"
                : "bg-white shadow-[3px_3px_0_theme(colors.charcoal)]"
            )}
            style={{ borderRadius: "2px" }}
          >
            {/* Selected checkmark */}
            {selectedPreset === preset.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-teal-primary border-2 border-charcoal flex items-center justify-center"
                style={{ borderRadius: "50%" }}
              >
                <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
              </motion.div>
            )}

            {/* Clock icon */}
            <div
              className={cn(
                "w-10 h-10 flex items-center justify-center border-2 border-charcoal mb-3",
                preset.color === "teal-primary" && "bg-teal-primary/20",
                preset.color === "duck-blue" && "bg-duck-blue/30",
                preset.color === "coral" && "bg-coral/20"
              )}
              style={{ borderRadius: "2px" }}
            >
              <Clock className="h-5 w-5 text-charcoal" strokeWidth={2} />
            </div>

            {/* Label */}
            <h4 className="font-mono text-sm font-bold uppercase tracking-wide text-charcoal mb-1">
              {preset.label}
            </h4>

            {/* Description */}
            <p className="font-mono text-[10px] text-charcoal/50">
              {preset.description}
            </p>

            {/* Days badge */}
            <div
              className="mt-3 inline-block bg-charcoal/10 px-2 py-0.5 font-mono text-[9px] text-charcoal/60 uppercase"
              style={{ borderRadius: "2px" }}
            >
              {preset.days} {preset.days === 1 ? "day" : "days"}
            </div>
          </motion.button>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="font-mono text-[10px] text-charcoal/40 mt-4"
      >
        Don&apos;t worry, you can choose any date when writing
      </motion.p>
    </div>
  )
}

// Step 5: Ready
function StepReady() {
  return (
    <div className="flex flex-col items-center text-center">
      {/* Celebration Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="relative"
      >
        <CapsuleIllustration state="sealed" size="lg" />

        {/* Confetti-like decorations */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className={cn(
              "absolute w-3 h-3 border border-charcoal",
              i % 3 === 0 && "bg-duck-yellow",
              i % 3 === 1 && "bg-coral",
              i % 3 === 2 && "bg-teal-primary"
            )}
            style={{
              borderRadius: i % 2 === 0 ? "50%" : "2px",
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1, 1, 0],
              opacity: [0, 1, 1, 0],
              y: [-20, 0, 0, 20],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="font-mono text-2xl font-bold uppercase tracking-wide text-charcoal mt-6 mb-2"
      >
        You&apos;re Ready!
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="font-mono text-sm text-charcoal/60 max-w-md mb-4"
      >
        Your first time capsule awaits. What will you tell your future self?
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex items-center gap-2"
      >
        <span className="w-8 h-0.5 bg-teal-primary" />
        <span className="font-mono text-xs text-teal-primary uppercase tracking-wider font-bold">
          Let&apos;s begin
        </span>
        <span className="w-8 h-0.5 bg-teal-primary" />
      </motion.div>
    </div>
  )
}
