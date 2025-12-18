"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "@/i18n/routing"

interface RedirectCountdownProps {
  /** Countdown duration in seconds */
  duration?: number
  /** Target route to redirect to */
  targetHref?: Parameters<ReturnType<typeof useRouter>["push"]>[0]
}

/**
 * Countdown timer with skip button for post-success redirects.
 * Shows depleting progress bar and prominent "Continue Now" button.
 */
export function RedirectCountdown({
  duration = 3,
  targetHref = "/journey",
}: RedirectCountdownProps) {
  const router = useRouter()
  const [countdown, setCountdown] = useState(duration)
  const [isNavigating, setIsNavigating] = useState(false)
  const hasNavigatedRef = useRef(false)

  const handleNavigate = () => {
    if (hasNavigatedRef.current) return
    hasNavigatedRef.current = true
    setIsNavigating(true)
    router.push(targetHref)
  }

  // Countdown timer
  useEffect(() => {
    if (hasNavigatedRef.current) return
    if (countdown <= 0) {
      hasNavigatedRef.current = true
      router.push(targetHref)
      return
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [countdown, router, targetHref])

  // Calculate progress percentage (0 to 100, depleting)
  const progressPercent = (countdown / duration) * 100

  return (
    <div className="space-y-4">
      {/* Countdown text */}
      <p className="font-mono text-sm text-charcoal/70 text-center">
        {countdown > 0
          ? `Taking you to your journey in ${countdown}...`
          : "Redirecting..."
        }
      </p>

      {/* Progress bar - depleting */}
      <div
        className="h-2 w-full bg-charcoal/10 overflow-hidden"
        style={{ borderRadius: "2px" }}
      >
        <div
          className="h-full bg-duck-blue transition-all duration-1000 ease-linear"
          style={{
            width: `${progressPercent}%`,
            borderRadius: "2px",
          }}
        />
      </div>

      {/* Skip button - always visible and prominent */}
      <Button
        onClick={handleNavigate}
        disabled={isNavigating}
        isLoading={isNavigating}
        loadingText="Redirecting..."
        className="w-full sm:w-auto"
        size="lg"
      >
        Continue Now
        <ArrowRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  )
}
