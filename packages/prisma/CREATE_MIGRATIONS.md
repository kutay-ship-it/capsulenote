# Creating Database Migrations

## Current Status

The project has been using `prisma db push` for schema changes, which **does not create migration files**. This means:
- ❌ No migration history tracked
- ❌ Cannot rollback schema changes
- ❌ Difficult to deploy schema changes safely in production

## Migration Strategy

### Option 1: Baseline Migration (Recommended for Existing Database)

If you already have a production database with data:

```bash
# 1. Ensure .env.local has DATABASE_URL set
cp apps/web/.env.example apps/web/.env.local
# Edit .env.local and add your DATABASE_URL

# 2. Create baseline migration (marks current schema as migrated)
cd packages/prisma
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel schema.prisma \
  --script > migrations/0_init/migration.sql

# Create migration.lock file
echo "# Prisma Migrate lockfile v1" > migrations/migration_lock.toml
echo "# Created manually for baseline" >> migrations/migration_lock.toml
echo "provider = \"postgresql\"" >> migrations/migration_lock.toml

# 3. Mark migration as applied (without running SQL)
npx prisma migrate resolve --applied 0_init

# 4. Verify
npx prisma migrate status
```

### Option 2: Fresh Start (New Database)

If starting fresh or can rebuild the database:

```bash
# 1. Create initial migration
cd packages/prisma
npx prisma migrate dev --name initial_migration

# This will:
# - Create migrations/[timestamp]_initial_migration/
# - Generate migration.sql
# - Apply migration to database
# - Update Prisma Client
```

### Option 3: Using pnpm (from project root)

```bash
# Set environment variables
export DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Create migration
pnpm db:migrate

# Or create migration without applying (create-only)
cd packages/prisma
npx prisma migrate dev --name migration_name --create-only
```

## Future Workflow

After baseline migration is created, use this workflow for all schema changes:

### Step 1: Edit Schema
```bash
# Edit packages/prisma/schema.prisma
# Make your changes (add fields, tables, indexes, etc.)
```

### Step 2: Create Migration
```bash
cd packages/prisma

# Development: Creates + applies migration
npx prisma migrate dev --name describe_your_change

# Example names:
# - add_letter_attachments
# - add_user_preferences
# - add_index_on_deliveries_status
```

### Step 3: Review Migration SQL
```bash
# Check the generated SQL
cat migrations/[timestamp]_describe_your_change/migration.sql

# Verify it does what you expect
# Check for data loss warnings
```

### Step 4: Commit Migration
```bash
git add packages/prisma/migrations/
git add packages/prisma/schema.prisma
git commit -m "feat: add_letter_attachments migration"
```

### Step 5: Production Deployment

**IMPORTANT: Test migrations on staging first!**

```bash
# On production server
cd packages/prisma

# Apply pending migrations (non-interactive)
npx prisma migrate deploy

# This will:
# - Apply all pending migrations
# - Skip creation of new migrations
# - Exit with error if migration fails
```

## Migration Best Practices

### 1. Always Create Migrations for Schema Changes

❌ **Never use `prisma db push` in production**
✅ **Always use `prisma migrate dev` in development**
✅ **Always use `prisma migrate deploy` in production**

### 2. Write Descriptive Migration Names

❌ Bad: `migration_1`, `update`, `fix`
✅ Good: `add_user_email_verification`, `add_index_deliveries_status`

### 3. Review SQL Before Committing

```bash
# Always review the generated SQL
cat migrations/[latest]/migration.sql

# Look for:
# - Data loss (DROP COLUMN, DROP TABLE)
# - Performance issues (adding indexes to large tables)
# - Missing default values for NOT NULL columns
```

### 4. Handle Data Migrations

For complex changes that require data transformation:

```bash
# 1. Create schema migration
npx prisma migrate dev --name add_new_field --create-only

# 2. Edit migration.sql to add data transformation
# Example: Populate new field from existing data
# UPDATE users SET new_field = old_field WHERE new_field IS NULL;

# 3. Apply migration
npx prisma migrate dev
```

### 5. Zero-Downtime Migrations

For production with zero downtime:

```typescript
// Example: Renaming a column

// Step 1: Add new column (migration 1)
// ALTER TABLE users ADD COLUMN new_name VARCHAR;

// Step 2: Dual writes (code update 1)
// - Write to both old_name and new_name
// - Read from old_name (fallback to new_name)

// Step 3: Backfill data (migration 2)
// UPDATE users SET new_name = old_name WHERE new_name IS NULL;

// Step 4: Switch reads (code update 2)
// - Read from new_name (fallback to old_name)
// - Still write to both

// Step 5: Remove old column (migration 3)
// ALTER TABLE users DROP COLUMN old_name;
```

### 6. Testing Migrations

**Before deploying to production:**

```bash
# 1. Create staging database with production snapshot
pg_dump production_db | psql staging_db

# 2. Test migration on staging
cd packages/prisma
DATABASE_URL="staging_url" npx prisma migrate deploy

# 3. Verify application works with new schema

# 4. Benchmark query performance if changes affect indexes

# 5. Only then deploy to production
```

## Rollback Strategy

### Undo Last Migration (Development Only)

```bash
# Reset last migration (drops and recreates database)
npx prisma migrate reset

# Or manually:
npx prisma migrate resolve --rolled-back [migration_name]
```

### Rollback in Production

**Migrations cannot be automatically rolled back in production!**

You must create a new "reverse" migration:

```bash
# Example: Rolled back add_user_preferences

# 1. Create new migration that undoes the change
npx prisma migrate dev --name rollback_user_preferences --create-only

# 2. Manually write SQL that reverses the change
# migration.sql:
# DROP TABLE user_preferences;

# 3. Apply the rollback migration
npx prisma migrate deploy
```

## Common Issues

### Issue: "Database schema is not in sync"

```bash
# Solution: Reset development database
npx prisma migrate reset

# Or in production: apply pending migrations
npx prisma migrate deploy
```

### Issue: "Migration failed to apply"

```bash
# 1. Check the error message
# 2. Fix the migration SQL if needed
# 3. Mark as rolled back
npx prisma migrate resolve --rolled-back [migration_name]

# 4. Create corrected migration
npx prisma migrate dev --name [corrected_name]
```

### Issue: "Unique constraint violation during migration"

```typescript
// In migration SQL, handle existing data:

-- Check for duplicates first
SELECT email, COUNT(*) FROM users GROUP BY email HAVING COUNT(*) > 1;

-- Add unique constraint only if no duplicates
-- Or clean up duplicates first
DELETE FROM users a USING users b
WHERE a.id > b.id AND a.email = b.email;

ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Database Migration Check

on:
  pull_request:
    paths:
      - 'packages/prisma/schema.prisma'
      - 'packages/prisma/migrations/**'

jobs:
  check-migrations:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Install dependencies
        run: pnpm install

      - name: Check migration status
        run: |
          cd packages/prisma
          npx prisma migrate diff \
            --from-migrations ./migrations \
            --to-schema-datamodel schema.prisma \
            --exit-code
        env:
          DATABASE_URL: "postgresql://user:pass@localhost:5432/test"
```

## Monitoring

### Production Migration Monitoring

```bash
# Check migration status
npx prisma migrate status

# Expected output:
# Database schema is up to date!
# No pending migrations found.
```

### Set Up Alerts

Monitor for:
- ✅ Migration success/failure in deployment logs
- ✅ Database connection errors
- ✅ Schema drift (unexpected changes)
- ✅ Long-running migrations (> 30 seconds)

## Next Steps

1. **Create baseline migration** using Option 1 above
2. **Commit migration files** to git
3. **Update deployment pipeline** to run `prisma migrate deploy`
4. **Document migration process** in team wiki/runbook
5. **Set up migration monitoring** in production

## Resources

- [Prisma Migrate Docs](https://www.prisma.io/docs/orm/prisma-migrate)
- [Zero-Downtime Migrations](https://www.prisma.io/docs/guides/migrate/production-troubleshooting)
- [Migration Troubleshooting](https://www.prisma.io/docs/guides/migrate/production-troubleshooting)
