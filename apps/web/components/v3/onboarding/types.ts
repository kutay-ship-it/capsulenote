/**
 * V3 Onboarding Types
 *
 * Type definitions for the Time Capsule Ritual onboarding flow.
 */

export interface OnboardingStep {
  id: string
  title: string
  description?: string
}

// 4-step onboarding flow
export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome",
    description: "Your time capsule awaits",
  },
  {
    id: "how-it-works",
    title: "How It Works",
    description: "Write, seal, receive",
  },
  {
    id: "security",
    title: "Your Words Are Safe",
    description: "End-to-end encrypted",
  },
  {
    id: "ready",
    title: "Ready to Write",
    description: "Begin your journey",
  },
]

// Trust badges for security step
export const TRUST_BADGES = [
  {
    id: "encrypted",
    icon: "lock" as const,
    labelKey: "security.encrypted.title",
    descriptionKey: "security.encrypted.description",
  },
  {
    id: "private",
    icon: "eye-off" as const,
    labelKey: "security.private.title",
    descriptionKey: "security.private.description",
  },
  {
    id: "secure",
    icon: "shield" as const,
    labelKey: "security.secure.title",
    descriptionKey: "security.secure.description",
  },
] as const

export type TrustBadgeIcon = (typeof TRUST_BADGES)[number]["icon"]
