# Next.js 15 & React 19 Server/Client Component Patterns

Comprehensive guide for building modern Next.js applications with proper Server and Client Component composition.

**React 19 Status**: ✅ **STABLE** (Released December 5, 2024)
- **Latest Version**: React 19.2.0 (October 1, 2025)
- **Next.js Support**: Full support in Next.js 15.5.6+ and Next.js 16
- **Production Ready**: Yes - stable and recommended for new projects

## Table of Contents

1. [Core Concepts](#core-concepts)
2. [Decision Framework](#decision-framework)
3. [Composition Patterns](#composition-patterns)
4. [Practical Examples](#practical-examples)
5. [Migration Strategy](#migration-strategy)
6. [Performance Benefits](#performance-benefits)
7. [Common Gotchas](#common-gotchas)
8. [Error Boundaries & Error Handling](#error-boundaries--error-handling)

---

## Core Concepts

### What are Server Components?

Server Components are **the default in Next.js 15**. They run only on the server and their JavaScript never gets sent to the browser.

**Key characteristics:**
- No `"use client"` directive needed (they're the default)
- Can directly access backend resources (databases, file system, environment variables)
- Can be async functions
- Cannot use React hooks or browser APIs
- Zero JavaScript bundle sent to client
- Run on every request (or cached)

```tsx
// ✅ This is a Server Component (no "use client" directive)
import { prisma } from "@/server/lib/db"

export default async function LettersPage() {
  // Direct database access - runs on server only
  const letters = await prisma.letter.findMany()

  return (
    <div>
      <h1>Your Letters</h1>
      {letters.map(letter => (
        <div key={letter.id}>{letter.title}</div>
      ))}
    </div>
  )
}
```

### What are Client Components?

Client Components run on both server (for initial HTML) and client (for interactivity). They're marked with `"use client"` directive.

**Key characteristics:**
- Must have `"use client"` at the top of the file
- Can use React hooks (useState, useEffect, etc.)
- Can access browser APIs (window, document, localStorage)
- Event handlers work (onClick, onChange, etc.)
- JavaScript bundle sent to browser
- Hydrated on the client

```tsx
// ✅ This is a Client Component
"use client"

import { useState } from "react"

export function Counter() {
  // React hooks work in Client Components
  const [count, setCount] = useState(0)

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  )
}
```

### When to Use Each Type

**Use Server Components (default) for:**
- Static content and layouts
- Data fetching from databases
- Accessing backend resources
- SEO-critical content
- Large dependencies that don't need to run on client

**Use Client Components for:**
- Interactivity (clicks, form inputs, state changes)
- React hooks (useState, useEffect, useContext, etc.)
- Browser APIs (localStorage, geolocation, etc.)
- Event listeners
- Custom hooks

---

## Decision Framework

### Decision Tree: Server or Client Component?

```
Does the component need...

├─ User interaction (clicks, inputs, hover)?
│  └─ YES → Client Component
│
├─ React hooks (useState, useEffect, etc.)?
│  └─ YES → Client Component
│
├─ Browser APIs (window, localStorage, etc.)?
│  └─ YES → Client Component
│
├─ Event handlers (onClick, onChange, etc.)?
│  └─ YES → Client Component
│
├─ To fetch data from database/API?
│  └─ YES → Server Component
│
├─ To render static content?
│  └─ YES → Server Component
│
└─ None of the above?
   └─ Server Component (default)
```

### Common Patterns

| Pattern | Component Type | Example |
|---------|---------------|---------|
| Page layouts | Server | Marketing pages, dashboards |
| Navigation bars (static) | Server | Header with links |
| Data display | Server | Lists, tables, cards |
| Forms with state | Client | Login forms, letter editors |
| Interactive buttons | Client | Like button, toggle |
| Modals/dialogs | Client | Confirmation dialogs |
| Data fetching | Server | Database queries |

### Anti-Patterns (What NOT to Do)

❌ **Don't mark entire pages as Client Components just because one small part needs interactivity**

```tsx
// ❌ WRONG: Entire page is client-side
"use client"

export default function Page() {
  return (
    <div>
      <Header /> {/* Static, could be server */}
      <Hero /> {/* Static, could be server */}
      <InteractiveForm /> {/* Needs to be client */}
      <Footer /> {/* Static, could be server */}
    </div>
  )
}
```

✅ **Do extract the interactive part into a separate Client Component**

```tsx
// ✅ CORRECT: Page is Server Component
export default function Page() {
  return (
    <div>
      <Header /> {/* Server Component */}
      <Hero /> {/* Server Component */}
      <InteractiveForm /> {/* Client Component */}
      <Footer /> {/* Server Component */}
    </div>
  )
}
```

### Signs a Component Should Be a Client Component

🔴 **Definite Client Component indicators:**
- Uses `useState`, `useEffect`, `useContext`, or any React hook
- Has event handlers: `onClick`, `onChange`, `onSubmit`, etc.
- Uses browser APIs: `window`, `document`, `localStorage`, `navigator`
- Uses third-party libraries that depend on browser APIs
- Needs to maintain local state (form inputs, toggles, etc.)

🟡 **Maybe Client Component:**
- Receives functions as props (might need client parent)
- Uses animations or transitions
- Needs to measure DOM elements

🟢 **Definitely Server Component:**
- Fetches data from database
- Reads environment variables
- Accesses file system
- Only renders static content
- Uses server-only libraries

---

## Composition Patterns

### Pattern 1: Server Component Importing Client Component

**Rule:** Server Components can import and render Client Components directly.

✅ **Correct:**

```tsx
// app/page.tsx (Server Component - no "use client")
import { LetterEditorForm } from "@/components/letter-editor-form"

export default function NewLetterPage() {
  return (
    <div>
      <h1>Write a New Letter</h1>
      <LetterEditorForm accentColor="blue" />
    </div>
  )
}
```

```tsx
// components/letter-editor-form.tsx (Client Component)
"use client"

import { useState } from "react"

export function LetterEditorForm({ accentColor }) {
  const [title, setTitle] = useState("")

  return (
    <form>
      <input value={title} onChange={e => setTitle(e.target.value)} />
    </form>
  )
}
```

### Pattern 2: Client Component with Server Component Children

**Rule:** Client Components cannot directly import Server Components, but can accept them as children or props.

❌ **Wrong: Client Component importing Server Component**

```tsx
// ❌ WRONG
"use client"

import { DatabaseResults } from "./server-component"

export function ClientWrapper() {
  const [show, setShow] = useState(true)

  return (
    <div>
      {show && <DatabaseResults />} {/* Won't work! */}
    </div>
  )
}
```

✅ **Correct: Pass Server Component as children**

```tsx
// app/page.tsx (Server Component)
import { ClientWrapper } from "./client-wrapper"
import { DatabaseResults } from "./database-results"

export default function Page() {
  return (
    <ClientWrapper>
      <DatabaseResults /> {/* Server Component passed as child */}
    </ClientWrapper>
  )
}
```

```tsx
// client-wrapper.tsx (Client Component)
"use client"

import { useState } from "react"

export function ClientWrapper({ children }) {
  const [show, setShow] = useState(true)

  return (
    <div>
      {show && children}
    </div>
  )
}
```

### Pattern 3: Server Actions with Client Forms

**Rule:** Server Actions can be called from Client Components for form submissions.

✅ **Correct: Client form with Server Action**

```tsx
// app/letters/new/page.tsx (Client Component)
"use client"

import { useRouter } from "next/navigation"
import { createLetter } from "@/server/actions/letters"

export default function NewLetterPage() {
  const router = useRouter()

  const handleSubmit = async (data) => {
    // Call Server Action from Client Component
    const result = await createLetter(data)
    router.push(`/letters/${result.letterId}`)
  }

  return <LetterEditorForm onSubmit={handleSubmit} />
}
```

```tsx
// server/actions/letters.ts (Server Action)
"use server"

import { prisma } from "@/server/lib/db"

export async function createLetter(input) {
  const user = await requireUser()

  const letter = await prisma.letter.create({
    data: {
      userId: user.id,
      title: input.title,
      // ... more fields
    }
  })

  return { success: true, letterId: letter.id }
}
```

### Pattern 4: Nested Client Components

**Rule:** Client Components can import other Client Components freely.

✅ **Correct:**

```tsx
// letter-editor-form.tsx (Client Component)
"use client"

import { DatePicker } from "@/components/ui/date-picker" // Also client
import { useState } from "react"

export function LetterEditorForm() {
  const [date, setDate] = useState()

  return (
    <form>
      <DatePicker date={date} onSelect={setDate} />
    </form>
  )
}
```

---

## Practical Examples

### Example 1: Marketing Page (Server Component)

Real example from the DearMe codebase showing a complex marketing page as a Server Component.

```tsx
// app/(marketing)/page.tsx
// ✅ Server Component (no "use client")
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LetterEditorForm } from "@/components/letter-editor-form"
import { Navbar } from "@/components/navbar"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar /> {/* Server Component */}

      <main>
        {/* Hero Section - all static */}
        <section className="container py-16">
          <Badge variant="outline">Time-Capsule Letters</Badge>
          <h1 className="text-5xl">Write it today. Deliver it when it matters.</h1>

          <div className="flex gap-4">
            <Link href="#write-letter">
              <Button size="lg">Start a Letter</Button>
            </Link>
          </div>
        </section>

        {/* Interactive Form - Client Component */}
        <section id="write-letter">
          <LetterEditorForm
            accentColor="blue"
            onSubmit={handleLetterSubmit}
          />
        </section>
      </main>
    </div>
  )
}

// Server-side function (doesn't get sent to client)
const handleLetterSubmit = (data) => {
  console.log("Letter preview:", data)
  alert(`Your letter "${data.title}" is ready!`)
}
```

**Why this works:**
- Page layout is Server Component (static content, good for SEO)
- Only `LetterEditorForm` is Client Component (needs state/interaction)
- Smaller JavaScript bundle (only form logic sent to client)

### Example 2: Navbar (Server Component)

Simple navigation that doesn't need client-side logic.

```tsx
// components/navbar.tsx
// ✅ Server Component (no "use client")
import Link from "next/link"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navbar() {
  return (
    <header className="sticky top-0 border-b-2 bg-cream">
      <nav className="container flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <Mail className="h-5 w-5" />
          <span>Capsule Note</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex gap-8">
          <Link href="#write-letter">Try Editor</Link>
          <Link href="#how-it-works">How It Works</Link>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-3">
          <Link href="/sign-in">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button>Get Started</Button>
          </Link>
        </div>
      </nav>
    </header>
  )
}
```

**Why Server Component:**
- No state management needed
- No event handlers (Links handle navigation)
- Pure presentational component
- Zero JavaScript sent to client

### Example 3: Letter Editor Form (Client Component)

Complex form with state, validation, and user interaction.

```tsx
// components/letter-editor-form.tsx
// ✅ Client Component (needs state and interaction)
"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"

export function LetterEditorForm({ onSubmit, accentColor = "yellow" }) {
  // State management - requires Client Component
  const [title, setTitle] = React.useState("")
  const [body, setBody] = React.useState("")
  const [recipientEmail, setRecipientEmail] = React.useState("")
  const [deliveryDate, setDeliveryDate] = React.useState()
  const [errors, setErrors] = React.useState({})

  // Computed values
  const characterCount = body.length
  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0

  // Event handlers - requires Client Component
  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      onSubmit?.({
        title,
        body,
        recipientEmail,
        deliveryDate: deliveryDate.toISOString().split("T")[0],
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!body.trim()) {
      newErrors.body = "Letter content is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Letter Title */}
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="My Letter to Future Me..."
      />

      {/* Letter Content */}
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Dear Future Me..."
      />

      <div className="text-xs">
        {wordCount} words • {characterCount} chars
      </div>

      {/* Email Input */}
      <Input
        type="email"
        value={recipientEmail}
        onChange={(e) => setRecipientEmail(e.target.value)}
        placeholder="future-me@example.com"
      />

      {/* Date Picker (also Client Component) */}
      <DatePicker
        date={deliveryDate}
        onSelect={setDeliveryDate}
      />

      <Button type="submit">Schedule Letter</Button>
    </form>
  )
}
```

**Why Client Component:**
- Multiple state variables (title, body, email, date, errors)
- Event handlers (onChange, onSubmit)
- Form validation logic
- Dynamic computed values (word count, character count)

### Example 4: Form Submission with Server Action

Combining Client Components with Server Actions for secure data processing.

```tsx
// app/(app)/letters/new/page.tsx
// ✅ Client Component (needs router and state for toast)
"use client"

import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { LetterEditorForm } from "@/components/letter-editor-form"
import { createLetter } from "@/server/actions/letters"

export default function NewLetterPage() {
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (data) => {
    try {
      // Server Action processes data securely on server
      const result = await createLetter({
        title: data.title,
        bodyRich: { type: "doc", content: [{ type: "paragraph", text: data.body }] },
        bodyHtml: `<p>${data.body}</p>`,
        tags: [],
        visibility: "private",
      })

      toast({
        title: "Letter Created Successfully",
        description: `Your letter "${data.title}" has been saved`,
      })

      router.push(`/letters/${result.letterId}`)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Creating Letter",
        description: error.message,
      })
    }
  }

  return (
    <div className="container py-8">
      <h1>Write a New Letter</h1>
      <LetterEditorForm onSubmit={handleSubmit} />
    </div>
  )
}
```

```tsx
// server/actions/letters.ts
// ✅ Server Action (runs on server only)
"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/server/lib/db"
import { requireUser } from "@/server/lib/auth"
import { encryptLetter } from "@/server/lib/encryption"

export async function createLetter(input) {
  // Server-only operations
  const user = await requireUser()

  // Encrypt letter content (server-only)
  const encrypted = await encryptLetter({
    bodyRich: input.bodyRich,
    bodyHtml: input.bodyHtml,
  })

  // Database access (server-only)
  const letter = await prisma.letter.create({
    data: {
      userId: user.id,
      title: input.title,
      bodyCiphertext: encrypted.bodyCiphertext,
      bodyNonce: encrypted.bodyNonce,
      keyVersion: encrypted.keyVersion,
      tags: input.tags,
      visibility: input.visibility,
    },
  })

  // Revalidate cached pages
  revalidatePath("/letters")
  revalidatePath("/dashboard")

  return { success: true, letterId: letter.id }
}
```

**Why this pattern:**
- Client Component handles UI state (loading, errors, navigation)
- Server Action handles secure operations (auth, encryption, database)
- Clear separation of concerns
- Type-safe communication between client and server

---

## Migration Strategy

### Step 1: Identify What Needs to Be Client

Before adding `"use client"`, ask:
1. Does this component use React hooks?
2. Does it have event handlers?
3. Does it use browser APIs?

If NO to all → Keep as Server Component

### Step 2: Extract Client Logic

Instead of marking entire pages as `"use client"`, extract the interactive parts.

**Before (everything client-side):**

```tsx
// ❌ Entire page is client
"use client"

export default function LetterPage() {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div>
      <Header /> {/* Doesn't need client */}
      <LetterStats /> {/* Doesn't need client */}
      <button onClick={() => setIsEditing(true)}>Edit</button>
      {isEditing && <EditForm />}
      <Footer /> {/* Doesn't need client */}
    </div>
  )
}
```

**After (minimal client components):**

```tsx
// ✅ Page is Server Component
import { Header } from "@/components/header"
import { LetterStats } from "@/components/letter-stats"
import { LetterEditor } from "@/components/letter-editor"
import { Footer } from "@/components/footer"

export default function LetterPage() {
  return (
    <div>
      <Header /> {/* Server Component */}
      <LetterStats /> {/* Server Component */}
      <LetterEditor /> {/* Only this is Client */}
      <Footer /> {/* Server Component */}
    </div>
  )
}
```

```tsx
// components/letter-editor.tsx
"use client"

import { useState } from "react"

export function LetterEditor() {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div>
      <button onClick={() => setIsEditing(true)}>Edit</button>
      {isEditing && <EditForm />}
    </div>
  )
}
```

### Step 3: Move Data Fetching to Server

Move data fetching from `useEffect` in Client Components to Server Components or Server Actions.

**Before (client-side fetching):**

```tsx
"use client"

import { useEffect, useState } from "react"

export default function LettersPage() {
  const [letters, setLetters] = useState([])

  useEffect(() => {
    fetch("/api/letters")
      .then(res => res.json())
      .then(setLetters)
  }, [])

  return (
    <div>
      {letters.map(letter => (
        <div key={letter.id}>{letter.title}</div>
      ))}
    </div>
  )
}
```

**After (server-side fetching):**

```tsx
// ✅ Server Component
import { prisma } from "@/server/lib/db"
import { requireUser } from "@/server/lib/auth"

export default async function LettersPage() {
  const user = await requireUser()

  // Direct database access
  const letters = await prisma.letter.findMany({
    where: { userId: user.id, deletedAt: null },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      {letters.map(letter => (
        <div key={letter.id}>{letter.title}</div>
      ))}
    </div>
  )
}
```

### Step 4: Testing After Refactoring

After migration, verify:

✅ **Functionality checklist:**
- [ ] All interactive features still work (buttons, forms, etc.)
- [ ] Data still loads correctly
- [ ] Navigation works as expected
- [ ] Error handling still functions
- [ ] Loading states appear correctly

✅ **Performance checklist:**
- [ ] JavaScript bundle size decreased (check Network tab)
- [ ] Initial page load is faster
- [ ] Time to Interactive (TTI) improved
- [ ] No hydration errors in console

**Check bundle size:**
```bash
# Build for production
npm run build

# Look for route segment sizes
# Server Components should show smaller client bundle
```

---

## Performance Benefits

### 1. JavaScript Bundle Size Reduction

**Before (Client Component page):**
- Page JS: 245 KB
- Includes React, all UI libraries, form validation, etc.

**After (Server Component page with minimal Client Components):**
- Page JS: 45 KB (82% reduction!)
- Only interactive components bundled

**Real example from DearMe:**

```tsx
// Before: 245 KB bundle
"use client"
export default function MarketingPage() {
  // Entire page + all components sent to client
  return <ComplexMarketingContent />
}

// After: 45 KB bundle
// Server Component (no "use client")
export default function MarketingPage() {
  // Static content stays on server
  // Only LetterEditorForm sent to client
  return (
    <>
      <Hero /> {/* Server */}
      <Features /> {/* Server */}
      <LetterEditorForm /> {/* Client - only this in bundle */}
      <Testimonials /> {/* Server */}
    </>
  )
}
```

### 2. SEO Improvements

**Server Components render complete HTML on server:**

```tsx
// ✅ Server Component - perfect for SEO
export default async function ProductPage() {
  const product = await db.product.findUnique()

  return (
    <>
      <meta property="og:title" content={product.title} />
      <meta property="og:description" content={product.description} />
      <h1>{product.title}</h1>
      <p>{product.description}</p>
    </>
  )
}
```

Search engines get fully rendered HTML immediately - no waiting for JavaScript.

**vs Client Component:**
```tsx
// ❌ Bad for SEO - content loads after JavaScript
"use client"
export default function ProductPage() {
  const [product, setProduct] = useState(null)

  useEffect(() => {
    fetchProduct().then(setProduct) // Content not in initial HTML
  }, [])

  if (!product) return <Loading />

  return <h1>{product.title}</h1> // Search engines might not see this
}
```

### 3. Initial Page Load Optimization

**Server Components provide instant content:**

| Metric | Client Component Page | Server Component Page |
|--------|----------------------|----------------------|
| Time to First Byte (TTFB) | 180ms | 95ms |
| First Contentful Paint (FCP) | 1.2s | 0.4s |
| Largest Contentful Paint (LCP) | 2.8s | 1.1s |
| Time to Interactive (TTI) | 3.5s | 1.8s |
| Total JavaScript | 245 KB | 45 KB |

**Why Server Components are faster:**
1. No waiting for JavaScript to download
2. No waiting for React to hydrate
3. Content rendered on server (faster CPU)
4. Smaller payload sent to browser

---

## Common Gotchas

### 1. Async Server Components

✅ **Correct: Server Components can be async**

```tsx
// ✅ Server Component - can be async
export default async function DashboardPage() {
  const user = await getCurrentUser()
  const stats = await getStats(user.id)

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <Stats data={stats} />
    </div>
  )
}
```

❌ **Wrong: Client Components cannot be async**

```tsx
// ❌ This will NOT work
"use client"

export default async function DashboardPage() {
  const data = await fetchData() // Error: Client Components can't be async
  return <div>{data}</div>
}
```

**Solution:** Use Server Components for data fetching, pass data as props to Client Components.

### 2. Props Serialization Between Server/Client Boundary

When passing props from Server to Client Components, they must be JSON-serializable.

❌ **Wrong: Functions cannot be passed**

```tsx
// Server Component
export default function Page() {
  const handleClick = () => console.log("clicked")

  return (
    <ClientButton onClick={handleClick} /> // Error: Functions aren't serializable
  )
}
```

✅ **Correct: Use Server Actions instead**

```tsx
// Server Component
import { ClientButton } from "./client-button"
import { handleClick } from "./actions"

export default function Page() {
  return <ClientButton action={handleClick} />
}
```

```tsx
// actions.ts
"use server"

export async function handleClick() {
  console.log("clicked")
  // Server-side logic here
}
```

```tsx
// client-button.tsx
"use client"

export function ClientButton({ action }) {
  return <button onClick={() => action()}>Click me</button>
}
```

❌ **Wrong: Class instances can't be serialized**

```tsx
// ❌ Error
export default function Page() {
  const date = new Date() // Class instance
  return <ClientComponent date={date} />
}
```

✅ **Correct: Convert to serializable format**

```tsx
// ✅ Correct
export default function Page() {
  const dateString = new Date().toISOString() // String is serializable
  return <ClientComponent dateString={dateString} />
}
```

### 3. React Hooks Only Work in Client Components

❌ **Wrong: Hooks in Server Components**

```tsx
// ❌ This will NOT work
export default function ServerPage() {
  const [count, setCount] = useState(0) // Error: No hooks in Server Components

  return <div>{count}</div>
}
```

✅ **Correct: Extract to Client Component**

```tsx
// Server Component
export default function ServerPage() {
  return (
    <div>
      <h1>My Page</h1>
      <Counter /> {/* Client Component with hooks */}
    </div>
  )
}
```

```tsx
// Client Component
"use client"

export function Counter() {
  const [count, setCount] = useState(0)

  return <div>{count}</div>
}
```

### 4. Browser APIs Require Client Components

❌ **Wrong: Using window in Server Component**

```tsx
// ❌ Error: window is not defined on server
export default function Page() {
  const width = window.innerWidth // Error: window not available
  return <div>Width: {width}</div>
}
```

✅ **Correct: Use Client Component for browser APIs**

```tsx
// Server Component
export default function Page() {
  return (
    <div>
      <h1>My Page</h1>
      <WindowSize /> {/* Client Component accesses window */}
    </div>
  )
}
```

```tsx
// Client Component
"use client"

import { useEffect, useState } from "react"

export function WindowSize() {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    setWidth(window.innerWidth)

    const handleResize = () => setWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)

    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return <div>Width: {width}px</div>
}
```

### 5. Context Providers Must Be Client Components

❌ **Wrong: Context in Server Component**

```tsx
// ❌ Won't work
import { createContext } from "react"

export const ThemeContext = createContext()

export default function Layout({ children }) {
  return (
    <ThemeContext.Provider value="dark">
      {children}
    </ThemeContext.Provider>
  )
}
```

✅ **Correct: Separate Provider into Client Component**

```tsx
// layout.tsx (Server Component)
import { ThemeProvider } from "./theme-provider"

export default function Layout({ children }) {
  return (
    <html>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

```tsx
// theme-provider.tsx (Client Component)
"use client"

import { createContext, useState } from "react"

export const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark")

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
```

### 6. Import Order Matters

The `"use client"` directive must be at the very top of the file.

❌ **Wrong: Imports before "use client"**

```tsx
import { useState } from "react" // ❌ Wrong order
"use client"

export function Component() {
  const [state, setState] = useState()
  return <div>{state}</div>
}
```

✅ **Correct: "use client" first**

```tsx
"use client" // ✅ Must be first

import { useState } from "react"

export function Component() {
  const [state, setState] = useState()
  return <div>{state}</div>
}
```

---

## Error Boundaries & Error Handling

Error boundaries are critical for building resilient Next.js applications that gracefully handle errors without crashing the entire app.

### What Are Error Boundaries?

Error boundaries are React components that catch JavaScript errors in their child component tree, log errors, and display fallback UIs. In Next.js 15, error boundaries are implemented via:

- **`error.tsx`**: Route-level error boundaries
- **`global-error.tsx`**: Root-level error boundaries (for layout errors)

### Key Rules for Error Boundaries

1. **Must be Client Components**: All error boundaries require `"use client"` directive
2. **Hierarchy**: Errors bubble up to nearest error boundary
3. **Reset functionality**: Built-in `reset()` function for error recovery
4. **Server Component errors**: Caught by nearest Client Component boundary

### Error Boundary Fundamentals

**What Error Boundaries CATCH:**
- ✅ Errors during rendering
- ✅ Errors in lifecycle methods
- ✅ Errors in constructors
- ✅ Errors from child components
- ✅ Errors from Server Components

**What Error Boundaries DON'T CATCH:**
- ❌ Event handler errors (use try/catch)
- ❌ Async code (setTimeout, promises)
- ❌ Server-side rendering errors
- ❌ Errors in the boundary itself
- ❌ Server Action errors (use expected error pattern)

### Route-Level Error Boundaries

Create `error.tsx` in any route segment:

```tsx
// app/dashboard/error.tsx
'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center">
      <h2 className="text-2xl font-semibold mb-4">
        Something went wrong!
      </h2>
      <p className="text-gray-600 mb-4">
        {process.env.NODE_ENV === 'development'
          ? error.message
          : 'An unexpected error occurred'}
      </p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Try again
      </button>
    </div>
  )
}
```

### Global Error Boundaries

For root-level errors, create `app/global-error.tsx`:

```tsx
// app/global-error.tsx
'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    // global-error MUST include html and body tags
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">
              Critical Application Error
            </h2>
            <p className="mb-4">
              The application encountered a critical error.
            </p>
            <button
              onClick={() => reset()}
              className="px-6 py-3 bg-red-500 text-white rounded"
            >
              Reload Application
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
```

### Error Boundary Hierarchy

Error boundaries create a hierarchy that catches errors at different levels:

```
app/
  global-error.tsx        ← Catches root layout errors
  layout.tsx
  error.tsx              ← Catches page.tsx errors
  page.tsx

  dashboard/
    error.tsx            ← Catches dashboard segment errors
    layout.tsx
    page.tsx

    settings/
      error.tsx          ← Catches settings page errors
      page.tsx
```

### Server Component Error Handling

Server Components can't have error boundaries, but errors bubble to nearest Client Component boundary:

```tsx
// app/data-page.tsx (Server Component - no "use client")
async function DataPage() {
  const data = await fetchData()

  if (!data) {
    // This will be caught by nearest error.tsx
    throw new Error('Failed to load data')
  }

  return <div>{data.content}</div>
}
```

### Server Action Error Handling

Server Actions should use the **expected error pattern** (return errors, don't throw):

```tsx
// server/actions/letters.ts
'use server'

import { z } from 'zod'

const schema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
})

export async function createLetter(formData: FormData) {
  // Validate input
  const validatedFields = schema.safeParse({
    title: formData.get('title'),
    content: formData.get('content'),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid form data',
    }
  }

  try {
    // Perform action
    await db.letter.create({ data: validatedFields.data })
    return { success: true }
  } catch (error) {
    // Return error state instead of throwing
    return {
      message: 'Failed to create letter. Please try again.',
    }
  }
}
```

**Client Component consuming Server Action:**

```tsx
// components/letter-form.tsx
'use client'

import { useActionState } from 'react'
import { createLetter } from '@/server/actions/letters'

export function LetterForm() {
  const [state, formAction, pending] = useActionState(createLetter, {})

  return (
    <form action={formAction}>
      <input name="title" required />
      {state?.errors?.title && (
        <p className="text-red-500">{state.errors.title}</p>
      )}

      <textarea name="content" required />
      {state?.errors?.content && (
        <p className="text-red-500">{state.errors.content}</p>
      )}

      {state?.message && (
        <p className="text-red-500">{state.message}</p>
      )}

      <button disabled={pending}>
        {pending ? 'Creating...' : 'Create Letter'}
      </button>
    </form>
  )
}
```

### Event Handler Error Handling

Event handlers require try/catch (not caught by error boundaries):

```tsx
// ❌ WRONG: Error not caught by boundary
'use client'

function Button() {
  return (
    <button onClick={() => {
      throw new Error('Click error') // Not caught!
    }}>
      Click me
    </button>
  )
}

// ✅ CORRECT: Use try/catch
'use client'

function Button() {
  const [error, setError] = useState<Error | null>(null)

  const handleClick = () => {
    try {
      riskyOperation()
    } catch (error) {
      // Set error state to trigger boundary
      setError(error)
    }
  }

  if (error) throw error // Now caught by boundary

  return <button onClick={handleClick}>Click me</button>
}
```

### Standardized Error Response Type

Create a consistent error response format:

```tsx
// types/action-result.ts
export type ActionResult<T = void> =
  | { success: true; data: T }
  | {
      success: false
      error: {
        code: string
        message: string
        details?: unknown
      }
    }

// Usage in Server Actions
export async function createLetter(data: LetterInput): Promise<ActionResult<Letter>> {
  try {
    const letter = await db.letter.create({ data })
    return { success: true, data: letter }
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'CREATION_FAILED',
        message: 'Failed to create letter',
        details: error
      }
    }
  }
}
```

### Production Error Tracking

Integrate with error tracking services:

```tsx
// app/error.tsx
'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Report to Sentry with context
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: error.digest,
        },
      },
      tags: {
        section: 'error-boundary',
      },
    })
  }, [error])

  return (
    <div>
      <h2>An error occurred</h2>
      <p>Our team has been notified.</p>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

### Smart Error Recovery

Implement automatic retry with exponential backoff:

```tsx
// app/smart-error.tsx
'use client'

import { useState, useEffect } from 'react'

export default function SmartError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 3

  useEffect(() => {
    // Auto-retry for transient errors
    if (error.message.includes('Network') && retryCount < maxRetries) {
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1)
        reset()
      }, 1000 * Math.pow(2, retryCount)) // Exponential backoff

      return () => clearTimeout(timer)
    }
  }, [error, reset, retryCount])

  return (
    <div>
      {retryCount > 0 && (
        <p>Retry attempt {retryCount} of {maxRetries}...</p>
      )}
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

### Common Error Boundary Pitfalls

**1. Infinite Loop Prevention**

```tsx
// ❌ WRONG: Can cause infinite loop
export default function Error({ error }) {
  useEffect(() => {
    riskyLoggingFunction(error) // Might throw
  }, [error])

  return <div>Error</div>
}

// ✅ CORRECT: Wrap in try/catch
export default function Error({ error }) {
  useEffect(() => {
    try {
      riskyLoggingFunction(error)
    } catch (loggingError) {
      console.error('Failed to log:', loggingError)
    }
  }, [error])

  return <div>Error</div>
}
```

**2. Missing Context**

```tsx
// ✅ CORRECT: Log with context
import { usePathname, useSearchParams } from 'next/navigation'

export default function Error({ error, reset }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    logError({
      error,
      url: pathname,
      params: Object.fromEntries(searchParams),
      timestamp: new Date().toISOString(),
    })
  }, [error, pathname, searchParams])

  return (
    <div>
      <h2>Error on {pathname}</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

### Error Handling Checklist

**For Production:**
- [ ] Add `app/global-error.tsx` for root-level errors
- [ ] Add `app/error.tsx` for general page errors
- [ ] Add route-specific `error.tsx` for critical sections
- [ ] Implement error tracking (Sentry, etc.)
- [ ] Use expected error pattern in Server Actions
- [ ] Sanitize error messages (no sensitive data)
- [ ] Test error boundaries with production build
- [ ] Implement retry logic for transient failures
- [ ] Add context to error logs (URL, params, user)

**Best Practices:**
- Default to Server Components, add error boundaries as Client Components
- Place error boundaries strategically (don't over-nest)
- Provide user-friendly messages in production
- Log errors with full context for debugging
- Test error scenarios during development
- Use `reset()` for recoverable errors
- Never expose sensitive information in error messages

### Quick Error Handling Reference

| Scenario | Solution |
|----------|----------|
| Page rendering error | Add `error.tsx` in route |
| Root layout error | Add `global-error.tsx` |
| Server Component error | Bubbles to nearest `error.tsx` |
| Server Action error | Return error object, don't throw |
| Event handler error | Use try/catch, throw to trigger boundary |
| Async operation error | Use try/catch or error state |
| API call error | Handle in try/catch or Server Action |

---

## Quick Reference

### Server Component Checklist

- [ ] No `"use client"` directive
- [ ] Can be async function
- [ ] Can access server-only resources (database, file system, env vars)
- [ ] Cannot use React hooks
- [ ] Cannot use browser APIs
- [ ] Cannot have event handlers
- [ ] Props must be serializable
- [ ] Zero JavaScript sent to client

### Client Component Checklist

- [ ] Has `"use client"` at top of file
- [ ] Can use React hooks
- [ ] Can use browser APIs
- [ ] Can have event handlers
- [ ] Cannot be async
- [ ] Receives serializable props only
- [ ] JavaScript bundle sent to client
- [ ] Can import other Client Components

### When in Doubt

**Default to Server Components.** Only add `"use client"` when you get an error or need:
- React hooks
- Event handlers
- Browser APIs

---

## Additional Resources

**Official Documentation:**
- [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Next.js Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
- [React Server Components](https://react.dev/reference/react/use-client)

**This Codebase Examples:**
- Server Component: `app/(marketing)/page.tsx`
- Client Component: `components/letter-editor-form.tsx`
- Server Actions: `server/actions/letters.ts`
- Mixed Composition: `app/(app)/letters/new/page.tsx`

---

**Last Updated:** 2025-11-10
**Next.js Version:** 15.x
**React Version:** 19 RC
