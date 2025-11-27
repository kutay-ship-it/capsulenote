"use client"

import * as React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { format, differenceInDays, addDays } from "date-fns"
import {
  Mail,
  MailOpen,
  Clock,
  FileEdit,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  PenLine,
  Trash2,
  Lock,
  CheckCircle2,
  Stamp,
  Share2,
  Printer,
  MessageSquare,
  Sparkles,
  Heart,
  Quote,
  Eye,
  EyeOff,
  Timer,
  Send,
  Bookmark,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/routing"

// ============================================================================
// MOCK DATA
// ============================================================================

const MOCK_LETTER = {
  id: "mock-123",
  title: "Letter to My Future Self",
  bodyHtml: `
    <p>Dear Future Me,</p>
    <p>I hope this letter finds you well. Today I'm writing to you from a place of hope and uncertainty. The world is changing rapidly, and I want to remember how I felt in this moment.</p>
    <p>Remember that time when everything seemed impossible? You made it through. You always do. Keep believing in yourself, even when it's hard.</p>
    <p><strong>"We grow through what we go through."</strong></p>
    <p>I hope by the time you read this, you've accomplished the goals we set together. But even if you haven't, that's okay. Progress isn't always linear.</p>
    <p>Take care of yourself. You deserve kindness, especially from yourself.</p>
    <p>With love,<br/>Past You</p>
  `,
  bodyPreview: "Dear Future Me, I hope this letter finds you well. Today I'm writing to you from a place of hope and uncertainty...",
  createdAt: new Date("2024-12-25"),
  firstOpenedAt: null as Date | null,
}

const MOCK_DELIVERY = {
  id: "delivery-123",
  deliverAt: addDays(new Date(), 21),
  status: "scheduled" as "scheduled" | "sent" | "failed",
  channel: "email" as "email" | "mail",
  emailDelivery: {
    toEmail: "me@example.com",
  },
}

type LetterStatus = "draft" | "scheduled" | "delivered-unopened" | "delivered-opened"

// ============================================================================
// VARIATION 1: IMMERSIVE READER MODE
// Maximum reading comfort with ambient feel
// ============================================================================

interface ImmersiveReaderProps {
  letter: typeof MOCK_LETTER
  status: LetterStatus
}

function ImmersiveReaderView({ letter, status }: ImmersiveReaderProps) {
  const isDelivered = status === "delivered-unopened" || status === "delivered-opened"
  const isOpened = status === "delivered-opened"
  const formattedWritten = format(letter.createdAt, "MMMM d, yyyy")
  const formattedDelivered = format(MOCK_DELIVERY.deliverAt, "MMMM d, yyyy")

  return (
    <div className="relative min-h-[600px] bg-duck-cream/30">
      {/* Subtle paper texture overlay */}
      <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiMwMDAiLz48L3N2Zz4=')]" />

      {/* Header */}
      <div className="border-b-2 border-charcoal/10 bg-white/50 backdrop-blur-sm">
        <div className="container flex items-center justify-between py-4">
          <button className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-charcoal/60 hover:text-charcoal transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <button className="p-2 text-charcoal/40 hover:text-charcoal transition-colors">
              <Share2 className="h-4 w-4" />
            </button>
            <button className="p-2 text-charcoal/40 hover:text-charcoal transition-colors">
              <Printer className="h-4 w-4" />
            </button>
            <button className="p-2 text-charcoal/40 hover:text-charcoal transition-colors">
              <Bookmark className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-2xl py-12 px-8">
        {/* Status Badge */}
        <div className="flex justify-center mb-8">
          <span
            className={cn(
              "flex items-center gap-2 border-2 border-charcoal px-4 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider",
              isDelivered ? "bg-teal-primary text-white" : "bg-duck-yellow text-charcoal"
            )}
            style={{ borderRadius: "2px" }}
          >
            {isDelivered ? <Mail className="h-3 w-3" /> : <FileEdit className="h-3 w-3" />}
            {isDelivered ? `Delivered ${formattedDelivered}` : "Draft"}
          </span>
        </div>

        {/* Decorative separator */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-0.5 bg-charcoal/20" />
            <Sparkles className="h-4 w-4 text-charcoal/30" />
            <div className="w-16 h-0.5 bg-charcoal/20" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-center font-mono text-2xl md:text-3xl font-bold uppercase tracking-wide text-charcoal mb-4">
          "{letter.title}"
        </h1>

        {/* Written date */}
        <p className="text-center font-mono text-xs text-charcoal/50 uppercase tracking-wider mb-8">
          Written {formattedWritten}
        </p>

        {/* Decorative separator */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-0.5 bg-charcoal/20" />
            <div className="w-2 h-2 bg-charcoal/20" style={{ borderRadius: "50%" }} />
            <div className="w-12 h-0.5 bg-charcoal/20" />
          </div>
        </div>

        {/* Letter Content */}
        <div
          className="prose prose-lg max-w-none prose-p:font-mono prose-p:text-charcoal/80 prose-p:leading-relaxed prose-p:mb-6 prose-strong:text-charcoal prose-strong:font-bold"
          dangerouslySetInnerHTML={{ __html: letter.bodyHtml }}
        />

        {/* Decorative separator */}
        <div className="flex justify-center mt-10 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-0.5 bg-charcoal/20" />
            <Heart className="h-4 w-4 text-coral/50" />
            <div className="w-12 h-0.5 bg-charcoal/20" />
          </div>
        </div>

        {/* Reflection CTA */}
        {isOpened && (
          <div className="flex justify-center">
            <button
              className={cn(
                "flex items-center gap-3 border-2 border-charcoal bg-white px-6 py-3",
                "font-mono text-sm uppercase tracking-wider text-charcoal",
                "transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_theme(colors.charcoal)]",
                "shadow-[2px_2px_0_theme(colors.charcoal)]"
              )}
              style={{ borderRadius: "2px" }}
            >
              <MessageSquare className="h-4 w-4" />
              Reflect on this letter
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// VARIATION 2: JOURNEY TIMELINE VIEW
// Visual storytelling of the letter's journey
// ============================================================================

interface JourneyTimelineProps {
  letter: typeof MOCK_LETTER
  status: LetterStatus
}

function JourneyTimelineView({ letter, status }: JourneyTimelineProps) {
  const [isContentExpanded, setIsContentExpanded] = useState(false)

  const milestones = [
    {
      key: "written",
      label: "Written",
      date: format(letter.createdAt, "MMM d"),
      icon: PenLine,
      completed: true,
      active: status === "draft",
      color: "bg-duck-yellow",
    },
    {
      key: "sealed",
      label: "Sealed",
      date: status !== "draft" ? format(letter.createdAt, "MMM d") : null,
      icon: Stamp,
      completed: status !== "draft",
      active: status === "scheduled",
      color: "bg-coral",
    },
    {
      key: "delivered",
      label: "Delivered",
      date: status.startsWith("delivered") ? format(MOCK_DELIVERY.deliverAt, "MMM d") : null,
      icon: Mail,
      completed: status.startsWith("delivered"),
      active: status === "delivered-unopened",
      color: "bg-duck-blue",
    },
    {
      key: "opened",
      label: "Opened",
      date: status === "delivered-opened" ? "8:30 AM" : null,
      icon: MailOpen,
      completed: status === "delivered-opened",
      active: status === "delivered-opened",
      color: "bg-teal-primary",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-mono text-xl font-bold uppercase tracking-wide text-charcoal">
          "{letter.title}"
        </h1>
        <span className="font-mono text-xs text-charcoal/50">ID: {letter.id}</span>
      </div>

      {/* Journey Timeline */}
      <div
        className="border-2 border-charcoal bg-white p-6 shadow-[2px_2px_0_theme(colors.charcoal)]"
        style={{ borderRadius: "2px" }}
      >
        <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal/60 mb-6">
          Letter Journey
        </h2>

        {/* Timeline */}
        <div className="relative">
          {/* Progress line */}
          <div className="absolute top-6 left-6 right-6 h-1 bg-charcoal/10">
            <div
              className="h-full bg-teal-primary transition-all duration-500"
              style={{
                width:
                  status === "draft"
                    ? "0%"
                    : status === "scheduled"
                      ? "33%"
                      : status === "delivered-unopened"
                        ? "66%"
                        : "100%",
              }}
            />
          </div>

          {/* Milestones */}
          <div className="relative flex justify-between">
            {milestones.map((milestone, index) => {
              const Icon = milestone.icon
              return (
                <div key={milestone.key} className="flex flex-col items-center">
                  <div
                    className={cn(
                      "relative z-10 flex h-12 w-12 items-center justify-center border-2 transition-all",
                      milestone.completed
                        ? `${milestone.color} border-charcoal text-white`
                        : "bg-white border-charcoal/30 text-charcoal/30",
                      milestone.active && "ring-4 ring-offset-2 ring-teal-primary/30"
                    )}
                    style={{ borderRadius: "2px" }}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <span className="mt-3 font-mono text-xs font-bold uppercase tracking-wider text-charcoal">
                    {milestone.label}
                  </span>
                  <span className="font-mono text-[10px] text-charcoal/50">
                    {milestone.date || "—"}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Transit duration */}
        {status !== "draft" && (
          <div className="mt-6 pt-4 border-t-2 border-dashed border-charcoal/10 flex items-center justify-center gap-2">
            <Timer className="h-4 w-4 text-charcoal/40" />
            <span className="font-mono text-xs text-charcoal/60">
              {differenceInDays(MOCK_DELIVERY.deliverAt, letter.createdAt)} days in transit
            </span>
          </div>
        )}
      </div>

      {/* Letter Content Card */}
      <div
        className="border-2 border-charcoal bg-white shadow-[2px_2px_0_theme(colors.charcoal)]"
        style={{ borderRadius: "2px" }}
      >
        <button
          onClick={() => setIsContentExpanded(!isContentExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-charcoal/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center border-2 border-charcoal bg-duck-cream"
              style={{ borderRadius: "2px" }}
            >
              <FileEdit className="h-4 w-4 text-charcoal" />
            </div>
            <span className="font-mono text-sm font-bold uppercase tracking-wider text-charcoal">
              Letter Content
            </span>
          </div>
          <div className="flex items-center gap-2">
            {isContentExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span className="font-mono text-xs text-charcoal/50 uppercase">
              {isContentExpanded ? "Collapse" : "Expand"}
            </span>
          </div>
        </button>

        <AnimatePresence>
          {isContentExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border-t-2 border-charcoal/10 p-6">
                <div
                  className="prose prose-sm max-w-none prose-p:font-mono prose-p:text-charcoal/80"
                  dangerouslySetInnerHTML={{ __html: letter.bodyHtml }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reflection Card */}
      {status === "delivered-opened" && (
        <div
          className="border-2 border-charcoal bg-duck-cream p-6 shadow-[2px_2px_0_theme(colors.charcoal)]"
          style={{ borderRadius: "2px" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="h-5 w-5 text-charcoal" />
            <span className="font-mono text-sm font-bold uppercase tracking-wider text-charcoal">
              Your Reflection
            </span>
          </div>
          <textarea
            placeholder="How do you feel reading this now? Add your thoughts..."
            className="w-full h-24 p-4 border-2 border-charcoal bg-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-duck-blue/30"
            style={{ borderRadius: "2px" }}
          />
          <div className="flex justify-end mt-3">
            <Button size="sm" className="gap-2">
              <Send className="h-3 w-3" />
              Save Reflection
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// VARIATION 3: SPLIT PANEL EDITORIAL
// Magazine-style layout with content/metadata separation
// ============================================================================

interface SplitPanelProps {
  letter: typeof MOCK_LETTER
  status: LetterStatus
}

function SplitPanelView({ letter, status }: SplitPanelProps) {
  const isDelivered = status.startsWith("delivered")
  const isOpened = status === "delivered-opened"

  return (
    <div className="flex flex-col lg:flex-row gap-0 min-h-[600px]">
      {/* Left: Content Panel */}
      <div className="flex-1 lg:flex-[3] border-2 lg:border-r-0 border-charcoal bg-white" style={{ borderRadius: "2px 0 0 2px" }}>
        {/* Status Badge */}
        <div className="p-6 border-b-2 border-charcoal/10">
          <span
            className={cn(
              "inline-flex items-center gap-2 border-2 border-charcoal px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider",
              isDelivered ? "bg-teal-primary text-white" : "bg-duck-yellow text-charcoal"
            )}
            style={{ borderRadius: "2px" }}
          >
            {isDelivered ? <CheckCircle2 className="h-3 w-3" /> : <FileEdit className="h-3 w-3" />}
            {isDelivered ? "Delivered" : "Draft"}
          </span>
        </div>

        {/* Title */}
        <div className="p-6 pb-0">
          <h1 className="font-mono text-2xl font-bold uppercase tracking-wide text-charcoal mb-2">
            "{letter.title}"
          </h1>
          <div className="w-20 h-1 bg-duck-blue" />
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Pull Quote */}
          <div className="mb-6 pl-4 border-l-4 border-duck-yellow">
            <Quote className="h-6 w-6 text-duck-yellow mb-2" />
            <p className="font-mono text-lg italic text-charcoal/80">
              "We grow through what we go through."
            </p>
          </div>

          <div
            className="prose max-w-none prose-p:font-mono prose-p:text-charcoal/80 prose-p:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: letter.bodyHtml }}
          />
        </div>
      </div>

      {/* Right: Metadata Panel */}
      <div className="lg:flex-[1.2] border-2 border-charcoal bg-off-white" style={{ borderRadius: "0 2px 2px 0" }}>
        <div className="sticky top-0 p-6 space-y-6">
          {/* Letter Details */}
          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal/60 mb-4">
              Letter Details
            </h3>
            <dl className="space-y-3">
              <div className="flex items-center justify-between">
                <dt className="font-mono text-xs text-charcoal/50">Status</dt>
                <dd className="flex items-center gap-1.5">
                  <span className={cn(
                    "w-2 h-2",
                    isOpened ? "bg-teal-primary" : isDelivered ? "bg-duck-blue" : "bg-duck-yellow"
                  )} style={{ borderRadius: "50%" }} />
                  <span className="font-mono text-xs font-bold text-charcoal">
                    {isOpened ? "Opened" : isDelivered ? "Delivered" : status === "scheduled" ? "Scheduled" : "Draft"}
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="font-mono text-xs text-charcoal/50">Written</dt>
                <dd className="font-mono text-xs font-bold text-charcoal">
                  {format(letter.createdAt, "MMM d, yyyy")}
                </dd>
              </div>
              {isDelivered && (
                <div className="flex items-center justify-between">
                  <dt className="font-mono text-xs text-charcoal/50">Delivered</dt>
                  <dd className="font-mono text-xs font-bold text-charcoal">
                    {format(MOCK_DELIVERY.deliverAt, "MMM d, yyyy")}
                  </dd>
                </div>
              )}
              {isOpened && (
                <div className="flex items-center justify-between">
                  <dt className="font-mono text-xs text-charcoal/50">Opened</dt>
                  <dd className="font-mono text-xs font-bold text-charcoal">Jan 15, 8:30 AM</dd>
                </div>
              )}
              {status !== "draft" && (
                <div className="flex items-center justify-between">
                  <dt className="font-mono text-xs text-charcoal/50">Transit</dt>
                  <dd className="font-mono text-xs font-bold text-charcoal">21 days</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Divider */}
          <div className="border-t-2 border-dashed border-charcoal/10" />

          {/* Delivery Info */}
          {status !== "draft" && (
            <div>
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal/60 mb-4">
                Delivery
              </h3>
              <dl className="space-y-3">
                <div className="flex items-center justify-between">
                  <dt className="font-mono text-xs text-charcoal/50">Channel</dt>
                  <dd className="flex items-center gap-1.5">
                    <Mail className="h-3 w-3 text-charcoal/50" />
                    <span className="font-mono text-xs font-bold text-charcoal">Email</span>
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="font-mono text-xs text-charcoal/50">To</dt>
                  <dd className="font-mono text-[10px] font-bold text-charcoal truncate max-w-[120px]">
                    me@example.com
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {/* Divider */}
          <div className="border-t-2 border-dashed border-charcoal/10" />

          {/* Actions */}
          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal/60 mb-4">
              Actions
            </h3>
            <div className="space-y-2">
              {isOpened && (
                <button
                  className="flex w-full items-center gap-3 px-4 py-2.5 border-2 border-charcoal bg-duck-yellow font-mono text-xs font-bold uppercase tracking-wider text-charcoal hover:shadow-[2px_2px_0_theme(colors.charcoal)] transition-all"
                  style={{ borderRadius: "2px" }}
                >
                  <MessageSquare className="h-4 w-4" />
                  Write Reply
                </button>
              )}
              <button
                className="flex w-full items-center gap-3 px-4 py-2.5 border-2 border-charcoal/30 bg-white font-mono text-xs font-bold uppercase tracking-wider text-charcoal/70 hover:border-charcoal hover:text-charcoal transition-all"
                style={{ borderRadius: "2px" }}
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
              <button
                className="flex w-full items-center gap-3 px-4 py-2.5 border-2 border-charcoal/30 bg-white font-mono text-xs font-bold uppercase tracking-wider text-charcoal/70 hover:border-charcoal hover:text-charcoal transition-all"
                style={{ borderRadius: "2px" }}
              >
                <Printer className="h-4 w-4" />
                Print
              </button>
              <button
                className="flex w-full items-center gap-3 px-4 py-2.5 border-2 border-coral/30 bg-white font-mono text-xs font-bold uppercase tracking-wider text-coral/70 hover:border-coral hover:text-coral transition-all"
                style={{ borderRadius: "2px" }}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// VARIATION 4: CARD STACK / PHYSICAL ENVELOPE
// Tactile, physical metaphor with animations
// ============================================================================

interface CardStackProps {
  letter: typeof MOCK_LETTER
  status: LetterStatus
}

function CardStackView({ letter, status }: CardStackProps) {
  const [isOpened, setIsOpened] = useState(status === "delivered-opened")
  const isSealed = status === "scheduled" || status === "delivered-unopened"
  const isDraft = status === "draft"

  const handleBreakSeal = () => {
    setIsOpened(true)
  }

  return (
    <div className="flex flex-col items-center py-8 space-y-8">
      {/* Status Badge */}
      <span
        className={cn(
          "flex items-center gap-2 border-2 border-charcoal px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-wider",
          isOpened ? "bg-teal-primary text-white" : isSealed ? "bg-coral text-white" : "bg-duck-yellow text-charcoal"
        )}
        style={{ borderRadius: "2px" }}
      >
        {isOpened ? <MailOpen className="h-4 w-4" /> : isSealed ? <Lock className="h-4 w-4" /> : <FileEdit className="h-4 w-4" />}
        {isOpened ? "Letter Opened" : isSealed ? "Time Capsule Sealed" : "Draft"}
      </span>

      {/* Envelope / Letter Stack */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {!isOpened && isSealed ? (
            <motion.div
              key="envelope"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className="relative"
            >
              {/* Envelope */}
              <div
                className="relative w-80 h-56 border-4 border-charcoal bg-white shadow-[8px_8px_0_theme(colors.charcoal)] flex flex-col items-center justify-center"
                style={{ borderRadius: "2px" }}
              >
                {/* Inner border decoration */}
                <div
                  className="absolute inset-4 border-2 border-dashed border-charcoal/20"
                  style={{ borderRadius: "2px" }}
                />

                {/* Wax Seal */}
                <motion.div
                  animate={{
                    boxShadow: [
                      "0 0 0 0 rgba(255, 107, 107, 0.4)",
                      "0 0 0 15px rgba(255, 107, 107, 0)",
                    ],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 0.5,
                  }}
                  className="relative w-20 h-20 border-4 border-charcoal bg-coral flex items-center justify-center z-10"
                  style={{ borderRadius: "50%" }}
                >
                  <Stamp className="h-10 w-10 text-white" strokeWidth={1.5} />
                </motion.div>

                {/* Letter peeking out */}
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-60 h-10 border-2 border-charcoal border-b-0 bg-duck-cream"
                  style={{ borderRadius: "2px 2px 0 0" }}
                />
              </div>

              {/* Letter Shadow Stack */}
              <div
                className="absolute -z-10 top-2 left-2 w-80 h-56 border-2 border-charcoal/30 bg-charcoal/5"
                style={{ borderRadius: "2px" }}
              />
              <div
                className="absolute -z-20 top-4 left-4 w-80 h-56 border-2 border-charcoal/20 bg-charcoal/5"
                style={{ borderRadius: "2px" }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="letter"
              initial={{ y: 50, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-80 md:w-[400px]"
            >
              <div
                className="border-4 border-charcoal bg-duck-cream p-6 shadow-[8px_8px_0_theme(colors.charcoal)]"
                style={{ borderRadius: "2px" }}
              >
                {/* Letter Header */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50">
                    {format(letter.createdAt, "MMMM d, yyyy")}
                  </span>
                  <div className="w-8 h-8 border-2 border-charcoal/30 flex items-center justify-center" style={{ borderRadius: "2px" }}>
                    <Stamp className="h-4 w-4 text-coral/50" />
                  </div>
                </div>

                {/* Title */}
                <h2 className="font-mono text-lg font-bold uppercase tracking-wide text-charcoal mb-4">
                  {letter.title}
                </h2>

                {/* Dashed separator */}
                <div className="border-t-2 border-dashed border-charcoal/20 mb-4" />

                {/* Content */}
                <div
                  className="prose prose-sm max-w-none prose-p:font-mono prose-p:text-charcoal/80 prose-p:text-sm prose-p:leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: letter.bodyHtml }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Letter Info */}
      <div className="text-center space-y-2">
        <div
          className="inline-block border-2 border-charcoal bg-duck-yellow px-4 py-2 shadow-[3px_3px_0_theme(colors.charcoal)]"
          style={{ borderRadius: "2px" }}
        >
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/60">
            {isDraft ? "Your Draft" : "Your Letter"}
          </p>
          <p className="font-mono text-sm font-bold text-charcoal truncate max-w-[250px]">
            "{letter.title}"
          </p>
        </div>

        {/* Dates */}
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-charcoal/50" />
            <span className="font-mono text-[10px] text-charcoal/60 uppercase tracking-wider">
              Written {format(letter.createdAt, "MMM d, yyyy")}
            </span>
          </div>
          {!isDraft && (
            <>
              <div className="w-1 h-1 bg-charcoal/30" style={{ borderRadius: "50%" }} />
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-charcoal/50" />
                <span className="font-mono text-[10px] text-charcoal/60 uppercase tracking-wider">
                  {isOpened ? "Opened" : "Arrives"} {format(MOCK_DELIVERY.deliverAt, "MMM d, yyyy")}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* CTA */}
      {isSealed && !isOpened && (
        <Button
          onClick={handleBreakSeal}
          size="lg"
          className="gap-3 h-14 bg-coral hover:bg-coral/90 text-white font-mono text-sm uppercase tracking-wider border-4 border-charcoal shadow-[6px_6px_0_theme(colors.charcoal)] hover:shadow-[8px_8px_0_theme(colors.charcoal)] hover:-translate-y-1 transition-all"
          style={{ borderRadius: "2px" }}
        >
          <Stamp className="h-5 w-5" />
          Break the Seal
        </Button>
      )}

      {isDraft && (
        <Button
          size="lg"
          className="gap-3 h-14 bg-duck-blue hover:bg-duck-blue/90 text-charcoal font-mono text-sm uppercase tracking-wider border-4 border-charcoal shadow-[6px_6px_0_theme(colors.charcoal)] hover:shadow-[8px_8px_0_theme(colors.charcoal)] hover:-translate-y-1 transition-all"
          style={{ borderRadius: "2px" }}
        >
          <Calendar className="h-5 w-5" />
          Schedule Delivery
        </Button>
      )}

      {/* Info Cards */}
      <div className="flex gap-3">
        <div
          className="px-4 py-2 border-2 border-charcoal bg-white"
          style={{ borderRadius: "2px" }}
        >
          <span className="font-mono text-2xl font-bold text-charcoal">{isDraft ? "—" : "21"}</span>
          <span className="block font-mono text-[10px] uppercase tracking-wider text-charcoal/50">Days</span>
        </div>
        <div
          className="px-4 py-2 border-2 border-charcoal bg-white"
          style={{ borderRadius: "2px" }}
        >
          <span className="font-mono text-2xl font-bold text-charcoal flex items-center gap-1">
            <Mail className="h-5 w-5" />
          </span>
          <span className="block font-mono text-[10px] uppercase tracking-wider text-charcoal/50">Email</span>
        </div>
        <div
          className="px-4 py-2 border-2 border-charcoal bg-white"
          style={{ borderRadius: "2px" }}
        >
          <span className="font-mono text-2xl font-bold text-charcoal">#1</span>
          <span className="block font-mono text-[10px] uppercase tracking-wider text-charcoal/50">Letter</span>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// VARIATION 5: FOCUSED STATE VIEWS
// Each state gets dedicated, optimized experience
// ============================================================================

interface FocusedStateProps {
  letter: typeof MOCK_LETTER
  status: LetterStatus
}

function FocusedDraftView({ letter }: { letter: typeof MOCK_LETTER }) {
  const [selectedQuickSchedule, setSelectedQuickSchedule] = useState<string | null>(null)

  const quickScheduleOptions = [
    { key: "1w", label: "1 Week", date: addDays(new Date(), 7) },
    { key: "1m", label: "1 Month", date: addDays(new Date(), 30) },
    { key: "3m", label: "3 Months", date: addDays(new Date(), 90) },
    { key: "1y", label: "1 Year", date: addDays(new Date(), 365) },
  ]

  return (
    <div className="space-y-6">
      {/* Draft Header */}
      <div className="flex items-center justify-between">
        <span
          className="flex items-center gap-2 border-2 border-charcoal bg-duck-yellow px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-charcoal"
          style={{ borderRadius: "2px" }}
        >
          <FileEdit className="h-3.5 w-3.5" />
          Draft
        </span>
        <Button variant="ghost" size="sm" className="gap-2 font-mono text-xs uppercase">
          <PenLine className="h-4 w-4" />
          Edit
        </Button>
      </div>

      {/* Content Preview */}
      <div
        className="border-2 border-charcoal bg-white p-6 shadow-[2px_2px_0_theme(colors.charcoal)] cursor-pointer hover:shadow-[4px_4px_0_theme(colors.charcoal)] hover:-translate-y-0.5 transition-all"
        style={{ borderRadius: "2px" }}
      >
        <h2 className="font-mono text-lg font-bold uppercase tracking-wide text-charcoal mb-2">
          {letter.title}
        </h2>
        <div className="border-t-2 border-dashed border-charcoal/10 my-4" />
        <p className="font-mono text-sm text-charcoal/70 line-clamp-4">
          {letter.bodyPreview}
        </p>
        <div className="mt-4 flex items-center gap-2 text-charcoal/40">
          <PenLine className="h-4 w-4" />
          <span className="font-mono text-xs">Click anywhere to edit</span>
        </div>
      </div>

      {/* Schedule CTA */}
      <div
        className="border-2 border-charcoal bg-duck-cream p-6 shadow-[2px_2px_0_theme(colors.charcoal)]"
        style={{ borderRadius: "2px" }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="flex h-10 w-10 items-center justify-center border-2 border-charcoal bg-duck-blue"
            style={{ borderRadius: "2px" }}
          >
            <Send className="h-5 w-5 text-charcoal" />
          </div>
          <div>
            <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-charcoal">
              Ready to send?
            </h3>
            <p className="font-mono text-xs text-charcoal/60">
              When should future-you receive this?
            </p>
          </div>
        </div>

        {/* Quick Schedule Options */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {quickScheduleOptions.map((option) => (
            <button
              key={option.key}
              onClick={() => setSelectedQuickSchedule(option.key)}
              className={cn(
                "py-3 border-2 font-mono text-xs font-bold uppercase transition-all",
                selectedQuickSchedule === option.key
                  ? "border-charcoal bg-duck-yellow shadow-[2px_2px_0_theme(colors.charcoal)]"
                  : "border-charcoal/30 bg-white text-charcoal/70 hover:border-charcoal hover:text-charcoal"
              )}
              style={{ borderRadius: "2px" }}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Preview Date */}
        {selectedQuickSchedule && (
          <div className="mb-4 p-3 bg-white border-2 border-charcoal/20" style={{ borderRadius: "2px" }}>
            <span className="font-mono text-xs text-charcoal/50">Arrives: </span>
            <span className="font-mono text-sm font-bold text-charcoal">
              {format(quickScheduleOptions.find((o) => o.key === selectedQuickSchedule)!.date, "MMMM d, yyyy")}
            </span>
          </div>
        )}

        {/* Schedule Button */}
        <div className="flex gap-3">
          <Button className="flex-1 gap-2">
            <Calendar className="h-4 w-4" />
            Schedule Delivery
          </Button>
          <Button variant="outline" className="gap-2">
            Custom Date
          </Button>
        </div>
      </div>
    </div>
  )
}

function FocusedScheduledView({ letter }: { letter: typeof MOCK_LETTER }) {
  const daysRemaining = differenceInDays(MOCK_DELIVERY.deliverAt, new Date())

  return (
    <div className="flex flex-col items-center py-8 space-y-8">
      {/* Badge */}
      <span
        className="flex items-center gap-2 border-2 border-charcoal bg-coral px-4 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-white"
        style={{ borderRadius: "2px" }}
      >
        <Lock className="h-4 w-4" />
        Sealed Time Capsule
      </span>

      {/* Countdown */}
      <div
        className="w-full max-w-md border-4 border-charcoal bg-white p-8 shadow-[8px_8px_0_theme(colors.charcoal)]"
        style={{ borderRadius: "2px" }}
      >
        {/* Wax Seal */}
        <div className="flex justify-center mb-6">
          <motion.div
            animate={{
              boxShadow: [
                "0 0 0 0 rgba(255, 107, 107, 0.4)",
                "0 0 0 15px rgba(255, 107, 107, 0)",
              ],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 0.5,
            }}
            className="w-20 h-20 border-4 border-charcoal bg-coral flex items-center justify-center"
            style={{ borderRadius: "50%" }}
          >
            <Stamp className="h-10 w-10 text-white" strokeWidth={1.5} />
          </motion.div>
        </div>

        {/* Countdown Numbers */}
        <div className="flex justify-center gap-4 mb-6">
          {[
            { value: daysRemaining, label: "Days" },
            { value: 14, label: "Hours" },
            { value: 32, label: "Mins" },
            { value: 8, label: "Secs" },
          ].map((unit) => (
            <div key={unit.label} className="text-center">
              <div
                className="w-16 h-16 flex items-center justify-center border-2 border-charcoal bg-duck-cream"
                style={{ borderRadius: "2px" }}
              >
                <span className="font-mono text-2xl font-bold text-charcoal">
                  {unit.value.toString().padStart(2, "0")}
                </span>
              </div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-charcoal/50 mt-2 block">
                {unit.label}
              </span>
            </div>
          ))}
        </div>

        {/* Arrival Date */}
        <div className="text-center">
          <p className="font-mono text-xs text-charcoal/50 uppercase tracking-wider">
            Arriving
          </p>
          <p className="font-mono text-lg font-bold text-charcoal">
            {format(MOCK_DELIVERY.deliverAt, "MMMM d, yyyy")}
          </p>
        </div>
      </div>

      {/* Letter Info */}
      <div
        className="border-2 border-charcoal bg-duck-yellow px-5 py-3 shadow-[3px_3px_0_theme(colors.charcoal)]"
        style={{ borderRadius: "2px" }}
      >
        <p className="font-mono text-sm font-bold text-charcoal">
          "{letter.title}"
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" className="gap-2">
          <Calendar className="h-4 w-4" />
          Reschedule
        </Button>
        <Button variant="ghost" className="gap-2 text-coral/70 hover:text-coral">
          <Trash2 className="h-4 w-4" />
          Cancel
        </Button>
      </div>

      {/* Blurred Preview */}
      <div
        className="w-full max-w-md p-4 border-2 border-dashed border-charcoal/20 bg-duck-cream/50"
        style={{ borderRadius: "2px" }}
      >
        <p className="font-mono text-xs text-charcoal/40 italic blur-sm select-none">
          {letter.bodyPreview}
        </p>
      </div>
    </div>
  )
}

function FocusedStateView({ letter, status }: FocusedStateProps) {
  if (status === "draft") {
    return <FocusedDraftView letter={letter} />
  }

  if (status === "scheduled") {
    return <FocusedScheduledView letter={letter} />
  }

  // For delivered states, use the Card Stack view
  return <CardStackView letter={letter} status={status} />
}

// ============================================================================
// MAIN SANDBOX PAGE
// ============================================================================

export default function LetterViewsSandboxPage() {
  const [currentStatus, setCurrentStatus] = useState<LetterStatus>("delivered-opened")
  const [currentVariation, setCurrentVariation] = useState<number>(1)

  const variations = [
    { id: 1, name: "Immersive Reader", description: "Maximum reading comfort with ambient feel" },
    { id: 2, name: "Journey Timeline", description: "Visual storytelling of the letter journey" },
    { id: 3, name: "Split Editorial", description: "Magazine-style content/metadata separation" },
    { id: 4, name: "Card Stack", description: "Physical envelope metaphor with animations" },
    { id: 5, name: "Focused States", description: "Dedicated experience per letter state" },
  ]

  const statuses: { key: LetterStatus; label: string; color: string }[] = [
    { key: "draft", label: "Draft", color: "bg-duck-yellow" },
    { key: "scheduled", label: "Scheduled", color: "bg-duck-blue" },
    { key: "delivered-unopened", label: "Delivered (Unopened)", color: "bg-coral" },
    { key: "delivered-opened", label: "Delivered (Opened)", color: "bg-teal-primary" },
  ]

  const renderVariation = () => {
    switch (currentVariation) {
      case 1:
        return <ImmersiveReaderView letter={MOCK_LETTER} status={currentStatus} />
      case 2:
        return <JourneyTimelineView letter={MOCK_LETTER} status={currentStatus} />
      case 3:
        return <SplitPanelView letter={MOCK_LETTER} status={currentStatus} />
      case 4:
        return <CardStackView letter={MOCK_LETTER} status={currentStatus} />
      case 5:
        return <FocusedStateView letter={MOCK_LETTER} status={currentStatus} />
      default:
        return null
    }
  }

  return (
    <div className="container py-12 space-y-8">
      {/* Page Header */}
      <header className="space-y-4">
        <a href="/en/credits-sandbox" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-charcoal/60 hover:text-charcoal">
          <ArrowLeft className="h-4 w-4" />
          Back to Sandbox
        </a>
        <h1 className="font-mono text-3xl font-bold uppercase tracking-wide text-charcoal">
          Letter Detail Views
        </h1>
        <p className="font-mono text-sm text-charcoal/70 max-w-2xl">
          Design explorations for the letter detail page. Each variation offers a different experience
          optimized for specific use cases and emotional moments.
        </p>
      </header>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Variation Selector */}
        <div className="flex-1 space-y-3">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal/60">
            Select Variation
          </h2>
          <div className="flex flex-wrap gap-2">
            {variations.map((v) => (
              <button
                key={v.id}
                onClick={() => setCurrentVariation(v.id)}
                className={cn(
                  "px-4 py-2 border-2 font-mono text-xs font-bold uppercase transition-all",
                  currentVariation === v.id
                    ? "border-charcoal bg-duck-yellow shadow-[2px_2px_0_theme(colors.charcoal)]"
                    : "border-charcoal/30 text-charcoal/60 hover:border-charcoal hover:text-charcoal"
                )}
                style={{ borderRadius: "2px" }}
              >
                {v.id}. {v.name}
              </button>
            ))}
          </div>
          <p className="font-mono text-xs text-charcoal/50">
            {variations.find((v) => v.id === currentVariation)?.description}
          </p>
        </div>

        {/* Status Selector */}
        <div className="space-y-3">
          <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-charcoal/60">
            Letter Status
          </h2>
          <div className="flex flex-wrap gap-2">
            {statuses.map((s) => (
              <button
                key={s.key}
                onClick={() => setCurrentStatus(s.key)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 border-2 font-mono text-[10px] font-bold uppercase transition-all",
                  currentStatus === s.key
                    ? "border-charcoal bg-charcoal text-white"
                    : "border-charcoal/30 text-charcoal/60 hover:border-charcoal hover:text-charcoal"
                )}
                style={{ borderRadius: "2px" }}
              >
                <span className={cn("w-2 h-2", s.color)} style={{ borderRadius: "50%" }} />
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Container */}
      <div
        className="border-2 border-charcoal bg-off-white min-h-[600px]"
        style={{ borderRadius: "2px" }}
      >
        <div className="border-b-2 border-charcoal/20 px-4 py-2 bg-charcoal/5">
          <span className="font-mono text-[10px] text-charcoal/50 uppercase tracking-wider">
            Preview: Variation {currentVariation} - {statuses.find((s) => s.key === currentStatus)?.label}
          </span>
        </div>
        <div className="p-6">
          {renderVariation()}
        </div>
      </div>

      {/* Best Practice Recommendation */}
      <div className="border-2 border-teal-primary bg-teal-primary/5 p-6 space-y-4" style={{ borderRadius: "2px" }}>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-teal-primary" strokeWidth={2} />
          <h2 className="font-mono text-lg font-bold uppercase tracking-wide text-teal-primary">
            Best Practice Recommendation
          </h2>
        </div>
        <div className="font-mono text-sm text-charcoal/80 space-y-3">
          <p>
            <strong>Draft State:</strong> Use <strong>Variation 5 (Focused States)</strong> - emphasizes
            completion with inline quick-schedule options. Clear path to action.
          </p>
          <p>
            <strong>Scheduled State:</strong> Use <strong>Variation 4 (Card Stack)</strong> or
            <strong> Variation 5</strong> - full countdown as hero, builds anticipation.
          </p>
          <p>
            <strong>Delivered (Unopened):</strong> Use <strong>Variation 4 (Card Stack)</strong> -
            wax seal ceremony creates emotional moment for the "opening" experience.
          </p>
          <p>
            <strong>Delivered (Opened):</strong> Use <strong>Variation 1 (Immersive Reader)</strong> or
            <strong> Variation 3 (Split Panel)</strong> - maximum reading comfort with reflection prompts.
          </p>
        </div>
      </div>
    </div>
  )
}
