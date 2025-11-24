import type { PlanType } from "@prisma/client"

export const PLAN_CREDITS: Record<PlanType, { email: number; physical: number }> = {
  DIGITAL_CAPSULE: { email: 6, physical: 0 },
  PAPER_PIXELS: { email: 24, physical: 3 },
}

export function toDateOrNow(seconds: number | null | undefined, label: string): Date {
  if (typeof seconds === "number" && Number.isFinite(seconds)) {
    return new Date(seconds * 1000)
  }

  console.warn(`[Billing] Missing or invalid timestamp for ${label}, using now()`, {
    seconds,
  })

  return new Date()
}

export function ensureValidDate(date: Date, label: string): Date {
  if (date instanceof Date && !isNaN(date.getTime())) {
    return date
  }

  console.warn(`[Billing] Coercing invalid date to now() for ${label}`, { value: date })
  return new Date()
}
