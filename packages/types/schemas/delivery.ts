import { z } from "zod"
import { isValidTimezone } from "./clerk-metadata"

export const deliveryChannelSchema = z.enum(["email", "mail"])
export const deliveryStatusSchema = z.enum([
  "scheduled",
  "processing",
  "sent",
  "failed",
  "canceled",
])
export const mailDeliveryModeSchema = z.enum(["send_on", "arrive_by"])
export const mailTypeSchema = z.enum(["usps_first_class", "usps_standard"])

// Timezone validation schema with IANA validation
const timezoneSchema = z.string().refine(
  (tz) => isValidTimezone(tz),
  { message: "Invalid IANA timezone identifier" }
)

export const scheduleDeliverySchema = z.object({
  letterId: z.string().uuid(),
  channel: deliveryChannelSchema,
  deliverAt: z.date(),
  timezone: timezoneSchema, // IANA timezone with validation
  toEmail: z.string().email().optional(),
  shippingAddressId: z.string().uuid().optional(),
  printOptions: z
    .object({
      color: z.boolean().default(false),
      doubleSided: z.boolean().default(false),
    })
    .optional(),
  // Arrive-by mode fields (only for mail channel)
  deliveryMode: mailDeliveryModeSchema.optional(), // Defaults to "send_on"
  mailType: mailTypeSchema.optional(), // Defaults to "usps_first_class"
})

export const updateDeliverySchema = z.object({
  deliveryId: z.string().uuid(),
  deliverAt: z.date().optional(),
  timezone: timezoneSchema.optional(),
})

export const cancelDeliverySchema = z.object({
  deliveryId: z.string().uuid(),
})

export type DeliveryChannel = z.infer<typeof deliveryChannelSchema>
export type DeliveryStatus = z.infer<typeof deliveryStatusSchema>
export type MailDeliveryMode = z.infer<typeof mailDeliveryModeSchema>
export type MailType = z.infer<typeof mailTypeSchema>
export type ScheduleDeliveryInput = z.infer<typeof scheduleDeliverySchema>
export type UpdateDeliveryInput = z.infer<typeof updateDeliverySchema>
export type CancelDeliveryInput = z.infer<typeof cancelDeliverySchema>
