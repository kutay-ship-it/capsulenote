"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { FileText, Sparkles } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getLetterTemplates, type LetterTemplate } from "@/server/actions/templates"
import { sanitizeTemplateHtml } from "@/lib/sanitize"
import { cn } from "@/lib/utils"

interface TemplateSelectorProps {
  onSelect: (template: LetterTemplate) => void
}

const CATEGORIES = [
  { value: "reflection", labelKey: "reflection" },
  { value: "goals", labelKey: "goals" },
  { value: "gratitude", labelKey: "gratitude" },
  { value: "future-self", labelKey: "futureSelf" },
] as const

export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  const t = useTranslations("templates")
  const [open, setOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("reflection")
  const [templates, setTemplates] = useState<LetterTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
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
        <Button
          type="button"
          variant="outline"
          className="gap-2 border-2 border-charcoal font-mono text-sm uppercase tracking-wide"
          style={{ borderRadius: "2px" }}
        >
          <Sparkles className="h-4 w-4" />
          {t("button")}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-3xl max-h-[80vh] overflow-y-auto border-2 border-charcoal bg-white"
        style={{
          borderRadius: "2px",
          boxShadow: "-8px 8px 0px 0px rgb(56, 56, 56)",
        }}
      >
        <DialogHeader>
          <DialogTitle className="font-mono text-xl uppercase tracking-wide text-charcoal">
            {t("modalTitle")}
          </DialogTitle>
          <DialogDescription className="font-mono text-sm text-gray-secondary">
            {t("modalDescription")}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          className="mt-4"
        >
          <TabsList
            className="grid w-full grid-cols-4 border-2 border-charcoal bg-off-white p-1"
            style={{ borderRadius: "2px" }}
          >
            {CATEGORIES.map((cat) => (
              <TabsTrigger
                key={cat.value}
                value={cat.value}
                className={cn(
                  "font-mono text-xs uppercase tracking-wide data-[state=active]:bg-duck-yellow data-[state=active]:text-charcoal"
                )}
                style={{ borderRadius: "2px" }}
              >
                {t(`categories.${cat.labelKey}`)}
              </TabsTrigger>
            ))}
          </TabsList>

          {CATEGORIES.map((cat) => (
            <TabsContent key={cat.value} value={cat.value} className="mt-4">
              {isLoading ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-48 animate-pulse border-2 border-charcoal/20 bg-off-white"
                      style={{ borderRadius: "2px" }}
                    />
                  ))}
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="py-8 text-center font-mono text-sm text-gray-secondary">
                  {t("noTemplates")}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredTemplates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleTemplateClick(template)}
                      className="group text-left border-2 border-charcoal bg-white p-4 transition-all hover:-translate-x-1 hover:-translate-y-1 hover:bg-duck-yellow/10"
                      style={{
                        borderRadius: "2px",
                        boxShadow: "-4px 4px 0px 0px rgb(56, 56, 56)",
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-charcoal bg-duck-blue"
                          style={{ borderRadius: "2px" }}
                        >
                          <FileText className="h-5 w-5 text-charcoal" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-mono text-sm font-medium uppercase tracking-wide text-charcoal">
                            {template.title}
                          </h3>
                          {template.description && (
                            <p className="mt-1 font-mono text-xs text-gray-secondary line-clamp-2">
                              {template.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div
                        className="mt-3 prose prose-sm max-h-24 overflow-hidden font-mono text-xs text-charcoal/60"
                        dangerouslySetInnerHTML={{ __html: sanitizeTemplateHtml(template.promptText) }}
                      />
                      <div className="mt-3 flex justify-end">
                        <span className="font-mono text-xs uppercase tracking-wide text-duck-blue group-hover:text-charcoal">
                          {t("useTemplate")} →
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
