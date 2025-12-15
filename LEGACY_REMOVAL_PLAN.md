# Legacy Component & Route Removal Plan

> Generated: 2025-12-12
> Status: Ready for review - DO NOT REMOVE YET

## Summary Statistics

| Category | Total | Safe to Remove | Keep | Verify |
|----------|-------|---------------|------|--------|
| **Legacy Route Pages** | 41 | 41 | 0 | 0 |
| **Sandbox Components** | 18 | 17 | 1 | 0 |
| **V2 Components** | 12 | 12 | 0 | 0 |
| **Redesign Components** | 16 | 15 | 1 | 0 |
| **Root Components** | 22 | 15 | 4 | 3 |
| **Settings Folder** | 9 | 9 | 0 | 0 |
| **Dashboard Folder** | 3 | 3 | 0 | 0 |
| **Letters Folder** | 4 | 2 | 0 | 2 |
| **Skeletons Folder** | 6 | 0 | 6 | 0 |
| **TOTAL** | **131** | **114** | **12** | **5** |

---

## 🔴 SAFE TO REMOVE (114 files)

### Legacy Route Pages (41 files)

All pages in `apps/web/app/[locale]/(legacy)/` - replaced by `(app-v3)`:

```
(legacy)/(app)/
├── dashboard-legacy/
│   ├── page.tsx
│   ├── loading.tsx
│   └── error.tsx
├── deliveries-legacy/
│   ├── page.tsx
│   └── loading.tsx
├── letters-legacy/
│   ├── page.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   ├── new/
│   │   ├── page.tsx
│   │   └── loading.tsx
│   ├── drafts/page.tsx
│   └── [id]/
│       ├── page.tsx
│       └── schedule/page.tsx
├── letter-v2/page.tsx
├── redesign/letters/
│   ├── page.tsx
│   ├── loading.tsx
│   └── new/
│       ├── page.tsx
│       └── loading.tsx
├── settings-legacy/
│   ├── page.tsx
│   ├── loading.tsx
│   ├── billing/
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   └── _components/
│   │       ├── addon-purchase.tsx
│   │       ├── invoice-history.tsx
│   │       ├── manage-subscription-button.tsx
│   │       ├── subscription-status.tsx
│   │       └── usage-indicator.tsx
│   ├── privacy/
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   └── _components/
│   │       ├── delete-data-button.tsx
│   │       └── export-data-button.tsx
│   ├── referrals/page.tsx
│   └── settings/
│       ├── data-privacy-section.tsx
│       └── profile-section.tsx
└── layout.tsx

(legacy)/(app-v2)/
├── dashboard-v2/page.tsx
├── letters-v2/
│   ├── page.tsx
│   ├── new/page.tsx
│   └── [id]/page.tsx
├── unlock-legacy/[id]/page.tsx
└── layout.tsx
```

### Sandbox Components (17 files)

Path: `apps/web/components/sandbox/`

| File | Status | Reason |
|------|--------|--------|
| `cinematic-hero-full.tsx` | REMOVE | sandbox-only |
| `cinematic-hero.tsx` | REMOVE | sandbox-only |
| `dashboard-checklist-coach.tsx` | REMOVE | sandbox-only |
| `enhanced-editor.tsx` | REMOVE | sandbox-only |
| `entitlement-upsell.tsx` | REMOVE | sandbox-only |
| `experience-context.tsx` | REMOVE | sandbox-only |
| `flow-letter-editor.tsx` | REMOVE | sandbox-only |
| `hero-editor-prototype.tsx` | REMOVE | sandbox-only |
| `mini-demo-loop.tsx` | REMOVE | sandbox-only |
| `reflection-journal.tsx` | REMOVE | sandbox-only |
| `retention-features.tsx` | REMOVE | sandbox-only |
| `rich-text-editor.tsx` | REMOVE | sandbox-only |
| `sandbox-nav.tsx` | REMOVE | UNUSED - zero imports |
| `schedule-wizard.tsx` | REMOVE | sandbox-only |
| `temporal-canvas-editor.tsx` | REMOVE | sandbox-only |
| `trust-visualization.tsx` | REMOVE | sandbox-only |
| `types.ts` | REMOVE | sandbox-only |

**Entire folder to remove:** `simplified-letter-editor/`
```
simplified-letter-editor/
├── index.tsx
├── SimplifiedLetterEditor.tsx
├── types.ts
├── components/
│   ├── ArriveInSelector.tsx
│   ├── ControlMenuSidebar.tsx
│   ├── LetterPaper.tsx
│   ├── TemplateModal.tsx
│   ├── TemplateSelector.tsx
│   └── WritingAmbienceSelector.tsx
├── hooks/useAutoSave.ts
└── lib/
    ├── dateCalculations.ts
    ├── templates.ts
    └── validation.ts
```

### V2 Components (12 files)

Path: `apps/web/components/v2/`

| File | Status | Reason |
|------|--------|--------|
| `capsule-sealed-animation.tsx` | REMOVE | legacy-only |
| `countdown-hero.tsx` | REMOVE | legacy-only, v3 has replacement |
| `design-system.tsx` | REMOVE | legacy-only |
| `emotional-letter-editor.tsx` | REMOVE | legacy-only |
| `envelope-3d.tsx` | REMOVE | UNUSED - zero imports |
| `letter-grid-v2.tsx` | REMOVE | legacy-only |
| `letter-unlocker.tsx` | REMOVE | legacy-only, v3 has replacement |
| `life-in-weeks.tsx` | REMOVE | legacy-only |
| `scheduling-wizard.tsx` | REMOVE | UNUSED - zero imports |
| `template-selector.tsx` | REMOVE | legacy-only |
| `timeline-journey.tsx` | REMOVE | legacy-only |
| `write-prompt.tsx` | REMOVE | legacy-only |

### Redesign Components (15 files)

Path: `apps/web/components/redesign/`

| File | Status | Reason |
|------|--------|--------|
| `filter-tabs.tsx` | REMOVE | legacy-only |
| `write-prompt-banner.tsx` | REMOVE | legacy-only |
| `next-delivery-hero.tsx` | REMOVE | legacy-only |
| `floating-write-button.tsx` | REMOVE | legacy-only |
| `letter-grid.tsx` | REMOVE | legacy-only |
| `letter-card.tsx` | REMOVE | UNUSED - only by letter-grid |
| `empty-state-hero.tsx` | REMOVE | legacy-only |
| `journey-path.tsx` | REMOVE | legacy-only |
| `index.ts` | REMOVE | barrel export |

**Entire folder to remove:** `capsule-journey/`
```
capsule-journey/
├── capsule-journey.tsx
├── index.ts
├── journey-progress.tsx
├── phase-1-intention.tsx
├── phase-2-reflection.tsx
├── phase-3-sanctuary.tsx
├── phase-4-sealing.tsx
└── sanctuary-editor.tsx
```

### Root Components - Remove (15 files)

Path: `apps/web/components/`

| File | Status | Reason |
|------|--------|--------|
| `dashboard-letter-editor.tsx` | REMOVE | legacy-only |
| `dashboard-wrapper.tsx` | REMOVE | legacy-only |
| `deliveries-list-client.tsx` | REMOVE | legacy-only |
| `delivery-error-card.tsx` | REMOVE | legacy-only |
| `download-calendar-button.tsx` | REMOVE | legacy-only |
| `letter-draft-form.tsx` | REMOVE | UNUSED - zero imports |
| `letter-filter-tabs.tsx` | REMOVE | legacy-only |
| `letters-list-client.tsx` | REMOVE | legacy-only |
| `mobile-navigation.tsx` | REMOVE | legacy-only |
| `navbar.tsx` | REMOVE | UNUSED - zero imports |
| `new-letter-form.tsx` | REMOVE | UNUSED - zero imports |
| `referral-section.tsx` | REMOVE | legacy-only |
| `resume-draft-banner.tsx` | REMOVE | UNUSED - zero imports |
| `schedule-delivery-form.tsx` | REMOVE | legacy-only |
| `timezone-change-warning.tsx` | REMOVE | legacy-only |

### Settings Folder (9 files)

Path: `apps/web/components/settings/`

| File | Status | Reason |
|------|--------|--------|
| `billing-summary.tsx` | REMOVE | legacy-only, v3 has replacement |
| `collapsible-section.tsx` | REMOVE | legacy-only, v3 has replacement |
| `editable-field.tsx` | REMOVE | legacy-only, v3 has replacement |
| `notifications-settings.tsx` | REMOVE | legacy-only, v3 has replacement |
| `privacy-summary.tsx` | REMOVE | legacy-only, v3 has replacement |
| `profile-fields.tsx` | REMOVE | legacy-only, v3 has replacement |
| `push-notification-toggle.tsx` | REMOVE | legacy-only, v3 has replacement |
| `referral-summary.tsx` | REMOVE | legacy-only, v3 has replacement |
| `timezone-select.tsx` | REMOVE | legacy-only, v3 has replacement |

### Dashboard Folder (3 files)

Path: `apps/web/components/dashboard/`

| File | Status | Reason |
|------|--------|--------|
| `countdown-timer.tsx` | REMOVE | legacy-only, v3 has replacement |
| `next-delivery-widget.tsx` | REMOVE | legacy-only, v3 has replacement |
| `timeline-minimap.tsx` | REMOVE | legacy-only, v3 has replacement |

### Letters Folder - Remove (2 files)

Path: `apps/web/components/letters/`

| File | Status | Reason |
|------|--------|--------|
| `inline-schedule-section.tsx` | REMOVE | legacy-only |
| `letter-timeline.tsx` | REMOVE | legacy-only |

### Other Remove (4 files)

| File | Status | Reason |
|------|--------|--------|
| `billing/upgrade-modal.tsx` | REMOVE | UNUSED - zero imports |
| `billing/quota-exceeded-banner.tsx` | REMOVE | UNUSED - zero imports |
| `marketing/how-it-works.tsx` | REMOVE | UNUSED - zero imports |
| `onboarding/welcome-modal.tsx` | REMOVE | only used by legacy dashboard-wrapper |

---

## 🟢 KEEP (12 files)

### Production Components

| File | Reason |
|------|--------|
| `error-boundary.tsx` | used by v3/letter-editor-wrapper |
| `animated-envelope.tsx` | used by /view/[token] - public sharing |
| `anonymous-letter-tryout.tsx` | used by /write-letter - marketing |
| `timezone-tooltip.tsx` | used across multiple versions |

### Redesign - Keep

| File | Reason |
|------|--------|
| `redesign/delivery-timeline.tsx` | used by app-v3/letters/[id] |

### Sandbox - Keep

| File | Reason |
|------|--------|
| `sandbox/sanctuary-editor.tsx` | used by redesign/phase-3-sanctuary (production) |

### Skeletons Folder - Keep All (6 files)

| File | Reason |
|------|--------|
| `skeletons/skeleton.tsx` | base component, widely used |
| `skeletons/delivery-card-skeleton.tsx` | loading states |
| `skeletons/letter-card-skeleton.tsx` | loading states |
| `skeletons/letter-editor-skeleton.tsx` | loading states |
| `skeletons/stats-card-skeleton.tsx` | loading states |
| `skeletons/template-grid-skeleton.tsx` | loading states |

---

## 🟡 VERIFY BEFORE REMOVING (5 files)

### May Have External Dependencies

| File | Concern |
|------|---------|
| `letter-editor-form.tsx` | used in sandbox + v2, check for external links |
| `letters/email-preview-modal.tsx` | used by letter-editor-form |
| `letters/template-selector.tsx` | used by letter-editor-form |

### May Have External Links/Redirects

| Route | Concern |
|-------|---------|
| `deliveries-legacy` | verify no external links to this route |
| `letter-v2/page.tsx` | verify no email/docs links |

---

## Removal Order (Recommended)

### Phase 1: Safe Deletions (no dependencies)

1. **V2 components** (12 files)
   ```bash
   rm -rf apps/web/components/v2/
   ```

2. **Redesign components** except `delivery-timeline.tsx` (15 files)
   ```bash
   # Keep delivery-timeline.tsx
   rm apps/web/components/redesign/filter-tabs.tsx
   rm apps/web/components/redesign/write-prompt-banner.tsx
   rm apps/web/components/redesign/next-delivery-hero.tsx
   rm apps/web/components/redesign/floating-write-button.tsx
   rm apps/web/components/redesign/letter-grid.tsx
   rm apps/web/components/redesign/letter-card.tsx
   rm apps/web/components/redesign/empty-state-hero.tsx
   rm apps/web/components/redesign/journey-path.tsx
   rm apps/web/components/redesign/index.ts
   rm -rf apps/web/components/redesign/capsule-journey/
   ```

3. **Sandbox components** except `sanctuary-editor.tsx` (17 files)
   ```bash
   # Keep sanctuary-editor.tsx
   rm apps/web/components/sandbox/cinematic-hero-full.tsx
   rm apps/web/components/sandbox/cinematic-hero.tsx
   rm apps/web/components/sandbox/dashboard-checklist-coach.tsx
   rm apps/web/components/sandbox/enhanced-editor.tsx
   rm apps/web/components/sandbox/entitlement-upsell.tsx
   rm apps/web/components/sandbox/experience-context.tsx
   rm apps/web/components/sandbox/flow-letter-editor.tsx
   rm apps/web/components/sandbox/hero-editor-prototype.tsx
   rm apps/web/components/sandbox/mini-demo-loop.tsx
   rm apps/web/components/sandbox/reflection-journal.tsx
   rm apps/web/components/sandbox/retention-features.tsx
   rm apps/web/components/sandbox/rich-text-editor.tsx
   rm apps/web/components/sandbox/sandbox-nav.tsx
   rm apps/web/components/sandbox/schedule-wizard.tsx
   rm apps/web/components/sandbox/temporal-canvas-editor.tsx
   rm apps/web/components/sandbox/trust-visualization.tsx
   rm apps/web/components/sandbox/types.ts
   rm -rf apps/web/components/sandbox/simplified-letter-editor/
   ```

### Phase 2: Settings/Dashboard Cleanup

4. **Settings folder** (9 files)
   ```bash
   rm -rf apps/web/components/settings/
   ```

5. **Dashboard folder** (3 files)
   ```bash
   rm -rf apps/web/components/dashboard/
   ```

6. **Letters folder partial** (2 files)
   ```bash
   rm apps/web/components/letters/inline-schedule-section.tsx
   rm apps/web/components/letters/letter-timeline.tsx
   ```

### Phase 3: Root Components

7. **Remove 15 root components**
   ```bash
   rm apps/web/components/dashboard-letter-editor.tsx
   rm apps/web/components/dashboard-wrapper.tsx
   rm apps/web/components/deliveries-list-client.tsx
   rm apps/web/components/delivery-error-card.tsx
   rm apps/web/components/download-calendar-button.tsx
   rm apps/web/components/letter-draft-form.tsx
   rm apps/web/components/letter-filter-tabs.tsx
   rm apps/web/components/letters-list-client.tsx
   rm apps/web/components/mobile-navigation.tsx
   rm apps/web/components/navbar.tsx
   rm apps/web/components/new-letter-form.tsx
   rm apps/web/components/referral-section.tsx
   rm apps/web/components/resume-draft-banner.tsx
   rm apps/web/components/schedule-delivery-form.tsx
   rm apps/web/components/timezone-change-warning.tsx
   ```

8. **Remove other unused components**
   ```bash
   rm apps/web/components/billing/upgrade-modal.tsx
   rm apps/web/components/billing/quota-exceeded-banner.tsx
   rm apps/web/components/marketing/how-it-works.tsx
   rm apps/web/components/onboarding/welcome-modal.tsx
   ```

### Phase 4: Legacy Routes (after component cleanup)

9. **Remove `(legacy)/(app-v2)/` route group**
   ```bash
   rm -rf apps/web/app/[locale]/(legacy)/(app-v2)/
   ```

10. **Remove `(legacy)/(app)/` route group**
    ```bash
    rm -rf apps/web/app/[locale]/(legacy)/(app)/
    ```

11. **Remove entire legacy folder**
    ```bash
    rm -rf apps/web/app/[locale]/(legacy)/
    ```

### Phase 5: Final Verification

12. **Run full build + typecheck**
    ```bash
    pnpm typecheck
    pnpm build
    ```

13. **Test all app-v3 routes manually**
    - `/journey` (dashboard)
    - `/letters` (list)
    - `/letters/new` (create)
    - `/letters/[id]` (detail)
    - `/letters/[id]/schedule` (schedule)
    - `/settings` (settings)
    - `/unlock/[id]` (unlock)

---

## Notes

- **Total files to remove**: 114 (87% of audited files)
- **Files to keep**: 12 (9%)
- **Files to verify**: 5 (4%)
- **Current app-v3 routes are fully functional** and do not depend on legacy components
- **V3 components in `/components/v3/`** provide all necessary functionality
- **Skeletons** are shared and should be kept for now

---

## Checklist Before Removal

- [ ] Verify no external links point to legacy routes (marketing emails, documentation)
- [ ] Check analytics for any traffic to legacy routes
- [ ] Confirm all v3 routes have feature parity with legacy
- [ ] Create git branch for removal work
- [ ] Run typecheck after each phase
- [ ] Run build after each phase
- [ ] Manual QA of all app-v3 routes after completion
