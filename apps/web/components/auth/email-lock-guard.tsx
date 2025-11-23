"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser, useClerk } from "@clerk/nextjs"
import { toast } from "@/hooks/use-toast"

/**
 * Client-side guard to ensure lockedEmail (from checkout) matches current Clerk email.
 * If mismatch, signs out and redirects to sign-in.
 */
export function EmailLockGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded || !user) return

    const lockedEmail = (user.unsafeMetadata as any)?.lockedEmail as string | undefined
    if (lockedEmail) {
      const primaryEmail = user.primaryEmailAddress?.emailAddress?.toLowerCase()
      if (primaryEmail && primaryEmail !== lockedEmail.toLowerCase()) {
        toast({
          variant: "destructive",
          title: "Email mismatch",
          description: "Please sign in with the email used at checkout.",
        })
        signOut().then(() => router.push("/sign-in"))
      }
    }
  }, [isLoaded, user, signOut, router])

  return <>{children}</>
}
