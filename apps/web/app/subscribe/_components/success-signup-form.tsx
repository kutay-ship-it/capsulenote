/**
 * Success Signup Form Component
 *
 * Clerk SignUp component with locked email for post-payment signup.
 * Customized appearance to match design system.
 *
 * Client Component - uses Clerk SignUp
 */

"use client"

import { SignUp } from "@clerk/nextjs"

interface SuccessSignupFormProps {
  /** Email address from payment (locked) */
  email: string
}

export function SuccessSignupForm({ email }: SuccessSignupFormProps) {
  return (
    <div className="w-full">
      <SignUp
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "border-0 shadow-none bg-transparent w-full",
            headerTitle: "hidden",
            headerSubtitle: "hidden",
            socialButtonsBlockButton: "border-2 border-charcoal font-mono hover:bg-gray-50",
            dividerLine: "bg-charcoal",
            dividerText: "font-mono text-xs text-gray-secondary uppercase tracking-wide",
            formFieldLabel: "font-mono text-sm uppercase tracking-wide text-charcoal",
            formFieldInput: "border-2 border-charcoal font-mono",
            formButtonPrimary:
              "bg-charcoal hover:bg-gray-800 font-mono uppercase tracking-wide",
            footerActionLink: "text-charcoal hover:text-gray-800",
            identityPreviewEditButton: "text-charcoal hover:text-gray-800",
          },
        }}
        routing="hash"
        initialValues={{
          emailAddress: email,
        }}
        signInUrl="/sign-in"
        afterSignUpUrl="/dashboard"
        // Lock email field
        unsafeMetadata={{
          emailLocked: true,
        }}
      />

      {/* Email Locked Notice */}
      <div className="mt-4 rounded-lg border-2 border-charcoal bg-off-white p-3">
        <p className="font-mono text-xs text-charcoal">
          <strong>Email locked:</strong> {email}
          <br />
          This email was used for payment and cannot be changed for security reasons.
        </p>
      </div>
    </div>
  )
}
