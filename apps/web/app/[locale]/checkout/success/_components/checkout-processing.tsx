/**
 * Checkout Processing Component
 *
 * Shown when subscription webhook hasn't processed yet.
 * Implements client-side polling fallback with loading animation.
 *
 * Client Component - uses hooks for polling logic.
 */

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "@/i18n/routing"
import { Loader2 } from "lucide-react"
import { checkSubscriptionStatus } from "@/server/actions/billing"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations } from "next-intl"

interface CheckoutProcessingProps {
  sessionId: string
}

export function CheckoutProcessing({ sessionId }: CheckoutProcessingProps) {
  const router = useRouter()
  const t = useTranslations("checkout.processing")
  const [pollCount, setPollCount] = useState(0)
  const maxPolls = 15 // Poll for up to 30 seconds (15 polls × 2s interval)

  useEffect(() => {
    // Client-side polling fallback
    const pollInterval = setInterval(async () => {
      try {
        const result = await checkSubscriptionStatus()

        if (result.success && result.data.hasSubscription) {
          // Subscription found! Refresh page to show success state
          router.refresh()
          clearInterval(pollInterval)
        } else {
          setPollCount((prev) => {
            const newCount = prev + 1
            if (newCount >= maxPolls) {
              // Stop polling after max attempts
              clearInterval(pollInterval)
            }
            return newCount
          })
        }
      } catch (error) {
        console.error("[Checkout] Polling error:", error)
      }
    }, 2000) // Poll every 2 seconds

    // Cleanup on unmount
    return () => clearInterval(pollInterval)
  }, [router, maxPolls])

  return (
    <div className="container max-w-2xl mx-auto py-16">
      <Card className="border-2">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
          <CardTitle className="text-2xl">{t("title")}</CardTitle>
          <CardDescription className="text-base">
            {pollCount < maxPolls
              ? t("waiting")
              : t("takingLonger")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-center text-sm text-muted-foreground">
            <p>{t("usuallyQuick")}</p>
            {pollCount >= 10 && (
              <div className="space-y-2">
                <p className="font-medium">{t("stillProcessing")}</p>
                <p>{t("safeToNavigate")}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {pollCount >= 10 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            {t("checkStatus")}
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/dashboard"
              className="text-sm text-primary hover:underline"
            >
              {t("goToDashboard")}
            </a>
            <a
              href="/settings/billing"
              className="text-sm text-primary hover:underline"
            >
              {t("viewBilling")}
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
