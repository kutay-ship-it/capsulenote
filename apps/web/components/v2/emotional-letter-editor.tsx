"use client"

import { useState } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import CharacterCount from "@tiptap/extension-character-count"
import Link from "@tiptap/extension-link"
import { format } from "date-fns"
import { Send, Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { type LetterFormData } from "@/components/letter-editor-form"
import { SchedulingWizard } from "@/components/v2/scheduling-wizard"

interface EmotionalLetterEditorProps {
    initialData?: Partial<LetterFormData>
    onSubmit: (data: LetterFormData) => void
    isSubmitting?: boolean
    userEmail?: string
}

export function EmotionalLetterEditor({
    initialData,
    onSubmit,
    isSubmitting = false,
    userEmail = "",
}: EmotionalLetterEditorProps) {
    const [title, setTitle] = useState(initialData?.title || "")
    const [wordCount, setWordCount] = useState(0)
    const [isWizardOpen, setIsWizardOpen] = useState(false)

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: "Dear Future Me,\n\nI'm writing this because...",
            }),
            CharacterCount,
            Link.configure({
                openOnClick: false,
            }),
        ],
        content: initialData?.bodyHtml || initialData?.body || "",
        immediatelyRender: false, // Prevent SSR hydration mismatch
        editorProps: {
            attributes: {
                class: "prose prose-lg focus:outline-none max-w-none font-serif text-charcoal leading-relaxed min-h-[400px]",
            },
        },
        onUpdate: ({ editor }) => {
            setWordCount(editor.storage.characterCount.words())
        },
    })

    const handleSealClick = () => {
        if (!editor || !title.trim()) return
        setIsWizardOpen(true)
    }

    const handleWizardComplete = (date: Date, recipient: { type: "self" | "other", email: string, name?: string }) => {
        if (!editor) return

        const html = editor.getHTML()
        const json = editor.getJSON()
        const plainText = editor.getText()

        // 1. Contextual Time Stamps
        const contextHtml = `
            <div class="capsule-context-stamp" style="margin-top: 4rem; padding-top: 2rem; border-top: 1px solid #e7e5e4; font-family: monospace; font-size: 0.875rem; color: #78716c;">
                <div style="display: flex; gap: 1.5rem; flex-wrap: wrap;">
                    <span>📍 Earth, ${format(new Date(), "yyyy")}</span>
                    <span>🌤️ ${["Sunny", "Rainy", "Cloudy"][Math.floor(Math.random() * 3)]}</span>
                    <span>🌑 Waxing Crescent</span>
                    <span>🎵 Top Song: "Birds of a Feather"</span>
                </div>
            </div>
        `

        const finalHtml = html + contextHtml

        onSubmit({
            title,
            body: plainText,
            bodyHtml: finalHtml,
            bodyRich: json as Record<string, unknown>,
            recipientEmail: recipient.email,
            deliveryDate: format(date, "yyyy-MM-dd"),
            deliveryType: "email",
            recipientType: recipient.type,
            recipientName: recipient.name,
        })
        // Don't close wizard immediately, let the submitting state handle UI feedback
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-20">
            {/* Header - Simplified */}
            <div className="p-6 bg-white rounded-xl border border-stone-100 shadow-sm">
                <div className="space-y-1">
                    <label className="text-xs font-medium text-stone-400 uppercase tracking-wider">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Give this moment a name..."
                        className="w-full text-xl font-serif text-charcoal placeholder:text-stone-300 border-none bg-transparent p-0 focus:ring-0"
                    />
                </div>
            </div>

            {/* Editor Surface */}
            <div className="relative min-h-[600px] bg-white rounded-xl shadow-sm border border-stone-100 p-8 md:p-12">
                {/* Paper Texture/Lines */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                    style={{ backgroundImage: "linear-gradient(#000 1px, transparent 1px)", backgroundSize: "100% 2rem", marginTop: "3rem" }}
                />

                <EditorContent editor={editor} />
            </div>

            {/* Footer / Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-stone-200 z-40">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div className="text-sm text-stone-500 font-mono">
                        {wordCount} words
                    </div>

                    <Button
                        onClick={handleSealClick}
                        disabled={isSubmitting || !title.trim()}
                        className="bg-charcoal text-white hover:bg-teal-900 rounded-full px-8 h-12 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                    >
                        <span className="flex items-center gap-2">
                            <span>Seal Letter</span>
                            <Send className="w-4 h-4" />
                        </span>
                    </Button>
                </div>
            </div>

            <SchedulingWizard
                isOpen={isWizardOpen}
                onClose={() => setIsWizardOpen(false)}
                onComplete={handleWizardComplete}
                isSubmitting={isSubmitting}
                initialRecipientEmail={userEmail}
            />
        </div>
    )
}
