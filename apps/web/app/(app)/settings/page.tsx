import { getCurrentUser } from "@/server/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export default async function SettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/sign-in")
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your basic account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Email</Label>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div>
            <Label>Display Name</Label>
            <p className="text-sm text-muted-foreground">
              {user.profile?.displayName || "Not set"}
            </p>
          </div>
          <div>
            <Label>Timezone</Label>
            <p className="text-sm text-muted-foreground">
              {user.profile?.timezone || "Not set"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>Manage your DearMe Pro subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Subscription management coming soon
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacy & Data</CardTitle>
          <CardDescription>Control your data and privacy settings</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Privacy controls coming soon
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
