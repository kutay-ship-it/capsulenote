"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { HeroDraftState, MockDelivery, MockLetter, ReflectionEntry, StreakData } from "@/components/sandbox/types"

const STORAGE_KEY = "sandbox_experience_state_v1"

const defaultDraft: HeroDraftState = {
  title: "Letter to the Summer 2030 me",
  body: "",
  preset: null,
  prompt: "Tell future you what you're proud of right now.",
  tone: { formality: 50, sentiment: 50 },
  templateId: null,
  ambientAudio: null,
}

type SandboxExperienceState = {
  heroDraft: HeroDraftState
  letters: MockLetter[]
  deliveries: MockDelivery[]
  plan: "free" | "pro"
  recipientsVerified: boolean
  reflections: ReflectionEntry[]
  streak: StreakData
}

const defaultState: SandboxExperienceState = {
  heroDraft: defaultDraft,
  letters: [],
  deliveries: [],
  plan: "free",
  recipientsVerified: false,
  reflections: [],
  streak: {
    currentStreak: 0,
    longestStreak: 0,
    lastActivity: new Date().toISOString(),
  },
}

type ScheduleInput = {
  letterTitle: string
  channel: MockDelivery["channel"]
  deliverAt: string
  timezone: string
  status?: MockDelivery["status"]
}

type SandboxExperienceContextValue = {
  state: SandboxExperienceState
  updateHeroDraft: (partial: Partial<HeroDraftState>) => void
  resetHeroDraft: () => void
  saveDraftAsLetter: () => MockLetter | null
  scheduleDelivery: (input: ScheduleInput) => MockDelivery
  setPlan: (plan: "free" | "pro") => void
  setRecipientsVerified: (value: boolean) => void
  addReflection: (deliveryId: string, feeling: ReflectionEntry["feeling"], notes: string) => void
  updateStreak: () => void
  clearExperience: () => void
}

const SandboxExperienceContext = createContext<SandboxExperienceContextValue | null>(null)

export function SandboxExperienceProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SandboxExperienceState>(defaultState)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<SandboxExperienceState>
        setState({
          heroDraft: parsed.heroDraft ?? defaultDraft,
          letters: parsed.letters ?? [],
          deliveries: parsed.deliveries ?? [],
          plan: parsed.plan === "pro" ? "pro" : "free",
          recipientsVerified: parsed.recipientsVerified ?? false,
          reflections: parsed.reflections ?? [],
          streak: parsed.streak ?? defaultState.streak,
        })
      } catch {
        setState(defaultState)
      }
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state, hydrated])

  const value = useMemo<SandboxExperienceContextValue>(
    () => ({
      state,
      updateHeroDraft: (partial) =>
        setState((prev) => ({
          ...prev,
          heroDraft: { ...prev.heroDraft, ...partial },
        })),
      resetHeroDraft: () =>
        setState((prev) => ({
          ...prev,
          heroDraft: defaultDraft,
        })),
      saveDraftAsLetter: () => {
        if (!state.heroDraft.body.trim()) return null
        const newLetter: MockLetter = {
          id: crypto.randomUUID(),
          title: state.heroDraft.title || "Untitled letter",
          body: state.heroDraft.body,
          createdAt: new Date().toISOString(),
        }
        setState((prev) => ({
          ...prev,
          letters: [newLetter, ...prev.letters],
        }))
        return newLetter
      },
      scheduleDelivery: ({ status = "scheduled", ...input }: ScheduleInput) => {
        const delivery: MockDelivery = {
          id: crypto.randomUUID(),
          status,
          ...input,
        }
        setState((prev) => ({
          ...prev,
          deliveries: [delivery, ...prev.deliveries],
        }))
        return delivery
      },
      setPlan: (plan) =>
        setState((prev) => ({
          ...prev,
          plan,
        })),
      setRecipientsVerified: (value) =>
        setState((prev) => ({
          ...prev,
          recipientsVerified: value,
        })),
      addReflection: (deliveryId, feeling, notes) => {
        const reflection: ReflectionEntry = {
          id: crypto.randomUUID(),
          deliveryId,
          createdAt: new Date().toISOString(),
          feeling,
          notes,
        }
        setState((prev) => ({
          ...prev,
          reflections: [reflection, ...prev.reflections],
        }))
      },
      updateStreak: () => {
        setState((prev) => {
          const now = new Date()
          const lastActivity = new Date(prev.streak.lastActivity)
          const diffDays = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))

          let newCurrentStreak = prev.streak.currentStreak
          if (diffDays === 0) {
            // Same day, no change
            return prev
          } else if (diffDays === 1) {
            // Next day, increment streak
            newCurrentStreak = prev.streak.currentStreak + 1
          } else {
            // Streak broken, reset
            newCurrentStreak = 1
          }

          return {
            ...prev,
            streak: {
              currentStreak: newCurrentStreak,
              longestStreak: Math.max(newCurrentStreak, prev.streak.longestStreak),
              lastActivity: now.toISOString(),
            },
          }
        })
      },
      clearExperience: () => {
        setState(defaultState)
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(STORAGE_KEY)
        }
      },
    }),
    [state]
  )

  if (!hydrated) {
    return <div className="min-h-screen bg-cream" />
  }

  return <SandboxExperienceContext.Provider value={value}>{children}</SandboxExperienceContext.Provider>
}

export function useSandboxExperience() {
  const context = useContext(SandboxExperienceContext)
  if (!context) {
    throw new Error("useSandboxExperience must be used within SandboxExperienceProvider")
  }
  return context
}

export { defaultDraft }
