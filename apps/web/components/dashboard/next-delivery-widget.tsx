import { getTranslations } from "next-intl/server"
import { Mail, Clock, ArrowRight } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"
import { getNextDelivery, type NextDelivery } from "@/server/lib/stats"
import { CountdownTimer } from "./countdown-timer"

interface NextDeliveryWidgetProps {
  userId: string
}

export async function NextDeliveryWidget({ userId }: NextDeliveryWidgetProps) {
  const t = await getTranslations("dashboard.nextDelivery")
  const nextDelivery = await getNextDelivery(userId)

  const translations = {
    days: t("days"),
    hours: t("hours"),
    minutes: t("minutes"),
  }

  if (!nextDelivery) {
    return (
      <Card
        className="border-2 border-charcoal bg-bg-lavender-light"
        style={{ borderRadius: "2px" }}
      >
        <CardContent className="flex flex-col items-center py-8 text-center">
          <div
            className="mb-4 flex h-16 w-16 items-center justify-center border-2 border-charcoal bg-off-white"
            style={{ borderRadius: "2px" }}
          >
            <Clock className="h-8 w-8 text-charcoal" />
          </div>
          <h3 className="font-mono text-lg font-bold uppercase tracking-wide text-charcoal">
            {t("empty.title")}
          </h3>
          <p className="mt-2 max-w-xs font-mono text-sm text-gray-secondary">
            {t("empty.description")}
          </p>
          <Link href="/letters/new" className="mt-4">
            <Button
              className="border-2 border-charcoal bg-duck-yellow text-charcoal hover:bg-duck-yellow/80"
              style={{ borderRadius: "2px" }}
            >
              {t("empty.cta")}
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className="border-2 border-charcoal bg-bg-peach-light"
      style={{ borderRadius: "2px" }}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 font-mono text-lg uppercase tracking-wide text-charcoal">
          <Mail className="h-5 w-5" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="truncate font-mono text-sm text-charcoal">
          &ldquo;{nextDelivery.letterTitle}&rdquo;
        </p>

        <CountdownTimer
          targetDate={nextDelivery.deliverAt}
          translations={translations}
        />

        <Link href={`/letters/${nextDelivery.letterId}`} className="block">
          <Button
            variant="outline"
            className="w-full border-2 border-charcoal bg-off-white text-charcoal hover:bg-duck-yellow/20"
            style={{ borderRadius: "2px" }}
          >
            {t("viewLetter")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
