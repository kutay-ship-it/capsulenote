# Local Webhook Testing Guide

Complete guide for testing Stripe and Resend webhooks in local development environment.

## Table of Contents

- [Overview](#overview)
- [Stripe Webhooks](#stripe-webhooks)
- [Resend Webhooks](#resend-webhooks)
- [Troubleshooting](#troubleshooting)
- [Testing Checklist](#testing-checklist)

---

## Overview

Webhooks require a publicly accessible URL, but in local development we use:
- **Stripe CLI** - Official tool that forwards webhooks to localhost
- **ngrok/Cloudflare Tunnel** - For Resend webhooks (no official CLI)

### Why Different Approaches?

| Service | Tool | Reason |
|---------|------|--------|
| Stripe | Stripe CLI | Official tool with automatic signature generation |
| Resend | ngrok/Cloudflare | No official CLI, need public URL for signature verification |

---

## Stripe Webhooks

### 1. Install Stripe CLI

**macOS (Homebrew)**:
```bash
brew install stripe/stripe-cli/stripe
```

**Other platforms**: [Download from Stripe](https://stripe.com/docs/stripe-cli#install)

### 2. Login to Stripe

```bash
stripe login
```

This opens browser for authentication. Follow the prompts.

### 3. Forward Webhooks to Local Server

```bash
# Start your Next.js app first
pnpm dev

# In another terminal, forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**You'll see output like:**
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx (^C to quit)
```

### 4. Update Environment Variables

Copy the webhook secret from terminal output:

```bash
# apps/web/.env.local
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**Restart your Next.js app** to pick up the new secret.

### 5. Test Stripe Webhooks

**Option A: Trigger Test Events (Recommended)**

```bash
# Test payment success
stripe trigger payment_intent.succeeded

# Test subscription created
stripe trigger customer.subscription.created

# Test invoice payment failed
stripe trigger invoice.payment_failed

# See all available events
stripe trigger --help
```

**Option B: Use Stripe Dashboard**

1. Open [Stripe Dashboard](https://dashboard.stripe.com/test/payments)
2. Create a test payment
3. Watch logs in your terminal

### 6. Verify Webhook Processing

**Check Inngest Dashboard**:
```
http://localhost:8288
```

You should see:
- ✅ `process-stripe-webhook` function triggered
- ✅ Event processed successfully
- ✅ No idempotency errors

**Check your app logs**:
```
[Webhook Processor] Starting webhook processing
[Webhook Processor] Idempotency claimed
[Webhook Processor] Event processed successfully
```

---

## Resend Webhooks

**💡 New to Resend webhooks?** See the detailed guide: `RESEND_WEBHOOK_SECRET_GUIDE.md`

### Option 1: Using ngrok (Recommended)

#### 1. Install ngrok

**macOS (Homebrew)**:
```bash
brew install ngrok
```

**Other platforms**: [Download from ngrok](https://ngrok.com/download)

#### 2. Create ngrok Account

1. Sign up at [ngrok.com](https://ngrok.com)
2. Get your auth token
3. Configure:
```bash
ngrok config add-authtoken YOUR_AUTH_TOKEN
```

#### 3. Start ngrok Tunnel

```bash
# Start your Next.js app first
pnpm dev

# In another terminal, create tunnel
ngrok http 3000
```

**You'll see output like:**
```
Session Status                online
Account                       your-email@example.com
Forwarding                    https://abc123.ngrok.io -> http://localhost:3000
```

#### 4. Configure Resend Webhook

1. Open [Resend Dashboard](https://resend.com/webhooks)
2. Click "Add Webhook" or "Create Webhook"
3. **Webhook Configuration**:
   - **Endpoint URL**: `https://abc123.ngrok.io/api/webhooks/resend`
   - **Events to listen for**: Select:
     - `email.sent`
     - `email.delivered`
     - `email.opened`
     - `email.clicked`
     - `email.bounced`
     - `email.complained`
4. Click "Create" or "Add Webhook"
5. **Copy the Signing Secret** immediately after creation
   - It's displayed once on the success page
   - Format: `whsec_xxxxxxxxxxxxxxxxxxxxxxxxxx`
   - You can also view it later on the webhook details page

#### 5. Update Environment Variables

```bash
# apps/web/.env.local
RESEND_WEBHOOK_SECRET=whsec_your_signing_secret_here
```

**Restart your Next.js app**.

#### 6. Test Resend Webhooks

**Send a test email**:

```bash
# Using the Resend API
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer YOUR_RESEND_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "test@yourdomain.com",
    "to": "your-email@example.com",
    "subject": "Test Email",
    "html": "<p>This is a test email to trigger webhooks</p>"
  }'
```

Or use your app to send a letter delivery.

#### 7. Verify Webhook Processing

**Check your app logs**:
```
[Resend Webhook] Signature verified successfully
[Resend Webhook] Email opened
[Resend Webhook] Event processed successfully
```

**Check Resend Dashboard**:
1. Go to Webhooks → Your webhook
2. Click "Logs" tab
3. Should see 200 responses

---

### Option 2: Using Cloudflare Tunnel (Alternative)

#### 1. Install Cloudflare Tunnel

```bash
brew install cloudflare/cloudflare/cloudflared
```

#### 2. Login to Cloudflare

```bash
cloudflared tunnel login
```

#### 3. Create Tunnel

```bash
cloudflared tunnel create capsulenote-dev
```

#### 4. Start Tunnel

```bash
# Start your Next.js app first
pnpm dev

# In another terminal
cloudflared tunnel --url http://localhost:3000
```

**You'll see a URL like**: `https://random-words-123.trycloudflare.com`

#### 5. Configure Resend

Follow steps 4-7 from ngrok section, using the Cloudflare URL instead.

---

### Option 3: Skip Signature Verification (Quick Testing Only)

⚠️ **NOT RECOMMENDED FOR PRODUCTION**

For quick local testing, you can temporarily disable signature verification:

#### 1. Create Development Route

```typescript
// apps/web/app/api/webhooks/resend-dev/route.ts
import { NextRequest } from "next/server"
import { prisma } from "@/server/lib/db"

/**
 * Development-only webhook handler (NO SIGNATURE VERIFICATION)
 * Only use for local testing with curl/Postman
 *
 * NEVER deploy this to production
 */
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return new Response("Not available in production", { status: 403 })
  }

  const body = await req.json()
  const { type, data } = body

  console.log("[Resend Dev Webhook]", { type, emailId: data.email_id })

  // Same processing logic as production
  switch (type) {
    case "email.opened": {
      const emailDelivery = await prisma.emailDelivery.findFirst({
        where: { resendMessageId: data.email_id },
      })
      if (emailDelivery) {
        await prisma.emailDelivery.update({
          where: { deliveryId: emailDelivery.deliveryId },
          data: { opens: { increment: 1 }, lastOpenedAt: new Date() },
        })
      }
      break
    }
    // Add other cases...
  }

  return new Response("OK", { status: 200 })
}
```

#### 2. Test with curl

```bash
curl -X POST http://localhost:3000/api/webhooks/resend-dev \
  -H "Content-Type: application/json" \
  -d '{
    "type": "email.opened",
    "created_at": "2025-01-01T00:00:00Z",
    "data": {
      "email_id": "your-test-email-id",
      "from": "test@yourdomain.com",
      "to": ["recipient@example.com"]
    }
  }'
```

⚠️ **Remember to delete this route before deploying to production!**

---

## Complete Local Testing Workflow

### Setup (One Time)

```bash
# 1. Install tools
brew install stripe/stripe-cli/stripe
brew install ngrok

# 2. Authenticate
stripe login
ngrok config add-authtoken YOUR_TOKEN

# 3. Set up environment variables
cp apps/web/.env.example apps/web/.env.local
# Add your API keys
```

### Daily Development

```bash
# Terminal 1: Start Next.js
pnpm dev

# Terminal 2: Start Inngest Dev Server (automatic with pnpm dev)
# Already running at http://localhost:8288

# Terminal 3: Start Stripe webhook forwarding
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Terminal 4 (optional): Start ngrok for Resend
ngrok http 3000
```

### Testing Workflow

```bash
# 1. Test Stripe webhooks
stripe trigger payment_intent.succeeded

# 2. Test Resend webhooks
# Send email through your app or Resend dashboard

# 3. Check Inngest dashboard
open http://localhost:8288

# 4. Check app logs
# Look for webhook processing messages

# 5. Check database
pnpm db:studio
# Verify deliveries updated correctly
```

---

## Testing Specific Scenarios

### Test Idempotency (NonRetriableError Fix)

```bash
# Send same webhook twice
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.succeeded

# Expected: Second one logs "Event already processed"
# No ReferenceError, clean exit
```

### Test GDPR Deletion

```bash
# 1. Create user and payment through your app
# 2. Go to Settings → Account → Delete Account
# 3. Check database:
pnpm db:studio

# Verify:
# - User deleted
# - Payments.userId = "00000000-0000-0000-0000-000000000000"
# - Payments.metadata contains anonymization details
```

### Test Resend Webhook Security

```bash
# Test 1: Valid webhook (through ngrok)
# Send email → Should process successfully

# Test 2: Invalid signature (direct curl)
curl -X POST http://localhost:3000/api/webhooks/resend \
  -H "Content-Type: application/json" \
  -H "svix-id: test" \
  -H "svix-timestamp: 1234567890" \
  -H "svix-signature: invalid" \
  -d '{"type":"email.opened","data":{"email_id":"test"}}'

# Expected: 401 Unauthorized

# Test 3: Missing headers
curl -X POST http://localhost:3000/api/webhooks/resend \
  -H "Content-Type: application/json" \
  -d '{"type":"email.opened","data":{"email_id":"test"}}'

# Expected: 400 Bad Request
```

---

## Troubleshooting

### Stripe Webhooks

**Issue**: `No signatures found matching the expected signature`

```bash
# Solution 1: Restart Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Solution 2: Update webhook secret
# Copy new secret from Stripe CLI output
# Update STRIPE_WEBHOOK_SECRET in .env.local
# Restart app: pnpm dev
```

**Issue**: Events not appearing in Inngest

```bash
# Check Inngest is running
curl http://localhost:8288

# Check webhook endpoint directly
curl -X POST http://localhost:3000/api/webhooks/stripe

# Should return: "Method not allowed" (GET not supported)
```

### Resend Webhooks

**Issue**: `Invalid signature`

```bash
# Solution 1: Verify signing secret
# Go to Resend Dashboard → Webhooks → Your webhook
# Copy signing secret (starts with whsec_)
# Update RESEND_WEBHOOK_SECRET in .env.local
# Restart app

# Solution 2: Verify ngrok URL
# Make sure webhook URL in Resend matches ngrok URL exactly
# Example: https://abc123.ngrok.io/api/webhooks/resend
```

**Issue**: ngrok tunnel expired

```bash
# Free ngrok tunnels expire after 2 hours
# Restart ngrok:
ngrok http 3000

# Update webhook URL in Resend Dashboard with new ngrok URL
```

### General Issues

**Issue**: Environment variables not loading

```bash
# Solution: Restart Next.js dev server
# Kill current process (Ctrl+C)
pnpm dev
```

**Issue**: Port already in use

```bash
# Find process on port 3000
lsof -ti:3000

# Kill the process
kill -9 $(lsof -ti:3000)

# Restart
pnpm dev
```

**Issue**: Inngest not processing events

```bash
# Check Inngest Dev Server
open http://localhost:8288

# Check event registration
curl http://localhost:8288/api/inngest

# Should show registered functions including:
# - process-stripe-webhook
# - deliver-email
```

---

## Testing Checklist

### Before Each Testing Session

- [ ] Next.js app running (`pnpm dev`)
- [ ] Inngest Dev Server running (http://localhost:8288)
- [ ] Environment variables set in `.env.local`
- [ ] Stripe CLI authenticated and forwarding
- [ ] ngrok tunnel running (for Resend)
- [ ] Webhook URL updated in Resend Dashboard

### After Making Changes

- [ ] Restart Next.js app
- [ ] Clear any cached webhook events
- [ ] Test with fresh webhook trigger
- [ ] Verify logs show expected behavior
- [ ] Check Inngest dashboard for success
- [ ] Verify database changes in Prisma Studio

### Before Deploying

- [ ] Remove any dev-only webhook routes
- [ ] Verify production webhook secrets set in Vercel
- [ ] Test with Stripe test mode
- [ ] Configure production webhook URLs
- [ ] Set up monitoring/alerting

---

## Production Webhook URLs

When deploying, update webhook URLs to:

**Stripe**:
```
https://your-domain.com/api/webhooks/stripe
```

**Resend**:
```
https://your-domain.com/api/webhooks/resend
```

Get production secrets from:
- **Stripe**: Dashboard → Developers → Webhooks → Add endpoint
- **Resend**: Dashboard → Webhooks → Add webhook

---

## Quick Reference Commands

```bash
# Start everything
pnpm dev                                              # Terminal 1
stripe listen --forward-to localhost:3000/api/webhooks/stripe  # Terminal 2
ngrok http 3000                                       # Terminal 3 (optional)

# Test Stripe
stripe trigger payment_intent.succeeded

# Test Resend (send email through app or API)

# View Inngest
open http://localhost:8288

# View Database
pnpm db:studio

# View Logs
# Check Terminal 1 (Next.js logs)
```

---

## Additional Resources

- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [ngrok Documentation](https://ngrok.com/docs)
- [Resend Webhooks](https://resend.com/docs/webhooks)
- [Inngest Testing Guide](https://www.inngest.com/docs/local-development)
- [Svix Webhook Testing](https://docs.svix.com/receiving/using-cli)

---

## Security Notes

⚠️ **Never commit**:
- Webhook secrets
- ngrok auth tokens
- API keys
- Temporary dev routes with disabled verification

✅ **Always**:
- Use test mode for Stripe in development
- Delete dev-only routes before production
- Verify signatures in production
- Monitor webhook logs for unauthorized attempts
- Rotate secrets regularly
