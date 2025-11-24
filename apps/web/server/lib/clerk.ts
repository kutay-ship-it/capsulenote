import { createClerkClient } from "@clerk/nextjs/server"
import type { ClerkClient } from "@clerk/backend"

/**
 * Pre-initialized Clerk client for backend operations.
 *
 * In Clerk v6, we use createClerkClient() with explicit secretKey configuration
 * to create a persistent client instance. This is the correct pattern for
 * server-side API operations like users.getUser(), avoiding the undefined
 * errors that occur with the deprecated factory pattern.
 */
const clerkClientInstance: ClerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
})

/**
 * Returns the configured Clerk client instance for backend operations.
 * This client is used for manual database operations like getUser, etc.
 */
export function getClerkClient(): ClerkClient {
  return clerkClientInstance
}
