"use client"

import { useState } from "react"
import { ChevronDown, Calendar } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ScheduleDeliveryForm } from "@/components/schedule-delivery-form"
import { cn } from "@/lib/utils"

interface InlineScheduleSectionProps {
  letterId: string
  letterTitle: string
  letterPreview: string
  userEmail: string
  translations: {
    scheduleTitle: string
    scheduleDescription: string
    expandLabel: string
  }
}

export function InlineScheduleSection({
  letterId,
  letterTitle,
  letterPreview,
  userEmail,
  translations,
}: InlineScheduleSectionProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card
        className="border-2 border-charcoal shadow-sm bg-bg-yellow-pale"
        style={{ borderRadius: "2px" }}
      >
        <CollapsibleTrigger asChild>
          <CardHeader className="p-5 sm:p-6 cursor-pointer hover:bg-duck-yellow/10 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-white"
                  style={{ borderRadius: "2px" }}
                >
                  <Calendar className="h-5 w-5 text-charcoal" strokeWidth={2} />
                </div>
                <div>
                  <CardTitle className="font-mono text-lg font-normal uppercase tracking-wide sm:text-xl">
                    {translations.scheduleTitle}
                  </CardTitle>
                  <p className="font-mono text-xs text-gray-secondary sm:text-sm">
                    {translations.scheduleDescription}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="font-mono text-xs uppercase"
              >
                {translations.expandLabel}
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
            <div className="pt-5 sm:pt-6">
              <ScheduleDeliveryForm
                letterId={letterId}
                letterTitle={letterTitle}
                letterPreview={letterPreview}
                userEmail={userEmail}
              />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
