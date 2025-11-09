# DearMe Architecture Overview

## System Architecture

DearMe is built as a modern, serverless full-stack application with the following components:

```
┌─────────────────────────────────────────────────────────────┐
│                         Client (Browser)                     │
│                    Next.js 15 App Router                     │
│              React Server Components + Client                │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ HTTPS
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                    Vercel Edge Network                       │
│              (Static + Dynamic Rendering)                    │
└─────────────────┬───────────────────────────────────────────┘
                  │
        ┌─────────┴─────────┬──────────┬────────────┐
        │                   │          │            │
        ▼                   ▼          ▼            ▼
┌───────────────┐  ┌────────────┐  ┌──────────┐  ┌──────────┐
│ Clerk Auth    │  │ Neon PG    │  │ Inngest  │  │ Upstash  │
│ (Identity)    │  │ (Database) │  │ (Jobs)   │  │ (Cache)  │
└───────────────┘  └────────────┘  └──────────┘  └──────────┘
        │                   │          │            │
        ▼                   ▼          ▼            ▼
┌───────────────┐  ┌────────────┐  ┌──────────┐  ┌──────────┐
│ Stripe        │  │ Resend     │  │ Lob      │  │ Sentry   │
│ (Payments)    │  │ (Email)    │  │ (Mail)   │  │ (Errors) │
└───────────────┘  └────────────┘  └──────────┘  └──────────┘
```

## Core Components

### 1. Frontend (Next.js 15)

**Technology Stack:**
- Next.js 15 with App Router
- React 19 (Server Components + Client Components)
- Tailwind CSS + shadcn/ui
- TipTap rich text editor

**Key Features:**
- Server-side rendering (SSR) for dynamic pages
- Partial Prerendering (PPR) for static sections
- Server Actions for type-safe mutations
- Optimistic UI updates

**File Structure:**
```
app/
├── (marketing)/       # Public landing pages
├── (app)/             # Authenticated application
│   ├── dashboard/
│   ├── letters/
│   ├── deliveries/
│   └── settings/
└── api/               # API routes & webhooks
```

### 2. Database Layer (Neon + Prisma)

**Database Schema:**

```
users                    profiles                subscriptions
├── id (uuid)            ├── user_id (fk)       ├── id (uuid)
├── clerk_user_id        ├── display_name       ├── user_id (fk)
├── email                ├── timezone           ├── stripe_sub_id
├── created_at           └── stripe_cust_id     └── status
└── updated_at

letters                  deliveries              email_deliveries
├── id (uuid)            ├── id (uuid)          ├── delivery_id (pk,fk)
├── user_id (fk)         ├── user_id (fk)       ├── to_email
├── title                ├── letter_id (fk)     ├── subject
├── body_rich (json)     ├── channel            ├── resend_msg_id
├── body_html            ├── deliver_at         └── opens/clicks
└── tags                 ├── timezone
                         └── status

mail_deliveries          shipping_addresses      payments
├── delivery_id (pk,fk)  ├── id (uuid)          ├── id (uuid)
├── address_id (fk)      ├── user_id (fk)       ├── user_id (fk)
├── lob_job_id          ├── name/line1/city    ├── type
├── print_options        └── metadata           ├── amount_cents
└── tracking_status                             └── stripe_pi_id

audit_events
├── id (uuid)
├── user_id (fk)
├── type
├── data (json)
└── created_at
```

**Key Design Decisions:**
- UUIDs for primary keys (distributed-friendly)
- CITEXT for case-insensitive emails
- pg_trgm extension for full-text search
- Soft deletes with `deleted_at` timestamp
- Audit log for all user actions

### 3. Authentication (Clerk)

**Flow:**
1. User signs up/in via Clerk
2. Webhook triggers user creation in our DB
3. Profile record created with default timezone
4. Stripe customer created (if needed)

**Webhook Events:**
- `user.created` → Create User + Profile
- `user.updated` → Update User email
- `user.deleted` → Soft delete + cleanup

### 4. Job Scheduling (Inngest)

**Delivery Workflow:**

```
1. User schedules delivery
   ├── Create delivery record (status: scheduled)
   └── Trigger Inngest function

2. Inngest function: deliver-email
   ├── Sleep until deliver_at
   ├── Update status: processing
   ├── Send via Resend
   ├── Update status: sent
   └── Record audit event

3. Retry on failure
   ├── Exponential backoff (5s → 1m → 10m → 1h → 6h)
   ├── Max 5 attempts
   └── Update status: failed
```

**Benefits:**
- Durable execution (survives crashes)
- Built-in retries with backoff
- Step functions for complex workflows
- Observable in Inngest dashboard

### 5. Email Delivery (Resend)

**Template System:**
- React Email components
- Inline CSS for compatibility
- Dark mode support
- Responsive design

**Deliverability:**
- Dedicated subdomain (mail.dearme.app)
- SPF, DKIM, DMARC configured
- Bounce/complaint handling via webhooks
- Open/click tracking

### 6. Payments (Stripe)

**Subscription Model:**
- Pro plan required to schedule deliveries
- Monthly and annual pricing
- Trial period (7 days or 1 free letter)

**Additional Charges:**
- Physical mail per-letter fee
- Charged at schedule time (not delivery)

**Webhook Events:**
- `customer.subscription.*` → Sync subscription status
- `payment_intent.succeeded` → Record payment
- `payment_intent.failed` → Handle failure

### 7. Physical Mail (Lob)

**Integration:**
- Address verification before submission
- HTML-to-print conversion
- Tracking status updates via webhooks
- Preview URLs for user confirmation

**Provider Abstraction:**
```typescript
interface MailingProvider {
  sendLetter(options: MailOptions): Promise<MailResult>
  verifyAddress(address: Address): Promise<VerificationResult>
}
```

### 8. Caching & Rate Limiting (Upstash Redis)

**Rate Limits:**
- API: 100 req/min per IP
- Letter creation: 10/hour per user
- Delivery scheduling: 20/hour per user

**Cache Strategy:**
- User profiles (TTL: 1 hour)
- Letter lists (invalidate on mutation)
- Static content (CDN cache)

## Data Flow

### Creating and Scheduling a Letter

```
┌─────────┐
│ User    │
└────┬────┘
     │
     │ 1. Fill form
     ▼
┌─────────────────┐
│ Letter Editor   │
│ (Client)        │
└────┬────────────┘
     │
     │ 2. Submit
     ▼
┌─────────────────┐
│ createLetter    │
│ (Server Action) │
└────┬────────────┘
     │
     │ 3. Insert
     ▼
┌─────────────────┐
│ Prisma/Neon     │
└────┬────────────┘
     │
     │ 4. Redirect
     ▼
┌─────────────────┐
│ Letter Detail   │
│ (Server Comp)   │
└────┬────────────┘
     │
     │ 5. Click "Schedule"
     ▼
┌─────────────────┐
│ Schedule Form   │
│ (Client)        │
└────┬────────────┘
     │
     │ 6. Submit
     ▼
┌───────────────────┐
│ scheduleDelivery  │
│ (Server Action)   │
└────┬──────────────┘
     │
     │ 7. Create delivery
     ▼
┌─────────────────┐
│ Prisma/Neon     │
└────┬────────────┘
     │
     │ 8. Trigger job
     ▼
┌─────────────────┐
│ Inngest         │
└────┬────────────┘
     │
     │ 9. Wait until deliver_at
     ▼
┌─────────────────┐
│ Resend          │
└────┬────────────┘
     │
     │ 10. Deliver email
     ▼
┌─────────────────┐
│ User's Inbox    │
└─────────────────┘
```

## Security Architecture

### Authentication & Authorization
- Clerk handles authentication (OAuth, email, passkeys)
- Middleware protects all `/app` routes
- Server Actions verify user ownership
- Row-level security via `userId` checks

### Data Protection
- Postgres encryption at rest (Neon)
- TLS in transit (all connections)
- Optional client-side encryption (future)
- Minimal PII collection

### Secrets Management
- Environment variables via Vercel
- Webhook secrets for all integrations
- API keys rotated regularly
- Least-privilege access

### Rate Limiting
- Per-IP limits on public endpoints
- Per-user limits on mutations
- Webhook replay protection
- DDOS mitigation via Vercel

## Scaling Strategy

### Current (Alpha/Beta)
- Serverless functions (Vercel)
- Single Neon database
- Inngest Cloud for jobs
- Upstash Redis (single region)

### Medium Scale (1K-10K users)
- Neon read replicas
- Multi-region Redis
- Increase Inngest concurrency
- CDN for static assets

### Large Scale (10K+ users)
- Database sharding by user ID
- Separate job workers
- Dedicated email infrastructure
- Multi-region deployment

## Observability

### Error Tracking (Sentry)
- Frontend errors
- Server Action errors
- API route errors
- Background job errors

### Logging
- Structured logs (JSON)
- Request tracing (OpenTelemetry)
- Audit events in database

### Monitoring
- Vercel Analytics
- Inngest dashboard
- Database metrics (Neon)
- Email deliverability (Resend)

### Alerting
- Error rate spikes
- Failed deliveries
- Payment failures
- Database connection issues

## Development Workflow

### Local Development
```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Access:
# - App: http://localhost:3000
# - Inngest: http://localhost:8288
```

### Preview Deployments
- Automatic per-PR on Vercel
- Neon branch databases
- Isolated environment variables
- Test webhooks with ngrok

### Production Deployment
```bash
# Deploy
vercel --prod

# Run migrations
pnpm db:migrate
```

## Trade-offs & Decisions

### Why Server Components?
✅ Reduced client JS bundle
✅ Direct database access
✅ Better SEO
❌ Learning curve

### Why Inngest over cron?
✅ Durable execution
✅ Built-in retries
✅ Observable
❌ Additional service

### Why Neon over RDS?
✅ Serverless (no cold starts)
✅ Branch databases
✅ Great DX
❌ Vendor lock-in

### Why Clerk over Auth.js?
✅ Pre-built UI
✅ OAuth providers
✅ Webhooks
❌ Cost at scale

## Future Enhancements

### Phase 2
- [ ] Mobile app (React Native)
- [ ] Push notifications
- [ ] Voice memos
- [ ] Photo attachments

### Phase 3
- [ ] Collections & templates
- [ ] AI writing prompts
- [ ] Team/coach mode
- [ ] Public time capsules

### Phase 4
- [ ] Client-side encryption
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] White-label solution
