# 🚀 Webhook Testing Quick Start

**TL;DR**: Get webhooks working locally in 5 minutes.

---

## One-Time Setup (macOS)

```bash
# Run automated setup
./scripts/setup-local-webhooks.sh

# Then authenticate:
stripe login
ngrok config add-authtoken YOUR_TOKEN  # Get token from ngrok.com
```

---

## Daily Workflow

### Start Everything (4 terminals)

```bash
# Terminal 1: Next.js + Inngest
pnpm dev

# Terminal 2: Stripe webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copy webhook secret → STRIPE_WEBHOOK_SECRET in .env.local

# Terminal 3: ngrok (for Resend)
ngrok http 3000
# Copy HTTPS URL → Add to Resend Dashboard

# Terminal 4: Testing
stripe trigger payment_intent.succeeded  # Test Stripe
# Send email through app                 # Test Resend
```

---

## Test Each Fix

### ✅ Test 1: NonRetriableError (Idempotency)

```bash
# Send duplicate webhook
stripe trigger payment_intent.succeeded
stripe trigger payment_intent.succeeded

# ✅ Expected: Second one logs "Event already processed"
# ❌ Before: ReferenceError
```

### ✅ Test 2: GDPR Payment Anonymization

```bash
# 1. Create user + payment in app
# 2. Delete account via Settings → Delete Account
# 3. Check database:
pnpm db:studio

# ✅ Expected:
#    - User deleted
#    - Payment.userId = "00000000-0000-0000-0000-000000000000"
#    - Payment.metadata has anonymization details
# ❌ Before: Transaction failed, user not deleted
```

### ✅ Test 3: Resend Webhook Security

```bash
# Test invalid signature (should reject)
curl -X POST http://localhost:3000/api/webhooks/resend \
  -H "Content-Type: application/json" \
  -d '{"type":"email.opened","data":{"email_id":"test"}}'

# ✅ Expected: 400 Bad Request (missing headers)
# ❌ Before: 200 OK (security hole!)

# Test valid webhook through ngrok
# Send email → Check logs for "Signature verified successfully"
```

---

## Quick Commands

```bash
# Test Stripe events
stripe trigger payment_intent.succeeded
stripe trigger invoice.payment_failed
stripe trigger customer.subscription.created

# View Inngest dashboard
open http://localhost:8288

# View database
pnpm db:studio

# Check logs
# Look at Terminal 1 (pnpm dev)
```

---

## Environment Variables Needed

```bash
# apps/web/.env.local

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx  # From stripe listen command output

# Resend
RESEND_API_KEY=re_xxx
RESEND_WEBHOOK_SECRET=whsec_xxx  # From Resend Dashboard when creating webhook

# Other required vars (see .env.example)
```

## Getting the Secrets

**Stripe Webhook Secret**:
```bash
# Run this command and copy the secret from output
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Output shows: "Your webhook signing secret is whsec_xxxxx"
```

**Resend Webhook Secret**:
1. Go to [Resend Dashboard → Webhooks](https://resend.com/webhooks)
2. Click "Create Webhook"
3. Add your ngrok URL: `https://abc123.ngrok.io/api/webhooks/resend`
4. Select events (email.opened, email.bounced, etc.)
5. Click "Create" → Copy the "Signing Secret" shown on success page
6. Can also view later on webhook details page

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Invalid signature" (Stripe) | Copy new secret from `stripe listen` output |
| "Invalid signature" (Resend) | 1) Check webhook details page for secret<br>2) Restart `pnpm dev` after updating .env.local |
| Webhooks not reaching app | Restart `pnpm dev` after changing .env.local |
| ngrok tunnel expired | Restart ngrok, update URL in Resend webhook settings |
| Port 3000 in use | `kill -9 $(lsof -ti:3000)` |
| Can't find Resend secret | Go to webhook details page, it shows "Signing Secret" |

---

## URLs to Know

- **Inngest Dashboard**: http://localhost:8288
- **Prisma Studio**: http://localhost:5555 (after `pnpm db:studio`)
- **Stripe Dashboard**: https://dashboard.stripe.com/test
- **Resend Dashboard**: https://resend.com/webhooks
- **ngrok Dashboard**: https://dashboard.ngrok.com

---

## Production Checklist

Before deploying:

- [ ] Set `STRIPE_WEBHOOK_SECRET` in Vercel (production value)
- [ ] Set `RESEND_WEBHOOK_SECRET` in Vercel
- [ ] Update Stripe webhook URL to production domain
- [ ] Update Resend webhook URL to production domain
- [ ] Remove any dev-only webhook routes
- [ ] Test webhooks in Stripe test mode
- [ ] Monitor webhook logs in production

---

## Need More Help?

📚 **Full Guide**: `docs/LOCAL_WEBHOOK_TESTING.md`

🐛 **Common Issues**: See Troubleshooting section in full guide

💬 **Stripe CLI Help**: `stripe --help`

🌐 **ngrok Help**: `ngrok help`
