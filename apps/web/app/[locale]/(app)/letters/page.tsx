import { Suspense } from "react"
import { PenSquare } from "lucide-react"
import { getLocale, getTranslations } from "next-intl/server"

import { Link } from "@/i18n/routing"
import { getFilteredLetters, getLetterCounts, type LetterFilter } from "@/server/actions/letter-filters"
import { LetterFilterTabs } from "@/components/letter-filter-tabs"
import { LettersListClient } from "@/components/letters-list-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton, LetterCardSkeleton } from "@/components/skeletons"

// Force dynamic rendering - letters list must always show fresh data
export const revalidate = 0

interface LettersPageProps {
  searchParams: Promise<{ filter?: string }>
}

// Skeleton for filter tabs
function FilterTabsSkeleton() {
  return (
    <div className="flex flex-wrap gap-2">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-10 w-24" />
      ))}
    </div>
  )
}

// Skeleton for letters grid
function LetterGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <LetterCardSkeleton key={i} />
      ))}
    </div>
  )
}

// Async component for filter tabs with counts
async function FilterTabsWithCounts({ filter }: { filter: LetterFilter }) {
  const counts = await getLetterCounts()
  return <LetterFilterTabs counts={counts} currentFilter={filter} />
}

// Async component for letter grid
async function LetterGrid({ filter }: { filter: LetterFilter }) {
  const [letters, locale, t] = await Promise.all([
    getFilteredLetters(filter),
    getLocale(),
    getTranslations("letters"),
  ])

  if (letters.length === 0) {
    return (
      <Card
        className="border-2 border-charcoal shadow-md"
        style={{ borderRadius: "2px" }}
      >
        <CardContent className="flex flex-col items-center justify-center py-16 text-center sm:py-20">
          <div
            className="mb-6 flex h-20 w-20 items-center justify-center border-2 border-charcoal bg-duck-yellow"
            style={{ borderRadius: "2px" }}
          >
            <PenSquare className="h-10 w-10 text-charcoal" strokeWidth={2} />
          </div>
          <h3 className="mb-2 font-mono text-xl font-normal uppercase tracking-wide text-charcoal sm:text-2xl">
            {t("empty.title")}
          </h3>
          <p className="mb-6 max-w-md font-mono text-sm text-gray-secondary sm:text-base">
            {t("empty.description")}
          </p>
          <Link href="/letters/new" className="w-full sm:w-auto">
            <Button size="lg" className="h-12 w-full uppercase sm:h-auto sm:w-auto">
              <PenSquare className="mr-2 h-4 w-4" strokeWidth={2} />
              {t("empty.cta")}
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return <LettersListClient letters={letters} locale={locale} />
}

export default async function LettersPage({ searchParams }: LettersPageProps) {
  const t = await getTranslations("letters")
  const params = await searchParams
  const filter = (params.filter || "all") as LetterFilter

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Page Header - Instant (no data dependency) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="font-mono text-3xl font-normal uppercase tracking-wide text-charcoal sm:text-4xl md:text-5xl">
            {t("heading")}
          </h1>
          <p className="font-mono text-sm text-gray-secondary sm:text-base">
            {t("subtitle")}
          </p>
        </div>
        <Link href="/letters/new" className="w-full sm:w-auto">
          <Button size="lg" className="h-12 w-full uppercase sm:h-auto sm:w-auto">
            <PenSquare className="mr-2 h-4 w-4" strokeWidth={2} />
            {t("new")}
          </Button>
        </Link>
      </div>

      {/* Filter Tabs - Streams with counts */}
      <Suspense fallback={<FilterTabsSkeleton />}>
        <FilterTabsWithCounts filter={filter} />
      </Suspense>

      {/* Letters Grid - Streams independently */}
      <Suspense fallback={<LetterGridSkeleton />}>
        <LetterGrid filter={filter} />
      </Suspense>
    </div>
  )
}
