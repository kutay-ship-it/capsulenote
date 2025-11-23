import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { Card, CardContent } from "@/components/ui/card"
import { CustomSignUpForm } from "@/components/auth/custom-sign-up"

interface PageProps {
  searchParams: Promise<{
    email?: string
  }>
}

export default async function SignUpPage({ searchParams }: PageProps) {
  // Redirect if already signed in
  const { userId } = await auth()
  if (userId) {
    redirect("/dashboard")
  }

  const params = await searchParams
  const lockedEmail = params.email

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/20">
      <div className="w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
          <p className="mt-2 text-muted-foreground">
            Start writing letters to your future self today
          </p>
        </div>
        {lockedEmail && (
          <Card className="mb-6 border-2 border-charcoal">
            <CardContent className="p-4">
              <p className="font-mono text-xs text-charcoal">
                Signing up with <strong>{lockedEmail}</strong>. This email was used at checkout and
                cannot be changed for this account.
              </p>
            </CardContent>
          </Card>
        )}
        <CustomSignUpForm lockedEmail={lockedEmail} />
      </div>
    </div>
  )
}
