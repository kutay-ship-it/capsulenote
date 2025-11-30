"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Calendar,
  Save,
  Send,
  Clock,
  Sparkles,
  Eye,
  Volume2,
  VolumeX,
  Zap,
  Heart,
  Brain,
  TrendingUp,
  Moon,
  Sun,
  Sunrise,
  Sunset,
  MessageCircle,
  Network,
  ChevronRight,
  ChevronDown,
  Music,
  Palette,
  FileText,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ============================================================================
// TYPES
// ============================================================================

type TimeOfDay = "morning" | "afternoon" | "evening" | "lateNight"
type EditorState = "virgin" | "warming" | "flowing" | "reflecting" | "mastery"
type TypingRhythm = "calm" | "moderate" | "intense"
type OverlayMode = "templates" | "ambient" | "echoes" | "constellation" | null

interface TemporalCanvasEditorProps {
  initialTitle?: string
  initialBody?: string
  onChange?: (data: TemporalLetterData) => void
  onSave?: (data: TemporalLetterData) => void
  onSchedule?: (data: TemporalLetterData) => void
  showDebugInfo?: boolean
}

interface TemporalLetterData {
  title: string
  body: string
  metadata: {
    wordCount: number
    characterCount: number
    writingDuration: number
    unlockLevel: number
    editorState: EditorState
    typingRhythm: TypingRhythm
    timeOfDay: TimeOfDay
    emotionalTone: string[]
    pastEchoes: number
  }
}

interface TemporalEcho {
  snippet: string
  timeAgo: string
  relevance: number
}

interface MilestoneUnlock {
  threshold: number
  level: number
  message: string
  features: string[]
}

// ============================================================================
// CONSTANTS
// ============================================================================

const UNLOCK_MILESTONES: MilestoneUnlock[] = [
  {
    threshold: 0,
    level: 0,
    message: "Begin your journey...",
    features: ["Basic writing", "Auto-save", "Voice typing"],
  },
  {
    threshold: 10,
    level: 1,
    message: "Momentum building! ✨",
    features: ["Breathing interface", "Undo/redo", "Word count"],
  },
  {
    threshold: 50,
    level: 2,
    message: "Enhanced expression unlocked!",
    features: ["Formatting", "Emoji picker", "Mood tags"],
  },
  {
    threshold: 100,
    level: 3,
    message: "Deep flow state achieved!",
    features: ["Ambient sounds", "Templates", "Reading time"],
  },
  {
    threshold: 200,
    level: 4,
    message: "Reflection tools activated!",
    features: ["Emotion analysis", "Past echoes", "Analytics"],
  },
  {
    threshold: 300,
    level: 5,
    message: "Mastery level reached! 🎉",
    features: ["Constellation view", "Advanced scheduling", "Export"],
  },
]

const TIME_OF_DAY_CONFIG = {
  morning: {
    icon: Sunrise,
    greeting: "Good morning",
    prompt: "What's on your mind as you start today?",
    colors: "from-amber-50 to-orange-50",
    borderColor: "border-orange-300",
  },
  afternoon: {
    icon: Sun,
    greeting: "Checking in",
    prompt: "How's your day unfolding?",
    colors: "from-yellow-50 to-amber-50",
    borderColor: "border-yellow-300",
  },
  evening: {
    icon: Sunset,
    greeting: "Reflecting mode",
    prompt: "What stood out today?",
    colors: "from-purple-50 to-pink-50",
    borderColor: "border-purple-300",
  },
  lateNight: {
    icon: Moon,
    greeting: "Processing hours",
    prompt: "This is your safe space.",
    colors: "from-indigo-50 to-purple-50",
    borderColor: "border-indigo-400",
  },
}

const AMBIENT_SOUNDS = [
  { id: "none", label: "Silence", icon: VolumeX },
  { id: "rain", label: "Rain", icon: Volume2 },
  { id: "ocean", label: "Ocean", icon: Volume2 },
  { id: "forest", label: "Forest", icon: Volume2 },
  { id: "cafe", label: "Café", icon: Volume2 },
]

const TEMPLATES = [
  {
    id: "hello",
    title: "Hello Future Me",
    preview: "Dear future me, I'm writing this on...",
    content: "Dear future me,\n\nI'm writing this on [date] and I want you to know...\n\n",
  },
  {
    id: "reflection",
    title: "Today I Realized",
    preview: "Today I realized something important...",
    content: "Today I realized something important about myself...\n\n",
  },
  {
    id: "goals",
    title: "My Aspirations",
    preview: "By the time you read this...",
    content: "By the time you read this, I hope:\n\n1. \n2. \n3. \n\n",
  },
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return "morning"
  if (hour >= 12 && hour < 17) return "afternoon"
  if (hour >= 17 && hour < 22) return "evening"
  return "lateNight"
}

function calculateTypingRhythm(recentKeystrokes: number[]): TypingRhythm {
  if (recentKeystrokes.length < 2) return "calm"
  const avgInterval =
    recentKeystrokes.reduce((sum, time, i, arr) => {
      if (i === 0) return sum
      const prevTime = arr[i - 1]!
      return sum + (time - prevTime)
    }, 0) /
    (recentKeystrokes.length - 1)

  if (avgInterval < 100) return "intense"
  if (avgInterval < 200) return "moderate"
  return "calm"
}

function determineEditorState(wordCount: number): EditorState {
  if (wordCount === 0) return "virgin"
  if (wordCount < 50) return "warming"
  if (wordCount < 200) return "flowing"
  if (wordCount < 300) return "reflecting"
  return "mastery"
}

function generateMockEchoes(body: string): TemporalEcho[] {
  if (body.length < 50) return []

  const themes = ["career", "relationships", "growth", "health", "dreams"]
  const randomTheme = themes[Math.floor(Math.random() * themes.length)]!

  return [
    {
      snippet: `"6 months ago: I was thinking about ${randomTheme} and realized..."`,
      timeAgo: "6 months ago",
      relevance: 0.85,
    },
    {
      snippet: `"1 year ago: Similar thoughts about ${randomTheme}, but I've grown..."`,
      timeAgo: "1 year ago",
      relevance: 0.72,
    },
  ]
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function TemporalCanvasEditor({
  initialTitle = "",
  initialBody = "",
  onChange,
  onSave,
  onSchedule,
  showDebugInfo = false,
}: TemporalCanvasEditorProps) {
  // ============================================================================
  // STATE
  // ============================================================================

  const [title, setTitle] = useState(initialTitle)
  const [body, setBody] = useState(initialBody)
  const [wordCount, setWordCount] = useState(0)
  const [characterCount, setCharacterCount] = useState(0)
  const [writingDuration, setWritingDuration] = useState(0)
  const [unlockLevel, setUnlockLevel] = useState(0)
  const [editorState, setEditorState] = useState<EditorState>("virgin")
  const [typingRhythm, setTypingRhythm] = useState<TypingRhythm>("calm")
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>(getTimeOfDay())
  const [recentKeystrokes, setRecentKeystrokes] = useState<number[]>([])
  const [temporalEchoes, setTemporalEchoes] = useState<TemporalEcho[]>([])
  const [activeOverlay, setActiveOverlay] = useState<OverlayMode>(null)
  const [showMilestone, setShowMilestone] = useState(false)
  const [latestMilestone, setLatestMilestone] = useState<MilestoneUnlock | null>(null)
  const [ambientSound, setAmbientSound] = useState("none")
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)
  const [distractionFree, setDistractionFree] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const sessionStartRef = useRef(Date.now())
  const typingTimerRef = useRef<NodeJS.Timeout>()
  const durationTimerRef = useRef<NodeJS.Timeout>()

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Calculate metrics
  useEffect(() => {
    const words = body.trim().split(/\s+/).filter(Boolean).length
    const chars = body.length

    setWordCount(words)
    setCharacterCount(chars)
    setEditorState(determineEditorState(words))

    // Check for milestone unlocks
    const nextMilestone = UNLOCK_MILESTONES.find(
      (m) => words >= m.threshold && unlockLevel < m.level
    )
    if (nextMilestone) {
      setUnlockLevel(nextMilestone.level)
      setLatestMilestone(nextMilestone)
      setShowMilestone(true)
      setTimeout(() => setShowMilestone(false), 4000)
    }

    // Generate temporal echoes
    if (words >= 100) {
      setTemporalEchoes(generateMockEchoes(body))
    }
  }, [body, unlockLevel])

  // Writing duration tracker
  useEffect(() => {
    if (body.length > 0) {
      durationTimerRef.current = setInterval(() => {
        setWritingDuration((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current)
      }
    }
  }, [body.length])

  // Typing detection
  useEffect(() => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current)
    }

    setIsTyping(true)
    typingTimerRef.current = setTimeout(() => {
      setIsTyping(false)
    }, 1000)

    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current)
      }
    }
  }, [body])

  // Auto-hide panels when typing
  useEffect(() => {
    if (isTyping && wordCount > 50) {
      setDistractionFree(true)
    } else if (!isTyping) {
      setTimeout(() => setDistractionFree(false), 2000)
    }
  }, [isTyping, wordCount])

  // OnChange callback
  useEffect(() => {
    if (onChange) {
      onChange({
        title,
        body,
        metadata: {
          wordCount,
          characterCount,
          writingDuration,
          unlockLevel,
          editorState,
          typingRhythm,
          timeOfDay,
          emotionalTone: [],
          pastEchoes: temporalEchoes.length,
        },
      })
    }
  }, [title, body, wordCount, characterCount, writingDuration, unlockLevel, editorState, typingRhythm, timeOfDay, temporalEchoes.length, onChange])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleBodyChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(e.target.value)
    const now = Date.now()
    setRecentKeystrokes((prev) => [...prev.slice(-10), now])
    setTypingRhythm(calculateTypingRhythm([...recentKeystrokes, now]))
  }, [recentKeystrokes])

  const handleSave = useCallback(() => {
    if (onSave) {
      onSave({
        title,
        body,
        metadata: {
          wordCount,
          characterCount,
          writingDuration,
          unlockLevel,
          editorState,
          typingRhythm,
          timeOfDay,
          emotionalTone: [],
          pastEchoes: temporalEchoes.length,
        },
      })
    }
  }, [title, body, wordCount, characterCount, writingDuration, unlockLevel, editorState, typingRhythm, timeOfDay, temporalEchoes.length, onSave])

  const handleSchedule = useCallback(() => {
    if (onSchedule) {
      onSchedule({
        title,
        body,
        metadata: {
          wordCount,
          characterCount,
          writingDuration,
          unlockLevel,
          editorState,
          typingRhythm,
          timeOfDay,
          emotionalTone: [],
          pastEchoes: temporalEchoes.length,
        },
      })
    }
  }, [title, body, wordCount, characterCount, writingDuration, unlockLevel, editorState, typingRhythm, timeOfDay, temporalEchoes.length, onSchedule])

  const insertTemplate = useCallback((template: typeof TEMPLATES[0]) => {
    setBody(template.content)
    setActiveOverlay(null)
    textareaRef.current?.focus()
  }, [])

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const timeConfig = TIME_OF_DAY_CONFIG[timeOfDay]
  const currentMilestone = UNLOCK_MILESTONES[unlockLevel]!
  const nextMilestone = UNLOCK_MILESTONES[unlockLevel + 1]
  const progressToNext = nextMilestone
    ? Math.min((wordCount / nextMilestone.threshold) * 100, 100)
    : 100

  const breathingSpeed =
    typingRhythm === "intense" ? "1.5s" : typingRhythm === "moderate" ? "2.5s" : "4s"

  const canvasWidth = distractionFree ? "100%" : rightPanelCollapsed ? "80%" : "62%"

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <>
      <style jsx global>{`
        @keyframes breathe {
          0%, 100% { border-color: currentColor; opacity: 0.3; }
          50% { border-color: currentColor; opacity: 1; }
        }

        .breathing-border {
          animation: breathe ${breathingSpeed} ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .breathing-border {
            animation: none;
          }
        }
      `}</style>

      <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Temporal Context Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: distractionFree ? 0 : 1, y: 0 }}
          className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200"
        >
          <div className="flex items-center gap-3">
            <timeConfig.icon className="h-5 w-5 text-gray-600" />
            <div>
              <p className="font-mono text-sm font-medium text-gray-900">
                {timeConfig.greeting}
              </p>
              <p className="font-mono text-xs text-gray-500">{timeConfig.prompt}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="font-mono text-xs">
              <Clock className="mr-1 h-3 w-3" />
              {Math.floor(writingDuration / 60)}:{String(writingDuration % 60).padStart(2, "0")}
            </Badge>
            <Badge variant="outline" className="font-mono text-xs">
              Level {unlockLevel}
            </Badge>
          </div>
        </motion.div>

        {/* Main Layout */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Writing Canvas */}
          <motion.div
            className="flex flex-col"
            animate={{ width: canvasWidth }}
            transition={{ duration: 0.3 }}
          >
            {/* Progress Bar */}
            <AnimatePresence>
              {wordCount > 0 && !distractionFree && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 4, opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="w-full bg-gray-100"
                >
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressToNext}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Writing Area */}
            <div
              className={cn(
                "flex-1 p-8 md:p-12 lg:p-16 overflow-y-auto transition-all duration-500",
                `bg-gradient-to-br ${timeConfig.colors}`,
                editorState !== "virgin" && "border-l-4 breathing-border",
                timeConfig.borderColor
              )}
            >
              <div className="max-w-3xl mx-auto space-y-6">
                {/* Title */}
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Letter Title..."
                  className="text-2xl font-semibold bg-transparent border-none shadow-none focus-visible:ring-0 px-0 font-serif"
                />

                {/* Body */}
                <Textarea
                  ref={textareaRef}
                  value={body}
                  onChange={handleBodyChange}
                  placeholder="Dear future me..."
                  className="min-h-[400px] text-base leading-relaxed bg-transparent border-none shadow-none focus-visible:ring-0 resize-none px-0 font-serif"
                  style={{ fontSize: "18px", lineHeight: "1.8" }}
                />

                {/* Virgin State Prompt */}
                {editorState === "virgin" && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-gray-400 text-sm italic space-y-2"
                  >
                    <p>✍️ Your story begins here...</p>
                    <p className="text-xs">Start typing to unlock features progressively</p>
                  </motion.div>
                )}

                {/* Temporal Echoes */}
                <AnimatePresence>
                  {temporalEchoes.length > 0 && unlockLevel >= 4 && !distractionFree && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-3 mt-8 pt-6 border-t border-gray-200"
                    >
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <MessageCircle className="h-4 w-4" />
                        <span>Echoes from your past...</span>
                      </div>
                      {temporalEchoes.map((echo, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.6 }}
                          className="pl-4 border-l-2 border-purple-300 text-sm italic text-gray-600"
                        >
                          {echo.snippet}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Context Sidebar */}
          <AnimatePresence>
            {!distractionFree && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{
                  width: rightPanelCollapsed ? "20%" : "38%",
                  opacity: 1,
                }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white border-l border-gray-200 flex flex-col overflow-hidden"
              >
                {/* Stats */}
                <div className="p-4 border-b border-gray-200 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Words</span>
                    <span className="font-mono font-medium">{wordCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Characters</span>
                    <span className="font-mono font-medium">{characterCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Reading time</span>
                    <span className="font-mono font-medium">
                      {Math.ceil(wordCount / 200)} min
                    </span>
                  </div>
                </div>

                {/* Unlock Progress */}
                {!rightPanelCollapsed && (
                  <div className="p-4 border-b border-gray-200 space-y-3">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Unlock Progress</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>{currentMilestone.message}</span>
                        <span>
                          {wordCount}/{nextMilestone?.threshold || "MAX"}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                          style={{ width: `${progressToNext}%` }}
                        />
                      </div>
                      <div className="pt-2 space-y-1">
                        {currentMilestone.features.map((feature, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-xs text-gray-600"
                          >
                            <Sparkles className="h-3 w-3 text-purple-500" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                {!rightPanelCollapsed && (
                  <div className="p-4 space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveOverlay("templates")}
                      disabled={unlockLevel < 3}
                      className="w-full justify-start"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Templates
                      {unlockLevel < 3 && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          Unlock at 100
                        </Badge>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveOverlay("ambient")}
                      disabled={unlockLevel < 3}
                      className="w-full justify-start"
                    >
                      <Music className="h-4 w-4 mr-2" />
                      Ambient Sounds
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveOverlay("constellation")}
                      disabled={unlockLevel < 5}
                      className="w-full justify-start"
                    >
                      <Network className="h-4 w-4 mr-2" />
                      Constellation View
                      {unlockLevel < 5 && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          Unlock at 300
                        </Badge>
                      )}
                    </Button>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-auto p-4 border-t border-gray-200 space-y-2">
                  <Button onClick={handleSave} variant="outline" className="w-full" size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    onClick={handleSchedule}
                    className="w-full"
                    size="sm"
                    disabled={wordCount < 10}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Schedule Delivery
                  </Button>
                </div>

                {/* Collapse Toggle */}
                <button
                  onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}
                  className="absolute top-1/2 -left-3 bg-white border border-gray-200 rounded-full p-1 shadow-sm hover:bg-gray-50"
                >
                  {rightPanelCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4 rotate-90" />
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Floating Overlays */}
          <AnimatePresence>
            {activeOverlay === "templates" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-8"
                onClick={() => setActiveOverlay(null)}
              >
                <Card
                  className="w-full max-w-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Letter Templates</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveOverlay(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3">
                        {TEMPLATES.map((template) => (
                          <button
                            key={template.id}
                            onClick={() => insertTemplate(template)}
                            className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
                          >
                            <p className="font-medium text-sm mb-1">{template.title}</p>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {template.preview}
                            </p>
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeOverlay === "ambient" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-8"
                onClick={() => setActiveOverlay(null)}
              >
                <Card
                  className="w-full max-w-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Ambient Sounds</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveOverlay(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {AMBIENT_SOUNDS.map((sound) => (
                        <Button
                          key={sound.id}
                          variant={ambientSound === sound.id ? "default" : "outline"}
                          onClick={() => setAmbientSound(sound.id)}
                          className="justify-start"
                        >
                          <sound.icon className="h-4 w-4 mr-2" />
                          {sound.label}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeOverlay === "constellation" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-8"
                onClick={() => setActiveOverlay(null)}
              >
                <Card
                  className="w-full max-w-3xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold">Letter Constellation</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setActiveOverlay(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Constellation Visualization */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Brain className="h-5 w-5 text-purple-600" />
                          <span className="font-semibold">Core Themes</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {["growth", "reflection", "goals"].map((theme) => (
                            <Badge key={theme} variant="secondary">
                              {theme}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Heart className="h-5 w-5 text-pink-600" />
                          <span className="font-semibold">Emotional Arc</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {editorState === "mastery" ? "Reflective → Hopeful → Determined" : "Building..."}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                          <span className="font-semibold">Writing Flow</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {Math.floor(writingDuration / 60)} minutes of focused writing
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Eye className="h-5 w-5 text-blue-600" />
                          <span className="font-semibold">Future Preview</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {wordCount > 200 ? "Your future self will cherish this" : "Keep writing for preview"}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="text-center text-sm text-gray-500">
                      🌟 This letter will become part of your personal constellation
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Milestone Toast */}
          <AnimatePresence>
            {showMilestone && latestMilestone && (
              <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                className="absolute top-20 left-1/2 -translate-x-1/2 z-50"
              >
                <Card className="border-2 border-purple-500 bg-white shadow-2xl">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Sparkles className="h-6 w-6 text-purple-600" />
                    <div>
                      <p className="font-bold text-purple-900">
                        {latestMilestone.message}
                      </p>
                      <p className="text-xs text-gray-600">
                        New features unlocked!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Debug Info */}
        {showDebugInfo && (
          <div className="fixed bottom-4 left-4 bg-black text-white text-xs p-3 rounded-lg space-y-1 font-mono z-50">
            <div>State: {editorState}</div>
            <div>Rhythm: {typingRhythm}</div>
            <div>Level: {unlockLevel}</div>
            <div>Time: {timeOfDay}</div>
            <div>Echoes: {temporalEchoes.length}</div>
          </div>
        )}
      </div>
    </>
  )
}
