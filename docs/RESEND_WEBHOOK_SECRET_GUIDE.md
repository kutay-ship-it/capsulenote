# Getting Your Resend Webhook Signing Secret

**TL;DR**: The signing secret appears when you create a webhook in Resend Dashboard. Copy it then!

---

## Step-by-Step Guide

### 1. Go to Resend Dashboard

Open [Resend Dashboard → Webhooks](https://resend.com/webhooks)

### 2. Create New Webhook

Click **"Create Webhook"** or **"Add Webhook"** button

### 3. Configure Webhook

Fill in the form:

```
┌──────────────────────────────────────────────────────┐
│ Create Webhook                                       │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Endpoint URL                                         │
│ https://your-domain.com/api/webhooks/resend         │
│                                                      │
│ Events to listen for:                                │
│ ☑ email.sent                                        │
│ ☑ email.delivered                                   │
│ ☑ email.delivered_delayed                           │
│ ☑ email.opened                                      │
│ ☑ email.clicked                                     │
│ ☑ email.bounced                                     │
│ ☑ email.complained                                  │
│                                                      │
│              [Cancel]  [Create Webhook]              │
└──────────────────────────────────────────────────────┘
```

**For local development**, use your ngrok URL:
```
https://abc123.ngrok-free.app/api/webhooks/resend
```

### 4. Copy the Signing Secret

After clicking "Create Webhook", you'll see a success page:

```
┌──────────────────────────────────────────────────────┐
│ ✅ Webhook Created Successfully                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Your webhook has been created!                       │
│                                                      │
│ Signing Secret (⚠️ Save this now!)                   │
│ ┌──────────────────────────────────────────────┐   │
│ │ whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx       │   │
│ │                                    [Copy]    │   │
│ └──────────────────────────────────────────────┘   │
│                                                      │
│ Store this secret securely. You'll need it to       │
│ verify webhook signatures.                           │
│                                                      │
│              [View Webhook Details]                  │
└──────────────────────────────────────────────────────┘
```

**⚠️ IMPORTANT**: Copy this secret immediately! (Though you can view it later)

### 5. Where to Find It Later

If you need to retrieve the secret later:

1. Go to [Resend Dashboard → Webhooks](https://resend.com/webhooks)
2. Click on your webhook in the list
3. The webhook details page shows the "Signing Secret"

```
┌──────────────────────────────────────────────────────┐
│ Webhook Details                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│ Endpoint URL                                         │
│ https://your-domain.com/api/webhooks/resend         │
│                                                      │
│ Status: Active ●                                    │
│                                                      │
│ Signing Secret                                       │
│ whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx    [Show]    │
│                                                      │
│ Events subscribed: 7                                 │
│ Last delivery: 2 minutes ago                         │
│                                                      │
│              [Edit]  [Delete]  [Test]                │
└──────────────────────────────────────────────────────┘
```

---

## Adding to Environment Variables

Once you have the secret:

### Local Development

Add to `apps/web/.env.local`:

```bash
RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Then restart your development server**:
```bash
# Stop current server (Ctrl+C)
pnpm dev
```

### Production (Vercel)

1. Go to your Vercel project
2. Settings → Environment Variables
3. Add new variable:
   - **Name**: `RESEND_WEBHOOK_SECRET`
   - **Value**: `whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **Environment**: Production (or all)
4. Redeploy if needed

---

## Common Issues

### Issue: "I created webhook but can't find the secret"

**Solution**: Go to webhook details page
1. Resend Dashboard → Webhooks
2. Click on your webhook
3. Secret shown on details page

### Issue: "Invalid signature" error

**Possible causes**:

1. **Secret not set in environment**
   ```bash
   # Check if variable is set
   echo $RESEND_WEBHOOK_SECRET

   # If empty, add to .env.local and restart
   ```

2. **Wrong secret copied**
   - Make sure you copied the entire secret including `whsec_` prefix
   - No extra spaces or newlines

3. **App not restarted after adding secret**
   ```bash
   # Restart development server
   pnpm dev
   ```

4. **Using production secret for dev or vice versa**
   - Local development needs its own webhook with ngrok URL
   - Production needs separate webhook with production URL

### Issue: "Can't verify webhooks locally"

**Solution**: Use ngrok for local testing

```bash
# Terminal 1: Start app
pnpm dev

# Terminal 2: Start ngrok tunnel
ngrok http 3000

# Use ngrok HTTPS URL in Resend webhook configuration
# Example: https://abc123.ngrok-free.app/api/webhooks/resend
```

---

## Testing Webhook Verification

### Test 1: Valid Webhook (through Resend)

Send an email through your app or Resend dashboard.

**Expected logs**:
```
[Resend Webhook] Signature verified successfully
[Resend Webhook] Email opened
[Resend Webhook] Event processed successfully
```

### Test 2: Invalid Signature (direct POST)

```bash
curl -X POST http://localhost:3000/api/webhooks/resend \
  -H "Content-Type: application/json" \
  -d '{"type":"email.opened","data":{"email_id":"test"}}'
```

**Expected response**: `400 Bad Request` (missing headers)

### Test 3: Check Resend Dashboard

Go to your webhook details page:
- **Recent Deliveries** tab shows webhook calls
- Status should be "200 OK" for successful deliveries
- "401 Unauthorized" means signature verification failed

---

## Security Best Practices

✅ **DO**:
- Store secret in environment variables
- Keep separate secrets for dev/staging/production
- Verify signatures on all webhook endpoints
- Rotate secrets periodically (every 90 days recommended)
- Check webhook details page to audit deliveries

❌ **DON'T**:
- Commit secrets to git
- Share secrets in plaintext
- Use same secret across environments
- Skip signature verification
- Log the secret value

---

## Quick Reference

```bash
# 1. Create webhook in Resend Dashboard
# 2. Copy signing secret (starts with whsec_)
# 3. Add to .env.local
echo "RESEND_WEBHOOK_SECRET=whsec_xxx" >> apps/web/.env.local

# 4. Restart app
pnpm dev

# 5. Test
# Send email through app or trigger test event in Resend Dashboard
```

---

## Further Reading

- [Resend Webhook Documentation](https://resend.com/docs/dashboard/webhooks/introduction)
- [Resend Webhook Verification Guide](https://resend.com/docs/dashboard/webhooks/verify-webhooks-requests)
- [Svix Webhook Security](https://docs.svix.com/receiving/verifying-payloads/how)
