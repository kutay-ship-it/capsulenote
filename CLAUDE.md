# Capsule Note - Claude Code Repository Guide

> Privacy-first platform for writing letters to your future self via email or physical mail.

## Documentation Navigation

**📚 Complete Documentation Index**: See `.claude/skills/docs-navigator/SKILL.md` for comprehensive documentation map.

**Quick Links:**
- **Latest Updates**: `ENTERPRISE_IMPROVEMENTS.md` - Recent enterprise-grade improvements
- **Next.js/React Patterns**: `.claude/skills/nextjs-15-react-19-patterns.md` - Server/Client Component patterns
- **Design System**: `MOTHERDUCK_STYLEGUIDE.md` - Complete style guide (colors, typography, components)
- **Security Procedures**: `docs/ENCRYPTION_KEY_ROTATION.md` - Key rotation guide
- **Database Migrations**: `packages/prisma/CREATE_MIGRATIONS.md` - Migration procedures
- **Implementation Status**: See Implementation Status section below

## Quick Start Commands

```bash
# Initial setup after git clone
pnpm install
cp apps/web/.env.example apps/web/.env.local
# Edit .env.local with your API keys
pnpm db:generate
pnpm db:migrate

# Development
pnpm dev                    # Start all apps (Next.js on :3000, Inngest on :8288)
pnpm dev --filter web       # Run only web app
pnpm dev --filter inngest   # Run only workers

# Database (all commands automatically load .env.local via dotenv-cli)
pnpm db:generate            # Generate Prisma client after schema changes
pnpm db:migrate             # Run migrations (requires interactive mode)
pnpm db:push                # Push schema changes (non-interactive, recommended for dev)
pnpm db:seed                # Seed database with pricing plans (requires Stripe price IDs in .env.local)
pnpm db:studio              # Open Prisma Studio

# Quality
pnpm typecheck              # Type checking across all packages
pnpm lint                   # Linting
pnpm format                 # Format code with Prettier
pnpm test                   # Run all tests (when implemented)

# Build
pnpm build                  # Build all apps for production
```

## Project Architecture

### Monorepo Structure (pnpm workspaces + Turborepo)

```
apps/
  web/                      # Next.js 15 App Router application
    app/                    # App Router pages and API routes
      api/                  # API routes
        cron/               # Cron jobs (backstop reconciler)
        webhooks/           # Clerk, Stripe webhooks
      dashboard/            # User dashboard pages
      letters/              # Letter CRUD pages
    server/                 # Server-side code
      actions/              # Server Actions (letters, deliveries)
      lib/                  # Utilities (encryption, feature-flags)
      providers/            # Provider abstractions (email, mail)
        email/              # Email provider layer
          interface.ts      # EmailProvider interface
          resend-provider.ts    # Primary (Resend)
          postmark-provider.ts  # Fallback (Postmark)
          index.ts          # Factory with feature flags
    components/             # React components
    env.mjs                 # Environment variable validation (Zod)

packages/
  prisma/                   # Database schema and migrations
    schema.prisma           # Prisma schema (PostgreSQL + extensions)
    migrations/             # Database migrations
  ui/                       # Shared UI components (shadcn/ui)
  config/                   # Shared configs (ESLint, TypeScript)
  types/                    # Shared TypeScript types & Zod schemas
    schemas/                # Validation schemas

workers/
  inngest/                  # Inngest durable job functions
    functions/              # Job definitions
      deliver-email.ts      # Email delivery with sleep-until pattern
      deliver-mail.ts       # Physical mail delivery
      process-webhook.ts    # Webhook processing
```

### Tech Stack

- **Framework**: Next.js 15.5.6 (App Router, Server Components, Server Actions, PPR)
- **Language**: TypeScript 5.3+
- **UI Library**: React 19.2.0 (Stable - Released Dec 5, 2024)

## Next.js 15 & React 19 Patterns (CRITICAL)

**⚠️ BEFORE working on ANY page or component:**

**Read the complete patterns guide**: `.claude/skills/nextjs-15-react-19-patterns.md`

**Quick Decision Tree:**
```
Need hooks/state/events? → YES → "use client"
                         → NO  → Server Component (default)
```

**Key Rules:**
- ✅ **DEFAULT**: Server Components (no "use client") - async, zero JS to client
- 🔴 **USE "use client"** ONLY for: hooks, event handlers, browser APIs, local state
- ❌ **NEVER**: Mark entire pages as Client Components or use hooks in Server Components

**Compliance:**
- Follow patterns in `.claude/skills/nextjs-15-react-19-patterns.md`
- Keep First Load JS < 170 KB (verify with `pnpm build`)
- See `apps/web/NEXTJS_15_COMPLIANCE_REPORT.md` for compliance status
- **Database**: Neon Postgres + Prisma ORM (pg_trgm, citext extensions)
- **Auth**: Clerk (OAuth, email, passkeys)
- **Job Scheduling**: Inngest (durable workflows with sleep-until pattern)
- **Email**: Resend (primary) + Postmark (fallback) via provider abstraction
- **Physical Mail**: Lob API + ClickSend (future)
- **Payments**: Stripe Billing + Checkout
- **Caching**: Upstash Redis
- **UI**: shadcn/ui + Tailwind CSS + Radix UI
- **Email Templates**: React Email
- **Feature Flags**: Unleash (production) + env vars (development)
- **Analytics**: PostHog (planned)
- **Observability**: OpenTelemetry + Sentry (planned)

## Critical Security Architecture

### 1. Letter Content Encryption (AES-256-GCM)

**Purpose**: Protect letter privacy - database breach doesn't expose content.

**Implementation**: `apps/web/server/lib/encryption.ts`

```typescript
// Per-record encryption using Web Crypto API
const { ciphertext, nonce, keyVersion } = await encryptLetter({
  bodyRich: { /* Tiptap JSON */ },
  bodyHtml: "<p>Letter content</p>"
})

// Stored in database:
// - bodyCiphertext (Bytes): encrypted content
// - bodyNonce (Bytes): unique 96-bit nonce
// - keyVersion (Int): supports key rotation
// - bodyFormat (String): "rich" | "md" | "html"

// Decrypt on read (single letter view)
const { bodyRich, bodyHtml } = await decryptLetter(
  bodyCiphertext, bodyNonce, keyVersion
)
```

**Key Points**:
- Master key: `CRYPTO_MASTER_KEY` environment variable (base64-encoded 32 bytes)
- List views skip decryption for performance
- All Server Actions encrypt before saving
- Inngest jobs decrypt before sending
- Key rotation supported via `keyVersion` field

**Generate key**: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

### 2. Backstop Reconciler Pattern

**Purpose**: Achieve 99.95% on-time delivery SLO by catching stuck jobs.

**Implementation**: `apps/web/app/api/cron/reconcile-deliveries/route.ts`

**How it works**:
1. Vercel Cron runs every 5 minutes (`vercel.json`)
2. Finds deliveries in `scheduled` status >5 min past `deliver_at`
3. Uses `FOR UPDATE SKIP LOCKED` to prevent race conditions
4. Re-enqueues up to 100 stuck deliveries per run
5. Alerts if >10 stuck deliveries found (investigate threshold)
6. Tracks reconciliation rate against 0.1% SLO

**Monitoring**:
```sql
SELECT COUNT(*) FROM deliveries
WHERE status = 'scheduled'
  AND deliver_at < NOW() - INTERVAL '5 minutes'
```

If reconciliation rate > 0.1%, investigate primary job system.

### 3. Idempotency Keys

**Purpose**: Prevent duplicate sends on retry.

**Implementation**: `workers/inngest/functions/deliver-email.ts`

```typescript
const idempotencyKey = `delivery-${deliveryId}-attempt-${attemptCount}`

await resend.emails.send({
  // ... email options
  headers: {
    "X-Idempotency-Key": idempotencyKey
  }
})
```

**Key Points**:
- Format: `delivery-{uuid}-attempt-{number}`
- Unique per delivery attempt (not per delivery)
- Supported by Resend and Postmark
- Prevents duplicate emails if Inngest retries

### 4. Clerk User Sync (Hybrid Pattern)

**Purpose**: Ensure users are always synced between Clerk and database, even if webhooks fail.

**Implementation**: `apps/web/server/lib/auth.ts`

**Strategy**: Webhooks (primary) + Auto-sync fallback (resilient)

```typescript
export async function getCurrentUser() {
  const { userId: clerkUserId } = await clerkAuth()

  let user = await prisma.user.findUnique({
    where: { clerkUserId }
  })

  // Self-healing: Auto-create missing users
  if (!user) {
    const clerkUser = await clerkClient.users.getUser(clerkUserId)

    user = await prisma.user.create({
      data: {
        clerkUserId,
        email: clerkUser.primaryEmail,
        profile: { create: { timezone: "UTC" } }
      }
    })
  }

  return user
}
```

**Why This Approach**:
- ✅ Webhooks handle 99% of cases (efficient, real-time)
- ✅ Auth middleware catches missed users (self-healing)
- ✅ Works during development without webhook setup
- ✅ No manual intervention needed for existing users
- ✅ Resilient to webhook endpoint being down

**When to Keep Webhooks**:
- Production: Always use webhooks for real-time sync
- User deletion: Webhooks handle cleanup (letters, deliveries)
- User updates: Email changes synced automatically

**When Webhooks Are Optional**:
- Local development: Auto-sync covers missing users
- Small projects: If not expecting user deletions/updates frequently

**Sync Script**: For bulk migration or if webhooks weren't configured:
```bash
pnpm dotenv -e apps/web/.env.local -- tsx scripts/sync-clerk-user.ts
```

## Provider Abstraction Pattern

**Philosophy**: Never be locked into a single vendor.

**Email Providers** (`apps/web/server/providers/email/`):

```typescript
// Interface (interface.ts)
interface EmailProvider {
  send(options: EmailOptions): Promise<EmailResult>
  verifyDomain?(domain: string): Promise<DomainVerificationResult>
  getName(): string
}

// Factory (index.ts)
const provider = await getEmailProvider() // Uses feature flags
const result = await provider.send({ from, to, subject, html })

// Available implementations:
// - resend-provider.ts (primary)
// - postmark-provider.ts (fallback)
```

**Feature Flag Integration**:
```typescript
const usePostmark = await getFeatureFlag("use-postmark-email")
// Switches provider without code changes
```

**Future**: Same pattern for mail providers (Lob, ClickSend).

## Feature Flags System

**Implementation**: `apps/web/server/lib/feature-flags.ts`

**Available Flags**:
```typescript
type FeatureFlag =
  | "use-postmark-email"         // Switch to Postmark
  | "enable-arrive-by-mode"      // Arrive-by mail delivery
  | "enable-physical-mail"       // Lob integration
  | "enable-letter-templates"    // Template system
  | "use-clicksend-mail"         // ClickSend instead of Lob
  | "enable-client-encryption"   // Future E2EE
```

**Usage**:
```typescript
const enabled = await getFeatureFlag("enable-physical-mail", {
  userId: user.id  // Optional context for gradual rollout
})
```

**Backends**:
- **Production**: Unleash (requires `UNLEASH_API_URL` + `UNLEASH_API_TOKEN`)
- **Development**: Environment variables or hard-coded defaults
- **Cache**: 60-second in-memory cache

## Database Schema Highlights

### Letter Model (Encrypted)
```prisma
model Letter {
  id              String           @id @default(uuid())
  userId          String
  title           String
  bodyCiphertext  Bytes            // Encrypted JSON content
  bodyNonce       Bytes            // 96-bit nonce
  bodyFormat      String           // "rich" | "md" | "html"
  keyVersion      Int @default(1)  // Key rotation support
  visibility      LetterVisibility @default(private)
  tags            String[]
  // ... timestamps
}
```

**BREAKING CHANGE**: Old schema had `bodyRich` (Json) and `bodyHtml` (String). Now encrypted.

### Delivery Model
```prisma
model Delivery {
  id          String          @id @default(uuid())
  userId      String
  letterId    String
  channel     DeliveryChannel // email | mail
  status      DeliveryStatus  // scheduled | processing | sent | failed | canceled
  deliverAt   DateTime        // When to deliver (UTC)
  attemptCount Int @default(0)
  inngestRunId String?         // For correlation
  // ... email/mail specific fields
}
```

### Mail Delivery (Arrive-By Mode)
```prisma
enum MailDeliveryMode {
  send_on   // Letter mailed on specific date
  arrive_by // Letter arrives by specific date
}

model MailDelivery {
  deliveryId    String            @id
  deliveryMode  MailDeliveryMode  @default(send_on)
  targetDate    DateTime?         // User's desired arrival date
  sendDate      DateTime?         // Calculated send date (targetDate - transitDays - buffer)
  transitDays   Int?              // From Lob API
  // ... address, tracking fields
}
```

### Letter Templates (Planned)
```prisma
model LetterTemplate {
  id          String   @id @default(uuid())
  category    String   // "reflection" | "goal" | "gratitude" | "therapy"
  title       String   // "New Year's Reflection"
  description String   // "Reflect on your year..."
  promptText  String   // "What were your biggest wins this year?"
  placeholders Json    // { "wins": "biggest wins", "challenges": "..." }
  // ... timestamps
}
```

## Inngest Durable Workflows

**Pattern**: Sleep-until scheduled time, then send.

**Example**: `workers/inngest/functions/deliver-email.ts`

```typescript
export const deliverEmail = inngest.createFunction(
  { id: "deliver-email", retries: 5 },
  { event: "delivery.scheduled" },
  async ({ event, step }) => {
    // 1. Fetch delivery record
    const delivery = await step.run("fetch-delivery", async () => {
      return prisma.delivery.findUnique({ /* ... */ })
    })

    // 2. Sleep until delivery time
    await step.sleepUntil("wait-for-delivery-time", delivery.deliverAt)

    // 3. Decrypt letter content
    const { bodyHtml } = await step.run("decrypt-letter", async () => {
      return decryptLetter(
        delivery.letter.bodyCiphertext,
        delivery.letter.bodyNonce,
        delivery.letter.keyVersion
      )
    })

    // 4. Send with idempotency
    const result = await step.run("send-email", async () => {
      const idempotencyKey = `delivery-${deliveryId}-attempt-${delivery.attemptCount}`
      return (await getEmailProvider()).send({
        to: delivery.recipientEmail,
        html: bodyHtml,
        headers: { "X-Idempotency-Key": idempotencyKey }
      })
    })

    // 5. Update status
    await step.run("update-status", async () => {
      return prisma.delivery.update({
        where: { id: deliveryId },
        data: { status: result.success ? "sent" : "failed" }
      })
    })
  }
)
```

**Why Inngest**:
- Durable: survives server restarts
- Observable: built-in UI for debugging
- Retries: automatic with backoff
- Cancellable: can cancel before delivery time
- Testing: Inngest Dev Server for local testing

## Environment Variables (Critical)

**Required for Production**:
```bash
# Encryption (REQUIRED)
CRYPTO_MASTER_KEY=<base64-encoded-32-bytes>

# Database
DATABASE_URL=postgresql://...

# Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx

# Email
RESEND_API_KEY=re_xxx
EMAIL_FROM=no-reply@mail.capsulenote.com

# Jobs
INNGEST_SIGNING_KEY=signkey-prod-xxx
INNGEST_EVENT_KEY=test

# Payments
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Cache
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# Cron (for backstop reconciler)
CRON_SECRET=random_secret_string_here
```

**Optional Services**:
```bash
# Fallback email provider
POSTMARK_SERVER_TOKEN=xxx

# Physical mail providers
LOB_API_KEY=test_xxx
CLICKSEND_USERNAME=your_username
CLICKSEND_API_KEY=xxx

# Feature flags
UNLEASH_API_URL=https://unleash.yourcompany.com/api
UNLEASH_API_TOKEN=xxx

# Analytics
POSTHOG_API_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx

# Observability
OTEL_EXPORTER_OTLP_ENDPOINT=https://api.axiom.co/v1/traces
SENTRY_DSN=https://xxx@sentry.io/xxx
```

**Validation**: Environment variables are validated at build time using Zod (`apps/web/env.mjs`).

## Development Workflow

### First-Time Setup
```bash
git clone <repo>
cd capsulenote
pnpm install

# Set up environment
cp apps/web/.env.example apps/web/.env.local
# Generate encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# Add key to .env.local as CRYPTO_MASTER_KEY
# Add other API keys (Clerk, Resend, Stripe, etc.)

# Set up database
pnpm db:generate
pnpm db:push  # or pnpm db:migrate for interactive mode

# Seed database with pricing plans (optional)
pnpm db:seed

# Set up local webhooks (Stripe + Resend)
./scripts/setup-local-webhooks.sh
# Follow prompts to authenticate Stripe CLI and ngrok

# Start development
pnpm dev
# Web app: http://localhost:3000
# Inngest UI: http://localhost:8288
```

### Local Webhook Testing

**Quick Start**: See `docs/WEBHOOK_TESTING_QUICK_START.md`

**Full Guide**: See `docs/LOCAL_WEBHOOK_TESTING.md`

**Daily workflow** (4 terminals):
```bash
# Terminal 1: Next.js + Inngest
pnpm dev

# Terminal 2: Stripe webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Terminal 3: ngrok (for Resend)
ngrok http 3000

# Terminal 4: Testing
stripe trigger payment_intent.succeeded
```

### Making Changes

**Database Schema Changes**:
```bash
# 1. Edit packages/prisma/schema.prisma
# 2. Generate client
pnpm db:generate
# 3. Create migration
pnpm db:migrate
# Migration name: describe change (e.g., "add_letter_templates")
```

**Adding Feature Flags**:
```typescript
// 1. Add to type in apps/web/server/lib/feature-flags.ts
type FeatureFlag = /* ... */ | "new-feature"

// 2. Add default in getDefaultFlagValue()
case "new-feature": return false

// 3. Use in code
const enabled = await getFeatureFlag("new-feature")
```

**Adding Email Provider**:
```typescript
// 1. Create apps/web/server/providers/email/new-provider.ts
export class NewEmailProvider implements EmailProvider {
  async send(options: EmailOptions): Promise<EmailResult> { /* ... */ }
  getName(): string { return "NewProvider" }
}

// 2. Update factory in index.ts
const useNew = await getFeatureFlag("use-new-email")
if (useNew) return new NewEmailProvider()
```

### Testing (Not Yet Implemented)

**Planned Test Coverage**:
- Unit: Encryption roundtrip, timezone conversions, DST handling
- Integration: Server Actions, Inngest jobs, webhooks
- E2E: Full user journey (Playwright)

**Test Commands** (future):
```bash
pnpm test              # All tests
pnpm test:unit         # Vitest unit tests
pnpm test:e2e          # Playwright E2E tests
pnpm test:watch        # Watch mode
```

## Deployment (Vercel)

**Deployment Checklist**:
1. Set all required environment variables in Vercel
2. Generate `CRYPTO_MASTER_KEY` and store securely
3. Configure Vercel Cron for backstop reconciler
4. Set up Neon Postgres production database
5. Configure Clerk production instance
6. Set up Stripe production webhooks
7. Verify Resend domain authentication

**Vercel Cron Configuration** (`vercel.json`):
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

**Branch Previews**: Neon branch databases automatically created for preview deployments.

## Implementation Status

**✅ Completed (15/20 features)**:
- Letter content encryption (AES-256-GCM) with key rotation support
- Backstop reconciler cron job (fully functional)
- Idempotency keys for delivery
- Email provider abstraction layer
- Postmark fallback provider
- Feature flags system (Unleash integration)
- All environment variables configured
- Database schema updates (encryption, arrive-by, templates)
- Inngest decryption flow
- **GDPR DSR flows** (data export + account deletion)
- **Rate limiting** (Upstash Redis, tiered limits)
- **React 19.2.0** (stable upgrade completed)
- **Database migration procedures** (documented)
- **Encryption key rotation** (full procedures documented)
- **Payment confirmation emails**

**🟡 Partially Completed (2/20)**:
- Letter templates (schema ready, UI pending)
- Arrive-by mode (schema ready, calculation logic pending)

**❌ Not Started (3/20)**:
- DST safety checks
- ClickSend mail provider
- OpenTelemetry tracing + Sentry
- PostHog analytics
- Comprehensive E2E test coverage

**📚 See `ENTERPRISE_IMPROVEMENTS.md` for latest updates and detailed audit.**

## SLO Targets

| Metric | Target | Current Status |
|--------|--------|----------------|
| On-time delivery | 99.95% within ±60s | ✅ Inngest + Backstop |
| Bounce rate | < 0.3% | ✅ Resend + Domain auth |
| Complaint rate | < 0.05% | ✅ Resend webhooks |
| Reconciliation rate | < 0.1% | ✅ Backstop monitoring |
| Encryption overhead | < 100ms p95 | ✅ Web Crypto API |

## Common Pitfalls

1. **Forgetting to decrypt**: List views should NOT decrypt (performance). Detail views MUST decrypt.

2. **Missing idempotency keys**: Always include in email sends to prevent duplicates on retry.

3. **Timezone confusion**: All `deliverAt` times stored in UTC. User's timezone in `profiles.timezone`.

4. **Feature flag caching**: 60-second cache means changes can take up to 1 minute to apply.

5. **Database migrations**: Always run `pnpm db:generate` after schema changes before running app.

6. **Environment validation**: Build will fail if required env vars missing. Use `SKIP_ENV_VALIDATION=true` only in CI.

7. **Encryption key rotation**: When rotating keys, increment `keyVersion` but keep old keys accessible for decryption.

8. **Database seeding**: All database scripts (`db:generate`, `db:push`, `db:migrate`, `db:seed`, `db:studio`) automatically load environment variables from `apps/web/.env.local` using `dotenv-cli`. The seed script requires `STRIPE_PRICE_DIGITAL_ANNUAL` and `STRIPE_PRICE_PAPER_ANNUAL` to be set in `.env.local` to seed pricing plans.

## File Naming Conventions

- **Components**: PascalCase (`LetterCard.tsx`)
- **Utilities**: kebab-case (`feature-flags.ts`)
- **Server Actions**: kebab-case (`letters.ts` exports `createLetter()`)
- **API Routes**: kebab-case folders (`/api/cron/reconcile-deliveries/route.ts`)
- **Types**: PascalCase (`EmailProvider`, `DeliveryStatus`)
- **Database**: snake_case (Prisma `@map` to camelCase in TypeScript)

## Key Files to Understand

**Security**:
- `apps/web/server/lib/encryption.ts` - Encryption utilities
- `apps/web/app/api/cron/reconcile-deliveries/route.ts` - Backstop reconciler
- `apps/web/env.mjs` - Environment validation

**Business Logic**:
- `apps/web/server/actions/letters.ts` - Letter CRUD with encryption
- `workers/inngest/functions/deliver-email.ts` - Email delivery workflow
- `apps/web/server/providers/email/index.ts` - Provider abstraction

**Infrastructure**:
- `packages/prisma/schema.prisma` - Database schema
- `apps/web/server/lib/feature-flags.ts` - Feature flag system
- `vercel.json` - Cron configuration

## Getting Help

**Documentation**:
- See `PHASE_IMPLEMENTATION.md` for implementation status
- See `apps/web/.env.example` for all environment variables
- See `README.md` for basic setup

**Debugging**:
- Inngest Dev UI: http://localhost:8288 (view job status, retry, replay)
- Prisma Studio: `pnpm db:studio` (view database records)
- Feature flags: Check cache TTL if changes not applying

**Common Issues**:
- "Encryption key not found" → Set `CRYPTO_MASTER_KEY` in `.env.local`
- "Prisma Client not generated" → Run `pnpm db:generate`
- "Migration failed" → Check database connection, run `pnpm db:push` for dev
- "Cron unauthorized" → Set `CRON_SECRET` and pass in `Authorization` header
