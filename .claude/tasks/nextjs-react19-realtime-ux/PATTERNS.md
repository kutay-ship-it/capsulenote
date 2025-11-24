# Next.js 15 + React 19 Real-Time UX Patterns

> Reference guide for implementing modern React patterns in Capsule Note

---

## Table of Contents
1. [loading.tsx Pattern](#1-loadingtsx-pattern)
2. [Skeleton Components](#2-skeleton-components)
3. [useTransition Pattern](#3-usetransition-pattern)
4. [useOptimistic Pattern](#4-useoptimistic-pattern)
5. [useActionState Pattern](#5-useactionstate-pattern)
6. [Suspense Boundaries](#6-suspense-boundaries)
7. [Server Actions + Forms](#7-server-actions--forms)
8. [Anti-Patterns to Avoid](#8-anti-patterns-to-avoid)

---

## 1. loading.tsx Pattern

### Purpose
Instant loading feedback via Next.js streaming. Shows skeleton while page data loads.

### Implementation
```tsx
// app/[locale]/(app)/letters/loading.tsx
import { LetterCardSkeleton } from "@/components/skeletons/letter-card-skeleton"

export default function Loading() {
  return (
    <div className="space-y-8 sm:space-y-10">
      {/* Header skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="h-10 w-48 bg-gray-200 animate-pulse rounded" />
          <div className="h-4 w-64 bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="h-12 w-32 bg-gray-200 animate-pulse rounded" />
      </div>

      {/* Content skeleton */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <LetterCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
```

### Rules
- One loading.tsx per route segment that fetches data
- Match the layout structure of the actual page
- Use consistent skeleton styling with `animate-pulse`
- Keep skeleton simple - don't over-detail

### File Locations
```
app/[locale]/(app)/letters/loading.tsx
app/[locale]/(app)/dashboard/loading.tsx
app/[locale]/(app)/deliveries/loading.tsx
app/[locale]/(app)/settings/loading.tsx
app/[locale]/(app)/settings/billing/loading.tsx
app/[locale]/(app)/settings/privacy/loading.tsx
```

---

## 2. Skeleton Components

### Purpose
Reusable loading placeholders that match component dimensions.

### Base Skeleton
```tsx
// components/skeletons/skeleton.tsx
import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-gray-200 animate-pulse rounded",
        className
      )}
    />
  )
}
```

### Card Skeleton
```tsx
// components/skeletons/letter-card-skeleton.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "./skeleton"

export function LetterCardSkeleton() {
  return (
    <Card
      className="h-full border-2 border-gray-200"
      style={{ borderRadius: "2px" }}
    >
      <CardHeader className="space-y-3 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-8 w-8" />
        </div>
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-3 p-5 pt-0 sm:p-6 sm:pt-0">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-16" />
        </div>
      </CardContent>
    </Card>
  )
}
```

### Stats Card Skeleton
```tsx
// components/skeletons/stats-card-skeleton.tsx
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "./skeleton"

export function StatsCardSkeleton() {
  return (
    <Card
      className="border-2 border-gray-200"
      style={{ borderRadius: "2px" }}
    >
      <CardHeader className="p-5 sm:p-6">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-3 w-32 mt-1" />
      </CardHeader>
      <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
        <Skeleton className="h-12 w-16" />
      </CardContent>
    </Card>
  )
}
```

---

## 3. useTransition Pattern

### Purpose
Non-blocking UI updates. Keeps UI responsive during state transitions.

### Basic Pattern
```tsx
"use client"

import { useTransition } from "react"

export function FilterTabs({ currentFilter }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleFilterChange = (filter: string) => {
    startTransition(() => {
      router.push(`/letters?filter=${filter}`)
    })
  }

  return (
    <div className={isPending ? "opacity-50 pointer-events-none" : ""}>
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => handleFilterChange(filter)}
          disabled={isPending}
        >
          {filter}
        </button>
      ))}
    </div>
  )
}
```

### Form Submission Pattern
```tsx
"use client"

import { useTransition } from "react"

export function ScheduleForm({ letterId }) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      const result = await scheduleDelivery({ letterId, ... })

      if (result.success) {
        toast({ title: "Scheduled!" })
        router.push(`/letters/${letterId}`)
      } else {
        toast({ variant: "destructive", title: result.error.message })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <Button disabled={isPending}>
        {isPending ? "Scheduling..." : "Schedule"}
      </Button>
    </form>
  )
}
```

### Rules
- Use for ANY async operation that updates UI
- Wrap router.push, router.refresh in startTransition
- Show isPending state visually (opacity, disabled, spinner)
- Don't use for instant local state changes

---

## 4. useOptimistic Pattern

### Purpose
Instant UI feedback before server confirms. Best UX for mutations.

### List Operations (Add/Remove)
```tsx
"use client"

import { useOptimistic } from "react"
import { deleteLetter } from "@/server/actions/letters"

export function LetterList({ letters }) {
  const [optimisticLetters, setOptimistic] = useOptimistic(
    letters,
    (state, { action, id, data }) => {
      switch (action) {
        case "delete":
          return state.filter(l => l.id !== id)
        case "add":
          return [{ ...data, id: "temp-" + Date.now(), pending: true }, ...state]
        case "update":
          return state.map(l => l.id === id ? { ...l, ...data, pending: true } : l)
        default:
          return state
      }
    }
  )

  const handleDelete = async (id: string) => {
    // Instant UI update
    setOptimistic({ action: "delete", id })

    // Background server call
    const result = await deleteLetter(id)

    if (!result.success) {
      // Revert on error (page will revalidate)
      toast({ variant: "destructive", title: "Failed to delete" })
    }
  }

  return (
    <div>
      {optimisticLetters.map((letter) => (
        <LetterCard
          key={letter.id}
          letter={letter}
          isPending={letter.pending}
          onDelete={() => handleDelete(letter.id)}
        />
      ))}
    </div>
  )
}
```

### Toggle Operations
```tsx
"use client"

import { useOptimistic } from "react"

export function FavoriteButton({ isFavorited, letterId }) {
  const [optimisticFavorited, setOptimistic] = useOptimistic(isFavorited)

  const handleToggle = async () => {
    setOptimistic(!optimisticFavorited)  // Instant
    await toggleFavorite(letterId)        // Background
  }

  return (
    <Button onClick={handleToggle}>
      {optimisticFavorited ? "Unfavorite" : "Favorite"}
    </Button>
  )
}
```

### Rules
- Use for user-initiated mutations (create, update, delete)
- Show pending state visually (opacity, loading indicator)
- Handle errors gracefully (toast + revalidation reverts)
- Keep optimistic state shape same as server state

---

## 5. useActionState Pattern

### Purpose
React 19's form handling. Replaces useState + manual submission.

### Basic Form
```tsx
"use client"

import { useActionState } from "react"
import { createLetter } from "@/server/actions/letters"

// Server action must return { error?: string, success?: boolean }
async function createLetterAction(prevState: any, formData: FormData) {
  const result = await createLetter({
    title: formData.get("title") as string,
    body: formData.get("body") as string,
  })

  if (!result.success) {
    return { error: result.error.message }
  }

  redirect(`/letters/${result.data.letterId}`)
}

export function NewLetterForm() {
  const [state, formAction, isPending] = useActionState(
    createLetterAction,
    { error: null }
  )

  return (
    <form action={formAction}>
      <input name="title" required />
      <textarea name="body" required />

      {state.error && (
        <p className="text-red-500">{state.error}</p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "Create Letter"}
      </Button>
    </form>
  )
}
```

### With Validation
```tsx
"use client"

import { useActionState } from "react"
import { z } from "zod"

const schema = z.object({
  title: z.string().min(1, "Title required"),
  body: z.string().min(10, "Body must be at least 10 characters"),
})

async function formAction(prevState: any, formData: FormData) {
  const parsed = schema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
  })

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      values: Object.fromEntries(formData),
    }
  }

  const result = await createLetter(parsed.data)

  if (!result.success) {
    return { error: result.error.message, values: Object.fromEntries(formData) }
  }

  redirect(`/letters/${result.data.letterId}`)
}

export function NewLetterForm() {
  const [state, action, isPending] = useActionState(formAction, {})

  return (
    <form action={action}>
      <input
        name="title"
        defaultValue={state.values?.title}
        aria-invalid={!!state.errors?.title}
      />
      {state.errors?.title && <p>{state.errors.title[0]}</p>}

      <textarea
        name="body"
        defaultValue={state.values?.body}
      />
      {state.errors?.body && <p>{state.errors.body[0]}</p>}

      <Button disabled={isPending}>
        {isPending ? "Saving..." : "Save"}
      </Button>
    </form>
  )
}
```

### Rules
- Use for forms that submit to server actions
- Return errors in state, not throwing
- Use `defaultValue` for controlled-ish behavior
- isPending is automatic - no manual state needed

---

## 6. Suspense Boundaries

### Purpose
Progressive rendering. Show content as it loads.

### Page-Level Suspense
```tsx
// app/[locale]/(app)/letters/page.tsx
import { Suspense } from "react"
import { LetterListSkeleton } from "@/components/skeletons"

export default function LettersPage() {
  return (
    <div className="space-y-8">
      <PageHeader />  {/* Renders immediately */}

      <Suspense fallback={<LetterListSkeleton />}>
        <LetterList />  {/* Streams when ready */}
      </Suspense>
    </div>
  )
}

// Separate async component
async function LetterList() {
  const letters = await getLetters()
  return <LetterGrid letters={letters} />
}
```

### Multiple Suspense Boundaries
```tsx
// app/[locale]/(app)/dashboard/page.tsx
import { Suspense } from "react"

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>

      {/* Stats stream independently */}
      <div className="grid grid-cols-4 gap-4">
        <Suspense fallback={<StatsCardSkeleton />}>
          <TotalLettersCard />
        </Suspense>
        <Suspense fallback={<StatsCardSkeleton />}>
          <DraftsCard />
        </Suspense>
        <Suspense fallback={<StatsCardSkeleton />}>
          <ScheduledCard />
        </Suspense>
        <Suspense fallback={<StatsCardSkeleton />}>
          <DeliveredCard />
        </Suspense>
      </div>

      {/* Recent letters */}
      <Suspense fallback={<RecentLettersSkeleton />}>
        <RecentLetters />
      </Suspense>
    </div>
  )
}
```

### Rules
- Wrap async server components in Suspense
- Smaller boundaries = faster perceived load
- Static content outside Suspense renders instantly
- Can nest Suspense boundaries

---

## 7. Server Actions + Forms

### Direct Form Binding
```tsx
// Server action
// app/actions.ts
"use server"

export async function createLetter(formData: FormData) {
  const title = formData.get("title") as string
  // ... validation and creation
  revalidatePath("/letters")
  redirect(`/letters/${newLetter.id}`)
}

// Form component (can be server or client)
import { createLetter } from "@/app/actions"

export function QuickLetterForm() {
  return (
    <form action={createLetter}>
      <input name="title" />
      <button type="submit">Create</button>
    </form>
  )
}
```

### Progressive Enhancement
```tsx
// Works without JS, enhanced with JS
<form action={serverAction}>
  <SubmitButton />  {/* Uses useFormStatus */}
</form>

// components/submit-button.tsx
"use client"

import { useFormStatus } from "react-dom"

export function SubmitButton({ children }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Submitting..." : children}
    </Button>
  )
}
```

---

## 8. Anti-Patterns to Avoid

### DON'T: Manual Loading State
```tsx
// BAD
const [isLoading, setIsLoading] = useState(false)

const handleSubmit = async () => {
  setIsLoading(true)
  try {
    await doSomething()
  } finally {
    setIsLoading(false)
  }
}

// GOOD
const [isPending, startTransition] = useTransition()

const handleSubmit = () => {
  startTransition(async () => {
    await doSomething()
  })
}
```

### DON'T: Blocking Page Renders
```tsx
// BAD - entire page waits
export default async function Page() {
  const data = await slowFetch()  // Blocks everything
  return <Content data={data} />
}

// GOOD - progressive render
export default function Page() {
  return (
    <Header />  {/* Instant */}
    <Suspense fallback={<Skeleton />}>
      <AsyncContent />  {/* Streams */}
    </Suspense>
  )
}
```

### DON'T: Full Page Refresh for Updates
```tsx
// BAD
const handleDelete = async (id) => {
  await deleteLetter(id)
  router.refresh()  // Full page reload
}

// GOOD
const [optimisticLetters, setOptimistic] = useOptimistic(letters)

const handleDelete = async (id) => {
  setOptimistic({ action: "delete", id })  // Instant UI
  await deleteLetter(id)  // Background, revalidatePath handles sync
}
```

### DON'T: Forget Error States
```tsx
// BAD - no error handling
const handleSubmit = () => {
  startTransition(async () => {
    await createLetter(data)
    router.push("/letters")
  })
}

// GOOD - handle errors
const handleSubmit = () => {
  startTransition(async () => {
    const result = await createLetter(data)
    if (result.success) {
      toast({ title: "Created!" })
      router.push("/letters")
    } else {
      toast({ variant: "destructive", title: result.error.message })
    }
  })
}
```

---

## Quick Reference

| Need | Use |
|------|-----|
| Loading state for route | `loading.tsx` |
| Loading state for section | `<Suspense>` |
| Non-blocking navigation | `useTransition` |
| Non-blocking mutation | `useTransition` |
| Instant feedback | `useOptimistic` |
| Form submission | `useActionState` |
| Submit button pending | `useFormStatus` |
| Skeleton placeholder | Custom skeleton component |

---

## Resources

- [Next.js Loading UI](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [React 19 Blog](https://react.dev/blog/2024/12/05/react-19)
- [useOptimistic Docs](https://react.dev/reference/react/useOptimistic)
- [useActionState Docs](https://react.dev/reference/react/useActionState)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
