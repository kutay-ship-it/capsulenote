"use client"

import { useState, useEffect } from "react"
import { format, differenceInDays } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Lock, Sparkles, Calendar, ArrowLeft, Edit3 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Phase4SealingProps {
  letterTitle: string
  letterPreview: string
  deliveryDate: Date
  recipientEmail: string
  onSeal: (email: string) => Promise<void>
  onBack: () => void
  isSealing: boolean
}

export function Phase4Sealing({
  letterTitle,
  letterPreview,
  deliveryDate,
  recipientEmail,
  onSeal,
  onBack,
  isSealing,
}: Phase4SealingProps) {
  const [email, setEmail] = useState(recipientEmail)
  const [isSealed, setIsSealed] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const daysUntil = differenceInDays(deliveryDate, new Date())

  // Strip HTML for preview
  const previewText = letterPreview
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 200)

  const handleSeal = async () => {
    if (!email || isSealing) return

    try {
      await onSeal(email)
      setIsSealed(true)
      setShowConfetti(true)
    } catch (error) {
      // Error handled in parent
    }
  }

  // Simple confetti effect
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [showConfetti])

  return (
    <div className="flex min-h-[calc(100vh-120px)] flex-col items-center px-4 py-12">
      <AnimatePresence mode="wait">
        {!isSealed ? (
          <motion.div
            key="sealing-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-2xl space-y-10"
          >
            {/* Header */}
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-teal-primary bg-teal-primary/10">
                <Lock className="h-8 w-8 text-teal-primary" />
              </div>
              <h2 className="font-mono text-2xl font-normal uppercase tracking-wide text-charcoal sm:text-3xl">
                Ready to Seal Your Letter
              </h2>
              <p className="mx-auto max-w-md font-mono text-sm leading-relaxed text-gray-secondary">
                Review your letter one last time, then seal it for delivery to your
                future self.
              </p>
            </div>

            {/* Letter Preview Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative border-2 border-charcoal bg-white p-6 sm:p-8"
              style={{
                borderRadius: "2px",
                boxShadow: "-4px 4px 0px 0px rgb(56, 56, 56)",
              }}
            >
              {/* Envelope flap decoration */}
              <div
                className="absolute -top-4 left-1/2 h-8 w-16 -translate-x-1/2 rotate-45 border-2 border-charcoal bg-bg-yellow-cream"
                style={{ borderRadius: "2px" }}
              />

              <div className="space-y-4 pt-4">
                <h3 className="font-mono text-lg font-semibold text-charcoal">
                  {letterTitle || "Untitled Letter"}
                </h3>
                <p className="font-mono text-sm leading-relaxed text-gray-secondary line-clamp-4">
                  {previewText}...
                </p>

                <button
                  onClick={onBack}
                  className="flex items-center gap-2 font-mono text-xs uppercase tracking-wide text-teal-primary transition-colors hover:text-teal-primary/80"
                >
                  <Edit3 className="h-3 w-3" />
                  Edit letter
                </button>
              </div>
            </motion.div>

            {/* Delivery Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              {/* Delivery Date */}
              <div className="flex items-center justify-center gap-3 border-2 border-teal-primary bg-teal-primary/5 p-4"
                style={{ borderRadius: "2px" }}
              >
                <Calendar className="h-5 w-5 text-teal-primary" />
                <div className="text-center">
                  <p className="font-mono text-xs uppercase tracking-widest text-teal-primary">
                    Arrives on
                  </p>
                  <p className="font-mono text-lg font-semibold text-charcoal">
                    {format(deliveryDate, "MMMM d, yyyy")}
                  </p>
                  <p className="font-mono text-xs text-gray-secondary">
                    {daysUntil.toLocaleString()} days from now
                  </p>
                </div>
              </div>

              {/* Email Confirmation */}
              <div className="space-y-3">
                <label className="block font-mono text-xs uppercase tracking-widest text-charcoal">
                  Deliver to this email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-secondary" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="pl-10"
                  />
                </div>
                <p className="font-mono text-xs text-gray-secondary">
                  Make sure this is an email you&apos;ll still have access to.
                </p>
              </div>
            </motion.div>

            {/* Seal Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col items-center gap-4 pt-4"
            >
              <Button
                onClick={handleSeal}
                disabled={!email || isSealing}
                size="lg"
                className="min-w-[250px] gap-2 text-base uppercase"
              >
                {isSealing ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    >
                      <Lock className="h-4 w-4" />
                    </motion.div>
                    Sealing...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Seal & Send to the Future
                  </>
                )}
              </Button>

              <button
                onClick={onBack}
                disabled={isSealing}
                className="font-mono text-sm text-gray-secondary transition-colors hover:text-charcoal"
              >
                <ArrowLeft className="mr-1 inline h-3 w-3" />
                Go back and edit
              </button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            {/* Confetti */}
            {showConfetti && <Confetti />}

            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
              className="mb-8 flex h-24 w-24 items-center justify-center rounded-full border-4 border-teal-primary bg-teal-primary"
            >
              <Sparkles className="h-12 w-12 text-white" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-4 font-mono text-2xl font-normal uppercase tracking-wide text-charcoal sm:text-3xl"
            >
              Your Letter is Sealed!
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-2 font-mono text-base text-gray-secondary"
            >
              It will arrive on{" "}
              <span className="font-semibold text-teal-primary">
                {format(deliveryDate, "MMMM d, yyyy")}
              </span>
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="font-mono text-sm text-gray-secondary"
            >
              Redirecting to your letters...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Simple confetti component
function Confetti() {
  const colors = ["#3D9A8B", "#F2C94C", "#56CCF2", "#F2994A", "#BB6BD9"]
  const confettiCount = 50

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {Array.from({ length: confettiCount }).map((_, i) => (
        <motion.div
          key={i}
          initial={{
            opacity: 1,
            x: "50vw",
            y: "50vh",
            scale: 0,
          }}
          animate={{
            opacity: [1, 1, 0],
            x: `${Math.random() * 100}vw`,
            y: `${Math.random() * 100}vh`,
            scale: [0, 1, 1],
            rotate: Math.random() * 360,
          }}
          transition={{
            duration: 2 + Math.random(),
            ease: "easeOut",
          }}
          className="absolute h-3 w-3"
          style={{
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  )
}
