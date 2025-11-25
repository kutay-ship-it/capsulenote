import {
  getNextDeliveryForHero,
  getDeliveryTimeline,
} from "@/server/actions/redesign-dashboard"
import {
  CountdownHeroV3,
  EmptyStateHeroV3,
  WritePromptBannerV3,
} from "@/components/v3/countdown-hero"
import { EmotionalJourneyV1 } from "@/components/v3/emotional-journey-v1"
import { EmotionalJourneyV2 } from "@/components/v3/emotional-journey-v2"

// Force dynamic rendering for real-time countdown
export const dynamic = "force-dynamic"

export default async function JourneyV3Page() {
  // Fetch data in parallel
  const [nextDelivery, deliveryTimeline] = await Promise.all([
    getNextDeliveryForHero(),
    getDeliveryTimeline(),
  ])

  return (
    <div className="space-y-0">
      {/* Page Header - Inside container */}
      <div className="container">
        <header className="space-y-2 py-12">
          <h1 className="font-mono text-3xl font-bold uppercase tracking-wide text-charcoal">
            Your Journey
          </h1>
          <p className="font-mono text-sm text-charcoal/70">
            Letters traveling through time, waiting to find you.
          </p>
        </header>

        {/* Hero Section - Countdown or Empty State */}
        <section className="pb-12">
          {nextDelivery ? (
            <CountdownHeroV3 delivery={nextDelivery} />
          ) : (
            <EmptyStateHeroV3 />
          )}
        </section>
      </div>

      {/* Version Comparison Section */}
      <div className="container py-8">
        <div className="bg-amber-50 border-2 border-amber-400 p-4 mb-8">
          <h2 className="font-mono text-lg font-bold text-amber-800 mb-2">
            Emotional Journey - Version Comparison
          </h2>
          <p className="font-mono text-sm text-amber-700">
            V1: Original simple stroke (no gradient) | V2: Smooth curves with gradient fading at edges
          </p>
        </div>
      </div>

      {/* V1 - Original Version */}
      <div className="pt-8">
        <EmotionalJourneyV1 deliveries={deliveryTimeline} />
      </div>

      {/* Spacer between versions */}
      <div className="h-32 bg-duck-cream" />

      {/* V2 - Smooth Curves + Gradient Version */}
      <div className="pt-8">
        <EmotionalJourneyV2 deliveries={deliveryTimeline} />
      </div>

      {/* Write Prompt Banner (shown when user has deliveries) */}
      {nextDelivery && (
        <div className="container py-12">
          <WritePromptBannerV3 />
        </div>
      )}
    </div>
  )
}
