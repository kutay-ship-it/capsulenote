"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { format, differenceInDays, startOfYear } from "date-fns"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, Mail, Lock, Clock, Calendar } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import type { DeliveryTimelineItem } from "@/server/actions/redesign-dashboard"

interface EmotionalJourneyV2Props {
  deliveries: DeliveryTimelineItem[]
}

/**
 * Hook to detect mobile viewport
 * Returns true for screens < 640px (sm breakpoint)
 */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return isMobile
}

/**
 * Mobile Journey Card - Simplified card for vertical mobile layout
 */
function MobileJourneyCard({
  item,
  t,
}: {
  item: DeliveryTimelineItem & { date: Date }
  t: ReturnType<typeof useTranslations>
}) {
  const isSent = item.status === "sent"
  const daysUntilDelivery = differenceInDays(item.date, new Date())
  const isImminent = !isSent && daysUntilDelivery > 0 && daysUntilDelivery <= 7

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      {/* Card */}
      <div
        className={cn(
          "relative bg-white border-2 p-4 shadow-[3px_3px_0_theme(colors.charcoal)] sm:shadow-[4px_4px_0_theme(colors.charcoal)]",
          isSent ? "border-teal-primary" : "border-charcoal"
        )}
        style={{ borderRadius: "2px" }}
      >
        {/* Top Row: Date + Status Badge */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-charcoal/50" strokeWidth={2} />
            <span
              className={cn(
                "font-mono text-xs font-bold uppercase tracking-wide",
                isSent ? "text-teal-primary" : "text-charcoal"
              )}
            >
              {format(item.date, "MMM d, yyyy")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isImminent && (
              <span className="px-2 py-0.5 bg-teal-primary text-white font-mono text-[9px] font-bold uppercase tracking-wider rounded-[2px]">
                {daysUntilDelivery === 1 ? t("tomorrow") : t("daysShort", { days: daysUntilDelivery })}
              </span>
            )}
            {isSent ? (
              <Mail className="w-4 h-4 text-teal-primary" strokeWidth={2} />
            ) : (
              <Lock className="w-4 h-4 text-charcoal/40" strokeWidth={2} />
            )}
          </div>
        </div>

        {/* Title */}
        <h4
          className={cn(
            "font-mono text-sm font-bold leading-tight mb-2 line-clamp-2",
            isSent ? "text-teal-primary" : "text-charcoal"
          )}
        >
          {item.letter.title || t("untitledLetter")}
        </h4>

        {/* Description */}
        <p className="font-mono text-xs text-charcoal/50 line-clamp-1 mb-3 leading-relaxed">
          {isSent ? t("card.deliveredDescription") : t("card.scheduledDescription")}
        </p>

        {/* Dashed Separator */}
        <div className="w-full border-t-2 border-dashed border-charcoal/10 mb-2" />

        {/* Footer */}
        <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider">
          <span className={isSent ? "text-teal-primary" : "text-charcoal"}>
            {isSent ? t("card.statusDelivered") : t("card.statusScheduled")}
          </span>
          <ArrowRight
            className={cn("w-3 h-3", isSent ? "text-teal-primary" : "text-charcoal")}
            strokeWidth={2}
          />
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Mobile Journey List - Vertical stacked layout for mobile devices
 */
function MobileJourneyList({
  deliveries,
  t,
}: {
  deliveries: DeliveryTimelineItem[]
  t: ReturnType<typeof useTranslations>
}) {
  const now = new Date()

  // Sort and filter deliveries
  const sortedDeliveries = useMemo(() => {
    return [...deliveries]
      .filter((d) => d.status !== "failed")
      .sort((a, b) => new Date(a.deliverAt).getTime() - new Date(b.deliverAt).getTime())
      .map((d) => ({ ...d, date: new Date(d.deliverAt) }))
  }, [deliveries])

  // Split into past and future
  const pastDeliveries = sortedDeliveries.filter((d) => d.date.getTime() <= now.getTime())
  const futureDeliveries = sortedDeliveries.filter((d) => d.date.getTime() > now.getTime())

  if (sortedDeliveries.length === 0) {
    return (
      <section className="w-full border-y-2 border-charcoal bg-duck-cream">
        <div className="container py-12 text-center">
          <h3 className="font-mono text-sm font-bold uppercase tracking-wide text-charcoal mb-3">
            {t("emptyTitle")}
          </h3>
          <p className="font-mono text-xs text-charcoal/60">{t("emptySubtitle")}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full border-y-2 border-charcoal bg-duck-cream">
      {/* Header */}
      <div className="border-b-2 border-charcoal px-4 py-4">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-xs font-bold uppercase tracking-wide text-charcoal">
            {t("sectionTitle")}
          </h3>
          <div className="flex gap-3 text-[10px] font-mono text-charcoal/60">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-teal-primary border border-teal-primary" />
              <span>{t("legend.delivered")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-white border border-charcoal" />
              <span>{t("legend.waiting")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-6">
        {/* Past Deliveries Section */}
        {pastDeliveries.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-teal-primary" strokeWidth={2} />
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-teal-primary">
                {t("legend.delivered")} ({pastDeliveries.length})
              </span>
            </div>
            <div className="space-y-3">
              {pastDeliveries.map((item) => (
                <MobileJourneyCard key={item.id} item={item} t={t} />
              ))}
            </div>
          </div>
        )}

        {/* NOW Indicator */}
        <div className="relative py-2">
          <div className="absolute inset-x-0 top-1/2 h-px bg-charcoal/10" />
          <div className="relative flex justify-center">
            <div className="bg-duck-cream px-3">
              <div className="relative">
                <div className="absolute top-0.5 left-0.5 w-full h-full bg-charcoal rounded-[2px]" />
                <div className="relative bg-teal-primary px-3 py-1.5 border-2 border-teal-primary rounded-[2px]">
                  <span className="font-mono text-[10px] font-bold uppercase text-white tracking-[0.15em]">
                    {t("now")} • {format(now, "MMM d")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Future Deliveries Section */}
        {futureDeliveries.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-charcoal/60" strokeWidth={2} />
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/60">
                {t("legend.waiting")} ({futureDeliveries.length})
              </span>
            </div>
            <div className="space-y-3">
              {futureDeliveries.map((item) => (
                <MobileJourneyCard key={item.id} item={item} t={t} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

// V2: Smooth S-curves with gradient stroke
// Mobile: Vertical stacked card list
// Desktop: Horizontal scroll timeline
export function EmotionalJourneyV2({ deliveries }: EmotionalJourneyV2Props) {
  const t = useTranslations("app.journey.timeline")
  const isMobile = useIsMobile()
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [isMounted, setIsMounted] = useState(false)

  // Ensure component is mounted before using scroll animations
  // This prevents the "Target ref is defined but not hydrated" error
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Calculate layout with "Elastic Time"
  const { items, totalWidth, yearMarkers, nowX } = useMemo(() => {
    if (deliveries.length === 0)
      return { items: [], totalWidth: 0, yearMarkers: [], nowX: 0 }

    const now = new Date()

    // Filter out failed deliveries and sort by date
    const sortedDeliveries = [...deliveries]
      .filter(d => d.status !== "failed")
      .sort((a, b) => new Date(a.deliverAt).getTime() - new Date(b.deliverAt).getTime())

    // If all deliveries were failed, show empty state
    if (sortedDeliveries.length === 0)
      return { items: [], totalWidth: 0, yearMarkers: [], nowX: 0 }

    const firstDate = new Date(sortedDeliveries[0]!.deliverAt)
    const startDate = startOfYear(firstDate)

    const pxPerDay = 3
    const cardWidth = 288 // w-72 = 18rem = 288px
    const minCardGap = 380 // Generous spacing between cards
    const nowGap = 350 // Balanced spacing around the NOW indicator

    let currentX = 200 // Initial padding
    const calculatedItems: any[] = []
    const nowTime = now.getTime()

    // Split deliveries into past and future
    const pastDeliveries = sortedDeliveries.filter(d => new Date(d.deliverAt).getTime() <= nowTime)
    const futureDeliveries = sortedDeliveries.filter(d => new Date(d.deliverAt).getTime() > nowTime)

    // 1. Position Past Items
    pastDeliveries.forEach((item, index) => {
      const date = new Date(item.deliverAt)
      const daysFromStart = differenceInDays(date, startDate)
      const idealX = 200 + daysFromStart * pxPerDay

      const isTop = index % 2 === 0

      // Standard gap logic for past items
      const x = Math.max(idealX, currentX + minCardGap)
      currentX = x

      calculatedItems.push({
        ...item,
        x,
        isTop,
        date,
      })
    })

    const lastPastItem = calculatedItems.length > 0 ? calculatedItems[calculatedItems.length - 1] : null
    const lastPastX = lastPastItem ? lastPastItem.x : 200

    // 2. Position Future Items
    // Create a large gap between past and future to fit NOW in the center
    const gapForNow = 800

    futureDeliveries.forEach((item, index) => {
      const date = new Date(item.deliverAt)
      const daysFromStart = differenceInDays(date, startDate)
      const idealX = 200 + daysFromStart * pxPerDay

      // Determine previous X and required gap
      let prevX
      let requiredGap

      if (index === 0) {
        // First future item: gap from last past item (or start)
        prevX = lastPastX
        requiredGap = gapForNow
      } else {
        // Subsequent future items: standard gap from previous future item
        prevX = calculatedItems[calculatedItems.length - 1].x
        requiredGap = minCardGap
      }

      // Continue the zigzag pattern based on total count
      const isTop = calculatedItems.length % 2 === 0

      const x = Math.max(idealX, prevX + requiredGap)
      // Update currentX for total width calculation later
      currentX = x

      calculatedItems.push({
        ...item,
        x,
        isTop,
        date,
      })
    })

    // 3. Calculate NOW position (Exact Center)
    let calculatedNowX = 0
    const firstFutureItem = calculatedItems.find(item => new Date(item.deliverAt).getTime() > nowTime)

    if (lastPastItem && firstFutureItem) {
      // Center between last past and first future
      calculatedNowX = (lastPastItem.x + firstFutureItem.x) / 2
    } else if (lastPastItem) {
      // Only past items: place after last item
      calculatedNowX = lastPastItem.x + gapForNow / 2
    } else if (firstFutureItem) {
      // Only future items: place before first item
      calculatedNowX = firstFutureItem.x - gapForNow / 2
    } else {
      // No items
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

    // Helper function to get elastic X position for any date
    // This interpolates between anchor points (cards + NOW) to account for elastic stretching
    const getElasticX = (targetDate: Date): number => {
      const targetTime = targetDate.getTime()

      // Build anchor points: all cards + NOW position, sorted by time
      const anchors = [
        ...calculatedItems.map(item => ({
          time: item.date.getTime(),
          x: item.x
        })),
        { time: now.getTime(), x: calculatedNowX }
      ].sort((a, b) => a.time - b.time)

      if (anchors.length === 0) {
        // Fallback to linear positioning
        return 200 + differenceInDays(targetDate, startDate) * pxPerDay
      }

      // Before first anchor - extrapolate backward using linear time
      const firstAnchor = anchors[0]!
      if (targetTime <= firstAnchor.time) {
        const daysBefore = differenceInDays(new Date(firstAnchor.time), targetDate)
        return Math.max(50, firstAnchor.x - daysBefore * pxPerDay)
      }

      // After last anchor - extrapolate forward using linear time
      const lastAnchor = anchors[anchors.length - 1]!
      if (targetTime >= lastAnchor.time) {
        const daysAfter = differenceInDays(targetDate, new Date(lastAnchor.time))
        return lastAnchor.x + daysAfter * pxPerDay
      }

      // Between anchors - interpolate based on time proportion
      for (let i = 0; i < anchors.length - 1; i++) {
        const lower = anchors[i]!
        const upper = anchors[i + 1]!
        if (lower.time <= targetTime && upper.time >= targetTime) {
          const fraction = (targetTime - lower.time) / (upper.time - lower.time)
          return lower.x + fraction * (upper.x - lower.x)
        }
      }

      // Fallback (shouldn't reach here)
      return 200 + differenceInDays(targetDate, startDate) * pxPerDay
    }

    // Generate year markers with elastic positioning (aligned with stretched timeline)
    const markers = Array.from(years)
      .sort()
      .map((year) => ({
        year,
        x: getElasticX(new Date(year, 0, 1))
      }))

    return {
      items: calculatedItems,
      totalWidth: totalW,
      yearMarkers: markers,
      nowX: calculatedNowX,
    }
  }, [deliveries])

  // Track scroll progress within the tall container
  // Only attach target ref after mount AND when deliveries exist (otherwise early return means ref is never attached)
  const { scrollYProgress } = useScroll({
    target: isMounted && deliveries.length > 0 ? containerRef : undefined,
    offset: ["start start", "end end"],
  })

  // Calculate how much horizontal scroll distance we need
  // Use state for viewport width to handle SSR properly
  const [viewportWidth, setViewportWidth] = useState(1200)

  useEffect(() => {
    const updateWidth = () => setViewportWidth(window.innerWidth)
    updateWidth()
    window.addEventListener("resize", updateWidth)
    return () => window.removeEventListener("resize", updateWidth)
  }, [])

  const scrollDistance = Math.max(0, totalWidth - viewportWidth)

  // Transform: as we scroll through the container vertically, move content horizontally
  const x = useTransform(scrollYProgress, [0, 1], [0, -scrollDistance])

  // Parallax transform for decorative background shapes
  const xVerySlow = useTransform(scrollYProgress, [0, 1], [0, -scrollDistance * 0.3])

  // The container height needs to be: visible height + scroll distance
  const stickyHeight = 600
  const containerHeight = stickyHeight + scrollDistance
  const timelineAreaHeight = stickyHeight - 73 // Minus header

  if (deliveries.length === 0) {
    return (
      <section className="w-full border-y-2 border-charcoal bg-duck-cream">
        <div className="container py-16 text-center">
          <h3 className="font-mono text-sm font-bold uppercase tracking-wide text-charcoal mb-4">
            {t("emptyTitle")}
          </h3>
          <p className="font-mono text-sm text-charcoal/60">
            {t("emptySubtitle")}
          </p>
        </div>
      </section>
    )
  }

  // Mobile: Show vertical stacked card list for better UX on small screens
  if (isMobile) {
    return <MobileJourneyList deliveries={deliveries} t={t} />
  }

  // Desktop: Show horizontal scroll timeline with parallax effects
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
                {t("sectionTitle")}
              </h3>
              <div className="flex gap-6 text-xs font-mono text-charcoal/60">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-teal-primary border-2 border-teal-primary" />
                  <span>{t("legend.delivered")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-white border-2 border-charcoal" />
                  <span>{t("legend.waiting")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Container */}
        <div
          className="relative w-full bg-duck-cream overflow-hidden"
          style={{ height: timelineAreaHeight }}
        >
          {/* LAYER 1: Deepest parallax - Decorative shapes (0.3x speed) */}
          <motion.div
            className="absolute inset-0 pointer-events-none z-0"
            style={{ width: `${totalWidth * 1.5}px`, x: xVerySlow }}
          >
            <div
              className="absolute w-[500px] h-[500px] rounded-full bg-teal-primary/[0.08] blur-3xl"
              style={{ top: '0%', left: '5%' }}
            />
            <div
              className="absolute w-[400px] h-[400px] rounded-full bg-charcoal/[0.05] blur-2xl"
              style={{ top: '40%', left: '35%' }}
            />
            <div
              className="absolute w-[550px] h-[550px] rounded-full bg-teal-primary/[0.07] blur-3xl"
              style={{ top: '10%', left: '60%' }}
            />
            <div
              className="absolute w-[450px] h-[450px] rounded-full bg-charcoal/[0.04] blur-3xl"
              style={{ top: '30%', left: '80%' }}
            />
          </motion.div>

          {/* LAYER 2: Foreground - Main content (1x speed) */}
          <motion.div
            className="relative h-full z-[2]"
            style={{ width: `${totalWidth}px`, x }}
          >
            {/* Year Markers (Background) - Hidden near NOW for visual clarity */}
            {yearMarkers.map(({ year, x: markerX }) => {
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

            {/* Central Path Line - V2: Split into two lines for depth effect */}
            <div className="absolute top-1/2 left-0 w-full h-[3px] bg-charcoal/10 -translate-y-1/2" />
            <div className="absolute top-1/2 left-0 w-full h-px bg-charcoal/20 -translate-y-1/2" />

            {/* NOW Indicator - V2: Unified "Living Presence" Animation System */}
            <motion.div
              className="absolute top-0 bottom-0 z-30 pointer-events-none flex flex-col items-center justify-center"
              style={{ left: nowX, transform: 'translateX(-50%)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {/* Vertical Guide Line */}
              <div className="absolute inset-y-0 w-px bg-gradient-to-b from-transparent via-teal-primary/40 to-transparent" />

              {/* NOW Badge Area - Gentle float synced to 4s cycle */}
              <motion.div
                className="absolute flex flex-col items-center"
                style={{ top: 'calc(50% - 85px)' }}
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="relative">
                  {/* Hard Shadow (Black Layer) */}
                  <div className="absolute top-1 left-1 w-full h-full bg-charcoal rounded-[2px]" />

                  {/* Main Badge (Green Layer) */}
                  <div className="relative bg-teal-primary px-5 py-2 border-2 border-teal-primary rounded-[2px] flex items-center justify-center">
                    <span className="font-mono text-xs font-bold uppercase text-white tracking-[0.2em] translate-x-[1px]">
                      {t("now")}
                    </span>
                  </div>
                </div>

                {/* Triangle Pointer */}
                <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent border-t-teal-primary mt-[-2px] relative z-10" />
              </motion.div>

              {/* Center Dot Area - All animations on unified 4s cycle */}
              <div className="relative w-24 h-24 flex items-center justify-center">
                {/* Single Elegant Ripple - expands outward */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-teal-primary/40"
                  animate={{ scale: [0.3, 1.3], opacity: [0.6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeOut" }}
                />

                {/* Ambient Glow - synced breathing effect */}
                <motion.div
                  className="absolute inset-4 rounded-full bg-teal-primary/20 blur-sm"
                  animate={{ scale: [1, 1.4, 1], opacity: [0.15, 0.35, 0.15] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Dots Layering */}
                <div className="relative w-6 h-6 z-10">
                  {/* Black Shadow Dot (Behind) */}
                  <div className="absolute top-1 -left-1 w-full h-full bg-charcoal rounded-full" />

                  {/* Green Main Dot - "Ba-bump" Heartbeat Rhythm */}
                  <motion.div
                    className="absolute inset-0 bg-teal-primary rounded-full border-2 border-white shadow-sm"
                    animate={{ scale: [1, 1.15, 1.05, 1.12, 1] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      times: [0, 0.12, 0.24, 0.36, 1],
                      ease: "easeInOut"
                    }}
                  />
                </div>
              </div>

              {/* Date Label Area */}
              <div className="absolute top-1/2 translate-y-[45px] flex flex-col items-center">
                {/* Upward Triangle */}
                <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-teal-primary/30 mb-[-1px]" />

                {/* Date Box */}
                <div className="relative bg-duck-cream border border-teal-primary/30 px-3 py-1 rounded-sm shadow-sm">
                  <span className="font-mono text-[11px] font-bold text-teal-primary whitespace-nowrap">
                    {format(new Date(), "MMM d, yyyy")}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Journey Path SVG - V2: Smooth S-curves with gradient + marching ants */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
              {/* Animations: marching ants + glow pulse + wiggle */}
              <style>
                {`
                  @keyframes march {
                    to { stroke-dashoffset: -12; }
                  }
                  @keyframes glow {
                    0%, 100% { box-shadow: 4px 4px 0px 0px rgba(29,29,29,1), 0 0 15px rgba(45,212,191,0.25); }
                    50% { box-shadow: 4px 4px 0px 0px rgba(29,29,29,1), 0 0 25px rgba(45,212,191,0.5); }
                  }
                  @keyframes wiggle {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(-8deg); }
                    75% { transform: rotate(8deg); }
                  }
                `}
              </style>
              {/* Gradient definition for fading edges */}
              <defs>
                <linearGradient id="journeyPathGradientV2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="0.05" />
                  <stop offset="10%" stopColor="currentColor" stopOpacity="0.18" />
                  <stop offset="50%" stopColor="currentColor" stopOpacity="0.2" />
                  <stop offset="90%" stopColor="currentColor" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              {items.length > 0 && (
                <path
                  d={(() => {
                    const centerY = timelineAreaHeight / 2
                    const dotOffset = 132 // Adjusted for larger w-6 h-6 dots

                    // Start from left edge at center line (same as V1)
                    let path = `M 0,${centerY}`

                    // Draw cubic Bezier curves for smooth S-curve transitions
                    for (let i = 0; i < items.length; i++) {
                      const currItem = items[i]
                      const currY = currItem.isTop ? centerY - dotOffset : centerY + dotOffset

                      // Get previous position
                      const prevX = i === 0 ? 0 : items[i - 1].x
                      const prevY = i === 0 ? centerY : (items[i - 1].isTop ? centerY - dotOffset : centerY + dotOffset)

                      // Control points at horizontal midpoint
                      // cp1 at prevY ensures horizontal exit, cp2 at currY ensures horizontal entry
                      const cp1x = prevX + (currItem.x - prevX) / 2
                      const cp1y = prevY
                      const cp2x = prevX + (currItem.x - prevX) / 2
                      const cp2y = currY

                      path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${currItem.x},${currY}`
                    }

                    return path
                  })()}
                  fill="none"
                  stroke="url(#journeyPathGradientV2)"
                  className="text-charcoal"
                  strokeWidth="2"
                  strokeDasharray="6 6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ animation: 'march 0.8s linear infinite' }}
                />
              )}
            </svg>

            {/* Items */}
            {items.map((item, index) => {
              const isHovered = hoveredId === item.id
              const isSent = item.status === "sent"
              const daysUntilDelivery = differenceInDays(item.date, new Date())
              const isImminent = !isSent && daysUntilDelivery > 0 && daysUntilDelivery <= 7

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
                  {/* Connector Line - V2: Gradient-based with mask for dashed effect */}
                  <div
                    className={cn(
                      "absolute w-[2px] transition-all duration-300",
                      item.isTop ? "-bottom-12 h-12" : "-top-12 h-12"
                    )}
                    style={{
                      background: item.isTop
                        ? `linear-gradient(to bottom, ${isSent ? 'rgba(45,212,191,0.5)' : 'rgba(29,29,29,0.4)'}, ${isSent ? 'rgba(45,212,191,0.2)' : 'rgba(29,29,29,0.15)'})`
                        : `linear-gradient(to top, ${isSent ? 'rgba(45,212,191,0.5)' : 'rgba(29,29,29,0.4)'}, ${isSent ? 'rgba(45,212,191,0.2)' : 'rgba(29,29,29,0.15)'})`,
                      maskImage: 'repeating-linear-gradient(to bottom, transparent, transparent 2px, black 2px, black 6px)',
                      WebkitMaskImage: 'repeating-linear-gradient(to bottom, transparent, transparent 2px, black 2px, black 6px)',
                    }}
                  />

                  {/* The Card */}
                  <div
                    className={cn(
                      "relative w-72 bg-white border-2 transition-all duration-300 cursor-pointer group-hover:-translate-y-1 group-hover:shadow-[6px_6px_0px_0px_rgba(29,29,29,1)] shadow-[4px_4px_0px_0px_rgba(29,29,29,1)]",
                      isSent ? "border-teal-primary" : "border-charcoal",
                      isImminent && "animate-[glow_2s_ease-in-out_infinite]"
                    )}
                    style={{
                      borderRadius: "2px",
                      ...(isImminent && {
                        boxShadow: '4px 4px 0px 0px rgba(29,29,29,1), 0 0 20px rgba(45,212,191,0.3)',
                      }),
                    }}
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

                    {/* Opening Soon Badge (for imminent deliveries) */}
                    {isImminent && (
                      <div className="absolute -top-3 right-4 px-2 py-0.5 bg-teal-primary border-2 border-teal-primary text-[9px] font-mono font-bold uppercase tracking-wider text-white rounded-[2px] shadow-sm">
                        {daysUntilDelivery === 1 ? t("tomorrow") : t("daysShort", { days: daysUntilDelivery })}
                      </div>
                    )}

                    {/* Status Icon (Top Right) */}
                    <div className="absolute top-3 right-3">
                      {isSent ? (
                        <Mail className="w-4 h-4 text-teal-primary transition-transform duration-300 group-hover:rotate-12" strokeWidth={2} />
                      ) : (
                        <Lock className="w-4 h-4 text-charcoal/40 transition-transform duration-300 origin-center group-hover:animate-[wiggle_0.3s_ease-in-out]" strokeWidth={2} />
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
                        {item.letter.title || t("untitledLetter")}
                      </h4>

                      <p className="font-mono text-xs text-charcoal/50 line-clamp-2 mb-4 leading-relaxed">
                        {isSent
                          ? t("card.deliveredDescription")
                          : t("card.scheduledDescription")}
                      </p>

                      {/* Dashed Separator */}
                      <div className="w-full border-t-2 border-dashed border-charcoal/10 mb-3" />

                      {/* Footer */}
                      <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider">
                        <span
                          className={isSent ? "text-teal-primary" : "text-charcoal"}
                        >
                          {isSent ? t("card.statusDelivered") : t("card.statusScheduled")}
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

                  {/* Dot on the timeline - V2: Larger with better hover effects */}
                  <div
                    className={cn(
                      "absolute w-6 h-6 rounded-full border-2 bg-duck-cream z-20 flex items-center justify-center",
                      "transition-all duration-300 ease-out",
                      "group-hover:scale-125 group-hover:shadow-[0_0_12px_rgba(0,0,0,0.15)]",
                      item.isTop ? "-bottom-[60px]" : "-top-[60px]",
                      isSent
                        ? "border-teal-primary group-hover:shadow-[0_0_12px_rgba(45,212,191,0.4)]"
                        : "border-charcoal"
                    )}
                  >
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full transition-all duration-300 ease-out",
                        "group-hover:w-3 group-hover:h-3",
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
