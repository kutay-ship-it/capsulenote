"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { TimeCapsuleRitual } from "./time-capsule-ritual"
import { completeOnboarding } from "@/server/actions/onboarding"

interface OnboardingContextValue {
  isOnboardingComplete: boolean
  showOnboarding: () => void
  hideOnboarding: () => void
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null)

interface OnboardingProviderProps {
  children: React.ReactNode
  /** Initial onboarding status from server */
  shouldShowOnboarding: boolean
}

/**
 * V3 Onboarding Provider
 *
 * Wraps the entire V3 app at the layout level to handle onboarding.
 * Shows the Time Capsule Ritual modal for new users.
 *
 * Usage in layout.tsx:
 * ```tsx
 * <OnboardingProvider shouldShowOnboarding={!user.profile?.onboardingCompleted}>
 *   {children}
 * </OnboardingProvider>
 * ```
 */
export function OnboardingProvider({
  children,
  shouldShowOnboarding,
}: OnboardingProviderProps) {
  const t = useTranslations("onboarding.v3")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(!shouldShowOnboarding)

  // Show modal on mount if onboarding not completed
  useEffect(() => {
    if (shouldShowOnboarding && !isOnboardingComplete) {
      // Small delay for better UX (let page render first)
      const timer = setTimeout(() => {
        setIsModalOpen(true)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [shouldShowOnboarding, isOnboardingComplete])

  const handleComplete = useCallback(async () => {
    try {
      const result = await completeOnboarding()

      if (result.success) {
        setIsModalOpen(false)
        setIsOnboardingComplete(true)
        toast.success(t("toast.success.title"), {
          description: t("toast.success.description"),
        })
      } else {
        console.error("Failed to complete onboarding:", result.error)
        // Still close the modal even if marking complete failed
        setIsModalOpen(false)
        setIsOnboardingComplete(true)
      }
    } catch (error) {
      console.error("Error completing onboarding:", error)
      // Still close the modal
      setIsModalOpen(false)
      setIsOnboardingComplete(true)
    }
  }, [t])

  const handleClose = useCallback(async () => {
    // Mark as complete when closing/skipping
    await handleComplete()
  }, [handleComplete])

  const showOnboarding = useCallback(() => {
    setIsModalOpen(true)
  }, [])

  const hideOnboarding = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const contextValue: OnboardingContextValue = {
    isOnboardingComplete,
    showOnboarding,
    hideOnboarding,
  }

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
      <TimeCapsuleRitual
        isOpen={isModalOpen}
        onClose={handleClose}
        onComplete={handleComplete}
      />
    </OnboardingContext.Provider>
  )
}

/**
 * Hook to access onboarding context
 * Allows any component to show/hide onboarding or check completion status
 */
export function useOnboarding() {
  const context = useContext(OnboardingContext)

  if (!context) {
    throw new Error("useOnboarding must be used within an OnboardingProvider")
  }

  return context
}
