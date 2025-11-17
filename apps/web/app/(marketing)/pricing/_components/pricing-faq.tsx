import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface FAQItem {
  question: string
  answer: string
}

const faqItems: FAQItem[] = [
  {
    question: "What happens after the free trial?",
    answer:
      "Your 14-day free trial gives you full access to Pro features. After the trial, you'll be charged the monthly or annual rate you selected. You can cancel anytime before the trial ends with no charge.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes! You can cancel your subscription at any time from your billing settings. You'll continue to have access until the end of your billing period, and no further charges will be made.",
  },
  {
    question: "How do physical mail credits work?",
    answer:
      "Pro members get 2 free physical mail deliveries per month. Additional physical mails cost $3.50 each (US) or $5.50 (international). Credits don't roll over, but you can purchase extras anytime.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express, Discover) processed securely through Stripe. We don't store your payment information on our servers.",
  },
  {
    question: "Is there a discount for annual plans?",
    answer:
      "Yes! Annual plans save you 17% compared to paying monthly. You'll pay $189/year instead of $228/year, saving $39.",
  },
  {
    question: "What happens to my letters if I cancel?",
    answer:
      "Your letters remain in your account even after canceling. You can still view and export them. However, you won't be able to schedule new deliveries until you resubscribe.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "We offer a 30-day money-back guarantee. If you're not satisfied within the first 30 days, contact support for a full refund. No questions asked.",
  },
  {
    question: "Can I upgrade or downgrade my plan?",
    answer:
      "Yes! You can change your plan anytime. Upgrades take effect immediately with prorated billing. Downgrades take effect at the end of your current billing period.",
  },
]

export function PricingFAQ() {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="text-center space-y-3">
        <h2 className="font-mono text-3xl uppercase tracking-wide text-charcoal md:text-4xl">
          Frequently Asked Questions
        </h2>
        <p className="font-mono text-base text-gray-secondary">
          Everything you need to know about pricing and billing
        </p>
      </div>

      {/* FAQ Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {faqItems.map((item, index) => (
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
            Still have questions?{" "}
            <a
              href="mailto:support@capsulenote.com"
              className="underline hover:opacity-70 transition-opacity"
            >
              Contact our support team
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
