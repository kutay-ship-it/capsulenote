import { env } from "@/env.mjs"

const unleashUrl = env.UNLEASH_API_URL || process.env.UNLEASH_API_URL
const unleashToken = env.UNLEASH_API_TOKEN || process.env.UNLEASH_API_TOKEN

/**
 * Feature flags system
 * Uses Unleash for production, falls back to env vars for development
 */

type FeatureFlag =
  | "use-postmark-email"
  | "enable-arrive-by-mode"
  | "enable-physical-mail"
  | "enable-letter-templates"
  | "use-clicksend-mail"
  | "enable-client-encryption"
  | "enable-push-notifications"

// In-memory cache for flags (TTL: 60 seconds)
const flagCache = new Map<string, { value: boolean; expiresAt: number }>()
const CACHE_TTL = 60 * 1000 // 60 seconds

/**
 * Get feature flag value
 * In production, this would connect to Unleash
 * In development, reads from environment variables
 */
export async function getFeatureFlag(
  flagName: FeatureFlag,
  context?: {
    userId?: string
    sessionId?: string
  }
): Promise<boolean> {
  // Check cache first
  const cached = flagCache.get(flagName)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value
  }

  let value = false

  // In production with Unleash configured
  if (unleashUrl && unleashToken) {
    try {
      value = await getUnleashFlag(flagName, context)
    } catch (error) {
      console.warn(`Failed to fetch flag ${flagName} from Unleash:`, error)
      value = getDefaultFlagValue(flagName)
    }
  } else {
    // Development: use environment variables or defaults
    value = getDefaultFlagValue(flagName)
  }

  // Cache the result
  flagCache.set(flagName, {
    value,
    expiresAt: Date.now() + CACHE_TTL,
  })

  return value
}

/**
 * Fetch flag from Unleash API
 */
async function getUnleashFlag(
  flagName: string,
  context?: { userId?: string; sessionId?: string }
): Promise<boolean> {
  if (!unleashUrl || !unleashToken) {
    return false
  }

  const response = await fetch(`${unleashUrl}/api/client/features/${flagName}`, {
    headers: {
      "Authorization": unleashToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      appName: env.UNLEASH_APP_NAME,
      environment: env.NODE_ENV,
      context: context || {},
    }),
    method: "POST",
  })

  if (!response.ok) {
    throw new Error(`Unleash API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.enabled || false
}

/**
 * Get default flag values for development
 * Can be overridden with environment variables
 */
function getDefaultFlagValue(flagName: FeatureFlag): boolean {
  const defaults: Record<FeatureFlag, boolean> = {
    "use-postmark-email": false, // Default to Resend
    "enable-arrive-by-mode": false, // Beta feature
    "enable-physical-mail": false, // Beta feature
    "enable-letter-templates": true, // GA feature
    "use-clicksend-mail": false, // Alternative provider
    "enable-client-encryption": false, // Future feature
    "enable-push-notifications": false, // Disabled until VAPID configured
  }

  // Allow environment variable override
  const envKey = `FEATURE_${flagName.toUpperCase().replace(/-/g, "_")}`
  const envValue = process.env[envKey]

  if (envValue !== undefined) {
    return envValue === "true" || envValue === "1"
  }

  return defaults[flagName] || false
}

/**
 * Clear feature flag cache (useful for testing)
 */
export function clearFlagCache() {
  flagCache.clear()
}

/**
 * Get all active flags (for debugging)
 */
export async function getAllFlags(): Promise<Record<string, boolean>> {
  const flags: FeatureFlag[] = [
    "use-postmark-email",
    "enable-arrive-by-mode",
    "enable-physical-mail",
    "enable-letter-templates",
    "use-clicksend-mail",
    "enable-client-encryption",
    "enable-push-notifications",
  ]

  const results: Record<string, boolean> = {}

  for (const flag of flags) {
    results[flag] = await getFeatureFlag(flag)
  }

  return results
}
