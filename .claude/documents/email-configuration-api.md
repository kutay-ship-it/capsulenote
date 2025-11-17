# Email Configuration API Reference

## Overview

The email configuration module (`workers/inngest/lib/email-config.ts`) provides centralized management of email sender addresses with type-safe configuration and fallback support.

## Core Concepts

### Email Sender Types

Capsule Note uses two distinct sender types:

- **`notification`** - System notifications, confirmations, alerts
  - Example: Letter creation confirmation, account alerts
  - Default sender: `noreply@capsulenote.com`

- **`delivery`** - Scheduled letter deliveries
  - Example: Time-capsule letters delivered to users
  - Default sender: `yourcapsulenote@capsulenote.com`

### Configuration Hierarchy

The module follows this fallback chain:

1. **Type-specific variable** (`EMAIL_FROM_NOTIFICATION` or `EMAIL_FROM_DELIVERY`)
2. **Legacy fallback** (`EMAIL_FROM`)
3. **Error** if neither is configured

## Types

### `EmailSenderConfig`

Configuration object returned by `getEmailSender()`.

```typescript
interface EmailSenderConfig {
  /** Full RFC 5322 format: "Display Name <email@domain.com>" */
  from: string

  /** Email address only (for validation) */
  email: string

  /** Display name only */
  displayName: string
}
```

**Example:**
```typescript
{
  from: "Capsule Note <noreply@capsulenote.com>",
  email: "noreply@capsulenote.com",
  displayName: "Capsule Note"
}
```

### `EmailSenderType`

Union type for sender categories.

```typescript
type EmailSenderType = "notification" | "delivery"
```

## Functions

### `getEmailSender(type)`

Retrieves email sender configuration for the specified type.

#### Signature

```typescript
function getEmailSender(type: EmailSenderType): EmailSenderConfig
```

#### Parameters

- **`type`** (`EmailSenderType`) - The sender type to retrieve
  - `"notification"` - System notification sender
  - `"delivery"` - Letter delivery sender

#### Returns

`EmailSenderConfig` object with parsed sender information

#### Throws

`Error` if configuration is missing or invalid

#### Examples

**Notification email sender:**
```typescript
import { getEmailSender } from "../lib/email-config"

const sender = getEmailSender('notification')
// {
//   from: "Capsule Note <noreply@capsulenote.com>",
//   email: "noreply@capsulenote.com",
//   displayName: "Capsule Note"
// }

await emailProvider.send({
  from: sender.from,
  to: user.email,
  subject: "Your letter has been created",
  html: emailHtml,
})
```

**Letter delivery sender:**
```typescript
import { getEmailSender } from "../lib/email-config"

const sender = getEmailSender('delivery')
// {
//   from: "Capsule Note <yourcapsulenote@capsulenote.com>",
//   email: "yourcapsulenote@capsulenote.com",
//   displayName: "Capsule Note"
// }

await emailProvider.send({
  from: sender.from,
  to: delivery.recipientEmail,
  subject: delivery.subject,
  html: letterHtml,
})
```

**Logging sender details:**
```typescript
const sender = getEmailSender('notification')

logger.info("Sending notification email", {
  to: user.email,
  from: sender.from,
  senderEmail: sender.email,
  senderDisplayName: sender.displayName,
})
```

#### Environment Variables

**Primary (type-specific):**
- `EMAIL_FROM_NOTIFICATION` - Notification sender address
- `EMAIL_FROM_DELIVERY` - Delivery sender address

**Fallback (legacy):**
- `EMAIL_FROM` - Used if type-specific variable not set

**Format:**
```bash
# Recommended format (RFC 5322 with display name)
EMAIL_FROM_NOTIFICATION="Capsule Note <noreply@capsulenote.com>"

# Also supported (email only)
EMAIL_FROM_NOTIFICATION="noreply@capsulenote.com"
```

#### Error Handling

```typescript
try {
  const sender = getEmailSender('notification')
} catch (error) {
  // Error: EMAIL_FROM_NOTIFICATION not configured (and EMAIL_FROM fallback not set).
  // Please set either EMAIL_FROM_NOTIFICATION or EMAIL_FROM environment variable.
}
```

---

### `validateEmailSenderConfig()`

Validates that all required email sender configurations are present and valid.

#### Signature

```typescript
function validateEmailSenderConfig(): void
```

#### Returns

`void` - Does not return a value

#### Throws

`Error` with detailed validation failures if any configuration is invalid

#### Usage

**Application startup validation:**
```typescript
import { validateEmailSenderConfig } from "./lib/email-config"

// Validate at application startup
try {
  validateEmailSenderConfig()
  console.log("✓ Email configuration valid")
} catch (error) {
  console.error("✗ Email configuration invalid:", error.message)
  process.exit(1)
}
```

**Inngest function validation:**
```typescript
export const sendEmail = inngest.createFunction(
  { id: "send-email" },
  { event: "email.send" },
  async ({ event, step }) => {
    // Validate configuration before processing
    await step.run("validate-config", async () => {
      validateEmailSenderConfig()
    })

    // Continue with email sending...
  }
)
```

#### Error Examples

**Missing both type-specific and fallback:**
```
Error: Email sender configuration invalid:
  - Notification sender: EMAIL_FROM_NOTIFICATION not configured (and EMAIL_FROM fallback not set)
  - Delivery sender: EMAIL_FROM_DELIVERY not configured (and EMAIL_FROM fallback not set)
```

**Missing one type-specific variable:**
```
Error: Email sender configuration invalid:
  - Delivery sender: EMAIL_FROM_DELIVERY not configured (and EMAIL_FROM fallback not set)
```

---

### `parseEmailAddress(input)` (Internal)

Parses email address string with optional display name.

#### Signature

```typescript
function parseEmailAddress(input: string): {
  email: string
  displayName?: string
}
```

#### Parameters

- **`input`** (`string`) - Email address to parse

#### Returns

Object with `email` and optional `displayName`

#### Supported Formats

**With display name:**
```typescript
parseEmailAddress('"Capsule Note" <noreply@capsulenote.com>')
// { email: "noreply@capsulenote.com", displayName: "Capsule Note" }

parseEmailAddress('Capsule Note <noreply@capsulenote.com>')
// { email: "noreply@capsulenote.com", displayName: "Capsule Note" }
```

**Without display name:**
```typescript
parseEmailAddress('noreply@capsulenote.com')
// { email: "noreply@capsulenote.com" }
```

**Note:** This is an internal utility function. Use `getEmailSender()` instead of calling this directly.

## Integration Patterns

### Worker Function Pattern

Standard pattern for Inngest worker functions:

```typescript
import { inngest } from "../client"
import { getEmailSender } from "../lib/email-config"

// Validation helper
function validateConfig(): void {
  getEmailSender('notification')  // Validates sender is configured

  if (!process.env.NEXT_PUBLIC_APP_URL) {
    throw new Error("NEXT_PUBLIC_APP_URL not configured")
  }
}

export const sendNotification = inngest.createFunction(
  {
    id: "send-notification",
    name: "Send Notification Email",
    retries: 3,
  },
  { event: "notification.send" },
  async ({ event, step }) => {
    // Validate early
    try {
      validateConfig()
    } catch (error) {
      throw new NonRetriableError(error.message)
    }

    // Get sender configuration
    const sender = getEmailSender('notification')

    // Send email with structured logging
    const result = await step.run("send-email", async () => {
      logger.info("Sending notification", {
        to: event.data.email,
        from: sender.from,
        senderEmail: sender.email,
        senderDisplayName: sender.displayName,
      })

      return await emailProvider.send({
        from: sender.from,
        to: event.data.email,
        subject: event.data.subject,
        html: event.data.html,
      })
    })

    return { success: true, messageId: result.id }
  }
)
```

### Server Action Pattern

Using email configuration in Next.js Server Actions:

```typescript
"use server"

import { getEmailSender } from "@/workers/inngest/lib/email-config"
import { triggerInngestEvent } from "@/server/lib/trigger-inngest"

export async function sendUserNotification(userId: string, message: string) {
  // Validate configuration before triggering
  try {
    getEmailSender('notification')
  } catch (error) {
    throw new Error(`Email configuration error: ${error.message}`)
  }

  // Trigger Inngest event
  await triggerInngestEvent("notification.send", {
    userId,
    message,
  })
}
```

### Provider Abstraction Pattern

Using with email provider abstraction:

```typescript
import { getEmailProvider } from "@/server/providers/email"
import { getEmailSender } from "@/workers/inngest/lib/email-config"

async function sendEmail(type: EmailSenderType, options: EmailOptions) {
  const sender = getEmailSender(type)
  const provider = await getEmailProvider()

  return await provider.send({
    ...options,
    from: sender.from,
    headers: {
      ...options.headers,
      "X-Sender-Type": type,
    },
  })
}

// Usage
await sendEmail('notification', {
  to: user.email,
  subject: "Welcome to Capsule Note",
  html: welcomeHtml,
})
```

## Testing

### Unit Tests

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { getEmailSender, validateEmailSenderConfig } from "./email-config"

describe("Email Configuration", () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe("getEmailSender", () => {
    it("should return notification sender from EMAIL_FROM_NOTIFICATION", () => {
      process.env.EMAIL_FROM_NOTIFICATION = "Capsule Note <noreply@capsulenote.com>"

      const sender = getEmailSender('notification')

      expect(sender.from).toBe("Capsule Note <noreply@capsulenote.com>")
      expect(sender.email).toBe("noreply@capsulenote.com")
      expect(sender.displayName).toBe("Capsule Note")
    })

    it("should fallback to EMAIL_FROM if type-specific not set", () => {
      process.env.EMAIL_FROM = "no-reply@mail.dearme.app"

      const sender = getEmailSender('notification')

      expect(sender.from).toBe("no-reply@mail.dearme.app")
      expect(sender.email).toBe("no-reply@mail.dearme.app")
    })

    it("should throw error if neither variable is set", () => {
      delete process.env.EMAIL_FROM_NOTIFICATION
      delete process.env.EMAIL_FROM

      expect(() => getEmailSender('notification')).toThrow(
        "EMAIL_FROM_NOTIFICATION not configured"
      )
    })

    it("should parse email with display name", () => {
      process.env.EMAIL_FROM_DELIVERY = 'Capsule Note <yourcapsulenote@capsulenote.com>'

      const sender = getEmailSender('delivery')

      expect(sender.displayName).toBe("Capsule Note")
      expect(sender.email).toBe("yourcapsulenote@capsulenote.com")
    })

    it("should default displayName to 'Capsule Note' if not provided", () => {
      process.env.EMAIL_FROM_NOTIFICATION = "noreply@capsulenote.com"

      const sender = getEmailSender('notification')

      expect(sender.displayName).toBe("Capsule Note")
    })
  })

  describe("validateEmailSenderConfig", () => {
    it("should not throw if all senders configured", () => {
      process.env.EMAIL_FROM_NOTIFICATION = "Capsule Note <noreply@capsulenote.com>"
      process.env.EMAIL_FROM_DELIVERY = "Capsule Note <yourcapsulenote@capsulenote.com>"

      expect(() => validateEmailSenderConfig()).not.toThrow()
    })

    it("should throw if any sender missing", () => {
      delete process.env.EMAIL_FROM_NOTIFICATION
      delete process.env.EMAIL_FROM_DELIVERY
      delete process.env.EMAIL_FROM

      expect(() => validateEmailSenderConfig()).toThrow(
        "Email sender configuration invalid"
      )
    })

    it("should list all configuration errors", () => {
      delete process.env.EMAIL_FROM_NOTIFICATION
      delete process.env.EMAIL_FROM_DELIVERY
      delete process.env.EMAIL_FROM

      try {
        validateEmailSenderConfig()
      } catch (error) {
        expect(error.message).toContain("Notification sender:")
        expect(error.message).toContain("Delivery sender:")
      }
    })
  })
})
```

### Integration Tests

```typescript
import { describe, it, expect } from "vitest"
import { inngest } from "../client"
import { getEmailSender } from "../lib/email-config"

describe("Email Worker Integration", () => {
  it("should send notification email with correct sender", async () => {
    const sender = getEmailSender('notification')

    const result = await inngest.send({
      name: "notification.send",
      data: {
        email: "test@example.com",
        subject: "Test notification",
        html: "<p>Test</p>",
      },
    })

    // Verify sender used
    expect(result).toMatchObject({
      from: sender.from,
    })
  })
})
```

## Migration Guide

### From Legacy `EMAIL_FROM`

**Before:**
```typescript
const from = process.env.EMAIL_FROM || "no-reply@mail.dearme.app"

await emailProvider.send({
  from,
  to: user.email,
  subject: "Welcome",
  html: emailHtml,
})
```

**After:**
```typescript
import { getEmailSender } from "../lib/email-config"

const sender = getEmailSender('notification')

await emailProvider.send({
  from: sender.from,
  to: user.email,
  subject: "Welcome",
  html: emailHtml,
})
```

### From Hard-Coded Senders

**Before:**
```typescript
await resend.emails.send({
  from: "DearMe <no-reply@mail.dearme.app>",
  to: user.email,
  subject: "Your letter is ready",
  html: emailHtml,
})
```

**After:**
```typescript
import { getEmailSender } from "../lib/email-config"

const sender = getEmailSender('delivery')

await resend.emails.send({
  from: sender.from,
  to: user.email,
  subject: "Your letter is ready",
  html: emailHtml,
})
```

## Best Practices

### ✅ Do

- **Validate early** - Call `validateEmailSenderConfig()` at application startup
- **Use type-specific senders** - Choose 'notification' or 'delivery' appropriately
- **Log sender details** - Include sender info in structured logs for observability
- **Handle configuration errors** - Catch and handle missing configuration gracefully
- **Use RFC 5322 format** - Include display names: `"Display Name <email@domain.com>"`

### ❌ Don't

- **Hard-code sender addresses** - Always use `getEmailSender()`
- **Mix sender types** - Don't use notification sender for deliveries
- **Ignore validation errors** - Handle configuration errors at startup
- **Skip display names** - Always include brand name in sender
- **Use legacy EMAIL_FROM** - Migrate to type-specific variables

## Troubleshooting

### Configuration Not Loading

**Symptom:** `getEmailSender()` throws error despite environment variables set

**Debug steps:**
```typescript
// Check environment variables are loaded
console.log("EMAIL_FROM_NOTIFICATION:", process.env.EMAIL_FROM_NOTIFICATION)
console.log("EMAIL_FROM_DELIVERY:", process.env.EMAIL_FROM_DELIVERY)
console.log("EMAIL_FROM:", process.env.EMAIL_FROM)

// Verify configuration
try {
  const sender = getEmailSender('notification')
  console.log("Sender config:", sender)
} catch (error) {
  console.error("Configuration error:", error.message)
}
```

### Wrong Sender Used

**Symptom:** Notification emails use delivery sender or vice versa

**Check:**
```typescript
// Verify correct type parameter
const sender = getEmailSender('notification')  // ✓ Correct
const sender = getEmailSender('delivery')      // ✗ Wrong for notification
```

### Display Name Not Appearing

**Symptom:** Emails show email address instead of "Capsule Note"

**Check format:**
```bash
# ✓ Correct
EMAIL_FROM_NOTIFICATION="Capsule Note <noreply@capsulenote.com>"

# ✗ Wrong
EMAIL_FROM_NOTIFICATION=noreply@capsulenote.com  # Missing display name
```

## References

- [RFC 5322: Internet Message Format](https://www.rfc-editor.org/rfc/rfc5322.html)
- [Email Sender Configuration Guide](./email-sender-configuration.md)
- [Capsule Note Branding Guidelines](./capsule-note-branding.md)
