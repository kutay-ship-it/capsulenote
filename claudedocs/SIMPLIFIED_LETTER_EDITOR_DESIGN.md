# Simplified Letter Editor - Component Design Specification

## Overview

A clean, distraction-free letter writing interface with a two-panel layout: writing area (left) and control menu (right). Designed for the DearMe platform's compare-editors sandbox.

**Design Philosophy**: Minimize UI chrome, maximize writing focus, auto-expanding paper feel.

## Requirements Summary

### Layout
- **Left Panel**: Rich text editor on white background, grows vertically without scrolling
- **Right Panel**: Fixed-width sidebar with controls, sticky positioning
- **Background**: White
- **Aesthetic**: Clean, minimal, distraction-free

### Features
1. Rich text editor (no visible toolbar on paper)
2. Arrive In date selector (with custom option)
3. Email address input
4. Writing Ambience selector
5. Templates selector
6. Single CTA: "Schedule Letter"

### Key UX Principle
**No scrolling during writing** - Paper expands infinitely downward like real paper being unrolled.

---

## Component Architecture

### Component Hierarchy

```
SimplifiedLetterEditor (Client Component)
├── LetterPaper
│   └── RichTextEditor (Tiptap)
│       └── FloatingToolbar (appears on selection)
└── ControlMenuSidebar
    ├── ArriveInSelector
    │   ├── PresetButtons (6m, 1y, 3y, 5y)
    │   └── CustomDatePicker
    ├── EmailInput
    ├── WritingAmbienceSelector
    ├── TemplateSelector
    │   └── TemplateModal
    └── ScheduleButton
```

### TypeScript Interfaces

```typescript
// Main component props
interface SimplifiedLetterEditorProps {
  onSave?: (data: LetterData) => void | Promise<void>
  onChange?: (data: LetterData) => void
  initialData?: Partial<LetterData>
  className?: string
}

// Data structure
interface LetterData {
  content: string              // Rich text HTML
  contentJson?: object         // Tiptap JSON (optional)
  email: string
  arriveInDate: Date | null
  arriveInMode: 'preset' | 'custom'
  presetDuration?: '6m' | '1y' | '3y' | '5y'
  template?: TemplateData
  ambience?: AmbienceOption
  wordCount?: number
}

// Template data
interface TemplateData {
  id: string
  name: string
  content: string              // HTML or Tiptap JSON
  category: 'reflection' | 'goals' | 'gratitude' | 'future-self'
  description?: string
}

// Ambience options
type AmbienceOption =
  | 'none'
  | 'rain'
  | 'cafe'
  | 'forest'
  | 'ocean'
  | 'white-noise'
```

### State Management

```typescript
// Internal component state
const [content, setContent] = useState<string>('')
const [contentJson, setContentJson] = useState<object | null>(null)
const [email, setEmail] = useState<string>('')
const [arriveInDate, setArriveInDate] = useState<Date | null>(null)
const [arriveInMode, setArriveInMode] = useState<'preset' | 'custom'>('preset')
const [ambience, setAmbience] = useState<AmbienceOption>('none')
const [isScheduling, setIsScheduling] = useState(false)
const [errors, setErrors] = useState<Record<string, string>>({})
```

---

## Visual Design Specifications

### Layout Structure

```
┌───────────────────────────────────────────────────────────┐
│  Container (min-h-screen, bg-white)                       │
│  ┌─────────────────────────┬──────────────────────────┐  │
│  │  Letter Paper           │  Control Menu (380px)    │  │
│  │  (flex-1, white)        │  (sticky top-0)          │  │
│  │                         │                           │  │
│  │  ┌──────────────────┐   │  ┌────────────────────┐  │  │
│  │  │                  │   │  │ Arrive In          │  │  │
│  │  │  Rich Text       │   │  │ [6m][1y][3y][5y]   │  │  │
│  │  │  Editor          │   │  │ [Custom]           │  │  │
│  │  │                  │   │  └────────────────────┘  │  │
│  │  │  (auto-expands)  │   │                           │  │
│  │  │                  │   │  ┌────────────────────┐  │  │
│  │  │                  │   │  │ Email Address      │  │  │
│  │  │                  │   │  │ [input field]      │  │  │
│  │  │                  │   │  └────────────────────┘  │  │
│  │  │                  │   │                           │  │
│  │  │                  │   │  ┌────────────────────┐  │  │
│  │  │                  │   │  │ Writing Ambience   │  │  │
│  │  │                  │   │  │ [dropdown]         │  │  │
│  │  │                  │   │  └────────────────────┘  │  │
│  │  │                  │   │                           │  │
│  │  │                  │   │  ┌────────────────────┐  │  │
│  │  │                  │   │  │ Templates          │  │  │
│  │  │                  │   │  │ [button]           │  │  │
│  │  └──────────────────┘   │  └────────────────────┘  │  │
│  │                         │                           │  │
│  │  (continues down...)    │  ┌────────────────────┐  │  │
│  │                         │  │                     │  │  │
│  │                         │  │ [Schedule Letter]  │  │  │
│  │                         │  │                     │  │  │
│  └─────────────────────────┴──┴────────────────────┘  │  │
└───────────────────────────────────────────────────────────┘
```

### Grid Layout CSS

```css
.editor-container {
  display: grid;
  grid-template-columns: 1fr 380px;
  min-height: 100vh;
  background: white;
  gap: 0;
}

@media (max-width: 1024px) {
  .editor-container {
    grid-template-columns: 1fr 320px;
  }
}

@media (max-width: 768px) {
  .editor-container {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
}
```

### Color Palette

```typescript
const colors = {
  background: '#FFFFFF',
  paper: '#FFFFFF',
  menuBg: '#F9FAFB',        // or white
  textPrimary: '#1A1A1A',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  accent: '#8B5CF6',        // Purple from theme
  accentHover: '#7C3AED',
  error: '#EF4444',
  success: '#10B981',
}
```

### Typography

```css
/* Letter content */
.letter-content {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 16px;
  line-height: 1.75;
  color: #1A1A1A;
}

/* Menu labels */
.menu-label {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #6B7280;
}

/* Menu values */
.menu-value {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px;
  color: #1A1A1A;
}
```

### Spacing System

**Letter Paper Section:**
```css
.letter-paper {
  padding: 4rem;           /* Desktop */
  min-height: 100vh;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

@media (max-width: 1024px) {
  .letter-paper {
    padding: 3rem;
  }
}

@media (max-width: 768px) {
  .letter-paper {
    padding: 2rem;
  }
}
```

**Control Menu:**
```css
.control-menu {
  width: 380px;
  padding: 2rem 1.5rem;
  background: #F9FAFB;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
```

**Control Sections:**
```css
.control-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-section-label {
  margin-bottom: 0.5rem;
}

.control-section-content {
  /* Component-specific */
}
```

---

## Component Specifications

### 1. Letter Paper Section

**Purpose**: Distraction-free writing canvas that expands naturally

**Features**:
- Auto-focus on mount
- Floating toolbar appears on text selection
- No visible scrollbar
- Grows vertically with content
- Word count indicator (subtle, bottom corner)

**Tiptap Configuration**:
```typescript
const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
    }),
    Placeholder.configure({
      placeholder: 'Start writing your letter...',
    }),
    CharacterCount,
  ],
  content: initialData?.content || '',
  onUpdate: ({ editor }) => {
    const html = editor.getHTML()
    const json = editor.getJSON()
    handleContentChange(html, json)
  },
  autofocus: 'end',
  editorProps: {
    attributes: {
      class: 'letter-content prose prose-lg focus:outline-none min-h-screen',
    },
  },
})
```

**Floating Toolbar**:
- Appears: On text selection
- Position: Above selection (bubble menu)
- Controls: Bold, Italic, Link, Heading 1, Heading 2, Bullet List
- Style: Minimal, dark background, white icons

### 2. Arrive In Selector

**Purpose**: Quick date selection with presets and custom option

**UI Structure**:
```
┌─────────────────────────────────┐
│ ARRIVE IN                       │
│ ┌──────┬──────┬──────┬──────┐  │
│ │  6m  │  1y  │  3y  │  5y  │  │ (Preset buttons)
│ └──────┴──────┴──────┴──────┘  │
│ ┌───────────────────────────┐  │
│ │      Custom               │  │ (Custom button)
│ └───────────────────────────┘  │
│                                 │
│ Selected: June 15, 2026         │ (Display selected date)
└─────────────────────────────────┘
```

**Interaction**:
1. Click preset → Calculate date → Update display
2. Click custom → Open date picker modal → Select → Update display

**Date Calculation**:
```typescript
const calculatePresetDate = (preset: '6m' | '1y' | '3y' | '5y'): Date => {
  const now = new Date()
  const multipliers = { '6m': 0.5, '1y': 1, '3y': 3, '5y': 5 }
  const years = multipliers[preset]
  return addYears(now, years)
}
```

**Component**:
```typescript
<ArriveInSelector
  value={arriveInDate}
  mode={arriveInMode}
  onChange={(date, mode) => {
    setArriveInDate(date)
    setArriveInMode(mode)
  }}
/>
```

### 3. Email Input

**Purpose**: Recipient email address entry with validation

**UI Structure**:
```
┌─────────────────────────────────┐
│ EMAIL ADDRESS                   │
│ ┌───────────────────────────┐  │
│ │ your@email.com            │  │
│ └───────────────────────────┘  │
│ ✓ Valid email address           │ (or error message)
└─────────────────────────────────┘
```

**Validation**:
```typescript
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
```

**Component**:
```typescript
<Input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  onBlur={() => {
    if (!validateEmail(email)) {
      setErrors(prev => ({ ...prev, email: 'Invalid email address' }))
    } else {
      setErrors(prev => {
        const { email, ...rest } = prev
        return rest
      })
    }
  }}
  className={errors.email ? 'border-red-500' : ''}
/>
```

### 4. Writing Ambience Selector

**Purpose**: Background audio for writing atmosphere

**Options**:
- None (default)
- Rain
- Cafe
- Forest
- Ocean
- White Noise

**UI Structure**:
```
┌─────────────────────────────────┐
│ WRITING AMBIENCE                │
│ ┌───────────────────────────┐  │
│ │ ♪ Select ambience    ▼    │  │
│ └───────────────────────────┘  │
│ 🔊 Currently playing: Rain      │ (if active)
└─────────────────────────────────┘
```

**Implementation**:
```typescript
const ambienceOptions = [
  { value: 'none', label: 'None', icon: '🔇' },
  { value: 'rain', label: 'Rain', icon: '🌧️' },
  { value: 'cafe', label: 'Cafe', icon: '☕' },
  { value: 'forest', label: 'Forest', icon: '🌲' },
  { value: 'ocean', label: 'Ocean', icon: '🌊' },
  { value: 'white-noise', label: 'White Noise', icon: '📻' },
]

// Audio playback (HTML5 Audio API)
const audioRef = useRef<HTMLAudioElement | null>(null)

useEffect(() => {
  if (ambience !== 'none') {
    audioRef.current = new Audio(`/sounds/${ambience}.mp3`)
    audioRef.current.loop = true
    audioRef.current.volume = 0.3
    audioRef.current.play()
  }

  return () => {
    audioRef.current?.pause()
    audioRef.current = null
  }
}, [ambience])
```

### 5. Template Selector

**Purpose**: Pre-written letter templates for inspiration

**Categories**:
- Reflection
- Goals
- Gratitude
- Future Self

**UI Structure**:
```
┌─────────────────────────────────┐
│ TEMPLATES                       │
│ ┌───────────────────────────┐  │
│ │  Browse Templates         │  │ (Opens modal)
│ └───────────────────────────┘  │
└─────────────────────────────────┘
```

**Template Modal**:
```
┌─────────────────────────────────────────┐
│ Letter Templates                    [×] │
│                                         │
│ [Reflection] [Goals] [Gratitude] [...]  │ (Category tabs)
│                                         │
│ ┌──────────────┐  ┌──────────────┐     │
│ │ New Year     │  │ Career       │     │
│ │ Reflection   │  │ Goals        │     │
│ │              │  │              │     │
│ │ Reflect on...│  │ Set 3-5...   │     │
│ └──────────────┘  └──────────────┘     │
│ ┌──────────────┐  ┌──────────────┐     │
│ │ Gratitude    │  │ Future Self  │     │
│ │ Letter       │  │ Vision       │     │
│ │              │  │              │     │
│ │ List what... │  │ Describe...  │     │
│ └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────┘
```

**Template Selection Flow**:
1. Click "Browse Templates" → Modal opens
2. Browse categories → Click template card
3. Confirmation dialog: "Replace current content?"
4. Confirm → Content populated → Modal closes

**Mock Templates**:
```typescript
const mockTemplates: TemplateData[] = [
  {
    id: '1',
    name: 'New Year Reflection',
    category: 'reflection',
    description: 'Reflect on the past year',
    content: '<h1>Dear Future Me,</h1><p>As this year comes to a close...</p>',
  },
  {
    id: '2',
    name: 'Career Goals',
    category: 'goals',
    description: 'Set professional objectives',
    content: '<h1>Career Vision</h1><p>In the next year, I aim to...</p>',
  },
  // ... more templates
]
```

### 6. Schedule Letter Button

**Purpose**: Primary CTA to save and schedule the letter

**States**:
- Default: "Schedule Letter"
- Loading: "Scheduling..." (with spinner)
- Success: "Scheduled!" (brief, then reset)
- Error: "Try Again"

**UI Structure**:
```
┌─────────────────────────────────┐
│                                 │
│  ┌───────────────────────────┐ │
│  │                           │ │
│  │    Schedule Letter        │ │ (Full width, primary)
│  │                           │ │
│  └───────────────────────────┘ │
│                                 │
│  Auto-saved 2 seconds ago       │ (Subtle indicator)
└─────────────────────────────────┘
```

**Validation Before Scheduling**:
```typescript
const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {}

  if (!content || content.trim() === '') {
    newErrors.content = 'Please write your letter'
  }

  if (!email || !validateEmail(email)) {
    newErrors.email = 'Valid email required'
  }

  if (!arriveInDate) {
    newErrors.arriveInDate = 'Please select a delivery date'
  }

  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}

const handleSchedule = async () => {
  if (!validateForm()) return

  setIsScheduling(true)

  try {
    await onSave?.({
      content,
      contentJson,
      email,
      arriveInDate,
      arriveInMode,
      ambience,
      wordCount: editor?.storage.characterCount.words(),
    })

    // Success state, then reset
    toast.success('Letter scheduled!')
  } catch (error) {
    toast.error('Failed to schedule. Please try again.')
  } finally {
    setIsScheduling(false)
  }
}
```

---

## Interaction Patterns

### Auto-Focus Flow
```
Page Load → Editor auto-focuses at end → User starts typing
```

### Writing Flow
```
User types → Content grows → Paper expands downward → No scroll needed
User selects text → Floating toolbar appears → Format text
```

### Date Selection Flow
```
Click preset (e.g., "1y") → Date calculated → Display updated
OR
Click "Custom" → Calendar modal → Select date → Display updated
```

### Template Selection Flow
```
Click "Browse Templates" → Modal opens → Select category → Click template
→ Confirmation: "Replace current content?" → Confirm → Editor populated
```

### Ambience Selection Flow
```
Select ambience → Audio starts playing (low volume) → Icon indicator
Change selection → Previous audio stops → New audio plays
Select "None" → Audio stops
```

### Schedule Flow
```
Click "Schedule Letter" → Validation runs
→ If valid: Loading state → API call → Success message
→ If invalid: Highlight errors → User corrects → Retry
```

### Auto-Save Flow
```
User types → Debounced (2-3 seconds) → Save to localStorage
→ "Saved" indicator appears briefly
```

---

## Technical Implementation

### File Structure
```
apps/web/components/sandbox/simplified-letter-editor/
├── index.tsx                         # Main component export
├── SimplifiedLetterEditor.tsx        # Container component
├── components/
│   ├── LetterPaper.tsx               # Left section
│   ├── ControlMenuSidebar.tsx        # Right sidebar
│   ├── ArriveInSelector.tsx          # Date picker
│   ├── WritingAmbienceSelector.tsx   # Ambience dropdown
│   ├── TemplateSelector.tsx          # Template button
│   ├── TemplateModal.tsx             # Template browser
│   └── ScheduleButton.tsx            # CTA button
├── hooks/
│   ├── useAutoSave.ts                # Auto-save logic
│   ├── useLetterData.ts              # Data management
│   └── useAmbience.ts                # Audio playback
├── lib/
│   ├── validation.ts                 # Form validation
│   ├── dateCalculations.ts           # Preset date logic
│   └── templates.ts                  # Template data
└── types.ts                          # TypeScript interfaces
```

### Dependencies

**Required**:
```json
{
  "@tiptap/react": "^2.x",
  "@tiptap/starter-kit": "^2.x",
  "@tiptap/extension-placeholder": "^2.x",
  "@tiptap/extension-character-count": "^2.x",
  "date-fns": "^3.x",
  "zod": "^3.x"
}
```

**shadcn/ui Components**:
- Button
- Input
- Label
- Select
- Dialog
- Calendar
- Popover
- Toast

### Main Component Structure

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'

import { LetterPaper } from './components/LetterPaper'
import { ControlMenuSidebar } from './components/ControlMenuSidebar'
import { useAutoSave } from './hooks/useAutoSave'
import { validateLetterData } from './lib/validation'
import type { SimplifiedLetterEditorProps, LetterData } from './types'

export function SimplifiedLetterEditor({
  onSave,
  onChange,
  initialData,
  className,
}: SimplifiedLetterEditorProps) {
  // State management
  const [content, setContent] = useState(initialData?.content || '')
  const [email, setEmail] = useState(initialData?.email || '')
  const [arriveInDate, setArriveInDate] = useState(initialData?.arriveInDate || null)
  const [arriveInMode, setArriveInMode] = useState(initialData?.arriveInMode || 'preset')
  const [ambience, setAmbience] = useState(initialData?.ambience || 'none')
  const [isScheduling, setIsScheduling] = useState(false)
  const [errors, setErrors] = useState({})

  // Tiptap editor
  const editor = useEditor({
    extensions: [StarterKit, Placeholder, CharacterCount],
    content: initialData?.content || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      setContent(html)
    },
    autofocus: 'end',
  })

  // Auto-save hook
  useAutoSave({
    content,
    email,
    arriveInDate,
    arriveInMode,
    ambience,
  })

  // Notify parent of changes
  useEffect(() => {
    onChange?.({
      content,
      email,
      arriveInDate,
      arriveInMode,
      ambience,
      wordCount: editor?.storage.characterCount.words(),
    })
  }, [content, email, arriveInDate, arriveInMode, ambience])

  const handleSchedule = async () => {
    const validation = validateLetterData({
      content,
      email,
      arriveInDate,
    })

    if (!validation.success) {
      setErrors(validation.errors)
      return
    }

    setIsScheduling(true)
    try {
      await onSave?.({
        content,
        email,
        arriveInDate,
        arriveInMode,
        ambience,
        wordCount: editor?.storage.characterCount.words(),
      })
    } catch (error) {
      console.error('Failed to schedule:', error)
    } finally {
      setIsScheduling(false)
    }
  }

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-[1fr_380px] min-h-screen bg-white ${className}`}>
      <LetterPaper editor={editor} />

      <ControlMenuSidebar
        email={email}
        onEmailChange={setEmail}
        arriveInDate={arriveInDate}
        arriveInMode={arriveInMode}
        onArriveInChange={(date, mode) => {
          setArriveInDate(date)
          setArriveInMode(mode)
        }}
        ambience={ambience}
        onAmbienceChange={setAmbience}
        onTemplateSelect={(template) => {
          if (window.confirm('Replace current content with this template?')) {
            editor?.commands.setContent(template.content)
          }
        }}
        onSchedule={handleSchedule}
        isScheduling={isScheduling}
        errors={errors}
      />
    </div>
  )
}
```

### Auto-Save Hook

```typescript
import { useEffect, useRef } from 'react'
import { debounce } from 'lodash'

export function useAutoSave(data: any) {
  const saveToLocalStorage = useRef(
    debounce((data) => {
      localStorage.setItem('letter-draft', JSON.stringify(data))
    }, 2000)
  ).current

  useEffect(() => {
    saveToLocalStorage(data)
  }, [data, saveToLocalStorage])

  useEffect(() => {
    return () => {
      saveToLocalStorage.cancel()
    }
  }, [saveToLocalStorage])
}
```

### Validation Schema

```typescript
import { z } from 'zod'

export const letterDataSchema = z.object({
  content: z.string().min(1, 'Please write your letter'),
  email: z.string().email('Invalid email address'),
  arriveInDate: z.date({ required_error: 'Please select a delivery date' }),
  arriveInMode: z.enum(['preset', 'custom']),
  ambience: z.string().optional(),
  wordCount: z.number().optional(),
})

export function validateLetterData(data: any) {
  try {
    letterDataSchema.parse(data)
    return { success: true, errors: {} }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.reduce((acc, err) => {
        acc[err.path[0]] = err.message
        return acc
      }, {} as Record<string, string>)
      return { success: false, errors }
    }
    return { success: false, errors: { general: 'Validation failed' } }
  }
}
```

---

## Responsive Design

### Desktop (>1024px)
```css
/* Two-column grid */
.editor-container {
  grid-template-columns: 1fr 380px;
}

.letter-paper {
  padding: 4rem;
}
```

### Tablet (768px - 1024px)
```css
/* Narrower sidebar */
.editor-container {
  grid-template-columns: 1fr 320px;
}

.letter-paper {
  padding: 3rem;
}
```

### Mobile (<768px)
```css
/* Stack vertically */
.editor-container {
  grid-template-columns: 1fr;
}

.letter-paper {
  padding: 2rem;
}

.control-menu {
  position: static;
  height: auto;
  width: 100%;
}

/* Alternative: Floating menu */
.control-menu-mobile {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 2px solid #E5E7EB;
  padding: 1rem;
}
```

---

## Accessibility Checklist

- [ ] Semantic HTML structure
- [ ] ARIA labels on all interactive elements
- [ ] Keyboard navigation (Tab, Shift+Tab)
- [ ] Focus indicators visible (ring-2 ring-offset-2)
- [ ] Focus trapping in modals
- [ ] Screen reader announcements for errors/success
- [ ] Color contrast WCAG AA compliant
- [ ] Alt text for icons (or aria-label)
- [ ] Form validation messages announced
- [ ] Keyboard shortcuts documented

---

## Performance Optimizations

1. **Debounced Auto-Save**: 2-3 second debounce
2. **Memoized Components**: Use `React.memo` for stable components
3. **Lazy Load Modal**: Code-split template modal
4. **Audio Preloading**: Preload ambient sounds
5. **Virtual Scrolling**: If template list grows large

---

## Integration Example

```typescript
// In apps/web/app/sandbox/compare-editors/page.tsx

import { SimplifiedLetterEditor } from '@/components/sandbox/simplified-letter-editor'

export default function CompareEditorsPage() {
  const handleSave = async (data: LetterData) => {
    console.log('Saving letter:', data)
    // API call to save letter
    await fetch('/api/letters', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  return (
    <div>
      <SimplifiedLetterEditor
        onSave={handleSave}
        onChange={(data) => console.log('Changed:', data)}
        initialData={{
          email: 'user@example.com',
        }}
      />
    </div>
  )
}
```

---

## Future Enhancements

- [ ] Collaborative editing (multiplayer cursor)
- [ ] Voice-to-text input
- [ ] AI writing suggestions
- [ ] Rich media embeds (images, videos)
- [ ] Export to PDF
- [ ] Print-friendly view
- [ ] Undo/redo history visualization
- [ ] Writing statistics dashboard

---

## Summary

This design creates a clean, focused letter-writing experience with:

✅ **Distraction-free**: Minimal UI, white background, auto-expanding paper
✅ **Essential controls**: Only what's needed, organized in fixed sidebar
✅ **Natural writing flow**: No scrolling, infinite vertical expansion
✅ **Accessibility**: WCAG AA compliant, keyboard navigation
✅ **Responsive**: Works on desktop, tablet, mobile
✅ **Type-safe**: Full TypeScript support
✅ **Modern stack**: React 19, Tiptap, shadcn/ui, Tailwind CSS

The component balances simplicity with functionality, following best practices for React, accessibility, and user experience design.
