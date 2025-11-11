# Letter Confirmation Email Design Specification

## Overview
This document specifies the design and implementation of a confirmation email system that sends users an email immediately after they create a letter, confirming the letter was saved successfully and providing a link to view/edit it.

## Business Goals
1. **Immediate Confirmation**: Provide instant feedback that letter creation succeeded
2. **Trust Building**: Reassure users their content is securely stored
3. **User Engagement**: Drive users back to the platform to schedule delivery
4. **Accessibility**: Provide quick access link to the newly created letter

## Technical Architecture

### 1. Email Trigger Flow

```
User Creates Letter
       ↓
Server Action: createLetter()
       ↓
Letter Saved to Database (Encrypted)
       ↓
Trigger Notification Event
       ↓
Inngest Worker: sendLetterCreatedEmail()
       ↓
Email Sent via Resend
       ↓
User Receives Confirmation Email
```

### 2. Event Definition

**Event Name**: `notification.letter.created`

**Event Data**:
```typescript
{
  letterId: string      // UUID of the created letter
  userId: string        // User who created the letter
  letterTitle: string   // Title of the letter (for personalization)
}
```

**Rationale**: We use a separate notification event (not `letter.created` audit event) to:
- Separate concerns: audit logging vs. user notifications
- Allow future expansion to other notification types
- Enable notification preferences (users can opt-out of emails without affecting audit trail)

### 3. Integration Points

#### A. Server Action Integration (`apps/web/server/actions/letters.ts`)

**Location**: After successful letter creation and audit event (line ~100)

**Implementation**:
```typescript
// Create audit event
await createAuditEvent({
  userId: user.id,
  type: "letter.created",
  data: { letterId: letter.id, title: letter.title },
})

// Trigger confirmation email (NEW)
try {
  await triggerInngestEvent("notification.letter.created", {
    letterId: letter.id,
    userId: user.id,
    letterTitle: letter.title,
  })
  await logger.info('Letter confirmation email triggered', {
    userId: user.id,
    letterId: letter.id,
  })
} catch (error) {
  // Don't fail letter creation if email fails
  await logger.error('Failed to trigger confirmation email', error, {
    userId: user.id,
    letterId: letter.id,
  })
}
```

#### B. Inngest Function (`workers/inngest/functions/send-letter-created-email.ts`)

**New File**: Create dedicated Inngest function for letter confirmation emails

**Function Configuration**:
- **Function ID**: `send-letter-created-email`
- **Event**: `notification.letter.created`
- **Retries**: 3 (fewer than delivery emails since less critical)
- **Idempotency**: Based on `letterId` (one email per letter creation)

**Key Steps**:
1. Fetch user details (email, name)
2. Fetch letter metadata (no decryption needed)
3. Generate email HTML with letter title and link
4. Send via email provider abstraction
5. Log success/failure

#### C. Email Template Design

**Subject Line**: `Your letter "${letterTitle}" has been created ✓`

**From**: `no-reply@mail.dearme.app`

**Email Structure**:
```
┌─────────────────────────────────┐
│ DearMe Logo                     │
├─────────────────────────────────┤
│ Success Headline                │
│ "Your Letter Has Been Created"  │
├─────────────────────────────────┤
│ Letter Title (in box)           │
│ "My 2025 Goals"                 │
├─────────────────────────────────┤
│ Confirmation Message            │
│ - Letter safely stored          │
│ - Encrypted and secure          │
│ - Ready for scheduling          │
├─────────────────────────────────┤
│ Primary CTA Button              │
│ "View Your Letter"              │
├─────────────────────────────────┤
│ Next Steps Section              │
│ - Schedule delivery             │
│ - Edit letter                   │
│ - Create another                │
├─────────────────────────────────┤
│ Footer                          │
│ - Unsubscribe preferences       │
│ - Company info                  │
└─────────────────────────────────┘
```

### 4. Email HTML Template

**File Location**: `workers/inngest/templates/letter-created-email.ts`

**Template Function**:
```typescript
export function generateLetterCreatedEmail({
  letterTitle,
  letterId,
  userFirstName,
  letterUrl,
  dashboardUrl,
}: {
  letterTitle: string
  letterId: string
  userFirstName?: string
  letterUrl: string
  dashboardUrl: string
}): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Letter Created - DearMe</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; background-color: #f5f5f5;">
        <!-- Email content here -->
      </body>
    </html>
  `
}
```

**Design Principles**:
- **Mobile-first**: 600px max-width, responsive design
- **Accessibility**: Semantic HTML, alt text, proper contrast ratios
- **Email client compatibility**: Inline CSS, table-based layout for Outlook
- **Brand consistency**: Match DearMe color palette and typography
- **Clear hierarchy**: Prominent CTA, scannable structure

### 5. Email Content Copy

**Headline**: "Your Letter Has Been Created ✓"

**Body Paragraph**:
```
Hi {firstName},

Your letter "{letterTitle}" has been safely created and encrypted. It's ready
whenever you want to schedule delivery to your future self.
```

**Security Reassurance**:
```
🔒 Your letter is encrypted and secure
📝 Only you can access it
📅 Schedule delivery anytime
```

**Call-to-Action Button**:
- Primary: "View Your Letter" → `/letters/{letterId}`
- Secondary: "Go to Dashboard" → `/dashboard`

**Next Steps Section**:
```
What's next?
• Schedule when you want to receive your letter
• Edit or add more details
• Create additional letters for different times
```

**Footer**:
```
You're receiving this email because you created a letter on DearMe.
[Manage email preferences] | [Contact support]

DearMe - Letters to Your Future Self
© 2025 DearMe. All rights reserved.
```

### 6. URL Generation

**Letter View URL**:
```typescript
const letterUrl = `${process.env.NEXT_PUBLIC_APP_URL}/letters/${letterId}`
```

**Dashboard URL**:
```typescript
const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
```

**URL Parameters** (Optional):
```
?utm_source=email&utm_medium=notification&utm_campaign=letter_created
```

### 7. Notification Preferences (Future)

**Design Consideration**: Build with preferences in mind for future implementation

**Preference Model** (Future Schema):
```prisma
model NotificationPreference {
  id                    String   @id @default(uuid())
  userId                String   @unique
  emailLetterCreated    Boolean  @default(true)
  emailLetterDelivered  Boolean  @default(true)
  emailDigestWeekly     Boolean  @default(true)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])
}
```

**Check Before Sending**:
```typescript
// Future implementation
const preferences = await prisma.notificationPreference.findUnique({
  where: { userId }
})

if (!preferences?.emailLetterCreated) {
  logger.info('User opted out of letter creation emails', { userId, letterId })
  return
}
```

### 8. Error Handling Strategy

**Error Categories**:

1. **User Not Found** (Non-retryable)
   - Log error
   - Don't retry
   - Alert monitoring

2. **Email Send Failure** (Retryable)
   - Provider errors (rate limit, temporary failure)
   - Retry up to 3 times with backoff
   - Log final failure

3. **Template Rendering Error** (Non-retryable)
   - Missing data fields
   - Don't retry
   - Alert for investigation

**Failure Handling**:
```typescript
onFailure: async ({ error, event }) => {
  const { letterId, userId } = event.data.event.data

  logger.error('Letter confirmation email failed after all retries', {
    letterId,
    userId,
    error: error.message,
  })

  // Future: Store failed notification for retry queue or user notification center
}
```

### 9. Testing Strategy

**Unit Tests**:
- Template generation with various inputs
- URL construction
- HTML validation

**Integration Tests**:
- End-to-end flow: create letter → verify email sent
- Error scenarios: user not found, email failure
- Idempotency: verify only one email per letter

**Manual Testing Checklist**:
- [ ] Email renders correctly in Gmail
- [ ] Email renders correctly in Outlook
- [ ] Email renders correctly in Apple Mail
- [ ] Mobile responsive design works
- [ ] All links work correctly
- [ ] Unsubscribe link functional (future)
- [ ] Email arrives within 30 seconds

### 10. Monitoring & Observability

**Key Metrics**:
- Email send success rate (target: >99%)
- Email delivery time (target: <30 seconds)
- Email open rate (via tracking pixel)
- Click-through rate on "View Your Letter" button
- Bounce rate (target: <1%)
- Complaint rate (target: <0.1%)

**Logging**:
```typescript
// Success
logger.info('Letter confirmation email sent', {
  letterId,
  userId,
  emailProvider: provider.getName(),
  messageId: result.id,
  duration: Date.now() - startTime,
})

// Failure
logger.error('Letter confirmation email failed', {
  letterId,
  userId,
  error: error.message,
  attempt: attemptNumber,
})
```

**Alerts**:
- Email send failure rate >1% (5-minute window)
- Email delivery time >60 seconds (5-minute average)
- Specific letter creation spike without email sends (backlog detection)

### 11. Performance Considerations

**Email Send Timing**:
- **Asynchronous**: Email sent via Inngest (non-blocking)
- **Target Latency**: <30 seconds from letter creation
- **No Impact**: Letter creation API returns immediately

**Template Caching**:
```typescript
// Future optimization: cache base template
let cachedTemplate: string | null = null

function getBaseTemplate(): string {
  if (!cachedTemplate) {
    cachedTemplate = fs.readFileSync('./templates/base.html', 'utf8')
  }
  return cachedTemplate
}
```

**Rate Limiting**:
- Inngest handles rate limiting automatically
- Resend: 100 emails/second (production tier)
- No additional throttling needed for confirmation emails

### 12. Security Considerations

**Content Sanitization**:
```typescript
// Sanitize letter title to prevent XSS
import { escape } from 'html-escaper'

const sanitizedTitle = escape(letterTitle)
```

**Link Security**:
- Use HTTPS for all links
- Include authentication requirements (Clerk)
- No sensitive data in URL parameters

**Email Spoofing Prevention**:
- SPF, DKIM, DMARC configured for `mail.dearme.app`
- Sender verification through Resend
- Consistent from-address

### 13. Implementation Phases

**Phase 1: MVP** (This Design)
- [x] Design specification
- [ ] Create Inngest function
- [ ] Create HTML email template
- [ ] Integrate with createLetter action
- [ ] Test in development
- [ ] Deploy to production

**Phase 2: Enhancement** (Future)
- [ ] Add email open/click tracking
- [ ] Implement notification preferences
- [ ] Add email preview in dev mode
- [ ] A/B test subject lines
- [ ] Optimize template for dark mode

**Phase 3: Advanced** (Future)
- [ ] Email localization (i18n)
- [ ] Personalized recommendations
- [ ] Dynamic content based on user behavior
- [ ] Integration with email marketing tools

### 14. File Structure

```
workers/inngest/
  functions/
    send-letter-created-email.ts    (NEW)
  templates/
    letter-created-email.ts         (NEW)
  lib/
    email-utils.ts                  (NEW - optional utilities)

apps/web/server/
  actions/
    letters.ts                      (MODIFIED - add email trigger)
```

### 15. Environment Variables

**Required**:
- `NEXT_PUBLIC_APP_URL` - Already configured
- `EMAIL_FROM` - Already configured
- `RESEND_API_KEY` - Already configured

**Optional** (Future):
- `EMAIL_TRACKING_ENABLED` - Enable open/click tracking
- `EMAIL_UNSUBSCRIBE_URL` - Preference center URL

### 16. Rollout Plan

**Development**:
1. Implement function and template
2. Test with Inngest Dev Server
3. Verify emails arrive and render correctly

**Staging** (If Available):
1. Deploy to staging environment
2. Test with real email addresses
3. Verify all email clients

**Production**:
1. Deploy with feature flag (if available)
2. Monitor for 24 hours with 10% rollout
3. Increase to 100% if no issues
4. Watch metrics for first week

**Rollback Plan**:
- Remove email trigger from createLetter action
- Keep Inngest function deployed (inactive)
- Re-enable after issue resolution

### 17. Success Criteria

**Technical**:
- [ ] Email send success rate >99%
- [ ] Email delivery time <30 seconds (p95)
- [ ] Zero impact on letter creation API latency
- [ ] No user-reported rendering issues

**Business**:
- [ ] Email open rate >40% (industry standard: 20-30%)
- [ ] Click-through rate >15% (industry standard: 3-5%)
- [ ] <0.1% unsubscribe rate
- [ ] <0.05% complaint rate

**User Feedback**:
- [ ] Collect feedback via support channels
- [ ] Monitor for confusion or concerns
- [ ] Positive sentiment in user responses

---

## Appendix A: Email HTML Template (Full Example)

See `workers/inngest/templates/letter-created-email.ts` for complete implementation.

## Appendix B: Alternative Designs Considered

### Alternative 1: In-App Notification Only
**Pros**: No email infrastructure needed
**Cons**: User might miss it if they close browser
**Decision**: Email provides better reliability

### Alternative 2: Delayed Digest Email
**Pros**: Reduces email volume
**Cons**: Not immediate confirmation
**Decision**: Immediate confirmation builds trust

### Alternative 3: SMS Notification
**Pros**: Higher open rates
**Cons**: Requires phone number, additional cost
**Decision**: Email is sufficient for MVP

## Appendix C: Related Documentation

- Email Provider Abstraction: `apps/web/server/providers/email/interface.ts`
- Inngest Worker Error Handling: `.claude/docs/INNGEST_WORKER_ERROR_HANDLING.md`
- Letter Encryption: `apps/web/server/lib/encryption.ts`
- Audit Events: `apps/web/server/lib/audit.ts`
