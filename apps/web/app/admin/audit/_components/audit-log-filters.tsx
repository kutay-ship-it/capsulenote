/**
 * Audit Log Filters Component
 *
 * Client component for filtering audit log results.
 */

"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Filter, X } from "lucide-react"
import { AuditEventType } from "@/server/lib/audit"

export function AuditLogFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [type, setType] = useState(searchParams.get("type") || "")
  const [userId, setUserId] = useState(searchParams.get("userId") || "")
  const [startDate, setStartDate] = useState(searchParams.get("startDate") || "")
  const [endDate, setEndDate] = useState(searchParams.get("endDate") || "")

  const handleApplyFilters = () => {
    const params = new URLSearchParams()
    if (type) params.set("type", type)
    if (userId) params.set("userId", userId)
    if (startDate) params.set("startDate", startDate)
    if (endDate) params.set("endDate", endDate)

    router.push(`/admin/audit?${params.toString()}`)
  }

  const handleClearFilters = () => {
    setType("")
    setUserId("")
    setStartDate("")
    setEndDate("")
    router.push("/admin/audit")
  }

  const hasActiveFilters = type || userId || startDate || endDate

  // Group event types by category
  const eventTypes = Object.values(AuditEventType)
  const eventCategories = {
    Checkout: eventTypes.filter((t) => t.startsWith("checkout")),
    Subscription: eventTypes.filter((t) => t.startsWith("subscription")),
    Payment: eventTypes.filter((t) => t.startsWith("payment") || t.startsWith("invoice") || t.startsWith("refund")),
    GDPR: eventTypes.filter((t) => t.startsWith("gdpr")),
    Security: eventTypes.filter((t) => t.startsWith("security")),
    Admin: eventTypes.filter((t) => t.startsWith("admin")),
    Other: eventTypes.filter((t) => t.startsWith("billing_portal") || t.startsWith("letter") || t.startsWith("delivery")),
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter audit events by type, user, and date range</CardDescription>
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear Filters
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Event Type Filter */}
          <div className="space-y-2">
            <Label htmlFor="type">Event Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="type">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All types</SelectItem>
                {Object.entries(eventCategories).map(([category, types]) =>
                  types.length > 0 ? (
                    <div key={category}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                        {category}
                      </div>
                      {types.map((eventType) => (
                        <SelectItem key={eventType} value={eventType}>
                          {eventType}
                        </SelectItem>
                      ))}
                    </div>
                  ) : null
                )}
              </SelectContent>
            </Select>
          </div>

          {/* User ID Filter */}
          <div className="space-y-2">
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              type="text"
              placeholder="Filter by user ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>

          {/* Start Date Filter */}
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* End Date Filter */}
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Apply Filters Button */}
        <div className="flex justify-end mt-4">
          <Button onClick={handleApplyFilters}>
            <Filter className="h-4 w-4 mr-2" />
            Apply Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
