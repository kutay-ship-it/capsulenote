"use client"

import { useMemo } from "react"
import { format } from "date-fns"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { JourneyLetter } from "./types"
import { LetterNode } from "./letter-node"
import { EmptyState } from "./empty-state"
import { Mail, Lock, ArrowRight } from "lucide-react"

interface JourneyMinimalProps {
  letters: JourneyLetter[]
}

/**
 * JOURNEY MINIMAL - "The Essence"
 *
 * A clean, vertical timeline with maximum breathing room.
 * Just the essential info: title, date, status.
 * Perfect for users who want clarity over decoration.
 *
 * Design Philosophy:
 * - Single column, full-width on mobile
 * - NOW as a bold horizontal divider
 * - Past above (warm), Future below (cool)
 * - Subtle fade-in animations
 */
export function JourneyMinimal({ letters }: JourneyMinimalProps) {
  const now = new Date()

  const { pastLetters, futureLetters } = useMemo(() => {
    const past: JourneyLetter[] = []
    const future: JourneyLetter[] = []

    letters.forEach((letter) => {
      if (new Date(letter.deliverAt).getTime() <= now.getTime()) {
        past.push(letter)
      } else {
        future.push(letter)
      }
    })

    // Sort past descending (most recent first), future ascending
    past.sort((a, b) => new Date(b.deliverAt).getTime() - new Date(a.deliverAt).getTime())
    future.sort((a, b) => new Date(a.deliverAt).getTime() - new Date(b.deliverAt).getTime())

    return { pastLetters: past, futureLetters: future }
  }, [letters, now])

  if (letters.length === 0) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <EmptyState variant="illustrated" />
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8 border-b-2 border-dashed border-charcoal/10"
      >
        <h2 className="font-mono text-2xl font-bold uppercase tracking-wide text-charcoal">
          Your Journey
        </h2>
        <p className="font-mono text-xs text-charcoal/50 mt-2 uppercase tracking-wider">
          {letters.length} letter{letters.length !== 1 ? "s" : ""} across time
        </p>
      </motion.div>

      {/* Past Section */}
      {pastLetters.length > 0 && (
        <section className="bg-duck-cream/50 py-8">
          {/* Past Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 mb-6 px-4"
          >
            <Mail className="h-4 w-4 text-teal-primary" strokeWidth={2} />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-teal-primary">
              Delivered ({pastLetters.length})
            </span>
            <div className="flex-1 border-t-2 border-dashed border-teal-primary/30" />
          </motion.div>

          {/* Past Letters */}
          <div className="space-y-4 px-4">
            {pastLetters.map((letter, index) => (
              <LetterNode
                key={letter.id}
                letter={letter}
                size="normal"
                showPreview
                index={index}
              />
            ))}
          </div>
        </section>
      )}

      {/* NOW Divider */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="relative py-6"
      >
        {/* Thick Line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-teal-primary" />

        {/* NOW Badge */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="relative">
            {/* Shadow */}
            <div
              className="absolute top-1 left-1 w-full h-full bg-charcoal"
              style={{ borderRadius: "2px" }}
            />
            {/* Badge */}
            <div
              className="relative flex items-center gap-2 bg-teal-primary border-2 border-charcoal px-5 py-2"
              style={{ borderRadius: "2px" }}
            >
              {/* Pulsing Dot */}
              <motion.div
                className="w-2 h-2 bg-white"
                style={{ borderRadius: "50%" }}
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="font-mono text-sm font-bold uppercase tracking-wider text-white">
                Now
              </span>
            </div>
          </div>
        </motion.div>

        {/* Date */}
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3">
          <span
            className="font-mono text-[11px] font-bold text-teal-primary bg-cream px-3 py-1 border border-teal-primary/30"
            style={{ borderRadius: "2px" }}
          >
            {format(now, "MMMM d, yyyy")}
          </span>
        </div>
      </motion.div>

      {/* Spacer for date label */}
      <div className="h-6" />

      {/* Future Section */}
      {futureLetters.length > 0 && (
        <section className="bg-white py-8">
          {/* Future Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-3 mb-6 px-4"
          >
            <Lock className="h-4 w-4 text-charcoal/50" strokeWidth={2} />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal/60">
              Waiting ({futureLetters.length})
            </span>
            <div className="flex-1 border-t-2 border-dashed border-charcoal/20" />
          </motion.div>

          {/* Future Letters */}
          <div className="space-y-4 px-4">
            {futureLetters.map((letter, index) => (
              <LetterNode
                key={letter.id}
                letter={letter}
                size="normal"
                showPreview
                index={index + pastLetters.length}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty States */}
      {pastLetters.length === 0 && futureLetters.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 bg-duck-cream/50"
        >
          <p className="font-mono text-xs text-charcoal/50 uppercase tracking-wider">
            No letters delivered yet
          </p>
        </motion.div>
      )}

      {futureLetters.length === 0 && pastLetters.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <p className="font-mono text-xs text-charcoal/50 uppercase tracking-wider">
            All letters delivered
          </p>
          <p className="font-mono text-[10px] text-charcoal/30 mt-1">
            Write another to keep your journey going
          </p>
        </motion.div>
      )}

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center py-6 border-t-2 border-dashed border-charcoal/10"
      >
        <p className="font-mono text-[10px] text-charcoal/30 uppercase tracking-wider">
          Journey Minimal - Clean & Focused
        </p>
      </motion.div>
    </div>
  )
}
