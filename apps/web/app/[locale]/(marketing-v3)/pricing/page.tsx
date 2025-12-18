import { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { Footer } from "../_components/footer"
import { NavbarV3 } from "../_components/navbar-v3"
import { PricingHeroV3 } from "./_components/pricing-hero-v3"
import { PricingTiersV3 } from "./_components/pricing-tiers-v3"
import { FeatureMatrixV3 } from "./_components/feature-matrix-v3"
import { PricingFAQV3 } from "./_components/pricing-faq-v3"
import { PricingCTAV3 } from "./_components/pricing-cta-v3"
import { TrustSignalsV3 } from "./_components/trust-signals-v3"
import { FAQSchema } from "@/components/seo/json-ld"
import type { AppHref } from "@/i18n/routing"

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://capsulenote.com").replace(/\/$/, "")

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "pricing" })

  // Canonical: default locale (en) has no prefix, others have locale prefix
  const canonicalPath = locale === "en" ? "/pricing" : `/${locale}/pricing`

  return {
    title: t("metadata.title"),
    description: t("metadata.description"),
    openGraph: {
      title: t("metadata.title"),
      description: t("metadata.description"),
      type: "website",
      url: `${appUrl}${canonicalPath}`,
    },
    alternates: {
      canonical: `${appUrl}${canonicalPath}`,
      languages: {
        en: `${appUrl}/pricing`,
        tr: `${appUrl}/tr/pricing`,
        "x-default": `${appUrl}/pricing`,
      },
    },
  }
}

export default async function PricingPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations({ locale, namespace: "pricing" })

  // Get tiers from translations
  const tiers = t.raw("tiers") as Array<{
    name: string
    description: string
    features: string[]
    cta: string
    ctaHref: AppHref
    variant: "default" | "popular" | "enterprise"
  }>

  // Get feature matrix categories from translations
  const matrixCategories = t.raw("matrix.categories") as Array<{
    name: string
    features: Array<{
      name: string
      digital: boolean | string
      paper: boolean | string
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
    <>
      <FAQSchema items={faqItems} />
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
                tiers={[
                  { name: "digital", label: t("matrix.headers.digital") },
                  { name: "paper", label: t("matrix.headers.paper"), isHighlighted: true },
                ]}
                headers={{
                  feature: t("matrix.headers.feature"),
                  digital: t("matrix.headers.digital"),
                  paper: t("matrix.headers.paper"),
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
              primaryCtaHref="/sign-up"
              secondaryCta={t("cta.secondary")}
              secondaryCtaHref="/demo-letter"
              contactText={t("cta.questions")}
              contactLinkText={t("cta.contact")}
            />
          </section>
        </main>

        <Footer />
      </div>
    </>
  )
}
