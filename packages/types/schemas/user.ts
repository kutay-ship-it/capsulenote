import { z } from "zod"

export const updateProfileSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  timezone: z.string().optional(),
  marketingOptIn: z.boolean().optional(),
})

export const shippingAddressSchema = z.object({
  name: z.string().min(1).max(100),
  line1: z.string().min(1).max(100),
  line2: z.string().max(100).optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  postalCode: z.string().min(1).max(20),
  country: z.string().length(2), // ISO 3166-1 alpha-2
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>
