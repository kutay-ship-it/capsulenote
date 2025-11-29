"use client"

import { useRef, useState, useEffect } from "react"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { cn } from "@/lib/utils"
import { TrustBadges } from "./shared/trust-badges"
import { X, ChevronDown, ArrowRight, Sparkles } from "lucide-react"

interface OnboardingNarrativeProps {
  onComplete: () => void
  onSkip: () => void
}

/**
 * ONBOARDING NARRATIVE - "The Timeline"
 *
 * A dramatic, scroll-driven storytelling experience.
 * Users scroll through sections that reveal the story
 * of how Capsule Note works and why it matters.
 *
 * Sections:
 * 1. The Hook - Bold typography that grabs attention
 * 2. The Concept - Visual timeline of write → receive
 * 3. The Magic - Emotional reveal of receiving a letter
 * 4. The Trust - Security badges and privacy assurance
 * 5. The CTA - Clear call to start writing
 */
export function OnboardingNarrative({ onComplete, onSkip }: OnboardingNarrativeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Ensure component is mounted before using scroll animations
  // This prevents the "Target ref is defined but not hydrated" error
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const { scrollYProgress } = useScroll({
    container: isMounted ? containerRef : undefined,
    offset: ["start start", "end end"],
  })

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  // Progress bar width
  const progressWidth = useTransform(smoothProgress, [0, 1], ["0%", "100%"])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative w-full max-w-3xl h-[600px] bg-cream border-3 border-charcoal shadow-[8px_8px_0_theme(colors.charcoal)] overflow-hidden"
      style={{ borderRadius: "2px", borderWidth: "3px" }}
    >
      {/* Fixed Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-cream/95 backdrop-blur-sm border-b-2 border-dashed border-charcoal/20 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 bg-duck-yellow border-2 border-charcoal flex items-center justify-center shadow-[2px_2px_0_theme(colors.charcoal)]"
              style={{ borderRadius: "2px" }}
            >
              <span className="text-sm">✨</span>
            </div>
            <span className="font-mono text-xs uppercase tracking-wider text-charcoal/60">
              Your Journey Begins
            </span>
          </div>
          <button
            onClick={onSkip}
            className="p-1.5 hover:bg-charcoal/5 transition-colors"
            style={{ borderRadius: "2px" }}
          >
            <X className="h-4 w-4 text-charcoal/40" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-2 h-1 bg-charcoal/10 overflow-hidden" style={{ borderRadius: "2px" }}>
          <motion.div
            className="h-full bg-teal-primary"
            style={{ width: progressWidth }}
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <div
        ref={containerRef}
        className="h-full overflow-y-auto scroll-smooth pt-20 pb-24"
        style={{ scrollSnapType: "y proximity" }}
      >
        {/* Section 1: The Hook */}
        <Section1Hook scrollProgress={smoothProgress} />

        {/* Section 2: The Concept */}
        <Section2Concept scrollProgress={smoothProgress} />

        {/* Section 3: The Magic */}
        <Section3Magic scrollProgress={smoothProgress} />

        {/* Section 4: The Trust */}
        <Section4Trust scrollProgress={smoothProgress} />

        {/* Section 5: The CTA */}
        <Section5CTA onComplete={onComplete} />
      </div>

      {/* Fixed Skip Button */}
      <div className="absolute bottom-4 left-4 z-20">
        <button
          onClick={onSkip}
          className="font-mono text-[10px] text-charcoal/40 uppercase tracking-wider hover:text-charcoal/60 transition-colors"
        >
          Skip intro →
        </button>
      </div>
    </motion.div>
  )
}

// Section 1: The Hook
function Section1Hook({ scrollProgress }: { scrollProgress: any }) {
  const opacity = useTransform(scrollProgress, [0, 0.15], [1, 0])
  const y = useTransform(scrollProgress, [0, 0.15], [0, -50])

  return (
    <motion.section
      style={{ opacity, y }}
      className="min-h-[500px] flex flex-col items-center justify-center text-center px-8 scroll-snap-start"
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <div className="relative inline-block">
          <h1 className="font-mono text-4xl md:text-5xl font-bold uppercase tracking-tight text-charcoal leading-tight">
            Your Future<br />
            <span className="text-teal-primary">Self</span><br />
            Is Waiting
          </h1>
          {/* Decorative underline */}
          <motion.div
            className="absolute -bottom-2 left-0 right-0 h-1 bg-duck-yellow"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            style={{ transformOrigin: "left" }}
          />
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="font-mono text-sm text-charcoal/50 mb-8 max-w-sm"
      >
        Write a letter today. Receive it tomorrow, next month, or next year.
        A conversation across time with yourself.
      </motion.p>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex flex-col items-center gap-2"
      >
        <span className="font-mono text-[10px] text-charcoal/30 uppercase tracking-wider">
          Scroll to discover
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown className="h-5 w-5 text-charcoal/30" />
        </motion.div>
      </motion.div>
    </motion.section>
  )
}

// Section 2: The Concept
function Section2Concept({ scrollProgress }: { scrollProgress: any }) {
  const opacity = useTransform(scrollProgress, [0.1, 0.2, 0.35, 0.45], [0, 1, 1, 0])
  const y = useTransform(scrollProgress, [0.1, 0.2], [50, 0])

  return (
    <motion.section
      style={{ opacity, y }}
      className="min-h-[500px] flex flex-col items-center justify-center text-center px-8 scroll-snap-start"
    >
      <motion.div
        className="inline-flex items-center gap-2 bg-charcoal text-white px-3 py-1 mb-8"
        style={{ borderRadius: "2px" }}
      >
        <span className="font-mono text-[10px] uppercase tracking-wider">The Concept</span>
      </motion.div>

      {/* Timeline Visual */}
      <div className="relative w-full max-w-xl">
        {/* Connection Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-charcoal/10 -translate-y-1/2" />

        <div className="relative flex items-center justify-between">
          {/* Today */}
          <TimelineNode
            label="Today"
            emoji="✍️"
            color="bg-duck-yellow"
            description="Write your thoughts"
            delay={0}
          />

          {/* Arrow */}
          <motion.div
            className="flex-1 flex items-center justify-center relative"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              className="absolute h-1 bg-teal-primary"
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              transition={{ delay: 0.4, duration: 0.8 }}
              style={{ left: 0 }}
            />
          </motion.div>

          {/* Tomorrow */}
          <TimelineNode
            label="Tomorrow"
            emoji="💌"
            color="bg-teal-primary"
            description="Receive your letter"
            delay={0.6}
          />
        </div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="font-mono text-xs text-charcoal/40 mt-8"
      >
        It&apos;s that simple. Write now. Receive later.
      </motion.p>
    </motion.section>
  )
}

function TimelineNode({
  label,
  emoji,
  color,
  description,
  delay,
}: {
  label: string
  emoji: string
  color: string
  description: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="flex flex-col items-center"
    >
      <motion.div
        className={cn(
          "w-20 h-20 border-3 border-charcoal flex items-center justify-center shadow-[4px_4px_0_theme(colors.charcoal)]",
          color
        )}
        style={{ borderRadius: "2px", borderWidth: "3px" }}
        whileHover={{ y: -3 }}
      >
        <span className="text-3xl">{emoji}</span>
      </motion.div>
      <span className="font-mono text-sm font-bold uppercase tracking-wide text-charcoal mt-3">
        {label}
      </span>
      <span className="font-mono text-[10px] text-charcoal/50 mt-1">
        {description}
      </span>
    </motion.div>
  )
}

// Section 3: The Magic
function Section3Magic({ scrollProgress }: { scrollProgress: any }) {
  const opacity = useTransform(scrollProgress, [0.35, 0.45, 0.6, 0.7], [0, 1, 1, 0])
  const y = useTransform(scrollProgress, [0.35, 0.45], [50, 0])

  return (
    <motion.section
      style={{ opacity, y }}
      className="min-h-[500px] flex flex-col items-center justify-center text-center px-8 scroll-snap-start"
    >
      <motion.div
        className="inline-flex items-center gap-2 bg-coral text-white px-3 py-1 mb-8"
        style={{ borderRadius: "2px" }}
      >
        <span className="font-mono text-[10px] uppercase tracking-wider">The Magic Moment</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md mb-6"
      >
        {/* Mock Email Preview */}
        <div
          className="bg-white border-3 border-charcoal shadow-[6px_6px_0_theme(colors.charcoal)] overflow-hidden"
          style={{ borderRadius: "2px", borderWidth: "3px" }}
        >
          {/* Email Header */}
          <div className="flex items-center gap-3 p-3 bg-charcoal/5 border-b-2 border-dashed border-charcoal/20">
            <div className="w-8 h-8 bg-teal-primary/20 flex items-center justify-center" style={{ borderRadius: "50%" }}>
              <span className="text-sm">💌</span>
            </div>
            <div className="text-left">
              <div className="font-mono text-xs font-bold text-charcoal">
                Letter from Past You
              </div>
              <div className="font-mono text-[10px] text-charcoal/50">
                via Capsule Note
              </div>
            </div>
          </div>

          {/* Email Body */}
          <div className="p-4 text-left">
            <div className="font-mono text-sm text-charcoal/80 italic leading-relaxed">
              &ldquo;Dear Future Me,
              <br /><br />
              If you&apos;re reading this, it means you made it through.
              Remember how scared you were? Look at you now...&rdquo;
            </div>

            {/* Blur overlay */}
            <div className="mt-4 h-20 bg-gradient-to-t from-white via-white/90 to-transparent" />
          </div>
        </div>

        {/* Glow effect */}
        <motion.div
          className="absolute -inset-4 bg-duck-yellow/20 -z-10 blur-xl"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ borderRadius: "2px" }}
        />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="font-mono text-sm text-charcoal/60 max-w-sm"
      >
        Imagine receiving a letter from yourself, written months or years ago.
        What would past you want to tell present you?
      </motion.p>
    </motion.section>
  )
}

// Section 4: Trust
function Section4Trust({ scrollProgress }: { scrollProgress: any }) {
  const opacity = useTransform(scrollProgress, [0.6, 0.7, 0.85, 0.9], [0, 1, 1, 0])
  const y = useTransform(scrollProgress, [0.6, 0.7], [50, 0])

  return (
    <motion.section
      style={{ opacity, y }}
      className="min-h-[500px] flex flex-col items-center justify-center text-center px-8 scroll-snap-start"
    >
      <motion.div
        className="inline-flex items-center gap-2 bg-teal-primary text-white px-3 py-1 mb-8"
        style={{ borderRadius: "2px" }}
      >
        <span className="font-mono text-[10px] uppercase tracking-wider">Your Privacy Matters</span>
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal mb-3"
      >
        Your Words Are Sacred
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="font-mono text-xs text-charcoal/50 mb-8 max-w-sm"
      >
        Every letter is encrypted before leaving your device.
        Not even our team can read what you write.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-lg"
      >
        <TrustBadges variant="inline" />
      </motion.div>
    </motion.section>
  )
}

// Section 5: CTA
function Section5CTA({ onComplete }: { onComplete: () => void }) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      className="min-h-[400px] flex flex-col items-center justify-center text-center px-8 scroll-snap-start"
    >
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.4 }}
        className="w-16 h-16 bg-duck-yellow border-2 border-charcoal flex items-center justify-center shadow-[4px_4px_0_theme(colors.charcoal)] mb-6"
        style={{ borderRadius: "50%" }}
      >
        <Sparkles className="h-8 w-8 text-charcoal" />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        className="font-mono text-2xl font-bold uppercase tracking-wide text-charcoal mb-3"
      >
        Begin Your Journey
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="font-mono text-sm text-charcoal/50 mb-8 max-w-sm"
      >
        The best time to write to your future self is right now.
      </motion.p>

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onClick={onComplete}
        whileHover={{ y: -3 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "flex items-center gap-3 border-3 border-charcoal bg-teal-primary text-white px-8 py-4 font-mono text-sm font-bold uppercase tracking-wider",
          "shadow-[5px_5px_0_theme(colors.charcoal)]",
          "hover:shadow-[7px_7px_0_theme(colors.charcoal)]",
          "transition-shadow"
        )}
        style={{ borderRadius: "2px", borderWidth: "3px" }}
      >
        Write Your First Letter
        <ArrowRight className="h-5 w-5" />
      </motion.button>

      {/* Inspirational quote */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 flex items-center gap-2"
      >
        <span className="w-8 h-0.5 bg-charcoal/10" />
        <span className="font-mono text-[10px] text-charcoal/30 italic">
          &ldquo;The future is a blank page. Start writing.&rdquo;
        </span>
        <span className="w-8 h-0.5 bg-charcoal/10" />
      </motion.div>
    </motion.section>
  )
}
