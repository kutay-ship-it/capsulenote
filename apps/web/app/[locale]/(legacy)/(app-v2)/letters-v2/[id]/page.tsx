import { Suspense } from "react"
import { notFound } from "next/navigation"
import { Mail, Calendar, ArrowLeft } from "lucide-react"
import { getLocale, getTranslations } from "next-intl/server"

import { Link } from "@/i18n/routing"
import { getLetter } from "@/server/actions/letters"
import { requireUser } from "@/server/lib/auth"
import { sanitizeLetterHtml } from "@/lib/sanitize"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TimezoneTooltip } from "@/components/timezone-tooltip"
import { DownloadCalendarButton } from "@/components/download-calendar-button"
import { DeliveryErrorCard } from "@/components/delivery-error-card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/skeletons"
import { InlineScheduleSection } from "@/components/letters/inline-schedule-section"
import { LetterTimeline } from "@/components/letters/letter-timeline"

// Force dynamic rendering
export const revalidate = 0

interface PageProps {
    params: Promise<{
        id: string
    }>
}

function LetterDetailSkeleton() {
    return (
        <div className="bg-white rounded-xl border border-stone-100 p-8 space-y-6">
            <div className="flex justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        </div>
    )
}

async function LetterContent({ id, userEmail }: { id: string; userEmail: string }) {
    const locale = await getLocale()
    const t = await getTranslations("letters")

    let letter
    try {
        letter = await getLetter(id)
    } catch {
        notFound()
    }

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
        <div className="space-y-8">
            <div className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-stone-50">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="font-serif text-3xl text-charcoal mb-2">{letter.title}</h1>
                            <p className="text-stone-500 font-mono text-sm">
                                Written on {formatDate(letter.createdAt, true)}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <div className="px-3 py-1 bg-stone-100 rounded-full text-xs font-medium uppercase tracking-wider text-stone-600">
                                {statusLabel(letter.status)}
                            </div>
                            <Link href={{ pathname: "/letters/[id]/schedule", params: { id } }}>
                                <Button variant="outline" className="rounded-full">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {t("detail.scheduleCta")}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="p-8 md:p-12 bg-[#FDFBF7]">
                    <div
                        className="prose prose-stone max-w-none font-serif leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: sanitizeLetterHtml(letter.bodyHtml) }}
                    />
                </div>
            </div>

            {/* Timeline & Deliveries */}
            {letter.deliveries.length > 0 && (
                <div className="space-y-6">
                    <h3 className="font-serif text-xl text-charcoal">Delivery Status</h3>

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

                    <div className="grid gap-4">
                        {letter.deliveries.map((delivery) => (
                            <div key={delivery.id} className="bg-white p-4 rounded-lg border border-stone-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-stone-50 rounded-full">
                                        <Mail className="w-5 h-5 text-stone-400" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-charcoal">
                                            {channelLabel(delivery.channel)}
                                        </div>
                                        <div className="text-sm text-stone-500 flex items-center gap-2">
                                            {formatDate(delivery.deliverAt, true, true)}
                                            <TimezoneTooltip deliveryDate={delivery.deliverAt} variant="clock" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {delivery.status === 'sent' && (
                                        <Link href={`/unlock/${id}` as any}>
                                            <Button size="sm" variant="outline" className="text-teal-700 border-teal-200 hover:bg-teal-50">
                                                Open Capsule
                                            </Button>
                                        </Link>
                                    )}
                                    <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${delivery.status === 'sent' ? 'bg-teal-50 text-teal-700' :
                                        delivery.status === 'scheduled' ? 'bg-blue-50 text-blue-700' :
                                            'bg-stone-100 text-stone-600'
                                        }`}>
                                        {statusLabel(delivery.status)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Inline Schedule Section */}
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
        </div>
    )
}

export default async function LetterDetailV2Page({ params }: PageProps) {
    const { id } = await params
    const t = await getTranslations("letters")
    const user = await requireUser()

    return (
        <div className="mx-auto max-w-4xl space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/dashboard-v2">
                    <button className="flex items-center gap-2 text-stone-500 hover:text-charcoal transition-colors">
                        <ArrowLeft className="h-4 w-4" />
                        <span>Back to Dashboard</span>
                    </button>
                </Link>
            </div>

            <Suspense fallback={<LetterDetailSkeleton />}>
                <LetterContent id={id} userEmail={user.email} />
            </Suspense>
        </div>
    )
}
