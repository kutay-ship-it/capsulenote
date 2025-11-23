"use client"

import { useEffect } from "react"
import { useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export default function SSOCallbackPage() {
  const { handleRedirectCallback } = useClerk()
  const router = useRouter()

  useEffect(() => {
    async function handleCallback() {
      try {
        await handleRedirectCallback()
        router.push("/dashboard")
      } catch (err) {
        console.error("SSO callback error:", err)
        router.push("/sign-in")
      }
    }

    handleCallback()
  }, [handleRedirectCallback, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/20">
      <div className="text-center">
        <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
        <p className="text-sm text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  )
}
