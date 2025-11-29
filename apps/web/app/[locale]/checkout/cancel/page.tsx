/**
 * Checkout Cancel Page
 *
 * Shown when user cancels checkout or navigates back from Stripe.
 * Provides reassurance and clear paths forward.
 *
 * Server Component - no client-side logic needed.
 */

import { Link } from "@/i18n/routing"
import { XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("checkout")
  return {
    title: t("metadata.cancelTitle"),
    description: t("metadata.cancelDescription"),
    alternates: {
      canonical: "/checkout/cancel",
    },
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function CheckoutCancelPage() {
  const t = await getTranslations("checkout")

  return (
    <div className="container max-w-2xl mx-auto py-16">
      <Card className="border-2">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/20">
              <XCircle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <CardTitle className="text-2xl">{t("cancel.title")}</CardTitle>
          <CardDescription className="text-base">
            {t("cancel.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("cancel.freePlanInfo")}
            </p>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• {t("cancel.features.unlimited")}</li>
              <li>• {t("cancel.features.mail")}</li>
              <li>• {t("cancel.features.support")}</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild variant="outline" size="lg" className="flex-1">
              <Link href="/journey">{t("cancel.buttons.dashboard")}</Link>
            </Button>
            <Button asChild size="lg" className="flex-1">
              <Link href="/pricing">{t("cancel.buttons.pricing")}</Link>
            </Button>
          </div>

          <div className="text-center pt-4">
            <p className="text-xs text-muted-foreground">
              {t.rich("cancel.support", {
                link: (chunks) => (
                  <Link href="/support" className="text-primary hover:underline">
                    {t("cancel.contactSupport")}
                  </Link>
                ),
              })}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
