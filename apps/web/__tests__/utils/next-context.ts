import { vi } from "vitest"

/**
 * Mock Next.js App Router request context for tests that invoke route handlers.
 * Provides `headers()` (and optional `cookies()`) so handlers don't throw
 * "called outside a request scope" errors under Vitest.
 */
export function mockHeadersContext(
  headers: Record<string, string> = {},
  cookies: Record<string, string> = {}
) {
  const headersInstance = new global.Headers(headers)
  const cookiesStore = new Map(Object.entries(cookies))

  vi.doMock("next/headers", () => ({
    headers: () => headersInstance,
    cookies: () => ({
      get: (name: string) => {
        const value = cookiesStore.get(name)
        return value ? { name, value } : undefined
      },
      set: (name: string, value: string) => {
        cookiesStore.set(name, value)
      },
      delete: (name: string) => {
        cookiesStore.delete(name)
      },
    }),
  }))

  return { headers: headersInstance, cookies: cookiesStore }
}
