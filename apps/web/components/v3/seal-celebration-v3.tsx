"use client"

import * as React from "react"
import { format } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { Stamp, Sparkles, Mail, Calendar, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { BrutalistConfetti } from "@/components/animations/brutalist-confetti"

interface SealCelebrationV3Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  letterTitle: string
  deliveryDate: Date
  recipientEmail: string
  onComplete: () => void
}

export function SealCelebrationV3({
  open,
  onOpenChange,
  letterTitle,
  deliveryDate,
  recipientEmail,
  onComplete,
}: SealCelebrationV3Props) {
  const [showConfetti, setShowConfetti] = React.useState(false)
  const [phase, setPhase] = React.useState<"sealing" | "sealed">("sealing")

  React.useEffect(() => {
    if (open) {
      setPhase("sealing")
      setShowConfetti(false)

      // Sealing animation sequence
      const sealTimer = setTimeout(() => {
        setPhase("sealed")
        setShowConfetti(true)
      }, 1500)

      // Auto-complete right after confetti animation ends (1.5s sealing + 2s confetti)
      const completeTimer = setTimeout(() => {
        onComplete()
      }, 3500)

      return () => {
        clearTimeout(sealTimer)
        clearTimeout(completeTimer)
      }
    }
  }, [open, onComplete])

  const formattedDate = format(deliveryDate, "MMMM d, yyyy")
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
        <DialogTitle className="sr-only">Sealing your letter</DialogTitle>
        {/* Confetti */}
        <AnimatePresence>
          {showConfetti && <BrutalistConfetti count={40} originY="40vh" />}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {phase === "sealing" ? (
            <motion.div
              key="sealing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center p-12 text-center"
            >
              {/* Animated Wax Seal */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{
                  scale: [0, 1.2, 1],
                  rotate: [-180, 10, 0],
                }}
                transition={{
                  duration: 1,
                  times: [0, 0.6, 1],
                  ease: "easeOut",
                }}
                className="mb-6 flex h-24 w-24 items-center justify-center border-4 border-charcoal bg-coral shadow-[4px_4px_0_theme(colors.charcoal)]"
                style={{ borderRadius: "50%" }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                >
                  <Stamp className="h-12 w-12 text-white" strokeWidth={1.5} />
                </motion.div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal"
              >
                Sealing Your Letter...
              </motion.h2>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
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
                {/* Floating Badge */}
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-4 py-1 bg-charcoal font-mono text-[10px] font-bold uppercase tracking-wider text-white z-10"
                  style={{ borderRadius: "2px" }}
                >
                  <Check className="h-3 w-3" strokeWidth={3} />
                  <span>Success</span>
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
              </div>

              {/* Details */}
              <div className="p-6 space-y-4">
                {/* Letter Title */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
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

                {/* Delivery Date */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
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
                    <p className="font-mono text-[10px] text-teal-primary font-bold">
                      {daysFromNow === 1 ? "Tomorrow!" : `${daysFromNow} days from now`}
                    </p>
                  </div>
                </motion.div>

                {/* Recipient */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-center py-2"
                >
                  <p className="font-mono text-[10px] text-charcoal/50 uppercase tracking-wider">
                    Sending to
                  </p>
                  <p className="font-mono text-xs font-bold text-charcoal">
                    {recipientEmail}
                  </p>
                </motion.div>
              </div>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="border-t-2 border-dashed border-charcoal/20 bg-duck-cream p-4 text-center"
              >
                <p className="font-mono text-[10px] text-charcoal/60 uppercase tracking-wider">
                  Redirecting to your letters...
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
