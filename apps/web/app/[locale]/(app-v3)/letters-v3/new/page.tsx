import { ArrowLeft, PenLine } from "lucide-react"

import { Link } from "@/i18n/routing"
import { Button } from "@/components/ui/button"
import { LetterEditorV3 } from "@/components/v3/letter-editor-v3"

export default function NewLetterV3Page() {
  return (
    <div className="container">
      {/* Header - matches letters-v3 page pattern */}
      <header className="flex flex-col gap-4 py-12 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Link href="/letters-v3">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 -ml-4 font-mono text-xs uppercase tracking-wider text-charcoal/60 hover:text-charcoal"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Letters
            </Button>
          </Link>
          <h1 className="font-mono text-3xl font-bold uppercase tracking-wide text-charcoal">
            Write a Letter
          </h1>
          <p className="font-mono text-sm text-charcoal/70">
            A message to your future self, delivered when you need it most.
          </p>
        </div>
      </header>

      {/* Editor Section */}
      <section className="pb-12">
        <LetterEditorV3 />
      </section>
    </div>
  )
}
