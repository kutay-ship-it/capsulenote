# Customer Journey UX Layering Plan

This plan deepens the Awareness → Activation → Scheduling → Fulfillment → Feedback flow with signature delight moments and explicit trust signals at every step. It assumes DearMe’s current stack (Next.js 15 App Router, Clerk, Prisma/Neon, Inngest, Resend/Postmark, Stripe, Lob) and references existing surfaces in `CUSTOMER_JOURNEY_AND_WORKFLOWS.md`.

---

## 1. Awareness – “This feels like a ritual I want to join”
| Element | Description | Delight Moment | Trust Signal | Owner |
| --- | --- | --- | --- | --- |
| Cinematic hero stack | Replace static hero with split layout: left = animated headline + ritual storytelling; right = live editor seed (auto-fills prompt) | “Write the first sentence right now” micro animation tied to scroll depth; celebratory confetti pulse when they complete first line | Inline “Words stay private until you send” tag referencing encryption + SOC posture | Product Design + Frontend |
| Ritual carousel | Scroll cards for “Gratitude drop”, “Launch letter”, “Year 5 check-in” with CTA to preload templates | Each card reveals a short narrated snippet when hovered | Each card includes badge “Trusted by 27k letters” + domain authentication badges | Product Marketing |
| Social proof ribbon | Rotating quotes + metrics anchored to Upstash/Resend telemetry | Timed fade-ins synchronized to hero rhythm | “Verified delivery stats updated hourly” with data source icon | Marketing Ops |

## 2. Activation – “I can try before I commit”
| Element | Description | Delight Moment | Trust Signal | Owner |
| --- | --- | --- | --- | --- |
| Inline anonymous editor | Keep hero editor active even as modal; autosave draft in localStorage | Real-time mood gradient border that changes with sentiment analysis to make writing feel alive | “Local Draft • Encrypted on save” indicator with hover card explaining encryption flow | Frontend + Research |
| Sidecar auth | When user clicks “Save & Deliver”, slide out Clerk panel referencing their draft (“Finish storing ‘Letter to Future Me’”) | Continuity microcopy + mini preview of their words inside auth panel | “Clerk • SOC2 Type II” badge; mention passkeys + Magic links | Product Design |
| Entry checklist | After auth, drop them onto a 3-step progress card (“1. Save letter, 2. Schedule delivery, 3. Confirm recipient”) | Each completion triggers playful stamp animation | “All actions logged in audit trail” footnote + link to policy | Product + Eng |

## 3. Scheduling – “Planning feels guided and precise”
| Element | Description | Delight Moment | Trust Signal | Owner |
| --- | --- | --- | --- | --- |
| Wizard flow | Stepper: Recipient → Medium → Timing → Review. Each step has contextual prompts and default values based on previous behavior. | Animated “time tunnel” visual when moving into the Timing step highlighting the selected milestone | DST alert banner with exact offset math; timezone chip locked to profile + ability to verify via IANA list | Product Design + Eng |
| Medium selector | Toggle for Email / Premium Mail / Combo; show tactile previews (paper textures, envelope mock) | “Hold to preview envelope” microinteraction | Mention Lob + ClickSend infrastructure, show badges “Printed securely in ISO-certified facility” | Product Design + Ops |
| Billing inline | If action requires Pro, embed pricing panel right inside the wizard with “Why Pro?” bullet list that references reliability perks | Offer instant upgrade with Apple/Google Pay; success confetti shaped like stamps | “Upgrade is instant, you can cancel anytime” + link to billing settings + reuse Stripe secure badge | Product + Growth |

## 4. Fulfillment – “I see the automation working”
| Element | Description | Delight Moment | Trust Signal | Owner |
| --- | --- | --- | --- | --- |
| Delivery timeline | Visual timeline inside letter detail showing statuses (Scheduled → Processing → Sent) with Inngest job IDs | Each status emits small haptic animations (if mobile) or subtle motion lines | “Backstop reconciler active” tooltip referencing cron job + SLO | Product + Platform Eng |
| Live notifications | When Inngest marks `processing`, push in-app toast + email “Your 2021 self is en route” | Personalized message referencing letter title/time delta | Footer outlines retries, idempotency, and bounce handling; link to Postmark/Resend status page | Lifecycle Marketing |
| Recipient preview | Provide shareable view of what the recipient will see (HTML + optional print preview) | Simulated fold animation for physical letters | “No tracking pixels if you disable them” toggle + mention of audit/logging | Product Design |

## 5. Feedback – “Reflect, repeat, and stay in control”
| Element | Description | Delight Moment | Trust Signal | Owner |
| --- | --- | --- | --- | --- |
| Reflection prompt | After delivery, prompt user with “How did that letter land?” journaling modal connected to next-letter suggestions | Visualizes timeline of letters as constellation when they log reflections | “Reflection stored privately; export anytime” + CTA to data studio | Product Design |
| Dashboard coach | Persistent panel summarizing progress, streaks, upcoming deliveries, and recommendations | Coach avatar changes outfits with seasons / milestone badges | “Data last refreshed <timestamp>” + link to audit log for each suggestion | Product + Data |
| Privacy center | In settings, create dedicated “Privacy & Data” wizard for exporting, deleting, and controlling recipients | Engaging microcopy: “Your words, your control” + toggles | Reinforce encryption, optional secret question, retention timelines; display compliance attestations | Security + Legal |

---

### Implementation Notes
1. **Measurement** – Instrument each delight + trust moment using PostHog funnels already prioritized in Phase 3; map metrics to “emotional engagement” vs “trust reassurance”.
2. **Design System** – Add new components (timeline, wizard, coach panel) to `@dearme/ui` with tokens for animations and badges.
3. **Sequencing** – Build in order: Awareness hero prototype → Activation checklist → Scheduling wizard/HV flows → Fulfillment telemetry widgets → Feedback coaching.
