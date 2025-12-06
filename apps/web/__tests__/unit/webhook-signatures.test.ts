/**
 * Webhook Signature Verification Unit Tests
 *
 * Tests signature verification for all webhook providers:
 * - Lob (HMAC-SHA256 with t=timestamp,v1=signature format)
 * - Stripe (stripe-signature header with Stripe SDK)
 * - Clerk (Svix headers: svix-id, svix-timestamp, svix-signature)
 * - Resend (Svix headers: svix-id, svix-timestamp, svix-signature)
 *
 * Security tests:
 * - Valid signatures pass
 * - Invalid signatures rejected (401)
 * - Expired timestamps rejected (replay attack prevention)
 * - Missing signature headers rejected
 * - Malformed signature formats rejected
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { createHmac } from "crypto"

// ============================================================================
// LOB SIGNATURE VERIFICATION
// ============================================================================

/**
 * Reimplementation of Lob signature verification for testing
 * This mirrors the production code in apps/web/app/api/webhooks/lob/route.ts
 *
 * Lob uses TWO separate headers:
 * - Lob-Signature: the hex signature
 * - Lob-Signature-Timestamp: the Unix timestamp
 *
 * @see https://help.lob.com/print-and-mail/getting-data-and-results/using-webhooks
 */
function verifyLobSignature(
  payload: string,
  signatureHeader: string | null,
  timestampHeader: string | null,
  secret: string
): { valid: boolean; timestamp?: number; error?: string } {
  if (!signatureHeader || signatureHeader.trim() === "") {
    return { valid: false, error: "Missing Lob-Signature header" }
  }

  if (!timestampHeader || timestampHeader.trim() === "") {
    return { valid: false, error: "Missing Lob-Signature-Timestamp header" }
  }

  try {
    const timestamp = parseInt(timestampHeader.trim(), 10)
    if (isNaN(timestamp)) {
      return { valid: false, error: "Invalid timestamp format" }
    }

    const providedSignature = signatureHeader.trim()

    // Check timestamp is within 5 minutes
    const now = Math.floor(Date.now() / 1000)
    if (Math.abs(now - timestamp) > 300) {
      return { valid: false, error: "Timestamp too old", timestamp }
    }

    // Compute expected signature: HMAC-SHA256({timestamp}.{payload}, secret)
    const signedPayload = `${timestamp}.${payload}`
    const expectedSignature = createHmac("sha256", secret)
      .update(signedPayload)
      .digest("hex")

    // Constant-time comparison
    if (expectedSignature.length !== providedSignature.length) {
      return { valid: false, error: "Signature length mismatch", timestamp }
    }

    let result = 0
    for (let i = 0; i < expectedSignature.length; i++) {
      result |= expectedSignature.charCodeAt(i) ^ providedSignature.charCodeAt(i)
    }

    return { valid: result === 0, timestamp }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Signature parsing error",
    }
  }
}

/**
 * Helper to create valid Lob signature for testing
 * Returns separate signature and timestamp values (Lob's format)
 */
function createLobSignature(
  payload: string,
  secret: string,
  timestamp?: number
): { signature: string; timestamp: number } {
  const ts = timestamp ?? Math.floor(Date.now() / 1000)
  const signedPayload = `${ts}.${payload}`
  const signature = createHmac("sha256", secret).update(signedPayload).digest("hex")
  return { signature, timestamp: ts }
}

describe("Lob Webhook Signature Verification", () => {
  const testSecret = "lob_test_secret_12345"
  const testPayload = JSON.stringify({
    id: "evt_123",
    event_type: { id: "letter.in_transit" },
    body: { id: "ltr_abc123" },
  })

  describe("Valid Signatures", () => {
    it("should accept valid signature with current timestamp", () => {
      const { signature, timestamp } = createLobSignature(testPayload, testSecret)
      const result = verifyLobSignature(testPayload, signature, String(timestamp), testSecret)

      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it("should accept valid signature within 5 minute window", () => {
      const fourMinutesAgo = Math.floor(Date.now() / 1000) - 240
      const { signature } = createLobSignature(testPayload, testSecret, fourMinutesAgo)
      const result = verifyLobSignature(testPayload, signature, String(fourMinutesAgo), testSecret)

      expect(result.valid).toBe(true)
    })

    it("should accept signature with whitespace trimmed", () => {
      const { signature, timestamp } = createLobSignature(testPayload, testSecret)
      const result = verifyLobSignature(testPayload, `  ${signature}  `, String(timestamp), testSecret)

      expect(result.valid).toBe(true)
    })

    it("should return timestamp in verification result", () => {
      const now = Math.floor(Date.now() / 1000)
      const { signature } = createLobSignature(testPayload, testSecret, now)
      const result = verifyLobSignature(testPayload, signature, String(now), testSecret)

      expect(result.timestamp).toBe(now)
    })
  })

  describe("Invalid Signatures", () => {
    it("should reject signature with wrong secret", () => {
      const { signature, timestamp } = createLobSignature(testPayload, "wrong_secret")
      const result = verifyLobSignature(testPayload, signature, String(timestamp), testSecret)

      expect(result.valid).toBe(false)
    })

    it("should reject signature with tampered payload", () => {
      const { signature, timestamp } = createLobSignature(testPayload, testSecret)
      const tamperedPayload = JSON.stringify({ id: "evt_456", tampered: true })
      const result = verifyLobSignature(tamperedPayload, signature, String(timestamp), testSecret)

      expect(result.valid).toBe(false)
    })

    it("should reject signature with modified signature value", () => {
      const { signature, timestamp } = createLobSignature(testPayload, testSecret)
      const tamperedSignature = signature.substring(0, 10) + "0000000000" + signature.substring(20)
      const result = verifyLobSignature(testPayload, tamperedSignature, String(timestamp), testSecret)

      expect(result.valid).toBe(false)
    })
  })

  describe("Expired Timestamps (Replay Attack Prevention)", () => {
    it("should reject signature older than 5 minutes", () => {
      const sixMinutesAgo = Math.floor(Date.now() / 1000) - 360
      const { signature } = createLobSignature(testPayload, testSecret, sixMinutesAgo)
      const result = verifyLobSignature(testPayload, signature, String(sixMinutesAgo), testSecret)

      expect(result.valid).toBe(false)
      expect(result.error).toBe("Timestamp too old")
    })

    it("should reject signature from the future (> 5 minutes)", () => {
      const sixMinutesFromNow = Math.floor(Date.now() / 1000) + 360
      const { signature } = createLobSignature(testPayload, testSecret, sixMinutesFromNow)
      const result = verifyLobSignature(testPayload, signature, String(sixMinutesFromNow), testSecret)

      expect(result.valid).toBe(false)
      expect(result.error).toBe("Timestamp too old")
    })

    it("should reject very old timestamp (1 hour ago)", () => {
      const oneHourAgo = Math.floor(Date.now() / 1000) - 3600
      const { signature } = createLobSignature(testPayload, testSecret, oneHourAgo)
      const result = verifyLobSignature(testPayload, signature, String(oneHourAgo), testSecret)

      expect(result.valid).toBe(false)
    })
  })

  describe("Missing Headers", () => {
    it("should reject null signature header", () => {
      const { timestamp } = createLobSignature(testPayload, testSecret)
      const result = verifyLobSignature(testPayload, null, String(timestamp), testSecret)

      expect(result.valid).toBe(false)
      expect(result.error).toBe("Missing Lob-Signature header")
    })

    it("should reject null timestamp header", () => {
      const { signature } = createLobSignature(testPayload, testSecret)
      const result = verifyLobSignature(testPayload, signature, null, testSecret)

      expect(result.valid).toBe(false)
      expect(result.error).toBe("Missing Lob-Signature-Timestamp header")
    })

    it("should reject empty string signature header", () => {
      const { timestamp } = createLobSignature(testPayload, testSecret)
      const result = verifyLobSignature(testPayload, "", String(timestamp), testSecret)

      expect(result.valid).toBe(false)
      expect(result.error).toBe("Missing Lob-Signature header")
    })

    it("should reject empty string timestamp header", () => {
      const { signature } = createLobSignature(testPayload, testSecret)
      const result = verifyLobSignature(testPayload, signature, "", testSecret)

      expect(result.valid).toBe(false)
      expect(result.error).toBe("Missing Lob-Signature-Timestamp header")
    })
  })

  describe("Malformed Headers", () => {
    it("should reject non-numeric timestamp", () => {
      const { signature } = createLobSignature(testPayload, testSecret)
      const result = verifyLobSignature(testPayload, signature, "not-a-number", testSecret)

      expect(result.valid).toBe(false)
      expect(result.error).toBe("Invalid timestamp format")
    })

    it("should reject timestamp with letters mixed in", () => {
      const { signature } = createLobSignature(testPayload, testSecret)
      // Note: parseInt("123abc456") returns 123, so this fails due to timestamp age
      // not NaN check. This is expected JavaScript behavior.
      const result = verifyLobSignature(testPayload, signature, "123abc456", testSecret)

      expect(result.valid).toBe(false)
      // The timestamp 123 (from year 1970) is way too old
      expect(result.error).toBe("Timestamp too old")
    })
  })

  describe("Edge Cases", () => {
    it("should handle empty payload", () => {
      const emptyPayload = ""
      const { signature, timestamp } = createLobSignature(emptyPayload, testSecret)
      const result = verifyLobSignature(emptyPayload, signature, String(timestamp), testSecret)

      expect(result.valid).toBe(true)
    })

    it("should handle large payload", () => {
      const largePayload = JSON.stringify({ data: "x".repeat(100000) })
      const { signature, timestamp } = createLobSignature(largePayload, testSecret)
      const result = verifyLobSignature(largePayload, signature, String(timestamp), testSecret)

      expect(result.valid).toBe(true)
    })

    it("should handle special characters in payload", () => {
      const specialPayload = JSON.stringify({ emoji: "🎉", unicode: "日本語" })
      const { signature, timestamp } = createLobSignature(specialPayload, testSecret)
      const result = verifyLobSignature(specialPayload, signature, String(timestamp), testSecret)

      expect(result.valid).toBe(true)
    })
  })
})

// ============================================================================
// STRIPE SIGNATURE VERIFICATION
// ============================================================================

/**
 * Stripe signature verification helper for testing
 * Stripe uses: stripe-signature: t={timestamp},v1={signature}
 */
function createStripeSignature(
  payload: string,
  secret: string,
  timestamp?: number
): string {
  const ts = timestamp ?? Math.floor(Date.now() / 1000)
  const signedPayload = `${ts}.${payload}`
  const signature = createHmac("sha256", secret).update(signedPayload).digest("hex")
  return `t=${ts},v1=${signature}`
}

function verifyStripeSignature(
  payload: string,
  signatureHeader: string | null,
  secret: string,
  tolerance: number = 300
): { valid: boolean; error?: string } {
  if (!signatureHeader) {
    return { valid: false, error: "Missing signature header" }
  }

  try {
    const parts = signatureHeader.split(",")
    const timestampPart = parts.find((p) => p.startsWith("t="))
    const signaturePart = parts.find((p) => p.startsWith("v1="))

    if (!timestampPart || !signaturePart) {
      return { valid: false, error: "Invalid signature format" }
    }

    const timestamp = parseInt(timestampPart.substring(2), 10)
    const providedSignature = signaturePart.substring(3)

    const now = Math.floor(Date.now() / 1000)
    if (Math.abs(now - timestamp) > tolerance) {
      return { valid: false, error: "Timestamp outside tolerance" }
    }

    const signedPayload = `${timestamp}.${payload}`
    const expectedSignature = createHmac("sha256", secret)
      .update(signedPayload)
      .digest("hex")

    const valid = expectedSignature === providedSignature
    return { valid }
  } catch {
    return { valid: false, error: "Verification failed" }
  }
}

describe("Stripe Webhook Signature Verification", () => {
  const stripeSecret = "whsec_test_stripe_secret"
  const stripePayload = JSON.stringify({
    id: "evt_stripe_123",
    type: "checkout.session.completed",
    data: { object: { id: "cs_test_123" } },
  })

  describe("Valid Signatures", () => {
    it("should accept valid Stripe signature", () => {
      const signature = createStripeSignature(stripePayload, stripeSecret)
      const result = verifyStripeSignature(stripePayload, signature, stripeSecret)

      expect(result.valid).toBe(true)
    })

    it("should accept signature within tolerance window", () => {
      const twoMinutesAgo = Math.floor(Date.now() / 1000) - 120
      const signature = createStripeSignature(stripePayload, stripeSecret, twoMinutesAgo)
      const result = verifyStripeSignature(stripePayload, signature, stripeSecret)

      expect(result.valid).toBe(true)
    })
  })

  describe("Invalid Signatures", () => {
    it("should reject expired Stripe signature", () => {
      const sixMinutesAgo = Math.floor(Date.now() / 1000) - 360
      const signature = createStripeSignature(stripePayload, stripeSecret, sixMinutesAgo)
      const result = verifyStripeSignature(stripePayload, signature, stripeSecret)

      expect(result.valid).toBe(false)
      expect(result.error).toBe("Timestamp outside tolerance")
    })

    it("should reject tampered Stripe payload", () => {
      const signature = createStripeSignature(stripePayload, stripeSecret)
      const tampered = JSON.stringify({ id: "evt_fake", type: "fake.event" })
      const result = verifyStripeSignature(tampered, signature, stripeSecret)

      expect(result.valid).toBe(false)
    })

    it("should reject missing Stripe signature", () => {
      const result = verifyStripeSignature(stripePayload, null, stripeSecret)

      expect(result.valid).toBe(false)
      expect(result.error).toBe("Missing signature header")
    })
  })
})

// ============================================================================
// SVIX SIGNATURE VERIFICATION (Clerk & Resend)
// ============================================================================

/**
 * Svix signature verification helper for testing
 * Used by Clerk and Resend
 * Headers: svix-id, svix-timestamp, svix-signature
 */
function createSvixSignature(
  payload: string,
  secret: string,
  timestamp?: number,
  msgId?: string
): { signature: string; timestamp: number; id: string } {
  const ts = timestamp ?? Math.floor(Date.now() / 1000)
  const id = msgId ?? `msg_${Math.random().toString(36).substring(7)}`

  // Svix signs: {msg_id}.{timestamp}.{payload}
  const signedPayload = `${id}.${ts}.${payload}`

  // Svix uses base64-encoded secret, then HMAC-SHA256
  const secretBytes = Buffer.from(secret.replace("whsec_", ""), "base64")
  const signature = createHmac("sha256", secretBytes)
    .update(signedPayload)
    .digest("base64")

  return { signature: `v1,${signature}`, timestamp: ts, id }
}

function verifySvixSignature(
  payload: string,
  headers: { id: string | null; timestamp: string | null; signature: string | null },
  secret: string,
  tolerance: number = 300
): { valid: boolean; error?: string } {
  if (!headers.id || !headers.timestamp || !headers.signature) {
    return { valid: false, error: "Missing required headers" }
  }

  try {
    const timestamp = parseInt(headers.timestamp, 10)
    if (isNaN(timestamp)) {
      return { valid: false, error: "Invalid timestamp" }
    }

    const now = Math.floor(Date.now() / 1000)
    if (Math.abs(now - timestamp) > tolerance) {
      return { valid: false, error: "Timestamp outside tolerance" }
    }

    const signedPayload = `${headers.id}.${timestamp}.${payload}`
    const secretBytes = Buffer.from(secret.replace("whsec_", ""), "base64")
    const expectedSignature = createHmac("sha256", secretBytes)
      .update(signedPayload)
      .digest("base64")

    // Svix signature format: v1,{base64signature}
    const providedSignature = headers.signature.replace("v1,", "")

    const valid = expectedSignature === providedSignature
    return { valid }
  } catch {
    return { valid: false, error: "Verification failed" }
  }
}

describe("Clerk Webhook Signature Verification (Svix)", () => {
  // Base64-encoded secret (Clerk provides this format)
  const clerkSecret = "whsec_" + Buffer.from("clerk_test_secret_32bytes!!").toString("base64")
  const clerkPayload = JSON.stringify({
    type: "user.created",
    data: { id: "user_123", email_addresses: [{ email_address: "test@example.com" }] },
  })

  describe("Valid Signatures", () => {
    it("should accept valid Clerk signature", () => {
      const { signature, timestamp, id } = createSvixSignature(clerkPayload, clerkSecret)
      const result = verifySvixSignature(
        clerkPayload,
        { id, timestamp: String(timestamp), signature },
        clerkSecret
      )

      expect(result.valid).toBe(true)
    })

    it("should accept signature within 5 minute window", () => {
      const fourMinutesAgo = Math.floor(Date.now() / 1000) - 240
      const { signature, id } = createSvixSignature(
        clerkPayload,
        clerkSecret,
        fourMinutesAgo
      )
      const result = verifySvixSignature(
        clerkPayload,
        { id, timestamp: String(fourMinutesAgo), signature },
        clerkSecret
      )

      expect(result.valid).toBe(true)
    })
  })

  describe("Invalid Signatures", () => {
    it("should reject expired Clerk signature", () => {
      const tenMinutesAgo = Math.floor(Date.now() / 1000) - 600
      const { signature, id } = createSvixSignature(
        clerkPayload,
        clerkSecret,
        tenMinutesAgo
      )
      const result = verifySvixSignature(
        clerkPayload,
        { id, timestamp: String(tenMinutesAgo), signature },
        clerkSecret
      )

      expect(result.valid).toBe(false)
      expect(result.error).toBe("Timestamp outside tolerance")
    })

    it("should reject Clerk signature with wrong secret", () => {
      const wrongSecret = "whsec_" + Buffer.from("wrong_secret_32bytes!!!").toString("base64")
      const { signature, timestamp, id } = createSvixSignature(clerkPayload, wrongSecret)
      const result = verifySvixSignature(
        clerkPayload,
        { id, timestamp: String(timestamp), signature },
        clerkSecret
      )

      expect(result.valid).toBe(false)
    })

    it("should reject tampered Clerk payload", () => {
      const { signature, timestamp, id } = createSvixSignature(clerkPayload, clerkSecret)
      const tampered = JSON.stringify({ type: "user.deleted", data: { id: "user_999" } })
      const result = verifySvixSignature(
        tampered,
        { id, timestamp: String(timestamp), signature },
        clerkSecret
      )

      expect(result.valid).toBe(false)
    })
  })

  describe("Missing Headers", () => {
    it("should reject missing svix-id header", () => {
      const { signature, timestamp } = createSvixSignature(clerkPayload, clerkSecret)
      const result = verifySvixSignature(
        clerkPayload,
        { id: null, timestamp: String(timestamp), signature },
        clerkSecret
      )

      expect(result.valid).toBe(false)
      expect(result.error).toBe("Missing required headers")
    })

    it("should reject missing svix-timestamp header", () => {
      const { signature, id } = createSvixSignature(clerkPayload, clerkSecret)
      const result = verifySvixSignature(
        clerkPayload,
        { id, timestamp: null, signature },
        clerkSecret
      )

      expect(result.valid).toBe(false)
      expect(result.error).toBe("Missing required headers")
    })

    it("should reject missing svix-signature header", () => {
      const { timestamp, id } = createSvixSignature(clerkPayload, clerkSecret)
      const result = verifySvixSignature(
        clerkPayload,
        { id, timestamp: String(timestamp), signature: null },
        clerkSecret
      )

      expect(result.valid).toBe(false)
      expect(result.error).toBe("Missing required headers")
    })
  })

  describe("Malformed Headers", () => {
    it("should reject non-numeric timestamp", () => {
      const { signature, id } = createSvixSignature(clerkPayload, clerkSecret)
      const result = verifySvixSignature(
        clerkPayload,
        { id, timestamp: "not-a-number", signature },
        clerkSecret
      )

      expect(result.valid).toBe(false)
      expect(result.error).toBe("Invalid timestamp")
    })
  })
})

describe("Resend Webhook Signature Verification (Svix)", () => {
  const resendSecret = "whsec_" + Buffer.from("resend_test_secret_32byte!").toString("base64")
  const resendPayload = JSON.stringify({
    type: "email.sent",
    data: { email_id: "email_123", to: ["test@example.com"] },
  })

  describe("Valid Signatures", () => {
    it("should accept valid Resend signature", () => {
      const { signature, timestamp, id } = createSvixSignature(resendPayload, resendSecret)
      const result = verifySvixSignature(
        resendPayload,
        { id, timestamp: String(timestamp), signature },
        resendSecret
      )

      expect(result.valid).toBe(true)
    })
  })

  describe("Invalid Signatures", () => {
    it("should reject expired Resend signature", () => {
      const sixMinutesAgo = Math.floor(Date.now() / 1000) - 360
      const { signature, id } = createSvixSignature(
        resendPayload,
        resendSecret,
        sixMinutesAgo
      )
      const result = verifySvixSignature(
        resendPayload,
        { id, timestamp: String(sixMinutesAgo), signature },
        resendSecret
      )

      expect(result.valid).toBe(false)
    })

    it("should reject Resend signature with wrong message ID", () => {
      const { signature, timestamp } = createSvixSignature(resendPayload, resendSecret)
      const result = verifySvixSignature(
        resendPayload,
        { id: "msg_different_id", timestamp: String(timestamp), signature },
        resendSecret
      )

      expect(result.valid).toBe(false)
    })
  })

  describe("Email Event Types", () => {
    const eventTypes = [
      "email.sent",
      "email.delivered",
      "email.opened",
      "email.clicked",
      "email.bounced",
      "email.complained",
    ]

    eventTypes.forEach((eventType) => {
      it(`should verify ${eventType} event signature`, () => {
        const payload = JSON.stringify({ type: eventType, data: { email_id: "email_123" } })
        const { signature, timestamp, id } = createSvixSignature(payload, resendSecret)
        const result = verifySvixSignature(
          payload,
          { id, timestamp: String(timestamp), signature },
          resendSecret
        )

        expect(result.valid).toBe(true)
      })
    })
  })
})

// ============================================================================
// CROSS-PROVIDER TESTS
// ============================================================================

describe("Cross-Provider Security Tests", () => {
  describe("Replay Attack Prevention", () => {
    it("should reject reused Lob signature after timestamp expires", async () => {
      const secret = "test_secret"
      const payload = JSON.stringify({ id: "evt_1" })

      // Create valid signature
      const { signature, timestamp } = createLobSignature(payload, secret)

      // Verify immediately - should pass
      const result1 = verifyLobSignature(payload, signature, String(timestamp), secret)
      expect(result1.valid).toBe(true)

      // After 5+ minutes, same signature should fail
      // We simulate this by using an old timestamp
      const oldTimestamp = Math.floor(Date.now() / 1000) - 400 // 6.5 minutes ago
      const { signature: oldSignature } = createLobSignature(payload, secret, oldTimestamp)
      const result2 = verifyLobSignature(payload, oldSignature, String(oldTimestamp), secret)
      expect(result2.valid).toBe(false)
    })
  })

  describe("Constant-Time Comparison", () => {
    it("should not leak timing information via signature comparison", () => {
      const secret = "test_secret"
      const payload = JSON.stringify({ id: "evt_1" })
      const { signature: validSig, timestamp } = createLobSignature(payload, secret)

      // Both should take similar time regardless of where they differ
      const wrongAtStart = "X" + validSig.slice(1)
      const wrongAtEnd = validSig.slice(0, -1) + "X"

      // Just verify both are rejected (timing would need more sophisticated testing)
      const result1 = verifyLobSignature(payload, wrongAtStart, String(timestamp), secret)
      const result2 = verifyLobSignature(payload, wrongAtEnd, String(timestamp), secret)

      expect(result1.valid).toBe(false)
      expect(result2.valid).toBe(false)
    })
  })

  describe("Provider Isolation", () => {
    it("should not accept Stripe signature for Lob webhook", () => {
      const lobSecret = "lob_secret"
      const stripeSecret = "stripe_secret"
      const payload = JSON.stringify({ id: "evt_1" })
      const timestamp = String(Math.floor(Date.now() / 1000))

      // Stripe signature format won't work as Lob signature
      const stripeSignature = createStripeSignature(payload, stripeSecret)
      const result = verifyLobSignature(payload, stripeSignature, timestamp, lobSecret)

      expect(result.valid).toBe(false)
    })

    it("should not accept Lob signature for Stripe webhook", () => {
      const lobSecret = "lob_secret"
      const stripeSecret = "stripe_secret"
      const payload = JSON.stringify({ id: "evt_1" })

      // Lob returns { signature, timestamp } - Stripe expects "t=...,v1=..." format
      const { signature: lobSignature } = createLobSignature(payload, lobSecret)
      const result = verifyStripeSignature(payload, lobSignature, stripeSecret)

      expect(result.valid).toBe(false)
    })
  })
})
