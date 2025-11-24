import * as React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface FAQItem {
  question: string
  answer: string
}

export function PricingFAQ({
  items,
  title,
  subtitle,
  contactText,
  contactLinkText,
}: {
  items: FAQItem[]
  title: string
  subtitle: string
  contactText: string
  contactLinkText: string
}) {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="text-center space-y-3">
        <h2 className="font-mono text-3xl uppercase tracking-wide text-charcoal md:text-4xl">
          {title}
        </h2>
        <p className="font-mono text-base text-gray-secondary">
          {subtitle}
        </p>
      </div>

      {/* FAQ Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {items.map((item, index) => (
          <Card key={index} className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">
                {item.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-sm leading-relaxed text-gray-secondary">
                {item.answer}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contact Support CTA */}
      <Card className="bg-off-white text-center">
        <CardContent className="py-8">
          <p className="font-mono text-base text-charcoal">
            {contactText}{" "}
            <a
              href="mailto:support@capsulenote.com"
              className="underline hover:opacity-70 transition-opacity"
            >
              {contactLinkText}
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
