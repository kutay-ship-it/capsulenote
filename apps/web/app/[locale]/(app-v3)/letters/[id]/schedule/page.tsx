import { Suspense } from "react"
import { notFound, redirect } from "next/navigation"

import { getLetter } from "@/server/actions/letters"
import { getDeliveryEligibility } from "@/server/actions/entitlements"
import { requireUser } from "@/server/lib/auth"
import { getUserTimezone } from "@/server/lib/get-user-timezone"
import { ScheduleWizardV3 } from "@/components/v3/schedule/schedule-wizard-v3"

// Force dynamic rendering - schedule page must always show fresh data
export const dynamic = "force-dynamic"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

/**
 * Loading skeleton for the schedule wizard
 */
function ScheduleWizardSkeleton() {
  return (
    <div className="min-h-screen bg-duck-cream">
      {/* Header skeleton */}
      <div className="sticky top-0 z-20 border-b-2 border-charcoal bg-white">
        <div className="mx-auto max-w-2xl px-4 py-4">
          {/* Back & Title */}
          <div className="flex items-center gap-4 mb-4">
            <div
              className="h-10 w-10 bg-charcoal/10 animate-pulse"
              style={{ borderRadius: "2px" }}
            />
            <div className="flex-1">
              <div
                className="h-3 w-24 bg-charcoal/10 animate-pulse mb-2"
                style={{ borderRadius: "2px" }}
              />
              <div
                className="h-4 w-48 bg-charcoal/10 animate-pulse"
                style={{ borderRadius: "2px" }}
              />
            </div>
          </div>

          {/* Progress steps */}
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center gap-2">
                <div
                  className="h-8 w-8 bg-charcoal/10 animate-pulse"
                  style={{ borderRadius: "50%" }}
                />
                <div
                  className="hidden sm:block h-3 w-16 bg-charcoal/10 animate-pulse"
                  style={{ borderRadius: "2px" }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="space-y-6">
          {/* Section header */}
          <div className="text-center">
            <div
              className="h-6 w-64 mx-auto bg-charcoal/10 animate-pulse mb-2"
              style={{ borderRadius: "2px" }}
            />
            <div
              className="h-4 w-48 mx-auto bg-charcoal/10 animate-pulse"
              style={{ borderRadius: "2px" }}
            />
          </div>

          {/* Quick picks */}
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-20 bg-charcoal/10 animate-pulse border-2 border-charcoal/10"
                style={{ borderRadius: "2px" }}
              />
            ))}
          </div>

          {/* Calendar section */}
          <div
            className="h-80 bg-charcoal/10 animate-pulse border-2 border-charcoal/10"
            style={{ borderRadius: "2px" }}
          />

          {/* Button */}
          <div
            className="h-14 bg-charcoal/10 animate-pulse border-2 border-charcoal/10"
            style={{ borderRadius: "2px" }}
          />
        </div>
      </div>
    </div>
  )
}

/**
 * Async component for schedule wizard content
 */
async function ScheduleWizardContent({ id }: { id: string }) {
  // Get current user
  const user = await requireUser()

  // Fetch letter
  let letter
  try {
    letter = await getLetter(id)
  } catch {
    notFound()
  }

  // Only allow scheduling for drafts (no existing deliveries)
  // Letters with existing deliveries should be managed from detail page
  if (letter.deliveries.length > 0) {
    redirect(`/letters/${id}`)
  }

  // Get delivery eligibility and credits
  const eligibility = await getDeliveryEligibility()

  // Get user timezone from profile
  const timezone = getUserTimezone(user)

  // Determine if physical mail is locked
  // Physical mail is locked for DIGITAL_CAPSULE plan users who haven't purchased trial
  const isPhysicalLocked = eligibility.isDigitalCapsule && !eligibility.hasUsedPhysicalTrial

  // Can show trial offer if digital capsule, hasn't used trial, and can purchase
  const canShowTrialOffer =
    eligibility.isDigitalCapsule &&
    !eligibility.hasUsedPhysicalTrial &&
    eligibility.canPurchasePhysicalTrial

  return (
    <ScheduleWizardV3
      letterId={letter.id}
      letterTitle={letter.title || "Untitled Letter"}
      userEmail={user.email}
      userTimezone={timezone}
      emailCredits={eligibility.emailCredits}
      physicalCredits={eligibility.physicalCredits}
      isPhysicalLocked={isPhysicalLocked}
      canShowTrialOffer={canShowTrialOffer}
      onPhysicalUpsellTriggered={undefined}
    />
  )
}

export default async function SchedulePage({ params }: PageProps) {
  const { id } = await params

  // Verify user is authenticated
  await requireUser()

  return (
    <Suspense fallback={<ScheduleWizardSkeleton />}>
      <ScheduleWizardContent id={id} />
    </Suspense>
  )
}
