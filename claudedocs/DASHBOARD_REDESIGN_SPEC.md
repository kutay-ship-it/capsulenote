# Capsule Note: Dashboard Redesign Specification

**Version**: 1.0
**Status**: Proposed
**Design Philosophy**: Anticipation Engine (not Control Panel)

---

## Executive Summary

**Kill the dashboard. Letters ARE the home.**

Replace stats-heavy control panel with emotion-driven "anticipation engine" that answers:
1. "When does my next letter arrive?"
2. "What's my journey look like?"
3. "What should I write next?"

---

## Information Architecture Change

### Before
```
/dashboard (stats hub) ← DELETE
/letters (list)
/letters/[id] (detail)
/letters/new (create)
/settings
```

### After
```
/letters (home - list + hero + timeline) ← NEW DEFAULT
/letters/[id] (detail)
/letters/new (create)
/settings (accessed via icon)
```

**Redirect**: `/dashboard` → `/letters`

---

## Page Layout

### Full Page Structure

```
┌─────────────────────────────────────────────────────────┐
│ HEADER                                                  │
│ [Logo]          Your Letters         [+ Write]    [⚙️] │
├─────────────────────────────────────────────────────────┤
│ FILTER TABS                                             │
│  [All]    [Drafts (3)]    [Scheduled (5)]    [Sent]    │
├─────────────────────────────────────────────────────────┤
│ HERO SECTION (conditional)                              │
│ ┌─────────────────────────────────────────────────────┐ │
│ │         📬 Your next letter arrives in              │ │
│ │                   47 DAYS                           │ │
│ │            "Birthday Reflection"                    │ │
│ │         [Preview]    [Reschedule]                   │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ TIMELINE                                                │
│  YOUR JOURNEY                                           │
│ ──●────────●────────●────────○────────○──────          │
│  2023     2024     2025     2026     2027              │
├─────────────────────────────────────────────────────────┤
│ LETTERS GRID                                            │
│ ┌───────────┐  ┌───────────┐  ┌───────────┐           │
│ │ Letter 1  │  │ Letter 2  │  │ Letter 3  │           │
│ └───────────┘  └───────────┘  └───────────┘           │
├─────────────────────────────────────────────────────────┤
│ WRITE PROMPT BANNER                                     │
│      "What does future-you need to hear right now?"    │
│                  [Write a Letter →]                    │
└─────────────────────────────────────────────────────────┘
```

---

## Component Specifications

### 1. AppHeader (Simplified)

**Desktop (768px+)**
```
┌─────────────────────────────────────────────────────────┐
│ [Logo]          Your Letters         [+ Write]    [⚙️] │
└─────────────────────────────────────────────────────────┘
```

**Mobile (<768px)**
```
┌─────────────────────────────────────────────────────────┐
│ [Logo]                               [+ Write]    [☰]  │
└─────────────────────────────────────────────────────────┘
```

**File**: `components/layout/app-header.tsx`

```typescript
interface AppHeaderProps {
  user: {
    name: string
    email: string
    avatarUrl?: string
  }
}

// Behavior:
// - Logo links to /letters
// - "Your Letters" is decorative (or links to /letters)
// - Write button: primary, duck-blue, links to /letters/new
// - Settings icon: opens /settings
// - Mobile hamburger: reveals Letters, Settings links
```

**Styling (Brutalist)**:
- Height: 72px (down from 90px)
- Border-bottom: 2px solid charcoal
- Background: white
- Sticky position

---

### 2. FilterTabs

```
┌─────────────────────────────────────────────────────────┐
│  [All]    [Drafts (3)]    [Scheduled (5)]    [Sent]    │
└─────────────────────────────────────────────────────────┘
```

**File**: `apps/web/components/redesign/filter-tabs.tsx`

```typescript
interface FilterTabsProps {
  counts: {
    all: number
    drafts: number
    scheduled: number
    sent: number
  }
  activeFilter: 'all' | 'drafts' | 'scheduled' | 'sent'
  onFilterChange: (filter: string) => void
}
```

**Behavior**:
- URL-driven: `/letters?filter=drafts`
- Badge shows count (only for drafts, scheduled)
- Horizontal scroll on mobile (no wrapping)

**Styling**:
- Active: 2px bottom border (duck-blue), font-bold
- Inactive: text-muted, no border
- Hover: background duck-cream
- Gap: 32px between tabs
- Font: mono, 14px uppercase

---

### 3. NextDeliveryHero

**When Shown**: User has at least 1 scheduled delivery

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              📬 Your next letter arrives in             │
│                                                         │
│     ┌─────┐   ┌─────┐   ┌─────┐                        │
│     │  4  │ : │  7  │   │days │                        │
│     └─────┘   └─────┘   └─────┘                        │
│                                                         │
│              "Birthday Reflection"                      │
│              Written March 15, 2024                     │
│                                                         │
│         [Preview Letter]    [Reschedule]               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**File**: `components/dashboard/next-delivery-hero.tsx`

```typescript
interface NextDeliveryHeroProps {
  delivery: {
    id: string
    deliverAt: Date
    letter: {
      id: string
      title: string
      createdAt: Date
      bodyPreview: string // First 100 chars (decrypted)
    }
  }
}

// Computed:
// - daysUntil: number (from deliverAt)
// - formattedDate: string (localized)
```

**Countdown Logic**:
```typescript
// Show different units based on time remaining
if (daysUntil > 365) → "X years, Y months"
if (daysUntil > 30) → "X months, Y days"
if (daysUntil > 1) → "X days"
if (daysUntil === 1) → "Tomorrow"
if (daysUntil === 0) → "Today"
if (hoursUntil < 24) → "X hours"
```

**Styling**:
- Background: duck-cream (soft yellow)
- Border: 2px solid charcoal
- Padding: 48px
- Countdown boxes: 64px × 64px, 2px border, mono font 36px
- Title: 24px, font-semibold
- Subtitle: 14px, text-muted
- Buttons: ghost variant, 16px gap

**Mobile**:
- Padding: 24px
- Countdown boxes: 48px × 48px, font 24px
- Stack buttons vertically

---

### 4. EmptyStateHero

**When Shown**: User has 0 letters

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                        ✉️                               │
│                                                         │
│         Your first letter is waiting to be written     │
│                                                         │
│    What would you tell yourself one year from now?     │
│                                                         │
│              [Write Your First Letter →]               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**File**: `components/dashboard/empty-state-hero.tsx`

```typescript
// No props - static content
// Prompt can rotate from predefined list

const prompts = [
  "What would you tell yourself one year from now?",
  "What do you want to remember about today?",
  "What advice would help future-you?",
  "What are you grateful for right now?",
]
```

**Styling**:
- Background: white with subtle gradient or duck-cream
- Icon: 48px, centered
- Heading: 28px, font-semibold
- Prompt: 18px, text-muted, italic
- Button: primary, large size
- Padding: 64px vertical

---

### 5. DeliveryTimeline

```
┌─────────────────────────────────────────────────────────┐
│  YOUR JOURNEY                                           │
│                                                         │
│  2023        2024        2025        2026        2027  │
│    │           │           │           │           │   │
│    ●───────────●───────────●───────────○───────────○   │
│    │           │           │           │           │   │
│  "New Year"  "Bday"    "Career"    "Wedding"   "Baby" │
│   ✓ sent     ✓ sent    ✓ sent      waiting    waiting │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**File**: `components/dashboard/delivery-timeline.tsx`

```typescript
interface DeliveryTimelineProps {
  deliveries: Array<{
    id: string
    deliverAt: Date
    status: 'sent' | 'scheduled' | 'failed'
    letter: {
      id: string
      title: string
    }
  }>
}

// When Shown: User has 2+ deliveries (sent or scheduled)
// Hidden: 0-1 deliveries (not enough for timeline)
```

**Visual Logic**:
```typescript
// Calculate timeline span
const minYear = min(deliveries.map(d => d.deliverAt.getFullYear()))
const maxYear = max(deliveries.map(d => d.deliverAt.getFullYear()))
const spanYears = maxYear - minYear + 1

// Position each delivery on timeline
deliveries.forEach(d => {
  const position = (d.deliverAt - minDate) / (maxDate - minDate) * 100
})
```

**Node Styling**:
- Sent: ● filled circle (green or duck-blue)
- Scheduled: ○ empty circle (charcoal outline)
- Failed: ● filled circle (red) with ! icon

**Interaction**:
- Hover: Show tooltip with title + date
- Click: Navigate to `/letters/[id]`
- Touch: Tap to select, second tap to navigate

**Responsive**:
- Desktop: Full width, all years visible
- Mobile: Horizontal scroll, snap to years
- Minimum width per year: 120px

---

### 6. LetterCard (Redesigned)

```
┌─────────────────────────────────────────┐
│ ▌                                       │  ← Status color bar
│ ▌ "Birthday Reflection"                 │
│ ▌                                       │
│ ▌ First two lines of the letter         │
│ ▌ preview text continues here...        │
│ ▌                                       │
│ ▌ ┌─────────────┐                       │
│ ▌ │ 📬 47 days  │   Written Mar 15      │
│ ▌ └─────────────┘                       │
│ ▌                                       │
└─────────────────────────────────────────┘
```

**File**: `apps/web/components/redesign/letter-card.tsx`

```typescript
interface LetterCardProps {
  letter: {
    id: string
    title: string
    bodyPreview: string // First 100 chars
    createdAt: Date
    updatedAt: Date
  }
  delivery?: {
    status: 'scheduled' | 'sent' | 'failed'
    deliverAt: Date
    deliveredAt?: Date
  }
}

// Computed status:
// - No delivery = "draft"
// - delivery.status = "scheduled" | "sent" | "failed"
```

**Status Variants**:

| Status | Left Border | Badge | Badge Color | Action |
|--------|-------------|-------|-------------|--------|
| Draft | Yellow (duck-yellow) | "Draft" | Yellow bg | "Continue Writing" |
| Scheduled | Blue (duck-blue) | "47 days" | Blue bg | Click to view |
| Sent | Green (duck-green) | "Delivered" | Green bg | Click to view |
| Failed | Red (duck-red) | "Failed" | Red bg | "Retry" |

**Styling**:
- Border: 2px solid charcoal
- Border-left: 4px solid [status-color]
- Background: white
- Padding: 24px
- Hover: shadow-md + translate(-2px, -2px)
- Title: 18px, font-semibold, line-clamp-1
- Preview: 14px, text-muted, line-clamp-2
- Badge: inline-flex, px-3 py-1, rounded-sm, mono text

---

### 7. LetterGrid

**File**: `apps/web/components/redesign/letter-grid.tsx`

```typescript
interface LetterGridProps {
  letters: LetterCardProps[]
  isLoading?: boolean
}
```

**Layout**:
```css
.letter-grid {
  display: grid;
  gap: 24px;
  grid-template-columns: 1fr; /* mobile */
}

@media (min-width: 640px) {
  .letter-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .letter-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

**Loading State**: Show 6 skeleton cards matching card dimensions

---

### 8. WritePromptBanner

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│      "What does future-you need to hear right now?"    │
│                                                         │
│                  [Write a Letter →]                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**File**: `apps/web/components/redesign/write-prompt-banner.tsx`

```typescript
const prompts = [
  "What does future-you need to hear right now?",
  "What would you tell yourself in 5 years?",
  "What moment do you want to remember forever?",
  "What are you proud of today?",
  "What advice would help you next year?",
]

// Rotate prompt based on day of year
const promptIndex = new Date().getDayOfYear() % prompts.length
```

**Styling**:
- Background: duck-cream or subtle gradient
- Border: 2px solid charcoal (top only, or all sides)
- Padding: 48px
- Text: 20px, italic, text-center
- Button: primary, centered below text
- Margin-top: 48px (separation from grid)

---

### 9. FloatingWriteButton (Mobile Only)

```
        ┌─────┐
        │  ✏️ │  ← Fixed bottom-right
        └─────┘
```

**File**: `apps/web/components/redesign/floating-write-button.tsx`

```typescript
// Only render on mobile (<768px)
// Only show after scrolling past hero section
// Uses Intersection Observer to detect hero visibility

const [heroVisible, setHeroVisible] = useState(true)

// Show button when hero is NOT visible
const showButton = !heroVisible && isMobile
```

**Styling**:
- Position: fixed, bottom-6, right-6
- Size: 56px × 56px
- Background: duck-blue
- Border: 2px solid charcoal
- Shadow: hard shadow (4px 4px charcoal)
- Icon: ✏️ or + (24px, white)
- Z-index: 50

---

## Responsive Breakpoints

| Breakpoint | Width | Grid | Hero | Timeline |
|------------|-------|------|------|----------|
| Mobile | < 640px | 1 col | Compact | H-scroll |
| Tablet | 640-1023px | 2 col | Full | Full |
| Desktop | 1024px+ | 3 col | Full | Full |

---

## State Management

### URL State (Filter)
```
/letters              → All letters
/letters?filter=drafts    → Only drafts
/letters?filter=scheduled → Only scheduled
/letters?filter=sent      → Only sent
```

### Server State (React Query / SWR)
```typescript
// Fetch letters with filter
const { data: letters } = useLetters(filter)

// Fetch next delivery (separate query, cached)
const { data: nextDelivery } = useNextDelivery()

// Fetch timeline deliveries
const { data: timeline } = useDeliveryTimeline()
```

### Client State
```typescript
// Mobile menu open/close
const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

// Timeline hover state
const [hoveredDelivery, setHoveredDelivery] = useState<string | null>(null)
```

---

## Data Flow

```
Page Load (/letters)
    │
    ├─► Fetch letters (with filter)
    │       └─► Render LetterGrid
    │
    ├─► Fetch next scheduled delivery
    │       └─► Render NextDeliveryHero (or EmptyStateHero)
    │
    └─► Fetch all deliveries for timeline
            └─► Render DeliveryTimeline (if 2+ deliveries)
```

### Server Components vs Client Components

| Component | Type | Reason |
|-----------|------|--------|
| Page (`/letters/page.tsx`) | Server | Data fetching |
| AppHeader | Client | Mobile menu state |
| FilterTabs | Client | Active state, URL updates |
| NextDeliveryHero | Server | Static display |
| EmptyStateHero | Server | Static content |
| DeliveryTimeline | Client | Hover interactions |
| LetterGrid | Server | Just layout |
| LetterCard | Server | Static display |
| WritePromptBanner | Server | Static content |
| FloatingWriteButton | Client | Scroll detection |

---

## Animation Specifications

### Card Hover
```css
.letter-card {
  transition: transform 150ms ease, box-shadow 150ms ease;
}

.letter-card:hover {
  transform: translate(-2px, -2px);
  box-shadow: 4px 4px 0 var(--charcoal);
}
```

### Timeline Node Hover
```css
.timeline-node {
  transition: transform 150ms ease;
}

.timeline-node:hover {
  transform: scale(1.2);
}
```

### Countdown Update
```css
.countdown-number {
  transition: transform 200ms ease;
}

.countdown-number.updating {
  transform: scale(1.1);
}
```

---

## File Structure

```
apps/web/
├── app/
│   ├── dashboard/                 # KEEP - Don't modify
│   ├── letters/                   # KEEP - Don't modify
│   └── (redesign)/                # NEW - Route group for development
│       └── letters/
│           ├── page.tsx           # New letters home
│           └── loading.tsx        # Suspense fallback
│
├── components/
│   ├── dashboard/                 # KEEP - Existing components
│   ├── letters/                   # KEEP - Existing components
│   └── redesign/                  # NEW - All redesign components
│       ├── next-delivery-hero.tsx
│       ├── empty-state-hero.tsx
│       ├── delivery-timeline.tsx
│       ├── write-prompt-banner.tsx
│       ├── filter-tabs.tsx
│       ├── letter-card.tsx
│       ├── letter-grid.tsx
│       └── floating-write-button.tsx
```

---

## Migration Checklist

- [ ] Create new components (hero, timeline, filter tabs)
- [ ] Update `/letters/page.tsx` with new layout
- [ ] Add redirect from `/dashboard` to `/letters`
- [ ] Update navigation links in header
- [ ] Remove old dashboard stats components
- [ ] Update mobile navigation
- [ ] Add floating write button for mobile
- [ ] Test responsive breakpoints
- [ ] Update Clerk redirect after login to `/letters`
- [ ] Update empty state messaging

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Time to first action (write CTA click) | Unknown | < 10 seconds |
| Dashboard bounce rate | Unknown | < 20% |
| Letters started per session | Unknown | 0.3+ |
| Timeline engagement (hovers/clicks) | N/A | 40%+ |

---

## Visual Reference

### Desktop
```
┌─────────────────────────────────────────────────────────────────┐
│ [🕰️ Logo]          Your Letters           [+ Write]        [⚙️]│
├─────────────────────────────────────────────────────────────────┤
│    All        Drafts (3)      Scheduled (5)        Sent         │
│    ───                                                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              📬 Your next letter arrives in              │   │
│  │                                                          │   │
│  │         ┌────┐   ┌────┐   ┌──────┐                      │   │
│  │         │ 47 │   │    │   │ days │                      │   │
│  │         └────┘   └────┘   └──────┘                      │   │
│  │                                                          │   │
│  │              "Birthday Reflection"                       │   │
│  │              Written March 15, 2024                      │   │
│  │                                                          │   │
│  │          [Preview Letter]    [Reschedule]               │   │
│  └─────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  YOUR JOURNEY                                                   │
│                                                                 │
│  2023────────●────────2024────────●────────2025────────○────── │
│            "New Year"           "Birthday"          "Career"    │
│              ✓ sent               ✓ sent            waiting     │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │▌ New Year 2023  │ │▌ Birthday 2024  │ │▌ Career Goals   │   │
│  │▌                │ │▌                │ │▌                │   │
│  │▌ Preview text...│ │▌ Preview text...│ │▌ Preview text...│   │
│  │▌                │ │▌                │ │▌                │   │
│  │▌ ✓ Delivered    │ │▌ ✓ Delivered    │ │▌ ○ 47 days     │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│                                                                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │▌ Wedding Letter │ │▌ Draft: Untitled│ │▌ Baby Letter    │   │
│  │▌                │ │▌                │ │▌                │   │
│  │▌ Preview text...│ │▌ Preview text...│ │▌ Preview text...│   │
│  │▌                │ │▌                │ │▌                │   │
│  │▌ ○ 1 year      │ │▌ ⚠ Draft        │ │▌ ○ 2 years     │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│       "What does future-you need to hear right now?"           │
│                                                                 │
│                     [Write a Letter →]                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Mobile
```
┌───────────────────────────┐
│ [🕰️]          [+ ✏️] [☰] │
├───────────────────────────┤
│ All  Drafts  Sched  Sent │
│ ───                       │
├───────────────────────────┤
│ ┌───────────────────────┐ │
│ │  📬 Next letter in    │ │
│ │                       │ │
│ │    47 DAYS            │ │
│ │                       │ │
│ │  "Birthday Reflection"│ │
│ │                       │ │
│ │  [View] [Reschedule]  │ │
│ └───────────────────────┘ │
├───────────────────────────┤
│ YOUR JOURNEY    [scroll→] │
│ ●────●────○────○          │
├───────────────────────────┤
│ ┌───────────────────────┐ │
│ │▌ New Year 2023        │ │
│ │▌ Preview text here... │ │
│ │▌ ✓ Delivered          │ │
│ └───────────────────────┘ │
│ ┌───────────────────────┐ │
│ │▌ Birthday 2024        │ │
│ │▌ Preview text here... │ │
│ │▌ ○ 47 days           │ │
│ └───────────────────────┘ │
│                           │
│ "What does future-you..." │
│    [Write a Letter →]     │
│                           │
│                   ┌─────┐ │
│                   │  ✏️ │ │ ← Floating
│                   └─────┘ │
└───────────────────────────┘
```

---

## Engineering Tickets

### Development Strategy: Parallel Directory

**IMPORTANT**: Do NOT modify existing `/app/dashboard` or `/app/letters` pages.

Instead, build all new components in a parallel directory structure:

```
apps/web/
├── app/
│   ├── dashboard/          # KEEP - Don't touch
│   ├── letters/            # KEEP - Don't touch
│   └── (redesign)/         # NEW - Route group (parentheses = no URL segment)
│       └── letters/
│           ├── page.tsx    # New letters home at /letters (when swapped)
│           └── loading.tsx
│
├── components/
│   ├── dashboard/          # KEEP existing
│   └── redesign/           # NEW - All new components here
│       ├── next-delivery-hero.tsx
│       ├── empty-state-hero.tsx
│       ├── delivery-timeline.tsx
│       ├── write-prompt-banner.tsx
│       ├── filter-tabs.tsx
│       ├── letter-card.tsx
│       ├── letter-grid.tsx
│       └── floating-write-button.tsx
```

**Why Route Group `(redesign)`**:
- Parentheses in Next.js create a "route group" - organizes files without affecting URL
- Can be accessed at a test URL during development (see Testing below)
- When ready: simply move `(redesign)/letters/*` to replace `letters/*`

**Testing During Development**:
To preview the redesign before swapping, temporarily rename:
- `(redesign)` → `redesign` (removes parentheses)
- Access at: `http://localhost:3000/redesign/letters`
- When approved: move contents to replace `/letters`

**Final Swap Process** (after all tickets complete):
1. Backup: `mv app/letters app/letters-old`
2. Swap: `mv app/(redesign)/letters app/letters`
3. Redirect: Update `app/dashboard/page.tsx` to redirect to `/letters`
4. Cleanup: Delete `app/letters-old` and `app/(redesign)` after verification
5. Cleanup: Move `components/redesign/*` to `components/dashboard/` (or keep separate)

---

### Critical Context for Engineers

**Design System**: MotherDuck Brutalist (see `MOTHERDUCK_STYLEGUIDE.md`)
- 2px borders everywhere
- Hard shadows (no blur): `shadow-[4px_4px_0_theme(colors.charcoal)]`
- Colors: `duck-blue`, `duck-yellow`, `duck-cream`, `charcoal`
- Font: Monospace (`font-mono`)
- Hover effect: `translate(-2px, -2px)` + shadow

**Existing Patterns**: Check these files for patterns
- `apps/web/components/ui/` - shadcn components (already brutalist-styled)
- `apps/web/app/dashboard/` - current dashboard (being replaced)
- `apps/web/app/letters/` - current letters list

**Data Layer**:
- Letters: `apps/web/server/actions/letters.ts` - Server Actions for CRUD
- Deliveries: `apps/web/server/actions/deliveries.ts`
- Encryption: Letters are encrypted at rest. List views get `bodyPreview` (first 100 chars, decrypted server-side)

---

### TICKET-001: Server Actions for New Dashboard Data

**Priority**: P0 (Blocker for all UI tickets)
**Estimate**: 2-3 hours
**Type**: Backend

**Context**: New dashboard needs 3 data queries not currently available as Server Actions.

**Tasks**:

1. **Create `getNextDelivery()` Server Action**
   - File: `apps/web/server/actions/deliveries.ts`
   - Returns: Next scheduled delivery with letter title + preview
   - Query: `WHERE status = 'scheduled' AND deliverAt > NOW() ORDER BY deliverAt ASC LIMIT 1`
   - Include: Letter title, createdAt, first 100 chars of body (decrypted)
   - Handle: No scheduled deliveries → return null

2. **Create `getDeliveryTimeline()` Server Action**
   - File: `apps/web/server/actions/deliveries.ts`
   - Returns: All deliveries (sent + scheduled) for timeline
   - Query: `WHERE status IN ('sent', 'scheduled') ORDER BY deliverAt ASC`
   - Include: id, deliverAt, status, letter.id, letter.title
   - Note: Don't decrypt body (not needed for timeline)

3. **Create `getLetterCounts()` Server Action**
   - File: `apps/web/server/actions/letters.ts`
   - Returns: `{ all: number, drafts: number, scheduled: number, sent: number }`
   - Drafts = letters with no delivery
   - Scheduled = letters with delivery.status = 'scheduled'
   - Sent = letters with delivery.status = 'sent'

4. **Update `getLetters()` to support filtering**
   - Add optional `filter` param: `'all' | 'drafts' | 'scheduled' | 'sent'`
   - Include `bodyPreview` (first 100 chars) for card display

**Acceptance Criteria**:
- [ ] All actions return proper TypeScript types
- [ ] All actions handle empty states gracefully
- [ ] Decryption only happens where needed (bodyPreview)
- [ ] Actions are exported and usable from page components

---

### TICKET-002: NextDeliveryHero Component

**Priority**: P0
**Estimate**: 2-3 hours
**Type**: Frontend Component
**Depends On**: TICKET-001

**Context**: Hero section showing countdown to next delivery. THE most important visual element.

**File**: `apps/web/components/redesign/next-delivery-hero.tsx`

**Tasks**:

1. **Create component with props interface**:
   ```typescript
   interface NextDeliveryHeroProps {
     delivery: {
       id: string
       deliverAt: Date
       letter: { id: string; title: string; createdAt: Date }
     }
   }
   ```

2. **Implement countdown logic**:
   - Calculate days/months/years until delivery
   - Display rules:
     - `> 365 days` → "X years, Y months"
     - `> 30 days` → "X months, Y days"
     - `> 1 day` → "X days"
     - `= 1 day` → "Tomorrow"
     - `= 0 days` → "Today"
   - Use `date-fns` (already installed)

3. **Style per spec**:
   - Background: `bg-duck-cream`
   - Border: `border-2 border-charcoal`
   - Countdown boxes: 64x64px desktop, 48x48px mobile
   - Brutalist styling throughout

4. **Add action buttons**:
   - "Preview Letter" → Links to `/letters/[id]`
   - "Reschedule" → Links to `/letters/[id]/schedule`
   - Use `Button` from shadcn with `variant="ghost"`

5. **Mobile responsiveness**:
   - Stack buttons vertically on mobile
   - Smaller countdown boxes
   - Reduced padding

**Acceptance Criteria**:
- [ ] Countdown displays correctly for all time ranges
- [ ] Brutalist styling matches design system
- [ ] Responsive at all breakpoints
- [ ] Links work correctly
- [ ] Server Component (no client state needed)

---

### TICKET-003: EmptyStateHero Component

**Priority**: P1
**Estimate**: 1 hour
**Type**: Frontend Component

**Context**: Shown when user has 0 letters. First impression for new users.

**File**: `apps/web/components/redesign/empty-state-hero.tsx`

**Tasks**:

1. **Create static component** (no props):
   ```typescript
   const prompts = [
     "What would you tell yourself one year from now?",
     "What do you want to remember about today?",
     "What advice would help future-you?",
     "What are you grateful for right now?",
   ]
   // Rotate based on day of year
   const promptIndex = new Date().getDay() % prompts.length
   ```

2. **Style per spec**:
   - Centered layout with envelope icon (use Lucide `Mail` icon)
   - Heading: "Your first letter is waiting to be written"
   - Subtext: Rotating prompt (italic, muted)
   - CTA: "Write Your First Letter →" (primary button, large)

3. **Match brutalist design**:
   - Optional subtle background or border
   - Generous padding (64px vertical)

**Acceptance Criteria**:
- [ ] Prompt rotates daily
- [ ] CTA links to `/letters/new`
- [ ] Visually appealing empty state
- [ ] Server Component

---

### TICKET-004: DeliveryTimeline Component

**Priority**: P1
**Estimate**: 4-5 hours
**Type**: Frontend Component (Complex)
**Depends On**: TICKET-001

**Context**: Horizontal timeline showing user's letter journey through time. Client component due to hover interactions.

**File**: `apps/web/components/redesign/delivery-timeline.tsx`

**Tasks**:

1. **Create component with props**:
   ```typescript
   interface DeliveryTimelineProps {
     deliveries: Array<{
       id: string
       deliverAt: Date
       status: 'sent' | 'scheduled' | 'failed'
       letter: { id: string; title: string }
     }>
   }
   ```

2. **Implement timeline calculation**:
   - Calculate min/max years from deliveries
   - Position each node as percentage: `(date - minDate) / (maxDate - minDate) * 100`
   - Generate year markers for axis

3. **Render timeline visualization**:
   - Horizontal line with year markers
   - Nodes positioned along line:
     - Sent: Filled circle (duck-blue or green)
     - Scheduled: Empty circle (charcoal outline)
     - Failed: Red filled circle
   - Letter title below each node (truncated)

4. **Add interactions** (Client Component):
   - Hover: Show tooltip with full title + formatted date
   - Click: Navigate to `/letters/[id]`
   - Use `useState` for `hoveredDeliveryId`

5. **Mobile behavior**:
   - Horizontal scroll with `overflow-x-auto`
   - Minimum width per year: 120px
   - Optional: snap scrolling to years

6. **Conditional rendering**:
   - Only show if 2+ deliveries
   - Return null if 0-1 deliveries

**Acceptance Criteria**:
- [ ] Timeline accurately positions deliveries
- [ ] Hover shows tooltip
- [ ] Click navigates correctly
- [ ] Scrollable on mobile
- [ ] Handles edge cases (all same year, 10+ year span)
- [ ] Client Component with "use client" directive

---

### TICKET-005: FilterTabs Component

**Priority**: P0
**Estimate**: 2 hours
**Type**: Frontend Component
**Depends On**: TICKET-001

**Context**: Tab bar for filtering letters. URL-driven state.

**File**: `apps/web/components/redesign/filter-tabs.tsx`

**Tasks**:

1. **Create component with props**:
   ```typescript
   interface FilterTabsProps {
     counts: { all: number; drafts: number; scheduled: number; sent: number }
     activeFilter: 'all' | 'drafts' | 'scheduled' | 'sent'
   }
   ```

2. **Implement tabs**:
   - Four tabs: All, Drafts (count), Scheduled (count), Sent
   - Use `next/link` for URL-based navigation
   - URLs: `/letters`, `/letters?filter=drafts`, etc.

3. **Style per spec**:
   - Active: `border-b-2 border-duck-blue font-bold`
   - Inactive: `text-muted-foreground`
   - Hover: `bg-duck-cream`
   - Font: `font-mono text-sm uppercase`
   - Gap: 32px between tabs

4. **Badge counts**:
   - Show count badge for drafts and scheduled only
   - Badge style: `bg-duck-cream text-charcoal px-2 py-0.5 rounded-sm`

5. **Mobile**:
   - Horizontal scroll with `overflow-x-auto`
   - No wrapping

**Acceptance Criteria**:
- [ ] URL updates on tab click
- [ ] Active state reflects current URL
- [ ] Counts display correctly
- [ ] Horizontally scrollable on mobile
- [ ] Client Component (for useSearchParams)

---

### TICKET-006: LetterCard Component (Redesign)

**Priority**: P0
**Estimate**: 2-3 hours
**Type**: Frontend Component

**Context**: Redesigned letter card with status color bar and better visual hierarchy.

**File**: `apps/web/components/redesign/letter-card.tsx`

**Tasks**:

1. **Update props interface**:
   ```typescript
   interface LetterCardProps {
     letter: {
       id: string
       title: string
       bodyPreview: string // First 100 chars
       createdAt: Date
     }
     delivery?: {
       status: 'scheduled' | 'sent' | 'failed'
       deliverAt: Date
     }
   }
   ```

2. **Implement status variants**:
   | Status | Left Border | Badge Text | Badge Color |
   |--------|-------------|------------|-------------|
   | Draft (no delivery) | `border-l-duck-yellow` | "Draft" | yellow |
   | Scheduled | `border-l-duck-blue` | "X days" | blue |
   | Sent | `border-l-green-500` | "Delivered" | green |
   | Failed | `border-l-red-500` | "Failed" | red |

3. **Card structure**:
   - Left border: 4px colored by status
   - Title: 18px, semibold, line-clamp-1
   - Preview: 14px, muted, line-clamp-2
   - Bottom row: Status badge + "Written [date]"

4. **Brutalist hover effect**:
   ```css
   transition: transform 150ms, box-shadow 150ms
   hover: translate(-2px, -2px) shadow-[4px_4px_0_theme(colors.charcoal)]
   ```

5. **Click behavior**:
   - Wrap in `Link` to `/letters/[id]`
   - Draft cards could link to `/letters/[id]/edit` (optional)

**Acceptance Criteria**:
- [ ] All 4 status variants display correctly
- [ ] Hover animation works
- [ ] Text truncation works
- [ ] Responsive sizing
- [ ] Server Component

---

### TICKET-007: LetterGrid Component

**Priority**: P0
**Estimate**: 1 hour
**Type**: Frontend Component
**Depends On**: TICKET-006

**Context**: Responsive grid container for letter cards.

**File**: `apps/web/components/redesign/letter-grid.tsx`

**Tasks**:

1. **Create grid component**:
   ```typescript
   interface LetterGridProps {
     letters: LetterCardProps[]
     isLoading?: boolean
   }
   ```

2. **Responsive layout**:
   ```css
   grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6
   ```

3. **Loading state**:
   - If `isLoading`, show 6 skeleton cards
   - Skeleton should match card dimensions
   - Use shadcn `Skeleton` component

4. **Empty state**:
   - If `letters.length === 0` and not loading, show message
   - "No letters match this filter" with link to clear filter

**Acceptance Criteria**:
- [ ] Grid is responsive at all breakpoints
- [ ] Loading skeletons display correctly
- [ ] Empty state handles filtered views
- [ ] Server Component

---

### TICKET-008: WritePromptBanner Component

**Priority**: P2
**Estimate**: 1 hour
**Type**: Frontend Component

**Context**: Bottom CTA banner with rotating prompts.

**File**: `apps/web/components/redesign/write-prompt-banner.tsx`

**Tasks**:

1. **Create static component**:
   ```typescript
   const prompts = [
     "What does future-you need to hear right now?",
     "What would you tell yourself in 5 years?",
     "What moment do you want to remember forever?",
     "What are you proud of today?",
     "What advice would help you next year?",
   ]
   ```

2. **Style per spec**:
   - Background: `bg-duck-cream`
   - Border: `border-t-2 border-charcoal`
   - Padding: 48px
   - Text: 20px, italic, centered
   - CTA: Primary button, centered

3. **Prompt rotation**:
   - Rotate based on day of year
   - `new Date().getDay() % prompts.length`

**Acceptance Criteria**:
- [ ] Prompt rotates daily
- [ ] CTA links to `/letters/new`
- [ ] Visually distinct section
- [ ] Server Component

---

### TICKET-009: FloatingWriteButton Component

**Priority**: P2
**Estimate**: 2 hours
**Type**: Frontend Component

**Context**: Mobile-only FAB that appears when header scrolls out of view.

**File**: `apps/web/components/redesign/floating-write-button.tsx`

**Tasks**:

1. **Create client component**:
   ```typescript
   "use client"
   // Uses Intersection Observer to detect hero visibility
   ```

2. **Visibility logic**:
   - Only render on mobile (use `useMediaQuery` or CSS)
   - Track hero section visibility with `IntersectionObserver`
   - Show button when hero is NOT visible

3. **Style per spec**:
   - Position: `fixed bottom-6 right-6`
   - Size: 56x56px
   - Background: `bg-duck-blue`
   - Border: `border-2 border-charcoal`
   - Shadow: `shadow-[4px_4px_0_theme(colors.charcoal)]`
   - Icon: Lucide `Plus` or `Pencil`, 24px, white
   - z-index: 50

4. **Animation**:
   - Fade in/out on visibility change
   - Use `transition-opacity`

**Acceptance Criteria**:
- [ ] Only visible on mobile
- [ ] Appears/disappears based on scroll
- [ ] Links to `/letters/new`
- [ ] Doesn't interfere with other UI
- [ ] Client Component

---

### TICKET-010: AppHeader Simplification

**Priority**: P1
**Estimate**: 2-3 hours
**Type**: Frontend Refactor

**Context**: Simplify existing header. Remove "Dashboard" link, add persistent Write CTA.

**File**: `apps/web/components/layout/app-header.tsx` (or equivalent)

**Tasks**:

1. **Simplify navigation**:
   - Remove: "Dashboard" link
   - Keep: Logo (links to `/letters`)
   - Add: "Your Letters" text/link (optional, decorative)
   - Add: "+ Write" button (primary, always visible)
   - Keep: Settings icon (links to `/settings`)

2. **Desktop layout**:
   ```
   [Logo]          Your Letters         [+ Write]    [⚙️]
   ```

3. **Mobile layout**:
   ```
   [Logo]                               [+ Write]    [☰]
   ```
   - Hamburger menu contains: Letters, Settings links

4. **Reduce height**:
   - From 90px to 72px
   - Keep sticky behavior

5. **Update hamburger menu**:
   - Remove Dashboard option
   - Keep: Your Letters, Settings
   - Add: Write a Letter option

**Acceptance Criteria**:
- [ ] No more "Dashboard" in navigation
- [ ] Write CTA always visible
- [ ] Height reduced to 72px
- [ ] Mobile menu updated
- [ ] All links work correctly

---

### TICKET-011: Letters Page Rebuild (in Redesign Directory)

**Priority**: P0
**Estimate**: 4-5 hours
**Type**: Frontend Page
**Depends On**: TICKET-001 through TICKET-008

**Context**: Build new letters page in `(redesign)` route group. Does NOT touch existing `/letters`.

**File**: `apps/web/app/(redesign)/letters/page.tsx`

**Note**: To test during development, temporarily rename `(redesign)` to `redesign` and access at `/redesign/letters`

**Tasks**:

1. **Page structure** (Server Component):
   ```typescript
   export default async function LettersPage({ searchParams }) {
     const filter = searchParams.filter || 'all'

     // Parallel data fetching
     const [letters, counts, nextDelivery, timeline] = await Promise.all([
       getLetters(filter),
       getLetterCounts(),
       getNextDelivery(),
       getDeliveryTimeline(),
     ])

     return (
       <div>
         <FilterTabs counts={counts} activeFilter={filter} />

         {letters.length === 0 && filter === 'all' ? (
           <EmptyStateHero />
         ) : (
           <>
             {nextDelivery && <NextDeliveryHero delivery={nextDelivery} />}
             {timeline.length >= 2 && <DeliveryTimeline deliveries={timeline} />}
             <LetterGrid letters={letters} />
           </>
         )}

         <WritePromptBanner />
       </div>
     )
   }
   ```

2. **Handle filter from URL**:
   - Read `searchParams.filter`
   - Pass to `getLetters()` and `FilterTabs`

3. **Conditional rendering logic**:
   - No letters at all → `EmptyStateHero`
   - Has letters but none match filter → `LetterGrid` empty state
   - Has scheduled delivery → Show `NextDeliveryHero`
   - Has 2+ deliveries → Show `DeliveryTimeline`

4. **Suspense boundaries** (optional):
   - Wrap sections in `Suspense` for streaming
   - Create `loading.tsx` for full-page fallback

5. **Layout spacing**:
   - Consistent gaps between sections (32-48px)
   - Max-width container (1280px)

**Acceptance Criteria**:
- [ ] All components render correctly
- [ ] Filter works via URL
- [ ] Empty states handled
- [ ] Data fetches in parallel
- [ ] Responsive at all breakpoints

---

### TICKET-012: Final Swap (ONLY AFTER APPROVAL)

**Priority**: P0
**Estimate**: 1 hour
**Type**: Routing / Migration

**Context**: After redesign is approved, swap new pages into place and set up redirects.

**⚠️ DO NOT EXECUTE until redesign is tested and approved at `/redesign/letters`**

**Tasks**:

1. **Backup existing pages**:
   ```bash
   mv apps/web/app/letters apps/web/app/letters-old
   mv apps/web/app/dashboard apps/web/app/dashboard-old
   ```

2. **Move redesign into place**:
   ```bash
   mv apps/web/app/(redesign)/letters apps/web/app/letters
   rmdir apps/web/app/(redesign)  # Remove empty route group
   ```

3. **Create dashboard redirect**:
   ```typescript
   // apps/web/app/dashboard/page.tsx
   import { redirect } from 'next/navigation'

   export default function DashboardPage() {
     redirect('/letters')
   }
   ```

4. **Update Clerk config** (if applicable):
   - Change `afterSignInUrl` from `/dashboard` to `/letters`
   - Check `middleware.ts` for any dashboard references

5. **Update internal links**:
   - Search codebase for `/dashboard` links
   - Update to `/letters`

6. **Test all routes**:
   - `/letters` shows new design
   - `/dashboard` redirects to `/letters`
   - Login redirects to `/letters`

7. **Cleanup after verification** (24-48 hours later):
   ```bash
   rm -rf apps/web/app/letters-old
   rm -rf apps/web/app/dashboard-old
   ```

**Acceptance Criteria**:
- [ ] New design live at `/letters`
- [ ] `/dashboard` redirects to `/letters`
- [ ] Login redirects to `/letters`
- [ ] No broken links
- [ ] Old directories backed up (not deleted immediately)

---

### TICKET-013: Cleanup (AFTER SWAP VERIFIED)

**Priority**: P2
**Estimate**: 1-2 hours
**Type**: Cleanup

**Context**: After swap is verified working (24-48 hours), clean up old files and consolidate components.

**⚠️ DO NOT EXECUTE until TICKET-012 swap is verified working in production**

**Tasks**:

1. **Remove backup directories**:
   ```bash
   rm -rf apps/web/app/letters-old
   rm -rf apps/web/app/dashboard-old
   ```

2. **Consolidate components** (optional):
   - Move `components/redesign/*` to `components/dashboard/` OR
   - Rename `components/redesign/` to `components/home/`
   - Update all imports

3. **Remove old unused components**:
   - Old stats cards (if not reused)
   - Old dashboard widgets
   - Quick write editor (if not reused)

4. **Update imports**:
   - Fix any references to old component paths
   - Run TypeScript check: `pnpm typecheck`

5. **Final verification**:
   - `pnpm build` passes
   - All pages render correctly
   - No console errors

**Acceptance Criteria**:
- [ ] No backup directories remaining
- [ ] Components organized logically
- [ ] No broken imports
- [ ] Build passes
- [ ] No unused code

---

## Ticket Execution Order

```
Phase 1: Data Layer (Day 1)
├── TICKET-001: Server Actions ← START HERE

Phase 2: Core Components (Days 2-3)
├── TICKET-002: NextDeliveryHero
├── TICKET-003: EmptyStateHero
├── TICKET-005: FilterTabs
├── TICKET-006: LetterCard
└── TICKET-007: LetterGrid

Phase 3: Complex Components (Days 3-4)
├── TICKET-004: DeliveryTimeline
├── TICKET-008: WritePromptBanner
└── TICKET-009: FloatingWriteButton

Phase 4: Integration (Day 5)
├── TICKET-010: AppHeader Simplification (create copy in redesign/)
├── TICKET-011: Letters Page Rebuild (in app/(redesign)/letters/)
│
│   ⏸️  PAUSE HERE - Test at /redesign/letters
│   ⏸️  Get approval before proceeding
│
Phase 5: Go Live (After Approval)
├── TICKET-012: Final Swap ← ONLY AFTER APPROVAL
└── TICKET-013: Cleanup ← 24-48 hours after swap

Total Estimated Time: 25-35 hours (5-7 days)
```

### Development Testing Workflow

1. **Build components** (Tickets 001-010) in `components/redesign/`
2. **Build page** (Ticket 011) in `app/(redesign)/letters/`
3. **Enable test route**: Rename `(redesign)` → `redesign` temporarily
4. **Test at**: `http://localhost:3000/redesign/letters`
5. **Get approval**: Demo to stakeholders
6. **Execute swap**: Run TICKET-012
7. **Monitor**: Watch for issues 24-48 hours
8. **Cleanup**: Run TICKET-013

---

## Testing Checklist

After all tickets complete:

- [ ] New user (0 letters) sees EmptyStateHero
- [ ] User with 1 draft sees draft card, no timeline
- [ ] User with scheduled delivery sees NextDeliveryHero
- [ ] User with 3+ deliveries sees timeline
- [ ] Filter tabs update URL and filter letters
- [ ] All cards link to correct letter detail pages
- [ ] Write CTA works from header, banner, and FAB
- [ ] Mobile layout is correct at 375px width
- [ ] Tablet layout is correct at 768px width
- [ ] Desktop layout is correct at 1280px width
- [ ] `/dashboard` redirects to `/letters`
- [ ] Login redirects to `/letters`

---

**End of Specification**
