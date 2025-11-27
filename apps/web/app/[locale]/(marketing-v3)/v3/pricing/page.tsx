import { Metadata } from "next"
import { auth } from "@clerk/nextjs/server"

import { NavbarV3 } from "../../_components/navbar-v3"
import { Footer } from "../../_components/footer"
import { PricingHeroV3 } from "../../pricing/_components/pricing-hero-v3"
import { PricingTiersV3 } from "../../pricing/_components/pricing-tiers-v3"
import { FeatureMatrixV3 } from "../../pricing/_components/feature-matrix-v3"
import { PricingFAQV3 } from "../../pricing/_components/pricing-faq-v3"
import { PricingCTAV3 } from "../../pricing/_components/pricing-cta-v3"
import { TrustSignalsV3 } from "../../pricing/_components/trust-signals-v3"

export const metadata: Metadata = {
  title: "Pricing | Capsule Note",
  description:
    "Simple, transparent pricing for time capsule letters. Start free, upgrade when you need more.",
  openGraph: {
    title: "Pricing | Capsule Note",
    description:
      "Simple, transparent pricing for time capsule letters. Start free, upgrade when you need more.",
    type: "website",
  },
}

// Pricing tiers configuration
const pricingTiers = [
  {
    name: "Starter",
    monthlyPrice: 0,
    yearlyPrice: 0,
    interval: "month",
    description: "Perfect for trying out time capsule letters and occasional reflections.",
    features: [
      "3 letters per month",
      "Email delivery",
      "7-day scheduling ahead",
      "Basic text editor",
      "Community support",
    ],
    cta: "START FREE",
    ctaHref: "/sign-up",
    variant: "default" as const,
  },
  {
    name: "Pro",
    monthlyPrice: 12,
    yearlyPrice: 79,
    interval: "month",
    description: "For dedicated writers who want to build a meaningful practice.",
    features: [
      "Unlimited letters",
      "Email + physical mail",
      "Schedule years ahead",
      "Rich text editor",
      "Letter templates",
      "Arrive-by scheduling",
      "Priority support",
    ],
    cta: "START PRO TRIAL",
    ctaHref: "/sign-up?plan=pro",
    variant: "popular" as const,
  },
  {
    name: "Enterprise",
    monthlyPrice: "Custom",
    yearlyPrice: "Custom",
    interval: "month",
    description: "For teams and organizations with advanced needs.",
    features: [
      "Everything in Pro",
      "Team collaboration",
      "Admin dashboard",
      "Custom branding",
      "API access",
      "Dedicated support",
      "SLA guarantee",
    ],
    cta: "CONTACT SALES",
    ctaHref: "/contact",
    variant: "enterprise" as const,
  },
]

// Feature matrix categories
const featureCategories = [
  {
    name: "Letters",
    features: [
      { name: "Letters per month", free: "3", pro: "Unlimited", enterprise: "Unlimited" },
      { name: "Rich text editor", free: false, pro: true, enterprise: true },
      { name: "Letter templates", free: false, pro: true, enterprise: true },
      { name: "Photo attachments", free: false, pro: true, enterprise: true },
    ],
  },
  {
    name: "Delivery",
    features: [
      { name: "Email delivery", free: true, pro: true, enterprise: true },
      { name: "Physical mail", free: false, pro: true, enterprise: true },
      { name: "Scheduling ahead", free: "7 days", pro: "10 years", enterprise: "10 years" },
      { name: "Arrive-by mode", free: false, pro: true, enterprise: true, tooltip: "Schedule letters to arrive by a specific date" },
    ],
  },
  {
    name: "Security",
    features: [
      { name: "End-to-end encryption", free: true, pro: true, enterprise: true },
      { name: "2FA authentication", free: true, pro: true, enterprise: true },
      { name: "SOC 2 compliance", free: false, pro: false, enterprise: true },
    ],
  },
  {
    name: "Support",
    features: [
      { name: "Community support", free: true, pro: true, enterprise: true },
      { name: "Priority email support", free: false, pro: true, enterprise: true },
      { name: "Dedicated account manager", free: false, pro: false, enterprise: true },
      { name: "SLA guarantee", free: false, pro: false, enterprise: true },
    ],
  },
]

// FAQ items
const faqItems = [
  {
    question: "Can I try Capsule Note for free?",
    answer:
      "Yes! Our Starter plan is completely free and includes 3 letters per month with email delivery. It's a great way to experience the magic of time capsule letters.",
  },
  {
    question: "What happens when my letter is delivered?",
    answer:
      "On your scheduled delivery date, we'll send your letter via your chosen method (email or physical mail). Email letters arrive instantly, while physical letters are sent with tracking.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Absolutely. You can cancel your Pro subscription at any time. Your existing scheduled letters will still be delivered, and you'll retain access until the end of your billing period.",
  },
  {
    question: "How secure are my letters?",
    answer:
      "We use bank-level AES-256 encryption for all letter content. Your letters are encrypted before storage and only decrypted for delivery. Not even our team can read your letters.",
  },
  {
    question: "What's the difference between Email and Physical mail delivery?",
    answer:
      "Email delivery sends your letter to your inbox instantly on the scheduled date. Physical mail prints your letter on premium paper and mails it to your address via USPS or international carriers.",
  },
  {
    question: "Can I schedule a letter for 10 years from now?",
    answer:
      "Yes! Pro and Enterprise plans allow scheduling up to 10 years ahead. We recommend using our 'Arrive-by' mode for important dates to ensure timely delivery.",
  },
]

export default async function PricingPageV3() {
  const { userId } = await auth()

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <NavbarV3 />

      <main className="flex-1">
        {/* Hero Section */}
        <PricingHeroV3 />

        {/* Pricing Tiers */}
        <section className="container px-4 pb-16 sm:px-6 sm:pb-20 md:pb-24">
          <PricingTiersV3
            tiers={pricingTiers}
            popularBadgeText="MOST POPULAR"
            toggleLabels={{
              monthly: "MONTHLY",
              yearly: "YEARLY",
              savings: "SAVE 40%",
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
              <h2 className="font-mono text-2xl md:text-3xl uppercase tracking-wide text-charcoal">
                COMPARE ALL FEATURES
              </h2>
              <p className="font-mono text-sm md:text-base text-charcoal/70 max-w-xl mx-auto">
                See exactly what you get with each plan
              </p>
            </div>

            {/* Matrix */}
            <FeatureMatrixV3
              categories={featureCategories}
              headers={{
                feature: "Feature",
                free: "Starter",
                pro: "Pro",
                enterprise: "Enterprise",
              }}
              mobileNote="Scroll horizontally to view all plans"
            />
          </div>
        </section>

        {/* FAQ Section */}
        <section className="container px-4 py-16 sm:px-6 sm:py-20 md:py-24 bg-off-white border-y-2 border-charcoal">
          <PricingFAQV3
            items={faqItems}
            title="FREQUENTLY ASKED QUESTIONS"
            subtitle="Everything you need to know about our pricing and plans"
            contactText="Still have questions?"
            contactLinkText="Contact us"
          />
        </section>

        {/* Final CTA */}
        <section className="container px-4 py-16 sm:px-6 sm:py-20 md:py-24">
          <PricingCTAV3
            title="START YOUR TIME CAPSULE JOURNEY"
            description="Join thousands of people sending meaningful letters to their future selves. Start free, upgrade anytime."
            badges={["14-day free trial", "No credit card required", "Cancel anytime"]}
            primaryCta="GET STARTED FREE"
            primaryCtaHref={userId ? "/dashboard" : "/sign-up"}
            secondaryCta="VIEW DEMO"
            secondaryCtaHref="/demo"
          />
        </section>
      </main>

      <Footer />
    </div>
  )
}
