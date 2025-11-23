import { test, expect } from "@playwright/test"

const enableFlow = process.env.E2E_ENABLE_CHECKOUT_FLOW === "true"

test.describe("Checkout → Signup → Dashboard", () => {
  test.skip(!enableFlow, "Set E2E_ENABLE_CHECKOUT_FLOW=true to run checkout→signup flow")

  test("renders success signup flow for paid session", async ({ request }) => {
    const baseUrl =
      process.env.E2E_BASE_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      test.info().project.use.baseURL
    test.skip(!baseUrl, "Provide E2E_BASE_URL/NEXT_PUBLIC_APP_URL or Playwright baseURL to run")

    const sessionId = process.env.E2E_STRIPE_PAID_SESSION_ID
    test.skip(!sessionId, "Provide E2E_STRIPE_PAID_SESSION_ID from a paid Stripe session to run")

    const response = await request.get(
      `${baseUrl}/subscribe/success?session_id=${sessionId}`
    )
    expect(response.status()).toBeLessThan(500)

    const body = await response.text()
    expect(body).toContain("Complete Your Signup")
    expect(body).toContain("Payment Successful")
  })
})
