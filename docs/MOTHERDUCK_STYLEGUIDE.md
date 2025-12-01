# MotherDuck Design System Style Guide

**Website:** https://motherduck.com/
**Analysis Date:** November 9, 2025
**Design Philosophy:** Playful, approachable data platform with a distinctive duck-themed brand identity featuring bold colors, geometric shapes, and a brutalist-inspired aesthetic.

---

## Table of Contents

1. [Overview](#overview)
2. [Color Palette](#color-palette)
3. [Typography System](#typography-system)
4. [Spacing & Layout](#spacing--layout)
5. [Component Patterns](#component-patterns)
6. [Visual Design Elements](#visual-design-elements)
7. [Brand Elements](#brand-elements)
8. [Code Examples](#code-examples)

---

## Overview

MotherDuck's design system embraces a unique, playful aesthetic that stands out in the enterprise data tooling space. The design combines:

- **Brutalist influences**: Hard edges, prominent borders, minimal border radius (2px only)
- **Vibrant color palette**: Duck-themed yellows, teals, and accent colors
- **Monospace typography**: Distinctive "Aeonik Mono" font family for technical authenticity
- **Geometric simplicity**: Clean shapes, strong contrast, bold shadows
- **Accessibility-first**: Clear contrast ratios, readable type sizes

The overall feel is friendly yet professional, technical yet approachable—perfectly aligned with their "Ducking Simple" brand promise.

---

## Color Palette

### Primary Colors

```css
/* Brand Primary */
--duck-yellow: rgb(255, 222, 0);        /* #FFDE00 - Primary brand color */
--duck-blue: rgb(111, 194, 255);        /* #6FC2FF - Primary CTA background */
--charcoal: rgb(56, 56, 56);            /* #383838 - Primary text, borders */
--cream: rgb(244, 239, 234);            /* #F4EFEA - Body background */
```

### Secondary/Accent Colors

```css
/* Accent Colors */
--teal-primary: rgb(56, 193, 176);      /* #38C1B0 - Accent teal */
--teal-light: rgb(83, 219, 201);        /* #53DBC9 - Light teal variant */
--sky-blue: rgb(84, 180, 222);          /* #54B4DE - Sky blue accent */
--periwinkle: rgb(117, 151, 238);       /* #7597EE - Periwinkle accent */
--lavender: rgb(178, 145, 222);         /* #B291DE - Lavender accent */
--lime: rgb(179, 196, 25);              /* #B3C419 - Lime green accent */
--coral: rgb(255, 113, 105);            /* #FF7169 - Coral/error state */
--peach: rgb(245, 177, 97);             /* #F5B161 - Peach accent */
--salmon: rgb(243, 142, 132);           /* #F38E84 - Salmon accent */
--mustard: rgb(225, 196, 39);           /* #E1C427 - Mustard yellow */
```

### Neutral Colors

```css
/* Neutrals */
--white: rgb(255, 255, 255);            /* #FFFFFF - Card backgrounds */
--off-white: rgb(248, 248, 247);        /* #F8F8F7 - Subtle backgrounds */
--light-gray: rgb(236, 239, 241);       /* #ECEFF1 - Dividers, borders */
--gray: rgb(161, 161, 161);             /* #A1A1A1 - Disabled states */
--gray-secondary: rgb(162, 162, 162);   /* #A2A2A2 - Secondary text */
--slate-gray: rgb(132, 166, 188);       /* #84A6BC - Muted accent */
--black: rgb(0, 0, 0);                  /* #000000 - Strong emphasis */
```

### Background Tints (Pastel Variations)

```css
/* Light Background Tints */
--bg-blue-light: rgb(234, 240, 255);    /* #EAF0FF - Light blue background */
--bg-blue-pale: rgb(235, 249, 255);     /* #EBF9FF - Pale blue background */
--bg-yellow-pale: rgb(255, 253, 231);   /* #FFFDE7 - Pale yellow background */
--bg-yellow-cream: rgb(249, 251, 231);  /* #F9FBE7 - Yellow cream background */
--bg-peach-light: rgb(253, 237, 218);   /* #FDEDDA - Light peach background */
--bg-pink-light: rgb(255, 235, 233);    /* #FFEBE9 - Light pink/coral background */
--bg-purple-light: rgb(247, 241, 255);  /* #F7F1FF - Light purple background */
--bg-green-light: rgb(232, 245, 233);   /* #E8F5E9 - Light green background */
```

### Transparency Values

```css
/* Alpha Variations */
--overlay-dark: rgba(0, 0, 0, 0.7);           /* Dark overlay */
--overlay-light: rgba(248, 248, 247, 0.7);    /* Light overlay */
--blue-alpha: rgba(43, 165, 255, 0.4);        /* Blue with transparency */
```

### Color Usage Guidelines

**Primary CTA Buttons:**
- Background: `--duck-blue` (#6FC2FF)
- Text: `--charcoal` (#383838)
- Border: 2px solid `--charcoal`

**Text:**
- Primary: `--charcoal` (#383838)
- Secondary: `--gray-secondary` (#A2A2A2)
- Disabled: `--gray` (#A1A1A1)

**Backgrounds:**
- Page: `--cream` (#F4EFEA)
- Cards/Sections: `--white` or light tints
- Feature sections: Rotate through accent colors for variety

**Borders:**
- Standard: 2px solid `--charcoal`
- Disabled: 2px solid `--gray`

---

## Typography System

### Font Families

```css
/* Primary Font Stack */
--font-primary: "Aeonik Mono", sans-serif;      /* Body text, headings */
--font-alternate: "Aeonik Fono", "Aeonik Mono"; /* Alternate variant */
--font-fallback: Inter, sans-serif;              /* Fallback system font */
--font-monospace: "Aeonik Mono", monospace;     /* Code/technical content */
```

**Note:** MotherDuck uses custom "Aeonik Mono" throughout—a distinctive monospace font that gives the brand its technical, approachable character.

### Font Sizes

```css
/* Type Scale (px values) */
--text-xs: 12px;      /* Fine print, captions */
--text-sm: 13px;      /* Small UI text */
--text-base: 14px;    /* Small body text */
--text-md: 16px;      /* Body text (base size) */
--text-lg: 18px;      /* Large body, small headings */
--text-xl: 20px;      /* Subheadings */
--text-2xl: 22px;     /* Medium headings */
--text-3xl: 24px;     /* Card headings */
--text-4xl: 32px;     /* Section headings (h2) */
--text-5xl: 44px;     /* Large headings */
--text-6xl: 48px;     /* Feature headings */
--text-7xl: 56px;     /* Hero headings (h1) */
```

### Heading Hierarchy

```css
/* H1 - Hero/Page Title */
h1 {
  font-family: "Aeonik Mono", sans-serif;
  font-size: 56px;
  font-weight: 400;
  line-height: 67.2px;        /* 1.2 ratio */
  letter-spacing: 1.12px;     /* 2% tracking */
  color: rgb(56, 56, 56);
}

/* H2 - Section Heading */
h2 {
  font-family: "Aeonik Mono", sans-serif;
  font-size: 32px;
  font-weight: 400;
  line-height: 44.8px;        /* 1.4 ratio */
  letter-spacing: normal;
  color: rgb(56, 56, 56);
}

/* H3 - Subsection Heading */
h3 {
  font-family: "Aeonik Mono", sans-serif;
  font-size: 18px;
  font-weight: 400;
  line-height: 25.2px;        /* 1.4 ratio */
  letter-spacing: normal;
  color: rgb(56, 56, 56);
}
```

### Body Text

```css
/* Body Copy */
body {
  font-family: "Aeonik Mono", sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 16px;          /* Tight leading for monospace */
  color: rgb(56, 56, 56);
  background-color: rgb(244, 239, 234);
}

/* Paragraph */
p {
  font-size: 16px;
  line-height: 1.5;           /* More comfortable for reading */
}
```

### Font Weight Scale

```css
/* MotherDuck uses minimal weight variation */
--font-normal: 400;           /* Primary weight used throughout */
```

**Note:** The design relies on font size hierarchy rather than weight variation, maintaining consistency with the monospace aesthetic.

### Typography Best Practices

1. **Line Height:** Use 1.2-1.4 for headings, 1.5 for body text
2. **Letter Spacing:** Only H1 uses positive tracking (2%), rest use normal
3. **Text Transform:** Uppercase for buttons/CTAs only
4. **Color:** Maintain 4.5:1 contrast minimum (WCAG AA)

---

## Spacing & Layout

### Spacing Scale

```css
/* Base 4px System with Common Values */
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-7: 28px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
--space-24: 96px;

/* Component-Specific Spacing */
--button-padding-y: 16.5px;
--button-padding-x: 22px;
--button-padding-y-sm: 11.5px;
--button-padding-x-sm: 18px;
--input-padding: 17.25px 23px;
```

### Layout Heights

```css
/* Navigation & Headers */
--eyebrow-mobile: 70px;
--eyebrow-desktop: 55px;
--header-mobile: 70px;
--header-desktop: 90px;
```

### Container & Grid

The site uses a flexible grid system without strict container widths. Key principles:

- **Flexible containers:** Content adapts to viewport
- **Generous whitespace:** Sections have ample breathing room
- **Asymmetric layouts:** Mix of full-width and contained content
- **Card-based design:** Content grouped in distinct white cards on cream background

### Responsive Breakpoints

While exact breakpoints weren't extracted, the design follows common patterns:

```css
/* Inferred Breakpoints */
--breakpoint-mobile: 768px;
--breakpoint-tablet: 1024px;
--breakpoint-desktop: 1280px;
```

### Layout Patterns

**Hero Section:**
- Large heading + subtitle
- 2-3 CTA buttons horizontal layout
- Hero image/illustration
- Cream background

**Feature Sections:**
- Alternating white/colored backgrounds
- 2-column layouts (text + image)
- Generous vertical spacing (80-120px)

**Card Grid:**
- 2-3 column responsive grid
- White cards with subtle shadows
- Consistent internal padding (24-32px)

---

## Component Patterns

### Buttons

#### Primary CTA Button

```css
.btn-primary {
  /* The signature MotherDuck button style */
  display: inline-flex;
  align-items: center;
  gap: 8px;

  padding: 16.5px 22px;
  font-family: "Aeonik Mono", sans-serif;
  font-size: 16px;
  font-weight: 400;
  text-transform: uppercase;

  color: rgb(56, 56, 56);
  background-color: rgb(111, 194, 255);  /* Duck blue */
  border: 2px solid rgb(56, 56, 56);
  border-radius: 2px;

  cursor: pointer;
  transition: box-shadow 0.12s ease-in-out, transform 0.12s ease-in-out;
}

.btn-primary:hover {
  /* Brutalist shadow on hover */
  box-shadow: rgb(56, 56, 56) -8px 8px 0px 0px;
  transform: translate(2px, -2px);
}
```

#### Secondary Button

```css
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;

  padding: 16.5px 22px;
  font-family: "Aeonik Mono", sans-serif;
  font-size: 16px;
  font-weight: 400;
  text-transform: uppercase;

  color: rgb(56, 56, 56);
  background-color: rgb(248, 248, 247);  /* Off-white */
  border: 2px solid rgb(56, 56, 56);
  border-radius: 2px;

  cursor: pointer;
  transition: box-shadow 0.12s ease-in-out, transform 0.12s ease-in-out;
}
```

#### Disabled Button

```css
.btn-disabled {
  padding: 17.25px 23px;
  font-family: "Aeonik Mono", sans-serif;
  font-size: 16px;
  text-transform: uppercase;

  color: rgb(161, 161, 161);          /* Gray text */
  background-color: rgb(248, 248, 247);
  border: 2px solid rgb(161, 161, 161);  /* Gray border */
  border-radius: 2px;

  cursor: not-allowed;
  opacity: 0.6;
}
```

### Links

```css
/* Standard Link */
a {
  color: rgb(56, 56, 56);
  text-decoration: none;
  transition: all 0.2s ease;
}

a:hover {
  opacity: 0.7;
}

/* Navigation Link */
.nav-link {
  font-family: "Aeonik Mono", sans-serif;
  font-size: 16px;
  color: rgb(56, 56, 56);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
```

### Forms

#### Input Field

```css
.form-input {
  padding: 17.25px 23px;
  font-family: "Aeonik Mono", sans-serif;
  font-size: 16px;

  color: rgb(56, 56, 56);
  background-color: rgb(255, 255, 255);
  border: 2px solid rgb(56, 56, 56);
  border-radius: 2px;

  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: rgb(111, 194, 255);  /* Blue on focus */
}

.form-input::placeholder {
  color: rgb(162, 162, 162);  /* Gray placeholder */
}
```

#### Checkbox

```css
.checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid rgb(56, 56, 56);
  border-radius: 2px;
  cursor: pointer;
}

.checkbox:checked {
  background-color: rgb(56, 56, 56);
}
```

### Cards

```css
.card {
  background-color: rgb(255, 255, 255);
  border: 2px solid rgb(56, 56, 56);
  border-radius: 2px;
  padding: 32px;

  /* Optional subtle shadow */
  box-shadow: rgb(56, 56, 56) -4px 4px 0px 0px;
}

.card-hover {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card-hover:hover {
  transform: translate(2px, -2px);
  box-shadow: rgb(56, 56, 56) -8px 8px 0px 0px;
}
```

### Navigation

```css
/* Desktop Header */
header {
  height: 90px;
  background-color: rgba(248, 248, 247, 0.7);  /* Semi-transparent */
  backdrop-filter: blur(10px);
  border-bottom: 2px solid rgb(56, 56, 56);
}

/* Mobile Header */
@media (max-width: 768px) {
  header {
    height: 70px;
  }
}
```

### Testimonial Cards

```css
.testimonial {
  background-color: rgb(255, 255, 255);
  padding: 32px;
  border: 2px solid rgb(56, 56, 56);
  border-radius: 2px;
}

.testimonial-quote {
  font-size: 18px;
  line-height: 1.6;
  color: rgb(56, 56, 56);
  margin-bottom: 24px;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 16px;
}

.testimonial-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;  /* Only circles use 50% radius */
  border: 2px solid rgb(56, 56, 56);
}
```

---

## Visual Design Elements

### Border Radius

```css
/* Minimal Border Radius - Brutalist Aesthetic */
--radius-sharp: 0px;        /* Sharp corners (default) */
--radius-subtle: 2px;       /* Subtle rounding (buttons, cards, inputs) */
--radius-circle: 50%;       /* Circles only (avatars, icons) */
```

**Usage:**
- **2px:** All rectangular UI elements (buttons, inputs, cards)
- **0px:** Dividers, hard edges
- **50%:** Avatar images, circular icons only

### Shadows

```css
/* Brutalist Hard Shadows */
--shadow-sm: rgb(56, 56, 56) -4px 4px 0px 0px;
--shadow-md: rgb(56, 56, 56) -8px 8px 0px 0px;
--shadow-lg: rgb(56, 56, 56) -12px 12px 0px 0px;

/* No soft/blurred shadows - only hard offset shadows */
```

**Shadow Philosophy:**
- Offset shadows only (no blur)
- Bottom-right offset creates depth
- Used sparingly for interactive elements
- Hover states increase shadow offset

### Animations & Transitions

```css
/* Standard Transition */
--transition-fast: 0.12s ease-in-out;
--transition-normal: 0.2s ease;
--transition-slow: 0.3s ease;

/* Common Transitions */
.interactive {
  transition: box-shadow 0.12s ease-in-out,
              transform 0.12s ease-in-out;
}

.fade {
  transition: opacity 0.2s ease;
}

.slide {
  transition: transform 0.3s ease;
}
```

**Animation Principles:**
- Fast interactions (120ms) for hover states
- Medium (200-300ms) for page transitions
- No excessive animation - minimal and purposeful
- Transform and shadow changes on hover

### Icons & Illustrations

**Style:**
- Flat, geometric shapes
- Duck-themed illustrations throughout
- Bold outlines (2px stroke weight)
- Limited color palette per illustration
- Playful, approachable aesthetic

**Icon Treatment:**
- Outlined style preferred
- 24px base size for UI icons
- Consistent stroke width (2px)
- Use brand colors for accents

### Image Treatment

```css
.hero-image {
  border: 2px solid rgb(56, 56, 56);
  border-radius: 2px;
  /* Images maintain the brutalist border treatment */
}

.illustration {
  /* Illustrations are borderless, integrated into colored backgrounds */
  border: none;
}
```

---

## Brand Elements

### Logo Usage

**Primary Logo:**
- MotherDuck wordmark with duck icon
- Monochrome charcoal on light backgrounds
- White version for dark backgrounds
- Maintain clear space around logo

**Logo Specifications:**
- Minimum size: 120px width for web
- Clear space: Minimum 20px on all sides
- Never distort or recolor arbitrarily

### Iconography

**Duck Mascot:**
- Central brand element
- Various expressions and poses
- Used throughout for personality
- Geometric, simplified style

**Duckling Size Icons:**
Different duck sizes represent instance types:
- Pulse (smallest)
- Standard
- Jumbo
- Mega
- Giga (largest)

Each has distinct visual treatment showing scale progression.

### Brand Voice in Design

**Visual Characteristics:**
- **Playful but professional:** Duck theme balanced with enterprise credibility
- **Technical authenticity:** Monospace font signals technical expertise
- **Bold and confident:** Strong colors, hard shadows, geometric shapes
- **Approachable:** Cream backgrounds, friendly illustrations soften technical subject

**Color Psychology:**
- Yellow: Optimism, energy (duck theme)
- Blue: Trust, reliability (data platform)
- Teal: Innovation, freshness
- Charcoal: Seriousness, technical depth

---

## Code Examples

### Complete Button Component (React/CSS)

```jsx
// Button.jsx
const Button = ({ variant = 'primary', children, disabled, ...props }) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '16.5px 22px',
    fontFamily: '"Aeonik Mono", sans-serif',
    fontSize: '16px',
    fontWeight: '400',
    textTransform: 'uppercase',
    border: '2px solid rgb(56, 56, 56)',
    borderRadius: '2px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'box-shadow 0.12s ease-in-out, transform 0.12s ease-in-out',
  };

  const variants = {
    primary: {
      color: 'rgb(56, 56, 56)',
      backgroundColor: 'rgb(111, 194, 255)',
    },
    secondary: {
      color: 'rgb(56, 56, 56)',
      backgroundColor: 'rgb(248, 248, 247)',
    },
    disabled: {
      color: 'rgb(161, 161, 161)',
      backgroundColor: 'rgb(248, 248, 247)',
      borderColor: 'rgb(161, 161, 161)',
      opacity: 0.6,
    }
  };

  const style = {
    ...baseStyles,
    ...(disabled ? variants.disabled : variants[variant])
  };

  return (
    <button
      style={style}
      disabled={disabled}
      className="motherduck-button"
      {...props}
    >
      {children}
    </button>
  );
};

/* CSS for hover effect */
.motherduck-button:not(:disabled):hover {
  box-shadow: rgb(56, 56, 56) -8px 8px 0px 0px;
  transform: translate(2px, -2px);
}
```

### Card Component

```css
/* Card.css */
.md-card {
  background-color: rgb(255, 255, 255);
  border: 2px solid rgb(56, 56, 56);
  border-radius: 2px;
  padding: 32px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.md-card--interactive {
  cursor: pointer;
}

.md-card--interactive:hover {
  transform: translate(2px, -2px);
  box-shadow: rgb(56, 56, 56) -8px 8px 0px 0px;
}

.md-card__title {
  font-family: "Aeonik Mono", sans-serif;
  font-size: 24px;
  font-weight: 400;
  line-height: 1.4;
  color: rgb(56, 56, 56);
  margin-bottom: 16px;
}

.md-card__content {
  font-family: "Aeonik Mono", sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: rgb(56, 56, 56);
}
```

### Input Component

```css
/* Input.css */
.md-input {
  width: 100%;
  padding: 17.25px 23px;

  font-family: "Aeonik Mono", sans-serif;
  font-size: 16px;
  color: rgb(56, 56, 56);

  background-color: rgb(255, 255, 255);
  border: 2px solid rgb(56, 56, 56);
  border-radius: 2px;

  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.md-input:focus {
  outline: none;
  border-color: rgb(111, 194, 255);
  box-shadow: 0 0 0 3px rgba(111, 194, 255, 0.2);
}

.md-input::placeholder {
  color: rgb(162, 162, 162);
}

.md-input:disabled {
  background-color: rgb(248, 248, 247);
  color: rgb(161, 161, 161);
  cursor: not-allowed;
  opacity: 0.6;
}

.md-input--error {
  border-color: rgb(255, 113, 105);
}

.md-input--error:focus {
  box-shadow: 0 0 0 3px rgba(255, 113, 105, 0.2);
}
```

### Section Layout

```css
/* Section.css */
.md-section {
  padding: 80px 24px;
  background-color: rgb(244, 239, 234);  /* Default cream */
}

.md-section--white {
  background-color: rgb(255, 255, 255);
}

.md-section--yellow {
  background-color: rgb(255, 222, 0);
}

.md-section--blue {
  background-color: rgb(234, 240, 255);
}

.md-section__container {
  max-width: 1280px;
  margin: 0 auto;
}

.md-section__title {
  font-family: "Aeonik Mono", sans-serif;
  font-size: 32px;
  font-weight: 400;
  line-height: 1.4;
  color: rgb(56, 56, 56);
  margin-bottom: 24px;
  text-align: center;
}

.md-section__subtitle {
  font-family: "Aeonik Mono", sans-serif;
  font-size: 18px;
  line-height: 1.6;
  color: rgb(56, 56, 56);
  text-align: center;
  max-width: 600px;
  margin: 0 auto 48px;
}
```

### Utility Classes

```css
/* Utilities.css */

/* Spacing */
.mt-1 { margin-top: 4px; }
.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 16px; }
.mt-6 { margin-top: 24px; }
.mt-8 { margin-top: 32px; }

.mb-1 { margin-bottom: 4px; }
.mb-2 { margin-bottom: 8px; }
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.mb-6 { margin-bottom: 24px; }
.mb-8 { margin-bottom: 32px; }

.p-4 { padding: 16px; }
.p-6 { padding: 24px; }
.p-8 { padding: 32px; }

/* Typography */
.text-xs { font-size: 12px; }
.text-sm { font-size: 14px; }
.text-base { font-size: 16px; }
.text-lg { font-size: 18px; }
.text-xl { font-size: 20px; }
.text-2xl { font-size: 24px; }
.text-3xl { font-size: 32px; }
.text-4xl { font-size: 44px; }

.text-uppercase { text-transform: uppercase; }
.text-center { text-align: center; }

/* Colors */
.text-charcoal { color: rgb(56, 56, 56); }
.text-gray { color: rgb(162, 162, 162); }
.text-white { color: rgb(255, 255, 255); }

.bg-cream { background-color: rgb(244, 239, 234); }
.bg-white { background-color: rgb(255, 255, 255); }
.bg-yellow { background-color: rgb(255, 222, 0); }
.bg-blue { background-color: rgb(111, 194, 255); }

/* Borders */
.border-charcoal { border-color: rgb(56, 56, 56); }
.border-2 { border-width: 2px; }
.rounded-sm { border-radius: 2px; }
```

---

## Summary Statistics

**Design System Metrics:**
- **Colors identified:** 33 unique colors
- **Font sizes in use:** 12 distinct sizes (12px - 56px)
- **Font families:** Primary "Aeonik Mono" + fallbacks
- **Border radius values:** 2 (2px for UI, 50% for circles)
- **Shadow variations:** Hard offset shadows only
- **Spacing scale:** 4px base unit system
- **Transition duration:** 3 standard speeds (120ms, 200ms, 300ms)

**Accessibility:**
- Contrast ratios meet WCAG AA standards
- Focus states clearly defined
- Interactive elements have sufficient size (44px touch targets)
- Monospace font highly legible

**Technical Stack:**
- CSS-in-JS (styled-components based on className patterns)
- Next.js framework
- Custom font loading
- Responsive design patterns

---

## Implementation Notes

1. **Font Loading:** Ensure "Aeonik Mono" is properly loaded with fallbacks
2. **Color Consistency:** Use CSS custom properties for maintainability
3. **Accessibility:** Always test color contrast and keyboard navigation
4. **Performance:** Hard shadows are performant (no blur rendering)
5. **Responsive:** Test all components at mobile, tablet, desktop breakpoints
6. **Brand Alignment:** Duck theme should feel playful but never childish

---

**End of Style Guide**

*This style guide was reverse-engineered from motherduck.com on November 9, 2025. For the most current design patterns, always refer to the live website.*
