// Journey Page Types & Mock Data Generator

export interface JourneyLetter {
  id: string
  title: string
  writtenAt: Date
  deliverAt: Date
  status: "draft" | "scheduled" | "processing" | "sent" | "failed"
  preview?: string
}

export type JourneyState = "empty" | "few" | "normal" | "many"
export type Variation = "minimal" | "archive" | "theater" | "river" | "garden"

// Sample letter titles for realistic mock data
const LETTER_TITLES = [
  "To My Future Self: On Courage",
  "Remember This Moment",
  "A Promise to Keep",
  "When You Read This...",
  "Notes on Joy",
  "The Year That Changed Everything",
  "Dear Future Me",
  "What I Wish I Knew",
  "Reflections at Midnight",
  "A Letter for Difficult Days",
  "Celebrating Small Wins",
  "The Road Ahead",
  "Lessons From Today",
  "A Time Capsule of Now",
  "Words for Tomorrow",
  "On Growth and Change",
  "This Is Who You Were",
  "A Reminder of Strength",
  "The Dreams I Hold",
  "For When You Forget",
]

const LETTER_PREVIEWS = [
  "I'm writing this because I want you to remember how far you've come...",
  "Today was one of those days that felt ordinary but wasn't...",
  "I know things might be hard when you read this, but remember...",
  "Don't forget the small victories that brought you here...",
  "If you're reading this and feeling lost, know that...",
  "This moment right now feels significant. Let me explain why...",
  "I hope by now you've learned to be kinder to yourself...",
  "Remember the person who wrote this still believes in you...",
]

// Generate a random date within a range
function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  )
}

// Generate mock letters based on state
export function generateMockLetters(state: JourneyState): JourneyLetter[] {
  const now = new Date()
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
  const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate())
  const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())
  const fiveYearsFromNow = new Date(now.getFullYear() + 5, now.getMonth(), now.getDate())

  const letterCounts: Record<JourneyState, number> = {
    empty: 0,
    few: 3,
    normal: 8,
    many: 20,
  }

  const count = letterCounts[state]
  const letters: JourneyLetter[] = []

  for (let i = 0; i < count; i++) {
    const writtenAt = randomDate(twoYearsAgo, now)

    // Mix of past and future deliveries
    const isPast = Math.random() > 0.4
    const deliverAt = isPast
      ? randomDate(writtenAt, now)
      : randomDate(now, fiveYearsFromNow)

    const status = isPast
      ? Math.random() > 0.1 ? "sent" : "failed"
      : Math.random() > 0.8 ? "processing" : "scheduled"

    letters.push({
      id: `letter-${i}-${Date.now()}`,
      title: LETTER_TITLES[i % LETTER_TITLES.length] || "Untitled Letter",
      writtenAt,
      deliverAt,
      status,
      preview: LETTER_PREVIEWS[i % LETTER_PREVIEWS.length],
    })
  }

  // Sort by delivery date
  return letters.sort((a, b) => a.deliverAt.getTime() - b.deliverAt.getTime())
}

// Status configuration for consistent styling
export const STATUS_CONFIG = {
  draft: {
    label: "Draft",
    borderColor: "border-duck-yellow",
    bgColor: "bg-duck-yellow/10",
    badgeBg: "bg-duck-yellow",
    badgeText: "text-charcoal",
    dotColor: "bg-duck-yellow",
  },
  scheduled: {
    label: "Scheduled",
    borderColor: "border-duck-blue",
    bgColor: "bg-duck-blue/10",
    badgeBg: "bg-duck-blue",
    badgeText: "text-charcoal",
    dotColor: "bg-duck-blue",
  },
  processing: {
    label: "Processing",
    borderColor: "border-duck-blue",
    bgColor: "bg-duck-blue/5",
    badgeBg: "bg-duck-blue",
    badgeText: "text-charcoal",
    dotColor: "bg-duck-blue",
  },
  sent: {
    label: "Delivered",
    borderColor: "border-teal-primary",
    bgColor: "bg-teal-primary/10",
    badgeBg: "bg-teal-primary",
    badgeText: "text-white",
    dotColor: "bg-teal-primary",
  },
  failed: {
    label: "Failed",
    borderColor: "border-coral",
    bgColor: "bg-coral/10",
    badgeBg: "bg-coral",
    badgeText: "text-white",
    dotColor: "bg-coral",
  },
} as const
