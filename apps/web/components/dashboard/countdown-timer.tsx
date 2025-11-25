"use client"

import { useEffect, useState } from "react"

interface CountdownTimerProps {
  targetDate: Date | string
  translations: {
    days: string
    hours: string
    minutes: string
  }
}

export function CountdownTimer({ targetDate, translations }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(targetDate))

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate))
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [targetDate])

  return (
    <div className="flex justify-center gap-4 sm:gap-6">
      <div className="text-center">
        <div
          className="flex h-16 w-16 items-center justify-center border-2 border-charcoal bg-off-white font-mono text-2xl font-bold text-charcoal sm:h-20 sm:w-20 sm:text-3xl"
          style={{ borderRadius: "2px" }}
        >
          {timeLeft.days}
        </div>
        <div className="mt-2 font-mono text-xs uppercase tracking-wide text-gray-secondary">
          {translations.days}
        </div>
      </div>
      <div className="flex items-start pt-5 font-mono text-2xl text-charcoal">:</div>
      <div className="text-center">
        <div
          className="flex h-16 w-16 items-center justify-center border-2 border-charcoal bg-off-white font-mono text-2xl font-bold text-charcoal sm:h-20 sm:w-20 sm:text-3xl"
          style={{ borderRadius: "2px" }}
        >
          {timeLeft.hours}
        </div>
        <div className="mt-2 font-mono text-xs uppercase tracking-wide text-gray-secondary">
          {translations.hours}
        </div>
      </div>
      <div className="flex items-start pt-5 font-mono text-2xl text-charcoal">:</div>
      <div className="text-center">
        <div
          className="flex h-16 w-16 items-center justify-center border-2 border-charcoal bg-off-white font-mono text-2xl font-bold text-charcoal sm:h-20 sm:w-20 sm:text-3xl"
          style={{ borderRadius: "2px" }}
        >
          {timeLeft.minutes}
        </div>
        <div className="mt-2 font-mono text-xs uppercase tracking-wide text-gray-secondary">
          {translations.minutes}
        </div>
      </div>
    </div>
  )
}

function calculateTimeLeft(targetDate: Date | string) {
  const target = typeof targetDate === "string" ? new Date(targetDate) : targetDate
  const difference = target.getTime() - Date.now()

  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0 }
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
  }
}
