import * as React from "react"
import { Shield, CreditCard, Lock, Zap } from "lucide-react"
import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Separator } from "@/components/ui/separator"
import { Link } from "@/i18n/routing"
import { env } from "@/env.mjs"

import { PricingTiers } from "./_components/pricing-tiers"
import { FeatureMatrix } from "./_components/feature-matrix"
import { PricingFAQ } from "./_components/pricing-faq"

import type { Locale } from "@/i18n/routing"
import type { FeatureCategory } from "./_components/feature-matrix"

export async function generateMetadata({ params: { locale } }: { params: { locale: Locale } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "pricing.metadata" })
  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
    },
  }
}

export default async function PricingPage({ params: { locale } }: { params: { locale: Locale } }) {
  const t = await getTranslations({ locale, namespace: "pricing" })

  const tiers = (t.raw("tiers") as any[]).map((tier) => {
    const priceIdKey = tier.priceKey as keyof typeof env
    return {
      ...tier,
      priceId: env[priceIdKey],
    }
  })

  const trustSignals = t.raw("trust") as Array<{ title: string; description: string }>
  const matrix = t.raw("matrix") as {
    headers: { feature: string; free: string; pro: string; enterprise: string }
    categories: FeatureCategory[]
    mobileNote: string
  }
  const matrixTitle = t("matrixTitle")
  const matrixSubtitle = t("matrixSubtitle")
  const faq = t.raw("faq") as {
    title: string
    subtitle: string
    contact: { text: string; link: string }
    items: Array<{ question: string; answer: string }>
  }
  const cta = t.raw("cta") as {
    title: string
    description: string
    badges: string[]
    primary: string
    secondary: string
    questions: string
    contact: string
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container px-4 py-16 sm:px-6 sm:py-20 md:py-24">
          <div className="mx-auto max-w-4xl space-y-6 text-center">
            {/* Badge */}
            <Badge variant="outline" className="text-xs uppercase tracking-wide">
              {t("hero.badge")}
            </Badge>

            {/* Title */}
            <h1 className="font-mono text-4xl font-normal uppercase tracking-wide text-charcoal sm:text-5xl md:text-6xl">
              {t("hero.title")}
            </h1>

            {/* Subtitle */}
            <p className="mx-auto max-w-2xl font-mono text-base leading-relaxed text-gray-secondary sm:text-lg md:text-xl">
              {t("hero.subtitle")}
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
                  {t("hero.socialProof")}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Interval Toggle Section (Future Enhancement) */}
        {/* This section will be added in Phase 1B when we implement the toggle */}

        {/* Pricing Tiers */}
        <section className="container px-4 pb-16 sm:px-6 sm:pb-20 md:pb-24">
          <PricingTiers tiers={tiers} />
        </section>

        {/* Trust Signals Bar */}
        <section className="border-y-2 border-charcoal bg-off-white py-8">
          <div className="container px-4 sm:px-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[Zap, Lock, CreditCard, Shield].map((Icon, idx) => {
                const signal = trustSignals[idx]
                return (
                  <div key={signal.title} className="flex items-center gap-3">
                    <Icon className="h-6 w-6 flex-shrink-0 text-charcoal" strokeWidth={2} />
                    <div>
                      <p className="font-mono text-sm font-normal uppercase tracking-wide text-charcoal">
                        {signal.title}
                      </p>
                      <p className="font-mono text-xs text-gray-secondary">
                        {signal.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Feature Comparison Matrix */}
        <section className="container px-4 py-16 sm:px-6 sm:py-20 md:py-24">
          <div className="space-y-8">
            {/* Section Header */}
            <div className="text-center space-y-3">
              <h2 className="font-mono text-3xl uppercase tracking-wide text-charcoal md:text-4xl">
                {matrixTitle}
              </h2>
              <p className="font-mono text-base text-gray-secondary">
                {matrixSubtitle}
              </p>
            </div>

            {/* Matrix */}
            <FeatureMatrix categories={matrix.categories} headers={matrix.headers} mobileNote={matrix.mobileNote} />
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container px-4 py-16 sm:px-6 sm:py-20 md:py-24">
          <PricingFAQ
            items={faq.items}
            title={faq.title}
            subtitle={faq.subtitle}
            contactText={faq.contact.text}
            contactLinkText={faq.contact.link}
          />
        </section>

        {/* Risk Reversal CTA */}
        <section className="container px-4 pb-16 sm:px-6 sm:pb-20 md:pb-24">
          <Card className="mx-auto max-w-3xl border-4 border-charcoal bg-duck-blue shadow-lg">
            <CardContent className="space-y-6 p-8 text-center sm:p-10">
              <h2 className="font-mono text-2xl font-normal uppercase tracking-wide text-charcoal sm:text-3xl">
                {cta.title}
              </h2>
              <p className="mx-auto max-w-xl font-mono text-base leading-relaxed text-charcoal">
                {cta.description}
              </p>

              {/* Risk Reversal Points */}
              <div className="flex flex-wrap justify-center gap-3 text-sm">
                {cta.badges.map((badge) => (
                  <Badge key={badge} variant="secondary">
                    {badge}
                  </Badge>
                ))}
              </div>

              <Separator className="my-6" />

              {/* CTA Buttons */}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link href="/sign-up?plan=pro" className="w-full sm:w-auto">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    {cta.primary}
                  </Button>
                </Link>
                <Link href="/sign-up" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    {cta.secondary}
                  </Button>
                </Link>
              </div>

              <p className="font-mono text-xs text-gray-secondary">
                {cta.questions}{" "}
                <a
                  href="mailto:support@capsulenote.com"
                  className="underline hover:opacity-70 transition-opacity"
                >
                  {cta.contact}
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
