"use client"

import { useState, useEffect } from "react"
import { WelcomeModal } from "@/components/onboarding/welcome-modal"
import { completeOnboarding } from "@/server/actions/onboarding"
import { useToast } from "@/hooks/use-toast"

interface DashboardWrapperProps {
  showOnboarding: boolean
  children: React.ReactNode
}

export function DashboardWrapper({ showOnboarding, children }: DashboardWrapperProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { toast } = useToast()

  // Show modal on mount if onboarding not completed
  useEffect(() => {
    if (showOnboarding) {
      // Small delay for better UX (let page render first)
      const timer = setTimeout(() => {
        setIsModalOpen(true)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [showOnboarding])

  const handleComplete = async () => {
    try {
      const result = await completeOnboarding()

      if (result.success) {
        setIsModalOpen(false)
        toast({
          title: "Welcome aboard! 🎉",
          description: "You're all set. Start writing your first letter!",
        })
      } else {
        console.error('Failed to complete onboarding:', result.error)
        // Still close the modal even if marking complete failed
        setIsModalOpen(false)
      }
    } catch (error) {
      console.error('Error completing onboarding:', error)
      // Still close the modal
      setIsModalOpen(false)
    }
  }

  const handleClose = async () => {
    // Mark as complete even when closing/skipping
    await handleComplete()
  }

  return (
    <>
      {showOnboarding && (
        <WelcomeModal
          isOpen={isModalOpen}
          onClose={handleClose}
          onComplete={handleComplete}
        />
      )}
      {children}
    </>
  )
}
