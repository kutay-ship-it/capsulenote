"use client"

import { motion } from "framer-motion"
import { Stamp, Sparkles } from "lucide-react"

// Brutalist confetti colors
const CONFETTI_COLORS = [
  "#3D9A8B", // teal-primary
  "#FFD93D", // duck-yellow
  "#6FC2FF", // duck-blue
  "#FF6B6B", // coral
  "#383838", // charcoal
]

function BrutalistConfetti() {
  const confettiCount = 50

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
      {Array.from({ length: confettiCount }).map((_, i) => {
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

export function UnlockAnimationV3() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center space-y-8"
    >
      {/* Confetti burst */}
      <BrutalistConfetti />

      {/* Breaking seal animation */}
      <motion.div
        initial={{ scale: 1, rotate: 0 }}
        animate={{
          scale: [1, 1.3, 1.5, 0],
          rotate: [0, -15, 15, 0],
        }}
        transition={{
          duration: 1.5,
          times: [0, 0.3, 0.6, 1],
          ease: "easeInOut",
        }}
        className="relative w-28 h-28 border-4 border-charcoal bg-coral flex items-center justify-center shadow-[6px_6px_0_theme(colors.charcoal)]"
        style={{ borderRadius: "50%" }}
      >
        <Stamp className="h-14 w-14 text-white" strokeWidth={1.5} />

        {/* Breaking cracks effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1, times: [0, 0.4, 1] }}
          className="absolute inset-0"
        >
          {[0, 45, 90, 135].map((rotation) => (
            <motion.div
              key={rotation}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: [0, 1, 1.5] }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="absolute left-1/2 top-1/2 w-0.5 h-full bg-charcoal origin-center"
              style={{ rotate: `${rotation}deg`, translateX: "-50%", translateY: "-50%" }}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Opening text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col items-center gap-3"
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          >
            <Sparkles className="h-5 w-5 text-teal-primary" strokeWidth={2} />
          </motion.div>
          <span className="font-mono text-lg font-bold uppercase tracking-wider text-charcoal">
            Opening your time capsule...
          </span>
        </div>

        {/* Progress bar */}
        <motion.div
          className="w-48 h-2 border-2 border-charcoal bg-white overflow-hidden"
          style={{ borderRadius: "2px" }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
            className="h-full bg-teal-primary"
          />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
