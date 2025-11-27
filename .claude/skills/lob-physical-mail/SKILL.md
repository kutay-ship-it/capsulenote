---
name: lob-physical-mail
description: Lob API integration for physical mail delivery in Capsule Note. Use when implementing or debugging physical letter delivery features, address verification, or mail tracking.
triggers:
  - physical mail
  - lob api
  - send letter
  - mail delivery
  - address verification
  - usps tracking
  - print and mail
version: 1.0.0
---

# Lob Physical Mail Integration

This skill covers Lob API integration for sending physical letters through USPS.

## Quick Reference

### API Keys (in `.env.local`)
```bash
# Test Environment (no actual mail sent)
LOB_API_KEY=test_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Live Environment (actual mail delivery)
# LOB_API_KEY=live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Key Files
- **Provider**: `apps/web/server/providers/lob.ts`
- **Test Script**: `scripts/test-lob-api.ts`
- **Database Schema**: `packages/prisma/schema.prisma` (MailDelivery model)
- **Env Validation**: `apps/web/env.mjs`

### Run Test Script
```bash
pnpm dotenv -e apps/web/.env.local -- tsx scripts/test-lob-api.ts
```

## Core Concepts

### 1. use_type (REQUIRED)
Every letter/postcard must specify `use_type`:
- `"operational"` - Transactional mail (letters to self, receipts, notifications)
- `"marketing"` - Promotional/marketing mail

**For Capsule Note**: Always use `"operational"` since users are writing letters to themselves.

### 2. Test vs Live Environment
- **Test API Key** (`test_*`): Creates mock letters, no actual delivery, free
- **Live API Key** (`live_*`): Real mail delivery, charged per item

### 3. Mail Types
- `usps_first_class` - 4-8 business days, faster (default)
- `usps_standard` - 8-15 business days, cheaper

## API Usage

### Send a Letter
```typescript
import { sendLetter } from "@/server/providers/lob"

const result = await sendLetter({
  to: {
    name: "John Doe",
    line1: "185 Berry Street",
    line2: "Suite 6100",
    city: "San Francisco",
    state: "CA",
    postalCode: "94107",
    country: "US",
  },
  html: "<html>...</html>",
  color: false,
  doubleSided: false,
  useType: "operational",
  mailType: "usps_first_class",
})

// Result:
// {
//   id: "ltr_xxx",
//   url: "https://lob-assets.com/...",
//   expectedDeliveryDate: "2025-12-03",
//   carrier: "USPS",
//   trackingNumber: "...",
//   thumbnails: [{ small, medium, large }]
// }
```

### Verify Address
```typescript
import { verifyAddress } from "@/server/providers/lob"

const result = await verifyAddress({
  line1: "185 Berry Street",
  city: "San Francisco",
  state: "CA",
  postalCode: "94107",
  country: "US",
})

// Result:
// {
//   isValid: true,
//   deliverability: "deliverable",
//   suggestedAddress: { primaryLine, city, state, zipCode }
// }
```

### Get Letter Status
```typescript
import { getLetter } from "@/server/providers/lob"

const letter = await getLetter("ltr_xxx")
// { id, status, expectedDeliveryDate, trackingEvents, url }
```

### Cancel Letter
```typescript
import { cancelLetter } from "@/server/providers/lob"

const result = await cancelLetter("ltr_xxx")
// { id, deleted: true }
```

## Database Schema

The `MailDelivery` model stores Lob-specific data:

```prisma
model MailDelivery {
  deliveryId         String            @id
  shippingAddressId  String
  deliveryMode       MailDeliveryMode  @default(send_on)
  targetDate         DateTime?         // User's desired date
  sendDate           DateTime?         // Calculated for arrive_by
  transitDays        Int?              // From Lob API
  lobJobId           String?           // Lob letter ID (ltr_xxx)
  printOptions       Json              // { color, doubleSided, etc. }
  previewUrl         String?           // Lob PDF preview URL
  trackingStatus     String?           // Latest tracking status
}
```

## Webhook Events

Set up webhooks in Lob Dashboard to receive tracking events:

| Event | Description |
|-------|-------------|
| `letter.created` | Letter created in Lob |
| `letter.rendered_pdf` | PDF generated |
| `letter.rendered_thumbnails` | Thumbnails ready |
| `letter.deleted` | Letter cancelled |
| `letter.in_transit` | USPS picked up |
| `letter.in_local_area` | Near destination |
| `letter.processed_for_delivery` | Out for delivery |
| `letter.delivered` | Delivered to recipient |
| `letter.re_routed` | Address forwarded |
| `letter.returned_to_sender` | Undeliverable |

### Webhook Handler Structure
```typescript
// apps/web/app/api/webhooks/lob/route.ts
export async function POST(request: Request) {
  const event = await request.json()

  switch (event.event_type.id) {
    case "letter.in_transit":
      await updateDeliveryStatus(event.reference_id, "in_transit")
      break
    case "letter.delivered":
      await updateDeliveryStatus(event.reference_id, "delivered")
      break
    // ... handle other events
  }

  return new Response("OK", { status: 200 })
}
```

## Letter HTML Template

Lob accepts HTML with these requirements:
- Max dimensions: 8.5" x 11" (US Letter)
- Safe area: 0.5" margins
- Fonts: Web-safe or embedded
- Images: Must be publicly accessible URLs or base64

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Georgia, serif;
      max-width: 6.5in;
      margin: 0.5in auto;
      padding: 0.5in;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Capsule Note</h1>
  </div>
  <p>Dear Future Self,</p>
  <p>{{content}}</p>
  <p>- Past You</p>
</body>
</html>
```

## Address Deliverability Statuses

| Status | Action |
|--------|--------|
| `deliverable` | Can send |
| `deliverable_unnecessary_unit` | Can send (unit not needed) |
| `deliverable_incorrect_unit` | Can send (suggest correction) |
| `deliverable_missing_unit` | Can send (unit may be needed) |
| `undeliverable` | Cannot send - invalid address |
| `no_match` | Cannot send - address not found |

## Error Handling

Common errors and solutions:

| Error | Cause | Solution |
|-------|-------|----------|
| `use_type must be one of "marketing" or "operational"` | Missing use_type | Add `use_type: "operational"` |
| `422 Unprocessable Entity` | Invalid address or data | Check address format, verify required fields |
| `401 Unauthorized` | Invalid API key | Check LOB_API_KEY in .env.local |
| `429 Rate Limit` | Too many requests | Implement exponential backoff |

## Arrive-By Mode Implementation

For letters that need to arrive by a specific date:

```typescript
// Calculate send date based on expected transit time
async function calculateSendDate(
  targetArrivalDate: Date,
  toAddress: MailingAddress
): Promise<Date> {
  // Lob provides estimated delivery dates on letter creation
  // Add 2-day buffer for safety
  const transitDays = 7 // Average for USPS First Class
  const bufferDays = 2

  const sendDate = new Date(targetArrivalDate)
  sendDate.setDate(sendDate.getDate() - transitDays - bufferDays)

  return sendDate
}
```

## Pricing (as of 2025)

| Item | Price |
|------|-------|
| Letter (B&W, single page) | ~$0.80 |
| Letter (Color) | ~$1.20 |
| Postcard (4x6) | ~$0.50 |
| Address Verification | ~$0.01 |

Prices vary by volume. Check Lob dashboard for current rates.

## Integration Checklist

- [ ] Add Lob API keys to `.env.local`
- [ ] Verify address before sending
- [ ] Store `lobJobId` in MailDelivery
- [ ] Set up webhook endpoint for tracking
- [ ] Implement cancellation before print deadline
- [ ] Handle tracking status updates in UI
- [ ] Configure proper sender address for production
- [ ] Test with test API key first
- [ ] Consider arrive-by calculation for time-sensitive letters

## Resources

- [Lob API Documentation](https://docs.lob.com/)
- [Lob Dashboard](https://dashboard.lob.com/)
- [Letter Templates](https://www.lob.com/template-gallery)
- [Webhook Events](https://docs.lob.com/#tag/Webhooks)
- [Address Verification](https://docs.lob.com/#tag/US-Verifications)
