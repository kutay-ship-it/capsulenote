import {
  getNextDeliveryForHero,
  getDeliveryTimeline,
} from "@/server/actions/redesign-dashboard"
import {
  CountdownHeroV3,
  EmptyStateHeroV3,
  WritePromptBannerV3,
} from "@/components/v3/countdown-hero"
import { EmotionalJourneyV2 } from "@/components/v3/emotional-journey-v2"

// Force dynamic rendering for real-time countdown
export const dynamic = "force-dynamic"

export default async function JourneyV3Page() {
  // Fetch data in parallel (auth handled by layout)
  const [nextDelivery, deliveryTimeline] = await Promise.all([
    getNextDeliveryForHero(),
    getDeliveryTimeline(),
  ])

  return (
    <>
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

        {/* Emotional Journey Timeline */}
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
    </>
  )
}
