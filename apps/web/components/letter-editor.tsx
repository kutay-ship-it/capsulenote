"use client"

import { useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import CharacterCount from "@tiptap/extension-character-count"
import Link from "@tiptap/extension-link"
import { Button } from "@/components/ui/button"
import { Bold, Italic, List, ListOrdered, Quote } from "lucide-react"
import { cn } from "@/lib/utils"

interface LetterEditorProps {
  /** Initial content as HTML string or TipTap JSON */
  content?: string | Record<string, unknown>
  /** Called when content changes with JSON and HTML */
  onChange?: (json: Record<string, unknown>, html: string) => void
  /** Placeholder text for empty editor */
  placeholder?: string
  /** Minimum height for editor area */
  minHeight?: string
  /** Additional CSS classes for container */
  className?: string
  /** Show/hide character count */
  showCharCount?: boolean
}

export function LetterEditor({
  content,
  onChange,
  placeholder,
  minHeight = "280px",
  className,
  showCharCount = false,
}: LetterEditorProps) {
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
        class: "prose prose-sm sm:prose focus:outline-none max-w-none font-mono text-charcoal",
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON()
      const html = editor.getHTML()
      onChange?.(json as Record<string, unknown>, html)
    },
  })

  // Update content when prop changes (for template injection)
  useEffect(() => {
    if (editor && content) {
      // Only update if content is different to avoid cursor issues
      const currentContent = editor.getHTML()
      const newContent = typeof content === "string" ? content : ""
      if (typeof content === "object") {
        editor.commands.setContent(content)
      } else if (newContent && newContent !== currentContent) {
        editor.commands.setContent(content)
      }
    }
  }, [editor, content])

  if (!editor) {
    return null
  }

  const characterCount = editor.storage.characterCount.characters()
  const wordCount = editor.storage.characterCount.words()

  return (
    <div className={cn("space-y-3 flex flex-col", className)}>
      {/* Toolbar - Brutalist Design */}
      <div
        className="flex flex-wrap gap-1.5 border-2 border-charcoal bg-off-white p-2"
        style={{ borderRadius: "2px" }}
      >
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            "h-8 w-8 p-0 border border-transparent hover:border-charcoal",
            editor.isActive("bold") && "bg-duck-yellow border-charcoal"
          )}
          style={{ borderRadius: "2px" }}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            "h-8 w-8 p-0 border border-transparent hover:border-charcoal",
            editor.isActive("italic") && "bg-duck-yellow border-charcoal"
          )}
          style={{ borderRadius: "2px" }}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-charcoal/20 mx-1 self-center" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            "h-8 w-8 p-0 border border-transparent hover:border-charcoal",
            editor.isActive("bulletList") && "bg-duck-yellow border-charcoal"
          )}
          style={{ borderRadius: "2px" }}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={cn(
            "h-8 w-8 p-0 border border-transparent hover:border-charcoal",
            editor.isActive("orderedList") && "bg-duck-yellow border-charcoal"
          )}
          style={{ borderRadius: "2px" }}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-charcoal/20 mx-1 self-center" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={cn(
            "h-8 w-8 p-0 border border-transparent hover:border-charcoal",
            editor.isActive("blockquote") && "bg-duck-yellow border-charcoal"
          )}
          style={{ borderRadius: "2px" }}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor Content */}
      <div className="editor-wrapper">
        <EditorContent editor={editor} />
      </div>

      {/* Character/Word count */}
      {showCharCount && (
        <div className="flex gap-3 font-mono text-xs text-gray-secondary uppercase">
          <span>{wordCount} {wordCount === 1 ? "word" : "words"}</span>
          <span>{characterCount} {characterCount === 1 ? "char" : "chars"}</span>
        </div>
      )}
    </div>
  )
}
