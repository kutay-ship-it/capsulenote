/**
 * Subscribe Pricing Card Component
 *
 * Simplified pricing card for anonymous checkout flow.
 * Displays plan details and subscribe button.
 */

import * as React from "react"
import { Check } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { SubscribeButton } from "./subscribe-button"

interface SubscribePricingCardProps {
  /** User's email for checkout */
  email: string
  /** Plan name */
  name: string
  /** Price in dollars */
  price: number
  /** Billing interval */
  interval?: "month" | "year"
  /** Plan description */
  description: string
  /** Feature list */
  features: string[]
  /** Stripe price ID */
  priceId: string
  /** Optional letter ID */
  letterId?: string
  /** Optional checkout metadata */
  metadata?: Record<string, unknown>
  /** Highlight this card */
  highlighted?: boolean
  /** Show "Most Popular" badge */
  popular?: boolean
  /** Optional badge text (e.g., "Save 17%") */
  badge?: string
  /** Additional CSS classes */
  className?: string
}

export function SubscribePricingCard({
  email,
  name,
  price,
  interval,
  description,
  features,
  priceId,
  letterId,
  metadata,
  highlighted = false,
  popular = false,
  badge,
  className,
}: SubscribePricingCardProps) {
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
          <span className="font-mono text-5xl font-normal tracking-tight">
            ${price}
          </span>
          {interval && (
            <span className="font-mono text-lg text-gray-secondary">
              /{interval}
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

        {/* Email Locked Notice */}
        <div className="mb-4 rounded-lg border-2 border-charcoal bg-off-white p-3">
          <p className="font-mono text-xs text-charcoal">
            <strong>Email locked:</strong> {email}
          </p>
          <p className="font-mono text-xs text-gray-secondary mt-1">
            Cannot be changed after payment (security)
          </p>
        </div>

        {/* Subscribe Button */}
        <SubscribeButton
          email={email}
          priceId={priceId}
          planName={name}
          letterId={letterId}
          metadata={metadata}
          variant={highlighted ? "secondary" : "outline"}
          size="lg"
          className="w-full"
        />
      </CardContent>
    </Card>
  )
}
