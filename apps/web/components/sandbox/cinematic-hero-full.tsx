"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, Play, Pause } from "lucide-react"
import Link from "next/link"

const storyBeats = [
  {
    title: "A moment frozen in time",
    description: "You're living a life that will become a memory. What do you want your future self to remember?",
    visual: "✨",
  },
  {
    title: "Words that wait",
    description: "Write today. Deliver tomorrow. Let time add weight to your reflections.",
    visual: "📮",
  },
  {
    title: "Trust in the journey",
    description: "Encrypted, monitored, and delivered exactly when it matters most.",
    visual: "🔐",
  },
]

export function CinematicHeroFull() {
  const [currentBeat, setCurrentBeat] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)

  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      setCurrentBeat((prev) => (prev + 1) % storyBeats.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [isPlaying])

  return (
    <div className="relative space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="space-y-8"
      >
        <div className="space-y-4 text-center">
          <Badge variant="outline" className="mx-auto text-xs uppercase tracking-wide">
            Time Capsule for the Soul
          </Badge>
          <h1 className="font-mono text-5xl uppercase tracking-tight text-charcoal sm:text-6xl lg:text-7xl">
            Write to your
            <br />
            future self
          </h1>
          <p className="mx-auto max-w-2xl font-mono text-lg text-gray-secondary sm:text-xl">
            Letters delivered exactly when they should arrive. No apps to check. No reminders to dismiss. Just your words,
            waiting.
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <a href="#hero-editor">
            <Button size="lg" className="h-14 border-2 border-charcoal px-8 font-mono text-base uppercase">
              Start writing
            </Button>
          </a>
          <Button
            variant="outline"
            size="lg"
            className="h-14 border-2 border-charcoal px-8 font-mono text-base uppercase"
            onClick={() => {
              document.getElementById("story-scroll")?.scrollIntoView({ behavior: "smooth" })
            }}
          >
            <ChevronDown className="mr-2 h-5 w-5" />
            See how it works
          </Button>
        </div>
      </motion.div>

      <div id="story-scroll" className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-mono text-2xl uppercase tracking-wide text-charcoal">The journey</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPlaying(!isPlaying)}
            className="font-mono text-xs uppercase"
          >
            {isPlaying ? (
              <>
                <Pause className="mr-1 h-3 w-3" /> Pause
              </>
            ) : (
              <>
                <Play className="mr-1 h-3 w-3" /> Play
              </>
            )}
          </Button>
        </div>

        <Card className="relative overflow-hidden border-2 border-charcoal bg-bg-blue-light">
          <CardContent className="p-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentBeat}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="space-y-6 text-center"
              >
                <div className="text-8xl">{storyBeats[currentBeat]!.visual}</div>
                <div className="space-y-3">
                  <h3 className="font-mono text-3xl uppercase tracking-tight text-charcoal">
                    {storyBeats[currentBeat]!.title}
                  </h3>
                  <p className="mx-auto max-w-xl font-mono text-base text-gray-secondary">
                    {storyBeats[currentBeat]!.description}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex justify-center gap-2">
              {storyBeats.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentBeat(index)
                    setIsPlaying(false)
                  }}
                  className={`h-2 w-2 rounded-full border-2 border-charcoal transition-all ${
                    index === currentBeat ? "w-8 bg-charcoal" : "bg-white"
                  }`}
                  aria-label={`Go to beat ${index + 1}`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { value: "27k+", label: "Letters waiting", detail: "Across 74 countries" },
            { value: "99.97%", label: "On-time delivery", detail: "SLO-backed promise" },
            { value: "5 years", label: "Longest wait", detail: "Patience rewarded" },
          ].map((stat) => (
            <Card key={stat.label} className="border-2 border-charcoal bg-white">
              <CardContent className="p-6 text-center">
                <div className="font-mono text-4xl font-bold text-charcoal">{stat.value}</div>
                <div className="mt-2 font-mono text-xs uppercase tracking-wide text-gray-secondary">{stat.label}</div>
                <div className="mt-1 font-mono text-xs text-gray-secondary">{stat.detail}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
