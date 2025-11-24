/**
 * Privacy Settings Page
 *
 * Implements GDPR Data Subject Rights:
 * - Right to Access (Data Export)
 * - Right to Erasure (Data Deletion)
 *
 * @module app/(app)/settings/privacy
 */

import { requireUser } from "@/server/lib/auth"
import { ExportDataButton } from "./_components/export-data-button"
import { DeleteDataButton } from "./_components/delete-data-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getTranslations } from "next-intl/server"

export async function generateMetadata() {
  const t = await getTranslations("privacy.page.metadata")
  return {
    title: t("title"),
    description: t("description"),
  }
}

// Force dynamic rendering - page requires auth
export const dynamic = 'force-dynamic'

export default async function PrivacySettingsPage() {
  const user = await requireUser()
  const t = await getTranslations("privacy.page")

  return (
    <div className="container mx-auto max-w-4xl py-8 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("description")}
        </p>
      </div>

      {/* Data Export Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t("exportSection.title")}</CardTitle>
          <CardDescription>
            {t("exportSection.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="font-semibold mb-2">{t("exportSection.includesTitle")}</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>{t("exportSection.includes.profile")}</li>
                <li>{t("exportSection.includes.letters")}</li>
                <li>{t("exportSection.includes.deliveries")}</li>
                <li>{t("exportSection.includes.subscription")}</li>
                <li>{t("exportSection.includes.usage")}</li>
                <li>{t("exportSection.includes.audit")}</li>
              </ul>
            </div>

            <ExportDataButton />

            <p className="text-xs text-muted-foreground">
              {t("exportSection.footer")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Deletion Section */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">{t("deleteSection.title")}</CardTitle>
          <CardDescription>
            {t("deleteSection.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg bg-destructive/10 p-4 text-sm">
              <p className="font-semibold mb-2 text-destructive">{t("deleteSection.willDeleteTitle")}</p>
              <ul className="list-disc list-inside space-y-1 text-destructive/90">
                <li>{t("deleteSection.willDelete.profile")}</li>
                <li>{t("deleteSection.willDelete.letters")}</li>
                <li>{t("deleteSection.willDelete.subscription")}</li>
                <li>{t("deleteSection.willDelete.usage")}</li>
                <li>{t("deleteSection.willDelete.auth")}</li>
              </ul>

              <p className="font-semibold mt-4 mb-2">{t("deleteSection.willRetainTitle")}</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>{t("deleteSection.willRetain.payments")}</li>
                <li>{t("deleteSection.willRetain.audit")}</li>
              </ul>
            </div>

            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 text-sm">
              <p className="font-semibold text-yellow-900 mb-1">{t("deleteSection.beforeTitle")}</p>
              <ul className="list-disc list-inside space-y-1 text-yellow-800">
                <li>{t("deleteSection.before.export")}</li>
                <li>{t("deleteSection.before.subscription")}</li>
                <li>{t("deleteSection.before.signOut")}</li>
              </ul>
            </div>

            <DeleteDataButton />

            <p className="text-xs text-muted-foreground">
              {t("deleteSection.footer")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Legal Links */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        <a href="/privacy" className="hover:underline">
          {t("links.privacy")}
        </a>
        <a href="/terms" className="hover:underline">
          {t("links.terms")}
        </a>
        <a href="/gdpr" className="hover:underline">
          {t("links.gdpr")}
        </a>
      </div>
    </div>
  )
}
