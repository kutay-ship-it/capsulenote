import { Suspense } from "react"
import { notFound } from "next/navigation"
import { format, differenceInDays } from "date-fns"
import {
  ArrowLeft,
  Mail,
  Clock,
  FileEdit,
  AlertCircle,
  Calendar,
  PenLine,
  Trash2,
  Lock,
  ArrowRight,
  Stamp,
  MailOpen,
} from "lucide-react"
import { getTranslations } from "next-intl/server"

import { Link, type Locale } from "@/i18n/routing"
import { getDateFnsLocale } from "@/lib/date-formatting"
import { getLetter } from "@/server/actions/letters"
import { requireUser } from "@/server/lib/auth"
import { sanitizeLetterHtml } from "@/lib/sanitize"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { DeliveryTimelineV3 } from "@/components/v3/delivery-timeline-v3"

// Force dynamic rendering - letter detail must always show fresh data
export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{
    locale: Locale
    id: string
  }>
}

/**
 * Status configuration for styling - matches letter-card-v3
 */
type StatusConfig = {
  borderColor: string
  badgeText: string
  badgeBg: string
  badgeTextColor: string
  icon: React.ReactNode
}

type CardTranslations = {
  draft: string
  delivered: string
  failed: string
  today: string
  tomorrow: string
  days: (count: number) => string
}

function getStatusConfig(
  hasDelivery: boolean,
  t: CardTranslations,
  status?: string,
  daysUntil?: number
): StatusConfig {
  // Draft (no delivery)
  if (!hasDelivery) {
    return {
      borderColor: "border-duck-yellow",
      badgeText: t.draft,
      badgeBg: "bg-duck-yellow",
      badgeTextColor: "text-charcoal",
      icon: <FileEdit className="h-4 w-4" strokeWidth={2} />,
    }
  }

  // Sent/Delivered
  if (status === "sent") {
    return {
      borderColor: "border-teal-primary",
      badgeText: t.delivered,
      badgeBg: "bg-teal-primary",
      badgeTextColor: "text-white",
      icon: <Mail className="h-4 w-4" strokeWidth={2} />,
    }
  }

  // Failed
  if (status === "failed") {
    return {
      borderColor: "border-coral",
      badgeText: t.failed,
      badgeBg: "bg-coral",
      badgeTextColor: "text-white",
      icon: <AlertCircle className="h-4 w-4" strokeWidth={2} />,
    }
  }

  // Scheduled - show days remaining
  const daysText =
    daysUntil === undefined || daysUntil <= 0
      ? t.today
      : daysUntil === 1
        ? t.tomorrow
        : t.days(daysUntil)

  return {
    borderColor: "border-duck-blue",
    badgeText: daysText,
    badgeBg: "bg-duck-blue",
    badgeTextColor: "text-charcoal",
    icon: <Clock className="h-4 w-4" strokeWidth={2} />,
  }
}

/**
 * Skeleton loader for letter detail
 */
function LetterDetailV3Skeleton() {
  return (
    <div className="space-y-6">
      {/* Content skeleton */}
      <div
        className="border-2 border-charcoal bg-white p-8 animate-pulse shadow-[2px_2px_0_theme(colors.charcoal)]"
        style={{ borderRadius: "2px" }}
      >
        {/* Badge */}
        <div className="h-6 w-20 bg-charcoal/20 mb-4" style={{ borderRadius: "2px" }} />

        {/* Title */}
        <div className="h-8 w-3/4 bg-charcoal/10 mb-6" style={{ borderRadius: "2px" }} />

        {/* Dashed separator */}
        <div className="w-full border-t-2 border-dashed border-charcoal/10 my-6" />

        {/* Content lines */}
        <div className="space-y-3">
          <div className="h-5 w-full bg-charcoal/10" style={{ borderRadius: "2px" }} />
          <div className="h-5 w-full bg-charcoal/10" style={{ borderRadius: "2px" }} />
          <div className="h-5 w-3/4 bg-charcoal/10" style={{ borderRadius: "2px" }} />
          <div className="h-5 w-full bg-charcoal/10" style={{ borderRadius: "2px" }} />
          <div className="h-5 w-2/3 bg-charcoal/10" style={{ borderRadius: "2px" }} />
        </div>

        {/* Dashed separator */}
        <div className="w-full border-t-2 border-dashed border-charcoal/10 my-6" />

        {/* Footer */}
        <div className="flex justify-between">
          <div className="h-4 w-32 bg-charcoal/10" style={{ borderRadius: "2px" }} />
          <div className="h-4 w-24 bg-charcoal/10" style={{ borderRadius: "2px" }} />
        </div>
      </div>
    </div>
  )
}

/**
 * Async component for letter content
 */
async function LetterDetailContent({ id, locale }: { id: string; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "letters" })
  const dateFnsLocale = getDateFnsLocale(locale)

  let letter
  try {
    letter = await getLetter(id)
  } catch {
    notFound()
  }

  const hasDelivery = letter.deliveries.length > 0
  const latestDelivery = hasDelivery ? letter.deliveries[0] : null
  const daysUntil = latestDelivery
    ? differenceInDays(new Date(latestDelivery.deliverAt), new Date())
    : undefined

  const cardTranslations: CardTranslations = {
    draft: t("card.status.draft"),
    delivered: t("card.status.delivered"),
    failed: t("card.status.failed"),
    today: t("card.status.today"),
    tomorrow: t("card.status.tomorrow"),
    days: (count: number) => t("card.status.days", { count }),
  }

  const statusConfig = getStatusConfig(hasDelivery, cardTranslations, latestDelivery?.status, daysUntil)
  const formattedDate = format(new Date(letter.createdAt), "MMMM d, yyyy", { locale: dateFnsLocale })
  const isSent = latestDelivery?.status === "sent"
  const isScheduled = latestDelivery?.status === "scheduled" || latestDelivery?.status === "processing"

  // Check if letter has any sealed physical mail delivery (content cannot be edited)
  const hasSealedPhysicalMail = letter.deliveries.some(
    (d) => d.channel === "mail" && d.mailDelivery?.sealedAt != null
  )

  // Letter is locked if it has a sealed physical mail delivery
  // Email-only deliveries can still be edited (content isn't sealed until 72h before)
  const isLocked = hasSealedPhysicalMail || (hasDelivery && isSent)

  // Allow editing if: no deliveries, OR only email deliveries (not sealed), OR all deliveries sent/failed
  const canEdit = !hasDelivery || (!hasSealedPhysicalMail && !isSent && letter.deliveries.every(
    d => d.status === "failed" || d.status === "canceled"
  ))

  const hasBeenOpened = !!letter.firstOpenedAt
  const formattedOpenedDate = letter.firstOpenedAt
    ? format(new Date(letter.firstOpenedAt), "PPpp", { locale: dateFnsLocale })
    : null

  // For scheduled letters, get preview (first 100 chars of plain text)
  const contentPreview = letter.bodyHtml
    ? letter.bodyHtml.replace(/<[^>]*>/g, "").slice(0, 100) + "..."
    : ""

  return (
    <div className="space-y-6">
      {/* Main Letter Card */}
      <article
        className={cn(
          "relative border-2 bg-white p-4 sm:p-6 md:p-8",
          "shadow-[2px_2px_0_theme(colors.charcoal)]",
          statusConfig.borderColor
        )}
        style={{ borderRadius: "2px" }}
      >
        {/* Status Badge - Floating */}
        <div
          className={cn(
            "absolute -top-3 left-6 flex items-center gap-1.5 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider",
            statusConfig.badgeBg,
            statusConfig.badgeTextColor
          )}
          style={{ borderRadius: "2px" }}
        >
          {statusConfig.icon}
          <span>{statusConfig.badgeText}</span>
        </div>

        {/* Top-right action icons */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-6 flex items-center gap-1.5 sm:gap-2">
          {/* Edit button - available when content can still be edited */}
          {canEdit && (
            <Link href={{ pathname: "/letters/[id]/edit", params: { id } }}>
              <button
                className="flex h-8 w-8 items-center justify-center border-2 border-charcoal bg-duck-yellow text-charcoal hover:bg-duck-yellow/80 transition-colors"
                style={{ borderRadius: "2px" }}
                title="Edit Letter"
              >
                <PenLine className="h-4 w-4" strokeWidth={2} />
              </button>
            </Link>
          )}
          {/* Schedule button - only for letters without scheduled deliveries */}
          {!hasDelivery && (
            <Link href={{ pathname: "/letters/[id]/schedule", params: { id } }}>
              <button
                className="flex h-8 w-8 items-center justify-center border-2 border-charcoal bg-teal-primary text-white hover:bg-teal-primary/90 transition-colors"
                style={{ borderRadius: "2px" }}
                title="Schedule Delivery"
              >
                <Calendar className="h-4 w-4" strokeWidth={2} />
              </button>
            </Link>
          )}
          {/* Content Sealed indicator - for physical mail (content frozen for printing) */}
          {hasSealedPhysicalMail && (
            <div
              className="flex h-8 w-8 items-center justify-center border-2 border-coral/50 bg-coral/10"
              style={{ borderRadius: "2px" }}
              title="Content sealed for printing"
            >
              <Stamp className="h-4 w-4 text-coral" strokeWidth={2} />
            </div>
          )}
          {/* Lock indicator - for scheduled letters */}
          {isLocked && !hasSealedPhysicalMail && (
            <div
              className="flex h-8 w-8 items-center justify-center border-2 border-charcoal/20 bg-charcoal/5"
              style={{ borderRadius: "2px" }}
              title="Letter is sealed"
            >
              <Lock className="h-4 w-4 text-charcoal/30" strokeWidth={2} />
            </div>
          )}
          {/* Opened indicator - for delivered letters */}
          {isSent && hasBeenOpened && (
            <div
              className="flex h-8 w-8 items-center justify-center border-2 border-teal-primary bg-teal-primary/10"
              style={{ borderRadius: "2px" }}
              title="Letter has been opened"
            >
              <MailOpen className="h-4 w-4 text-teal-primary" strokeWidth={2} />
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="mt-4 mb-2 font-mono text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-wide text-charcoal line-clamp-2">
          {letter.title || t("card.untitled")}
        </h1>

        {/* Meta */}
        <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50 mb-6">
          {t("detail.writtenOn", { date: formattedDate })}
        </p>

        {/* Dashed separator */}
        <div className="w-full border-t-2 border-dashed border-charcoal/10 mb-6" />

        {/* Content - Different states */}
        {/* State 1: Draft - show full content */}
        {!hasDelivery && (
          <div
            className="prose prose-sm sm:prose max-w-none prose-p:font-mono prose-p:text-charcoal/80 prose-p:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: sanitizeLetterHtml(letter.bodyHtml) }}
          />
        )}

        {/* State 2: Scheduled - show sealed/locked state */}
        {isScheduled && (
          <div className="flex flex-col items-center justify-center text-center py-6 sm:py-8 space-y-4 sm:space-y-6">
            {/* Wax Seal Icon */}
            <div
              className="flex h-16 sm:h-20 w-16 sm:w-20 items-center justify-center border-3 sm:border-4 border-charcoal bg-coral shadow-[3px_3px_0_theme(colors.charcoal)] sm:shadow-[4px_4px_0_theme(colors.charcoal)]"
              style={{ borderRadius: "50%" }}
            >
              <Stamp className="h-8 sm:h-10 w-8 sm:w-10 text-white" strokeWidth={1.5} />
            </div>

            {/* Message */}
            <div className="space-y-2 max-w-md">
              <h2 className="font-mono text-lg font-bold uppercase tracking-wide text-charcoal">
                {t("detail.sealed.title")}
              </h2>
              <p className="font-mono text-sm text-charcoal/70">
                {t("detail.sealed.description", {
                  date: format(new Date(latestDelivery!.deliverAt), "MMMM d, yyyy", { locale: dateFnsLocale })
                })}
              </p>
            </div>

            {/* Content Preview */}
            <div
              className="max-w-md p-4 border-2 border-dashed border-charcoal/20 bg-duck-cream/50"
              style={{ borderRadius: "2px" }}
            >
              <p className="font-mono text-xs text-charcoal/40 italic blur-sm select-none">
                {contentPreview}
              </p>
            </div>

            {/* Countdown info */}
            <div className="flex items-center gap-2 text-charcoal/60">
              <Clock className="h-4 w-4" strokeWidth={2} />
              <span className="font-mono text-xs uppercase tracking-wider">
                {daysUntil === undefined || daysUntil <= 0
                  ? t("detail.countdown.arrivingToday")
                  : daysUntil === 1
                    ? t("detail.countdown.arrivingTomorrow")
                    : t("detail.countdown.daysToGo", { count: daysUntil })}
              </span>
            </div>
          </div>
        )}

        {/* State 3: Sent - show unlock CTA or opened status */}
        {isSent && (
          <div className="flex flex-col items-center justify-center text-center py-6 sm:py-8 space-y-4 sm:space-y-6">
            {/* Icon */}
            <div
              className={cn(
                "flex h-16 sm:h-20 w-16 sm:w-20 items-center justify-center border-3 sm:border-4 border-charcoal shadow-[3px_3px_0_theme(colors.charcoal)] sm:shadow-[4px_4px_0_theme(colors.charcoal)]",
                hasBeenOpened ? "bg-teal-primary" : "bg-coral"
              )}
              style={{ borderRadius: "50%" }}
            >
              {hasBeenOpened ? (
                <MailOpen className="h-8 sm:h-10 w-8 sm:w-10 text-white" strokeWidth={1.5} />
              ) : (
                <Stamp className="h-8 sm:h-10 w-8 sm:w-10 text-white" strokeWidth={1.5} />
              )}
            </div>

            {/* Message */}
            <div className="space-y-2 max-w-md">
              <h2 className="font-mono text-lg font-bold uppercase tracking-wide text-charcoal">
                {hasBeenOpened ? t("detail.delivered.opened") : t("detail.delivered.arrived")}
              </h2>
              {hasBeenOpened ? (
                <p className="font-mono text-sm text-charcoal/70">
                  {t("detail.delivered.firstOpenedOn", { date: formattedOpenedDate! })}
                </p>
              ) : (
                <p className="font-mono text-sm text-charcoal/70">
                  {t("detail.delivered.waitingMessage")}
                </p>
              )}
            </div>

            {/* CTA */}
            <Link href={{ pathname: "/unlock/[id]", params: { id } }}>
              <Button
                size="lg"
                className={cn(
                  "gap-2 sm:gap-3 h-12 sm:h-14 font-mono text-xs sm:text-sm uppercase tracking-wider border-3 sm:border-4 border-charcoal shadow-[4px_4px_0_theme(colors.charcoal)] sm:shadow-[6px_6px_0_theme(colors.charcoal)] hover:shadow-[5px_5px_0_theme(colors.charcoal)] sm:hover:shadow-[8px_8px_0_theme(colors.charcoal)] hover:-translate-y-1 transition-all",
                  hasBeenOpened
                    ? "bg-teal-primary hover:bg-teal-primary/90 text-white"
                    : "bg-coral hover:bg-coral/90 text-white"
                )}
                style={{ borderRadius: "2px" }}
              >
                {hasBeenOpened ? (
                  <>
                    <MailOpen className="h-4 sm:h-5 w-4 sm:w-5" strokeWidth={2} />
                    {t("detail.buttons.viewFullLetter")}
                  </>
                ) : (
                  <>
                    <Stamp className="h-4 sm:h-5 w-4 sm:w-5" strokeWidth={2} />
                    {t("detail.buttons.openTimeCapsule")}
                  </>
                )}
              </Button>
            </Link>
          </div>
        )}

        {/* Dashed separator */}
        <div className="w-full border-t-2 border-dashed border-charcoal/10 mt-8 mb-4" />

        {/* Footer - Delivery Info */}
        <div className="flex flex-wrap items-center justify-end gap-4">
          {hasDelivery && (
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50">
              {latestDelivery?.status === "sent"
                ? t("detail.footer.delivered", { date: format(new Date(latestDelivery.deliverAt), "MMM d, yyyy", { locale: dateFnsLocale }) })
                : t("detail.footer.delivers", { date: format(new Date(latestDelivery!.deliverAt), "MMM d, yyyy", { locale: dateFnsLocale }) })}
            </span>
          )}
        </div>
      </article>

      {/* Delivery Timeline - only if has deliveries */}
      {hasDelivery && (
        <DeliveryTimelineV3
          deliveries={letter.deliveries}
          letterId={letter.id}
          letterTitle={letter.title || t("card.untitled")}
        />
      )}

      {/* Schedule CTA - only if no deliveries */}
      {!hasDelivery && (
        <div
          className="border-2 border-charcoal bg-duck-cream p-6 sm:p-8 md:p-12 shadow-[2px_2px_0_theme(colors.charcoal)]"
          style={{ borderRadius: "2px" }}
        >
          <div className="flex flex-col items-center justify-center text-center space-y-4 sm:space-y-6">
            {/* Icon */}
            <div
              className="flex h-12 sm:h-16 w-12 sm:w-16 items-center justify-center border-2 border-charcoal bg-duck-yellow"
              style={{ borderRadius: "2px" }}
            >
              <Calendar className="h-6 sm:h-8 w-6 sm:w-8 text-charcoal" strokeWidth={2} />
            </div>

            {/* Message */}
            <div className="space-y-2 max-w-md">
              <h2 className="font-mono text-lg sm:text-xl md:text-2xl font-bold uppercase tracking-wide text-charcoal">
                {t("detail.scheduleCtaSection.title")}
              </h2>
              <p className="font-mono text-xs sm:text-sm text-charcoal/70">
                {t("detail.scheduleCtaSection.description")}
              </p>
            </div>

            {/* CTA */}
            <Link href={{ pathname: "/letters/[id]/schedule", params: { id } }}>
              <Button className="gap-2 w-full sm:w-auto">
                {t("detail.scheduleCta")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Danger Zone */}
      <div
        className="border-2 border-charcoal/20 bg-white p-4 sm:p-6"
        style={{ borderRadius: "2px" }}
      >
        <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider text-charcoal/60">
              {t("detail.dangerZone.title")}
            </h3>
            <p className="mt-1 font-mono text-[10px] sm:text-xs text-charcoal/40">
              {hasDelivery
                ? t("detail.dangerZone.descriptionWithDelivery")
                : t("detail.dangerZone.descriptionWithoutDelivery")}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full sm:w-auto gap-2 font-mono text-xs uppercase tracking-wider text-coral/70 hover:text-coral hover:bg-coral/5"
          >
            <Trash2 className="h-4 w-4" />
            {t("detail.dangerZone.delete")}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default async function LetterDetailV3Page({ params }: PageProps) {
  const { locale, id } = await params
  const t = await getTranslations({ locale, namespace: "letters" })

  // Verify user is authenticated
  await requireUser()

  return (
    <div className="container">
      {/* Header - matches letters page pattern */}
      <header className="flex flex-col gap-4 py-12 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Link href="/letters">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 -ml-4 font-mono text-xs uppercase tracking-wider text-charcoal/60 hover:text-charcoal"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("detail.back")}
            </Button>
          </Link>
        </div>
      </header>

      {/* Letter Content */}
      <section className="pb-12">
        <Suspense fallback={<LetterDetailV3Skeleton />}>
          <LetterDetailContent id={id} locale={locale} />
        </Suspense>
      </section>
    </div>
  )
}
