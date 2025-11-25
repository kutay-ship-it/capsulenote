"use client"

import { useEffect, useCallback } from "react"
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import CharacterCount from "@tiptap/extension-character-count"
import Link from "@tiptap/extension-link"
import { Bold, Italic, List, ListOrdered, Quote } from "lucide-react"
import { cn } from "@/lib/utils"

interface SanctuaryEditorProps {
  content?: string | Record<string, unknown>
  onChange?: (json: Record<string, unknown>, html: string) => void
  placeholder?: string
  className?: string
}

export function SanctuaryEditor({
  content,
  onChange,
  placeholder = "Start writing to your future self...",
  className,
}: SanctuaryEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // Letters don't need headings
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
      CharacterCount,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: cn(
          // Clean prose styling for letter writing
          "prose prose-lg max-w-none",
          // Typography
          "font-serif text-charcoal leading-relaxed",
          // Remove focus outline - let the paper be the focus
          "focus:outline-none",
          // Placeholder styling
          "[&_.is-editor-empty:first-child::before]:text-charcoal/30",
          "[&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
          "[&_.is-editor-empty:first-child::before]:float-left",
          "[&_.is-editor-empty:first-child::before]:h-0",
          "[&_.is-editor-empty:first-child::before]:pointer-events-none",
          // Paragraph spacing
          "[&_p]:mb-4 [&_p]:leading-[1.8]",
          // Blockquote styling
          "[&_blockquote]:border-l-2 [&_blockquote]:border-teal-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-charcoal/80",
          // List styling
          "[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6",
          "[&_li]:mb-1"
        ),
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON()
      const html = editor.getHTML()
      onChange?.(json as Record<string, unknown>, html)
    },
  })

  // Update content when prop changes
  useEffect(() => {
    if (editor && content) {
      const currentContent = editor.getHTML()
      const newContent = typeof content === "string" ? content : ""
      if (typeof content === "object") {
        editor.commands.setContent(content)
      } else if (newContent && newContent !== currentContent) {
        editor.commands.setContent(content)
      }
    }
  }, [editor, content])

  const ToolbarButton = useCallback(
    ({
      onClick,
      isActive,
      children,
      title,
    }: {
      onClick: () => void
      isActive: boolean
      children: React.ReactNode
      title: string
    }) => (
      <button
        type="button"
        onClick={onClick}
        title={title}
        className={cn(
          "p-1.5 rounded transition-colors",
          isActive
            ? "bg-white text-charcoal"
            : "text-white/80 hover:text-white hover:bg-white/10"
        )}
      >
        {children}
      </button>
    ),
    []
  )

  if (!editor) {
    return (
      <div className={cn("min-h-[300px] animate-pulse bg-charcoal/5 rounded", className)} />
    )
  }

  return (
    <div className={cn("relative", className)}>
      {/* Floating Bubble Menu - appears on text selection */}
      <BubbleMenu
        editor={editor}
        tippyOptions={{
          duration: 150,
          placement: "top",
        }}
        className="flex items-center gap-0.5 px-2 py-1.5 bg-charcoal rounded-lg shadow-lg"
      >
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold (Cmd+B)"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic (Cmd+I)"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <div className="w-px h-4 bg-white/20 mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <div className="w-px h-4 bg-white/20 mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
      </BubbleMenu>

      {/* Clean Editor Content - no borders, just text on paper */}
      <EditorContent
        editor={editor}
        className="min-h-[350px] cursor-text"
        onClick={() => editor.chain().focus().run()}
      />
    </div>
  )
}

// Export word/character count hook for external use
export function useEditorStats(editor: ReturnType<typeof useEditor>) {
  if (!editor) return { words: 0, characters: 0 }
  return {
    words: editor.storage.characterCount?.words() ?? 0,
    characters: editor.storage.characterCount?.characters() ?? 0,
  }
}
