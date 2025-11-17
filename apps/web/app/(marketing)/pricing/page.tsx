import * as React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { Shield, CreditCard, Lock, Zap } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Navbar } from "@/components/navbar"

import { PricingTiers } from "./_components/pricing-tiers"
import { FeatureMatrix } from "./_components/feature-matrix"
import { PricingFAQ } from "./_components/pricing-faq"

export const metadata: Metadata = {
  title: "Pricing - Capsule Note",
  description:
    "Choose the perfect plan for your letter writing journey. Start free, upgrade when ready. Transparent pricing with no hidden fees.",
  openGraph: {
    title: "Pricing - Capsule Note",
    description:
      "Choose the perfect plan for your letter writing journey. Start free, upgrade when ready.",
    type: "website",
  },
}

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container px-4 py-16 sm:px-6 sm:py-20 md:py-24">
          <div className="mx-auto max-w-4xl space-y-6 text-center">
            {/* Badge */}
            <Badge variant="outline" className="text-xs uppercase tracking-wide">
              Transparent Pricing
            </Badge>

            {/* Title */}
            <h1 className="font-mono text-4xl font-normal uppercase tracking-wide text-charcoal sm:text-5xl md:text-6xl">
              Choose Your Plan
            </h1>

            {/* Subtitle */}
            <p className="mx-auto max-w-2xl font-mono text-base leading-relaxed text-gray-secondary sm:text-lg md:text-xl">
              Start writing to your future self today. All plans include encrypted storage and
              reliable delivery. No credit card required to start.
            </p>

            {/* Social Proof */}
            <div className="flex flex-col items-center gap-4 pt-4 sm:flex-row sm:justify-center">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-8 w-8 rounded-full border-2 border-charcoal bg-duck-blue"
                    />
                  ))}
                </div>
                <span className="font-mono text-sm text-charcoal">
                  Join 1,000+ letter writers
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Interval Toggle Section (Future Enhancement) */}
        {/* This section will be added in Phase 1B when we implement the toggle */}

        {/* Pricing Tiers */}
        <section className="container px-4 pb-16 sm:px-6 sm:pb-20 md:pb-24">
          <PricingTiers interval="month" />
        </section>

        {/* Trust Signals Bar */}
        <section className="border-y-2 border-charcoal bg-off-white py-8">
          <div className="container px-4 sm:px-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* 14-day trial */}
              <div className="flex items-center gap-3">
                <Zap className="h-6 w-6 flex-shrink-0 text-charcoal" strokeWidth={2} />
                <div>
                  <p className="font-mono text-sm font-normal uppercase tracking-wide text-charcoal">
                    14-Day Free Trial
                  </p>
                  <p className="font-mono text-xs text-gray-secondary">
                    No credit card required
                  </p>
                </div>
              </div>

              {/* Secure */}
              <div className="flex items-center gap-3">
                <Lock className="h-6 w-6 flex-shrink-0 text-charcoal" strokeWidth={2} />
                <div>
                  <p className="font-mono text-sm font-normal uppercase tracking-wide text-charcoal">
                    Bank-Level Security
                  </p>
                  <p className="font-mono text-xs text-gray-secondary">
                    AES-256 encryption
                  </p>
                </div>
              </div>

              {/* Stripe */}
              <div className="flex items-center gap-3">
                <CreditCard className="h-6 w-6 flex-shrink-0 text-charcoal" strokeWidth={2} />
                <div>
                  <p className="font-mono text-sm font-normal uppercase tracking-wide text-charcoal">
                    Secure Payments
                  </p>
                  <p className="font-mono text-xs text-gray-secondary">
                    Powered by Stripe
                  </p>
                </div>
              </div>

              {/* Cancel anytime */}
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 flex-shrink-0 text-charcoal" strokeWidth={2} />
                <div>
                  <p className="font-mono text-sm font-normal uppercase tracking-wide text-charcoal">
                    Cancel Anytime
                  </p>
                  <p className="font-mono text-xs text-gray-secondary">
                    No long-term contracts
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Comparison Matrix */}
        <section className="container px-4 py-16 sm:px-6 sm:py-20 md:py-24">
          <div className="space-y-8">
            {/* Section Header */}
            <div className="text-center space-y-3">
              <h2 className="font-mono text-3xl uppercase tracking-wide text-charcoal md:text-4xl">
                Compare Plans
              </h2>
              <p className="font-mono text-base text-gray-secondary">
                See exactly what's included in each plan
              </p>
            </div>

            {/* Matrix */}
            <FeatureMatrix />
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container px-4 py-16 sm:px-6 sm:py-20 md:py-24">
          <PricingFAQ />
        </section>

        {/* Risk Reversal CTA */}
        <section className="container px-4 pb-16 sm:px-6 sm:pb-20 md:pb-24">
          <Card className="mx-auto max-w-3xl border-4 border-charcoal bg-duck-blue shadow-lg">
            <CardContent className="space-y-6 p-8 text-center sm:p-10">
              <h2 className="font-mono text-2xl font-normal uppercase tracking-wide text-charcoal sm:text-3xl">
                Start Your Free Trial Today
              </h2>
              <p className="mx-auto max-w-xl font-mono text-base leading-relaxed text-charcoal">
                Join thousands of people writing meaningful letters to their future selves. Start
                with 14 days free, cancel anytime.
              </p>

              {/* Risk Reversal Points */}
              <div className="flex flex-wrap justify-center gap-3 text-sm">
                <Badge variant="secondary">No credit card required</Badge>
                <Badge variant="secondary">14-day free trial</Badge>
                <Badge variant="secondary">Cancel anytime</Badge>
                <Badge variant="secondary">30-day money-back guarantee</Badge>
              </div>

              <Separator className="my-6" />

              {/* CTA Buttons */}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link href="/sign-up?plan=pro" className="w-full sm:w-auto">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="/sign-up" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Start Free Forever
                  </Button>
                </Link>
              </div>

              <p className="font-mono text-xs text-gray-secondary">
                Questions?{" "}
                <a
                  href="mailto:support@capsulenote.com"
                  className="underline hover:opacity-70 transition-opacity"
                >
                  Contact our support team
                </a>
              </p>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-charcoal bg-off-white py-6 sm:py-8">
        <div className="container px-4 flex flex-col items-center gap-3 text-center font-mono text-xs text-gray-secondary sm:gap-4 sm:text-sm md:flex-row md:justify-between md:text-left">
          <p className="max-w-md sm:max-w-none">
            © {new Date().getFullYear()} Capsule Note™ Time-Capsule Letters. Built with intention
            and privacy in mind.
          </p>
          <div className="flex gap-4 sm:gap-6">
            <Link
              href="/privacy"
              className="uppercase tracking-wide hover:opacity-70 transition-opacity"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="uppercase tracking-wide hover:opacity-70 transition-opacity"
            >
              Terms
            </Link>
            <Link
              href="/"
              className="uppercase tracking-wide hover:opacity-70 transition-opacity"
            >
              Home
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
