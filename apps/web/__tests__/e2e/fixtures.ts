/**
 * Playwright E2E Test Fixtures
 *
 * Provides reusable test fixtures for E2E tests including:
 * - Authentication helpers
 * - Navigation utilities
 * - Test data factories
 * - Page object models
 */

import { test as base, expect, Page } from "@playwright/test"

// ============================================================================
// Test Fixtures
// ============================================================================

type Fixtures = {
  authenticatedPage: Page
  anonymousPage: Page
}

/**
 * Extended test with fixtures
 */
export const test = base.extend<Fixtures>({
  // Page with authenticated user
  authenticatedPage: async ({ page }, use) => {
    // Note: In real tests, this would handle Clerk authentication
    // For now, we set up cookies/storage to simulate authenticated state
    await page.goto("/")
    await page.evaluate(() => {
      localStorage.setItem("clerk-auth-test", "true")
    })
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
}

/**
 * Pricing Page interactions
 */
export class PricingPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/pricing")
  }

  async selectPlan(planName: string) {
    await this.page.click(`text="${planName}"`)
  }

  async clickSubscribe(planType: "monthly" | "annual") {
    const button = planType === "annual"
      ? this.page.locator('[data-testid="subscribe-annual"]')
      : this.page.locator('[data-testid="subscribe-monthly"]')
    await button.click()
  }

  async isLoaded() {
    await expect(this.page).toHaveURL(/\/pricing/)
  }

  async getPlanPrice(planName: string) {
    return this.page.locator(`[data-plan="${planName}"] .price`).textContent()
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
    await this.page.fill('[name="email"]', email)
  }

  async fillPassword(password: string) {
    await this.page.fill('[name="password"]', password)
  }

  async submitForm() {
    await this.page.click('[type="submit"]')
  }

  async isSignInPage() {
    await expect(this.page).toHaveURL(/\/sign-in/)
  }

  async isSignUpPage() {
    await expect(this.page).toHaveURL(/\/sign-up/)
  }
}

/**
 * Dashboard Page interactions
 */
export class DashboardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/dashboard")
  }

  async clickNewLetter() {
    await this.page.click('text="New Letter"')
  }

  async getLetterCount() {
    const letters = this.page.locator('[data-testid="letter-card"]')
    return letters.count()
  }

  async selectLetter(index: number) {
    await this.page.locator('[data-testid="letter-card"]').nth(index).click()
  }

  async isLoaded() {
    await expect(this.page).toHaveURL(/\/dashboard/)
  }
}

/**
 * Letter Editor Page interactions
 */
export class LetterEditorPage {
  constructor(private page: Page) {}

  async goto(letterId?: string) {
    if (letterId) {
      await this.page.goto(`/letters/${letterId}/edit`)
    } else {
      await this.page.goto("/letters/new")
    }
  }

  async setTitle(title: string) {
    await this.page.fill('[data-testid="letter-title"]', title)
  }

  async setContent(content: string) {
    // For Tiptap editor
    const editor = this.page.locator(".ProseMirror")
    await editor.click()
    await editor.fill(content)
  }

  async setRecipientEmail(email: string) {
    await this.page.fill('[data-testid="recipient-email"]', email)
  }

  async setDeliveryDate(date: string) {
    await this.page.fill('[data-testid="delivery-date"]', date)
  }

  async saveDraft() {
    await this.page.click('text="Save Draft"')
  }

  async scheduleDelivery() {
    await this.page.click('text="Schedule Delivery"')
  }

  async isLoaded() {
    await expect(this.page.locator('[data-testid="letter-editor"]')).toBeVisible()
  }
}

/**
 * Checkout Page interactions
 */
export class CheckoutPage {
  constructor(private page: Page) {}

  async isStripeCheckout() {
    // Check if redirected to Stripe
    await expect(this.page).toHaveURL(/checkout\.stripe\.com/)
  }

  async fillCardDetails(cardNumber: string, expiry: string, cvc: string) {
    // Stripe Elements iframe handling
    const cardFrame = this.page.frameLocator('iframe[name*="cardNumber"]')
    await cardFrame.locator('[name="cardnumber"]').fill(cardNumber)

    const expiryFrame = this.page.frameLocator('iframe[name*="cardExpiry"]')
    await expiryFrame.locator('[name="exp-date"]').fill(expiry)

    const cvcFrame = this.page.frameLocator('iframe[name*="cardCvc"]')
    await cvcFrame.locator('[name="cvc"]').fill(cvc)
  }

  async submitPayment() {
    await this.page.click('button[type="submit"]')
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
    await this.page.goto("/settings/billing")
  }

  async gotoProfile() {
    await this.page.goto("/settings/profile")
  }

  async clickManageBilling() {
    await this.page.click('text="Manage Billing"')
  }

  async isLoaded() {
    await expect(this.page).toHaveURL(/\/settings/)
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
 * Generate unique test email
 */
export function generateTestEmail(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 8)
  return `test-${timestamp}-${random}@example.com`
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
  cards: {
    valid: "4242424242424242",
    declined: "4000000000000002",
    insufficientFunds: "4000000000009995",
    expiredCard: "4000000000000069",
    threeDSecure: "4000002500003155",
  },

  // Test user credentials
  users: {
    testUser: {
      email: "test@example.com",
      password: "TestPassword123!",
    },
    newUser: {
      email: generateTestEmail(),
      password: "NewPassword123!",
    },
  },

  // Test letter content
  letters: {
    simple: {
      title: "Test Letter",
      content: "This is a test letter to my future self.",
      recipientEmail: "recipient@example.com",
      deliveryDate: getFutureDate(30),
    },
    reflection: {
      title: "Annual Reflection",
      content: "Looking back at this year, I learned...",
      recipientEmail: "me@example.com",
      deliveryDate: getFutureDate(365),
    },
  },
}
