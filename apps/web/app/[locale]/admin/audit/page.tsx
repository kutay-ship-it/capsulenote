/**
 * Admin Audit Log Viewer
 *
 * View all audit events across the system for monitoring and compliance.
 *
 * Security:
 * - Admin-only access (TODO: Add admin middleware)
 * - Read-only view (no delete capability)
 * - Filters by event type, user, and date range
 *
 * @module app/admin/audit
 */

import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/server/lib/db"
import { AuditLogTable } from "./_components/audit-log-table"
import { AuditLogFilters } from "./_components/audit-log-filters"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  const t = await getTranslations("admin.audit")
  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
    robots: { index: false, follow: false },
  }
}

interface PageProps {
  searchParams: {
    type?: string
    userId?: string
    startDate?: string
    endDate?: string
    page?: string
  }
}

export default async function AdminAuditPage({ searchParams }: PageProps) {
  const { userId: clerkUserId, sessionClaims } = await auth()
  if (!clerkUserId) {
    redirect("/dashboard")
  }

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true, email: true },
  })

  const allowlist =
    process.env.ADMIN_EMAILS?.split(",").map((email) => email.trim().toLowerCase()).filter(Boolean) ?? []

  const hasAdminRole = sessionClaims?.metadata?.role === "admin"
  const isAllowlisted = user?.email ? allowlist.includes(user.email.toLowerCase()) : false

  if (!hasAdminRole && !isAllowlisted) {
    redirect("/dashboard")
  }

  const t = await getTranslations("admin.audit")

  const page = parseInt(searchParams.page || "1", 10)
  const limit = 50
  const offset = (page - 1) * limit

  // Build filter conditions
  const where: any = {}
  if (searchParams.type) {
    where.type = searchParams.type
  }
  if (searchParams.userId) {
    where.userId = searchParams.userId
  }
  if (searchParams.startDate || searchParams.endDate) {
    where.createdAt = {}
    if (searchParams.startDate) {
      where.createdAt.gte = new Date(searchParams.startDate)
    }
    if (searchParams.endDate) {
      where.createdAt.lte = new Date(searchParams.endDate)
    }
  }

  // Fetch audit events
  const [events, totalCount] = await Promise.all([
    prisma.auditEvent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    }),
    prisma.auditEvent.count({ where }),
  ])

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <div className="container mx-auto max-w-7xl py-8 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t("heading")}</h1>
        <p className="text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t("stats.title")}</CardTitle>
          <CardDescription>
            {t("stats.description", { count: events.length, total: totalCount })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{t("stats.totalEvents")}</p>
              <p className="text-2xl font-bold">{totalCount.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{t("stats.currentPage")}</p>
              <p className="text-2xl font-bold">
                {page} / {totalPages}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{t("stats.filtersActive")}</p>
              <p className="text-2xl font-bold">
                {Object.keys(searchParams).filter((k) => k !== "page").length}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{t("stats.retentionPeriod")}</p>
              <p className="text-2xl font-bold">{t("stats.years", { count: 7 })}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <AuditLogFilters />

      {/* Audit Log Table */}
      <AuditLogTable
        events={events.map((e) => ({
          id: e.id,
          userId: e.userId,
          userEmail: e.user?.email || null,
          type: e.type,
          data: e.data,
          ipAddress: e.ipAddress,
          userAgent: e.userAgent,
          createdAt: e.createdAt,
        }))}
        currentPage={page}
        totalPages={totalPages}
      />
    </div>
  )
}
