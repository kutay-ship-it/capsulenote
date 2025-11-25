"use client"

import { useState } from "react"
import { ChevronDown, CreditCard, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

interface BillingSummaryProps {
  translations: {
    title: string
    description: string
    body: string
    expand: string
    viewFull: string
    manageSubscription: string
  }
}

export function BillingSummary({ translations }: BillingSummaryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card
        className="border-2 border-charcoal shadow-sm bg-bg-purple-light"
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
                  <CreditCard className="h-5 w-5 text-charcoal" strokeWidth={2} />
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
            <div className="pt-5 sm:pt-6 space-y-4">
              <p className="font-mono text-sm text-gray-secondary">
                {translations.body}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => router.push("/settings/billing")}
                  className="border-2 border-charcoal bg-charcoal font-mono text-cream hover:bg-gray-800"
                  style={{ borderRadius: "2px" }}
                >
                  {translations.viewFull}
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
