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

function stringToSeed(input: string): number {
  // FNV-1a 32-bit hash
  let hash = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0
  return () => {
    t = (t + 0x6d2b79f5) >>> 0
    let x = t
    x = Math.imul(x ^ (x >>> 15), x | 1)
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61)
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

interface ConfettiParticle {
  id: number
  isSquare: boolean
  size: number
  // Use pixel offsets for reliable animation
  offsetX: number
  offsetY: number
  rotation: number
  duration: number
  delay: number
  color: string
}

interface BrutalistConfettiProps {
  /** Number of confetti particles (default: 50) */
  count?: number
  /** Called when all particles have finished animating */
  onComplete?: () => void
}

export function BrutalistConfetti({
  count = 50,
  onComplete,
}: BrutalistConfettiProps) {
  const instanceId = React.useId()

  // Check for reduced motion preference
  const prefersReducedMotion = React.useMemo(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }, [])

  // Pre-generate all particle properties ONCE on mount
  // Uses pixel offsets for reliable burst animation from center
  const particles = React.useMemo<ConfettiParticle[]>(() => {
    const rand = mulberry32(stringToSeed(`${instanceId}:${count}`))

    // Calculate burst distance based on viewport
    const burstX = typeof window !== "undefined" ? window.innerWidth * 0.5 : 400
    const burstY = typeof window !== "undefined" ? window.innerHeight * 0.6 : 500

    return Array.from({ length: count }, (_, i) => ({
      id: i,
      isSquare: rand() > 0.3,
      size: 8 + rand() * 14,
      // Random burst direction from center
      offsetX: (rand() - 0.5) * burstX * 2,
      offsetY: (rand() - 0.3) * burstY * 2, // Bias slightly upward
      rotation: rand() * 720 - 360,
      duration: 1.5 + rand() * 1,
      delay: rand() * 0.3,
      color: CONFETTI_COLORS[Math.floor(rand() * CONFETTI_COLORS.length)] ?? "#3D9A8B",
    }))
  }, [count, instanceId])

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
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-[9999]">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          initial={{
            opacity: 1,
            x: 0,
            y: 0,
            scale: 0,
            rotate: 0,
          }}
          animate={{
            opacity: [1, 1, 0],
            x: particle.offsetX,
            y: particle.offsetY,
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
            // Position at center of viewport
            left: "50%",
            top: "40%",
            marginLeft: -particle.size / 2,
            marginTop: -particle.size / 2,
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
