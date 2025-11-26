"use client"

import { useEffect, useState } from "react"
import { differenceInSeconds, format } from "date-fns"
import { Mail, ArrowRight, Clock } from "lucide-react"

import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import type { NextDeliveryHeroData } from "@/server/actions/redesign-dashboard"

interface CountdownHeroV3Props {
  delivery: NextDeliveryHeroData
}

/**
 * Brutalist countdown hero component for v3 design
 *
 * States:
 * 1. Countdown active: Shows time remaining with days/hours/mins/secs boxes
 * 2. Countdown expired (time <= 0): Shows "Your letter has arrived!" message
 */
export function CountdownHeroV3({ delivery }: CountdownHeroV3Props) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
  } | null>(null)

  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const calculateTimeLeft = () => {
      const now = new Date()
      const diff = differenceInSeconds(new Date(delivery.deliverAt), now)

      if (diff <= 0) return null

      const days = Math.floor(diff / (3600 * 24))
      const hours = Math.floor((diff % (3600 * 24)) / 3600)
      const minutes = Math.floor((diff % 3600) / 60)
      const seconds = diff % 60

      return { days, hours, minutes, seconds }
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [delivery.deliverAt])

  // Prevent hydration mismatch
  if (!mounted) {
    return <CountdownHeroSkeleton />
  }

  // Letter has arrived state
  if (!timeLeft) {
    return (
      <div
        className="w-full border-2 border-charcoal bg-duck-cream p-8 md:p-12"
        style={{ borderRadius: "2px" }}
      >
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          {/* Icon */}
          <div
            className="flex h-16 w-16 items-center justify-center border-2 border-charcoal bg-duck-yellow"
            style={{ borderRadius: "2px" }}
          >
            <Mail className="h-8 w-8 text-charcoal" strokeWidth={2} />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <h2 className="font-mono text-2xl md:text-3xl font-bold uppercase tracking-wide text-charcoal">
              Your letter has arrived!
            </h2>
            <p className="font-mono text-sm text-charcoal/70 uppercase tracking-wide">
              Check your inbox for a message from the past
            </p>
          </div>

          {/* CTA */}
          <Link href={{ pathname: "/unlock-v3/[id]", params: { id: delivery.letter.id } }}>
            <Button className="gap-2">
              Open Time Capsule
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Active countdown state
  return (
    <div
      className="w-full border-2 border-charcoal bg-duck-cream p-8 md:p-12"
      style={{ borderRadius: "2px" }}
    >
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left: Message info */}
        <div className="text-center lg:text-left space-y-4">
          {/* Badge */}
          <div className="inline-flex items-center gap-2">
            <span
              className="flex items-center gap-2 border-2 border-charcoal bg-white px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-charcoal"
              style={{ borderRadius: "2px" }}
            >
              <span className="h-2 w-2 bg-duck-blue animate-pulse" style={{ borderRadius: "2px" }} />
              Incoming Message
            </span>
          </div>

          {/* From/To */}
          <div className="space-y-1">
            <h2 className="font-mono text-2xl md:text-3xl font-bold uppercase tracking-wide text-charcoal">
              <span className="font-normal text-charcoal/60">from</span> You
            </h2>
            <h2 className="font-mono text-2xl md:text-3xl font-bold uppercase tracking-wide text-charcoal">
              <span className="font-normal text-charcoal/60">to</span> Future You
            </h2>
          </div>

          {/* Written date */}
          <p className="font-mono text-sm text-charcoal/70">
            Written on {format(new Date(delivery.letter.createdAt), "MMMM d, yyyy")}
          </p>
        </div>

        {/* Right: Countdown boxes */}
        <div className="flex gap-3 md:gap-4">
          <TimeUnitBox value={timeLeft.days} label="Days" />
          <TimeUnitBox value={timeLeft.hours} label="Hours" />
          <TimeUnitBox value={timeLeft.minutes} label="Mins" />
          <TimeUnitBox value={timeLeft.seconds} label="Secs" />
        </div>
      </div>

      {/* Bottom: Action buttons */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link href={{ pathname: "/letters-v3/[id]", params: { id: delivery.letter.id } }}>
          <Button variant="outline" size="sm">
            Preview Letter
          </Button>
        </Link>
        <Link href={{ pathname: "/letters-v3/[id]/schedule", params: { id: delivery.letter.id } }}>
          <Button variant="ghost" size="sm">
            Reschedule
          </Button>
        </Link>
      </div>
    </div>
  )
}

/**
 * Individual time unit box with brutalist styling
 */
function TimeUnitBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="flex h-16 w-16 md:h-20 md:w-20 items-center justify-center border-2 border-charcoal bg-white"
        style={{ borderRadius: "2px" }}
      >
        <span className="font-mono text-2xl md:text-4xl font-bold text-charcoal">
          {value.toString().padStart(2, "0")}
        </span>
      </div>
      <span className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal/70">
        {label}
      </span>
    </div>
  )
}

/**
 * Skeleton loader for countdown hero
 */
function CountdownHeroSkeleton() {
  return (
    <div
      className="w-full border-2 border-charcoal bg-duck-cream p-8 md:p-12 animate-pulse"
      style={{ borderRadius: "2px" }}
    >
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left skeleton */}
        <div className="space-y-4">
          <div className="h-6 w-32 bg-charcoal/20" style={{ borderRadius: "2px" }} />
          <div className="h-8 w-48 bg-charcoal/20" style={{ borderRadius: "2px" }} />
          <div className="h-8 w-56 bg-charcoal/20" style={{ borderRadius: "2px" }} />
          <div className="h-4 w-40 bg-charcoal/20" style={{ borderRadius: "2px" }} />
        </div>

        {/* Right skeleton - countdown boxes */}
        <div className="flex gap-3 md:gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div
                className="h-16 w-16 md:h-20 md:w-20 border-2 border-charcoal bg-charcoal/10"
                style={{ borderRadius: "2px" }}
              />
              <div className="h-3 w-10 bg-charcoal/20" style={{ borderRadius: "2px" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/**
 * Empty state component when no scheduled delivery exists
 * Use this at the page level when getNextDeliveryForHero returns null
 */
export function EmptyStateHeroV3() {
  const prompts = [
    "What would you tell yourself one year from now?",
    "What do you want to remember about today?",
    "What advice would help future-you?",
    "What are you grateful for right now?",
    "What dreams are you chasing right now?",
  ]

  // Use day of year for consistent prompt per day
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  )
  const promptIndex = dayOfYear % prompts.length

  return (
    <div
      className="w-full border-2 border-charcoal bg-duck-cream p-8 md:p-12"
      style={{ borderRadius: "2px" }}
    >
      <div className="flex flex-col items-center justify-center text-center space-y-6">
        {/* Icon */}
        <div
          className="flex h-16 w-16 items-center justify-center border-2 border-charcoal bg-duck-yellow"
          style={{ borderRadius: "2px" }}
        >
          <Mail className="h-8 w-8 text-charcoal" strokeWidth={2} />
        </div>

        {/* Message */}
        <div className="space-y-4 max-w-lg">
          <h2 className="font-mono text-xl md:text-2xl font-bold uppercase tracking-wide text-charcoal">
            Your first letter is waiting to be written
          </h2>
          <p className="font-mono text-sm text-charcoal/70 italic">
            &ldquo;{prompts[promptIndex]}&rdquo;
          </p>
        </div>

        {/* CTA */}
        <Link href="/letters-v3/new">
          <Button className="gap-2">
            Write Your First Letter
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

/**
 * Write prompt banner - shows at bottom of page to encourage writing
 * Use when user has scheduled deliveries but you want to prompt more writing
 */
export function WritePromptBannerV3() {
  const prompts = [
    "What does future-you need to hear right now?",
    "What would you tell yourself in 5 years?",
    "What moment do you want to remember forever?",
    "What are you proud of today?",
    "What advice would help you next year?",
  ]

  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  )
  const promptIndex = dayOfYear % prompts.length

  return (
    <div
      className="w-full border-2 border-charcoal bg-charcoal p-8 md:p-12"
      style={{ borderRadius: "2px" }}
    >
      <div className="flex flex-col items-center justify-center text-center space-y-6">
        <p className="font-mono text-lg md:text-xl text-white/90 italic max-w-lg">
          &ldquo;{prompts[promptIndex]}&rdquo;
        </p>

        <Link href="/letters-v3/new">
          <Button
            variant="outline"
            className="border-white bg-white text-charcoal hover:bg-off-white gap-2"
          >
            Write a Letter
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
