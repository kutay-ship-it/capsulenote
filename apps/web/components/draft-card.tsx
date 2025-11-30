"use client"

import { PenSquare, Calendar, Clock, AlertTriangle } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"

import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export interface DraftData {
  id: string
  title: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
  daysOld: number
  expiresInDays: number
}

interface DraftCardProps {
  draft: DraftData
  bgColor: string
  expired?: boolean
  expiring?: boolean
}

export function DraftCard({
  draft,
  bgColor,
  expired = false,
  expiring = false,
}: DraftCardProps) {
  const locale = useLocale()
  const t = useTranslations("letters.drafts")

  const formatDate = (date: Date | string) =>
    new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(typeof date === "string" ? new Date(date) : date)

  const formatAge = (days: number) => t("age", { count: days })

  return (
    <Link href={{ pathname: "/letters/[id]", params: { id: draft.id } }}>
      <Card
        className={`h-full border-2 border-charcoal shadow-sm transition-all duration-fast hover:shadow-md hover:translate-x-0.5 hover:-translate-y-0.5 ${bgColor} ${expired ? "opacity-70" : ""}`}
        style={{ borderRadius: "2px" }}
      >
        <CardHeader className="space-y-3 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="font-mono text-lg font-normal uppercase tracking-wide line-clamp-2 sm:text-xl">
              {draft.title}
            </CardTitle>
            {(expired || expiring) && (
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center border-2 border-charcoal ${expired ? "bg-coral" : "bg-duck-yellow"}`}
                style={{ borderRadius: "2px" }}
              >
                <AlertTriangle className="h-4 w-4 text-charcoal" strokeWidth={2} />
              </div>
            )}
          </div>
          <CardDescription className="space-y-2 font-mono text-xs text-gray-secondary sm:text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" strokeWidth={2} />
              {t("created", { date: formatDate(draft.createdAt) })}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" strokeWidth={2} />
              {formatAge(draft.daysOld)}
              {expired && (
                <Badge variant="destructive" className="ml-auto font-mono text-xs uppercase">
                  {t("expiredBadge")}
                </Badge>
              )}
              {expiring && !expired && (
                <Badge
                  className="ml-auto bg-duck-yellow text-charcoal border-2 border-charcoal font-mono text-xs uppercase"
                  style={{ borderRadius: "2px" }}
                >
                  {t("badges.expiringDays", { count: draft.expiresInDays })}
                </Badge>
              )}
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 p-5 pt-0 sm:p-6 sm:pt-0">
          {/* Tags */}
          {draft.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {draft.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="border-2 border-charcoal font-mono text-xs uppercase"
                  style={{ borderRadius: "2px" }}
                >
                  {tag}
                </Badge>
              ))}
              {draft.tags.length > 3 && (
                <Badge
                  variant="secondary"
                  className="border-2 border-charcoal font-mono text-xs uppercase"
                  style={{ borderRadius: "2px" }}
                >
                  {t("badges.tagOverflow", { count: draft.tags.length - 3 })}
                </Badge>
              )}
            </div>
          )}
          {/* CTA */}
          <div className="border-t-2 border-charcoal pt-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full border-2 border-charcoal font-mono text-xs uppercase"
              style={{ borderRadius: "2px" }}
              asChild
            >
              <span>
                <PenSquare className="mr-2 h-3 w-3" strokeWidth={2} />
                {t("badges.continue")}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
