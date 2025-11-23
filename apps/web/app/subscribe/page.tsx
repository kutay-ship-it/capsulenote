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
import { redirect } from "next/navigation"
import { prisma } from "@/server/lib/db"
import { env } from "@/env.mjs"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, AlertCircle, Info } from "lucide-react"

import { EmailCaptureForm } from "./_components/email-capture-form"
import { SubscribePricingCard } from "./_components/subscribe-pricing-card"

export const metadata: Metadata = {
  title: "Subscribe - Capsule Note",
  description: "Choose your plan and start writing letters to your future self",
}

interface SubscribePageProps {
  searchParams: Promise<{
    email?: string
    letterId?: string
  }>
}

export default async function SubscribePage({ searchParams }: SubscribePageProps) {
  const params = await searchParams
  const { email, letterId } = params

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

  // Pricing configuration (matches marketing page)
  const monthlyPrice = 19
  const annualPrice = 189
  const annualMonthlyEquivalent = Math.round(annualPrice / 12)

  const proMonthlyPriceId = env.STRIPE_PRICE_PRO_MONTHLY
  const proAnnualPriceId = env.STRIPE_PRICE_PRO_ANNUAL

  return (
    <div className="container px-4 py-12 sm:px-6 sm:py-16 md:py-20">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* Hero Section */}
        <div className="space-y-6 text-center">
          <Badge variant="outline" className="text-xs uppercase tracking-wide">
            No Credit Card Required
          </Badge>

          <h1 className="font-mono text-4xl font-normal uppercase tracking-wide text-charcoal sm:text-5xl md:text-6xl">
            Start Writing Today
          </h1>

          <p className="mx-auto max-w-2xl font-mono text-base leading-relaxed text-gray-secondary sm:text-lg">
            Choose your plan and begin your journey of writing to your future self.
            <br />
            Start with a 14-day free trial, no credit card required.
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

              <div className="flex items-center gap-2 pt-4">
                <CheckCircle className="h-4 w-4 flex-shrink-0 text-charcoal" />
                <p className="font-mono text-xs text-gray-secondary">
                  14-day free trial included
                </p>
              </div>
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
            <div className="grid gap-8 lg:grid-cols-3 lg:gap-6">
              {/* Free Tier - Redirects to Sign Up */}
              <Card className="relative flex h-full flex-col">
                <CardContent className="flex flex-1 flex-col p-8 space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-xl uppercase tracking-wider font-mono">Free</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-5xl font-normal tracking-tight">$0</span>
                      <span className="font-mono text-lg text-gray-secondary">/month</span>
                    </div>
                    <p className="text-base leading-relaxed text-gray-secondary font-mono">
                      Perfect for trying out Capsule Note.
                    </p>
                  </div>

                  <ul className="space-y-3 flex-1">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-charcoal" />
                      <span className="font-mono text-sm">3 letters per month</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-charcoal" />
                      <span className="font-mono text-sm">Email delivery only</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 flex-shrink-0 text-charcoal" />
                      <span className="font-mono text-sm">Encrypted storage</span>
                    </li>
                  </ul>

                  <a
                    href={`/sign-up?email=${encodeURIComponent(email)}`}
                    className="w-full inline-block"
                  >
                    <button className="w-full border-2 border-charcoal bg-white px-4 py-3 font-mono text-sm uppercase tracking-wide text-charcoal hover:bg-gray-50 transition-colors">
                      Sign Up Free
                    </button>
                  </a>
                </CardContent>
              </Card>

              {/* Pro Monthly */}
              <SubscribePricingCard
                email={email}
                name="Pro Monthly"
                price={monthlyPrice}
                interval="month"
                description="For serious letter writers who want unlimited letters."
                features={[
                  "Unlimited letters",
                  "Email + Physical mail delivery",
                  "2 free physical mails/month",
                  "Advanced scheduling",
                  "Premium templates",
                  "Priority support",
                  "14-day free trial",
                ]}
                priceId={proMonthlyPriceId}
                letterId={letterId}
                highlighted
                popular
              />

              {/* Pro Annual */}
              <SubscribePricingCard
                email={email}
                name="Pro Annual"
                price={annualMonthlyEquivalent}
                interval="month"
                description="Best value - billed annually at $189/year."
                features={[
                  "All Pro features",
                  "Save 17% vs monthly",
                  "Billed annually at $189",
                  "Same 14-day free trial",
                ]}
                priceId={proAnnualPriceId}
                letterId={letterId}
                badge="Save 17%"
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
