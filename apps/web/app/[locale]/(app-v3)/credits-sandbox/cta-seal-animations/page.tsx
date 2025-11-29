"use client"

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion"
import {
  Mail,
  Stamp,
  Lock,
  Shield,
  Check,
  Sparkles,
  Clock,
  Calendar,
  FileText,
  ArrowRight,
  Play,
  RotateCcw,
  Flame,
  Timer,
  Fingerprint,
  Server,
  MapPin,
  Flag,
  Compass,
  X,
  ChevronRight,
  Heart,
  Zap,
  Eye,
  Archive,
  Send,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// =============================================================================
// TYPES
// =============================================================================

type AnimationVariation =
  | "postbox"    // V1: The Postbox Ceremony (user's specification)
  | "wax"        // V2: The Waxing Ceremony
  | "time"       // V3: The Time Machine
  | "vault"      // V4: The Vault Sequence
  | "journey"    // V5: The Journey Map (frontend-design inspired)

type PostboxStage = "creating" | "sealing" | "preparing" | "encrypting" | "checking" | "complete"
type WaxStage = "folding" | "melting" | "stamping" | "cooling" | "inspecting" | "complete"
type TimeStage = "capturing" | "warping" | "encapsulating" | "launching" | "arriving" | "complete"
type VaultStage = "scanning" | "compressing" | "encrypting" | "opening" | "storing" | "complete"
type JourneyStage = "starting" | "drawing" | "milestones" | "destination" | "complete"

// =============================================================================
// SHARED COMPONENTS
// =============================================================================

// Brutalist confetti from existing components
const CONFETTI_COLORS = [
  "#3D9A8B", // teal-primary
  "#FFD93D", // duck-yellow
  "#6FC2FF", // duck-blue
  "#FF6B6B", // coral
  "#383838", // charcoal
]

function BrutalistConfetti({ count = 50 }: { count?: number }) {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
      {Array.from({ length: count }).map((_, i) => {
        const isSquare = Math.random() > 0.3
        const size = 10 + Math.random() * 16
        return (
          <motion.div
            key={i}
            initial={{
              opacity: 1,
              x: "50vw",
              y: "50vh",
              scale: 0,
              rotate: 0,
            }}
            animate={{
              opacity: [1, 1, 0],
              x: `${15 + Math.random() * 70}vw`,
              y: `${Math.random() * 100}vh`,
              scale: [0, 1.2, 0.9],
              rotate: Math.random() * 720 - 360,
            }}
            transition={{
              duration: 1.8 + Math.random() * 0.8,
              ease: "easeOut",
              delay: Math.random() * 0.4,
            }}
            className="absolute"
            style={{
              width: size,
              height: size,
              backgroundColor: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
              borderRadius: isSquare ? "2px" : "50%",
              border: isSquare ? "2px solid #383838" : "none",
            }}
          />
        )
      })}
    </div>
  )
}

// Animated progress bar
function AnimatedProgress({
  progress,
  className
}: {
  progress: number
  className?: string
}) {
  return (
    <div
      className={cn(
        "w-full h-3 border-2 border-charcoal bg-white overflow-hidden",
        className
      )}
      style={{ borderRadius: "2px" }}
    >
      <motion.div
        className="h-full bg-teal-primary"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  )
}

// Stage indicator with icon and text
function StageIndicator({
  icon: Icon,
  text,
  subtext,
  color = "duck-yellow",
}: {
  icon: React.ElementType
  text: string
  subtext?: string
  color?: "duck-yellow" | "duck-blue" | "teal-primary" | "coral"
}) {
  const bgColors = {
    "duck-yellow": "bg-duck-yellow",
    "duck-blue": "bg-duck-blue",
    "teal-primary": "bg-teal-primary",
    "coral": "bg-coral",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center gap-4"
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className={cn(
          "flex h-20 w-20 items-center justify-center border-4 border-charcoal shadow-[4px_4px_0_theme(colors.charcoal)]",
          bgColors[color]
        )}
        style={{ borderRadius: "50%" }}
      >
        <Icon className={cn(
          "h-10 w-10",
          color === "teal-primary" || color === "coral" ? "text-white" : "text-charcoal"
        )} strokeWidth={1.5} />
      </motion.div>
      <div className="text-center">
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal"
        >
          {text}
        </motion.h3>
        {subtext && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="font-mono text-xs text-charcoal/60 uppercase tracking-wider mt-1"
          >
            {subtext}
          </motion.p>
        )}
      </div>
    </motion.div>
  )
}

// Base modal wrapper
function SealModal({
  open,
  onClose,
  children,
  showCloseButton = false,
}: {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  showCloseButton?: boolean
}) {
  if (!open) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-charcoal/80 backdrop-blur-sm"
        onClick={showCloseButton ? onClose : undefined}
      />

      {/* Modal Content */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", bounce: 0.3 }}
        className="relative w-full max-w-lg border-4 border-charcoal bg-white overflow-hidden"
        style={{
          borderRadius: "2px",
          boxShadow: "8px 8px 0px 0px rgb(56, 56, 56)",
        }}
      >
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 border-2 border-charcoal bg-white hover:bg-duck-cream transition-colors"
            style={{ borderRadius: "2px" }}
          >
            <X className="h-4 w-4 text-charcoal" strokeWidth={2} />
          </button>
        )}
        {children}
      </motion.div>
    </motion.div>
  )
}

// CTA Button for final stage
function FinalCTA({
  onClick,
  text = "Continue to Sign Up",
}: {
  onClick: () => void
  text?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Button
        onClick={onClick}
        className="w-full gap-2 h-14 bg-teal-primary hover:bg-teal-primary/90 text-white font-mono text-sm uppercase tracking-wider border-4 border-charcoal shadow-[6px_6px_0_theme(colors.charcoal)] hover:shadow-[8px_8px_0_theme(colors.charcoal)] hover:-translate-y-1 transition-all"
        style={{ borderRadius: "2px" }}
      >
        {text}
        <ArrowRight className="h-5 w-5" strokeWidth={2} />
      </Button>
    </motion.div>
  )
}

// =============================================================================
// VARIATION 1: THE POSTBOX CEREMONY (User's Specification)
// =============================================================================

function PostboxCeremony({
  open,
  onComplete,
}: {
  open: boolean
  onComplete: () => void
}) {
  const [stage, setStage] = useState<PostboxStage>("creating")
  const [progress, setProgress] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)

  const stages: { key: PostboxStage; duration: number; progress: number }[] = [
    { key: "creating", duration: 1500, progress: 16 },
    { key: "sealing", duration: 1500, progress: 33 },
    { key: "preparing", duration: 1500, progress: 50 },
    { key: "encrypting", duration: 1500, progress: 75 },
    { key: "checking", duration: 1500, progress: 95 },
    { key: "complete", duration: 0, progress: 100 },
  ]

  useEffect(() => {
    if (!open) {
      setStage("creating")
      setProgress(0)
      setShowConfetti(false)
      return
    }

    let currentIndex = 0
    const runStage = () => {
      if (currentIndex >= stages.length) return

      const currentStage = stages[currentIndex]
      if (!currentStage) return

      setStage(currentStage.key)
      setProgress(currentStage.progress)

      if (currentStage.key === "complete") {
        setShowConfetti(true)
        return
      }

      currentIndex++
      setTimeout(runStage, currentStage.duration)
    }

    runStage()
  }, [open])

  const stageContent = {
    creating: {
      icon: Mail,
      text: "Creating your digital postbox...",
      subtext: "Building a secure container",
      color: "duck-yellow" as const,
    },
    sealing: {
      icon: Stamp,
      text: "Sealing your letter with care...",
      subtext: "Applying the wax seal",
      color: "coral" as const,
    },
    preparing: {
      icon: Heart,
      text: "Preparing your words for future you...",
      subtext: "Adding a touch of magic",
      color: "duck-blue" as const,
    },
    encrypting: {
      icon: Lock,
      text: "Encrypting with AES-256...",
      subtext: "Military-grade protection",
      color: "teal-primary" as const,
    },
    checking: {
      icon: Check,
      text: "Running final checks...",
      subtext: "Almost there",
      color: "duck-yellow" as const,
    },
    complete: {
      icon: Sparkles,
      text: "Your letter is ready!",
      subtext: "Time to create your account",
      color: "teal-primary" as const,
    },
  }

  const current = stageContent[stage]

  return (
    <SealModal open={open} onClose={() => {}}>
      <AnimatePresence>
        {showConfetti && <BrutalistConfetti />}
      </AnimatePresence>

      <div className="p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-charcoal font-mono text-[10px] font-bold uppercase tracking-wider text-white"
            style={{ borderRadius: "2px" }}
          >
            <Mail className="h-3 w-3" strokeWidth={2} />
            Postbox Ceremony
          </div>
        </div>

        {/* Animation Area */}
        <div className="flex flex-col items-center justify-center min-h-[280px]">
          <AnimatePresence mode="wait">
            <StageIndicator
              key={stage}
              icon={current.icon}
              text={current.text}
              subtext={current.subtext}
              color={current.color}
            />
          </AnimatePresence>
        </div>

        {/* Progress */}
        <div className="space-y-3 mb-6">
          <AnimatedProgress progress={progress} />
          <div className="flex justify-between font-mono text-[10px] uppercase tracking-wider text-charcoal/50">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
        </div>

        {/* Checklist for checking stage */}
        {stage === "checking" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border-2 border-charcoal bg-duck-cream p-4 mb-6 space-y-2"
            style={{ borderRadius: "2px" }}
          >
            {[
              { text: "Letter content verified", delay: 0 },
              { text: "Encryption applied", delay: 0.3 },
              { text: "Delivery date locked", delay: 0.6 },
              { text: "Recipient confirmed", delay: 0.9 },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: item.delay }}
                className="flex items-center gap-2"
              >
                <div
                  className="flex h-5 w-5 items-center justify-center border-2 border-charcoal bg-teal-primary"
                  style={{ borderRadius: "2px" }}
                >
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </div>
                <span className="font-mono text-xs text-charcoal">{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* CTA for complete stage */}
        {stage === "complete" && (
          <FinalCTA onClick={onComplete} />
        )}
      </div>
    </SealModal>
  )
}

// =============================================================================
// VARIATION 2: THE WAXING CEREMONY
// =============================================================================

function WaxingCeremony({
  open,
  onComplete,
}: {
  open: boolean
  onComplete: () => void
}) {
  const [stage, setStage] = useState<WaxStage>("folding")
  const [progress, setProgress] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)

  const stages: { key: WaxStage; duration: number; progress: number }[] = [
    { key: "folding", duration: 1500, progress: 16 },
    { key: "melting", duration: 2000, progress: 40 },
    { key: "stamping", duration: 1500, progress: 60 },
    { key: "cooling", duration: 1000, progress: 80 },
    { key: "inspecting", duration: 1000, progress: 95 },
    { key: "complete", duration: 0, progress: 100 },
  ]

  useEffect(() => {
    if (!open) {
      setStage("folding")
      setProgress(0)
      setShowConfetti(false)
      return
    }

    let currentIndex = 0
    const runStage = () => {
      if (currentIndex >= stages.length) return
      const currentStage = stages[currentIndex]
      if (!currentStage) return

      setStage(currentStage.key)
      setProgress(currentStage.progress)
      if (currentStage.key === "complete") {
        setShowConfetti(true)
        return
      }
      currentIndex++
      setTimeout(runStage, currentStage.duration)
    }
    runStage()
  }, [open])

  return (
    <SealModal open={open} onClose={() => {}}>
      <AnimatePresence>
        {showConfetti && <BrutalistConfetti />}
      </AnimatePresence>

      {/* Parchment texture background */}
      <div className="absolute inset-0 bg-duck-cream opacity-50" />

      <div className="relative p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-coral font-mono text-[10px] font-bold uppercase tracking-wider text-white"
            style={{ borderRadius: "2px" }}
          >
            <Flame className="h-3 w-3" strokeWidth={2} />
            Waxing Ceremony
          </div>
        </div>

        {/* Animation Area */}
        <div className="flex flex-col items-center justify-center min-h-[280px]">
          <AnimatePresence mode="wait">
            {stage === "folding" && (
              <motion.div
                key="folding"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                {/* Folding envelope animation */}
                <motion.div
                  animate={{
                    rotateX: [0, 180, 180, 0],
                    scaleY: [1, 0.5, 0.5, 1],
                  }}
                  transition={{ duration: 1.2, times: [0, 0.4, 0.6, 1] }}
                  className="relative w-32 h-24 border-4 border-charcoal bg-white shadow-[4px_4px_0_theme(colors.charcoal)]"
                  style={{ borderRadius: "2px" }}
                >
                  <div className="absolute inset-2 border-2 border-dashed border-charcoal/20" style={{ borderRadius: "2px" }} />
                  <FileText className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-charcoal/30" />
                </motion.div>
                <p className="font-mono text-lg font-bold uppercase tracking-wide text-charcoal">
                  Folding your letter...
                </p>
              </motion.div>
            )}

            {stage === "melting" && (
              <motion.div
                key="melting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                {/* Melting wax animation */}
                <div className="relative">
                  <motion.div
                    className="w-32 h-24 border-4 border-charcoal bg-white shadow-[4px_4px_0_theme(colors.charcoal)]"
                    style={{ borderRadius: "2px" }}
                  />
                  {/* Wax drips */}
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ y: -20, opacity: 0, scaleY: 0 }}
                      animate={{
                        y: [0, 30, 40],
                        opacity: [0, 1, 1],
                        scaleY: [0.5, 1, 1.5],
                      }}
                      transition={{
                        duration: 1.5,
                        delay: i * 0.3,
                        ease: "easeIn",
                      }}
                      className="absolute top-1/2 bg-coral border-2 border-charcoal"
                      style={{
                        left: `${30 + i * 20}%`,
                        width: 16,
                        height: 24,
                        borderRadius: "0 0 8px 8px",
                      }}
                    />
                  ))}
                </div>
                <p className="font-mono text-lg font-bold uppercase tracking-wide text-charcoal">
                  Preparing the seal...
                </p>
                <p className="font-mono text-xs text-charcoal/60 uppercase tracking-wider">
                  Melting premium wax
                </p>
              </motion.div>
            )}

            {stage === "stamping" && (
              <motion.div
                key="stamping"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                {/* Stamp pressing animation */}
                <div className="relative">
                  <div
                    className="w-32 h-24 border-4 border-charcoal bg-white shadow-[4px_4px_0_theme(colors.charcoal)]"
                    style={{ borderRadius: "2px" }}
                  />
                  {/* Wax pool */}
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-12 bg-coral border-2 border-charcoal"
                    style={{ borderRadius: "50%" }}
                  />
                  {/* Stamp coming down */}
                  <motion.div
                    initial={{ y: -60, scale: 1.2 }}
                    animate={{
                      y: [-60, 0, -5, 0],
                      scale: [1.2, 1, 1.05, 1],
                    }}
                    transition={{
                      duration: 0.8,
                      times: [0, 0.5, 0.7, 1],
                      ease: "easeOut",
                    }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-coral border-4 border-charcoal flex items-center justify-center shadow-[4px_4px_0_theme(colors.charcoal)]"
                    style={{ borderRadius: "50%" }}
                  >
                    <Stamp className="h-7 w-7 text-white" strokeWidth={1.5} />
                  </motion.div>
                </div>
                <p className="font-mono text-lg font-bold uppercase tracking-wide text-charcoal">
                  Pressing the seal...
                </p>
              </motion.div>
            )}

            {stage === "cooling" && (
              <motion.div
                key="cooling"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                {/* Cooling seal with shimmer */}
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(255, 107, 107, 0.4)",
                      "0 0 20px 10px rgba(255, 107, 107, 0.2)",
                      "0 0 0 0 rgba(255, 107, 107, 0)",
                    ],
                  }}
                  transition={{ duration: 0.8, repeat: 1 }}
                  className="w-14 h-14 bg-coral border-4 border-charcoal flex items-center justify-center"
                  style={{ borderRadius: "50%" }}
                >
                  <Stamp className="h-7 w-7 text-white" strokeWidth={1.5} />
                </motion.div>
                <p className="font-mono text-lg font-bold uppercase tracking-wide text-charcoal">
                  Letting it set...
                </p>
              </motion.div>
            )}

            {stage === "inspecting" && (
              <motion.div
                key="inspecting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                {/* Seal with check overlay */}
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: [0.8, 1.1, 1] }}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  <div
                    className="w-20 h-20 bg-coral border-4 border-charcoal flex items-center justify-center shadow-[4px_4px_0_theme(colors.charcoal)]"
                    style={{ borderRadius: "50%" }}
                  >
                    <Stamp className="h-10 w-10 text-white" strokeWidth={1.5} />
                  </div>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-teal-primary border-2 border-charcoal flex items-center justify-center"
                    style={{ borderRadius: "50%" }}
                  >
                    <Check className="h-4 w-4 text-white" strokeWidth={3} />
                  </motion.div>
                </motion.div>
                <p className="font-mono text-lg font-bold uppercase tracking-wide text-charcoal">
                  Perfect seal achieved
                </p>
              </motion.div>
            )}

            {stage === "complete" && (
              <motion.div
                key="complete"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <motion.div
                  initial={{ y: 0 }}
                  animate={{ y: [-5, 0, -5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="relative w-32 h-24 border-4 border-charcoal bg-white shadow-[6px_6px_0_theme(colors.charcoal)]"
                  style={{ borderRadius: "2px" }}
                >
                  <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-coral border-4 border-charcoal flex items-center justify-center shadow-[2px_2px_0_theme(colors.charcoal)]"
                    style={{ borderRadius: "50%" }}
                  >
                    <Stamp className="h-7 w-7 text-white" strokeWidth={1.5} />
                  </div>
                </motion.div>
                <p className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal">
                  Your letter awaits its journey
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress */}
        <div className="space-y-3 mb-6">
          <AnimatedProgress progress={progress} />
        </div>

        {stage === "complete" && (
          <FinalCTA onClick={onComplete} text="Create Your Account" />
        )}
      </div>
    </SealModal>
  )
}

// =============================================================================
// VARIATION 3: THE TIME MACHINE
// =============================================================================

function TimeMachine({
  open,
  onComplete,
  deliveryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year default
}: {
  open: boolean
  onComplete: () => void
  deliveryDate?: Date
}) {
  const [stage, setStage] = useState<TimeStage>("capturing")
  const [progress, setProgress] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [countingDate, setCountingDate] = useState(new Date())

  const daysFromNow = Math.ceil((deliveryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  const stages: { key: TimeStage; duration: number; progress: number }[] = [
    { key: "capturing", duration: 1500, progress: 20 },
    { key: "warping", duration: 2000, progress: 45 },
    { key: "encapsulating", duration: 1500, progress: 65 },
    { key: "launching", duration: 1500, progress: 85 },
    { key: "arriving", duration: 1500, progress: 95 },
    { key: "complete", duration: 0, progress: 100 },
  ]

  useEffect(() => {
    if (!open) {
      setStage("capturing")
      setProgress(0)
      setShowConfetti(false)
      setCountingDate(new Date())
      return
    }

    let currentIndex = 0
    const runStage = () => {
      if (currentIndex >= stages.length) return
      const currentStage = stages[currentIndex]
      if (!currentStage) return

      setStage(currentStage.key)
      setProgress(currentStage.progress)
      if (currentStage.key === "complete") {
        setShowConfetti(true)
        return
      }
      currentIndex++
      setTimeout(runStage, currentStage.duration)
    }
    runStage()
  }, [open])

  // Counting animation for warping stage
  useEffect(() => {
    if (stage !== "warping") return
    const start = Date.now()
    const end = deliveryDate.getTime()
    const duration = 1800

    const interval = setInterval(() => {
      const elapsed = Date.now() - (start - (end - start))
      const progress = Math.min(elapsed / duration, 1)
      const currentTime = start + (end - start) * progress
      setCountingDate(new Date(Math.min(currentTime, end)))
    }, 50)

    return () => clearInterval(interval)
  }, [stage, deliveryDate])

  return (
    <SealModal open={open} onClose={() => {}}>
      <AnimatePresence>
        {showConfetti && <BrutalistConfetti />}
      </AnimatePresence>

      {/* Dark starfield background */}
      <div className="absolute inset-0 bg-charcoal">
        {/* Stars */}
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            className="absolute bg-white"
            style={{
              width: 2 + Math.random() * 3,
              height: 2 + Math.random() * 3,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              borderRadius: "50%",
            }}
          />
        ))}
      </div>

      <div className="relative p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-duck-blue font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal"
            style={{ borderRadius: "2px" }}
          >
            <Timer className="h-3 w-3" strokeWidth={2} />
            Time Machine
          </div>
        </div>

        {/* Animation Area */}
        <div className="flex flex-col items-center justify-center min-h-[280px]">
          <AnimatePresence mode="wait">
            {stage === "capturing" && (
              <motion.div
                key="capturing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-20 h-20 border-4 border-duck-yellow bg-white flex items-center justify-center shadow-[4px_4px_0_theme(colors.duck-yellow)]"
                  style={{ borderRadius: "50%" }}
                >
                  <Clock className="h-10 w-10 text-charcoal" strokeWidth={1.5} />
                </motion.div>
                <p className="font-mono text-lg font-bold uppercase tracking-wide text-white">
                  Capturing this moment in time...
                </p>
                <p className="font-mono text-xs text-white/60 uppercase tracking-wider">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}
                </p>
              </motion.div>
            )}

            {stage === "warping" && (
              <motion.div
                key="warping"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                {/* Spinning clock */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.5, ease: "linear" }}
                  className="w-20 h-20 border-4 border-duck-blue bg-white flex items-center justify-center shadow-[4px_4px_0_theme(colors.duck-blue)]"
                  style={{ borderRadius: "50%" }}
                >
                  <Clock className="h-10 w-10 text-charcoal" strokeWidth={1.5} />
                </motion.div>
                <p className="font-mono text-lg font-bold uppercase tracking-wide text-white">
                  Setting temporal coordinates...
                </p>
                <motion.p
                  className="font-mono text-sm text-duck-yellow uppercase tracking-wider"
                >
                  {countingDate.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                  })}
                </motion.p>
              </motion.div>
            )}

            {stage === "encapsulating" && (
              <motion.div
                key="encapsulating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <motion.div
                  initial={{ scale: 1 }}
                  animate={{ scale: [1, 0.8, 0.6] }}
                  transition={{ duration: 1.2 }}
                  className="relative"
                >
                  <div
                    className="w-24 h-20 border-4 border-charcoal bg-white shadow-[4px_4px_0_theme(colors.charcoal)]"
                    style={{ borderRadius: "2px" }}
                  />
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div
                      className="w-12 h-12 border-4 border-teal-primary bg-teal-primary/20 flex items-center justify-center"
                      style={{ borderRadius: "50%" }}
                    >
                      <Sparkles className="h-6 w-6 text-teal-primary" strokeWidth={2} />
                    </div>
                  </motion.div>
                </motion.div>
                <p className="font-mono text-lg font-bold uppercase tracking-wide text-white">
                  Encapsulating your words...
                </p>
              </motion.div>
            )}

            {stage === "launching" && (
              <motion.div
                key="launching"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <motion.div
                  initial={{ y: 0 }}
                  animate={{ y: -100, opacity: [1, 1, 0] }}
                  transition={{ duration: 1.2 }}
                  className="w-12 h-12 border-4 border-teal-primary bg-teal-primary flex items-center justify-center shadow-[4px_4px_0_theme(colors.charcoal)]"
                  style={{ borderRadius: "50%" }}
                >
                  <Sparkles className="h-6 w-6 text-white" strokeWidth={2} />
                </motion.div>
                <p className="font-mono text-lg font-bold uppercase tracking-wide text-white">
                  Launching into the future...
                </p>
                {/* Trail effect */}
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 100, opacity: [0, 1, 0] }}
                  transition={{ duration: 1 }}
                  className="w-1 bg-gradient-to-t from-teal-primary to-transparent"
                />
              </motion.div>
            )}

            {stage === "arriving" && (
              <motion.div
                key="arriving"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5, type: "spring" }}
                  className="w-16 h-16 border-4 border-duck-yellow bg-duck-yellow flex items-center justify-center shadow-[4px_4px_0_theme(colors.charcoal)]"
                  style={{ borderRadius: "50%" }}
                >
                  <Calendar className="h-8 w-8 text-charcoal" strokeWidth={1.5} />
                </motion.div>
                <div className="text-center">
                  <p className="font-mono text-xs text-white/60 uppercase tracking-wider">
                    Destination
                  </p>
                  <p className="font-mono text-xl font-bold uppercase tracking-wide text-duck-yellow">
                    {deliveryDate.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                  <p className="font-mono text-sm text-teal-primary uppercase tracking-wider mt-1">
                    {daysFromNow} days from now
                  </p>
                </div>
              </motion.div>
            )}

            {stage === "complete" && (
              <motion.div
                key="complete"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(111, 194, 255, 0.4)",
                      "0 0 30px 15px rgba(111, 194, 255, 0.2)",
                      "0 0 0 0 rgba(111, 194, 255, 0)",
                    ],
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-20 h-20 border-4 border-teal-primary bg-teal-primary flex items-center justify-center"
                  style={{ borderRadius: "50%" }}
                >
                  <Sparkles className="h-10 w-10 text-white" strokeWidth={1.5} />
                </motion.div>
                <p className="font-mono text-xl font-bold uppercase tracking-wide text-white">
                  Your time capsule is ready!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress */}
        <div className="space-y-3 mb-6">
          <div className="w-full h-3 border-2 border-white/30 bg-white/10 overflow-hidden" style={{ borderRadius: "2px" }}>
            <motion.div
              className="h-full bg-duck-blue"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {stage === "complete" && (
          <FinalCTA onClick={onComplete} text="Activate Time Capsule" />
        )}
      </div>
    </SealModal>
  )
}

// =============================================================================
// VARIATION 4: THE VAULT SEQUENCE
// =============================================================================

function VaultSequence({
  open,
  onComplete,
}: {
  open: boolean
  onComplete: () => void
}) {
  const [stage, setStage] = useState<VaultStage>("scanning")
  const [progress, setProgress] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)

  const stages: { key: VaultStage; duration: number; progress: number }[] = [
    { key: "scanning", duration: 1500, progress: 20 },
    { key: "compressing", duration: 1500, progress: 40 },
    { key: "encrypting", duration: 2000, progress: 65 },
    { key: "opening", duration: 1500, progress: 80 },
    { key: "storing", duration: 1500, progress: 95 },
    { key: "complete", duration: 0, progress: 100 },
  ]

  useEffect(() => {
    if (!open) {
      setStage("scanning")
      setProgress(0)
      setShowConfetti(false)
      return
    }

    let currentIndex = 0
    const runStage = () => {
      if (currentIndex >= stages.length) return
      const currentStage = stages[currentIndex]
      if (!currentStage) return

      setStage(currentStage.key)
      setProgress(currentStage.progress)
      if (currentStage.key === "complete") {
        setShowConfetti(true)
        return
      }
      currentIndex++
      setTimeout(runStage, currentStage.duration)
    }
    runStage()
  }, [open])

  return (
    <SealModal open={open} onClose={() => {}}>
      <AnimatePresence>
        {showConfetti && <BrutalistConfetti />}
      </AnimatePresence>

      {/* Dark metallic background */}
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal to-charcoal/95" />

      <div className="relative p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-teal-primary font-mono text-[10px] font-bold uppercase tracking-wider text-white"
            style={{ borderRadius: "2px" }}
          >
            <Shield className="h-3 w-3" strokeWidth={2} />
            Vault Sequence
          </div>
        </div>

        {/* Animation Area */}
        <div className="flex flex-col items-center justify-center min-h-[280px]">
          <AnimatePresence mode="wait">
            {stage === "scanning" && (
              <motion.div
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="relative w-32 h-24 border-2 border-teal-primary/50 bg-white/5 overflow-hidden" style={{ borderRadius: "2px" }}>
                  {/* Scanning line */}
                  <motion.div
                    initial={{ y: -24 }}
                    animate={{ y: 96 }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                    className="absolute left-0 right-0 h-0.5 bg-teal-primary shadow-[0_0_10px_theme(colors.teal-primary)]"
                  />
                  <FileText className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 text-white/30" />
                </div>
                <p className="font-mono text-lg font-bold uppercase tracking-wide text-white">
                  Scanning your letter...
                </p>
              </motion.div>
            )}

            {stage === "compressing" && (
              <motion.div
                key="compressing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <motion.div
                  initial={{ width: 128, height: 96 }}
                  animate={{ width: 64, height: 48 }}
                  transition={{ duration: 1 }}
                  className="border-2 border-duck-blue bg-white/10 flex items-center justify-center"
                  style={{ borderRadius: "2px" }}
                >
                  <Archive className="h-6 w-6 text-duck-blue" />
                </motion.div>
                <p className="font-mono text-lg font-bold uppercase tracking-wide text-white">
                  Compressing for secure storage...
                </p>
              </motion.div>
            )}

            {stage === "encrypting" && (
              <motion.div
                key="encrypting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="w-20 h-20 border-4 border-teal-primary bg-charcoal flex items-center justify-center"
                  style={{ borderRadius: "50%" }}
                >
                  <Lock className="h-10 w-10 text-teal-primary" strokeWidth={1.5} />
                </motion.div>
                <p className="font-mono text-lg font-bold uppercase tracking-wide text-white">
                  Encrypting with AES-256...
                </p>
                <div
                  className="flex items-center gap-2 px-4 py-2 bg-teal-primary/20 border-2 border-teal-primary"
                  style={{ borderRadius: "2px" }}
                >
                  <Lock className="h-4 w-4 text-teal-primary" />
                  <span className="font-mono text-xs text-teal-primary uppercase tracking-wider">
                    256-bit encryption active
                  </span>
                </div>
              </motion.div>
            )}

            {stage === "opening" && (
              <motion.div
                key="opening"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                {/* Vault door animation */}
                <div className="relative">
                  <motion.div
                    initial={{ rotateY: 0 }}
                    animate={{ rotateY: -90 }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    className="w-24 h-28 border-4 border-white/50 bg-charcoal/80 flex items-center justify-center"
                    style={{
                      borderRadius: "2px",
                      transformOrigin: "left",
                      perspective: 1000,
                    }}
                  >
                    <div
                      className="w-8 h-8 border-4 border-white/50"
                      style={{ borderRadius: "50%" }}
                    />
                  </motion.div>
                  {/* Vault interior */}
                  <div
                    className="absolute inset-0 border-4 border-teal-primary/50 bg-teal-primary/10 -z-10"
                    style={{ borderRadius: "2px" }}
                  />
                </div>
                <p className="font-mono text-lg font-bold uppercase tracking-wide text-white">
                  Opening secure vault...
                </p>
              </motion.div>
            )}

            {stage === "storing" && (
              <motion.div
                key="storing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="relative">
                  {/* Vault */}
                  <div
                    className="w-24 h-28 border-4 border-teal-primary bg-teal-primary/10 flex items-center justify-center"
                    style={{ borderRadius: "2px" }}
                  />
                  {/* Package floating in */}
                  <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 border-2 border-teal-primary bg-teal-primary flex items-center justify-center"
                    style={{ borderRadius: "2px" }}
                  >
                    <Lock className="h-5 w-5 text-white" />
                  </motion.div>
                </div>
                <p className="font-mono text-lg font-bold uppercase tracking-wide text-white">
                  Storing in secure vault...
                </p>
              </motion.div>
            )}

            {stage === "complete" && (
              <motion.div
                key="complete"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="w-20 h-20 border-4 border-teal-primary bg-teal-primary flex items-center justify-center shadow-[0_0_30px_theme(colors.teal-primary/30)]"
                  style={{ borderRadius: "50%" }}
                >
                  <Shield className="h-10 w-10 text-white" strokeWidth={1.5} />
                </motion.div>
                <p className="font-mono text-xl font-bold uppercase tracking-wide text-white">
                  Your letter is protected
                </p>
                {/* Security badges */}
                <div className="flex gap-2">
                  {["AES-256", "Zero-Knowledge", "Encrypted"].map((badge, i) => (
                    <motion.span
                      key={badge}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      className="px-2 py-1 border-2 border-teal-primary/50 bg-teal-primary/20 font-mono text-[10px] uppercase tracking-wider text-teal-primary"
                      style={{ borderRadius: "2px" }}
                    >
                      {badge}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress */}
        <div className="space-y-3 mb-6">
          <div className="w-full h-3 border-2 border-white/30 bg-white/10 overflow-hidden" style={{ borderRadius: "2px" }}>
            <motion.div
              className="h-full bg-teal-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {stage === "complete" && (
          <FinalCTA onClick={onComplete} text="Claim Your Vault" />
        )}
      </div>
    </SealModal>
  )
}

// =============================================================================
// VARIATION 5: THE JOURNEY MAP (Frontend-Design Inspired)
// =============================================================================

function JourneyMap({
  open,
  onComplete,
  deliveryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
}: {
  open: boolean
  onComplete: () => void
  deliveryDate?: Date
}) {
  const [stage, setStage] = useState<JourneyStage>("starting")
  const [progress, setProgress] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)
  const [visibleMilestones, setVisibleMilestones] = useState<number[]>([])

  const daysFromNow = Math.ceil((deliveryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  const stages: { key: JourneyStage; duration: number; progress: number }[] = [
    { key: "starting", duration: 1500, progress: 20 },
    { key: "drawing", duration: 2000, progress: 45 },
    { key: "milestones", duration: 2500, progress: 75 },
    { key: "destination", duration: 1500, progress: 95 },
    { key: "complete", duration: 0, progress: 100 },
  ]

  const milestones = [
    { icon: FileText, label: "Written", color: "duck-yellow" },
    { icon: Lock, label: "Encrypted", color: "teal-primary" },
    { icon: Calendar, label: "Scheduled", color: "duck-blue" },
    { icon: Send, label: "Delivery", color: "coral" },
  ]

  useEffect(() => {
    if (!open) {
      setStage("starting")
      setProgress(0)
      setShowConfetti(false)
      setVisibleMilestones([])
      return
    }

    let currentIndex = 0
    const runStage = () => {
      if (currentIndex >= stages.length) return
      const currentStage = stages[currentIndex]
      if (!currentStage) return

      setStage(currentStage.key)
      setProgress(currentStage.progress)
      if (currentStage.key === "complete") {
        setShowConfetti(true)
        return
      }
      currentIndex++
      setTimeout(runStage, currentStage.duration)
    }
    runStage()
  }, [open])

  // Milestone reveal animation
  useEffect(() => {
    if (stage !== "milestones") return

    const showMilestone = (index: number) => {
      if (index >= milestones.length) return
      setVisibleMilestones(prev => [...prev, index])
      setTimeout(() => showMilestone(index + 1), 500)
    }

    showMilestone(0)
  }, [stage])

  return (
    <SealModal open={open} onClose={() => {}}>
      <AnimatePresence>
        {showConfetti && <BrutalistConfetti count={70} />}
      </AnimatePresence>

      {/* Adventure-themed gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-duck-cream via-duck-yellow/20 to-duck-cream" />

      <div className="relative p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-duck-yellow font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal border-2 border-charcoal shadow-[2px_2px_0_theme(colors.charcoal)]"
            style={{ borderRadius: "2px" }}
          >
            <Compass className="h-3 w-3" strokeWidth={2} />
            Journey Map
          </div>
        </div>

        {/* Animation Area */}
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <AnimatePresence mode="wait">
            {stage === "starting" && (
              <motion.div
                key="starting"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="relative"
                >
                  <div
                    className="w-16 h-16 border-4 border-charcoal bg-duck-yellow flex items-center justify-center shadow-[4px_4px_0_theme(colors.charcoal)]"
                    style={{ borderRadius: "50%" }}
                  >
                    <MapPin className="h-8 w-8 text-charcoal" strokeWidth={2} />
                  </div>
                  {/* Pulse ring */}
                  <motion.div
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute inset-0 border-4 border-duck-yellow"
                    style={{ borderRadius: "50%" }}
                  />
                </motion.div>
                <div className="text-center">
                  <p className="font-mono text-[10px] text-charcoal/60 uppercase tracking-wider">
                    You Are Here
                  </p>
                  <p className="font-mono text-lg font-bold uppercase tracking-wide text-charcoal">
                    Your journey begins...
                  </p>
                  <p className="font-mono text-sm text-charcoal/70 mt-1">
                    {new Date().toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </p>
                </div>
              </motion.div>
            )}

            {stage === "drawing" && (
              <motion.div
                key="drawing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-6 w-full"
              >
                {/* Path visualization */}
                <div className="relative w-full h-32 flex items-center">
                  {/* Start point */}
                  <div
                    className="absolute left-4 w-10 h-10 border-4 border-charcoal bg-duck-yellow flex items-center justify-center z-10"
                    style={{ borderRadius: "50%" }}
                  >
                    <MapPin className="h-5 w-5 text-charcoal" />
                  </div>

                  {/* Animated dotted path */}
                  <svg className="absolute inset-0 w-full h-full overflow-visible">
                    <motion.path
                      d="M 40 64 Q 150 20 200 64 T 360 64"
                      fill="none"
                      stroke="#383838"
                      strokeWidth="4"
                      strokeDasharray="8 8"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                  </svg>

                  {/* End point */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2 }}
                    className="absolute right-4 w-10 h-10 border-4 border-charcoal bg-teal-primary flex items-center justify-center z-10"
                    style={{ borderRadius: "50%" }}
                  >
                    <Flag className="h-5 w-5 text-white" />
                  </motion.div>
                </div>

                <p className="font-mono text-lg font-bold uppercase tracking-wide text-charcoal">
                  Plotting the course...
                </p>
                <p className="font-mono text-sm text-charcoal/60">
                  {daysFromNow} days ahead
                </p>
              </motion.div>
            )}

            {stage === "milestones" && (
              <motion.div
                key="milestones"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-6 w-full"
              >
                <p className="font-mono text-lg font-bold uppercase tracking-wide text-charcoal">
                  Setting milestones...
                </p>

                {/* Milestones grid */}
                <div className="grid grid-cols-4 gap-3 w-full">
                  {milestones.map((milestone, i) => {
                    const isVisible = visibleMilestones.includes(i)
                    const Icon = milestone.icon
                    const bgColor = {
                      "duck-yellow": "bg-duck-yellow",
                      "teal-primary": "bg-teal-primary",
                      "duck-blue": "bg-duck-blue",
                      "coral": "bg-coral",
                    }[milestone.color]
                    const textColor = milestone.color === "duck-yellow" ? "text-charcoal" : "text-white"

                    return (
                      <motion.div
                        key={milestone.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0.3, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col items-center gap-2"
                      >
                        <div
                          className={cn(
                            "w-12 h-12 border-3 border-charcoal flex items-center justify-center transition-all",
                            isVisible ? bgColor : "bg-charcoal/10",
                            isVisible && "shadow-[3px_3px_0_theme(colors.charcoal)]"
                          )}
                          style={{ borderRadius: "2px" }}
                        >
                          <Icon className={cn("h-6 w-6", isVisible ? textColor : "text-charcoal/30")} strokeWidth={2} />
                        </div>
                        <span className={cn(
                          "font-mono text-[10px] uppercase tracking-wider",
                          isVisible ? "text-charcoal" : "text-charcoal/30"
                        )}>
                          {milestone.label}
                        </span>
                        {isVisible && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-5 h-5 border-2 border-charcoal bg-teal-primary flex items-center justify-center"
                            style={{ borderRadius: "50%" }}
                          >
                            <Check className="h-3 w-3 text-white" strokeWidth={3} />
                          </motion.div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {stage === "destination" && (
              <motion.div
                key="destination"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                  className="relative"
                >
                  <div
                    className="w-20 h-20 border-4 border-charcoal bg-teal-primary flex items-center justify-center shadow-[6px_6px_0_theme(colors.charcoal)]"
                    style={{ borderRadius: "50%" }}
                  >
                    <Flag className="h-10 w-10 text-white" strokeWidth={1.5} />
                  </div>
                  {/* Glow effect */}
                  <motion.div
                    animate={{
                      boxShadow: [
                        "0 0 0 0 rgba(61, 154, 139, 0.4)",
                        "0 0 40px 20px rgba(61, 154, 139, 0.1)",
                        "0 0 0 0 rgba(61, 154, 139, 0)",
                      ],
                    }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0"
                    style={{ borderRadius: "50%" }}
                  />
                </motion.div>
                <div className="text-center">
                  <p className="font-mono text-[10px] text-charcoal/60 uppercase tracking-wider">
                    Destination Locked In!
                  </p>
                  <p className="font-mono text-2xl font-bold uppercase tracking-wide text-charcoal">
                    {deliveryDate.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </p>
                  <p className="font-mono text-sm text-teal-primary font-bold mt-1">
                    {daysFromNow} days until arrival
                  </p>
                </div>
              </motion.div>
            )}

            {stage === "complete" && (
              <motion.div
                key="complete"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-6 w-full"
              >
                {/* Completed path visualization */}
                <div className="relative w-full h-24 flex items-center">
                  {/* Full glowing path */}
                  <svg className="absolute inset-0 w-full h-full overflow-visible">
                    <motion.path
                      d="M 40 48 Q 150 10 200 48 T 360 48"
                      fill="none"
                      stroke="#3D9A8B"
                      strokeWidth="6"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 0.8 }}
                      style={{ filter: "drop-shadow(0 0 8px rgba(61, 154, 139, 0.5))" }}
                    />
                  </svg>

                  {/* Start marker */}
                  <div
                    className="absolute left-4 w-8 h-8 border-3 border-charcoal bg-teal-primary flex items-center justify-center z-10"
                    style={{ borderRadius: "50%" }}
                  >
                    <Check className="h-4 w-4 text-white" strokeWidth={3} />
                  </div>

                  {/* End marker with party effect */}
                  <motion.div
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="absolute right-4 w-10 h-10 border-3 border-charcoal bg-duck-yellow flex items-center justify-center z-10 shadow-[3px_3px_0_theme(colors.charcoal)]"
                    style={{ borderRadius: "50%" }}
                  >
                    <Sparkles className="h-5 w-5 text-charcoal" strokeWidth={2} />
                  </motion.div>
                </div>

                <div className="text-center">
                  <p className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal">
                    Your letter's journey is planned!
                  </p>
                  <p className="font-mono text-sm text-charcoal/60 mt-1">
                    Adventure awaits in {daysFromNow} days
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress - stylized as a trail */}
        <div className="space-y-3 mb-6">
          <div
            className="w-full h-4 border-2 border-charcoal bg-white overflow-hidden relative"
            style={{ borderRadius: "2px" }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-duck-yellow via-duck-blue to-teal-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
            {/* Moving marker */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-charcoal"
              style={{
                borderRadius: "50%",
                left: `calc(${progress}% - 6px)`,
              }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
            />
          </div>
        </div>

        {stage === "complete" && (
          <FinalCTA onClick={onComplete} text="Begin Your Journey" />
        )}
      </div>
    </SealModal>
  )
}

// =============================================================================
// MAIN SANDBOX PAGE
// =============================================================================

export default function CTASealAnimationsSandbox() {
  const [selectedVariation, setSelectedVariation] = useState<AnimationVariation>("postbox")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [completedVariations, setCompletedVariations] = useState<AnimationVariation[]>([])

  const variations: { key: AnimationVariation; name: string; description: string; theme: string }[] = [
    {
      key: "postbox",
      name: "The Postbox Ceremony",
      description: "User's specification: Full emotional journey from creating to encrypting",
      theme: "Process-focused, building anticipation",
    },
    {
      key: "wax",
      name: "The Waxing Ceremony",
      description: "Traditional craft metaphor with tactile, ASMR-like animations",
      theme: "Authentic, premium, crafted",
    },
    {
      key: "time",
      name: "The Time Machine",
      description: "Sci-fi temporal journey with starfield and date warping",
      theme: "Wonder, anticipation, future-forward",
    },
    {
      key: "vault",
      name: "The Vault Sequence",
      description: "Security-focused with encryption visualization",
      theme: "Trust, protection, peace of mind",
    },
    {
      key: "journey",
      name: "The Journey Map",
      description: "Frontend-design inspired adventure path with milestones",
      theme: "Adventure, excitement, visual storytelling",
    },
  ]

  const handleComplete = () => {
    setIsModalOpen(false)
    if (!completedVariations.includes(selectedVariation)) {
      setCompletedVariations([...completedVariations, selectedVariation])
    }
  }

  const handlePlay = () => {
    setIsModalOpen(true)
  }

  const handleReset = () => {
    setCompletedVariations([])
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="container py-12 space-y-8">
        {/* Header */}
        <header className="space-y-4">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-coral font-mono text-[10px] font-bold uppercase tracking-wider text-white border-2 border-charcoal shadow-[2px_2px_0_theme(colors.charcoal)]"
            style={{ borderRadius: "2px" }}
          >
            <Stamp className="h-3 w-3" strokeWidth={2} />
            Design Sandbox
          </div>
          <h1 className="font-mono text-3xl font-bold uppercase tracking-wide text-charcoal">
            CTA Seal Animations
          </h1>
          <p className="font-mono text-sm text-charcoal/70 max-w-2xl">
            Premium modal animations for the landing page "Seal & Schedule" button.
            Each variation creates an immersive ceremony before the paywall.
          </p>
        </header>

        {/* Variation Selector */}
        <div className="space-y-4">
          <h2 className="font-mono text-lg font-bold uppercase tracking-wide text-charcoal">
            Select Variation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {variations.map((variation) => {
              const isSelected = selectedVariation === variation.key
              const isCompleted = completedVariations.includes(variation.key)

              return (
                <button
                  key={variation.key}
                  onClick={() => setSelectedVariation(variation.key)}
                  className={cn(
                    "text-left border-2 border-charcoal p-4 transition-all",
                    isSelected
                      ? "bg-duck-yellow shadow-[4px_4px_0_theme(colors.charcoal)] -translate-y-1"
                      : "bg-white hover:bg-duck-cream shadow-[2px_2px_0_theme(colors.charcoal)] hover:shadow-[3px_3px_0_theme(colors.charcoal)] hover:-translate-y-0.5"
                  )}
                  style={{ borderRadius: "2px" }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <h3 className="font-mono text-sm font-bold uppercase tracking-wide text-charcoal">
                        {variation.name}
                      </h3>
                      <p className="font-mono text-[10px] text-charcoal/60">
                        {variation.description}
                      </p>
                      <p className="font-mono text-[10px] text-teal-primary uppercase tracking-wider">
                        {variation.theme}
                      </p>
                    </div>
                    {isCompleted && (
                      <div
                        className="flex-shrink-0 w-6 h-6 bg-teal-primary border-2 border-charcoal flex items-center justify-center"
                        style={{ borderRadius: "50%" }}
                      >
                        <Check className="h-3 w-3 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Preview Controls */}
        <div
          className="border-2 border-charcoal bg-white p-6 shadow-[4px_4px_0_theme(colors.charcoal)]"
          style={{ borderRadius: "2px" }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-mono text-lg font-bold uppercase tracking-wide text-charcoal">
                Preview: {variations.find(v => v.key === selectedVariation)?.name}
              </h3>
              <p className="font-mono text-xs text-charcoal/60">
                Click play to see the full animation sequence (simulates clicking "Seal & Schedule")
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleReset}
                variant="outline"
                className="gap-2 border-2 border-charcoal bg-white hover:bg-duck-cream font-mono text-xs uppercase tracking-wider"
                style={{ borderRadius: "2px" }}
              >
                <RotateCcw className="h-4 w-4" strokeWidth={2} />
                Reset All
              </Button>
              <Button
                onClick={handlePlay}
                className="gap-2 bg-coral hover:bg-coral/90 text-white font-mono text-xs uppercase tracking-wider border-2 border-charcoal shadow-[3px_3px_0_theme(colors.charcoal)] hover:shadow-[4px_4px_0_theme(colors.charcoal)] hover:-translate-y-0.5 transition-all"
                style={{ borderRadius: "2px" }}
              >
                <Play className="h-4 w-4" strokeWidth={2} />
                Play Animation
              </Button>
            </div>
          </div>
        </div>

        {/* Animation Modals */}
        <AnimatePresence>
          {isModalOpen && selectedVariation === "postbox" && (
            <PostboxCeremony open={isModalOpen} onComplete={handleComplete} />
          )}
          {isModalOpen && selectedVariation === "wax" && (
            <WaxingCeremony open={isModalOpen} onComplete={handleComplete} />
          )}
          {isModalOpen && selectedVariation === "time" && (
            <TimeMachine open={isModalOpen} onComplete={handleComplete} />
          )}
          {isModalOpen && selectedVariation === "vault" && (
            <VaultSequence open={isModalOpen} onComplete={handleComplete} />
          )}
          {isModalOpen && selectedVariation === "journey" && (
            <JourneyMap open={isModalOpen} onComplete={handleComplete} />
          )}
        </AnimatePresence>

        {/* Design Rationale Section */}
        <div
          className="border-2 border-charcoal bg-duck-cream p-6 shadow-[4px_4px_0_theme(colors.charcoal)]"
          style={{ borderRadius: "2px" }}
        >
          <h2 className="font-mono text-lg font-bold uppercase tracking-wide text-charcoal mb-4">
            Design Rationale
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-charcoal">
                Conversion Psychology
              </h3>
              <ul className="space-y-2">
                {[
                  "Sunk cost: User already invested time writing",
                  "Anticipation building: Multi-stage reveals",
                  "Trust signals: Encryption messaging",
                  "Completion desire: Progress bar creates urgency",
                  "Emotional peak: Celebration primes action",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 text-teal-primary flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="font-mono text-xs text-charcoal/70">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-charcoal">
                Animation Timing
              </h3>
              <ul className="space-y-2">
                {[
                  "Total duration: 8-9 seconds (premium feel)",
                  "Each stage: 1-2 seconds (digestible)",
                  "Progress visible throughout",
                  "Clear CTA at completion",
                  "Confetti celebration for emotional peak",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 text-duck-blue flex-shrink-0 mt-0.5" strokeWidth={2} />
                    <span className="font-mono text-xs text-charcoal/70">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Variation Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: "V1: Postbox (User's Spec)",
              stages: ["Creating postbox", "Sealing", "Preparing", "Encrypting", "Final checks", "Complete"],
              bestFor: "Organized, process-oriented users",
            },
            {
              title: "V2: Wax Ceremony",
              stages: ["Folding", "Melting wax", "Stamping", "Cooling", "Inspecting", "Complete"],
              bestFor: "Craft lovers, analog appreciators",
            },
            {
              title: "V3: Time Machine",
              stages: ["Capturing moment", "Time warping", "Encapsulating", "Launching", "Arriving", "Complete"],
              bestFor: "Dreamers, future-focused users",
            },
            {
              title: "V4: Vault Sequence",
              stages: ["Scanning", "Compressing", "Encrypting", "Opening vault", "Storing", "Complete"],
              bestFor: "Security-conscious users",
            },
            {
              title: "V5: Journey Map",
              stages: ["Starting point", "Drawing path", "Milestones", "Destination", "Complete"],
              bestFor: "Adventure seekers, visual learners",
            },
          ].map((detail, i) => (
            <div
              key={i}
              className="border-2 border-charcoal bg-white p-4"
              style={{ borderRadius: "2px" }}
            >
              <h3 className="font-mono text-sm font-bold uppercase tracking-wide text-charcoal mb-3">
                {detail.title}
              </h3>
              <div className="space-y-2 mb-3">
                {detail.stages.map((stage, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 border-2 border-charcoal bg-duck-cream flex items-center justify-center font-mono text-[8px] font-bold"
                      style={{ borderRadius: "2px" }}
                    >
                      {j + 1}
                    </div>
                    <span className="font-mono text-[10px] text-charcoal/70">{stage}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t-2 border-dashed border-charcoal/20">
                <p className="font-mono text-[10px] text-teal-primary uppercase tracking-wider">
                  Best for: {detail.bestFor}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
