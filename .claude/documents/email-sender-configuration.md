# Email Sender Configuration Guide

## Overview

Capsule Note uses two distinct email sender addresses to provide clear communication and better email deliverability:

- **Notification Emails** (`noreply@capsulenote.com`) - System notifications, confirmations, alerts
- **Delivery Emails** (`yourcapsulenote@capsulenote.com`) - Scheduled letter deliveries to users

## Environment Configuration

### Development Setup

1. **Copy the example environment file:**
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   ```

2. **Set the email sender addresses:**
   ```bash
   # Notification emails (letter created, alerts, system notifications)
   EMAIL_FROM_NOTIFICATION="Capsule Note <noreply@capsulenote.com>"

   # Letter delivery emails (scheduled letter deliveries to users)
   EMAIL_FROM_DELIVERY="Capsule Note <yourcapsulenote@capsulenote.com>"
   ```

3. **Legacy fallback (optional):**
   ```bash
   # Only used if the above variables are not set
   EMAIL_FROM="no-reply@mail.dearme.app"
   ```

### Production Deployment

#### Vercel Environment Variables

Set these in your Vercel project settings:

1. Navigate to **Project Settings → Environment Variables**
2. Add the following variables for all environments (Production, Preview, Development):

   ```
   EMAIL_FROM_NOTIFICATION = Capsule Note <noreply@capsulenote.com>
   EMAIL_FROM_DELIVERY = Capsule Note <yourcapsulenote@capsulenote.com>
   ```

#### DNS Configuration Requirements

Before sending emails from `capsulenote.com`, configure DNS records:

##### 1. SPF Record (Required)
Authorizes email providers to send on your behalf.

**For Resend:**
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com ~all
```

**For Postmark (fallback):**
```
Type: TXT
Name: @
Value: v=spf1 include:spf.mtasv.net ~all
```

**For both providers:**
```
Type: TXT
Name: @
Value: v=spf1 include:_spf.resend.com include:spf.mtasv.net ~all
```

##### 2. DKIM Records (Required)
Digital signature verification for email authentication.

**Resend DKIM:**
- Log into Resend dashboard
- Navigate to **Domains → capsulenote.com**
- Copy DKIM records and add to DNS:
  ```
  Type: TXT
  Name: resend._domainkey
  Value: [Provided by Resend]
  ```

**Postmark DKIM:**
- Log into Postmark dashboard
- Navigate to **Sender Signatures → capsulenote.com**
- Copy DKIM records and add to DNS

##### 3. DMARC Record (Recommended)
Email authentication, policy, and reporting protocol.

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@capsulenote.com; ruf=mailto:dmarc@capsulenote.com; pct=100
```

**DMARC Policy Options:**
- `p=none` - Monitor only (recommended for testing)
- `p=quarantine` - Send failures to spam folder
- `p=reject` - Reject failed messages entirely

##### 4. Return-Path Record (Optional)
Handles bounce messages.

**For Resend:**
```
Type: CNAME
Name: bounce
Value: feedback-smtp.resend.com
```

#### Domain Verification

After DNS configuration:

1. **Verify in Resend:**
   ```bash
   curl https://api.resend.com/domains/{domain_id}/verify \
     -X POST \
     -H "Authorization: Bearer $RESEND_API_KEY"
   ```

2. **Check DNS propagation:**
   ```bash
   dig TXT capsulenote.com
   dig TXT resend._domainkey.capsulenote.com
   dig TXT _dmarc.capsulenote.com
   ```

3. **DNS propagation can take 24-48 hours**

## Email Provider Configuration

### Resend (Primary Provider)

1. **Domain setup:**
   - Add `capsulenote.com` to Resend dashboard
   - Configure DNS records as shown above
   - Verify domain ownership

2. **API Key:**
   ```bash
   RESEND_API_KEY=re_xxxxxxxxxxxx
   ```

### Postmark (Fallback Provider)

1. **Sender Signature setup:**
   - Add `noreply@capsulenote.com` as sender signature
   - Add `yourcapsulenote@capsulenote.com` as sender signature
   - Configure DNS records
   - Verify signatures

2. **API Key:**
   ```bash
   POSTMARK_SERVER_TOKEN=xxxxxxxxxxxx
   ```

3. **Enable fallback via feature flag:**
   ```bash
   # In Unleash dashboard or environment
   use-postmark-email = true
   ```

## Testing Email Configuration

### 1. Validate Configuration

The application validates email configuration at startup:

```typescript
import { validateEmailSenderConfig } from "./workers/inngest/lib/email-config"

validateEmailSenderConfig() // Throws error if misconfigured
```

**Expected output:**
```
✓ Notification sender configured: Capsule Note <noreply@capsulenote.com>
✓ Delivery sender configured: Capsule Note <yourcapsulenote@capsulenote.com>
```

### 2. Test Notification Email

Create a test letter to trigger confirmation email:

```bash
# Start development server
pnpm dev

# Navigate to http://localhost:3000/letters/new
# Create a test letter
# Check console logs for email send confirmation
```

**Expected logs:**
```json
{
  "level": "info",
  "message": "Sending confirmation email",
  "letterId": "...",
  "userId": "...",
  "to": "user@example.com",
  "from": "Capsule Note <noreply@capsulenote.com>",
  "senderEmail": "noreply@capsulenote.com",
  "senderDisplayName": "Capsule Note",
  "idempotencyKey": "letter-created-..."
}
```

### 3. Test Delivery Email

Schedule a letter for delivery:

```bash
# Create letter with delivery scheduled for near future
# Monitor Inngest dashboard: http://localhost:8288
# Check email send logs
```

**Expected logs:**
```json
{
  "level": "info",
  "message": "Sending email",
  "deliveryId": "...",
  "to": "user@example.com",
  "from": "Capsule Note <yourcapsulenote@capsulenote.com>",
  "senderEmail": "yourcapsulenote@capsulenote.com",
  "senderDisplayName": "Capsule Note"
}
```

## Troubleshooting

### "Email sender not configured" Error

**Symptom:**
```
Error: EMAIL_FROM_NOTIFICATION not configured (and EMAIL_FROM fallback not set)
```

**Solution:**
1. Check `.env.local` file exists
2. Verify environment variables are set:
   ```bash
   grep EMAIL_FROM .env.local
   ```
3. Restart development server after changing `.env.local`

### Email Not Delivered

**Check DNS records:**
```bash
# SPF record
dig TXT capsulenote.com

# DKIM record
dig TXT resend._domainkey.capsulenote.com

# DMARC record
dig TXT _dmarc.capsulenote.com
```

**Verify domain in provider:**
- Resend: Check domain status in dashboard
- Postmark: Check sender signature verification

**Check provider logs:**
- Resend: https://resend.com/emails
- Postmark: Message Streams → Activity

### Wrong Sender Address

**Symptom:** Emails sent from wrong address (e.g., notification using delivery sender)

**Solution:**
1. Check function implementation:
   - `send-letter-created-email.ts` should use `getEmailSender('notification')`
   - `deliver-email.ts` should use `getEmailSender('delivery')`

2. Clear Next.js cache:
   ```bash
   rm -rf .next
   pnpm dev
   ```

### Fallback to Legacy Sender

**Symptom:** Emails sent from `no-reply@mail.dearme.app` instead of Capsule Note addresses

**Cause:** `EMAIL_FROM_NOTIFICATION` and `EMAIL_FROM_DELIVERY` not set

**Solution:**
1. Set the required environment variables
2. Remove or comment out `EMAIL_FROM` if you want to force configuration
3. Restart application

## Migration from Legacy Configuration

If you have existing deployments using `EMAIL_FROM`:

### Zero-Downtime Migration

1. **Add new variables without removing old:**
   ```bash
   EMAIL_FROM_NOTIFICATION="Capsule Note <noreply@capsulenote.com>"
   EMAIL_FROM_DELIVERY="Capsule Note <yourcapsulenote@capsulenote.com>"
   EMAIL_FROM="no-reply@mail.dearme.app"  # Keep as fallback
   ```

2. **Deploy and verify new senders work**

3. **After verification, remove legacy variable:**
   ```bash
   # EMAIL_FROM="no-reply@mail.dearme.app"  # Commented out
   ```

### Rollback Plan

If issues occur, revert to legacy configuration:

1. **Remove new variables:**
   ```bash
   # EMAIL_FROM_NOTIFICATION="Capsule Note <noreply@capsulenote.com>"
   # EMAIL_FROM_DELIVERY="Capsule Note <yourcapsulenote@capsulenote.com>"
   ```

2. **Ensure legacy variable is set:**
   ```bash
   EMAIL_FROM="no-reply@mail.dearme.app"
   ```

3. **Redeploy application**

## Monitoring

### Email Delivery Metrics

Monitor these metrics in your email provider dashboard:

**Deliverability:**
- Delivery rate (target: >99.5%)
- Bounce rate (target: <0.3%)
- Complaint rate (target: <0.05%)

**Performance:**
- Time to inbox (target: <5 seconds)
- Queue depth (target: 0)

**Engagement:**
- Open rate (notification emails)
- Click-through rate (letter delivery emails)

### Application Logs

Monitor structured logs for email operations:

```bash
# Search for email send operations
grep "Sending email" logs/app.log | jq

# Search for email send failures
grep "Email send failed" logs/app.log | jq

# Count emails by sender type
grep "senderEmail" logs/app.log | jq -r '.senderEmail' | sort | uniq -c
```

### Alerts

Set up alerts for:

1. **Email send failures** (threshold: >5 failures in 5 minutes)
2. **Configuration errors** (any occurrence)
3. **High bounce rate** (threshold: >1% in 1 hour)
4. **Provider API errors** (threshold: >10 errors in 5 minutes)

## Security Considerations

### Email Spoofing Prevention

- **SPF records** prevent unauthorized servers from sending as your domain
- **DKIM signatures** verify email authenticity
- **DMARC policy** tells receivers what to do with failed authentication

### Sender Reputation

- **Warm up new domains** - Start with low volume, gradually increase
- **Monitor bounce rates** - Remove invalid addresses promptly
- **Handle unsubscribes** - Respect user preferences immediately
- **Avoid spam triggers** - No misleading subject lines, excessive links

### API Key Security

- **Never commit API keys** to version control
- **Rotate keys regularly** (quarterly recommended)
- **Use environment variables** for all deployments
- **Restrict key permissions** to minimum required scope

## Cost Analysis

### Resend Pricing (as of 2025)

- **Free tier:** 100 emails/day (3,000/month)
- **Pay-as-you-go:** $0.001/email after free tier
- **Expected monthly cost:** ~$10-20 for 10-20K emails

### Postmark Pricing (Fallback)

- **Free tier:** None
- **Pay-as-you-go:** $0.0025/email (10,000 emails = $25)
- **Expected usage:** <1% of total volume (fallback only)

### Recommendations

- **Start with Resend free tier** for development
- **Monitor volume** and upgrade when approaching limits
- **Keep Postmark** configured but disabled for fallback resilience
- **Budget ~$20/month** for production email costs (10-20K emails)

## References

- [Resend Documentation](https://resend.com/docs)
- [Postmark Documentation](https://postmarkapp.com/developer)
- [SPF Record Syntax](https://www.rfc-editor.org/rfc/rfc7208.html)
- [DKIM Specification](https://www.rfc-editor.org/rfc/rfc6376.html)
- [DMARC Overview](https://dmarc.org/overview/)
