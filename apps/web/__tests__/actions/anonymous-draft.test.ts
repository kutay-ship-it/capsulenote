/**
 * Anonymous Draft Server Actions Tests
 *
 * Tests for anonymous-draft.ts server actions covering:
 * - saveAnonymousDraft
 * - getAnonymousDrafts
 * - claimAnonymousDraft
 * - deleteAnonymousDraft
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import {
  saveAnonymousDraft,
  getAnonymousDrafts,
  claimAnonymousDraft,
  deleteAnonymousDraft,
  type DraftContent,
} from "@/server/actions/anonymous-draft"

// ============================================================================
// Mocks
// ============================================================================

// Mock cookies
const mockCookieGet = vi.fn()
const mockCookieSet = vi.fn()
vi.mock("next/headers", () => ({
  cookies: () => Promise.resolve({
    get: mockCookieGet,
    set: mockCookieSet,
  }),
}))

// Mock prisma
const mockAnonymousDraftFindFirst = vi.fn()
const mockAnonymousDraftFindMany = vi.fn()
const mockAnonymousDraftFindUnique = vi.fn()
const mockAnonymousDraftCreate = vi.fn()
const mockAnonymousDraftUpdate = vi.fn()
const mockAnonymousDraftDelete = vi.fn()
const mockUserFindUnique = vi.fn()

vi.mock("@/server/lib/db", () => ({
  prisma: {
    anonymousDraft: {
      findFirst: (...args: any[]) => mockAnonymousDraftFindFirst(...args),
      findMany: (...args: any[]) => mockAnonymousDraftFindMany(...args),
      findUnique: (...args: any[]) => mockAnonymousDraftFindUnique(...args),
      create: (...args: any[]) => mockAnonymousDraftCreate(...args),
      update: (...args: any[]) => mockAnonymousDraftUpdate(...args),
      delete: (...args: any[]) => mockAnonymousDraftDelete(...args),
    },
    user: {
      findUnique: (...args: any[]) => mockUserFindUnique(...args),
    },
  },
}))

// Mock crypto.randomUUID
const mockRandomUUID = vi.fn()
vi.stubGlobal("crypto", {
  randomUUID: () => mockRandomUUID(),
})

// ============================================================================
// Test Utilities
// ============================================================================

function createMockDraftContent(overrides: Partial<DraftContent> = {}): DraftContent {
  return {
    title: "Test Letter",
    body: "Dear future me, this is a test...",
    recipientEmail: "recipient@example.com",
    deliveryDate: "2025-12-25",
    ...overrides,
  }
}

function createMockDraft(overrides: Partial<any> = {}) {
  return {
    id: `draft_${Math.random().toString(36).slice(2)}`,
    sessionId: "session_123",
    email: "user@example.com",
    title: "Test Letter",
    body: "Dear future me...",
    recipientEmail: "recipient@example.com",
    deliveryDate: "2025-12-25",
    claimedAt: null,
    claimedByUserId: null,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

// ============================================================================
// Tests
// ============================================================================

describe("Anonymous Draft Server Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCookieGet.mockReturnValue({ value: "session_123" })
    mockRandomUUID.mockReturnValue("generated_session_id")
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  // --------------------------------------------------------------------------
  // saveAnonymousDraft Tests
  // --------------------------------------------------------------------------

  describe("saveAnonymousDraft", () => {
    describe("Session Management", () => {
      it("should use existing sessionId from cookie", async () => {
        mockCookieGet.mockReturnValue({ value: "existing_session" })
        mockAnonymousDraftFindFirst.mockResolvedValue(null)
        mockAnonymousDraftCreate.mockResolvedValue(createMockDraft({ sessionId: "existing_session" }))

        await saveAnonymousDraft({
          content: createMockDraftContent(),
          email: "user@example.com",
        })

        expect(mockCookieSet).not.toHaveBeenCalled()
        expect(mockAnonymousDraftFindFirst).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              sessionId: "existing_session",
            }),
          })
        )
      })

      it("should create new sessionId when cookie is missing", async () => {
        mockCookieGet.mockReturnValue(undefined)
        mockAnonymousDraftFindFirst.mockResolvedValue(null)
        mockAnonymousDraftCreate.mockResolvedValue(createMockDraft())

        await saveAnonymousDraft({
          content: createMockDraftContent(),
          email: "user@example.com",
        })

        expect(mockCookieSet).toHaveBeenCalledWith(
          "sessionId",
          "generated_session_id",
          expect.objectContaining({
            httpOnly: true,
            sameSite: "lax",
            maxAge: expect.any(Number),
          })
        )
      })
    })

    describe("Draft Creation", () => {
      it("should create new draft when none exists", async () => {
        mockAnonymousDraftFindFirst.mockResolvedValue(null)
        const createdDraft = createMockDraft({ id: "new_draft_123" })
        mockAnonymousDraftCreate.mockResolvedValue(createdDraft)

        const content = createMockDraftContent({
          title: "New Letter",
          body: "Content here",
        })

        const result = await saveAnonymousDraft({
          content,
          email: "User@Example.Com",
        })

        expect(result.success).toBe(true)
        expect(result.draftId).toBe("new_draft_123")
        expect(mockAnonymousDraftCreate).toHaveBeenCalledWith({
          data: expect.objectContaining({
            sessionId: "session_123",
            email: "user@example.com", // Lowercased
            title: "New Letter",
            body: "Content here",
            recipientEmail: "recipient@example.com",
            deliveryDate: "2025-12-25",
            expiresAt: expect.any(Date),
          }),
        })
      })

      it("should lowercase email addresses", async () => {
        mockAnonymousDraftFindFirst.mockResolvedValue(null)
        mockAnonymousDraftCreate.mockResolvedValue(createMockDraft())

        const content = createMockDraftContent({
          recipientEmail: "Recipient@EXAMPLE.COM",
        })

        await saveAnonymousDraft({
          content,
          email: "USER@Example.com",
        })

        expect(mockAnonymousDraftCreate).toHaveBeenCalledWith({
          data: expect.objectContaining({
            email: "user@example.com",
            recipientEmail: "recipient@example.com",
          }),
        })
      })

      it("should set expiration to 7 days from now", async () => {
        mockAnonymousDraftFindFirst.mockResolvedValue(null)
        mockAnonymousDraftCreate.mockResolvedValue(createMockDraft())

        const beforeCall = Date.now()
        await saveAnonymousDraft({
          content: createMockDraftContent(),
          email: "user@example.com",
        })
        const afterCall = Date.now()

        const callArg = mockAnonymousDraftCreate.mock.calls[0][0].data
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
        const expiresAt = callArg.expiresAt.getTime()

        expect(expiresAt).toBeGreaterThanOrEqual(beforeCall + sevenDaysMs - 1000)
        expect(expiresAt).toBeLessThanOrEqual(afterCall + sevenDaysMs + 1000)
      })
    })

    describe("Draft Update", () => {
      it("should update existing draft instead of creating new", async () => {
        const existingDraft = createMockDraft({ id: "existing_123" })
        mockAnonymousDraftFindFirst.mockResolvedValue(existingDraft)
        mockAnonymousDraftUpdate.mockResolvedValue({ ...existingDraft, title: "Updated Title" })

        const result = await saveAnonymousDraft({
          content: createMockDraftContent({ title: "Updated Title" }),
          email: "user@example.com",
        })

        expect(result.success).toBe(true)
        expect(mockAnonymousDraftCreate).not.toHaveBeenCalled()
        expect(mockAnonymousDraftUpdate).toHaveBeenCalledWith({
          where: { id: "existing_123" },
          data: expect.objectContaining({
            title: "Updated Title",
          }),
        })
      })

      it("should extend expiration when updating existing draft", async () => {
        const existingDraft = createMockDraft({
          expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day left
        })
        mockAnonymousDraftFindFirst.mockResolvedValue(existingDraft)
        mockAnonymousDraftUpdate.mockResolvedValue(existingDraft)

        await saveAnonymousDraft({
          content: createMockDraftContent(),
          email: "user@example.com",
        })

        const callArg = mockAnonymousDraftUpdate.mock.calls[0][0].data
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
        expect(callArg.expiresAt.getTime()).toBeGreaterThan(Date.now() + 6 * 24 * 60 * 60 * 1000)
      })

      it("should only match unclaimed drafts", async () => {
        mockAnonymousDraftFindFirst.mockResolvedValue(null)
        mockAnonymousDraftCreate.mockResolvedValue(createMockDraft())

        await saveAnonymousDraft({
          content: createMockDraftContent(),
          email: "user@example.com",
        })

        expect(mockAnonymousDraftFindFirst).toHaveBeenCalledWith({
          where: expect.objectContaining({
            claimedAt: null,
          }),
        })
      })
    })

    describe("Race Condition Handling", () => {
      it("should retry on unique constraint violation", async () => {
        mockAnonymousDraftFindFirst.mockResolvedValue(null)

        // First create fails with unique constraint, second succeeds
        const prismaError = new Error("Unique constraint") as any
        prismaError.code = "P2002"
        mockAnonymousDraftCreate
          .mockRejectedValueOnce(prismaError)

        // Second attempt finds the existing draft and updates it
        const existingDraft = createMockDraft({ id: "race_created" })
        mockAnonymousDraftFindFirst
          .mockResolvedValueOnce(null) // First call
          .mockResolvedValueOnce(existingDraft) // Second call after retry
        mockAnonymousDraftUpdate.mockResolvedValue(existingDraft)

        const result = await saveAnonymousDraft({
          content: createMockDraftContent(),
          email: "user@example.com",
        })

        expect(result.success).toBe(true)
        expect(mockAnonymousDraftFindFirst).toHaveBeenCalledTimes(2)
      })

      it("should fail after max retry attempts", async () => {
        mockAnonymousDraftFindFirst.mockResolvedValue(null)

        const prismaError = new Error("Unique constraint") as any
        prismaError.code = "P2002"
        mockAnonymousDraftCreate.mockRejectedValue(prismaError)

        const result = await saveAnonymousDraft({
          content: createMockDraftContent(),
          email: "user@example.com",
        })

        expect(result.success).toBe(false)
        expect(result.error).toContain("Failed to save draft after")
      })

      it("should not retry on non-constraint errors", async () => {
        mockAnonymousDraftFindFirst.mockResolvedValue(null)
        mockAnonymousDraftCreate.mockRejectedValue(new Error("Database connection error"))

        const result = await saveAnonymousDraft({
          content: createMockDraftContent(),
          email: "user@example.com",
        })

        expect(result.success).toBe(false)
        expect(result.error).toBe("Database connection error")
        expect(mockAnonymousDraftFindFirst).toHaveBeenCalledTimes(1)
      })
    })

    describe("Error Handling", () => {
      it("should return error on database failure", async () => {
        mockAnonymousDraftFindFirst.mockRejectedValue(new Error("Database error"))

        const result = await saveAnonymousDraft({
          content: createMockDraftContent(),
          email: "user@example.com",
        })

        expect(result.success).toBe(false)
        expect(result.error).toBe("Database error")
      })

      it("should handle non-Error exceptions", async () => {
        mockAnonymousDraftFindFirst.mockRejectedValue("String error")

        const result = await saveAnonymousDraft({
          content: createMockDraftContent(),
          email: "user@example.com",
        })

        expect(result.success).toBe(false)
        expect(result.error).toBe("Failed to save draft")
      })
    })
  })

  // --------------------------------------------------------------------------
  // getAnonymousDrafts Tests
  // --------------------------------------------------------------------------

  describe("getAnonymousDrafts", () => {
    describe("Session-Bound Retrieval", () => {
      it("should retrieve drafts for current session only", async () => {
        const drafts = [
          createMockDraft({ id: "draft_1", title: "Letter 1" }),
          createMockDraft({ id: "draft_2", title: "Letter 2" }),
        ]
        mockAnonymousDraftFindMany.mockResolvedValue(drafts)

        const result = await getAnonymousDrafts()

        expect(result.drafts).toHaveLength(2)
        expect(mockAnonymousDraftFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              sessionId: "session_123",
            }),
          })
        )
      })

      it("should only return unclaimed drafts", async () => {
        mockAnonymousDraftFindMany.mockResolvedValue([])

        await getAnonymousDrafts()

        expect(mockAnonymousDraftFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              claimedAt: null,
            }),
          })
        )
      })

      it("should only return non-expired drafts", async () => {
        mockAnonymousDraftFindMany.mockResolvedValue([])

        await getAnonymousDrafts()

        expect(mockAnonymousDraftFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              expiresAt: { gt: expect.any(Date) },
            }),
          })
        )
      })
    })

    describe("Draft Formatting", () => {
      it("should format drafts with content object", async () => {
        const drafts = [
          createMockDraft({
            id: "draft_1",
            title: "Test Title",
            body: "Test Body",
            recipientEmail: "test@example.com",
            deliveryDate: "2025-06-15",
          }),
        ]
        mockAnonymousDraftFindMany.mockResolvedValue(drafts)

        const result = await getAnonymousDrafts()

        expect(result.drafts[0]).toMatchObject({
          id: "draft_1",
          content: {
            title: "Test Title",
            body: "Test Body",
            recipientEmail: "test@example.com",
            deliveryDate: "2025-06-15",
          },
          createdAt: expect.any(Date),
        })
      })

      it("should order by most recent first", async () => {
        mockAnonymousDraftFindMany.mockResolvedValue([])

        await getAnonymousDrafts()

        expect(mockAnonymousDraftFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            orderBy: { createdAt: "desc" },
          })
        )
      })

      it("should limit to 5 drafts", async () => {
        mockAnonymousDraftFindMany.mockResolvedValue([])

        await getAnonymousDrafts()

        expect(mockAnonymousDraftFindMany).toHaveBeenCalledWith(
          expect.objectContaining({
            take: 5,
          })
        )
      })
    })

    describe("Error Handling", () => {
      it("should return empty array on error", async () => {
        mockAnonymousDraftFindMany.mockRejectedValue(new Error("Database error"))

        const result = await getAnonymousDrafts()

        expect(result.drafts).toEqual([])
      })
    })
  })

  // --------------------------------------------------------------------------
  // claimAnonymousDraft Tests
  // --------------------------------------------------------------------------

  describe("claimAnonymousDraft", () => {
    describe("Validation", () => {
      it("should return error when draft not found", async () => {
        mockAnonymousDraftFindUnique.mockResolvedValue(null)

        const result = await claimAnonymousDraft("nonexistent_draft", "user_123")

        expect(result.success).toBe(false)
        expect(result.error).toBe("Draft not found")
      })

      it("should return error when draft already claimed", async () => {
        const claimedDraft = createMockDraft({
          claimedAt: new Date(),
          claimedByUserId: "other_user",
        })
        mockAnonymousDraftFindUnique.mockResolvedValue(claimedDraft)

        const result = await claimAnonymousDraft(claimedDraft.id, "user_123")

        expect(result.success).toBe(false)
        expect(result.error).toBe("Draft already claimed")
      })

      it("should return error when user not found", async () => {
        const draft = createMockDraft()
        mockAnonymousDraftFindUnique.mockResolvedValue(draft)
        mockUserFindUnique.mockResolvedValue(null)

        const result = await claimAnonymousDraft(draft.id, "nonexistent_user")

        expect(result.success).toBe(false)
        expect(result.error).toBe("User not found")
      })
    })

    describe("Ownership Verification", () => {
      it("should allow claim by sessionId match", async () => {
        const draft = createMockDraft({
          sessionId: "session_123",
          email: "different@example.com",
        })
        mockAnonymousDraftFindUnique.mockResolvedValue(draft)
        mockUserFindUnique.mockResolvedValue({ email: "user@example.com" })
        mockAnonymousDraftUpdate.mockResolvedValue({ ...draft, claimedAt: new Date() })

        const result = await claimAnonymousDraft(draft.id, "user_123")

        expect(result.success).toBe(true)
      })

      it("should allow claim by email match", async () => {
        mockCookieGet.mockReturnValue({ value: "different_session" })
        const draft = createMockDraft({
          sessionId: "original_session",
          email: "user@example.com",
        })
        mockAnonymousDraftFindUnique.mockResolvedValue(draft)
        mockUserFindUnique.mockResolvedValue({ email: "user@example.com" })
        mockAnonymousDraftUpdate.mockResolvedValue({ ...draft, claimedAt: new Date() })

        const result = await claimAnonymousDraft(draft.id, "user_123")

        expect(result.success).toBe(true)
      })

      it("should allow claim by email match (case insensitive)", async () => {
        mockCookieGet.mockReturnValue({ value: "different_session" })
        const draft = createMockDraft({
          sessionId: "original_session",
          email: "user@example.com",
        })
        mockAnonymousDraftFindUnique.mockResolvedValue(draft)
        mockUserFindUnique.mockResolvedValue({ email: "USER@Example.COM" })
        mockAnonymousDraftUpdate.mockResolvedValue({ ...draft, claimedAt: new Date() })

        const result = await claimAnonymousDraft(draft.id, "user_123")

        expect(result.success).toBe(true)
      })

      it("should reject claim when neither sessionId nor email matches", async () => {
        mockCookieGet.mockReturnValue({ value: "different_session" })
        const draft = createMockDraft({
          sessionId: "original_session",
          email: "original@example.com",
        })
        mockAnonymousDraftFindUnique.mockResolvedValue(draft)
        mockUserFindUnique.mockResolvedValue({ email: "different@example.com" })

        const result = await claimAnonymousDraft(draft.id, "user_123")

        expect(result.success).toBe(false)
        expect(result.error).toBe("Not authorized to claim this draft")
      })
    })

    describe("Claim Process", () => {
      it("should update draft with claimedAt and claimedByUserId", async () => {
        const draft = createMockDraft({ id: "claim_test_draft" })
        mockAnonymousDraftFindUnique.mockResolvedValue(draft)
        mockUserFindUnique.mockResolvedValue({ email: "user@example.com" })
        mockAnonymousDraftUpdate.mockResolvedValue({ ...draft, claimedAt: new Date() })

        await claimAnonymousDraft(draft.id, "user_123")

        expect(mockAnonymousDraftUpdate).toHaveBeenCalledWith({
          where: { id: "claim_test_draft" },
          data: {
            claimedAt: expect.any(Date),
            claimedByUserId: "user_123",
          },
        })
      })
    })

    describe("Error Handling", () => {
      it("should return error on database failure", async () => {
        mockAnonymousDraftFindUnique.mockRejectedValue(new Error("Database error"))

        const result = await claimAnonymousDraft("draft_123", "user_123")

        expect(result.success).toBe(false)
        expect(result.error).toBe("Database error")
      })
    })
  })

  // --------------------------------------------------------------------------
  // deleteAnonymousDraft Tests
  // --------------------------------------------------------------------------

  describe("deleteAnonymousDraft", () => {
    describe("Deletion", () => {
      it("should delete draft by id", async () => {
        mockAnonymousDraftDelete.mockResolvedValue({})

        const result = await deleteAnonymousDraft("draft_to_delete")

        expect(result.success).toBe(true)
        expect(mockAnonymousDraftDelete).toHaveBeenCalledWith({
          where: { id: "draft_to_delete" },
        })
      })
    })

    describe("Error Handling", () => {
      it("should return error when draft not found", async () => {
        const prismaError = new Error("Record not found") as any
        prismaError.code = "P2025"
        mockAnonymousDraftDelete.mockRejectedValue(prismaError)

        const result = await deleteAnonymousDraft("nonexistent_draft")

        expect(result.success).toBe(false)
        expect(result.error).toBe("Record not found")
      })

      it("should return error on database failure", async () => {
        mockAnonymousDraftDelete.mockRejectedValue(new Error("Database error"))

        const result = await deleteAnonymousDraft("draft_123")

        expect(result.success).toBe(false)
        expect(result.error).toBe("Database error")
      })

      it("should handle non-Error exceptions", async () => {
        mockAnonymousDraftDelete.mockRejectedValue("String error")

        const result = await deleteAnonymousDraft("draft_123")

        expect(result.success).toBe(false)
        expect(result.error).toBe("Failed to delete draft")
      })
    })
  })
})
