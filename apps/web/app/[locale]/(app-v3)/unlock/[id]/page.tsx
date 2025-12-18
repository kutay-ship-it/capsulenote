import { notFound, redirect } from "next/navigation"
import { getLetterForUnlock } from "@/server/actions/letters"
import { LetterUnlockerV3 } from "@/components/v3/letter-unlocker-v3"
import type { Locale } from "@/i18n/routing"

interface UnlockPageProps {
  params: Promise<{ id: string; locale: Locale }>
  searchParams: Promise<{ replay?: string }>
}

export default async function UnlockV3Page({
  params,
  searchParams,
}: UnlockPageProps) {
  const { id, locale } = await params
  const { replay } = await searchParams
  const prefix = locale === "en" ? "" : `/${locale}`

  // Fetch letter with validation
  const result = await getLetterForUnlock(id)

  if (!result.success) {
    // Handle different error cases
    if (result.error?.code === "NOT_FOUND") {
      notFound()
    }

    // If letter not delivered yet, redirect to letter detail with message
    if (result.error?.code === "VALIDATION_FAILED") {
      redirect(`${prefix}/letters/${id}`)
    }

    // For other errors, show not found
    notFound()
  }

  const letter = result.data

  return (
    <div className="min-h-screen bg-duck-cream">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <LetterUnlockerV3
          letterId={letter.id}
          letterTitle={letter.title}
          letterContent={letter.bodyHtml}
          writtenDate={letter.createdAt}
          deliveryDate={letter.delivery.deliverAt}
          firstOpenedAt={letter.firstOpenedAt}
          isReplay={replay === "true"}
        />
      </main>
    </div>
  )
}
