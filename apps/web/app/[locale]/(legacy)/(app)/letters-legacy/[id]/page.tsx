import { Suspense } from "react"
import { notFound } from "next/navigation"
import { Mail, Calendar, ArrowLeft, ChevronDown } from "lucide-react"
import { getLocale, getTranslations } from "next-intl/server"

import { Link } from "@/i18n/routing"
import { getLetter } from "@/server/actions/letters"
import { requireUser } from "@/server/lib/auth"
import { decryptLetter } from "@/server/lib/encryption"
import { sanitizeLetterHtml } from "@/lib/sanitize"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TimezoneTooltip } from "@/components/timezone-tooltip"
import { DownloadCalendarButton } from "@/components/download-calendar-button"
import { DeliveryErrorCard } from "@/components/delivery-error-card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/skeletons"
import { ScheduleDeliveryForm } from "@/components/schedule-delivery-form"
import { InlineScheduleSection } from "@/components/letters/inline-schedule-section"
import { LetterTimeline } from "@/components/letters/letter-timeline"

// Force dynamic rendering - letter detail must always show fresh data
export const revalidate = 0

interface PageProps {
  params: Promise<{
    id: string
  }>
}

// Skeleton for letter detail content
function LetterDetailSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-2/3" />
        </div>
      </CardContent>
    </Card>
  )
}

// Async component for letter content
async function LetterContent({ id, userEmail }: { id: string; userEmail: string }) {
  const locale = await getLocale()
  const t = await getTranslations("letters")

  let letter
  try {
    letter = await getLetter(id)
  } catch {
    notFound()
  }

  // Check if letter has any active scheduled deliveries
  const hasScheduledDeliveries = letter.deliveries.some(
    (d) => d.status === "scheduled" || d.status === "processing"
  )

  const formatDate = (date: Date | string, withTime = false, withTz = false) => {
    const dateObj = typeof date === "string" ? new Date(date) : date
    if (withTz) {
      return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
        ...(withTime && { hour: "numeric", minute: "numeric" }),
        timeZoneName: "short",
      }).format(dateObj)
    }
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "long",
      timeStyle: withTime ? "short" : undefined,
    }).format(dateObj)
  }

  const statusLabel = (status: string) => t(`detail.deliveryStatus.${status}` as const)
  const channelLabel = (channel: string) => (channel === "email" ? t("detail.channel.email") : t("detail.channel.mail"))

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl">{letter.title}</CardTitle>
              <CardDescription>{t("detail.created", { date: formatDate(letter.createdAt, true) })}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="font-mono text-xs uppercase">
                {statusLabel(letter.status)}
              </Badge>
              <Link href={{ pathname: "/letters/[id]/schedule", params: { id } }}>
                <Button>
                  <Calendar className="mr-2 h-4 w-4" />
                  {t("detail.scheduleCta")}
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            className="prose prose-sm sm:prose lg:prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizeLetterHtml(letter.bodyHtml) }}
          />

          {/* Letter Timeline Visualization */}
          {letter.deliveries.length > 0 && (
            <LetterTimeline
              createdAt={letter.createdAt}
              scheduledFor={letter.scheduledFor}
              deliveries={letter.deliveries.map((d) => ({
                status: d.status,
                deliverAt: d.deliverAt,
                createdAt: d.createdAt,
              }))}
              locale={locale}
            />
          )}

          {letter.deliveries.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="mb-4 text-lg font-semibold">{t("detail.scheduledHeading")}</h3>
              <div className="space-y-2">
                {letter.deliveries.map((delivery) => (
                  <div key={delivery.id} className="space-y-2">
                    <Card>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <Mail className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">
                              {channelLabel(delivery.channel)}
                            </p>
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm text-muted-foreground">
                                {formatDate(delivery.deliverAt, true, true)}
                              </p>
                              <TimezoneTooltip deliveryDate={delivery.deliverAt} variant="clock" />
                            </div>
                            {letter.lockedAt && (
                              <p className="text-xs text-gray-secondary">
                                {t("detail.locked", { date: formatDate(letter.lockedAt, true) })}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs uppercase">
                            {statusLabel(delivery.status)}
                          </Badge>
                          <DownloadCalendarButton
                            letterTitle={letter.title}
                            deliveryDate={new Date(delivery.deliverAt)}
                            deliveryMethod={delivery.channel}
                            recipientEmail={delivery.channel === "email" ? (delivery.emailDelivery?.toEmail ?? "") : ""}
                          />
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              delivery.status === "scheduled"
                                ? "bg-blue-100 text-blue-800"
                                : delivery.status === "sent"
                                  ? "bg-green-100 text-green-800"
                              : delivery.status === "failed"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {statusLabel(delivery.status)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Error Card for Failed Deliveries */}
                    {delivery.status === "failed" && (
                      <DeliveryErrorCard
                        deliveryId={delivery.id}
                        lastError={delivery.lastError}
                        attemptCount={delivery.attemptCount}
                        letterTitle={letter.title}
                      />
                    )}
                  </div>
                ))}
              </div>

              {letter.deliveryAttempts.length > 0 && (
                <div className="mt-4">
                  <h4 className="mb-2 text-sm font-semibold">{t("detail.attemptsHeading")}</h4>
                  <div className="space-y-2">
                    {letter.deliveryAttempts.map((attempt) => (
                      <div
                        key={attempt.id}
                        className="rounded-sm border border-charcoal/20 bg-bg-blue-light p-3 font-mono text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span>
                            {channelLabel(attempt.channel)} · {statusLabel(attempt.status)}
                          </span>
                          <span>{formatDate(attempt.createdAt, true, true)}</span>
                        </div>
                        {attempt.errorMessage && (
                          <p className="mt-1 text-coral">{attempt.errorMessage}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inline Schedule Section - Show when no active deliveries */}
      {!hasScheduledDeliveries && (
        <InlineScheduleSection
          letterId={id}
          letterTitle={letter.title}
          letterPreview={letter.bodyHtml}
          userEmail={userEmail}
          translations={{
            scheduleTitle: t("detail.inlineSchedule.title"),
            scheduleDescription: t("detail.inlineSchedule.description"),
            expandLabel: t("detail.inlineSchedule.expand"),
          }}
        />
      )}
    </>
  )
}

export default async function LetterDetailPage({ params }: PageProps) {
  const { id } = await params
  const t = await getTranslations("letters")

  // Get user for email
  const user = await requireUser()

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Back Link - Instant */}
      <div className="flex items-center gap-4">
        <Link href="/letters">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("detail.back")}
          </Button>
        </Link>
      </div>

      {/* Letter Content - Streams independently */}
      <Suspense fallback={<LetterDetailSkeleton />}>
        <LetterContent id={id} userEmail={user.email} />
      </Suspense>
    </div>
  )
}
