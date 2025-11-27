import { SettingsTabsV3Skeleton } from "@/components/v3/settings/settings-tabs-v3"

/**
 * Loading skeleton for settings page
 */
export default function SettingsV3Loading() {
  return (
    <div className="container py-12">
      {/* Header Skeleton */}
      <header className="space-y-2 animate-pulse">
        <div
          className="h-8 w-48 bg-charcoal/10"
          style={{ borderRadius: "2px" }}
        />
        <div
          className="h-4 w-64 bg-charcoal/10"
          style={{ borderRadius: "2px" }}
        />
      </header>

      {/* Tabs Skeleton */}
      <div className="mt-8">
        <SettingsTabsV3Skeleton />
      </div>
    </div>
  )
}
