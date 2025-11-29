/**
 * ONBOARDING SANDBOX TYPES
 *
 * Shared types for the onboarding modal variations.
 * Three distinct approaches to user onboarding:
 * 1. Ritual - Multi-step ceremonial experience
 * 2. Narrative - Scroll-driven storytelling
 * 3. Quick - Minimal friction, fast to action
 */

export type OnboardingVariation = "ritual" | "narrative" | "quick"

export interface OnboardingStep {
  id: string
  title: string
  description?: string
}

export interface OnboardingState {
  currentStep: number
  totalSteps: number
  completed: boolean
  skipped: boolean
}

// Ritual variation steps
export const RITUAL_STEPS: OnboardingStep[] = [
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
    id: "first-capsule",
    title: "Choose Your First",
    description: "Pick a delivery date",
  },
  {
    id: "ready",
    title: "Ready to Write",
    description: "Begin your journey",
  },
]

// Quick benefits for the quick variation
export const QUICK_BENEFITS = [
  {
    icon: "lock",
    text: "Encrypted & Private",
  },
  {
    icon: "mail",
    text: "Email or Physical Mail",
  },
  {
    icon: "calendar",
    text: "Schedule Any Date",
  },
] as const

// Trust badges for all variations
export const TRUST_BADGES = [
  {
    id: "encrypted",
    icon: "lock",
    label: "End-to-End Encrypted",
    description: "Your words are scrambled before leaving your device",
  },
  {
    id: "private",
    icon: "eye-off",
    label: "Completely Private",
    description: "Not even we can read your letters",
  },
  {
    id: "secure",
    icon: "shield",
    label: "Bank-Grade Security",
    description: "AES-256 encryption, the same used by banks",
  },
] as const

// Pre-set delivery options for ritual variation
export const DELIVERY_PRESETS = [
  {
    id: "tomorrow",
    label: "Tomorrow",
    description: "A quick glimpse into the near future",
    days: 1,
    color: "teal-primary",
  },
  {
    id: "next-month",
    label: "Next Month",
    description: "See how much can change in 30 days",
    days: 30,
    color: "duck-blue",
  },
  {
    id: "next-year",
    label: "Next Year",
    description: "A letter from a different version of you",
    days: 365,
    color: "coral",
  },
] as const

export type DeliveryPreset = (typeof DELIVERY_PRESETS)[number]
