import { z } from "zod"

export const deliveryChannelSchema = z.enum(["email", "mail"])
export const deliveryStatusSchema = z.enum([
  "scheduled",
  "processing",
  "sent",
  "failed",
  "canceled",
])

export const scheduleDeliverySchema = z.object({
  letterId: z.string().uuid(),
  channel: deliveryChannelSchema,
  deliverAt: z.date().refine(
    (date) => date > new Date(),
    {
      message: "Delivery date must be in the future. You cannot schedule deliveries for past dates.",
    }
  ),
  timezone: z.string(), // IANA timezone
  toEmail: z.string().email().optional(),
  shippingAddressId: z.string().uuid().optional(),
  printOptions: z
    .object({
      color: z.boolean().default(false),
      doubleSided: z.boolean().default(false),
    })
    .optional(),
})

export const updateDeliverySchema = z.object({
  deliveryId: z.string().uuid(),
  deliverAt: z.date().refine(
    (date) => date > new Date(),
    {
      message: "Delivery date must be in the future. You cannot schedule deliveries for past dates.",
    }
  ).optional(),
  timezone: z.string().optional(),
})

export const cancelDeliverySchema = z.object({
  deliveryId: z.string().uuid(),
})

export type DeliveryChannel = z.infer<typeof deliveryChannelSchema>
export type DeliveryStatus = z.infer<typeof deliveryStatusSchema>
export type ScheduleDeliveryInput = z.infer<typeof scheduleDeliverySchema>
export type UpdateDeliveryInput = z.infer<typeof updateDeliverySchema>
export type CancelDeliveryInput = z.infer<typeof cancelDeliverySchema>
