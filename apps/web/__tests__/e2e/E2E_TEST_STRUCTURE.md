# Capsule Note - Complete E2E Test Structure

> Comprehensive Playwright E2E test plan covering all user flows

## Test Authentication Pattern

```typescript
// Clerk Test Email Pattern
const testEmail = `test-${Date.now()}-${random}+clerk_test@example.com`
const verificationCode = "424242" // Always works with +clerk_test suffix

// Stripe Test Card
const testCard = "4242424242424242"
const expiry = "12/34"
const cvc = "123"
```

---

## Current Test Coverage Audit

### Existing Files (9 files, ~80 tests)

| File | Tests | Coverage |
|------|-------|----------|
| `auth.e2e.spec.ts` | 20 | Landing, sign-in/up, protected routes, accessibility |
| `checkout.e2e.spec.ts` | 17 | Pricing, Stripe redirect, billing portal |
| `checkout-signup.e2e.spec.ts` | 5 | Anonymous checkout flow |
| `letter.e2e.spec.ts` | 22 | Anonymous journey, editor basics, drafts |
| `01-new-user.spec.ts` | 4 | Complete new user onboarding |
| `02-existing-user.spec.ts` | 5 | Returning user workflow |
| `03-gift-flow.spec.ts` | 4 | Sending to someone else |
| `04-cancellation.spec.ts` | 4 | Delivery cancellation |
| `05-account-deletion.spec.ts` | 4 | GDPR export and deletion |

### Coverage Gaps Identified

- Schedule wizard multi-step flow
- Physical mail delivery (Lob)
- Arrive-by mode scheduling
- Address management CRUD
- Settings page all tabs
- Unlock/reveal letter flow
- Timezone selection
- Referral system
- Credit system display
- Add-on purchases
- Contact form
- Letter editing/deletion
- Error states (rate limiting, validation)
- Accessibility (keyboard nav, screen reader)
- Mobile responsive testing

---

## Complete Test Structure Plan

### File Structure

```
apps/web/__tests__/e2e/
├── fixtures.ts                     # Shared helpers, POMs, constants
├──
├── # AUTHENTICATION & ONBOARDING
├── auth.e2e.spec.ts               # 35 tests - Auth flows
├── onboarding.e2e.spec.ts         # 8 tests - Welcome, timezone
├──
├── # LETTER MANAGEMENT
├── letter.e2e.spec.ts             # Enhanced - Basic letter tests
├── letter-management.e2e.spec.ts  # 30 tests - CRUD operations
├── letter-editor.e2e.spec.ts      # 18 tests - Rich text features
├──
├── # SCHEDULING & DELIVERY
├── schedule-wizard.e2e.spec.ts    # 35 tests - Multi-step wizard
├── delivery-management.e2e.spec.ts # 20 tests - Timeline, cancel, retry
├──
├── # SETTINGS & FEATURES
├── settings.e2e.spec.ts           # 35 tests - All settings tabs
├── address-management.e2e.spec.ts # 20 tests - Shipping addresses
├──
├── # SPECIAL FLOWS
├── unlock-letter.e2e.spec.ts      # 12 tests - Reveal animation
├── dashboard.e2e.spec.ts          # 14 tests - Journey page
├──
├── # CHECKOUT
├── checkout.e2e.spec.ts           # Enhanced
├── checkout-signup.e2e.spec.ts    # Existing
├──
├── # MARKETING & CONTENT
├── marketing.e2e.spec.ts          # 18 tests - Landing, pricing, legal
├──
├── # QUALITY & COMPLIANCE
├── accessibility.e2e.spec.ts      # 18 tests - a11y compliance
├── responsive.e2e.spec.ts         # 14 tests - Mobile, tablet, desktop
├── error-handling.e2e.spec.ts     # 18 tests - Error states
├──
├── # USER JOURNEYS
└── user-journeys/
    ├── 01-new-user.spec.ts
    ├── 02-existing-user.spec.ts
    ├── 03-gift-flow.spec.ts
    ├── 04-cancellation.spec.ts
    ├── 05-account-deletion.spec.ts
    ├── 06-physical-mail.spec.ts   # NEW - Full Lob flow
    └── 07-arrive-by.spec.ts       # NEW - Arrive-by scheduling
```

---

## Test Specifications by File

### 1. `auth.e2e.spec.ts` (Target: 35 tests)

```typescript
describe("Authentication Flows", () => {
  describe("Sign Up Flow", () => {
    test("should display sign up form")
    test("should complete signup with +clerk_test email")
    test("should enter verification code 424242")
    test("should validate password requirements")
    test("should handle duplicate email gracefully")
    test("should preserve return URL through signup")
    test("should redirect to welcome after first signup")
  })

  describe("Sign In Flow", () => {
    test("should display sign in form")
    test("should sign in with valid credentials")
    test("should show error for invalid email")
    test("should show error for wrong password")
    test("should handle non-existent user")
    test("should show forgot password link")
    test("should remember session across reloads")
  })

  describe("Sign Out Flow", () => {
    test("should sign out from header menu")
    test("should redirect to landing after sign out")
    test("should clear session on sign out")
  })

  describe("OAuth Providers", () => {
    test("should show Google OAuth button")
    test("should show Apple OAuth button")
    test("should handle OAuth error gracefully")
  })

  describe("Protected Routes", () => {
    test("should redirect /dashboard to sign-in")
    test("should redirect /letters to sign-in")
    test("should redirect /settings to sign-in")
    test("should redirect /journey to sign-in")
    test("should preserve return URL in redirect")
  })

  describe("Session Management", () => {
    test("should show user info in header when signed in")
    test("should redirect when session expires")
  })
})
```

### 2. `onboarding.e2e.spec.ts` (8 tests) - NEW

```typescript
describe("Onboarding Flow", () => {
  describe("Welcome Page", () => {
    test("should show welcome page after first signup")
    test("should recover anonymous draft on welcome")
    test("should navigate to letter editor from welcome")
    test("should show subscription status")
  })

  describe("Timezone Setup", () => {
    test("should prompt for timezone on first login")
    test("should auto-detect browser timezone")
    test("should save timezone preference")
  })

  describe("Profile Completion", () => {
    test("should allow setting display name")
  })
})
```

### 3. `letter-management.e2e.spec.ts` (30 tests) - NEW

```typescript
describe("Letter CRUD Operations", () => {
  describe("Create Letter", () => {
    test("should create new letter with title and content")
    test("should auto-save draft to database")
    test("should recover draft after page reload")
    test("should validate title is required")
    test("should validate content is required")
    test("should show character/word count")
    test("should show page count for physical mail")
    test("should warn when exceeding 6 page limit")
  })

  describe("List Letters", () => {
    test("should list all letters with correct counts")
    test("should filter drafts in drafts tab")
    test("should filter scheduled in scheduled tab")
    test("should filter sent in sent tab")
    test("should show empty state when no letters")
    test("should show daily prompts in empty state")
    test("should toggle between grid and list view")
    test("should sort letters by date")
  })

  describe("Edit Letter", () => {
    test("should edit draft letter title")
    test("should edit draft letter content")
    test("should preserve formatting on edit")
    test("should not allow editing sealed letter")
    test("should show sealed message for scheduled")
    test("should auto-save edits")
  })

  describe("Delete Letter", () => {
    test("should show delete confirmation dialog")
    test("should delete letter after confirmation")
    test("should cascade delete deliveries")
    test("should refund credits on delete")
    test("should not show delete for delivered letters")
  })
})
```

### 4. `letter-editor.e2e.spec.ts` (18 tests) - NEW

```typescript
describe("Letter Editor Features", () => {
  describe("Rich Text Formatting", () => {
    test("should apply bold formatting")
    test("should apply italic formatting")
    test("should apply underline formatting")
    test("should create bullet lists")
    test("should create numbered lists")
    test("should insert links")
    test("should handle Cmd+B shortcut")
    test("should handle Cmd+I shortcut")
  })

  describe("Editor UX", () => {
    test("should focus editor on page load")
    test("should show placeholder when empty")
    test("should preserve cursor position")
    test("should handle paste from clipboard")
    test("should support undo/redo")
  })

  describe("Recipient Selection", () => {
    test("should default to Myself recipient")
    test("should switch to Someone Else")
    test("should show email input for Someone Else")
    test("should pre-fill email for Myself")
    test("should validate recipient email format")
  })
})
```

### 5. `schedule-wizard.e2e.spec.ts` (35 tests) - NEW

```typescript
describe("Delivery Scheduling Wizard", () => {
  describe("Step 1: Channel Selection", () => {
    test("should show email delivery option")
    test("should show physical mail option if eligible")
    test("should show both option if eligible")
    test("should disable physical mail without credits")
    test("should show credit warning banner")
    test("should link to upgrade if no credits")
  })

  describe("Step 2: Date Selection", () => {
    test("should show calendar picker")
    test("should not allow past dates")
    test("should enforce minimum 5 minute future")
    test("should allow up to 100 years future")
    test("should show quick selection buttons")
    test("should respect user timezone")
    test("should show DST warning when applicable")
  })

  describe("Step 3: Time Selection", () => {
    test("should show time picker")
    test("should default to current time + 5min")
    test("should show timezone indicator")
    test("should convert to UTC for storage")
  })

  describe("Step 4: Email Configuration", () => {
    test("should pre-fill recipient email")
    test("should validate email format")
    test("should show delivery preview")
  })

  describe("Step 5: Physical Mail Configuration", () => {
    test("should list saved addresses")
    test("should allow adding new address")
    test("should verify address with Lob API")
    test("should show transit time estimate")
    test("should calculate arrive-by date")
  })

  describe("Step 6: Review & Confirm", () => {
    test("should show delivery summary")
    test("should show channel and date")
    test("should show recipient info")
    test("should show seal animation")
    test("should show celebration on success")
    test("should redirect to letter detail")
  })

  describe("Arrive-By Mode", () => {
    test("should show arrive-by toggle")
    test("should require 30+ day advance notice")
    test("should calculate send date from transit")
    test("should show transit days from Lob")
    test("should add buffer for weekends")
  })
})
```

### 6. `delivery-management.e2e.spec.ts` (20 tests) - NEW

```typescript
describe("Delivery Management", () => {
  describe("Delivery Timeline", () => {
    test("should show timeline on letter detail")
    test("should show scheduled status")
    test("should show processing status")
    test("should show sent status")
    test("should show failed status with retry")
    test("should show canceled status")
  })

  describe("Cancel Delivery", () => {
    test("should show cancel button for scheduled")
    test("should hide cancel after 72h before delivery")
    test("should show cancel confirmation dialog")
    test("should cancel delivery on confirm")
    test("should refund credits on cancel")
    test("should update timeline after cancel")
  })

  describe("Retry Failed Delivery", () => {
    test("should show retry button for failed")
    test("should retry delivery on click")
    test("should update status after retry")
  })

  describe("Email Preview", () => {
    test("should show email preview modal")
    test("should render letter in template")
    test("should show from/to/subject")
  })
})
```

### 7. `settings.e2e.spec.ts` (35 tests) - NEW

```typescript
describe("Settings Page", () => {
  describe("Account Tab", () => {
    test("should display user email")
    test("should allow editing display name")
    test("should save display name changes")
    test("should show subscription status badge")
    test("should show plan type badge")
  })

  describe("Timezone Settings", () => {
    test("should show current timezone")
    test("should allow changing timezone")
    test("should show warning before change")
    test("should update scheduled deliveries")
    test("should list common timezones")
  })

  describe("Billing Tab", () => {
    test("should show subscription details")
    test("should show renewal date")
    test("should show email credits remaining")
    test("should show mail credits remaining")
    test("should show usage progress bars")
    test("should show payment history")
    test("should link to Stripe billing portal")
  })

  describe("Add-on Purchases", () => {
    test("should show email credits add-on")
    test("should show mail credits add-on")
    test("should redirect to Stripe for add-on")
    test("should show physical mail trial")
  })

  describe("Privacy Tab", () => {
    test("should show export data button")
    test("should trigger data export download")
    test("should show delete account button")
    test("should show GDPR links")
  })

  describe("Referrals Tab", () => {
    test("should show referral code")
    test("should copy referral code to clipboard")
    test("should show referral link")
    test("should copy referral link")
    test("should show referral stats")
    test("should show referral history table")
  })
})
```

### 8. `address-management.e2e.spec.ts` (20 tests) - NEW

```typescript
describe("Shipping Address Management", () => {
  describe("List Addresses", () => {
    test("should list saved addresses")
    test("should show empty state if no addresses")
    test("should show default address badge")
  })

  describe("Create Address", () => {
    test("should open add address form")
    test("should validate required fields")
    test("should verify address with Lob API")
    test("should show validation errors")
    test("should save valid address")
    test("should show suggested corrections")
  })

  describe("Edit Address", () => {
    test("should open edit form with data")
    test("should save edited address")
    test("should re-verify on edit")
  })

  describe("Delete Address", () => {
    test("should show delete confirmation")
    test("should delete address")
    test("should prevent deleting in-use address")
  })

  describe("Default Address", () => {
    test("should set address as default")
    test("should show default badge")
    test("should pre-select default in wizard")
  })

  describe("Country Selection", () => {
    test("should list supported countries")
    test("should adjust fields for country")
  })
})
```

### 9. `unlock-letter.e2e.spec.ts` (12 tests) - NEW

```typescript
describe("Letter Unlock/Reveal Flow", () => {
  describe("Pre-Unlock State", () => {
    test("should show countdown before delivery")
    test("should show sealed state with blur")
    test("should not allow unlock before date")
  })

  describe("Unlock Animation", () => {
    test("should show animation after delivery")
    test("should trigger on page load")
    test("should allow skipping animation")
    test("should replay with query param")
  })

  describe("Revealed State", () => {
    test("should show full content after unlock")
    test("should track first opened timestamp")
    test("should show delivery details")
  })

  describe("Error States", () => {
    test("should handle invalid unlock token")
    test("should handle unauthorized access")
  })
})
```

### 10. `dashboard.e2e.spec.ts` (14 tests) - NEW

```typescript
describe("Dashboard/Journey Page", () => {
  describe("Hero Section", () => {
    test("should show countdown to next delivery")
    test("should show empty state if no deliveries")
    test("should show days/hours/minutes")
    test("should update countdown live")
  })

  describe("Emotional Journey Timeline", () => {
    test("should show timeline of deliveries")
    test("should show past deliveries")
    test("should show future deliveries")
    test("should highlight next delivery")
    test("should show status colors")
  })

  describe("Write Prompt Banner", () => {
    test("should show write prompt")
    test("should navigate to editor")
    test("should show daily prompts")
  })

  describe("Empty State", () => {
    test("should show empty state CTA")
    test("should link to letter editor")
  })
})
```

### 11. `marketing.e2e.spec.ts` (18 tests) - NEW

```typescript
describe("Marketing Pages", () => {
  describe("Landing Page", () => {
    test("should display hero section")
    test("should show feature highlights")
    test("should show social proof")
    test("should show how it works")
    test("should have CTA buttons")
    test("should detect locale")
  })

  describe("Pricing Page", () => {
    test("should show all pricing tiers")
    test("should highlight recommended plan")
    test("should show feature comparison")
    test("should show FAQ section")
    test("should toggle monthly/annual")
  })

  describe("Contact Page", () => {
    test("should show contact form")
    test("should validate required fields")
    test("should submit successfully")
    test("should show success message")
  })

  describe("Legal Pages", () => {
    test("should display privacy policy")
    test("should display terms of service")
    test("should display security page")
  })
})
```

### 12. `accessibility.e2e.spec.ts` (18 tests) - NEW

```typescript
describe("Accessibility", () => {
  describe("Keyboard Navigation", () => {
    test("should navigate with keyboard only")
    test("should navigate forms with Tab")
    test("should activate buttons with Enter")
    test("should close dialogs with Escape")
    test("should show focus rings")
  })

  describe("Form Labels", () => {
    test("should have labels for inputs")
    test("should have aria-labels for icons")
    test("should associate labels with inputs")
  })

  describe("Screen Reader", () => {
    test("should have alt text for images")
    test("should have aria-live regions")
    test("should announce notifications")
    test("should have skip to content")
  })

  describe("Modal Accessibility", () => {
    test("should trap focus in modals")
    test("should return focus after close")
    test("should have dialog role")
  })

  describe("Color & Contrast", () => {
    test("should have sufficient contrast")
    test("should work without color alone")
  })
})
```

### 13. `responsive.e2e.spec.ts` (14 tests) - NEW

```typescript
describe("Responsive Design", () => {
  describe("Mobile (375x667)", () => {
    test("should display mobile navigation")
    test("should hide desktop nav items")
    test("should open mobile menu")
    test("should stack cards vertically")
    test("should fit editor in viewport")
    test("should have touch-friendly buttons")
  })

  describe("Tablet (768x1024)", () => {
    test("should show adapted layout")
    test("should adjust grid columns")
  })

  describe("Desktop (1920x1080)", () => {
    test("should show full navigation")
    test("should show multi-column grids")
    test("should show sidebars")
  })

  describe("Orientation", () => {
    test("should handle portrait to landscape")
    test("should preserve scroll position")
  })
})
```

### 14. `error-handling.e2e.spec.ts` (18 tests) - NEW

```typescript
describe("Error Handling", () => {
  describe("Network Errors", () => {
    test("should show offline indicator")
    test("should queue actions when offline")
    test("should retry on reconnect")
    test("should handle slow network")
  })

  describe("Rate Limiting", () => {
    test("should show rate limit message")
    test("should show countdown timer")
    test("should allow retry after wait")
  })

  describe("Validation Errors", () => {
    test("should show inline errors")
    test("should highlight invalid fields")
    test("should preserve valid input")
    test("should scroll to first error")
  })

  describe("Server Errors", () => {
    test("should show friendly error page")
    test("should offer retry action")
    test("should not expose tech details")
  })

  describe("Not Found", () => {
    test("should show 404 for invalid routes")
    test("should offer navigation back")
    test("should show helpful content")
  })
})
```

### 15. `user-journeys/06-physical-mail.spec.ts` (10 tests) - NEW

```typescript
describe("Physical Mail Journey", () => {
  test("complete physical mail delivery flow", async () => {
    // Step 1: Sign in with Paper plan
    // Step 2: Create letter under 6 pages
    // Step 3: Select physical mail delivery
    // Step 4: Add/select shipping address
    // Step 5: Verify with Lob API
    // Step 6: Schedule delivery
    // Step 7: Verify credits deducted
    // Step 8: Check Lob tracking
  })

  test("should validate 6 page limit")
  test("should show Lob address suggestions")
  test("should estimate transit time")
  test("should handle Lob API errors")
  test("should cancel physical mail delivery")
  test("should show mail tracking status")
  test("should handle returned mail")
  test("should refund credits on cancellation")
  test("should require verified address")
})
```

### 16. `user-journeys/07-arrive-by.spec.ts` (8 tests) - NEW

```typescript
describe("Arrive-By Mode Journey", () => {
  test("complete arrive-by scheduling flow", async () => {
    // Step 1: Sign in
    // Step 2: Create letter
    // Step 3: Select physical mail
    // Step 4: Enable arrive-by mode
    // Step 5: Select target arrival date (30+ days)
    // Step 6: Verify calculated send date
    // Step 7: Confirm scheduling
    // Step 8: Verify timeline shows both dates
  })

  test("should require 30 day minimum notice")
  test("should calculate send date from transit")
  test("should add weekend buffer")
  test("should show transit estimate from Lob")
  test("should adjust for holidays")
  test("should update on address change")
  test("should show arrive-by in timeline")
})
```

---

## Test Count Summary

| Category | Current | New | Total |
|----------|---------|-----|-------|
| Auth & Onboarding | 20 | 23 | **43** |
| Letter Management | 22 | 48 | **70** |
| Scheduling & Delivery | 10 | 55 | **65** |
| Settings & Addresses | 5 | 55 | **60** |
| Unlock & Dashboard | 0 | 26 | **26** |
| Checkout | 17 | 5 | **22** |
| Marketing | 5 | 18 | **23** |
| Accessibility | 5 | 18 | **23** |
| Responsive | 4 | 14 | **18** |
| Error Handling | 5 | 18 | **23** |
| User Journeys | 17 | 18 | **35** |
| **TOTAL** | **~80** | **~298** | **~378** |

---

## Environment Variables

```bash
# Test Control Flags
E2E_ENABLE_AUTH_TESTS=true
E2E_ENABLE_CHECKOUT_TESTS=true
E2E_ENABLE_USER_JOURNEYS=true
E2E_ENABLE_ACCOUNT_DELETION=true  # CAUTION
E2E_ENABLE_PHYSICAL_MAIL=true
E2E_ENABLE_ACCESSIBILITY=true

# Test Credentials
E2E_TEST_USER_EMAIL=e2e-test+clerk_test@example.com
E2E_TEST_USER_PASSWORD=TestPassword123!
E2E_STRIPE_PAID_SESSION_ID=cs_test_xxx

# Configuration
E2E_BASE_URL=http://localhost:3000
PLAYWRIGHT_BASE_URL=http://localhost:3000
```

---

## Implementation Priority

### Priority 1: Critical Business Flows
1. `schedule-wizard.e2e.spec.ts` - Core revenue feature
2. `settings.e2e.spec.ts` - Billing & account
3. `delivery-management.e2e.spec.ts` - User experience
4. `unlock-letter.e2e.spec.ts` - Key moment

### Priority 2: User Journeys
5. `06-physical-mail.spec.ts` - Premium flow
6. `07-arrive-by.spec.ts` - Advanced feature
7. Enhanced `auth.e2e.spec.ts`

### Priority 3: Supporting Features
8. `address-management.e2e.spec.ts`
9. `dashboard.e2e.spec.ts`
10. `letter-editor.e2e.spec.ts`

### Priority 4: Quality & Compliance
11. `accessibility.e2e.spec.ts` - ADA/WCAG
12. `responsive.e2e.spec.ts` - Mobile
13. `error-handling.e2e.spec.ts`

### Priority 5: Marketing
14. `marketing.e2e.spec.ts`
15. `letter-management.e2e.spec.ts` enhancements
16. `onboarding.e2e.spec.ts`

---

## Running Tests

```bash
# Run all E2E tests
pnpm test:e2e

# Run with UI
pnpm test:e2e:ui

# Run specific file
pnpm test:e2e auth.e2e.spec.ts

# Run specific test
pnpm test:e2e -g "should complete signup"

# Run with all features enabled
E2E_ENABLE_AUTH_TESTS=true \
E2E_ENABLE_CHECKOUT_TESTS=true \
E2E_ENABLE_USER_JOURNEYS=true \
pnpm test:e2e
```
