# DearMe Landing Page Blueprint (Sandbox)

> This file captures a full-page plan for a production-ready landing experience, translating the journey and UX beats into copy, layout, and component direction. All content is mocked for sandbox exploration only.

---

## 1. Hero – “Write it today. Deliver it when it matters.”
| Element | Content | Notes |
| --- | --- | --- |
| Headline | “Write it today. Deliver it when it matters.” | Same double-line rhythm from UX plan; set in font-mono with uppercase tracking. |
| Supporting copy | “Pour your thoughts into a calm editor, store them privately, and schedule the exact moment a future you—or someone you love—needs to hear them.” | Reinforces ritual + trust. |
| Primary CTA | `Start for free` | Points to `/sign-up`; secondary CTA `See the ritual` anchors to “How It Works”. |
| Hero editor | Live inline editor (from sandbox hero) with prompts, presets, mood indicator, autosave microcopy, local-only storage. | Acts as interactive proof; no auth required. |
| Proof ribbon | Cards for “27k+ letters”, “99.97% on-time”, “2 delivery formats” with short descriptors. | Sits below hero copy, above fold. |

---

## 2. Ritual Prompts Strip
Horizontal scroll of prompt chips, each with:
- Title (e.g., “Launch Day Letter”)
- 1-sentence prompt
- “Load into editor” button that pre-fills hero editor
- Badge for intended time horizon (6m, 1y, etc.)

Purpose: highlight use cases + invite interaction before signup.

---

## 3. Feature Pillars
Three-up cards (brutalist style, 2px borders) covering:
1. **Guided writing rituals** – mention templates & tone sliders.
2. **Trustworthy vault** – reference AES-256-GCM encryption, audit logging, Clerk.
3. **Dependable delivery** – explain Inngest workflows, retries, premium mail concierge.

Each card includes a short “See how it works” link to corresponding section below.

---

## 4. How It Works (3 Beats)
Side-by-side layout:
- Left: timeline cards (Set the moment → Pour your heart out → Let us deliver) from UX plan.
- Right: motion graphic or GIF summarizing the flow.
- Inline callout: “SLOs: 99.97% on-time · Backstop cron every 5 minutes” for extra trust.

---

## 5. Playground → Conversion Bridge
Section title: “Try it before you create an account.”
- Explains that drafts stay on-device until signup.
- CTA group: `Keep writing` (scroll to hero) + `Create encrypted vault` (sign-up).
- Testimonials carousel (3 quotes) about the editing experience.

---

## 6. Pricing / Plans Snapshot
Simple comparison:
- **Free Rituals** – Save drafts locally, 1 scheduled delivery.
- **Capsule Note Pro** – Unlimited scheduling, premium mail, concierge monitoring.
- Inline toggle between Monthly/Annual; CTA to upgrade.
- Footnote referencing Stripe + secure billing copy from entitlement doc.

---

## 7. Social Proof + Scenarios
Grid of three scenario cards (Personal rituals, Team moments, Legacy drops) using copy from existing marketing page, but with badges (“Popular for founders”, “Loved by parents”, etc.).

---

## 8. Footer Conversion
Large CTA block:
- Headline: “Keep promises to your future moments.”
- Buttons: `Start for free`, `Talk to us` (mailto).
- Secondary links: Privacy, Security whitepaper, Status page.

---

## Instrumentation & Notes
1. Track hero editor focus, prompt loads, and conversions to signup in PostHog.
2. Feature the same hero editor code as `/sandbox` but with production copy and no sandbox badges.
3. Keep all lighthouse scores high: limit heavy animations; ensure hero editor only loads client bundle once user interacts.

This blueprint stays inside `/sandbox` for exploration; no production routes modified yet. Once stakeholders approve, port these sections into the real marketing page. !*** End Patch
