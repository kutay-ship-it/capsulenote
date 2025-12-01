/**
 * Locale utilities for server-side locale retrieval
 *
 * Provides utilities to get a user's preferred locale from:
 * 1. Database Profile.locale (canonical source)
 * 2. Clerk publicMetadata.preferredLocale (fallback)
 * 3. Default "en" (final fallback)
 */

import { prisma } from "./db"
import { getClerkClient } from "./clerk"
import type { Locale } from "@/i18n/routing"

const SUPPORTED_LOCALES: Locale[] = ["en", "tr"]
const DEFAULT_LOCALE: Locale = "en"

/**
 * Validate that a string is a supported locale
 */
export function isValidLocale(locale: string | null | undefined): locale is Locale {
  if (!locale) return false
  return SUPPORTED_LOCALES.includes(locale as Locale)
}

/**
 * Get user's preferred locale from database Profile
 *
 * @param userId - Internal database user ID (UUID)
 * @returns User's locale preference or null if not found
 */
export async function getUserLocaleFromProfile(userId: string): Promise<Locale | null> {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { locale: true },
    })

    if (profile?.locale && isValidLocale(profile.locale)) {
      return profile.locale
    }

    return null
  } catch (error) {
    console.error("[Locale] Failed to get locale from Profile:", error)
    return null
  }
}

/**
 * Get user's preferred locale from Clerk metadata
 *
 * @param clerkUserId - Clerk user ID
 * @returns User's locale preference or null if not found
 */
export async function getUserLocaleFromClerk(clerkUserId: string): Promise<Locale | null> {
  try {
    const clerk = getClerkClient()
    const clerkUser = await clerk.users.getUser(clerkUserId)

    const preferredLocale = clerkUser.publicMetadata?.preferredLocale as string | undefined
    if (preferredLocale && isValidLocale(preferredLocale)) {
      return preferredLocale
    }

    return null
  } catch (error) {
    console.error("[Locale] Failed to get locale from Clerk:", error)
    return null
  }
}

/**
 * Get user's preferred locale with fallback chain
 *
 * Priority:
 * 1. Database Profile.locale (canonical)
 * 2. Clerk publicMetadata.preferredLocale (cross-device sync)
 * 3. Default "en"
 *
 * @param userId - Internal database user ID (UUID)
 * @param clerkUserId - Optional Clerk user ID for fallback
 * @returns User's locale preference or default
 */
export async function getUserLocale(
  userId: string,
  clerkUserId?: string | null
): Promise<Locale> {
  // 1. Try Profile (canonical source)
  const profileLocale = await getUserLocaleFromProfile(userId)
  if (profileLocale) {
    return profileLocale
  }

  // 2. Try Clerk metadata (fallback for cross-device sync)
  if (clerkUserId) {
    const clerkLocale = await getUserLocaleFromClerk(clerkUserId)
    if (clerkLocale) {
      return clerkLocale
    }
  }

  // 3. Default
  return DEFAULT_LOCALE
}

/**
 * Get user's locale by email address
 *
 * Useful for sending emails to users by email address only
 *
 * @param email - User's email address
 * @returns User's locale preference or default
 */
export async function getUserLocaleByEmail(email: string): Promise<Locale> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: {
          select: { locale: true },
        },
      },
    })

    if (user?.profile?.locale && isValidLocale(user.profile.locale)) {
      return user.profile.locale
    }

    // Try Clerk if user exists but no Profile locale
    if (user?.clerkUserId) {
      const clerkLocale = await getUserLocaleFromClerk(user.clerkUserId)
      if (clerkLocale) {
        return clerkLocale
      }
    }

    return DEFAULT_LOCALE
  } catch (error) {
    console.error("[Locale] Failed to get locale by email:", error)
    return DEFAULT_LOCALE
  }
}
