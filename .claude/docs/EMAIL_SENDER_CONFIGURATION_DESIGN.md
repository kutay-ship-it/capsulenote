# Email Sender Configuration Design - Capsule Note Branding

## Overview

Redesign email sender configuration to use "Capsule Note" branding with two distinct sender addresses for different email types:
- **Confirmation emails** (letter created): `noreply@capsulenote.com`
- **Letter delivery emails** (scheduled delivery): `yourcapsulenote@capsulenote.com`

## Current State

### Current Configuration
- Single environment variable: `EMAIL_FROM=no-reply@mail.dearme.app`
- Used across all email types (confirmations + deliveries)
- Plain email address without display name
- Generic "DearMe" branding

### Current Usage Locations
1. `workers/inngest/functions/send-letter-created-email.ts:199` - Confirmation emails
2. `workers/inngest/functions/deliver-email.ts:345` - Letter delivery emails
3. Environment validation in `apps/web/env.mjs:27`
4. Configuration example in `apps/web/.env.example:25`

## Design Requirements

### Functional Requirements

**FR-1: Separate Sender Addresses**
- Confirmation emails MUST use `noreply@capsulenote.com`
- Letter delivery emails MUST use `yourcapsulenote@capsulenote.com`
- Each address must support display name formatting

**FR-2: Display Name Branding**
- All emails must show "Capsule Note" as the sender display name
- Format: `"Capsule Note" <email@capsulenote.com>`
- Consistent branding across all email types

**FR-3: RFC 5322 Compliance**
- Email addresses must follow RFC 5322 format
- Display names must be properly quoted if containing special characters
- Support both formats: `"Name" <email>` and `email`

**FR-4: Provider Compatibility**
- Work with Resend (primary provider)
- Work with Postmark (fallback provider)
- Support SPF/DKIM configuration for both domains

### Non-Functional Requirements

**NFR-1: Backward Compatibility**
- Graceful fallback if new env vars not set
- Clear error messages for missing configuration
- No breaking changes to existing deployments

**NFR-2: Configuration Validation**
- Zod schema validation in `env.mjs`
- Build-time validation for required variables
- Development-friendly defaults

**NFR-3: Maintainability**
- Clear documentation for email address purposes
- Centralized sender configuration
- Easy to update branding in the future

## Proposed Architecture

### 1. Environment Variable Schema

```typescript
// New environment variables
EMAIL_FROM_NOTIFICATION: "Capsule Note <noreply@capsulenote.com>"
EMAIL_FROM_DELIVERY: "Capsule Note <yourcapsulenote@capsulenote.com>"

// Legacy (deprecated but supported for backward compatibility)
EMAIL_FROM: "no-reply@mail.dearme.app"
```

### 2. Configuration Hierarchy

**Priority order:**
1. New specific variables (`EMAIL_FROM_NOTIFICATION`, `EMAIL_FROM_DELIVERY`)
2. Legacy variable (`EMAIL_FROM`) as fallback
3. Error if none configured

**Fallback behavior:**
```typescript
const notificationSender =
  process.env.EMAIL_FROM_NOTIFICATION ||
  process.env.EMAIL_FROM ||
  throw new Error("EMAIL_FROM_NOTIFICATION not configured")

const deliverySender =
  process.env.EMAIL_FROM_DELIVERY ||
  process.env.EMAIL_FROM ||
  throw new Error("EMAIL_FROM_DELIVERY not configured")
```

### 3. Email Sender Configuration Module

Create centralized configuration utility: `workers/inngest/lib/email-config.ts`

```typescript
/**
 * Email sender configuration with branded display names
 *
 * Capsule Note uses two distinct sender addresses:
 * - Notifications: noreply@ for system emails (confirmations, alerts)
 * - Deliveries: yourcapsulenote@ for scheduled letter deliveries
 */

export interface EmailSenderConfig {
  /** Full sender format: "Display Name <email@domain.com>" */
  from: string
  /** Email address only (for validation) */
  email: string
  /** Display name only */
  displayName: string
}

/**
 * Email sender types
 */
export type EmailSenderType = 'notification' | 'delivery'

/**
 * Get email sender configuration by type
 *
 * @param type - 'notification' for system emails, 'delivery' for letter deliveries
 * @returns Formatted sender configuration
 * @throws Error if configuration is missing or invalid
 */
export function getEmailSender(type: EmailSenderType): EmailSenderConfig {
  const envVar = type === 'notification'
    ? 'EMAIL_FROM_NOTIFICATION'
    : 'EMAIL_FROM_DELIVERY'

  const fromAddress = process.env[envVar] || process.env.EMAIL_FROM

  if (!fromAddress) {
    throw new Error(`${envVar} not configured (and EMAIL_FROM fallback not set)`)
  }

  // Parse "Display Name <email@domain.com>" or just "email@domain.com"
  const parsed = parseEmailAddress(fromAddress)

  return {
    from: fromAddress,
    email: parsed.email,
    displayName: parsed.displayName || 'Capsule Note',
  }
}

/**
 * Parse email address with optional display name
 * Supports formats: "Name <email>" or "email"
 */
function parseEmailAddress(input: string): {
  email: string
  displayName?: string
} {
  const match = input.match(/^"?([^"<]+)"?\s*<([^>]+)>$/)

  if (match) {
    return {
      displayName: match[1].trim(),
      email: match[2].trim(),
    }
  }

  return { email: input.trim() }
}

/**
 * Validate email sender configuration at startup
 * Called during worker initialization
 */
export function validateEmailSenderConfig(): void {
  try {
    getEmailSender('notification')
    getEmailSender('delivery')
  } catch (error) {
    throw new Error(
      `Email sender configuration invalid: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}
```

### 4. Environment Validation Schema

Update `apps/web/env.mjs`:

```typescript
server: {
  // ... existing vars

  // Email Senders (new)
  EMAIL_FROM_NOTIFICATION: z
    .string()
    .email({ message: "Must be valid email or 'Name <email>' format" })
    .optional(),
  EMAIL_FROM_DELIVERY: z
    .string()
    .email({ message: "Must be valid email or 'Name <email>' format" })
    .optional(),

  // Legacy email (backward compatibility)
  EMAIL_FROM: z
    .string()
    .email()
    .optional()
    .default("no-reply@mail.dearme.app"),
}
```

**Validation rules:**
- At least one of `EMAIL_FROM_NOTIFICATION`, `EMAIL_FROM_DELIVERY`, or `EMAIL_FROM` must be set
- Email addresses must be RFC 5322 compliant
- Display name format validation: `"Name" <email>` or `email`

### 5. Worker Function Updates

#### send-letter-created-email.ts (Notification Emails)

```typescript
import { getEmailSender } from "../lib/email-config"

function validateConfig(): void {
  // Validate notification sender is configured
  getEmailSender('notification')

  if (!process.env.NEXT_PUBLIC_APP_URL) {
    throw new Error("NEXT_PUBLIC_APP_URL not configured")
  }
}

export const sendLetterCreatedEmail = inngest.createFunction(
  // ... config
  async ({ event, step }) => {
    // ... other steps

    const sendResult = await step.run("send-email", async () => {
      const sender = getEmailSender('notification')
      const provider = await getEmailProvider()

      const result = await provider.send({
        from: sender.from, // "Capsule Note <noreply@capsulenote.com>"
        to: user.email!,
        subject: `Your letter "${letterTitle}" has been created ✓`,
        html: emailHtml,
        text: emailText,
        headers: {
          "X-Idempotency-Key": idempotencyKey,
        },
      })

      // ... error handling
    })
  }
)
```

#### deliver-email.ts (Letter Delivery Emails)

```typescript
import { getEmailSender } from "../lib/email-config"

function validateConfig(): void {
  // Validate delivery sender is configured
  getEmailSender('delivery')
}

export const deliverEmail = inngest.createFunction(
  // ... config
  async ({ event, step }) => {
    // ... other steps

    const sendResult = await step.run("send-email", async () => {
      const sender = getEmailSender('delivery')
      const provider = await getEmailProvider()

      const result = await provider.send({
        from: sender.from, // "Capsule Note <yourcapsulenote@capsulenote.com>"
        to: delivery.recipientEmail,
        subject: delivery.subject || `A letter from your past self`,
        html: emailHtml,
        text: emailText,
        headers: {
          "X-Idempotency-Key": idempotencyKey,
        },
      })

      // ... error handling
    })
  }
)
```

## DNS Configuration Requirements

### Domain Setup: capsulenote.com

**SPF Record** (Sender Policy Framework):
```dns
TXT @ "v=spf1 include:_spf.resend.com include:spf.mtasv.net ~all"
```
- `_spf.resend.com` - For Resend
- `spf.mtasv.net` - For Postmark
- `~all` - Soft fail (recommended during testing)

**DKIM Records** (DomainKeys Identified Mail):

For Resend:
```dns
TXT resend._domainkey "v=DKIM1; k=rsa; p=<public-key-from-resend>"
```

For Postmark:
```dns
TXT 20230601._domainkey "v=DKIM1; k=rsa; p=<public-key-from-postmark>"
```

**DMARC Record** (Domain-based Message Authentication):
```dns
TXT _dmarc "v=DMARC1; p=quarantine; rua=mailto:dmarc@capsulenote.com"
```

**MX Records** (Optional - for bounce handling):
```dns
MX @ 10 feedback-smtp.us-east-1.amazonses.com (if using SES for bounces)
```

### Subdomain Configuration

**Option A: Use main domain** (capsulenote.com)
- Simpler DNS setup
- Better for brand recognition
- Requires careful SPF management

**Option B: Use subdomain** (mail.capsulenote.com)
- Isolates email reputation
- Easier to manage multiple providers
- More complex initial setup

**Recommendation**: Use main domain for better branding

### Email Address Creation

**Resend Dashboard**:
1. Add domain: `capsulenote.com`
2. Verify DNS records (SPF, DKIM, DMARC)
3. Create sender addresses:
   - `noreply@capsulenote.com`
   - `yourcapsulenote@capsulenote.com`
4. Test deliverability

**Postmark Dashboard**:
1. Add sender signature for each address
2. Verify DNS records
3. Test with sample emails

## Implementation Plan

### Phase 1: Configuration Setup (1-2 hours)

**Step 1.1: Create email configuration module**
- File: `workers/inngest/lib/email-config.ts`
- Implement `getEmailSender()`, `parseEmailAddress()`, `validateEmailSenderConfig()`
- Add comprehensive error messages

**Step 1.2: Update environment validation**
- File: `apps/web/env.mjs`
- Add `EMAIL_FROM_NOTIFICATION` and `EMAIL_FROM_DELIVERY` to schema
- Update runtime environment mapping
- Keep `EMAIL_FROM` for backward compatibility

**Step 1.3: Update environment examples**
- File: `apps/web/.env.example`
- Add new variables with documentation
- Mark `EMAIL_FROM` as legacy

### Phase 2: Worker Function Updates (1 hour)

**Step 2.1: Update send-letter-created-email.ts**
- Import `getEmailSender` from email-config
- Replace `process.env.EMAIL_FROM` with `getEmailSender('notification').from`
- Update `validateConfig()` function
- Add logging for sender address

**Step 2.2: Update deliver-email.ts**
- Import `getEmailSender` from email-config
- Replace `process.env.EMAIL_FROM` with `getEmailSender('delivery').from`
- Update `validateConfig()` function
- Add logging for sender address

### Phase 3: DNS & Provider Setup (2-4 hours)

**Step 3.1: Domain verification**
- Purchase/configure `capsulenote.com` domain
- Add SPF record for Resend and Postmark
- Add DKIM records from both providers
- Add DMARC record for policy enforcement

**Step 3.2: Resend configuration**
- Add domain in Resend dashboard
- Create `noreply@capsulenote.com` sender
- Create `yourcapsulenote@capsulenote.com` sender
- Verify deliverability

**Step 3.3: Postmark configuration**
- Add sender signatures for both addresses
- Verify DNS records
- Test fallback functionality

### Phase 4: Testing & Validation (1-2 hours)

**Step 4.1: Local testing**
- Test letter creation confirmation email
- Test scheduled letter delivery email
- Verify display names appear correctly
- Check email headers (From, Reply-To, etc.)

**Step 4.2: Provider testing**
- Test with Resend (primary)
- Test with Postmark (fallback)
- Verify idempotency keys work with both
- Test error scenarios (invalid config, missing DNS)

**Step 4.3: Email client testing**
- Test rendering in Gmail, Outlook, Apple Mail
- Verify sender display name appears correctly
- Check spam scores (mail-tester.com)
- Verify DMARC alignment

### Phase 5: Documentation & Deployment (30 min)

**Step 5.1: Update documentation**
- Update CLAUDE.md with new email configuration
- Document DNS requirements
- Add troubleshooting guide

**Step 5.2: Deployment**
- Update Vercel environment variables
- Deploy to staging first
- Verify emails send correctly
- Deploy to production

## Testing Strategy

### Unit Tests

```typescript
describe('email-config', () => {
  describe('parseEmailAddress', () => {
    it('parses display name format', () => {
      const result = parseEmailAddress('"Capsule Note" <noreply@capsulenote.com>')
      expect(result).toEqual({
        email: 'noreply@capsulenote.com',
        displayName: 'Capsule Note',
      })
    })

    it('parses plain email format', () => {
      const result = parseEmailAddress('noreply@capsulenote.com')
      expect(result).toEqual({
        email: 'noreply@capsulenote.com',
      })
    })
  })

  describe('getEmailSender', () => {
    it('returns notification sender config', () => {
      process.env.EMAIL_FROM_NOTIFICATION = '"Capsule Note" <noreply@capsulenote.com>'
      const config = getEmailSender('notification')
      expect(config.email).toBe('noreply@capsulenote.com')
      expect(config.displayName).toBe('Capsule Note')
    })

    it('falls back to EMAIL_FROM if specific not set', () => {
      process.env.EMAIL_FROM = 'fallback@example.com'
      const config = getEmailSender('notification')
      expect(config.email).toBe('fallback@example.com')
    })

    it('throws error if no config available', () => {
      delete process.env.EMAIL_FROM_NOTIFICATION
      delete process.env.EMAIL_FROM
      expect(() => getEmailSender('notification')).toThrow()
    })
  })
})
```

### Integration Tests

```typescript
describe('Letter Confirmation Email', () => {
  it('sends with correct sender address', async () => {
    const result = await triggerInngestEvent('notification.letter.created', {
      letterId: 'test-id',
      userId: 'user-id',
      letterTitle: 'Test Letter',
    })

    // Verify email was sent
    const email = await getLastSentEmail()
    expect(email.from).toBe('"Capsule Note" <noreply@capsulenote.com>')
    expect(email.subject).toContain('Test Letter')
  })
})

describe('Letter Delivery Email', () => {
  it('sends with correct sender address', async () => {
    const result = await triggerInngestEvent('delivery.scheduled', {
      deliveryId: 'delivery-id',
    })

    // Verify email was sent
    const email = await getLastSentEmail()
    expect(email.from).toBe('"Capsule Note" <yourcapsulenote@capsulenote.com>')
  })
})
```

### Manual Testing Checklist

**Email Delivery**:
- [ ] Letter creation confirmation arrives with correct sender
- [ ] Scheduled letter delivery arrives with correct sender
- [ ] Display name shows "Capsule Note" in email clients
- [ ] Email addresses are `noreply@` and `yourcapsulenote@` respectively

**Email Client Rendering**:
- [ ] Gmail (web + mobile app)
- [ ] Outlook (web + desktop)
- [ ] Apple Mail (macOS + iOS)
- [ ] Yahoo Mail
- [ ] ProtonMail

**Deliverability**:
- [ ] Emails land in inbox (not spam)
- [ ] SPF passes (check email headers)
- [ ] DKIM passes (check email headers)
- [ ] DMARC passes (check email headers)
- [ ] Mail-tester.com score > 8/10

**Provider Failover**:
- [ ] Resend sends successfully
- [ ] Postmark fallback works if Resend fails
- [ ] Both providers use correct sender addresses

## Monitoring & Observability

### Metrics to Track

**Email Delivery Metrics**:
- Confirmation email send rate (per minute)
- Delivery email send rate (per minute)
- Provider success rate (Resend vs Postmark)
- Bounce rate by sender address
- Complaint rate by sender address

**Error Metrics**:
- Configuration validation failures
- Invalid sender address errors
- DNS resolution failures
- Provider API errors

### Logging Strategy

```typescript
logger.info('Email sent successfully', {
  emailType: 'notification' | 'delivery',
  senderAddress: sender.email,
  senderDisplayName: sender.displayName,
  provider: provider.getName(),
  messageId: result.id,
  recipientEmail: to,
})
```

### Alerting Rules

**Critical Alerts**:
- Confirmation email send failure rate > 1%
- Delivery email send failure rate > 0.1%
- DNS verification failures
- SPF/DKIM/DMARC failures

**Warning Alerts**:
- Bounce rate > 2%
- Complaint rate > 0.1%
- Provider fallback usage > 10%

## Rollback Plan

### Immediate Rollback (< 5 min)

**Scenario**: Emails not sending, critical production issue

**Action**:
1. Revert environment variables to legacy configuration:
   ```bash
   EMAIL_FROM=no-reply@mail.dearme.app
   unset EMAIL_FROM_NOTIFICATION
   unset EMAIL_FROM_DELIVERY
   ```
2. Code gracefully falls back to `EMAIL_FROM`
3. Monitor email delivery recovery

### Gradual Rollback (30 min)

**Scenario**: DNS issues, deliverability problems

**Action**:
1. Update DNS to point back to old domain
2. Update environment variables to use old addresses
3. Monitor deliverability metrics
4. Investigate root cause

## Security Considerations

### Email Spoofing Prevention

**SPF Protection**:
- Strict SPF record with all authorized senders
- Use `-all` (hard fail) in production after testing
- Regular audits of authorized senders

**DKIM Signing**:
- All emails DKIM-signed by provider
- Rotate DKIM keys annually
- Monitor DKIM validation failures

**DMARC Enforcement**:
- Start with `p=none` (monitoring only)
- Move to `p=quarantine` after 2 weeks
- Final state: `p=reject` for full protection

### Information Disclosure

**noreply@ Address**:
- Do not monitor or respond to replies
- Clear "do not reply" message in email footer
- No sensitive information in confirmation emails

**yourcapsulenote@ Address**:
- Contains user letter content (already encrypted at rest)
- Secure transmission (TLS required)
- Consider bounce handling for failed deliveries

### Rate Limiting

**Per-User Limits**:
- Max 10 confirmation emails per hour (prevent abuse)
- No limit on scheduled deliveries (user-initiated)

**Global Limits**:
- Resend: Check account limits
- Postmark: Check account limits
- Implement backoff if limits approached

## Cost Analysis

### Email Service Costs

**Resend Pricing** (primary):
- Free tier: 3,000 emails/month
- Pro: $20/month for 50,000 emails
- Additional: $1 per 1,000 emails

**Postmark Pricing** (fallback):
- Free tier: 100 emails/month (testing only)
- Basic: $15/month for 10,000 emails
- Additional: $1.25 per 1,000 emails

**Estimated Monthly Cost** (1,000 active users):
- Confirmation emails: ~1,000/month (1 per user)
- Delivery emails: ~2,000/month (2 per user avg)
- Total: ~3,000 emails/month
- **Cost: Free tier (Resend)**

**Scaling Cost** (10,000 active users):
- Confirmation emails: ~10,000/month
- Delivery emails: ~20,000/month
- Total: ~30,000 emails/month
- **Cost: $20/month (Resend Pro)**

### Domain Costs

**Domain Registration**: $12-15/year (capsulenote.com)
**DNS Hosting**: Free (Cloudflare) or included in domain

**Total Annual Cost** (1,000 users): ~$15/year
**Total Annual Cost** (10,000 users): ~$255/year

## Success Criteria

### Launch Criteria

**Must Have** (blocking launch):
- [ ] DNS records verified and passing
- [ ] Both sender addresses working in Resend
- [ ] Confirmation emails sending successfully
- [ ] Delivery emails sending successfully
- [ ] Display names showing correctly
- [ ] No spam folder issues
- [ ] Backward compatibility with legacy config

**Should Have** (not blocking):
- [ ] Postmark fallback configured
- [ ] Monitoring dashboards set up
- [ ] Alerting rules configured
- [ ] DMARC in enforcement mode

### Success Metrics (2 weeks post-launch)

**Email Deliverability**:
- [ ] 99.5%+ delivery success rate
- [ ] <2% bounce rate
- [ ] <0.1% complaint rate
- [ ] 8+/10 mail-tester.com score

**User Experience**:
- [ ] No user complaints about missing emails
- [ ] Positive feedback on branding
- [ ] No increase in support tickets

**Technical Performance**:
- [ ] No configuration errors
- [ ] No DNS resolution failures
- [ ] <0.1% provider failover rate

## Future Enhancements

### Phase 2 Features (Post-Launch)

**Custom Reply-To Addresses**:
- Allow users to set custom reply-to for letter deliveries
- Validate email addresses before saving
- Warning about privacy implications

**Email Templates**:
- Branded HTML templates for different email types
- Customizable email signatures
- User preference for plain text vs HTML

**Advanced Analytics**:
- Open rate tracking (with privacy respect)
- Click-through rate on email links
- Geographic delivery insights

**Email Preferences**:
- User opt-out for confirmation emails
- Delivery notification preferences
- Frequency capping

### Phase 3 Features (Future)

**Multi-Language Support**:
- Sender names in user's language
- Email content localization
- Region-specific sender addresses

**White-Label Support**:
- Custom domains for enterprise customers
- Branded sender names per organization
- DKIM signing with customer keys

## References

### RFC Standards
- RFC 5322: Internet Message Format
- RFC 7208: Sender Policy Framework (SPF)
- RFC 6376: DomainKeys Identified Mail (DKIM)
- RFC 7489: Domain-based Message Authentication (DMARC)

### Provider Documentation
- [Resend - Custom Domains](https://resend.com/docs/dashboard/domains/introduction)
- [Postmark - Sender Signatures](https://postmarkapp.com/support/article/1046-how-do-i-verify-a-sender-signature)
- [Google - Email Sender Guidelines](https://support.google.com/mail/answer/81126)

### Tools
- [mail-tester.com](https://www.mail-tester.com/) - Spam score testing
- [mxtoolbox.com](https://mxtoolbox.com/) - DNS record validation
- [dmarcian.com](https://dmarcian.com/) - DMARC monitoring

## Appendix

### Example Environment Configuration

**Development** (`.env.local`):
```bash
EMAIL_FROM_NOTIFICATION="Capsule Note Dev <noreply@dev.capsulenote.com>"
EMAIL_FROM_DELIVERY="Capsule Note Dev <test@dev.capsulenote.com>"
```

**Production** (Vercel):
```bash
EMAIL_FROM_NOTIFICATION="Capsule Note <noreply@capsulenote.com>"
EMAIL_FROM_DELIVERY="Capsule Note <yourcapsulenote@capsulenote.com>"
```

### Email Header Examples

**Confirmation Email Headers**:
```
From: "Capsule Note" <noreply@capsulenote.com>
To: user@example.com
Subject: Your letter "My Future Goals" has been created ✓
Reply-To: noreply@capsulenote.com
X-Idempotency-Key: letter-created-abc123
```

**Delivery Email Headers**:
```
From: "Capsule Note" <yourcapsulenote@capsulenote.com>
To: user@example.com
Subject: A letter from your past self
Reply-To: yourcapsulenote@capsulenote.com
X-Idempotency-Key: delivery-xyz789-attempt-1
```
