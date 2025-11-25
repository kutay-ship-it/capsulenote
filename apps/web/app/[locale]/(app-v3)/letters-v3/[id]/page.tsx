import { Suspense } from "react"
import { notFound } from "next/navigation"
import { format } from "date-fns"
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
      {/* Header skeleton */}
      <div
        className="border-2 border-charcoal bg-white p-6 animate-pulse"
        style={{ borderRadius: "2px" }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="h-5 w-20 bg-charcoal/20" style={{ borderRadius: "2px" }} />
            <div className="h-8 w-64 bg-charcoal/10" style={{ borderRadius: "2px" }} />
            <div className="h-4 w-40 bg-charcoal/10" style={{ borderRadius: "2px" }} />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-24 bg-charcoal/10" style={{ borderRadius: "2px" }} />
            <div className="h-10 w-24 bg-charcoal/10" style={{ borderRadius: "2px" }} />
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div
        className="border-2 border-charcoal bg-white p-6 animate-pulse"
        style={{ borderRadius: "2px" }}
      >
        <div className="space-y-3">
          <div className="h-4 w-full bg-charcoal/10" style={{ borderRadius: "2px" }} />
          <div className="h-4 w-full bg-charcoal/10" style={{ borderRadius: "2px" }} />
          <div className="h-4 w-3/4 bg-charcoal/10" style={{ borderRadius: "2px" }} />
          <div className="h-4 w-full bg-charcoal/10" style={{ borderRadius: "2px" }} />
          <div className="h-4 w-2/3 bg-charcoal/10" style={{ borderRadius: "2px" }} />
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
    ? Math.ceil(
        (new Date(latestDelivery.deliverAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : undefined

  const statusConfig = getStatusConfig(hasDelivery, latestDelivery?.status, daysUntil)
  const formattedDate = format(new Date(letter.createdAt), "MMMM d, yyyy")
  const isSent = latestDelivery?.status === "sent"
  const isLocked = hasDelivery && !isSent

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div
        className={cn(
          "border-2 bg-white p-6",
          statusConfig.borderColor
        )}
        style={{ borderRadius: "2px" }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          {/* Left: Title & Meta */}
          <div className="space-y-3">
            {/* Status Badge */}
            <div
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider",
                statusConfig.badgeBg,
                statusConfig.badgeTextColor
              )}
              style={{ borderRadius: "2px" }}
            >
              {statusConfig.icon}
              <span>{statusConfig.badgeText}</span>
            </div>

            {/* Title */}
            <h1 className="font-mono text-2xl md:text-3xl font-bold text-charcoal">
              {letter.title || "Untitled Letter"}
            </h1>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-charcoal/60">
              <span>Written on {formattedDate}</span>
              {isLocked && (
                <span className="flex items-center gap-1 text-charcoal/40">
                  <Lock className="h-3 w-3" strokeWidth={2} />
                  Locked for delivery
                </span>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-wrap gap-2">
            {!isLocked && (
              <Link href={{ pathname: "/letters-v3/[id]/edit", params: { id } } as any}>
                <Button variant="outline" size="sm" className="gap-2">
                  <PenLine className="h-4 w-4" />
                  Edit
                </Button>
              </Link>
            )}
            {!hasDelivery && (
              <Link href={{ pathname: "/letters-v3/[id]/schedule", params: { id } } as any}>
                <Button size="sm" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Content Card */}
      <div
        className="border-2 border-charcoal bg-white p-6 md:p-8"
        style={{ borderRadius: "2px" }}
      >
        <div
          className="prose prose-sm sm:prose max-w-none font-serif"
          dangerouslySetInnerHTML={{ __html: letter.bodyHtml }}
        />
      </div>

      {/* Delivery Timeline Card - only if has deliveries */}
      {hasDelivery && (
        <div
          className="border-2 border-charcoal bg-white p-6"
          style={{ borderRadius: "2px" }}
        >
          <h2 className="mb-4 font-mono text-sm font-bold uppercase tracking-wider text-charcoal">
            Delivery Timeline
          </h2>

          <div className="space-y-4">
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
                    "flex items-start gap-4 border-l-4 p-4",
                    isDelivered && "border-l-teal-primary bg-teal-primary/5",
                    isFailed && "border-l-coral bg-coral/5",
                    isScheduled && "border-l-duck-blue bg-duck-blue/5",
                    isProcessing && "border-l-duck-yellow bg-duck-yellow/5"
                  )}
                  style={{ borderRadius: "0 2px 2px 0" }}
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
                      <span className="font-mono text-sm font-bold uppercase text-charcoal">
                        {delivery.channel === "email" ? "Email Delivery" : "Physical Mail"}
                      </span>
                      <span
                        className={cn(
                          "px-2 py-0.5 font-mono text-[10px] font-bold uppercase",
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
                      {isDelivered ? "Delivered on " : isScheduled ? "Scheduled for " : ""}
                      {deliveryDate}
                    </p>

                    {delivery.channel === "email" && delivery.emailDelivery?.toEmail && (
                      <p className="mt-1 font-mono text-xs text-charcoal/60">
                        To: {delivery.emailDelivery.toEmail}
                      </p>
                    )}

                    {isFailed && delivery.lastError && (
                      <p className="mt-2 font-mono text-xs text-coral">
                        Error: {delivery.lastError}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  {isScheduled && (
                    <Link href={{ pathname: "/letters-v3/[id]/schedule", params: { id } } as any}>
                      <Button variant="ghost" size="sm" className="text-xs">
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
          className="border-2 border-dashed border-charcoal/30 bg-duck-cream/50 p-8 text-center"
          style={{ borderRadius: "2px" }}
        >
          <div className="flex flex-col items-center gap-4">
            <div
              className="flex h-12 w-12 items-center justify-center border-2 border-charcoal bg-white"
              style={{ borderRadius: "2px" }}
            >
              <Calendar className="h-6 w-6 text-charcoal" strokeWidth={2} />
            </div>

            <div className="space-y-1">
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-charcoal">
                Ready to send?
              </h3>
              <p className="font-mono text-xs text-charcoal/60">
                Schedule this letter to be delivered to your future self
              </p>
            </div>

            <Link href={{ pathname: "/letters-v3/[id]/schedule", params: { id } } as any}>
              <Button className="gap-2">
                <Calendar className="h-4 w-4" />
                Schedule Delivery
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Danger Zone - Delete */}
      <div
        className="border-2 border-charcoal/20 bg-white p-6"
        style={{ borderRadius: "2px" }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-charcoal">
              Danger Zone
            </h3>
            <p className="mt-1 font-mono text-xs text-charcoal/60">
              {hasDelivery
                ? "This will cancel any scheduled deliveries and permanently delete this letter."
                : "This will permanently delete this letter."}
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2 text-coral hover:bg-coral/10 hover:text-coral border-coral/30">
            <Trash2 className="h-4 w-4" />
            Delete Letter
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
    <div className="container py-8">
      {/* Back Link */}
      <div className="mb-6">
        <Link href="/letters-v3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 font-mono text-xs uppercase tracking-wider text-charcoal/70 hover:text-charcoal"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Letters
          </Button>
        </Link>
      </div>

      {/* Letter Content - Streams with Suspense */}
      <Suspense fallback={<LetterDetailV3Skeleton />}>
        <LetterDetailContent id={id} />
      </Suspense>
    </div>
  )
}
