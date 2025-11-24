# Turkish i18n Task Tracker

> Comprehensive list of components requiring Turkish translation support.
> Last Updated: 2024-11-24

## Critical Fixes Applied

### i18n Request Configuration (FIXED 2024-11-24)
- **Issue**: Turkish translations were not loading despite components using `useTranslations` hooks
- **Root Cause**: `i18n/request.ts` was using deprecated `locale` parameter instead of `requestLocale`
- **Fix**: Updated to use `requestLocale` with `hasLocale` validation per next-intl 3.22+ documentation
- **File**: `apps/web/i18n/request.ts`

### Pricing Page Footer (FIXED 2024-11-24)
- **Issue**: Footer in pricing page had hardcoded English strings
- **Fix**: Replaced hardcoded strings with `t()` calls, added `footer` translations to pricing.json (EN/TR)

## Summary

| Priority | Category | Files | Strings (Est.) | Status |
|----------|----------|-------|----------------|--------|
| HIGH | Forms & Editors | 5 | ~280 | COMPLETED |
| MEDIUM | Auth Components | 3 | ~80 | NOT NEEDED (components don't exist) |
| MEDIUM | Supporting Components | 4 | ~65 | COMPLETED |
| **TOTAL** | | **9** | **~345** | **COMPLETED** |

---

## HIGH PRIORITY - Forms & Editors

### 1. letter-editor-form.tsx
- **Path**: `apps/web/components/letter-editor-form.tsx`
- **Estimated Strings**: 100+
- **Status**: [x] COMPLETED
- **Namespace**: `forms.letterEditor`
- **Changes**: Added `useTranslations` hook, replaced all hardcoded strings

### 2. schedule-delivery-form.tsx
- **Path**: `apps/web/components/schedule-delivery-form.tsx`
- **Estimated Strings**: 50+
- **Status**: [x] COMPLETED
- **Namespace**: `forms.scheduleDelivery`, `letters.toasts.scheduleForm`
- **Changes**: Added `useTranslations` hooks, replaced all hardcoded strings

### 3. letter-draft-form.tsx
- **Path**: `apps/web/components/letter-draft-form.tsx`
- **Estimated Strings**: 50+
- **Status**: [x] COMPLETED
- **Namespace**: `forms.letterDraft`, `letters`
- **Changes**: Added `useTranslations` hooks, replaced all hardcoded strings, writing prompts localized

### 4. anonymous-letter-tryout.tsx
- **Path**: `apps/web/components/anonymous-letter-tryout.tsx`
- **Estimated Strings**: 50+
- **Status**: [x] COMPLETED
- **Namespace**: `forms.anonymousTryout`
- **Changes**: Added `useTranslations` hook, replaced all hardcoded strings including sign-up prompt, editor, fields, features, and writing prompts

### 5. dashboard-letter-editor.tsx
- **Path**: `apps/web/components/dashboard-letter-editor.tsx`
- **Estimated Strings**: 30+
- **Status**: [x] COMPLETED
- **Namespace**: `forms.dashboardEditor`
- **Changes**: Added `useTranslations` hook, replaced all toast messages and resume prompt UI

---

## MEDIUM PRIORITY - Auth Components

### 6. custom-sign-in.tsx
- **Path**: `apps/web/components/auth/custom-sign-in.tsx`
- **Status**: [N/A] COMPONENT DOES NOT EXIST
- **Notes**: Auth is handled by Clerk with built-in Turkish localization

### 7. custom-sign-up.tsx
- **Path**: `apps/web/components/auth/custom-sign-up.tsx`
- **Status**: [N/A] COMPONENT DOES NOT EXIST
- **Notes**: Auth is handled by Clerk with built-in Turkish localization

### 8. custom-reset-password.tsx
- **Path**: `apps/web/components/auth/custom-reset-password.tsx`
- **Status**: [N/A] COMPONENT DOES NOT EXIST
- **Notes**: Auth is handled by Clerk with built-in Turkish localization

---

## MEDIUM PRIORITY - Supporting Components

### 9. timezone-change-warning.tsx
- **Path**: `apps/web/components/timezone-change-warning.tsx`
- **Estimated Strings**: 15+
- **Status**: [x] COMPLETED
- **Namespace**: `components.timezoneWarning`
- **Changes**: Added `useTranslations` hook, replaced all hardcoded strings with rich text support for bold formatting

### 10. timezone-tooltip.tsx
- **Path**: `apps/web/components/timezone-tooltip.tsx`
- **Estimated Strings**: 15+
- **Status**: [x] COMPLETED
- **Namespace**: `components.timezoneTooltip`, `components.dstTooltip`
- **Changes**: Added `useTranslations` hooks to both `TimezoneTooltip` and `DSTTooltip` components

### 11. resume-draft-banner.tsx
- **Path**: `apps/web/components/resume-draft-banner.tsx`
- **Estimated Strings**: 10+
- **Status**: [x] COMPLETED
- **Namespace**: `components.resumeDraftBanner`
- **Changes**: Added `useTranslations` hook, replaced all hardcoded strings

### 12. delivery-error-card.tsx
- **Path**: `apps/web/components/delivery-error-card.tsx`
- **Estimated Strings**: 25+
- **Status**: [x] COMPLETED
- **Namespace**: `components.deliveryError`
- **Changes**: Added `useTranslations` hook, replaced error categories, attempt count, action buttons, and toast messages

---

## Implementation Summary

### Message Files Created/Updated
- `apps/web/messages/en/forms.json` - English form translations
- `apps/web/messages/tr/forms.json` - Turkish form translations
- `apps/web/messages/en/components.json` - English component translations
- `apps/web/messages/tr/components.json` - Turkish component translations
- `apps/web/messages/en/index.ts` - Updated to export forms and components
- `apps/web/messages/tr/index.ts` - Updated to export forms and components

### Namespace Structure
```
forms:
  letterEditor: { recipient, title, content, delivery, datePresets, datePicker, submit, clear }
  scheduleDelivery: { preview, options, method, sendTo, when, arrival, actions }
  letterDraft: { title, description, titleField, bodyField, status, actions, prompts }
  anonymousTryout: { signUpPrompt, editor, fields, actions, features, prompts }
  dashboardEditor: { resumePrompt, toasts }

components:
  timezoneWarning: { title, detected, explanation, updateButton, dismissButton }
  timezoneTooltip: { ariaLabel, yourTimezone, currentlyDST }
  dstTooltip: { ariaLabel, title, explanation, example, tip }
  resumeDraftBanner: { title, description, resume, startFresh }
  deliveryError: { title, categories, attemptCount, actions, toasts }
```

---

## Progress Log

| Date | File | Status |
|------|------|--------|
| 2024-11-24 | forms.json (EN/TR) | COMPLETED |
| 2024-11-24 | components.json (EN/TR) | COMPLETED |
| 2024-11-24 | letter-editor-form.tsx | COMPLETED |
| 2024-11-24 | schedule-delivery-form.tsx | COMPLETED |
| 2024-11-24 | letter-draft-form.tsx | COMPLETED |
| 2024-11-24 | anonymous-letter-tryout.tsx | COMPLETED |
| 2024-11-24 | dashboard-letter-editor.tsx | COMPLETED |
| 2024-11-24 | timezone-change-warning.tsx | COMPLETED |
| 2024-11-24 | timezone-tooltip.tsx | COMPLETED |
| 2024-11-24 | resume-draft-banner.tsx | COMPLETED |
| 2024-11-24 | delivery-error-card.tsx | COMPLETED |

---

## Notes

- Used informal "sen" form for Turkish (not formal "siz")
- Technical terms like "Pro", "Email" kept where appropriate
- Maintained consistent tone with existing Turkish translations
- Date/time formatting handled via `next-intl` formatters
- Auth components not needed - Clerk handles Turkish localization natively via `trTR` locale
