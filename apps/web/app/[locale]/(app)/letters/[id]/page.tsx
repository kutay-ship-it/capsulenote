import { notFound } from "next/navigation"
import { Mail, Calendar, ArrowLeft } from "lucide-react"
import { getLocale, getTranslations } from "next-intl/server"

import { Link } from "@/i18n/routing"
import { getLetter } from "@/server/actions/letters"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TimezoneTooltip } from "@/components/timezone-tooltip"
import { DownloadCalendarButton } from "@/components/download-calendar-button"
import { DeliveryErrorCard } from "@/components/delivery-error-card"
import { Badge } from "@/components/ui/badge"

// Force dynamic rendering - letter detail must always show fresh data
export const revalidate = 0

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function LetterDetailPage({ params }: PageProps) {
  const { id } = await params
  const locale = await getLocale()
  const t = await getTranslations("letters")
  let letter
  try {
    letter = await getLetter(id)
  } catch {
    notFound()
  }

  const formatDate = (date: Date | string, withTime = false, withTz = false) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: "long",
      timeStyle: withTime ? "short" : undefined,
      timeZoneName: withTz ? "short" : undefined,
    }).format(typeof date === "string" ? new Date(date) : date)

  const statusLabel = (status: string) => t(`detail.deliveryStatus.${status}` as const)
  const channelLabel = (channel: string) => (channel === "email" ? t("detail.channel.email") : t("detail.channel.mail"))

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/letters">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("detail.back")}
          </Button>
        </Link>
      </div>

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
              <Link href={`/letters/${id}/schedule`}>
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
            dangerouslySetInnerHTML={{ __html: letter.bodyHtml }}
          />

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
    </div>
  )
}
