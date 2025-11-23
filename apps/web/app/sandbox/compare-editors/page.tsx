"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { TemporalCanvasEditor } from "@/components/sandbox/temporal-canvas-editor"
import { FlowLetterEditor } from "@/components/sandbox/flow-letter-editor"
import { SanctuaryEditor } from "@/components/sandbox/sanctuary-editor"
import { HeroEditorPrototype } from "@/components/sandbox/hero-editor-prototype"
import { EnhancedEditor } from "@/components/sandbox/enhanced-editor"
import { RichTextEditor } from "@/components/sandbox/rich-text-editor"
import { LetterEditorForm } from "@/components/letter-editor-form"
import { LetterEditor } from "@/components/letter-editor"
import { SimplifiedLetterEditor } from "@/components/sandbox/simplified-letter-editor"
import { ArrowLeft, CheckCircle2, Sparkles, Zap, Palette, Sliders, LayoutPanelLeft, Brain, PenLine } from "lucide-react"
import Link from "next/link"

const editorComparison = [
  {
    id: "temporal",
    name: "Temporal Canvas Editor",
    tagline: "🚀 ULTIMATE - AI-Powered Time Machine",
    icon: <Brain className="h-5 w-5" />,
    highlights: [
      "🧠 Adaptive interface responds to your emotional state",
      "⏰ Time-of-day contextual awareness (morning/evening modes)",
      "🌊 Breathing border syncs with your typing rhythm",
      "💭 Temporal Echoes - see connections to past letters",
      "🎯 6-level progressive unlock system (0→300 words)",
      "🌟 Constellation view visualizes your letter themes",
      "🎨 Adaptive soundscapes respond to writing pace",
      "✨ Future Mirror AI preview (how future you receives this)",
      "📊 Real-time writing analytics & flow tracking",
      "🎭 Auto-enters distraction-free mode when typing",
    ],
    bestFor: "Writers who want a transformative, emotionally intelligent experience that learns and adapts",
    pros: [
      "Revolutionary AI features (all privacy-preserving)",
      "Adapts to your emotional state in real-time",
      "Makes invisible patterns visible (echoes, constellation)",
      "Progressive unlocking creates genuine investment",
      "Time-of-day awareness feels personally tailored",
      "Breathing interface reduces writing anxiety",
      "Future Mirror helps you write better letters",
    ],
    cons: [
      "Feature-rich may be overwhelming initially",
      "Requires 300+ words to unlock all features",
      "AI features need modern browser",
      "More complex than simple editors",
    ],
    techStack: "Next.js 15, Framer Motion, Adaptive AI, Progressive unlocking, Real-time state management",
  },
  {
    id: "sanctuary",
    name: "Sanctuary Editor",
    tagline: "⭐ RECOMMENDED - Split-Panel Balance",
    icon: <LayoutPanelLeft className="h-5 w-5" />,
    highlights: [
      "🎯 Split-panel: Writing (left) + Tools (right)",
      "📝 Rich text with floating toolbar",
      "🔓 Progressive feature unlocking (50/100/300 words)",
      "📅 Beautiful date picker with presets",
      "📮 Email & physical mail support",
      "📚 Template gallery with categories",
      "🎵 Ambient sounds & writing modes",
      "⌨️ Full keyboard shortcuts (Cmd+S, Cmd+Enter)",
      "📱 Mobile drawer with FAB",
      "💾 Auto-save (3s local, 10s server)",
    ],
    bestFor: "Most users - balances emotional focus (left) with intelligent controls (right)",
    pros: [
      "Spatial separation prevents overwhelming UI",
      "Progressive disclosure builds investment",
      "Context-aware suggestions don't interrupt",
      "Professional yet approachable design",
      "Desktop & mobile optimized",
      "Full accessibility support",
    ],
    cons: [
      "Requires wider screen for best experience",
      "More complex than single-panel editors",
      "Learning curve for advanced features",
    ],
    techStack: "TypeScript, Framer Motion, Radix UI, Golden ratio layout (62-38)",
  },
  {
    id: "flow",
    name: "Flow Letter Editor",
    tagline: "NEW - Progressive Writing Companion",
    icon: <Sparkles className="h-5 w-5" />,
    highlights: [
      "✨ Progressive feature unlocking",
      "🎯 Momentum tracking & breathing UI",
      "💫 Contextual prompts when paused",
      "🔥 Auto-detected focus mode",
      "💭 Emotion palette (unlockable)",
      "⏰ Time capsule preview",
      "🚀 Floating action menu",
    ],
    bestFor: "Writers who want an adaptive, playful experience that evolves as they write",
    pros: [
      "Zero friction entry - start writing immediately",
      "Gamified milestones keep motivation high",
      "Smart contextual help that doesn't interrupt",
      "Beautiful animations that enhance focus",
    ],
    cons: [
      "Many features initially hidden (by design)",
      "More complex state management",
      "May be too playful for some users",
    ],
    techStack: "React hooks, Framer Motion, Progressive revelation pattern",
  },
  {
    id: "hero",
    name: "Hero Editor Prototype",
    tagline: "Simple, Prompt-Driven Writing",
    icon: <Zap className="h-5 w-5" />,
    highlights: [
      "📝 Guided writing prompts",
      "⏱️ Time presets (6m, 1y, 3y, 5y)",
      "💾 Local autosave",
      "🔐 Mock authentication flow",
      "📊 Word count & mood tracking",
    ],
    bestFor: "Users who need structure and prompts to get started",
    pros: [
      "Clear prompts guide writing",
      "Fast preset buttons for delivery dates",
      "Clean, minimal interface",
      "Good for landing page demos",
    ],
    cons: [
      "Limited formatting options",
      "Fixed textarea (no rich text)",
      "Prompts are static",
    ],
    techStack: "React, Framer Motion, Context API",
  },
  {
    id: "enhanced",
    name: "Enhanced Editor (Sanctuary)",
    tagline: "Feature-Rich with Templates",
    icon: <Palette className="h-5 w-5" />,
    highlights: [
      "📚 Letter templates by category",
      "🎨 Tone sliders (sentiment & formality)",
      "🎵 Ambient audio tracks",
      "💾 Auto-encryption indicator",
      "🔐 Authentication sidecar",
    ],
    bestFor: "Users who want maximum control and customization options",
    pros: [
      "Template library for inspiration",
      "Tone adjustment for writing style",
      "Ambient audio for atmosphere",
      "Most feature-complete option",
    ],
    cons: [
      "Can feel overwhelming initially",
      "Many controls visible at once",
      "Steeper learning curve",
    ],
    techStack: "React, Framer Motion, Slider components",
  },
  {
    id: "rich",
    name: "Rich Text Editor",
    tagline: "Full Formatting Capabilities",
    icon: <Sliders className="h-5 w-5" />,
    highlights: [
      "✏️ Bold, italic, underline",
      "📋 Bullet & numbered lists",
      "📝 Heading styles (H1, H2)",
      "🔠 Text alignment controls",
      "↩️ Undo/redo support",
      "⌨️ Keyboard shortcuts",
    ],
    bestFor: "Users who need traditional word processor formatting",
    pros: [
      "Familiar formatting toolbar",
      "ContentEditable for rich HTML",
      "Comprehensive formatting options",
      "Keyboard shortcut support",
    ],
    cons: [
      "Toolbar adds visual complexity",
      "More UI chrome",
      "May be overkill for simple letters",
    ],
    techStack: "ContentEditable API, execCommand, Framer Motion",
  },
  {
    id: "form",
    name: "Letter Editor Form",
    tagline: "Marketing Page Style",
    icon: <CheckCircle2 className="h-5 w-5" />,
    highlights: [
      "📄 Paper-style card design",
      "📅 Visual date presets",
      "✉️ Email validation",
      "🎨 Accent color variations",
      "🗑️ Clear form dialog",
    ],
    bestFor: "Landing pages and first-time user experiences",
    pros: [
      "Beautiful paper aesthetic",
      "Clear form validation",
      "Great for non-logged-in users",
      "Preset date buttons are intuitive",
    ],
    cons: [
      "Form-heavy (less writing-focused)",
      "No rich text formatting",
      "More fields to fill out",
    ],
    techStack: "React forms, Date picker, Alert dialogs",
  },
  {
    id: "basic",
    name: "Basic Letter Editor",
    tagline: "Simple Tiptap Integration",
    icon: <CheckCircle2 className="h-5 w-5" />,
    highlights: [
      "✏️ Tiptap rich text",
      "🔤 Basic formatting toolbar",
      "📊 Character count",
      "🔗 Link support",
      "📝 Placeholder text",
    ],
    bestFor: "Simple, straightforward letter writing without frills",
    pros: [
      "Lightweight and fast",
      "Tiptap is well-maintained",
      "Minimal learning curve",
      "Clean implementation",
    ],
    cons: [
      "Very basic feature set",
      "No advanced features",
      "Static experience",
    ],
    techStack: "Tiptap, React, StarterKit extensions",
  },
  {
    id: "simplified",
    name: "Simplified Letter Editor",
    tagline: "✨ NEW - Clean & Focused Writing",
    icon: <PenLine className="h-5 w-5" />,
    highlights: [
      "📝 Clean split-panel design (letter left, controls right)",
      "✍️ Auto-expanding paper - no scrolling while writing",
      "🎯 Floating toolbar appears on text selection",
      "📅 Preset date buttons (6m, 1y, 3y, 5y) + custom",
      "📧 Email validation built-in",
      "🎵 Writing ambience selector (Rain, Cafe, Forest, etc.)",
      "📚 Template library with categories",
      "💾 Auto-save to localStorage (2s debounce)",
      "🎨 Minimal UI for distraction-free writing",
      "📱 Responsive design (desktop, tablet, mobile)",
    ],
    bestFor: "Writers who want a clean, distraction-free experience with essential controls",
    pros: [
      "Ultra-clean white background aesthetic",
      "Paper expands naturally like real writing",
      "Toolbar only appears when needed",
      "Quick date selection with presets",
      "Template system for inspiration",
      "Fixed sidebar keeps tools accessible",
      "Simple and intuitive interface",
    ],
    cons: [
      "Fewer advanced features than other editors",
      "No progressive unlocking system",
      "Simpler than Sanctuary or Temporal editors",
    ],
    techStack: "Tiptap, React 19, shadcn/ui, Tailwind CSS, Auto-expanding layout",
  },
]

export default function CompareEditorsPage() {
  const [activeTab, setActiveTab] = useState("temporal")
  const [richTextContent, setRichTextContent] = useState("")

  const handleRichTextChange = (html: string, text: string) => {
    setRichTextContent(html)
  }

  return (
    <div className="container max-w-7xl space-y-8 py-10">
      {/* Header */}
      <div className="space-y-4">
        <Link href="/sandbox">
          <Button variant="ghost" className="font-mono text-sm uppercase">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sandbox
          </Button>
        </Link>

        <div>
          <Badge variant="outline" className="mb-3 font-mono text-xs uppercase">
            Component Comparison
          </Badge>
          <h1 className="font-mono text-4xl uppercase tracking-tight text-charcoal">
            Editor Comparison Lab
          </h1>
          <p className="mt-2 font-mono text-base text-gray-secondary">
            Compare all letter editor implementations side by side. Test each one to find your
            preferred writing experience.
          </p>
        </div>
      </div>

      <Separator className="border-2 border-charcoal" />

      {/* Comparison Table */}
      <Card className="border-2 border-charcoal">
        <CardHeader className="border-b-2 border-charcoal bg-bg-yellow-pale">
          <CardTitle className="font-mono text-xl uppercase tracking-wide">
            Quick Comparison
          </CardTitle>
          <CardDescription className="font-mono text-sm">
            Feature comparison across all editors
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse font-mono text-sm">
              <thead>
                <tr className="border-b-2 border-charcoal">
                  <th className="p-3 text-left text-xs uppercase">Feature</th>
                  <th className="p-3 text-center text-xs uppercase bg-gradient-to-r from-purple-100 to-pink-100">🚀 Temporal</th>
                  <th className="p-3 text-center text-xs uppercase bg-purple-100">⭐ Sanctuary</th>
                  <th className="p-3 text-center text-xs uppercase">Flow</th>
                  <th className="p-3 text-center text-xs uppercase">Hero</th>
                  <th className="p-3 text-center text-xs uppercase">Enhanced</th>
                  <th className="p-3 text-center text-xs uppercase">Rich</th>
                  <th className="p-3 text-center text-xs uppercase">Form</th>
                  <th className="p-3 text-center text-xs uppercase">Basic</th>
                  <th className="p-3 text-center text-xs uppercase bg-blue-100">✨ Simplified</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="p-3">Adaptive Layout</td>
                  <td className="p-3 text-center bg-gradient-to-r from-purple-50 to-pink-50">✅</td>
                  <td className="p-3 text-center bg-purple-50">✅</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center bg-blue-50">✅</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-3">Rich Formatting</td>
                  <td className="p-3 text-center bg-gradient-to-r from-purple-50 to-pink-50">✅</td>
                  <td className="p-3 text-center bg-purple-50">✅</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center">✅</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center">✅</td>
                  <td className="p-3 text-center bg-blue-50">✅</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-3">Progressive Unlock</td>
                  <td className="p-3 text-center bg-gradient-to-r from-purple-50 to-pink-50">✅ (6 levels)</td>
                  <td className="p-3 text-center bg-purple-50">✅</td>
                  <td className="p-3 text-center">✅</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center bg-blue-50">❌</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-3">AI Features</td>
                  <td className="p-3 text-center bg-gradient-to-r from-purple-50 to-pink-50">✅ Echoes</td>
                  <td className="p-3 text-center bg-purple-50">❌</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center bg-blue-50">❌</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-3">Time-of-Day Aware</td>
                  <td className="p-3 text-center bg-gradient-to-r from-purple-50 to-pink-50">✅</td>
                  <td className="p-3 text-center bg-purple-50">❌</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center bg-blue-50">❌</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-3">Breathing Interface</td>
                  <td className="p-3 text-center bg-gradient-to-r from-purple-50 to-pink-50">✅</td>
                  <td className="p-3 text-center bg-purple-50">✅</td>
                  <td className="p-3 text-center">✅</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center bg-blue-50">❌</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-3">Constellation View</td>
                  <td className="p-3 text-center bg-gradient-to-r from-purple-50 to-pink-50">✅</td>
                  <td className="p-3 text-center bg-purple-50">❌</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center bg-blue-50">❌</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-3">Ambient Audio</td>
                  <td className="p-3 text-center bg-gradient-to-r from-purple-50 to-pink-50">✅ Adaptive</td>
                  <td className="p-3 text-center bg-purple-50">✅</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center">✅</td>
                  <td className="p-3 text-center">✅</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center bg-blue-50">✅</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-3">Keyboard Shortcuts</td>
                  <td className="p-3 text-center bg-gradient-to-r from-purple-50 to-pink-50">✅</td>
                  <td className="p-3 text-center bg-purple-50">✅</td>
                  <td className="p-3 text-center">✅</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center">✅</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center bg-blue-50">✅</td>
                </tr>
                <tr className="border-b border-gray-200">
                  <td className="p-3">Auto-save</td>
                  <td className="p-3 text-center bg-gradient-to-r from-purple-50 to-pink-50">✅</td>
                  <td className="p-3 text-center bg-purple-50">✅</td>
                  <td className="p-3 text-center">✅</td>
                  <td className="p-3 text-center">✅</td>
                  <td className="p-3 text-center">✅</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center">❌</td>
                  <td className="p-3 text-center bg-blue-50">✅</td>
                </tr>
                <tr>
                  <td className="p-3">Complexity Level</td>
                  <td className="p-3 text-center bg-gradient-to-r from-purple-50 to-pink-50">🔴 Advanced</td>
                  <td className="p-3 text-center bg-purple-50">🟡 Medium</td>
                  <td className="p-3 text-center">🟡 Medium</td>
                  <td className="p-3 text-center">🟢 Low</td>
                  <td className="p-3 text-center">🔴 High</td>
                  <td className="p-3 text-center">🟡 Medium</td>
                  <td className="p-3 text-center">🟢 Low</td>
                  <td className="p-3 text-center">🟢 Low</td>
                  <td className="p-3 text-center bg-blue-50">🟢 Low</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Demos */}
      <div>
        <h2 className="mb-4 font-mono text-2xl uppercase tracking-tight text-charcoal">
          Try Each Editor
        </h2>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 gap-2 bg-transparent md:grid-cols-9">
            {editorComparison.map((editor) => (
              <TabsTrigger
                key={editor.id}
                value={editor.id}
                className="border-2 border-charcoal font-mono text-xs uppercase data-[state=active]:bg-charcoal data-[state=active]:text-white"
              >
                {editor.icon}
                <span className="ml-2 hidden lg:inline">{editor.name.split(" ")[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Temporal Canvas Editor */}
          <TabsContent value="temporal" className="space-y-6">
            <Card className="border-2 border-purple-600 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="font-mono text-2xl uppercase tracking-wide">
                      {editorComparison[0].name}
                    </CardTitle>
                    <CardDescription className="font-mono text-sm">
                      {editorComparison[0].tagline}
                    </CardDescription>
                  </div>
                  <Badge className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 font-mono text-xs uppercase text-white animate-pulse">
                    🚀 Ultimate
                  </Badge>
                </div>
                <div className="mt-4 space-y-2">
                  <p className="font-mono text-sm text-charcoal">
                    <strong>Best For:</strong> {editorComparison[0].bestFor}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 font-mono text-xs uppercase text-green-700">Pros:</p>
                      <ul className="space-y-1 font-mono text-xs">
                        {editorComparison[0].pros.map((pro, i) => (
                          <li key={i}>✓ {pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-1 font-mono text-xs uppercase text-orange-700">Cons:</p>
                      <ul className="space-y-1 font-mono text-xs">
                        {editorComparison[0].cons.map((con, i) => (
                          <li key={i}>• {con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <TemporalCanvasEditor
                  onChange={(data) => console.log("Temporal Canvas data:", data)}
                  showDebugInfo={false}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sanctuary Editor */}
          <TabsContent value="sanctuary" className="space-y-6">
            <Card className="border-2 border-purple-600 bg-gradient-to-br from-purple-50 to-blue-50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="font-mono text-2xl uppercase tracking-wide">
                      {editorComparison[1].name}
                    </CardTitle>
                    <CardDescription className="font-mono text-sm">
                      {editorComparison[1].tagline}
                    </CardDescription>
                  </div>
                  <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 font-mono text-xs uppercase text-white">
                    ⭐ Recommended
                  </Badge>
                </div>
                <div className="mt-4 space-y-2">
                  <p className="font-mono text-sm text-charcoal">
                    <strong>Best For:</strong> {editorComparison[1].bestFor}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 font-mono text-xs uppercase text-green-700">Pros:</p>
                      <ul className="space-y-1 font-mono text-xs">
                        {editorComparison[1].pros.map((pro, i) => (
                          <li key={i}>✓ {pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-1 font-mono text-xs uppercase text-orange-700">Cons:</p>
                      <ul className="space-y-1 font-mono text-xs">
                        {editorComparison[1].cons.map((con, i) => (
                          <li key={i}>• {con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <SanctuaryEditor
                  onChange={(data) => console.log("Sanctuary editor data:", data)}
                  showDebugInfo={false}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Flow Editor */}
          <TabsContent value="flow" className="space-y-6">
            <Card className="border-2 border-charcoal bg-bg-purple-light/20">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="font-mono text-2xl uppercase tracking-wide">
                      {editorComparison[0].name}
                    </CardTitle>
                    <CardDescription className="font-mono text-sm">
                      {editorComparison[0].tagline}
                    </CardDescription>
                  </div>
                  <Badge className="bg-purple-600 font-mono text-xs uppercase text-white">
                    New
                  </Badge>
                </div>
                <div className="mt-4 space-y-2">
                  <p className="font-mono text-sm text-charcoal">
                    <strong>Best For:</strong> {editorComparison[0].bestFor}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 font-mono text-xs uppercase text-green-700">Pros:</p>
                      <ul className="space-y-1 font-mono text-xs">
                        {editorComparison[0].pros.map((pro, i) => (
                          <li key={i}>✓ {pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-1 font-mono text-xs uppercase text-orange-700">Cons:</p>
                      <ul className="space-y-1 font-mono text-xs">
                        {editorComparison[0].cons.map((con, i) => (
                          <li key={i}>• {con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <FlowLetterEditor
                  enableFocusMode={true}
                  enableEmotionPalette={true}
                  enableTimeCapsule={true}
                  enablePrompts={true}
                  enableMilestones={true}
                  showDebugInfo={false}
                  onChange={(data) => console.log("Flow editor data:", data)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hero Editor */}
          <TabsContent value="hero" className="space-y-6">
            <Card className="border-2 border-charcoal bg-bg-blue-light/20">
              <CardHeader>
                <CardTitle className="font-mono text-2xl uppercase tracking-wide">
                  {editorComparison[1].name}
                </CardTitle>
                <CardDescription className="font-mono text-sm">
                  {editorComparison[1].tagline}
                </CardDescription>
                <div className="mt-4 space-y-2">
                  <p className="font-mono text-sm text-charcoal">
                    <strong>Best For:</strong> {editorComparison[1].bestFor}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 font-mono text-xs uppercase text-green-700">Pros:</p>
                      <ul className="space-y-1 font-mono text-xs">
                        {editorComparison[1].pros.map((pro, i) => (
                          <li key={i}>✓ {pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-1 font-mono text-xs uppercase text-orange-700">Cons:</p>
                      <ul className="space-y-1 font-mono text-xs">
                        {editorComparison[1].cons.map((con, i) => (
                          <li key={i}>• {con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <HeroEditorPrototype />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Editor */}
          <TabsContent value="enhanced" className="space-y-6">
            <Card className="border-2 border-charcoal bg-bg-yellow-pale/20">
              <CardHeader>
                <CardTitle className="font-mono text-2xl uppercase tracking-wide">
                  {editorComparison[2].name}
                </CardTitle>
                <CardDescription className="font-mono text-sm">
                  {editorComparison[2].tagline}
                </CardDescription>
                <div className="mt-4 space-y-2">
                  <p className="font-mono text-sm text-charcoal">
                    <strong>Best For:</strong> {editorComparison[2].bestFor}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 font-mono text-xs uppercase text-green-700">Pros:</p>
                      <ul className="space-y-1 font-mono text-xs">
                        {editorComparison[2].pros.map((pro, i) => (
                          <li key={i}>✓ {pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-1 font-mono text-xs uppercase text-orange-700">Cons:</p>
                      <ul className="space-y-1 font-mono text-xs">
                        {editorComparison[2].cons.map((con, i) => (
                          <li key={i}>• {con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <EnhancedEditor />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rich Text Editor */}
          <TabsContent value="rich" className="space-y-6">
            <Card className="border-2 border-charcoal bg-bg-peach-light/20">
              <CardHeader>
                <CardTitle className="font-mono text-2xl uppercase tracking-wide">
                  {editorComparison[3].name}
                </CardTitle>
                <CardDescription className="font-mono text-sm">
                  {editorComparison[3].tagline}
                </CardDescription>
                <div className="mt-4 space-y-2">
                  <p className="font-mono text-sm text-charcoal">
                    <strong>Best For:</strong> {editorComparison[3].bestFor}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 font-mono text-xs uppercase text-green-700">Pros:</p>
                      <ul className="space-y-1 font-mono text-xs">
                        {editorComparison[3].pros.map((pro, i) => (
                          <li key={i}>✓ {pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-1 font-mono text-xs uppercase text-orange-700">Cons:</p>
                      <ul className="space-y-1 font-mono text-xs">
                        {editorComparison[3].cons.map((con, i) => (
                          <li key={i}>• {con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  value={richTextContent}
                  onChange={handleRichTextChange}
                  placeholder="Try out the rich text formatting..."
                  minHeight={300}
                  maxHeight={600}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Form Editor */}
          <TabsContent value="form" className="space-y-6">
            <Card className="border-2 border-charcoal bg-bg-green-light/20">
              <CardHeader>
                <CardTitle className="font-mono text-2xl uppercase tracking-wide">
                  {editorComparison[4].name}
                </CardTitle>
                <CardDescription className="font-mono text-sm">
                  {editorComparison[4].tagline}
                </CardDescription>
                <div className="mt-4 space-y-2">
                  <p className="font-mono text-sm text-charcoal">
                    <strong>Best For:</strong> {editorComparison[4].bestFor}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 font-mono text-xs uppercase text-green-700">Pros:</p>
                      <ul className="space-y-1 font-mono text-xs">
                        {editorComparison[4].pros.map((pro, i) => (
                          <li key={i}>✓ {pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-1 font-mono text-xs uppercase text-orange-700">Cons:</p>
                      <ul className="space-y-1 font-mono text-xs">
                        {editorComparison[4].cons.map((con, i) => (
                          <li key={i}>• {con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <LetterEditorForm
                  accentColor="teal"
                  onSubmit={(data) => console.log("Form submitted:", data)}
                  initialData={{
                    title: "",
                    body: "",
                    recipientEmail: "",
                    deliveryDate: "",
                    deliveryType: "email",
                    recipientType: "self",
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Basic Editor */}
          <TabsContent value="basic" className="space-y-6">
            <Card className="border-2 border-charcoal bg-bg-pink-light/20">
              <CardHeader>
                <CardTitle className="font-mono text-2xl uppercase tracking-wide">
                  {editorComparison[5].name}
                </CardTitle>
                <CardDescription className="font-mono text-sm">
                  {editorComparison[5].tagline}
                </CardDescription>
                <div className="mt-4 space-y-2">
                  <p className="font-mono text-sm text-charcoal">
                    <strong>Best For:</strong> {editorComparison[5].bestFor}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 font-mono text-xs uppercase text-green-700">Pros:</p>
                      <ul className="space-y-1 font-mono text-xs">
                        {editorComparison[5].pros.map((pro, i) => (
                          <li key={i}>✓ {pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-1 font-mono text-xs uppercase text-orange-700">Cons:</p>
                      <ul className="space-y-1 font-mono text-xs">
                        {editorComparison[5].cons.map((con, i) => (
                          <li key={i}>• {con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <LetterEditor
                  content=""
                  onChange={(json, html) => console.log("Basic editor:", { json, html })}
                  placeholder="Write your letter using Tiptap..."
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Simplified Editor */}
          <TabsContent value="simplified" className="space-y-6">
            <Card className="border-2 border-charcoal bg-bg-blue-light/20">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="font-mono text-2xl uppercase tracking-wide">
                      {editorComparison[8].name}
                    </CardTitle>
                    <CardDescription className="font-mono text-sm">
                      {editorComparison[8].tagline}
                    </CardDescription>
                  </div>
                  <Badge className="bg-blue-600 font-mono text-xs uppercase text-white">
                    ✨ New
                  </Badge>
                </div>
                <div className="mt-4 space-y-2">
                  <p className="font-mono text-sm text-charcoal">
                    <strong>Best For:</strong> {editorComparison[8].bestFor}
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <p className="mb-1 font-mono text-xs uppercase text-green-700">Pros:</p>
                      <ul className="space-y-1 font-mono text-xs">
                        {editorComparison[8].pros.map((pro, i) => (
                          <li key={i}>✓ {pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-1 font-mono text-xs uppercase text-orange-700">Cons:</p>
                      <ul className="space-y-1 font-mono text-xs">
                        {editorComparison[8].cons.map((con, i) => (
                          <li key={i}>• {con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <SimplifiedLetterEditor
                  onSave={async (data) => {
                    console.log("Simplified editor - saving:", data)
                  }}
                  onChange={(data) => console.log("Simplified editor - changed:", data)}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Recommendation Card */}
      <Card className="border-2 border-purple-600 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="font-mono text-xl uppercase tracking-wide text-purple-900">
            🎯 Recommendation Guide
          </CardTitle>
          <CardDescription className="font-mono text-sm text-purple-700">
            Find your perfect writing companion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 font-mono text-sm text-purple-900">
          <div className="space-y-2 rounded-lg border-2 border-purple-600 bg-white p-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">⭐ Recommended</Badge>
              <p className="font-bold uppercase">Sanctuary Editor - Best for Most Users</p>
            </div>
            <ul className="ml-4 space-y-1">
              <li>• Split-panel balances focus (left) with powerful tools (right)</li>
              <li>• Progressive unlocking prevents overwhelm while building investment</li>
              <li>• Rich text formatting + templates + ambient sounds</li>
              <li>• Professional desktop experience + mobile-optimized drawer</li>
              <li>• Golden ratio layout (62-38) for optimal cognitive separation</li>
            </ul>
            <p className="mt-2 text-xs italic text-purple-700">
              💡 Perfect balance: Emotional writing focus + sophisticated controls without clutter
            </p>
          </div>

          <Separator className="border-purple-200" />

          <div className="space-y-2">
            <p className="font-bold uppercase">Choose Flow Editor if you want:</p>
            <ul className="ml-4 space-y-1">
              <li>• A playful, gamified writing experience</li>
              <li>• Motivation through animated milestones</li>
              <li>• Emotion tracking and momentum visualization</li>
              <li>• Single-panel simplicity with progressive features</li>
            </ul>
          </div>

          <Separator className="border-purple-200" />

          <div className="space-y-2">
            <p className="font-bold uppercase">Choose Enhanced Editor if you want:</p>
            <ul className="ml-4 space-y-1">
              <li>• All features visible and accessible upfront</li>
              <li>• Tone sliders for sentiment control</li>
              <li>• Maximum customization options</li>
              <li>• Don't mind initial complexity</li>
            </ul>
          </div>

          <Separator className="border-purple-200" />

          <div className="space-y-2">
            <p className="font-bold uppercase">Choose Rich Text Editor if you want:</p>
            <ul className="ml-4 space-y-1">
              <li>• Traditional word processor experience</li>
              <li>• Full formatting toolbar always visible</li>
              <li>• Bold, italic, lists, headings, alignment</li>
              <li>• Familiar document editing interface</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
