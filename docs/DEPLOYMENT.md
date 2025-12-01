# DearMe Deployment Guide

This guide covers deploying DearMe to production using Vercel, Neon, and other services.

## Prerequisites

1. **Vercel Account** - For hosting the Next.js application
2. **Neon Account** - For PostgreSQL database
3. **Clerk Account** - For authentication
4. **Stripe Account** - For payments
5. **Resend Account** - For email delivery
6. **Upstash Account** - For Redis cache
7. **Inngest Account** (optional) - For job scheduling (can use Inngest Cloud)
8. **Lob Account** (optional) - For physical mail delivery

## Step 1: Database Setup (Neon)

1. Create a new project in [Neon](https://neon.tech)
2. Copy the connection string
3. Enable the following PostgreSQL extensions:
   ```sql
   CREATE EXTENSION IF NOT EXISTS "pg_trgm";
   CREATE EXTENSION IF NOT EXISTS "citext";
   ```

## Step 2: Authentication Setup (Clerk)

1. Create a new application in [Clerk](https://clerk.com)
2. Configure OAuth providers (Google, GitHub, etc.)
3. Set up webhooks:
   - Webhook URL: `https://your-domain.com/api/webhooks/clerk`
   - Events: `user.created`, `user.updated`, `user.deleted`
4. Copy your publishable and secret keys

## Step 3: Payment Setup (Stripe)

1. Create products and prices in [Stripe Dashboard](https://dashboard.stripe.com)
   - DearMe Pro Monthly (e.g., `price_xxx`)
   - DearMe Pro Annual (e.g., `price_xxx`)
2. Set up webhooks:
   - Webhook URL: `https://your-domain.com/api/webhooks/stripe`
   - Events:
     - `customer.created`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
3. Copy your secret key and webhook signing secret

## Step 4: Email Setup (Resend)

1. Create an account at [Resend](https://resend.com)
2. Add and verify your domain (e.g., `mail.dearme.app`)
3. Configure DNS records (SPF, DKIM, DMARC)
4. Copy your API key
5. Set up webhooks:
   - Webhook URL: `https://your-domain.com/api/webhooks/resend`
   - Events: `email.opened`, `email.clicked`, `email.bounced`, `email.complained`

## Step 5: Redis Setup (Upstash)

1. Create a database at [Upstash](https://upstash.com)
2. Copy the REST URL and token

## Step 6: Job Scheduling (Inngest)

Option A: **Inngest Cloud** (Recommended)
1. Create an account at [Inngest](https://inngest.com)
2. Create a new app
3. Copy your signing key and event key

Option B: **Self-hosted**
1. Deploy Inngest using Docker
2. Configure connection details

## Step 7: Vercel Deployment

### 1. Connect Repository

```bash
# Install Vercel CLI
npm i -g vercel

# Link your project
vercel link
```

### 2. Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```env
# App
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Database
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_PRO_MONTHLY=price_xxx
STRIPE_PRICE_PRO_ANNUAL=price_xxx

# Resend
RESEND_API_KEY=re_xxx
EMAIL_FROM=no-reply@mail.dearme.app

# Inngest
INNGEST_SIGNING_KEY=signkey-prod-xxx
INNGEST_EVENT_KEY=prod

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# Lob (optional)
LOB_API_KEY=live_xxx
```

### 3. Deploy

```bash
# Deploy to production
vercel --prod
```

### 4. Run Migrations

```bash
# Set DATABASE_URL locally
export DATABASE_URL="your-neon-connection-string"

# Run migrations
cd packages/prisma
pnpm prisma migrate deploy
```

## Step 8: Domain Configuration

1. Add your custom domain in Vercel
2. Configure DNS records
3. Enable automatic HTTPS

## Step 9: Cron Jobs (Vercel Cron)

Create `vercel.json` in the root:

```json
{
  "crons": [
    {
      "path": "/api/cron/reconcile-deliveries",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

## Step 10: Monitoring & Observability

### Sentry Setup
1. Create project at [Sentry](https://sentry.io)
2. Install Sentry SDK
3. Configure DSN in environment variables

### PostHog Setup
1. Create project at [PostHog](https://posthog.com)
2. Add API key to environment

## Post-Deployment Checklist

- [ ] Verify database migrations applied
- [ ] Test user sign-up and webhook
- [ ] Create a test letter
- [ ] Schedule a test delivery
- [ ] Verify email delivery
- [ ] Test Stripe checkout
- [ ] Check webhook endpoints
- [ ] Monitor Inngest dashboard
- [ ] Set up error tracking
- [ ] Configure domain and SSL
- [ ] Test from multiple devices
- [ ] Set up monitoring alerts

## Scaling Considerations

### Database
- Enable Neon read replicas for heavy read workloads
- Use connection pooling (PgBouncer)
- Monitor query performance

### Caching
- Implement Redis caching for frequently accessed data
- Use Vercel Edge caching for static assets

### Jobs
- Monitor Inngest function runs
- Set up alerts for failed deliveries
- Consider batch processing for high volume

## Backup & Recovery

### Database Backups
- Neon provides automatic daily backups
- Set up manual backup schedule for critical data
- Test restore procedures

### Data Retention
- Configure automatic deletion of old audit events
- Archive delivered letters after retention period

## Security

- [ ] Enable Vercel firewall rules
- [ ] Set up rate limiting on API routes
- [ ] Regular security audits
- [ ] Monitor for suspicious activity
- [ ] Keep dependencies updated

## Support & Maintenance

- Monitor error rates in Sentry
- Review Inngest job failures
- Check email deliverability metrics
- Monitor subscription churn
- Regular database maintenance

## Troubleshooting

### Emails not sending
1. Check Resend dashboard for errors
2. Verify DNS records (SPF, DKIM)
3. Check Inngest function logs

### Deliveries not processing
1. Check Inngest dashboard
2. Verify webhook endpoints
3. Check database delivery records

### Webhooks failing
1. Verify webhook secrets
2. Check endpoint logs
3. Test with webhook testing tools

## Emergency Procedures

### Database Connection Issues
```bash
# Check connection
psql $DATABASE_URL

# If needed, scale up Neon database
```

### High Error Rate
1. Check Sentry for error patterns
2. Review recent deployments
3. Roll back if necessary: `vercel rollback`

### Scheduled Deliveries Stuck
```bash
# Run backstop cron manually
curl https://your-domain.com/api/cron/reconcile-deliveries
```

## Resources

- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Inngest Documentation](https://www.inngest.com/docs)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
