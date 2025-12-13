import type { Metadata } from "next"
import type { Locale } from "@/i18n/routing"
import { auth } from "@clerk/nextjs/server"
import { headers } from "next/headers"
import { getTranslations } from "next-intl/server"

import { HeroSection } from "./_components/hero-section"
import { LetterDemo } from "./_components/letter-demo"
import { SocialProofV2 } from "./landing-v2/_components/social-proof-v2"
import { HowItWorksV2 } from "./landing-v2/_components/how-it-works-v2"
import { TrustSection } from "./landing-v2/_components/trust-section"
import { FeaturesV2 } from "./landing-v2/_components/features-v2"
import { CTASection } from "./_components/cta-section"
import { NavbarV3 } from "./_components/navbar-v3"
import { Footer } from "./_components/footer"
import { LocaleDetector } from "@/components/locale"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "metadata" })

  return {
    title: t("title.default"),
    description: t("description"),
    openGraph: {
      title: t("openGraph.title"),
      description: t("openGraph.description"),
      type: "website",
    },
  }
}

export default async function MarketingPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { userId } = await auth()
  const isSignedIn = Boolean(userId)

  // Get server-detected country from Vercel's geo headers
  const headersList = await headers()
  const serverCountry = headersList.get("x-vercel-ip-country") || undefined

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      {/* Locale detection banner for first-time Turkish visitors */}
      <LocaleDetector serverCountry={serverCountry} />

      <NavbarV3 isSignedIn={isSignedIn} />
      <main className="flex-1">
        <HeroSection isSignedIn={isSignedIn} />
        <LetterDemo isSignedIn={isSignedIn} />
        <SocialProofV2 />
        <div id="how-it-works">
          <HowItWorksV2 />
        </div>
        <TrustSection />
        <div id="features">
          <FeaturesV2 />
        </div>
        <CTASection isSignedIn={isSignedIn} />
      </main>
      <Footer />
    </div>
  )
}
