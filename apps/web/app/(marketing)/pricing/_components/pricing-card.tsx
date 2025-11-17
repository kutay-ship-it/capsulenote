import * as React from "react"
import Link from "next/link"
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { UpgradeButton } from "./upgrade-button"

interface PricingCardProps {
  name: string
  price: string | number
  interval?: "month" | "year"
  description: string
  features: string[]
  cta: string
  ctaHref?: string
  /** Stripe price ID for checkout (Pro tier only) */
  priceId?: string
  highlighted?: boolean
  badge?: string
  popular?: boolean
  className?: string
}

export function PricingCard({
  name,
  price,
  interval,
  description,
  features,
  cta,
  ctaHref,
  priceId,
  highlighted = false,
  badge,
  popular = false,
  className,
}: PricingCardProps) {
  return (
    <Card
      className={cn(
        "relative flex h-full flex-col",
        highlighted && "border-4 border-charcoal shadow-lg bg-duck-blue",
        className
      )}
    >
      {/* Popular Badge */}
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <Badge variant="default" className="px-4 py-1.5 text-sm">
            Most Popular
          </Badge>
        </div>
      )}

      <CardHeader className="space-y-4 pb-6">
        {/* Plan Name */}
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl uppercase tracking-wider">
            {name}
          </CardTitle>
          {badge && (
            <Badge variant="outline" className="text-xs">
              {badge}
            </Badge>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          {typeof price === "number" ? (
            <>
              <span className="font-mono text-5xl font-normal tracking-tight">
                ${price}
              </span>
              {interval && (
                <span className="font-mono text-lg text-gray-secondary">
                  /{interval}
                </span>
              )}
            </>
          ) : (
            <span className="font-mono text-5xl font-normal tracking-tight">
              {price}
            </span>
          )}
        </div>

        {/* Description */}
        <CardDescription className="text-base leading-relaxed">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col">
        {/* Features List */}
        <ul className="mb-8 space-y-3 flex-1">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check
                className="h-5 w-5 flex-shrink-0 text-charcoal"
                strokeWidth={3}
              />
              <span className="font-mono text-sm leading-relaxed text-charcoal">
                {feature}
              </span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        {priceId ? (
          // Pro tier with checkout flow
          <UpgradeButton
            priceId={priceId}
            label={cta}
            variant={highlighted ? "secondary" : "outline"}
            size="lg"
            className="w-full"
          />
        ) : ctaHref ? (
          // Free/Enterprise tiers with simple link
          <Link href={ctaHref} className="w-full">
            <Button
              variant={highlighted ? "secondary" : "outline"}
              size="lg"
              className="w-full"
            >
              {cta}
            </Button>
          </Link>
        ) : null}
      </CardContent>
    </Card>
  )
}
