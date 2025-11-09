"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import CharacterCount from "@tiptap/extension-character-count"
import Link from "@tiptap/extension-link"
import { Button } from "@/components/ui/button"
import { Bold, Italic, List, ListOrdered, Quote } from "lucide-react"

interface LetterEditorProps {
  content?: string
  onChange?: (json: Record<string, unknown>, html: string) => void
  placeholder?: string
}

export function LetterEditor({ content, onChange, placeholder }: LetterEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder || "Write your letter to your future self...",
      }),
      CharacterCount,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg focus:outline-none max-w-none",
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON()
      const html = editor.getHTML()
      onChange?.(json as Record<string, unknown>, html)
    },
  })

  if (!editor) {
    return null
  }

  const characterCount = editor.storage.characterCount.characters()

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 rounded-lg border bg-muted/50 p-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-muted" : ""}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-muted" : ""}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-muted" : ""}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "bg-muted" : ""}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "bg-muted" : ""}
        >
          <Quote className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <div className="min-h-[400px] rounded-lg border bg-background p-4">
        <EditorContent editor={editor} />
      </div>

      {/* Character count */}
      <div className="text-sm text-muted-foreground">
        {characterCount} {characterCount === 1 ? "character" : "characters"}
      </div>
    </div>
  )
}
