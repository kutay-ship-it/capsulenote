/**
 * Server-side timezone getter with enterprise fallback chain
 *
 * This is the SINGLE SOURCE OF TRUTH for getting a user's timezone
 * on the server. All server-side code should use this function.
 *
 * @module get-user-timezone
 */

import type { User, Profile } from "@dearme/prisma"

/**
 * User type with optional profile relation
 */
type UserWithProfile = User & { profile: Profile | null }

/**
 * User type with required profile relation
 */
type UserWithRequiredProfile = User & { profile: Profile }

/**
 * Get user's timezone with enterprise fallback chain
 *
 * Priority:
 * 1. profile.timezone (canonical source)
 * 2. user.timezone (legacy, logs warning)
 * 3. UTC (system default, logs error)
 *
 * @param user - User object with profile relation included
 * @returns IANA timezone string
 *
 * @example
 * const user = await prisma.user.findUnique({
 *   where: { id },
 *   include: { profile: true }
 * })
 * const timezone = getUserTimezone(user)
 */
export function getUserTimezone(user: UserWithProfile): string {
  // 1. Try profile timezone (canonical source)
  if (user.profile?.timezone) {
    return user.profile.timezone
  }

  // 2. Try legacy user timezone
  if (user.timezone) {
    console.warn(
      `[Timezone] Using deprecated User.timezone for user ${user.id}. ` +
        `Profile should have timezone set.`
    )
    return user.timezone
  }

  // 3. Last resort fallback
  console.error(
    `[Timezone] No timezone found for user ${user.id}. ` +
      `Falling back to UTC. This should not happen.`
  )
  return "UTC"
}

/**
 * Get user's timezone with strict requirement
 *
 * Throws if user has no profile or profile has no timezone.
 * Use for critical operations where timezone is mandatory.
 *
 * @param user - User object with profile relation included
 * @returns IANA timezone string
 * @throws Error if profile or timezone is missing
 *
 * @example
 * try {
 *   const timezone = requireUserTimezone(user)
 *   // Use timezone for critical delivery scheduling
 * } catch (error) {
 *   // Handle missing timezone - prompt user to set it
 * }
 */
export function requireUserTimezone(user: UserWithProfile): string {
  if (!user.profile) {
    throw new Error(`User ${user.id} has no profile`)
  }

  if (!user.profile.timezone) {
    throw new Error(`User ${user.id} profile has no timezone`)
  }

  return user.profile.timezone
}

/**
 * Type guard to check if user has profile with timezone
 *
 * @param user - User object to check
 * @returns True if user has profile with timezone set
 */
export function hasTimezone(
  user: UserWithProfile
): user is UserWithRequiredProfile {
  return !!user.profile?.timezone
}

/**
 * Get timezone or default without logging warnings
 *
 * Use this for non-critical operations where fallback to UTC
 * is acceptable without logging noise.
 *
 * @param user - User object with profile relation
 * @param defaultTimezone - Fallback timezone (default: "UTC")
 * @returns IANA timezone string
 */
export function getUserTimezoneOrDefault(
  user: UserWithProfile | null | undefined,
  defaultTimezone: string = "UTC"
): string {
  if (!user) {
    return defaultTimezone
  }

  return user.profile?.timezone || user.timezone || defaultTimezone
}
