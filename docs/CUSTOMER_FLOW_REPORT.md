# Customer Flow Report (WIP)

Date: 2025-11-23

## Context
- Goal: map and critique the end-to-end experience from landing page to paid subscription and delivery scheduling.
- Current codebase already supports Clerk auth, Stripe checkout, letters, and delivery scheduling, but marketing/guest flows and entitlement wiring have gaps.

## Desired Journey (as provided)
1) Visitor lands on the home page, sees the letter-writing section, drafts a letter; draft should persist to localStorage.
2) When the visitor taps “Send & Schedule,” if the email is not associated with a signed-in user (or user is not signed in), show a paywall.
3) Paywall: visitor picks a package, is sent to Stripe; email is locked to the one typed in the landing editor.
4) After payment, redirect to sign-up where the email is prefilled/locked to match Stripe and the landing editor.
5) After account creation, land in the dashboard with entitlements based on the purchased package.
6) Scheduling emails should be as easy/streamlined as possible post-purchase.

## Immediate Gaps / Risks Noted
- Middleware currently blocks most marketing/guest pages (pricing, write-letter, subscribe), breaking the guest-to-paywall funnel.
- Landing hero editor only logs/alerts; does not persist to localStorage or drive checkout.
- Paywall/checkout needs email locking through Stripe customer creation; current anonymous checkout flow exists but must be wired to the landing editor email.
- Linking paid sessions back to the new account is brittle (Clerk client call bug) and needs fixing to honor the paid email.
- Schedule flow UI currently ignores action failures; needs tighter feedback to match the “easy scheduling” goal.

## Decisions / Next Steps
- Expose all public marketing/paywall routes via middleware allowlist.
- Enhance landing editor to persist drafts to localStorage and pipe email into anonymous checkout.
- On first login, auto-load the last localStorage draft into the dashboard editor and prompt with “Continue where you left off” during onboarding.
- Lock email through Stripe customer + checkout session, then carry it into sign-up as a non-editable field.
- Fix pending-subscription linking bug (Clerk client invocation) to ensure entitlements activate after sign-up.
- Improve schedule form to surface server-action errors and streamline success path.
- Paywall exception policy (decision): if the entered email already maps to an active subscription, skip paywall and prompt sign-in to resume; otherwise always show paywall.

## Onboarding & “Continue Where You Left Off”
- Trigger: first login after checkout/signup, detect `localStorage.lastDraft` (title/body/email) and offer a lightweight modal in dashboard: “Welcome back—continue where you left off?” with CTA “Resume draft” (loads into dashboard editor) and secondary “Start fresh.”
- Empty-state banner (if modal dismissed): inline notice atop dashboard editor, “We saved your draft from the site. Resume?” with same actions.
- Copy snippets:
  - Modal title: “Pick up your letter”
  - Body: “We saved the draft you started on the site. Want to finish and schedule it now?”
  - Primary CTA: “Resume draft”
  - Secondary: “Start fresh”
- Safety: keep localStorage data until user explicitly starts fresh; clear after successful save or schedule.
- If user is already subscribed and enters their subscribed email pre-auth, skip paywall and show a sign-in prompt plus “Resume draft” on return.

## Server-Side Email Lock Enforcement
- Signup stamps `lockedEmail` into Clerk unsafe metadata; Clerk webhook (`/api/webhooks/clerk`) rejects/cleans up mismatched emails.
- Client-side guard (`EmailLockGuard`) signs out if primary email differs from locked email on session load; applied to `(app)` layout.
- Remaining risk: webhook delays; optional post-signup server validation can be added to auth boot to enforce before app use.
