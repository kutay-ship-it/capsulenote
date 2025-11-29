"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MapPin,
  Flag,
  Compass,
  Lock,
  FileText,
  Calendar,
  Send,
  Check,
  Sparkles,
  Mail,
  Clock,
  ArrowRight,
  Play,
  RotateCcw,
  ChevronRight,
  User,
  Heart,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// =============================================================================
// TYPES
// =============================================================================

type JourneyVariation = "timeline" | "orbital" | "depth"
type JourneyStage = "starting" | "drawing" | "milestones" | "destination" | "complete"

// =============================================================================
// SHARED COMPONENTS
// =============================================================================

function BrutalistConfetti({ count = 50 }: { count?: number }) {
  const confetti = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 0.5,
    color: ["bg-duck-yellow", "bg-teal-primary", "bg-coral", "bg-duck-blue"][Math.floor(Math.random() * 4)],
  }))

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {confetti.map((piece) => (
        <motion.div
          key={piece.id}
          initial={{ y: -20, x: `${piece.x}%`, opacity: 1 }}
          animate={{ y: "100vh", opacity: 0 }}
          transition={{ duration: 2, delay: piece.delay, ease: "easeIn" }}
          className={cn("absolute w-2 h-2 border border-charcoal", piece.color)}
          style={{ borderRadius: "1px" }}
        />
      ))}
    </div>
  )
}

function AnimatedProgress({ progress, color = "teal-primary" }: { progress: number; color?: string }) {
  const bgColor = {
    "teal-primary": "bg-teal-primary",
    "duck-yellow": "bg-duck-yellow",
    "duck-blue": "bg-duck-blue",
  }[color] || "bg-teal-primary"

  return (
    <div className="w-full h-3 border-2 border-charcoal bg-white/50 overflow-hidden" style={{ borderRadius: "2px" }}>
      <motion.div
        className={bgColor}
        style={{ height: "100%" }}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
  )
}

function JourneyModal({
  open,
  children,
  bgClassName = "bg-charcoal/80 backdrop-blur-sm",
}: {
  open: boolean
  children: React.ReactNode
  bgClassName?: string
}) {
  if (!open) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn("fixed inset-0 z-50 flex items-center justify-center p-4", bgClassName)}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", damping: 20 }}
        className="relative w-full max-w-md bg-duck-cream border-4 border-charcoal shadow-[8px_8px_0_theme(colors.charcoal)] overflow-hidden"
        style={{ borderRadius: "2px" }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

function FinalCTA({ onClick, text = "Continue to Payment" }: { onClick: () => void; text?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Button
        onClick={onClick}
        className="w-full h-14 bg-teal-primary hover:bg-teal-primary/90 text-white font-mono text-sm font-bold uppercase tracking-wider border-3 border-charcoal shadow-[4px_4px_0_theme(colors.charcoal)] hover:shadow-[2px_2px_0_theme(colors.charcoal)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
        style={{ borderRadius: "2px" }}
      >
        <span>{text}</span>
        <ChevronRight className="ml-2 h-5 w-5" />
      </Button>
    </motion.div>
  )
}

// =============================================================================
// VARIATION 1: TIMELINE JOURNEY
// Horizontal timeline with animated envelope traveling along milestones
// =============================================================================

function TimelineJourney({
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
  const [envelopePosition, setEnvelopePosition] = useState(0)

  const daysFromNow = Math.ceil((deliveryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  const stages: { key: JourneyStage; duration: number; progress: number }[] = [
    { key: "starting", duration: 1500, progress: 15 },
    { key: "drawing", duration: 2000, progress: 40 },
    { key: "milestones", duration: 2500, progress: 75 },
    { key: "destination", duration: 1500, progress: 95 },
    { key: "complete", duration: 0, progress: 100 },
  ]

  const milestones = [
    { icon: FileText, label: "Written", subtext: "Today", color: "duck-yellow", position: 0 },
    { icon: Lock, label: "Encrypted", subtext: "Secured", color: "teal-primary", position: 33 },
    { icon: Calendar, label: "Scheduled", subtext: "Planned", color: "duck-blue", position: 66 },
    { icon: Send, label: "Delivered", subtext: deliveryDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }), color: "coral", position: 100 },
  ]

  useEffect(() => {
    if (!open) {
      setStage("starting")
      setProgress(0)
      setShowConfetti(false)
      setVisibleMilestones([])
      setEnvelopePosition(0)
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

  // Animate envelope position during drawing
  useEffect(() => {
    if (stage === "drawing") {
      const interval = setInterval(() => {
        setEnvelopePosition(prev => Math.min(prev + 2, 100))
      }, 40)
      return () => clearInterval(interval)
    }
  }, [stage])

  // Reveal milestones
  useEffect(() => {
    if (stage !== "milestones") return
    const showMilestone = (index: number) => {
      if (index >= milestones.length) return
      setVisibleMilestones(prev => [...prev, index])
      setTimeout(() => showMilestone(index + 1), 400)
    }
    showMilestone(0)
  }, [stage])

  return (
    <JourneyModal open={open}>
      <AnimatePresence>
        {showConfetti && <BrutalistConfetti count={60} />}
      </AnimatePresence>

      {/* Warm gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-duck-cream via-duck-yellow/10 to-duck-cream" />

      <div className="relative p-6">
        {/* Header */}
        <div className="text-center mb-6">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-duck-yellow font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal border-2 border-charcoal shadow-[2px_2px_0_theme(colors.charcoal)]"
            style={{ borderRadius: "2px" }}
          >
            <Compass className="h-3 w-3" strokeWidth={2} />
            Your Letter's Journey
          </div>
        </div>

        {/* Timeline Visualization */}
        <div className="relative h-48 mb-6">
          {/* Timeline track */}
          <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2">
            {/* Background track */}
            <div className="h-2 bg-charcoal/20 border border-charcoal" style={{ borderRadius: "2px" }} />

            {/* Animated progress track */}
            <motion.div
              className="absolute top-0 left-0 h-2 bg-teal-primary border border-charcoal"
              style={{ borderRadius: "2px" }}
              initial={{ width: 0 }}
              animate={{ width: `${envelopePosition}%` }}
              transition={{ duration: 0.1 }}
            />

            {/* Milestone markers */}
            {milestones.map((milestone, i) => {
              // Milestones are always visible with colors once animation starts
              const isVisible = stage !== "starting"
              // Checkmarks appear during milestones stage or when complete
              const hasCheckmark = visibleMilestones.includes(i) || stage === "complete"
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
                  className="absolute top-1/2"
                  style={{ left: `${milestone.position}%`, transform: "translate(-50%, -50%)" }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={isVisible ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0.3 }}
                  transition={{ type: "spring", bounce: 0.5, delay: i * 0.1 }}
                >
                  {/* Milestone node */}
                  <div
                    className={cn(
                      "w-12 h-12 border-3 border-charcoal flex items-center justify-center",
                      isVisible ? bgColor : "bg-charcoal/10",
                      isVisible && "shadow-[3px_3px_0_theme(colors.charcoal)]"
                    )}
                    style={{ borderRadius: "50%" }}
                  >
                    <Icon className={cn("h-5 w-5", isVisible ? textColor : "text-charcoal/30")} strokeWidth={2} />
                  </div>

                  {/* Label below */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 text-center whitespace-nowrap">
                    <p className={cn(
                      "font-mono text-[10px] font-bold uppercase tracking-wider",
                      isVisible ? "text-charcoal" : "text-charcoal/30"
                    )}>
                      {milestone.label}
                    </p>
                    <p className="font-mono text-[9px] text-charcoal/50">{milestone.subtext}</p>
                  </div>

                  {/* Checkmark for completed */}
                  {hasCheckmark && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-5 h-5 border-2 border-charcoal bg-teal-primary flex items-center justify-center"
                      style={{ borderRadius: "50%" }}
                    >
                      <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    </motion.div>
                  )}
                </motion.div>
              )
            })}

            {/* Traveling envelope */}
            {(stage === "drawing" || stage === "milestones") && (
              <motion.div
                className="absolute top-1/2"
                style={{ left: `${Math.min(envelopePosition, 95)}%`, transform: "translate(-50%, -50%)" }}
                animate={{ y: [-4, 4, -4] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
              >
                <div
                  className="w-8 h-8 border-2 border-charcoal bg-duck-yellow flex items-center justify-center shadow-[2px_2px_0_theme(colors.charcoal)]"
                  style={{ borderRadius: "2px" }}
                >
                  <Mail className="h-4 w-4 text-charcoal" strokeWidth={2} />
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Stage messaging */}
        <div className="text-center mb-6">
          <AnimatePresence mode="wait">
            {stage === "starting" && (
              <motion.div key="starting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="font-mono text-lg font-bold uppercase tracking-wide text-charcoal">
                  Your journey begins...
                </p>
                <p className="font-mono text-sm text-charcoal/60 mt-1">
                  {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              </motion.div>
            )}
            {stage === "drawing" && (
              <motion.div key="drawing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="font-mono text-lg font-bold uppercase tracking-wide text-charcoal">
                  Plotting the course...
                </p>
                <p className="font-mono text-sm text-charcoal/60 mt-1">{daysFromNow} days ahead</p>
              </motion.div>
            )}
            {stage === "milestones" && (
              <motion.div key="milestones" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="font-mono text-lg font-bold uppercase tracking-wide text-charcoal">
                  Setting milestones...
                </p>
              </motion.div>
            )}
            {stage === "destination" && (
              <motion.div key="destination" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="font-mono text-lg font-bold uppercase tracking-wide text-charcoal">
                  Destination locked in!
                </p>
                <p className="font-mono text-xl font-bold text-teal-primary mt-1">
                  {deliveryDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              </motion.div>
            )}
            {stage === "complete" && (
              <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal">
                  Your letter's journey is planned!
                </p>
                <p className="font-mono text-sm text-charcoal/60 mt-1">
                  {daysFromNow} days until it reaches future you
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <AnimatedProgress progress={progress} />
        </div>

        {stage === "complete" && (
          <FinalCTA onClick={onComplete} text="Continue to Payment" />
        )}
      </div>
    </JourneyModal>
  )
}

// =============================================================================
// VARIATION 2: ORBITAL JOURNEY
// Letter orbits around "Future You" - time as orbital motion
// =============================================================================

function OrbitalJourney({
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
  const [orbitAngle, setOrbitAngle] = useState(0)
  const [visibleMilestones, setVisibleMilestones] = useState<number[]>([])

  const daysFromNow = Math.ceil((deliveryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  const stages: { key: JourneyStage; duration: number; progress: number }[] = [
    { key: "starting", duration: 1500, progress: 15 },
    { key: "drawing", duration: 2500, progress: 45 },
    { key: "milestones", duration: 2000, progress: 75 },
    { key: "destination", duration: 1500, progress: 95 },
    { key: "complete", duration: 0, progress: 100 },
  ]

  const milestones = [
    { icon: FileText, label: "Written", angle: 0, color: "duck-yellow" },
    { icon: Lock, label: "Encrypted", angle: 90, color: "teal-primary" },
    { icon: Calendar, label: "Scheduled", angle: 180, color: "duck-blue" },
    { icon: Send, label: "Delivered", angle: 270, color: "coral" },
  ]

  useEffect(() => {
    if (!open) {
      setStage("starting")
      setProgress(0)
      setShowConfetti(false)
      setOrbitAngle(0)
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

  // Animate orbit during drawing
  useEffect(() => {
    if (stage === "drawing") {
      const interval = setInterval(() => {
        setOrbitAngle(prev => (prev + 3) % 360)
      }, 30)
      return () => clearInterval(interval)
    }
  }, [stage])

  // Reveal milestones
  useEffect(() => {
    if (stage !== "milestones") return
    const showMilestone = (index: number) => {
      if (index >= milestones.length) return
      setVisibleMilestones(prev => [...prev, index])
      setTimeout(() => showMilestone(index + 1), 400)
    }
    showMilestone(0)
  }, [stage])

  const orbitRadius = 80

  return (
    <JourneyModal open={open}>
      <AnimatePresence>
        {showConfetti && <BrutalistConfetti count={60} />}
      </AnimatePresence>

      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-duck-cream via-duck-blue/5 to-duck-cream" />

      <div className="relative p-6">
        {/* Header */}
        <div className="text-center mb-4">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-duck-blue font-mono text-[10px] font-bold uppercase tracking-wider text-white border-2 border-charcoal shadow-[2px_2px_0_theme(colors.charcoal)]"
            style={{ borderRadius: "2px" }}
          >
            <Clock className="h-3 w-3" strokeWidth={2} />
            Time Capsule Orbit
          </div>
        </div>

        {/* Orbital Visualization */}
        <div className="relative h-56 mb-4 flex items-center justify-center">
          {/* Orbit path */}
          <div
            className="absolute border-3 border-dashed border-charcoal/30"
            style={{
              width: orbitRadius * 2 + 48,
              height: orbitRadius * 2 + 48,
              borderRadius: "50%",
            }}
          />

          {/* Progress orbit path */}
          <svg
            className="absolute"
            width={orbitRadius * 2 + 52}
            height={orbitRadius * 2 + 52}
            style={{ transform: "rotate(-90deg)" }}
          >
            <motion.circle
              cx={orbitRadius + 26}
              cy={orbitRadius + 26}
              r={orbitRadius + 24}
              fill="none"
              stroke="#3D9A8B"
              strokeWidth="4"
              strokeDasharray={2 * Math.PI * (orbitRadius + 24)}
              initial={{ strokeDashoffset: 2 * Math.PI * (orbitRadius + 24) }}
              animate={{ strokeDashoffset: 2 * Math.PI * (orbitRadius + 24) * (1 - progress / 100) }}
              transition={{ duration: 0.5 }}
            />
          </svg>

          {/* Center - Future You */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="relative z-10"
          >
            <div
              className="w-16 h-16 border-4 border-charcoal bg-teal-primary flex items-center justify-center shadow-[4px_4px_0_theme(colors.charcoal)]"
              style={{ borderRadius: "50%" }}
            >
              <User className="h-8 w-8 text-white" strokeWidth={1.5} />
            </div>
            <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-wider text-charcoal whitespace-nowrap">
              Future You
            </p>
          </motion.div>

          {/* Milestone markers on orbit */}
          {milestones.map((milestone, i) => {
            // Milestones are always visible with colors once animation starts
            const isVisible = stage !== "starting"
            // Checkmarks appear during milestones stage or when complete
            const hasCheckmark = visibleMilestones.includes(i) || stage === "complete"
            const Icon = milestone.icon
            const angleRad = (milestone.angle * Math.PI) / 180
            const x = Math.cos(angleRad) * orbitRadius
            const y = Math.sin(angleRad) * orbitRadius
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
                className="absolute"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: "translate(-50%, -50%)",
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={isVisible ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0.3 }}
                transition={{ type: "spring", bounce: 0.4, delay: i * 0.1 }}
              >
                <div
                  className={cn(
                    "w-10 h-10 border-2 border-charcoal flex items-center justify-center",
                    isVisible ? bgColor : "bg-charcoal/10",
                    isVisible && "shadow-[2px_2px_0_theme(colors.charcoal)]"
                  )}
                  style={{ borderRadius: "50%" }}
                >
                  <Icon className={cn("h-4 w-4", isVisible ? textColor : "text-charcoal/30")} strokeWidth={2} />
                </div>
                <p className="absolute top-full left-1/2 -translate-x-1/2 mt-1 font-mono text-[8px] uppercase tracking-wider text-charcoal whitespace-nowrap">
                  {milestone.label}
                </p>
                {/* Checkmark for completed */}
                {hasCheckmark && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 border-2 border-charcoal bg-teal-primary flex items-center justify-center"
                    style={{ borderRadius: "50%" }}
                  >
                    <Check className="h-2 w-2 text-white" strokeWidth={3} />
                  </motion.div>
                )}
              </motion.div>
            )
          })}

          {/* Orbiting letter */}
          {(stage === "drawing" || stage === "milestones") && (
            <motion.div
              className="absolute z-20"
              style={{
                left: `calc(50% + ${Math.cos((orbitAngle * Math.PI) / 180) * orbitRadius}px)`,
                top: `calc(50% + ${Math.sin((orbitAngle * Math.PI) / 180) * orbitRadius}px)`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-8 h-8 border-2 border-charcoal bg-duck-yellow flex items-center justify-center shadow-[2px_2px_0_theme(colors.charcoal)]"
                style={{ borderRadius: "2px" }}
              >
                <Mail className="h-4 w-4 text-charcoal" strokeWidth={2} />
              </motion.div>
            </motion.div>
          )}

          {/* Arrival animation */}
          {stage === "destination" && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute z-30"
              style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="w-10 h-10 border-2 border-charcoal bg-duck-yellow flex items-center justify-center shadow-[3px_3px_0_theme(colors.charcoal)]"
                style={{ borderRadius: "2px" }}
              >
                <Heart className="h-5 w-5 text-coral" strokeWidth={2} fill="currentColor" />
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Stage messaging */}
        <div className="text-center mb-4">
          <AnimatePresence mode="wait">
            {stage === "starting" && (
              <motion.div key="starting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="font-mono text-lg font-bold uppercase tracking-wide text-charcoal">
                  Launching your time capsule...
                </p>
              </motion.div>
            )}
            {stage === "drawing" && (
              <motion.div key="drawing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="font-mono text-lg font-bold uppercase tracking-wide text-charcoal">
                  Entering orbit...
                </p>
                <p className="font-mono text-sm text-charcoal/60 mt-1">{daysFromNow} days until arrival</p>
              </motion.div>
            )}
            {stage === "milestones" && (
              <motion.div key="milestones" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="font-mono text-lg font-bold uppercase tracking-wide text-charcoal">
                  Waypoints confirmed...
                </p>
              </motion.div>
            )}
            {stage === "destination" && (
              <motion.div key="destination" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="font-mono text-lg font-bold uppercase tracking-wide text-charcoal">
                  Arrival locked!
                </p>
                <p className="font-mono text-xl font-bold text-teal-primary mt-1">
                  {deliveryDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              </motion.div>
            )}
            {stage === "complete" && (
              <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal">
                  Orbit complete!
                </p>
                <p className="font-mono text-sm text-charcoal/60 mt-1">
                  Your letter will reach future you in {daysFromNow} days
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <AnimatedProgress progress={progress} color="duck-blue" />
        </div>

        {stage === "complete" && (
          <FinalCTA onClick={onComplete} text="Continue to Payment" />
        )}
      </div>
    </JourneyModal>
  )
}

// =============================================================================
// VARIATION 3: DEPTH JOURNEY
// Letter descends through layers of time toward future you
// =============================================================================

function DepthJourney({
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
  const [currentLayer, setCurrentLayer] = useState(0)
  const [letterDepth, setLetterDepth] = useState(0)

  const daysFromNow = Math.ceil((deliveryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  const stages: { key: JourneyStage; duration: number; progress: number }[] = [
    { key: "starting", duration: 1500, progress: 15 },
    { key: "drawing", duration: 2000, progress: 40 },
    { key: "milestones", duration: 2500, progress: 75 },
    { key: "destination", duration: 1500, progress: 95 },
    { key: "complete", duration: 0, progress: 100 },
  ]

  const layers = [
    { icon: FileText, label: "Today", sublabel: "Your words", color: "duck-yellow", depth: 0 },
    { icon: Lock, label: "Secured", sublabel: "Encrypted", color: "teal-primary", depth: 1 },
    { icon: Calendar, label: "Scheduled", sublabel: "Time-locked", color: "duck-blue", depth: 2 },
    { icon: Send, label: "Future", sublabel: deliveryDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }), color: "coral", depth: 3 },
  ]

  useEffect(() => {
    if (!open) {
      setStage("starting")
      setProgress(0)
      setShowConfetti(false)
      setCurrentLayer(0)
      setLetterDepth(0)
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

  // Animate letter descent
  useEffect(() => {
    if (stage === "drawing") {
      const interval = setInterval(() => {
        setLetterDepth(prev => Math.min(prev + 0.02, 1))
      }, 30)
      return () => clearInterval(interval)
    }
  }, [stage])

  // Reveal layers
  useEffect(() => {
    if (stage !== "milestones") return
    const showLayer = (index: number) => {
      if (index >= layers.length) return
      setCurrentLayer(index + 1)
      setTimeout(() => showLayer(index + 1), 500)
    }
    showLayer(0)
  }, [stage])

  return (
    <JourneyModal open={open}>
      <AnimatePresence>
        {showConfetti && <BrutalistConfetti count={60} />}
      </AnimatePresence>

      {/* Deep gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-duck-cream via-duck-cream to-charcoal/10" />

      <div className="relative p-6">
        {/* Header */}
        <div className="text-center mb-4">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-coral font-mono text-[10px] font-bold uppercase tracking-wider text-white border-2 border-charcoal shadow-[2px_2px_0_theme(colors.charcoal)]"
            style={{ borderRadius: "2px" }}
          >
            <ArrowRight className="h-3 w-3 rotate-90" strokeWidth={2} />
            Journey Through Time
          </div>
        </div>

        {/* Depth Visualization */}
        <div className="relative h-64 mb-4">
          {/* Layer stack */}
          {layers.map((layer, i) => {
            const isActive = currentLayer > i || stage === "complete"
            const Icon = layer.icon
            const bgColor = {
              "duck-yellow": "bg-duck-yellow",
              "teal-primary": "bg-teal-primary",
              "duck-blue": "bg-duck-blue",
              "coral": "bg-coral",
            }[layer.color]
            const borderColor = {
              "duck-yellow": "border-duck-yellow",
              "teal-primary": "border-teal-primary",
              "duck-blue": "border-duck-blue",
              "coral": "border-coral",
            }[layer.color]
            const textColor = layer.color === "duck-yellow" ? "text-charcoal" : "text-white"

            return (
              <motion.div
                key={layer.label}
                className="absolute left-4 right-4"
                style={{ top: `${i * 56 + 8}px` }}
                initial={{ opacity: 0, x: -20 }}
                animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0.2, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <div
                  className={cn(
                    "flex items-center gap-3 p-3 border-2 border-charcoal",
                    isActive ? bgColor : "bg-charcoal/5",
                    isActive && "shadow-[3px_3px_0_theme(colors.charcoal)]"
                  )}
                  style={{ borderRadius: "2px" }}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "w-10 h-10 border-2 border-charcoal flex items-center justify-center shrink-0",
                      isActive ? "bg-white/20" : "bg-charcoal/10"
                    )}
                    style={{ borderRadius: "2px" }}
                  >
                    <Icon className={cn("h-5 w-5", isActive ? textColor : "text-charcoal/30")} strokeWidth={2} />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "font-mono text-sm font-bold uppercase tracking-wide",
                      isActive ? textColor : "text-charcoal/30"
                    )}>
                      {layer.label}
                    </p>
                    <p className={cn(
                      "font-mono text-[10px] uppercase tracking-wider",
                      isActive ? `${textColor}/70` : "text-charcoal/20"
                    )}>
                      {layer.sublabel}
                    </p>
                  </div>

                  {/* Status */}
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 border-2 border-charcoal bg-white flex items-center justify-center shrink-0"
                      style={{ borderRadius: "50%" }}
                    >
                      <Check className="h-3 w-3 text-teal-primary" strokeWidth={3} />
                    </motion.div>
                  )}
                </div>

                {/* Connector line */}
                {i < layers.length - 1 && (
                  <div className="absolute left-8 top-full w-0.5 h-4 bg-charcoal/20" />
                )}
              </motion.div>
            )
          })}

          {/* Descending letter during drawing stage */}
          {stage === "drawing" && (
            <motion.div
              className="absolute z-20"
              style={{
                left: "50%",
                top: `${8 + letterDepth * 168}px`,
                transform: "translateX(-50%)",
              }}
              animate={{ x: ["-50%", "-48%", "-52%", "-50%"] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <div
                className="w-10 h-10 border-2 border-charcoal bg-duck-yellow flex items-center justify-center shadow-[3px_3px_0_theme(colors.charcoal)]"
                style={{ borderRadius: "2px" }}
              >
                <Mail className="h-5 w-5 text-charcoal" strokeWidth={2} />
              </div>
            </motion.div>
          )}
        </div>

        {/* Stage messaging */}
        <div className="text-center mb-4">
          <AnimatePresence mode="wait">
            {stage === "starting" && (
              <motion.div key="starting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="font-mono text-lg font-bold uppercase tracking-wide text-charcoal">
                  Preparing your letter...
                </p>
              </motion.div>
            )}
            {stage === "drawing" && (
              <motion.div key="drawing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="font-mono text-lg font-bold uppercase tracking-wide text-charcoal">
                  Descending through time...
                </p>
                <p className="font-mono text-sm text-charcoal/60 mt-1">{daysFromNow} days into the future</p>
              </motion.div>
            )}
            {stage === "milestones" && (
              <motion.div key="milestones" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="font-mono text-lg font-bold uppercase tracking-wide text-charcoal">
                  Passing through checkpoints...
                </p>
              </motion.div>
            )}
            {stage === "destination" && (
              <motion.div key="destination" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="font-mono text-lg font-bold uppercase tracking-wide text-charcoal">
                  Destination reached!
                </p>
                <p className="font-mono text-xl font-bold text-coral mt-1">
                  {deliveryDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              </motion.div>
            )}
            {stage === "complete" && (
              <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal">
                  Journey complete!
                </p>
                <p className="font-mono text-sm text-charcoal/60 mt-1">
                  Your letter awaits you {daysFromNow} days from now
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <AnimatedProgress progress={progress} color="duck-yellow" />
        </div>

        {stage === "complete" && (
          <FinalCTA onClick={onComplete} text="Continue to Payment" />
        )}
      </div>
    </JourneyModal>
  )
}

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function JourneyMapEnhancedPage() {
  const [activeVariation, setActiveVariation] = useState<JourneyVariation | null>(null)
  const [demoKey, setDemoKey] = useState(0)

  const variations: { id: JourneyVariation; name: string; description: string; color: string }[] = [
    {
      id: "timeline",
      name: "Timeline Journey",
      description: "Horizontal path with traveling envelope",
      color: "bg-teal-primary",
    },
    {
      id: "orbital",
      name: "Orbital Journey",
      description: "Letter orbits around future you",
      color: "bg-duck-blue",
    },
    {
      id: "depth",
      name: "Depth Journey",
      description: "Descend through layers of time",
      color: "bg-coral",
    },
  ]

  const handleComplete = () => {
    setActiveVariation(null)
  }

  const handleReplay = (id: JourneyVariation) => {
    setActiveVariation(null)
    setDemoKey(prev => prev + 1)
    setTimeout(() => setActiveVariation(id), 100)
  }

  return (
    <div className="min-h-screen bg-duck-cream p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-mono text-3xl font-bold uppercase tracking-wide text-charcoal mb-2">
            Journey Map Variations
          </h1>
          <p className="font-mono text-sm text-charcoal/60 uppercase tracking-wider">
            Enhanced journey visualizations • Same Capsule Note identity
          </p>
        </div>

        {/* Variation Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {variations.map((variation) => (
            <div
              key={variation.id}
              className="bg-white border-3 border-charcoal p-6 shadow-[4px_4px_0_theme(colors.charcoal)]"
              style={{ borderRadius: "2px" }}
            >
              <div
                className={cn(
                  "w-12 h-12 border-2 border-charcoal flex items-center justify-center mb-4",
                  variation.color
                )}
                style={{ borderRadius: "50%" }}
              >
                <Compass className="h-6 w-6 text-white" strokeWidth={2} />
              </div>

              <h2 className="font-mono text-lg font-bold uppercase tracking-wide text-charcoal mb-1">
                {variation.name}
              </h2>
              <p className="font-mono text-xs text-charcoal/60 mb-4">{variation.description}</p>

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setDemoKey(prev => prev + 1)
                    setActiveVariation(variation.id)
                  }}
                  className="flex-1 h-10 bg-duck-yellow hover:bg-duck-yellow/90 text-charcoal font-mono text-xs font-bold uppercase tracking-wider border-2 border-charcoal shadow-[2px_2px_0_theme(colors.charcoal)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                  style={{ borderRadius: "2px" }}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Demo
                </Button>
                {activeVariation === variation.id && (
                  <Button
                    onClick={() => handleReplay(variation.id)}
                    variant="outline"
                    className="h-10 px-3 border-2 border-charcoal font-mono text-xs font-bold uppercase tracking-wider shadow-[2px_2px_0_theme(colors.charcoal)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                    style={{ borderRadius: "2px" }}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Info */}
        <div
          className="bg-white/50 border-2 border-charcoal/20 p-4 text-center"
          style={{ borderRadius: "2px" }}
        >
          <p className="font-mono text-xs text-charcoal/60 uppercase tracking-wider">
            Click "Demo" to see each journey animation • Same milestones: Written → Encrypted → Scheduled → Delivered
          </p>
        </div>
      </div>

      {/* Modal Renderers */}
      <TimelineJourney
        key={`timeline-${demoKey}`}
        open={activeVariation === "timeline"}
        onComplete={handleComplete}
      />
      <OrbitalJourney
        key={`orbital-${demoKey}`}
        open={activeVariation === "orbital"}
        onComplete={handleComplete}
      />
      <DepthJourney
        key={`depth-${demoKey}`}
        open={activeVariation === "depth"}
        onComplete={handleComplete}
      />
    </div>
  )
}
