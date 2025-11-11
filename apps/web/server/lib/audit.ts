import { prisma } from "./db"

interface CreateAuditEventOptions {
  userId?: string
  type: string
  data?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

export async function createAuditEvent({
  userId,
  type,
  data = {},
  ipAddress,
  userAgent,
}: CreateAuditEventOptions) {
  return prisma.auditEvent.create({
    data: {
      userId,
      type,
      data: data as Record<string, never>, // Type assertion to satisfy Prisma JsonValue
      ipAddress,
      userAgent,
    },
  })
}
