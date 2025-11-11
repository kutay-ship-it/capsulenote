# Error Handling Quick Reference

Quick guide for developers working with the DearMe error handling system.

---

## Writing Server Actions

### ✅ DO: Use ActionResult Pattern

```typescript
import { type ActionResult, ErrorCodes } from "@dearme/types"
import { logger } from "@/server/lib/logger"

export async function createItem(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await requireUser()

    // Validation
    const validated = schema.safeParse(input)
    if (!validated.success) {
      await logger.warn('Validation failed', { errors: validated.error.flatten() })
      return {
        success: false,
        error: {
          code: ErrorCodes.VALIDATION_FAILED,
          message: 'Invalid input data',
          details: validated.error.flatten().fieldErrors,
        },
      }
    }

    // Database operation
    const item = await prisma.item.create({ data: validated.data })

    await logger.info('Item created', { itemId: item.id })

    return {
      success: true,
      data: { id: item.id },
    }
  } catch (error) {
    await logger.error('Unexpected error', error)
    return {
      success: false,
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'An unexpected error occurred',
        details: error,
      },
    }
  }
}
```

### ❌ DON'T: Throw Errors in Server Actions

```typescript
// ❌ WRONG
export async function createItem(input: unknown) {
  const validated = schema.parse(input) // Throws on error
  throw new Error("Something failed") // Don't throw
}
```

---

## Consuming Server Actions in Client Components

### ✅ DO: Check success field

```typescript
'use client'

import { createItem } from '@/server/actions/items'
import { useToast } from '@/hooks/use-toast'

export function ItemForm() {
  const { toast } = useToast()

  const handleSubmit = async (data) => {
    const result = await createItem(data)

    if (result.success) {
      // TypeScript knows result.data exists
      router.push(`/items/${result.data.id}`)
      toast({ title: 'Success!', description: 'Item created' })
    } else {
      // TypeScript knows result.error exists
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error.message
      })
    }
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

### ❌ DON'T: Use try/catch with ActionResult

```typescript
// ❌ WRONG - ActionResult doesn't throw
try {
  const result = await createItem(data)
  router.push(`/items/${result.id}`) // Type error!
} catch (error) {
  // Never reached
}
```

---

## Using the Logger

### Basic Logging

```typescript
import { logger } from '@/server/lib/logger'

// Info level
await logger.info('User logged in', { userId: user.id })

// Warning level
await logger.warn('Rate limit approaching', { remaining: 10 })

// Error level
await logger.error('Payment failed', error, { orderId: 'abc123' })
```

### Operation-Specific Logger

```typescript
import { createOperationLogger } from '@/server/lib/logger'

export async function processOrder(orderId: string) {
  const log = createOperationLogger('process-order', { orderId })

  await log.info('Starting order processing')
  await log.warn('Inventory low', { sku: 'ABC' })
  await log.error('Payment gateway timeout', error)
}
```

---

## Using Error UI Components

### ErrorFallback (Full Page)

```typescript
import { ErrorFallback } from '@/components/error-ui'

<ErrorFallback
  title="Payment Failed"
  message="We couldn't process your payment"
  errorId={errorDigest}
  onRetry={handleRetry}
  isRetrying={isRetrying}
  showHomeLink
/>
```

### ErrorAlert (Inline)

```typescript
import { ErrorAlert } from '@/components/error-ui'

<ErrorAlert
  variant="error" // error | warning | info | success
  title="Validation Failed"
  message="Please check your input"
  errorCode="VALIDATION_FAILED"
  dismissible
  onDismiss={() => setError(null)}
/>
```

### FieldError (Form Fields)

```typescript
import { FieldError } from '@/components/error-ui'

<Input name="email" />
<FieldError message={errors.email} />
```

---

## Error Boundary Hierarchy

```
app/
  global-error.tsx          ← Catches root layout errors
  error.tsx                 ← Catches page-level errors
  (app)/
    dashboard/
      error.tsx             ← Catches dashboard errors
    letters/
      error.tsx             ← Catches letters section errors
```

**Error bubbling**: Errors bubble up to the nearest error boundary.

---

## Standard Error Codes

```typescript
import { ErrorCodes } from '@/types'

// Authentication & Authorization
ErrorCodes.UNAUTHORIZED
ErrorCodes.FORBIDDEN

// Validation
ErrorCodes.VALIDATION_FAILED
ErrorCodes.INVALID_INPUT

// Resources
ErrorCodes.NOT_FOUND
ErrorCodes.ALREADY_EXISTS

// Operations
ErrorCodes.CREATION_FAILED
ErrorCodes.UPDATE_FAILED
ErrorCodes.DELETE_FAILED

// Encryption
ErrorCodes.ENCRYPTION_FAILED
ErrorCodes.DECRYPTION_FAILED

// External Services
ErrorCodes.EMAIL_SEND_FAILED
ErrorCodes.MAIL_SEND_FAILED
ErrorCodes.PAYMENT_FAILED

// System
ErrorCodes.DATABASE_ERROR
ErrorCodes.INTERNAL_ERROR
ErrorCodes.RATE_LIMIT_EXCEEDED
```

---

## Common Patterns

### Validation Error Pattern

```typescript
const validated = schema.safeParse(input)
if (!validated.success) {
  return {
    success: false,
    error: {
      code: ErrorCodes.VALIDATION_FAILED,
      message: 'Invalid input data',
      details: validated.error.flatten().fieldErrors,
    },
  }
}
```

### Not Found Pattern

```typescript
const item = await prisma.item.findUnique({ where: { id } })
if (!item) {
  await logger.warn('Item not found', { itemId: id })
  return {
    success: false,
    error: {
      code: ErrorCodes.NOT_FOUND,
      message: 'Item not found',
    },
  }
}
```

### Database Error Pattern

```typescript
try {
  await prisma.item.create({ data })
} catch (error) {
  await logger.error('Database error', error)
  return {
    success: false,
    error: {
      code: ErrorCodes.CREATION_FAILED,
      message: 'Failed to create item',
      details: error,
    },
  }
}
```

---

## Testing Error Scenarios

### Test Error Boundaries

```typescript
// Create a component that throws
export function ThrowError() {
  throw new Error('Test error')
}

// Use in a test page
export default function TestPage() {
  return <ThrowError />
}
```

### Test Server Action Errors

```typescript
// Test validation error
const result = await createItem({ invalid: 'data' })
expect(result.success).toBe(false)
expect(result.error.code).toBe(ErrorCodes.VALIDATION_FAILED)

// Test success
const result = await createItem(validData)
expect(result.success).toBe(true)
expect(result.data.id).toBeDefined()
```

---

## Best Practices

### ✅ DO:
- Return ActionResult from all Server Action mutations
- Use structured logger instead of console.log
- Include context in log messages (userId, itemId, etc.)
- Use standard ErrorCodes for consistency
- Show user-friendly messages in production
- Show technical details in development only
- Test error scenarios during development

### ❌ DON'T:
- Throw errors from Server Actions (use ActionResult)
- Use console.log in production code (use logger)
- Expose sensitive data in error messages
- Show stack traces to users in production
- Forget to log errors before returning
- Use generic error messages without error codes

---

## Troubleshooting

### "Property 'data' does not exist" TypeScript Error

**Problem**: Not checking `success` field before accessing `data`

```typescript
// ❌ WRONG
const result = await createItem(data)
router.push(`/items/${result.data.id}`) // Error!

// ✅ CORRECT
const result = await createItem(data)
if (result.success) {
  router.push(`/items/${result.data.id}`)
}
```

### Error Boundary Not Catching Errors

**Problem**: Event handler errors not caught by boundaries

```typescript
// ❌ Event handler errors bypass boundaries
<button onClick={() => { throw new Error('Test') }}>

// ✅ Use state to trigger boundary
const [error, setError] = useState(null)
if (error) throw error

<button onClick={() => {
  try {
    riskyOperation()
  } catch (e) {
    setError(e) // Now caught by boundary
  }
}}>
```

### Logger Not Showing in Development

**Problem**: Debug logs disabled in production mode

```typescript
// Debug logs only show in development
logger.debug('This message') // Won't show in production

// Use info for important messages
logger.info('This message') // Shows in all environments
```

---

## Quick Command Reference

```bash
# Type check
pnpm typecheck

# Build (includes type checking)
pnpm build

# Run development server
pnpm dev

# Check error boundaries render
# Visit http://localhost:3000 and test error scenarios
```

---

## Need Help?

- See `ERROR_HANDLING_IMPLEMENTATION_SUMMARY.md` for full details
- Check `.claude/skills/nextjs-15-react-19-patterns.md` for Next.js 15 patterns
- Review existing Server Actions in `apps/web/server/actions/` for examples
