import { clerkClient as clerkClientFactory } from "@clerk/nextjs/server"
import type { ClerkClient } from "@clerk/backend"

/**
 * Wrapper to obtain a fully constructed Clerk client.
 *
 * In Clerk v6 the exported `clerkClient` is an async factory, not the client
 * instance. Awaiting here centralizes the pattern and prevents runtime
 * undefined errors when accessing `.users`, `.sessions`, etc.
 */
export async function getClerkClient(): Promise<ClerkClient> {
  return clerkClientFactory()
}
