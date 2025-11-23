# DearMe Development Guide

## Getting Started

### Prerequisites

- Node.js 18.17+ (use nvm: `nvm use`)
- pnpm 8+
- Docker (optional, for local Postgres)

### Initial Setup

```bash
# Install dependencies
pnpm install

# Copy environment file
cp apps/web/.env.example apps/web/.env.local

# Fill in your environment variables
# See .env.example for required values
```

### Database Setup

#### Option 1: Neon (Recommended)
1. Create a free database at [Neon](https://neon.tech)
2. Copy connection string to `DATABASE_URL`

#### Option 2: Local Postgres
```bash
# Start Postgres with Docker
docker run --name dearme-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=dearme \
  -p 5432:5432 \
  -d postgres:15

# Set DATABASE_URL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dearme"
```

### Apply Database Schema

```bash
# Generate Prisma Client
pnpm db:generate

# Push schema to database (development)
pnpm db:push

# OR create migration (production-ready)
pnpm db:migrate
```

### Seeding Capsule Note plans

Prereqs: set `STRIPE_PRICE_DIGITAL_ANNUAL` and `STRIPE_PRICE_PAPER_ANNUAL` (and optional add-on price IDs) in `apps/web/.env.local`.

```bash
pnpm --filter prisma db:seed
```

### Run Development Server

```bash
# Start all apps
pnpm dev

# Or run specific app
pnpm --filter web dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
dearme/
├── apps/
│   └── web/              # Next.js 15 application
│       ├── app/          # App Router pages
│       │   ├── (marketing)/   # Public pages
│       │   ├── (app)/         # Authenticated pages
│       │   └── api/           # API routes & webhooks
│       ├── components/   # React components
│       ├── server/       # Server-side code
│       │   ├── actions/  # Server Actions
│       │   ├── lib/      # Server utilities
│       │   └── providers/# External service clients
│       ├── lib/          # Client-safe utilities
│       ├── hooks/        # React hooks
│       └── styles/       # Global styles
├── packages/
│   ├── prisma/          # Database schema & client
│   ├── types/           # Shared TypeScript types & Zod schemas
│   ├── ui/              # Shared UI components
│   └── config/          # Shared configuration
└── workers/
    └── inngest/         # Background job functions
```

## Key Technologies

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Component library
- **TipTap** - Rich text editor

### Backend
- **Prisma** - ORM for database access
- **Clerk** - Authentication
- **Server Actions** - Type-safe mutations

### Infrastructure
- **Neon** - Serverless Postgres
- **Inngest** - Durable job scheduling
- **Resend** - Transactional email
- **Stripe** - Payments & subscriptions
- **Upstash Redis** - Caching & rate limiting
- **Lob** - Physical mail delivery (optional)

## Development Workflow

### Creating a New Feature

1. **Create a new branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make changes**
   - Update database schema if needed (edit `packages/prisma/schema.prisma`)
   - Create Server Actions in `server/actions/`
   - Add UI components in `components/`
   - Create pages in `app/`

3. **Run migrations**
   ```bash
   pnpm db:migrate
   ```

4. **Test your changes**
   ```bash
   pnpm dev
   ```

5. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   git push origin feature/your-feature-name
   ```

### Database Changes

```bash
# After editing schema.prisma

# Development: push changes directly
pnpm db:push

# Production: create migration
pnpm db:migrate

# View database in GUI
pnpm db:studio
```

### Adding a New Package

```bash
# Add to workspace root
pnpm add <package> -w

# Add to specific workspace
pnpm add <package> --filter web
```

### Code Quality

```bash
# Format code
pnpm format

# Run linter
pnpm lint

# Type check
pnpm typecheck

# Run all checks
pnpm format && pnpm lint && pnpm typecheck
```

## Testing

### Unit Tests (Coming Soon)
```bash
pnpm test
```

### E2E Tests (Coming Soon)
```bash
pnpm test:e2e
```

## Debugging

### Server Actions
Server Actions run on the server, so use `console.log()` and check terminal output.

### Database Queries
Enable Prisma query logging in `packages/prisma/index.ts`:
```typescript
log: ["query", "error", "warn"]
```

### Webhooks
Use webhook testing tools:
- [Svix Webhook Tester](https://www.svix.com/play/)
- [webhook.site](https://webhook.site)

### Inngest Functions
1. Visit [Inngest Dev Server](http://localhost:8288) when running `pnpm dev`
2. Trigger functions manually
3. View execution logs

## Common Tasks

### Add a New shadcn/ui Component
```bash
cd apps/web
npx shadcn-ui@latest add <component-name>
```

### Update Dependencies
```bash
pnpm up --latest --recursive
```

### Reset Database
```bash
# WARNING: This will delete all data!
pnpm db:push --force-reset
```

### Generate TypeScript Types from Prisma
```bash
pnpm db:generate
```

## Environment Variables

Required variables for development:

```env
# Database
DATABASE_URL=postgresql://...

# Clerk (get from https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
CLERK_WEBHOOK_SECRET=whsec_xxx

# Stripe (get from https://dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_PRO_MONTHLY=price_xxx
STRIPE_PRICE_PRO_ANNUAL=price_xxx

# Resend (get from https://resend.com)
RESEND_API_KEY=re_xxx

# Inngest
INNGEST_SIGNING_KEY=signkey-test-xxx
INNGEST_EVENT_KEY=test

# Upstash Redis (get from https://upstash.com)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# Optional: Lob
LOB_API_KEY=test_xxx
```

## Architecture Decisions

### Why Server Actions?
- Type-safe mutations without API routes
- Automatic revalidation
- Built-in error handling
- Direct database access from components

### Why Inngest?
- Durable execution (survives crashes)
- Built-in retries
- Step functions for complex workflows
- Great DX with local dev server

### Why Clerk?
- Drop-in authentication
- Beautiful pre-built UI
- Webhooks for sync
- Multiple OAuth providers

### Why Neon?
- Serverless Postgres (autoscaling)
- Branch databases per PR
- Excellent free tier
- Fast cold starts

## Troubleshooting

### "Prisma Client not generated"
```bash
pnpm db:generate
```

### "Environment variables validation failed"
Check `apps/web/env.mjs` and ensure all required variables are set in `.env.local`

### Webhook not receiving events
1. Use ngrok or similar for local development
2. Update webhook URLs in service dashboards
3. Check webhook secrets match

### Inngest functions not appearing
1. Ensure `INNGEST_SIGNING_KEY` is set
2. Check Inngest dev server at http://localhost:8288
3. Verify functions are exported in `workers/inngest/index.ts`

## Best Practices

### Server Components
- Use Server Components by default
- Add `"use client"` only when needed (interactivity, hooks)
- Fetch data directly in Server Components

### Database Queries
- Always include error handling
- Use transactions for multi-step operations
- Add indexes for frequently queried fields

### Error Handling
- Use try/catch in Server Actions
- Return `{ success: boolean, error?: string }` from actions
- Show user-friendly error messages with toast

### Type Safety
- Use Zod for runtime validation
- Export types from shared packages
- Avoid `any` types

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Inngest Documentation](https://www.inngest.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)

## Getting Help

- Check existing issues
- Review documentation
- Ask in discussions
- Create detailed bug reports
