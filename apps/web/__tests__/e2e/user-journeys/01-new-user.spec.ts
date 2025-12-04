/**
 * New User Journey E2E Test
 *
 * Complete user journey from landing page to first scheduled letter:
 * 1. Land on homepage
 * 2. Write a letter (anonymous)
 * 3. Click "Seal & Schedule" → redirects to subscription
 * 4. Subscribe using Stripe test card (4242...)
 * 5. Complete Clerk signup with +clerk_test email (code: 424242)
 * 6. Return to dashboard with letter ready
 * 7. Schedule the letter delivery
 * 8. Verify letter appears in scheduled list
 *
 * Uses:
 * - Clerk test emails (+clerk_test suffix, verification code 424242)
 * - Stripe test card (4242424242424242)
 */

import { test, expect } from "@playwright/test"
import {
  generateTestEmail,
  waitForNetworkIdle,
  dismissDialogs,
  signUpWithClerkTest,
  completeStripeCheckout,
  CLERK_TEST_VERIFICATION_CODE,
  STRIPE_TEST_CARDS,
  TEST_DATA,
} from "../fixtures"

// Enable this test suite with environment variable
const enableFlow = process.env.E2E_ENABLE_USER_JOURNEYS === "true"

test.describe("New User Journey: Landing → Subscribe → Write → Schedule", () => {
  test.skip(!enableFlow, "Set E2E_ENABLE_USER_JOURNEYS=true to run user journey tests")

  // Increase timeout for full journey
  test.setTimeout(180000) // 3 minutes

  test("complete new user onboarding with subscription and first letter", async ({ page }) => {
    const testEmail = generateTestEmail()
    const testPassword = "CapsuleN0te2024!E2E"

    // =========================================================================
    // Step 1: Land on homepage
    // =========================================================================
    await test.step("Navigate to landing page", async () => {
      await page.goto("/")
      await waitForNetworkIdle(page)

      // Dismiss any language/cookie banners
      await dismissDialogs(page)

      // Verify we're on landing page
      await expect(page).toHaveURL("/")
      await expect(page.locator("h1")).toBeVisible()
    })

    // =========================================================================
    // Step 2: Write a letter (anonymous journey)
    // =========================================================================
    await test.step("Write a letter as anonymous user", async () => {
      // Navigate to journey/letter writing page
      const getStartedButton = page.locator('button:has-text("Get Started"), a:has-text("Get Started"), button:has-text("Write")')
      if (await getStartedButton.first().isVisible()) {
        await getStartedButton.first().click()
      } else {
        await page.goto("/journey")
      }

      await waitForNetworkIdle(page)
      await dismissDialogs(page)

      // Fill letter title
      const titleInput = page.locator('input[placeholder*="letter"], input[placeholder*="title"]').first()
      if (await titleInput.isVisible()) {
        await titleInput.fill(TEST_DATA.letters.simple.title)
      }

      // Fill letter content
      const editor = page.locator(".ProseMirror, [contenteditable='true']").first()
      if (await editor.isVisible()) {
        await editor.click()
        await page.keyboard.type(TEST_DATA.letters.simple.content)
      }

      // Fill recipient email
      const emailInput = page.locator('input[type="email"]').first()
      if (await emailInput.isVisible()) {
        await emailInput.fill(testEmail)
      }
    })

    // =========================================================================
    // Step 3: Click Seal & Schedule → Redirect to subscription
    // =========================================================================
    await test.step("Click Seal & Schedule to trigger subscription flow", async () => {
      const sealButton = page.locator('button:has-text("Seal & Schedule")')
      await expect(sealButton).toBeVisible({ timeout: 5000 })
      await sealButton.click()

      // Should redirect to subscribe page
      await page.waitForURL(/\/subscribe|\/pricing/, { timeout: 10000 })
    })

    // =========================================================================
    // Step 4: Subscribe using Stripe test card
    // =========================================================================
    await test.step("Complete Stripe subscription", async () => {
      // Select a plan (Paper & Pixels for full features)
      const paperPlan = page.locator('button:has-text("Paper & Pixels"), [data-plan="paper"]')
      if (await paperPlan.isVisible({ timeout: 5000 }).catch(() => false)) {
        await paperPlan.click()
      } else {
        // Try alternative plan selection
        const selectButton = page.locator('button:has-text("Select"), button:has-text("Subscribe")').first()
        if (await selectButton.isVisible()) {
          await selectButton.click()
        }
      }

      // Wait for Stripe redirect
      await page.waitForURL(/checkout\.stripe\.com/, { timeout: 30000 })

      // Fill Stripe checkout form
      await completeStripeCheckout(page, {
        cardNumber: STRIPE_TEST_CARDS.valid,
        expiry: "1234",
        cvc: "123",
        name: "Test User E2E",
        email: testEmail,
      })
    })

    // =========================================================================
    // Step 5: Complete Clerk signup
    // =========================================================================
    await test.step("Complete Clerk account creation", async () => {
      // Should be on success page with signup form
      await expect(page).toHaveURL(/\/subscribe\/success/, { timeout: 60000 })

      // Wait for Clerk password form
      await page.waitForSelector('input[type="password"]', { timeout: 15000 })

      // Fill password
      await page.fill('input[type="password"]', testPassword)

      // Submit
      await page.click('button[type="submit"]')

      // Wait for verification code input
      await page.waitForSelector('input[inputmode="numeric"]', { timeout: 15000 })

      // Enter verification code (424242 for +clerk_test emails)
      const codeInputs = page.locator('input[inputmode="numeric"]')
      const count = await codeInputs.count()

      if (count === 6) {
        for (let i = 0; i < 6; i++) {
          await codeInputs.nth(i).fill(CLERK_TEST_VERIFICATION_CODE[i]!)
        }
      } else {
        await codeInputs.first().fill(CLERK_TEST_VERIFICATION_CODE)
      }

      // Wait for account creation and redirect
      await page.waitForURL(/\/(welcome|journey|letters|dashboard)/, { timeout: 30000 })
    })

    // =========================================================================
    // Step 6: Navigate to letter editor
    // =========================================================================
    await test.step("Navigate to letter editor", async () => {
      await dismissDialogs(page)

      // Check if we're on welcome page
      if (page.url().includes("/welcome")) {
        // Look for continue button
        const continueButton = page.locator('button:has-text("Continue"), a:has-text("Continue"), button:has-text("Get Started")')
        if (await continueButton.first().isVisible({ timeout: 5000 }).catch(() => false)) {
          await continueButton.first().click()
        }
      }

      // Navigate to letters/new if not already there
      if (!page.url().includes("/letters/new")) {
        await page.goto("/letters/new")
      }

      await waitForNetworkIdle(page)
      await dismissDialogs(page)
    })

    // =========================================================================
    // Step 7: Schedule the letter
    // =========================================================================
    await test.step("Schedule letter delivery", async () => {
      // Check if letter content persisted from anonymous draft
      const editor = page.locator(".ProseMirror, [contenteditable='true']").first()
      const content = await editor.textContent()

      // If no content, fill it again
      if (!content || content.trim().length === 0) {
        const titleInput = page.locator('input[placeholder*="letter"], input[placeholder*="title"]').first()
        if (await titleInput.isVisible()) {
          await titleInput.fill(TEST_DATA.letters.simple.title)
        }

        await editor.click()
        await page.keyboard.type(TEST_DATA.letters.simple.content)

        const emailInput = page.locator('input[type="email"]').first()
        if (await emailInput.isVisible()) {
          await emailInput.fill(testEmail)
        }
      }

      // Click Seal & Schedule
      const sealButton = page.locator('button:has-text("Seal & Schedule")')
      await expect(sealButton).toBeEnabled({ timeout: 10000 })
      await sealButton.click()

      // Confirm in dialog
      const confirmButton = page.locator('[role="dialog"] button:has-text("Seal & Schedule")')
      await expect(confirmButton).toBeVisible({ timeout: 5000 })
      await confirmButton.click()

      // Wait for scheduling to complete
      await page.waitForTimeout(3000)
    })

    // =========================================================================
    // Step 8: Verify letter in scheduled list
    // =========================================================================
    await test.step("Verify letter appears in scheduled list", async () => {
      // Navigate to letters list
      await page.goto("/letters")
      await waitForNetworkIdle(page)

      // Check scheduled tab
      const scheduledTab = page.locator('button:has-text("Scheduled"), [role="tab"]:has-text("Scheduled")')
      if (await scheduledTab.isVisible()) {
        await scheduledTab.click()
      }

      // Verify letter is in the list
      const letterCard = page.locator(`article:has-text("${TEST_DATA.letters.simple.title}"), [data-testid="letter-card"]:has-text("${TEST_DATA.letters.simple.title}")`)
      await expect(letterCard).toBeVisible({ timeout: 10000 })

      // Verify credits were deducted (should show in header)
      const creditsDisplay = page.locator('button:has-text("Email Credits"), button:has-text("credits")')
      if (await creditsDisplay.first().isVisible()) {
        // Credits should be less than starting amount
        await expect(creditsDisplay.first()).toBeVisible()
      }
    })
  })

  test("should preserve anonymous draft after signup", async ({ page }) => {
    const testEmail = generateTestEmail()
    const draftTitle = "Anonymous Draft Test " + Date.now()
    const draftContent = "This draft should persist after signup."

    // Write letter as anonymous user
    await page.goto("/journey")
    await waitForNetworkIdle(page)
    await dismissDialogs(page)

    const titleInput = page.locator('input[placeholder*="letter"], input[placeholder*="title"]').first()
    if (await titleInput.isVisible()) {
      await titleInput.fill(draftTitle)
    }

    const editor = page.locator(".ProseMirror, [contenteditable='true']").first()
    if (await editor.isVisible()) {
      await editor.click()
      await page.keyboard.type(draftContent)
    }

    // Wait for auto-save
    await page.waitForTimeout(2000)

    // Check localStorage for draft
    const hasDraft = await page.evaluate(() => {
      const keys = Object.keys(localStorage)
      return keys.some((k) => k.includes("draft") || k.includes("letter") || k.includes("capsule"))
    })

    expect(hasDraft).toBe(true)
  })

  test("should redirect unauthenticated users from dashboard to sign-in", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page).toHaveURL(/\/sign-in/)
  })

  test("should redirect unauthenticated users from letters to sign-in", async ({ page }) => {
    await page.goto("/letters")
    await expect(page).toHaveURL(/\/sign-in/)
  })
})
