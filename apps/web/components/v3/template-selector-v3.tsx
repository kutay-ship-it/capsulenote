"use client"

import * as React from "react"
import { FileText, Sparkles, X, ChevronRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { getLetterTemplates, type LetterTemplate } from "@/server/actions/templates"
import { cn } from "@/lib/utils"

interface TemplateSelectorV3Props {
  onSelect: (template: LetterTemplate) => void
}

const CATEGORIES = [
  { value: "reflection", label: "Reflection", icon: "🪞" },
  { value: "goals", label: "Goals", icon: "🎯" },
  { value: "gratitude", label: "Gratitude", icon: "💝" },
  { value: "future-self", label: "Future Self", icon: "🔮" },
] as const

export function TemplateSelectorV3({ onSelect }: TemplateSelectorV3Props) {
  const [open, setOpen] = React.useState(false)
  const [selectedCategory, setSelectedCategory] = React.useState<string>("reflection")
  const [templates, setTemplates] = React.useState<LetterTemplate[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    if (open) {
      setIsLoading(true)
      getLetterTemplates()
        .then(setTemplates)
        .finally(() => setIsLoading(false))
    }
  }, [open])

  const filteredTemplates = templates.filter((t) => t.category === selectedCategory)

  const handleTemplateClick = (template: LetterTemplate) => {
    onSelect(template)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "w-full flex items-center justify-between gap-3 border-2 border-charcoal px-4 py-3 font-mono text-[10px] uppercase tracking-wider transition-all duration-150",
            "bg-white text-charcoal shadow-[2px_2px_0_theme(colors.charcoal)]",
            "hover:-translate-y-0.5 hover:shadow-[3px_3px_0_theme(colors.charcoal)] hover:bg-duck-yellow"
          )}
          style={{ borderRadius: "2px" }}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" strokeWidth={2} />
            <span>Browse Templates</span>
          </div>
          <ChevronRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </DialogTrigger>
      <DialogContent
        className="max-w-2xl max-h-[85vh] overflow-hidden border-2 border-charcoal bg-white p-0"
        style={{
          borderRadius: "2px",
          boxShadow: "8px 8px 0px 0px rgb(56, 56, 56)",
        }}
      >
        {/* Header */}
        <DialogHeader className="relative border-b-2 border-charcoal bg-duck-yellow p-6">
          <div
            className="absolute -top-3 left-6 flex items-center gap-1.5 px-3 py-1 bg-charcoal font-mono text-[10px] font-bold uppercase tracking-wider text-white"
            style={{ borderRadius: "2px" }}
          >
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
            <span>Templates</span>
          </div>
          <DialogTitle className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal pt-2">
            Choose a Template
          </DialogTitle>
          <p className="font-mono text-xs text-charcoal/70 mt-1">
            Start with a prompt to inspire your letter
          </p>
        </DialogHeader>

        <div className="flex h-[60vh]">
          {/* Category Sidebar */}
          <div className="w-48 flex-shrink-0 border-r-2 border-charcoal bg-off-white p-3 overflow-y-auto">
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50 mb-3 px-2">
              Categories
            </p>
            <div className="space-y-1">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.value
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setSelectedCategory(cat.value)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2.5 font-mono text-xs uppercase tracking-wider transition-all text-left",
                      isSelected
                        ? "bg-charcoal text-white"
                        : "bg-transparent text-charcoal hover:bg-white"
                    )}
                    style={{ borderRadius: "2px" }}
                  >
                    <span className="text-sm">{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-40 animate-pulse border-2 border-charcoal/20 bg-off-white"
                    style={{ borderRadius: "2px" }}
                  />
                ))}
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div
                  className="flex h-16 w-16 items-center justify-center border-2 border-charcoal/20 bg-off-white mb-4"
                  style={{ borderRadius: "2px" }}
                >
                  <FileText className="h-8 w-8 text-charcoal/30" strokeWidth={2} />
                </div>
                <p className="font-mono text-sm text-charcoal/50">
                  No templates in this category yet
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {filteredTemplates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleTemplateClick(template)}
                    className={cn(
                      "group text-left border-2 border-charcoal bg-white p-4 transition-all duration-150",
                      "hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)] hover:border-duck-blue",
                      "shadow-[2px_2px_0_theme(colors.charcoal)]"
                    )}
                    style={{ borderRadius: "2px" }}
                  >
                    {/* Template Header */}
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-charcoal bg-duck-blue group-hover:bg-duck-yellow transition-colors"
                        style={{ borderRadius: "2px" }}
                      >
                        <FileText className="h-4 w-4 text-charcoal" strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal line-clamp-1">
                          {template.title}
                        </h3>
                        {template.description && (
                          <p className="mt-0.5 font-mono text-[10px] text-charcoal/50 line-clamp-1">
                            {template.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Template Preview */}
                    <div
                      className="mt-3 max-h-16 overflow-hidden font-mono text-[11px] text-charcoal/60 leading-relaxed line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: template.promptText }}
                    />

                    {/* Use Template CTA */}
                    <div className="mt-3 flex items-center justify-between border-t border-dashed border-charcoal/10 pt-3">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-charcoal/40">
                        Click to use
                      </span>
                      <ChevronRight
                        className="h-4 w-4 text-charcoal/30 transition-transform group-hover:translate-x-1 group-hover:text-duck-blue"
                        strokeWidth={2}
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
