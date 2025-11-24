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
import { redirect } from "@/i18n/routing"
import { prisma } from "@/server/lib/db"
import { env } from "@/env.mjs"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Info } from "lucide-react"

import { EmailCaptureForm } from "./_components/email-capture-form"
import { SubscribePricingCard } from "./_components/subscribe-pricing-card"

export const metadata: Metadata = {
  title: "Subscribe - Capsule Note",
  description: "Choose your plan and start writing letters to your future self",
  alternates: {
    canonical: "/subscribe",
  },
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
            Yearly Plans
          </Badge>

          <h1 className="font-mono text-4xl font-normal uppercase tracking-wide text-charcoal sm:text-5xl md:text-6xl">
            Choose Your Capsule
          </h1>

          <p className="mx-auto max-w-2xl font-mono text-base leading-relaxed text-gray-secondary sm:text-lg">
            Two simple yearly plans. No free tier, no ads—just dependable deliveries to your future self (and others).
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
                <AlertTitle>Incomplete Payment</AlertTitle>
                <AlertDescription>
                  You have an incomplete payment for {pendingSubscription.plan} plan. You can resume
                  your checkout by selecting a plan below.
                </AlertDescription>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  There was an issue with your subscription. Please contact support if this
                  persists.
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
                  Enter Your Email
                </h2>
                <p className="font-mono text-sm text-gray-secondary">
                  This email will be used for payment and account creation.
                  <br />
                  <strong>It cannot be changed after payment</strong> (locked for security).
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
              <AlertTitle>Email Locked</AlertTitle>
              <AlertDescription>
                Your email <strong>{email}</strong> will be used for payment and account creation.
                This cannot be changed after payment for security reasons.{" "}
                <a
                  href={`/subscribe${letterId ? `?letterId=${letterId}` : ""}`}
                  className="underline hover:opacity-70"
                >
                  Change email
                </a>
              </AlertDescription>
            </Alert>

            {/* Pricing Cards */}
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-6">
              <SubscribePricingCard
                email={email}
                name="Digital Capsule"
                price={9}
                interval="year"
                description="For personal letters to yourself—purely digital delivery."
                features={[
                  "6 email deliveries / year",
                  "Schedule up to 100 years out",
                  "Timezone-aware reminders",
                  "Encrypted storage",
                ]}
                priceId={digitalPriceId}
                letterId={letterId}
                metadata={checkoutMetadata}
              />

              <SubscribePricingCard
                email={email}
                name="Paper & Pixels"
                price={29}
                interval="year"
                description="For gifting and tangible keepsakes—email plus premium mail."
                features={[
                  "24 email deliveries / year",
                  "3 physical letters / year",
                  "Address confirmation reminders",
                  "Priority delivery routing",
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
                    🔒 Bank-Level Security
                  </p>
                  <p className="font-mono text-xs text-gray-secondary mt-1">
                    AES-256 encryption
                  </p>
                </div>
                <div>
                  <p className="font-mono text-sm font-normal uppercase tracking-wide text-charcoal">
                    💳 Secure Payments
                  </p>
                  <p className="font-mono text-xs text-gray-secondary mt-1">Powered by Stripe</p>
                </div>
                <div>
                  <p className="font-mono text-sm font-normal uppercase tracking-wide text-charcoal">
                    ❌ Cancel Anytime
                  </p>
                  <p className="font-mono text-xs text-gray-secondary mt-1">
                    No long-term contracts
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
