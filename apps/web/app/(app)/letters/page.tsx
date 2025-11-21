import Link from "next/link"
import { PenSquare, Calendar, Mail as MailIcon, FileText, Clock, CheckCircle } from "lucide-react"
import { getFilteredLetters, getLetterCounts, type LetterFilter } from "@/server/actions/letter-filters"
import { LetterFilterTabs } from "@/components/letter-filter-tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"

interface LettersPageProps {
  searchParams: Promise<{ filter?: string }>
}

export default async function LettersPage({ searchParams }: LettersPageProps) {
  const params = await searchParams
  const filter = (params.filter || "all") as LetterFilter

  const [letters, counts] = await Promise.all([
    getFilteredLetters(filter),
    getLetterCounts(),
  ])

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
            My Letters
          </h1>
          <p className="font-mono text-sm text-gray-secondary sm:text-base">
            All your letters to your future self
          </p>
        </div>
        <Link href="/letters/new" className="w-full sm:w-auto">
          <Button size="lg" className="h-12 w-full uppercase sm:h-auto sm:w-auto">
            <PenSquare className="mr-2 h-4 w-4" strokeWidth={2} />
            Write New Letter
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <LetterFilterTabs counts={counts} currentFilter={filter} />

      {letters.length === 0 ? (
        /* Empty State */
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
              No Letters Yet
            </h3>
            <p className="mb-6 max-w-md font-mono text-sm text-gray-secondary sm:text-base">
              Start your journey by writing your first letter to your future self.
            </p>
            <Link href="/letters/new" className="w-full sm:w-auto">
              <Button size="lg" className="h-12 w-full uppercase sm:h-auto sm:w-auto">
                <PenSquare className="mr-2 h-4 w-4" strokeWidth={2} />
                Create Your First Letter
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        /* Letters Grid */
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {letters.map((letter, index) => {
            // Status icon and badge
            const statusConfig = {
              draft: {
                icon: FileText,
                badge: "Draft",
                iconBg: "bg-bg-yellow-pale",
              },
              scheduled: {
                icon: Clock,
                badge: "Scheduled",
                iconBg: "bg-bg-blue-light",
              },
              delivered: {
                icon: CheckCircle,
                badge: "Delivered",
                iconBg: "bg-bg-green-light",
              },
            }

            const config = statusConfig[letter.status]
            const StatusIcon = config.icon

            return (
              <Link key={letter.id} href={`/letters/${letter.id}`}>
                <Card
                  className={`h-full border-2 border-charcoal shadow-sm transition-all duration-fast hover:shadow-md hover:translate-x-0.5 hover:-translate-y-0.5 ${bgColors[index % bgColors.length]}`}
                  style={{ borderRadius: "2px" }}
                >
                  <CardHeader className="space-y-3 p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="font-mono text-lg font-normal uppercase tracking-wide line-clamp-2 sm:text-xl">
                        {letter.title}
                      </CardTitle>
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center border-2 border-charcoal ${config.iconBg}`}
                        style={{ borderRadius: "2px" }}
                      >
                        <StatusIcon className="h-4 w-4 text-charcoal" strokeWidth={2} />
                      </div>
                    </div>
                    <CardDescription className="flex items-center gap-2 font-mono text-xs text-gray-secondary sm:text-sm">
                      <Calendar className="h-4 w-4" strokeWidth={2} />
                      {formatDate(letter.createdAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 p-5 pt-0 sm:p-6 sm:pt-0">
                    <div className="flex items-center justify-between font-mono text-xs text-charcoal sm:text-sm">
                      <span className="font-normal">
                        {letter.deliveryCount}{" "}
                        {letter.deliveryCount === 1 ? "delivery" : "deliveries"}
                      </span>
                      <Badge
                        variant="outline"
                        className="border-2 border-charcoal font-mono text-xs uppercase"
                        style={{ borderRadius: "2px" }}
                      >
                        {config.badge}
                      </Badge>
                    </div>
                    {letter.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {letter.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="border-2 border-charcoal font-mono text-xs uppercase"
                            style={{ borderRadius: "2px" }}
                          >
                            {tag}
                          </Badge>
                        ))}
                        {letter.tags.length > 3 && (
                          <Badge
                            variant="secondary"
                            className="border-2 border-charcoal font-mono text-xs uppercase"
                            style={{ borderRadius: "2px" }}
                          >
                            +{letter.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
