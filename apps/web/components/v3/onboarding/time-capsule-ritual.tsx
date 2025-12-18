"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { useRouter } from "@/i18n/routing"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { ONBOARDING_STEPS } from "./types"
import { ProgressIndicator } from "./shared/progress-indicator"
import { TrustBadges } from "./shared/trust-badges"
import { CapsuleIllustration } from "./shared/capsule-illustration"
import {
  X,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  PenTool,
  Calendar,
  Mail,
} from "lucide-react"

interface TimeCapsuleRitualProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

/**
 * TIME CAPSULE RITUAL - V3 Onboarding Modal
 *
 * A 4-step ceremonial onboarding experience:
 * 1. Welcome - Animated capsule + emotional hook
 * 2. How It Works - Write → Seal → Receive flow
 * 3. Security - Trust badges for privacy assurance
 * 4. Ready - Celebration + CTAs
 */
export function TimeCapsuleRitual({
  isOpen,
  onClose,
  onComplete,
}: TimeCapsuleRitualProps) {
  const router = useRouter()
  const t = useTranslations("onboarding.v3")
  const [currentStep, setCurrentStep] = useState(0)

  const totalSteps = ONBOARDING_STEPS.length

  const goNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStartWriting = () => {
    onComplete()
    router.push("/letters/new")
  }

  const handleExplore = () => {
    onComplete()
  }

  const handleSkip = () => {
    onClose()
  }

  const stepVariants = {
    enter: { x: 100, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 },
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleSkip()}>
      <DialogContent
        className="max-w-2xl p-0 border-3 border-charcoal bg-cream shadow-[4px_4px_0_theme(colors.charcoal)] sm:shadow-[6px_6px_0_theme(colors.charcoal)] md:shadow-[8px_8px_0_theme(colors.charcoal)] overflow-hidden flex flex-col max-h-[calc(100dvh-2rem)]"
        style={{ borderRadius: "2px", borderWidth: "3px" }}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        {/* Hidden title for accessibility */}
        <DialogTitle className="sr-only">{t("title")}</DialogTitle>
        <DialogDescription className="sr-only">{t("description")}</DialogDescription>

        {/* Header with Progress */}
        <div className="flex items-center justify-between p-4 border-b-2 border-dashed border-charcoal/20">
          <ProgressIndicator
            currentStep={currentStep}
            totalSteps={totalSteps}
          />
          <button
            onClick={handleSkip}
            className="p-1.5 hover:bg-charcoal/5 transition-colors"
            style={{ borderRadius: "2px" }}
            aria-label={t("skip")}
          >
            <X className="h-4 w-4 text-charcoal/40" />
          </button>
        </div>

        {/* Content Area - flexible height for mobile */}
        <div className="relative overflow-hidden min-h-0 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="p-4 sm:p-6 md:p-8"
            >
              {currentStep === 0 && <StepWelcome t={t} />}
              {currentStep === 1 && <StepHowItWorks t={t} />}
              {currentStep === 2 && <StepSecurity t={t} />}
              {currentStep === 3 && <StepReady t={t} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer with Navigation - responsive layout */}
        <div className="flex flex-col gap-3 p-3 sm:p-4 border-t-2 border-dashed border-charcoal/20 sm:flex-row sm:items-center sm:justify-between shrink-0">
          {/* Mobile: Skip at top, Desktop: Back button */}
          <div className="flex items-center justify-between sm:justify-start">
            {/* Back Button - hidden on first/last step */}
            {currentStep > 0 && currentStep < totalSteps - 1 ? (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={goBack}
                className={cn(
                  "flex items-center gap-1.5 sm:gap-2 border-2 border-charcoal bg-white px-3 sm:px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all",
                  "hover:-translate-y-0.5 hover:shadow-[3px_3px_0_theme(colors.charcoal)]",
                  "shadow-[2px_2px_0_theme(colors.charcoal)]"
                )}
                style={{ borderRadius: "2px" }}
              >
                <ArrowLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden sm:inline">{t("navigation.back")}</span>
              </motion.button>
            ) : (
              <div className="w-0 sm:w-auto" />
            )}

            {/* Skip Link - visible on mobile, centered on desktop */}
            <button
              onClick={handleSkip}
              className="font-mono text-[10px] text-charcoal/40 uppercase tracking-wider hover:text-charcoal/60 transition-colors sm:hidden"
            >
              {t("navigation.skip")}
            </button>
          </div>

          {/* Skip Link - desktop only, centered */}
          <button
            onClick={handleSkip}
            className="hidden sm:block font-mono text-[10px] text-charcoal/40 uppercase tracking-wider hover:text-charcoal/60 transition-colors"
          >
            {t("navigation.skip")}
          </button>

          {/* Next/Complete Buttons - stack on mobile */}
          {currentStep < totalSteps - 1 ? (
            <motion.button
              onClick={goNext}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "flex items-center justify-center gap-2 border-2 border-charcoal bg-duck-yellow px-4 sm:px-6 py-2.5 font-mono text-sm font-bold uppercase tracking-wider transition-all w-full sm:w-auto",
                "shadow-[2px_2px_0_theme(colors.charcoal)] sm:shadow-[3px_3px_0_theme(colors.charcoal)]",
                "hover:shadow-[3px_3px_0_theme(colors.charcoal)] sm:hover:shadow-[5px_5px_0_theme(colors.charcoal)]"
              )}
              style={{ borderRadius: "2px" }}
            >
              {t("navigation.continue")}
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 w-full sm:w-auto">
              <motion.button
                onClick={handleExplore}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center justify-center gap-2 border-2 border-charcoal bg-white px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition-all w-full sm:w-auto order-2 sm:order-1",
                  "shadow-[2px_2px_0_theme(colors.charcoal)]",
                  "hover:shadow-[3px_3px_0_theme(colors.charcoal)] sm:hover:shadow-[4px_4px_0_theme(colors.charcoal)]"
                )}
                style={{ borderRadius: "2px" }}
              >
                {t("ready.explore")}
              </motion.button>
              <motion.button
                onClick={handleStartWriting}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center justify-center gap-2 border-2 border-charcoal bg-teal-primary text-white px-4 sm:px-6 py-2.5 font-mono text-sm font-bold uppercase tracking-wider transition-all w-full sm:w-auto order-1 sm:order-2",
                  "shadow-[2px_2px_0_theme(colors.charcoal)] sm:shadow-[3px_3px_0_theme(colors.charcoal)]",
                  "hover:shadow-[3px_3px_0_theme(colors.charcoal)] sm:hover:shadow-[5px_5px_0_theme(colors.charcoal)]"
                )}
                style={{ borderRadius: "2px" }}
              >
                {t("ready.startWriting")}
                <Sparkles className="h-4 w-4" />
              </motion.button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Step 1: Welcome
function StepWelcome({ t }: { t: (key: string) => string }) {
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
        className="font-mono text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-wide text-charcoal mt-4 sm:mt-6 mb-2 sm:mb-3"
      >
        {t("welcome.title")}
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="font-mono text-sm text-charcoal/60 max-w-md leading-relaxed"
      >
        {t("welcome.description")}
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
          {t("welcome.tagline")}
        </span>
        <span className="w-8 h-0.5 bg-charcoal/20" />
      </motion.div>
    </div>
  )
}

// Step 2: How It Works
function StepHowItWorks({ t }: { t: (key: string) => string }) {
  const steps = [
    { icon: PenTool, labelKey: "howItWorks.write", descKey: "howItWorks.writeDesc", color: "bg-duck-yellow" },
    { icon: Calendar, labelKey: "howItWorks.seal", descKey: "howItWorks.sealDesc", color: "bg-duck-blue" },
    { icon: Mail, labelKey: "howItWorks.receive", descKey: "howItWorks.receiveDesc", color: "bg-teal-primary" },
  ]

  return (
    <div className="flex flex-col items-center text-center">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 bg-charcoal text-white px-3 py-1 mb-6"
        style={{ borderRadius: "2px" }}
      >
        <span className="font-mono text-[10px] uppercase tracking-wider">
          {t("howItWorks.badge")}
        </span>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 w-full">
        {steps.map((step, index) => {
          const Icon = step.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.15 }}
              className="relative"
            >
              <div
                className="border-2 border-charcoal p-3 sm:p-4 bg-white shadow-[2px_2px_0_theme(colors.charcoal)] sm:shadow-[3px_3px_0_theme(colors.charcoal)]"
                style={{ borderRadius: "2px" }}
              >
                {/* Step number */}
                <div
                  className="absolute -top-2 -left-2 sm:-top-3 sm:-left-3 w-6 h-6 sm:w-8 sm:h-8 bg-charcoal text-white flex items-center justify-center font-mono text-xs sm:text-sm font-bold"
                  style={{ borderRadius: "50%" }}
                >
                  {index + 1}
                </div>

                {/* Icon */}
                <div
                  className={cn(
                    "w-10 h-10 sm:w-12 sm:h-12 mx-auto flex items-center justify-center border-2 border-charcoal mb-2 sm:mb-3",
                    step.color
                  )}
                  style={{ borderRadius: "2px" }}
                >
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-charcoal" strokeWidth={2} />
                </div>

                {/* Label */}
                <h4 className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wide text-charcoal mb-1">
                  {t(step.labelKey)}
                </h4>

                {/* Description */}
                <p className="font-mono text-[9px] sm:text-[10px] text-charcoal/50">
                  {t(step.descKey)}
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
        {t("howItWorks.tagline")}
      </motion.p>
    </div>
  )
}

// Step 3: Security
function StepSecurity({ t }: { t: (key: string) => string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-16 h-16 sm:w-20 sm:h-20 bg-teal-primary/10 border-2 border-teal-primary flex items-center justify-center mb-4 sm:mb-6"
        style={{ borderRadius: "50%" }}
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-2xl sm:text-4xl">🔐</span>
        </motion.div>
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-mono text-lg sm:text-xl font-bold uppercase tracking-wide text-charcoal mb-2"
      >
        {t("security.title")}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="font-mono text-sm text-charcoal/60 mb-6 max-w-md"
      >
        {t("security.description")}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full"
      >
        <TrustBadges />
      </motion.div>
    </div>
  )
}

// Step 4: Ready
function StepReady({ t }: { t: (key: string) => string }) {
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
              top: `${20 + (i * 15)}%`,
              left: `${-10 + (i * 25)}%`,
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
        className="font-mono text-xl sm:text-2xl font-bold uppercase tracking-wide text-charcoal mt-4 sm:mt-6 mb-2"
      >
        {t("ready.title")}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="font-mono text-sm text-charcoal/60 max-w-md mb-4"
      >
        {t("ready.description")}
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex items-center gap-2"
      >
        <span className="w-8 h-0.5 bg-teal-primary" />
        <span className="font-mono text-xs text-teal-primary uppercase tracking-wider font-bold">
          {t("ready.tagline")}
        </span>
        <span className="w-8 h-0.5 bg-teal-primary" />
      </motion.div>
    </div>
  )
}
