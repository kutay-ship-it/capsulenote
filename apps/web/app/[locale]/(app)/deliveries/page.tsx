import { Suspense } from "react"
import { getDeliveries } from "@/server/actions/deliveries"
import { getLocale, getTranslations } from "next-intl/server"
import { Card, CardContent } from "@/components/ui/card"
import { DeliveriesListClient } from "@/components/deliveries-list-client"
import { DeliveryCardSkeleton } from "@/components/skeletons"
import { Mail } from "lucide-react"

// Force dynamic rendering - deliveries list must always show fresh data
export const revalidate = 0

// Skeleton for deliveries list
function DeliveriesListSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {[...Array(4)].map((_, i) => (
        <DeliveryCardSkeleton key={i} />
      ))}
    </div>
  )
}

// Async component for deliveries list
async function DeliveriesList() {
  const [deliveries, locale, t] = await Promise.all([
    getDeliveries(),
    getLocale(),
    getTranslations("deliveries"),
  ])

  if (deliveries.length === 0) {
    return (
      <Card
        className="border-2 border-charcoal shadow-md"
        style={{ borderRadius: "2px" }}
      >
        <CardContent className="flex flex-col items-center justify-center py-16 text-center sm:py-20">
          <div
            className="mb-6 flex h-20 w-20 items-center justify-center border-2 border-charcoal bg-duck-blue"
            style={{ borderRadius: "2px" }}
          >
            <Mail className="h-10 w-10 text-charcoal" strokeWidth={2} />
          </div>
          <h3 className="mb-2 font-mono text-xl font-normal uppercase tracking-wide text-charcoal sm:text-2xl">
            {t("empty.title")}
          </h3>
          <p className="max-w-md font-mono text-sm text-gray-secondary sm:text-base">
            {t("empty.description")}
          </p>
        </CardContent>
      </Card>
    )
  }

  return <DeliveriesListClient deliveries={deliveries} locale={locale} />
}

export default async function DeliveriesPage() {
  const t = await getTranslations("deliveries")

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Page Header - Instant (no data dependency) */}
      <div className="space-y-2">
        <h1 className="font-mono text-3xl font-normal uppercase tracking-wide text-charcoal sm:text-4xl md:text-5xl">
          {t("heading")}
        </h1>
        <p className="font-mono text-sm text-gray-secondary sm:text-base">
          {t("subtitle")}
        </p>
      </div>

      {/* Deliveries List - Streams independently */}
      <Suspense fallback={<DeliveriesListSkeleton />}>
        <DeliveriesList />
      </Suspense>
    </div>
  )
}
