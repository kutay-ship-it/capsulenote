"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Calendar,
  Save,
  Send,
  Type,
  Palette,
  Music,
  FileText,
  MapPin,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Clock,
  Volume2,
  VolumeX,
  Maximize2,
  Eye,
  EyeOff,
  Keyboard,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Link as LinkIcon,
  Highlighter,
  Menu,
  X,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type WritingMode = "flow" | "focus" | "zen"
type VisualTheme = "light" | "dark" | "sepia" | "highContrast"
type AmbientSound = "none" | "coffeeShop" | "rain" | "fireplace" | "ocean" | "forest" | "library"
type PanelSection = "format" | "delivery" | "address" | "templates" | "ambiance"
type DeliveryChannel = "email" | "mail"
type TimeOfDay = "morning" | "afternoon" | "evening"

interface SanctuaryEditorProps {
  initialTitle?: string
  initialBody?: string
  initialDeliveryDate?: Date
  initialDeliveryChannel?: DeliveryChannel
  onChange?: (data: SanctuaryLetterData) => void
  onSave?: (data: SanctuaryLetterData) => void
  onSchedule?: (data: SanctuaryLetterData) => void
  showDebugInfo?: boolean
}

interface SanctuaryLetterData {
  title: string
  body: string
  bodyHtml: string
  deliveryDate?: Date
  deliveryChannel: DeliveryChannel
  deliveryTime?: TimeOfDay
  recipientAddress?: RecipientAddress
  formatSettings: FormatSettings
  metadata: {
    wordCount: number
    characterCount: number
    writingDuration: number
    unlockLevel: number
    lastSaved?: Date
  }
}

interface FormatSettings {
  fontFamily: string
  fontSize: number
  lineHeight: number
  letterSpacing: number
}

interface RecipientAddress {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

interface TemplateItem {
  id: string
  category: string
  title: string
  preview: string
  content: string
  popularity: number
}

interface MilestoneConfig {
  wordCount: number
  message: string
  unlockLevel: number
}

// ============================================================================
// CONSTANTS & DATA
// ============================================================================

const MILESTONES: MilestoneConfig[] = [
  { wordCount: 50, message: "Format controls unlocked", unlockLevel: 1 },
  { wordCount: 100, message: "Templates & Ambiance unlocked", unlockLevel: 2 },
  { wordCount: 300, message: "Advanced features unlocked", unlockLevel: 3 },
]

const TEMPLATES: TemplateItem[] = [
  {
    id: "first-time",
    category: "First Time",
    title: "Hello Future Me",
    preview: "Dear future me, I'm writing this on...",
    content: "Dear future me,\n\nI'm writing this on [date] and I want you to know...\n\n",
    popularity: 245,
  },
  {
    id: "reflection",
    category: "Reflection",
    title: "Looking Back",
    preview: "Today I realized something important...",
    content: "Today I realized something important about myself...\n\nThe journey has been...\n\n",
    popularity: 189,
  },
  {
    id: "goals",
    category: "Future Goals",
    title: "My Aspirations",
    preview: "By the time you read this, I hope...",
    content: "By the time you read this, I hope you've accomplished:\n\n1. \n2. \n3. \n\nRemember why these matter...\n\n",
    popularity: 312,
  },
  {
    id: "gratitude",
    category: "Gratitude",
    title: "Thankful Moments",
    preview: "I'm grateful for...",
    content: "Right now, I'm deeply grateful for:\n\n- \n- \n- \n\nThese moments remind me that...\n\n",
    popularity: 156,
  },
  {
    id: "advice",
    category: "Advice",
    title: "Words of Wisdom",
    preview: "Remember that...",
    content: "Remember that life is about the journey, not just the destination.\n\nHere's what I've learned so far:\n\n",
    popularity: 203,
  },
  {
    id: "milestone",
    category: "Milestone",
    title: "Special Occasion",
    preview: "Today marks a special day...",
    content: "Today marks a special day - [occasion].\n\nWhat makes this moment meaningful:\n\n",
    popularity: 178,
  },
]

const AMBIENT_SOUNDS = [
  { id: "none", label: "Silence", icon: VolumeX },
  { id: "coffeeShop", label: "Coffee Shop", icon: Volume2 },
  { id: "rain", label: "Rain", icon: Volume2 },
  { id: "fireplace", label: "Fireplace", icon: Volume2 },
  { id: "ocean", label: "Ocean Waves", icon: Volume2 },
  { id: "forest", label: "Forest", icon: Volume2 },
  { id: "library", label: "Library", icon: Volume2 },
]

const FONT_FAMILIES = [
  { value: "serif", label: "Serif", sample: "font-serif" },
  { value: "sans", label: "Sans-serif", sample: "font-sans" },
  { value: "mono", label: "Monospace", sample: "font-mono" },
]

const PRESET_DATES = [
  { label: "1 Month", months: 1 },
  { label: "6 Months", months: 6 },
  { label: "1 Year", months: 12 },
  { label: "5 Years", months: 60 },
]

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SanctuaryEditor({
  initialTitle = "",
  initialBody = "",
  initialDeliveryDate,
  initialDeliveryChannel = "email",
  onChange,
  onSave,
  onSchedule,
  showDebugInfo = false,
}: SanctuaryEditorProps) {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  // Content state
  const [title, setTitle] = useState(initialTitle)
  const [body, setBody] = useState(initialBody)
  const [bodyHtml, setBodyHtml] = useState(initialBody)

  // Delivery state
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(initialDeliveryDate)
  const [deliveryChannel, setDeliveryChannel] = useState<DeliveryChannel>(initialDeliveryChannel)
  const [deliveryTime, setDeliveryTime] = useState<TimeOfDay>("morning")
  const [recipientAddress, setRecipientAddress] = useState<RecipientAddress>({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "USA",
  })

  // Format state
  const [formatSettings, setFormatSettings] = useState<FormatSettings>({
    fontFamily: "serif",
    fontSize: 16,
    lineHeight: 1.8,
    letterSpacing: 0,
  })

  // UI state
  const [expandedSection, setExpandedSection] = useState<PanelSection | null>("delivery")
  const [rightPanelVisible, setRightPanelVisible] = useState(true)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [writingMode, setWritingMode] = useState<WritingMode>("flow")
  const [visualTheme, setVisualTheme] = useState<VisualTheme>("light")
  const [ambientSound, setAmbientSound] = useState<AmbientSound>("none")
  const [soundVolume, setSoundVolume] = useState(0.5)

  // Metrics state
  const [wordCount, setWordCount] = useState(0)
  const [characterCount, setCharacterCount] = useState(0)
  const [writingDuration, setWritingDuration] = useState(0)
  const [unlockLevel, setUnlockLevel] = useState(0)
  const [lastSaved, setLastSaved] = useState<Date>()
  const [isSaving, setIsSaving] = useState(false)

  // Rich text selection state
  const [showFormatToolbar, setShowFormatToolbar] = useState(false)
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 })

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const startTimeRef = useRef<Date>(new Date())
  const saveTimerRef = useRef<NodeJS.Timeout>()
  const writingTimerRef = useRef<NodeJS.Timeout>()

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Calculate metrics on body change
  useEffect(() => {
    const words = body.trim().split(/\s+/).filter(Boolean).length
    const chars = body.length

    setWordCount(words)
    setCharacterCount(chars)

    // Check for milestone unlocks
    const currentMilestone = MILESTONES.find(
      (m) => words >= m.wordCount && unlockLevel < m.unlockLevel
    )
    if (currentMilestone) {
      setUnlockLevel(currentMilestone.unlockLevel)
      // Show celebration toast (would use actual toast in real implementation)
      console.log("🎉 Milestone:", currentMilestone.message)
    }

    // Update HTML version (in real implementation, this would be from Tiptap)
    setBodyHtml(`<p>${body.replace(/\n/g, "</p><p>")}</p>`)
  }, [body, unlockLevel])

  // Writing duration tracker
  useEffect(() => {
    if (body.length > 0) {
      writingTimerRef.current = setInterval(() => {
        setWritingDuration((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      if (writingTimerRef.current) {
        clearInterval(writingTimerRef.current)
      }
    }
  }, [body.length])

  // Auto-save effect
  useEffect(() => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }

    if (body.length > 0) {
      saveTimerRef.current = setTimeout(() => {
        handleAutoSave()
      }, 3000) // 3 second debounce
    }

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
    }
  }, [title, body])

  // Call onChange callback
  useEffect(() => {
    if (onChange) {
      onChange({
        title,
        body,
        bodyHtml,
        deliveryDate,
        deliveryChannel,
        deliveryTime,
        recipientAddress,
        formatSettings,
        metadata: {
          wordCount,
          characterCount,
          writingDuration,
          unlockLevel,
          lastSaved,
        },
      })
    }
  }, [
    title,
    body,
    bodyHtml,
    deliveryDate,
    deliveryChannel,
    deliveryTime,
    formatSettings,
    wordCount,
    characterCount,
    writingDuration,
    unlockLevel,
    lastSaved,
  ])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + S = Save
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        handleSaveNow()
      }
      // Cmd/Ctrl + Enter = Schedule
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault()
        handleSchedule()
      }
      // Cmd/Ctrl + / = Toggle panel
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault()
        setRightPanelVisible((prev) => !prev)
      }
      // Cmd/Ctrl + Shift + F = Focus mode
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "f") {
        e.preventDefault()
        setWritingMode("focus")
      }
      // Esc = Exit focus/zen mode
      if (e.key === "Escape") {
        if (writingMode !== "flow") {
          setWritingMode("flow")
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [writingMode, deliveryDate])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleAutoSave = useCallback(() => {
    setIsSaving(true)
    // Simulate save to localStorage
    localStorage.setItem(
      "sanctuary-draft",
      JSON.stringify({
        title,
        body,
        formatSettings,
        deliveryDate,
        deliveryChannel,
        timestamp: new Date(),
      })
    )
    setLastSaved(new Date())
    setTimeout(() => setIsSaving(false), 500)
  }, [title, body, formatSettings, deliveryDate, deliveryChannel])

  const handleSaveNow = useCallback(() => {
    if (onSave) {
      onSave({
        title,
        body,
        bodyHtml,
        deliveryDate,
        deliveryChannel,
        deliveryTime,
        recipientAddress,
        formatSettings,
        metadata: {
          wordCount,
          characterCount,
          writingDuration,
          unlockLevel,
          lastSaved: new Date(),
        },
      })
    }
    handleAutoSave()
  }, [
    title,
    body,
    bodyHtml,
    deliveryDate,
    deliveryChannel,
    deliveryTime,
    formatSettings,
    wordCount,
    characterCount,
    writingDuration,
    unlockLevel,
  ])

  const handleSchedule = useCallback(() => {
    if (!deliveryDate) {
      alert("Please select a delivery date first")
      return
    }
    if (onSchedule) {
      onSchedule({
        title,
        body,
        bodyHtml,
        deliveryDate,
        deliveryChannel,
        deliveryTime,
        recipientAddress,
        formatSettings,
        metadata: {
          wordCount,
          characterCount,
          writingDuration,
          unlockLevel,
          lastSaved: new Date(),
        },
      })
    }
  }, [
    title,
    body,
    bodyHtml,
    deliveryDate,
    deliveryChannel,
    deliveryTime,
    formatSettings,
    wordCount,
    characterCount,
    writingDuration,
    unlockLevel,
  ])

  const handleTemplateSelect = useCallback((template: TemplateItem) => {
    setBody(template.content)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [])

  const handlePresetDate = useCallback((months: number) => {
    const date = new Date()
    date.setMonth(date.getMonth() + months)
    setDeliveryDate(date)
  }, [])

  const toggleSection = useCallback((section: PanelSection) => {
    setExpandedSection((prev) => (prev === section ? null : section))
  }, [])

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const breathingColor = wordCount === 0 ? "border-gray-200" : wordCount < 50 ? "border-purple-300" : wordCount < 100 ? "border-purple-400" : "border-purple-500"

  const isFormatUnlocked = unlockLevel >= 1
  const isAdvancedUnlocked = unlockLevel >= 2

  const panelWidthClass = writingMode === "focus" ? "md:w-[85%]" : writingMode === "zen" ? "w-full" : "md:w-[62%]"

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderMomentumIndicator = () => {
    if (wordCount === 0) return null

    const percentage = Math.min((wordCount / 300) * 100, 100)

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 4 }}
        className="w-full bg-gray-100 overflow-hidden"
      >
        <motion.div
          className="h-full bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </motion.div>
    )
  }

  const renderStatsBar = () => (
    <div className="flex items-center gap-4 px-4 py-2 bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
      <div className="flex items-center gap-2">
        <span className="font-medium">{wordCount}</span>
        <span>words</span>
      </div>
      <Separator orientation="vertical" className="h-4" />
      <div className="flex items-center gap-2">
        <Clock className="h-3.5 w-3.5" />
        <span>{Math.floor(writingDuration / 60)}m {writingDuration % 60}s</span>
      </div>
      <Separator orientation="vertical" className="h-4" />
      <div className="flex items-center gap-2">
        {isSaving ? (
          <span className="text-purple-600">Saving...</span>
        ) : lastSaved ? (
          <span className="text-green-600">Saved {Math.floor((Date.now() - lastSaved.getTime()) / 1000)}s ago</span>
        ) : (
          <span className="text-gray-400">Not saved</span>
        )}
      </div>
    </div>
  )

  const renderFormatSection = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Font Family</label>
        <div className="grid grid-cols-3 gap-2">
          {FONT_FAMILIES.map((font) => (
            <Button
              key={font.value}
              variant={formatSettings.fontFamily === font.value ? "default" : "outline"}
              size="sm"
              onClick={() =>
                setFormatSettings((prev) => ({ ...prev, fontFamily: font.value }))
              }
              className={font.sample}
            >
              {font.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Font Size: {formatSettings.fontSize}px</label>
        <input
          type="range"
          min="14"
          max="20"
          value={formatSettings.fontSize}
          onChange={(e) =>
            setFormatSettings((prev) => ({ ...prev, fontSize: Number(e.target.value) }))
          }
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Line Height: {formatSettings.lineHeight}</label>
        <input
          type="range"
          min="1.5"
          max="2.0"
          step="0.1"
          value={formatSettings.lineHeight}
          onChange={(e) =>
            setFormatSettings((prev) => ({ ...prev, lineHeight: Number(e.target.value) }))
          }
          className="w-full"
        />
      </div>
    </div>
  )

  const renderDeliverySection = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Quick Presets</label>
        <div className="grid grid-cols-2 gap-2">
          {PRESET_DATES.map((preset) => (
            <Button
              key={preset.label}
              variant="outline"
              size="sm"
              onClick={() => handlePresetDate(preset.months)}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Delivery Date</label>
        <Input
          type="date"
          value={deliveryDate?.toISOString().split("T")[0] || ""}
          onChange={(e) => setDeliveryDate(e.target.value ? new Date(e.target.value) : undefined)}
          className="w-full"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Time of Day</label>
        <div className="grid grid-cols-3 gap-2">
          {(["morning", "afternoon", "evening"] as TimeOfDay[]).map((time) => (
            <Button
              key={time}
              variant={deliveryTime === time ? "default" : "outline"}
              size="sm"
              onClick={() => setDeliveryTime(time)}
            >
              {time.charAt(0).toUpperCase() + time.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Delivery Method</label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={deliveryChannel === "email" ? "default" : "outline"}
            size="sm"
            onClick={() => setDeliveryChannel("email")}
          >
            📧 Email
          </Button>
          <Button
            variant={deliveryChannel === "mail" ? "default" : "outline"}
            size="sm"
            onClick={() => setDeliveryChannel("mail")}
          >
            📮 Physical Mail
          </Button>
        </div>
      </div>
    </div>
  )

  const renderAddressSection = () => (
    <div className="space-y-3">
      <Input
        placeholder="Street Address"
        value={recipientAddress.street}
        onChange={(e) =>
          setRecipientAddress((prev) => ({ ...prev, street: e.target.value }))
        }
      />
      <div className="grid grid-cols-2 gap-2">
        <Input
          placeholder="City"
          value={recipientAddress.city}
          onChange={(e) =>
            setRecipientAddress((prev) => ({ ...prev, city: e.target.value }))
          }
        />
        <Input
          placeholder="State"
          value={recipientAddress.state}
          onChange={(e) =>
            setRecipientAddress((prev) => ({ ...prev, state: e.target.value }))
          }
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Input
          placeholder="ZIP Code"
          value={recipientAddress.zipCode}
          onChange={(e) =>
            setRecipientAddress((prev) => ({ ...prev, zipCode: e.target.value }))
          }
        />
        <Input
          placeholder="Country"
          value={recipientAddress.country}
          onChange={(e) =>
            setRecipientAddress((prev) => ({ ...prev, country: e.target.value }))
          }
        />
      </div>
    </div>
  )

  const renderTemplatesSection = () => (
    <div className="space-y-3">
      <ScrollArea className="h-[300px]">
        <div className="space-y-2">
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateSelect(template)}
              className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-1">
                <span className="font-medium text-sm">{template.title}</span>
                <Badge variant="secondary" className="text-xs">
                  {template.popularity} uses
                </Badge>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2">{template.preview}</p>
              <span className="text-xs text-purple-600 mt-1 inline-block">{template.category}</span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )

  const renderAmbianceSection = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Ambient Sounds</label>
        <div className="grid grid-cols-2 gap-2">
          {AMBIENT_SOUNDS.map((sound) => (
            <Button
              key={sound.id}
              variant={ambientSound === sound.id ? "default" : "outline"}
              size="sm"
              onClick={() => setAmbientSound(sound.id as AmbientSound)}
              className="justify-start"
            >
              <sound.icon className="h-3.5 w-3.5 mr-2" />
              {sound.label}
            </Button>
          ))}
        </div>
      </div>

      {ambientSound !== "none" && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Volume: {Math.round(soundVolume * 100)}%</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={soundVolume}
            onChange={(e) => setSoundVolume(Number(e.target.value))}
            className="w-full"
          />
        </div>
      )}

      <Separator />

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Writing Mode</label>
        <div className="space-y-2">
          <Button
            variant={writingMode === "flow" ? "default" : "outline"}
            size="sm"
            onClick={() => setWritingMode("flow")}
            className="w-full justify-start"
          >
            Flow Mode (Current)
          </Button>
          <Button
            variant={writingMode === "focus" ? "default" : "outline"}
            size="sm"
            onClick={() => setWritingMode("focus")}
            className="w-full justify-start"
          >
            Focus Mode (Minimize Tools)
          </Button>
          <Button
            variant={writingMode === "zen" ? "default" : "outline"}
            size="sm"
            onClick={() => setWritingMode("zen")}
            className="w-full justify-start"
          >
            Zen Mode (Writing Only)
          </Button>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Visual Theme</label>
        <div className="grid grid-cols-2 gap-2">
          {(["light", "dark", "sepia", "highContrast"] as VisualTheme[]).map((theme) => (
            <Button
              key={theme}
              variant={visualTheme === theme ? "default" : "outline"}
              size="sm"
              onClick={() => setVisualTheme(theme)}
            >
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )

  const renderPanelSection = (
    section: PanelSection,
    icon: React.ElementType,
    title: string,
    content: React.ReactNode,
    locked: boolean = false
  ) => {
    const isExpanded = expandedSection === section

    return (
      <div className="border-b border-gray-200">
        <button
          onClick={() => !locked && toggleSection(section)}
          disabled={locked}
          className={cn(
            "w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors",
            locked && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="flex items-center gap-3">
            {React.createElement(icon, { className: "h-4 w-4 text-gray-600" })}
            <span className="font-medium text-sm text-gray-900">{title}</span>
            {locked && <Badge variant="secondary" className="text-xs">Unlock at {section === "format" ? "50" : "100"} words</Badge>}
          </div>
          {!locked && (
            isExpanded ? <ChevronDown className="h-4 w-4 text-gray-600" /> : <ChevronRight className="h-4 w-4 text-gray-600" />
          )}
        </button>

        <AnimatePresence>
          {isExpanded && !locked && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 py-4 bg-gray-50">
                {content}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Mobile FAB */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          onClick={() => setMobileDrawerOpen(true)}
          className="rounded-full h-14 w-14 shadow-lg"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL - Writing Area */}
        <motion.div
          className={cn(
            "flex flex-col transition-all duration-300",
            panelWidthClass,
            writingMode === "zen" && "w-full"
          )}
          layout
        >
          {/* Momentum Indicator */}
          {renderMomentumIndicator()}

          {/* Writing Area */}
          <div
            className={cn(
              "flex-1 flex flex-col bg-gradient-to-br from-amber-50/50 to-orange-50/30 transition-all duration-500",
              breathingColor,
              "border-l-4"
            )}
          >
            <div className="flex-1 p-8 md:p-12 lg:p-16 overflow-y-auto">
              <div className="max-w-3xl mx-auto space-y-6">
                {/* Title Input */}
                <Input
                  ref={textareaRef}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Letter Title..."
                  className={cn(
                    "text-2xl font-semibold bg-transparent border-none shadow-none focus-visible:ring-0 px-0",
                    `font-${formatSettings.fontFamily}`
                  )}
                />

                {/* Body Textarea */}
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Dear future me..."
                  className={cn(
                    "min-h-[400px] bg-transparent border-none shadow-none focus-visible:ring-0 resize-none px-0",
                    `font-${formatSettings.fontFamily}`
                  )}
                  style={{
                    fontSize: `${formatSettings.fontSize}px`,
                    lineHeight: formatSettings.lineHeight,
                    letterSpacing: `${formatSettings.letterSpacing}px`,
                  }}
                />

                {/* Helpful Prompt (when paused) */}
                {wordCount === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-gray-400 text-sm italic"
                  >
                    ✍️ Your story begins here... Start typing to unlock features
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT PANEL - Controls (Desktop) */}
        <AnimatePresence>
          {rightPanelVisible && writingMode !== "zen" && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: writingMode === "focus" ? "15%" : "38%", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="hidden md:flex flex-col bg-white border-l border-gray-200 overflow-hidden"
            >
              {/* Stats Bar */}
              {renderStatsBar()}

              {/* Sections */}
              <ScrollArea className="flex-1">
                {renderPanelSection("format", Type, "Format", renderFormatSection(), !isFormatUnlocked)}
                {renderPanelSection("delivery", Calendar, "Delivery", renderDeliverySection())}
                {deliveryChannel === "mail" && renderPanelSection("address", MapPin, "Address", renderAddressSection())}
                {renderPanelSection("templates", FileText, "Templates", renderTemplatesSection(), !isAdvancedUnlocked)}
                {renderPanelSection("ambiance", Music, "Ambiance", renderAmbianceSection(), !isAdvancedUnlocked)}
              </ScrollArea>

              {/* Action Buttons */}
              <div className="p-4 border-t border-gray-200 space-y-2 bg-white">
                <Button onClick={handleSaveNow} variant="outline" className="w-full" size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Save Now
                </Button>
                <Button onClick={handleSchedule} className="w-full" size="sm" disabled={!deliveryDate}>
                  <Send className="h-4 w-4 mr-2" />
                  Schedule Letter
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileDrawerOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />

            {/* Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 h-[70vh] bg-white rounded-t-2xl z-50 md:hidden flex flex-col"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="font-semibold text-lg">Letter Settings</h3>
                <Button variant="ghost" size="sm" onClick={() => setMobileDrawerOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Drawer Stats */}
              {renderStatsBar()}

              {/* Drawer Content */}
              <ScrollArea className="flex-1">
                {renderPanelSection("format", Type, "Format", renderFormatSection(), !isFormatUnlocked)}
                {renderPanelSection("delivery", Calendar, "Delivery", renderDeliverySection())}
                {deliveryChannel === "mail" && renderPanelSection("address", MapPin, "Address", renderAddressSection())}
                {renderPanelSection("templates", FileText, "Templates", renderTemplatesSection(), !isAdvancedUnlocked)}
                {renderPanelSection("ambiance", Music, "Ambiance", renderAmbianceSection(), !isAdvancedUnlocked)}
              </ScrollArea>

              {/* Drawer Actions */}
              <div className="p-4 border-t border-gray-200 space-y-2 bg-white">
                <Button onClick={handleSaveNow} variant="outline" className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Now
                </Button>
                <Button onClick={handleSchedule} className="w-full" disabled={!deliveryDate}>
                  <Send className="h-4 w-4 mr-2" />
                  Schedule Letter
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Debug Info */}
      {showDebugInfo && (
        <div className="fixed bottom-4 left-4 bg-black text-white text-xs p-3 rounded-lg space-y-1 z-50">
          <div>Words: {wordCount}</div>
          <div>Unlock Level: {unlockLevel}</div>
          <div>Mode: {writingMode}</div>
          <div>Duration: {writingDuration}s</div>
        </div>
      )}
    </div>
  )
}
