import { Suspense } from "react"
import { getTranslations } from "next-intl/server"
import { redirect } from "next/navigation"

import { requireUser } from "@/server/lib/auth"
import {
    getDeliveryTimeline,
    getLettersWithPreview,
    getNextDeliveryForHero,
} from "@/server/actions/redesign-dashboard"
import { getDashboardStats } from "@/server/lib/stats"

import { JourneyPath } from "@/components/redesign/journey-path"
import { LetterGrid, LetterGridSkeleton } from "@/components/redesign/letter-grid"
import { NextDeliveryHero } from "@/components/redesign/next-delivery-hero"
import { EmptyStateHero } from "@/components/redesign/empty-state-hero"
import { FilterTabs } from "@/components/redesign/filter-tabs"
import { FloatingWriteButton } from "@/components/redesign/floating-write-button"
import { WritePromptBanner } from "@/components/redesign/write-prompt-banner"

// Force dynamic rendering
export const revalidate = 0

interface PageProps {
    searchParams: Promise<{
        filter?: string
    }>
}

export default async function LetterV2Page({ searchParams }: PageProps) {
    const user = await requireUser()
    const t = await getTranslations("redesign.dashboard")

    const { filter } = await searchParams
    const activeFilter = (filter as "all" | "drafts" | "scheduled" | "delivered") || "all"

    // Map 'delivered' to 'sent' for the API
    const apiFilter = activeFilter === "delivered" ? "sent" : activeFilter

    // Parallel data fetching
    const [timelineData, nextDelivery, letters, stats] = await Promise.all([
        getDeliveryTimeline(),
        getNextDeliveryForHero(),
        getLettersWithPreview(apiFilter),
        getDashboardStats(user.id),
    ])

    const counts = {
        all: stats.totalLetters,
        drafts: stats.draftCount,
        scheduled: stats.scheduledDeliveries,
        delivered: stats.deliveredCount,
    }

    const showHero = !filter || filter === "all"

    return (
        <div className="min-h-screen bg-bg-yellow-cream pb-20">
            <div className="mx-auto max-w-5xl space-y-12 px-4 py-8 sm:px-6 lg:px-8">
                {/* Header */}
                <header className="space-y-2">
                    <h1 className="font-mono text-3xl font-normal uppercase tracking-wide text-charcoal sm:text-4xl">
                        {t("title")}
                    </h1>
                    <p className="font-mono text-sm text-gray-secondary sm:text-base">
                        {t("subtitle")}
                    </p>
                </header>

                {/* Hero Section */}
                {showHero && (
                    <section>
                        {nextDelivery ? (
                            <NextDeliveryHero delivery={nextDelivery} />
                        ) : (
                            <EmptyStateHero />
                        )}
                    </section>
                )}

                {/* Journey Path */}
                {timelineData.length > 0 && (
                    <section className="space-y-4">
                        <JourneyPath deliveries={timelineData} />
                    </section>
                )}

                {/* Letter Grid Section */}
                <section className="space-y-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="font-mono text-2xl font-normal uppercase tracking-wide text-charcoal">
                            {t("yourLetters")}
                        </h2>
                        <FilterTabs counts={counts} activeFilter={activeFilter} />
                    </div>

                    <Suspense fallback={<LetterGridSkeleton />}>
                        <LetterGrid letters={letters} locale="en" isFiltered={activeFilter !== 'all'} />
                    </Suspense>
                </section>

                {/* Write Prompt Banner (if few letters) */}
                {letters.length < 3 && <WritePromptBanner />}
            </div>
            <FloatingWriteButton />
        </div>
    )
}
