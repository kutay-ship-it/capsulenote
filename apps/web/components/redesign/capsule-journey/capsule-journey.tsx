"use client"

import { useState, useCallback, useTransition } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import { fromZonedTime } from "date-fns-tz"

import { createLetter } from "@/server/actions/letters"
import { scheduleDelivery } from "@/server/actions/deliveries"
import { getUserTimezone } from "@/lib/utils"

import { Phase1Intention } from "./phase-1-intention"
import { Phase2Reflection } from "./phase-2-reflection"
import { Phase3Sanctuary } from "./phase-3-sanctuary"
import { Phase4Sealing } from "./phase-4-sealing"
import { JourneyProgress } from "./journey-progress"

export type JourneyPhase = 1 | 2 | 3 | 4

export interface TemplateOption {
  id: string
  icon: string
  title: string
  description: string
  promptText: string
}

export interface CapsuleJourneyState {
  phase: JourneyPhase
  deliveryDate: Date | null
  selectedTemplate: TemplateOption | null
  letterTitle: string
  letterBodyRich: Record<string, unknown> | null
  letterBodyHtml: string
  recipientEmail: string
  recipientType: "self" | "other"
  recipientName: string
  timezone: string
}

const initialState: CapsuleJourneyState = {
  phase: 1,
  deliveryDate: null,
  selectedTemplate: null,
  letterTitle: "",
  letterBodyRich: null,
  letterBodyHtml: "",
  recipientEmail: "",
  recipientType: "self",
  recipientName: "",
  timezone: typeof window !== "undefined" ? getUserTimezone() : "UTC",
}

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

interface CapsuleJourneyProps {
  userEmail?: string
}

export function CapsuleJourney({ userEmail = "" }: CapsuleJourneyProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [state, setState] = useState<CapsuleJourneyState>({
    ...initialState,
    recipientEmail: userEmail,
    timezone: getUserTimezone(),
  })

  const setPhase = useCallback((phase: JourneyPhase) => {
    setState((prev) => ({ ...prev, phase }))
  }, [])

  const setDeliveryDate = useCallback((date: Date | null) => {
    setState((prev) => ({ ...prev, deliveryDate: date }))
  }, [])

  const setSelectedTemplate = useCallback((template: TemplateOption | null) => {
    setState((prev) => ({ ...prev, selectedTemplate: template }))
  }, [])

  const setLetterContent = useCallback(
    (title: string, bodyRich: Record<string, unknown> | null, bodyHtml: string) => {
      setState((prev) => ({
        ...prev,
        letterTitle: title,
        letterBodyRich: bodyRich,
        letterBodyHtml: bodyHtml,
      }))
    },
    []
  )

  const setRecipient = useCallback(
    (email: string, type: "self" | "other", name: string = "") => {
      setState((prev) => ({
        ...prev,
        recipientEmail: email,
        recipientType: type,
        recipientName: name,
      }))
    },
    []
  )

  const handlePhase1Complete = useCallback(
    (date: Date) => {
      setDeliveryDate(date)
      setPhase(2)
    },
    [setDeliveryDate, setPhase]
  )

  const handlePhase2Complete = useCallback(
    (template: TemplateOption | null) => {
      setSelectedTemplate(template)
      setPhase(3)
    },
    [setSelectedTemplate, setPhase]
  )

  const handlePhase3Complete = useCallback(
    (title: string, bodyRich: Record<string, unknown> | null, bodyHtml: string) => {
      setLetterContent(title, bodyRich, bodyHtml)
      setPhase(4)
    },
    [setLetterContent, setPhase]
  )

  const handleSealAndSchedule = useCallback(
    async (email: string) => {
      if (!state.deliveryDate || !state.letterBodyHtml) {
        toast.error("Missing required information")
        return
      }

      startTransition(async () => {
        try {
          const result = await createLetter({
            title: state.letterTitle || "Untitled Letter",
            bodyRich: state.letterBodyRich ?? { type: "doc", content: [] },
            bodyHtml: state.letterBodyHtml,
            tags: [],
            visibility: "private",
          })

          if (result.success) {
            const letterId = result.data.letterId
            const deliverAt = fromZonedTime(
              `${state.deliveryDate!.toISOString().split("T")[0]}T09:00`,
              state.timezone
            )

            await scheduleDelivery({
              letterId,
              channel: "email",
              deliverAt,
              timezone: state.timezone,
              toEmail: email,
            })

            toast.success("Your letter is sealed!", {
              description: "It will be delivered on the scheduled date.",
            })

            // Short delay for celebration animation
            setTimeout(() => {
              router.push(`/redesign/letters?sealed=${letterId}`)
            }, 2000)
          } else {
            toast.error("Failed to create letter", {
              description: result.error.message,
            })
          }
        } catch (error) {
          console.error("Letter creation error:", error)
          toast.error("Something went wrong", {
            description: "Please try again.",
          })
        }
      })
    },
    [state, router]
  )

  const goBack = useCallback(() => {
    if (state.phase > 1) {
      setPhase((state.phase - 1) as JourneyPhase)
    }
  }, [state.phase, setPhase])

  return (
    <div className="min-h-screen bg-cream">
      {/* Progress indicator - hidden on phase 3 for distraction-free writing */}
      {state.phase !== 3 && (
        <JourneyProgress currentPhase={state.phase} onBack={goBack} />
      )}

      <AnimatePresence mode="wait">
        {state.phase === 1 && (
          <motion.div
            key="phase1"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <Phase1Intention
              selectedDate={state.deliveryDate}
              onComplete={handlePhase1Complete}
            />
          </motion.div>
        )}

        {state.phase === 2 && (
          <motion.div
            key="phase2"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <Phase2Reflection
              selectedTemplate={state.selectedTemplate}
              onComplete={handlePhase2Complete}
              onSkip={() => handlePhase2Complete(null)}
            />
          </motion.div>
        )}

        {state.phase === 3 && (
          <motion.div
            key="phase3"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
            className="h-screen"
          >
            <Phase3Sanctuary
              initialTitle={state.letterTitle}
              initialContent={
                state.selectedTemplate?.promptText || state.letterBodyHtml
              }
              onComplete={handlePhase3Complete}
              onBack={goBack}
            />
          </motion.div>
        )}

        {state.phase === 4 && (
          <motion.div
            key="phase4"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <Phase4Sealing
              letterTitle={state.letterTitle}
              letterPreview={state.letterBodyHtml}
              deliveryDate={state.deliveryDate!}
              recipientEmail={state.recipientEmail}
              onSeal={handleSealAndSchedule}
              onBack={goBack}
              isSealing={isPending}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
