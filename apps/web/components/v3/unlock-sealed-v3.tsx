"use client"

import { motion } from "framer-motion"
import { format } from "date-fns"
import { Stamp, Lock, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UnlockSealedV3Props {
  letterTitle: string
  writtenDate: Date
  deliveryDate: Date
  onUnlock: () => void
}

export function UnlockSealedV3({
  letterTitle,
  writtenDate,
  deliveryDate,
  onUnlock,
}: UnlockSealedV3Props) {
  const formattedWrittenDate = format(new Date(writtenDate), "MMMM d, yyyy")
  const formattedDeliveryDate = format(new Date(deliveryDate), "MMMM d, yyyy")

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-md text-center space-y-8"
    >
      {/* Badge */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="inline-flex items-center gap-2"
      >
        <span
          className="flex items-center gap-2 border-2 border-charcoal bg-teal-primary px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-[2px_2px_0_theme(colors.charcoal)]"
          style={{ borderRadius: "2px" }}
        >
          <Lock className="h-3 w-3" strokeWidth={2.5} />
          Time Capsule Ready
        </span>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        <h1 className="font-mono text-2xl md:text-3xl font-bold uppercase tracking-wide text-charcoal">
          A message from your past
        </h1>
        <h2 className="font-mono text-xl md:text-2xl font-bold uppercase tracking-wide text-charcoal/70">
          has arrived.
        </h2>
      </motion.div>

      {/* Wax Seal Envelope */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="relative mx-auto"
      >
        {/* Envelope */}
        <div
          className="relative w-56 sm:w-72 h-40 sm:h-52 mx-auto border-3 sm:border-4 border-charcoal bg-white shadow-[4px_4px_0_theme(colors.charcoal)] sm:shadow-[8px_8px_0_theme(colors.charcoal)] flex flex-col items-center justify-center"
          style={{ borderRadius: "2px" }}
        >
          {/* Inner border decoration */}
          <div
            className="absolute inset-2 sm:inset-3 border-2 border-dashed border-charcoal/20"
            style={{ borderRadius: "2px" }}
          />

          {/* Wax Seal */}
          <motion.div
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(255, 107, 107, 0.4)",
                "0 0 0 12px rgba(255, 107, 107, 0)",
              ],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 0.5,
            }}
            className="relative w-16 sm:w-20 h-16 sm:h-20 border-3 sm:border-4 border-charcoal bg-coral flex items-center justify-center z-10"
            style={{ borderRadius: "50%" }}
          >
            <Stamp className="h-8 sm:h-10 w-8 sm:w-10 text-white" strokeWidth={1.5} />
          </motion.div>

          {/* Letter peeking out effect */}
          <div
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-44 sm:w-56 h-6 sm:h-8 border-2 border-charcoal border-b-0 bg-duck-cream"
            style={{ borderRadius: "2px 2px 0 0" }}
          />
        </div>
      </motion.div>

      {/* Letter Info */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="space-y-3"
      >
        {/* Title */}
        <div
          className="inline-block border-2 border-charcoal bg-duck-yellow px-4 py-2 shadow-[3px_3px_0_theme(colors.charcoal)]"
          style={{ borderRadius: "2px" }}
        >
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal/60">
            Your Letter
          </p>
          <p className="font-mono text-sm font-bold text-charcoal truncate max-w-[250px]">
            "{letterTitle}"
          </p>
        </div>

        {/* Dates */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-charcoal/50" strokeWidth={2} />
            <span className="font-mono text-[10px] text-charcoal/60 uppercase tracking-wider">
              Written {formattedWrittenDate}
            </span>
          </div>
          <div className="hidden sm:block w-1 h-1 bg-charcoal/30" style={{ borderRadius: "50%" }} />
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-charcoal/50" strokeWidth={2} />
            <span className="font-mono text-[10px] text-charcoal/60 uppercase tracking-wider">
              Arrived {formattedDeliveryDate}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Unlock Button */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button
          onClick={onUnlock}
          size="lg"
          className="w-full max-w-xs gap-2 sm:gap-3 h-12 sm:h-14 bg-coral hover:bg-coral/90 text-white font-mono text-xs sm:text-sm uppercase tracking-wider border-3 sm:border-4 border-charcoal shadow-[4px_4px_0_theme(colors.charcoal)] sm:shadow-[6px_6px_0_theme(colors.charcoal)] hover:shadow-[5px_5px_0_theme(colors.charcoal)] sm:hover:shadow-[8px_8px_0_theme(colors.charcoal)] hover:-translate-y-1 transition-all"
          style={{ borderRadius: "2px" }}
        >
          <Stamp className="h-4 sm:h-5 w-4 sm:w-5" strokeWidth={2} />
          Break the Seal
        </Button>
      </motion.div>
    </motion.div>
  )
}
