import Link from "next/link"
import { PenSquare, Calendar, Clock, AlertTriangle } from "lucide-react"
import { requireUser } from "@/server/lib/auth"
import { getDrafts } from "@/server/lib/drafts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { formatDate } from "@/lib/utils"

// Force dynamic rendering - drafts list must always show fresh data
export const revalidate = 0

export default async function DraftsPage() {
  const user = await requireUser()
  const drafts = await getDrafts(user.id)

  // Categorize drafts by expiration status
  const expiredDrafts = drafts.filter((d) => d.expiresInDays < 0)
  const expiringDrafts = drafts.filter((d) => d.expiresInDays >= 0 && d.expiresInDays <= 7)
  const activeDrafts = drafts.filter((d) => d.expiresInDays > 7)

  // Pastel background colors rotation
  const bgColors = [
    "bg-bg-blue-light",
    "bg-bg-peach-light",
    "bg-bg-purple-light",
    "bg-bg-yellow-pale",
    "bg-bg-green-light",
    "bg-bg-pink-light",
  ]

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h1 className="font-mono text-3xl font-normal uppercase tracking-wide text-charcoal sm:text-4xl md:text-5xl">
            Draft Letters
          </h1>
          <p className="font-mono text-sm text-gray-secondary sm:text-base">
            Unscheduled letters • Auto-deleted after 30 days
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/letters" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="h-12 w-full uppercase sm:h-auto sm:w-auto">
              All Letters
            </Button>
          </Link>
          <Link href="/letters/new" className="w-full sm:w-auto">
            <Button size="lg" className="h-12 w-full uppercase sm:h-auto sm:w-auto">
              <PenSquare className="mr-2 h-4 w-4" strokeWidth={2} />
              Write New
            </Button>
          </Link>
        </div>
      </div>

      {/* Expiration Warning */}
      {(expiredDrafts.length > 0 || expiringDrafts.length > 0) && (
        <Alert
          className="border-2 border-charcoal bg-duck-yellow"
          style={{ borderRadius: "2px" }}
        >
          <AlertTriangle className="h-5 w-5 text-charcoal" strokeWidth={2} />
          <AlertTitle className="font-mono text-base font-normal uppercase tracking-wide text-charcoal">
            Drafts Expiring Soon
          </AlertTitle>
          <AlertDescription className="font-mono text-sm text-gray-secondary">
            {expiredDrafts.length > 0 && (
              <p className="mb-2">
                <strong className="text-charcoal">{expiredDrafts.length}</strong> draft
                {expiredDrafts.length === 1 ? " has" : "s have"} expired and will be deleted soon.
              </p>
            )}
            {expiringDrafts.length > 0 && (
              <p>
                <strong className="text-charcoal">{expiringDrafts.length}</strong> draft
                {expiringDrafts.length === 1 ? " expires" : "s expire"} within 7 days.
                Schedule {expiringDrafts.length === 1 ? "it" : "them"} to prevent deletion.
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      {drafts.length === 0 ? (
        /* Empty State */
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
              No Drafts
            </h3>
            <p className="mb-6 max-w-md font-mono text-sm text-gray-secondary sm:text-base">
              All your letters have been scheduled! Create a new letter or{" "}
              <Link href="/letters" className="underline hover:text-charcoal transition-colors">
                view all letters
              </Link>
              .
            </p>
            <Link href="/letters/new" className="w-full sm:w-auto">
              <Button size="lg" className="h-12 w-full uppercase sm:h-auto sm:w-auto">
                <PenSquare className="mr-2 h-4 w-4" strokeWidth={2} />
                Write New Letter
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        /* Drafts Grid */
        <div className="space-y-8">
          {/* Expired Drafts Section */}
          {expiredDrafts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="font-mono text-xl font-normal uppercase tracking-wide text-charcoal sm:text-2xl">
                  Expired ({expiredDrafts.length})
                </h2>
                <Badge
                  variant="destructive"
                  className="border-2 border-charcoal font-mono text-xs uppercase"
                  style={{ borderRadius: "2px" }}
                >
                  Will be deleted
                </Badge>
              </div>
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {expiredDrafts.map((draft, index) => (
                  <DraftCard key={draft.id} draft={draft} bgColor={bgColors[index % bgColors.length]} expired />
                ))}
              </div>
            </div>
          )}

          {/* Expiring Soon Section */}
          {expiringDrafts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h2 className="font-mono text-xl font-normal uppercase tracking-wide text-charcoal sm:text-2xl">
                  Expiring Soon ({expiringDrafts.length})
                </h2>
                <Badge
                  variant="secondary"
                  className="border-2 border-charcoal bg-duck-yellow font-mono text-xs uppercase"
                  style={{ borderRadius: "2px" }}
                >
                  &lt; 7 days
                </Badge>
              </div>
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {expiringDrafts.map((draft, index) => (
                  <DraftCard key={draft.id} draft={draft} bgColor={bgColors[index % bgColors.length]} expiring />
                ))}
              </div>
            </div>
          )}

          {/* Active Drafts Section */}
          {activeDrafts.length > 0 && (
            <div className="space-y-4">
              <h2 className="font-mono text-xl font-normal uppercase tracking-wide text-charcoal sm:text-2xl">
                Active Drafts ({activeDrafts.length})
              </h2>
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeDrafts.map((draft, index) => (
                  <DraftCard key={draft.id} draft={draft} bgColor={bgColors[index % bgColors.length]} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Draft Card Component
 */
function DraftCard({
  draft,
  bgColor,
  expired = false,
  expiring = false,
}: {
  draft: {
    id: string
    title: string
    tags: string[]
    createdAt: Date
    updatedAt: Date
    daysOld: number
    expiresInDays: number
  }
  bgColor: string
  expired?: boolean
  expiring?: boolean
}) {
  return (
    <Link href={`/letters/${draft.id}`}>
      <Card
        className={`h-full border-2 border-charcoal shadow-sm transition-all duration-fast hover:shadow-md hover:translate-x-0.5 hover:-translate-y-0.5 ${bgColor} ${expired ? "opacity-70" : ""}`}
        style={{ borderRadius: "2px" }}
      >
        <CardHeader className="space-y-3 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="font-mono text-lg font-normal uppercase tracking-wide line-clamp-2 sm:text-xl">
              {draft.title}
            </CardTitle>
            {(expired || expiring) && (
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center border-2 border-charcoal ${expired ? "bg-coral" : "bg-duck-yellow"}`}
                style={{ borderRadius: "2px" }}
              >
                <AlertTriangle className="h-4 w-4 text-charcoal" strokeWidth={2} />
              </div>
            )}
          </div>
          <CardDescription className="space-y-2 font-mono text-xs text-gray-secondary sm:text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" strokeWidth={2} />
              Created {formatDate(draft.createdAt)}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" strokeWidth={2} />
              {draft.daysOld} {draft.daysOld === 1 ? "day" : "days"} old
              {expired && (
                <Badge variant="destructive" className="ml-auto font-mono text-xs uppercase">
                  EXPIRED
                </Badge>
              )}
              {expiring && !expired && (
                <Badge className="ml-auto bg-duck-yellow text-charcoal border-2 border-charcoal font-mono text-xs uppercase">
                  {draft.expiresInDays}d left
                </Badge>
              )}
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 p-5 pt-0 sm:p-6 sm:pt-0">
          {/* Tags */}
          {draft.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {draft.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="border-2 border-charcoal font-mono text-xs uppercase"
                  style={{ borderRadius: "2px" }}
                >
                  {tag}
                </Badge>
              ))}
              {draft.tags.length > 3 && (
                <Badge
                  variant="secondary"
                  className="border-2 border-charcoal font-mono text-xs uppercase"
                  style={{ borderRadius: "2px" }}
                >
                  +{draft.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
          {/* CTA */}
          <div className="border-t-2 border-charcoal pt-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full border-2 border-charcoal font-mono text-xs uppercase"
              style={{ borderRadius: "2px" }}
              asChild
            >
              <span>
                <PenSquare className="mr-2 h-3 w-3" strokeWidth={2} />
                Continue Writing →
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
