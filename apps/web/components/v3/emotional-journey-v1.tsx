"use client"

import { useMemo, useRef, useState, useEffect } from "react"
import { format, differenceInDays, startOfYear } from "date-fns"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, Mail, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DeliveryTimelineItem } from "@/server/actions/redesign-dashboard"

interface EmotionalJourneyV1Props {
  deliveries: DeliveryTimelineItem[]
}

/**
 * V1 - Original version with simple dashed path
 * - Simple stroke without gradient
 * - Same cubic Bezier curves for smooth S-curves
 * - No gradient fading at edges
 */
export function EmotionalJourneyV1({ deliveries }: EmotionalJourneyV1Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Ensure component is mounted before using scroll animations
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Calculate layout with "Elastic Time"
  const { items, totalWidth, yearMarkers, nowX } = useMemo(() => {
    if (deliveries.length === 0)
      return { items: [], totalWidth: 0, yearMarkers: [], nowX: 0 }

    const now = new Date()

    // Sort deliveries by date first
    const sortedDeliveries = [...deliveries].sort(
      (a, b) => new Date(a.deliverAt).getTime() - new Date(b.deliverAt).getTime()
    )

    const firstDate = new Date(sortedDeliveries[0]!.deliverAt)
    const startDate = startOfYear(firstDate)

    const pxPerDay = 3
    const cardWidth = 288 // w-72 = 18rem = 288px
    const minCardGap = 380 // Generous spacing between cards

    let currentX = 200 // Initial padding
    const calculatedItems: any[] = []

    // First pass: position all cards
    sortedDeliveries.forEach((item, index) => {
      const date = new Date(item.deliverAt)
      const daysFromStart = differenceInDays(date, startDate)
      const idealX = 200 + daysFromStart * pxPerDay

      const isTop = index % 2 === 0

      const x = Math.max(idealX, currentX + minCardGap)
      currentX = x

      calculatedItems.push({
        ...item,
        x,
        isTop,
        date,
      })
    })

    // Calculate NOW position - find where it should go between cards
    const nowTime = now.getTime()
    let calculatedNowX = 0

    // Find the cards before and after NOW
    let cardBeforeNow: any = null
    let cardAfterNow: any = null

    for (let i = 0; i < calculatedItems.length; i++) {
      const cardTime = new Date(calculatedItems[i].deliverAt).getTime()
      if (cardTime <= nowTime) {
        cardBeforeNow = calculatedItems[i]
      } else if (cardTime > nowTime && !cardAfterNow) {
        cardAfterNow = calculatedItems[i]
        break
      }
    }

    // Position NOW between the two cards
    if (cardBeforeNow && cardAfterNow) {
      // NOW is between two cards - position in the middle
      calculatedNowX = (cardBeforeNow.x + cardAfterNow.x) / 2
    } else if (cardBeforeNow && !cardAfterNow) {
      // NOW is after all cards
      calculatedNowX = cardBeforeNow.x + minCardGap / 2
    } else if (!cardBeforeNow && cardAfterNow) {
      // NOW is before all cards
      calculatedNowX = cardAfterNow.x - minCardGap / 2
    } else {
      // No cards at all
      calculatedNowX = 400
    }

    const totalW = currentX + 500

    // Generate Year Markers - show all years that have scheduled deliveries
    const deliveryYears = sortedDeliveries.map((d) => new Date(d.deliverAt).getFullYear())
    const years = new Set(deliveryYears)
    const currentYear = now.getFullYear()

    // Also add current year if it falls within delivery range
    const minDeliveryYear = Math.min(...deliveryYears)
    const maxDeliveryYear = Math.max(...deliveryYears)
    if (currentYear >= minDeliveryYear && currentYear <= maxDeliveryYear) {
      years.add(currentYear)
    }

    // Show markers for ALL years with deliveries (including future years like 2026, 2030, etc.)
    const markers = Array.from(years)
      .sort()
      .map((year) => {
        const date = new Date(year, 0, 1)
        const days = differenceInDays(date, startDate)
        const x = 200 + days * pxPerDay
        return { year, x }
      })

    return {
      items: calculatedItems,
      totalWidth: totalW,
      yearMarkers: markers,
      nowX: calculatedNowX,
    }
  }, [deliveries])

  // Track scroll progress within the tall container
  // Only attach target ref after mount to prevent hydration errors
  const { scrollYProgress } = useScroll({
    target: isMounted ? containerRef : undefined,
    offset: ["start start", "end end"],
  })

  // Calculate how much horizontal scroll distance we need
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1200
  const scrollDistance = Math.max(0, totalWidth - viewportWidth)

  // Transform: as we scroll through the container vertically, move content horizontally
  const x = useTransform(scrollYProgress, [0, 1], [0, -scrollDistance])

  // The container height needs to be: visible height + scroll distance
  const stickyHeight = 600
  const containerHeight = stickyHeight + scrollDistance
  const timelineAreaHeight = stickyHeight - 73 // Minus header

  if (deliveries.length === 0) {
    return (
      <section className="w-full border-y-2 border-charcoal bg-duck-cream">
        <div className="container py-16 text-center">
          <h3 className="font-mono text-sm font-bold uppercase tracking-wide text-charcoal mb-4">
            Your Emotional Journey (V1)
          </h3>
          <p className="font-mono text-sm text-charcoal/60">
            Write your first letter to start building your timeline
          </p>
        </div>
      </section>
    )
  }

  return (
    <section
      ref={containerRef}
      className="relative w-full border-y-2 border-charcoal"
      style={{ height: containerHeight }}
    >
      {/* Sticky wrapper - stays fixed below navbar while we scroll through the container */}
      <div
        className="sticky top-[72px] w-full overflow-hidden"
        style={{ height: stickyHeight }}
      >
        {/* Header */}
        <div className="bg-duck-cream border-b-2 border-charcoal">
          <div className="container py-6">
            <div className="flex items-center justify-between">
              <h3 className="font-mono text-sm font-bold uppercase tracking-wide text-charcoal">
                Your Emotional Journey (V1 - Original)
              </h3>
              <div className="flex gap-6 text-xs font-mono text-charcoal/60">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-teal-primary border-2 border-teal-primary" />
                  <span>Delivered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-white border-2 border-charcoal" />
                  <span>Waiting</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Container */}
        <div
          className="relative w-full bg-duck-cream"
          style={{ height: timelineAreaHeight }}
        >
          <motion.div
            className="relative h-full"
            style={{ width: `${totalWidth}px`, x }}
          >
            {/* Central Path Line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-charcoal/30 -translate-y-1/2" />

            {/* Year Markers (Background) - Hidden near NOW for visual clarity */}
            {yearMarkers.map(({ year, x: markerX }) => {
              // Skip markers within 150px of NOW to keep that area clean
              const distanceFromNow = Math.abs(markerX - nowX)
              if (distanceFromNow < 150) return null

              return (
                <div
                  key={year}
                  className="absolute top-0 bottom-0 border-l border-dashed border-charcoal/10"
                  style={{ left: markerX }}
                >
                  <span className="absolute top-8 ml-4 font-mono text-8xl font-black text-charcoal/[0.04] pointer-events-none select-none">
                    {year}
                  </span>
                </div>
              )
            })}

            {/* NOW Indicator - Compact, only around the center line */}
            <motion.div
              className="absolute flex flex-col items-center z-30 pointer-events-none"
              style={{
                left: nowX,
                top: '50%',
                transform: 'translate(-50%, -50%)'
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {/* NOW Badge - Above the line */}
              <motion.div
                className="absolute -top-16 flex flex-col items-center"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-white bg-teal-primary px-4 py-1.5 border-2 border-teal-primary shadow-[3px_3px_0_theme(colors.charcoal)]"
                  style={{ borderRadius: "2px" }}
                >
                  Now
                </span>
                <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-teal-primary" />
              </motion.div>

              {/* Center dot with pulse */}
              <div className="relative">
                <motion.div
                  className="absolute inset-0 w-6 h-6 rounded-full bg-teal-primary/30 -translate-x-1/2 -translate-y-1/2"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ left: '50%', top: '50%' }}
                />
                <div className="w-5 h-5 rounded-full bg-teal-primary border-2 border-white shadow-md" />
              </div>

              {/* Date label - Below the line */}
              <div className="absolute top-12 flex flex-col items-center">
                <span className="font-mono text-[11px] font-bold text-teal-primary bg-duck-cream px-2 py-0.5 border border-teal-primary/30 rounded">
                  {format(new Date(), "MMM d, yyyy")}
                </span>
              </div>
            </motion.div>

            {/* Journey Path SVG - V1: Original style from JourneyPath component */}
            {/* Starts from left edge at center, uses cubic Bezier curves */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
              {items.length > 0 && (
                <path
                  d={(() => {
                    const centerY = timelineAreaHeight / 2
                    const dotOffset = 130

                    // Start from left edge at center line (original style: M 0,centerY)
                    let path = `M 0,${centerY}`

                    // Draw cubic Bezier curves to each dot (original JourneyPath logic)
                    for (let i = 0; i < items.length; i++) {
                      const currItem = items[i]
                      const currY = currItem.isTop ? centerY - dotOffset : centerY + dotOffset

                      // Get previous position
                      const prevX = i === 0 ? 0 : items[i - 1].x
                      const prevY = i === 0 ? centerY : (items[i - 1].isTop ? centerY - dotOffset : centerY + dotOffset)

                      // Control points at horizontal midpoint (same logic as original)
                      const cp1x = prevX + (currItem.x - prevX) / 2
                      const cp1y = prevY
                      const cp2x = prevX + (currItem.x - prevX) / 2
                      const cp2y = currY

                      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${currItem.x},${currY}`
                    }

                    return path
                  })()}
                  fill="none"
                  stroke="currentColor"
                  className="text-charcoal/20"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
              )}
            </svg>

            {/* Items */}
            {items.map((item, index) => {
              const isHovered = hoveredId === item.id
              const isSent = item.status === "sent"

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: item.isTop ? -30 : 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08, duration: 0.5 }}
                  className={cn(
                    "absolute flex flex-col items-center group",
                    item.isTop ? "bottom-[50%] mb-[50px]" : "top-[50%] mt-[50px]"
                  )}
                  style={{
                    left: item.x,
                    transform: "translateX(-50%)",
                    zIndex: isHovered ? 50 : 10,
                  }}
                  onMouseEnter={() => setHoveredId(item.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Connector Line (Dashed) */}
                  <div
                    className={cn(
                      "absolute w-px border-l-2 border-dashed transition-all duration-300",
                      item.isTop ? "-bottom-12 h-12" : "-top-12 h-12",
                      isSent ? "border-teal-primary/40" : "border-charcoal/30"
                    )}
                  />

                  {/* The Card */}
                  <div
                    className={cn(
                      "relative w-72 bg-white border-2 transition-all duration-300 cursor-pointer group-hover:-translate-y-1 group-hover:shadow-[6px_6px_0px_0px_rgba(29,29,29,1)] shadow-[4px_4px_0px_0px_rgba(29,29,29,1)]",
                      isSent ? "border-teal-primary" : "border-charcoal"
                    )}
                    style={{ borderRadius: "2px" }}
                  >
                    {/* Date Badge (Floating on border) */}
                    <div
                      className={cn(
                        "absolute -top-3 left-4 px-2 py-0.5 bg-white border-2 text-[10px] font-mono font-bold uppercase tracking-wider",
                        isSent
                          ? "border-teal-primary text-teal-primary"
                          : "border-charcoal text-charcoal"
                      )}
                      style={{ borderRadius: "2px" }}
                    >
                      {format(item.date, "MMM d, yyyy")}
                    </div>

                    {/* Status Icon (Top Right) */}
                    <div className="absolute top-3 right-3">
                      {isSent ? (
                        <Mail className="w-4 h-4 text-teal-primary" strokeWidth={2} />
                      ) : (
                        <Lock className="w-4 h-4 text-charcoal/40" strokeWidth={2} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5 pt-6">
                      <h4
                        className={cn(
                          "font-mono text-base font-bold leading-tight mb-2 line-clamp-2",
                          isSent ? "text-teal-primary" : "text-charcoal"
                        )}
                      >
                        {item.letter.title || "Untitled Letter"}
                      </h4>

                      <p className="font-mono text-xs text-charcoal/50 line-clamp-2 mb-4 leading-relaxed">
                        {isSent
                          ? "This memory has been unlocked and delivered."
                          : "Safely sealed in a time capsule, waiting for the right moment."}
                      </p>

                      {/* Dashed Separator */}
                      <div className="w-full border-t-2 border-dashed border-charcoal/10 mb-3" />

                      {/* Footer */}
                      <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider">
                        <span
                          className={isSent ? "text-teal-primary" : "text-charcoal"}
                        >
                          {isSent ? "Delivered" : "Scheduled"}
                        </span>
                        <ArrowRight
                          className={cn(
                            "w-3 h-3 transition-transform group-hover:translate-x-1",
                            isSent ? "text-teal-primary" : "text-charcoal"
                          )}
                          strokeWidth={2}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dot on the timeline */}
                  <div
                    className={cn(
                      "absolute w-5 h-5 rounded-full border-2 bg-duck-cream z-20 flex items-center justify-center transition-transform group-hover:scale-125",
                      item.isTop ? "-bottom-[58px]" : "-top-[58px]",
                      isSent ? "border-teal-primary" : "border-charcoal"
                    )}
                  >
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        isSent ? "bg-teal-primary" : "bg-charcoal"
                      )}
                    />
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
