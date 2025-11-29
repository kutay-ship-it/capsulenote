/**
 * Checkout Processing Component - Hybrid Optimistic Approach
 *
 * Shows success UI immediately (trusting Stripe's redirect) while
 * verifying subscription in background. Only shows error if all
 * verification attempts fail.
 *
 * UX: User sees success instantly → Background verification → Error only if truly failed
 *
 * Client Component - uses hooks for polling logic.
 */

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "@/i18n/routing"
import { Link } from "@/i18n/routing"
import { CheckCircle2, Loader2, AlertCircle, Sparkles } from "lucide-react"
import { checkSubscriptionStatus } from "@/server/actions/billing"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"

interface CheckoutProcessingProps {
  sessionId: string
}

type VerificationState = "verifying" | "verified" | "failed"

export function CheckoutProcessing({ sessionId }: CheckoutProcessingProps) {
  const router = useRouter()
  const t = useTranslations("checkout")
  const [verificationState, setVerificationState] = useState<VerificationState>("verifying")
  const [pollCount, setPollCount] = useState(0)
  const maxPolls = 15 // Poll for up to 30 seconds (15 polls × 2s interval)

  useEffect(() => {
    // Background verification - user doesn't see spinner
    const pollInterval = setInterval(async () => {
      try {
        const result = await checkSubscriptionStatus()

        if (result.success && result.data.hasSubscription) {
          // Subscription confirmed!
          setVerificationState("verified")
          clearInterval(pollInterval)
          // Refresh to show full success page with subscription details
          router.refresh()
        } else {
          setPollCount((prev) => {
            const newCount = prev + 1
            if (newCount >= maxPolls) {
              // All retries exhausted - show error state
              setVerificationState("failed")
              clearInterval(pollInterval)
            }
            return newCount
          })
        }
      } catch (error) {
        console.error("[Checkout] Polling error:", error)
      }
    }, 2000)

    return () => clearInterval(pollInterval)
  }, [router, maxPolls])

  // Error state - only shown if ALL verification attempts fail
  if (verificationState === "failed") {
    return (
      <div className="container max-w-2xl mx-auto py-16">
        <Card className="border-2 border-coral/50">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-coral/10 mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-coral" />
            </div>
            <CardTitle className="text-2xl">{t("processing.verificationFailed")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-muted-foreground">
              {t("processing.verificationFailedDescription")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="/journey">{t("processing.goToDashboard")}</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/settings/billing">{t("processing.viewBilling")}</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("processing.contactSupport")}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Optimistic success UI - shown immediately
  return (
    <div className="container max-w-3xl mx-auto py-16">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-3xl font-bold mb-2">{t("success.title")}</h1>
        <p className="text-lg text-muted-foreground">
          {t("success.subtitle")}
        </p>
      </div>

      {/* Subscription Card */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{t("success.subscriptionDetails")}</CardTitle>
            {/* Subtle verification indicator */}
            {verificationState === "verifying" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Verifying...</span>
              </div>
            )}
            {verificationState === "verified" && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="h-3 w-3" />
                <span>Confirmed</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Plan Info */}
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold mb-1">{t("success.planName")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("success.planDescription")}
              </p>
            </div>
          </div>

          {/* Features Summary */}
          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-3">{t("success.features.title")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{t("success.features.unlimited")}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{t("success.features.emailDelivery")}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{t("success.features.mailCredits")}</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{t("success.features.support")}</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild size="lg" className="flex-1 sm:flex-initial">
          <Link href="/journey">{t("success.buttons.dashboard")}</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="flex-1 sm:flex-initial">
          <Link href="/letters/new">{t("success.buttons.writeLetter")}</Link>
        </Button>
      </div>

      {/* Additional Info */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p className="mb-2">
          {t("success.confirmEmail")}
        </p>
        <p>
          {t.rich("success.manageSubscription", {
            link: (chunks) => (
              <Link href="/settings/billing" className="text-primary hover:underline">
                {t("success.billingSettings")}
              </Link>
            ),
          })}
        </p>
      </div>
    </div>
  )
}
