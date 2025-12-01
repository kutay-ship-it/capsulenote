/**
 * Subscribe Page - Anonymous Checkout
 *
 * User flow:
 * 1. If no email in query params → Show email capture form
 * 2. If email provided → Show pricing cards with subscribe buttons
 * 3. Check for incomplete/complete payments and show banners
 * 4. Clicking subscribe → redirects to Stripe Checkout (email locked)
 *
 * Server Component - fetches pricing plans and checks payment status
 */

import * as React from "react"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { redirect } from "next/navigation"
import { prisma } from "@/server/lib/db"
import { env } from "@/env.mjs"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Info } from "lucide-react"

import { EmailCaptureForm } from "./_components/email-capture-form"
import { SubscribePricingWrapper } from "./_components/subscribe-pricing-wrapper"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("subscribe")
  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
    alternates: {
      canonical: "/subscribe",
    },
  }
}

interface SubscribePageProps {
  searchParams: Promise<{
    email?: string
    letterId?: string
    deliveryDate?: string
    deliveryType?: string
    timezone?: string
    recipientName?: string
    recipientType?: string
    view?: "new" | "old"  // Toggle between pricing views
  }>
}

export default async function SubscribePage({ searchParams }: SubscribePageProps) {
  const t = await getTranslations("subscribe")
  const params = await searchParams
  const { email, letterId, deliveryDate, deliveryType, timezone, recipientName, recipientType, view } = params

  // If email already belongs to active subscriber, prompt sign-in instead of paywall
  if (email) {
    const existingUser = await prisma.user.findFirst({
      where: { email },
      include: {
        subscriptions: {
          where: { status: { in: ["active", "trialing"] } },
        },
      },
    })

    if (existingUser && existingUser.subscriptions.length > 0) {
      redirect(`/sign-in?email=${encodeURIComponent(email)}&intent=resume`)
    }
  }

  // Check for pending subscriptions if email provided
  let pendingSubscription: any = null
  if (email) {
    pendingSubscription = await prisma.pendingSubscription.findFirst({
      where: {
        email: email,
        expiresAt: { gt: new Date() }, // Not expired
      },
      orderBy: { createdAt: "desc" },
    })
  }

  // If payment already complete, redirect to signup
  if (pendingSubscription?.status === "payment_complete") {
    redirect(`/sign-up?email=${encodeURIComponent(email!)}`)
  }

  // Pricing configuration (Capsule Note plans)
  const digitalPriceId = env.STRIPE_PRICE_DIGITAL_ANNUAL
  const paperPriceId = env.STRIPE_PRICE_PAPER_ANNUAL

  const checkoutMetadata: Record<string, string> = {}
  if (letterId) checkoutMetadata.letterId = letterId
  if (deliveryDate) checkoutMetadata.deliveryDate = deliveryDate
  if (deliveryType) checkoutMetadata.deliveryType = deliveryType
  if (timezone) checkoutMetadata.timezone = timezone
  if (recipientName) checkoutMetadata.recipientName = recipientName
  if (recipientType) checkoutMetadata.recipientType = recipientType

  // New view uses full-width layout with its own containers
  const useNewView = view !== "old"

  // For new view with email, render full-width layout
  if (useNewView && email) {
    return (
      <div className="min-h-screen bg-cream">
        {/* Payment Status Banner (if applicable) */}
        {pendingSubscription && (
          <div className="container px-4 pt-6 sm:px-6">
            <Alert
              variant={pendingSubscription.status === "awaiting_payment" ? "default" : "destructive"}
            >
              {pendingSubscription.status === "awaiting_payment" ? (
                <>
                  <Info className="h-4 w-4" />
                  <AlertTitle>{t("paymentStatus.incomplete.title")}</AlertTitle>
                  <AlertDescription>
                    {t("paymentStatus.incomplete.description", { plan: pendingSubscription.plan })}
                  </AlertDescription>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{t("paymentStatus.error.title")}</AlertTitle>
                  <AlertDescription>
                    {t("paymentStatus.error.description")}
                  </AlertDescription>
                </>
              )}
            </Alert>
          </div>
        )}

        {/* Full-width pricing layout */}
        <SubscribePricingWrapper
          email={email}
          letterId={letterId}
          metadata={checkoutMetadata}
          digitalPriceId={digitalPriceId}
          paperPriceId={paperPriceId}
          useNewView={true}
        />
      </div>
    )
  }

  // Default/old view or email capture form
  return (
    <div className="container px-4 py-12 sm:px-6 sm:py-16 md:py-20">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* Payment Status Banners */}
        {pendingSubscription && (
          <Alert
            variant={pendingSubscription.status === "awaiting_payment" ? "default" : "destructive"}
          >
            {pendingSubscription.status === "awaiting_payment" ? (
              <>
                <Info className="h-4 w-4" />
                <AlertTitle>{t("paymentStatus.incomplete.title")}</AlertTitle>
                <AlertDescription>
                  {t("paymentStatus.incomplete.description", { plan: pendingSubscription.plan })}
                </AlertDescription>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t("paymentStatus.error.title")}</AlertTitle>
                <AlertDescription>
                  {t("paymentStatus.error.description")}
                </AlertDescription>
              </>
            )}
          </Alert>
        )}

        {/* Main Content: Email Capture or Pricing (old view) */}
        {!email ? (
          // Email Capture Form
          <Card className="mx-auto max-w-md border-4 border-charcoal shadow-lg">
            <CardContent className="space-y-6 p-8">
              <div className="space-y-2 text-center">
                <h2 className="font-mono text-2xl font-normal uppercase tracking-wide text-charcoal">
                  {t("emailCapture.heading")}
                </h2>
                <p className="font-mono text-sm text-gray-secondary">
                  {t("emailCapture.description")}
                  <br />
                  <strong>{t("emailCapture.lockedNotice")}</strong>
                </p>
              </div>

              <EmailCaptureForm letterId={letterId} />
            </CardContent>
          </Card>
        ) : (
          // Old Pricing Cards with Locked Email
          <>
            <SubscribePricingWrapper
              email={email}
              letterId={letterId}
              metadata={checkoutMetadata}
              digitalPriceId={digitalPriceId}
              paperPriceId={paperPriceId}
              useNewView={false}
            />

            {/* Trust Signals - Only for old view */}
            <div className="border-2 border-charcoal bg-off-white p-6 rounded-lg">
              <div className="grid gap-4 sm:grid-cols-3 text-center">
                <div>
                  <p className="font-mono text-sm font-normal uppercase tracking-wide text-charcoal">
                    🔒 {t("trustSignals.security.title")}
                  </p>
                  <p className="font-mono text-xs text-gray-secondary mt-1">
                    {t("trustSignals.security.description")}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-sm font-normal uppercase tracking-wide text-charcoal">
                    💳 {t("trustSignals.payments.title")}
                  </p>
                  <p className="font-mono text-xs text-gray-secondary mt-1">{t("trustSignals.payments.description")}</p>
                </div>
                <div>
                  <p className="font-mono text-sm font-normal uppercase tracking-wide text-charcoal">
                    ❌ {t("trustSignals.cancel.title")}
                  </p>
                  <p className="font-mono text-xs text-gray-secondary mt-1">
                    {t("trustSignals.cancel.description")}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
