# Clerk Authentication Skill

## Overview

This skill provides comprehensive patterns and best practices for implementing Clerk authentication in Next.js 15 App Router applications. Clerk offers complete user management with prebuilt UI components, flexible APIs, and robust security features including OAuth, passkeys, and multi-factor authentication.

**CRITICAL**: Next.js 15 requires `await` for all dynamic APIs (auth, headers, cookies) - this is a breaking change from Next.js 14.

## Prerequisites

### Required Environment Variables
```bash
# Public keys (safe for client-side)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx  # From Clerk Dashboard
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in         # Optional: custom sign-in route
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up         # Optional: custom sign-up route

# Secret keys (server-side only)
CLERK_SECRET_KEY=sk_test_xxx                    # From Clerk Dashboard
CLERK_WEBHOOK_SECRET=whsec_xxx                  # From Webhook endpoint settings
```

### Installation
```bash
# Install Clerk SDK
pnpm add @clerk/nextjs

# For webhooks (optional)
pnpm add @clerk/types svix

# For localization (optional)
pnpm add @clerk/localizations
```

## Core Patterns

### 1. Initial Setup

#### Root Layout with ClerkProvider
```tsx
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your App',
  description: 'Your description',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

#### Middleware Configuration
```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Define public routes (accessible without authentication)
const isPublicRoute = createRouteMatcher([
  '/',                    // Home page
  '/sign-in(.*)',         // Sign-in routes
  '/sign-up(.*)',         // Sign-up routes
  '/api/webhooks(.*)',    // Webhook endpoints
  '/api/public(.*)',      // Public API routes
])

export default clerkMiddleware(async (auth, req) => {
  // Protect all non-public routes
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
```

### 2. Server-Side Authentication

#### In Server Components
```tsx
// app/dashboard/page.tsx
import { auth, currentUser } from '@clerk/nextjs/server'

export default async function DashboardPage() {
  // Get userId - lightweight, just the ID
  const { userId } = await auth()

  if (!userId) {
    return <div>Please sign in to view this page</div>
  }

  // Get full user object when needed
  const user = await currentUser()

  return (
    <div>
      <h1>Welcome, {user?.firstName || 'User'}</h1>
      <p>Email: {user?.emailAddresses[0]?.emailAddress}</p>
    </div>
  )
}
```

#### In Server Actions
```typescript
// app/actions/letters.ts
'use server'

import { auth, currentUser } from '@clerk/nextjs/server'

export async function createLetter(formData: FormData) {
  // Always await auth() in Next.js 15
  const { userId } = await auth()

  if (!userId) {
    throw new Error('You must be signed in to create a letter')
  }

  // Get user details if needed
  const user = await currentUser()

  // Your business logic here
  const letter = await prisma.letter.create({
    data: {
      userId,
      title: formData.get('title') as string,
      // ... other fields
    }
  })

  return letter
}
```

#### In Route Handlers (API Routes)
```typescript
// app/api/letters/route.ts
import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'

export async function GET() {
  // Check authentication
  const { userId, has } = await auth()

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  // Check permissions (if using RBAC)
  const canReadLetters = has({ permission: 'letters:read' })
  if (!canReadLetters) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const letters = await prisma.letter.findMany({
    where: { userId }
  })

  return NextResponse.json(letters)
}

export async function POST(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const data = await request.json()

  const letter = await prisma.letter.create({
    data: {
      userId,
      ...data
    }
  })

  return NextResponse.json(letter)
}
```

### 3. Client-Side Authentication

#### Using Auth Components
```tsx
// components/navbar.tsx
'use client'

import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'

export function Navbar() {
  return (
    <nav className="flex justify-between p-4">
      <div>Your Logo</div>

      <div>
        <SignedOut>
          <SignInButton mode="modal" />
          <SignUpButton mode="modal" />
        </SignedOut>

        <SignedIn>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: 'w-10 h-10'
              }
            }}
          />
        </SignedIn>
      </div>
    </nav>
  )
}
```

#### Using Hooks in Client Components
```tsx
// components/user-profile.tsx
'use client'

import { useAuth, useUser } from '@clerk/nextjs'

export function UserProfile() {
  const { isLoaded, userId, sessionId, getToken } = useAuth()
  const { user } = useUser()

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  if (!userId) {
    return <div>Not signed in</div>
  }

  return (
    <div>
      <p>User ID: {userId}</p>
      <p>Session ID: {sessionId}</p>
      <p>Email: {user?.primaryEmailAddress?.emailAddress}</p>
      <button onClick={async () => {
        const token = await getToken()
        console.log('JWT Token:', token)
      }}>
        Get Token
      </button>
    </div>
  )
}
```

### 4. Database Integration

#### Syncing Clerk User with Database
```typescript
// server/lib/auth.ts
import { auth as clerkAuth } from '@clerk/nextjs/server'
import { prisma } from './db'

export async function getCurrentUser() {
  const { userId: clerkUserId } = await clerkAuth()

  if (!clerkUserId) {
    return null
  }

  // Find or create user in database
  const user = await prisma.user.upsert({
    where: { clerkUserId },
    update: {}, // Update timestamp or other fields
    create: {
      clerkUserId,
      // Initialize with default values
    },
    include: {
      profile: true,
    }
  })

  return user
}

export async function requireUser() {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  return user
}
```

### 5. Webhook Integration

#### Webhook Handler for User Sync
```typescript
// app/api/webhooks/clerk/route.ts
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { Webhook } from 'svix'
import { prisma } from '@/server/lib/db'

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!)

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error occured', {
      status: 400,
    })
  }

  // Handle the webhook
  const eventType = evt.type

  if (eventType === 'user.created' || eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name } = evt.data

    // Sync user to database
    await prisma.user.upsert({
      where: { clerkUserId: id },
      update: {
        email: email_addresses[0]?.email_address,
        firstName: first_name,
        lastName: last_name,
        updatedAt: new Date(),
      },
      create: {
        clerkUserId: id,
        email: email_addresses[0]?.email_address,
        firstName: first_name,
        lastName: last_name,
      },
    })
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data

    // Handle user deletion
    await prisma.user.delete({
      where: { clerkUserId: id },
    })
  }

  return new Response('', { status: 200 })
}
```

### 6. Protected Routes Patterns

#### Layout-Based Protection
```tsx
// app/dashboard/layout.tsx
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return <>{children}</>
}
```

#### Page-Level Protection with auth.protect()
```tsx
// app/admin/page.tsx
import { auth } from '@clerk/nextjs/server'

export default async function AdminPage() {
  // auth.protect() will redirect to sign-in if not authenticated
  // and throw 404 if user lacks permission
  const { userId } = await auth.protect({
    permission: 'org:admin:access'
  })

  return <div>Admin Dashboard for {userId}</div>
}
```

### 7. Organization Management

#### Require Active Organization
```tsx
// app/team/layout.tsx
import { OrganizationList } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'

export default async function TeamLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { orgId } = await auth()

  if (!orgId) {
    return (
      <div>
        <h1>Select an Organization</h1>
        <p>You must select an organization to continue.</p>
        <OrganizationList hidePersonal={true} />
      </div>
    )
  }

  return <>{children}</>
}
```

### 8. Custom Sign-In/Sign-Up Pages

#### Custom Sign-In Page
```tsx
// app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary:
              'bg-blue-500 hover:bg-blue-600 text-white',
            footerActionLink:
              'text-blue-500 hover:text-blue-600',
          },
        }}
        redirectUrl="/dashboard"
      />
    </div>
  )
}
```

## Common Pitfalls

### 1. Forgetting to await auth() in Next.js 15
```typescript
// ❌ WRONG - Will fail in Next.js 15
export async function ServerComponent() {
  const { userId } = auth() // Missing await!
  // ...
}

// ✅ CORRECT
export async function ServerComponent() {
  const { userId } = await auth() // Must await in Next.js 15
  // ...
}
```

### 2. Using Outdated Patterns
```typescript
// ❌ WRONG - Deprecated patterns
import { authMiddleware } from '@clerk/nextjs' // Old middleware
import { withAuth } from '@clerk/nextjs' // Old HOC pattern

// ✅ CORRECT - Use new patterns
import { clerkMiddleware } from '@clerk/nextjs/server'
import { auth } from '@clerk/nextjs/server'
```

### 3. Middleware Infinite Redirect Loops
```typescript
// ❌ WRONG - Typo in route matcher causes infinite loop
const isPublicRoute = createRouteMatcher([
  '/sing-in(.*)', // Typo: 'sing' instead of 'sign'
  '/sing-up(.*)', // Typo: 'sing' instead of 'sign'
])

// ✅ CORRECT
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
])
```

### 4. Webhook Signature Verification
```typescript
// ❌ WRONG - Not verifying webhook signature
export async function POST(req: Request) {
  const payload = await req.json()
  // Process webhook without verification - INSECURE!
}

// ✅ CORRECT - Always verify webhook signature
export async function POST(req: Request) {
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!)
  const evt = wh.verify(body, headers) as WebhookEvent
  // Process verified webhook
}
```

### 5. Client Components with Server Actions
```tsx
// ❌ WRONG - Server Action directly in Client Component
'use client'
export function ClientComponent() {
  async function serverAction() { // Can't define here
    'use server'
    // ...
  }
}

// ✅ CORRECT - Import Server Action
// actions.ts
'use server'
export async function serverAction() {
  const { userId } = await auth()
  // ...
}

// component.tsx
'use client'
import { serverAction } from './actions'
export function ClientComponent() {
  return <form action={serverAction}>...</form>
}
```

## Troubleshooting

### Environment Variable Issues
```bash
# Verify environment variables are loaded
console.log('Clerk Publishable Key:', process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)
console.log('Has Secret Key:', !!process.env.CLERK_SECRET_KEY)

# Common issues:
# - Missing NEXT_PUBLIC_ prefix for client-side variables
# - Not restarting dev server after adding variables
# - Typos in variable names
```

### Authentication State Not Updated
```typescript
// Force reload user data after changes
const { user } = useUser()

// After updating user metadata
await user?.reload()

// In Server Components, always fetch fresh data
const user = await currentUser() // Always fetches latest
```

### Session Token Issues
```typescript
// Get session token for API calls
const { getToken } = useAuth()

// Get token with custom claims
const token = await getToken({
  template: 'your-template-name'
})

// Use token for external API
const response = await fetch('https://api.example.com', {
  headers: {
    Authorization: `Bearer ${token}`
  }
})
```

## Best Practices

### 1. Security
- Always verify webhook signatures in production
- Use environment variables for sensitive keys
- Implement proper RBAC with Clerk organizations
- Enable security features in Clerk Dashboard (bot protection, etc.)

### 2. Performance
- Use `auth()` for simple userId checks (lightweight)
- Only use `currentUser()` when full user object needed
- Cache user data in database for complex queries
- Use React Suspense for loading states

### 3. User Experience
- Provide clear sign-in/sign-up CTAs
- Use modal mode for authentication flows
- Implement proper error handling and messages
- Consider social login options (OAuth)

### 4. Database Sync Strategy
```typescript
// Recommended: Lazy sync on first access
export async function getCurrentUser() {
  const { userId } = await auth()
  if (!userId) return null

  // Check cache first
  const cached = await redis.get(`user:${userId}`)
  if (cached) return JSON.parse(cached)

  // Fetch and cache
  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId }
  })

  if (user) {
    await redis.set(`user:${userId}`, JSON.stringify(user), 'EX', 300)
  }

  return user
}
```

## Testing Strategies

### Mock Authentication in Development
```typescript
// test-helpers/mock-auth.ts
import { auth } from '@clerk/nextjs/server'

export function mockAuth(userId?: string) {
  if (process.env.NODE_ENV === 'development') {
    return {
      userId: userId || 'test_user_123',
      sessionId: 'test_session_123',
      orgId: null,
    }
  }
  return auth()
}
```

### E2E Testing with Clerk
```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    // Set test user credentials
    storageState: './tests/auth.json',
  },
})

// tests/auth.setup.ts
test('authenticate', async ({ page }) => {
  await page.goto('/sign-in')
  await page.fill('[name="identifier"]', process.env.TEST_USER_EMAIL!)
  await page.fill('[name="password"]', process.env.TEST_USER_PASSWORD!)
  await page.click('[type="submit"]')
  await page.waitForURL('/dashboard')

  // Save auth state
  await page.context().storageState({ path: './tests/auth.json' })
})
```

## References

### Official Documentation
- [Clerk Docs](https://clerk.com/docs)
- [Next.js Integration Guide](https://clerk.com/docs/quickstarts/nextjs)
- [Next.js 15 Migration Guide](https://clerk.com/docs/upgrade-guides/nextjs-15)
- [Webhook Events Reference](https://clerk.com/docs/webhooks/events)

### API References
- [Server-side Helpers](https://clerk.com/docs/references/nextjs/auth)
- [React Hooks](https://clerk.com/docs/references/react/use-auth)
- [Clerk Components](https://clerk.com/docs/components/overview)
- [Backend API](https://clerk.com/docs/reference/backend-api)

### Community Resources
- [Clerk Discord](https://clerk.com/discord)
- [GitHub Examples](https://github.com/clerk/clerk-nextjs-demo-app-router)
- [Stack Overflow Tag](https://stackoverflow.com/questions/tagged/clerk)