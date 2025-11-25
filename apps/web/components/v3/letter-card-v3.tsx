import { format, differenceInDays } from "date-fns"
import { Mail, Clock, FileEdit, AlertCircle, ArrowRight, Lock } from "lucide-react"

import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import type { LetterWithPreview } from "@/server/actions/redesign-dashboard"

export type ViewMode = "grid" | "list"

interface LetterCardV3Props {
  letter: LetterWithPreview
  viewMode?: ViewMode
}

/**
 * Status configuration for card styling - V3 brutalist design
 */
type StatusConfig = {
  borderColor: string
  bgColor: string
  badgeText: string
  badgeBg: string
  badgeText2: string
  icon: React.ReactNode
}

function getStatusConfig(letter: LetterWithPreview): StatusConfig {
  // Draft (no delivery)
  if (!letter.delivery) {
    return {
      borderColor: "border-duck-yellow",
      bgColor: "bg-white",
      badgeText: "Draft",
      badgeBg: "bg-duck-yellow",
      badgeText2: "text-charcoal",
      icon: <FileEdit className="h-4 w-4" strokeWidth={2} />,
    }
  }

  const { status, deliverAt } = letter.delivery

  // Sent/Delivered
  if (status === "sent") {
    return {
      borderColor: "border-teal-primary",
      bgColor: "bg-white",
      badgeText: "Delivered",
      badgeBg: "bg-teal-primary",
      badgeText2: "text-white",
      icon: <Mail className="h-4 w-4" strokeWidth={2} />,
    }
  }

  // Failed
  if (status === "failed") {
    return {
      borderColor: "border-coral",
      bgColor: "bg-white",
      badgeText: "Failed",
      badgeBg: "bg-coral",
      badgeText2: "text-white",
      icon: <AlertCircle className="h-4 w-4" strokeWidth={2} />,
    }
  }

  // Scheduled - show days remaining
  const daysUntil = differenceInDays(new Date(deliverAt), new Date())
  const daysText =
    daysUntil <= 0
      ? "Today"
      : daysUntil === 1
        ? "Tomorrow"
        : `${daysUntil} days`

  return {
    borderColor: "border-duck-blue",
    bgColor: "bg-white",
    badgeText: daysText,
    badgeBg: "bg-duck-blue",
    badgeText2: "text-charcoal",
    icon: <Clock className="h-4 w-4" strokeWidth={2} />,
  }
}

export function LetterCardV3({ letter, viewMode = "grid" }: LetterCardV3Props) {
  const statusConfig = getStatusConfig(letter)
  const formattedDate = format(new Date(letter.createdAt), "MMM d, yyyy")
  const isSent = letter.delivery?.status === "sent"

  // List view - horizontal layout
  if (viewMode === "list") {
    return (
      <Link
        href={`/letters-v3/${letter.id}`}
        className="block group"
      >
        <article
          className={cn(
            "relative flex items-center gap-4 border-2 border-l-4 p-4 transition-all duration-150",
            "hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
            "shadow-[2px_2px_0_theme(colors.charcoal)]",
            statusConfig.borderColor,
            statusConfig.bgColor
          )}
          style={{ borderRadius: "2px" }}
        >
          {/* Status Badge - Left side */}
          <div
            className={cn(
              "flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider",
              statusConfig.badgeBg,
              statusConfig.badgeText2
            )}
            style={{ borderRadius: "2px" }}
          >
            {statusConfig.icon}
            <span className="hidden sm:inline">{statusConfig.badgeText}</span>
          </div>

          {/* Content - flexible width */}
          <div className="flex-1 min-w-0">
            <h3 className="line-clamp-1 font-mono text-sm font-bold text-charcoal group-hover:text-duck-blue transition-colors">
              {letter.title || "Untitled Letter"}
            </h3>
            <p className="line-clamp-1 font-mono text-xs text-charcoal/60 mt-0.5">
              {letter.bodyPreview || "No content yet..."}
            </p>
          </div>

          {/* Date - right aligned */}
          <span className="flex-shrink-0 font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50 hidden sm:block">
            {formattedDate}
          </span>

          {/* Lock or Arrow */}
          <div className="flex-shrink-0">
            {!isSent && letter.delivery ? (
              <Lock className="h-4 w-4 text-charcoal/30" strokeWidth={2} />
            ) : (
              <ArrowRight
                className="h-4 w-4 text-charcoal/30 transition-transform group-hover:translate-x-1 group-hover:text-charcoal"
                strokeWidth={2}
              />
            )}
          </div>
        </article>
      </Link>
    )
  }

  // Grid view - vertical card layout (default)
  return (
    <Link
      href={`/letters-v3/${letter.id}`}
      className="block group"
    >
      <article
        className={cn(
          "relative border-2 p-5 transition-all duration-150",
          "hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
          "shadow-[2px_2px_0_theme(colors.charcoal)]",
          statusConfig.borderColor,
          statusConfig.bgColor
        )}
        style={{ borderRadius: "2px" }}
      >
        {/* Status Badge - Floating on top border */}
        <div
          className={cn(
            "absolute -top-3 left-4 flex items-center gap-1.5 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider",
            statusConfig.badgeBg,
            statusConfig.badgeText2
          )}
          style={{ borderRadius: "2px" }}
        >
          {statusConfig.icon}
          <span>{statusConfig.badgeText}</span>
        </div>

        {/* Lock icon for undelivered letters */}
        {!isSent && letter.delivery && (
          <div className="absolute top-3 right-3">
            <Lock className="h-4 w-4 text-charcoal/30" strokeWidth={2} />
          </div>
        )}

        {/* Title */}
        <h3 className="mt-2 mb-2 line-clamp-1 font-mono text-base font-bold text-charcoal group-hover:text-duck-blue transition-colors">
          {letter.title || "Untitled Letter"}
        </h3>

        {/* Preview text - 2 lines with truncation, fixed height for alignment */}
        <p className="mb-4 line-clamp-2 min-h-[2.5rem] font-mono text-xs text-charcoal/60 leading-relaxed">
          {letter.bodyPreview || "No content yet..."}
        </p>

        {/* Dashed separator */}
        <div className="w-full border-t-2 border-dashed border-charcoal/10 mb-3" />

        {/* Bottom row: Date + Arrow */}
        <div className="flex items-center justify-between">
          {/* Written date */}
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50">
            {formattedDate}
          </span>

          {/* Arrow indicator */}
          <ArrowRight
            className="h-4 w-4 text-charcoal/30 transition-transform group-hover:translate-x-1 group-hover:text-charcoal"
            strokeWidth={2}
          />
        </div>
      </article>
    </Link>
  )
}

/**
 * Skeleton loader for letter card
 */
export function LetterCardV3Skeleton() {
  return (
    <div
      className="relative border-2 border-charcoal bg-white p-5 animate-pulse"
      style={{ borderRadius: "2px" }}
    >
      {/* Badge skeleton */}
      <div
        className="absolute -top-3 left-4 h-5 w-16 bg-charcoal/20"
        style={{ borderRadius: "2px" }}
      />

      {/* Title skeleton */}
      <div className="mt-2 mb-2 h-5 w-3/4 bg-charcoal/10" style={{ borderRadius: "2px" }} />

      {/* Preview skeleton - 2 lines with fixed height */}
      <div className="min-h-[2.5rem] mb-4 space-y-1">
        <div className="h-3 w-full bg-charcoal/10" style={{ borderRadius: "2px" }} />
        <div className="h-3 w-2/3 bg-charcoal/10" style={{ borderRadius: "2px" }} />
      </div>

      {/* Separator */}
      <div className="w-full border-t-2 border-dashed border-charcoal/10 mb-3" />

      {/* Bottom row skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-3 w-20 bg-charcoal/10" style={{ borderRadius: "2px" }} />
        <div className="h-4 w-4 bg-charcoal/10" style={{ borderRadius: "2px" }} />
      </div>
    </div>
  )
}
