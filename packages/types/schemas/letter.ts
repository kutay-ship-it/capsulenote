import { z } from "zod"

export const letterVisibilitySchema = z.enum(["private", "link"])

export const createLetterSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  bodyRich: z.record(z.any()), // TipTap JSON
  bodyHtml: z.string(),
  tags: z.array(z.string()).default([]),
  visibility: letterVisibilitySchema.default("private"),
})

export const updateLetterSchema = createLetterSchema.partial().extend({
  id: z.string().uuid(),
})

export type CreateLetterInput = z.infer<typeof createLetterSchema>
export type UpdateLetterInput = z.infer<typeof updateLetterSchema>
export type LetterVisibility = z.infer<typeof letterVisibilitySchema>
