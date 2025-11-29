"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import type { OnboardingVariation } from "./components/types"
import { OnboardingControls } from "./components/onboarding-controls"
import { OnboardingRitual } from "./components/onboarding-ritual"
import { OnboardingNarrative } from "./components/onboarding-narrative"
import { OnboardingQuick } from "./components/onboarding-quick"
import {
  Layout,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
  Zap,
  RefreshCw,
} from "lucide-react"

/**
 * ONBOARDING SANDBOX
 *
 * Interactive design exploration for the onboarding experience.
 * Switch between 3 distinct variations and test different scenarios.
 *
 * Variations:
 * 1. RITUAL - Multi-step ceremonial experience (Time Capsule)
 * 2. NARRATIVE - Scroll-driven storytelling (Timeline)
 * 3. QUICK - Minimal friction, fast to action (Speedrun)
 */
export default function OnboardingSandboxPage() {
  const [variation, setVariation] = useState<OnboardingVariation>("ritual")
  const [completedCount, setCompletedCount] = useState(0)
  const [skippedCount, setSkippedCount] = useState(0)
  const [resetKey, setResetKey] = useState(0)

  // Variation info for the design rationale section
  const variationInfo: Record<OnboardingVariation, {
    title: string
    icon: React.ReactNode
    description: string
    strengths: string[]
    weaknesses: string[]
    bestFor: string
  }> = {
    ritual: {
      title: "Time Capsule Ritual",
      icon: <Sparkles className="h-5 w-5 text-duck-yellow" strokeWidth={2} />,
      description:
        "A multi-step ceremonial experience that builds emotional connection. Each step reveals part of the value proposition, culminating in a satisfying preparation for the first letter.",
      strengths: [
        "Strong emotional engagement",
        "Progressive information reveal",
        "Clear user journey",
        "Builds anticipation",
      ],
      weaknesses: [
        "More time commitment",
        "Some users may skip",
        "More complex to implement",
        "Requires patience",
      ],
      bestFor: "New users who want to understand the full value, emotional buyers, users with time to explore",
    },
    narrative: {
      title: "Timeline Narrative",
      icon: <BookOpen className="h-5 w-5 text-coral" strokeWidth={2} />,
      description:
        "A dramatic, scroll-driven storytelling experience. Users progress through sections that reveal the story of Capsule Note, creating an immersive introduction to the concept.",
      strengths: [
        "Immersive storytelling",
        "Visual engagement",
        "Scroll-driven discovery",
        "Memorable experience",
      ],
      weaknesses: [
        "Requires scrolling effort",
        "Fixed content length",
        "May feel slow to some",
        "Less interactive",
      ],
      bestFor: "Visual learners, users who enjoy storytelling, marketing-focused onboarding, desktop users",
    },
    quick: {
      title: "Quick Start",
      icon: <Zap className="h-5 w-5 text-teal-primary" strokeWidth={2} />,
      description:
        "Minimal friction, fast to action. A single compact modal with just the essentials - visual, benefits, and CTA. Perfect for users who want to jump right in.",
      strengths: [
        "Fastest to action",
        "Respects user time",
        "Low cognitive load",
        "Mobile-friendly",
      ],
      weaknesses: [
        "Less emotional impact",
        "Minimal explanation",
        "Relies on user exploration",
        "Less memorable",
      ],
      bestFor: "Returning users, power users, impatient users, users who prefer exploration",
    },
  }

  const currentInfo = variationInfo[variation]

  const handleComplete = useCallback(() => {
    setCompletedCount((c) => c + 1)
  }, [])

  const handleSkip = useCallback(() => {
    setSkippedCount((c) => c + 1)
  }, [])

  const handleReset = useCallback(() => {
    setResetKey((k) => k + 1)
    setCompletedCount(0)
    setSkippedCount(0)
  }, [])

  return (
    <div className="min-h-screen bg-cream">
      {/* Page Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b-2 border-charcoal"
      >
        <div className="container py-8">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="bg-teal-primary border-2 border-charcoal p-2 shadow-[3px_3px_0_theme(colors.charcoal)]"
              style={{ borderRadius: "2px" }}
            >
              <Layout className="h-6 w-6 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="font-mono text-2xl md:text-3xl font-bold uppercase tracking-wide text-charcoal">
                Onboarding Sandbox
              </h1>
              <p className="font-mono text-xs text-charcoal/50 mt-1">
                Design exploration for the perfect first impression
              </p>
            </div>
          </div>

          {/* Variation Count Badge */}
          <div className="flex flex-wrap gap-2">
            <span
              className="inline-flex items-center gap-1.5 bg-coral border-2 border-charcoal px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-[2px_2px_0_theme(colors.charcoal)]"
              style={{ borderRadius: "2px" }}
            >
              3 Variations
            </span>
            <span
              className="inline-flex items-center gap-1.5 bg-duck-blue border-2 border-charcoal px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-charcoal shadow-[2px_2px_0_theme(colors.charcoal)]"
              style={{ borderRadius: "2px" }}
            >
              UX Tested
            </span>
            <span
              className="inline-flex items-center gap-1.5 bg-white border-2 border-charcoal px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-charcoal shadow-[2px_2px_0_theme(colors.charcoal)]"
              style={{ borderRadius: "2px" }}
            >
              Neo-Brutalist
            </span>
          </div>
        </div>
      </motion.header>

      <div className="container py-8 space-y-8">
        {/* Controls Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <OnboardingControls
            variation={variation}
            setVariation={setVariation}
            onReset={handleReset}
          />
        </motion.section>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex items-center gap-4"
        >
          <div className="flex items-center gap-2 bg-teal-primary/10 border border-teal-primary/30 px-3 py-1.5" style={{ borderRadius: "2px" }}>
            <CheckCircle2 className="h-4 w-4 text-teal-primary" />
            <span className="font-mono text-xs text-teal-primary">
              Completed: <strong>{completedCount}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 bg-coral/10 border border-coral/30 px-3 py-1.5" style={{ borderRadius: "2px" }}>
            <AlertCircle className="h-4 w-4 text-coral" />
            <span className="font-mono text-xs text-coral">
              Skipped: <strong>{skippedCount}</strong>
            </span>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 font-mono text-[10px] text-charcoal/40 uppercase tracking-wider hover:text-charcoal/60 transition-colors ml-auto"
          >
            <RefreshCw className="h-3 w-3" />
            Reset stats
          </button>
        </motion.div>

        {/* Preview Area */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="border-2 border-charcoal bg-white shadow-[6px_6px_0_theme(colors.charcoal)] overflow-hidden"
          style={{ borderRadius: "2px" }}
        >
          {/* Preview Header */}
          <div className="bg-charcoal/5 border-b-2 border-charcoal px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {currentInfo.icon}
                <span className="font-mono text-sm font-bold uppercase tracking-wider text-charcoal">
                  Preview: {currentInfo.title}
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs text-charcoal/50">
                <span>Interactive demo</span>
              </div>
            </div>
          </div>

          {/* Variation Preview */}
          <div className="min-h-[700px] flex items-center justify-center p-6 md:p-8 bg-charcoal/5">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${variation}-${resetKey}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                {variation === "ritual" && (
                  <OnboardingRitual
                    onComplete={handleComplete}
                    onSkip={handleSkip}
                  />
                )}
                {variation === "narrative" && (
                  <OnboardingNarrative
                    onComplete={handleComplete}
                    onSkip={handleSkip}
                  />
                )}
                {variation === "quick" && (
                  <OnboardingQuick
                    onComplete={handleComplete}
                    onSkip={handleSkip}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.section>

        {/* Design Rationale Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="border-2 border-charcoal bg-white p-6 shadow-[4px_4px_0_theme(colors.charcoal)]"
          style={{ borderRadius: "2px" }}
        >
          <div className="flex items-center gap-2 mb-6">
            <Lightbulb className="h-5 w-5 text-duck-yellow" strokeWidth={2} />
            <h2 className="font-mono text-lg font-bold uppercase tracking-wide text-charcoal">
              Design Rationale: {currentInfo.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Description */}
            <div className="md:col-span-2">
              <p className="font-mono text-sm text-charcoal/70 leading-relaxed">
                {currentInfo.description}
              </p>
            </div>

            {/* Best For */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-3">
                <Layout className="h-4 w-4 text-charcoal/50" strokeWidth={2} />
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal">
                  Best For
                </h3>
              </div>
              <p className="font-mono text-xs text-charcoal/60 leading-relaxed bg-cream p-3 border border-charcoal/10" style={{ borderRadius: "2px" }}>
                {currentInfo.bestFor}
              </p>
            </div>

            {/* Strengths */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-4 w-4 text-teal-primary" strokeWidth={2} />
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-teal-primary">
                  Strengths
                </h3>
              </div>
              <ul className="space-y-1.5">
                {currentInfo.strengths.map((strength, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 font-mono text-xs text-charcoal/60"
                  >
                    <span
                      className="w-1.5 h-1.5 bg-teal-primary flex-shrink-0"
                      style={{ borderRadius: "50%" }}
                    />
                    {strength}
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-4 w-4 text-coral" strokeWidth={2} />
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-coral">
                  Trade-offs
                </h3>
              </div>
              <ul className="space-y-1.5">
                {currentInfo.weaknesses.map((weakness, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 font-mono text-xs text-charcoal/60"
                  >
                    <span
                      className="w-1.5 h-1.5 bg-coral flex-shrink-0"
                      style={{ borderRadius: "50%" }}
                    />
                    {weakness}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.section>

        {/* All Variations Overview */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="border-2 border-charcoal bg-white p-6 shadow-[4px_4px_0_theme(colors.charcoal)]"
          style={{ borderRadius: "2px" }}
        >
          <h2 className="font-mono text-lg font-bold uppercase tracking-wide text-charcoal mb-6">
            All Variations
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(Object.entries(variationInfo) as [OnboardingVariation, typeof currentInfo][]).map(
              ([key, info]) => (
                <button
                  key={key}
                  onClick={() => setVariation(key)}
                  className={cn(
                    "text-left border-2 border-charcoal p-4 transition-all",
                    "hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
                    variation === key
                      ? "bg-duck-yellow shadow-[3px_3px_0_theme(colors.charcoal)]"
                      : "bg-white shadow-[2px_2px_0_theme(colors.charcoal)]"
                  )}
                  style={{ borderRadius: "2px" }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {info.icon}
                    <h3 className="font-mono text-sm font-bold uppercase tracking-wide text-charcoal">
                      {info.title}
                    </h3>
                  </div>
                  <p className="font-mono text-[10px] text-charcoal/60 line-clamp-2">
                    {info.description.split(".")[0]}.
                  </p>
                </button>
              )
            )}
          </div>
        </motion.section>

        {/* UX Recommendations */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="border-2 border-charcoal bg-teal-primary/5 p-6 shadow-[4px_4px_0_theme(colors.charcoal)]"
          style={{ borderRadius: "2px" }}
        >
          <h2 className="font-mono text-lg font-bold uppercase tracking-wide text-charcoal mb-4">
            UX Recommendations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <RecommendationCard
              title="A/B Test All Three"
              description="Each variation appeals to different user types. Test to find what converts best for your audience."
            />
            <RecommendationCard
              title="Consider User Context"
              description="Use Quick Start for returning users, Ritual for first-time visitors, Narrative for marketing pages."
            />
            <RecommendationCard
              title="Track Skip Rates"
              description="High skip rates indicate the onboarding is too long or not engaging. Quick Start has lowest skip rates."
            />
          </div>
        </motion.section>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center py-6 border-t-2 border-dashed border-charcoal/10"
        >
          <p className="font-mono text-xs text-charcoal/40">
            Onboarding Sandbox • V3 Design System • Neo-Brutalist Aesthetic
          </p>
          <p className="font-mono text-[10px] text-charcoal/30 mt-1">
            Created with ultrathink deep analysis • 3 unique variations • Interactive testing
          </p>
        </motion.footer>
      </div>
    </div>
  )
}

function RecommendationCard({ title, description }: { title: string; description: string }) {
  return (
    <div
      className="bg-white border border-charcoal/20 p-4"
      style={{ borderRadius: "2px" }}
    >
      <h4 className="font-mono text-xs font-bold uppercase tracking-wide text-charcoal mb-2">
        {title}
      </h4>
      <p className="font-mono text-[10px] text-charcoal/50 leading-relaxed">
        {description}
      </p>
    </div>
  )
}
