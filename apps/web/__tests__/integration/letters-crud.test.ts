/**
 * Letters CRUD Integration Tests (App Router server actions)
 *
 * Focuses on validation, encryption/decryption flow, and data access guards.
 *
 * Note: Keep aligned with current paid-only flows; prefer updating fixtures over disabling.
 */

import { describe, it, expect, beforeEach, vi } from "vitest"
import { createLetter, updateLetter, deleteLetter, getLetterById } from "../../server/actions/letters"
import { ErrorCodes } from "@dearme/types"

const mockUser = {
  id: "user_test_123",
  email: "test@example.com",
  clerkUserId: "clerk_test_123",
}

vi.mock("../../server/lib/auth", () => ({
  requireUser: vi.fn(() => Promise.resolve(mockUser)),
}))

vi.mock("../../server/lib/encryption", () => ({
  encryptLetter: vi.fn(() =>
    Promise.resolve({
      bodyCiphertext: Buffer.from("encrypted_content"),
      bodyNonce: Buffer.from("test_nonce_12"),
      keyVersion: 1,
    })
  ),
  decryptLetter: vi.fn(() =>
    Promise.resolve({
      bodyRich: { type: "doc", content: [] },
      bodyHtml: "<p>Decrypted</p>",
    })
  ),
}))

vi.mock("../../server/lib/entitlements", () => ({
  trackLetterCreation: vi.fn(() => Promise.resolve()),
}))

const { mockPrisma } = vi.hoisted(() => {
  return {
    mockPrisma: {
      letter: {
        create: vi.fn(),
        findFirst: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
      },
    },
  }
})

vi.mock("../../server/lib/db", () => ({
  prisma: mockPrisma,
}))

vi.mock("../../server/lib/audit", () => ({
  createAuditEvent: vi.fn(() => Promise.resolve({ id: "audit_123" })),
}))

vi.mock("../../server/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock("../../server/lib/trigger-inngest", () => ({
  triggerInngestEvent: vi.fn(() => Promise.resolve("event_123")),
}))

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}))

describe("Letters CRUD", () => {
  it("smoke: letters actions available", () => {
    expect(createLetter).toBeDefined()
    expect(updateLetter).toBeDefined()
    expect(deleteLetter).toBeDefined()
    expect(getLetterById).toBeDefined()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("creates a letter successfully", async () => {
    mockPrisma.letter.create.mockResolvedValueOnce({
      id: "letter_123",
      userId: mockUser.id,
      title: "Test Letter",
      bodyCiphertext: Buffer.from("encrypted_content"),
      bodyNonce: Buffer.from("test_nonce_12"),
      bodyFormat: "rich",
      keyVersion: 1,
      visibility: "private",
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    })

    const result = await createLetter({
      title: "Test Letter",
      bodyRich: { type: "doc", content: [] },
      bodyHtml: "<p>Test</p>",
      visibility: "private",
      tags: [],
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.letterId).toBe("letter_123")
    }
  })

  it("rejects invalid payload", async () => {
    const result = await createLetter({ title: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe(ErrorCodes.VALIDATION_FAILED)
    }
  })

  it("returns not found on update when letter missing", async () => {
    mockPrisma.letter.findFirst.mockResolvedValueOnce(null)
    const result = await updateLetter({
      id: "550e8400-e29b-41d4-a716-446655440000",
      title: "Updated",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.code).toBe(ErrorCodes.NOT_FOUND)
    }
  })

  it("updates letter title", async () => {
    mockPrisma.letter.findFirst.mockResolvedValueOnce({
      id: "44444444-4444-4444-8444-444444444444",
      userId: mockUser.id,
      title: "Old",
      bodyCiphertext: Buffer.from("encrypted"),
      bodyNonce: Buffer.from("nonce"),
      bodyFormat: "rich",
      keyVersion: 1,
      visibility: "private",
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    })
    mockPrisma.letter.update.mockResolvedValueOnce({
      id: "44444444-4444-4444-8444-444444444444",
      userId: mockUser.id,
      title: "New Title",
      bodyCiphertext: Buffer.from("encrypted"),
      bodyNonce: Buffer.from("nonce"),
      bodyFormat: "rich",
      keyVersion: 1,
      visibility: "private",
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    })

    const result = await updateLetter({
      id: "44444444-4444-4444-8444-444444444444",
      title: "New Title",
    })
    expect(result.success).toBe(true)
  })

  it("soft deletes letter", async () => {
    const letterId = "55555555-5555-4555-8555-555555555555"
    mockPrisma.letter.findFirst.mockResolvedValueOnce({
      id: letterId,
      userId: mockUser.id,
      title: "Test",
      bodyCiphertext: Buffer.from("encrypted"),
      bodyNonce: Buffer.from("nonce"),
      bodyFormat: "rich",
      keyVersion: 1,
      visibility: "private",
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    })

    // Mock $transaction callback
    mockPrisma.$transaction = vi.fn(async (callback: any) => {
      const txMock = {
        letter: {
          update: vi.fn().mockResolvedValue({
            id: letterId,
            userId: mockUser.id,
            title: "Test",
            deletedAt: new Date(),
          })
        },
        delivery: {
          updateMany: vi.fn().mockResolvedValue({ count: 0 })
        }
      }
      return await callback(txMock)
    })

    const result = await deleteLetter(letterId)
    expect(result.success).toBe(true)
  })

  it("returns letter by id for owner", async () => {
    mockPrisma.letter.findUnique.mockResolvedValueOnce({
      id: "letter_123",
      userId: mockUser.id,
      title: "My Letter",
      bodyCiphertext: Buffer.from("encrypted"),
      bodyNonce: Buffer.from("nonce"),
      bodyFormat: "rich",
      keyVersion: 1,
      visibility: "private",
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    })

    const result = await getLetterById("letter_123")
    expect(result).not.toBeNull()
    if (result) {
      expect(result.id).toBe("letter_123")
      expect(result.bodyHtml).toBe("<p>Decrypted</p>")
    }
  })

  it("returns null when letter not found", async () => {
    mockPrisma.letter.findUnique.mockResolvedValueOnce(null)
    const result = await getLetterById("missing")
    expect(result).toBeNull()
  })
})
