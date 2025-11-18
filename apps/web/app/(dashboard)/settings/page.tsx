import { Metadata } from "next"
import { requireUser } from "@/server/lib/auth"
import { DataPrivacySection } from "@/components/settings/data-privacy-section"
import { ProfileSection } from "@/components/settings/profile-section"

export const metadata: Metadata = {
  title: "Settings | DearMe",
  description: "Manage your account settings and privacy preferences",
}

export default async function SettingsPage() {
  const user = await requireUser()

  return (
    <div className="container max-w-4xl py-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your account preferences and privacy settings
          </p>
        </div>

        <div className="space-y-6">
          <ProfileSection user={user} />
          <DataPrivacySection />
        </div>
      </div>
    </div>
  )
}
