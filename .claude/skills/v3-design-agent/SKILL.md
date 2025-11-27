---
name: v3-design-agent
description: Capsule Note V3 design agent for creating neo-brutalist UI components and pages. Use when building new components, designing page variations, exploring UI alternatives, or creating design sandboxes. Triggers on terms like "v3 design", "design variation", "component design", "sandbox", "neo-brutalist", "design exploration", "UI alternatives".
---

# V3 Design Agent - Neo-Brutalist UI Design System

This skill transforms you into Capsule Note's V3 design agent, capable of creating authentic neo-brutalist UI components with deep thinking about design best practices and multiple variations.

## When to Use This Skill

Activate when:
- Building new V3 components or pages
- Creating design variations or alternatives
- Exploring UI best practices for a feature
- Building design sandboxes for comparison
- Any request mentioning "v3 design", "component variations", or "design exploration"

**DO NOT** use for:
- Marketing pages (different design system)
- Backend/API work
- Non-V3 components

## Skill Mindset

When activated, adopt this thinking pattern:

```
1. UNDERSTAND: Read the design system, analyze existing patterns
2. ULTRATHINK: Deep analysis of best practices and possibilities
3. EXPLORE: Generate 5+ variations with distinct purposes
4. BUILD: Create interactive sandbox with state controls
5. DOCUMENT: Explain rationale for each variation
```

## V3 Design System Fundamentals

### Core Visual Language

```typescript
// MANDATORY CONSTRAINTS - Never violate these
const V3_CONSTRAINTS = {
  borderRadius: "2px",  // ONLY 2px, never rounded-lg, rounded-full, etc.
  border: "border-2 border-charcoal",
  shadow: "shadow-[2px_2px_0_theme(colors.charcoal)]",  // Hard offset, no blur
  shadowHover: "shadow-[4px_4px_0_theme(colors.charcoal)]",  // Larger on hover
  fontFamily: "font-mono",  // Monospace everywhere
  textTransform: "uppercase tracking-wider",  // For labels/buttons
}
```

### Color Palette

| Token | Hex | Purpose |
|-------|-----|---------|
| `duck-yellow` | #FFDE00 | Primary CTA, drafts, highlights |
| `duck-blue` | #6FC2FF | Secondary CTA, scheduled states |
| `teal-primary` | #38C1B0 | Success, delivered, positive |
| `coral` | #FF7169 | Error, warning, destructive |
| `charcoal` | #383838 | Text, borders, shadows |
| `cream` | #F4EFE2 | Page backgrounds |

### Typography Scale

```css
/* All text uses monospace */
font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;

/* Sizes */
text-xs    /* 12px - badges, metadata */
text-sm    /* 14px - body small */
text-base  /* 16px - body default */
text-lg    /* 18px - large body */
text-xl    /* 20px - subheadings */
text-2xl   /* 24px - headings */
text-3xl   /* 30px - page titles */
```

### Component Patterns

**Button Pattern:**
```tsx
<button
  className={cn(
    "flex items-center gap-2 border-2 border-charcoal px-4 py-2",
    "font-mono text-xs font-bold uppercase tracking-wider",
    "transition-all hover:-translate-y-0.5",
    "hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
    // Variants
    isPrimary && "bg-duck-yellow text-charcoal",
    isSecondary && "bg-teal-primary text-white",
    isDestructive && "bg-coral text-white",
    isGhost && "bg-white text-charcoal",
  )}
  style={{ borderRadius: "2px" }}
>
  <Icon className="h-4 w-4" strokeWidth={2} />
  Button Text
</button>
```

**Card Pattern:**
```tsx
<div
  className="border-2 border-charcoal bg-white p-6 shadow-[2px_2px_0_theme(colors.charcoal)]"
  style={{ borderRadius: "2px" }}
>
  {/* Card content */}
</div>
```

**Badge Pattern:**
```tsx
<span
  className={cn(
    "inline-flex items-center gap-1 border-2 px-2 py-0.5",
    "font-mono text-[10px] font-bold uppercase tracking-wider",
    variant === "success" && "border-teal-primary bg-teal-primary/10 text-teal-primary",
    variant === "warning" && "border-duck-yellow bg-duck-yellow/10 text-charcoal",
    variant === "error" && "border-coral bg-coral/10 text-coral",
  )}
  style={{ borderRadius: "2px" }}
>
  <StatusIcon className="h-3 w-3" />
  {label}
</span>
```

## Design Process Workflow

### Step 1: Context Gathering

Before designing, always read:

1. **Design System Report**: `claudedocs/APPV3_DESIGN_SYSTEM_REPORT.md`
2. **Existing Components**: Browse `components/v3/` for patterns
3. **Current Implementation**: Read the file you're designing for

```bash
# Files to check
apps/web/app/[locale]/(app-v3)/        # V3 app routes
apps/web/components/v3/                 # V3 components
claudedocs/APPV3_DESIGN_SYSTEM_REPORT.md  # Design system
```

### Step 2: Sequential Deep Thinking

Use the `mcp__sequential-thinking__sequentialthinking` tool to explore design possibilities:

```json
{
  "thought": "Analyzing the component requirements...",
  "thoughtNumber": 1,
  "totalThoughts": 8,
  "nextThoughtNeeded": true
}
```

**Think through:**
1. What is the component's primary purpose?
2. What emotional state is the user in when using it?
3. What are 5+ different approaches to solve this?
4. What are the trade-offs of each approach?
5. How does this fit with existing patterns?
6. What are best practices from similar products?
7. What accessibility considerations matter?
8. Which variations should we prototype?

### Step 3: Generate 5+ Variations

For EVERY design task, create at least 5 distinct variations:

| Variation | Focus | When to Use |
|-----------|-------|-------------|
| **Minimal** | Simplicity, focus | Low cognitive load needed |
| **Information-Dense** | Efficiency | Power users, data-heavy |
| **Visual-First** | Aesthetics, delight | First impressions, marketing |
| **Action-Oriented** | Conversion, CTAs | Purchase flows, sign-ups |
| **Contextual** | Adapts to state | Different user situations |

### Step 4: Build Interactive Sandbox

Create a sandbox page with:

```tsx
"use client"

import { useState } from "react"

// Variation type for switching
type Variation = "minimal" | "dense" | "visual" | "action" | "contextual"

// State type for different scenarios
type ComponentState = "empty" | "low" | "normal" | "full"

export default function SandboxPage() {
  const [variation, setVariation] = useState<Variation>("minimal")
  const [state, setState] = useState<ComponentState>("normal")

  return (
    <div className="container py-12 space-y-8">
      {/* Header */}
      <header>
        <h1 className="font-mono text-3xl font-bold uppercase">
          Component Sandbox
        </h1>
        <p className="font-mono text-sm text-charcoal/70">
          Design explorations and variations
        </p>
      </header>

      {/* Controls */}
      <div className="flex gap-4">
        {/* Variation selector */}
        <div className="flex gap-2">
          {(["minimal", "dense", "visual", "action", "contextual"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setVariation(v)}
              className={cn(
                "border-2 border-charcoal px-3 py-1 font-mono text-xs uppercase",
                variation === v ? "bg-duck-yellow" : "bg-white"
              )}
              style={{ borderRadius: "2px" }}
            >
              {v}
            </button>
          ))}
        </div>

        {/* State selector */}
        <div className="flex gap-2">
          {(["empty", "low", "normal", "full"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setState(s)}
              className={cn(
                "border-2 border-charcoal px-3 py-1 font-mono text-xs uppercase",
                state === s ? "bg-teal-primary text-white" : "bg-white"
              )}
              style={{ borderRadius: "2px" }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Preview Area */}
      <div className="border-2 border-charcoal p-8 bg-cream" style={{ borderRadius: "2px" }}>
        {variation === "minimal" && <MinimalVariation state={state} />}
        {variation === "dense" && <DenseVariation state={state} />}
        {variation === "visual" && <VisualVariation state={state} />}
        {variation === "action" && <ActionVariation state={state} />}
        {variation === "contextual" && <ContextualVariation state={state} />}
      </div>

      {/* Best Practices Section */}
      <BestPracticesGuide variation={variation} />
    </div>
  )
}
```

### Step 5: Document Design Rationale

Include a "Best Practices" section explaining:

```tsx
function BestPracticesGuide({ variation }: { variation: Variation }) {
  const practices = {
    minimal: {
      title: "Minimal Design",
      when: "Use when users need to focus on a single action",
      strengths: ["Low cognitive load", "Fast decisions", "Mobile-friendly"],
      weaknesses: ["Less information density", "Multiple steps for complex tasks"],
    },
    // ... other variations
  }

  return (
    <div className="border-2 border-charcoal bg-white p-6" style={{ borderRadius: "2px" }}>
      <h2 className="font-mono text-xl font-bold uppercase mb-4">
        Design Rationale: {practices[variation].title}
      </h2>
      {/* Render strengths, weaknesses, use cases */}
    </div>
  )
}
```

## Component Design Templates

### Credit Purchase Components

**Key considerations:**
- Tiered discount logic (5→10%, 10→15%, 25→20%, 50→25%)
- Visual urgency when credits are low/empty
- Multi-quantity selection (stepper, packs, slider)
- Clear price breakdown with savings highlighted

**Variations to create:**
1. **Quantity Stepper**: Precise control with +/- buttons
2. **Quick Packs**: Pre-set popular quantities with badges
3. **Urgency Widget**: Adapts messaging to credit status
4. **Tabbed Panel**: Email/Physical tabs with comparison
5. **Inline Adder**: Compact for embedding in other components

### Letter Detail Views

**Key considerations:**
- Letter states: draft, scheduled, delivered-unopened, delivered-opened
- Emotional journey: writing → anticipation → ceremony → reading
- Content hierarchy: title, date, body, metadata

**Variations to create:**
1. **Immersive Reader**: Maximum reading comfort, large serif text
2. **Journey Timeline**: Visual storytelling of letter's journey
3. **Split Panel**: Magazine-style with sidebar metadata
4. **Card Stack**: Physical envelope metaphor with animations
5. **Focused States**: Different experience per state

### Form Components

**Key considerations:**
- Validation feedback (inline, summary, toast)
- Field grouping and progressive disclosure
- Mobile-first layouts
- Accessibility (labels, ARIA, focus management)

**Variations to create:**
1. **Single Column**: Simple, linear progression
2. **Grouped Sections**: Collapsible fieldsets
3. **Wizard Steps**: Multi-page with progress
4. **Side-by-Side**: Label and input on same row
5. **Floating Labels**: Space-efficient with animation

## Animation Guidelines

### Allowed Animations

```tsx
// Hover lift effect
"transition-all hover:-translate-y-0.5"

// Shadow grow on hover
"hover:shadow-[4px_4px_0_theme(colors.charcoal)]"

// Framer Motion for complex animations
import { motion, AnimatePresence } from "framer-motion"

// Enter/exit animations
<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      Content
    </motion.div>
  )}
</AnimatePresence>
```

### Animation Don'ts

- No rounded corners animating
- No blur effects
- No gradients animating
- Keep all transitions under 300ms
- Respect `prefers-reduced-motion`

## Accessibility Checklist

Before finalizing any design:

- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Focus states visible (2px outline offset)
- [ ] Interactive elements have accessible names
- [ ] Error messages announced to screen readers
- [ ] Keyboard navigation works intuitively
- [ ] Touch targets minimum 44x44px on mobile

## Files Reference

### Always Read First
- `claudedocs/APPV3_DESIGN_SYSTEM_REPORT.md` - Complete design system
- `apps/web/tailwind.config.ts` - Color tokens and theme

### Component Patterns
- `components/v3/nav/` - Navigation components
- `components/v3/letter-card-v3.tsx` - Card patterns
- `components/v3/credit-warning-banner.tsx` - Banner patterns
- `components/v3/unlock-sealed-v3.tsx` - Animation patterns

### Page Patterns
- `app/[locale]/(app-v3)/letters-v3/[id]/page.tsx` - Detail page pattern
- `app/[locale]/(app-v3)/dashboard-v3/page.tsx` - Dashboard pattern
- `app/[locale]/(app-v3)/credits-sandbox/page.tsx` - Sandbox pattern

## Quality Checklist

Before completing any design task:

- [ ] Used ONLY 2px border-radius (`style={{ borderRadius: "2px" }}`)
- [ ] Used hard offset shadows (no blur)
- [ ] Used monospace font throughout (`font-mono`)
- [ ] Used uppercase tracking for labels (`uppercase tracking-wider`)
- [ ] Created 5+ distinct variations
- [ ] Built interactive sandbox with state controls
- [ ] Documented design rationale
- [ ] TypeScript compiles without errors
- [ ] Follows existing component patterns
- [ ] Accessibility requirements met

## Example: Complete Design Task

**User request:** "Design a subscription upgrade modal for V3"

**Process:**

1. **Read context:**
   - Check existing modals in `components/v3/`
   - Read design system report
   - Understand subscription tiers

2. **Sequential thinking:** (8 thoughts minimum)
   - Modal purpose and user emotional state
   - 5+ layout approaches
   - Animation considerations
   - Mobile responsiveness
   - Accessibility requirements

3. **Create variations:**
   - Minimal: Single CTA, essential info only
   - Comparison: Side-by-side tier comparison
   - Journey: Step-by-step upgrade flow
   - Urgency: Countdown/limited offer focused
   - Social Proof: Reviews/testimonials integrated

4. **Build sandbox:**
   - Create page at `credits-sandbox/upgrade-modal/page.tsx`
   - Add variation switcher
   - Add mock subscription states
   - Include best practices documentation

5. **Validate:**
   - Run `npx tsc --noEmit` to check types
   - Verify 2px radius constraint
   - Check color usage
   - Test keyboard navigation
