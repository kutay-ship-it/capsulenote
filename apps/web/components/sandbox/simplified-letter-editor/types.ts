export interface SimplifiedLetterEditorProps {
  onSave?: (data: LetterData) => void | Promise<void>
  onChange?: (data: LetterData) => void
  initialData?: Partial<LetterData>
  className?: string
}

export interface LetterData {
  content: string
  contentJson?: Record<string, unknown>
  email: string
  arriveInDate: Date | null
  arriveInMode: 'preset' | 'custom'
  presetDuration?: '6m' | '1y' | '3y' | '5y'
  template?: TemplateData
  ambience?: AmbienceOption
  wordCount?: number
}

export interface TemplateData {
  id: string
  name: string
  content: string
  category: 'reflection' | 'goals' | 'gratitude' | 'future-self'
  description?: string
}

export type AmbienceOption =
  | 'none'
  | 'rain'
  | 'cafe'
  | 'forest'
  | 'ocean'
  | 'white-noise'

export interface ArriveInSelectorProps {
  value: Date | null
  mode: 'preset' | 'custom'
  onChange: (date: Date | null, mode: 'preset' | 'custom', preset?: '6m' | '1y' | '3y' | '5y') => void
}

export interface WritingAmbienceSelectorProps {
  value: AmbienceOption
  onChange: (ambience: AmbienceOption) => void
}

export interface TemplateSelectorProps {
  onSelect: (template: TemplateData) => void
}
