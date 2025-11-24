"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { User } from "@prisma/client"
import { UserCircle } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"

interface ProfileSectionProps {
  user: User
}

export function ProfileSection({ user }: ProfileSectionProps) {
  const t = useTranslations("settings.profile")
  const locale = useLocale()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserCircle className="h-5 w-5" />
          <CardTitle>{t("title")}</CardTitle>
        </div>
        <CardDescription>
          {t("description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>{t("email")}</Label>
          <div className="text-sm text-muted-foreground">{user.email}</div>
        </div>

        <div className="space-y-2">
          <Label>{t("accountId")}</Label>
          <div className="text-sm text-muted-foreground font-mono text-xs">
            {user.id}
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t("memberSince")}</Label>
          <div className="text-sm text-muted-foreground">
            {new Date(user.createdAt).toLocaleDateString(locale, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
