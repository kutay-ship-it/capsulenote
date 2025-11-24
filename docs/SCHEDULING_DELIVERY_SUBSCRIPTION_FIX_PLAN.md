# Scheduling Delivery – Subscription Gate Fix Plan

Status: Draft  
Owner: Engineering  
Scope: Fix “Scheduling requires an active subscription” shown to subscribed users and harden subscription/entitlement flow.

## Current Root Causes
- Subscription record missing or stale: Stripe webhooks enqueue but Inngest worker may not run locally; no `subscription` row → `features.canScheduleDeliveries` false. Profile may lack `stripeCustomerId`, blocking webhook→user mapping.
- Pending subscription not linked: Anonymous checkout flow requires email verification + `linkPendingSubscription`; if user doesn’t verify or linking never runs, entitlements stay `none`.
- Entitlements cache staleness: `getEntitlements` caches for 5 minutes; missing invalidation keeps users gated after successful link/update.
- Local dev gaps: No developer shortcut to seed an active subscription/credits → gating during manual QA.

## Solution Design (enterprise-grade)
- Ensure Stripe→Inngest→DB pipeline is always running locally and in CI; add health checks and observable logs/metrics for webhook intake and handler outcomes.
- Make subscription linkage resilient:
  - Map Stripe customer IDs reliably (persist `profile.stripeCustomerId` on checkout/subscribe).
  - Retry-safe linking: If entitlements show no active sub but a `pendingSubscription` exists with `payment_complete` and verified email, auto-link once and invalidate cache.
  - Improve customer lookup fallbacks in handlers to avoid silent drops.
- Cache correctness: Centralize cache invalidation on subscription create/update/delete/link and on manual credit adjustments; add a short-circuit to bypass stale cache if a recent subscription write exists.
- Dev/QA enablement: Provide a script/command to create a local active subscription + credits, or a guarded `DEV_BYPASS_SUBSCRIPTION` toggle for non-production only.
- UX clarity: When gating, surface actionable reasons (no subscription, unverified email, pending payment) instead of generic error.

## Ticket-Ready Tasks
1) **Reliability – Webhook/Worker**
   - Add a local dev helper target to start Inngest worker alongside `next dev`; document required commands in README.
   - Implement a lightweight health check endpoint/log hook for `process-stripe-webhook` to confirm consumption in dev/CI.
   - Add structured logs (subscription id, customer id, user id) and alert hooks on failure in `handleSubscriptionCreatedOrUpdated`.

2) **Data Integrity – Linking & Mapping**
   - In `subscribe/actions.ts`, ensure `profile.stripeCustomerId` is set on checkout/initiation and preserved on user creation.
   - In `handleCheckoutCompleted` and `handleSubscriptionCreatedOrUpdated`, add a fallback path: if user not found by customer id but a verified Clerk user exists with matching email and pending subscription, run `linkPendingSubscription`.
   - Harden `linkPendingSubscription`: explicit guards for missing `stripeSubscriptionId`, clearer errors for unverified email, and ensure it returns an actionable code.

3) **Entitlements Cache Correctness**
   - Centralize `invalidateEntitlementsCache` calls: after subscription create/update/delete, after `linkPendingSubscription`, and after credit mutations.
   - Add a “recent subscription write” short-circuit in `getEntitlements`: if cache exists but a newer subscription exists, refresh before returning.

4) **Developer/QA Ergonomics**
   - Add a dev-only script (e.g., `pnpm dev:seed-subscription --user <email> --plan DIGITAL_CAPSULE`) to create a subscription row, set planType, and seed credits.
   - Add an optional `DEV_BYPASS_SUBSCRIPTION` guard in scheduling action for non-production to allow e2e flows without Stripe in CI (default off).

5) **UX & Error Messaging**
   - Update scheduling response handling to show specific messages: “Verify your email to activate your subscription”, “Payment pending”, or “Start a subscription”.
   - Add instrumentation on scheduling failures: log entitlements snapshot (plan, status, features) when returning `SUBSCRIPTION_REQUIRED`.

6) **Testing & CI**
   - Add integration tests for subscription linking + entitlements: no subscription → gated; pending subscription + verified email → auto-link → can schedule.
   - Add e2e (Playwright) happy path: checkout -> webhook/link -> schedule succeeds.
   - Add unit tests for `getEntitlements` cache refresh logic and `linkPendingSubscription` edge cases (missing customer id, unverified email).

7) **Documentation**
   - Update `docs/LOCAL_WEBHOOK_TESTING.md` with the worker start command, health check steps, and the new dev seed/bypass options.
   - Add a runbook section: how to diagnose “subscription required” (checks: subscription row, profile.stripeCustomerId, pendingSubscription, email verification, cache invalidation).

### Dev Shortcuts
- `pnpm dev:web+worker` to run Next + Inngest together for webhook processing.
- `pnpm dev:seed-subscription --email=<user> [--plan=DIGITAL_CAPSULE|PAPER_PIXELS]` to create a local active subscription + credits.
- Optional non-prod gate: set `DEV_BYPASS_SUBSCRIPTION=true` in `.env.local` to bypass subscription checks during CI/dev e2e flows (off by default).

## Success Criteria
- Users with paid or trial subscriptions can schedule immediately after checkout; no false “subscription required”.
- Webhook/worker liveness verifiable locally and in CI.
- Clear, actionable error states for unverified email or unpaid checkout.
- Devs can reliably test scheduling without manual DB edits.
