---
name: nextjs-testing
description: Comprehensive testing setup for Next.js 15+ applications including unit testing, component testing, integration testing, and end-to-end testing. Use when setting up Jest, Vitest, Playwright, or Cypress with Next.js. Covers testing React Server Components, Client Components, async components, App Router pages, API routes, and CI/CD integration. Triggers on testing setup, unit test, e2e test, component test, Jest config, Vitest config, Playwright setup, Cypress setup, test Next.js, mock server components.
---

# Next.js Testing Skill

Comprehensive guide for setting up and writing tests in Next.js 15+ applications using modern testing tools.

## Test Type Selection

Choose your testing approach based on needs:

| Test Type | Tool | Use Case |
|-----------|------|----------|
| Unit Testing | Jest or Vitest | Functions, hooks, synchronous components |
| Component Testing | Jest/Vitest + RTL, Cypress CT | React component behavior and rendering |
| Snapshot Testing | Jest or Vitest | Detect unintended UI changes |
| E2E Testing | Playwright or Cypress | User flows, navigation, full-stack testing |
| Async Server Components | Playwright or Cypress | Server Components with async data fetching |

**Important**: Async Server Components are not fully supported by Jest/Vitest. Use E2E testing for async components.

## Tool Selection Guide

### For Unit/Component Testing

**Choose Vitest when:**
- Starting a new project (faster, modern)
- Using Vite-based tooling
- Want native ESM support
- Prefer speed over ecosystem maturity

**Choose Jest when:**
- Existing Jest infrastructure
- Need extensive mocking capabilities
- Require snapshot testing
- Team familiarity with Jest

### For E2E Testing

**Choose Playwright when:**
- Need cross-browser testing (Chromium, Firefox, WebKit)
- Want built-in auto-wait and assertions
- Prefer TypeScript-first experience
- Need parallel test execution
- Want trace viewer for debugging

**Choose Cypress when:**
- Need component testing alongside E2E
- Want interactive test runner
- Prefer real-time reloading
- Need time-travel debugging
- Want visual testing integrations

## Quick Start Commands

```bash
# Jest quickstart
npx create-next-app@latest --example with-jest my-app

# Vitest quickstart
npx create-next-app@latest --example with-vitest my-app

# Playwright quickstart
npx create-next-app@latest --example with-playwright my-app

# Cypress quickstart
npx create-next-app@latest --example with-cypress my-app
```

## Detailed Setup Guides

For complete configuration and examples, see the reference files:

- **Jest setup & patterns**: See [references/jest.md](references/jest.md)
- **Vitest setup & patterns**: See [references/vitest.md](references/vitest.md)
- **Playwright E2E testing**: See [references/playwright.md](references/playwright.md)
- **Cypress E2E & Component testing**: See [references/cypress.md](references/cypress.md)
- **Advanced patterns** (async RSC, mocking, CI/CD): See [references/advanced-patterns.md](references/advanced-patterns.md)

## Environment Variables in Tests

Load Next.js environment variables in tests using `@next/env`:

```typescript
// jest.setup.ts or vitest.setup.ts
import { loadEnvConfig } from '@next/env'

export default async () => {
  const projectDir = process.cwd()
  loadEnvConfig(projectDir)
}
```

**Environment file priority:**
1. `process.env`
2. `.env.$(NODE_ENV).local`
3. `.env.local` (skipped when `NODE_ENV=test`)
4. `.env.$(NODE_ENV)`
5. `.env`

Use `.env.test` for test-specific variables (commit to repo). Use `.env.test.local` for local test overrides (gitignore).

## Project Structure

Recommended test file organization:

```
my-nextjs-app/
├── __tests__/              # Global test utilities
│   └── setup.ts
├── app/
│   ├── page.tsx
│   ├── page.test.tsx       # Colocated test (alternative)
│   └── api/
│       └── route.test.ts
├── components/
│   ├── Button.tsx
│   └── Button.test.tsx     # Colocated component test
├── e2e/                    # E2E tests (Playwright/Cypress)
│   ├── navigation.spec.ts
│   └── auth.spec.ts
├── cypress/                # Cypress-specific (if using)
│   ├── e2e/
│   └── component/
├── jest.config.ts          # or vitest.config.ts
└── playwright.config.ts    # or cypress.config.ts
```

## Package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "cypress:open": "cypress open",
    "cypress:run": "cypress run"
  }
}
```

## GitHub Examples

Official Next.js examples for reference:

- [with-jest](https://github.com/vercel/next.js/tree/canary/examples/with-jest)
- [with-vitest](https://github.com/vercel/next.js/tree/canary/examples/with-vitest)
- [with-playwright](https://github.com/vercel/next.js/tree/canary/examples/with-playwright)
- [with-cypress](https://github.com/vercel/next.js/tree/canary/examples/with-cypress)

## External Documentation

- [Next.js Testing Guide](https://nextjs.org/docs/app/guides/testing)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Vitest Documentation](https://vitest.dev/config/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Cypress Documentation](https://docs.cypress.io/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
