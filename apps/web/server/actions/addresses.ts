"use server"

import { z } from "zod"
import { type ActionResult, ErrorCodes } from "@dearme/types"
import { requireUser } from "@/server/lib/auth"
import { prisma } from "@/server/lib/db"
import { logger } from "@/server/lib/logger"
import { verifyAddress as lobVerifyAddress, type AddressVerificationResult } from "@/server/providers/lob"

// Validation schemas
// State field is flexible: some countries require it, others don't
// Length varies: US uses 2-char codes, AU uses 2-3, others use full names
const shippingAddressInputSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  line1: z.string().min(1, "Address line 1 is required").max(200),
  line2: z.string().max(200).optional(),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().max(100).optional().default(""), // Flexible: can be empty for countries without states
  postalCode: z.string().min(1, "Postal code is required").max(20), // Flexible for various formats
  country: z.string().length(2, "Country must be 2-letter ISO code").default("US"),
})

export type ShippingAddressInput = z.infer<typeof shippingAddressInputSchema>

export interface ShippingAddress {
  id: string
  name: string
  line1: string
  line2?: string | null
  city: string
  state: string
  postalCode: string
  country: string
  metadata: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export interface AddressVerificationResponse {
  isValid: boolean
  deliverability: string
  suggestedAddress?: {
    line1: string
    line2?: string
    city: string
    state: string
    postalCode: string
  }
  error?: string
}

/**
 * List all shipping addresses for the current user
 */
export async function listShippingAddresses(): Promise<ActionResult<ShippingAddress[]>> {
  try {
    const user = await requireUser()

    const addresses = await prisma.shippingAddress.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    })

    return {
      success: true,
      data: addresses.map((addr) => ({
        id: addr.id,
        name: addr.name,
        line1: addr.line1,
        line2: addr.line2,
        city: addr.city,
        state: addr.state,
        postalCode: addr.postalCode,
        country: addr.country,
        metadata: addr.metadata as Record<string, unknown>,
        createdAt: addr.createdAt,
        updatedAt: addr.updatedAt,
      })),
    }
  } catch (error) {
    await logger.error("Failed to list shipping addresses", error)
    return {
      success: false,
      error: {
        code: ErrorCodes.DATABASE_ERROR,
        message: "Failed to load addresses. Please try again.",
        // details removed - logged server-side
      },
    }
  }
}

/**
 * Get a single shipping address by ID
 */
export async function getShippingAddress(id: string): Promise<ActionResult<ShippingAddress>> {
  try {
    const user = await requireUser()

    const address = await prisma.shippingAddress.findFirst({
      where: { id, userId: user.id },
    })

    if (!address) {
      return {
        success: false,
        error: {
          code: ErrorCodes.NOT_FOUND,
          message: "Address not found.",
        },
      }
    }

    return {
      success: true,
      data: {
        id: address.id,
        name: address.name,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        metadata: address.metadata as Record<string, unknown>,
        createdAt: address.createdAt,
        updatedAt: address.updatedAt,
      },
    }
  } catch (error) {
    await logger.error("Failed to get shipping address", error)
    return {
      success: false,
      error: {
        code: ErrorCodes.DATABASE_ERROR,
        message: "Failed to load address. Please try again.",
        // details removed - logged server-side
      },
    }
  }
}

/**
 * Create a new shipping address for the current user
 */
export async function createShippingAddress(
  input: unknown
): Promise<ActionResult<ShippingAddress>> {
  try {
    const user = await requireUser()

    // Validate input
    const validated = shippingAddressInputSchema.safeParse(input)
    if (!validated.success) {
      return {
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_FAILED,
          message: "Invalid address data. Please check your input.",
          details: validated.error.flatten().fieldErrors,
        },
      }
    }

    const data = validated.data

    // Create the address
    const address = await prisma.shippingAddress.create({
      data: {
        userId: user.id,
        name: data.name,
        line1: data.line1,
        line2: data.line2 || null,
        city: data.city,
        state: data.state.toUpperCase(),
        postalCode: data.postalCode,
        country: data.country.toUpperCase(),
        metadata: {},
      },
    })

    await logger.info("Shipping address created", {
      userId: user.id,
      addressId: address.id,
    })

    return {
      success: true,
      data: {
        id: address.id,
        name: address.name,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        metadata: address.metadata as Record<string, unknown>,
        createdAt: address.createdAt,
        updatedAt: address.updatedAt,
      },
    }
  } catch (error) {
    await logger.error("Failed to create shipping address", error)
    return {
      success: false,
      error: {
        code: ErrorCodes.CREATION_FAILED,
        message: "Failed to save address. Please try again.",
        // details removed - logged server-side
      },
    }
  }
}

/**
 * Update an existing shipping address
 */
export async function updateShippingAddress(
  id: string,
  input: unknown
): Promise<ActionResult<ShippingAddress>> {
  try {
    const user = await requireUser()

    // Validate input
    const validated = shippingAddressInputSchema.safeParse(input)
    if (!validated.success) {
      return {
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_FAILED,
          message: "Invalid address data. Please check your input.",
          details: validated.error.flatten().fieldErrors,
        },
      }
    }

    // Verify ownership
    const existing = await prisma.shippingAddress.findFirst({
      where: { id, userId: user.id },
    })

    if (!existing) {
      return {
        success: false,
        error: {
          code: ErrorCodes.NOT_FOUND,
          message: "Address not found.",
        },
      }
    }

    const data = validated.data

    // Update the address
    const address = await prisma.shippingAddress.update({
      where: { id },
      data: {
        name: data.name,
        line1: data.line1,
        line2: data.line2 || null,
        city: data.city,
        state: data.state.toUpperCase(),
        postalCode: data.postalCode,
        country: data.country.toUpperCase(),
      },
    })

    await logger.info("Shipping address updated", {
      userId: user.id,
      addressId: address.id,
    })

    return {
      success: true,
      data: {
        id: address.id,
        name: address.name,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        metadata: address.metadata as Record<string, unknown>,
        createdAt: address.createdAt,
        updatedAt: address.updatedAt,
      },
    }
  } catch (error) {
    await logger.error("Failed to update shipping address", error)
    return {
      success: false,
      error: {
        code: ErrorCodes.UPDATE_FAILED,
        message: "Failed to update address. Please try again.",
        // details removed - logged server-side
      },
    }
  }
}

/**
 * Delete a shipping address
 */
export async function deleteShippingAddress(
  id: string
): Promise<ActionResult<void>> {
  try {
    const user = await requireUser()

    // Verify ownership
    const existing = await prisma.shippingAddress.findFirst({
      where: { id, userId: user.id },
    })

    if (!existing) {
      return {
        success: false,
        error: {
          code: ErrorCodes.NOT_FOUND,
          message: "Address not found.",
        },
      }
    }

    // Check if address is in use by any pending deliveries
    const inUseCount = await prisma.mailDelivery.count({
      where: {
        shippingAddressId: id,
        delivery: {
          status: { in: ["scheduled", "processing"] },
        },
      },
    })

    if (inUseCount > 0) {
      return {
        success: false,
        error: {
          code: ErrorCodes.FORBIDDEN,
          message: "Cannot delete address that is in use by pending deliveries.",
        },
      }
    }

    await prisma.shippingAddress.delete({ where: { id } })

    await logger.info("Shipping address deleted", {
      userId: user.id,
      addressId: id,
    })

    return { success: true, data: undefined }
  } catch (error) {
    await logger.error("Failed to delete shipping address", error)
    return {
      success: false,
      error: {
        code: ErrorCodes.DELETE_FAILED,
        message: "Failed to delete address. Please try again.",
        // details removed - logged server-side
      },
    }
  }
}

/**
 * Verify an address using Lob's address verification service
 * This validates deliverability and may return a suggested corrected address
 */
export async function verifyShippingAddress(
  input: unknown
): Promise<ActionResult<AddressVerificationResponse>> {
  try {
    await requireUser() // Ensure user is authenticated

    // Validate input
    const validated = shippingAddressInputSchema.omit({ name: true }).safeParse(input)
    if (!validated.success) {
      return {
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_FAILED,
          message: "Invalid address data. Please check your input.",
          details: validated.error.flatten().fieldErrors,
        },
      }
    }

    const data = validated.data

    // Call Lob verification
    let verification: AddressVerificationResult
    try {
      verification = await lobVerifyAddress({
        line1: data.line1,
        line2: data.line2,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
      })
    } catch (error) {
      await logger.error("Lob address verification failed", error)
      return {
        success: false,
        error: {
          code: ErrorCodes.SERVICE_UNAVAILABLE,
          message: "Address verification service is unavailable. Please try again later.",
          // details removed - logged server-side
        },
      }
    }

    // Transform Lob response to our format
    const response: AddressVerificationResponse = {
      isValid: verification.isValid,
      deliverability: verification.deliverability,
      error: verification.error,
    }

    if (verification.suggestedAddress) {
      response.suggestedAddress = {
        line1: verification.suggestedAddress.primaryLine,
        line2: verification.suggestedAddress.secondaryLine,
        city: verification.suggestedAddress.city,
        state: verification.suggestedAddress.state,
        postalCode: verification.suggestedAddress.zipCodePlus4
          ? `${verification.suggestedAddress.zipCode}-${verification.suggestedAddress.zipCodePlus4}`
          : verification.suggestedAddress.zipCode,
      }
    }

    return { success: true, data: response }
  } catch (error) {
    await logger.error("Address verification failed", error)
    return {
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: "Failed to verify address. Please try again.",
        // details removed - logged server-side
      },
    }
  }
}

/**
 * Create a shipping address with verification metadata
 * Combines verification and creation in one step
 */
export async function createVerifiedShippingAddress(
  input: unknown,
  verificationData?: AddressVerificationResponse
): Promise<ActionResult<ShippingAddress>> {
  try {
    const user = await requireUser()

    // Validate input
    const validated = shippingAddressInputSchema.safeParse(input)
    if (!validated.success) {
      return {
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_FAILED,
          message: "Invalid address data. Please check your input.",
          details: validated.error.flatten().fieldErrors,
        },
      }
    }

    const data = validated.data

    // Create the address with verification metadata
    const address = await prisma.shippingAddress.create({
      data: {
        userId: user.id,
        name: data.name,
        line1: data.line1,
        line2: data.line2 || null,
        city: data.city,
        state: data.state.toUpperCase(),
        postalCode: data.postalCode,
        country: data.country.toUpperCase(),
        metadata: verificationData
          ? {
              verified: verificationData.isValid,
              deliverability: verificationData.deliverability,
              verifiedAt: new Date().toISOString(),
            }
          : {},
      },
    })

    await logger.info("Verified shipping address created", {
      userId: user.id,
      addressId: address.id,
      verified: verificationData?.isValid ?? false,
    })

    return {
      success: true,
      data: {
        id: address.id,
        name: address.name,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
        metadata: address.metadata as Record<string, unknown>,
        createdAt: address.createdAt,
        updatedAt: address.updatedAt,
      },
    }
  } catch (error) {
    await logger.error("Failed to create verified shipping address", error)
    return {
      success: false,
      error: {
        code: ErrorCodes.CREATION_FAILED,
        message: "Failed to save address. Please try again.",
        // details removed - logged server-side
      },
    }
  }
}
