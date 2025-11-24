import { describe, it, expect, vi, afterEach } from "vitest"
import { toBuffer, assertRealBuffer, isSerializedBuffer } from "../buffer-utils"

describe("isSerializedBuffer", () => {
  it("returns true for valid serialized Buffer", () => {
    expect(isSerializedBuffer({ type: "Buffer", data: [1, 2, 3] })).toBe(true)
  })

  it("returns true for empty serialized Buffer", () => {
    expect(isSerializedBuffer({ type: "Buffer", data: [] })).toBe(true)
  })

  it("returns false for real Buffer", () => {
    expect(isSerializedBuffer(Buffer.from([1, 2, 3]))).toBe(false)
  })

  it("returns false for object with wrong type", () => {
    expect(isSerializedBuffer({ type: "NotBuffer", data: [] })).toBe(false)
  })

  it("returns false for object missing data", () => {
    expect(isSerializedBuffer({ type: "Buffer" })).toBe(false)
  })

  it("returns false for object with non-array data", () => {
    expect(isSerializedBuffer({ type: "Buffer", data: "not an array" })).toBe(false)
  })

  it("returns false for null", () => {
    expect(isSerializedBuffer(null)).toBe(false)
  })

  it("returns false for undefined", () => {
    expect(isSerializedBuffer(undefined)).toBe(false)
  })

  it("returns false for string", () => {
    expect(isSerializedBuffer("string")).toBe(false)
  })

  it("returns false for number", () => {
    expect(isSerializedBuffer(123)).toBe(false)
  })

  it("returns false for array", () => {
    expect(isSerializedBuffer([1, 2, 3])).toBe(false)
  })
})

describe("toBuffer", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("passes through real Buffer unchanged", () => {
    const original = Buffer.from([1, 2, 3])
    const result = toBuffer(original, "test")
    expect(result).toBe(original) // Same reference
    expect(Buffer.isBuffer(result)).toBe(true)
  })

  it("converts serialized Buffer to real Buffer", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
    const serialized = { type: "Buffer" as const, data: [1, 2, 3] }
    const result = toBuffer(serialized, "test")

    expect(Buffer.isBuffer(result)).toBe(true)
    expect([...result]).toEqual([1, 2, 3])
    consoleSpy.mockRestore()
  })

  it("logs warning when converting serialized Buffer", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
    const serialized = { type: "Buffer" as const, data: [1, 2, 3] }

    toBuffer(serialized, "testField")

    expect(consoleSpy).toHaveBeenCalled()
    const logEntry = JSON.parse(consoleSpy.mock.calls[0][0] as string)
    expect(logEntry.level).toBe("warn")
    expect(logEntry.message).toBe("Detected serialized Buffer - data crossed step boundary")
    expect(logEntry.fieldName).toBe("testField")
    expect(logEntry.dataLength).toBe(3)
  })

  it("converts Uint8Array to Buffer", () => {
    const uint8 = new Uint8Array([1, 2, 3])
    const result = toBuffer(uint8, "test")

    expect(Buffer.isBuffer(result)).toBe(true)
    expect([...result]).toEqual([1, 2, 3])
  })

  it("handles empty Buffer", () => {
    const empty = Buffer.from([])
    const result = toBuffer(empty, "test")

    expect(Buffer.isBuffer(result)).toBe(true)
    expect(result.length).toBe(0)
  })

  it("handles empty serialized Buffer", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
    const serialized = { type: "Buffer" as const, data: [] }
    const result = toBuffer(serialized, "test")

    expect(Buffer.isBuffer(result)).toBe(true)
    expect(result.length).toBe(0)
    consoleSpy.mockRestore()
  })

  it("handles large serialized Buffer", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {})
    const largeData = Array.from({ length: 1000 }, (_, i) => i % 256)
    const serialized = { type: "Buffer" as const, data: largeData }
    const result = toBuffer(serialized, "test")

    expect(Buffer.isBuffer(result)).toBe(true)
    expect(result.length).toBe(1000)
    consoleSpy.mockRestore()
  })

  it("throws for string input with helpful message", () => {
    expect(() => toBuffer("not a buffer", "myField")).toThrow("myField")
    expect(() => toBuffer("not a buffer", "myField")).toThrow("string")
  })

  it("throws for null input", () => {
    expect(() => toBuffer(null, "test")).toThrow("null")
  })

  it("throws for undefined input", () => {
    expect(() => toBuffer(undefined, "test")).toThrow("undefined")
  })

  it("throws for number input", () => {
    expect(() => toBuffer(123, "test")).toThrow("number")
  })

  it("throws for plain object input", () => {
    expect(() => toBuffer({ foo: "bar" }, "test")).toThrow("object")
  })

  it("uses default field name when not provided", () => {
    expect(() => toBuffer("invalid")).toThrow("buffer")
  })
})

describe("assertRealBuffer", () => {
  it("passes for real Buffer", () => {
    expect(() => assertRealBuffer(Buffer.from([1, 2, 3]), "test")).not.toThrow()
  })

  it("passes for empty Buffer", () => {
    expect(() => assertRealBuffer(Buffer.from([]), "test")).not.toThrow()
  })

  it("throws for serialized Buffer with clear message", () => {
    const serialized = { type: "Buffer" as const, data: [1, 2, 3] }

    expect(() => assertRealBuffer(serialized, "bodyCiphertext")).toThrow(
      "bodyCiphertext is a serialized Buffer"
    )
    expect(() => assertRealBuffer(serialized, "bodyCiphertext")).toThrow(
      "not passed across step boundaries"
    )
  })

  it("throws for string with type information", () => {
    expect(() => assertRealBuffer("string", "test")).toThrow("not a Buffer")
    expect(() => assertRealBuffer("string", "test")).toThrow("string")
  })

  it("throws for null with type information", () => {
    expect(() => assertRealBuffer(null, "test")).toThrow("null")
  })

  it("throws for undefined with type information", () => {
    expect(() => assertRealBuffer(undefined, "test")).toThrow("undefined")
  })

  it("throws for number", () => {
    expect(() => assertRealBuffer(123, "test")).toThrow("number")
  })

  it("throws for plain object", () => {
    expect(() => assertRealBuffer({ foo: "bar" }, "test")).toThrow("object")
  })

  it("throws for array", () => {
    expect(() => assertRealBuffer([1, 2, 3], "test")).toThrow("object")
  })

  it("includes field name in error message", () => {
    expect(() => assertRealBuffer("invalid", "bodyCiphertext")).toThrow("bodyCiphertext")
  })

  it("uses default field name when not provided", () => {
    expect(() => assertRealBuffer("invalid")).toThrow("buffer")
  })
})

describe("integration scenarios", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("simulates Inngest step boundary serialization roundtrip", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {})

    // Original Buffer from Prisma
    const originalBuffer = Buffer.from([72, 101, 108, 108, 111]) // "Hello"

    // Simulate JSON serialization (Inngest step boundary)
    const serialized = JSON.parse(JSON.stringify(originalBuffer))

    // Verify serialization format
    expect(serialized).toEqual({
      type: "Buffer",
      data: [72, 101, 108, 108, 111],
    })

    // Reconstruct using toBuffer
    const reconstructed = toBuffer(serialized, "bodyCiphertext")

    // Verify reconstruction
    expect(Buffer.isBuffer(reconstructed)).toBe(true)
    expect(reconstructed.toString()).toBe("Hello")
    expect([...reconstructed]).toEqual([...originalBuffer])
  })

  it("handles crypto-realistic data sizes", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {})

    // Realistic encrypted content (159 bytes from the bug report)
    const ciphertextData = Array.from({ length: 159 }, () => Math.floor(Math.random() * 256))
    const nonceData = Array.from({ length: 12 }, () => Math.floor(Math.random() * 256))

    const serializedCiphertext = { type: "Buffer" as const, data: ciphertextData }
    const serializedNonce = { type: "Buffer" as const, data: nonceData }

    const ciphertext = toBuffer(serializedCiphertext, "bodyCiphertext")
    const nonce = toBuffer(serializedNonce, "bodyNonce")

    expect(ciphertext.length).toBe(159)
    expect(nonce.length).toBe(12)
    expect(Buffer.isBuffer(ciphertext)).toBe(true)
    expect(Buffer.isBuffer(nonce)).toBe(true)
  })
})
