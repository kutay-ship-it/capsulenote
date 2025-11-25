"use client"

import { useState, type ReactNode } from "react"
import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

interface CollapsibleSectionProps {
  icon: ReactNode
  iconBgClass?: string
  title: string
  description: string
  bgClass?: string
  expandLabel: string
  defaultOpen?: boolean
  children: ReactNode
}

export function CollapsibleSection({
  icon,
  iconBgClass = "bg-white",
  title,
  description,
  bgClass = "",
  expandLabel,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card
        className={cn("border-2 border-charcoal shadow-sm", bgClass)}
        style={{ borderRadius: "2px" }}
      >
        <CollapsibleTrigger asChild>
          <CardHeader className="p-5 sm:p-6 cursor-pointer hover:bg-charcoal/5 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center border-2 border-charcoal",
                    iconBgClass
                  )}
                  style={{ borderRadius: "2px" }}
                >
                  {icon}
                </div>
                <div>
                  <CardTitle className="font-mono text-xl font-normal uppercase tracking-wide sm:text-2xl">
                    {title}
                  </CardTitle>
                  <CardDescription className="font-mono text-xs text-gray-secondary sm:text-sm">
                    {description}
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="font-mono text-xs uppercase"
              >
                {expandLabel}
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
              {children}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
