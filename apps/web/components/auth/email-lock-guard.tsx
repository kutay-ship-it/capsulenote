"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser, useClerk } from "@clerk/nextjs"
import { useTranslations } from "next-intl"
import { toast } from "sonner"

/**
 * Client-side guard to ensure lockedEmail (from checkout) matches current Clerk email.
 * If mismatch, signs out and redirects to sign-in.
 */
export function EmailLockGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const t = useTranslations("auth.emailLockGuard")

  useEffect(() => {
    if (!isLoaded || !user) return

    const lockedEmail = (user.unsafeMetadata as any)?.lockedEmail as string | undefined
    if (lockedEmail) {
      const primaryEmail = user.primaryEmailAddress?.emailAddress?.toLowerCase()
      if (primaryEmail && primaryEmail !== lockedEmail.toLowerCase()) {
        toast.error(t("title"), {
          description: t("description"),
        })
        signOut().then(() => router.push("/sign-in"))
      }
    }
  }, [isLoaded, user, signOut, router, t])

  return <>{children}</>
}
