"use client"

import { useMemo, useRef } from "react"
import { format, differenceInDays } from "date-fns"
import { motion, useScroll, useTransform, useSpring } from "framer-motion"
import { cn } from "@/lib/utils"
import type { JourneyLetter } from "./types"
import { STATUS_CONFIG } from "./types"
import { EmptyState } from "./empty-state"
import { Mail, Lock, Waves, ArrowDown } from "lucide-react"

interface JourneyRiverProps {
  letters: JourneyLetter[]
}

/**
 * JOURNEY RIVER - "The Flow"
 *
 * A flowing, meditative experience where letters float like leaves on a river.
 * Vertical scroll with curved path meandering down the page.
 *
 * Design Philosophy:
 * - Meditative, contemplative experience
 * - Letters drift along a winding path
 * - NOW as a bridge crossing the river
 * - Physics-based subtle animations
 * - Strong past/future visual distinction
 */
export function JourneyRiver({ letters }: JourneyRiverProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const now = new Date()

  // Split and position letters along the river
  const { riverPath, letterNodes, nowPosition } = useMemo(() => {
    if (letters.length === 0) {
      return { riverPath: "", letterNodes: [], nowPosition: 50 }
    }

    const sorted = [...letters].sort(
      (a, b) => new Date(a.deliverAt).getTime() - new Date(b.deliverAt).getTime()
    )

    // Calculate positions along the river (0-100 vertical percentage)
    const totalSpan = 80 // Use 80% of the height, leave 10% top and bottom
    const startY = 10

    // Find NOW position
    const nowTime = now.getTime()
    const firstTime = new Date(sorted[0]!.deliverAt).getTime()
    const lastTime = new Date(sorted[sorted.length - 1]!.deliverAt).getTime()
    const timeSpan = lastTime - firstTime || 1

    // If all letters are in the past or future, adjust accordingly
    let nowY = startY + ((nowTime - firstTime) / timeSpan) * totalSpan
    nowY = Math.max(startY, Math.min(startY + totalSpan, nowY))

    // Calculate letter positions with alternating sides
    const nodes = sorted.map((letter, index) => {
      const letterTime = new Date(letter.deliverAt).getTime()
      let y = startY + ((letterTime - firstTime) / timeSpan) * totalSpan
      y = Math.max(startY, Math.min(startY + totalSpan, y))

      // Alternate sides with some randomness
      const side = index % 2 === 0 ? "left" : "right"
      const xOffset = side === "left" ? 20 + Math.random() * 15 : 65 + Math.random() * 15

      const isPast = letterTime <= nowTime

      return {
        ...letter,
        y,
        x: xOffset,
        side,
        isPast,
      }
    })

    // Generate SVG path for the river (wavy S-curves)
    let path = `M 50,0` // Start at center top
    const segments = 10
    for (let i = 0; i <= segments; i++) {
      const y = (i / segments) * 100
      const x = 50 + Math.sin((i / segments) * Math.PI * 3) * 15 // Wavy
      if (i === 0) {
        path += ` C 50,${y} ${x},${y} ${x},${y}`
      } else {
        const prevY = ((i - 1) / segments) * 100
        const prevX = 50 + Math.sin(((i - 1) / segments) * Math.PI * 3) * 15
        const cpY = (prevY + y) / 2
        path += ` C ${prevX},${cpY} ${x},${cpY} ${x},${y}`
      }
    }

    return {
      riverPath: path,
      letterNodes: nodes,
      nowPosition: nowY,
    }
  }, [letters, now])

  // Scroll-based animations
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  if (letters.length === 0) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <EmptyState variant="illustrated" />
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative min-h-[1200px]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-20 bg-cream/95 backdrop-blur-sm border-b-2 border-dashed border-charcoal/10 py-6"
      >
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <Waves className="h-5 w-5 text-teal-primary" strokeWidth={1.5} />
            <h2 className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal">
              The River of Time
            </h2>
          </div>
          <p className="font-mono text-xs text-charcoal/50">
            Let your letters drift through the currents of memory
          </p>
          <motion.div
            className="mt-3"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ArrowDown className="h-4 w-4 mx-auto text-charcoal/30" />
          </motion.div>
        </div>
      </motion.div>

      {/* River Container */}
      <div className="relative w-full" style={{ height: "1000px" }}>
        {/* River Path (SVG Background) */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            {/* River Gradient */}
            <linearGradient id="riverGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(56, 193, 176)" stopOpacity="0.1" />
              <stop offset={`${nowPosition}%`} stopColor="rgb(56, 193, 176)" stopOpacity="0.2" />
              <stop offset={`${nowPosition}%`} stopColor="rgb(111, 194, 255)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="rgb(111, 194, 255)" stopOpacity="0.1" />
            </linearGradient>

            {/* Animated Dashes */}
            <pattern id="riverDashes" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
              <line
                x1="0"
                y1="5"
                x2="10"
                y2="5"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="3 3"
              />
            </pattern>
          </defs>

          {/* River Bed (Wide) */}
          <path
            d={riverPath}
            fill="none"
            stroke="url(#riverGradient)"
            strokeWidth="20"
            strokeLinecap="round"
            className="text-charcoal"
          />

          {/* River Center Line (Animated) */}
          <motion.path
            d={riverPath}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="2 4"
            className="text-charcoal/30"
            initial={{ strokeDashoffset: 0 }}
            animate={{ strokeDashoffset: -100 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
        </svg>

        {/* NOW Bridge */}
        <motion.div
          className="absolute left-0 right-0 z-30 flex items-center justify-center"
          style={{ top: `${nowPosition}%`, transform: "translateY(-50%)" }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Bridge Structure */}
          <div className="relative w-full max-w-md">
            {/* Bridge Deck */}
            <div
              className="relative h-16 bg-cream border-4 border-charcoal shadow-[4px_4px_0_theme(colors.charcoal)] flex items-center justify-center"
              style={{ borderRadius: "2px" }}
            >
              {/* Bridge Pillars */}
              <div
                className="absolute -bottom-8 left-4 w-3 h-8 bg-charcoal"
                style={{ borderRadius: "2px" }}
              />
              <div
                className="absolute -bottom-8 right-4 w-3 h-8 bg-charcoal"
                style={{ borderRadius: "2px" }}
              />

              {/* NOW Badge */}
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="relative">
                  <div
                    className="absolute top-1 left-1 w-full h-full bg-charcoal"
                    style={{ borderRadius: "2px" }}
                  />
                  <div
                    className="relative flex items-center gap-3 bg-teal-primary border-2 border-charcoal px-6 py-3"
                    style={{ borderRadius: "2px" }}
                  >
                    <motion.div
                      className="w-3 h-3 bg-white"
                      style={{ borderRadius: "50%" }}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <span className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                      You Are Here
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Date */}
              <div className="absolute -bottom-14 left-1/2 -translate-x-1/2">
                <span
                  className="font-mono text-[11px] font-bold text-teal-primary bg-cream px-3 py-1.5 border border-teal-primary/30 whitespace-nowrap"
                  style={{ borderRadius: "2px" }}
                >
                  {format(now, "MMMM d, yyyy")}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Letter Boats */}
        {letterNodes.map((letter, index) => (
          <RiverLetter
            key={letter.id}
            letter={letter}
            index={index}
            scrollProgress={smoothProgress}
          />
        ))}

        {/* Past Label */}
        <div
          className="absolute left-4 font-mono text-xs font-bold uppercase tracking-wider text-teal-primary/50"
          style={{ top: "5%" }}
        >
          ← Past
        </div>

        {/* Future Label */}
        <div
          className="absolute left-4 font-mono text-xs font-bold uppercase tracking-wider text-duck-blue/50"
          style={{ bottom: "5%" }}
        >
          ← Future
        </div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center py-8 border-t-2 border-dashed border-charcoal/10"
      >
        <p className="font-mono text-[10px] text-charcoal/30 uppercase tracking-wider">
          Journey River - Flow Through Time
        </p>
      </motion.div>
    </div>
  )
}

// Individual Letter Component (Floating on the River)
function RiverLetter({
  letter,
  index,
  scrollProgress,
}: {
  letter: JourneyLetter & { x: number; y: number; side: string; isPast: boolean }
  index: number
  scrollProgress: any
}) {
  const config = STATUS_CONFIG[letter.status]

  // Subtle floating animation
  const floatY = useTransform(
    scrollProgress,
    [0, 1],
    [Math.sin(index) * 5, Math.sin(index + Math.PI) * 5]
  )

  return (
    <motion.div
      initial={{ opacity: 0, x: letter.side === "left" ? -30 : 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
      className="absolute z-10"
      style={{
        top: `${letter.y}%`,
        left: `${letter.x}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <motion.article
        style={{ y: floatY, borderRadius: "2px", borderWidth: "3px" }}
        whileHover={{ scale: 1.03, rotate: letter.side === "left" ? 2 : -2 }}
        className={cn(
          "relative w-64 border-[3px] bg-white cursor-pointer transition-all duration-300",
          "shadow-[5px_5px_0_theme(colors.charcoal)]",
          "hover:shadow-[8px_8px_0_theme(colors.charcoal)]",
          letter.isPast ? "border-teal-primary" : "border-duck-blue"
        )}
      >
        {/* Boat Prow (Triangle) */}
        <div
          className={cn(
            "absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0",
            "border-l-[12px] border-r-[12px] border-t-[12px]",
            "border-l-transparent border-r-transparent",
            letter.isPast ? "border-t-teal-primary" : "border-t-duck-blue"
          )}
        />

        {/* Status Icon */}
        <div className="absolute -top-3 -right-3">
          <div
            className={cn(
              "w-8 h-8 border-2 border-charcoal flex items-center justify-center",
              config.badgeBg
            )}
            style={{ borderRadius: "2px" }}
          >
            {letter.isPast ? (
              <Mail className={cn("h-4 w-4", config.badgeText)} strokeWidth={2} />
            ) : (
              <Lock className={cn("h-4 w-4", config.badgeText)} strokeWidth={2} />
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h5 className="font-mono text-sm font-bold text-charcoal line-clamp-2 mb-2 pr-6">
            {letter.title}
          </h5>

          {letter.preview && (
            <p className="font-mono text-[10px] text-charcoal/50 line-clamp-2 mb-3">
              {letter.preview}
            </p>
          )}

          {/* Dashed Line */}
          <div className="border-t-2 border-dashed border-charcoal/10 mb-2" />

          {/* Date */}
          <div className="font-mono text-[10px] text-charcoal/60 uppercase tracking-wider">
            {format(letter.deliverAt, "MMM d, yyyy")}
          </div>
        </div>
      </motion.article>
    </motion.div>
  )
}
