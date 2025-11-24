import type { Metadata } from "next"
import { CustomResetPasswordForm } from "@/components/auth/custom-reset-password"

export const metadata: Metadata = {
  title: "Reset Password | Capsule Note",
  robots: { index: false, follow: false },
  alternates: {
    canonical: "/reset-password",
  },
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/20">
      <div className="w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Reset Password</h1>
          <p className="mt-2 text-muted-foreground">
            We’ll email you a verification code to set a new password.
          </p>
        </div>
        <CustomResetPasswordForm />
      </div>
    </div>
  )
}
