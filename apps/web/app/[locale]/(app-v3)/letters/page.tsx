import { Suspense } from "react"
import { PenLine, Mail, ArrowRight } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { Link } from "@/i18n/routing"
import type { Locale } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import {
  LettersListV3,
  LettersListV3Skeleton,
  type LetterFilter,
  type LettersByFilter,
} from "@/components/v3/letters-list-v3"
import { getLettersWithPreview } from "@/server/actions/redesign-dashboard"
import { getLetterCounts } from "@/server/actions/letter-filters"

// Force dynamic rendering - letters list must always show fresh data
export const dynamic = "force-dynamic"

interface LettersV3PageProps {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ filter?: string }>
}

interface EmptyStateTranslations {
  title: string
  cta: string
  prompts: string[]
}

/**
 * Empty state hero for when user has no letters at all
 */
function EmptyStateHeroV3({ translations }: { translations: EmptyStateTranslations }) {
  const prompts = translations.prompts

  // Use day of year for consistent prompt per day
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000)
  const promptIndex = dayOfYear % prompts.length

  return (
    <div
      className="w-full border-2 border-charcoal bg-duck-cream p-8 md:p-12"
      style={{ borderRadius: "2px" }}
    >
      <div className="flex flex-col items-center justify-center text-center space-y-6">
        {/* Icon */}
        <div
          className="flex h-16 w-16 items-center justify-center border-2 border-charcoal bg-duck-yellow"
          style={{ borderRadius: "2px" }}
        >
          <Mail className="h-8 w-8 text-charcoal" strokeWidth={2} />
        </div>

        {/* Message */}
        <div className="space-y-4 max-w-lg">
          <h2 className="font-mono text-xl md:text-2xl font-bold uppercase tracking-wide text-charcoal">
            {translations.title}
          </h2>
          <p className="font-mono text-sm text-charcoal/70 italic">
            &ldquo;{prompts[promptIndex]}&rdquo;
          </p>
        </div>

        {/* CTA */}
        <Link href="/letters/new">
          <Button className="gap-2">
            {translations.cta}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

/**
 * Async component for letters list with ALL data prefetched
 * This enables instant tab switching without server roundtrips
 */
async function LettersListSection({
  initialFilter,
  emptyStateTranslations
}: {
  initialFilter: LetterFilter
  emptyStateTranslations: EmptyStateTranslations
}) {
  // Fetch ALL filter data in parallel for instant tab switching
  const [allLetters, drafts, scheduled, delivered, counts] = await Promise.all([
    getLettersWithPreview("all"),
    getLettersWithPreview("drafts"),
    getLettersWithPreview("scheduled"),
    getLettersWithPreview("sent"), // "delivered" maps to "sent" status in DB
    getLetterCounts(),
  ])

  // If no letters at all, show empty state hero
  if (counts.all === 0) {
    return <EmptyStateHeroV3 translations={emptyStateTranslations} />
  }

  // Group all letters by filter for client-side instant switching
  const lettersByFilter: LettersByFilter = {
    all: allLetters,
    drafts,
    scheduled,
    delivered,
  }

  return (
    <LettersListV3
      lettersByFilter={lettersByFilter}
      counts={counts}
      initialFilter={initialFilter}
    />
  )
}

export default async function LettersV3Page({
  params,
  searchParams,
}: LettersV3PageProps) {
  const { locale } = await params
  const searchParamsResolved = await searchParams
  const initialFilter = (searchParamsResolved.filter || "all") as LetterFilter

  const t = await getTranslations({ locale, namespace: "letters" })

  // Build translations for empty state
  const emptyStateTranslations: EmptyStateTranslations = {
    title: t("emptyHero.title"),
    cta: t("emptyHero.cta"),
    prompts: t.raw("emptyHero.prompts") as string[],
  }

  return (
    <div className="space-y-0">
      {/* Page Header - Inside container (same pattern as journey) */}
      <div className="container">
        <header className="flex flex-col gap-4 py-12 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="font-mono text-3xl font-bold uppercase tracking-wide text-charcoal">
              {t("page.title")}
            </h1>
            <p className="font-mono text-sm text-charcoal/70">
              {t("page.description")}
            </p>
          </div>

          {/* Write CTA - Desktop only (mobile has header button) */}
          <Link href="/letters/new" className="hidden sm:block">
            <Button size="sm" className="gap-2">
              <PenLine className="h-4 w-4" />
              {t("newButton")}
            </Button>
          </Link>
        </header>

        {/* Letters List with Tabs - All data prefetched for instant switching */}
        <section className="pb-12">
          <Suspense fallback={<LettersListV3Skeleton />}>
            <LettersListSection
              initialFilter={initialFilter}
              emptyStateTranslations={emptyStateTranslations}
            />
          </Suspense>
        </section>
      </div>
    </div>
  )
}
