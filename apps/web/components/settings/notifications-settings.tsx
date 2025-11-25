"use client"

import { useState } from "react"
import { Bell, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { PushNotificationToggle } from "./push-notification-toggle"

interface NotificationsSettingsProps {
  translations: {
    title: string
    description: string
    body: string
    expand: string
    push: {
      title: string
      description: string
      enable: string
      disable: string
      enabling: string
      disabling: string
      notSupported: string
      permissionDenied: string
    }
  }
}

export function NotificationsSettings({ translations }: NotificationsSettingsProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card
        className="border-2 border-charcoal shadow-sm bg-bg-yellow-pale"
        style={{ borderRadius: "2px" }}
      >
        <CollapsibleTrigger asChild>
          <CardHeader className="p-5 sm:p-6 cursor-pointer hover:bg-charcoal/5 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-white"
                  style={{ borderRadius: "2px" }}
                >
                  <Bell className="h-5 w-5 text-charcoal" strokeWidth={2} />
                </div>
                <div>
                  <CardTitle className="font-mono text-xl font-normal uppercase tracking-wide sm:text-2xl">
                    {translations.title}
                  </CardTitle>
                  <CardDescription className="font-mono text-xs text-gray-secondary sm:text-sm">
                    {translations.description}
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="font-mono text-xs uppercase"
              >
                {translations.expand}
                <ChevronDown
                  className={cn(
                    "ml-2 h-4 w-4 transition-transform duration-200",
                    isOpen && "rotate-180"
                  )}
                />
              </Button>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="p-5 sm:p-6 pt-0 border-t-2 border-charcoal">
            <div className="pt-5 sm:pt-6 space-y-6">
              <p className="font-mono text-sm text-gray-secondary">
                {translations.body}
              </p>

              {/* Push Notifications Section */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="font-mono text-sm font-normal uppercase tracking-wide text-charcoal">
                    {translations.push.title}
                  </Label>
                  <p className="font-mono text-xs text-gray-secondary">
                    {translations.push.description}
                  </p>
                </div>
                <PushNotificationToggle
                  translations={{
                    enable: translations.push.enable,
                    disable: translations.push.disable,
                    enabling: translations.push.enabling,
                    disabling: translations.push.disabling,
                    notSupported: translations.push.notSupported,
                    permissionDenied: translations.push.permissionDenied,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
