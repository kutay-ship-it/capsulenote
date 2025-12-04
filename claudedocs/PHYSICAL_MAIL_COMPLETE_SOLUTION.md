# Physical Mail Scheduling - Complete Solution

**Date**: 2025-12-04
**Scope**: Complete redesign of physical mail scheduling architecture
**Estimated Effort**: ~800 lines across 8 files + 1 migration

---

## Executive Summary

The current physical mail flow has a fundamental flaw: **letters are not truly "sealed"** when scheduled. Users can edit content after scheduling, and the worker sends the current version instead of the original. This violates user expectations for a "time capsule" product.

### Solution: Hybrid Sealed Architecture

1. **Content Sealing**: Snapshot letter content at schedule time → store in `MailDelivery`
2. **Lob Native Scheduling**: For letters <180 days out → send to Lob immediately with `send_date`
3. **Deferred Scheduling**: For letters >180 days out → Inngest wakes at D-90, then uses Lob
4. **Edit Blocking**: Prevent letter edits when mail deliveries are scheduled
5. **Proper Cancellation**: Call `lob.letters.delete()` when user cancels

---

## Architecture Diagrams

### New Flow: Immediate Mode (< 180 days)

```
User: "Seal & Schedule" for delivery in 3 months
    │
    ▼
scheduleDelivery(channel: "mail")
    │
    ├─ 1. Snapshot letter content → MailDelivery.sealedContent*
    │
    ├─ 2. Calculate: daysUntil = 90 (< 180 threshold)
    │
    ├─ 3. Render letter HTML from sealed content
    │
    ├─ 4. Call Lob API IMMEDIATELY:
    │       lob.letters.create({
    │         file: renderedHtml,
    │         send_date: "2025-03-04",  // 90 days from now
    │         ...
    │       })
    │
    ├─ 5. Store: lobJobId, lobScheduleMode = 'immediate'
    │
    └─ 6. Done! Lob handles timing and printing.

Content is SEALED. Letter edits blocked.
Lob holds letter until send_date, then prints.
```

### New Flow: Deferred Mode (> 180 days)

```
User: "Seal & Schedule" for delivery in 2 years
    │
    ▼
scheduleDelivery(channel: "mail")
    │
    ├─ 1. Snapshot letter content → MailDelivery.sealedContent*
    │
    ├─ 2. Calculate: daysUntil = 730 (> 180 threshold)
    │
    ├─ 3. Set: lobScheduleMode = 'deferred'
    │
    ├─ 4. Trigger Inngest event: "mail.delivery.deferred"
    │       payload: { deliveryId, wakeAt: deliverAt - 90 days }
    │
    └─ 5. Inngest job scheduled to wake in 640 days

Content is SEALED. Letter edits blocked.

... 640 days later ...

Inngest Worker wakes up:
    │
    ├─ 1. Read sealedContent from MailDelivery (NOT from Letter!)
    │
    ├─ 2. Render letter HTML from sealed content
    │
    ├─ 3. Call Lob API with send_date = original deliverAt (90 days away)
    │
    ├─ 4. Update: lobJobId, lobScheduleMode = 'immediate'
    │
    └─ 5. Done! Lob handles final timing and printing.
```

### Cancel Flow

```
User clicks "Cancel Delivery"
    │
    ▼
cancelDelivery(deliveryId)
    │
    ├─ Check lobScheduleMode:
    │
    ├─ IF 'immediate' AND lobJobId exists:
    │   │
    │   ├─ 1. Call lob.letters.delete(lobJobId)
    │   │       └─ If fails: Return error, don't proceed
    │   │
    │   ├─ 2. Update DB: status = 'canceled'
    │   │
    │   └─ 3. Refund credit (if outside lock window)
    │
    └─ IF 'deferred':
        │
        ├─ 1. Cancel Inngest run (if exists)
        │
        ├─ 2. Update DB: status = 'canceled'
        │
        └─ 3. Refund credit (if outside lock window)
```

---

## Database Schema Changes

### Migration: Add Sealed Content Fields

```prisma
// packages/prisma/schema.prisma

enum LobScheduleMode {
  immediate  // Sent to Lob with send_date, Lob holds until print
  deferred   // Inngest holds, will send to Lob at D-90
}

model MailDelivery {
  deliveryId         String            @id @map("delivery_id") @db.Uuid
  shippingAddressId  String            @map("shipping_address_id") @db.Uuid

  // Existing fields...
  lobJobId           String?           @map("lob_job_id")
  deliveryMode       MailDeliveryMode  @default(send_on) @map("delivery_mode")
  targetDate         DateTime?         @map("target_date") @db.Timestamptz(3)
  sendDate           DateTime?         @map("send_date") @db.Timestamptz(3)
  transitDays        Int?              @map("transit_days")
  printOptions       Json              @map("print_options")
  previewUrl         String?           @map("preview_url")
  trackingStatus     String?           @map("tracking_status")

  // NEW: Lob scheduling mode
  lobScheduleMode    LobScheduleMode   @default(deferred) @map("lob_schedule_mode")

  // NEW: Sealed content snapshot (encrypted, immutable after schedule)
  sealedCiphertext   Bytes?            @map("sealed_ciphertext")
  sealedNonce        Bytes?            @map("sealed_nonce")
  sealedKeyVersion   Int?              @map("sealed_key_version")
  sealedTitle        String?           @map("sealed_title")
  sealedAt           DateTime?         @map("sealed_at") @db.Timestamptz(3)

  // NEW: Lob API response data
  lobSendDate        DateTime?         @map("lob_send_date") @db.Timestamptz(3)
  lobExpectedDelivery DateTime?        @map("lob_expected_delivery") @db.Timestamptz(3)
  lobCancellable     Boolean           @default(true) @map("lob_cancellable")

  createdAt          DateTime          @default(now()) @map("created_at") @db.Timestamptz(3)

  delivery        Delivery         @relation(fields: [deliveryId], references: [id], onDelete: Cascade)
  shippingAddress ShippingAddress  @relation(fields: [shippingAddressId], references: [id])

  @@index([lobJobId])
  @@index([lobScheduleMode])
  @@map("mail_deliveries")
}
```

### Migration SQL

```sql
-- Migration: add_sealed_content_to_mail_delivery

-- Add enum
CREATE TYPE "LobScheduleMode" AS ENUM ('immediate', 'deferred');

-- Add columns
ALTER TABLE "mail_deliveries"
  ADD COLUMN "lob_schedule_mode" "LobScheduleMode" NOT NULL DEFAULT 'deferred',
  ADD COLUMN "sealed_ciphertext" BYTEA,
  ADD COLUMN "sealed_nonce" BYTEA,
  ADD COLUMN "sealed_key_version" INTEGER,
  ADD COLUMN "sealed_title" TEXT,
  ADD COLUMN "sealed_at" TIMESTAMPTZ(3),
  ADD COLUMN "lob_send_date" TIMESTAMPTZ(3),
  ADD COLUMN "lob_expected_delivery" TIMESTAMPTZ(3),
  ADD COLUMN "lob_cancellable" BOOLEAN NOT NULL DEFAULT true;

-- Add index
CREATE INDEX "mail_deliveries_lob_schedule_mode_idx" ON "mail_deliveries"("lob_schedule_mode");

-- Backfill existing scheduled deliveries (best effort)
-- This copies current letter content as sealed content
UPDATE "mail_deliveries" md
SET
  "sealed_ciphertext" = l."body_ciphertext",
  "sealed_nonce" = l."body_nonce",
  "sealed_key_version" = l."key_version",
  "sealed_title" = l."title",
  "sealed_at" = md."created_at",
  "lob_schedule_mode" = 'deferred'
FROM "deliveries" d
JOIN "letters" l ON d."letter_id" = l."id"
WHERE md."delivery_id" = d."id"
  AND d."status" = 'scheduled'
  AND d."channel" = 'mail';
```

---

## Type Definition Changes

### `apps/web/types/lob.d.ts`

```typescript
interface LetterCreateParams {
  to: Address
  from?: Address
  file: string
  color?: boolean
  double_sided?: boolean
  description?: string
  use_type: "marketing" | "operational"
  mail_type?: "usps_first_class" | "usps_standard"
  merge_variables?: Record<string, unknown>
  metadata?: Record<string, string>
  return_envelope?: boolean
  address_placement?: "top_first_page" | "insert_blank_page"
  idempotency_key?: string

  // NEW: Schedule for future send (up to 180 days)
  // Format: ISO 8601 date string (YYYY-MM-DD)
  send_date?: string
}

interface Letter {
  id: string
  description?: string
  expected_delivery_date: string
  date_created: string
  date_modified: string
  deleted?: boolean
  from: Address
  to: Address
  url: string
  carrier: string
  thumbnails: string[]
  mail_type: string
  use_type: string
  color: boolean
  double_sided: boolean
  tracking_events: Array<{...}>

  // NEW: Scheduling fields
  send_date?: string
  // Status indicating if letter can be cancelled
  // Letters with send_date in future can be cancelled
}
```

---

## Lob Provider Changes

### `apps/web/server/providers/lob.ts`

```typescript
// Add to MailOptions interface
export interface MailOptions {
  to: MailingAddress
  html: string
  color?: boolean
  doubleSided?: boolean
  description?: string
  useType?: "marketing" | "operational"
  mailType?: "usps_first_class" | "usps_standard"
  idempotencyKey?: string

  // NEW: Schedule for future send
  sendDate?: Date
}

// Add to TemplatedLetterOptions interface
export interface TemplatedLetterOptions {
  // ... existing fields ...

  // NEW: Schedule for future send
  sendDate?: Date
}

// NEW: Cancel a scheduled letter
export async function cancelLetter(lobJobId: string): Promise<{ success: boolean; error?: string }> {
  if (!lob) {
    return { success: false, error: "Lob not configured" }
  }

  try {
    await lob.letters.delete(lobJobId)
    return { success: true }
  } catch (error) {
    // Check if already cancelled or past cancellation window
    if (error instanceof Error) {
      if (error.message.includes("already been sent") ||
          error.message.includes("cannot be canceled")) {
        return { success: false, error: "Letter cannot be cancelled - already in production" }
      }
    }
    throw error
  }
}

// Modify sendLetter to support send_date
export async function sendLetter(options: MailOptions): Promise<SendLetterResult> {
  // ... existing setup ...

  const params: Parameters<typeof lob.letters.create>[0] = {
    // ... existing params ...
  }

  // Add send_date if provided (for scheduled delivery)
  if (options.sendDate) {
    // Format as YYYY-MM-DD
    const year = options.sendDate.getFullYear()
    const month = String(options.sendDate.getMonth() + 1).padStart(2, "0")
    const day = String(options.sendDate.getDate()).padStart(2, "0")
    params.send_date = `${year}-${month}-${day}`
  }

  // ... rest of function ...
}

// Modify sendTemplatedLetter similarly
export async function sendTemplatedLetter(options: TemplatedLetterOptions): Promise<SendLetterResult> {
  // ... existing logic ...

  return sendLetter({
    // ... existing params ...
    sendDate: options.sendDate,
  })
}
```

---

## Server Action Changes

### `apps/web/server/actions/deliveries.ts`

```typescript
// Constants
const LOB_MAX_SCHEDULE_DAYS = 180
const LOB_DEFERRED_TRIGGER_DAYS = 90  // Wake Inngest at D-90 for deferred letters
const MIN_PHYSICAL_MAIL_LEAD_DAYS = 7  // Reduced from 30 - only need print time

/**
 * Schedule a new delivery for a letter
 */
export async function scheduleDelivery(input: unknown): Promise<ActionResult<{ deliveryId: string }>> {
  // ... existing validation, entitlement checks ...

  if (data.channel === 'mail') {
    // ... existing 7-day minimum validation ...

    const millisecondsPerDay = 1000 * 60 * 60 * 24
    const daysUntilDelivery = Math.floor(
      (safeDeliverAt.getTime() - Date.now()) / millisecondsPerDay
    )

    // Determine scheduling mode
    const useImmediateMode = daysUntilDelivery <= LOB_MAX_SCHEDULE_DAYS

    // Get letter content for sealing
    const letterForSealing = await prisma.letter.findUnique({
      where: { id: data.letterId },
      select: {
        bodyCiphertext: true,
        bodyNonce: true,
        keyVersion: true,
        title: true,
      },
    })

    if (!letterForSealing) {
      return { success: false, error: { code: ErrorCodes.NOT_FOUND, message: "Letter not found" } }
    }

    // Create delivery with sealed content
    delivery = await prisma.$transaction(async (tx) => {
      // ... existing credit deduction ...

      const newDelivery = await tx.delivery.create({
        data: {
          userId: user.id,
          letterId: data.letterId,
          channel: data.channel,
          deliverAt: actualDeliverAt,
          timezoneAtCreation: data.timezone,
          status: "scheduled",
        },
      })

      // Create MailDelivery with SEALED content
      await tx.mailDelivery.create({
        data: {
          deliveryId: newDelivery.id,
          shippingAddressId: data.shippingAddressId,
          deliveryMode: mailDeliveryMode,
          targetDate: mailTargetDate,
          sendDate: mailSendDate,
          transitDays: mailTransitDays,
          printOptions: data.printOptions ?? { color: false, doubleSided: false },

          // NEW: Sealed content
          sealedCiphertext: letterForSealing.bodyCiphertext,
          sealedNonce: letterForSealing.bodyNonce,
          sealedKeyVersion: letterForSealing.keyVersion,
          sealedTitle: letterForSealing.title,
          sealedAt: new Date(),

          // NEW: Schedule mode
          lobScheduleMode: useImmediateMode ? "immediate" : "deferred",
        },
      })

      return newDelivery
    })

    // Handle immediate vs deferred scheduling
    if (useImmediateMode) {
      // Send to Lob NOW with send_date
      try {
        const decrypted = await decryptLetter(
          letterForSealing.bodyCiphertext,
          letterForSealing.bodyNonce,
          letterForSealing.keyVersion
        )

        const result = await sendTemplatedLetter({
          to: address,
          letterContent: decrypted.bodyHtml,
          writtenDate: new Date(letter.createdAt),
          deliveryDate: actualDeliverAt,
          letterTitle: letterForSealing.title,
          recipientName: address.name,
          color: data.printOptions?.color ?? false,
          doubleSided: data.printOptions?.doubleSided ?? false,
          idempotencyKey: `mail-delivery-${delivery.id}-initial`,
          sendDate: actualDeliverAt,  // NEW: Schedule for future
        })

        // Store Lob job details
        await prisma.mailDelivery.update({
          where: { deliveryId: delivery.id },
          data: {
            lobJobId: result.id,
            lobSendDate: actualDeliverAt,
            lobExpectedDelivery: result.expectedDeliveryDate
              ? new Date(result.expectedDeliveryDate)
              : null,
            previewUrl: result.url,
          },
        })

        logger.info("Mail scheduled with Lob (immediate mode)", {
          deliveryId: delivery.id,
          lobJobId: result.id,
          sendDate: actualDeliverAt,
        })

      } catch (lobError) {
        // Rollback: Delete delivery and refund credit
        await rollbackDelivery(delivery.id, user.id, data.channel)

        // Check if it's a premium feature error - fall back to deferred
        if (isLobSchedulingUnavailableError(lobError)) {
          logger.warn("Lob scheduling unavailable, falling back to deferred mode", {
            deliveryId: delivery.id,
          })
          // Recreate with deferred mode... (or throw for now)
        }

        return {
          success: false,
          error: {
            code: ErrorCodes.SERVICE_UNAVAILABLE,
            message: "Failed to schedule physical mail. Please try again.",
          },
        }
      }

    } else {
      // Deferred mode: Trigger Inngest to wake at D-90
      const wakeAt = new Date(actualDeliverAt.getTime() - LOB_DEFERRED_TRIGGER_DAYS * millisecondsPerDay)

      try {
        const eventId = await triggerInngestEvent("mail.delivery.deferred", {
          deliveryId: delivery.id,
          wakeAt: wakeAt.toISOString(),
          finalDeliverAt: actualDeliverAt.toISOString(),
        })

        await prisma.delivery.update({
          where: { id: delivery.id },
          data: { inngestRunId: eventId },
        })

        logger.info("Mail scheduled with Inngest (deferred mode)", {
          deliveryId: delivery.id,
          wakeAt,
          finalDeliverAt: actualDeliverAt,
          eventId,
        })

      } catch (inngestError) {
        await rollbackDelivery(delivery.id, user.id, data.channel)
        return {
          success: false,
          error: {
            code: ErrorCodes.SERVICE_UNAVAILABLE,
            message: "Failed to schedule delivery. Please try again.",
          },
        }
      }
    }
  }

  // ... rest of function ...
}

/**
 * Cancel a scheduled delivery
 */
export async function cancelDelivery(input: unknown): Promise<ActionResult<void>> {
  // ... existing validation ...

  const existing = await prisma.delivery.findFirst({
    where: {
      id: deliveryId,
      userId: user.id,
      status: { in: ["scheduled", "failed"] },
    },
    include: {
      mailDelivery: true,
    },
  })

  if (!existing) {
    return { success: false, error: { code: ErrorCodes.NOT_FOUND, message: "Delivery not found" } }
  }

  // For mail: Cancel with Lob first if in immediate mode
  if (existing.channel === "mail" && existing.mailDelivery) {
    const { lobScheduleMode, lobJobId } = existing.mailDelivery

    if (lobScheduleMode === "immediate" && lobJobId) {
      // Must cancel with Lob FIRST
      const lobResult = await cancelLetter(lobJobId)

      if (!lobResult.success) {
        logger.error("Failed to cancel letter with Lob", {
          deliveryId,
          lobJobId,
          error: lobResult.error,
        })

        // If Lob says it can't be cancelled, inform user
        if (lobResult.error?.includes("cannot be cancelled")) {
          return {
            success: false,
            error: {
              code: ErrorCodes.OPERATION_NOT_ALLOWED,
              message: "This letter is already in production and cannot be cancelled.",
            },
          }
        }

        return {
          success: false,
          error: {
            code: ErrorCodes.SERVICE_UNAVAILABLE,
            message: "Failed to cancel letter. Please try again.",
          },
        }
      }

      logger.info("Letter cancelled with Lob", { deliveryId, lobJobId })
    }
  }

  // Now proceed with DB updates and refunds...
  // ... existing cancel logic ...
}
```

### `apps/web/server/actions/letters.ts`

```typescript
/**
 * Update an existing letter
 * BLOCKS updates if letter has scheduled mail deliveries
 */
export async function updateLetter(input: unknown): Promise<ActionResult<void>> {
  // ... existing validation ...

  // NEW: Check for scheduled mail deliveries
  const scheduledMailDeliveries = await prisma.delivery.count({
    where: {
      letterId: id,
      channel: "mail",
      status: { in: ["scheduled", "processing"] },
    },
  })

  if (scheduledMailDeliveries > 0) {
    await logger.warn("Attempted to edit letter with scheduled mail delivery", {
      userId: user.id,
      letterId: id,
      scheduledCount: scheduledMailDeliveries,
    })

    return {
      success: false,
      error: {
        code: ErrorCodes.OPERATION_NOT_ALLOWED,
        message: "This letter cannot be edited because it has scheduled physical mail deliveries. Cancel the deliveries first to edit the letter.",
      },
    }
  }

  // ... rest of update logic ...
}
```

---

## Inngest Worker Changes

### `workers/inngest/functions/deliver-mail.ts`

```typescript
/**
 * Deferred mail delivery - wakes up at D-90 to send to Lob
 */
export const deliverMailDeferred = inngest.createFunction(
  {
    id: "deliver-mail-deferred",
    retries: 5,
    concurrency: { limit: 10 },
  },
  { event: "mail.delivery.deferred" },
  async ({ event, step, attempt }) => {
    const { deliveryId, wakeAt, finalDeliverAt } = event.data

    // Sleep until wake time (D-90)
    await step.sleepUntil("wait-for-handoff", new Date(wakeAt))

    // Fetch delivery with sealed content
    const delivery = await step.run("fetch-delivery", async () => {
      return prisma.delivery.findUnique({
        where: { id: deliveryId },
        include: {
          mailDelivery: {
            include: {
              shippingAddress: true,
            },
          },
          letter: {
            select: { createdAt: true },
          },
        },
      })
    })

    if (!delivery || delivery.status !== "scheduled") {
      return { skipped: true, reason: "Delivery not found or not scheduled" }
    }

    const mailDelivery = delivery.mailDelivery!

    // Verify we have sealed content
    if (!mailDelivery.sealedCiphertext || !mailDelivery.sealedNonce) {
      throw new NonRetriableError("Sealed content not found - cannot deliver")
    }

    // Decrypt SEALED content (not current letter!)
    const decryptedContent = await step.run("decrypt-sealed-content", async () => {
      return decryptLetter(
        mailDelivery.sealedCiphertext!,
        mailDelivery.sealedNonce!,
        mailDelivery.sealedKeyVersion!
      )
    })

    // Send to Lob with send_date = finalDeliverAt (within 90 days now)
    const sendResult = await step.run("send-to-lob", async () => {
      const address = mailDelivery.shippingAddress!
      const printOptions = mailDelivery.printOptions as { color?: boolean; doubleSided?: boolean }

      const idempotencyKey = `mail-delivery-${deliveryId}-handoff-${attempt}`

      const result = await sendTemplatedLetter({
        to: {
          name: address.name,
          line1: address.line1,
          line2: address.line2 || undefined,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          country: address.country,
        },
        letterContent: decryptedContent.bodyHtml,
        writtenDate: new Date(delivery.letter.createdAt),
        deliveryDate: new Date(finalDeliverAt),
        letterTitle: mailDelivery.sealedTitle || "Letter to Future Self",
        recipientName: address.name,
        color: printOptions.color ?? false,
        doubleSided: printOptions.doubleSided ?? false,
        idempotencyKey,
        sendDate: new Date(finalDeliverAt),  // Schedule with Lob
      })

      return result
    })

    // Update to immediate mode with Lob job ID
    await step.run("update-to-immediate", async () => {
      await prisma.mailDelivery.update({
        where: { deliveryId },
        data: {
          lobJobId: sendResult.id,
          lobScheduleMode: "immediate",
          lobSendDate: new Date(finalDeliverAt),
          lobExpectedDelivery: sendResult.expectedDeliveryDate
            ? new Date(sendResult.expectedDeliveryDate)
            : null,
          previewUrl: sendResult.url,
        },
      })
    })

    return {
      success: true,
      lobJobId: sendResult.id,
      handedOffAt: new Date().toISOString(),
    }
  }
)

// Keep existing deliverMail for backwards compatibility during migration
// Mark as deprecated
export const deliverMail = inngest.createFunction(
  {
    id: "deliver-mail",
    retries: 5,
    concurrency: { limit: 10 },
  },
  { event: "mail.delivery.scheduled" },
  async ({ event, step, attempt }) => {
    // ... existing logic, but modified to:
    // 1. Check if sealedContent exists, use that instead of Letter
    // 2. If no sealedContent (legacy), fall back to Letter (with warning)

    const delivery = await step.run("fetch-delivery", async () => {
      return prisma.delivery.findUnique({
        where: { id: event.data.deliveryId },
        include: {
          mailDelivery: { include: { shippingAddress: true } },
          letter: true,
        },
      })
    })

    // Use sealed content if available, otherwise fall back to letter
    const contentSource = delivery.mailDelivery?.sealedCiphertext
      ? {
          ciphertext: delivery.mailDelivery.sealedCiphertext,
          nonce: delivery.mailDelivery.sealedNonce!,
          keyVersion: delivery.mailDelivery.sealedKeyVersion!,
          title: delivery.mailDelivery.sealedTitle || delivery.letter.title,
          isSealed: true,
        }
      : {
          ciphertext: delivery.letter.bodyCiphertext,
          nonce: delivery.letter.bodyNonce,
          keyVersion: delivery.letter.keyVersion,
          title: delivery.letter.title,
          isSealed: false,
        }

    if (!contentSource.isSealed) {
      logger.warn("Using non-sealed content for mail delivery (legacy)", {
        deliveryId: event.data.deliveryId,
      })
    }

    // ... rest of delivery logic using contentSource ...
  }
)
```

---

## Feature Flags

Add to `apps/web/server/lib/feature-flags.ts`:

```typescript
type FeatureFlag =
  // ... existing flags ...
  | "use-lob-native-scheduling"     // Use Lob's send_date for <180 day letters
  | "enable-letter-edit-blocking"   // Block edits for letters with scheduled mail
```

Usage in `scheduleDelivery`:
```typescript
const useLobNativeScheduling = await getFeatureFlag("use-lob-native-scheduling")
const useImmediateMode = useLobNativeScheduling && daysUntilDelivery <= LOB_MAX_SCHEDULE_DAYS
```

---

## UI Changes

### Edit Button Disabled State

```typescript
// apps/web/app/[locale]/(app-v3)/letters/[id]/page.tsx

// Check if letter has scheduled mail deliveries
const hasScheduledMailDeliveries = letter.deliveries.some(
  d => d.channel === "mail" && ["scheduled", "processing"].includes(d.status)
)

// In JSX:
<Button
  variant="outline"
  onClick={() => router.push(`/letters/${letter.id}/edit`)}
  disabled={hasScheduledMailDeliveries}
  title={hasScheduledMailDeliveries
    ? "Cannot edit - letter has scheduled mail deliveries"
    : "Edit letter"
  }
>
  Edit
</Button>

{hasScheduledMailDeliveries && (
  <p className="text-xs text-charcoal/50">
    This letter is sealed for physical mail delivery and cannot be edited.
    Cancel the scheduled delivery to make changes.
  </p>
)}
```

---

## Testing Checklist

### Unit Tests
- [ ] `calculateScheduleMode()` returns 'immediate' for <180 days
- [ ] `calculateScheduleMode()` returns 'deferred' for >180 days
- [ ] Content sealing creates correct snapshot

### Integration Tests
- [ ] Scheduling <180 days calls Lob API immediately
- [ ] Scheduling >180 days triggers Inngest event
- [ ] Edit blocking returns error when mail scheduled
- [ ] Cancel calls `lob.letters.delete()` for immediate mode
- [ ] Cancel cancels Inngest run for deferred mode
- [ ] Deferred worker reads sealed content, not letter

### E2E Tests
- [ ] Full flow: Create → Schedule → Verify Lob API called
- [ ] Full flow: Create → Schedule → Edit → Blocked
- [ ] Full flow: Create → Schedule → Cancel → Lob deleted

---

## Rollout Plan

### Phase 1: Foundation (Low Risk)
1. Deploy schema migration
2. Add feature flags (disabled)
3. Deploy code changes (flag-gated)

### Phase 2: Sealing Only
1. Enable `enable-letter-edit-blocking`
2. New deliveries get sealed content
3. Verify edit blocking works
4. Monitor for issues

### Phase 3: Lob Native Scheduling
1. Enable `use-lob-native-scheduling`
2. New <180 day deliveries use immediate mode
3. Monitor Lob API usage and costs
4. Verify cancellation works

### Phase 4: Full Migration
1. Backfill existing scheduled deliveries
2. Remove legacy code paths
3. Remove feature flags

---

## Summary

This solution provides **true time capsule semantics** for physical mail:

1. **Sealed Content**: Letter content is snapshotted at schedule time and cannot be changed
2. **Efficient Scheduling**: Letters <180 days use Lob's native scheduling (no Inngest)
3. **Long-term Support**: Letters >180 days use hybrid approach (Inngest → Lob at D-90)
4. **Proper Cancellation**: User cancel actually prevents printing via Lob API
5. **Edit Protection**: Users cannot accidentally change sealed letters

The architecture respects both user expectations ("what I sealed is what gets printed") and operational efficiency (leveraging Lob's infrastructure where possible).
