import { format, differenceInDays } from "date-fns"
import { getTranslations } from "next-intl/server"

import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import type { LetterWithPreview } from "@/server/actions/redesign-dashboard"

interface LetterCardProps {
  letter: LetterWithPreview
  locale: string
}

/**
 * Status configuration for card styling
 */
type StatusConfig = {
  borderColor: string
  badgeText: string
  badgeColor: string
}

function getStatusConfig(
  letter: LetterWithPreview,
  t: Awaited<ReturnType<typeof getTranslations>>
): StatusConfig {
  // Draft (no delivery)
  if (!letter.delivery) {
    return {
      borderColor: "border-l-duck-yellow",
      badgeText: t("status.draft"),
      badgeColor: "bg-duck-yellow text-charcoal",
    }
  }

  const { status, deliverAt } = letter.delivery

  // Sent
  if (status === "sent") {
    return {
      borderColor: "border-l-teal-primary",
      badgeText: t("status.delivered"),
      badgeColor: "bg-teal-primary text-white",
    }
  }

  // Failed
  if (status === "failed") {
    return {
      borderColor: "border-l-coral",
      badgeText: t("status.failed"),
      badgeColor: "bg-coral text-white",
    }
  }

  // Scheduled - show days remaining
  const daysUntil = differenceInDays(new Date(deliverAt), new Date())
  const daysText =
    daysUntil === 0
      ? t("status.today")
      : daysUntil === 1
        ? t("status.tomorrow")
        : t("status.daysUntil", { count: daysUntil })

  return {
    borderColor: "border-l-duck-blue",
    badgeText: daysText,
    badgeColor: "bg-duck-blue text-charcoal",
  }
}

export async function LetterCard({ letter, locale }: LetterCardProps) {
  const t = await getTranslations("redesign.card")
  const statusConfig = getStatusConfig(letter, t)
  const formattedDate = format(new Date(letter.createdAt), "MMM d, yyyy")

  return (
    <Link
      href={`/letters/${letter.id}`}
      className="block"
    >
      <article
        className={cn(
          "group relative border-2 border-charcoal bg-white p-5 transition-all duration-150",
          "hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-sm",
          "border-l-4",
          statusConfig.borderColor
        )}
        style={{ borderRadius: "2px" }}
      >
        {/* Title */}
        <h3 className="mb-2 line-clamp-1 font-mono text-lg font-semibold text-charcoal">
          {letter.title || t("untitled")}
        </h3>

        {/* Preview text */}
        <p className="mb-4 line-clamp-2 font-mono text-sm text-gray-secondary">
          {letter.bodyPreview || t("noContent")}
        </p>

        {/* Bottom row: Badge + Date */}
        <div className="flex items-center justify-between">
          {/* Status badge */}
          <span
            className={cn(
              "inline-flex items-center px-3 py-1 font-mono text-xs uppercase",
              statusConfig.badgeColor
            )}
            style={{ borderRadius: "2px" }}
          >
            {statusConfig.badgeText}
          </span>

          {/* Written date */}
          <span className="font-mono text-xs text-gray-secondary">
            {t("written", { date: formattedDate })}
          </span>
        </div>
      </article>
    </Link>
  )
}
