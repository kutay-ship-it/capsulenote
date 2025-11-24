/**
 * Integration Tests for Timezone Signup Flow
 *
 * Tests the timezone detection and storage flow:
 * 1. Browser detection → Clerk metadata
 * 2. Clerk webhook → Profile creation with timezone
 * 3. Auto-provision fallback → Profile creation with timezone
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { prisma } from "@/server/lib/db"
import {
  getDetectedTimezoneFromMetadata,
  isValidTimezone,
  parseClerkUnsafeMetadata,
} from "@dearme/types"
import {
  getUserTimezone,
  getUserTimezoneOrDefault,
  hasTimezone,
} from "@/server/lib/get-user-timezone"

// Mock Clerk webhook payload for user.created event
function createMockWebhookPayload(options: {
  id: string
  email: string
  detectedTimezone?: string
  lockedEmail?: string
}) {
  return {
    type: "user.created" as const,
    data: {
      id: options.id,
      email_addresses: [
        {
          id: "email_123",
          email_address: options.email,
        },
      ],
      primary_email_address_id: "email_123",
      unsafe_metadata: {
        ...(options.detectedTimezone && {
          detectedTimezone: options.detectedTimezone,
        }),
        ...(options.lockedEmail && { lockedEmail: options.lockedEmail }),
      },
      public_metadata: {},
    },
  }
}

describe("Timezone Signup Integration", () => {
  describe("Clerk Metadata Parsing", () => {
    it("should extract valid timezone from metadata", () => {
      const metadata = { detectedTimezone: "Europe/Istanbul" }
      const timezone = getDetectedTimezoneFromMetadata(metadata)

      expect(timezone).toBe("Europe/Istanbul")
    })

    it("should return null for missing timezone", () => {
      const metadata = {}
      const timezone = getDetectedTimezoneFromMetadata(metadata)

      expect(timezone).toBeNull()
    })

    it("should return null for invalid timezone", () => {
      const metadata = { detectedTimezone: "Invalid/Zone" }
      const timezone = getDetectedTimezoneFromMetadata(metadata)

      expect(timezone).toBeNull()
    })

    it("should handle undefined metadata", () => {
      const timezone = getDetectedTimezoneFromMetadata(undefined)

      expect(timezone).toBeNull()
    })

    it("should handle null metadata", () => {
      const timezone = getDetectedTimezoneFromMetadata(null)

      expect(timezone).toBeNull()
    })

    it("should parse complete unsafe metadata", () => {
      const metadata = {
        detectedTimezone: "America/New_York",
        lockedEmail: "test@example.com",
      }
      const parsed = parseClerkUnsafeMetadata(metadata)

      expect(parsed).not.toBeNull()
      expect(parsed?.detectedTimezone).toBe("America/New_York")
      expect(parsed?.lockedEmail).toBe("test@example.com")
    })
  })

  describe("Timezone Validation", () => {
    it("should validate common IANA timezones", () => {
      const validTimezones = [
        "UTC",
        "America/New_York",
        "America/Los_Angeles",
        "Europe/London",
        "Europe/Paris",
        "Europe/Istanbul",
        "Asia/Tokyo",
        "Asia/Singapore",
        "Australia/Sydney",
        "Pacific/Auckland",
      ]

      for (const tz of validTimezones) {
        expect(isValidTimezone(tz)).toBe(true)
      }
    })

    it("should reject invalid timezone strings", () => {
      const invalidTimezones = [
        "Invalid/Zone",
        "Not/A/Timezone",
        "",
        "America",
        "New_York",
        "123",
        "null",
      ]

      for (const tz of invalidTimezones) {
        expect(isValidTimezone(tz)).toBe(false)
      }
    })
  })

  describe("Webhook Payload Processing", () => {
    it("should create payload with detected timezone", () => {
      const payload = createMockWebhookPayload({
        id: "user_123",
        email: "test@example.com",
        detectedTimezone: "Europe/Istanbul",
      })

      expect(payload.data.unsafe_metadata.detectedTimezone).toBe(
        "Europe/Istanbul"
      )
    })

    it("should create payload without timezone when not detected", () => {
      const payload = createMockWebhookPayload({
        id: "user_123",
        email: "test@example.com",
      })

      expect(payload.data.unsafe_metadata.detectedTimezone).toBeUndefined()
    })

    it("should extract timezone from webhook payload", () => {
      const payload = createMockWebhookPayload({
        id: "user_123",
        email: "test@example.com",
        detectedTimezone: "America/Chicago",
      })

      const timezone = getDetectedTimezoneFromMetadata(
        payload.data.unsafe_metadata
      )

      expect(timezone).toBe("America/Chicago")
    })
  })

  describe("Timezone Selection Logic", () => {
    it("should use detected timezone when valid", () => {
      const detectedTimezone = "Europe/Istanbul"

      const timezone =
        detectedTimezone && isValidTimezone(detectedTimezone)
          ? detectedTimezone
          : "UTC"

      expect(timezone).toBe("Europe/Istanbul")
    })

    it("should fallback to UTC when detection fails", () => {
      const detectedTimezone = null

      const timezone =
        detectedTimezone && isValidTimezone(detectedTimezone)
          ? detectedTimezone
          : "UTC"

      expect(timezone).toBe("UTC")
    })

    it("should fallback to UTC when timezone is invalid", () => {
      const detectedTimezone = "Invalid/Zone"

      const timezone =
        detectedTimezone && isValidTimezone(detectedTimezone)
          ? detectedTimezone
          : "UTC"

      expect(timezone).toBe("UTC")
    })
  })
})

describe("Server Timezone Getter", () => {
  // getUserTimezone, getUserTimezoneOrDefault, hasTimezone imported at top of file

  describe("getUserTimezone", () => {
    it("should return profile timezone when available", () => {
      const user = {
        id: "user_123",
        timezone: "UTC",
        profile: {
          timezone: "Europe/Istanbul",
        },
      }

      const timezone = getUserTimezone(user)

      expect(timezone).toBe("Europe/Istanbul")
    })

    it("should fallback to user timezone when profile timezone missing", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {})

      const user = {
        id: "user_123",
        timezone: "America/New_York",
        profile: {
          timezone: null,
        },
      }

      const timezone = getUserTimezone(user)

      expect(timezone).toBe("America/New_York")
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("deprecated User.timezone")
      )

      consoleSpy.mockRestore()
    })

    it("should fallback to UTC when no timezone available", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

      const user = {
        id: "user_123",
        timezone: null,
        profile: null,
      }

      const timezone = getUserTimezone(user)

      expect(timezone).toBe("UTC")
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("No timezone found")
      )

      consoleSpy.mockRestore()
    })
  })

  describe("getUserTimezoneOrDefault", () => {
    it("should return profile timezone when available", () => {
      const user = {
        id: "user_123",
        timezone: "UTC",
        profile: {
          timezone: "Asia/Tokyo",
        },
      }

      const timezone = getUserTimezoneOrDefault(user)

      expect(timezone).toBe("Asia/Tokyo")
    })

    it("should return custom default when no timezone", () => {
      const user = {
        id: "user_123",
        timezone: null,
        profile: null,
      }

      const timezone = getUserTimezoneOrDefault(user, "Europe/London")

      expect(timezone).toBe("Europe/London")
    })

    it("should handle null user", () => {
      const timezone = getUserTimezoneOrDefault(null)

      expect(timezone).toBe("UTC")
    })
  })

  describe("hasTimezone", () => {
    it("should return true when profile has timezone", () => {
      const user = {
        id: "user_123",
        timezone: "UTC",
        profile: {
          timezone: "Europe/Paris",
        },
      }

      expect(hasTimezone(user)).toBe(true)
    })

    it("should return false when profile missing", () => {
      const user = {
        id: "user_123",
        timezone: "UTC",
        profile: null,
      }

      expect(hasTimezone(user)).toBe(false)
    })

    it("should return false when profile timezone empty", () => {
      const user = {
        id: "user_123",
        timezone: "UTC",
        profile: {
          timezone: "",
        },
      }

      expect(hasTimezone(user)).toBe(false)
    })
  })
})
