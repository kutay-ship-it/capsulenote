# Capsule Note - Visual Design Quick Reference

## Color Palette at a Glance

### Primary Brand
- **Duck Blue** `rgb(111, 194, 255)` - Primary buttons, interactive elements, focus rings
- **Duck Yellow** `rgb(255, 222, 0)` - Accent, CTAs, warnings
- **Charcoal** `rgb(56, 56, 56)` - All text, all borders
- **Cream** `rgb(244, 239, 234)` - Page background

### Dashboard Card Backgrounds
| Card | Color | RGB | Usage |
|------|-------|-----|-------|
| Total Letters | Blue Light | rgb(234, 240, 255) | Summary metric |
| Drafts | Yellow Pale | rgb(255, 253, 231) | Interactive stat (clickable) |
| Scheduled | Peach Light | rgb(253, 237, 218) | Action item |
| Delivered | Green Light | rgb(232, 245, 233) | Success metric |
| Empty State | Lavender Light | rgb(247, 241, 255) | Calm, inviting state |

### Status Colors
| State | Color | Usage |
|-------|-------|-------|
| Success | Teal Primary `rgb(56, 193, 176)` | Completed steps, success badges |
| Processing | Mustard `rgb(225, 196, 39)` | In-progress states |
| Delivered | Lime `rgb(179, 196, 25)` | Final delivery completed |
| Error/Failed | Coral `rgb(255, 113, 105)` | Errors, failed states |

## Typography Stack

```css
font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
font-weight: 400; /* Never varies */
```

### Size Reference
```
12px  = xs     (captions, fine print)
14px  = sm     (UI labels)
16px  = base   (body text, DEFAULT)
18px  = lg     (larger body)
20px  = xl     (subheadings)
24px  = 2xl    (card titles)
32px  = 3xl    (section headings)
44px  = 4xl    (large numbers, stat display)
48px  = 5xl    (displays, counters)
56px  = 6xl    (hero headings)
```

## Border & Radius System

```
All rectangular elements:  2px radius, 2px border
Circles only:              50% radius (avatars)
Sharp edges:               0px (dividers)
Border color:              charcoal (rgb(56, 56, 56))
Border disabled:           light-gray (rgb(236, 239, 241))
```

## Shadow System (Brutalist Hard Shadows)

```css
/* No blur, only offset */
shadow-sm:  box-shadow: rgb(56, 56, 56) -4px 4px 0px 0px;   /* Small lift */
shadow-md:  box-shadow: rgb(56, 56, 56) -8px 8px 0px 0px;   /* Medium lift */
shadow-lg:  box-shadow: rgb(56, 56, 56) -12px 12px 0px 0px; /* Large lift */
```

**Pattern:** Default `shadow-sm`, hover `shadow-md` + `translate(2px, -2px)`

## Component Patterns

### Button Styles

**Primary (Blue)**
```
Background:  duck-blue rgb(111, 194, 255)
Text:        charcoal, UPPERCASE, mono
Border:      2px charcoal
Hover:       shadow-md + translate(2px, -2px)
Disabled:    opacity-60, cursor-not-allowed
```

**Secondary (Outline)**
```
Background:  white
Border:      2px charcoal
Text:        charcoal
Hover:       shadow-md + translate(2px, -2px)
```

**Sizes**
```
lg:   h-[58px] px-8 py-5
sm:   h-[42px] px-5 py-3
icon: h-[50px] w-[50px]
```

### Card Component

```tsx
<Card className="border-2 border-charcoal bg-white shadow-sm">
  <CardHeader className="p-8">
    <CardTitle>Title Text</CardTitle>
    <CardDescription>Subtitle</CardDescription>
  </CardHeader>
  <CardContent className="p-8 pt-0">Content</CardContent>
</Card>

// With color background:
<Card className="bg-bg-blue-light">...</Card>
```

### Badge Component

```tsx
<Badge variant="outline">TAG</Badge>
```

**Variants:** default (blue), secondary (off-white), outline (white), destructive (coral), success (teal)

### Input Component

```
Height:      54px
Padding:     px-6 py-4 (24px × 16px)
Border:      2px charcoal
Background:  white
Focus:       border-duck-blue + ring-2 ring-duck-blue/20
Radius:      2px
Font:        mono, 16px
```

## Spacing System (4px Base)

```
4px   (space-1)
8px   (space-2)
12px  (space-3)
16px  (space-4) ← common gap between items
20px  (space-5)
24px  (space-6) ← common padding
32px  (space-8)
48px  (space-12)
```

## Responsive Breakpoints

```
mobile:  < 640px
sm:      640px+
md:      768px+
lg:      1024px+
xl:      1280px+
```

**Common patterns:**
- `text-lg sm:text-xl` (scale up on tablets)
- `p-5 sm:p-6` (increase padding)
- `gap-4 sm:gap-6` (increase gaps)
- `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` (column count)

## Animations & Transitions

```
duration-fast:    120ms (hover feedback)
duration-normal:  200ms (standard transition)
duration-slow:    300ms (slow transitions)

easing:           cubic-bezier(0.4, 0, 0.2, 1) [ease-in-out]
```

**Common transition:**
```
transition-all duration-fast hover:shadow-md hover:translate-x-0.5 hover:-translate-y-0.5
```

## Loading States

**Skeleton Loaders:**
- Default: `bg-gray-200 animate-pulse`
- Shimmer: `animate-shimmer` (gradient animation)
- Radius: 2px (consistent with all elements)

## Empty States

**Pattern:**
1. Icon in bordered box (h-12 w-12, border-2, off-white bg, 2px radius)
2. Heading (uppercase, mono, charcoal)
3. Description (mono, gray-secondary, smaller)
4. Optional CTA button

## Accessibility

**Contrast:**
- charcoal on white: 16.8:1 (AAA)
- charcoal on off-white: 16.1:1 (AAA)
- gray-secondary on white: 5.9:1 (AA)

**Touch Targets:**
- Buttons: minimum 50px height
- Icons: minimum 20px × 20px
- Links: underlined or high contrast

**Focus States:**
```
focus-visible:ring-2 focus-visible:ring-duck-blue focus-visible:ring-offset-2
```

## Dashboard Layout

```
┌─────────────────────────────────────────────┐
│ Page Header (DASHBOARD)                     │
├─────────────────────────────────────────────┤
│ 4-Column Stat Grid (color backgrounds)      │
├─────────────────────────────────────────────┤
│ 2-Column Delivery Widgets (Next, Timeline)   │
├─────────────────────────────────────────────┤
│ Inline Letter Editor (QUICK WRITE)          │
├─────────────────────────────────────────────┤
│ Recent Letters List                         │
└─────────────────────────────────────────────┘
```

## Visual Hierarchy

**Size → Color → Position**

1. **Large numbers** (stats) - most important
2. **Card titles** (colored backgrounds) - important
3. **Section headings** (32px) - content structure
4. **Body text** (16px) - details
5. **Secondary text** (14px gray) - hints/metadata

## Design Philosophy Summary

1. **Brutalist**: Hard edges, 2px borders/radius, offset shadows
2. **Monospace**: Technical authenticity throughout
3. **Colorful**: Pastel backgrounds, status colors, no grayscale
4. **Responsive**: Mobile-first, scales gracefully
5. **Accessible**: WCAG AA minimum, proper contrast
6. **Playful**: Duck theme, uplifting colors, friendly animations

---

## Implementation Checklist for New Components

- [ ] Borders: 2px, charcoal color
- [ ] Radius: 2px (except circles)
- [ ] Font: mono stack, 400 weight
- [ ] Shadows: Only hard offset (charcoal, -4px 4px)
- [ ] Spacing: 4px multiples
- [ ] Colors: From palette (33 defined colors)
- [ ] Hover: shadow-md + translate
- [ ] Focus: ring-2 ring-duck-blue
- [ ] Responsive: Mobile first, use sm/md/lg breakpoints
- [ ] Contrast: WCAG AA minimum (4.5:1)
- [ ] Loading: Skeleton with pulse/shimmer
- [ ] Empty: Icon + message + CTA
- [ ] Error: Coral color + alert icon + message

