import { getCurrentUser } from "@/server/lib/auth"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { User, Bell, Globe, Lock, CreditCard, AlertTriangle } from "lucide-react"
import Link from "next/link"

export default async function SettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/sign-in")
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 sm:space-y-10">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="font-mono text-3xl font-normal uppercase tracking-wide text-charcoal sm:text-4xl md:text-5xl">
          Settings
        </h1>
        <p className="font-mono text-sm text-gray-secondary sm:text-base">
          Manage your account and preferences
        </p>
      </div>

      {/* Account Information */}
      <Card
        className="border-2 border-charcoal shadow-sm bg-bg-blue-light"
        style={{ borderRadius: "2px" }}
      >
        <CardHeader className="space-y-3 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-white"
              style={{ borderRadius: "2px" }}
            >
              <User className="h-5 w-5 text-charcoal" strokeWidth={2} />
            </div>
            <div>
              <CardTitle className="font-mono text-xl font-normal uppercase tracking-wide sm:text-2xl">
                Account Information
              </CardTitle>
              <CardDescription className="font-mono text-xs text-gray-secondary sm:text-sm">
                Your basic account details
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-5 pt-0 sm:space-y-6 sm:p-6 sm:pt-0">
          <div className="space-y-2">
            <Label className="font-mono text-sm font-normal uppercase tracking-wide text-charcoal">
              Email
            </Label>
            <p className="font-mono text-sm text-gray-secondary sm:text-base">{user.email}</p>
          </div>
          <div className="space-y-2">
            <Label className="font-mono text-sm font-normal uppercase tracking-wide text-charcoal">
              Display Name
            </Label>
            <p className="font-mono text-sm text-gray-secondary sm:text-base">
              {user.profile?.displayName || "Not set"}
            </p>
          </div>
          <div className="space-y-2">
            <Label className="font-mono text-sm font-normal uppercase tracking-wide text-charcoal">
              Timezone
            </Label>
            <p className="font-mono text-sm text-gray-secondary sm:text-base">
              {user.profile?.timezone || "Not set"}
            </p>
          </div>
          <div className="pt-2">
            <Badge
              className="border-2 border-charcoal bg-duck-yellow font-mono text-xs uppercase"
              style={{ borderRadius: "2px" }}
            >
              Edit profile coming soon
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card
        className="border-2 border-charcoal shadow-sm bg-bg-yellow-pale"
        style={{ borderRadius: "2px" }}
      >
        <CardHeader className="space-y-3 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-white"
              style={{ borderRadius: "2px" }}
            >
              <Bell className="h-5 w-5 text-charcoal" strokeWidth={2} />
            </div>
            <div>
              <CardTitle className="font-mono text-xl font-normal uppercase tracking-wide sm:text-2xl">
                Notifications
              </CardTitle>
              <CardDescription className="font-mono text-xs text-gray-secondary sm:text-sm">
                Control how you receive updates
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-5 pt-0 sm:p-6 sm:pt-0">
          <p className="font-mono text-sm text-gray-secondary">
            Email notifications for delivery confirmations, reminders, and updates.
          </p>
          <Badge
            className="border-2 border-charcoal bg-mustard font-mono text-xs uppercase"
            style={{ borderRadius: "2px" }}
          >
            Notification settings coming soon
          </Badge>
        </CardContent>
      </Card>

      {/* Timezone & Localization */}
      <Card
        className="border-2 border-charcoal shadow-sm bg-bg-green-light"
        style={{ borderRadius: "2px" }}
      >
        <CardHeader className="space-y-3 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-white"
              style={{ borderRadius: "2px" }}
            >
              <Globe className="h-5 w-5 text-charcoal" strokeWidth={2} />
            </div>
            <div>
              <CardTitle className="font-mono text-xl font-normal uppercase tracking-wide sm:text-2xl">
                Timezone & Localization
              </CardTitle>
              <CardDescription className="font-mono text-xs text-gray-secondary sm:text-sm">
                Delivery timing preferences
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-5 pt-0 sm:p-6 sm:pt-0">
          <p className="font-mono text-sm text-gray-secondary">
            All deliveries are scheduled in your local timezone. DST awareness ensures accurate delivery times.
          </p>
          <Badge
            className="border-2 border-charcoal bg-lime font-mono text-xs uppercase"
            style={{ borderRadius: "2px" }}
          >
            Timezone selector coming soon
          </Badge>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Link href="/settings/billing">
        <Card
          className="border-2 border-charcoal shadow-sm bg-bg-purple-light hover:shadow-md transition-shadow cursor-pointer"
          style={{ borderRadius: "2px" }}
        >
          <CardHeader className="space-y-3 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-white"
                style={{ borderRadius: "2px" }}
              >
                <CreditCard className="h-5 w-5 text-charcoal" strokeWidth={2} />
              </div>
              <div>
                <CardTitle className="font-mono text-xl font-normal uppercase tracking-wide sm:text-2xl">
                  Billing & Subscription
                </CardTitle>
                <CardDescription className="font-mono text-xs text-gray-secondary sm:text-sm">
                  Manage your subscription, usage, and payments
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-5 pt-0 sm:p-6 sm:pt-0">
            <p className="font-mono text-sm text-gray-secondary">
              View your subscription status, track usage, manage payment methods, and access invoices.
            </p>
            <Badge
              className="border-2 border-charcoal bg-lavender font-mono text-xs uppercase"
              style={{ borderRadius: "2px" }}
            >
              View Billing Settings →
            </Badge>
          </CardContent>
        </Card>
      </Link>

      {/* Privacy & Data */}
      <Card
        className="border-2 border-charcoal shadow-sm"
        style={{ borderRadius: "2px" }}
      >
        <CardHeader className="space-y-3 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-white"
              style={{ borderRadius: "2px" }}
            >
              <Lock className="h-5 w-5 text-charcoal" strokeWidth={2} />
            </div>
            <div>
              <CardTitle className="font-mono text-xl font-normal uppercase tracking-wide sm:text-2xl">
                Privacy & Data
              </CardTitle>
              <CardDescription className="font-mono text-xs text-gray-secondary sm:text-sm">
                Control your data and privacy settings
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-5 pt-0 sm:p-6 sm:pt-0">
          <p className="font-mono text-sm text-gray-secondary">
            All letters are encrypted at rest (AES-256-GCM). Export your data or delete your account at any time.
          </p>
          <Badge
            className="border-2 border-charcoal bg-sky-blue font-mono text-xs uppercase"
            style={{ borderRadius: "2px" }}
          >
            Privacy controls coming soon
          </Badge>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card
        className="border-2 border-charcoal shadow-md bg-bg-pink-light"
        style={{ borderRadius: "2px" }}
      >
        <CardHeader className="space-y-3 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-coral"
              style={{ borderRadius: "2px" }}
            >
              <AlertTriangle className="h-5 w-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <CardTitle className="font-mono text-xl font-normal uppercase tracking-wide text-coral sm:text-2xl">
                Danger Zone
              </CardTitle>
              <CardDescription className="font-mono text-xs text-gray-secondary sm:text-sm">
                Irreversible actions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-5 pt-0 sm:p-6 sm:pt-0">
          <p className="font-mono text-sm text-gray-secondary">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <Badge
            className="border-2 border-charcoal bg-coral font-mono text-xs uppercase text-white"
            style={{ borderRadius: "2px" }}
          >
            Account deletion coming soon
          </Badge>
        </CardContent>
      </Card>
    </div>
  )
}
