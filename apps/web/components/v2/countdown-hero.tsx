"use client"

import { useEffect, useState } from "react"
import { differenceInSeconds, format } from "date-fns"
import { motion } from "framer-motion"
import { Mail } from "lucide-react"
import { Link } from "@/i18n/routing"
import { V2Button } from "@/components/v2/design-system"

import type { NextDeliveryHeroData } from "@/server/actions/redesign-dashboard"

interface CountdownHeroProps {
    delivery: NextDeliveryHeroData
}

export function CountdownHero({ delivery }: CountdownHeroProps) {
    const [timeLeft, setTimeLeft] = useState<{
        days: number
        hours: number
        minutes: number
        seconds: number
    } | null>(null)

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date()
            const diff = differenceInSeconds(new Date(delivery.deliverAt), now)

            if (diff <= 0) return null

            const days = Math.floor(diff / (3600 * 24))
            const hours = Math.floor((diff % (3600 * 24)) / 3600)
            const minutes = Math.floor((diff % 3600) / 60)
            const seconds = diff % 60

            return { days, hours, minutes, seconds }
        }

        setTimeLeft(calculateTimeLeft())

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft())
        }, 1000)

        return () => clearInterval(timer)
    }, [delivery.deliverAt])

    if (!timeLeft) {
        return (
            <div className="w-full bg-white rounded-2xl p-8 shadow-sm border border-stone-100 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-4">
                    <Mail className="w-8 h-8 text-teal-600" />
                </div>
                <h2 className="font-serif text-2xl text-charcoal mb-2">Your letter has arrived!</h2>
                <p className="text-stone-500 mb-6">Check your inbox for a message from the past.</p>
                <Link href={`/letters-v2/${delivery.letter.id}` as any}>
                    <V2Button variant="primary" radius="default">
                        Open Letter
                    </V2Button>
                </Link>
            </div>
        )
    }

    return (
        <div className="w-full bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-stone-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-blue-500" />

            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-100 rounded-full text-xs font-medium text-stone-600 uppercase tracking-wider mb-2">
                        <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
                        Incoming Message
                    </div>
                    <h2 className="font-serif text-3xl md:text-4xl text-charcoal leading-tight">
                        <span className="italic text-stone-400">from</span> You
                        <br />
                        <span className="italic text-stone-400">to</span> Future You
                    </h2>
                    <p className="text-stone-500 font-mono text-sm pt-2">
                        Written on {format(new Date(delivery.letter.createdAt), "MMMM d, yyyy")}
                    </p>
                </div>

                <div className="flex gap-4 md:gap-8">
                    <TimeUnit value={timeLeft.days} label="Days" />
                    <TimeUnit value={timeLeft.hours} label="Hours" />
                    <TimeUnit value={timeLeft.minutes} label="Mins" />
                    <TimeUnit value={timeLeft.seconds} label="Secs" />
                </div>
            </div>
        </div>
    )
}

function TimeUnit({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center">
            <div className="relative">
                <motion.div
                    key={value}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 10, opacity: 0 }}
                    className="font-mono text-4xl md:text-5xl font-light text-charcoal"
                >
                    {value.toString().padStart(2, '0')}
                </motion.div>
            </div>
            <span className="text-xs font-medium text-stone-400 uppercase tracking-widest mt-2">{label}</span>
        </div>
    )
}
