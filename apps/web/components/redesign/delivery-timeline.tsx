"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { format, getYear, startOfDay, startOfYear, endOfYear } from "date-fns"
import { CheckCircle2, Circle, AlertCircle } from "lucide-react"
import { useTranslations } from "next-intl"

import { cn } from "@/lib/utils"
import type { DeliveryTimelineItem } from "@/server/actions/redesign-dashboard"

interface DeliveryTimelineProps {
  deliveries: DeliveryTimelineItem[]
}

/**
 * Get a date key for grouping same-day deliveries (YYYY-MM-DD)
 */
function getDateKey(date: Date): string {
  return format(startOfDay(date), "yyyy-MM-dd")
}

/**
 * Calculate position of a delivery on the timeline as a percentage
 * Uses start of day for positioning to group same-day deliveries
 */
function calculatePosition(
  deliverAt: Date,
  minDate: Date,
  maxDate: Date
): number {
  // Use start of day for position calculation to group same-day items
  const normalizedDate = startOfDay(deliverAt)
  const normalizedMin = startOfDay(minDate)
  const normalizedMax = startOfDay(maxDate)

  const range = normalizedMax.getTime() - normalizedMin.getTime()
  if (range === 0) return 50 // Single point, center it
  const position =
    ((normalizedDate.getTime() - normalizedMin.getTime()) / range) * 100
  // Add more padding to keep nodes away from edges
  return Math.max(8, Math.min(92, position))
}

/**
 * Generate year markers for the timeline axis
 */
function generateYearMarkers(
  minYear: number,
  maxYear: number
): { year: number; position: number }[] {
  const markers: { year: number; position: number }[] = []
  const range = maxYear - minYear

  if (range === 0) {
    return [{ year: minYear, position: 50 }]
  }

  for (let year = minYear; year <= maxYear; year++) {
    // Add padding to keep labels visible (8% from edges)
    const position = 8 + ((year - minYear) / range) * 84
    markers.push({ year, position })
  }

  return markers
}

/**
 * Sanitize title - handle potential encoding issues or empty titles
 */
function sanitizeTitle(title: string | null | undefined): string {
  if (!title) return "Untitled"
  // Replace any control characters or invalid UTF-8
  const sanitized = title.replace(/[\x00-\x1F\x7F-\x9F]/g, "")
  return sanitized || "Untitled"
}

export function DeliveryTimeline({ deliveries }: DeliveryTimelineProps) {
  const t = useTranslations("redesign.timeline")
  const router = useRouter()
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  // Don't render if fewer than 2 deliveries
  if (deliveries.length < 2) {
    return null
  }

  // Calculate timeline bounds with same-day clustering
  const { minDate, maxDate, minYear, maxYear, yearMarkers, positionedDeliveries } =
    useMemo(() => {
      const sortedDeliveries = [...deliveries].sort(
        (a, b) => new Date(a.deliverAt).getTime() - new Date(b.deliverAt).getTime()
      )

      // Use start of year for min and end of year for max to show full context
      // This creates a "journey" feel with space before and after
      const minD = startOfYear(new Date(sortedDeliveries[0]!.deliverAt))
      const maxD = endOfYear(new Date(sortedDeliveries[sortedDeliveries.length - 1]!.deliverAt))
      const minY = getYear(minD)
      const maxY = getYear(maxD)

      const markers = generateYearMarkers(minY, maxY)

      // Group deliveries by day
      const dayGroups = new Map<string, typeof sortedDeliveries>()
      sortedDeliveries.forEach((delivery) => {
        const dateKey = getDateKey(new Date(delivery.deliverAt))
        if (!dayGroups.has(dateKey)) {
          dayGroups.set(dateKey, [])
        }
        dayGroups.get(dateKey)!.push(delivery)
      })

      const positioned: any[] = []

      // Process each day group
      dayGroups.forEach((dayDeliveries, dateKey) => {
        // Split into chunks of 3
        for (let i = 0; i < dayDeliveries.length; i += 3) {
          const chunk = dayDeliveries.slice(i, i + 3)
          const columnIndex = Math.floor(i / 3)
          const columnSize = chunk.length

          chunk.forEach((delivery, indexInChunk) => {
            const deliverDate = new Date(delivery.deliverAt)

            // Center the group vertically
            const verticalOffset = (indexInChunk - (columnSize - 1) / 2) * 32

            // Shift columns to the right (40px per column)
            const horizontalShift = columnIndex * 40

            positioned.push({
              ...delivery,
              position: calculatePosition(deliverDate, minD, maxD),
              verticalOffset,
              horizontalShift, // New property for pixel offset
              groupSize: columnSize, // Size of this specific column/chunk
              indexInGroup: indexInChunk, // Index within this chunk
              totalDayCount: dayDeliveries.length, // Total items for the day (for badges/tooltips if needed)
              dayColumnIndex: columnIndex, // Which column is this?
            })
          })
        }
      })

      return {
        minDate: minD,
        maxDate: maxD,
        minYear: minY,
        maxYear: maxY,
        yearMarkers: markers,
        positionedDeliveries: positioned,
      }
    }, [deliveries])

  const handleDeliveryClick = (letterId: string) => {
    router.push(`/letters/${letterId}`)
  }

  // Calculate maximum vertical offset to adjust container height
  const maxVerticalOffset = useMemo(() => {
    return Math.max(0, ...positionedDeliveries.map((d) => d.verticalOffset))
  }, [positionedDeliveries])

  // Base height (line at 128px/top-32) + max offset + padding
  const containerHeight = 128 + maxVerticalOffset + 64

  return (
    <div className="mb-8">
      {/* Section header */}
      <h3 className="mb-4 font-mono text-sm uppercase tracking-wide text-charcoal">
        {t("title")}
      </h3>

      {/* Timeline container - horizontally scrollable on mobile */}
      <div
        className="overflow-x-auto pb-4"
        style={{ scrollbarWidth: "thin" }}
      >
        <div
          className="relative min-w-[800px]"
          style={{
            minWidth: `${Math.max(yearMarkers.length * 400, 800)}px`,
            height: `${containerHeight}px`,
          }}
        >
          {/* Year markers */}
          <div className="absolute inset-x-0 top-0 h-6">
            {yearMarkers.map(({ year, position }) => (
              <div
                key={year}
                className="absolute text-center"
                style={{ left: `${position}%`, transform: "translateX(-50%)" }}
              >
                <span className="font-mono text-xs tabular-nums text-gray-secondary">
                  {year}
                </span>
              </div>
            ))}
          </div>

          {/* Timeline line */}
          <div
            className="absolute top-32 h-0.5 bg-charcoal/20"
            style={{ left: "4%", right: "4%", borderRadius: "1px" }}
          />
          {/* Active Timeline line (dashed or styled if needed, keeping simple for now but lighter bg above) */}
          <div
            className="absolute top-32 h-0.5 bg-charcoal"
            style={{ left: "4%", right: "4%", borderRadius: "1px" }}
          />

          {/* Delivery nodes */}
          {positionedDeliveries.map((delivery) => {
            const isHovered = hoveredId === delivery.id
            const title = sanitizeTitle(delivery.letter.title)
            const nodeColor =
              delivery.status === "sent"
                ? "bg-teal-primary border-charcoal"
                : delivery.status === "scheduled"
                  ? "bg-white border-charcoal"
                  : "bg-coral border-charcoal"

            const IconComponent =
              delivery.status === "sent"
                ? CheckCircle2
                : delivery.status === "failed"
                  ? AlertCircle
                  : Circle

            // Calculate top position: base (line at 128px - half node 12px = 116px) + vertical offset
            const topPosition = 116 + delivery.verticalOffset

            // For stacked items (not the first in group), show a connecting line
            const showConnector = delivery.indexInGroup > 0

            return (
              <div
                key={delivery.id}
                className="absolute -translate-x-1/2"
                style={{
                  left: `calc(${delivery.position}% + ${delivery.horizontalShift}px)`,
                  top: `${topPosition}px`,
                }}
              >
                {/* Vertical connector for stacked items */}
                {showConnector && (
                  <div
                    className="absolute left-1/2 -translate-x-1/2 w-0.5 bg-charcoal/30"
                    style={{
                      top: "-32px",
                      height: "32px",
                    }}
                  />
                )}

                {/* Node */}
                <button
                  onClick={() => handleDeliveryClick(delivery.letter.id)}
                  onMouseEnter={() => setHoveredId(delivery.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={cn(
                    "relative flex h-6 w-6 items-center justify-center border-2 transition-transform duration-150",
                    nodeColor,
                    isHovered && "scale-125 z-10"
                  )}
                  style={{ borderRadius: "50%" }}
                  aria-label={`${title} - ${delivery.status}`}
                >
                  <IconComponent
                    className={cn(
                      "h-3 w-3",
                      delivery.status === "sent"
                        ? "text-white"
                        : delivery.status === "failed"
                          ? "text-white"
                          : "text-charcoal"
                    )}
                    strokeWidth={2}
                  />
                </button>

                {/* Tooltip */}
                {isHovered && (
                  <div
                    className="absolute left-1/2 top-8 z-20 w-48 -translate-x-1/2 border-2 border-charcoal bg-white p-3 shadow-sm"
                    style={{ borderRadius: "2px" }}
                  >
                    <p className="mb-1 truncate font-mono text-sm font-semibold text-charcoal">
                      &ldquo;{title}&rdquo;
                    </p>
                    <p className="font-mono text-xs text-gray-secondary">
                      {format(new Date(delivery.deliverAt), "MMM d, yyyy")}
                    </p>
                    <p
                      className={cn(
                        "mt-1 font-mono text-xs uppercase",
                        delivery.status === "sent"
                          ? "text-teal-primary"
                          : delivery.status === "failed"
                            ? "text-coral"
                            : "text-charcoal"
                      )}
                    >
                      {delivery.status === "sent"
                        ? t("delivered")
                        : delivery.status === "failed"
                          ? t("failed")
                          : t("waiting")}
                    </p>
                    {/* Show group info in tooltip for same-day items */}
                    {delivery.totalDayCount > 1 && (
                      <p className="mt-1 font-mono text-xs text-gray-secondary">
                        {delivery.dayColumnIndex > 0 ? "Extended journey" : "Same day bundle"}
                      </p>
                    )}
                  </div>
                )}

                {/* Label below node - only show for single items (no stacks, no extra columns) */}
                {delivery.groupSize === 1 && delivery.totalDayCount === 1 && !isHovered && (
                  <div className="absolute left-1/2 top-8 w-28 -translate-x-1/2 pt-2 text-center">
                    <p
                      className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-xs text-charcoal"
                      title={title}
                    >
                      {title}
                    </p>
                    {delivery.status === "sent" && (
                      <p className="font-mono text-xs text-teal-primary">
                        {t("sent")}
                      </p>
                    )}
                  </div>
                )}

                {/* Count badge for grouped items - show on first item only */}
                {delivery.groupSize > 1 && delivery.indexInGroup === 0 && (
                  <div
                    className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full border border-charcoal bg-white font-mono text-[10px] font-semibold text-charcoal"
                    title={`${delivery.groupSize} letters in this stack`}
                  >
                    {delivery.groupSize}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
