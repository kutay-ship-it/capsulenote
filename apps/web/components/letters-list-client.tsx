"use client"

import { useOptimistic, useTransition } from "react"
import { Calendar, FileText, Clock, CheckCircle, Trash2 } from "lucide-react"
import { useTranslations } from "next-intl"

import { Link } from "@/i18n/routing"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { deleteLetter } from "@/server/actions/letters"
import { cn } from "@/lib/utils"

export interface LetterItem {
  id: string
  title: string
  status: "draft" | "scheduled" | "delivered"
  createdAt: Date | string
  deliveryCount: number
  tags: string[]
}

interface LettersListClientProps {
  letters: LetterItem[]
  locale: string
}

type OptimisticAction = { type: "delete"; id: string }

export function LettersListClient({ letters, locale }: LettersListClientProps) {
  const t = useTranslations("letters")
  const [isPending, startTransition] = useTransition()

  const [optimisticLetters, updateOptimisticLetters] = useOptimistic(
    letters,
    (state, action: OptimisticAction) => {
      if (action.type === "delete") {
        return state.filter((letter) => letter.id !== action.id)
      }
      return state
    }
  )

  const formatDate = (date: Date | string) =>
    new Intl.DateTimeFormat(locale, {
      dateStyle: "long",
    }).format(typeof date === "string" ? new Date(date) : date)

  // Pastel background colors rotation
  const bgColors = [
    "bg-bg-blue-light",
    "bg-bg-peach-light",
    "bg-bg-purple-light",
    "bg-bg-yellow-pale",
    "bg-bg-green-light",
    "bg-bg-pink-light",
  ]

  const handleDelete = (letterId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    startTransition(async () => {
      // Optimistically remove the letter
      updateOptimisticLetters({ type: "delete", id: letterId })

      try {
        const result = await deleteLetter(letterId)

        if (!result.success) {
          // Revert will happen automatically on next render since server state didn't change
          toast.error(t("toasts.deleteError.title"), {
            description: result.error?.message || t("toasts.deleteError.description"),
          })
          return
        }

        toast.success(t("toasts.deleted.title"), {
          description: t("toasts.deleted.description"),
        })
      } catch (error) {
        toast.error(t("toasts.deleteError.title"), {
          description: t("toasts.deleteError.description"),
        })
      }
    })
  }

  return (
    <div className={cn("grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3", isPending && "opacity-70")}>
      {optimisticLetters.map((letter, index) => {
        // Status icon and badge
        const statusConfig = {
          draft: {
            icon: FileText,
            badge: t("status.draft"),
            iconBg: "bg-bg-yellow-pale",
          },
          scheduled: {
            icon: Clock,
            badge: t("status.scheduled"),
            iconBg: "bg-bg-blue-light",
          },
          delivered: {
            icon: CheckCircle,
            badge: t("status.delivered"),
            iconBg: "bg-bg-green-light",
          },
        }

        const config = statusConfig[letter.status]
        const StatusIcon = config.icon

        return (
          <Link key={letter.id} href={{ pathname: "/letters/[id]", params: { id: letter.id } }}>
            <Card
              className={`group h-full border-2 border-charcoal shadow-sm transition-all duration-fast hover:shadow-md hover:translate-x-0.5 hover:-translate-y-0.5 ${bgColors[index % bgColors.length]}`}
              style={{ borderRadius: "2px" }}
            >
              <CardHeader className="space-y-3 p-5 sm:p-6">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="font-mono text-lg font-normal uppercase tracking-wide line-clamp-2 sm:text-xl">
                    {letter.title}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {letter.status === "draft" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-coral/20"
                        onClick={(e) => handleDelete(letter.id, e)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4 text-coral" strokeWidth={2} />
                        <span className="sr-only">{t("delete")}</span>
                      </Button>
                    )}
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center border-2 border-charcoal ${config.iconBg}`}
                      style={{ borderRadius: "2px" }}
                    >
                      <StatusIcon className="h-4 w-4 text-charcoal" strokeWidth={2} />
                    </div>
                  </div>
                </div>
                <CardDescription className="flex items-center gap-2 font-mono text-xs text-gray-secondary sm:text-sm">
                  <Calendar className="h-4 w-4" strokeWidth={2} />
                  {t("createdOn", { date: formatDate(letter.createdAt) })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 p-5 pt-0 sm:p-6 sm:pt-0">
                <div className="flex items-center justify-between font-mono text-xs text-charcoal sm:text-sm">
                  <span className="font-normal">
                    {t("counts.deliveries", { count: letter.deliveryCount })}
                  </span>
                  <Badge
                    variant="outline"
                    className="border-2 border-charcoal font-mono text-xs uppercase"
                    style={{ borderRadius: "2px" }}
                  >
                    {config.badge}
                  </Badge>
                </div>
                {letter.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {letter.tags.slice(0, 3).map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="border-2 border-charcoal font-mono text-xs uppercase"
                        style={{ borderRadius: "2px" }}
                      >
                        {tag}
                      </Badge>
                    ))}
                    {letter.tags.length > 3 && (
                      <Badge
                        variant="secondary"
                        className="border-2 border-charcoal font-mono text-xs uppercase"
                        style={{ borderRadius: "2px" }}
                      >
                        {t("counts.tagOverflow", { count: letter.tags.length - 3 })}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
