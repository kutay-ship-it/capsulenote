# Prisma Migrations

This directory contains database migrations for the CapsuleNote application.

## ⚠️ IMPORTANT: Initializing Migrations

Migrations have not been initialized yet. Before deploying to production, you MUST:

### Step 1: Initialize Migrations (Development)

```bash
# From project root
cd packages/prisma

# Generate initial migration (requires DATABASE_URL to be set)
pnpm prisma migrate dev --name initial_schema

# This will:
# 1. Connect to your development database
# 2. Generate migration files based on schema.prisma
# 3. Apply the migration to create all tables
# 4. Generate Prisma Client
```

### Step 2: Verify Migration

```bash
# Check migration status
pnpm prisma migrate status

# Expected output: "Database schema is up to date!"
```

### Step 3: Production Deployment

```bash
# Deploy migrations to production (Vercel, Railway, etc.)
pnpm prisma migrate deploy

# This applies pending migrations without prompting
```

## Migration Workflow

### Creating New Migrations

When you modify `schema.prisma`:

```bash
# 1. Update schema.prisma with your changes
# 2. Generate migration
pnpm prisma migrate dev --name descriptive_name

# Example names:
# - add_letter_templates
# - add_delivery_indexes
# - add_key_rotation_fields
```

### Migration Best Practices

1. **Always review generated SQL** before committing
2. **Test migrations** on a staging database first
3. **Backup production** before applying migrations
4. **Never edit existing migrations** - create new ones instead
5. **Keep migrations small** and focused on one change

## Database Schema Overview

Current schema includes:

- **Users & Profiles** - User accounts with Clerk integration
- **Letters** - Encrypted letter content (AES-256-GCM)
- **Deliveries** - Scheduled email/mail deliveries
- **Subscriptions** - Stripe billing integration
- **Audit Events** - Compliance audit trail

## Common Issues

### "Migration history mismatch"

If you see this error, it means migrations were generated on a different database. Solutions:

1. **Development**: Reset database with `pnpm prisma migrate reset`
2. **Production**: Contact team lead - requires careful resolution

### "Unable to connect to database"

Ensure `DATABASE_URL` is set in your `.env.local` file:

```bash
DATABASE_URL="postgresql://user:pass@host:5432/dbname?sslmode=require"
```

### "Migration failed to apply"

1. Check migration SQL for errors
2. Verify database permissions
3. Check for constraint violations
4. Review Prisma logs

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Run migrations
  run: pnpm prisma migrate deploy
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

### Vercel

Migrations run automatically during build if `prisma generate` is in the build command.

## Security Notes

- **Never commit** `.env` files with real credentials
- **Use separate databases** for dev/staging/production
- **Rotate credentials** regularly
- **Backup before migrations** in production

## Need Help?

- Prisma Docs: https://www.prisma.io/docs/concepts/components/prisma-migrate
- Team Wiki: [Link to your internal docs]
- Slack: #engineering channel
