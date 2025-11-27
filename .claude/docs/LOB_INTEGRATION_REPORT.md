# Lob Physical Mail Integration Report

**Date**: November 25, 2025
**Status**: Proof of Concept Complete
**Environment**: Test API (no actual mail sent)

---

## Executive Summary

Successfully integrated and tested the Lob Print & Mail API for Capsule Note's physical letter delivery feature. All 5 API tests passed, confirming the integration is ready for production implementation.

### Key Findings

1. **API Connection**: Working with test API key
2. **Critical Requirement**: `use_type` field is now mandatory on all mail creation requests
3. **Transit Time**: ~8 business days for USPS First Class
4. **Pricing**: ~$0.80/letter (B&W single page), ~$0.01/address verification

---

## Test Results

| Test | Status | Details |
|------|--------|---------|
| Address Verification | ✅ PASSED | Deliverability: `deliverable` |
| Letter Creation | ✅ PASSED | ID: `ltr_4a2fc37a17b9bc16` |
| Postcard Creation | ✅ PASSED | ID: `psc_9725a005b93c8ad0` |
| List Letters | ✅ PASSED | Retrieved recent letters |
| Retrieve Letter | ✅ PASSED | Full letter details returned |

### Test Command
```bash
pnpm dotenv -e apps/web/.env.local -- tsx scripts/test-lob-api.ts
```

---

## API Keys Configuration

### Environment File: `apps/web/.env.local`

```bash
# ============================================
# Physical Mail - Lob
# ============================================
# Live Environment
LOB_LIVE_API_KEY=live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
LOB_LIVE_PUB_KEY=live_pub_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Test Environment
LOB_TEST_API_KEY=test_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
LOB_TEST_PUB_KEY=test_pub_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Active API Key (use test for development)
LOB_API_KEY=test_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Key Types
- **Test Keys** (`test_*`): Create mock mail, no delivery, free for testing
- **Live Keys** (`live_*`): Real mail delivery, charged per item
- **Publishable Keys** (`*_pub_*`): Client-side address verification only

---

## Critical Discovery: `use_type` Requirement

### Problem Encountered
Initial API calls failed with error:
```
Mail use_type must be one of "marketing" or "operational"
```

### Solution
Add `use_type: "operational"` to all letter/postcard creation calls.

### use_type Values
| Value | Description | Use Case |
|-------|-------------|----------|
| `operational` | Transactional mail | Letters to self, receipts, notifications |
| `marketing` | Promotional mail | Marketing campaigns, advertising |

**For Capsule Note**: Always use `"operational"` since users write letters to themselves (transactional).

---

## Existing Codebase Integration

### Files Already in Place

1. **Provider**: `apps/web/server/providers/lob.ts`
   - Enhanced with full TypeScript interfaces
   - Added `useType` and `mailType` options
   - Added `getLetter()`, `cancelLetter()`, `isLobConfigured()`

2. **Database Schema**: `packages/prisma/schema.prisma`
   - `MailDelivery` model already exists
   - `lobJobId` field for tracking Lob letter IDs
   - `MailDeliveryMode` enum: `send_on` | `arrive_by`

3. **Env Validation**: `apps/web/env.mjs`
   - `LOB_API_KEY` already defined as optional string

### Database Schema (Existing)
```prisma
model MailDelivery {
  deliveryId         String            @id
  shippingAddressId  String
  delivery           Delivery          @relation(fields: [deliveryId], references: [id], onDelete: Cascade)
  shippingAddress    ShippingAddress   @relation(fields: [shippingAddressId], references: [id])
  deliveryMode       MailDeliveryMode  @default(send_on)
  targetDate         DateTime?
  sendDate           DateTime?
  transitDays        Int?
  lobJobId           String?           @map("lob_job_id")
  printOptions       Json
  previewUrl         String?
  trackingStatus     String?
}

enum MailDeliveryMode {
  send_on    // Letter mailed on specific date
  arrive_by  // Letter arrives by specific date
}
```

---

## Implementation Architecture

### API Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User Action   │────▶│  Server Action  │────▶│    Lob API      │
│  Schedule Mail  │     │  (Encrypt +     │     │  (Create Letter)│
└─────────────────┘     │   Store)        │     └─────────────────┘
                        └─────────────────┘              │
                                                         ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Mail Delivered │◀────│  Inngest Job    │◀────│   Lob Webhook   │
│    to User      │     │  (Update Status)│     │  (Tracking)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Provider Functions

```typescript
// apps/web/server/providers/lob.ts

// Send a physical letter
export async function sendLetter(options: MailOptions): Promise<SendLetterResult>

// Verify address before sending
export async function verifyAddress(address: Omit<MailingAddress, "name">): Promise<AddressVerificationResult>

// Get letter status and tracking
export async function getLetter(letterId: string)

// Cancel letter before print deadline
export async function cancelLetter(letterId: string)

// Check if Lob is configured
export function isLobConfigured(): boolean
```

### Usage Example

```typescript
import { sendLetter, verifyAddress } from "@/server/providers/lob"

// 1. Verify address first
const verification = await verifyAddress({
  line1: "185 Berry Street",
  city: "San Francisco",
  state: "CA",
  postalCode: "94107",
  country: "US",
})

if (!verification.isValid) {
  throw new Error(`Invalid address: ${verification.deliverability}`)
}

// 2. Send the letter
const result = await sendLetter({
  to: {
    name: "Future Self",
    line1: verification.suggestedAddress.primaryLine,
    city: verification.suggestedAddress.city,
    state: verification.suggestedAddress.state,
    postalCode: verification.suggestedAddress.zipCode,
    country: "US",
  },
  html: letterHtmlContent,
  color: false,
  doubleSided: false,
  useType: "operational", // REQUIRED
  mailType: "usps_first_class",
})

// 3. Store Lob job ID for tracking
await prisma.mailDelivery.update({
  where: { deliveryId },
  data: {
    lobJobId: result.id,
    previewUrl: result.url,
    trackingStatus: "created",
  },
})
```

---

## Webhook Events

Set up webhooks in [Lob Dashboard](https://dashboard.lob.com/) to receive tracking events.

| Event | Description | Action |
|-------|-------------|--------|
| `letter.created` | Letter created | Store `lobJobId` |
| `letter.rendered_pdf` | PDF generated | Store `previewUrl` |
| `letter.in_transit` | USPS picked up | Update status |
| `letter.processed_for_delivery` | Out for delivery | Update status |
| `letter.delivered` | Delivered | Mark complete |
| `letter.returned_to_sender` | Undeliverable | Handle bounce |

### Webhook Handler (To Implement)
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

---

## Arrive-By Mode Implementation

For letters that need to arrive by a specific date:

```typescript
async function calculateSendDate(
  targetArrivalDate: Date,
  toAddress: MailingAddress
): Promise<Date> {
  // Average transit times
  const transitDays = 7 // USPS First Class average
  const bufferDays = 2  // Safety buffer

  const sendDate = new Date(targetArrivalDate)
  sendDate.setDate(sendDate.getDate() - transitDays - bufferDays)

  return sendDate
}
```

**Database Fields**:
- `deliveryMode`: `send_on` or `arrive_by`
- `targetDate`: User's desired arrival date
- `sendDate`: Calculated mail date
- `transitDays`: From Lob API estimates

---

## Pricing (as of 2025)

| Item | Price |
|------|-------|
| Letter (B&W, single page) | ~$0.80 |
| Letter (Color, single page) | ~$1.20 |
| Postcard (4x6) | ~$0.50 |
| Address Verification | ~$0.01 |

Prices vary by volume. Check [Lob Dashboard](https://dashboard.lob.com/) for current rates.

---

## Letter HTML Template

Lob accepts HTML with these requirements:
- Max dimensions: 8.5" x 11" (US Letter)
- Safe area: 0.5" margins
- Fonts: Web-safe or embedded
- Images: Publicly accessible URLs or base64

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
    .header {
      text-align: center;
      border-bottom: 2px solid #4F46E5;
      padding-bottom: 1em;
    }
    .logo { font-size: 24px; font-weight: bold; color: #4F46E5; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">Capsule Note</div>
    <div>A Letter to Your Future Self</div>
  </div>
  <p>Dear Future Self,</p>
  <p>{{content}}</p>
  <p>- Past You</p>
</body>
</html>
```

---

## Implementation Checklist

### Completed ✅
- [x] Add Lob API keys to `.env.local`
- [x] Enhance `lob.ts` provider with full functionality
- [x] Create proof of concept test script
- [x] Verify API connection with test keys
- [x] Create skill documentation
- [x] Document `use_type` requirement

### Ready to Implement 🟡
- [ ] Integrate with letter creation flow
- [ ] Add address verification step in UI
- [ ] Store `lobJobId` in MailDelivery records
- [ ] Implement arrive-by date calculation

### Future Implementation ⏳
- [ ] Set up webhook endpoint for tracking events
- [ ] Configure production sender address
- [ ] Implement letter cancellation UI
- [ ] Add tracking status display in dashboard
- [ ] Configure idempotency keys for retries

---

## Security Considerations

1. **API Key Protection**: Store in environment variables only, never commit
2. **Address Validation**: Always verify addresses before sending to reduce bounces
3. **Sender Address**: Configure proper business address for production
4. **Test First**: Always use test API key during development
5. **Webhook Verification**: Validate webhook signatures in production

---

## Resources

- [Lob API Documentation](https://docs.lob.com/)
- [Lob Dashboard](https://dashboard.lob.com/)
- [Letter Templates Gallery](https://www.lob.com/template-gallery)
- [Webhook Events Reference](https://docs.lob.com/#tag/Webhooks)
- [Address Verification API](https://docs.lob.com/#tag/US-Verifications)
- [SDK: @lob/lob-typescript-sdk](https://www.npmjs.com/package/@lob/lob-typescript-sdk)

---

## Files Created/Modified

| File | Action | Description |
|------|--------|-------------|
| `apps/web/.env.local` | Modified | Added Lob API credentials |
| `scripts/test-lob-api.ts` | Created | Proof of concept test script |
| `apps/web/server/providers/lob.ts` | Enhanced | Full provider implementation |
| `.claude/skills/lob-physical-mail/SKILL.md` | Created | Skill documentation |
| `.claude/docs/LOB_INTEGRATION_REPORT.md` | Created | This report |

---

## Conclusion

The Lob API integration is fully functional in test mode. The proof of concept demonstrates:

1. ✅ Address verification works correctly
2. ✅ Letter creation succeeds with proper `use_type`
3. ✅ The existing codebase is well-prepared for Lob integration
4. ✅ Database schema already supports physical mail delivery

**Next Steps**: Integrate with the Inngest `deliver-mail` job and add UI for physical mail scheduling.
