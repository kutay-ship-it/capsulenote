import { Metadata } from "next"
import { auth } from "@clerk/nextjs/server"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { NavbarV3 } from "../_components/navbar-v3"
import { Footer } from "../_components/footer"
import { PricingHeroV3 } from "./_components/pricing-hero-v3"
import { PricingTiersV3 } from "./_components/pricing-tiers-v3"
import { FeatureMatrixV3 } from "./_components/feature-matrix-v3"
import { PricingFAQV3 } from "./_components/pricing-faq-v3"
import { PricingCTAV3 } from "./_components/pricing-cta-v3"
import { TrustSignalsV3 } from "./_components/trust-signals-v3"

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "pricing" })

  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
    openGraph: {
      title: t("metadata.title"),
      description: t("metadata.description"),
      type: "website",
    },
  }
}

export default async function PricingPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const { userId } = await auth()
  const t = await getTranslations("pricing")

  // Get tiers from translations
  const tiers = t.raw("tiers") as Array<{
    name: string
    monthlyPrice: number | string
    yearlyPrice: number | string
    interval: string
    description: string
    features: string[]
    cta: string
    ctaHref: string
    variant: "default" | "popular" | "enterprise"
  }>

  // Get feature matrix categories from translations
  const matrixCategories = t.raw("matrix.categories") as Array<{
    name: string
    features: Array<{
      name: string
      free: boolean | string
      pro: boolean | string
      enterprise: boolean | string
      tooltip?: string
    }>
  }>

  // Get FAQ items from translations
  const faqItems = t.raw("faq.items") as Array<{
    question: string
    answer: string
  }>

  // Get CTA badges from translations
  const ctaBadges = t.raw("cta.badges") as string[]

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <NavbarV3 />

      <main className="flex-1">
        {/* Hero Section */}
        <PricingHeroV3 />

        {/* Pricing Tiers */}
        <section className="container px-4 pb-16 sm:px-6 sm:pb-20 md:pb-24">
          <PricingTiersV3
            tiers={tiers}
            popularBadgeText={t("popularBadge")}
            toggleLabels={{
              monthly: t("toggle.monthly"),
              yearly: t("toggle.yearly"),
              savings: t("toggle.savings"),
            }}
          />
        </section>

        {/* Trust Signals */}
        <TrustSignalsV3 />

        {/* Feature Comparison Matrix */}
        <section className="container px-4 py-16 sm:px-6 sm:py-20 md:py-24">
          <div className="space-y-10">
            {/* Section Header */}
            <div className="text-center space-y-4">
              <h2 className="font-mono text-2xl md:text-3xl tracking-wide text-charcoal">
                {t("matrix.title")}
              </h2>
              <p className="font-mono text-sm md:text-base text-charcoal/70 max-w-xl mx-auto">
                {t("matrix.subtitle")}
              </p>
            </div>

            {/* Matrix */}
            <FeatureMatrixV3
              categories={matrixCategories}
              headers={{
                feature: t("matrix.headers.feature"),
                free: t("matrix.headers.free"),
                pro: t("matrix.headers.pro"),
                enterprise: t("matrix.headers.enterprise"),
              }}
              mobileNote={t("matrix.mobileNote")}
            />
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container px-4 py-16 sm:px-6 sm:py-20 md:py-24 bg-off-white border-y-2 border-charcoal">
          <PricingFAQV3
            items={faqItems}
            title={t("faq.title")}
            subtitle={t("faq.subtitle")}
            contactText={t("faq.contact.text")}
            contactLinkText={t("faq.contact.link")}
          />
        </section>

        {/* Final CTA */}
        <section className="container px-4 py-16 sm:px-6 sm:py-20 md:py-24">
          <PricingCTAV3
            title={t("cta.title")}
            description={t("cta.description")}
            badges={ctaBadges}
            primaryCta={t("cta.primary")}
            primaryCtaHref={userId ? "/dashboard" : "/sign-up"}
            secondaryCta={t("cta.secondary")}
            secondaryCtaHref="/demo"
            contactText={t("cta.questions")}
            contactLinkText={t("cta.contact")}
          />
        </section>
      </main>

      <Footer />
    </div>
  )
}
