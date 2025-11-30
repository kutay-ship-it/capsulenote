import { auth } from "@clerk/nextjs/server"

// Reuse existing NavbarV3 (it's already good)
import { NavbarV3 } from "../_components/navbar-v3"
// Reuse existing LetterDemo (functional, just positioned earlier)
import { LetterDemo } from "../_components/letter-demo"

// New V2 components
import { HeroV2 } from "./_components/hero-v2"
import { SocialProofV2 } from "./_components/social-proof-v2"
import { HowItWorksV2 } from "./_components/how-it-works-v2"
import { TrustSection } from "./_components/trust-section"
import { FeaturesV2 } from "./_components/features-v2"
import { PricingPreview } from "./_components/pricing-preview"
import { FAQSection } from "./_components/faq-section"
import { CTAV2 } from "./_components/cta-v2"
import { FooterV2 } from "./_components/footer-v2"

export const metadata = {
  title: "Capsule Note - Write Letters to Your Future Self",
  description:
    "Send letters through time. Write to your future self and receive them in 1 year, 5 years, or 25 years. Email or physical mail delivery with military-grade encryption.",
  openGraph: {
    title: "Capsule Note - Write Letters to Your Future Self",
    description:
      "Send letters through time. Write to your future self and receive them when you need them most.",
    type: "website",
  },
}

export default async function LandingPageV2() {
  const { userId } = await auth()
  const isSignedIn = !!userId

  return (
    <main className="min-h-screen">
      {/* Navbar - reusing existing V3 component */}
      <NavbarV3 isSignedIn={isSignedIn} />

      {/*
        OPTIMIZED SECTION ORDER (based on conversion audit):
        1. Hero with integrated stats (social proof above fold)
        2. Demo (try immediately - product-led)
        3. Social Proof (credibility after trying)
        4. How It Works (simplified 3-step)
        5. Trust/Security (address privacy objection)
        6. Features (condensed, prioritized)
        7. Pricing Preview (reduce friction)
        8. FAQ (handle objections)
        9. Final CTA (single focused action)
        10. Footer (fixed links)
      */}

      {/* 1. Hero with Stats Bar */}
      <HeroV2 isSignedIn={isSignedIn} />

      {/* 2. Demo - Try It Now (moved up from position 4) */}
      <LetterDemo isSignedIn={isSignedIn} />

      {/* 3. Social Proof - Testimonials (8 stories) */}
      <SocialProofV2 />

      {/* 4. How It Works - 3 Simple Steps */}
      <HowItWorksV2 />

      {/* 5. Trust & Security Section (NEW) */}
      <TrustSection />

      {/* 6. Features - Condensed (4 cards) */}
      <FeaturesV2 />

      {/* 7. Pricing Preview (NEW) */}
      <PricingPreview />

      {/* 8. FAQ - Handle Objections (NEW) */}
      <FAQSection />

      {/* 9. Final CTA - Single Focused Action */}
      <CTAV2 isSignedIn={isSignedIn} />

      {/* 10. Footer - Fixed Links */}
      <FooterV2 />
    </main>
  )
}
