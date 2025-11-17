# Subscribe/Paywall Implementation Checklist

Quick reference for implementing the anonymous checkout system.

## Phase 1: Database ✅ Ready to Start

### 1.1 Schema Updates
- [ ] Add `PendingSubscription` model to `packages/prisma/schema.prisma`
- [ ] Add `PendingSubscriptionStatus` enum
- [ ] Add indexes: email, status, expiresAt, (email, status)
- [ ] Run `pnpm db:generate`
- [ ] Create migration: `pnpm db:migrate`
- [ ] Verify migration in staging database

### 1.2 TypeScript Types
- [ ] Create `packages/types/schemas/subscriptions.ts`
- [ ] Define Zod schemas: `AnonymousCheckoutSchema`, `CheckoutSessionResponseSchema`
- [ ] Export types for use across app

**Estimated Time**: 2 hours
**Dependencies**: None
**Files Changed**: 2 (schema.prisma, subscriptions.ts)

---

## Phase 2: Server Actions ⚙️ Core Logic

### 2.1 Create Anonymous Checkout
- [ ] File: `apps/web/app/subscribe/actions.ts`
- [ ] Implement `createAnonymousCheckout()`:
  - [ ] Validate input with Zod
  - [ ] Check for existing PendingSubscription
  - [ ] Handle "resume checkout" case
  - [ ] Create Stripe Customer with email
  - [ ] Create Stripe Checkout Session (with customer param)
  - [ ] Create PendingSubscription record
  - [ ] Create audit event
  - [ ] Return session URL and ID
- [ ] Add error handling for all Stripe API calls
- [ ] Add logging for debugging

### 2.2 Link Pending Subscription
- [ ] File: `apps/web/server/actions/subscriptions.ts`
- [ ] Implement `linkPendingSubscription()`:
  - [ ] Fetch user with email
  - [ ] Find matching PendingSubscription
  - [ ] Check email verification status (Clerk)
  - [ ] Create Subscription record in transaction
  - [ ] Update Profile.stripeCustomerId
  - [ ] Update PendingSubscription status to "linked"
  - [ ] Invalidate entitlements cache
  - [ ] Create usage record
  - [ ] Create audit event
- [ ] Make idempotent (safe to call multiple times)
- [ ] Handle race conditions

### 2.3 Helper Functions
- [ ] File: `apps/web/server/lib/pending-subscriptions.ts`
- [ ] `findPendingSubscriptionByEmail(email: string)`
- [ ] `resumeCheckoutSession(sessionId: string)`
- [ ] `validatePendingSubscriptionStatus(id: string)`
- [ ] Export utility functions

**Estimated Time**: 8 hours
**Dependencies**: Phase 1 complete, Stripe SDK installed
**Files Created**: 3

---

## Phase 3: Webhook Enhancement 🔔 Critical Path

### 3.1 Stripe Webhook Handler
- [ ] File: `workers/inngest/functions/billing/process-stripe-webhook.ts`
- [ ] Add case for `checkout.session.completed`:
  - [ ] Find PendingSubscription by stripeCustomerId or stripeSessionId
  - [ ] Update status to "payment_complete"
  - [ ] Store stripeSubscriptionId
  - [ ] Check if User exists with email
  - [ ] If yes: auto-link immediately via `linkPendingSubscription()`
  - [ ] If no: trigger signup reminder email
  - [ ] Create audit event
- [ ] Add error handling and logging
- [ ] Test idempotency (duplicate webhook events)

### 3.2 Clerk Webhook Enhancement
- [ ] File: `apps/web/app/api/webhooks/clerk/route.ts`
- [ ] In `user.created` handler:
  - [ ] After creating user, check for PendingSubscription
  - [ ] Call `linkPendingSubscription()` if found
  - [ ] Log auto-linking attempt
- [ ] Handle errors gracefully

**Estimated Time**: 4 hours
**Dependencies**: Phase 2 complete
**Files Modified**: 2

---

## Phase 4: Frontend - Pricing Page 🎨 User-Facing

### 4.1 Pricing Cards Component
- [ ] File: `apps/web/components/subscribe/pricing-card.tsx`
- [ ] Create `PricingCard` component (Client Component):
  - [ ] Props: plan, name, price, features, highlighted, current, onSubscribe
  - [ ] Match letter form design aesthetic (brutalist, duck yellow)
  - [ ] Add hover effects and animations
  - [ ] Responsive sizing
- [ ] Create `PricingGrid` component (Server Component):
  - [ ] Layout: 3 columns (desktop) → stack (mobile)
  - [ ] Fetch PricingPlans from database
  - [ ] Pass data to PricingCard components

### 4.2 Email Capture Form
- [ ] File: `apps/web/components/subscribe/email-capture-form.tsx`
- [ ] Email input with validation
- [ ] Show if no email in query params
- [ ] Client-side validation (Zod)
- [ ] Error states

### 4.3 Subscribe Page
- [ ] File: `apps/web/app/subscribe/page.tsx` (Server Component)
- [ ] Minimal layout (no header/footer)
- [ ] Logo at top
- [ ] Email capture (if needed)
- [ ] Pricing grid
- [ ] Check for incomplete/complete payments (banner)
- [ ] Pre-fill email from query param `?email=xxx`
- [ ] Handle letter context `?letterId=xxx`

### 4.4 Subscribe Button
- [ ] File: `apps/web/components/subscribe/checkout-button.tsx`
- [ ] Client Component with loading state
- [ ] Calls `createAnonymousCheckout()` Server Action
- [ ] Redirects to Stripe on success
- [ ] Shows error toast on failure
- [ ] Optimistic UI (immediate feedback)

### 4.5 Layout
- [ ] File: `apps/web/app/subscribe/layout.tsx`
- [ ] Minimal layout (no header/footer as required)
- [ ] Just logo and content
- [ ] Clean background

**Estimated Time**: 6 hours
**Dependencies**: Phase 2 complete
**Files Created**: 6

---

## Phase 5: Frontend - Success & Error Pages 🎉 Post-Payment

### 5.1 Success Page
- [ ] File: `apps/web/app/subscribe/success/page.tsx` (Server Component)
- [ ] Get session_id from query params
- [ ] Verify session with Stripe API
- [ ] Check payment_status
- [ ] Detect if user authenticated:
  - [ ] If authenticated: Show "Subscription Activated" + Go to Dashboard
  - [ ] If not: Show Clerk SignUp with email locked
- [ ] Handle loading state while verifying

### 5.2 Clerk SignUp Integration
- [ ] File: `apps/web/components/subscribe/success-signup-form.tsx`
- [ ] Use `@clerk/nextjs` SignUp component
- [ ] Lock email field (disabled + prefilled)
- [ ] Custom appearance matching design system
- [ ] Redirect to /dashboard after signup
- [ ] Show "Verify email" reminder

### 5.3 Error Page
- [ ] File: `apps/web/app/subscribe/error/page.tsx`
- [ ] Handle error codes via query param `?code=xxx`
- [ ] Render different UI for:
  - [ ] `payment_failed`: Show retry button
  - [ ] `session_expired`: Show start over button
  - [ ] `email_mismatch`: Show sign in with correct email
  - [ ] `unknown`: Generic error + support contact
- [ ] Match design system

### 5.4 Resume Checkout Page
- [ ] File: `apps/web/app/subscribe/resume/[sessionId]/page.tsx`
- [ ] Verify session exists and not expired
- [ ] Redirect to Stripe Checkout URL
- [ ] Handle expired sessions

**Estimated Time**: 4 hours
**Dependencies**: Phase 4 complete, Clerk configured
**Files Created**: 4

---

## Phase 6: Background Jobs ⏰ Automation

### 6.1 Cleanup Cron Job
- [ ] File: `apps/web/app/api/cron/cleanup-pending-subscriptions/route.ts`
- [ ] Verify CRON_SECRET header
- [ ] Find expired PendingSubscriptions
- [ ] For each:
  - [ ] Check Stripe subscription status
  - [ ] Cancel subscription if active
  - [ ] Issue refund if payment succeeded
  - [ ] Update status to "expired" or "refunded"
  - [ ] Send notification email
- [ ] Log results and errors
- [ ] Add to `vercel.json` crons (daily at 2am)

### 6.2 Abandoned Checkout Reminder
- [ ] File: `workers/inngest/functions/billing/send-checkout-reminder.ts`
- [ ] Inngest function triggered 6 hours after checkout creation
- [ ] Check if still awaiting_payment
- [ ] Send email with resume link
- [ ] Track email sent in metadata
- [ ] Create event in `createAnonymousCheckout()`

### 6.3 Signup Reminder Email
- [ ] File: `workers/inngest/functions/billing/send-signup-reminder.ts`
- [ ] Triggered 24 hours after payment_complete OR immediate flag
- [ ] Check if still payment_complete
- [ ] Generate Clerk magic link
- [ ] Send email with magic link + expiry countdown
- [ ] Triggered from webhook after payment

### 6.4 Expiry Warning Email
- [ ] File: `apps/web/app/api/cron/send-expiry-warnings/route.ts`
- [ ] Find PendingSubscriptions expiring in 7 days
- [ ] Send warning email
- [ ] Run daily at 10am

**Estimated Time**: 6 hours
**Dependencies**: Phase 3 complete, Inngest configured
**Files Created**: 4
**Vercel Config**: Update `vercel.json`

---

## Phase 7: Email Templates 📧 Communication

### 7.1 Email Templates (React Email)
- [ ] `emails/abandoned-checkout.tsx`: "Complete Your Checkout"
- [ ] `emails/signup-reminder.tsx`: "Activate Your Subscription"
- [ ] `emails/expiry-warning.tsx`: "Subscription Expiring Soon"
- [ ] `emails/subscription-expired.tsx`: "Subscription Expired & Refunded"
- [ ] All templates match DearMe brand
- [ ] Include unsubscribe links (if marketing)
- [ ] Test rendering in email clients

### 7.2 Email Provider Integration
- [ ] Use existing `apps/web/server/providers/email/` pattern
- [ ] Add template IDs to environment variables (if using Resend templates)
- [ ] Test email delivery in staging

**Estimated Time**: 4 hours
**Dependencies**: None (can be parallel)
**Files Created**: 4-5

---

## Phase 8: Testing 🧪 Quality Assurance

### 8.1 Unit Tests
- [ ] `apps/web/app/subscribe/actions.test.ts`:
  - [ ] Test `createAnonymousCheckout()` success
  - [ ] Test resume existing checkout
  - [ ] Test error: already paid
  - [ ] Test error: invalid email
- [ ] `apps/web/server/actions/subscriptions.test.ts`:
  - [ ] Test `linkPendingSubscription()` success
  - [ ] Test email verification required
  - [ ] Test idempotency
  - [ ] Test race condition handling

### 8.2 Integration Tests
- [ ] `__tests__/integration/subscription-flow.test.ts`:
  - [ ] Full flow: checkout → webhook → signup → link
  - [ ] Race condition: webhook before signup
  - [ ] Race condition: signup before webhook
  - [ ] Email mismatch scenario

### 8.3 E2E Tests (Playwright)
- [ ] `__tests__/e2e/subscribe.spec.ts`:
  - [ ] Happy path: complete checkout + signup
  - [ ] Verify email locked in Stripe Checkout
  - [ ] Resume incomplete checkout
  - [ ] Handle payment failure
  - [ ] Error page rendering

### 8.4 Manual Testing Checklist
- [ ] Test with Stripe test cards (success, decline, etc.)
- [ ] Test email locking (cannot change in Stripe UI)
- [ ] Test all error states
- [ ] Test resume flow
- [ ] Test admin dashboard (if built)
- [ ] Cross-browser testing (Chrome, Safari, Firefox)
- [ ] Mobile responsive testing
- [ ] Accessibility audit (keyboard nav, screen readers)

**Estimated Time**: 8 hours
**Dependencies**: All phases complete
**Files Created**: 3-5 test files

---

## Phase 9: Monitoring & Analytics 📊 Observability

### 9.1 Audit Events
- [ ] Verify all audit events logged:
  - [ ] subscription.checkout_created
  - [ ] subscription.payment_completed
  - [ ] subscription.linked
  - [ ] subscription.link_failed
  - [ ] subscription.expired
  - [ ] subscription.refunded
- [ ] Test audit trail completeness

### 9.2 Metrics Setup
- [ ] PostHog events:
  - [ ] Subscribe page viewed
  - [ ] Subscribe button clicked
  - [ ] Checkout created
  - [ ] Payment completed
  - [ ] Signup completed
  - [ ] Subscription linked
- [ ] Set up conversion funnel in PostHog

### 9.3 Alerts
- [ ] Set up Slack/email alerts for:
  - [ ] Payment success rate < 95%
  - [ ] Webhook processing failures > 5/hour
  - [ ] Linking success rate < 90%
- [ ] Test alert triggers

**Estimated Time**: 3 hours
**Dependencies**: PostHog/analytics configured
**Files Modified**: Add events to existing code

---

## Phase 10: Documentation & Handoff 📚 Knowledge Transfer

### 10.1 User Documentation
- [ ] Add to help docs: How to subscribe
- [ ] FAQ: What if I don't get email verification?
- [ ] FAQ: What if payment fails?
- [ ] Support article: Subscription linking issues

### 10.2 Admin Documentation
- [ ] Admin guide: Manual subscription linking
- [ ] Admin guide: Handling refund requests
- [ ] Admin guide: Interpreting metrics dashboard

### 10.3 Code Documentation
- [ ] Add JSDoc comments to all Server Actions
- [ ] Document environment variables in `.env.example`
- [ ] Update `CLAUDE.md` with subscribe flow

**Estimated Time**: 2 hours
**Dependencies**: Implementation complete

---

## Deployment Checklist 🚀

### Pre-Deployment
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code review completed
- [ ] Environment variables set in Vercel:
  - [ ] FEATURE_ANONYMOUS_CHECKOUT_ENABLED=false (start disabled)
  - [ ] SUBSCRIPTION_PENDING_EXPIRY_DAYS=30
  - [ ] SUBSCRIPTION_CHECKOUT_REMINDER_HOURS=6
  - [ ] SUBSCRIPTION_SIGNUP_REMINDER_HOURS=24
- [ ] Database migration run in production
- [ ] Cron jobs configured in Vercel
- [ ] Webhook endpoints verified in Stripe dashboard

### Staging Deployment
- [ ] Deploy to staging
- [ ] Run smoke tests
- [ ] Test full flow with Stripe test mode
- [ ] Verify emails sent correctly
- [ ] Check logs for errors

### Production Rollout (Gradual)
- [ ] Week 1: Enable for 10% of traffic
- [ ] Monitor metrics daily
- [ ] Week 2: Increase to 50% if metrics good
- [ ] Week 3: Full rollout (100%)

### Post-Deployment
- [ ] Monitor error rates (first 48 hours critical)
- [ ] Check conversion funnel daily
- [ ] Review support tickets
- [ ] Collect user feedback

---

## Quick Command Reference

```bash
# Database
pnpm db:generate                    # After schema changes
pnpm db:migrate                     # Create migration
pnpm db:studio                      # View database

# Development
pnpm dev                            # Start all apps
pnpm dev --filter web               # Just Next.js
pnpm dev --filter inngest           # Just workers

# Testing
pnpm test                           # Run all tests
pnpm test:unit                      # Unit tests only
pnpm test:e2e                       # E2E tests only

# Build
pnpm build                          # Production build
pnpm typecheck                      # Type checking

# Stripe CLI (for webhook testing)
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## Critical Paths ⚠️

**Must-Have for MVP**:
1. ✅ Database schema (PendingSubscription)
2. ✅ createAnonymousCheckout() Server Action
3. ✅ linkPendingSubscription() Server Action
4. ✅ Webhook enhancement for checkout.session.completed
5. ✅ /subscribe page with pricing cards
6. ✅ /subscribe/success page with Clerk SignUp
7. ✅ Email locking (Stripe Customer created first)
8. ✅ Basic error handling

**Can Defer**:
- Advanced email templates (use plain text initially)
- Admin dashboard (manual SQL queries work)
- Expiry warnings (cleanup job is critical, reminders nice-to-have)
- Advanced analytics (basic PostHog events sufficient)

---

## Estimated Total Time

- Phase 1 (Database): 2 hours
- Phase 2 (Server Actions): 8 hours
- Phase 3 (Webhooks): 4 hours
- Phase 4 (Pricing Page): 6 hours
- Phase 5 (Success/Error): 4 hours
- Phase 6 (Background Jobs): 6 hours
- Phase 7 (Email Templates): 4 hours
- Phase 8 (Testing): 8 hours
- Phase 9 (Monitoring): 3 hours
- Phase 10 (Documentation): 2 hours

**Total**: ~47 hours (6-7 days for single developer, 3-4 days for pair)

---

## Success Criteria ✅

**Technical**:
- [ ] All tests passing (100% coverage on critical paths)
- [ ] Email locked in Stripe Checkout (verified manually)
- [ ] Race conditions handled (verified in integration tests)
- [ ] Idempotent operations (webhook, linking)
- [ ] Zero payment processing errors in staging

**Business**:
- [ ] Conversion rate ≥ baseline
- [ ] Payment success rate > 95%
- [ ] Signup completion rate > 85%
- [ ] Linking success rate > 95%
- [ ] Error rate < 1%

**User Experience**:
- [ ] No header/footer on /subscribe (as required)
- [ ] Email locked in Stripe (as required)
- [ ] Clear error messages
- [ ] Fast page loads (< 500ms)
- [ ] Accessible (WCAG AA)

---

## Risk Mitigation

**High Risk**:
- Email verification bypass → Mitigated by Clerk email verification check
- Payment hijacking → Mitigated by email locking in Stripe
- Race conditions → Mitigated by dual-path linking

**Medium Risk**:
- Webhook failures → Mitigated by Inngest retry + dead letter queue
- Email delivery failures → Mitigated by Resend SLA + Postmark fallback
- Session expiry → Mitigated by resume flow + reminders

**Low Risk**:
- Database performance → Mitigated by proper indexes
- Cache invalidation → Mitigated by Redis TTL
- Type errors → Mitigated by TypeScript + Zod validation
