import { Suspense } from "react"
import { getLocale, getTranslations } from "next-intl/server"

import { redirect, Link } from "@/i18n/routing"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLetterEditor } from "@/components/dashboard-letter-editor"
import { DashboardWrapper } from "@/components/dashboard-wrapper"
import { TimezoneChangeWarning } from "@/components/timezone-change-warning"
import { StatsCardSkeleton, LetterCardSkeleton, Skeleton } from "@/components/skeletons"
import { requireUser } from "@/server/lib/auth"
import { getDashboardStats } from "@/server/lib/stats"

// Force dynamic rendering - dashboard must always show fresh data
export const revalidate = 0

// Skeleton for stats grid
function StatsGridSkeleton() {
  return (
    <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
  )
}

// Skeleton for recent letters
function RecentLettersSkeleton() {
  return (
    <Card
      className="border-2 border-gray-200 bg-gray-50"
      style={{ borderRadius: "2px" }}
    >
      <CardHeader className="p-5 sm:p-6">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="mt-1 h-4 w-56" />
      </CardHeader>
      <CardContent className="p-5 sm:p-6 space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="rounded-sm border-2 border-gray-200 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// Async component for stats cards
async function StatsCards({ userId }: { userId: string }) {
  const t = await getTranslations("dashboard")
  const stats = await getDashboardStats(userId)

  return (
    <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card
        className="border-2 border-charcoal shadow-sm transition-all duration-fast hover:shadow-md hover:translate-x-0.5 hover:-translate-y-0.5 bg-bg-blue-light"
        style={{ borderRadius: "2px" }}
      >
        <CardHeader className="p-5 sm:p-6">
          <CardTitle className="font-mono text-lg font-normal uppercase tracking-wide sm:text-xl">
            {t("stats.total.title")}
          </CardTitle>
          <CardDescription className="font-mono text-xs text-gray-secondary sm:text-sm">
            {t("stats.total.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
          <div className="font-mono text-4xl font-normal text-charcoal sm:text-5xl">
            {stats.totalLetters}
          </div>
        </CardContent>
      </Card>

      <Link href="/letters/drafts">
        <Card
          className="border-2 border-charcoal shadow-sm transition-all duration-fast hover:shadow-md hover:translate-x-0.5 hover:-translate-y-0.5 bg-bg-yellow-pale cursor-pointer h-full"
          style={{ borderRadius: "2px" }}
        >
          <CardHeader className="p-5 sm:p-6">
            <CardTitle className="font-mono text-lg font-normal uppercase tracking-wide sm:text-xl">
              {t("stats.drafts.title")}
            </CardTitle>
            <CardDescription className="font-mono text-xs text-gray-secondary sm:text-sm">
              {t("stats.drafts.description")}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
            <div className="font-mono text-4xl font-normal text-charcoal sm:text-5xl">
              {stats.draftCount}
            </div>
          </CardContent>
        </Card>
      </Link>

      <Card
        className="border-2 border-charcoal shadow-sm transition-all duration-fast hover:shadow-md hover:translate-x-0.5 hover:-translate-y-0.5 bg-bg-peach-light"
        style={{ borderRadius: "2px" }}
      >
        <CardHeader className="p-5 sm:p-6">
          <CardTitle className="font-mono text-lg font-normal uppercase tracking-wide sm:text-xl">
            {t("stats.scheduled.title")}
          </CardTitle>
          <CardDescription className="font-mono text-xs text-gray-secondary sm:text-sm">
            {t("stats.scheduled.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
          <div className="font-mono text-4xl font-normal text-charcoal sm:text-5xl">
            {stats.scheduledDeliveries}
          </div>
        </CardContent>
      </Card>

      <Card
        className="border-2 border-charcoal shadow-sm transition-all duration-fast hover:shadow-md hover:translate-x-0.5 hover:-translate-y-0.5 bg-bg-green-light"
        style={{ borderRadius: "2px" }}
      >
        <CardHeader className="p-5 sm:p-6">
          <CardTitle className="font-mono text-lg font-normal uppercase tracking-wide sm:text-xl">
            {t("stats.delivered.title")}
          </CardTitle>
          <CardDescription className="font-mono text-xs text-gray-secondary sm:text-sm">
            {t("stats.delivered.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
          <div className="font-mono text-4xl font-normal text-charcoal sm:text-5xl">
            {stats.deliveredCount}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Async component for recent letters
async function RecentLetters({ userId }: { userId: string }) {
  const t = await getTranslations("dashboard")
  const locale = await getLocale()
  const stats = await getDashboardStats(userId)

  const formatDate = (date: Date | string) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: "long",
    }).format(typeof date === "string" ? new Date(date) : date)

  return (
    <Card
      className="border-2 border-charcoal shadow-md"
      style={{ borderRadius: "2px" }}
    >
      <CardHeader className="p-5 sm:p-6">
        <CardTitle className="font-mono text-xl font-normal uppercase tracking-wide sm:text-2xl">
          {t("recent.title")}
        </CardTitle>
        <CardDescription className="font-mono text-xs text-gray-secondary sm:text-sm">
          {t("recent.description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5 sm:p-6">
        {stats.recentLetters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center sm:py-16">
            <p className="mb-4 font-mono text-xs text-gray-secondary sm:mb-6 sm:text-sm">
              {t("recent.empty")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.recentLetters.map((letter) => (
              <Link
                key={letter.id}
                href={`/letters/${letter.id}`}
                className="block rounded-sm border-2 border-charcoal p-4 transition-all duration-fast hover:shadow-md hover:translate-x-0.5 hover:-translate-y-0.5 bg-white"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-mono text-sm font-normal text-charcoal truncate sm:text-base">
                      {letter.title}
                    </h3>
                    <p className="mt-1 font-mono text-xs text-gray-secondary">
                      {t("recent.createdOn", { date: formatDate(letter.createdAt) })}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Badge variant="outline" className="font-mono text-xs">
                      {t("recent.deliveryCount", { count: letter.deliveryCount })}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))}
            {stats.totalLetters > 5 && (
              <div className="pt-2 text-center">
                <Link
                  href="/letters"
                  className="font-mono text-xs text-charcoal underline hover:text-gray-secondary transition-colors sm:text-sm"
                >
                  {t("recent.viewAll", { count: stats.totalLetters })}
                </Link>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default async function DashboardPage() {
  const t = await getTranslations("dashboard")

  // Get current user (includes auth check)
  const user = await requireUser().catch(() => {
    redirect("/sign-in")
    return null
  })

  if (!user) {
    redirect("/sign-in")
  }

  // Check if user needs onboarding
  const showOnboarding = !user.profile?.onboardingCompleted

  return (
    <DashboardWrapper showOnboarding={showOnboarding}>
      <div className="space-y-10">
        {/* Header Section - Instant (no data dependency) */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <h1 className="font-mono text-3xl font-normal uppercase tracking-wide text-charcoal sm:text-4xl">
              {t("heading")}
            </h1>
            <p className="font-mono text-sm text-gray-secondary sm:text-base">
              {t("welcome")}
            </p>
          </div>
        </div>

        {/* Timezone Change Warning - Instant (depends only on user.profile) */}
        {user.profile?.timezone && (
          <TimezoneChangeWarning savedTimezone={user.profile.timezone} />
        )}

        {/* Stats Cards - Streams independently */}
        <Suspense fallback={<StatsGridSkeleton />}>
          <StatsCards userId={user.id} />
        </Suspense>

        {/* Write New Letter Section - Instant (client component) */}
        <div className="space-y-6 sm:space-y-8">
          {/* Section Header */}
          <div className="text-center space-y-3 sm:space-y-4">
            <Badge variant="outline" className="text-xs uppercase tracking-wide">
              {t("quick.badge")}
            </Badge>
            <h2 className="font-mono text-2xl font-normal uppercase tracking-wide text-charcoal sm:text-3xl">
              {t("quick.title")}
            </h2>
            <p className="font-mono text-xs leading-relaxed text-gray-secondary sm:text-sm md:text-base">
              {t("quick.description")}
            </p>
          </div>

          {/* Letter Editor - Instant (client component) */}
          <DashboardLetterEditor />
        </div>

        {/* Recent Letters Section - Streams independently */}
        <Suspense fallback={<RecentLettersSkeleton />}>
          <RecentLetters userId={user.id} />
        </Suspense>
      </div>
    </DashboardWrapper>
  )
}
