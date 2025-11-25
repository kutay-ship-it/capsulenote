import { Suspense } from "react"
import { PenSquare } from "lucide-react"
import { getLocale, getTranslations } from "next-intl/server"

import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/skeletons"

import {
  getNextDeliveryForHero,
  getDeliveryTimeline,
  getLettersWithPreview,
} from "@/server/actions/redesign-dashboard"
import { getLetterCounts } from "@/server/actions/letter-filters"

import {
  NextDeliveryHero,
  EmptyStateHero,
  DeliveryTimeline,
  FilterTabs,
  LetterGrid,
  LetterGridSkeleton,
  WritePromptBanner,
  FloatingWriteButton,
  JourneyPath,
} from "@/components/redesign"

// Force dynamic rendering - letters list must always show fresh data
export const revalidate = 0

interface RedesignLettersPageProps {
  searchParams: Promise<{ filter?: string }>
}

// Filter tabs skeleton
function FilterTabsSkeleton() {
  return (
    <div className="flex gap-6 sm:gap-8">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-8 w-20" />
      ))}
    </div>
  )
}

// Hero skeleton
function HeroSkeleton() {
  return (
    <div
      className="border-2 border-charcoal bg-bg-yellow-cream p-6 sm:p-8 md:p-12"
      style={{ borderRadius: "2px" }}
    >
      <div className="flex flex-col items-center">
        <Skeleton className="mb-6 h-6 w-48" />
        <Skeleton className="mb-6 h-16 w-24" />
        <Skeleton className="mb-2 h-8 w-64" />
        <Skeleton className="mb-6 h-4 w-40" />
        <div className="flex gap-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
    </div>
  )
}

// Timeline skeleton
function TimelineSkeleton() {
  return (
    <div className="mb-8">
      <Skeleton className="mb-4 h-4 w-24" />
      <div className="relative h-64 overflow-x-auto">
        <div className="mt-32">
          <Skeleton className="h-0.5 w-full" />
        </div>
      </div>
    </div>
  )
}

// Async component for filter tabs with counts
async function FilterTabsWithCounts({
  filter,
}: {
  filter: "all" | "drafts" | "scheduled" | "delivered"
}) {
  const counts = await getLetterCounts()
  return <FilterTabs counts={counts} activeFilter={filter} />
}

// Async component for hero section
async function HeroSection() {
  const nextDelivery = await getNextDeliveryForHero()

  if (!nextDelivery) {
    return null
  }

  return <NextDeliveryHero delivery={nextDelivery} />
}

// Async component for timeline
async function TimelineSection() {
  const timeline = await getDeliveryTimeline()

  // Only show timeline with 2+ deliveries
  if (timeline.length < 2) {
    return null
  }

  return <DeliveryTimeline deliveries={timeline} />
}

// Async component for journey path (new design)
async function JourneyPathSection() {
  const timeline = await getDeliveryTimeline()

  if (timeline.length === 0) {
    return null
  }

  return <JourneyPath deliveries={timeline} />
}

// Async component for letter grid
async function LetterGridSection({
  filter,
}: {
  filter: "all" | "drafts" | "scheduled" | "delivered"
}) {
  const [letters, locale] = await Promise.all([
    getLettersWithPreview(filter === "delivered" ? "sent" : filter),
    getLocale(),
  ])

  return (
    <LetterGrid
      letters={letters}
      locale={locale}
      isFiltered={filter !== "all"}
    />
  )
}

// Main content when user has letters
async function MainContent({
  filter,
}: {
  filter: "all" | "drafts" | "scheduled" | "delivered"
}) {
  const [letters, counts] = await Promise.all([
    getLettersWithPreview(filter === "delivered" ? "sent" : filter),
    getLetterCounts(),
  ])

  // If no letters at all, show empty state hero
  if (counts.all === 0) {
    return <EmptyStateHero />
  }

  return (
    <>
      {/* Letter grid - first for quick access */}
      <Suspense fallback={<LetterGridSkeleton />}>
        <LetterGridSection filter={filter} />
      </Suspense>

      {/* Hero - shows next delivery countdown */}
      <Suspense fallback={<HeroSkeleton />}>
        <HeroSection />
      </Suspense>

      {/* Timeline - shows delivery journey */}
      <Suspense fallback={<TimelineSkeleton />}>
        <TimelineSection />
      </Suspense>

      {/* New Journey Path Visualization */}
      <Suspense fallback={<TimelineSkeleton />}>
        <JourneyPathSection />
      </Suspense>

      {/* Write prompt banner */}
      <WritePromptBanner />
    </>
  )
}

export default async function RedesignLettersPage({
  searchParams,
}: RedesignLettersPageProps) {
  const t = await getTranslations("redesign")
  const params = await searchParams
  const filter = (params.filter || "all") as
    | "all"
    | "drafts"
    | "scheduled"
    | "delivered"

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-mono text-2xl font-normal uppercase tracking-wide text-charcoal sm:text-3xl md:text-4xl">
            {t("page.title")}
          </h1>
          <p className="font-mono text-sm text-gray-secondary">
            {t("page.subtitle")}
          </p>
        </div>
        <Link href="/redesign/letters/new" className="w-full sm:w-auto">
          <Button size="default" className="h-12 w-full uppercase sm:h-auto sm:w-auto">
            <PenSquare className="mr-2 h-4 w-4" strokeWidth={2} />
            {t("page.writeButton")}
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <Suspense fallback={<FilterTabsSkeleton />}>
        <FilterTabsWithCounts filter={filter} />
      </Suspense>

      {/* Main Content */}
      <Suspense fallback={<LetterGridSkeleton />}>
        <MainContent filter={filter} />
      </Suspense>

      {/* Floating write button for mobile */}
      <FloatingWriteButton />
    </div>
  )
}
