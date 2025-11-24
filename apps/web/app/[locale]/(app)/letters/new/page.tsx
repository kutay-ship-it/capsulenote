import { Badge } from "@/components/ui/badge"
import { LetterDraftForm } from "@/components/letter-draft-form"

export default function NewLetterPage() {
  return (
    <div className="min-h-screen bg-cream py-8 px-4 sm:py-12 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-3 sm:space-y-4">
          <Badge variant="outline" className="text-xs uppercase tracking-wide">
            Step 1: Write
          </Badge>
          <h1 className="font-mono text-2xl font-bold uppercase tracking-wide text-charcoal sm:text-3xl md:text-4xl">
            Write Your Letter
          </h1>
          <p className="font-mono text-sm leading-relaxed text-gray-secondary sm:text-base">
            Focus on your thoughts. You'll schedule delivery in the next step.
          </p>
        </div>

        {/* Letter Draft Form */}
        <LetterDraftForm accentColor="blue" />
      </div>
    </div>
  )
}
