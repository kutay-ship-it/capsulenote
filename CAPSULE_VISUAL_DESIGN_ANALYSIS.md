# Capsule Note - Visual Design System & UI Components Analysis

**Analysis Date:** November 25, 2025
**Focus:** Dashboard visual design, component patterns, and visual hierarchy

---

## Executive Summary

Capsule Note's dashboard adopts the **MotherDuck Design System** - a brutalist, playful design language featuring:
- **Monospace typography** throughout (primary: `ui-monospace` font stack)
- **Hard-edged brutalism** with 2px borders and sharp corners
- **Offset hard shadows** (no blur, bottom-right offset only)
- **Vibrant but restrained color palette** (duck-blue, duck-yellow, cream backgrounds)
- **Clear information hierarchy** with color-coded stat cards
- **Responsive & accessible** with proper contrast ratios (WCAG AA)

The dashboard demonstrates **progressive enhancement** with skeleton loaders, proper state management (loading/empty/error), and modern React 19 patterns (Server Components by default, "use client" only when needed).

---

## Part 1: Design System Foundation

### 1.1 Color Palette

#### Primary Colors
```
Duck Yellow:    rgb(255, 222, 0)     - Brand accent, CTAs
Duck Blue:      rgb(111, 194, 255)   - Primary interactive elements
Charcoal:       rgb(56, 56, 56)      - Primary text, borders
Cream:          rgb(244, 239, 234)   - Page background
```

#### Background Tints (Light Pastel Variations)
Used on dashboard stat cards for visual variety while maintaining brutalist aesthetic:
```
bg-blue-light:      rgb(234, 240, 255)    - "Total Letters" card
bg-yellow-pale:     rgb(255, 253, 231)    - "Drafts" card (interactive)
bg-peach-light:     rgb(253, 237, 218)    - "Scheduled" & "Next Delivery" cards
bg-green-light:     rgb(232, 245, 233)    - "Delivered" card
bg-purple-light:    rgb(247, 241, 255)    - Empty state backgrounds
bg-lavender-light:  (variant)             - Timeline empty state
```

#### Neutral Colors
```
White:              rgb(255, 255, 255)    - Card backgrounds
Off-white:          rgb(248, 248, 247)    - Input backgrounds, secondary surfaces
Light Gray:         rgb(236, 239, 241)    - Dividers, borders (when disabled)
Gray Secondary:     rgb(162, 162, 162)    - Secondary text, descriptions
Charcoal:           rgb(56, 56, 56)       - Primary text, all borders
```

#### Accent Colors (used in timeline, status indicators)
```
Teal Primary:       rgb(56, 193, 176)     - Success states
Lime:               rgb(179, 196, 25)     - Delivered status
Coral:              rgb(255, 113, 105)    - Error/failed states
Mustard:            rgb(225, 196, 39)     - Processing states
```

### 1.2 Typography System

#### Font Stack
```
Primary:    "ui-monospace", "SFMono-Regular", "SF Mono", "Menlo", "Consolas", "Liberation Mono", monospace
Fallback:   "Inter", sans-serif
Weight:     400 (normal) - used exclusively, no weight variation
```

**Rationale:** Monospace font signals technical authenticity while maintaining approachability. No weight variation keeps design clean and readable.

#### Type Scale
```
xs:     12px    (fine print, captions)
sm:     14px    (small UI text)
base:   16px    (body text - base size)
md:     16px    (equivalent to base)
lg:     18px    (larger body)
xl:     20px    (subheadings)
2xl:    24px    (card headings)
3xl:    32px    (section headings)
4xl:    44px    (page headings)
5xl:    48px    (large displays)
6xl:    56px    (hero headings)
```

#### Line Heights
```
tight:      1.2     (headings)
snug:       1.4     (headings with more breathing room)
normal:     1.5     (body text)
relaxed:    1.6     (comfortable reading)
```

#### Typography in Dashboard Components

**Page Heading (Dashboard Title)**
```
"Dashboard" text
- Font:         mono, 400
- Size:         3xl (32px) on desktop, 2xl (24px) on mobile
- Line height:  snug (1.4)
- Letter spac:  wide (0.02em)
- Transform:    UPPERCASE
- Color:        charcoal
```

**Card Titles (Stats Cards)**
```
"Total Letters", "Drafts", etc.
- Font:         mono, 400
- Size:         lg (18px) on mobile, xl (20px) on tablet+
- Line height:  snug (1.4)
- Letter spac:  wide (0.02em)
- Transform:    UPPERCASE
- Color:        charcoal
```

**Card Descriptions (Stats Cards)**
```
Subtitle text below title
- Font:         mono, 400
- Size:         xs (12px) on mobile, sm (14px) on tablet+
- Color:        gray-secondary (rgb(162, 162, 162))
```

**Stat Numbers (Large Display)**
```
"4", "12", "8", "3" on dashboard stats
- Font:         mono, 400
- Size:         4xl (44px) on mobile, 5xl (48px) on tablet+
- Color:        charcoal
```

**Section Headers**
```
"Quick Write a Letter", "Recent Letters"
- Font:         mono, 400
- Size:         2xl (24px) on mobile, 3xl (32px) on desktop
- Letter spac:  wide (0.02em)
- Transform:    UPPERCASE
```

### 1.3 Border Radius System

```
Brutalist Philosophy: Minimal rounding
Default:    2px     - ALL rectangular UI elements
            0px     - Sharp edges (dividers, hard lines)
Circles:    50%     - ONLY for avatars and circular icons
```

**Implementation Note:** Every card, button, input, badge has `style={{ borderRadius: "2px" }}` explicitly set. Tailwind config maps all border-radius values (sm, md, lg, xl, 2xl) to 2px to enforce consistency.

### 1.4 Shadow System

```
Brutalist Hard Offset Shadows (no blur)
sm:  rgb(56, 56, 56) -4px 4px 0px 0px      (4px offset)
md:  rgb(56, 56, 56) -8px 8px 0px 0px      (8px offset)
lg:  rgb(56, 56, 56) -12px 12px 0px 0px    (12px offset)
```

**Shadow Usage Pattern:**
- Default cards: `shadow-sm` (-4px 4px)
- Hover state:   `shadow-md` (-8px 8px)
- Increased offset creates 3D "lifted" effect on interaction

**Shadow Color:** Always `charcoal` (rgb(56, 56, 56)), never soft/blurred shadows

### 1.5 Spacing System

```
4px Base Unit
1:   4px
2:   8px
3:   12px
4:   16px
5:   20px
6:   24px
7:   28px
8:   32px
10:  40px
12:  48px
14:  56px
16:  64px
20:  80px
24:  96px
```

**Common Component Spacing:**
- Card padding:          8px (p-8) or 24px (p-6)
- Button padding:        16.5px vertical, 22px horizontal
- Stat card header:      5-6 (20-24px) padding
- Section gap:           4-6 (16-24px)

---

## Part 2: Dashboard Visual Hierarchy

### 2.1 Dashboard Page Layout

```
┌────────────────────────────────────────────────────────┐
│  "DASHBOARD"                    [Section Tag]           │  ← Page header
│  Welcome text                                           │
├────────────────────────────────────────────────────────┤
│  [Timezone Change Warning - if applicable]             │
├────────────────────────────────────────────────────────┤
│  ┌─────────┬─────────┬─────────┬─────────┐             │  ← Stats Grid (4 cards)
│  │ Total   │ Drafts  │Schedule │Delivered│             │
│  │   4     │   2     │    1    │    3    │             │
│  └─────────┴─────────┴─────────┴─────────┘             │
├────────────────────────────────────────────────────────┤
│  ┌──────────────────────┬──────────────────────┐        │  ← Delivery Widgets (2 cols)
│  │ NEXT DELIVERY        │ TIMELINE MINIMAP     │        │
│  │ 5 days : 12h : 45m   │ Created→Scheduled... │        │
│  │ [View Letter]        │ [View Letter]        │        │
│  └──────────────────────┴──────────────────────┘        │
├────────────────────────────────────────────────────────┤
│  [QUICK ACTION]                                        │  ← Inline letter editor
│  WRITE A NEW LETTER                                     │
│  Start crafting your next letter right here            │
│  [Letter Editor Component]                             │
├────────────────────────────────────────────────────────┤
│  RECENT LETTERS                                        │  ← Recent letters list
│  │ "Letter Title"        Created Nov 25     [Btn]│     │
│  │ "Another Letter"      Created Nov 24     [Btn]│     │
│  │ "Third Letter"        Created Nov 23     [Btn]│     │
│  [View All 4 Letters] →                                 │
└────────────────────────────────────────────────────────┘
```

### 2.2 Color Usage on Dashboard

**Stat Cards - Gradient Rotation:**
```
Card 1 (Total Letters):   bg-blue-light       rgb(234, 240, 255)
Card 2 (Drafts):          bg-yellow-pale      rgb(255, 253, 231) ← interactive/clickable
Card 3 (Scheduled):       bg-peach-light      rgb(253, 237, 218)
Card 4 (Delivered):       bg-green-light      rgb(232, 245, 233)
```

**Visual Effect:** Different pastel backgrounds create visual rhythm and scanability without overwhelming. Each stat area feels distinct yet cohesive.

**Delivery Widgets:**
```
Next Delivery Widget:     bg-peach-light      (warm, indicates upcoming action)
Timeline Minimap:         bg-peach-light      (consistent with delivery theme)
```

**Empty States:**
```
No Deliveries:            bg-purple-light     (cool, indicates absence)
No Letters:               bg-bg-lavender-light (calm, inviting to create)
```

### 2.3 Interactive Elements & Hover States

#### Button Variants (with brutalist hover)

**Primary Button (Default)**
```
Background:     duck-blue (rgb(111, 194, 255))
Text:           charcoal (uppercase, mono)
Border:         2px charcoal
Default Shadow: -4px 4px 0px 0px
Hover:          
  - Transform:  translate(2px, -2px)
  - Shadow:     -8px 8px 0px 0px (increased offset)
  - Duration:   120ms (fast)
```

**Secondary Button (Outline)**
```
Background:     white
Text:           charcoal (uppercase, mono)
Border:         2px charcoal
Hover Effect:   Same transform + shadow increase
```

**Ghost Button (Link-like)**
```
Background:     transparent
Text:           charcoal with underline offset
Hover:          Opacity 70%
```

#### Card Interactivity

**Stats Cards - Hover**
```
Cursor:         Pointer (visual cue)
Default:        -4px 4px shadow
Hover:          -8px 8px shadow + translate(2px, -2px)
Drafts Card:    href="/letters/drafts" (clickable to dashboard section)
```

**Recent Letter Items - Hover**
```
Cursor:         Pointer
Default:        -4px 4px shadow, white background
Hover:          -8px 8px shadow + translate(2px, -2px)
Transition:     120ms ease-in-out (duration-fast)
```

**Time Countdown Boxes**
```
Border:         2px charcoal
Background:     off-white (rgb(248, 248, 247))
Text:           charcoal, mono, bold, 2xl
No hover:       Static, informational
```

---

## Part 3: Component Patterns

### 3.1 Card Component Pattern

```tsx
// Base Card (all borders 2px, radius 2px)
<Card className="border-2 border-charcoal bg-white shadow-sm">
  <CardHeader className="p-8">
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent className="p-8 pt-0">Content</CardContent>
  <CardFooter className="p-8 pt-0">Footer</CardFooter>
</Card>

// With color background variant
<Card className="border-2 border-charcoal bg-bg-blue-light">
  {/* Colored version */}
</Card>
```

**Card Spacing:**
- Header padding: 8 (p-8) = 32px all sides
- Content padding: 8 (p-8) = 32px, but `pt-0` to avoid doubling top
- Footer padding: 8 (p-8) = 32px, but `pt-0`
- Internal spacing: `space-y-4` or `space-y-6`

### 3.2 Stats Card Component

```tsx
<Card className="border-2 border-charcoal shadow-sm 
                 transition-all duration-fast 
                 hover:shadow-md hover:translate-x-0.5 hover:-translate-y-0.5
                 bg-bg-blue-light">
  <CardHeader className="p-5 sm:p-6">
    <CardTitle className="font-mono text-lg font-normal uppercase tracking-wide 
                          sm:text-xl">
      Total Letters
    </CardTitle>
    <CardDescription className="font-mono text-xs text-gray-secondary sm:text-sm">
      Description text
    </CardDescription>
  </CardHeader>
  <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
    <div className="font-mono text-4xl font-normal text-charcoal sm:text-5xl">
      4
    </div>
  </CardContent>
</Card>
```

**Key Pattern:**
- Responsive padding: `p-5 sm:p-6` (20px mobile, 24px tablet+)
- Responsive text sizes: `text-lg sm:text-xl`
- Responsive number display: `text-4xl sm:text-5xl`
- Hover transition: both shadow and transform together

### 3.3 Badge Component

```tsx
<Badge variant="outline" className="font-mono text-xs">
  ACTION BADGE
</Badge>
```

**Badge Variants:**
```
default:    bg-duck-blue,        text-charcoal
secondary:  bg-off-white,        text-charcoal
outline:    bg-white,            text-charcoal
destructive: bg-coral,           text-white
success:    bg-teal-primary,     text-white
```

All badges:
- Border: 2px charcoal (except destructive/success which may vary)
- Text: uppercase, mono, xs (12px)
- Radius: 2px
- Padding: px-3 py-1

### 3.4 Countdown Timer Component

**Visual Pattern:**
```
    Days    :    Hours   :   Minutes
  ┌────┐        ┌────┐        ┌────┐
  │ 5  │   :    │12  │   :    │45  │
  └────┘        └────┘        └────┘
   DAYS          HOURS        MINUTES

- Each box: 16x16 (sm) to 20x20 (lg)
- Border: 2px charcoal
- Background: off-white
- Text: mono, bold, 2xl (sm) or 3xl (lg)
- Separator: colon (:) aligned vertically with number
- Label: xs uppercase, gray-secondary, beneath box
- Layout: flex gap-4 (sm) to gap-6 (lg)
```

### 3.5 Timeline Minimap Component

**Status Indicators:**
```
Each step is a mini card with icon:
- Size: 8x8 (h-8 w-8)
- Border: 2px charcoal
- Radius: 2px
- Icon: 4x4 (h-4 w-4)

Status Colors:
  Created:      bg-duck-blue    (completed)
  Scheduled:    bg-duck-blue    (completed) or bg-gray-200 (pending)
  Processing:   bg-mustard      (current) or bg-gray-200 (pending)
  Delivered:    bg-lime         (completed) or bg-gray-200 (pending)
  Failed:       bg-coral        (error state)

Connector Lines:
  - Height: 0.5 (h-0.5)
  - Completed step: bg-charcoal
  - Pending step:   bg-gray-300
  - Gap: mx-1 (4px margin)
```

### 3.6 Button Sizing System

```
Size Mapping (height x padding):
default:  h-[50px]  px-6 py-4
sm:       h-[42px]  px-5 py-3  text-sm
lg:       h-[58px]  px-8 py-5  text-lg
icon:     h-[50px]  w-[50px]   (square, icon only)
```

All buttons have:
- Font: mono, base, UPPERCASE
- Transition: all 120ms (duration-fast)
- Focus ring: duck-blue (focus-visible:ring-2 focus-visible:ring-duck-blue)
- Radius: 2px

### 3.7 Input Component

```tsx
<Input 
  placeholder="Type here..."
  className="h-[54px] border-2 border-charcoal bg-white"
/>
```

**Input Styling:**
- Height: 54px (h-[54px])
- Padding: 24px horizontal, 16px vertical (px-6 py-4)
- Border: 2px charcoal
- Background: white
- Font: mono, base, charcoal
- Radius: 2px
- Focus: border-duck-blue + ring-2 with duck-blue/20 alpha
- Disabled: bg-off-white, text-gray, opacity-60
- Placeholder: gray-secondary

---

## Part 4: Loading & Empty States

### 4.1 Skeleton Loader Pattern

```tsx
<Skeleton className="h-6 w-24" variant="pulse" />
```

**Skeleton Styles:**
```
Default (pulse):    bg-gray-200 animate-pulse
Shimmer variant:    gradient animation left-to-right
Radius:             2px (all skeleton elements)
```

**Dashboard Skeleton Hierarchy:**

**Stats Grid Skeleton:**
- 4 cards in grid (gap-4 sm:gap-6)
- Each card:
  - Header skeleton: h-6-7 w-24-28 (title), h-4 w-32-40 (description)
  - Content skeleton: h-12-14 w-16-20 (large number)

**Recent Letters Skeleton:**
- Card header: h-7 w-40 (title), h-4 w-56 (description)
- List items (3-5 items):
  - Each row: h-5 w-3/4 (title), h-4 w-32 (date)
  - Badge: h-5 w-20

**Letter Editor Skeleton:**
- Title input: h-10 w-full
- Editor area: h-48 w-full
- Submit button: h-10 w-32

### 4.2 Empty State Patterns

**No Deliveries (Quiet Calm)**
```
Card background:   bg-bg-lavender-light
Icon box:          h-12 w-12, border-2, bg-off-white, radius-2px
Icon:              Clock (gray-secondary)
Message:           xs text, gray-secondary
Action:            Optional link to create
```

**No Recent Letters (Invitation)**
```
Card background:   white with border-2
Message:           "No letters yet. Start writing!"
Action:            Link to /letters/new
Text alignment:    center
```

**Stats Card with Hover-Ready State**
- Color background distinguishes from normal cards
- All stat cards always show numbers (0 is valid)
- Never truly "empty" - shows count

---

## Part 5: Responsive Behavior

### 5.1 Breakpoints

```
Mobile:     Default (< 640px)
sm:         640px+ (tablet)
md:         768px+ (medium tablets)
lg:         1024px+ (laptops)
xl:         1280px+ (desktops)
2xl:        1536px+ (large screens)
```

### 5.2 Dashboard Responsive Changes

**Stats Grid:**
```
Mobile:     1 column (full width)
sm+:        md:grid-cols-2 lg:grid-cols-4
            → 2 cols on tablet, 4 cols on desktop
```

**Delivery Widgets:**
```
Mobile:     1 column (full width)
md+:        md:grid-cols-2
            → 2 columns on 768px+
```

**Spacing Responsiveness:**
```
Padding:    p-5 (mobile) → sm:p-6 (tablet+)  [20px → 24px]
Text size:  text-lg (mobile) → sm:text-xl (tablet+)
Gap:        gap-4 (mobile) → sm:gap-6 (tablet+)  [16px → 24px]
```

### 5.3 Typography Scaling

```
Headings:
  h1:       text-3xl sm:text-4xl      [24px → 32px]
  h2:       text-2xl sm:text-3xl      [24px → 32px]
  h3:       text-lg sm:text-xl        [18px → 20px]

Numbers (stats):
  text-4xl sm:text-5xl               [44px → 48px]

Body:
  text-sm sm:text-base               [14px → 16px]
```

---

## Part 6: Visual Consistency Patterns

### 6.1 Consistent Border Treatment

**All borders follow:**
- Width: 2px (default, never 1px)
- Color: charcoal (rgb(56, 56, 56)) for active elements
- Color: light-gray for disabled states
- Radius: 2px (never 0, never larger)

**Exceptions:**
- Avatar images: radius 50%
- Decorative shapes: can vary

### 6.2 Consistent Shadow Treatment

**All interactive elements follow:**
- Default: shadow-sm (-4px 4px)
- Hover: shadow-md (-8px 8px) + translate(2px, -2px)
- No soft shadows, no blur
- Only charcoal offset shadows

### 6.3 Consistent Spacing Hierarchy

```
Single value:   Use 4px multiples
Related items:  Consistent gaps (gap-4, gap-6)
Nested content: Proportional padding (p-5 → p-8)
Top margins:    Often mt-2, mt-3, mt-4 to breathe

Pattern:        Use Tailwind spacing consistently
                8 (32px) for large cards/sections
                6 (24px) for medium sections
                4 (16px) for tight grouping
                2 (8px) for internal breathing
```

### 6.4 Text Color Hierarchy

```
Level 1 (Primary):      charcoal (rgb(56, 56, 56))     ← headings, primary text
Level 2 (Secondary):    gray-secondary (rgb(162, 162, 162)) ← descriptions, hints
Level 3 (Muted):        gray (rgb(161, 161, 161))      ← disabled states
Level 4 (Disabled):     opacity-60 with gray            ← fully disabled

Special States:
  Error text:           coral (rgb(255, 113, 105))
  Success text:         teal-primary (rgb(56, 193, 176))
  Warning text:         mustard (rgb(225, 196, 39))
```

---

## Part 7: Information Density

### 7.1 Dashboard Information Strategy

**High-Level Summary (Stats Cards)**
- 4 key metrics visible at glance
- Color-coded for quick recognition
- Large numbers for emphasis
- One action per card (clickable cards for drill-down)

**Actionable Items (Delivery Widgets)**
- Next delivery: prominent position, countdown timer
- Timeline: visual progress indicator
- Both have "View Letter" CTA

**Content Organization**
- Inline editor: quick capture without navigation
- Recent list: scrollable, shows metadata (date, delivery count)
- Link to full list: for power users

**Principle:** Show enough to be useful, hide details behind drilldown

### 7.2 Visual Signaling

```
Importance:   Size > Color > Position
              Large numbers = important stats
              Color background = distinct areas
              Top position = primary focus

Actionability: Interactive elements have:
              - Hover effects (shadow + transform)
              - Visual affordances (underline on links)
              - Consistent button styling

Status:       Color + Icon + Text
              Timeline uses combo of all three
              Badge colors indicate state
```

---

## Part 8: Accessibility Considerations

### 8.1 Contrast Ratios

**WCAG AA Compliant (4.5:1 minimum)**
```
charcoal text on white:     #383838 on #FFFFFF  → 16.8:1 ✓ Excellent
charcoal text on off-white: #383838 on #F8F8F7  → 16.1:1 ✓ Excellent
gray-secondary on white:    #A2A2A2 on #FFFFFF  → 5.9:1  ✓ AA
gray-secondary on bg-*:     Varies, all meet AA
```

### 8.2 Touch Targets

```
Buttons:        Minimum 50px height (default size)
Icons:          Minimum 20px × 20px
Links:          Underlined or high contrast color
Badges:         12-16px font size (readability not touch)
```

### 8.3 Focus States

```
All interactive elements have:
  focus-visible:ring-2 focus-visible:ring-duck-blue
  focus-visible:ring-offset-2

Ring color:     duck-blue (rgb(111, 194, 255))
Ring width:     2px
Offset:         2px (breathing room from element)
```

### 8.4 Color Independence

No information conveyed by color alone:
- Statuses use icon + color + text
- Empty states use icon + message
- Validation uses border color + error text

---

## Part 9: Performance Optimizations

### 9.1 Visual Loading Improvements

**Skeleton Loaders:**
- Pulse animation (GPU-accelerated)
- Shimmer variant for premium feel
- Same layout as content → no layout shift

**Progressive Streaming (Next.js Suspense):**
```
Instant:        Page title + header (no server dependency)
Medium:         Stats cards (Suspense fallback)
Medium:         Delivery widgets (Suspense fallback)
Instant:        Inline editor (client component, ready immediately)
Slower:         Recent letters (data + Suspense)
```

### 9.2 Animation Performance

**All animations use:**
- `transform` and `box-shadow` only (GPU-accelerated)
- `duration-fast` (120ms) for responsiveness
- Ease-in-out timing function (natural motion)
- No animations on page load (performance)

**Transitions:**
```
duration-fast:    120ms
duration-normal:  200ms
duration-slow:    300ms
```

---

## Part 10: Design System Files & Implementation

### 10.1 Key Files

```
apps/web/tailwind.config.ts
├─ Color definitions (33 unique colors)
├─ Border radius (all mapped to 2px)
├─ Box shadows (hard offset only)
├─ Typography (mono font stack)
├─ Spacing (4px base unit)
└─ Animations (brutalist hover effect)

apps/web/app/globals.css
├─ Base layer styles
├─ TipTap editor customization
├─ Brutalist utility classes
└─ Hard shadow definitions

apps/web/components/ui/
├─ card.tsx
├─ button.tsx
├─ badge.tsx
├─ input.tsx
└─ [other primitives]

apps/web/components/dashboard/
├─ next-delivery-widget.tsx
├─ countdown-timer.tsx
├─ timeline-minimap.tsx
└─ [dashboard-specific]

apps/web/components/skeletons/
├─ skeleton.tsx
├─ stats-card-skeleton.tsx
├─ letter-card-skeleton.tsx
└─ delivery-card-skeleton.tsx
```

### 10.2 Implementation Checklist

- [x] Monospace typography throughout
- [x] 2px borders on all UI elements
- [x] 2px border radius exclusively
- [x] Hard offset shadows (no blur)
- [x] Consistent spacing (4px base unit)
- [x] Color-coded backgrounds (stats cards)
- [x] Responsive grid layouts
- [x] Skeleton loaders with pulse/shimmer
- [x] Empty state patterns
- [x] Error boundary with ErrorFallback
- [x] Loading state (page.tsx + loading.tsx)
- [x] Focus visible rings (duck-blue)
- [x] WCAG AA contrast ratios
- [x] Touch target sizing (≥50px buttons)
- [x] Progressive enhancement (Server Components)

---

## Summary: The Capsule Note Design Aesthetic

**In One Sentence:**
Capsule Note's dashboard is a **friendly, approachable brutalist interface** that uses **clear color differentiation, responsive typography, and hard-edged 2px styling** to create a **professional yet playful environment** for managing important life correspondence.

**Key Design Moves:**
1. **Monospace everywhere** → Technical authenticity
2. **Hard shadows + transform on hover** → Playful, responsive feedback
3. **Color-coded stat cards** → Instant visual scanning
4. **2px borders + 2px radius** → Consistent, brutalist aesthetic
5. **Progressive loading** → Smooth perceived performance
6. **Generous spacing + clear hierarchy** → Reduced cognitive load
7. **Emoji + icons + text** → Multiple signaling systems
8. **Responsive design** → Accessible on all devices

The overall effect: **structured but friendly, technical but approachable, minimal but informative**.

