import { redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { ScheduleDeliveryForm } from "@/components/schedule-delivery-form"
import { requireUser } from "@/server/lib/auth"
import { prisma } from "@/server/lib/db"
import { decryptLetter } from "@/server/lib/encryption"

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ScheduleDeliveryPage({ params }: PageProps) {
  const { id } = await params

  // Get current user
  const user = await requireUser().catch(() => {
    redirect("/sign-in")
    return null
  })

  if (!user) {
    redirect("/sign-in")
  }

  // Fetch letter
  const letter = await prisma.letter.findUnique({
    where: {
      id,
      userId: user.id, // Ensure user owns this letter
    },
  })

  if (!letter) {
    redirect("/letters")
  }

  // Decrypt letter to show preview
  const decrypted = await decryptLetter(
    letter.bodyCiphertext,
    letter.bodyNonce,
    letter.keyVersion
  )

  return (
    <div className="min-h-screen bg-cream py-8 px-4 sm:py-12 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-6 sm:space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-3 sm:space-y-4">
          <Badge variant="outline" className="text-xs uppercase tracking-wide">
            Step 2: Schedule
          </Badge>
          <h1 className="font-mono text-2xl font-bold uppercase tracking-wide text-charcoal sm:text-3xl md:text-4xl">
            Schedule Your Letter
          </h1>
          <p className="font-mono text-sm leading-relaxed text-gray-secondary sm:text-base">
            Choose when your letter should arrive in your inbox
          </p>
        </div>

        {/* Schedule Form */}
        <ScheduleDeliveryForm
          letterId={id}
          letterTitle={letter.title}
          letterPreview={decrypted.bodyHtml}
          userEmail={user.email}
        />
      </div>
    </div>
  )
}
