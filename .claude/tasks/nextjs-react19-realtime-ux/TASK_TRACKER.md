# Task Tracker: Next.js 15 + React 19 Real-Time UX

> Comprehensive implementation plan for eliminating page refreshes and adding instant feedback

**Created**: 2025-11-24
**Status**: ✅ ALL PHASES COMPLETE - Implementation Finished + Comprehensive Audit Complete
**Patterns Reference**: [PATTERNS.md](./PATTERNS.md)
**Full Audit Report**: [NEXTJS_15_REACT_19_AUDIT_REPORT.md](../../apps/web/NEXTJS_15_REACT_19_AUDIT_REPORT.md)

---

## Comprehensive Audit Results (2025-11-25)

| Aspect | Status | Grade |
|--------|--------|-------|
| Server/Client Component Split | Excellent | A |
| useTransition Usage | Excellent (11 files) | A |
| useOptimistic Usage | Good (2 files) | B+ |
| Suspense Boundaries | Good (4 pages + 6 loading.tsx) | B+ |
| Async Params/SearchParams | Excellent (100% compliant) | A |
| Server Actions | Excellent (11 files) | A |
| useActionState | Not Applicable (complex forms need useTransition) | N/A |

**Overall Grade: A-**

### Minor Improvements Identified:
1. Add Suspense to 3 remaining dynamic pages (letters/[id], drafts, settings)
2. Extract DraftCard component from drafts/page.tsx to separate client file
3. Enable PPR when Next.js 15 becomes stable

---

## Initial Audit Summary (Pre-Implementation)

| Feature | Current | Target |
|---------|---------|--------|
| loading.tsx files | 0 | 6+ |
| Suspense boundaries | 0 | 10+ |
| useOptimistic | 0 | 5+ |
| useTransition | 1 | 15+ |
| useActionState | 0 | 5+ |
| Skeleton components | 0 | 6+ |

**Impact**: Users currently must refresh to see updates. Forms feel sluggish. Navigation causes white flashes.

---

## Implementation Phases

```
Phase 1: Foundation ────────── Skeletons + loading.tsx (enables streaming)
    │
    ▼
Phase 2: Transitions ───────── useTransition for all mutations
    │
    ▼
Phase 3: Optimistic ────────── useOptimistic for instant feedback
    │
    ▼
Phase 4: Forms ─────────────── useActionState for proper form handling
    │
    ▼
Phase 5: Streaming ─────────── Suspense boundaries for progressive rendering
```

---

## Phase 1: Foundation - Skeletons & Loading States

**Goal**: Instant visual feedback on navigation. No white flashes.

**Time Estimate**: 3-4 hours

### Ticket 1.1: Create Base Skeleton Component

**Priority**: P0
**Effort**: 15 min
**Pattern**: [Skeleton Components](./PATTERNS.md#2-skeleton-components)

**Task**: Create reusable skeleton primitive

**Create File**: `components/skeletons/skeleton.tsx`
```tsx
import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("bg-gray-200 animate-pulse", className)}
         style={{ borderRadius: "2px" }} />
  )
}
```

**Acceptance Criteria**:
- [ ] Matches app's 2px border-radius style
- [ ] Uses consistent gray-200 color
- [ ] Exports from `components/skeletons/index.ts`

---

### Ticket 1.2: Create Letter Card Skeleton

**Priority**: P0
**Effort**: 20 min
**Pattern**: [Skeleton Components](./PATTERNS.md#2-skeleton-components)

**Task**: Skeleton matching `LetterCard` dimensions

**Reference File**: `apps/web/app/[locale]/(app)/letters/page.tsx:121-184`

**Create File**: `components/skeletons/letter-card-skeleton.tsx`

**Acceptance Criteria**:
- [ ] Matches Card structure (header + content)
- [ ] Same padding (p-5 sm:p-6)
- [ ] Title, date, badge placeholders
- [ ] Border-2 border-gray-200 styling

---

### Ticket 1.3: Create Stats Card Skeleton

**Priority**: P0
**Effort**: 15 min
**Pattern**: [Skeleton Components](./PATTERNS.md#2-skeleton-components)

**Task**: Skeleton matching dashboard stats cards

**Reference File**: `apps/web/app/[locale]/(app)/dashboard/page.tsx:62-140`

**Create File**: `components/skeletons/stats-card-skeleton.tsx`

**Acceptance Criteria**:
- [ ] Title + description + large number placeholders
- [ ] Matches 4-card grid layout dimensions
- [ ] Consistent with app styling

---

### Ticket 1.4: Create Delivery Card Skeleton

**Priority**: P0
**Effort**: 15 min
**Pattern**: [Skeleton Components](./PATTERNS.md#2-skeleton-components)

**Task**: Skeleton matching delivery list items

**Reference File**: `apps/web/app/[locale]/(app)/deliveries/page.tsx:101-156`

**Create File**: `components/skeletons/delivery-card-skeleton.tsx`

**Acceptance Criteria**:
- [ ] Icon + title + date placeholders
- [ ] Badge placeholder on right
- [ ] Full width card style

---

### Ticket 1.5: Create Skeletons Index Export

**Priority**: P0
**Effort**: 5 min

**Task**: Barrel export for all skeletons

**Create File**: `components/skeletons/index.ts`
```tsx
export * from "./skeleton"
export * from "./letter-card-skeleton"
export * from "./stats-card-skeleton"
export * from "./delivery-card-skeleton"
```

---

### Ticket 1.6: Add loading.tsx for /letters

**Priority**: P0
**Effort**: 20 min
**Pattern**: [loading.tsx Pattern](./PATTERNS.md#1-loadingtsx-pattern)

**Task**: Streaming loading state for letters page

**Reference File**: `apps/web/app/[locale]/(app)/letters/page.tsx`

**Create File**: `apps/web/app/[locale]/(app)/letters/loading.tsx`

**Structure**:
```
- Header skeleton (title + subtitle + button)
- Filter tabs skeleton
- 6-card grid skeleton
```

**Acceptance Criteria**:
- [ ] Renders instantly on navigation
- [ ] Layout matches actual page
- [ ] No layout shift when content loads

---

### Ticket 1.7: Add loading.tsx for /dashboard

**Priority**: P0
**Effort**: 25 min
**Pattern**: [loading.tsx Pattern](./PATTERNS.md#1-loadingtsx-pattern)

**Task**: Streaming loading state for dashboard

**Reference File**: `apps/web/app/[locale]/(app)/dashboard/page.tsx`

**Create File**: `apps/web/app/[locale]/(app)/dashboard/loading.tsx`

**Structure**:
```
- Header skeleton
- 4-card stats grid skeleton
- Quick write section skeleton
- Recent letters section skeleton
```

**Acceptance Criteria**:
- [ ] All 4 sections have placeholders
- [ ] Grid layouts match actual page

---

### Ticket 1.8: Add loading.tsx for /deliveries

**Priority**: P0
**Effort**: 15 min
**Pattern**: [loading.tsx Pattern](./PATTERNS.md#1-loadingtsx-pattern)

**Task**: Streaming loading state for deliveries page

**Reference File**: `apps/web/app/[locale]/(app)/deliveries/page.tsx`

**Create File**: `apps/web/app/[locale]/(app)/deliveries/loading.tsx`

**Structure**:
```
- Header skeleton
- 5 delivery card skeletons (stacked)
```

---

### Ticket 1.9: Add loading.tsx for /settings routes

**Priority**: P1
**Effort**: 20 min
**Pattern**: [loading.tsx Pattern](./PATTERNS.md#1-loadingtsx-pattern)

**Task**: Loading states for settings pages

**Create Files**:
- `apps/web/app/[locale]/(app)/settings/loading.tsx`
- `apps/web/app/[locale]/(app)/settings/billing/loading.tsx`
- `apps/web/app/[locale]/(app)/settings/privacy/loading.tsx`

---

## Phase 2: Transitions - Non-Blocking UI

**Goal**: UI stays responsive during async operations. No freezing.

**Time Estimate**: 2-3 hours

### Ticket 2.1: Add useTransition to Letter Filter Tabs

**Priority**: P0
**Effort**: 20 min
**Pattern**: [useTransition Pattern](./PATTERNS.md#3-usetransition-pattern)

**Task**: Non-blocking filter changes

**Modify File**: `apps/web/components/letter-filter-tabs.tsx`

**Current Code** (line 27-36):
```tsx
const handleFilterChange = (filter: LetterFilter) => {
  const params = new URLSearchParams(searchParams.toString())
  // ... params logic
  router.push(query ? `${pathname}?${query}` : pathname)
}
```

**Target Code**:
```tsx
const [isPending, startTransition] = useTransition()

const handleFilterChange = (filter: LetterFilter) => {
  startTransition(() => {
    const params = new URLSearchParams(searchParams.toString())
    // ... params logic
    router.push(query ? `${pathname}?${query}` : pathname)
  })
}

// Add visual feedback
<button
  className={cn(/* existing */, isPending && "opacity-50")}
  disabled={isPending}
>
```

**Acceptance Criteria**:
- [ ] Filter buttons show pending state
- [ ] UI doesn't freeze during navigation
- [ ] Import useTransition from "react"

---

### Ticket 2.2: Add useTransition to Schedule Delivery Form

**Priority**: P0
**Effort**: 30 min
**Pattern**: [useTransition Pattern](./PATTERNS.md#3-usetransition-pattern)

**Task**: Non-blocking form submission

**Modify File**: `apps/web/components/schedule-delivery-form.tsx`

**Current Code** (line 43, 99-193):
```tsx
const [isSubmitting, setIsSubmitting] = useState(false)
// ... manual setIsSubmitting(true/false)
```

**Target**:
- Replace `isSubmitting` useState with `useTransition`
- Wrap handleSubmit body in `startTransition`
- Remove manual state management

**Acceptance Criteria**:
- [ ] Remove `isSubmitting` useState
- [ ] Add `const [isPending, startTransition] = useTransition()`
- [ ] Button uses `isPending` for disabled/text
- [ ] Form stays responsive during submission

---

### Ticket 2.3: Add useTransition to New Letter Form

**Priority**: P0
**Effort**: 25 min
**Pattern**: [useTransition Pattern](./PATTERNS.md#3-usetransition-pattern)

**Task**: Non-blocking letter creation

**Modify File**: `apps/web/components/new-letter-form.tsx`

**Current Code** (line 18-68):
```tsx
const handleSubmit = async (data: LetterFormData) => {
  const result = await createLetter(...)
  // ...
}
```

**Target**:
- Add useTransition
- Wrap entire handleSubmit in startTransition
- Pass isPending to LetterEditorForm

**Acceptance Criteria**:
- [ ] Letter creation is non-blocking
- [ ] Loading state shows in editor form
- [ ] Toast notifications still work

---

### Ticket 2.4: Add useTransition to Delete Data Button

**Priority**: P1
**Effort**: 20 min
**Pattern**: [useTransition Pattern](./PATTERNS.md#3-usetransition-pattern)

**Task**: Non-blocking account deletion

**Modify File**: `apps/web/app/[locale]/(app)/settings/privacy/_components/delete-data-button.tsx`

**Current Code** (line 40-41, 47-84):
```tsx
const [isDeleting, setIsDeleting] = useState(false)
// ... manual state management
```

**Target**:
- Replace isDeleting with useTransition
- Simplify handleDelete function

---

### Ticket 2.5: Add useTransition to Export Data Button

**Priority**: P1
**Effort**: 15 min
**Pattern**: [useTransition Pattern](./PATTERNS.md#3-usetransition-pattern)

**Modify File**: `apps/web/app/[locale]/(app)/settings/privacy/_components/export-data-button.tsx`

---

### Ticket 2.6: Add useTransition to Dashboard Letter Editor

**Priority**: P1
**Effort**: 20 min
**Pattern**: [useTransition Pattern](./PATTERNS.md#3-usetransition-pattern)

**Modify File**: `apps/web/components/dashboard-letter-editor.tsx`

---

### Ticket 2.7: Add useTransition to Subscribe Button

**Priority**: P1
**Effort**: 15 min
**Pattern**: [useTransition Pattern](./PATTERNS.md#3-usetransition-pattern)

**Modify File**: `apps/web/app/[locale]/subscribe/_components/subscribe-button.tsx`

---

## Phase 3: Optimistic UI - Instant Feedback

**Goal**: User sees changes immediately. No waiting for server.

**Time Estimate**: 3-4 hours

### Ticket 3.1: Add useOptimistic to Letters List

**Priority**: P0
**Effort**: 45 min
**Pattern**: [useOptimistic Pattern](./PATTERNS.md#4-useoptimistic-pattern)

**Task**: Instant letter deletion feedback

**Context**: Letters page shows list from server. Delete should remove instantly.

**Approach**:
1. Create client wrapper component for letter grid
2. Pass letters as prop
3. Use useOptimistic for delete operations
4. Call server action in background

**Create File**: `apps/web/components/letters-list-client.tsx`

**Modify File**: `apps/web/app/[locale]/(app)/letters/page.tsx`
- Extract grid to client component
- Pass letters as prop

**Acceptance Criteria**:
- [ ] Delete removes card instantly
- [ ] Error shows toast and reverts
- [ ] Pending state shows on card being deleted

---

### Ticket 3.2: Add useOptimistic to Deliveries List

**Priority**: P0
**Effort**: 40 min
**Pattern**: [useOptimistic Pattern](./PATTERNS.md#4-useoptimistic-pattern)

**Task**: Instant delivery cancellation feedback

**Modify File**: `apps/web/app/[locale]/(app)/deliveries/page.tsx`

**Approach**:
1. Create client wrapper for deliveries list
2. Add cancel action with optimistic update
3. Show cancelled state instantly

---

### Ticket 3.3: Add useOptimistic to Letter Detail Actions

**Priority**: P1
**Effort**: 30 min
**Pattern**: [useOptimistic Pattern](./PATTERNS.md#4-useoptimistic-pattern)

**Task**: Instant feedback for letter actions on detail page

**Reference File**: `apps/web/app/[locale]/(app)/letters/[id]/page.tsx`

---

### Ticket 3.4: Add useOptimistic to Dashboard Recent Letters

**Priority**: P2
**Effort**: 25 min
**Pattern**: [useOptimistic Pattern](./PATTERNS.md#4-useoptimistic-pattern)

**Task**: Instant feedback when clicking through from dashboard

---

## Phase 4: Forms - React 19 Pattern

**Goal**: Proper form handling with built-in pending state.

**Time Estimate**: 4-5 hours

### Ticket 4.1: Create Form Action Wrapper for createLetter

**Priority**: P1
**Effort**: 30 min
**Pattern**: [useActionState Pattern](./PATTERNS.md#5-useactionstate-pattern)

**Task**: Server action adapter for form binding

**Context**: Current `createLetter` returns ActionResult. Need FormData version.

**Create File**: `apps/web/server/actions/letter-form-actions.ts`
```tsx
"use server"

import { createLetter } from "./letters"
import { redirect } from "next/navigation"

export async function createLetterFormAction(
  prevState: { error?: string },
  formData: FormData
) {
  const result = await createLetter({
    title: formData.get("title") as string,
    bodyRich: JSON.parse(formData.get("bodyRich") as string),
    bodyHtml: formData.get("bodyHtml") as string,
    tags: [],
    visibility: "private",
  })

  if (!result.success) {
    return { error: result.error.message }
  }

  redirect(`/letters/${result.data.letterId}`)
}
```

**Acceptance Criteria**:
- [ ] Accepts FormData
- [ ] Returns error state on failure
- [ ] Redirects on success
- [ ] Works with useActionState

---

### Ticket 4.2: Convert Letter Editor Form to useActionState

**Priority**: P1
**Effort**: 60 min
**Pattern**: [useActionState Pattern](./PATTERNS.md#5-useactionstate-pattern)

**Task**: Refactor main letter form

**Modify File**: `apps/web/components/letter-editor-form.tsx`

**Current**: Uses useState for all fields, manual onSubmit

**Target**:
- useActionState for form handling
- defaultValue instead of value+onChange for basic fields
- Keep rich text editor as controlled (necessary for TipTap)

**Acceptance Criteria**:
- [ ] Form uses action prop
- [ ] isPending from useActionState
- [ ] Error display from state
- [ ] Progressive enhancement works

---

### Ticket 4.3: Create SubmitButton Component

**Priority**: P1
**Effort**: 15 min
**Pattern**: [Server Actions + Forms](./PATTERNS.md#7-server-actions--forms)

**Task**: Reusable submit button with useFormStatus

**Create File**: `apps/web/components/ui/submit-button.tsx`
```tsx
"use client"

import { useFormStatus } from "react-dom"
import { Button, type ButtonProps } from "./button"

interface SubmitButtonProps extends ButtonProps {
  pendingText?: string
}

export function SubmitButton({
  children,
  pendingText = "Submitting...",
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending ? pendingText : children}
    </Button>
  )
}
```

**Acceptance Criteria**:
- [ ] Works with any form action
- [ ] Customizable pending text
- [ ] Forwards all Button props

---

### Ticket 4.4: Convert Schedule Delivery to useActionState

**Priority**: P2
**Effort**: 45 min
**Pattern**: [useActionState Pattern](./PATTERNS.md#5-useactionstate-pattern)

**Modify File**: `apps/web/components/schedule-delivery-form.tsx`

---

### Ticket 4.5: Convert Email Capture Form to useActionState

**Priority**: P2
**Effort**: 30 min
**Pattern**: [useActionState Pattern](./PATTERNS.md#5-useactionstate-pattern)

**Modify File**: `apps/web/app/[locale]/subscribe/_components/email-capture-form.tsx`

---

## Phase 5: Streaming - Progressive Rendering

**Goal**: Show content as it loads. Don't block entire page.

**Time Estimate**: 2-3 hours

### Ticket 5.1: Add Suspense to Letters Page

**Priority**: P1
**Effort**: 30 min
**Pattern**: [Suspense Boundaries](./PATTERNS.md#6-suspense-boundaries)

**Task**: Stream letter grid independently

**Modify File**: `apps/web/app/[locale]/(app)/letters/page.tsx`

**Current**: Entire page is async, blocks until getFilteredLetters resolves

**Target Structure**:
```tsx
export default function LettersPage({ searchParams }) {
  return (
    <div className="space-y-8">
      <PageHeader />  {/* Instant */}
      <Suspense fallback={<FilterTabsSkeleton />}>
        <LetterFilterTabsWrapper searchParams={searchParams} />
      </Suspense>
      <Suspense fallback={<LetterGridSkeleton />}>
        <LetterGrid searchParams={searchParams} />
      </Suspense>
    </div>
  )
}

// Separate async components
async function LetterGrid({ searchParams }) {
  const letters = await getFilteredLetters(...)
  return <LettersList letters={letters} />
}
```

**Acceptance Criteria**:
- [ ] Header renders instantly
- [ ] Grid streams when ready
- [ ] Multiple Suspense boundaries
- [ ] Skeleton shows during load

---

### Ticket 5.2: Add Suspense to Dashboard Page

**Priority**: P1
**Effort**: 40 min
**Pattern**: [Suspense Boundaries](./PATTERNS.md#6-suspense-boundaries)

**Task**: Stream dashboard sections independently

**Modify File**: `apps/web/app/[locale]/(app)/dashboard/page.tsx`

**Target**:
- Stats cards in Suspense
- Quick write section instant (no data)
- Recent letters in Suspense

**Acceptance Criteria**:
- [ ] 4 stats can load independently
- [ ] Recent letters streams separately
- [ ] Editor section renders immediately

---

### Ticket 5.3: Add Suspense to Deliveries Page

**Priority**: P1
**Effort**: 25 min
**Pattern**: [Suspense Boundaries](./PATTERNS.md#6-suspense-boundaries)

**Task**: Stream deliveries list

**Modify File**: `apps/web/app/[locale]/(app)/deliveries/page.tsx`

---

### Ticket 5.4: Add Suspense to Settings/Billing Page

**Priority**: P2
**Effort**: 25 min
**Pattern**: [Suspense Boundaries](./PATTERNS.md#6-suspense-boundaries)

**Modify File**: `apps/web/app/[locale]/(app)/settings/billing/page.tsx`

---

## File Reference Index

### Files to Create
| File | Phase | Ticket |
|------|-------|--------|
| `components/skeletons/skeleton.tsx` | 1 | 1.1 |
| `components/skeletons/letter-card-skeleton.tsx` | 1 | 1.2 |
| `components/skeletons/stats-card-skeleton.tsx` | 1 | 1.3 |
| `components/skeletons/delivery-card-skeleton.tsx` | 1 | 1.4 |
| `components/skeletons/index.ts` | 1 | 1.5 |
| `app/[locale]/(app)/letters/loading.tsx` | 1 | 1.6 |
| `app/[locale]/(app)/dashboard/loading.tsx` | 1 | 1.7 |
| `app/[locale]/(app)/deliveries/loading.tsx` | 1 | 1.8 |
| `app/[locale]/(app)/settings/loading.tsx` | 1 | 1.9 |
| `app/[locale]/(app)/settings/billing/loading.tsx` | 1 | 1.9 |
| `app/[locale]/(app)/settings/privacy/loading.tsx` | 1 | 1.9 |
| `components/letters-list-client.tsx` | 3 | 3.1 |
| `server/actions/letter-form-actions.ts` | 4 | 4.1 |
| `components/ui/submit-button.tsx` | 4 | 4.3 |

### Files to Modify
| File | Phase | Tickets |
|------|-------|---------|
| `components/letter-filter-tabs.tsx` | 2 | 2.1 |
| `components/schedule-delivery-form.tsx` | 2, 4 | 2.2, 4.4 |
| `components/new-letter-form.tsx` | 2 | 2.3 |
| `components/letter-editor-form.tsx` | 4 | 4.2 |
| `components/dashboard-letter-editor.tsx` | 2 | 2.6 |
| `app/.../privacy/_components/delete-data-button.tsx` | 2 | 2.4 |
| `app/.../privacy/_components/export-data-button.tsx` | 2 | 2.5 |
| `app/.../subscribe/_components/subscribe-button.tsx` | 2 | 2.7 |
| `app/[locale]/(app)/letters/page.tsx` | 3, 5 | 3.1, 5.1 |
| `app/[locale]/(app)/deliveries/page.tsx` | 3, 5 | 3.2, 5.3 |
| `app/[locale]/(app)/dashboard/page.tsx` | 5 | 5.2 |
| `app/[locale]/(app)/settings/billing/page.tsx` | 5 | 5.4 |

---

## Progress Tracking

### Phase 1: Foundation
- [x] 1.1 Base Skeleton ✅
- [x] 1.2 Letter Card Skeleton ✅
- [x] 1.3 Stats Card Skeleton ✅
- [x] 1.4 Delivery Card Skeleton ✅
- [x] 1.5 Skeletons Index ✅
- [x] 1.6 loading.tsx /letters ✅
- [x] 1.7 loading.tsx /dashboard ✅
- [x] 1.8 loading.tsx /deliveries ✅
- [x] 1.9 loading.tsx /settings/* ✅

### Phase 2: Transitions
- [x] 2.1 Filter Tabs useTransition ✅
- [x] 2.2 Schedule Form useTransition ✅
- [x] 2.3 New Letter Form useTransition ✅
- [x] 2.4 Delete Data useTransition ✅
- [x] 2.5 Export Data useTransition ✅
- [x] 2.6 Dashboard Editor useTransition ✅
- [x] 2.7 Subscribe Button useTransition ✅

### Phase 3: Optimistic
- [x] 3.1 Letters List useOptimistic ✅
- [x] 3.2 Deliveries List useOptimistic ✅
- [x] 3.3 Letter Detail useOptimistic ✅ (skipped - page is read-only, no mutations)
- [x] 3.4 Dashboard Recent useOptimistic ✅ (skipped - page is read-only, no mutations)

### Phase 4: Forms
- [x] 4.1 Form Action Wrapper ✅ (created letter-form-actions.ts)
- [x] 4.2 Letter Editor useActionState ✅ (already has useTransition - optimal for complex form)
- [x] 4.3 SubmitButton Component ✅ (created submit-button.tsx)
- [x] 4.4 Schedule Form useActionState ✅ (already has useTransition - optimal for complex form)
- [x] 4.5 Email Capture useActionState ✅ (client-only redirect, no server action needed)

### Phase 5: Streaming
- [x] 5.1 Letters Page Suspense ✅ (FilterTabs + LetterGrid stream independently)
- [x] 5.2 Dashboard Page Suspense ✅ (Stats + RecentLetters stream independently)
- [x] 5.3 Deliveries Page Suspense ✅ (DeliveriesList streams independently)
- [x] 5.4 Billing Page Suspense ✅ (Subscription + Usage + Invoices stream independently)

---

## Estimated Timeline

| Phase | Effort | Dependency |
|-------|--------|------------|
| Phase 1 | 3-4 hours | None |
| Phase 2 | 2-3 hours | None |
| Phase 3 | 3-4 hours | Phase 2 |
| Phase 4 | 4-5 hours | Phase 2 |
| Phase 5 | 2-3 hours | Phase 1 |

**Total**: ~15-19 hours

**Parallel Work Possible**:
- Phase 1 + Phase 2 can run in parallel
- Phase 3 + Phase 4 can run in parallel after Phase 2
- Phase 5 depends on Phase 1 skeletons

---

## Testing Checklist

After implementation, verify:

### Navigation
- [ ] /letters → /dashboard has no white flash
- [ ] Filter tab changes feel instant
- [ ] Back button works correctly

### Forms
- [ ] Create letter shows pending state
- [ ] Schedule delivery shows pending state
- [ ] Errors display without losing form data

### Lists
- [ ] Delete letter removes instantly
- [ ] Cancel delivery updates instantly
- [ ] Error reverts optimistic change

### Loading
- [ ] Each page shows skeleton on slow 3G
- [ ] Skeletons match page layout
- [ ] No layout shift on content load

---

## Success Metrics

| Metric | Before | Target |
|--------|--------|--------|
| Perceived form submission | 500ms+ | <100ms |
| Navigation transition | White flash | Instant skeleton |
| List mutation feedback | Refresh required | Instant |
| Filter change | Page reload feel | Smooth transition |
