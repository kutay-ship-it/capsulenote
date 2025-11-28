import type { Locale } from "@/i18n/routing"
import { auth } from "@clerk/nextjs/server"

import { HeroSection } from "./_components/hero-section"
import { FeaturesSection } from "./_components/features-section"
import { HowItWorksSection } from "./_components/how-it-works-section"
import { LetterDemo } from "./_components/letter-demo"
import { TestimonialsSection } from "./_components/testimonials-section"
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
        <div id="features">
          <FeaturesSection />
        </div>
        <div id="how-it-works">
          <HowItWorksSection />
        </div>
        <LetterDemo isSignedIn={isSignedIn} />
        <TestimonialsSection />
        <CTASection isSignedIn={isSignedIn} />
      </main>
      <Footer />
    </div>
  )
}
