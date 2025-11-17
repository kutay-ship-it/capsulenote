"use client"

import { EditorContent, type Editor } from "@tiptap/react"
import { cn } from "@/lib/utils"

interface LetterPaperProps {
  editor: Editor | null
  className?: string
}

export function LetterPaper({ editor, className }: LetterPaperProps) {
  if (!editor) {
    return null
  }

  const wordCount = editor.storage.characterCount?.words() || 0

  return (
    <div className={cn("relative min-h-screen bg-white p-8 md:p-12 lg:p-16", className)}>
      {/* Paper container */}
      <div className="mx-auto max-w-3xl">
        {/* Editor content */}
        <EditorContent
          editor={editor}
          className="prose prose-lg max-w-none focus-within:outline-none [&_.ProseMirror]:min-h-[calc(100vh-8rem)] [&_.ProseMirror]:focus:outline-none"
        />

        {/* Word count indicator */}
        {wordCount > 0 && (
          <div className="mt-8 text-right text-sm text-gray-400">
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </div>
        )}
      </div>
    </div>
  )
}
