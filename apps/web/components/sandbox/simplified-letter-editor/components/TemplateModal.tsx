"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { templates } from "../lib/templates"
import type { TemplateData } from "../types"

interface TemplateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (template: TemplateData) => void
}

export function TemplateModal({ open, onOpenChange, onSelect }: TemplateModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<TemplateData['category']>('reflection')

  const categories: Array<{ value: TemplateData['category']; label: string }> = [
    { value: 'reflection', label: 'Reflection' },
    { value: 'goals', label: 'Goals' },
    { value: 'gratitude', label: 'Gratitude' },
    { value: 'future-self', label: 'Future Self' },
  ]

  const filteredTemplates = templates.filter(t => t.category === selectedCategory)

  const handleTemplateClick = (template: TemplateData) => {
    onSelect(template)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-mono text-xl uppercase">Letter Templates</DialogTitle>
          <DialogDescription>
            Choose a template to get started with your letter
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedCategory} onValueChange={(val) => setSelectedCategory(val as TemplateData['category'])}>
          <TabsList className="grid w-full grid-cols-4">
            {categories.map((cat) => (
              <TabsTrigger key={cat.value} value={cat.value} className="font-mono text-xs">
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((cat) => (
            <TabsContent key={cat.value} value={cat.value} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {filteredTemplates.map((template) => (
                  <Card
                    key={template.id}
                    className="cursor-pointer transition-all hover:border-purple-600 hover:shadow-md"
                    onClick={() => handleTemplateClick(template)}
                  >
                    <CardHeader>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      {template.description && (
                        <CardDescription className="text-xs">{template.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div
                        className="prose prose-sm max-h-32 overflow-hidden text-xs opacity-60"
                        dangerouslySetInnerHTML={{ __html: template.content }}
                      />
                      <Button size="sm" variant="ghost" className="mt-2 w-full text-xs">
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
