/**
 * V3 Onboarding Module
 *
 * Time Capsule Ritual - A ceremonial 4-step onboarding experience
 * for new users of Capsule Note.
 */

export { OnboardingProvider, useOnboarding } from "./onboarding-provider"
export { TimeCapsuleRitual } from "./time-capsule-ritual"
export { ONBOARDING_STEPS } from "./types"
export type { OnboardingStep } from "./types"

// Shared components
export { ProgressIndicator } from "./shared/progress-indicator"
export { TrustBadges } from "./shared/trust-badges"
export { CapsuleIllustration, FlowIllustration } from "./shared/capsule-illustration"
