import type { Locale } from "@/i18n/routing"
import { auth } from "@clerk/nextjs/server"

import { HeroSection } from "./_components/hero-section"
import { LetterDemo } from "./_components/letter-demo"
import { SocialProofV2 } from "./landing-v2/_components/social-proof-v2"
import { HowItWorksV2 } from "./landing-v2/_components/how-it-works-v2"
import { TrustSection } from "./landing-v2/_components/trust-section"
import { FeaturesV2 } from "./landing-v2/_components/features-v2"
import { CTASection } from "./_components/cta-section"
import { NavbarV3 } from "./_components/navbar-v3"
import { Footer } from "./_components/footer"

export const metadata = {
  title: "Capsule Note - Send Letters to Your Future Self",
  description:
    "Write encrypted letters that arrive when you need them most. Schedule digital or physical mail delivery to your future self.",
}

export default async function MarketingPage({
  params,
}: {
  params: Promise<{ locale: Locale }>
}) {
  const { userId } = await auth()
  const isSignedIn = Boolean(userId)

  return (
    <div className="flex min-h-screen flex-col bg-cream">
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
