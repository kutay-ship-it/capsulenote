"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface CapsuleIllustrationProps {
  state?: "closed" | "sealed"
  size?: "sm" | "md" | "lg"
  /** Use responsive sizing based on viewport - recommended for mobile */
  responsive?: boolean
  className?: string
}

/**
 * Animated time capsule illustration
 * Used in welcome and ready steps
 *
 * When responsive=true, uses CSS-based sizing that adapts to mobile:
 * - lg: 120px mobile → 160px desktop
 * - md: 100px mobile → 120px desktop
 * - sm: 60px mobile → 80px desktop
 */
export function CapsuleIllustration({
  state = "closed",
  size = "md",
  responsive = true,
  className,
}: CapsuleIllustrationProps) {
  // Fixed pixel sizes for non-responsive usage
  const fixedSizes = {
    sm: { width: 80, height: 100 },
    md: { width: 120, height: 150 },
    lg: { width: 160, height: 200 },
  }

  // Responsive CSS class names
  const responsiveClasses = {
    sm: "w-[60px] h-[75px] sm:w-[80px] sm:h-[100px]",
    md: "w-[100px] h-[125px] sm:w-[120px] sm:h-[150px]",
    lg: "w-[120px] h-[150px] sm:w-[140px] sm:h-[175px] md:w-[160px] md:h-[200px]",
  }

  const { width, height } = fixedSizes[size]

  return (
    <motion.div
      className={cn(
        "relative",
        responsive ? responsiveClasses[size] : "",
        className
      )}
      style={responsive ? undefined : { width, height }}
      animate={
        state === "closed"
          ? { scale: [1, 1.02, 1] }
          : {}
      }
      transition={
        state === "closed"
          ? { duration: 3, repeat: Infinity, ease: "easeInOut" }
          : {}
      }
    >
      {/* Main Capsule Body */}
      <div
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
      </div>

      {/* Lid */}
      <div
        className="absolute bg-coral border-3 border-charcoal"
        style={{
          borderRadius: `${width / 4}px ${width / 4}px 0 0`,
          borderWidth: "3px",
          width: "100%",
          height: "30%",
        }}
      >
        {/* Lid handle */}
        <div
          className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-charcoal"
          style={{ borderRadius: "2px" }}
        />
      </div>

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

/**
 * Flow illustration showing Write -> Wait -> Receive
 * Responsive: scales down on mobile
 */
export function FlowIllustration({ className }: { className?: string }) {
  return (
    <motion.div
      className={cn("flex items-center justify-center gap-2 sm:gap-4", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Write */}
      <FlowStep emoji="✍️" label="Write" color="bg-duck-yellow" delay={0.1} />

      {/* Arrow 1 */}
      <FlowArrow delay={0.3} />

      {/* Wait */}
      <FlowStep emoji="⏳" label="Wait" color="bg-duck-blue" delay={0.4} animated />

      {/* Arrow 2 */}
      <FlowArrow delay={0.6} />

      {/* Receive */}
      <FlowStep emoji="💌" label="Receive" color="bg-teal-primary" delay={0.7} bounce />
    </motion.div>
  )
}

function FlowStep({
  emoji,
  label,
  color,
  delay,
  animated,
  bounce,
}: {
  emoji: string
  label: string
  color: string
  delay: number
  animated?: boolean
  bounce?: boolean
}) {
  return (
    <motion.div
      className="flex flex-col items-center gap-1 sm:gap-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <div
        className={cn(
          "w-12 h-12 sm:w-16 sm:h-16 border-2 border-charcoal flex items-center justify-center shadow-[2px_2px_0_theme(colors.charcoal)] sm:shadow-[3px_3px_0_theme(colors.charcoal)]",
          color
        )}
        style={{ borderRadius: "2px" }}
      >
        <motion.span
          className="text-lg sm:text-2xl"
          animate={
            animated
              ? { rotate: [0, 10, -10, 0] }
              : bounce
                ? { y: [0, -5, 0] }
                : {}
          }
          transition={{ duration: animated ? 2 : 1.5, repeat: Infinity }}
        >
          {emoji}
        </motion.span>
      </div>
      <span className="font-mono text-[8px] sm:text-[10px] uppercase tracking-wider text-charcoal font-bold">
        {label}
      </span>
    </motion.div>
  )
}

function FlowArrow({ delay }: { delay: number }) {
  return (
    <motion.div
      className="flex items-center"
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ delay }}
    >
      <div className="w-4 sm:w-8 h-0.5 bg-charcoal" />
      <div className="w-0 h-0 border-t-[3px] border-b-[3px] border-l-[6px] sm:border-t-4 sm:border-b-4 sm:border-l-8 border-transparent border-l-charcoal" />
    </motion.div>
  )
}
