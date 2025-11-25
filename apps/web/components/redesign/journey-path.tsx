"use client"

import { useMemo, useRef, useState } from "react"
import { format, differenceInDays, startOfYear, isPast, isFuture } from "date-fns"
import { motion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, Mail, Send, Clock, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DeliveryTimelineItem } from "@/server/actions/redesign-dashboard"

interface JourneyPathProps {
    deliveries: DeliveryTimelineItem[]
}

export function JourneyPath({ deliveries }: JourneyPathProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [hoveredId, setHoveredId] = useState<string | null>(null)

    // Drag to scroll logic could be added here, but native scroll is fine for now

    // Calculate layout with "Elastic Time"
    // This ensures items are spaced out enough to be readable, but respects relative time gaps
    const { items, totalWidth, yearMarkers, nowX } = useMemo(() => {
        if (deliveries.length === 0) return { items: [], totalWidth: 0, yearMarkers: [], nowX: 0 }

        const now = new Date()

        // Create a combined list of items to position, including the "NOW" marker
        // This ensures "NOW" respects the elastic spacing logic
        const combined = [
            ...deliveries.map(d => ({ ...d, type: 'delivery' })),
            { id: 'NOW_MARKER', deliverAt: now, type: 'marker' } as any
        ].sort((a, b) => new Date(a.deliverAt).getTime() - new Date(b.deliverAt).getTime())

        // Ensure timeline starts early enough to include NOW
        const firstDate = new Date(combined[0].deliverAt)
        const startDate = startOfYear(firstDate)

        const pxPerDay = 2 // Base scale

        let currentX = 100 // Start with some padding
        let calculatedNowX = 0
        const calculatedItems: any[] = []

        // Track last item positions for alternating layout
        let lastItemX = 100

        combined.forEach((item, index) => {
            const date = new Date(item.deliverAt)
            const daysFromStart = differenceInDays(date, startDate)

            // Ideal position based on pure time
            const idealX = 100 + (daysFromStart * pxPerDay)

            if (item.type === 'marker') {
                // Position NOW marker
                // It should be at least some distance from the last item
                const gap = 100 // Gap before NOW
                const x = Math.max(idealX, currentX + gap)
                calculatedNowX = x
                currentX = x // Update currentX so next item is pushed
                return
            }

            // Regular Delivery Item
            // Determine Top/Bottom (alternating among deliveries only)
            // We use calculatedItems.length to determine index, ignoring the marker
            const deliveryIndex = calculatedItems.length
            const isTop = deliveryIndex % 2 === 0

            // Elastic position logic
            // We need to be far enough from the previous element (whether it was an item or NOW marker)
            // If previous was NOW marker, we want a good gap.
            // If previous was item, we use the "zipper" gap logic.

            const prevWasMarker = index > 0 && combined[index - 1].type === 'marker'
            const minGap = prevWasMarker ? 100 : 140

            const x = Math.max(idealX, currentX + minGap)

            currentX = x

            calculatedItems.push({
                ...item,
                x,
                isTop,
                date,
            })
        })

        const totalW = currentX + 400 // Add end padding

        // Generate Year Markers based on the scale
        // We use the original sorted deliveries for year range to avoid clutter? 
        // Or just use the combined range.
        const years = new Set(combined.map(d => new Date(d.deliverAt).getFullYear()))
        const markers = Array.from(years).map(year => {
            const date = new Date(year, 0, 1)
            const days = differenceInDays(date, startDate)
            const x = 100 + (days * pxPerDay)
            return { year, x }
        })

        return { items: calculatedItems, totalWidth: totalW, yearMarkers: markers, nowX: calculatedNowX }
    }, [deliveries])

    if (deliveries.length === 0) return null

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center justify-between px-1">
                <h3 className="font-mono text-sm uppercase tracking-wide text-charcoal">
                    Your Emotional Journey
                </h3>
                <div className="flex gap-4 text-xs font-mono text-gray-secondary">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-teal-primary" />
                        <span>Sent</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-charcoal" />
                        <span>Waiting</span>
                    </div>
                </div>
            </div>

            <div
                ref={containerRef}
                className="relative h-[420px] w-full overflow-x-auto overflow-y-hidden bg-bg-yellow-cream border-2 border-charcoal rounded-sm"
                style={{ scrollbarWidth: 'thin' }}
            >
                <div
                    className="relative h-full"
                    style={{ width: `${totalWidth}px` }}
                >
                    {/* Central Path Line */}
                    <div className="absolute top-1/2 left-0 w-full h-px bg-charcoal -translate-y-1/2" />

                    {/* Year Markers (Background) */}
                    {yearMarkers.map(({ year, x }) => (
                        <div
                            key={year}
                            className="absolute top-8 bottom-8 border-l border-dashed border-charcoal/10"
                            style={{ left: x }}
                        >
                            <span className="ml-2 font-mono text-8xl font-bold text-charcoal/5 pointer-events-none select-none">
                                {year}
                            </span>
                        </div>
                    ))}

                    {/* NOW Indicator */}
                    <div
                        className="absolute top-12 bottom-12 flex flex-col items-center z-20 pointer-events-none"
                        style={{ left: nowX }}
                    >
                        <div className="absolute -top-3 flex flex-col items-center">
                            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-teal-primary bg-bg-yellow-cream px-3 py-1 border border-teal-primary rounded-full shadow-sm">
                                Now
                            </span>
                        </div>
                        <div className="h-full w-px border-l-2 border-dashed border-teal-primary/60" />
                        <div className="absolute -bottom-8 flex flex-col items-center">
                            <span className="font-mono text-[10px] font-bold text-teal-primary bg-bg-yellow-cream px-1">
                                {format(new Date(), "MMM d")}
                            </span>
                        </div>
                    </div>

                    {/* Journey Path SVG - A smooth curve connecting the cards */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                        <path
                            d={`M 0,210 ${items.map((item, i) => {
                                const y = item.isTop ? 100 : 320
                                // Bezier curve to the point
                                // Control points for smooth wave
                                const prevX = i === 0 ? 0 : items[i - 1]!.x
                                const prevY = i === 0 ? 210 : (items[i - 1]!.isTop ? 100 : 320)
                                const cp1x = prevX + (item.x - prevX) / 2
                                const cp1y = prevY
                                const cp2x = prevX + (item.x - prevX) / 2
                                const cp2y = y
                                return `C ${cp1x},${cp1y} ${cp2x},${cp2y} ${item.x},${y}`
                            }).join(' ')}`}
                            fill="none"
                            stroke="currentColor"
                            className="text-charcoal/20"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                        />
                    </svg>

                    {/* Items */}
                    {items.map((item, index) => {
                        const isHovered = hoveredId === item.id
                        const isSent = item.status === 'sent'

                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: item.isTop ? -20 : 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05, duration: 0.5 }}
                                className={cn(
                                    "absolute flex flex-col items-center group",
                                    item.isTop ? "bottom-[50%] mb-[18px]" : "top-[50%] mt-[18px]"
                                )}
                                style={{
                                    left: item.x,
                                    transform: 'translateX(-50%)',
                                    zIndex: isHovered ? 50 : 10
                                }}
                                onMouseEnter={() => setHoveredId(item.id)}
                                onMouseLeave={() => setHoveredId(null)}
                            >
                                {/* Connector Line (Dashed) */}
                                <div
                                    className={cn(
                                        "absolute w-px border-l border-dashed border-charcoal transition-all duration-300",
                                        item.isTop ? "-bottom-6 h-6" : "-top-6 h-6",
                                    )}
                                />

                                {/* The Card */}
                                <div
                                    className={cn(
                                        "relative w-72 bg-white border-2 transition-all duration-300 cursor-pointer group-hover:-translate-y-1 group-hover:shadow-[6px_6px_0px_0px_rgba(29,29,29,1)] shadow-[4px_4px_0px_0px_rgba(29,29,29,1)]",
                                        isSent ? "border-teal-primary" : "border-charcoal"
                                    )}
                                    style={{ borderRadius: '2px' }}
                                >
                                    {/* Date Badge (Floating on border) */}
                                    <div className={cn(
                                        "absolute -top-3 left-4 px-2 py-0.5 bg-white border text-[10px] font-mono font-bold uppercase tracking-wider",
                                        isSent ? "border-teal-primary text-teal-primary" : "border-charcoal text-charcoal"
                                    )}>
                                        {format(item.date, "MMM d, yyyy")}
                                    </div>

                                    {/* Status Icon (Top Right) */}
                                    <div className="absolute top-3 right-3">
                                        {isSent ? (
                                            <Mail className="w-4 h-4 text-teal-primary" />
                                        ) : (
                                            <Lock className="w-4 h-4 text-gray-400" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 pt-6">
                                        <h4 className={cn(
                                            "font-mono text-base font-bold leading-tight mb-2 line-clamp-2",
                                            isSent ? "text-teal-primary" : "text-charcoal"
                                        )}>
                                            {item.letter.title || "Untitled Letter"}
                                        </h4>

                                        <p className="font-mono text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                                            {isSent
                                                ? "This memory has been unlocked and delivered."
                                                : "Safely sealed in a time capsule, waiting for the right moment."}
                                        </p>

                                        {/* Dashed Separator */}
                                        <div className="w-full border-t border-dashed border-gray-300 mb-3" />

                                        {/* Footer */}
                                        <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider">
                                            <span className={isSent ? "text-teal-primary" : "text-charcoal"}>
                                                {isSent ? "Delivered" : "Scheduled"}
                                            </span>
                                            <ArrowRight className={cn(
                                                "w-3 h-3 transition-transform group-hover:translate-x-1",
                                                isSent ? "text-teal-primary" : "text-charcoal"
                                            )} />
                                        </div>
                                    </div>
                                </div>

                                {/* Dot on the timeline */}
                                <div
                                    className={cn(
                                        "absolute w-4 h-4 rounded-full border-2 border-charcoal bg-bg-yellow-cream z-20 flex items-center justify-center",
                                        item.isTop ? "-bottom-[26px]" : "-top-[26px]",
                                        isSent ? "border-teal-primary" : "border-charcoal"
                                    )}
                                >
                                    <div className={cn(
                                        "w-1.5 h-1.5 rounded-full",
                                        isSent ? "bg-teal-primary" : "bg-charcoal"
                                    )} />
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
