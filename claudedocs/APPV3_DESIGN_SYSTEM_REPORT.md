# Capsule Note V3 Design System Report

**Analysis Date:** November 27, 2025
**Design Philosophy:** Brutalist-inspired, playful yet professional aesthetic with MotherDuck-derived color palette

---

## Executive Summary

The app-v3 design system embraces a **neo-brutalist** aesthetic that balances technical precision with approachable warmth. Key characteristics:

- **Hard edges** (2px border-radius only)
- **Bold offset shadows** (no blur, pure geometric depth)
- **Monospace typography** (technical authenticity)
- **Vibrant yet cohesive** color palette
- **Intentional constraints** that create visual consistency

---

## 1. Color System

### Primary Brand Colors

| Token | RGB | Hex | Usage |
|-------|-----|-----|-------|
| `duck-yellow` | rgb(255, 222, 0) | #FFDE00 | Accent, highlights, drafts |
| `duck-blue` | rgb(111, 194, 255) | #6FC2FF | Primary CTA, scheduled states |
| `charcoal` | rgb(56, 56, 56) | #383838 | Text, borders, shadows |
| `cream` | rgb(244, 239, 234) | #F4EFE2 | Page background |

### Semantic Status Colors

| Token | RGB | Hex | Usage |
|-------|-----|-----|-------|
| `teal-primary` | rgb(56, 193, 176) | #38C1B0 | Success, delivered |
| `coral` | rgb(255, 113, 105) | #FF7169 | Error, failed, destructive |
| `duck-yellow` | rgb(255, 222, 0) | #FFDE00 | Warning, draft |

### Extended Accent Palette

```css
--teal-light: rgb(83, 219, 201);      /* #53DBC9 */
--sky-blue: rgb(84, 180, 222);        /* #54B4DE */
--periwinkle: rgb(117, 151, 238);     /* #7597EE */
--lavender: rgb(178, 145, 222);       /* #B291DE */
--lime: rgb(179, 196, 25);            /* #B3C419 */
--peach: rgb(245, 177, 97);           /* #F5B161 */
--salmon: rgb(243, 142, 132);         /* #F38E84 */
--mustard: rgb(225, 196, 39);         /* #E1C427 */
```

### Background Tints

Light pastel variations for section backgrounds:

```css
--bg-blue-light: rgb(234, 240, 255);    /* #EAF0FF */
--bg-blue-pale: rgb(235, 249, 255);     /* #EBF9FF */
--bg-yellow-pale: rgb(255, 253, 231);   /* #FFFDE7 */
--bg-peach-light: rgb(253, 237, 218);   /* #FDEDDA */
--bg-pink-light: rgb(255, 235, 233);    /* #FFEBE9 */
--bg-purple-light: rgb(247, 241, 255);  /* #F7F1FF */
--bg-green-light: rgb(232, 245, 233);   /* #E8F5E9 */
```

### Neutrals

```css
--white: rgb(255, 255, 255);           /* Card backgrounds */
--off-white: rgb(248, 248, 247);       /* Subtle backgrounds */
--light-gray: rgb(236, 239, 241);      /* Dividers */
--gray: rgb(161, 161, 161);            /* Disabled states */
--gray-secondary: rgb(162, 162, 162);  /* Secondary text */
--slate-gray: rgb(132, 166, 188);      /* Muted accents */
--black: rgb(0, 0, 0);                 /* Strong emphasis */
```

---

## 2. Typography System

### Font Stack

```css
font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo,
             Consolas, "Liberation Mono", monospace;
```

**Philosophy:** Monospace throughout creates technical authenticity and brand recognition.

### Type Scale

| Token | Size | Usage |
|-------|------|-------|
| `xs` | 12px | Metadata, badges, labels |
| `sm` | 14px | Small UI text |
| `base` | 16px | Body text (default) |
| `lg` | 18px | Large body, small headings |
| `xl` | 20px | Subheadings |
| `2xl` | 24px | Section headings |
| `3xl` | 32px | Page headings |
| `4xl` | 44px | Feature headings |
| `5xl` | 48px | Large feature text |
| `6xl` | 56px | Hero headings |

### Heading Hierarchy

```css
h1 { font-size: 56px; line-height: 1.2; letter-spacing: 0.02em; font-weight: 400; }
h2 { font-size: 32px; line-height: 1.4; font-weight: 400; }
h3 { font-size: 24px; line-height: 1.4; font-weight: 400; }
h4-h6 { font-size: 18px; line-height: 1.4; font-weight: 400; }
```

### Text Treatments

- **Uppercase** for badges, labels, and CTAs
- **Tracking-wide** (0.02em-0.05em) for uppercase text
- **Line-height** 1.5 for body, 1.2-1.4 for headings
- **Font-weight** 400 (normal) as default, bold for emphasis

---

## 3. Spacing System

**Base unit:** 4px

```css
--space-0.5: 2px;
--space-1: 4px;
--space-1.5: 6px;
--space-2: 8px;
--space-2.5: 10px;
--space-3: 12px;
--space-3.5: 14px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-7: 28px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-14: 56px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;
--space-28: 112px;
--space-32: 128px;
```

---

## 4. Border System

### Border Radius

**Critical design principle:** Only 2px radius for all rectangular elements.

```css
--radius-none: 0px;
--radius-sm: 2px;
--radius-default: 2px;
--radius-md: 2px;
--radius-lg: 2px;
--radius-full: 9999px; /* Only for circles/avatars */
```

### Border Width

```css
--border-default: 2px;
--border-4: 4px; /* For emphasis */
```

**Standard border:** `border-2 border-charcoal`

---

## 5. Shadow System

**Brutalist hard offset shadows** - no blur, pure geometric depth.

```css
--shadow-sm: rgb(56, 56, 56) -4px 4px 0px 0px;
--shadow-default: rgb(56, 56, 56) -4px 4px 0px 0px;
--shadow-md: rgb(56, 56, 56) -8px 8px 0px 0px;
--shadow-lg: rgb(56, 56, 56) -12px 12px 0px 0px;
--shadow-xl: rgb(56, 56, 56) -16px 16px 0px 0px;
```

**Pattern:** Negative X (left), Positive Y (bottom), creating bottom-left depth.

### Hover Shadow Effect

```css
/* Default state */
box-shadow: rgb(56, 56, 56) -4px 4px 0px 0px;

/* Hover state */
transform: translate(2px, -2px);
box-shadow: rgb(56, 56, 56) -8px 8px 0px 0px;
```

---

## 6. Animation System

### Transition Durations

```css
--duration-fast: 120ms;   /* Hover effects */
--duration-default: 200ms; /* Standard transitions */
--duration-slow: 300ms;   /* Complex animations */
```

### Timing Functions

```css
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease: cubic-bezier(0.4, 0, 1, 1);
```

### Keyframe Animations

**Brutalist Hover:**
```css
@keyframes brutalist-hover {
  0% { transform: translate(0, 0); box-shadow: -4px 4px 0px 0px; }
  100% { transform: translate(2px, -2px); box-shadow: -8px 8px 0px 0px; }
}
```

**Shimmer (loading):**
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

### Framer Motion Patterns

- **Entry animations:** scale from 0, fade in, stagger children
- **Spring transitions:** for playful bounce effects
- **Confetti:** randomized rotation, scale, and position for celebrations

---

## 7. Component Patterns

### Button

```tsx
// Base styles
"inline-flex items-center justify-center gap-2 font-mono text-base
font-normal uppercase transition-all duration-fast"

// Default variant
"bg-duck-blue text-charcoal border-2 border-charcoal shadow-sm
hover:shadow-md hover:translate-x-0.5 hover:-translate-y-0.5"

// Sizes
default: h-[50px] px-6 py-4
sm: h-[42px] px-5 py-3 text-sm
lg: h-[58px] px-8 py-5 text-lg
icon: h-[50px] w-[50px]
```

### Badge

```tsx
// Base styles
"inline-flex items-center border-2 border-charcoal px-3 py-1
font-mono text-xs font-normal uppercase tracking-wide"

// Variants
default: "bg-duck-blue text-charcoal"
secondary: "bg-off-white text-charcoal"
destructive: "bg-coral text-white"
success: "bg-teal-primary text-white"
```

### Card Pattern (LetterCardV3)

```tsx
<article className={cn(
  "relative border-2 p-5 transition-all duration-150",
  "hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
  "shadow-[2px_2px_0_theme(colors.charcoal)]",
  statusConfig.borderColor,
  statusConfig.bgColor
)} style={{ borderRadius: "2px" }}>
  {/* Floating Badge */}
  <div className="absolute -top-3 left-4 flex items-center gap-1.5
                  px-2 py-0.5 font-mono text-[10px] font-bold
                  uppercase tracking-wider">
    {icon}
    <span>{statusConfig.badgeText}</span>
  </div>

  {/* Content */}

  {/* Dashed Separator */}
  <div className="w-full border-t-2 border-dashed border-charcoal/10 mb-3" />

  {/* Footer */}
</article>
```

### Floating Badge Pattern

A distinctive V3 element - badges that "float" above the card border:

```tsx
<div className="absolute -top-3 left-4 flex items-center gap-1.5
                px-2 py-0.5 bg-duck-yellow font-mono text-[10px]
                font-bold uppercase tracking-wider text-charcoal"
     style={{ borderRadius: "2px" }}>
  <Icon className="h-4 w-4" />
  <span>Label</span>
</div>
```

### Input

```tsx
// Base styles
"h-[54px] w-full border-2 border-charcoal bg-white px-4
font-mono text-base text-charcoal"

// Focus state
"focus:border-duck-blue focus:ring-2 focus:ring-duck-blue/20 focus:outline-none"

// Disabled
"disabled:bg-off-white disabled:opacity-60"
```

---

## 8. Status Color Mapping

| Status | Border | Badge BG | Badge Text | Icon |
|--------|--------|----------|------------|------|
| Draft | `border-duck-yellow` | `bg-duck-yellow` | `text-charcoal` | FileEdit |
| Scheduled | `border-duck-blue` | `bg-duck-blue` | `text-charcoal` | Clock |
| Delivered | `border-teal-primary` | `bg-teal-primary` | `text-white` | Mail |
| Failed | `border-coral` | `bg-coral` | `text-white` | AlertCircle |

---

## 9. Layout Patterns

### Container

```css
container: {
  center: true,
  padding: "2rem",
  screens: {
    "2xl": "1400px"
  }
}
```

### Section Spacing

- Section padding: 80-120px vertical
- Component gaps: 16-24px (gap-4 to gap-6)
- Card internal padding: 20-32px (p-5 to p-8)

### Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablets |
| `lg` | 1024px | Desktop |
| `2xl` | 1400px | Large screens |

---

## 10. Visual Hierarchy Principles

### Primary Emphasis
- `duck-blue` backgrounds for primary CTAs
- Larger shadows (`shadow-md`, `shadow-lg`)
- Larger text sizes

### Secondary Emphasis
- `off-white` or `white` backgrounds
- Smaller shadows (`shadow-sm`)
- Standard text sizes

### Tertiary/Disabled
- `gray-secondary` text color
- `opacity-60` for disabled states
- No shadows

### Separation
- Dashed borders (`border-dashed border-charcoal/10`)
- Used for visual breaks within cards

---

## 11. Icon Usage

**Library:** Lucide React

**Standard settings:**
- Size: `h-4 w-4` (16px) for inline icons
- Size: `h-8 w-8` (32px) for feature icons
- Stroke width: 2 (default) or 1.5 (for larger icons)

**Common icons:**
- `Mail` - letters, delivery
- `Clock` - scheduled
- `FileEdit` - draft
- `AlertCircle` - error/failed
- `ArrowRight` - navigation, CTA
- `Lock` - locked content
- `Check` - success
- `Stamp` - sealing
- `Sparkles` - celebration

---

## 12. Skeleton/Loading Patterns

```tsx
<div className="animate-pulse">
  <div className="h-5 w-24 bg-charcoal/20" style={{ borderRadius: "2px" }} />
  <div className="h-4 w-3/4 bg-charcoal/10" style={{ borderRadius: "2px" }} />
</div>
```

**Colors:**
- Primary skeleton: `bg-charcoal/20`
- Secondary skeleton: `bg-charcoal/10`

---

## 13. Confetti/Celebration Colors

```ts
const CONFETTI_COLORS = [
  "#3D9A8B", // teal-primary variant
  "#FFD93D", // duck-yellow variant
  "#6FC2FF", // duck-blue
  "#FF6B6B", // coral variant
  "#383838", // charcoal
]
```

---

## 14. CSS Utility Classes

Custom brutalist utilities defined in `globals.css`:

```css
.brutalist-shadow-sm { box-shadow: rgb(56, 56, 56) -4px 4px 0px 0px; }
.brutalist-shadow-md { box-shadow: rgb(56, 56, 56) -8px 8px 0px 0px; }
.brutalist-shadow-lg { box-shadow: rgb(56, 56, 56) -12px 12px 0px 0px; }

.brutalist-hover-effect {
  @apply transition-all duration-fast;
  box-shadow: rgb(56, 56, 56) -4px 4px 0px 0px;
}
.brutalist-hover-effect:hover {
  transform: translate(2px, -2px);
  box-shadow: rgb(56, 56, 56) -8px 8px 0px 0px;
}

.brutalist-border {
  @apply border-2 border-charcoal;
  border-radius: 2px;
}
```

---

## 15. Design Principles Summary

### DO:
- Use monospace fonts throughout
- Apply 2px border-radius consistently
- Use hard offset shadows (no blur)
- Create visual hierarchy with color and size
- Use floating badges for card labels
- Apply uppercase to badges and CTAs
- Use dashed separators within cards

### DON'T:
- Use rounded corners (except circles)
- Use soft/blurred shadows
- Mix font families
- Use gradients (flat colors only)
- Over-animate (keep transitions purposeful)
- Use generic web patterns

---

## 16. Implementation Checklist

When creating new V3 components:

- [ ] Use `style={{ borderRadius: "2px" }}` on all rectangular elements
- [ ] Apply `border-2 border-charcoal` for visible borders
- [ ] Use offset shadow classes for depth
- [ ] Apply `font-mono` and appropriate size
- [ ] Use uppercase with `tracking-wide/wider` for labels
- [ ] Implement hover states with translate + shadow increase
- [ ] Use status colors consistently
- [ ] Add skeleton states for async content
- [ ] Test at all responsive breakpoints

---

## Appendix: Quick Reference

### Essential Tailwind Classes

```tsx
// Card base
"border-2 border-charcoal bg-white p-5 shadow-[2px_2px_0_theme(colors.charcoal)]"

// Hover effect
"hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]"

// Floating badge
"absolute -top-3 left-4 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider"

// Button base
"h-[50px] px-6 py-4 font-mono uppercase border-2 border-charcoal shadow-sm"

// Input base
"h-[54px] px-4 border-2 border-charcoal bg-white font-mono"

// Dashed separator
"border-t-2 border-dashed border-charcoal/10"

// Section container
"w-full border-2 border-charcoal bg-duck-cream p-8 md:p-12"
```

---

*This design system documentation enables consistent V3 component development across the Capsule Note application.*
