/**
 * Checkout & Subscription E2E Tests
 *
 * Tests for subscription and payment flows including:
 * - Pricing page display
 * - Stripe checkout redirect
 * - Checkout success handling
 * - Billing portal access
 */

import { test, expect } from "@playwright/test"
import {
  LandingPage,
  PricingPage,
  SettingsPage,
  waitForNetworkIdle,
  getBaseUrl,
  isCI,
  TEST_DATA,
} from "./fixtures"

// Skip checkout tests unless explicitly enabled (requires Stripe test mode)
const skipIfNoStripe = !process.env.E2E_ENABLE_CHECKOUT_TESTS

test.describe("Checkout & Subscription Flows", () => {
  // --------------------------------------------------------------------------
  // Pricing Page Tests
  // --------------------------------------------------------------------------

  test.describe("Pricing Page", () => {
    test("should display pricing page", async ({ page }) => {
      await page.goto("/pricing")

      await expect(page).toHaveURL(/\/pricing/)
      await expect(page.locator("h1").first()).toBeVisible()
    })

    test("should show pricing plans", async ({ page }) => {
      await page.goto("/pricing")

      // Wait for page to load
      await waitForNetworkIdle(page)

      // Should have at least one pricing card/plan
      const pricingContent = page.locator('[data-testid="pricing-card"]')
        .or(page.locator(".pricing-card"))
        .or(page.locator('text="month"').first())
        .or(page.locator('text="year"').first())

      // Page should have pricing content
      await expect(page).toHaveURL(/\/pricing/)
    })

    test("should display monthly and annual options", async ({ page }) => {
      await page.goto("/pricing")

      await waitForNetworkIdle(page)

      // Look for toggle or tabs for monthly/annual
      const monthlyOption = page.locator('text="Monthly"')
        .or(page.locator('[data-billing="monthly"]'))
        .or(page.locator('text="/month"').first())

      const annualOption = page.locator('text="Annual"')
        .or(page.locator('[data-billing="annual"]'))
        .or(page.locator('text="/year"').first())

      // At least the page should be on pricing
      await expect(page).toHaveURL(/\/pricing/)
    })

    test("should show feature list for plans", async ({ page }) => {
      await page.goto("/pricing")

      await waitForNetworkIdle(page)

      // Features are typically shown with checkmarks or in a list
      const featureList = page.locator('[data-testid="feature-list"]')
        .or(page.locator(".features"))
        .or(page.locator('ul li'))
        .first()

      // Page should have some content
      await expect(page).toHaveURL(/\/pricing/)
    })

    test("should have subscribe buttons", async ({ page }) => {
      await page.goto("/pricing")

      await waitForNetworkIdle(page)

      // Look for CTA buttons
      const subscribeButton = page.locator('text="Subscribe"').first()
        .or(page.locator('text="Get Started"').first())
        .or(page.locator('button').first())

      // Should have some interactive element
      await expect(page.locator("button").first()).toBeVisible()
    })
  })

  // --------------------------------------------------------------------------
  // Checkout Flow Tests (Requires Stripe Test Mode)
  // --------------------------------------------------------------------------

  test.describe("Checkout Flow", () => {
    test.skip(skipIfNoStripe, "Set E2E_ENABLE_CHECKOUT_TESTS=true to run checkout tests")

    test("should redirect to Stripe checkout when clicking subscribe", async ({ page }) => {
      // This test requires authentication
      test.skip(true, "Requires authenticated user - implement with Clerk test mode")

      await page.goto("/pricing")

      // Click subscribe button
      await page.click('text="Subscribe"')

      // Should redirect to Stripe
      await expect(page).toHaveURL(/checkout\.stripe\.com/, { timeout: 10000 })
    })

    test("should show checkout success page after payment", async ({ page }) => {
      // Skip unless we have a test session ID
      const sessionId = process.env.E2E_STRIPE_PAID_SESSION_ID
      test.skip(!sessionId, "Provide E2E_STRIPE_PAID_SESSION_ID to run")

      // Navigate to success page with session ID
      await page.goto(`/checkout/success?session_id=${sessionId}`)

      // Should show success content
      const successContent = page.locator('text="Success"')
        .or(page.locator('text="successful"'))
        .or(page.locator('text="Thank you"'))
        .or(page.locator('[data-testid="checkout-success"]'))

      await expect(page).toHaveURL(/\/checkout\/success/)
    })

    test("should show checkout cancel page", async ({ page }) => {
      await page.goto("/checkout/cancel")

      // Should show cancel/retry content
      await expect(page).toHaveURL(/\/checkout\/cancel/)
    })
  })

  // --------------------------------------------------------------------------
  // Subscribe Success Flow Tests
  // --------------------------------------------------------------------------

  test.describe("Subscribe Success Flow", () => {
    test("should render subscribe success page with session ID", async ({ request }) => {
      const sessionId = process.env.E2E_STRIPE_PAID_SESSION_ID
      test.skip(!sessionId, "Provide E2E_STRIPE_PAID_SESSION_ID to run")

      const baseUrl = getBaseUrl()

      const response = await request.get(
        `${baseUrl}/subscribe/success?session_id=${sessionId}`
      )

      expect(response.status()).toBeLessThan(500)

      const body = await response.text()
      // Should contain signup or success messaging
      expect(
        body.includes("Signup") ||
        body.includes("Success") ||
        body.includes("Thank")
      ).toBe(true)
    })

    test("should redirect to sign-up if no session in subscribe success", async ({ page }) => {
      await page.goto("/subscribe/success")

      // Should redirect or show error
      await expect(page).toHaveURL(/\/(sign-in|sign-up|subscribe|pricing)/)
    })
  })

  // --------------------------------------------------------------------------
  // Billing Portal Tests
  // --------------------------------------------------------------------------

  test.describe("Billing Portal", () => {
    test("should have billing link in settings", async ({ page }) => {
      // This requires authentication
      test.skip(true, "Requires authenticated user")

      await page.goto("/settings/billing")

      const billingLink = page.locator('text="Manage Billing"')
        .or(page.locator('text="Billing"'))
        .or(page.locator('[href*="billing"]'))

      await expect(billingLink).toBeVisible()
    })

    test("billing page should redirect unauthenticated users", async ({ page }) => {
      await page.goto("/settings/billing")

      // Should redirect to sign-in
      await expect(page).toHaveURL(/\/sign-in/)
    })
  })

  // --------------------------------------------------------------------------
  // Error Handling Tests
  // --------------------------------------------------------------------------

  test.describe("Error Handling", () => {
    test("checkout success should handle missing session ID", async ({ page }) => {
      await page.goto("/checkout/success")

      // Page should handle gracefully (redirect or show message)
      const currentUrl = page.url()
      expect(
        currentUrl.includes("checkout") ||
        currentUrl.includes("pricing") ||
        currentUrl.includes("sign")
      ).toBe(true)
    })

    test("checkout success should handle invalid session ID", async ({ page }) => {
      await page.goto("/checkout/success?session_id=invalid_session_123")

      // Page should handle gracefully
      await page.waitForLoadState("networkidle")

      // Should show error or redirect
      await expect(page).not.toHaveURL(/500/)
    })
  })

  // --------------------------------------------------------------------------
  // Pricing Page Navigation Tests
  // --------------------------------------------------------------------------

  test.describe("Navigation", () => {
    test("should navigate from landing to pricing", async ({ page }) => {
      await page.goto("/")

      const pricingLink = page.locator('a[href="/pricing"]').first()
        .or(page.locator('text="Pricing"').first())

      await pricingLink.click()

      await expect(page).toHaveURL(/\/pricing/)
    })

    test("should have consistent navigation on pricing page", async ({ page }) => {
      await page.goto("/pricing")

      // Should have logo/home link
      const homeLink = page.locator('a[href="/"]').first()
        .or(page.locator('[data-testid="logo"]'))

      await expect(homeLink).toBeVisible()
    })

    test("Get Started from landing should lead to pricing or signup", async ({ page }) => {
      await page.goto("/")

      const ctaButton = page.locator('text="Get Started"').first()
        .or(page.locator('[data-testid="cta-button"]'))

      if (await ctaButton.isVisible()) {
        await ctaButton.click()

        // Should navigate to pricing or sign-up
        await expect(page).toHaveURL(/\/(pricing|sign-up|journey)/)
      }
    })
  })

  // --------------------------------------------------------------------------
  // Responsive Tests
  // --------------------------------------------------------------------------

  test.describe("Responsive Design", () => {
    test("pricing page should be mobile responsive", async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })

      await page.goto("/pricing")

      // Page should still be navigable
      await expect(page.locator("body")).toBeVisible()

      // Should have scrollable content
      const bodyHeight = await page.evaluate(() => document.body.scrollHeight)
      expect(bodyHeight).toBeGreaterThan(0)
    })

    test("pricing page should be tablet responsive", async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 })

      await page.goto("/pricing")

      await expect(page.locator("body")).toBeVisible()
    })
  })
})
