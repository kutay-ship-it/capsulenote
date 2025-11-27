"use client"

import { format } from "date-fns"
import { motion } from "framer-motion"
import { Mail, Lock, Clock, AlertCircle, FileEdit, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { JourneyLetter } from "./types"
import { STATUS_CONFIG } from "./types"

interface LetterNodeProps {
  letter: JourneyLetter
  size?: "compact" | "normal" | "large"
  showPreview?: boolean
  className?: string
  style?: React.CSSProperties
  index?: number
}

const STATUS_ICONS = {
  draft: FileEdit,
  scheduled: Clock,
  processing: Clock,
  sent: Mail,
  failed: AlertCircle,
}

export function LetterNode({
  letter,
  size = "normal",
  showPreview = false,
  className,
  style,
  index = 0,
}: LetterNodeProps) {
  const config = STATUS_CONFIG[letter.status]
  const Icon = STATUS_ICONS[letter.status]
  const isDelivered = letter.status === "sent"

  // Size-specific classes
  const sizeClasses = {
    compact: "p-3",
    normal: "p-5",
    large: "p-6 md:p-8",
  }

  const titleClasses = {
    compact: "text-sm",
    normal: "text-base",
    large: "text-lg md:text-xl",
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className={cn(
        "relative border-2 bg-white transition-all duration-200 cursor-pointer group",
        "hover:-translate-y-0.5 hover:shadow-[6px_6px_0_theme(colors.charcoal)]",
        "shadow-[4px_4px_0_theme(colors.charcoal)]",
        config.borderColor,
        sizeClasses[size],
        className
      )}
      style={{ borderRadius: "2px", ...style }}
    >
      {/* Floating Status Badge */}
      <div
        className={cn(
          "absolute -top-3 left-4 flex items-center gap-1.5",
          "px-2 py-0.5 border-2 border-charcoal font-mono text-[10px] font-bold uppercase tracking-wider",
          config.badgeBg,
          config.badgeText
        )}
        style={{ borderRadius: "2px" }}
      >
        <Icon className="h-3 w-3" strokeWidth={2.5} />
        <span>{config.label}</span>
      </div>

      {/* Delivery Date Badge (top right for delivered) */}
      {isDelivered && (
        <div
          className="absolute -top-3 right-4 px-2 py-0.5 bg-white border-2 border-teal-primary font-mono text-[10px] font-bold uppercase tracking-wider text-teal-primary"
          style={{ borderRadius: "2px" }}
        >
          {format(letter.deliverAt, "MMM d, yyyy")}
        </div>
      )}

      {/* Content */}
      <div className="pt-2">
        {/* Title */}
        <h4
          className={cn(
            "font-mono font-bold leading-tight mb-2 line-clamp-2",
            titleClasses[size],
            isDelivered ? "text-teal-primary" : "text-charcoal"
          )}
        >
          {letter.title}
        </h4>

        {/* Preview Text (optional) */}
        {showPreview && letter.preview && (
          <p className="font-mono text-xs text-charcoal/50 line-clamp-2 mb-4 leading-relaxed">
            {letter.preview}
          </p>
        )}

        {/* Dashed Separator */}
        <div className="w-full border-t-2 border-dashed border-charcoal/10 mb-3" />

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-[10px] text-charcoal/40 uppercase tracking-wider">
              {isDelivered ? "Delivered" : "Scheduled"}
            </span>
            <span className="font-mono text-[11px] font-bold text-charcoal">
              {format(letter.deliverAt, isDelivered ? "MMM d, yyyy" : "MMM d, yyyy 'at' h:mm a")}
            </span>
          </div>

          <ArrowRight
            className={cn(
              "h-4 w-4 transition-transform group-hover:translate-x-1",
              isDelivered ? "text-teal-primary" : "text-charcoal/40"
            )}
            strokeWidth={2}
          />
        </div>
      </div>
    </motion.article>
  )
}

// Compact variant for archive view
export function LetterNodeCompact({
  letter,
  className,
  index = 0,
}: {
  letter: JourneyLetter
  className?: string
  index?: number
}) {
  const config = STATUS_CONFIG[letter.status]
  const Icon = STATUS_ICONS[letter.status]
  const isDelivered = letter.status === "sent"

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className={cn(
        "relative border-2 bg-white p-3 transition-all duration-200 cursor-pointer group",
        "hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
        "shadow-[2px_2px_0_theme(colors.charcoal)]",
        config.borderColor,
        className
      )}
      style={{ borderRadius: "2px" }}
    >
      {/* Status Dot */}
      <div
        className={cn("absolute top-2 right-2 w-2 h-2", config.dotColor)}
        style={{ borderRadius: "50%" }}
      />

      {/* Content */}
      <div className="pr-4">
        <h5 className="font-mono text-xs font-bold text-charcoal line-clamp-1 mb-1">
          {letter.title}
        </h5>
        <div className="flex items-center gap-2 font-mono text-[10px] text-charcoal/50">
          <Icon className="h-3 w-3" strokeWidth={2} />
          <span>{format(letter.deliverAt, "MMM d, yyyy")}</span>
        </div>
      </div>
    </motion.div>
  )
}
