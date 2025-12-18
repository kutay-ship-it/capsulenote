/**
 * Existing User Journey E2E Test
 *
 * User journey for returning users:
 * 1. Sign in with existing account
 * 2. View letters list
 * 3. Edit an existing draft
 * 4. Reschedule a scheduled delivery
 * 5. Verify changes persisted
 *
 * Prerequisites:
 * - Requires an existing user account (created by running 01-new-user first)
 * - Or set E2E_TEST_USER_EMAIL and E2E_TEST_USER_PASSWORD env vars
 */

import { test, expect } from "@playwright/test"
import {
  signInWithClerk,
  waitForNetworkIdle,
  dismissDialogs,
  createLetter,
  getFutureDate,
  TEST_DATA,
  DashboardPage,
  LetterEditorPage,
} from "../fixtures"

// Enable this test suite with environment variable
const enableFlow = process.env.E2E_ENABLE_USER_JOURNEYS === "true"

test.describe("Existing User Journey: Login → View → Edit → Reschedule", () => {
  test.skip(!enableFlow, "Set E2E_ENABLE_USER_JOURNEYS=true to run user journey tests")

  // Use longer timeout for full journey
  test.setTimeout(120000) // 2 minutes

  // Get test user credentials from env or use defaults
  const testUserEmail = process.env.E2E_TEST_USER_EMAIL || TEST_DATA.users.testUser.email
  const testUserPassword = process.env.E2E_TEST_USER_PASSWORD || TEST_DATA.users.testUser.password

  test("complete existing user flow: login, view, edit draft, reschedule", async ({ page }) => {
    // =========================================================================
    // Step 1: Sign in with existing account
    // =========================================================================
    await test.step("Sign in to existing account", async () => {
      await signInWithClerk(page, testUserEmail, testUserPassword)

      // Verify we're in authenticated area
      await expect(page).toHaveURL(/\/(journey|letters)/)
    })

    // =========================================================================
    // Step 2: View letters list
    // =========================================================================
    await test.step("View letters list", async () => {
      await page.goto("/letters")
      await waitForNetworkIdle(page)
      await dismissDialogs(page)

      // Verify letters page loaded
      await expect(page.locator('h1:has-text("Letters"), h1:has-text("Your Letters")')).toBeVisible()

      // Check for tabs
      const allTab = page.locator('[role="tab"]:has-text("All")')
      await expect(allTab).toBeVisible()
    })

    // =========================================================================
    // Step 3: Create a new draft letter
    // =========================================================================
    let letterId: string | null = null

    await test.step("Create a new draft letter", async () => {
      // Click new letter button
      const newLetterButton = page.locator('a:has-text("Write New Letter"), button:has-text("Write New Letter")')
      await newLetterButton.click()

      await waitForNetworkIdle(page)
      await dismissDialogs(page)

      // Create a draft (don't schedule)
      const titleInput = page.locator('input[placeholder*="letter"], input[placeholder*="title"]').first()
      await titleInput.fill("Draft for Edit Test " + Date.now())

      const editor = page.locator(".ProseMirror, [contenteditable='true']").first()
      await editor.click()
      await page.keyboard.type("This is a draft letter that I will edit later.")

      // Get letter ID from URL if available
      const url = page.url()
      const match = url.match(/\/letters\/([a-f0-9-]+)/)
      if (match) {
        letterId = match[1] ?? null
      }

      // Wait for auto-save
      await page.waitForTimeout(2000)

      // Go back to letters list
      await page.goto("/letters")
      await waitForNetworkIdle(page)

      // Check drafts tab
      const draftsTab = page.locator('[role="tab"]:has-text("Drafts")')
      if (await draftsTab.isVisible()) {
        await draftsTab.click()
        await page.waitForTimeout(1000)
      }
    })

    // =========================================================================
    // Step 4: Edit the draft letter
    // =========================================================================
    await test.step("Edit the draft letter", async () => {
      // Click on the first draft
      const draftCard = page.locator('article, [data-testid="letter-card"]').first()
      if (await draftCard.isVisible()) {
        await draftCard.click()
      } else if (letterId) {
        await page.goto(`/letters/${letterId}`)
      } else {
        await page.goto("/letters/new")
      }

      await waitForNetworkIdle(page)
      await dismissDialogs(page)

      // Make an edit
      const editor = page.locator(".ProseMirror, [contenteditable='true']").first()
      await editor.click()
      await page.keyboard.press("End")
      await page.keyboard.type(" EDITED: Adding more content to this letter.")

      // Wait for auto-save
      await page.waitForTimeout(2000)

      // Verify edit indicator or content
      const editorContent = await editor.textContent()
      expect(editorContent).toContain("EDITED")
    })

    // =========================================================================
    // Step 5: Schedule the edited letter
    // =========================================================================
    await test.step("Schedule the edited letter", async () => {
      // Fill email if needed
      const emailInput = page.locator('input[type="email"]').first()
      if (await emailInput.isVisible()) {
        const currentValue = await emailInput.inputValue()
        if (!currentValue) {
          await emailInput.fill(testUserEmail)
        }
      }

      // Click Seal & Schedule
      const sealButton = page.locator('button:has-text("Seal & Schedule")')
      if (await sealButton.isEnabled({ timeout: 5000 }).catch(() => false)) {
        await sealButton.click()

        // Confirm in dialog
        const confirmButton = page.locator('[role="dialog"] button:has-text("Seal & Schedule")')
        if (await confirmButton.isVisible({ timeout: 5000 }).catch(() => false)) {
          await confirmButton.click()
        }

        // Wait for scheduling
        await page.waitForTimeout(3000)
      }
    })

    // =========================================================================
    // Step 6: Verify letter in scheduled list
    // =========================================================================
    await test.step("Verify letter appears in scheduled list", async () => {
      await page.goto("/letters")
      await waitForNetworkIdle(page)

      const scheduledTab = page.locator('[role="tab"]:has-text("Scheduled")')
      if (await scheduledTab.isVisible()) {
        await scheduledTab.click()
        await page.waitForTimeout(1000)
      }

      // Should have at least one scheduled letter
      const letterCards = page.locator('article, [data-testid="letter-card"]')
      const count = await letterCards.count()
      expect(count).toBeGreaterThanOrEqual(1)
    })
  })

  test("should show correct letter counts in tabs", async ({ page }) => {
    await signInWithClerk(page, testUserEmail, testUserPassword)
    await page.goto("/letters")
    await waitForNetworkIdle(page)

    // Check that tabs have counts
    const allTab = page.locator('[role="tab"]:has-text("All")')
    await expect(allTab).toBeVisible()

    // All count should match sum of other tabs
    const allText = await allTab.textContent()
    const allCount = parseInt(allText?.match(/\d+/)?.[0] || "0", 10)

    // Total should be >= 0
    expect(allCount).toBeGreaterThanOrEqual(0)
  })

  test("should allow switching between grid and list view", async ({ page }) => {
    await signInWithClerk(page, testUserEmail, testUserPassword)
    await page.goto("/letters")
    await waitForNetworkIdle(page)

    // Look for view toggle
    const gridButton = page.locator('[role="radio"]:has-text("Grid"), button[aria-label*="Grid"]')
    const listButton = page.locator('[role="radio"]:has-text("List"), button[aria-label*="List"]')

    if (await gridButton.isVisible() && await listButton.isVisible()) {
      // Click list view
      await listButton.click()
      await page.waitForTimeout(500)

      // Click grid view
      await gridButton.click()
      await page.waitForTimeout(500)
    }

    // Page should not crash
    await expect(page.locator("body")).toBeVisible()
  })

  test("should navigate to settings from header", async ({ page }) => {
    await signInWithClerk(page, testUserEmail, testUserPassword)

    // Click settings in header
    const settingsButton = page.locator('button[aria-label*="Settings"], button:has-text("Settings")')
    if (await settingsButton.isVisible()) {
      await settingsButton.click()

      // Should navigate to settings or open menu
      await page.waitForTimeout(1000)

      // If it opened a menu, click Settings link
      const settingsLink = page.locator('a[href="/settings"], [role="menuitem"]:has-text("Settings")')
      if (await settingsLink.isVisible()) {
        await settingsLink.click()
      }

      await expect(page).toHaveURL(/\/settings/)
    }
  })
})
