# Environment Variables Guide

**Updated:** 2025-11-21 (After comprehensive merge)

---

## 📁 File Locations

### Development (Local)
```
apps/web/.env.local
```
✅ **Already created** with your existing credentials + new required variables

### Testing
```
apps/web/.env.test
```
✅ **Already exists** - Used by `pnpm test` (added in merge)

### Production (Reference)
```
apps/web/.env.production.example
```
✅ **Template created** - Use as reference for Vercel environment variables

### Example File
```
apps/web/.env.example
```
✅ **Already exists** - Template for new developers

---

## ⚠️ CRITICAL CHANGES FROM MERGE

### 1. CRON_SECRET (REQUIRED - Build will fail without it!)

**Old (Your File):**
```bash
CRON_SECRET=local_dev_secret_123  # ❌ Too short! (Only 21 chars)
```

**New (Required):**
```bash
CRON_SECRET=4695a055289bd4dbf73edf3bf0a9c9708e4d3131828a773ded6de45f7cc82e66
# ✅ 64 characters (minimum 32 required)
```

**Why:** Now validated at build time with Zod. Must be ≥32 characters.

**Generate new one:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### 2. Email Sender Addresses (NEW - Optional but Recommended)

**Old:**
```bash
EMAIL_FROM=no-reply@letter.capsulenote.com
```

**New (Better branding):**
```bash
EMAIL_FROM_NOTIFICATION="Capsule Note <noreply@capsulenote.com>"
EMAIL_FROM_DELIVERY="Capsule Note <yourcapsulenote@capsulenote.com>"
EMAIL_FROM=no-reply@letter.capsulenote.com  # Fallback
```

**Why:**
- Notification emails (alerts, confirmations) use first address
- Letter delivery emails use second address (more personal)
- Fallback to `EMAIL_FROM` if not set (backward compatible)

---

### 3. Encryption Key Rotation (NEW - Optional)

**What's New:**
```bash
# For future key rotations (not needed yet)
CRYPTO_MASTER_KEY_V1=Bu97I39cHhFhxIVyUkNIYwwm9hp+at1TO8gi3Ydn5gs=
CRYPTO_MASTER_KEY_V2=<new_key_when_rotating>
CRYPTO_CURRENT_KEY_VERSION=1  # Which key to use for NEW encryptions
```

**Why:** Allows rotating encryption keys without losing access to old data.

**When to use:**
- Security policy requires key rotation
- Suspected key compromise
- Annual security audits

**Current setup:** Just keep using `CRYPTO_MASTER_KEY` (no changes needed)

---

### 4. Email Failover (NEW - Optional)

**What's New:**
```bash
POSTMARK_SERVER_TOKEN=your_postmark_token_here
```

**Why:**
- Automatic failover if Resend is down
- Achieves 99.95%+ email uptime
- Resend → Postmark automatic switching

**Needed for:** Production environments where email reliability is critical

---

## 📋 Complete Variable List

### REQUIRED (Must have or build fails)
- ✅ `DATABASE_URL`
- ✅ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- ✅ `CLERK_SECRET_KEY`
- ✅ `CLERK_WEBHOOK_SECRET`
- ✅ `STRIPE_SECRET_KEY`
- ✅ `STRIPE_WEBHOOK_SECRET`
- ✅ `RESEND_API_KEY`
- ✅ `INNGEST_SIGNING_KEY`
- ✅ `INNGEST_EVENT_KEY`
- ✅ `UPSTASH_REDIS_REST_URL`
- ✅ `UPSTASH_REDIS_REST_TOKEN`
- ✅ `CRYPTO_MASTER_KEY`
- ⚠️ `CRON_SECRET` **(NEW - Required, min 32 chars)**

### RECOMMENDED (For production)
- `POSTMARK_SERVER_TOKEN` - Email failover
- `LOB_API_KEY` - Physical mail
- `SENTRY_DSN` - Error tracking
- `POSTHOG_API_KEY` - Analytics

### OPTIONAL (Advanced features)
- `CRYPTO_MASTER_KEY_V1/V2/V3` - Key rotation
- `CRYPTO_CURRENT_KEY_VERSION` - Key rotation
- `UNLEASH_API_URL` - Feature flags
- `CLICKSEND_API_KEY` - Alternative mail provider
- `OTEL_EXPORTER_OTLP_ENDPOINT` - Distributed tracing

---

## 🚀 Quick Start

### For Local Development

1. **Use the updated file:**
   ```bash
   # File already created: apps/web/.env.local
   ```

2. **Verify it works:**
   ```bash
   cd apps/web
   pnpm install
   pnpm dev
   ```

3. **Run tests:**
   ```bash
   pnpm test  # Uses apps/web/.env.test automatically
   ```

---

### For Production (Vercel)

1. **Go to Vercel Dashboard**
   - Project Settings → Environment Variables

2. **Add ALL required variables** (see list above)

3. **IMPORTANT - Generate new values for production:**
   ```bash
   # New CRON_SECRET (64 chars)
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

   # New CRYPTO_MASTER_KEY (44 chars base64)
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

4. **Use production credentials:**
   - Clerk: Switch to live keys (`pk_live_`, `sk_live_`)
   - Stripe: Switch to live keys (`sk_live_`, `pk_live_`)
   - Database: Use production Neon database
   - Resend: Use production API key
   - Inngest: Use `signkey-prod-xxx`

---

## 🔐 Security Best Practices

### DO ✅
- ✅ Generate new secrets for production (don't reuse dev values)
- ✅ Use minimum 32 characters for `CRON_SECRET`
- ✅ Store `CRYPTO_MASTER_KEY` securely (losing it = data loss)
- ✅ Use environment variables in Vercel (never commit to git)
- ✅ Rotate keys annually (use versioned keys)
- ✅ Enable Postmark failover in production

### DON'T ❌
- ❌ Commit `.env.local` or `.env.production` to git
- ❌ Share encryption keys in Slack/email
- ❌ Reuse dev credentials in production
- ❌ Use short CRON_SECRET (will fail build)
- ❌ Skip `POSTMARK_SERVER_TOKEN` in production

---

## 🔄 Migration from Old .env

Your old `.env` has been migrated to `apps/web/.env.local` with these changes:

### Updated
- ✅ `CRON_SECRET` - Now 64 chars (was 21)
- ✅ Added `EMAIL_FROM_NOTIFICATION` (optional)
- ✅ Added `EMAIL_FROM_DELIVERY` (optional)
- ✅ Added key rotation placeholders (commented)
- ✅ Added Postmark failover (commented)

### No Changes Needed
- ✅ Database URL - Same
- ✅ Clerk keys - Same
- ✅ Stripe keys - Same
- ✅ Resend key - Same
- ✅ Upstash Redis - Same
- ✅ Encryption key - Same (just copied as-is)

---

## 📝 Validation

### Check if your .env is valid:

```bash
cd apps/web

# Type check (validates env vars at build time)
pnpm typecheck

# Build (full validation)
pnpm build
```

### Common Errors:

**Error: "CRON_SECRET must be at least 32 characters"**
```bash
# Fix: Use the new 64-char value from .env.local
```

**Error: "CRYPTO_MASTER_KEY is required"**
```bash
# Fix: Already set in your .env.local
```

---

## 🆘 Troubleshooting

### Tests failing?
- Make sure `apps/web/.env.test` exists (✅ already created)
- Run `pnpm test` from repo root

### Build failing?
- Check `CRON_SECRET` is ≥32 chars
- Verify all REQUIRED variables are set
- Try `SKIP_ENV_VALIDATION=true` (dev only)

### Cron jobs not running?
- Verify `CRON_SECRET` matches in Vercel and code
- Check Vercel logs for authentication errors
- Ensure all 5 cron jobs are configured in `vercel.json`

### Email not sending?
- Check `RESEND_API_KEY` is valid
- Verify sender domain is authenticated
- Add `POSTMARK_SERVER_TOKEN` for failover

---

## 📚 Related Documentation

- `DEPLOYMENT_STATUS.md` - Post-merge deployment guide
- `docs/ENCRYPTION_KEY_ROTATION.md` - Key rotation procedures
- `packages/prisma/CREATE_MIGRATIONS.md` - Database migration guide
- `COMPREHENSIVE_SECURITY_AUDIT_REPORT.md` - Security fixes details

---

**Need help?** Check the documentation files or review `apps/web/.env.example` for all available options.
