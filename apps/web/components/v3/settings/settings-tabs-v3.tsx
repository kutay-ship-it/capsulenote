"use client"

import { useState } from "react"
import { User, CreditCard, Shield, Gift } from "lucide-react"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export type SettingsTab = "account" | "billing" | "privacy" | "referrals"

/**
 * Tab configuration with icons and labels
 */
const TAB_CONFIG: {
  value: SettingsTab
  label: string
  icon: React.ReactNode
}[] = [
  {
    value: "account",
    label: "Account",
    icon: <User className="h-4 w-4" strokeWidth={2} />,
  },
  {
    value: "billing",
    label: "Billing",
    icon: <CreditCard className="h-4 w-4" strokeWidth={2} />,
  },
  {
    value: "privacy",
    label: "Privacy",
    icon: <Shield className="h-4 w-4" strokeWidth={2} />,
  },
  {
    value: "referrals",
    label: "Referrals",
    icon: <Gift className="h-4 w-4" strokeWidth={2} />,
  },
]

// Props for the tabs component - simplified since content is rendered by parent
export interface SettingsTabsV3Props {
  initialTab: SettingsTab
  accountContent: React.ReactNode
  billingContent: React.ReactNode
  privacyContent: React.ReactNode
  referralsContent: React.ReactNode
}

/**
 * V3 Settings Tabs with URL sync
 * Matches the tabs pattern from letters-list-v3
 */
export function SettingsTabsV3({
  initialTab,
  accountContent,
  billingContent,
  privacyContent,
  referralsContent,
}: SettingsTabsV3Props) {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab)

  const handleTabChange = (tab: string) => {
    const newTab = tab as SettingsTab
    setActiveTab(newTab)

    // Update URL without navigation for shareability
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      if (newTab === "account") {
        url.searchParams.delete("tab")
      } else {
        url.searchParams.set("tab", newTab)
      }
      window.history.replaceState({}, "", url.toString())
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      {/* Brutalist Tab List */}
      <TabsList
        className="inline-flex h-auto w-full justify-start gap-0 rounded-none border-2 border-charcoal bg-white p-0"
        style={{ borderRadius: "2px" }}
      >
        {TAB_CONFIG.map((tab, index) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className={cn(
              "relative flex items-center gap-2 rounded-none px-3 py-3 sm:px-4 font-mono text-xs font-bold uppercase tracking-wider transition-all",
              "data-[state=active]:bg-charcoal data-[state=active]:text-white data-[state=active]:shadow-none",
              "data-[state=inactive]:bg-white data-[state=inactive]:text-charcoal data-[state=inactive]:hover:bg-off-white",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-duck-blue focus-visible:ring-offset-0",
              // Add border between tabs
              index > 0 && "border-l-2 border-charcoal"
            )}
            style={{ borderRadius: "0" }}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      {/* Tab Content */}
      <TabsContent value="account" className="mt-6 focus-visible:outline-none focus-visible:ring-0">
        <div className="space-y-6">{accountContent}</div>
      </TabsContent>

      <TabsContent value="billing" className="mt-6 focus-visible:outline-none focus-visible:ring-0">
        <div className="space-y-6">{billingContent}</div>
      </TabsContent>

      <TabsContent value="privacy" className="mt-6 focus-visible:outline-none focus-visible:ring-0">
        <div className="space-y-6">{privacyContent}</div>
      </TabsContent>

      <TabsContent value="referrals" className="mt-6 focus-visible:outline-none focus-visible:ring-0">
        <div className="space-y-6">{referralsContent}</div>
      </TabsContent>
    </Tabs>
  )
}

/**
 * Skeleton loader for settings tabs
 */
export function SettingsTabsV3Skeleton() {
  return (
    <div className="w-full">
      {/* Tabs skeleton */}
      <div
        className="flex h-12 w-full border-2 border-charcoal bg-white"
        style={{ borderRadius: "2px" }}
      >
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "flex-1 animate-pulse bg-charcoal/5",
              i > 0 && "border-l-2 border-charcoal"
            )}
          />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="mt-6 space-y-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="relative border-2 border-charcoal bg-white p-6 animate-pulse"
            style={{ borderRadius: "2px" }}
          >
            <div
              className="absolute -top-3 left-6 h-5 w-24 bg-charcoal/20"
              style={{ borderRadius: "2px" }}
            />
            <div className="mt-4 space-y-4">
              <div className="h-4 w-3/4 bg-charcoal/10" style={{ borderRadius: "2px" }} />
              <div className="h-4 w-1/2 bg-charcoal/10" style={{ borderRadius: "2px" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
