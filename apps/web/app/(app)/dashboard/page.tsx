import { redirect } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardLetterEditor } from "@/components/dashboard-letter-editor"
import { DashboardWrapper } from "@/components/dashboard-wrapper"
import { TimezoneChangeWarning } from "@/components/timezone-change-warning"
import { requireUser } from "@/server/lib/auth"
import { getDashboardStats } from "@/server/lib/stats"

export default async function DashboardPage() {
  // Get current user (includes auth check)
  const user = await requireUser().catch(() => {
    redirect("/sign-in")
    return null
  })

  if (!user) {
    redirect("/sign-in")
  }

  // Fetch dashboard statistics
  const stats = await getDashboardStats(user.id)

  // Check if user needs onboarding
  const showOnboarding = !user.profile?.onboardingCompleted

  return (
    <DashboardWrapper showOnboarding={showOnboarding}>
      <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="font-mono text-3xl font-normal uppercase tracking-wide text-charcoal sm:text-4xl">
            Dashboard
          </h1>
          <p className="font-mono text-sm text-gray-secondary sm:text-base">
            Welcome back! Here's an overview of your letters.
          </p>
        </div>
      </div>

      {/* Timezone Change Warning */}
      {user.profile?.timezone && (
        <TimezoneChangeWarning savedTimezone={user.profile.timezone} />
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card
          className="border-2 border-charcoal shadow-sm transition-all duration-fast hover:shadow-md hover:translate-x-0.5 hover:-translate-y-0.5 bg-bg-blue-light"
          style={{ borderRadius: "2px" }}
        >
          <CardHeader className="p-5 sm:p-6">
            <CardTitle className="font-mono text-lg font-normal uppercase tracking-wide sm:text-xl">
              Total Letters
            </CardTitle>
            <CardDescription className="font-mono text-xs text-gray-secondary sm:text-sm">
              All letters you've written
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
                Drafts
              </CardTitle>
              <CardDescription className="font-mono text-xs text-gray-secondary sm:text-sm">
                Unscheduled letters
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
              Scheduled
            </CardTitle>
            <CardDescription className="font-mono text-xs text-gray-secondary sm:text-sm">
              Waiting to be delivered
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
              Delivered
            </CardTitle>
            <CardDescription className="font-mono text-xs text-gray-secondary sm:text-sm">
              Successfully sent
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
            <div className="font-mono text-4xl font-normal text-charcoal sm:text-5xl">
              {stats.deliveredCount}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Write New Letter Section */}
      <div className="space-y-6 sm:space-y-8">
        {/* Section Header */}
        <div className="text-center space-y-3 sm:space-y-4">
          <Badge variant="outline" className="text-xs uppercase tracking-wide">
            Quick write
          </Badge>
          <h2 className="font-mono text-2xl font-normal uppercase tracking-wide text-charcoal sm:text-3xl">
            Write a New Letter
          </h2>
          <p className="font-mono text-xs leading-relaxed text-gray-secondary sm:text-sm md:text-base">
            Create and schedule a letter to your future self from your dashboard.
          </p>
        </div>

        {/* Letter Editor */}
        <DashboardLetterEditor />
      </div>

      {/* Recent Letters Section */}
      <Card
        className="border-2 border-charcoal shadow-md"
        style={{ borderRadius: "2px" }}
      >
        <CardHeader className="p-5 sm:p-6">
          <CardTitle className="font-mono text-xl font-normal uppercase tracking-wide sm:text-2xl">
            Recent Letters
          </CardTitle>
          <CardDescription className="font-mono text-xs text-gray-secondary sm:text-sm">
            Your most recently created letters
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 sm:p-6">
          {stats.recentLetters.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center sm:py-16">
              <p className="mb-4 font-mono text-xs text-gray-secondary sm:mb-6 sm:text-sm">
                No letters yet. Use the editor above to create your first letter!
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
                        Created {new Date(letter.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <Badge variant="outline" className="font-mono text-xs">
                        {letter.deliveryCount} {letter.deliveryCount === 1 ? "delivery" : "deliveries"}
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
                    View all {stats.totalLetters} letters →
                  </Link>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </DashboardWrapper>
  )
}
