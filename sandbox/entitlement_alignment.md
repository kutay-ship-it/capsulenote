# Entitlement Enforcement Alignment (PM × Eng)

Objective: define how Pro entitlements gate scheduling/physical mail features while preserving reliability and providing contextual upsells.

---

## Current State Snapshot
- Business rule: Pro required to schedule deliveries; physical mail incurs add-on fees (see `ARCHITECTURE.md:162-177`).
- UI still shows “coming soon” badges for subscription management; server actions (`scheduleDelivery`) do **not** enforce plan status yet.
- Stripe subscriptions + payments stored in Prisma (`subscriptions`, `payments` tables).

---

## Proposed Enforcement Model
1. **Entitlement middleware**
   - Create `getEntitlements(userId)` helper reading subscription status + feature flags.
   - Cache per-user entitlements in Redis for 5 minutes to avoid extra DB hits.
2. **Server-side guardrails**
   - `createLetter` remains open (free tier); `scheduleDelivery` checks entitlements:
     - If `plan !== pro`, throw `ErrorCodes.PAYMENT_REQUIRED` with metadata `requiredFeature: "scheduling"`.
     - Allow one-time “trial delivery” (flag stored on user profile).
3. **Contextual upsells**
   - When guard triggers, respond with structured info used by client to show upgrade modal inside wizard.
   - Provide `upgradeContext` (e.g., channel=mail, benefit list) so PM can customize copy per scenario.
4. **Physical mail add-ons**
   - Require `plan === pro` **and** `hasMailCredits` (stored via Stripe usage or wallet table).
   - Fallback: inline purchase flow (Stripe Checkout modal) before enabling the “Mail” step.
5. **Reliability guard**
   - If billing service fails, default to allowing scheduling but flag delivery for reconciliation + send alert to ops (prefer reliability over strict gating).

---

## User Experience Flow
1. User selects delivery date → entitlement check runs.
2. If lacking Pro:
   - Wizard pane shows benefits (“Unlimited scheduling, on-time guarantees, mail concierge”).
   - Offer Apple/Google Pay via Stripe Checkout for instant upgrade.
   - After upgrade webhook returns, entitlements cache invalidates and wizard resumes automatically.
3. PM-owned copy specifically references trust (“Upgrades include SLO-backed delivery & encrypted storage continuity”).

---

## Engineering Tasks
- [ ] Implement `entitlements` helper + Redis caching.
- [ ] Update server actions (`scheduleDelivery`, future `scheduleMailDelivery`) to enforce.
- [ ] Add `PaymentRequiredError` handling to client forms (ScheduleDeliveryForm).
- [ ] Integrate Stripe customer portal into settings so users can manage plan without support.
- [ ] Add telemetry events: `entitlement_block`, `upgrade_flow_started`, `upgrade_flow_completed`.

---

## PM Responsibilities
- Define pricing tiers + “trial delivery” policy.
- Craft upgrade messaging per scenario (email vs mail vs templates).
- Partner with Lifecycle Marketing to trigger follow-up emails when users bounce at paywall.
- Monitor conversion metrics from contextual upsells vs existing pricing page.

---

## Risks & Mitigations
| Risk | Impact | Mitigation |
| --- | --- | --- |
| Reliability regressions if entitlement check fails | Blocked deliveries | Cache results, fail open with alert |
| Confusing upsell copy | Lower conversion | Collaborate with UX writing; test via feature flag |
| Webhook delays causing entitlement lag | Users stuck after upgrade | Poll Stripe client-side for status + show loading state |

---

## Next Steps
1. PM to finalize pricing/benefit messaging by Friday.
2. Eng to spike entitlements helper + guards next sprint (estimate 5 pts).
3. Schedule PM/Eng review of upsell modal copy + flows once prototype ready. !*** End Patch
