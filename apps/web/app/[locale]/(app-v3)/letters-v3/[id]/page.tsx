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
  CheckCircle2,
  ArrowRight,
} from "lucide-react"

import { Link } from "@/i18n/routing"
import { getLetter } from "@/server/actions/letters"
import { requireUser } from "@/server/lib/auth"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Force dynamic rendering - letter detail must always show fresh data
export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{
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

function getStatusConfig(
  hasDelivery: boolean,
  status?: string,
  daysUntil?: number
): StatusConfig {
  // Draft (no delivery)
  if (!hasDelivery) {
    return {
      borderColor: "border-duck-yellow",
      badgeText: "Draft",
      badgeBg: "bg-duck-yellow",
      badgeTextColor: "text-charcoal",
      icon: <FileEdit className="h-4 w-4" strokeWidth={2} />,
    }
  }

  // Sent/Delivered
  if (status === "sent") {
    return {
      borderColor: "border-teal-primary",
      badgeText: "Delivered",
      badgeBg: "bg-teal-primary",
      badgeTextColor: "text-white",
      icon: <Mail className="h-4 w-4" strokeWidth={2} />,
    }
  }

  // Failed
  if (status === "failed") {
    return {
      borderColor: "border-coral",
      badgeText: "Failed",
      badgeBg: "bg-coral",
      badgeTextColor: "text-white",
      icon: <AlertCircle className="h-4 w-4" strokeWidth={2} />,
    }
  }

  // Scheduled - show days remaining
  const daysText =
    daysUntil === undefined || daysUntil <= 0
      ? "Today"
      : daysUntil === 1
        ? "Tomorrow"
        : `${daysUntil} days`

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
async function LetterDetailContent({ id }: { id: string }) {
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

  const statusConfig = getStatusConfig(hasDelivery, latestDelivery?.status, daysUntil)
  const formattedDate = format(new Date(letter.createdAt), "MMMM d, yyyy")
  const isSent = latestDelivery?.status === "sent"
  const isLocked = hasDelivery && !isSent

  return (
    <div className="space-y-6">
      {/* Main Letter Card */}
      <article
        className={cn(
          "relative border-2 bg-white p-6 md:p-8",
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

        {/* Lock indicator */}
        {isLocked && (
          <div className="absolute top-4 right-6">
            <Lock className="h-5 w-5 text-charcoal/30" strokeWidth={2} />
          </div>
        )}

        {/* Title */}
        <h1 className="mt-4 mb-2 font-mono text-2xl md:text-3xl font-bold uppercase tracking-wide text-charcoal">
          {letter.title || "Untitled Letter"}
        </h1>

        {/* Meta */}
        <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50 mb-6">
          Written on {formattedDate}
        </p>

        {/* Dashed separator */}
        <div className="w-full border-t-2 border-dashed border-charcoal/10 mb-6" />

        {/* Content */}
        <div
          className="prose prose-sm sm:prose max-w-none prose-p:font-mono prose-p:text-charcoal/80 prose-p:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: letter.bodyHtml }}
        />

        {/* Dashed separator */}
        <div className="w-full border-t-2 border-dashed border-charcoal/10 mt-8 mb-4" />

        {/* Actions Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left: Edit action */}
          <div>
            {!isLocked && (
              <Link href={`/letters-v3/${id}/edit`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-2 font-mono text-xs uppercase tracking-wider text-charcoal/60 hover:text-charcoal"
                >
                  <PenLine className="h-4 w-4" />
                  Edit Letter
                </Button>
              </Link>
            )}
          </div>

          {/* Right: Schedule/View delivery */}
          <div>
            {!hasDelivery ? (
              <Link href={`/letters-v3/${id}/schedule`}>
                <Button size="sm" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule Delivery
                </Button>
              </Link>
            ) : (
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50">
                {latestDelivery?.status === "sent"
                  ? `Delivered ${format(new Date(latestDelivery.deliverAt), "MMM d, yyyy")}`
                  : `Delivers ${format(new Date(latestDelivery!.deliverAt), "MMM d, yyyy")}`}
              </span>
            )}
          </div>
        </div>
      </article>

      {/* Delivery Timeline - only if has deliveries */}
      {hasDelivery && (
        <div
          className="border-2 border-charcoal bg-white p-6 shadow-[2px_2px_0_theme(colors.charcoal)]"
          style={{ borderRadius: "2px" }}
        >
          <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-charcoal mb-4">
            Delivery Timeline
          </h2>

          <div className="space-y-3">
            {letter.deliveries.map((delivery) => {
              const deliveryDate = format(new Date(delivery.deliverAt), "MMMM d, yyyy 'at' h:mm a")
              const isDelivered = delivery.status === "sent"
              const isFailed = delivery.status === "failed"
              const isScheduled = delivery.status === "scheduled"
              const isProcessing = delivery.status === "processing"

              return (
                <div
                  key={delivery.id}
                  className={cn(
                    "flex items-center gap-4 border-2 border-l-4 p-4",
                    isDelivered && "border-teal-primary bg-white",
                    isFailed && "border-coral bg-white",
                    isScheduled && "border-duck-blue bg-white",
                    isProcessing && "border-duck-yellow bg-white"
                  )}
                  style={{ borderRadius: "2px" }}
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "flex h-10 w-10 flex-shrink-0 items-center justify-center border-2 border-charcoal",
                      isDelivered && "bg-teal-primary text-white",
                      isFailed && "bg-coral text-white",
                      isScheduled && "bg-duck-blue text-charcoal",
                      isProcessing && "bg-duck-yellow text-charcoal"
                    )}
                    style={{ borderRadius: "2px" }}
                  >
                    {isDelivered && <CheckCircle2 className="h-5 w-5" strokeWidth={2} />}
                    {isFailed && <AlertCircle className="h-5 w-5" strokeWidth={2} />}
                    {isScheduled && <Clock className="h-5 w-5" strokeWidth={2} />}
                    {isProcessing && <Clock className="h-5 w-5 animate-pulse" strokeWidth={2} />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold uppercase tracking-wide text-charcoal">
                        {delivery.channel === "email" ? "Email" : "Mail"}
                      </span>
                      <span
                        className={cn(
                          "px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider",
                          isDelivered && "bg-teal-primary text-white",
                          isFailed && "bg-coral text-white",
                          isScheduled && "bg-duck-blue text-charcoal",
                          isProcessing && "bg-duck-yellow text-charcoal"
                        )}
                        style={{ borderRadius: "2px" }}
                      >
                        {delivery.status}
                      </span>
                    </div>

                    <p className="mt-1 font-mono text-xs text-charcoal/60">
                      {deliveryDate}
                    </p>

                    {delivery.channel === "email" && delivery.emailDelivery?.toEmail && (
                      <p className="font-mono text-xs text-charcoal/40">
                        To: {delivery.emailDelivery.toEmail}
                      </p>
                    )}

                    {isFailed && delivery.lastError && (
                      <p className="mt-1 font-mono text-xs text-coral">
                        {delivery.lastError}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  {isScheduled && (
                    <Link href={`/letters-v3/${id}/schedule`}>
                      <Button variant="outline" size="sm" className="font-mono text-xs uppercase tracking-wider">
                        Reschedule
                      </Button>
                    </Link>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Schedule CTA - only if no deliveries */}
      {!hasDelivery && (
        <div
          className="border-2 border-charcoal bg-duck-cream p-8 md:p-12 shadow-[2px_2px_0_theme(colors.charcoal)]"
          style={{ borderRadius: "2px" }}
        >
          <div className="flex flex-col items-center justify-center text-center space-y-6">
            {/* Icon */}
            <div
              className="flex h-16 w-16 items-center justify-center border-2 border-charcoal bg-duck-yellow"
              style={{ borderRadius: "2px" }}
            >
              <Calendar className="h-8 w-8 text-charcoal" strokeWidth={2} />
            </div>

            {/* Message */}
            <div className="space-y-2 max-w-md">
              <h2 className="font-mono text-xl md:text-2xl font-bold uppercase tracking-wide text-charcoal">
                Ready to send this letter?
              </h2>
              <p className="font-mono text-sm text-charcoal/70">
                Schedule a delivery date and your letter will arrive in your inbox when the time comes.
              </p>
            </div>

            {/* CTA */}
            <Link href={`/letters-v3/${id}/schedule`}>
              <Button className="gap-2">
                Schedule Delivery
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Danger Zone */}
      <div
        className="border-2 border-charcoal/20 bg-white p-6"
        style={{ borderRadius: "2px" }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal/60">
              Danger Zone
            </h3>
            <p className="mt-1 font-mono text-xs text-charcoal/40">
              {hasDelivery
                ? "Cancel deliveries and permanently delete this letter."
                : "Permanently delete this letter."}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 font-mono text-xs uppercase tracking-wider text-coral/70 hover:text-coral hover:bg-coral/5"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}

export default async function LetterDetailV3Page({ params }: PageProps) {
  const { id } = await params

  // Verify user is authenticated
  await requireUser()

  return (
    <div className="container">
      {/* Header - matches letters-v3 page pattern */}
      <header className="flex flex-col gap-4 py-12 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Link href="/letters-v3">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 -ml-4 font-mono text-xs uppercase tracking-wider text-charcoal/60 hover:text-charcoal"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Letters
            </Button>
          </Link>
        </div>
      </header>

      {/* Letter Content */}
      <section className="pb-12">
        <Suspense fallback={<LetterDetailV3Skeleton />}>
          <LetterDetailContent id={id} />
        </Suspense>
      </section>
    </div>
  )
}
