"use client"

import * as React from "react"
import { motion } from "framer-motion"

// Design system colors
const CONFETTI_COLORS = [
  "#3D9A8B", // teal-primary
  "#FFD93D", // duck-yellow
  "#6FC2FF", // duck-blue
  "#FF6B6B", // coral
  "#383838", // charcoal
] as const

interface ConfettiParticle {
  id: number
  isSquare: boolean
  size: number
  targetX: string
  targetY: string
  rotation: number
  duration: number
  delay: number
  color: string
}

interface BrutalistConfettiProps {
  /** Number of confetti particles (default: 50) */
  count?: number
  /** Origin X position in viewport units (default: "50vw") */
  originX?: string
  /** Origin Y position in viewport units (default: "40vh") */
  originY?: string
  /** Called when all particles have finished animating */
  onComplete?: () => void
}

export function BrutalistConfetti({
  count = 50,
  originX = "50vw",
  originY = "40vh",
  onComplete,
}: BrutalistConfettiProps) {
  // Check for reduced motion preference
  const prefersReducedMotion = React.useMemo(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }, [])

  // Pre-generate all particle properties ONCE on mount
  // This fixes the critical bug where Math.random() was called during render
  const particles = React.useMemo<ConfettiParticle[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      isSquare: Math.random() > 0.3,
      size: 8 + Math.random() * 14,
      targetX: `${15 + Math.random() * 70}vw`,
      targetY: `${Math.random() * 100}vh`,
      rotation: Math.random() * 720 - 360,
      duration: 1.8 + Math.random() * 1.2,
      delay: Math.random() * 0.4,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)] ?? "#3D9A8B",
    }))
  }, [count])

  // Track completed animations for onComplete callback
  const completedRef = React.useRef(0)
  const handleAnimationComplete = React.useCallback(() => {
    completedRef.current += 1
    if (completedRef.current >= count && onComplete) {
      onComplete()
    }
  }, [count, onComplete])

  // Skip animation for users who prefer reduced motion
  if (prefersReducedMotion) {
    return null
  }

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            opacity: 1,
            x: originX,
            y: originY,
            scale: 0,
            rotate: 0,
          }}
          animate={{
            opacity: [1, 1, 0],
            x: particle.targetX,
            y: particle.targetY,
            scale: [0, 1.2, 0.8],
            rotate: particle.rotation,
          }}
          exit={{
            opacity: 0,
            scale: 0,
          }}
          transition={{
            duration: particle.duration,
            ease: "easeOut",
            delay: particle.delay,
          }}
          onAnimationComplete={handleAnimationComplete}
          className="absolute"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            borderRadius: particle.isSquare ? "2px" : "50%",
            border: particle.isSquare ? "2px solid #383838" : "none",
          }}
        />
      ))}
    </div>
  )
}
