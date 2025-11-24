"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  User, Mail, Clock, Bell, Shield, Download, Trash2,
  Globe, Sparkles, CheckCircle2, AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

type NotificationSetting = {
  id: string
  label: string
  description: string
  enabled: boolean
}

export default function SettingsPage() {
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle")
  const [profileName, setProfileName] = useState("Future Me")
  const [email, setEmail] = useState("user@example.com")
  const [timezone, setTimezone] = useState("America/Los_Angeles")

  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    {
      id: "delivery",
      label: "Delivery notifications",
      description: "Get notified when your letter is delivered",
      enabled: true
    },
    {
      id: "reminder",
      label: "Writing reminders",
      description: "Weekly prompts to write a new letter",
      enabled: true
    },
    {
      id: "reflection",
      label: "Reflection prompts",
      description: "Reminders to reflect on delivered letters",
      enabled: false
    },
    {
      id: "streak",
      label: "Streak alerts",
      description: "Notifications about your writing streak",
      enabled: true
    }
  ])

  const handleSave = () => {
    setSaveState("saving")
    setTimeout(() => {
      setSaveState("saved")
      setTimeout(() => setSaveState("idle"), 2000)
    }, 500)
  }

  const toggleNotification = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, enabled: !n.enabled } : n)
    )
  }

  return (
    <div className="container max-w-4xl py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-mono text-3xl uppercase tracking-tight text-charcoal">
                Settings
              </h1>
              <p className="mt-1 font-mono text-sm text-gray-secondary">
                Manage your account and preferences
              </p>
            </div>
            <Button
              onClick={handleSave}
              disabled={saveState === "saving"}
              className={cn(
                "border-2 border-charcoal font-mono text-xs uppercase",
                saveState === "saved" && "bg-duck-green"
              )}
            >
              {saveState === "saving" && "Saving..."}
              {saveState === "saved" && (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Saved
                </>
              )}
              {saveState === "idle" && "Save changes"}
            </Button>
          </div>
        </div>

        <Separator className="border-2 border-dashed border-charcoal" />

        <Card className="border-2 border-charcoal">
          <CardHeader className="border-b-2 border-charcoal bg-bg-purple-light/20">
            <CardTitle className="flex items-center gap-2 font-mono text-lg uppercase tracking-wide">
              <User className="h-5 w-5" />
              Profile
            </CardTitle>
            <CardDescription className="font-mono text-xs text-gray-secondary">
              Your personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-mono text-xs uppercase text-charcoal">
                Display name
              </Label>
              <Input
                id="name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="border-2 border-charcoal font-mono text-sm"
              />
              <p className="font-mono text-xs text-gray-secondary">
                How you'll address your future self in letters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-mono text-xs uppercase text-charcoal">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-2 border-charcoal font-mono text-sm"
              />
              <p className="font-mono text-xs text-gray-secondary">
                Where we'll deliver your letters
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-charcoal">
          <CardHeader className="border-b-2 border-charcoal bg-bg-yellow-pale">
            <CardTitle className="flex items-center gap-2 font-mono text-lg uppercase tracking-wide">
              <Clock className="h-5 w-5" />
              Timezone
            </CardTitle>
            <CardDescription className="font-mono text-xs text-gray-secondary">
              Critical for accurate delivery timing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="rounded-sm border-2 border-charcoal bg-bg-blue-light/30 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-mono text-xs font-bold uppercase text-charcoal">
                    Why timezone matters
                  </p>
                  <p className="mt-1 font-mono text-xs text-gray-secondary leading-relaxed">
                    Letters are delivered at the exact time you specify. Setting your correct timezone ensures
                    your future self receives letters at the perfect moment, accounting for daylight saving time.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone" className="font-mono text-xs uppercase text-charcoal">
                Your timezone
              </Label>
              <select
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full rounded-md border-2 border-charcoal bg-white px-3 py-2 font-mono text-sm text-charcoal"
              >
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Paris">Paris (CET)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
                <option value="Australia/Sydney">Sydney (AEDT)</option>
              </select>
              <p className="font-mono text-xs text-gray-secondary">
                Current time in {timezone}: {new Date().toLocaleTimeString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-charcoal">
          <CardHeader className="border-b-2 border-charcoal bg-bg-purple-light/20">
            <CardTitle className="flex items-center gap-2 font-mono text-lg uppercase tracking-wide">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription className="font-mono text-xs text-gray-secondary">
              Choose what updates you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-center justify-between rounded-sm border-2 border-charcoal bg-white p-4"
              >
                <div className="flex-1">
                  <p className="font-mono text-sm font-bold uppercase text-charcoal">
                    {notification.label}
                  </p>
                  <p className="mt-1 font-mono text-xs text-gray-secondary">
                    {notification.description}
                  </p>
                </div>
                <Switch
                  checked={notification.enabled}
                  onCheckedChange={() => toggleNotification(notification.id)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-2 border-charcoal">
          <CardHeader className="border-b-2 border-charcoal bg-bg-blue-light/20">
            <CardTitle className="flex items-center gap-2 font-mono text-lg uppercase tracking-wide">
              <Shield className="h-5 w-5" />
              Privacy & Security
            </CardTitle>
            <CardDescription className="font-mono text-xs text-gray-secondary">
              Data management and account security
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-sm border-2 border-charcoal bg-white p-4">
                <div>
                  <p className="font-mono text-sm font-bold uppercase text-charcoal">
                    Encryption status
                  </p>
                  <p className="mt-1 font-mono text-xs text-gray-secondary">
                    All letters encrypted with AES-256-GCM
                  </p>
                </div>
                <Badge className="bg-duck-green border-2 border-charcoal font-mono text-xs text-white">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Active
                </Badge>
              </div>

              <div className="flex items-center justify-between rounded-sm border-2 border-charcoal bg-white p-4">
                <div>
                  <p className="font-mono text-sm font-bold uppercase text-charcoal">
                    Two-factor authentication
                  </p>
                  <p className="mt-1 font-mono text-xs text-gray-secondary">
                    Add extra security to your account
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-2 border-charcoal font-mono text-xs uppercase"
                >
                  Enable
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-charcoal">
          <CardHeader className="border-b-2 border-charcoal bg-coral/10">
            <CardTitle className="flex items-center gap-2 font-mono text-lg uppercase tracking-wide">
              <Download className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription className="font-mono text-xs text-gray-secondary">
              Export or delete your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start border-2 border-charcoal font-mono text-xs uppercase"
              >
                <Download className="mr-2 h-4 w-4" />
                Download all my data
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-2 border-charcoal font-mono text-xs uppercase text-red-600 hover:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete account
              </Button>
            </div>

            <div className="rounded-sm border border-dashed border-charcoal bg-bg-yellow-pale/50 p-4">
              <p className="font-mono text-xs text-gray-secondary leading-relaxed">
                Data export includes all letters, deliveries, and reflections in JSON format.
                Account deletion is permanent and cannot be undone.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-charcoal bg-duck-green/10">
          <CardContent className="flex items-center gap-4 p-6">
            <Sparkles className="h-8 w-8 text-purple-600" />
            <div className="flex-1">
              <p className="font-mono text-sm font-bold text-charcoal">
                Settings saved automatically
              </p>
              <p className="mt-1 font-mono text-xs text-gray-secondary">
                Your preferences are securely stored and apply to all future letters.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
