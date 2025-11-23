# Capsule Note Gap-Closure Execution Plan

This document translates the phased alignment plan into ticket-ready tasks for implementation. Each phase lists actionable, independently trackable items.

## Phase 1 — Align Business & Data Model
- [x] Update Prisma schema to add: `PlanType` (Digital Capsule, Paper & Pixels), yearly credit buckets, `Letter` scheduling fields (`type`, `status`, `scheduledFor`, `timezone`, `lockedAt`, `shareLinkToken`), `DeliveryAttempt`, add-on models.
- [x] Generate migration and regenerate Prisma client; document migration steps in `DEVELOPMENT.md`.
- [x] Seed Stripe plan constants (price IDs placeholders) and DB seed for plan metadata (email/physical credits per plan).
- [x] Rewrite entitlements to remove free/trial logic; enforce yearly credits, expiry, no rollover; include credit reservation/refund hooks.
- [x] Update billing constants to remove free tier/trial and set $9/$29/year with add-on prices.

## Phase 2 — Guest → Plan → Payment Funnel
- [x] Extend hero/write-letter flow to persist anonymous drafts to DB/localStorage with recipient type, delivery type, date/time/timezone.
- [x] Add schedule step for guests to capture delivery type (email/physical), recipient info, timezone, and validate before paywall.
- [x] Simplify paywall to two yearly plans, highlight physical coverage, remove free tier language.
- [x] Include draft metadata in Stripe Checkout session (draftLetterId, deliveryType, recipient data, scheduledFor, timezone).
- [x] Allow shadow users (`clerkId` nullable); implement merge-on-signup via Clerk webhook.

## Phase 3 — Scheduling Rules & Delivery Engine
- [x] Enforce min 5 minutes / max 100 years in UI + server validation; default timezone to browser/user; show “Delivering on … (TZ)”.
- [x] Add Inngest lock workflow: at `scheduledFor - 72h` set status `LOCKED`, block edits/cancel.
- [x] Add cancellation rules: before lock → refund credits; after lock → no refund; update statuses to `CANCELLED/LOCKED`.
- [x] Add DeliveryAttempt logging and retry/backoff for email; record failures/bounces.
- [x] Update delivery detail views to display status timeline and lock state.

## Phase 4 — Payments, Credits, Add-ons
- [x] Configure Stripe products/prices: Digital Capsule ($9/yr, 6 email), Paper & Pixels ($29/yr, 24 email + 3 physical), add-ons (+5 email $4, +1 physical $5).
- [x] Map webhooks (`checkout.session.completed`, `customer.subscription.*`) to allocate yearly credits, set expiry, and reserve credits for the draft letter.
- [x] Implement add-on one-off checkout; update current-period credit buckets on success.
- [x] Ensure billing portal downgrade/upgrade resets credits only at renewal boundaries; display renewal date.
- [x] Add audit events for credit grants/refunds and add-on purchases.

## Phase 5 — Recipient Experience & Sharing
- [x] Implement public route `/view/[shareToken]` with envelope animation, localized copy, and CTA back to homepage editor.
- [x] Generate `shareLinkToken` on letter creation; include in delivery email links.
- [x] Show delivered letters with `SENT/BOUNCED/FAILED` statuses; surface DeliveryAttempt errors to sender.
- [x] Add optional share CTA (to homepage) on recipient view; no private link sharing.

## Phase 6 — Physical Mail Readiness
- [ ] Build address book UI/model; validate addresses (Lob or stub) and store securely (encrypted at rest if required).
- [ ] Implement mail scheduling path: require address, reserve physical credit, include in scheduling metadata; toggle physical availability via env.
- [ ] Add provider toggle to switch between Lob stub and live; when disabled, block physical checkout or mark “best effort” clearly.
- [ ] Add mail delivery workflow stub (Inngest) to log/send to Lob when enabled; handle address validation failures with credit refund and user notification.

## Phase 7 — UX Polish, Localization, Trust
- [ ] Copy pass to Capsule Note brand (remove DearMe/free trial language); update trust copy for US/EU physical focus.
- [ ] Introduce EN/TR localization keys (marketing, dashboard, emails, recipient view) with language toggle and browser default detection.
- [ ] Onboarding checklist: confirm timezone, write first letter, view timeline; show plan/credits card with annual credits remaining.
- [ ] Update marketing/pricing to reflect subscription-only model (no free tier) and clear rules (credits expire yearly, no rollover).

## Phase 8 — Ops, Rate Limits, Monitoring
- [ ] Apply Upstash rate limits on anonymous save and schedule endpoints; add instrumentation/logging for throttled events.
- [ ] Add Sentry to app and workers; ensure DSNs are env-driven and errors include user/letter context (not content).
- [ ] Add reconciler/cron: reconcile scheduled letters vs Inngest runs, expire unused credits at period end, cleanup anonymous drafts.
- [ ] Update operational runbooks/checklists with new env vars (Stripe prices, Lob, Sentry, Upstash).

## Phase 9 — QA & Launch Readiness
- [ ] E2E flows: guest → schedule → pay → signup → dashboard shows scheduled; lock/cancel before/after 72h; credit counts adjust; add-on purchase.
- [ ] Delivery tests: mock Resend/Postmark/Lob; verify statuses and DeliveryAttempt logging.
- [ ] Localization snapshots for EN/TR; accessibility pass on marketing and recipient view.
- [ ] Final env checklist: Stripe keys/prices, Resend domain/DKIM, Lob keys or disabled flag, Upstash creds, Sentry DSN, NEXT_PUBLIC URLs; document in `DEPLOYMENT.md`.
