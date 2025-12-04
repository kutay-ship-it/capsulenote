"use client"

import * as React from "react"
import { MailTrackingRoad } from "@/components/v3/mail-tracking-road"
import { cn } from "@/lib/utils"

/**
 * All possible tracking statuses from Lob webhooks
 */
const TRACKING_STATUSES = [
  { value: null, label: "No Status (Pending)" },
  { value: "created", label: "Created" },
  { value: "rendered", label: "Rendered" },
  { value: "mailed", label: "Mailed" },
  { value: "in_transit", label: "In Transit" },
  { value: "in_local_area", label: "In Local Area" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "returned", label: "Returned to Sender" },
  { value: "failed", label: "Failed" },
] as const

type TrackingStatus = (typeof TRACKING_STATUSES)[number]["value"]

/**
 * Mail Tracking Road Sandbox
 *
 * Interactive sandbox for testing the MailTrackingRoad component
 * across all possible tracking states.
 */
export default function MailTrackingSandboxPage() {
  const [selectedStatus, setSelectedStatus] = React.useState<TrackingStatus>("in_transit")
  const [showExpectedDate, setShowExpectedDate] = React.useState(true)

  return (
    <div className="container py-12 space-y-8">
      {/* Header */}
      <header className="space-y-2">
        <h1 className="font-mono text-3xl font-bold uppercase tracking-wide text-charcoal">
          Mail Tracking Sandbox
        </h1>
        <p className="font-mono text-sm text-charcoal/70">
          Test the physical mail tracking road component across all delivery states.
        </p>
      </header>

      {/* Controls */}
      <div
        className="border-2 border-charcoal bg-white p-6 shadow-[2px_2px_0_theme(colors.charcoal)]"
        style={{ borderRadius: "2px" }}
      >
        <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-charcoal mb-4">
          Controls
        </h2>

        {/* Status Selector */}
        <div className="space-y-3">
          <label className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal/60">
            Tracking Status
          </label>
          <div className="flex flex-wrap gap-2">
            {TRACKING_STATUSES.map((status) => (
              <button
                key={status.value ?? "null"}
                onClick={() => setSelectedStatus(status.value)}
                className={cn(
                  "px-3 py-1.5 border-2 border-charcoal font-mono text-xs uppercase tracking-wider transition-all",
                  selectedStatus === status.value
                    ? "bg-duck-yellow shadow-[2px_2px_0_theme(colors.charcoal)]"
                    : "bg-white hover:bg-charcoal/5"
                )}
                style={{ borderRadius: "2px" }}
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* Expected Date Toggle */}
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={() => setShowExpectedDate(!showExpectedDate)}
            className={cn(
              "flex h-6 w-10 items-center border-2 border-charcoal p-0.5 transition-all",
              showExpectedDate ? "bg-teal-primary justify-end" : "bg-charcoal/20 justify-start"
            )}
            style={{ borderRadius: "2px" }}
          >
            <div
              className="h-4 w-4 bg-white border border-charcoal"
              style={{ borderRadius: "2px" }}
            />
          </button>
          <span className="font-mono text-xs uppercase tracking-wider text-charcoal/60">
            Show Expected Delivery Date
          </span>
        </div>
      </div>

      {/* Preview Area */}
      <div className="space-y-4">
        <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-charcoal">
          Preview
        </h2>

        <div
          className="border-2 border-dashed border-charcoal/30 p-8 bg-cream/50"
          style={{ borderRadius: "2px" }}
        >
          <MailTrackingRoad
            trackingStatus={selectedStatus}
            expectedDeliveryDate={showExpectedDate ? "Nov 18-20, 2024" : undefined}
          />
        </div>
      </div>

      {/* All States Preview */}
      <div className="space-y-4">
        <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-charcoal">
          All States Reference
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          {TRACKING_STATUSES.map((status) => (
            <div key={status.value ?? "null"} className="space-y-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal/60">
                {status.label}
              </span>
              <MailTrackingRoad
                trackingStatus={status.value}
                expectedDeliveryDate={
                  status.value !== "delivered" &&
                  status.value !== "returned" &&
                  status.value !== "failed"
                    ? "Nov 18-20"
                    : undefined
                }
              />
            </div>
          ))}
        </div>
      </div>

      {/* Best Practices */}
      <div
        className="border-2 border-charcoal bg-white p-6 shadow-[2px_2px_0_theme(colors.charcoal)]"
        style={{ borderRadius: "2px" }}
      >
        <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-charcoal mb-4">
          Implementation Notes
        </h2>

        <div className="space-y-4 font-mono text-xs text-charcoal/70">
          <div>
            <h3 className="font-bold uppercase text-charcoal mb-1">Data Source</h3>
            <p>
              Tracking status comes from <code className="bg-charcoal/10 px-1">MailDelivery.trackingStatus</code>,
              updated via Lob webhooks at <code className="bg-charcoal/10 px-1">/api/webhooks/lob</code>.
            </p>
          </div>

          <div>
            <h3 className="font-bold uppercase text-charcoal mb-1">Status Mapping</h3>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong>Preparing:</strong> created, rendered</li>
              <li><strong>Mailed:</strong> mailed</li>
              <li><strong>In Transit:</strong> in_transit</li>
              <li><strong>In Your Area:</strong> in_local_area, out_for_delivery</li>
              <li><strong>Delivered:</strong> delivered</li>
              <li><strong>Failed:</strong> returned, failed</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold uppercase text-charcoal mb-1">When to Show</h3>
            <p>
              Only render when <code className="bg-charcoal/10 px-1">delivery.channel === "mail"</code> and
              <code className="bg-charcoal/10 px-1">trackingStatus</code> exists. Component handles null gracefully
              by showing "Preparing" state.
            </p>
          </div>

          <div>
            <h3 className="font-bold uppercase text-charcoal mb-1">Responsive Behavior</h3>
            <p>
              Desktop: Horizontal 5-stage road with connectors.<br />
              Mobile: 2-column grid, connectors hidden.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
