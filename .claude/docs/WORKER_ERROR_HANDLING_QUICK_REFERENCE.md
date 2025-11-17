# Inngest Worker Error Handling - Quick Reference

## 🚀 Quick Start

### Adding Error Handling to a New Worker

```typescript
import { inngest } from "../client"
import { NonRetriableError } from "inngest"
import {
  classifyProviderError,
  classifyDatabaseError,
} from "../lib/errors"

export const myWorker = inngest.createFunction(
  {
    id: "my-worker",
    retries: 5,
    onFailure: async ({ error, event }) => {
      // Mark as failed in database
      await markAsFailed(event.data.id, error)
    },
  },
  { event: "my.event" },
  async ({ event, step }) => {
    // Wrap operations in try/catch
    await step.run("operation-name", async () => {
      try {
        // Your operation
        const result = await someOperation()

        // Validate result
        if (result.error) {
          const classified = classifyProviderError(result.error)
          if (!classified.retryable) {
            throw new NonRetriableError(classified.message)
          }
          throw classified
        }

        return result
      } catch (error) {
        // Classify and re-throw
        if (error instanceof WorkerError) {
          throw error
        }
        const classified = classifyProviderError(error)
        if (!classified.retryable) {
          throw new NonRetriableError(classified.message)
        }
        throw classified
      }
    })
  }
)
```

## 📊 Error Classification

### When to Use Each Error Type

| Error Type | Use When | Retryable? |
|------------|----------|------------|
| `NetworkError` | Network issues, DNS failures | ✅ Yes |
| `RateLimitError` | Hit API rate limits | ✅ Yes |
| `ProviderTimeoutError` | Provider timeout (408, 504) | ✅ Yes |
| `TemporaryProviderError` | Provider 5xx errors | ✅ Yes |
| `DatabaseConnectionError` | Can't connect to database | ✅ Yes |
| `InvalidDeliveryError` | Missing/invalid data | ❌ No |
| `DecryptionError` | Can't decrypt content | ❌ No |
| `InvalidEmailError` | Malformed email address | ❌ No |
| `ProviderRejectionError` | Blocklisted, spam detected | ❌ No |
| `ConfigurationError` | Missing API keys/config | ❌ No |

### Classification Helpers

```typescript
// For external API errors
import { classifyProviderError } from "../lib/errors"

try {
  const result = await externalAPI.call()
} catch (error) {
  const classified = classifyProviderError(error)
  // classified.retryable tells you if you should retry
  // classified.code gives you the error code
  // classified.message gives you the error message
}

// For database errors
import { classifyDatabaseError } from "../lib/errors"

try {
  await prisma.model.create(data)
} catch (error) {
  const classified = classifyDatabaseError(error)
}
```

## 🔄 Retry Logic

### Inngest Built-in Retry

```typescript
inngest.createFunction(
  {
    retries: 5,  // Max 5 retry attempts
    // Automatic exponential backoff: 1s, 2s, 4s, 8s, 16s
  },
  { event: "..." },
  async ({ event, step, attempt }) => {
    // attempt = 0, 1, 2, 3, 4, 5
  }
)
```

### Preventing Retry (Non-Retryable Errors)

```typescript
import { NonRetriableError } from "inngest"

// This will NOT be retried
throw new NonRetriableError("Configuration error: RESEND_API_KEY missing")
```

### Custom Backoff Calculation

```typescript
import { calculateBackoff } from "../lib/errors"

// Calculate exponential backoff with jitter
const delayMs = calculateBackoff(attemptCount, baseDelayMs, maxDelayMs)
// attemptCount = 0 → ~1000ms
// attemptCount = 1 → ~2000ms
// attemptCount = 2 → ~4000ms
// attemptCount = 3 → ~8000ms
// attemptCount = 4 → ~16000ms
```

## 📝 Logging

### Structured Logging Pattern

```typescript
const logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      ...meta,
      timestamp: new Date().toISOString()
    }))
  },
  error: (message: string, meta?: Record<string, unknown>) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      ...meta,
      timestamp: new Date().toISOString()
    }))
  },
}

// Usage
logger.info("Starting delivery", { deliveryId, attempt })
logger.error("Send failed", { deliveryId, errorCode, retryable })
```

### What to Log

**✅ DO log:**
- Operation start/completion
- Error details with classification
- Important metadata (IDs, attempt count)
- Status changes

**❌ DON'T log:**
- Sensitive data (full letter content, raw emails)
- Personal information (names, addresses)
- API keys or secrets
- Stack traces in production (only in dev)

## 🎯 Status Updates

### Proper Status Flow

```typescript
// Initial state
status: "scheduled"

// Worker starts processing
await step.run("update-status", async () => {
  await prisma.delivery.update({
    where: { id: deliveryId },
    data: { status: "processing" }
  })
})

// On success
await prisma.delivery.update({
  where: { id: deliveryId },
  data: {
    status: "sent",
    attemptCount: { increment: 1 }
  }
})

// On permanent failure (in onFailure hook)
await prisma.delivery.update({
  where: { id: deliveryId },
  data: {
    status: "failed",
    attemptCount: { increment: 1 }
  }
})

// On retry: status stays "processing", attemptCount NOT incremented
```

### Create Audit Events

```typescript
await prisma.auditEvent.create({
  data: {
    userId: delivery.userId,
    type: "delivery.sent",  // or "delivery.failed"
    data: {
      deliveryId,
      letterId,
      channel: "email",
      errorCode: error?.code,      // Only for failures
      errorMessage: error?.message, // Only for failures
    }
  }
})
```

## 🛡️ Idempotency

### Always Use Idempotency Keys

```typescript
const idempotencyKey = `delivery-${deliveryId}-attempt-${attemptCount}`

await resend.emails.send({
  // ... email data
  headers: {
    "X-Idempotency-Key": idempotencyKey
  }
})
```

**Why?**
- Prevents duplicate sends if Inngest retries
- Safe to retry failed operations
- Provider deduplicates based on key

## 🔍 Testing

### Local Testing Commands

```bash
# Start Inngest Dev Server
cd workers/inngest && pnpm dev

# Trigger a test delivery
curl -X POST http://localhost:8288/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "delivery.scheduled",
    "data": {
      "deliveryId": "test-delivery-id"
    }
  }'

# View in Inngest UI
open http://localhost:8288
```

### Simulating Errors

```typescript
// Network error
throw new Error('ECONNREFUSED')

// Rate limit
throw Object.assign(new Error('Rate limit'), { statusCode: 429 })

// Provider rejection
throw Object.assign(new Error('Invalid email'), { statusCode: 400 })

// Timeout
throw Object.assign(new Error('Timeout'), { statusCode: 504 })
```

## 🚨 Common Mistakes

### ❌ WRONG: Always marking as sent

```typescript
// DON'T do this - marks sent even if send failed
const result = await resend.emails.send(...)
await prisma.delivery.update({
  data: { status: "sent" }  // Wrong!
})
```

### ✅ CORRECT: Check result first

```typescript
const result = await resend.emails.send(...)

if (result.error) {
  const classified = classifyProviderError(result.error)
  if (!classified.retryable) {
    throw new NonRetriableError(classified.message)
  }
  throw classified
}

// Only mark sent if actually sent
await prisma.delivery.update({
  data: { status: "sent" }
})
```

### ❌ WRONG: Generic error throwing

```typescript
// DON'T do this - loses error classification
throw new Error("Send failed")
```

### ✅ CORRECT: Classified errors

```typescript
// DO this - proper error classification
const classified = classifyProviderError(error)
if (!classified.retryable) {
  throw new NonRetriableError(classified.message)
}
throw classified
```

### ❌ WRONG: Missing try/catch

```typescript
// DON'T do this - unclassified errors
await step.run("send", async () => {
  return await provider.send(data)
})
```

### ✅ CORRECT: Wrapped in try/catch

```typescript
// DO this - classify all errors
await step.run("send", async () => {
  try {
    return await provider.send(data)
  } catch (error) {
    const classified = classifyProviderError(error)
    if (!classified.retryable) {
      throw new NonRetriableError(classified.message)
    }
    throw classified
  }
})
```

## 📈 Monitoring Queries

### Find Failed Deliveries

```sql
SELECT
  d.*,
  ae.data->>'errorCode' as error_code,
  ae.data->>'errorMessage' as error_message
FROM deliveries d
LEFT JOIN audit_events ae ON ae.data->>'deliveryId' = d.id
  AND ae.type = 'delivery.failed'
WHERE d.status = 'failed'
ORDER BY d."createdAt" DESC
LIMIT 100;
```

### Find Stuck Deliveries

```sql
SELECT *
FROM deliveries
WHERE status = 'processing'
  AND "deliverAt" < NOW() - INTERVAL '1 hour'
ORDER BY "deliverAt" ASC;
```

### Delivery Success Rate

```sql
SELECT
  COUNT(*) FILTER (WHERE status = 'sent') as sent,
  COUNT(*) FILTER (WHERE status = 'failed') as failed,
  COUNT(*) as total,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE status = 'sent') / COUNT(*),
    2
  ) as success_rate_percent
FROM deliveries
WHERE "deliverAt" >= NOW() - INTERVAL '24 hours';
```

### Error Distribution

```sql
SELECT
  ae.data->>'errorCode' as error_code,
  COUNT(*) as count
FROM audit_events ae
WHERE ae.type = 'delivery.failed'
  AND ae."createdAt" >= NOW() - INTERVAL '24 hours'
GROUP BY ae.data->>'errorCode'
ORDER BY count DESC;
```

## 🔧 Troubleshooting

### Delivery Shows "Failed" But Email Received

**Cause**: Database update failed after email sent

**Solution**: Check logs for "CRITICAL: Email sent but database update failed"

```sql
-- Manually fix status
UPDATE deliveries
SET status = 'sent'
WHERE id = 'delivery-id';
```

### High Retry Rate

**Cause**: Transient errors (network, rate limits)

**Solution**: Review error distribution, adjust rate limits

```bash
# Check Inngest UI for error patterns
open http://localhost:8288
```

### Deliveries Stuck in Processing

**Cause**: Worker crashed or timed out

**Solution**: Re-enqueue the delivery

```typescript
await inngest.send({
  name: "delivery.scheduled",
  data: { deliveryId: "stuck-delivery-id" }
})
```

## 📚 Further Reading

- Full documentation: `INNGEST_WORKER_ERROR_HANDLING.md`
- Error classification system: `workers/inngest/lib/errors.ts`
- Example implementation: `workers/inngest/functions/deliver-email.ts`
- Inngest docs: https://www.inngest.com/docs
