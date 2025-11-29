"use client"

interface JourneyWrapperProps {
  children: React.ReactNode
  /** @deprecated Onboarding is now handled at layout level via OnboardingProvider */
  showOnboarding?: boolean
}

/**
 * Wrapper component for v3 journey page
 *
 * Previously handled onboarding modal display.
 * Now a pass-through component - onboarding is handled at the layout level
 * via OnboardingProvider for app-wide coverage.
 *
 * @deprecated This wrapper may be removed in future versions.
 * Consider using children directly or the useOnboarding hook if needed.
 */
export function JourneyWrapper({ children }: JourneyWrapperProps) {
  return <>{children}</>
}
