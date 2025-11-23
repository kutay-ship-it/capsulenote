# DearMe — Write Letters to Your Future Self

A durable, privacy-first platform for scheduling messages to your future self via email or physical mail.

## Architecture

- **Frontend**: Next.js 15 (App Router, Server Components) + shadcn/ui + Tailwind
- **Auth**: Clerk (OAuth, email, passkeys)
- **Database**: Neon Postgres + Prisma ORM
- **Jobs**: Inngest (durable scheduling & workflows)
- **Email**: Resend + React Email
- **Payments**: Stripe Billing + Checkout
- **Cache**: Upstash Redis
- **Physical Mail**: Lob API (optional)

## Getting Started

### Prerequisites

- Node.js 18.17+
- pnpm 8+
- Neon Postgres database
- Clerk account
- Stripe account (for payments)
- Resend account (for email)

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp apps/web/.env.example apps/web/.env.local
# Fill in your API keys

# Generate Prisma client
pnpm db:generate

# Push database schema
pnpm db:push

# Seed the database (optional)
pnpm db:seed

# Run development server
pnpm dev
```

## Project Structure

```
apps/
  web/                 # Next.js 15 application
packages/
  prisma/             # Database schema & migrations
  ui/                 # Shared UI components
  config/             # Shared configs (ESLint, TypeScript)
  types/              # Shared TypeScript types & Zod schemas
workers/
  inngest/            # Inngest job functions
```

## Key Features

- ✍️ Rich text editor for letter composition
- 📅 Timezone-aware delivery scheduling
- 📧 Email delivery via Resend
- 📮 Optional physical mail via Lob
- 💳 Subscription management via Stripe
- 🔒 Privacy-first design with optional encryption
- 📊 Full audit logging

## Environment Variables

See `apps/web/.env.example` for required configuration.

## Database

```bash
# Generate Prisma client after schema changes
pnpm db:generate

# Apply migrations to development
pnpm db:migrate

# Push schema changes (development only)
pnpm db:push

# Open Prisma Studio
pnpm db:studio
```

## Development

```bash
# Run all apps
pnpm dev

# Run specific app
pnpm --filter web dev

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Format code
pnpm format
```

## Testing

```bash
# Run all tests
pnpm test

# Run specific package tests
pnpm --filter web test
```

## Deployment

The application is designed to deploy on Vercel with:
- Neon Postgres (production + preview branches)
- Vercel Cron for backstop job reconciliation
- Edge runtime for static/marketing pages
- Node runtime for webhooks & job handlers

## License

Proprietary
