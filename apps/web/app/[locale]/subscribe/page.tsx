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
import { redirect } from "@/i18n/routing"
import { prisma } from "@/server/lib/db"
import { env } from "@/env.mjs"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Info } from "lucide-react"

import { EmailCaptureForm } from "./_components/email-capture-form"
import { SubscribePricingCard } from "./_components/subscribe-pricing-card"

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
  }>
}

export default async function SubscribePage({ searchParams }: SubscribePageProps) {
  const t = await getTranslations("subscribe")
  const params = await searchParams
  const { email, letterId, deliveryDate, deliveryType, timezone, recipientName, recipientType } = params

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

  return (
    <div className="container px-4 py-12 sm:px-6 sm:py-16 md:py-20">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* Hero Section */}
        <div className="space-y-6 text-center">
          <Badge variant="outline" className="text-xs uppercase tracking-wide">
            {t("hero.badge")}
          </Badge>

          <h1 className="font-mono text-4xl font-normal uppercase tracking-wide text-charcoal sm:text-5xl md:text-6xl">
            {t("hero.title")}
          </h1>

          <p className="mx-auto max-w-2xl font-mono text-base leading-relaxed text-gray-secondary sm:text-lg">
            {t("hero.description")}
          </p>
        </div>

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

        {/* Main Content: Email Capture or Pricing */}
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
          // Pricing Cards with Locked Email
          <>
            {/* Email Locked Notice */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>{t("emailLocked.title")}</AlertTitle>
              <AlertDescription>
                {t("emailLocked.description", { email })}{" "}
                <a
                  href={`/subscribe${letterId ? `?letterId=${letterId}` : ""}`}
                  className="underline hover:opacity-70"
                >
                  {t("emailLocked.changeEmail")}
                </a>
              </AlertDescription>
            </Alert>

            {/* Pricing Cards */}
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-6">
              <SubscribePricingCard
                email={email}
                name={t("plans.digital.name")}
                price={9}
                interval="year"
                description={t("plans.digital.description")}
                features={[
                  t("plans.digital.features.emailDeliveries"),
                  t("plans.digital.features.scheduleYears"),
                  t("plans.digital.features.timezoneReminders"),
                  t("plans.digital.features.encryptedStorage"),
                ]}
                priceId={digitalPriceId}
                letterId={letterId}
                metadata={checkoutMetadata}
              />

              <SubscribePricingCard
                email={email}
                name={t("plans.paper.name")}
                price={29}
                interval="year"
                description={t("plans.paper.description")}
                features={[
                  t("plans.paper.features.emailDeliveries"),
                  t("plans.paper.features.physicalLetters"),
                  t("plans.paper.features.addressReminders"),
                  t("plans.paper.features.priorityRouting"),
                ]}
                priceId={paperPriceId}
                letterId={letterId}
                metadata={checkoutMetadata}
                highlighted
                popular
              />
            </div>

            {/* Trust Signals */}
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
