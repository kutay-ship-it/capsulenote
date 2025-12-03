"use client"

import { useEffect, useRef, useCallback } from "react"
import {
  saveLetterAutosave,
  clearLetterAutosave,
  type LetterAutosave,
} from "@/lib/localStorage-letter"

/**
 * Data structure for auto-save (matches LetterAutosave without timestamps)
 */
export interface LetterAutosaveData {
  title: string
  bodyRich: unknown | null
  bodyHtml: string
  recipientType: "myself" | "someone-else"
  recipientName: string
  recipientEmail: string
  deliveryChannels: ("email" | "physical")[]
  deliveryDate: Date | null
  selectedPreset: string | null
  selectedAddressId: string | null
  printOptions: { color: boolean; doubleSided: boolean }
}

interface UseLetterAutosaveOptions {
  /** Whether auto-save is enabled (default: true) */
  enabled?: boolean
  /** Interval between saves in ms (default: 30000 = 30s) */
  intervalMs?: number
}

interface UseLetterAutosaveReturn {
  /** Manually trigger a save */
  save: () => void
  /** Clear the saved draft */
  clear: () => void
}

/**
 * Hook for auto-saving letter drafts to localStorage
 *
 * Features:
 * - Saves immediately on first change
 * - Saves every 30 seconds (configurable)
 * - Skips save if data hasn't changed (deduplication)
 * - Returns save/clear functions for manual control
 *
 * @example
 * ```tsx
 * const { save, clear } = useLetterAutosave(
 *   { title, bodyRich, bodyHtml, ... },
 *   { enabled: !showCelebration }
 * )
 *
 * // Manual save before checkout
 * save()
 *
 * // Clear after successful submission
 * clear()
 * ```
 */
export function useLetterAutosave(
  data: LetterAutosaveData,
  options: UseLetterAutosaveOptions = {}
): UseLetterAutosaveReturn {
  const { enabled = true, intervalMs = 30000 } = options

  // Track last saved data to avoid duplicate saves
  const lastSaveRef = useRef<string>("")
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Convert data to storage format
  const toStorageFormat = useCallback(
    (d: LetterAutosaveData): Omit<LetterAutosave, "lastSaved" | "createdAt"> => ({
      title: d.title,
      bodyRich: d.bodyRich,
      bodyHtml: d.bodyHtml,
      recipientType: d.recipientType === "myself" ? "self" : "other",
      recipientName: d.recipientName,
      recipientEmail: d.recipientEmail,
      deliveryChannels: d.deliveryChannels,
      deliveryDate: d.deliveryDate?.toISOString() ?? null,
      selectedPreset: d.selectedPreset,
      selectedAddressId: d.selectedAddressId,
      printOptions: d.printOptions,
    }),
    []
  )

  // Save function - only saves if data has changed
  const save = useCallback(() => {
    const storageData = toStorageFormat(data)
    const serialized = JSON.stringify(storageData)

    if (serialized !== lastSaveRef.current) {
      saveLetterAutosave(storageData)
      lastSaveRef.current = serialized
    }
  }, [data, toStorageFormat])

  // Clear function
  const clear = useCallback(() => {
    clearLetterAutosave()
    lastSaveRef.current = ""
  }, [])

  // Auto-save effect
  useEffect(() => {
    if (!enabled) {
      // Clear interval if disabled
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    // Save immediately on mount/change
    save()

    // Set up interval for periodic saves
    intervalRef.current = setInterval(save, intervalMs)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [enabled, save, intervalMs])

  return { save, clear }
}
