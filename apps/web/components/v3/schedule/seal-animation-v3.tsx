"use client"

import * as React from "react"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { Stamp, Sparkles, Mail, Calendar, Check, Clock } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"

interface SealAnimationV3Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  letterTitle: string
  deliveryDate: Date
  recipientEmail: string
  onComplete: () => void
}

// Brutalist confetti colors from design system
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
        const size = 8 + Math.random() * 14

        return (
          <motion.div
            key={i}
            initial={{
              opacity: 1,
              x: "50vw",
              y: "40vh",
              scale: 0,
              rotate: 0,
            }}
            animate={{
              opacity: [1, 1, 0],
              x: `${15 + Math.random() * 70}vw`,
              y: `${Math.random() * 100}vh`,
              scale: [0, 1.2, 0.8],
              rotate: Math.random() * 720 - 360,
            }}
            transition={{
              duration: 1.8 + Math.random() * 1.2,
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

// Animated wax seal stamp
function WaxSealAnimation({ phase }: { phase: "stamping" | "sealed" }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180, y: -50 }}
      animate={
        phase === "stamping"
          ? {
              scale: [0, 1.4, 1],
              rotate: [-180, 15, 0],
              y: [-50, 0, 0],
            }
          : {
              scale: 1,
              rotate: 0,
              y: 0,
            }
      }
      transition={{
        duration: 1.2,
        times: [0, 0.5, 1],
        ease: "easeOut",
      }}
      className="relative flex h-28 w-28 items-center justify-center"
    >
      {/* Outer ring */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="absolute inset-0 border-4 border-charcoal bg-coral"
        style={{
          borderRadius: "50%",
          boxShadow: "6px 6px 0px 0px rgb(56, 56, 56)",
        }}
      />

      {/* Inner stamp mark */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.4, ease: "backOut" }}
        className="relative z-10"
      >
        <Stamp className="h-14 w-14 text-white" strokeWidth={1.5} />
      </motion.div>

      {/* Sparkle accents */}
      {phase === "sealed" && (
        <>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.3 }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="h-6 w-6 text-duck-yellow" strokeWidth={2} />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.3 }}
            className="absolute -bottom-1 -left-2"
          >
            <Sparkles className="h-5 w-5 text-duck-blue" strokeWidth={2} />
          </motion.div>
        </>
      )}
    </motion.div>
  )
}

export function SealAnimationV3({
  open,
  onOpenChange,
  letterTitle,
  deliveryDate,
  recipientEmail,
  onComplete,
}: SealAnimationV3Props) {
  const [showConfetti, setShowConfetti] = React.useState(false)
  const [phase, setPhase] = React.useState<"stamping" | "sealed">("stamping")

  React.useEffect(() => {
    if (open) {
      setPhase("stamping")
      setShowConfetti(false)

      // Stamping animation sequence
      const sealTimer = setTimeout(() => {
        setPhase("sealed")
        setShowConfetti(true)
      }, 1800)

      // Auto-complete after celebration
      const completeTimer = setTimeout(() => {
        onComplete()
      }, 4500)

      return () => {
        clearTimeout(sealTimer)
        clearTimeout(completeTimer)
      }
    }
  }, [open, onComplete])

  const formattedDate = format(deliveryDate, "EEEE, MMMM d, yyyy")
  const formattedTime = format(deliveryDate, "h:mm a")
  const daysFromNow = Math.ceil((deliveryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md overflow-visible border-2 border-charcoal bg-white p-0"
        style={{
          borderRadius: "2px",
          boxShadow: "8px 8px 0px 0px rgb(56, 56, 56)",
        }}
      >
        <DialogTitle className="sr-only">Your letter has been sealed and scheduled</DialogTitle>

        {/* Confetti Burst */}
        <AnimatePresence>
          {showConfetti && <BrutalistConfetti />}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {phase === "stamping" ? (
            <motion.div
              key="stamping"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center p-12 text-center bg-duck-cream"
            >
              {/* Animated Wax Seal */}
              <WaxSealAnimation phase={phase} />

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6 font-mono text-xl font-bold uppercase tracking-wide text-charcoal"
              >
                Sealing Your Letter...
              </motion.h2>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-4 flex items-center gap-2"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="h-4 w-4 border-2 border-charcoal border-t-transparent"
                  style={{ borderRadius: "50%" }}
                />
                <span className="font-mono text-xs uppercase tracking-wider text-charcoal/60">
                  Encrypting & Scheduling
                </span>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="sealed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col"
            >
              {/* Success Header */}
              <div className="relative border-b-2 border-charcoal bg-teal-primary p-8 text-center">
                {/* Success Badge */}
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1 bg-charcoal font-mono text-[10px] font-bold uppercase tracking-wider text-white z-10"
                  style={{ borderRadius: "2px" }}
                >
                  <Check className="h-3 w-3" strokeWidth={3} />
                  <span>Scheduled!</span>
                </motion.div>

                {/* Success Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
                  className="mx-auto mb-4 mt-2 flex h-20 w-20 items-center justify-center border-4 border-charcoal bg-white shadow-[4px_4px_0_theme(colors.charcoal)]"
                  style={{ borderRadius: "50%" }}
                >
                  <Sparkles className="h-10 w-10 text-teal-primary" strokeWidth={1.5} />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="font-mono text-2xl font-bold uppercase tracking-wide text-white"
                >
                  Letter Sealed!
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-1 font-mono text-xs text-white/80 uppercase tracking-wider"
                >
                  Your message is now locked until delivery
                </motion.p>
              </div>

              {/* Delivery Details */}
              <div className="p-6 space-y-4">
                {/* Letter Title */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-3 border-2 border-charcoal p-3"
                  style={{ borderRadius: "2px" }}
                >
                  <div
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center border-2 border-charcoal bg-duck-yellow"
                    style={{ borderRadius: "2px" }}
                  >
                    <Mail className="h-4 w-4 text-charcoal" strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50">
                      Your Letter
                    </p>
                    <p className="font-mono text-xs font-bold text-charcoal truncate">
                      "{letterTitle}"
                    </p>
                  </div>
                </motion.div>

                {/* Delivery Date & Time */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center gap-3 border-2 border-teal-primary bg-teal-primary/10 p-3"
                  style={{ borderRadius: "2px" }}
                >
                  <div
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center border-2 border-charcoal bg-teal-primary"
                    style={{ borderRadius: "2px" }}
                  >
                    <Calendar className="h-4 w-4 text-white" strokeWidth={2} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50">
                      Arrives On
                    </p>
                    <p className="font-mono text-xs font-bold text-charcoal">
                      {formattedDate}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-charcoal/60">
                        at {formattedTime}
                      </span>
                      <span className="font-mono text-[10px] text-teal-primary font-bold">
                        {daysFromNow === 0
                          ? "Today!"
                          : daysFromNow === 1
                            ? "Tomorrow!"
                            : `${daysFromNow} days from now`}
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Countdown Preview */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-center justify-center gap-4 py-3"
                >
                  <div className="text-center">
                    <p className="font-mono text-2xl font-bold text-charcoal">{daysFromNow}</p>
                    <p className="font-mono text-[9px] uppercase tracking-wider text-charcoal/50">
                      {daysFromNow === 1 ? "Day" : "Days"}
                    </p>
                  </div>
                  <div
                    className="h-8 w-px bg-charcoal/20"
                    style={{ transform: "rotate(15deg)" }}
                  />
                  <div className="text-center">
                    <p className="font-mono text-2xl font-bold text-charcoal">
                      {Math.ceil(daysFromNow / 7)}
                    </p>
                    <p className="font-mono text-[9px] uppercase tracking-wider text-charcoal/50">
                      {Math.ceil(daysFromNow / 7) === 1 ? "Week" : "Weeks"}
                    </p>
                  </div>
                  <div
                    className="h-8 w-px bg-charcoal/20"
                    style={{ transform: "rotate(15deg)" }}
                  />
                  <div className="text-center">
                    <p className="font-mono text-2xl font-bold text-charcoal">
                      {Math.ceil(daysFromNow / 30)}
                    </p>
                    <p className="font-mono text-[9px] uppercase tracking-wider text-charcoal/50">
                      {Math.ceil(daysFromNow / 30) === 1 ? "Month" : "Months"}
                    </p>
                  </div>
                </motion.div>

                {/* Recipient */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="text-center py-2 border-t-2 border-dashed border-charcoal/20"
                >
                  <p className="font-mono text-[10px] text-charcoal/50 uppercase tracking-wider">
                    Delivering to
                  </p>
                  <p className="font-mono text-xs font-bold text-charcoal mt-0.5">
                    {recipientEmail}
                  </p>
                </motion.div>
              </div>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="flex items-center justify-center gap-2 border-t-2 border-charcoal bg-duck-cream p-4"
              >
                <Clock className="h-4 w-4 text-charcoal/40" strokeWidth={2} />
                <p className="font-mono text-[10px] text-charcoal/60 uppercase tracking-wider">
                  Redirecting to your letter...
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
