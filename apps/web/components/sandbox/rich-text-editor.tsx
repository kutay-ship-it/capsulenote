"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Bold, Italic, Underline, List, ListOrdered, Undo, Redo,
  Quote, Code, Heading1, Heading2, AlignLeft, AlignCenter,
  AlignRight, ChevronDown, Sparkles, Save, Eye, EyeOff
} from "lucide-react"
import { cn } from "@/lib/utils"

type FormatCommand =
  | "bold" | "italic" | "underline"
  | "insertUnorderedList" | "insertOrderedList"
  | "formatBlock" | "justifyLeft" | "justifyCenter" | "justifyRight"
  | "undo" | "redo"

interface RichTextEditorProps {
  value?: string
  onChange?: (html: string, text: string) => void
  placeholder?: string
  minHeight?: number
  maxHeight?: number
  className?: string
}

export function RichTextEditor({
  value = "",
  onChange,
  placeholder = "Start writing your letter...",
  minHeight = 300,
  maxHeight = 600,
  className
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [showToolbar, setShowToolbar] = useState(true)
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set())
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)

  useEffect(() => {
    if (editorRef.current && value && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  const checkActiveFormats = useCallback(() => {
    const formats = new Set<string>()

    if (document.queryCommandState("bold")) formats.add("bold")
    if (document.queryCommandState("italic")) formats.add("italic")
    if (document.queryCommandState("underline")) formats.add("underline")
    if (document.queryCommandState("insertUnorderedList")) formats.add("bulletList")
    if (document.queryCommandState("insertOrderedList")) formats.add("orderedList")

    setActiveFormats(formats)
  }, [])

  const executeCommand = useCallback((command: FormatCommand, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    checkActiveFormats()
    updateContent()
  }, [checkActiveFormats])

  const updateContent = useCallback(() => {
    if (!editorRef.current) return

    const html = editorRef.current.innerHTML
    const text = editorRef.current.innerText

    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    const chars = text.length

    setWordCount(words)
    setCharCount(chars)

    onChange?.(html, text)
  }, [onChange])

  const handleInput = useCallback(() => {
    updateContent()
    checkActiveFormats()
  }, [updateContent, checkActiveFormats])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault()
    const text = e.clipboardData.getData("text/plain")
    document.execCommand("insertText", false, text)
  }, [])

  const formatButtons = [
    { command: "bold" as const, icon: Bold, label: "Bold", shortcut: "⌘B", active: "bold" },
    { command: "italic" as const, icon: Italic, label: "Italic", shortcut: "⌘I", active: "italic" },
    { command: "underline" as const, icon: Underline, label: "Underline", shortcut: "⌘U", active: "underline" },
  ]

  const listButtons = [
    { command: "insertUnorderedList" as const, icon: List, label: "Bullet List", active: "bulletList" },
    { command: "insertOrderedList" as const, icon: ListOrdered, label: "Numbered List", active: "orderedList" },
  ]

  return (
    <Card className={cn("border-2 border-charcoal shadow-md transition-all", isFocused && "ring-2 ring-purple-600 ring-offset-2", className)}>
      <div className="border-b-2 border-charcoal bg-bg-purple-light/30 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="border border-charcoal font-mono text-xs">
              Rich Text Editor
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowToolbar(!showToolbar)}
              className="h-6 w-6 p-0 text-gray-secondary hover:text-charcoal"
            >
              {showToolbar ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border-l border-charcoal pl-3">
              <span className="font-mono text-xs text-gray-secondary">{wordCount} words</span>
              <span className="h-1 w-1 rounded-full bg-gray-secondary" />
              <span className="font-mono text-xs text-gray-secondary">{charCount} chars</span>
            </div>
          </div>
        </div>

        {showToolbar && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3 space-y-2"
          >
            <div className="flex flex-wrap items-center gap-1">
              {formatButtons.map((btn) => {
                const Icon = btn.icon
                const isActive = activeFormats.has(btn.active)
                return (
                  <Button
                    key={btn.command}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => executeCommand(btn.command)}
                    className={cn(
                      "h-8 w-8 border-2 border-charcoal p-0",
                      isActive && "bg-charcoal text-white"
                    )}
                    title={`${btn.label} (${btn.shortcut})`}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                )
              })}

              <Separator orientation="vertical" className="mx-1 h-6 border border-charcoal" />

              {listButtons.map((btn) => {
                const Icon = btn.icon
                const isActive = activeFormats.has(btn.active)
                return (
                  <Button
                    key={btn.command}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => executeCommand(btn.command)}
                    className={cn(
                      "h-8 w-8 border-2 border-charcoal p-0",
                      isActive && "bg-charcoal text-white"
                    )}
                    title={btn.label}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                )
              })}

              <Separator orientation="vertical" className="mx-1 h-6 border border-charcoal" />

              <Button
                variant="outline"
                size="sm"
                onClick={() => executeCommand("formatBlock", "<h1>")}
                className="h-8 border-2 border-charcoal px-2"
                title="Heading 1"
              >
                <Heading1 className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => executeCommand("formatBlock", "<h2>")}
                className="h-8 border-2 border-charcoal px-2"
                title="Heading 2"
              >
                <Heading2 className="h-4 w-4" />
              </Button>

              <Separator orientation="vertical" className="mx-1 h-6 border border-charcoal" />

              <Button
                variant="outline"
                size="sm"
                onClick={() => executeCommand("justifyLeft")}
                className="h-8 w-8 border-2 border-charcoal p-0"
                title="Align Left"
              >
                <AlignLeft className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => executeCommand("justifyCenter")}
                className="h-8 w-8 border-2 border-charcoal p-0"
                title="Align Center"
              >
                <AlignCenter className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => executeCommand("justifyRight")}
                className="h-8 w-8 border-2 border-charcoal p-0"
                title="Align Right"
              >
                <AlignRight className="h-4 w-4" />
              </Button>

              <Separator orientation="vertical" className="mx-1 h-6 border border-charcoal" />

              <Button
                variant="outline"
                size="sm"
                onClick={() => executeCommand("undo")}
                className="h-8 w-8 border-2 border-charcoal p-0"
                title="Undo (⌘Z)"
              >
                <Undo className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => executeCommand("redo")}
                className="h-8 w-8 border-2 border-charcoal p-0"
                title="Redo (⌘⇧Z)"
              >
                <Redo className="h-4 w-4" />
              </Button>
            </div>

            <div className="rounded-sm border border-dashed border-charcoal bg-bg-yellow-pale/50 p-2">
              <p className="font-mono text-xs text-gray-secondary">
                <kbd className="rounded bg-white px-1 py-0.5 text-[10px] border border-charcoal">⌘B</kbd> Bold ·
                <kbd className="ml-1 rounded bg-white px-1 py-0.5 text-[10px] border border-charcoal">⌘I</kbd> Italic ·
                <kbd className="ml-1 rounded bg-white px-1 py-0.5 text-[10px] border border-charcoal">⌘U</kbd> Underline
              </p>
            </div>
          </motion.div>
        )}
      </div>

      <CardContent className="p-0">
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onFocus={() => {
            setIsFocused(true)
            checkActiveFormats()
          }}
          onBlur={() => setIsFocused(false)}
          onPaste={handlePaste}
          onKeyUp={checkActiveFormats}
          onClick={checkActiveFormats}
          className={cn(
            "prose prose-sm max-w-none p-6 font-serif text-base leading-relaxed text-charcoal outline-none",
            "prose-headings:font-mono prose-headings:uppercase prose-headings:tracking-wide",
            "prose-strong:text-charcoal prose-em:text-charcoal",
            "prose-ul:my-2 prose-ol:my-2",
            "prose-li:marker:text-charcoal",
            !editorRef.current?.textContent?.trim() && "empty:before:content-[attr(data-placeholder)] empty:before:text-gray-secondary empty:before:opacity-50"
          )}
          data-placeholder={placeholder}
          style={{
            minHeight: `${minHeight}px`,
            maxHeight: `${maxHeight}px`,
            overflowY: "auto",
          }}
        />
      </CardContent>
    </Card>
  )
}
