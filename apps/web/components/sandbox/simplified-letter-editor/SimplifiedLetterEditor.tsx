"use client"

import { useState, useEffect } from 'react'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { BubbleMenu } from '@tiptap/react'
import { Button } from '@/components/ui/button'
import { Bold, Italic, List, Heading1, Heading2 } from 'lucide-react'
import { toast } from 'sonner'

import { LetterPaper } from './components/LetterPaper'
import { ControlMenuSidebar } from './components/ControlMenuSidebar'
import { useAutoSave } from './hooks/useAutoSave'
import { validateLetterData } from './lib/validation'
import type { SimplifiedLetterEditorProps, LetterData, AmbienceOption } from './types'

export function SimplifiedLetterEditor({
  onSave,
  onChange,
  initialData,
  className,
}: SimplifiedLetterEditorProps) {
  // State management
  const [content, setContent] = useState(initialData?.content || '')
  const [email, setEmail] = useState(initialData?.email || '')
  const [arriveInDate, setArriveInDate] = useState<Date | null>(initialData?.arriveInDate || null)
  const [arriveInMode, setArriveInMode] = useState<'preset' | 'custom'>(initialData?.arriveInMode || 'preset')
  const [presetDuration, setPresetDuration] = useState<'6m' | '1y' | '3y' | '5y' | undefined>(initialData?.presetDuration)
  const [ambience, setAmbience] = useState<AmbienceOption>(initialData?.ambience || 'none')
  const [isScheduling, setIsScheduling] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Tiptap editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your letter to your future self...',
      }),
      CharacterCount,
    ],
    content: initialData?.content || '',
    immediatelyRender: false, // Prevent SSR hydration mismatch
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      setContent(html)
    },
    autofocus: 'end',
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-screen',
        style: 'font-family: Georgia, serif; line-height: 1.75;',
      },
    },
  })

  // Auto-save hook
  useAutoSave({
    content,
    email,
    arriveInDate,
    arriveInMode,
    presetDuration,
    ambience,
  }, 'simplified-letter-draft')

  // Notify parent of changes
  useEffect(() => {
    const data: LetterData = {
      content,
      contentJson: editor?.getJSON() as Record<string, unknown>,
      email,
      arriveInDate,
      arriveInMode,
      presetDuration,
      ambience,
      wordCount: editor?.storage.characterCount?.words(),
    }

    onChange?.(data)
  }, [content, email, arriveInDate, arriveInMode, presetDuration, ambience, editor, onChange])

  const handleSchedule = async () => {
    const data: LetterData = {
      content,
      contentJson: editor?.getJSON() as Record<string, unknown>,
      email,
      arriveInDate,
      arriveInMode,
      presetDuration,
      ambience,
      wordCount: editor?.storage.characterCount?.words(),
    }

    const validation = validateLetterData(data)

    if (!validation.success) {
      setErrors(validation.errors)
      toast.error('Please fix the errors before scheduling')
      return
    }

    setErrors({})
    setIsScheduling(true)

    try {
      await onSave?.(data)
      toast.success('Letter scheduled successfully!')
    } catch (error) {
      console.error('Failed to schedule:', error)
      toast.error('Failed to schedule letter. Please try again.')
    } finally {
      setIsScheduling(false)
    }
  }

  const handleTemplateSelect = (template: any) => {
    editor?.commands.setContent(template.content)
  }

  return (
    <div className={`grid min-h-screen grid-cols-1 bg-white lg:grid-cols-[1fr_380px] ${className || ''}`}>
      {/* Floating Bubble Menu for selected text */}
      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          className="flex gap-1 rounded-lg border border-gray-300 bg-white p-1 shadow-lg"
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-gray-100' : ''}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-gray-100' : ''}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'bg-gray-100' : ''}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? 'bg-gray-100' : ''}
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-100' : ''}
          >
            <Heading2 className="h-4 w-4" />
          </Button>
        </BubbleMenu>
      )}

      {/* Letter Paper Section */}
      <LetterPaper editor={editor} />

      {/* Control Menu Sidebar */}
      <ControlMenuSidebar
        email={email}
        onEmailChange={setEmail}
        arriveInDate={arriveInDate}
        arriveInMode={arriveInMode}
        onArriveInChange={(date, mode, preset) => {
          setArriveInDate(date)
          setArriveInMode(mode)
          setPresetDuration(preset)
        }}
        ambience={ambience}
        onAmbienceChange={setAmbience}
        onTemplateSelect={handleTemplateSelect}
        onSchedule={handleSchedule}
        isScheduling={isScheduling}
        errors={errors}
      />
    </div>
  )
}
