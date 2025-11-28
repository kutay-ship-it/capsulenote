import { createClerkClient } from "@clerk/nextjs/server"

/**
 * Pre-initialized Clerk client for backend operations.
 *
 * In Clerk v6, we use createClerkClient() with explicit secretKey configuration
 * to create a persistent client instance. This is the correct pattern for
 * server-side API operations like users.getUser(), avoiding the undefined
 * errors that occur with the deprecated factory pattern.
 */
const clerkClientInstance = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
})

/** Type for the Clerk client instance */
export type ClerkClientInstance = ReturnType<typeof createClerkClient>

/**
 * Returns the configured Clerk client instance for backend operations.
 * This client is used for manual database operations like getUser, etc.
 */
export function getClerkClient(): ClerkClientInstance {
  return clerkClientInstance
}
