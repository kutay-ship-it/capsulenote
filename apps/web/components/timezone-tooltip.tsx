"use client"

import { Info, Globe, Clock } from "lucide-react"
import { useTranslations } from "next-intl"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getUserTimezone, getUTCOffset, isDST } from "@/lib/utils"

interface TimezoneTooltipProps {
  deliveryDate?: Date | string
  variant?: "info" | "globe" | "clock"
  className?: string
}

/**
 * Timezone Tooltip Component
 *
 * Shows timezone information on hover with:
 * - User's current timezone
 * - UTC offset
 * - DST status (if applicable)
 *
 * Used throughout the app to provide timezone clarity
 */
export function TimezoneTooltip({
  deliveryDate,
  variant = "info",
  className = "",
}: TimezoneTooltipProps) {
  const t = useTranslations("components.timezoneTooltip")
  const timezone = getUserTimezone()
  const offset = getUTCOffset(deliveryDate)
  const inDST = deliveryDate ? isDST(deliveryDate) : isDST()

  const Icon = variant === "globe" ? Globe : variant === "clock" ? Clock : Info

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`inline-flex items-center justify-center transition-colors hover:text-charcoal ${className}`}
            aria-label={t("ariaLabel")}
          >
            <Icon className="h-4 w-4 text-gray-secondary" strokeWidth={2} />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="border-2 border-charcoal font-mono text-xs"
          style={{ borderRadius: "2px" }}
        >
          <div className="space-y-1">
            <p className="font-normal">
              <strong>{t("yourTimezone")}</strong> {timezone}
            </p>
            <p className="text-gray-secondary">{offset}</p>
            {inDST && (
              <p className="text-duck-yellow">
                {t("currentlyDST")}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * DST Education Tooltip
 *
 * Explains Daylight Saving Time changes for delivery scheduling
 */
export function DSTTooltip({ className = "" }: { className?: string }) {
  const t = useTranslations("components.dstTooltip")

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className={`inline-flex items-center justify-center transition-colors hover:text-charcoal ${className}`}
            aria-label={t("ariaLabel")}
          >
            <Info className="h-4 w-4 text-duck-yellow" strokeWidth={2} />
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="border-2 border-charcoal font-mono text-xs max-w-xs"
          style={{ borderRadius: "2px" }}
        >
          <div className="space-y-2">
            <p className="font-normal">
              <strong>{t("title")}</strong>
            </p>
            <p className="text-gray-secondary leading-relaxed">
              {t("explanation")}
            </p>
            <p className="text-gray-secondary leading-relaxed">
              {t("example")}
            </p>
            <p className="text-duck-yellow text-xs">
              {t("tip")}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
