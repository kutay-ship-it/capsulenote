"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LetterEditor } from "@/components/letter-editor"
import { createLetter } from "@/server/actions/letters"
import { useToast } from "@/hooks/use-toast"

export default function NewLetterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [title, setTitle] = useState("")
  const [bodyRich, setBodyRich] = useState<Record<string, unknown>>({})
  const [bodyHtml, setBodyHtml] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleEditorChange = (json: Record<string, unknown>, html: string) => {
    setBodyRich(json)
    setBodyHtml(html)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a title for your letter",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createLetter({
        title,
        bodyRich,
        bodyHtml,
        tags: [],
        visibility: "private",
      })

      toast({
        title: "Success",
        description: "Your letter has been created",
      })

      router.push(`/letters/${result.letterId}`)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create letter",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Write a New Letter</h1>
        <p className="text-muted-foreground">Compose a message to your future self</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Letter Details</CardTitle>
            <CardDescription>
              Give your letter a title and write your message below
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Reflections on 2024"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Your Letter</Label>
              <LetterEditor onChange={handleEditorChange} />
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Letter"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
