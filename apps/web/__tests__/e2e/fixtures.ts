/**
 * Playwright E2E Test Fixtures
 *
 * Provides reusable test fixtures for E2E tests including:
 * - Clerk test authentication helpers (using +clerk_test emails)
 * - Stripe checkout helpers
 * - Navigation utilities
 * - Test data factories
 * - Page object models
 */

import { test as base, expect, Page, BrowserContext } from "@playwright/test"

// ============================================================================
// Constants
// ============================================================================

/**
 * Clerk test verification code - works with +clerk_test email suffix
 * @see https://clerk.com/docs/testing/test-emails-and-phones
 */
export const CLERK_TEST_VERIFICATION_CODE = "424242"

/**
 * Stripe test card numbers
 * @see https://stripe.com/docs/testing
 */
export const STRIPE_TEST_CARDS = {
  valid: "4242424242424242",
  declined: "4000000000000002",
  insufficientFunds: "4000000000009995",
  expiredCard: "4000000000000069",
  threeDSecure: "4000002500003155",
  requiresAuth: "4000002760003184",
}

/**
 * Test address for physical mail (Lob test-friendly)
 */
export const TEST_ADDRESS = {
  name: "Test User",
  line1: "210 King Street",
  line2: "",
  city: "San Francisco",
  state: "CA",
  postalCode: "94107",
  country: "US",
}

// ============================================================================
// Test Fixtures
// ============================================================================

type Fixtures = {
  authenticatedPage: Page
  anonymousPage: Page
  testEmail: string
}

/**
 * Extended test with fixtures
 */
export const test = base.extend<Fixtures>({
  // Generate unique test email with +clerk_test suffix for each test
  testEmail: async ({}, use) => {
    const timestamp = Date.now()
    const random = Math.random().toString(36).slice(2, 8)
    const email = `test-${timestamp}-${random}+clerk_test@example.com`
    await use(email)
  },

  // Page with authenticated user (requires manual login in test)
  authenticatedPage: async ({ page }, use) => {
    await page.goto("/")
    await use(page)
  },

  // Page without authentication
  anonymousPage: async ({ page }, use) => {
    await page.goto("/")
    await use(page)
  },
})

export { expect }

// ============================================================================
// Authentication Helpers
// ============================================================================

/**
 * Complete Clerk signup flow using test email
 * Email must have +clerk_test suffix to use verification code 424242
 */
export async function signUpWithClerkTest(
  page: Page,
  email: string,
  password: string = "CapsuleN0te2024!Test"
): Promise<void> {
  // Wait for password input (Clerk step 2)
  await page.waitForSelector('input[type="password"]', { timeout: 10000 })

  // Fill password
  await page.fill('input[type="password"]', password)

  // Submit password
  await page.click('button[type="submit"]')

  // Wait for verification code input
  await page.waitForSelector('input[inputmode="numeric"]', { timeout: 10000 })

  // Enter verification code (424242 for +clerk_test emails)
  const codeInputs = page.locator('input[inputmode="numeric"]')
  const count = await codeInputs.count()

  if (count === 6) {
    // Individual digit inputs
    for (let i = 0; i < 6; i++) {
      await codeInputs.nth(i).fill(CLERK_TEST_VERIFICATION_CODE[i]!)
    }
  } else {
    // Single input field
    await codeInputs.first().fill(CLERK_TEST_VERIFICATION_CODE)
  }

  // Wait for verification to complete and redirect
  await page.waitForURL(/\/(dashboard|letters|welcome|journey)/, { timeout: 15000 })
}

/**
 * Sign in with existing Clerk account
 */
export async function signInWithClerk(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await page.goto("/sign-in")

  // Wait for Clerk to load
  await page.waitForSelector('input[type="email"], input[name="identifier"]', {
    timeout: 10000,
  })

  // Enter email
  await page.fill('input[type="email"], input[name="identifier"]', email)
  await page.click('button[type="submit"]')

  // Wait for password input
  await page.waitForSelector('input[type="password"]', { timeout: 10000 })

  // Enter password
  await page.fill('input[type="password"]', password)
  await page.click('button[type="submit"]')

  // Wait for redirect to authenticated area
  await page.waitForURL(/\/(dashboard|letters|journey)/, { timeout: 15000 })
}

// ============================================================================
// Stripe Checkout Helpers
// ============================================================================

/**
 * Complete Stripe checkout with test card
 */
export async function completeStripeCheckout(
  page: Page,
  options: {
    cardNumber?: string
    expiry?: string
    cvc?: string
    name?: string
    email?: string
  } = {}
): Promise<void> {
  const {
    cardNumber = STRIPE_TEST_CARDS.valid,
    expiry = "1234",
    cvc = "123",
    name = "Test User",
    email,
  } = options

  // Wait for Stripe checkout to load
  await page.waitForURL(/checkout\.stripe\.com/, { timeout: 30000 })

  // Fill email if provided and field exists
  if (email) {
    const emailInput = page.locator('input[name="email"]')
    if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await emailInput.fill(email)
    }
  }

  // Fill card number
  const cardInput = page.locator('input[name="cardNumber"]')
  await cardInput.waitFor({ timeout: 10000 })
  await cardInput.fill(cardNumber)

  // Fill expiry
  const expiryInput = page.locator('input[name="cardExpiry"]')
  await expiryInput.fill(expiry)

  // Fill CVC
  const cvcInput = page.locator('input[name="cardCvc"]')
  await cvcInput.fill(cvc)

  // Fill cardholder name
  const nameInput = page.locator('input[name="billingName"]')
  if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await nameInput.fill(name)
  }

  // Submit payment
  await page.click('button[type="submit"]')

  // Wait for redirect back to app
  await page.waitForURL(/\/subscribe\/success|\/dashboard|\/welcome/, {
    timeout: 60000,
  })
}

// ============================================================================
// Letter Creation Helpers
// ============================================================================

/**
 * Create and optionally schedule a letter
 */
export async function createLetter(
  page: Page,
  options: {
    title: string
    content: string
    recipientEmail?: string
    recipientType?: "myself" | "someone-else"
    deliveryMethod?: "email" | "physical" | "both"
    deliveryDate?: string
    schedule?: boolean
  }
): Promise<void> {
  const {
    title,
    content,
    recipientEmail,
    recipientType = "myself",
    deliveryMethod = "email",
    deliveryDate,
    schedule = false,
  } = options

  // Navigate to letter editor if not already there
  if (!page.url().includes("/letters/new")) {
    await page.goto("/letters/new")
  }

  await waitForNetworkIdle(page)

  // Dismiss any welcome dialogs
  const dismissButton = page.locator('button:has-text("Dismiss"), button:has-text("Skip"), button:has-text("Close")')
  if (await dismissButton.first().isVisible({ timeout: 2000 }).catch(() => false)) {
    await dismissButton.first().click()
  }

  // Fill title
  const titleInput = page.locator('input[placeholder*="letter"], input[placeholder*="title"]').first()
  if (await titleInput.isVisible()) {
    await titleInput.fill(title)
  }

  // Fill content in rich text editor
  const editor = page.locator(".ProseMirror, [contenteditable='true']").first()
  if (await editor.isVisible()) {
    await editor.click()
    await editor.fill(content)
  }

  // Set recipient type
  if (recipientType === "someone-else") {
    const someoneElseButton = page.locator('button:has-text("Someone Else")')
    if (await someoneElseButton.isVisible()) {
      await someoneElseButton.click()
    }
  }

  // Fill recipient email if provided
  if (recipientEmail) {
    const emailInput = page.locator('input[type="email"]').first()
    if (await emailInput.isVisible()) {
      await emailInput.fill(recipientEmail)
    }
  }

  // Set delivery method
  if (deliveryMethod === "physical" || deliveryMethod === "both") {
    const physicalButton = page.locator('button:has-text("Physical")')
    if (await physicalButton.isVisible()) {
      await physicalButton.click()
    }
  }

  if (deliveryMethod === "both") {
    const emailButton = page.locator('button:has-text("Email")')
    if (await emailButton.isVisible()) {
      await emailButton.click()
    }
  }

  // Schedule if requested
  if (schedule) {
    const scheduleButton = page.locator('button:has-text("Seal & Schedule")')
    if (await scheduleButton.isEnabled()) {
      await scheduleButton.click()

      // Confirm in dialog
      const confirmButton = page.locator('dialog button:has-text("Seal & Schedule"), [role="dialog"] button:has-text("Seal & Schedule")')
      if (await confirmButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await confirmButton.click()
      }

      // Wait for success
      await page.waitForURL(/\/letters(?!\/new)/, { timeout: 10000 })
    }
  }
}

/**
 * Add shipping address for physical mail
 */
export async function addShippingAddress(
  page: Page,
  address: typeof TEST_ADDRESS = TEST_ADDRESS
): Promise<void> {
  // Click "Add New Address" if visible
  const addButton = page.locator('button:has-text("Add New Address")')
  if (await addButton.isVisible()) {
    await addButton.click()
  }

  // Fill address fields
  const nameInput = page.locator('input[placeholder*="John Doe"], input[aria-label*="Recipient"]')
  if (await nameInput.isVisible()) {
    await nameInput.fill(address.name)
  }

  const streetInput = page.locator('input[placeholder*="123 Main"], input[placeholder*="Street"]')
  if (await streetInput.isVisible()) {
    await streetInput.fill(address.line1)
  }

  const cityInput = page.locator('input[placeholder*="San Francisco"], input[placeholder*="City"]')
  if (await cityInput.isVisible()) {
    await cityInput.fill(address.city)
  }

  // Select state from dropdown
  const stateSelect = page.locator('button:has-text("State"), [role="combobox"]:has-text("State")')
  if (await stateSelect.isVisible()) {
    await stateSelect.click()
    await page.locator(`[role="option"]:has-text("California")`).click()
  }

  const zipInput = page.locator('input[placeholder*="94102"], input[placeholder*="ZIP"]')
  if (await zipInput.isVisible()) {
    await zipInput.fill(address.postalCode)
  }

  // Save address
  const saveButton = page.locator('button:has-text("Save Address")')
  if (await saveButton.isVisible()) {
    await saveButton.click()
    await page.waitForSelector('text="Address saved"', { timeout: 5000 }).catch(() => {})
  }
}

// ============================================================================
// Page Object Models
// ============================================================================

/**
 * Landing Page interactions
 */
export class LandingPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/")
  }

  async clickGetStarted() {
    await this.page.click('text="Get Started"')
  }

  async clickPricing() {
    await this.page.click('text="Pricing"')
  }

  async getHeroTitle() {
    return this.page.locator("h1").first().textContent()
  }

  async isLoaded() {
    await expect(this.page).toHaveURL("/")
  }

  async fillLetterForm(options: { title?: string; content?: string; email?: string }) {
    if (options.title) {
      const titleInput = this.page.locator('input[placeholder*="letter"], input[placeholder*="title"]').first()
      if (await titleInput.isVisible()) {
        await titleInput.fill(options.title)
      }
    }

    if (options.content) {
      const editor = this.page.locator(".ProseMirror, [contenteditable='true']").first()
      if (await editor.isVisible()) {
        await editor.click()
        await editor.fill(options.content)
      }
    }

    if (options.email) {
      const emailInput = this.page.locator('input[type="email"]').first()
      if (await emailInput.isVisible()) {
        await emailInput.fill(options.email)
      }
    }
  }

  async clickSealAndSchedule() {
    await this.page.click('button:has-text("Seal & Schedule")')
  }
}

/**
 * Pricing/Subscribe Page interactions
 */
export class PricingPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/pricing")
  }

  async selectPlan(planName: string) {
    await this.page.click(`text="${planName}"`)
  }

  async clickSubscribe(planType: "digital" | "paper") {
    const buttonText = planType === "paper" ? "Paper & Pixels" : "Digital Only"
    await this.page.click(`button:has-text("${buttonText}")`)
  }

  async isLoaded() {
    await expect(this.page).toHaveURL(/\/pricing|\/subscribe/)
  }
}

/**
 * Auth Page interactions (Sign In/Sign Up)
 */
export class AuthPage {
  constructor(private page: Page) {}

  async gotoSignIn() {
    await this.page.goto("/sign-in")
  }

  async gotoSignUp() {
    await this.page.goto("/sign-up")
  }

  async fillEmail(email: string) {
    await this.page.fill('input[type="email"], input[name="identifier"]', email)
  }

  async fillPassword(password: string) {
    await this.page.fill('input[type="password"]', password)
  }

  async submitForm() {
    await this.page.click('button[type="submit"]')
  }

  async isSignInPage() {
    await expect(this.page).toHaveURL(/\/sign-in/)
  }

  async isSignUpPage() {
    await expect(this.page).toHaveURL(/\/sign-up/)
  }
}

/**
 * Dashboard/Journey Page interactions
 */
export class DashboardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/journey")
  }

  async gotoLetters() {
    await this.page.goto("/letters")
  }

  async clickNewLetter() {
    await this.page.click('text="Write New Letter"')
  }

  async getLetterCount() {
    const letters = this.page.locator('[data-testid="letter-card"], article')
    return letters.count()
  }

  async selectLetter(index: number) {
    await this.page.locator('article, [data-testid="letter-card"]').nth(index).click()
  }

  async getLetterByTitle(title: string) {
    return this.page.locator(`article:has-text("${title}"), [data-testid="letter-card"]:has-text("${title}")`)
  }

  async isLoaded() {
    await expect(this.page).toHaveURL(/\/journey|\/letters|\/dashboard/)
  }
}

/**
 * Letter Editor Page interactions
 */
export class LetterEditorPage {
  constructor(private page: Page) {}

  async goto(letterId?: string) {
    if (letterId) {
      await this.page.goto(`/letters/${letterId}`)
    } else {
      await this.page.goto("/letters/new")
    }
  }

  async setTitle(title: string) {
    const titleInput = this.page.locator('input[placeholder*="letter"], input[placeholder*="title"]').first()
    await titleInput.fill(title)
  }

  async setContent(content: string) {
    const editor = this.page.locator(".ProseMirror, [contenteditable='true']").first()
    await editor.click()
    await editor.fill(content)
  }

  async setRecipientEmail(email: string) {
    const emailInput = this.page.locator('input[type="email"]').first()
    await emailInput.fill(email)
  }

  async selectDeliveryMethod(method: "email" | "physical" | "both") {
    if (method === "physical" || method === "both") {
      await this.page.click('button:has-text("Physical")')
    }
    if (method === "email" || method === "both") {
      await this.page.click('button:has-text("Email")')
    }
  }

  async scheduleDelivery() {
    await this.page.click('button:has-text("Seal & Schedule")')

    // Confirm in dialog
    const confirmButton = this.page.locator('[role="dialog"] button:has-text("Seal & Schedule")')
    if (await confirmButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await confirmButton.click()
    }
  }

  async isLoaded() {
    await expect(this.page.locator(".ProseMirror, [contenteditable='true']").first()).toBeVisible()
  }
}

/**
 * Settings Page interactions
 */
export class SettingsPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/settings")
  }

  async gotoBilling() {
    await this.page.goto("/settings?tab=billing")
  }

  async gotoProfile() {
    await this.page.goto("/settings/profile")
  }

  async gotoPrivacy() {
    await this.page.goto("/settings/privacy")
  }

  async clickExportData() {
    await this.page.click('button:has-text("Export Data"), button:has-text("Download")')
  }

  async clickDeleteAccount() {
    await this.page.click('button:has-text("Delete Account")')
  }

  async confirmDeleteAccount() {
    // Type confirmation text if required
    const confirmInput = this.page.locator('input[placeholder*="delete"], input[placeholder*="confirm"]')
    if (await confirmInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmInput.fill("DELETE")
    }

    await this.page.click('[role="dialog"] button:has-text("Delete"), [role="alertdialog"] button:has-text("Delete")')
  }

  async isLoaded() {
    await expect(this.page).toHaveURL(/\/settings/)
  }
}

/**
 * Delivery Management interactions
 */
export class DeliveryPage {
  constructor(private page: Page) {}

  async gotoDeliveries() {
    await this.page.goto("/deliveries")
  }

  async getDeliveryByLetterId(letterId: string) {
    return this.page.locator(`[data-delivery-letter="${letterId}"], [href*="${letterId}"]`)
  }

  async cancelDelivery(deliveryId: string) {
    await this.page.click(`[data-delivery="${deliveryId}"] button:has-text("Cancel")`)

    // Confirm cancellation
    const confirmButton = this.page.locator('[role="dialog"] button:has-text("Cancel"), [role="alertdialog"] button:has-text("Yes")')
    if (await confirmButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await confirmButton.click()
    }
  }

  async rescheduleDelivery(deliveryId: string, newDate: string) {
    await this.page.click(`[data-delivery="${deliveryId}"] button:has-text("Reschedule")`)

    // Fill new date
    const dateInput = this.page.locator('input[type="date"]')
    if (await dateInput.isVisible()) {
      await dateInput.fill(newDate)
    }

    // Confirm
    await this.page.click('[role="dialog"] button:has-text("Save"), [role="dialog"] button:has-text("Confirm")')
  }
}

// ============================================================================
// Test Utilities
// ============================================================================

/**
 * Wait for network idle
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000) {
  await page.waitForLoadState("networkidle", { timeout })
}

/**
 * Wait for toast/notification message
 */
export async function waitForToast(page: Page, message: string, timeout = 5000) {
  await page.waitForSelector(`text="${message}"`, { timeout })
}

/**
 * Dismiss any visible dialogs/modals
 */
export async function dismissDialogs(page: Page) {
  const dismissButtons = page.locator('button:has-text("Dismiss"), button:has-text("Skip"), button:has-text("Close"), [aria-label="Close"]')
  const count = await dismissButtons.count()
  for (let i = 0; i < count; i++) {
    const button = dismissButtons.nth(i)
    if (await button.isVisible({ timeout: 1000 }).catch(() => false)) {
      await button.click()
    }
  }
}

/**
 * Generate unique test email with +clerk_test suffix
 */
export function generateTestEmail(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 8)
  return `test-${timestamp}-${random}+clerk_test@example.com`
}

/**
 * Generate future date string (YYYY-MM-DD)
 */
export function getFutureDate(daysFromNow: number): string {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return date.toISOString().split("T")[0] as string
}

/**
 * Check if running in CI environment
 */
export function isCI(): boolean {
  return process.env.CI === "true"
}

/**
 * Get base URL for tests
 */
export function getBaseUrl(): string {
  return (
    process.env.E2E_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  )
}

// ============================================================================
// Test Data
// ============================================================================

export const TEST_DATA = {
  // Stripe test card numbers
  cards: STRIPE_TEST_CARDS,

  // Clerk test verification
  clerkVerificationCode: CLERK_TEST_VERIFICATION_CODE,

  // Test user credentials (for existing user tests)
  users: {
    testUser: {
      email: "e2e-test-user+clerk_test@example.com",
      password: "CapsuleN0te2024!Test",
    },
  },

  // Test letter content
  letters: {
    simple: {
      title: "Test Letter to Future Me",
      content: "Dear Future Me, this is a test letter created during E2E testing.",
      recipientEmail: "test+clerk_test@example.com",
    },
    reflection: {
      title: "Annual Reflection",
      content: "Looking back at this year, I learned so many things...",
    },
    gift: {
      title: "A Letter for You",
      content: "Dear Friend, I wanted to write you this letter to share my thoughts...",
      recipientEmail: "friend+clerk_test@example.com",
    },
  },

  // Test address
  address: TEST_ADDRESS,
}
