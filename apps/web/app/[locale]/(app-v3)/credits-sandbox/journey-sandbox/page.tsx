"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  type Variation,
  type JourneyState,
  generateMockLetters,
} from "./components/types"
import { JourneyControls } from "./components/journey-controls"
import { JourneyMinimal } from "./components/journey-minimal"
import { JourneyArchive } from "./components/journey-archive"
import { JourneyTheater } from "./components/journey-theater"
import { JourneyRiver } from "./components/journey-river"
import { JourneyGarden } from "./components/journey-garden"
import {
  Compass,
  Lightbulb,
  BookOpen,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"

/**
 * JOURNEY PAGE SANDBOX
 *
 * Interactive design exploration for the ultimate journey page.
 * Switch between 5 distinct variations and test with different data states.
 *
 * Variations:
 * 1. MINIMAL - Clean vertical timeline with maximum breathing room
 * 2. ARCHIVE - Dense grid view with filtering and sorting
 * 3. THEATER - Dramatic stage presentation with past/present/future acts
 * 4. RIVER - Flowing, meditative experience with floating letter boats
 * 5. GARDEN - Growth visualization with plants and underground bulbs
 */
export default function JourneySandboxPage() {
  const [variation, setVariation] = useState<Variation>("minimal")
  const [state, setState] = useState<JourneyState>("normal")

  // Generate mock data based on state
  const letters = useMemo(() => generateMockLetters(state), [state])

  // Variation descriptions for the design rationale section
  const variationInfo = {
    minimal: {
      title: "The Essence",
      description:
        "A clean, vertical timeline with maximum breathing room. Just the essential info: title, date, status. Perfect for users who want clarity over decoration.",
      strengths: [
        "Low cognitive load",
        "Mobile-friendly",
        "Accessible",
        "Fast to scan",
      ],
      weaknesses: [
        "Less visual impact",
        "May feel sparse with few letters",
        "Limited information density",
      ],
      bestFor: "Users who want quick overview, mobile users, accessibility-focused",
    },
    archive: {
      title: "The Filing Cabinet",
      description:
        "Dense grid view showing all letters at once. Filterable by status, sortable by date. Compact cards with hover expansion.",
      strengths: [
        "High information density",
        "Powerful filtering",
        "Great for many letters",
        "Quick actions",
      ],
      weaknesses: [
        "Can feel overwhelming",
        "Less emotional",
        "Requires more cognitive effort",
      ],
      bestFor: "Power users, people with many letters, those who want control",
    },
    theater: {
      title: "The Stage",
      description:
        "Dramatic, immersive experience presenting letters as scenes on a stage. Three acts: Past, Present, Future. Curtains and spotlight effects.",
      strengths: [
        "Emotionally impactful",
        "Memorable experience",
        "Great storytelling",
        "Clear time divisions",
      ],
      weaknesses: [
        "More complex navigation",
        "Heavier on resources",
        "May feel theatrical for simple needs",
      ],
      bestFor:
        "First impressions, emotional storytelling, marketing, special occasions",
    },
    river: {
      title: "The Flow",
      description:
        "Flowing, meditative experience where letters float like boats on a river. NOW is a bridge crossing the current of time.",
      strengths: [
        "Meditative quality",
        "Unique aesthetic",
        "Strong time metaphor",
        "Scroll-driven narrative",
      ],
      weaknesses: [
        "Complex implementation",
        "Performance considerations",
        "Unfamiliar pattern",
      ],
      bestFor:
        "Reflective users, those who appreciate art, quiet contemplation moments",
    },
    garden: {
      title: "The Growth",
      description:
        "Gamified visualization where letters grow like plants. Delivered letters bloom above ground, waiting letters are bulbs below. Height indicates time since delivery.",
      strengths: [
        "Gamification appeal",
        "Growth mindset reinforcement",
        "Visual progress indicators",
        "Unique and memorable",
      ],
      weaknesses: [
        "Metaphor may not resonate with all",
        "Complex visual system",
        "Less efficient for quick tasks",
      ],
      bestFor:
        "Users motivated by progress, gamification lovers, visual thinkers",
    },
  }

  const currentInfo = variationInfo[variation]

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
              className="bg-duck-yellow border-2 border-charcoal p-2 shadow-[3px_3px_0_theme(colors.charcoal)]"
              style={{ borderRadius: "2px" }}
            >
              <Compass className="h-6 w-6 text-charcoal" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="font-mono text-2xl md:text-3xl font-bold uppercase tracking-wide text-charcoal">
                Journey Page Sandbox
              </h1>
              <p className="font-mono text-xs text-charcoal/50 mt-1">
                Design exploration for the ultimate journey experience
              </p>
            </div>
          </div>

          {/* Variation Count Badge */}
          <div className="flex flex-wrap gap-2">
            <span
              className="inline-flex items-center gap-1.5 bg-teal-primary border-2 border-charcoal px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-[2px_2px_0_theme(colors.charcoal)]"
              style={{ borderRadius: "2px" }}
            >
              5 Variations
            </span>
            <span
              className="inline-flex items-center gap-1.5 bg-duck-blue border-2 border-charcoal px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-charcoal shadow-[2px_2px_0_theme(colors.charcoal)]"
              style={{ borderRadius: "2px" }}
            >
              4 Data States
            </span>
            <span
              className="inline-flex items-center gap-1.5 bg-white border-2 border-charcoal px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-charcoal shadow-[2px_2px_0_theme(colors.charcoal)]"
              style={{ borderRadius: "2px" }}
            >
              Neo-Brutalist Design
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
          <JourneyControls
            variation={variation}
            setVariation={setVariation}
            state={state}
            setState={setState}
          />
        </motion.section>

        {/* Preview Area */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="border-2 border-charcoal bg-cream shadow-[6px_6px_0_theme(colors.charcoal)] overflow-hidden"
          style={{ borderRadius: "2px" }}
        >
          {/* Preview Header */}
          <div className="bg-white border-b-2 border-charcoal px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm font-bold uppercase tracking-wider text-charcoal">
                  Preview: {currentInfo.title}
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-xs text-charcoal/50">
                <span>{letters.length} letters</span>
                <span className="w-1 h-1 bg-charcoal/30" style={{ borderRadius: "50%" }} />
                <span>{state} state</span>
              </div>
            </div>
          </div>

          {/* Variation Preview */}
          <div className="p-4 md:p-6">
            {variation === "minimal" && <JourneyMinimal letters={letters} />}
            {variation === "archive" && <JourneyArchive letters={letters} />}
            {variation === "theater" && <JourneyTheater letters={letters} />}
            {variation === "river" && <JourneyRiver letters={letters} />}
            {variation === "garden" && <JourneyGarden letters={letters} />}
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
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-4 w-4 text-charcoal/50" strokeWidth={2} />
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal">
                  Description
                </h3>
              </div>
              <p className="font-mono text-sm text-charcoal/70 leading-relaxed">
                {currentInfo.description}
              </p>
            </div>

            {/* Best For */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Compass className="h-4 w-4 text-charcoal/50" strokeWidth={2} />
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal">
                  Best For
                </h3>
              </div>
              <p className="font-mono text-sm text-charcoal/70 leading-relaxed">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {(Object.entries(variationInfo) as [Variation, typeof currentInfo][]).map(
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
                  <h3 className="font-mono text-sm font-bold uppercase tracking-wide text-charcoal mb-1">
                    {info.title}
                  </h3>
                  <p className="font-mono text-[10px] text-charcoal/60 line-clamp-2">
                    {info.description.split(".")[0]}.
                  </p>
                </button>
              )
            )}
          </div>
        </motion.section>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-6 border-t-2 border-dashed border-charcoal/10"
        >
          <p className="font-mono text-xs text-charcoal/40">
            Journey Page Sandbox • V3 Design System • Neo-Brutalist Aesthetic
          </p>
          <p className="font-mono text-[10px] text-charcoal/30 mt-1">
            Created with ultrathink deep analysis • 5 unique variations • Interactive state controls
          </p>
        </motion.footer>
      </div>
    </div>
  )
}
