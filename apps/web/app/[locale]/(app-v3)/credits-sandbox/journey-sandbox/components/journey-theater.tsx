"use client"

import { useMemo, useState, useRef } from "react"
import { format, differenceInDays } from "date-fns"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"
import type { JourneyLetter } from "./types"
import { STATUS_CONFIG } from "./types"
import { EmptyState } from "./empty-state"
import {
  Mail,
  Lock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Theater as TheaterIcon,
} from "lucide-react"

interface JourneyTheaterProps {
  letters: JourneyLetter[]
}

type TimeSection = "past" | "present" | "future"

/**
 * JOURNEY THEATER - "The Stage"
 *
 * A dramatic, immersive experience presenting letters as scenes on a stage.
 * Three sections: PAST (stage left), PRESENT (center spotlight), FUTURE (behind curtain)
 *
 * Design Philosophy:
 * - Emotional impact and storytelling
 * - Large "scene cards" with dramatic shadows
 * - Spotlight effect on center
 * - Curtain motif for unrevealed future
 * - Horizontal navigation
 */
export function JourneyTheater({ letters }: JourneyTheaterProps) {
  const [activeSection, setActiveSection] = useState<TimeSection>("present")
  const [selectedLetter, setSelectedLetter] = useState<JourneyLetter | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const now = new Date()

  // Split letters into time sections
  const { pastLetters, presentLetter, futureLetters } = useMemo(() => {
    const sorted = [...letters].sort(
      (a, b) => new Date(a.deliverAt).getTime() - new Date(b.deliverAt).getTime()
    )

    const past: JourneyLetter[] = []
    const future: JourneyLetter[] = []
    let present: JourneyLetter | null = null

    sorted.forEach((letter) => {
      const deliverTime = new Date(letter.deliverAt).getTime()
      const nowTime = now.getTime()

      if (deliverTime <= nowTime) {
        past.push(letter)
      } else {
        future.push(letter)
      }
    })

    // The "present" is the most recently delivered or next upcoming
    if (past.length > 0) {
      present = past[past.length - 1]!
      past.pop()
    } else if (future.length > 0) {
      present = future[0]!
      future.shift()
    }

    return {
      pastLetters: past.reverse(), // Most recent first
      presentLetter: present,
      futureLetters: future,
    }
  }, [letters, now])

  if (letters.length === 0) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <EmptyState variant="illustrated" />
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden" ref={containerRef}>
      {/* Stage Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-6 relative z-10"
      >
        <div className="inline-flex items-center gap-2 mb-2">
          <TheaterIcon className="h-5 w-5 text-charcoal" strokeWidth={1.5} />
          <h2 className="font-mono text-2xl font-bold uppercase tracking-wide text-charcoal">
            The Theater of Your Journey
          </h2>
        </div>
        <p className="font-mono text-xs text-charcoal/50 uppercase tracking-wider">
          Your life in acts — past, present, and future
        </p>
      </motion.div>

      {/* Section Navigation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center gap-4 mb-8"
      >
        {(["past", "present", "future"] as TimeSection[]).map((section) => {
          const count =
            section === "past"
              ? pastLetters.length
              : section === "present"
                ? presentLetter
                  ? 1
                  : 0
                : futureLetters.length

          return (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={cn(
                "flex items-center gap-2 border-2 border-charcoal px-4 py-2 font-mono text-xs uppercase tracking-wider transition-all",
                "hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
                activeSection === section
                  ? section === "past"
                    ? "bg-teal-primary text-white shadow-[3px_3px_0_theme(colors.charcoal)]"
                    : section === "present"
                      ? "bg-duck-yellow text-charcoal shadow-[3px_3px_0_theme(colors.charcoal)]"
                      : "bg-duck-blue text-charcoal shadow-[3px_3px_0_theme(colors.charcoal)]"
                  : "bg-white text-charcoal shadow-[2px_2px_0_theme(colors.charcoal)]"
              )}
              style={{ borderRadius: "2px" }}
            >
              {section === "past" && <Mail className="h-3 w-3" />}
              {section === "present" && <Sparkles className="h-3 w-3" />}
              {section === "future" && <Lock className="h-3 w-3" />}
              <span>{section}</span>
              <span
                className={cn(
                  "px-1.5 py-0.5 text-[10px] font-bold",
                  activeSection === section ? "bg-white/30" : "bg-charcoal/10"
                )}
                style={{ borderRadius: "2px" }}
              >
                {count}
              </span>
            </button>
          )
        })}
      </motion.div>

      {/* Stage Area */}
      <div className="relative min-h-[500px]">
        {/* Curtain Pattern (Background) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Left Curtain */}
          <motion.div
            className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-coral/20 to-transparent"
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Curtain Folds */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-0.5 bg-coral/10"
                style={{ left: `${i * 8 + 4}px` }}
              />
            ))}
          </motion.div>

          {/* Right Curtain */}
          <motion.div
            className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-coral/20 to-transparent"
            initial={{ x: 100 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-0.5 bg-coral/10"
                style={{ right: `${i * 8 + 4}px` }}
              />
            ))}
          </motion.div>

          {/* Spotlight */}
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(255,222,0,0.1) 0%, transparent 70%)",
            }}
            animate={{
              opacity: activeSection === "present" ? 1 : 0.3,
              scale: activeSection === "present" ? 1 : 0.8,
            }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Content Sections */}
        <div className="relative z-10 px-4 md:px-20">
          <AnimatePresence mode="wait">
            {/* PAST Section */}
            {activeSection === "past" && (
              <motion.div
                key="past"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h3 className="font-mono text-lg font-bold uppercase tracking-wide text-teal-primary mb-2">
                    Act I: The Past
                  </h3>
                  <p className="font-mono text-xs text-charcoal/50">
                    Letters that have found their way home
                  </p>
                </div>

                {pastLetters.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="font-mono text-sm text-charcoal/40">
                      No delivered letters yet. The stage awaits its first act.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pastLetters.map((letter, index) => (
                      <SceneCard
                        key={letter.id}
                        letter={letter}
                        index={index}
                        variant="past"
                        onClick={() => setSelectedLetter(letter)}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* PRESENT Section */}
            {activeSection === "present" && (
              <motion.div
                key="present"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center min-h-[400px]"
              >
                <div className="text-center mb-8">
                  <motion.h3
                    className="font-mono text-lg font-bold uppercase tracking-wide text-charcoal mb-2"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Act II: The Present
                  </motion.h3>
                  <p className="font-mono text-xs text-charcoal/50">
                    The spotlight shines on now
                  </p>
                </div>

                {presentLetter ? (
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-lg w-full"
                  >
                    <SceneCard
                      letter={presentLetter}
                      variant="present"
                      featured
                      onClick={() => setSelectedLetter(presentLetter)}
                    />
                  </motion.div>
                ) : (
                  <div className="text-center py-16">
                    <p className="font-mono text-sm text-charcoal/40">
                      The spotlight awaits. Write a letter to take the stage.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* FUTURE Section */}
            {activeSection === "future" && (
              <motion.div
                key="future"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h3 className="font-mono text-lg font-bold uppercase tracking-wide text-duck-blue mb-2">
                    Act III: The Future
                  </h3>
                  <p className="font-mono text-xs text-charcoal/50">
                    Scenes yet to unfold, waiting behind the curtain
                  </p>
                </div>

                {futureLetters.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="font-mono text-sm text-charcoal/40">
                      The future act is unwritten. Schedule a letter to fill the stage.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {futureLetters.map((letter, index) => (
                      <SceneCard
                        key={letter.id}
                        letter={letter}
                        index={index}
                        variant="future"
                        onClick={() => setSelectedLetter(letter)}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center py-6 border-t-2 border-dashed border-charcoal/10 mt-8"
      >
        <p className="font-mono text-[10px] text-charcoal/30 uppercase tracking-wider">
          Journey Theater - Your Life in Acts
        </p>
      </motion.div>

      {/* Letter Detail Modal */}
      <AnimatePresence>
        {selectedLetter && (
          <LetterModal
            letter={selectedLetter}
            onClose={() => setSelectedLetter(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// Scene Card Component
function SceneCard({
  letter,
  index = 0,
  variant,
  featured = false,
  onClick,
}: {
  letter: JourneyLetter
  index?: number
  variant: "past" | "present" | "future"
  featured?: boolean
  onClick?: () => void
}) {
  const config = STATUS_CONFIG[letter.status]
  const isDelivered = letter.status === "sent"
  const now = new Date()
  const daysUntil = differenceInDays(new Date(letter.deliverAt), now)

  const variantStyles = {
    past: {
      border: "border-teal-primary",
      bg: "bg-teal-primary/5",
      shadow: "shadow-[6px_6px_0_theme(colors.teal-primary)]",
      hoverShadow: "hover:shadow-[10px_10px_0_theme(colors.teal-primary)]",
    },
    present: {
      border: "border-duck-yellow",
      bg: "bg-duck-yellow/10",
      shadow: featured
        ? "shadow-[8px_8px_0_theme(colors.charcoal)]"
        : "shadow-[6px_6px_0_theme(colors.charcoal)]",
      hoverShadow: "hover:shadow-[12px_12px_0_theme(colors.charcoal)]",
    },
    future: {
      border: "border-duck-blue",
      bg: "bg-duck-blue/5",
      shadow: "shadow-[6px_6px_0_theme(colors.duck-blue)]",
      hoverShadow: "hover:shadow-[10px_10px_0_theme(colors.duck-blue)]",
    },
  }

  const styles = variantStyles[variant]

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      onClick={onClick}
      className={cn(
        "relative border-4 bg-white cursor-pointer transition-all duration-300",
        "hover:-translate-y-2",
        styles.border,
        styles.shadow,
        styles.hoverShadow,
        featured ? "p-8" : "p-6"
      )}
      style={{ borderRadius: "2px" }}
    >
      {/* Scene Number */}
      <div
        className={cn(
          "absolute -top-4 -left-4 w-10 h-10 border-4 border-charcoal flex items-center justify-center font-mono text-sm font-bold",
          variant === "past"
            ? "bg-teal-primary text-white"
            : variant === "present"
              ? "bg-duck-yellow text-charcoal"
              : "bg-duck-blue text-charcoal"
        )}
        style={{ borderRadius: "2px" }}
      >
        {variant === "past" ? (
          <Mail className="h-4 w-4" strokeWidth={2} />
        ) : variant === "future" ? (
          <Lock className="h-4 w-4" strokeWidth={2} />
        ) : (
          <Sparkles className="h-4 w-4" strokeWidth={2} />
        )}
      </div>

      {/* Content */}
      <div className="ml-4">
        {/* Title */}
        <h4
          className={cn(
            "font-mono font-bold uppercase tracking-wide mb-3 line-clamp-2",
            featured ? "text-xl" : "text-base"
          )}
        >
          {letter.title}
        </h4>

        {/* Preview */}
        {letter.preview && (
          <p
            className={cn(
              "font-mono text-charcoal/50 mb-4 line-clamp-3 leading-relaxed",
              featured ? "text-sm" : "text-xs"
            )}
          >
            {letter.preview}
          </p>
        )}

        {/* Dashed Separator */}
        <div className="border-t-2 border-dashed border-charcoal/20 mb-4" />

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="font-mono text-xs text-charcoal/60">
            {isDelivered ? (
              <span>Delivered {format(letter.deliverAt, "MMM d, yyyy")}</span>
            ) : daysUntil <= 0 ? (
              <span className="text-teal-primary font-bold">Arriving today!</span>
            ) : daysUntil === 1 ? (
              <span className="text-teal-primary font-bold">Tomorrow</span>
            ) : (
              <span>{daysUntil} days until delivery</span>
            )}
          </div>

          <span
            className={cn(
              "px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wider",
              config.badgeBg,
              config.badgeText
            )}
            style={{ borderRadius: "2px" }}
          >
            {config.label}
          </span>
        </div>
      </div>
    </motion.article>
  )
}

// Letter Detail Modal
function LetterModal({
  letter,
  onClose,
}: {
  letter: JourneyLetter
  onClose: () => void
}) {
  const config = STATUS_CONFIG[letter.status]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-lg w-full bg-white border-4 border-charcoal p-8 shadow-[12px_12px_0_theme(colors.charcoal)]"
        style={{ borderRadius: "2px" }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 w-10 h-10 bg-coral border-4 border-charcoal text-white font-mono font-bold text-xl flex items-center justify-center hover:bg-coral/90 transition-colors"
          style={{ borderRadius: "2px" }}
        >
          ×
        </button>

        {/* Status Badge */}
        <div
          className={cn(
            "inline-flex items-center gap-2 px-3 py-1 border-2 border-charcoal font-mono text-xs font-bold uppercase tracking-wider mb-4",
            config.badgeBg,
            config.badgeText
          )}
          style={{ borderRadius: "2px" }}
        >
          {letter.status === "sent" ? (
            <Mail className="h-3 w-3" />
          ) : (
            <Lock className="h-3 w-3" />
          )}
          {config.label}
        </div>

        {/* Title */}
        <h3 className="font-mono text-2xl font-bold uppercase tracking-wide text-charcoal mb-4">
          {letter.title}
        </h3>

        {/* Preview */}
        {letter.preview && (
          <p className="font-mono text-sm text-charcoal/60 leading-relaxed mb-6">
            {letter.preview}
          </p>
        )}

        {/* Dates */}
        <div className="space-y-2 font-mono text-xs text-charcoal/50">
          <div>
            <span className="uppercase tracking-wider">Written:</span>{" "}
            {format(letter.writtenAt, "MMMM d, yyyy")}
          </div>
          <div>
            <span className="uppercase tracking-wider">
              {letter.status === "sent" ? "Delivered:" : "Scheduled:"}
            </span>{" "}
            {format(letter.deliverAt, "MMMM d, yyyy")}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
