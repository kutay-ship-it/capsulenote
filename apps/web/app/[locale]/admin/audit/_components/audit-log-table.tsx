/**
 * Audit Log Table Component
 *
 * Displays audit events in a sortable, filterable table.
 */

"use client"

import { useState } from "react"
import { Link } from "@/i18n/routing"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Eye } from "lucide-react"
import { format } from "date-fns"
import { useTranslations } from "next-intl"

interface AuditEvent {
  id: string
  userId: string | null
  userEmail: string | null
  type: string
  data: any
  ipAddress: string | null
  userAgent: string | null
  createdAt: Date
}

interface AuditLogTableProps {
  events: AuditEvent[]
  currentPage: number
  totalPages: number
}

export function AuditLogTable({ events, currentPage, totalPages }: AuditLogTableProps) {
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null)
  const t = useTranslations("admin.audit.table")
  const tDetails = useTranslations("admin.audit.eventDetails")

  const getEventTypeColor = (type: string) => {
    if (type.startsWith("gdpr")) return "destructive"
    if (type.startsWith("security")) return "destructive"
    if (type.startsWith("admin")) return "secondary"
    if (type.includes("failed")) return "destructive"
    if (type.includes("succeeded")) return "default"
    return "outline"
  }

  const getEventTypeLabel = (type: string) => {
    return type.replace(/\./g, " ").replace(/_/g, " ").toUpperCase()
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("timestamp")}</TableHead>
              <TableHead>{t("eventType")}</TableHead>
              <TableHead>{t("user")}</TableHead>
              <TableHead>{t("ipAddress")}</TableHead>
              <TableHead className="text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  {t("noEvents")}
                </TableCell>
              </TableRow>
            ) : (
              events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="font-mono text-xs">
                    {format(new Date(event.createdAt), "MMM dd, yyyy HH:mm:ss")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getEventTypeColor(event.type)}>
                      {getEventTypeLabel(event.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {event.userEmail ? (
                      <Link
                        href={`/admin/users/${event.userId}`}
                        className="text-sm hover:underline"
                      >
                        {event.userEmail}
                      </Link>
                    ) : (
                      <span className="text-sm text-muted-foreground">{t("system")}</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {event.ipAddress || t("notAvailable")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {t("details")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t("pagination.pageOf", { current: currentPage, total: totalPages })}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            asChild
          >
            <Link href={`/admin/audit?page=${currentPage - 1}`}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t("pagination.previous")}
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            asChild
          >
            <Link href={`/admin/audit?page=${currentPage + 1}`}>
              {t("pagination.next")}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{tDetails("title")}</DialogTitle>
            <DialogDescription>
              {tDetails("description", { id: selectedEvent?.id })}
            </DialogDescription>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{tDetails("eventId")}</p>
                  <p className="font-mono text-sm">{selectedEvent.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{tDetails("eventType")}</p>
                  <Badge variant={getEventTypeColor(selectedEvent.type)}>
                    {getEventTypeLabel(selectedEvent.type)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{tDetails("timestamp")}</p>
                  <p className="text-sm">
                    {format(new Date(selectedEvent.createdAt), "PPpp")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{tDetails("user")}</p>
                  <p className="text-sm">{selectedEvent.userEmail || t("system")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{tDetails("ipAddress")}</p>
                  <p className="font-mono text-sm">{selectedEvent.ipAddress || t("notAvailable")}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{tDetails("userAgent")}</p>
                  <p className="font-mono text-xs truncate">
                    {selectedEvent.userAgent || t("notAvailable")}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">{tDetails("eventData")}</p>
                <pre className="p-4 rounded-lg bg-muted text-xs overflow-x-auto">
                  {JSON.stringify(selectedEvent.data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
