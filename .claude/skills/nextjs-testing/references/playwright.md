# Playwright Setup for Next.js 15+

## Table of Contents
1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Writing E2E Tests](#writing-e2e-tests)
4. [Advanced Patterns](#advanced-patterns)
5. [CI/CD Integration](#cicd-integration)

## Installation

```bash
npm init playwright
# or
npx create-next-app@latest --example with-playwright my-app
```

Install browser dependencies:
```bash
npx playwright install-deps
```

## Configuration

### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
```

### Production Testing Config

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  // ... other config
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
```

### Package.json Scripts

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:report": "playwright show-report"
  }
}
```

## Writing E2E Tests

### Basic Navigation Test

```typescript
// e2e/navigation.spec.ts
import { test, expect } from '@playwright/test'

test('should navigate to the about page', async ({ page }) => {
  await page.goto('/')
  
  // Click the About link
  await page.click('text=About')
  
  // Verify URL
  await expect(page).toHaveURL('/about')
  
  // Verify heading
  await expect(page.locator('h1')).toContainText('About')
})
```

### Testing with baseURL

```typescript
// Using baseURL from config
test('home page has correct title', async ({ page }) => {
  await page.goto('/') // Goes to http://localhost:3000/
  await expect(page).toHaveTitle(/My App/)
})
```

### Form Testing

```typescript
// e2e/login.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('successful login', async ({ page }) => {
    await page.fill('input[name="email"]', 'user@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Wait for navigation
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('text=Welcome')).toBeVisible()
  })

  test('shows error for invalid credentials', async ({ page }) => {
    await page.fill('input[name="email"]', 'wrong@example.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')

    await expect(page.locator('.error-message')).toContainText('Invalid credentials')
  })
})
```

### API Mocking

```typescript
// e2e/api-mock.spec.ts
import { test, expect } from '@playwright/test'

test('displays mocked API data', async ({ page }) => {
  // Mock API response
  await page.route('**/api/users', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Doe' },
      ]),
    })
  })

  await page.goto('/users')

  await expect(page.locator('text=John Doe')).toBeVisible()
  await expect(page.locator('text=Jane Doe')).toBeVisible()
})
```

### Testing with Authentication

```typescript
// e2e/auth.setup.ts
import { test as setup, expect } from '@playwright/test'

const authFile = 'playwright/.auth/user.json'

setup('authenticate', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="password"]', 'testpassword')
  await page.click('button[type="submit"]')

  await expect(page).toHaveURL('/dashboard')

  // Save authentication state
  await page.context().storageState({ path: authFile })
})
```

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
})
```

## Advanced Patterns

### Page Object Model

```typescript
// e2e/pages/LoginPage.ts
import { Page, Locator } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.locator('input[name="email"]')
    this.passwordInput = page.locator('input[name="password"]')
    this.submitButton = page.locator('button[type="submit"]')
    this.errorMessage = page.locator('.error-message')
  }

  async goto() {
    await this.page.goto('/login')
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }
}

// e2e/login.spec.ts
import { test, expect } from '@playwright/test'
import { LoginPage } from './pages/LoginPage'

test('login with page object', async ({ page }) => {
  const loginPage = new LoginPage(page)
  await loginPage.goto()
  await loginPage.login('user@example.com', 'password123')
  
  await expect(page).toHaveURL('/dashboard')
})
```

### Testing Server Components with Data

```typescript
// e2e/server-component.spec.ts
import { test, expect } from '@playwright/test'

test('server component renders data', async ({ page }) => {
  await page.goto('/products')

  // Wait for server component to render
  await expect(page.locator('[data-testid="product-list"]')).toBeVisible()

  // Verify data is rendered
  const products = page.locator('[data-testid="product-item"]')
  await expect(products).toHaveCount(10)
})
```

### Visual Regression Testing

```typescript
// e2e/visual.spec.ts
import { test, expect } from '@playwright/test'

test('homepage visual comparison', async ({ page }) => {
  await page.goto('/')
  
  // Full page screenshot
  await expect(page).toHaveScreenshot('homepage.png', {
    fullPage: true,
    maxDiffPixels: 100,
  })
})

test('component visual test', async ({ page }) => {
  await page.goto('/components')
  
  const button = page.locator('button.primary')
  await expect(button).toHaveScreenshot('primary-button.png')
})
```

### Testing with Different Viewports

```typescript
// e2e/responsive.spec.ts
import { test, expect } from '@playwright/test'

const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1920, height: 1080 },
]

for (const viewport of viewports) {
  test(`navigation works on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.goto('/')

    if (viewport.name === 'mobile') {
      // Open mobile menu
      await page.click('[data-testid="mobile-menu-button"]')
    }

    await page.click('text=About')
    await expect(page).toHaveURL('/about')
  })
}
```

### Testing File Downloads

```typescript
// e2e/download.spec.ts
import { test, expect } from '@playwright/test'

test('download file', async ({ page }) => {
  await page.goto('/downloads')

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('text=Download Report'),
  ])

  expect(download.suggestedFilename()).toBe('report.pdf')
  
  // Save to disk
  await download.saveAs('./downloads/' + download.suggestedFilename())
})
```

### Testing File Uploads

```typescript
// e2e/upload.spec.ts
import { test, expect } from '@playwright/test'
import path from 'path'

test('upload file', async ({ page }) => {
  await page.goto('/upload')

  const fileInput = page.locator('input[type="file"]')
  await fileInput.setInputFiles(path.join(__dirname, 'fixtures/test-image.png'))

  await page.click('button[type="submit"]')
  await expect(page.locator('.success-message')).toContainText('Upload successful')
})
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Build application
        run: npm run build

      - name: Run Playwright tests
        run: npx playwright test

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### Running in CI

```bash
# Run all tests
npx playwright test

# Run specific browser
npx playwright test --project=chromium

# Run with retries
npx playwright test --retries=3

# Generate and view report
npx playwright test --reporter=html
npx playwright show-report
```

## Debugging

```bash
# Debug mode
npx playwright test --debug

# UI mode
npx playwright test --ui

# Headed mode
npx playwright test --headed

# Trace viewer
npx playwright show-trace trace.zip
```

### Adding Debug Points

```typescript
test('debug example', async ({ page }) => {
  await page.goto('/')
  
  // Pause execution
  await page.pause()
  
  // Take screenshot
  await page.screenshot({ path: 'debug-screenshot.png' })
})
```
