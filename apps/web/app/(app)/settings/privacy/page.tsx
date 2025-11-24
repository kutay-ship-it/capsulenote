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

export const metadata = {
  title: "Privacy Settings | DearMe",
  description: "Manage your data privacy and GDPR rights",
}

// Force dynamic rendering - page requires auth
export const dynamic = 'force-dynamic'

export default async function PrivacySettingsPage() {
  const user = await requireUser()

  return (
    <div className="container mx-auto max-w-4xl py-8 space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Privacy Settings</h1>
        <p className="text-muted-foreground">
          Manage your data privacy and exercise your GDPR rights
        </p>
      </div>

      {/* Data Export Section */}
      <Card>
        <CardHeader>
          <CardTitle>Export Your Data</CardTitle>
          <CardDescription>
            Download a complete copy of all your data stored in DearMe. This includes your letters,
            deliveries, subscription history, and payment records.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="font-semibold mb-2">Your export will include:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Profile information and settings</li>
                <li>All letters (decrypted content)</li>
                <li>Delivery history and schedules</li>
                <li>Subscription and payment records</li>
                <li>Usage statistics</li>
                <li>Audit log (security events)</li>
              </ul>
            </div>

            <ExportDataButton />

            <p className="text-xs text-muted-foreground">
              The export is provided in JSON format and will download immediately. This data is
              intended for your personal records and complies with GDPR Article 15 (Right to Access).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Deletion Section */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Delete Your Data</CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg bg-destructive/10 p-4 text-sm">
              <p className="font-semibold mb-2 text-destructive">What will be deleted:</p>
              <ul className="list-disc list-inside space-y-1 text-destructive/90">
                <li>Your profile and account settings</li>
                <li>All letters and scheduled deliveries</li>
                <li>Subscription records</li>
                <li>Usage statistics and shipping addresses</li>
                <li>Your authentication account</li>
              </ul>

              <p className="font-semibold mt-4 mb-2">What will be retained:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Payment records (anonymized, required by tax law for 7 years)</li>
                <li>Audit logs (immutable, required for compliance)</li>
              </ul>
            </div>

            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 text-sm">
              <p className="font-semibold text-yellow-900 mb-1">Before you proceed:</p>
              <ul className="list-disc list-inside space-y-1 text-yellow-800">
                <li>Consider exporting your data first if you want to keep a copy</li>
                <li>Active subscriptions will be canceled immediately</li>
                <li>You will be signed out and cannot undo this action</li>
              </ul>
            </div>

            <DeleteDataButton />

            <p className="text-xs text-muted-foreground">
              This implements GDPR Article 17 (Right to Erasure). Payment records are retained
              in anonymized form to comply with tax regulations.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Legal Links */}
      <div className="flex gap-4 text-sm text-muted-foreground">
        <a href="/privacy" className="hover:underline">
          Privacy Policy
        </a>
        <a href="/terms" className="hover:underline">
          Terms of Service
        </a>
        <a href="/gdpr" className="hover:underline">
          GDPR Information
        </a>
      </div>
    </div>
  )
}
