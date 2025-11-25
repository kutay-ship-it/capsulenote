"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { fromZonedTime } from "date-fns-tz"
import { ArrowLeft } from "lucide-react"
import { useUser } from "@clerk/nextjs"

import { type LetterFormData } from "@/components/letter-editor-form"
import { EmotionalLetterEditor } from "@/components/v2/emotional-letter-editor"
import { TemplateSelector } from "@/components/v2/template-selector"
import { createLetter } from "@/server/actions/letters"
import { scheduleDelivery } from "@/server/actions/deliveries"
import { getUserTimezone } from "@/lib/utils"

import { CapsuleSealedAnimation } from "@/components/v2/capsule-sealed-animation"

export default function NewLetterPageV2() {
    const router = useRouter()
    const { user } = useUser()
    const userEmail = user?.primaryEmailAddress?.emailAddress || ""

    const t = useTranslations("forms.dashboardEditor")
    const [isPending, startTransition] = useTransition()
    const [step, setStep] = useState<"templates" | "write" | "success">("templates")
    const [createdLetterId, setCreatedLetterId] = useState<string | null>(null)
    const [initialData, setInitialData] = useState<LetterFormData>({
        title: "",
        body: "",
        recipientEmail: "",
        deliveryDate: "",
        deliveryType: "email",
        recipientType: "self",
        timezone: getUserTimezone(),
    })

    const handleTemplateSelect = (template: any) => {
        setInitialData(prev => ({
            ...prev,
            title: template.title,
            bodyHtml: template.prompt, // Pre-fill with prompt HTML
        }))
        setStep("write")
    }

    const handleStartBlank = () => {
        setStep("write")
    }

    const handleLetterSubmit = (data: LetterFormData) => {
        if (isPending) return

        startTransition(async () => {
            try {
                const result = await createLetter({
                    title: data.title,
                    bodyRich: data.bodyRich ?? { type: 'doc', content: [] },
                    bodyHtml: data.bodyHtml ?? '',
                    tags: [],
                    visibility: 'private' as const,
                })

                if (result.success) {
                    const letterId = result.data.letterId
                    const timezone = data.timezone || getUserTimezone()
                    const deliverAt = fromZonedTime(`${data.deliveryDate}T09:00`, timezone)

                    try {
                        await scheduleDelivery({
                            letterId,
                            channel: data.deliveryType === "physical" ? "mail" : "email",
                            deliverAt,
                            timezone,
                            toEmail: data.recipientEmail,
                        })
                    } catch (scheduleError) {
                        console.error("Scheduling error", scheduleError)
                        // Toast handled in component usually, but here we just log
                    }

                    setCreatedLetterId(letterId)
                    setStep("success")
                } else {
                    toast.error(result.error.message || "Failed to create letter")
                }
            } catch (error) {
                console.error('Letter creation error:', error)
                toast.error("An unexpected error occurred")
            }
        })
    }

    const handleAnimationComplete = () => {
        if (createdLetterId) {
            router.push(`/letters-v2/${createdLetterId}`)
        }
    }

    if (step === "success") {
        return <CapsuleSealedAnimation onComplete={handleAnimationComplete} />
    }

    if (step === "templates") {
        return (
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-4 mb-12">
                    <h1 className="font-serif text-4xl text-charcoal">
                        What's on your mind?
                    </h1>
                    <p className="text-stone-500 text-lg">
                        Choose a starting point or write from scratch.
                    </p>
                </div>

                <TemplateSelector onSelect={handleTemplateSelect} />

                <div className="flex justify-center pt-8">
                    <button
                        onClick={handleStartBlank}
                        className="text-stone-500 hover:text-charcoal font-medium transition-colors border-b border-transparent hover:border-charcoal pb-0.5"
                    >
                        Start with a blank page
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto">
            <button
                onClick={() => setStep("templates")}
                className="flex items-center gap-2 text-stone-500 hover:text-charcoal mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to templates</span>
            </button>

            <EmotionalLetterEditor
                onSubmit={handleLetterSubmit}
                initialData={initialData}
                isSubmitting={isPending}
                userEmail={userEmail}
            />
        </div>
    )
}
