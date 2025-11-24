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

import { redirect } from "@/i18n/routing"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/server/lib/db"
import { AuditLogTable } from "./_components/audit-log-table"
import { AuditLogFilters } from "./_components/audit-log-filters"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Audit Log | Admin | Capsule Note",
  description: "View system audit logs for compliance and monitoring",
  robots: { index: false, follow: false },
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
        <h1 className="text-3xl font-bold tracking-tight">Audit Log</h1>
        <p className="text-muted-foreground">
          Monitor system events for compliance and security analysis
        </p>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Statistics</CardTitle>
          <CardDescription>
            Showing {events.length} of {totalCount} total events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Total Events</p>
              <p className="text-2xl font-bold">{totalCount.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Current Page</p>
              <p className="text-2xl font-bold">
                {page} / {totalPages}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Filters Active</p>
              <p className="text-2xl font-bold">
                {Object.keys(searchParams).filter((k) => k !== "page").length}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Retention Period</p>
              <p className="text-2xl font-bold">7 years</p>
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
