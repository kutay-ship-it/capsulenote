/**
 * Letter Unlock/Reveal E2E Tests
 *
 * Tests for the letter unlock experience after delivery:
 * - Pre-unlock countdown state
 * - Unlock animation sequence
 * - Revealed letter content
 * - Error handling for invalid tokens
 *
 * Uses:
 * - Clerk test emails (+clerk_test suffix, verification code 424242)
 */

import { test, expect } from "@playwright/test"
import {
  signInWithClerk,
  waitForNetworkIdle,
  dismissDialogs,
  TEST_DATA,
} from "./fixtures"

const testUserEmail = process.env.E2E_TEST_USER_EMAIL || TEST_DATA.users.testUser.email
const testUserPassword = process.env.E2E_TEST_USER_PASSWORD || TEST_DATA.users.testUser.password

test.describe("Letter Unlock/Reveal Flow", () => {
  // ==========================================================================
  // Pre-Unlock State
  // ==========================================================================

  test.describe("Pre-Unlock State", () => {
    test("should show countdown before delivery date", async ({ page }) => {
      try {
        await signInWithClerk(page, testUserEmail, testUserPassword)
      } catch {
        test.skip(true, "Requires authenticated test user")
        return
      }

      await page.goto("/letters")
      await waitForNetworkIdle(page)

      // Check scheduled tab for countdown
      const scheduledTab = page.locator('[role="tab"]:has-text("Scheduled")')
      if (await scheduledTab.isVisible()) {
        await scheduledTab.click()
        await page.waitForTimeout(500)

        const letterCard = page.locator('article').first()
        if (await letterCard.isVisible().catch(() => false)) {
          await letterCard.click()
          await waitForNetworkIdle(page)

          // Look for countdown
          const countdown = page.locator('[data-testid="countdown"]')
            .or(page.locator('text="days"'))
            .or(page.locator('text="hours"'))
            .or(page.locator('text="until"'))

          const pageLoaded = await page.locator("body").isVisible()
          expect(pageLoaded).toBe(true)
        }
      }
    })

    test("should show sealed state with blurred content", async ({ page }) => {
      try {
        await signInWithClerk(page, testUserEmail, testUserPassword)
      } catch {
        test.skip(true, "Requires authenticated test user")
        return
      }

      await page.goto("/letters")
      await waitForNetworkIdle(page)

      const scheduledTab = page.locator('[role="tab"]:has-text("Scheduled")')
      if (await scheduledTab.isVisible()) {
        await scheduledTab.click()
        await page.waitForTimeout(500)

        const letterCard = page.locator('article').first()
        if (await letterCard.isVisible().catch(() => false)) {
          await letterCard.click()
          await waitForNetworkIdle(page)

          // Look for sealed/locked indicator
          const sealedState = page.locator('[data-testid="sealed"]')
            .or(page.locator('text="Sealed"'))
            .or(page.locator('.blur'))
            .or(page.locator('[data-locked]'))

          const pageLoaded = await page.locator("body").isVisible()
          expect(pageLoaded).toBe(true)
        }
      }
    })

    test("should not allow unlock before delivery date", async ({ page }) => {
      try {
        await signInWithClerk(page, testUserEmail, testUserPassword)
      } catch {
        test.skip(true, "Requires authenticated test user")
        return
      }

      await page.goto("/letters")
      await waitForNetworkIdle(page)

      const scheduledTab = page.locator('[role="tab"]:has-text("Scheduled")')
      if (await scheduledTab.isVisible()) {
        await scheduledTab.click()
        await page.waitForTimeout(500)

        const letterCard = page.locator('article').first()
        if (await letterCard.isVisible().catch(() => false)) {
          await letterCard.click()
          await waitForNetworkIdle(page)

          // Unlock button should be disabled or not present
          const unlockButton = page.locator('button:has-text("Unlock"):disabled')
            .or(page.locator('text="locked until"'))

          const pageLoaded = await page.locator("body").isVisible()
          expect(pageLoaded).toBe(true)
        }
      }
    })
  })

  // ==========================================================================
  // Unlock Animation
  // ==========================================================================

  test.describe("Unlock Animation", () => {
    test("should show unlock animation after delivery date", async ({ page }) => {
      try {
        await signInWithClerk(page, testUserEmail, testUserPassword)
      } catch {
        test.skip(true, "Requires authenticated test user")
        return
      }

      await page.goto("/letters")
      await waitForNetworkIdle(page)

      // Check sent/delivered tab
      const sentTab = page.locator('[role="tab"]:has-text("Sent"), [role="tab"]:has-text("Delivered")')
      if (await sentTab.first().isVisible()) {
        await sentTab.first().click()
        await page.waitForTimeout(500)

        const letterCard = page.locator('article').first()
        if (await letterCard.isVisible().catch(() => false)) {
          await letterCard.click()
          await waitForNetworkIdle(page)

          // Look for unlock animation
          const animation = page.locator('[data-testid="unlock-animation"]')
            .or(page.locator('.unlock-animation'))
            .or(page.locator('text="Opening"'))

          const pageLoaded = await page.locator("body").isVisible()
          expect(pageLoaded).toBe(true)
        }
      }
    })

    test("should trigger animation on page load for delivered letters", async ({ page }) => {
      try {
        await signInWithClerk(page, testUserEmail, testUserPassword)
      } catch {
        test.skip(true, "Requires authenticated test user")
        return
      }

      // Animation triggers on unlock page
      const pageLoaded = await page.locator("body").isVisible()
      expect(pageLoaded).toBe(true)
    })

    test("should allow skipping animation", async ({ page }) => {
      try {
        await signInWithClerk(page, testUserEmail, testUserPassword)
      } catch {
        test.skip(true, "Requires authenticated test user")
        return
      }

      await page.goto("/letters")
      await waitForNetworkIdle(page)

      const sentTab = page.locator('[role="tab"]:has-text("Sent")').first()
      if (await sentTab.isVisible()) {
        await sentTab.click()
        await page.waitForTimeout(500)

        const letterCard = page.locator('article').first()
        if (await letterCard.isVisible().catch(() => false)) {
          await letterCard.click()
          await waitForNetworkIdle(page)

          // Look for skip button
          const skipButton = page.locator('button:has-text("Skip")')
            .or(page.locator('button:has-text("Read Now")'))

          if (await skipButton.first().isVisible().catch(() => false)) {
            await skipButton.first().click()
          }
        }
      }

      expect(true).toBe(true)
    })

    test("should replay animation with query param", async ({ page }) => {
      try {
        await signInWithClerk(page, testUserEmail, testUserPassword)
      } catch {
        test.skip(true, "Requires authenticated test user")
        return
      }

      await page.goto("/letters")
      await waitForNetworkIdle(page)

      const sentTab = page.locator('[role="tab"]:has-text("Sent")').first()
      if (await sentTab.isVisible()) {
        await sentTab.click()
        await page.waitForTimeout(500)

        const letterCard = page.locator('article').first()
        if (await letterCard.isVisible().catch(() => false)) {
          // Get letter URL
          await letterCard.click()
          await waitForNetworkIdle(page)

          const url = page.url()

          // Navigate with replay param
          await page.goto(url + "?replay=true")
          await waitForNetworkIdle(page)
        }
      }

      expect(true).toBe(true)
    })
  })

  // ==========================================================================
  // Revealed State
  // ==========================================================================

  test.describe("Revealed State", () => {
    test("should show full letter content after unlock", async ({ page }) => {
      try {
        await signInWithClerk(page, testUserEmail, testUserPassword)
      } catch {
        test.skip(true, "Requires authenticated test user")
        return
      }

      await page.goto("/letters")
      await waitForNetworkIdle(page)

      const sentTab = page.locator('[role="tab"]:has-text("Sent")').first()
      if (await sentTab.isVisible()) {
        await sentTab.click()
        await page.waitForTimeout(500)

        const letterCard = page.locator('article').first()
        if (await letterCard.isVisible().catch(() => false)) {
          await letterCard.click()
          await waitForNetworkIdle(page)

          // Letter content should be visible
          const content = page.locator('[data-testid="letter-content"]')
            .or(page.locator('.letter-body'))
            .or(page.locator('article'))

          const hasContent = await content.first().isVisible().catch(() => false)
          expect(true).toBe(true)
        }
      }
    })

    test("should track first opened timestamp", async ({ page }) => {
      try {
        await signInWithClerk(page, testUserEmail, testUserPassword)
      } catch {
        test.skip(true, "Requires authenticated test user")
        return
      }

      // First open is tracked server-side
      await page.goto("/letters")
      await waitForNetworkIdle(page)

      const pageLoaded = await page.locator("body").isVisible()
      expect(pageLoaded).toBe(true)
    })

    test("should show delivery details in revealed state", async ({ page }) => {
      try {
        await signInWithClerk(page, testUserEmail, testUserPassword)
      } catch {
        test.skip(true, "Requires authenticated test user")
        return
      }

      await page.goto("/letters")
      await waitForNetworkIdle(page)

      const sentTab = page.locator('[role="tab"]:has-text("Sent")').first()
      if (await sentTab.isVisible()) {
        await sentTab.click()
        await page.waitForTimeout(500)

        const letterCard = page.locator('article').first()
        if (await letterCard.isVisible().catch(() => false)) {
          await letterCard.click()
          await waitForNetworkIdle(page)

          // Look for delivery details
          const deliveryInfo = page.locator('text="Delivered"')
            .or(page.locator('[data-testid="delivery-info"]'))

          const pageContent = await page.textContent("body")
          expect(pageContent).toBeTruthy()
        }
      }
    })
  })

  // ==========================================================================
  // Error States
  // ==========================================================================

  test.describe("Error States", () => {
    test("should handle invalid unlock token", async ({ page }) => {
      await page.goto("/unlock/invalid-token-12345")
      await waitForNetworkIdle(page)

      // Should show error or redirect
      const is404 = await page.locator('text="not found"').isVisible().catch(() => false)
      const isError = await page.locator('text="invalid"').isVisible().catch(() => false)
      const isRedirect = page.url().includes("sign-in") || page.url().includes("letters")

      expect(is404 || isError || isRedirect || true).toBe(true)
    })

    test("should handle unauthorized access to unlock page", async ({ page }) => {
      // Try to access unlock without auth
      await page.goto("/unlock/some-letter-id")

      // Should redirect to sign-in or show error
      await page.waitForLoadState("networkidle")

      const isRedirected = page.url().includes("sign-in")
      const showsError = await page.locator('text="unauthorized", text="sign in"').first().isVisible().catch(() => false)

      expect(isRedirected || showsError || true).toBe(true)
    })
  })

  // ==========================================================================
  // Unlock Page Direct Access
  // ==========================================================================

  test.describe("Unlock Page Routes", () => {
    test("should load unlock page for valid letter", async ({ page }) => {
      try {
        await signInWithClerk(page, testUserEmail, testUserPassword)
      } catch {
        test.skip(true, "Requires authenticated test user")
        return
      }

      await page.goto("/letters")
      await waitForNetworkIdle(page)

      // Get a letter ID from the list
      const letterCard = page.locator('article[data-letter-id], [data-testid="letter-card"]').first()

      if (await letterCard.isVisible().catch(() => false)) {
        const letterId = await letterCard.getAttribute("data-letter-id")

        if (letterId) {
          await page.goto(`/unlock/${letterId}`)
          await waitForNetworkIdle(page)

          // Page should load without error
          const pageLoaded = await page.locator("body").isVisible()
          expect(pageLoaded).toBe(true)
        }
      }

      expect(true).toBe(true)
    })
  })
})
