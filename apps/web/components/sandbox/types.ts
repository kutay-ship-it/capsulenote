"use client"

export type TonePreference = {
  formality: number // 0-100: casual to formal
  sentiment: number // 0-100: reflective to optimistic
}

export type HeroDraftState = {
  title: string
  body: string
  preset: string | null
  prompt: string
  tone: TonePreference
  templateId: string | null
  ambientAudio: string | null
}

export type MockLetter = {
  id: string
  title: string
  body: string
  createdAt: string
  tone?: TonePreference
  templateId?: string | null
}

export type MockDeliveryStatus = "scheduled" | "processing" | "sent" | "failed"

export type MockDelivery = {
  id: string
  letterTitle: string
  channel: "email" | "mail" | "combo"
  deliverAt: string
  timezone: string
  status: MockDeliveryStatus
}

export type LetterTemplate = {
  id: string
  category: "reflection" | "goal" | "gratitude" | "therapy" | "legacy" | "celebration"
  title: string
  description: string
  promptText: string
  icon: string
}

export type ReflectionEntry = {
  id: string
  deliveryId: string
  createdAt: string
  feeling: "moved" | "surprised" | "grateful" | "nostalgic" | "motivated"
  notes: string
}

export type StreakData = {
  currentStreak: number
  longestStreak: number
  lastActivity: string
}

export type CampaignCard = {
  id: string
  title: string
  description: string
  season: "new-year" | "birthday" | "summer" | "fall" | "spring" | "winter"
  promptSuggestion: string
}
