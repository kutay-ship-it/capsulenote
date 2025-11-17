import * as React from "react"
import { Check, X } from "lucide-react"
import { Card } from "@/components/ui/card"

interface FeatureRow {
  name: string
  free: boolean | string
  pro: boolean | string
  enterprise: boolean | string
}

interface FeatureCategory {
  name: string
  features: FeatureRow[]
}

const featureCategories: FeatureCategory[] = [
  {
    name: "Core Features",
    features: [
      { name: "Letters per month", free: "3", pro: "Unlimited", enterprise: "Unlimited" },
      { name: "Email delivery", free: true, pro: true, enterprise: true },
      { name: "Physical mail delivery", free: false, pro: true, enterprise: true },
      { name: "Free physical mails/month", free: "0", pro: "2", enterprise: "Custom" },
      { name: "Encrypted storage", free: true, pro: true, enterprise: true },
      { name: "Letter templates", free: "Basic", pro: "Premium", enterprise: "Custom" },
    ],
  },
  {
    name: "Advanced Features",
    features: [
      { name: "Advanced scheduling", free: false, pro: true, enterprise: true },
      { name: "Arrive-by mode", free: false, pro: true, enterprise: true },
      { name: "Recurring letters", free: false, pro: true, enterprise: true },
      { name: "Custom branding", free: false, pro: false, enterprise: true },
      { name: "API access", free: false, pro: false, enterprise: true },
      { name: "Webhooks", free: false, pro: false, enterprise: true },
    ],
  },
  {
    name: "Support & Analytics",
    features: [
      { name: "Support", free: "Community", pro: "Priority", enterprise: "Dedicated" },
      { name: "Analytics", free: "Basic", pro: "Advanced", enterprise: "Custom" },
      { name: "SLA", free: false, pro: false, enterprise: true },
      { name: "Dedicated manager", free: false, pro: false, enterprise: true },
    ],
  },
]

function FeatureCell({ value }: { value: boolean | string }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check className="h-5 w-5 text-charcoal" strokeWidth={3} />
    ) : (
      <X className="h-5 w-5 text-gray" strokeWidth={2} />
    )
  }

  return (
    <span className="font-mono text-sm text-charcoal">
      {value}
    </span>
  )
}

export function FeatureMatrix() {
  return (
    <div className="w-full overflow-x-auto">
      <Card className="min-w-[768px]">
        {/* Table */}
        <table className="w-full">
          {/* Header */}
          <thead>
            <tr className="border-b-2 border-charcoal">
              <th className="p-6 text-left">
                <span className="font-mono text-lg uppercase tracking-wide">
                  Features
                </span>
              </th>
              <th className="p-6 text-center">
                <span className="font-mono text-lg uppercase tracking-wide">
                  Free
                </span>
              </th>
              <th className="p-6 text-center bg-duck-blue">
                <span className="font-mono text-lg uppercase tracking-wide">
                  Pro
                </span>
              </th>
              <th className="p-6 text-center">
                <span className="font-mono text-lg uppercase tracking-wide">
                  Enterprise
                </span>
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {featureCategories.map((category, categoryIndex) => (
              <React.Fragment key={category.name}>
                {/* Category Header */}
                <tr className="border-t-2 border-charcoal bg-off-white">
                  <td colSpan={4} className="p-4">
                    <span className="font-mono text-sm uppercase tracking-wider text-gray-secondary">
                      {category.name}
                    </span>
                  </td>
                </tr>

                {/* Feature Rows */}
                {category.features.map((feature, featureIndex) => (
                  <tr
                    key={feature.name}
                    className="border-t border-light-gray hover:bg-off-white transition-colors"
                  >
                    <td className="p-4 pl-6">
                      <span className="font-mono text-sm text-charcoal">
                        {feature.name}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center">
                        <FeatureCell value={feature.free} />
                      </div>
                    </td>
                    <td className="p-4 text-center bg-bg-blue-pale">
                      <div className="flex items-center justify-center">
                        <FeatureCell value={feature.pro} />
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center">
                        <FeatureCell value={feature.enterprise} />
                      </div>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Mobile Note */}
      <p className="mt-4 text-center font-mono text-xs text-gray-secondary lg:hidden">
        Scroll horizontally to see all features
      </p>
    </div>
  )
}
