# Dashboard Onboarding Checklist & Coach Concept

Purpose: help newly activated users understand the 3 critical actions required to deliver their first letter while reinforcing trust and personalization.

---

## Experience Pillars
1. **Progressive checklist** – always-visible card summarizing onboarding state.
2. **Contextual coach** – conversational panel providing tips, reminders, and trust cues based on behavior.
3. **Celebration & reflection** – each completed step unlocks a ritual moment to encourage sharing or journaling.

---

## Checklist Structure
| Step | Trigger | UI Details | Delight Moment | Trust Signal |
| --- | --- | --- | --- | --- |
| 1. “Capture your first letter” | A letter exists in DB for user | Card shows checkmark, “Letter saved 2m ago” | Animated wax seal stamping “Protected” | Tooltip links to encryption overview |
| 2. “Schedule your first delivery” | Delivery row exists with future `deliverAt` | Button “Schedule now” opens wizard inline | Countdown ticker (“Arrives in 18 days”) | Banner “We’ll remind you 24h before send” referencing retries |
| 3. “Verify your recipients & prefs” | User confirmed email/mail recipients + timezone | Inline form for recipient info + timezone dropdown | Coach avatar applauds + suggests rituals | Copy describes DST safeguards, cancellation window |

Visual layout: card pinned to top of `/dashboard`, responsive stacking on mobile. Each step expands accordion-style with microinstructions, linking to relevant surfaces.

---

## Coach Panel Behavior
- **Avatar** – stylized mail carrier duck that changes accessories (stamp book, telescope) based on progress.
- **Message cadence**:
  - If user stalls on a step for >24h, coach surfaces encouragement + quick action button.
  - After delivery, coach asks for reflection and suggests next milestone (e.g., “Anniversary series”).
- **Content slots**:
  1. **Tips** – short bullets with action links.
  2. **Trust bytes** – e.g., “Yesterday’s on-time delivery rate: 99.97%”.
  3. **Celebrations** – confetti overlay + share CTA after completing all steps.

Implementation idea: add `CoachCard` component with props `variant: "tip" | "trust" | "celebration"`, feed via feature flag so content can iterate without redeploy.

---

## Data / Instrumentation
- Track `checklist_step_started`, `checklist_step_completed`, `coach_message_dismissed`, `coach_action_clicked`.
- Use PostHog cohorts to identify users who complete all steps within 48h vs those who churn; feed insights back into retention triggers.

---

## Next Steps
1. Prototype card + coach in Figma and run unmoderated test with 5 users.
2. Build minimal implementation behind `enable-dashboard-coach` flag.
3. Sync with Lifecycle Marketing to align email nudges with in-app coach messaging. !*** End Patch
