import { PrismaClient } from "@prisma/client"

/**
 * Prisma Client singleton for database access
 *
 * Neon Connection Pooling:
 * For production deployments using Neon Postgres, ensure DATABASE_URL uses
 * the pooler endpoint (hostname contains `-pooler.`) to prevent connection
 * pile-up in serverless environments:
 *
 *   postgresql://user:pass@ep-xxx-pooler.region.neon.tech/db?sslmode=require
 *
 * The pooler endpoint automatically handles connection pooling via PgBouncer.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

export * from "@prisma/client"
