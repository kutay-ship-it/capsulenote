"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface CapsuleIllustrationProps {
  state?: "closed" | "opening" | "sealing" | "sealed"
  size?: "sm" | "md" | "lg"
  className?: string
}

export function CapsuleIllustration({
  state = "closed",
  size = "md",
  className,
}: CapsuleIllustrationProps) {
  const sizes = {
    sm: { width: 80, height: 100 },
    md: { width: 120, height: 150 },
    lg: { width: 160, height: 200 },
  }

  const { width, height } = sizes[size]

  return (
    <motion.div
      className={cn("relative", className)}
      style={{ width, height }}
      animate={
        state === "closed"
          ? { scale: [1, 1.02, 1] }
          : state === "sealing"
            ? { rotateY: [0, 180, 360] }
            : {}
      }
      transition={
        state === "closed"
          ? { duration: 3, repeat: Infinity, ease: "easeInOut" }
          : state === "sealing"
            ? { duration: 1.5, ease: "easeInOut" }
            : {}
      }
    >
      {/* Main Capsule Body */}
      <motion.div
        className="absolute inset-0 bg-duck-yellow border-3 border-charcoal"
        style={{
          borderRadius: `${width / 4}px`,
          borderWidth: "3px",
        }}
      >
        {/* Decorative lines */}
        <div className="absolute top-1/4 left-3 right-3 h-0.5 bg-charcoal/20" />
        <div className="absolute top-1/2 left-3 right-3 h-0.5 bg-charcoal/20" />
        <div className="absolute top-3/4 left-3 right-3 h-0.5 bg-charcoal/20" />
      </motion.div>

      {/* Lid */}
      <motion.div
        className="absolute bg-coral border-3 border-charcoal"
        style={{
          borderRadius: `${width / 4}px ${width / 4}px 0 0`,
          borderWidth: "3px",
          width: "100%",
          height: "30%",
          transformOrigin: "center bottom",
        }}
        animate={
          state === "opening"
            ? { rotateX: -120, y: -20 }
            : state === "sealed"
              ? { rotateX: 0, y: 0 }
              : {}
        }
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Lid handle */}
        <div
          className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-charcoal"
          style={{ borderRadius: "2px" }}
        />
      </motion.div>

      {/* Clock/Timer icon in center */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-white border-2 border-charcoal flex items-center justify-center"
        style={{ borderRadius: "50%" }}
        animate={state === "sealed" ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {/* Clock hands */}
        <div className="relative w-full h-full">
          {/* Hour hand */}
          <motion.div
            className="absolute top-1/2 left-1/2 w-1 h-1/4 bg-charcoal origin-bottom"
            style={{
              borderRadius: "2px",
              transform: "translate(-50%, -100%)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 43200, repeat: Infinity, ease: "linear" }}
          />
          {/* Minute hand */}
          <motion.div
            className="absolute top-1/2 left-1/2 w-0.5 h-1/3 bg-teal-primary origin-bottom"
            style={{
              borderRadius: "2px",
              transform: "translate(-50%, -100%)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 3600, repeat: Infinity, ease: "linear" }}
          />
          {/* Center dot */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-coral"
            style={{ borderRadius: "50%" }}
          />
        </div>
      </motion.div>

      {/* Shadow */}
      <div
        className="absolute -bottom-2 -right-2 w-full h-full bg-charcoal -z-10"
        style={{ borderRadius: `${width / 4}px` }}
      />

      {/* Sparkles for sealed state */}
      {state === "sealed" && (
        <>
          <motion.div
            className="absolute -top-4 -left-4 w-3 h-3 bg-duck-yellow border border-charcoal"
            style={{ borderRadius: "50%" }}
            animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="absolute -top-2 -right-6 w-2 h-2 bg-coral border border-charcoal"
            style={{ borderRadius: "50%" }}
            animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          />
          <motion.div
            className="absolute top-1/4 -right-4 w-2.5 h-2.5 bg-teal-primary border border-charcoal"
            style={{ borderRadius: "50%" }}
            animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
          />
        </>
      )}
    </motion.div>
  )
}

// Simple flow illustration: Write -> Wait -> Receive
export function FlowIllustration({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn("flex items-center justify-center gap-4", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Write */}
      <motion.div
        className="flex flex-col items-center gap-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div
          className="w-16 h-16 bg-duck-yellow border-2 border-charcoal flex items-center justify-center shadow-[3px_3px_0_theme(colors.charcoal)]"
          style={{ borderRadius: "2px" }}
        >
          <span className="text-2xl">✍️</span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-charcoal font-bold">
          Write
        </span>
      </motion.div>

      {/* Arrow 1 */}
      <motion.div
        className="flex items-center"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="w-8 h-0.5 bg-charcoal" />
        <div className="w-0 h-0 border-t-4 border-b-4 border-l-8 border-transparent border-l-charcoal" />
      </motion.div>

      {/* Wait */}
      <motion.div
        className="flex flex-col items-center gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div
          className="w-16 h-16 bg-duck-blue border-2 border-charcoal flex items-center justify-center shadow-[3px_3px_0_theme(colors.charcoal)]"
          style={{ borderRadius: "2px" }}
        >
          <motion.span
            className="text-2xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ⏳
          </motion.span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-charcoal font-bold">
          Wait
        </span>
      </motion.div>

      {/* Arrow 2 */}
      <motion.div
        className="flex items-center"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.6 }}
      >
        <div className="w-8 h-0.5 bg-charcoal" />
        <div className="w-0 h-0 border-t-4 border-b-4 border-l-8 border-transparent border-l-charcoal" />
      </motion.div>

      {/* Receive */}
      <motion.div
        className="flex flex-col items-center gap-2"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div
          className="w-16 h-16 bg-teal-primary border-2 border-charcoal flex items-center justify-center shadow-[3px_3px_0_theme(colors.charcoal)]"
          style={{ borderRadius: "2px" }}
        >
          <motion.span
            className="text-2xl"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            💌
          </motion.span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wider text-charcoal font-bold">
          Receive
        </span>
      </motion.div>
    </motion.div>
  )
}
