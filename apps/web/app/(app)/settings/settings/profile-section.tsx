"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { User } from "@prisma/client"
import { UserCircle } from "lucide-react"

interface ProfileSectionProps {
  user: User
}

export function ProfileSection({ user }: ProfileSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserCircle className="h-5 w-5" />
          <CardTitle>Profile</CardTitle>
        </div>
        <CardDescription>
          Your account information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Email</Label>
          <div className="text-sm text-muted-foreground">{user.email}</div>
        </div>

        <div className="space-y-2">
          <Label>Account ID</Label>
          <div className="text-sm text-muted-foreground font-mono text-xs">
            {user.id}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Member Since</Label>
          <div className="text-sm text-muted-foreground">
            {new Date(user.createdAt).toLocaleDateString("en-US", {
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
