# V3 Design Quick Reference

Copy-paste ready patterns for V3 neo-brutalist design.

## Essential CSS Classes

### Border & Radius
```tsx
// ALWAYS use inline style for radius
style={{ borderRadius: "2px" }}

// Border
className="border-2 border-charcoal"
```

### Shadows
```tsx
// Default shadow
className="shadow-[2px_2px_0_theme(colors.charcoal)]"

// Hover shadow (larger)
className="hover:shadow-[4px_4px_0_theme(colors.charcoal)]"

// Colored shadows
className="shadow-[2px_2px_0_theme(colors.duck-yellow)]"
className="shadow-[2px_2px_0_theme(colors.teal-primary)]"
className="shadow-[2px_2px_0_theme(colors.coral)]"
```

### Typography
```tsx
// Monospace (always)
className="font-mono"

// Uppercase labels
className="font-mono text-xs font-bold uppercase tracking-wider"

// Body text
className="font-mono text-sm text-charcoal"

// Muted text
className="font-mono text-xs text-charcoal/60"
```

### Hover Effects
```tsx
// Lift on hover
className="transition-all hover:-translate-y-0.5"

// Full button hover
className="transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]"
```

## Color Tokens

### Primary
| Class | Usage |
|-------|-------|
| `bg-duck-yellow` | Primary CTA, drafts |
| `bg-duck-blue` | Secondary CTA, scheduled |
| `bg-teal-primary` | Success, delivered |
| `bg-coral` | Error, destructive |
| `bg-charcoal` | Dark backgrounds |
| `bg-cream` | Page background |
| `bg-white` | Card backgrounds |

### Text Colors
| Class | Usage |
|-------|-------|
| `text-charcoal` | Primary text |
| `text-charcoal/70` | Secondary text |
| `text-charcoal/50` | Muted text |
| `text-white` | On dark backgrounds |

### Border Colors
| Class | Usage |
|-------|-------|
| `border-charcoal` | Default borders |
| `border-charcoal/20` | Subtle borders |
| `border-duck-yellow` | Highlight borders |
| `border-teal-primary` | Success borders |
| `border-coral` | Error borders |

## Component Snippets

### Primary Button
```tsx
<button
  className={cn(
    "flex items-center gap-2 border-2 border-charcoal bg-duck-yellow px-4 py-2",
    "font-mono text-xs font-bold uppercase tracking-wider text-charcoal",
    "transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
  )}
  style={{ borderRadius: "2px" }}
>
  <Icon className="h-4 w-4" strokeWidth={2} />
  Button Text
</button>
```

### Secondary Button
```tsx
<button
  className={cn(
    "flex items-center gap-2 border-2 border-charcoal bg-teal-primary px-4 py-2",
    "font-mono text-xs font-bold uppercase tracking-wider text-white",
    "transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]"
  )}
  style={{ borderRadius: "2px" }}
>
  Button Text
</button>
```

### Ghost Button
```tsx
<button
  className={cn(
    "flex items-center gap-2 border-2 border-charcoal bg-white px-4 py-2",
    "font-mono text-xs font-bold uppercase tracking-wider text-charcoal",
    "transition-all hover:-translate-y-0.5 hover:shadow-[2px_2px_0_theme(colors.charcoal)]"
  )}
  style={{ borderRadius: "2px" }}
>
  Button Text
</button>
```

### Card
```tsx
<div
  className="border-2 border-charcoal bg-white p-6 shadow-[2px_2px_0_theme(colors.charcoal)]"
  style={{ borderRadius: "2px" }}
>
  <h3 className="font-mono text-lg font-bold uppercase tracking-wide text-charcoal">
    Card Title
  </h3>
  <p className="font-mono text-sm text-charcoal/70 mt-2">
    Card description text goes here.
  </p>
</div>
```

### Badge (Success)
```tsx
<span
  className="inline-flex items-center gap-1 border-2 border-teal-primary bg-teal-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-teal-primary"
  style={{ borderRadius: "2px" }}
>
  <CheckCircle className="h-3 w-3" />
  Success
</span>
```

### Badge (Warning)
```tsx
<span
  className="inline-flex items-center gap-1 border-2 border-duck-yellow bg-duck-yellow/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal"
  style={{ borderRadius: "2px" }}
>
  <AlertTriangle className="h-3 w-3" />
  Warning
</span>
```

### Badge (Error)
```tsx
<span
  className="inline-flex items-center gap-1 border-2 border-coral bg-coral/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-coral"
  style={{ borderRadius: "2px" }}
>
  <XCircle className="h-3 w-3" />
  Error
</span>
```

### Input Field
```tsx
<input
  type="text"
  className={cn(
    "w-full border-2 border-charcoal bg-white px-3 py-2",
    "font-mono text-sm text-charcoal placeholder:text-charcoal/40",
    "focus:outline-none focus:ring-2 focus:ring-duck-yellow focus:ring-offset-1"
  )}
  style={{ borderRadius: "2px" }}
  placeholder="Enter text..."
/>
```

### Select Dropdown
```tsx
<select
  className={cn(
    "w-full border-2 border-charcoal bg-white px-3 py-2 pr-8",
    "font-mono text-sm text-charcoal appearance-none",
    "focus:outline-none focus:ring-2 focus:ring-duck-yellow"
  )}
  style={{ borderRadius: "2px" }}
>
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

### Section Header
```tsx
<div className="flex items-center gap-3 mb-6">
  <div
    className="flex h-8 w-8 items-center justify-center border-2 border-charcoal bg-duck-yellow"
    style={{ borderRadius: "2px" }}
  >
    <Icon className="h-4 w-4 text-charcoal" strokeWidth={2} />
  </div>
  <h2 className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal">
    Section Title
  </h2>
</div>
```

### Alert/Banner
```tsx
<div
  className="flex items-start gap-3 border-2 border-coral bg-coral/10 p-4"
  style={{ borderRadius: "2px" }}
>
  <AlertTriangle className="h-5 w-5 text-coral flex-shrink-0 mt-0.5" />
  <div>
    <h4 className="font-mono text-sm font-bold uppercase text-coral">
      Alert Title
    </h4>
    <p className="font-mono text-xs text-charcoal/70 mt-1">
      Alert description text.
    </p>
  </div>
</div>
```

### Tab Navigation
```tsx
<div className="flex border-b-2 border-charcoal">
  {tabs.map((tab) => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={cn(
        "px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider",
        "border-2 border-charcoal -mb-0.5",
        activeTab === tab.id
          ? "bg-white border-b-white"
          : "bg-charcoal/5 hover:bg-charcoal/10"
      )}
      style={{ borderRadius: "2px 2px 0 0" }}
    >
      {tab.label}
    </button>
  ))}
</div>
```

### Divider with Label
```tsx
<div className="flex items-center gap-4 my-6">
  <div className="flex-1 h-0.5 bg-charcoal/20" />
  <span className="font-mono text-xs uppercase tracking-wider text-charcoal/50">
    Or
  </span>
  <div className="flex-1 h-0.5 bg-charcoal/20" />
</div>
```

## Icon Guidelines

Always use Lucide icons with:
```tsx
<IconName className="h-4 w-4" strokeWidth={2} />
```

Common sizes:
- `h-3 w-3` - In badges
- `h-4 w-4` - In buttons, inline
- `h-5 w-5` - Standalone, alerts
- `h-6 w-6` - Feature icons

## Animation Patterns

### Enter Animation (Framer Motion)
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.2 }}
>
  Content
</motion.div>
```

### Exit Animation
```tsx
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

### Staggered List
```tsx
{items.map((item, i) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: i * 0.1 }}
  >
    {item.content}
  </motion.div>
))}
```

## Don't Do

```tsx
// WRONG - Never use these
className="rounded-lg"           // Use style={{ borderRadius: "2px" }}
className="rounded-full"         // Never round corners
className="shadow-lg"            // Use offset shadows
className="shadow-md"            // Use offset shadows
className="blur-sm"              // No blur effects
className="bg-gradient-to-r"     // No gradients
className="sans-serif"           // Always monospace
```

## Responsive Patterns

```tsx
// Mobile-first approach
className="px-4 sm:px-6 lg:px-8"
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
className="flex flex-col md:flex-row gap-4"
className="text-sm md:text-base"
```

## State Management Patterns

### Loading State
```tsx
{isPending ? (
  <div className="flex items-center gap-2">
    <Loader2 className="h-4 w-4 animate-spin" />
    <span className="font-mono text-xs uppercase">Loading...</span>
  </div>
) : (
  <span>Content</span>
)}
```

### Empty State
```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <div
    className="flex h-16 w-16 items-center justify-center border-2 border-charcoal/20 bg-charcoal/5 mb-4"
    style={{ borderRadius: "2px" }}
  >
    <Inbox className="h-8 w-8 text-charcoal/40" />
  </div>
  <h3 className="font-mono text-lg font-bold text-charcoal">
    No items yet
  </h3>
  <p className="font-mono text-sm text-charcoal/60 mt-1">
    Get started by creating your first item.
  </p>
</div>
```

### Error State
```tsx
<div
  className="border-2 border-coral bg-coral/10 p-4"
  style={{ borderRadius: "2px" }}
>
  <div className="flex items-center gap-2">
    <AlertTriangle className="h-5 w-5 text-coral" />
    <span className="font-mono text-sm font-bold text-coral">
      Something went wrong
    </span>
  </div>
  <p className="font-mono text-xs text-charcoal/70 mt-2">
    {error.message}
  </p>
</div>
```
