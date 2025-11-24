import { z } from "zod"

/**
 * Inngest Step I/O Schemas
 *
 * These schemas define the expected input/output shapes for Inngest workflow steps.
 * They help catch serialization issues and provide type safety across step boundaries.
 */

/**
 * Schema for a serialized Buffer object (JSON representation)
 *
 * When Buffer objects are serialized to JSON (e.g., crossing Inngest step boundaries),
 * they become objects with this shape: { type: "Buffer", data: [byte, byte, ...] }
 */
export const serializedBufferSchema = z.object({
  type: z.literal("Buffer"),
  data: z.array(z.number().int().min(0).max(255)),
})

/**
 * Schema that accepts either a Buffer or its serialized form
 * Transforms serialized form back to Buffer
 *
 * Note: z.instanceof(Buffer) only works at runtime in Node.js environments.
 * In cases where you need to validate serialized data, use serializedBufferSchema directly.
 */
export const bufferOrSerializedSchema = z.union([
  z.instanceof(Buffer),
  serializedBufferSchema.transform((val) => Buffer.from(val.data)),
])

/**
 * Decrypted letter content output (safe for serialization)
 *
 * This is the shape returned by the decrypt-letter step.
 * Both fields are serializable primitives (object and string).
 */
export const decryptedLetterContentSchema = z.object({
  bodyRich: z.record(z.unknown()),
  bodyHtml: z.string(),
})

/**
 * Delivery metadata schema (excludes encrypted fields)
 *
 * This schema represents the safe-to-serialize delivery data
 * that can be passed between Inngest steps without Buffer serialization issues.
 */
export const deliveryStepMetadataSchema = z.object({
  deliveryId: z.string().uuid(),
  userId: z.string().uuid(),
  letterId: z.string().uuid(),
  status: z.enum(["scheduled", "processing", "sent", "failed", "canceled"]),
  deliverAt: z.coerce.date(),
  attemptCount: z.number().int().min(0),
  letterTitle: z.string(),
  shareLinkToken: z.string(),
  toEmail: z.string().email(),
  subject: z.string(),
})

/**
 * Letter metadata (excludes encrypted fields)
 *
 * Safe to serialize across step boundaries.
 */
export const letterStepMetadataSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  shareLinkToken: z.string(),
  keyVersion: z.number().int().positive(),
})

/**
 * Email delivery result schema
 */
export const emailSendResultSchema = z.object({
  success: z.boolean(),
  id: z.string().optional(),
  error: z.string().optional(),
})

// Type exports
export type SerializedBuffer = z.infer<typeof serializedBufferSchema>
export type DecryptedLetterContent = z.infer<typeof decryptedLetterContentSchema>
export type DeliveryStepMetadata = z.infer<typeof deliveryStepMetadataSchema>
export type LetterStepMetadata = z.infer<typeof letterStepMetadataSchema>
export type EmailSendResult = z.infer<typeof emailSendResultSchema>
