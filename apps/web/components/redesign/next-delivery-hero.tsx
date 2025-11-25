import { Mail, Eye, Calendar } from "lucide-react"
import { getTranslations } from "next-intl/server"
import {
  differenceInDays,
  differenceInMonths,
  differenceInYears,
  differenceInHours,
  format,
} from "date-fns"

import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import type { NextDeliveryHeroData } from "@/server/actions/redesign-dashboard"

interface NextDeliveryHeroProps {
  delivery: NextDeliveryHeroData
}

/**
 * Format countdown based on time remaining
 *
 * Display rules:
 * - > 365 days → "X years, Y months"
 * - > 30 days → "X months, Y days"
 * - > 1 day → "X days"
 * - = 1 day → "Tomorrow"
 * - = 0 days → "Today"
 * - < 24 hours → "X hours"
 */
function formatCountdown(deliverAt: Date): {
  value: string
  unit: string
  isSpecial: boolean
} {
  const now = new Date()
  const daysUntil = differenceInDays(deliverAt, now)
  const hoursUntil = differenceInHours(deliverAt, now)

  if (daysUntil > 365) {
    const years = differenceInYears(deliverAt, now)
    const months = differenceInMonths(deliverAt, now) % 12
    return {
      value: `${years}y ${months}m`,
      unit: "",
      isSpecial: false,
    }
  }

  if (daysUntil > 30) {
    const months = differenceInMonths(deliverAt, now)
    const remainingDays = daysUntil - months * 30
    return {
      value: `${months}m ${remainingDays}d`,
      unit: "",
      isSpecial: false,
    }
  }

  if (daysUntil > 1) {
    return {
      value: String(daysUntil),
      unit: "days",
      isSpecial: false,
    }
  }

  if (daysUntil === 1) {
    return {
      value: "Tomorrow",
      unit: "",
      isSpecial: true,
    }
  }

  if (daysUntil === 0 && hoursUntil > 0) {
    if (hoursUntil < 24) {
      return {
        value: String(hoursUntil),
        unit: "hours",
        isSpecial: false,
      }
    }
    return {
      value: "Today",
      unit: "",
      isSpecial: true,
    }
  }

  return {
    value: "Today",
    unit: "",
    isSpecial: true,
  }
}

export async function NextDeliveryHero({ delivery }: NextDeliveryHeroProps) {
  const t = await getTranslations("redesign.hero")
  const countdown = formatCountdown(delivery.deliverAt)
  const formattedDate = format(delivery.letter.createdAt, "MMMM d, yyyy")

  return (
    <div
      className="border-2 border-charcoal bg-bg-yellow-cream p-6 sm:p-8 md:p-12"
      style={{ borderRadius: "2px" }}
    >
      {/* Icon and header */}
      <div className="mb-6 flex items-center justify-center gap-2 text-center">
        <Mail className="h-6 w-6 text-charcoal" strokeWidth={2} />
        <span className="font-mono text-sm uppercase tracking-wide text-charcoal sm:text-base">
          {t("nextLetterArrives")}
        </span>
      </div>

      {/* Countdown display */}
      <div className="mb-6 flex items-center justify-center gap-3 sm:gap-4">
        {countdown.isSpecial ? (
          <div
            className="border-2 border-charcoal bg-white px-6 py-4 sm:px-8 sm:py-6"
            style={{ borderRadius: "2px" }}
          >
            <span className="font-mono text-2xl font-bold uppercase tracking-wide text-charcoal sm:text-4xl">
              {countdown.value}
            </span>
          </div>
        ) : (
          <>
            <div
              className="flex h-12 w-12 items-center justify-center border-2 border-charcoal bg-white sm:h-16 sm:w-16"
              style={{ borderRadius: "2px" }}
            >
              <span className="font-mono text-xl font-bold text-charcoal sm:text-3xl">
                {countdown.value}
              </span>
            </div>
            {countdown.unit && (
              <div
                className="border-2 border-charcoal bg-white px-3 py-2 sm:px-4 sm:py-3"
                style={{ borderRadius: "2px" }}
              >
                <span className="font-mono text-sm uppercase tracking-wide text-charcoal sm:text-base">
                  {countdown.unit}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Letter title */}
      <div className="mb-2 text-center">
        <h2 className="font-mono text-lg font-semibold text-charcoal sm:text-xl md:text-2xl">
          &ldquo;{delivery.letter.title}&rdquo;
        </h2>
      </div>

      {/* Written date */}
      <p className="mb-6 text-center font-mono text-sm text-gray-secondary sm:mb-8">
        {t("writtenOn", { date: formattedDate })}
      </p>

      {/* Action buttons */}
      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
        <Link href={`/letters/${delivery.letter.id}`}>
          <Button variant="ghost" className="w-full sm:w-auto">
            <Eye className="mr-2 h-4 w-4" strokeWidth={2} />
            {t("previewLetter")}
          </Button>
        </Link>
        <Link href={`/letters/${delivery.letter.id}/schedule`}>
          <Button variant="ghost" className="w-full sm:w-auto">
            <Calendar className="mr-2 h-4 w-4" strokeWidth={2} />
            {t("reschedule")}
          </Button>
        </Link>
      </div>
    </div>
  )
}
