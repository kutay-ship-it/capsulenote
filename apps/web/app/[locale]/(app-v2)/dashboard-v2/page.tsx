import { Suspense } from "react"
import { getTranslations } from "next-intl/server"

import { requireUser } from "@/server/lib/auth"
import {
    getDeliveryTimeline,
    getLettersWithPreview,
    getNextDeliveryForHero,
} from "@/server/actions/redesign-dashboard"

import { CountdownHero } from "@/components/v2/countdown-hero"
import { TimelineJourney } from "@/components/v2/timeline-journey"
import { WritePrompt } from "@/components/v2/write-prompt"
import { LetterGridV2 } from "@/components/v2/letter-grid-v2"
import { Skeleton } from "@/components/skeletons"
import { LifeInWeeks } from "@/components/v2/life-in-weeks"

// Force dynamic rendering
export const revalidate = 0

export default async function DashboardV2Page() {
    const user = await requireUser()
    const t = await getTranslations("redesign.dashboard")

    // Parallel data fetching
    const [timelineData, nextDelivery, letters] = await Promise.all([
        getDeliveryTimeline(),
        getNextDeliveryForHero(),
        getLettersWithPreview("all"),
    ])

    const firstName = user.profile?.displayName?.split(" ")[0] || user.email.split("@")[0] || "Friend"
    const hour = new Date().getHours()
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"

    return (
        <div className="space-y-16">
            {/* Header */}
            <header className="space-y-2 relative">
                <div className="absolute -left-20 -top-20 w-64 h-64 bg-teal-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
                <h1 className="font-serif text-4xl text-charcoal relative z-10">
                    {greeting}, {firstName}.
                </h1>
                <p className="text-stone-500 font-sans text-lg relative z-10">
                    Your time capsule is safe. Here is where you stand in time.
                </p>
            </header>

            {/* Hero Section - Countdown or Prompt */}
            <section>
                {nextDelivery ? (
                    <CountdownHero delivery={nextDelivery} />
                ) : (
                    <WritePrompt />
                )}
            </section>

            {/* Timeline Journey */}
            {timelineData.length > 0 && (
                <section>
                    <TimelineJourney items={timelineData} />
                </section>
            )}

            {/* Life in Weeks (Memento Mori) */}
            <section>
                <LifeInWeeks birthDate={new Date("1995-01-01")} />
            </section>

            {/* Recent Letters */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="font-serif text-2xl text-charcoal">Recent Letters</h2>
                    {/* Filter could go here */}
                </div>

                <Suspense fallback={<div className="h-64 bg-stone-100 rounded-xl animate-pulse" />}>
                    <LetterGridV2 letters={letters} />
                </Suspense>
            </section>

            {/* Secondary Prompt (if Hero was Countdown) */}
            {nextDelivery && (
                <section>
                    <WritePrompt />
                </section>
            )}
        </div>
    )
}
