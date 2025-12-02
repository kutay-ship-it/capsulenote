import { getLetterById } from "@/server/actions/letters"
import { LetterUnlocker } from "@/components/v2/letter-unlocker"
import { notFound } from "next/navigation"

export default async function UnlockPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const letter = await getLetterById(id)

    if (!letter) {
        notFound()
    }

    // In a real scenario, we would check if the delivery date has passed.
    // For now, we allow unlocking if the user has the link and owns the letter.
    // const isReady = new Date() >= new Date(letter.deliverAt)

    return (
        <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
            <main className="flex-1 container mx-auto px-4 py-8">
                <LetterUnlocker
                    letterTitle={letter.title}
                    letterContent={letter.bodyHtml || ""}
                    deliveryDate={letter.createdAt} // Using createdAt as "Written on" date
                />
            </main>
        </div>
    )
}
