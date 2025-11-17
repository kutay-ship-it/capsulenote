# Landing + Editor-in-Hero Prototype

Goal: let visitors experience DearMe’s core value (writing a letter) before authentication, capture intent, and smoothly convert to signup without losing momentum.

---

## Experience Outline
1. **Hero Split Layout**
   - **Left column (45%)**: headline stack (“Write it today. Deliver it when it matters.”), supporting copy, ritual prompt carousel, primary CTA “Write without signing in”.
   - **Right column (55%)**: live editor card with brutalist styling, lined-paper background, quick time presets, and mood indicator.
2. **Autosave Draft**
   - Save content + metadata to `localStorage` (`dearme_anonymous_draft`), including `title`, `body`, `selectedPrompt`, `deliveryPreset`.
   - Show “Local Draft Saved · Encrypted on submit” microcopy with shield icon.
3. **Contextual CTA States**
   - Primary button inside editor toggles between:
     - “Send this to my future self” (when content > 120 chars)
     - Disabled state with tooltip “Add a few more words to unlock scheduling.”
4. **Auth Sidecar**
   - On CTA click, slide out Clerk auth panel anchored to the right edge.
   - Panel shows a mini-preview of the draft (first 120 chars) and message: “We’ll store this encrypted—finish creating your account to send it.”
   - Offer Passkey, Email Link, Google/Apple sign in.
5. **Post-auth Redirect**
   - After success, route to `/letters/new?draft=anon` which pulls from `localStorage`, runs server action to store encrypted letter, and drops user into the scheduling wizard checklist.

---

## Wireframe Snapshot
```
┌────────────────────────────────────────────────────────────┐
│ Headline + ritual chips (left)   │  Live Editor (right)    │
│ “Write without signing in” CTA   │  Title input            │
│                                  │  Mood waveform + tips   │
│  • Story snippet                 │  Presets: 6m | 1y | ... │
│  • Social proof ribbon           │  Rich textarea          │
│                                  │  “Send this to my future│
│                                  │  self” button           │
└────────────────────────────────────────────────────────────┘
```

---

## Component / Tech Notes
- **Editor component**: reuse `LetterEditorForm` logic but wrap in client-only `AnonymousHeroEditor`.
- **State machine**:
  - `idle` → `typing` (show autosave toast) → `ready` (CTA enabled) → `auth_sidecar_open`.
  - On auth failure, return to `ready`.
- **Security**: `localStorage` only until user signs in; once server action stores encrypted letter, delete local copy.
- **Analytics**: Track `hero_editor_started`, `hero_editor_completed`, `hero_auth_opened`, `hero_auth_completed`.

---

## Prototype Validation Checklist
| Question | Metric / Signal | Target |
| --- | --- | --- |
| Do visitors understand they can write immediately? | % of hero sessions where editor focus occurs within 5s | >65% |
| Does sidecar auth feel seamless? | Drop-off between `hero_auth_opened` and `hero_auth_completed` | <25% |
| Does draft persist through signup? | % of flows where draft length post-auth >= pre-auth | 95% |

---

## Next Steps
1. Build Figma frames showing hero interactions + sidecar.
2. Implement feature-flagged experiment (`enable-hero-editor`) targeting 50% of anonymous traffic.
3. Pair with PostHog dashboards for the metrics above. !*** End Patch
