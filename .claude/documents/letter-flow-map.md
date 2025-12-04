# Letter Flow Map

## Overview

Letters flow: Create → Edit → Schedule → Seal (mail) → Deliver

## Flow Diagram

```
/letters/new → LetterEditorV3 → createLetter() → scheduleDelivery()
     │
     ├─[Email]──▶ delivery.scheduled ──▶ Inngest waits ──▶ decrypt ──▶ send
     │
     └─[Mail]──▶ Content SEALED at schedule time
                 ├─[≤180d]──▶ Lob NOW + send_date (immediate mode)
                 └─[>180d]──▶ Inngest waits ──▶ Lob later (deferred mode)
```

## 1. Letter Creation

**File**: `apps/web/server/actions/letters.ts` → `createLetter()`

```
User input → Validate → Encrypt(bodyRich, bodyHtml) → DB insert
                              │
                              ├─ bodyCiphertext (encrypted content)
                              ├─ bodyNonce (96-bit)
                              └─ keyVersion (rotation support)
```

**Returns**: `{ success: true, data: { id, title } }`

## 2. Letter Update

**File**: `apps/web/server/actions/letters.ts` → `updateLetter()`

```
Check ownership → Check sealed status → Encrypt if content changed → DB update
                        │
                        └─ BLOCKED if mailDelivery.sealedAt exists
```

**Blocking Logic**:
- Physical mail with `sealedAt` → Content edits blocked
- Title/metadata edits → Always allowed
- Email-only deliveries → Always editable until sent

## 3. Schedule Delivery

**File**: `apps/web/server/actions/deliveries.ts` → `scheduleDelivery()`

### Email Flow
```
Validate → Deduct credit → Create delivery record → Inngest event
                               │
                               └─ status: scheduled
                               └─ deliverAt: user's selected time
```

### Mail Flow
```
Validate → Deduct credit → Calculate send date
                               │
                               ├─[≤180 days]──▶ IMMEDIATE MODE
                               │                   │
                               │                   ├─ Seal content NOW
                               │                   ├─ Call Lob API NOW
                               │                   ├─ Store lobJobId
                               │                   └─ lobScheduleMode: "immediate"
                               │
                               └─[>180 days]──▶ DEFERRED MODE
                                                   │
                                                   ├─ Seal content NOW
                                                   ├─ NO Lob API call
                                                   └─ lobScheduleMode: "deferred"
```

### Content Sealing
```typescript
sealedContent = {
  sealedContentCiphertext: encrypt(bodyRich + bodyHtml),
  sealedContentNonce: nonce,
  sealedTitle: letter.title,
  sealedAt: new Date()
}
```

## 4. Inngest Workers

### Email Worker
**File**: `workers/inngest/functions/deliver-email.ts`

```
Event received → Sleep until deliverAt → Decrypt letter → Send via Resend/Postmark
                                              │
                                              └─ Uses letter.bodyCiphertext (live content)
```

### Mail Worker
**File**: `workers/inngest/functions/deliver-mail.ts`

```
Event received → Check mode
                    │
                    ├─[immediate + lobJobId]──▶ Skip Lob, update status only
                    │                              (Lob already has job)
                    │
                    └─[deferred]──▶ Sleep until send date
                                       │
                                       └─ Decrypt SEALED content → Call Lob API
                                              │
                                              └─ Uses mailDelivery.sealedContentCiphertext
```

## 5. Cancel Delivery

**File**: `apps/web/server/actions/deliveries.ts` → `cancelDelivery()`

```
Check status → Refund credit → Cancel in provider
                                    │
                                    ├─[Email]──▶ Cancel Inngest event only
                                    │
                                    └─[Mail]──▶ Cancel Inngest + Lob API
                                                    │
                                                    └─ Uses lobJobId if exists
```

## 6. Letter Detail Page

**File**: `apps/web/app/[locale]/(app-v3)/letters/[id]/page.tsx`

### State Logic
```
Letter states:
├─ Draft (no deliveries) → Full edit access
├─ Scheduled → Edit blocked if sealed mail exists
├─ Sent → View only, no edit
└─ Failed → Retry available
```

### Edit Button Logic
```typescript
const hasSealedPhysicalMail = deliveries.some(
  d => d.channel === "mail" && d.mailDelivery?.sealedAt != null
)

const canEdit = !hasDelivery || (
  !hasSealedPhysicalMail &&
  !isSent &&
  deliveries.every(d => d.status === "failed" || d.status === "canceled")
)
```

## 7. Key Data Models

### Letter
```prisma
model Letter {
  bodyCiphertext  Bytes    // Encrypted live content
  bodyNonce       Bytes
  keyVersion      Int
  deliveries      Delivery[]
}
```

### Delivery
```prisma
model Delivery {
  channel     DeliveryChannel  // email | mail
  status      DeliveryStatus   // scheduled | processing | sent | failed | canceled
  deliverAt   DateTime         // User-facing delivery time
}
```

### MailDelivery
```prisma
model MailDelivery {
  lobScheduleMode          String?   // immediate | deferred
  lobJobId                 String?   // Lob's letter ID
  lobSendDate              DateTime? // When Lob sends
  sealedAt                 DateTime? // When content was sealed
  sealedTitle              String?   // Frozen title
  sealedContentCiphertext  Bytes?    // Frozen encrypted content
  sealedContentNonce       Bytes?
}
```

## 8. Credit Flow

```
Schedule:  credits -= 1 (atomic in transaction)
Cancel:    credits += 1 (refund)
Failure:   NO auto-refund (manual review)
```

## 9. Key Constants

```typescript
LOB_MAX_SCHEDULE_DAYS = 180     // Lob API max scheduling window
PHYSICAL_MAIL_BUFFER_DAYS = 3   // Safety buffer for delivery estimation
```

## 10. Error Handling

| Scenario | Behavior |
|----------|----------|
| Insufficient credits | Block scheduling, show error |
| Lob API failure | Rollback credit, return error |
| Content edit blocked | Return validation error |
| Invalid address | Lob verification step catches |

## 11. Warnings Shown

- **Schedule Summary**: Physical mail content sealed immediately warning
- **Seal Confirmation**: Cannot edit after scheduling warning
- **Letter Detail**: Shows "Content Sealed" badge for mail deliveries
