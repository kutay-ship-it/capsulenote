# Audit Logging Quick Reference

Quick guide for developers on how to use the audit logging system.

---

## Basic Usage

### Import
```typescript
import { createAuditEvent, AuditEventType } from "@/server/lib/audit"
```

### Log an Event
```typescript
await createAuditEvent({
  userId: user.id,
  type: AuditEventType.SUBSCRIPTION_UPDATED,
  data: {
    subscriptionId: subscription.id,
    status: "active",
    // ... any relevant data
  },
  ipAddress: req.headers.get("x-forwarded-for"),  // optional
  userAgent: req.headers.get("user-agent"),        // optional
})
```

---

## Available Event Types

### Billing Events
```typescript
AuditEventType.CHECKOUT_SESSION_CREATED
AuditEventType.CHECKOUT_COMPLETED
AuditEventType.CHECKOUT_CANCELED
AuditEventType.BILLING_PORTAL_SESSION_CREATED
```

### Subscription Events
```typescript
AuditEventType.SUBSCRIPTION_CREATED
AuditEventType.SUBSCRIPTION_UPDATED
AuditEventType.SUBSCRIPTION_CANCELED
AuditEventType.SUBSCRIPTION_RESUMED
AuditEventType.SUBSCRIPTION_PAUSED
AuditEventType.SUBSCRIPTION_TRIAL_ENDING
```

### Payment Events
```typescript
AuditEventType.PAYMENT_SUCCEEDED
AuditEventType.PAYMENT_FAILED
AuditEventType.PAYMENT_METHOD_ATTACHED
AuditEventType.PAYMENT_METHOD_DETACHED
AuditEventType.REFUND_CREATED
AuditEventType.INVOICE_PAYMENT_SUCCEEDED
AuditEventType.INVOICE_PAYMENT_FAILED
```

### GDPR Events
```typescript
AuditEventType.DATA_EXPORT_REQUESTED
AuditEventType.DATA_EXPORT_COMPLETED
AuditEventType.DATA_DELETION_REQUESTED
AuditEventType.DATA_DELETION_COMPLETED
```

### Security Events
```typescript
AuditEventType.UNAUTHORIZED_ACCESS_ATTEMPT
AuditEventType.RATE_LIMIT_EXCEEDED
AuditEventType.SUSPICIOUS_ACTIVITY
```

### Admin Events
```typescript
AuditEventType.ADMIN_SUBSCRIPTION_UPDATED
AuditEventType.ADMIN_REFUND_ISSUED
AuditEventType.ADMIN_USER_IMPERSONATED
```

---

## Querying Audit Events

### Get User's Events
```typescript
import { getAuditEvents } from "@/server/lib/audit"

const events = await getAuditEvents(userId, {
  limit: 50,
  offset: 0,
  type: AuditEventType.PAYMENT_SUCCEEDED,
  startDate: new Date("2025-01-01"),
  endDate: new Date("2025-12-31"),
})
```

### Get Event Counts
```typescript
import { getAuditEventCounts } from "@/server/lib/audit"

const counts = await getAuditEventCounts({
  userId: userId,  // optional
  startDate: new Date("2025-01-01"),
  endDate: new Date("2025-12-31"),
})

// Returns: [{ type: "payment.succeeded", _count: { id: 42 } }, ...]
```

---

## Best Practices

### 1. Always Log Critical Operations
```typescript
// ✅ Good
await createLetterInDatabase(data)
await createAuditEvent({
  userId: user.id,
  type: AuditEventType.LETTER_CREATED,
  data: { letterId: letter.id },
})

// ❌ Bad - Missing audit log
await createLetterInDatabase(data)
```

### 2. Include Relevant Context
```typescript
// ✅ Good - Rich context
await createAuditEvent({
  userId: user.id,
  type: AuditEventType.SUBSCRIPTION_CANCELED,
  data: {
    subscriptionId: sub.id,
    reason: "user_requested",
    refundIssued: true,
    remainingDays: 15,
  },
})

// ❌ Bad - Minimal context
await createAuditEvent({
  userId: user.id,
  type: AuditEventType.SUBSCRIPTION_CANCELED,
  data: {},
})
```

### 3. Never Log Sensitive Data
```typescript
import { redactSensitiveData } from "@/server/lib/audit"

// ✅ Good - Redacted
const data = {
  email: user.email,
  password: "secret123",
  apiKey: "sk_test_xxx",
}
await createAuditEvent({
  userId: user.id,
  type: AuditEventType.ADMIN_USER_IMPERSONATED,
  data: redactSensitiveData(data),  // password and apiKey become [REDACTED]
})

// ❌ Bad - Logging sensitive data
await createAuditEvent({
  userId: user.id,
  type: AuditEventType.ADMIN_USER_IMPERSONATED,
  data: { password: user.password },  // NEVER DO THIS
})
```

### 4. Handle Errors Gracefully
```typescript
// ✅ Good - Audit failure doesn't break main flow
try {
  await processPayment()
  await createAuditEvent({
    userId: user.id,
    type: AuditEventType.PAYMENT_SUCCEEDED,
    data: { amount: 100 },
  })
} catch (error) {
  // Process payment error, not audit error
}

// createAuditEvent already handles errors internally
```

---

## Common Patterns

### Server Actions
```typescript
"use server"

export async function myServerAction(): Promise<ActionResult<Data>> {
  const user = await requireUser()

  try {
    // ... perform action
    const result = await doSomething()

    // Log success
    await createAuditEvent({
      userId: user.id,
      type: AuditEventType.SOME_EVENT,
      data: { result },
    })

    return { success: true, data: result }
  } catch (error) {
    // Log failure
    await createAuditEvent({
      userId: user.id,
      type: AuditEventType.SOME_EVENT_FAILED,
      data: { error: error.message },
    })

    return {
      success: false,
      error: { code: "ERROR", message: "Failed" },
    }
  }
}
```

### Webhook Handlers
```typescript
export async function handleWebhook(event: StripeEvent) {
  const user = await getUserByCustomerId(event.customer)

  // Process webhook
  await updateSubscription(event.data)

  // Log event
  await createAuditEvent({
    userId: user.id,
    type: AuditEventType.SUBSCRIPTION_UPDATED,
    data: {
      eventId: event.id,
      subscriptionId: event.data.id,
      status: event.data.status,
    },
  })
}
```

---

## Viewing Audit Logs

### User View
Users can see their own audit logs on the Privacy Settings page:
- URL: `/settings/privacy`
- Shows recent activity related to their account

### Admin View
Admins can view all audit logs:
- URL: `/admin/audit`
- Filterable by type, user, date range
- Paginated (50 events per page)
- Detailed event inspection

---

## Testing Audit Logs

### In Development
```typescript
// Create test audit event
await createAuditEvent({
  userId: "test-user-id",
  type: AuditEventType.LETTER_CREATED,
  data: { letterId: "test-123" },
})

// Query in Prisma Studio
pnpm db:studio
// Navigate to audit_events table
```

### In Tests (Future)
```typescript
import { prisma } from "@/server/lib/db"

test("creates audit event when letter created", async () => {
  await createLetter({ title: "Test" })

  const event = await prisma.auditEvent.findFirst({
    where: { type: AuditEventType.LETTER_CREATED },
  })

  expect(event).toBeTruthy()
  expect(event.data).toHaveProperty("letterId")
})
```

---

## Troubleshooting

### Audit Event Not Appearing
1. Check if `createAuditEvent` returned `null` (error occurred)
2. Verify database connection
3. Check console logs for error messages
4. Ensure `AuditEventType` constant is used (not raw string)

### Performance Issues
1. Add indexes on frequently queried fields
2. Use pagination when querying large result sets
3. Consider archiving old audit logs
4. Use filters to narrow down results

### Missing Event Types
1. Check if event type exists in `AuditEventType` enum
2. If not, add it to `apps/web/server/lib/audit.ts`
3. Follow naming convention: `CATEGORY_ACTION` (e.g., `PAYMENT_SUCCEEDED`)

---

## File Locations

### Core Files
- Audit system: `apps/web/server/lib/audit.ts`
- GDPR actions: `apps/web/server/actions/gdpr.ts`
- Privacy settings: `apps/web/app/(app)/settings/privacy/page.tsx`
- Admin viewer: `apps/web/app/admin/audit/page.tsx`

### Database Schema
- Schema: `packages/prisma/schema.prisma`
- Model: `AuditEvent`

---

## Support

For questions or issues:
1. Review this quick reference
2. Check comprehensive documentation: `GDPR_AND_AUDIT_IMPLEMENTATION_SUMMARY.md`
3. Review audit system implementation: `apps/web/server/lib/audit.ts`
