"use client"

import { useRef, useState, useEffect } from "react"
import { format, isPast, isFuture, isToday } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { Check, Lock, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DeliveryTimelineItem } from "@/server/actions/redesign-dashboard"

interface TimelineJourneyProps {
    items: DeliveryTimelineItem[]
}

export function TimelineJourney({ items }: TimelineJourneyProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(false)

    // Sort items by date
    const sortedItems = [...items].sort((a, b) =>
        new Date(a.deliverAt).getTime() - new Date(b.deliverAt).getTime()
    )

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
            setCanScrollLeft(scrollLeft > 0)
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10) // -10 for buffer
        }
    }

    useEffect(() => {
        checkScroll()
        window.addEventListener("resize", checkScroll)
        return () => window.removeEventListener("resize", checkScroll)
    }, [items])

    const scroll = (direction: "left" | "right") => {
        if (scrollRef.current) {
            const scrollAmount = 300
            scrollRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            })
        }
    }

    return (
        <div className="w-full space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl text-charcoal">Your Journey</h3>
                <div className="flex gap-4 text-xs font-medium text-stone-500">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-teal-500" />
                        <span>Delivered</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full border-2 border-stone-300" />
                        <span>Waiting</span>
                    </div>
                </div>
            </div>

            <div className="relative group">
                {/* Scroll Hint Gradient - Right */}
                <div className={cn(
                    "absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#FDFBF7] to-transparent z-20 pointer-events-none transition-opacity duration-300",
                    canScrollRight ? "opacity-100" : "opacity-0"
                )} />

                {/* Scroll Hint Gradient - Left */}
                <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#FDFBF7] to-transparent z-20 pointer-events-none transition-opacity duration-300",
                    canScrollLeft ? "opacity-100" : "opacity-0"
                )} />

                {/* Navigation Buttons */}
                <AnimatePresence>
                    {canScrollLeft && (
                        <motion.button
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            onClick={() => scroll("left")}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/80 backdrop-blur-sm border border-stone-200 rounded-full shadow-md text-stone-600 hover:text-charcoal hover:scale-105 transition-all"
                            aria-label="Scroll left"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </motion.button>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {canScrollRight && (
                        <motion.button
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            onClick={() => scroll("right")}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-30 p-2 bg-white/80 backdrop-blur-sm border border-stone-200 rounded-full shadow-md text-stone-600 hover:text-charcoal hover:scale-105 transition-all"
                            aria-label="Scroll right"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </motion.button>
                    )}
                </AnimatePresence>

                <div
                    ref={scrollRef}
                    onScroll={checkScroll}
                    className="relative w-full overflow-x-auto pb-12 pt-8 hide-scrollbar scroll-smooth"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    <div className="relative flex gap-12 px-4 min-w-max">
                        {/* Timeline Line - Now spans full width correctly */}
                        <div className="absolute top-[4.5rem] left-0 right-0 h-0.5 bg-stone-200" />

                        {sortedItems.map((item, index) => {
                            const date = new Date(item.deliverAt)
                            const isDelivered = item.status === 'sent'
                            const isNext = item.status === 'scheduled' && !sortedItems.slice(0, index).some(i => i.status === 'scheduled')

                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="relative flex flex-col items-center group z-10"
                                >
                                    {/* Date Label */}
                                    <div className="mb-4 text-xs font-mono text-stone-500">
                                        {format(date, "MMM d, yyyy")}
                                    </div>

                                    {/* Node */}
                                    <div className={cn(
                                        "relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                                        isDelivered ? "bg-teal-500 text-white shadow-md" : "bg-white border-2 border-stone-300 text-stone-400",
                                        isNext && "border-teal-500 text-teal-500 ring-4 ring-teal-100"
                                    )}>
                                        {isDelivered ? (
                                            <Check className="w-4 h-4" />
                                        ) : (
                                            <Lock className="w-3 h-3" />
                                        )}
                                    </div>

                                    {/* Card (Tooltip style) */}
                                    <div className="mt-6 w-48 bg-white p-4 rounded-lg border border-stone-100 shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
                                        <h4 className="font-serif text-sm font-medium text-charcoal line-clamp-1 mb-1">
                                            {item.letter.title || "Untitled Letter"}
                                        </h4>
                                        <p className="text-xs text-stone-500 line-clamp-2">
                                            {isDelivered
                                                ? "Delivered to your inbox."
                                                : "Safely encrypted and waiting."}
                                        </p>
                                    </div>
                                </motion.div>
                            )
                        })}

                        {/* Add a "Future" node to encourage writing more */}
                        <button className="relative flex flex-col items-center opacity-50 hover:opacity-100 transition-opacity cursor-pointer z-10 group focus:outline-none focus:opacity-100">
                            <div className="mb-4 text-xs font-mono text-stone-400">Future</div>
                            <div className="relative z-10 w-8 h-8 rounded-full border-2 border-dashed border-stone-300 flex items-center justify-center bg-transparent group-focus:border-teal-500 group-focus:text-teal-500">
                                <ArrowRight className="w-3 h-3 text-stone-400 group-focus:text-teal-500" />
                            </div>
                            <div className="mt-6 w-48 flex items-center justify-center p-4">
                                <span className="text-xs text-stone-400 font-medium group-focus:text-teal-600">Write another...</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

