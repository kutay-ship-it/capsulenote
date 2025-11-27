import { Suspense } from "react"
import { PenSquare, AlertTriangle } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { Link } from "@/i18n/routing"
import { requireUser } from "@/server/lib/auth"
import { getDrafts } from "@/server/lib/drafts"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DraftCard, type DraftData } from "@/components/draft-card"
import { Skeleton, LetterCardSkeleton } from "@/components/skeletons"

// Force dynamic rendering - drafts list must always show fresh data
export const revalidate = 0

// Pastel background colors rotation
const bgColors = [
  "bg-bg-blue-light",
  "bg-bg-peach-light",
  "bg-bg-purple-light",
  "bg-bg-yellow-pale",
  "bg-bg-green-light",
  "bg-bg-pink-light",
]

// Skeleton for drafts grid
function DraftsGridSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <LetterCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

// Async component for drafts content
async function DraftsContent() {
  const t = await getTranslations("letters.drafts")
  const user = await requireUser()
  const drafts = await getDrafts(user.id)

  // Categorize drafts by expiration status
  const expiredDrafts = drafts.filter((d) => d.expiresInDays < 0)
  const expiringDrafts = drafts.filter((d) => d.expiresInDays >= 0 && d.expiresInDays <= 7)
  const activeDrafts = drafts.filter((d) => d.expiresInDays > 7)

  if (drafts.length === 0) {
    return (
      <Card
        className="border-2 border-charcoal shadow-md"
        style={{ borderRadius: "2px" }}
      >
        <CardContent className="flex flex-col items-center justify-center py-16 text-center sm:py-20">
          <div
            className="mb-6 flex h-20 w-20 items-center justify-center border-2 border-charcoal bg-bg-blue-light"
            style={{ borderRadius: "2px" }}
          >
            <PenSquare className="h-10 w-10 text-charcoal" strokeWidth={2} />
          </div>
          <h3 className="mb-2 font-mono text-xl font-normal uppercase tracking-wide text-charcoal sm:text-2xl">
            {t("empty.title")}
          </h3>
          <p className="mb-6 max-w-md font-mono text-sm text-gray-secondary sm:text-base">
            {t("empty.description", {
              interpolation: {
                delimiters: {
                  start: "{{",
                  end: "}}",
                },
              },
            })}
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

  return (
    <>
      {/* Expiration Warning */}
      {(expiredDrafts.length > 0 || expiringDrafts.length > 0) && (
        <Alert
          className="border-2 border-charcoal bg-duck-yellow"
          style={{ borderRadius: "2px" }}
        >
          <AlertTriangle className="h-5 w-5 text-charcoal" strokeWidth={2} />
          <AlertTitle className="font-mono text-base font-normal uppercase tracking-wide text-charcoal">
            {t("warningTitle")}
          </AlertTitle>
          <AlertDescription className="font-mono text-sm text-gray-secondary">
            {expiredDrafts.length > 0 && (
              <p className="mb-2">
                {t("expiredMessage", { count: expiredDrafts.length })}
              </p>
            )}
            {expiringDrafts.length > 0 && (
              <p>
                {t("expiringMessage", { count: expiringDrafts.length })}
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Drafts Grid */}
      <div className="space-y-8">
        {/* Expired Drafts Section */}
        {expiredDrafts.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="font-mono text-xl font-normal uppercase tracking-wide text-charcoal sm:text-2xl">
                {t("sections.expired", { count: expiredDrafts.length })}
              </h2>
              <Badge
                variant="destructive"
                className="border-2 border-charcoal font-mono text-xs uppercase"
                style={{ borderRadius: "2px" }}
              >
                {t("badges.willDelete")}
              </Badge>
            </div>
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {expiredDrafts.map((draft, index) => (
                <DraftCard key={draft.id} draft={draft as DraftData} bgColor={bgColors[index % bgColors.length]} expired />
              ))}
            </div>
          </div>
        )}

        {/* Expiring Soon Section */}
        {expiringDrafts.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="font-mono text-xl font-normal uppercase tracking-wide text-charcoal sm:text-2xl">
                {t("sections.expiring", { count: expiringDrafts.length })}
              </h2>
              <Badge
                variant="secondary"
                className="border-2 border-charcoal bg-duck-yellow font-mono text-xs uppercase"
                style={{ borderRadius: "2px" }}
              >
                {t("badges.expiringDays", { count: 7 })}
              </Badge>
            </div>
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {expiringDrafts.map((draft, index) => (
                <DraftCard key={draft.id} draft={draft as DraftData} bgColor={bgColors[index % bgColors.length]} expiring />
              ))}
            </div>
          </div>
        )}

        {/* Active Drafts Section */}
        {activeDrafts.length > 0 && (
          <div className="space-y-4">
            <h2 className="font-mono text-xl font-normal uppercase tracking-wide text-charcoal sm:text-2xl">
              {t("sections.active", { count: activeDrafts.length })}
            </h2>
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {activeDrafts.map((draft, index) => (
                <DraftCard key={draft.id} draft={draft as DraftData} bgColor={bgColors[index % bgColors.length]} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default async function DraftsPage() {
  const t = await getTranslations("letters.drafts")

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Page Header - Instant */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="font-mono text-3xl font-normal uppercase tracking-wide text-charcoal sm:text-4xl md:text-5xl">
            {t("heading")}
          </h1>
          <p className="font-mono text-sm text-gray-secondary sm:text-base">
            {t("subtitle")}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/letters" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="h-12 w-full uppercase sm:h-auto sm:w-auto">
              {t("all")}
            </Button>
          </Link>
          <Link href="/letters/new" className="w-full sm:w-auto">
            <Button size="lg" className="h-12 w-full uppercase sm:h-auto sm:w-auto">
              <PenSquare className="mr-2 h-4 w-4" strokeWidth={2} />
              {t("writeNew")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Drafts Content - Streams independently */}
      <Suspense fallback={<DraftsGridSkeleton />}>
        <DraftsContent />
      </Suspense>
    </div>
  )
}
