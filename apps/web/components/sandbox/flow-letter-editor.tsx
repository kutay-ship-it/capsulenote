"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Sparkles, X, Calendar, Save, Maximize2, Coffee,
  Heart, Smile, Zap, Target, BookOpen, Clock
} from "lucide-react"
import { cn } from "@/lib/utils"

// Types
type EmotionType = "reflective" | "hopeful" | "calm" | "passionate" | "growing" | "excited" | "determined" | "grateful"
type WritingState = "initial" | "warming_up" | "flowing" | "momentum"

interface FlowLetterEditorProps {
  initialTitle?: string
  initialBody?: string
  initialEmotion?: EmotionType
  initialDeliveryDate?: Date
  onChange?: (data: FlowLetterData) => void
  onSave?: (data: FlowLetterData) => void
  onSchedule?: (data: FlowLetterData) => void
  enableFocusMode?: boolean
  enableEmotionPalette?: boolean
  enableTimeCapsule?: boolean
  enablePrompts?: boolean
  enableMilestones?: boolean
  autoSaveInterval?: number
  accentColor?: "blue" | "purple" | "yellow" | "teal"
  showDebugInfo?: boolean
}

interface FlowLetterData {
  title: string
  body: string
  emotion?: EmotionType
  deliveryDate?: Date
  metadata: {
    wordCount: number
    characterCount: number
    writingDuration: number
    momentum: number
    achievedMilestones: string[]
  }
}

interface Milestone {
  id: string
  threshold: number
  type: "words" | "time"
  message: string
  icon: string
}

const emotions: Array<{ type: EmotionType; emoji: string; label: string; color: string }> = [
  { type: "reflective", emoji: "💭", label: "Reflective", color: "bg-bg-purple-light" },
  { type: "hopeful", emoji: "✨", label: "Hopeful", color: "bg-bg-yellow-pale" },
  { type: "calm", emoji: "🌊", label: "Calm", color: "bg-bg-blue-light" },
  { type: "passionate", emoji: "🔥", label: "Passionate", color: "bg-bg-peach-light" },
  { type: "growing", emoji: "🌱", label: "Growing", color: "bg-bg-green-light" },
  { type: "excited", emoji: "💫", label: "Excited", color: "bg-bg-pink-light" },
  { type: "determined", emoji: "🎯", label: "Determined", color: "bg-duck-blue" },
  { type: "grateful", emoji: "💙", label: "Grateful", color: "bg-teal-primary/30" },
]

const milestones: Milestone[] = [
  { id: "first-words", threshold: 1, type: "words", message: "You've begun! Keep going...", icon: "✍️" },
  { id: "warming-up", threshold: 25, type: "words", message: "You're warming up!", icon: "🎉" },
  { id: "flowing", threshold: 50, type: "words", message: "You're in the flow!", icon: "✨" },
  { id: "momentum", threshold: 100, type: "words", message: "Momentum unlocked!", icon: "🚀" },
  { id: "dedicated", threshold: 300, type: "time", message: "5 minutes! You're on fire!", icon: "💫" },
]

const contextualPrompts = [
  { category: "opening", text: "Dear future me, today I realized..." },
  { category: "opening", text: "Right now, what matters most is..." },
  { category: "opening", text: "I want you to remember this moment because..." },
  { category: "reflection", text: "The best thing that happened recently was..." },
  { category: "reflection", text: "Something I'm proud of right now..." },
  { category: "reflection", text: "A challenge I'm facing is..." },
  { category: "future", text: "By the time you read this, I hope..." },
  { category: "future", text: "I'm curious if you still..." },
  { category: "future", text: "Remember when we decided to..." },
  { category: "emotional", text: "Today I'm feeling..." },
  { category: "emotional", text: "What's bringing me joy..." },
  { category: "emotional", text: "What I need to hear is..." },
]

export function FlowLetterEditor({
  initialTitle = "",
  initialBody = "",
  initialEmotion,
  initialDeliveryDate,
  onChange,
  onSave,
  onSchedule,
  enableFocusMode = true,
  enableEmotionPalette = true,
  enableTimeCapsule = true,
  enablePrompts = true,
  enableMilestones = true,
  autoSaveInterval = 5000,
  accentColor = "purple",
  showDebugInfo = false,
}: FlowLetterEditorProps) {
  // Core state
  const [title, setTitle] = useState(initialTitle)
  const [body, setBody] = useState(initialBody)
  const [emotion, setEmotion] = useState<EmotionType | undefined>(initialEmotion)
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(initialDeliveryDate)

  // Writing metrics
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [wpm, setWpm] = useState(0)
  const [momentum, setMomentum] = useState(0)
  const [writingState, setWritingState] = useState<WritingState>("initial")

  // Session tracking
  const [sessionStartTime] = useState(Date.now())
  const [lastTypingTime, setLastTypingTime] = useState(Date.now())
  const [isPaused, setIsPaused] = useState(false)
  const [pauseDuration, setPauseDuration] = useState(0)

  // Feature states
  const [isFocused, setIsFocused] = useState(false)
  const [showEmotionPalette, setShowEmotionPalette] = useState(false)
  const [showTimeCapsule, setShowTimeCapsule] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [currentPrompt, setCurrentPrompt] = useState(contextualPrompts[0])
  const [achievedMilestones, setAchievedMilestones] = useState<string[]>([])
  const [showMilestoneToast, setShowMilestoneToast] = useState(false)
  const [latestMilestone, setLatestMilestone] = useState<Milestone | null>(null)
  const [showFAB, setShowFAB] = useState(false)
  const [fabMenuOpen, setFabMenuOpen] = useState(false)

  // Refs
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const pauseTimerRef = useRef<NodeJS.Timeout>()
  const autosaveTimerRef = useRef<NodeJS.Timeout>()

  // Calculate writing metrics
  useEffect(() => {
    const words = body.trim() ? body.trim().split(/\s+/) : []
    const newWordCount = words.length
    const newCharCount = body.length

    setWordCount(newWordCount)
    setCharCount(newCharCount)

    // Calculate WPM
    const durationMinutes = (Date.now() - sessionStartTime) / 60000
    const calculatedWpm = durationMinutes > 0 ? Math.round(newWordCount / durationMinutes) : 0
    setWpm(calculatedWpm)

    // Calculate momentum (0-100 based on consistency)
    const timeSinceLastType = Date.now() - lastTypingTime
    let momentumScore = 0
    if (newWordCount > 0) {
      const baseScore = Math.min(newWordCount / 2, 50) // Up to 50 points for word count
      const consistencyScore = Math.max(0, 50 - (timeSinceLastType / 1000)) // Up to 50 points for consistency
      momentumScore = Math.min(100, baseScore + consistencyScore)
    }
    setMomentum(Math.round(momentumScore))

    // Determine writing state
    if (newWordCount === 0) {
      setWritingState("initial")
    } else if (newWordCount < 25) {
      setWritingState("warming_up")
    } else if (newWordCount < 100) {
      setWritingState("flowing")
    } else {
      setWritingState("momentum")
    }

    // Check for milestones
    if (enableMilestones) {
      const sessionDuration = (Date.now() - sessionStartTime) / 1000
      milestones.forEach((milestone) => {
        if (!achievedMilestones.includes(milestone.id)) {
          const threshold = milestone.type === "words" ? newWordCount : sessionDuration
          const target = milestone.threshold

          if (threshold >= target) {
            setAchievedMilestones((prev) => [...prev, milestone.id])
            setLatestMilestone(milestone)
            setShowMilestoneToast(true)
            setTimeout(() => setShowMilestoneToast(false), 3000)
          }
        }
      })
    }

    // Unlock features progressively
    setShowFAB(newWordCount >= 10)
    if (enableEmotionPalette) {
      setShowEmotionPalette(newWordCount >= 50)
    }
    if (enableTimeCapsule) {
      setShowTimeCapsule(newWordCount >= 100)
    }

    // Trigger onChange callback
    if (onChange) {
      onChange({
        title,
        body,
        emotion,
        deliveryDate,
        metadata: {
          wordCount: newWordCount,
          characterCount: newCharCount,
          writingDuration: Math.round((Date.now() - sessionStartTime) / 1000),
          momentum: momentumScore,
          achievedMilestones,
        },
      })
    }
  }, [body, title, emotion, deliveryDate, sessionStartTime, lastTypingTime, achievedMilestones, enableMilestones, enableEmotionPalette, enableTimeCapsule, onChange])

  // Pause detection
  useEffect(() => {
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current)
    }

    if (body.length > 0) {
      pauseTimerRef.current = setTimeout(() => {
        setIsPaused(true)
        setPauseDuration(Date.now() - lastTypingTime)

        if (enablePrompts && !isFocused) {
          const randomPrompt = contextualPrompts[Math.floor(Math.random() * contextualPrompts.length)]
          setCurrentPrompt(randomPrompt)
          setShowPrompt(true)
        }
      }, 30000) // 30 seconds
    }

    return () => {
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current)
      }
    }
  }, [body, lastTypingTime, enablePrompts, isFocused])

  // Auto-save
  useEffect(() => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current)
    }

    if (body.length > 0 && onSave) {
      autosaveTimerRef.current = setTimeout(() => {
        onSave({
          title,
          body,
          emotion,
          deliveryDate,
          metadata: {
            wordCount,
            characterCount: charCount,
            writingDuration: Math.round((Date.now() - sessionStartTime) / 1000),
            momentum,
            achievedMilestones,
          },
        })
      }, autoSaveInterval)
    }

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current)
      }
    }
  }, [title, body, emotion, deliveryDate, autoSaveInterval, onSave, wordCount, charCount, momentum, achievedMilestones, sessionStartTime])

  // Handle typing
  const handleBodyChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBody(e.target.value)
    setLastTypingTime(Date.now())
    setIsPaused(false)
    setShowPrompt(false)
  }, [])

  // Insert prompt at cursor
  const handleInsertPrompt = useCallback(() => {
    if (bodyRef.current) {
      const start = bodyRef.current.selectionStart
      const end = bodyRef.current.selectionEnd
      const newBody = body.substring(0, start) + currentPrompt.text + body.substring(end)
      setBody(newBody)
      setShowPrompt(false)

      // Focus and move cursor
      setTimeout(() => {
        if (bodyRef.current) {
          bodyRef.current.focus()
          const newCursorPos = start + currentPrompt.text.length
          bodyRef.current.setSelectionRange(newCursorPos, newCursorPos)
        }
      }, 0)
    }
  }, [body, currentPrompt])

  // Focus mode
  const enterFocusMode = useCallback(() => {
    setIsFocused(true)
    setShowPrompt(false)
    setFabMenuOpen(false)
  }, [])

  const exitFocusMode = useCallback(() => {
    setIsFocused(false)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to exit focus mode
      if (e.key === "Escape" && isFocused) {
        exitFocusMode()
      }

      // Cmd/Ctrl + F to toggle focus mode
      if ((e.metaKey || e.ctrlKey) && e.key === "f" && enableFocusMode) {
        e.preventDefault()
        if (isFocused) {
          exitFocusMode()
        } else {
          enterFocusMode()
        }
      }

      // Cmd/Ctrl + S to save
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault()
        if (onSave) {
          onSave({
            title,
            body,
            emotion,
            deliveryDate,
            metadata: {
              wordCount,
              characterCount: charCount,
              writingDuration: Math.round((Date.now() - sessionStartTime) / 1000),
              momentum,
              achievedMilestones,
            },
          })
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isFocused, enableFocusMode, enterFocusMode, exitFocusMode, onSave, title, body, emotion, deliveryDate, wordCount, charCount, momentum, achievedMilestones, sessionStartTime])

  // Breathing animation class
  const breathingClass = cn(
    "breathing-border",
    writingState === "warming_up" && "breathing-slow",
    writingState === "flowing" && "breathing-medium",
    writingState === "momentum" && "breathing-fast"
  )

  // Momentum bar color
  const getMomentumColor = () => {
    if (momentum < 20) return "bg-gray-400"
    if (momentum < 40) return "bg-yellow-400"
    if (momentum < 60) return "bg-orange-400"
    if (momentum < 80) return "bg-coral"
    return "bg-purple-600"
  }

  return (
    <>
      <style jsx global>{`
        @keyframes breathe-slow {
          0%, 100% { border-color: rgb(56, 56, 56); }
          50% { border-color: rgb(147, 51, 234); }
        }
        @keyframes breathe-medium {
          0%, 100% { border-color: rgb(56, 56, 56); }
          50% { border-color: rgb(147, 51, 234); }
        }
        @keyframes breathe-fast {
          0%, 100% { border-color: rgb(56, 56, 56); }
          50% { border-color: rgb(147, 51, 234); }
        }

        .breathing-border {
          transition: border-color 0.3s ease;
        }
        .breathing-slow {
          animation: breathe-slow 4s ease-in-out infinite;
        }
        .breathing-medium {
          animation: breathe-medium 3s ease-in-out infinite;
        }
        .breathing-fast {
          animation: breathe-fast 2s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .breathing-slow, .breathing-medium, .breathing-fast {
            animation: none;
          }
        }
      `}</style>

      <div className="relative space-y-4">
        {/* Debug Info */}
        {showDebugInfo && (
          <Card className="border-2 border-dashed border-gray-400 bg-gray-100">
            <CardContent className="p-3 font-mono text-xs space-y-1">
              <div>State: {writingState}</div>
              <div>Words: {wordCount} | Chars: {charCount}</div>
              <div>WPM: {wpm} | Momentum: {momentum}</div>
              <div>Paused: {isPaused ? "Yes" : "No"}</div>
              <div>Milestones: {achievedMilestones.join(", ")}</div>
            </CardContent>
          </Card>
        )}

        {/* Momentum Bar */}
        <AnimatePresence>
          {writingState !== "initial" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase text-gray-secondary">
                    Writing Momentum
                  </span>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {wpm} WPM
                  </Badge>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <motion.div
                    className={cn("h-full", getMomentumColor())}
                    initial={{ width: 0 }}
                    animate={{ width: `${momentum}%` }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Editor Card */}
        <Card
          className={cn(
            "border-2 shadow-lg transition-all",
            breathingClass,
            isFocused && "scale-105"
          )}
        >
          <CardContent className="space-y-4 p-6">
            {/* Title Input */}
            <motion.div
              animate={{ opacity: isFocused ? 0.5 : 1 }}
              className="space-y-2"
            >
              <label className="font-mono text-xs uppercase text-charcoal">
                Letter Title
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Name this moment..."
                className="border-2 border-charcoal font-mono uppercase"
                disabled={isFocused}
              />
            </motion.div>

            {/* Body Textarea */}
            <div className="relative space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-mono text-xs uppercase text-charcoal">
                  Your Letter
                </label>
                <motion.div
                  animate={{ opacity: isFocused ? 0 : 1 }}
                  className="flex gap-2 font-mono text-xs text-gray-secondary"
                >
                  <span>{wordCount} words</span>
                  <span>·</span>
                  <span>{charCount} chars</span>
                </motion.div>
              </div>
              <Textarea
                ref={bodyRef}
                value={body}
                onChange={handleBodyChange}
                placeholder="Dear future me, today I want to tell you..."
                className={cn(
                  "border-2 border-charcoal font-serif text-base leading-relaxed transition-all",
                  isFocused ? "min-h-[500px]" : "min-h-[300px]"
                )}
              />
            </div>

            {/* Emotion Palette */}
            <AnimatePresence>
              {showEmotionPalette && !isFocused && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-3 overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <label className="font-mono text-xs uppercase text-charcoal">
                      How does this feel?
                    </label>
                    <Badge variant="outline" className="font-mono text-xs">
                      ✨ Unlocked
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {emotions.map((emo) => (
                      <Button
                        key={emo.type}
                        variant={emotion === emo.type ? "default" : "outline"}
                        size="sm"
                        onClick={() => setEmotion(emotion === emo.type ? undefined : emo.type)}
                        className={cn(
                          "border-2 border-charcoal font-mono text-xs",
                          emotion === emo.type && emo.color
                        )}
                      >
                        <span className="mr-1">{emo.emoji}</span>
                        {emo.label}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Time Capsule Preview Placeholder */}
            <AnimatePresence>
              {showTimeCapsule && !isFocused && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  <Card className="border-2 border-dashed border-charcoal bg-bg-blue-light/30">
                    <CardContent className="p-4 text-center">
                      <Clock className="mx-auto mb-2 h-8 w-8 text-charcoal" />
                      <p className="font-mono text-sm text-charcoal">
                        🚀 Time Capsule Preview Unlocked!
                      </p>
                      <p className="mt-1 font-mono text-xs text-gray-secondary">
                        Schedule your delivery to see the time distance
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <motion.div
              animate={{ opacity: isFocused ? 0 : 1 }}
              className="flex gap-3"
            >
              {onSchedule && (
                <Button
                  size="lg"
                  onClick={() => onSchedule({
                    title,
                    body,
                    emotion,
                    deliveryDate,
                    metadata: {
                      wordCount,
                      characterCount: charCount,
                      writingDuration: Math.round((Date.now() - sessionStartTime) / 1000),
                      momentum,
                      achievedMilestones,
                    },
                  })}
                  disabled={wordCount < 10}
                  className="flex-1 border-2 border-charcoal font-mono uppercase"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Delivery
                </Button>
              )}
              {enableFocusMode && !isFocused && wordCount >= 25 && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={enterFocusMode}
                  className="border-2 border-charcoal font-mono uppercase"
                >
                  <Maximize2 className="mr-2 h-4 w-4" />
                  Focus
                </Button>
              )}
            </motion.div>
          </CardContent>
        </Card>

        {/* Contextual Prompts */}
        <AnimatePresence>
          {showPrompt && !isFocused && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="fixed bottom-24 left-1/2 z-40 w-full max-w-md -translate-x-1/2"
            >
              <Card className="border-2 border-dashed border-purple-600 bg-white shadow-lg">
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      <span className="font-mono text-xs uppercase text-purple-600">
                        Need inspiration?
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPrompt(false)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="font-serif text-sm italic text-charcoal">
                    "{currentPrompt.text}"
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleInsertPrompt}
                      className="flex-1 border-2 border-charcoal font-mono text-xs uppercase"
                    >
                      Use this prompt
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const randomPrompt = contextualPrompts[Math.floor(Math.random() * contextualPrompts.length)]
                        setCurrentPrompt(randomPrompt)
                      }}
                      className="border-2 border-charcoal font-mono text-xs uppercase"
                    >
                      Another
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Milestone Toast */}
        <AnimatePresence>
          {showMilestoneToast && latestMilestone && (
            <motion.div
              initial={{ y: -50, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -50, opacity: 0, scale: 0.9 }}
              className="fixed top-24 left-1/2 z-50 -translate-x-1/2"
            >
              <Card className="border-2 border-purple-600 bg-white shadow-2xl">
                <CardContent className="flex items-center gap-3 p-4">
                  <span className="text-2xl">{latestMilestone.icon}</span>
                  <div>
                    <p className="font-mono text-sm font-bold uppercase text-purple-600">
                      Milestone Reached!
                    </p>
                    <p className="font-mono text-xs text-charcoal">
                      {latestMilestone.message}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Action Button */}
        <AnimatePresence>
          {showFAB && !isFocused && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="fixed bottom-8 right-8 z-40"
            >
              <div className="relative">
                {/* FAB Menu */}
                <AnimatePresence>
                  {fabMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="absolute bottom-16 right-0 space-y-2"
                    >
                      {wordCount >= 25 && enableFocusMode && (
                        <Button
                          onClick={enterFocusMode}
                          className="border-2 border-charcoal bg-white font-mono text-xs uppercase text-charcoal shadow-lg hover:bg-charcoal hover:text-white"
                        >
                          <Maximize2 className="mr-2 h-3 w-3" />
                          Focus Mode
                        </Button>
                      )}
                      {onSave && (
                        <Button
                          onClick={() => onSave({
                            title,
                            body,
                            emotion,
                            deliveryDate,
                            metadata: {
                              wordCount,
                              characterCount: charCount,
                              writingDuration: Math.round((Date.now() - sessionStartTime) / 1000),
                              momentum,
                              achievedMilestones,
                            },
                          })}
                          className="border-2 border-charcoal bg-white font-mono text-xs uppercase text-charcoal shadow-lg hover:bg-charcoal hover:text-white"
                        >
                          <Save className="mr-2 h-3 w-3" />
                          Quick Save
                        </Button>
                      )}
                      <Button
                        onClick={() => setShowPrompt(true)}
                        className="border-2 border-charcoal bg-white font-mono text-xs uppercase text-charcoal shadow-lg hover:bg-charcoal hover:text-white"
                      >
                        <BookOpen className="mr-2 h-3 w-3" />
                        Get Prompt
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Main FAB Button */}
                <Button
                  onClick={() => setFabMenuOpen(!fabMenuOpen)}
                  className={cn(
                    "h-14 w-14 rounded-full border-2 border-charcoal bg-charcoal p-0 shadow-lg transition-transform hover:scale-110",
                    fabMenuOpen && "rotate-45"
                  )}
                >
                  <Sparkles className="h-6 w-6 text-white" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Focus Mode Overlay Hint */}
        <AnimatePresence>
          {isFocused && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2"
            >
              <Badge className="border-2 border-purple-600 bg-purple-600 font-mono text-xs text-white">
                Press ESC to exit focus mode
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
