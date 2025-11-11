"use client"

import Link from "next/link"
import {
  ArrowRight,
  Clock,
  Mail,
  ShieldCheck,
  Sparkles,
  CalendarDays,
  PenSquare,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { LetterEditorForm, type LetterFormData } from "@/components/letter-editor-form"
import { Navbar } from "@/components/navbar"
import { CinematicHero } from "@/components/sandbox/cinematic-hero"
import { HowItWorks } from "@/components/marketing/how-it-works"
import { MiniDemoLoop } from "@/components/sandbox/mini-demo-loop"

const proofHighlights = [
  {
    value: "27k+",
    label: "Letters scheduled",
    description: "Written from 74 countries and counting.",
  },
  {
    value: "99.97%",
    label: "On-time deliveries",
    description: "Automated checks keep every promise on track.",
  },
  {
    value: "2 formats",
    label: "Email + premium mail",
    description: "Choose an instant inbox drop or a sealed envelope.",
  },
]

const featureList = [
  {
    title: "Guided writing rituals",
    description: "Gentle prompts, templates, and tone suggestions keep you inspired and honest.",
    icon: PenSquare,
  },
  {
    title: "Time-aware delivery",
    description: "Schedule down to the minute with automatic timezone detection and reminders.",
    icon: Clock,
  },
  {
    title: "Private by default",
    description: "Letters stay encrypted at rest with zero employees able to peek inside.",
    icon: ShieldCheck,
  },
  {
    title: "Mailroom concierge",
    description: "We print, stamp, and ship on your behalf when you crave something tangible.",
    icon: Mail,
  },
  {
    title: "Moments that matter",
    description: "Recurring schedules for anniversaries, graduations, or annual self check-ins.",
    icon: CalendarDays,
  },
  {
    title: "Delivery visibility",
    description: "Track status, edit, or pause anything before it leaves the vault.",
    icon: Sparkles,
  },
]

export default function HomePage() {
  const handleLetterSubmit = (data: LetterFormData) => {
    // For non-logged-in users, show what they created and prompt to sign up
    console.log("Letter preview:", data)
    alert(
      `✅ Your letter "${data.title}" is ready!\n\n` +
      `📬 Scheduled for: ${new Date(data.deliveryDate).toLocaleDateString()}\n` +
      `📧 Recipient: ${data.recipientEmail}\n\n` +
      `Sign up to schedule your delivery and keep your letters safe in our encrypted vault.`
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section - Cinematic */}
        <section className="container px-4 pb-12 pt-16 sm:px-6 sm:pb-16 sm:pt-20 md:pt-32">
          <CinematicHero />
        </section>

        {/* Mini Demo Loop Section */}
        <section className="container px-4 py-12 sm:px-6 sm:py-16 md:py-20">
          <div className="space-y-8">
            <div className="text-center">
              <Badge variant="outline" className="text-xs uppercase tracking-wide">
                See it in action
              </Badge>
              <h2 className="mt-4 font-mono text-3xl uppercase tracking-tight text-charcoal">How it works</h2>
            </div>
            <MiniDemoLoop />
          </div>
        </section>

        {/* Letter Editor Section */}
        <section id="hero-editor" className="container px-4 py-12 sm:px-6 sm:py-16 md:py-20">
          <div className="mx-auto max-w-4xl space-y-8 sm:space-y-12">
            {/* Section Header */}
            <div className="text-center space-y-3 sm:space-y-4">
              <Badge variant="outline" className="text-xs uppercase tracking-wide">
                Try it now
              </Badge>
              <h2 className="font-mono text-2xl font-normal uppercase tracking-wide text-charcoal sm:text-3xl md:text-4xl lg:text-5xl">
                Write Your First Letter
              </h2>
              <p className="font-mono text-sm leading-relaxed text-gray-secondary sm:text-base md:text-lg">
                Experience the calm ritual of writing to your future self. No account needed to
                explore our brutalist letter editor.
              </p>
            </div>

            {/* Letter Editor */}
            <LetterEditorForm
              accentColor="blue"
              onSubmit={handleLetterSubmit}
              initialData={{
                title: "",
                body: "",
                recipientEmail: "",
                deliveryDate: "",
              }}
            />
          </div>
        </section>

        {/* Features Section */}
        <section className="container px-4 py-12 space-y-8 sm:px-6 sm:py-16 sm:space-y-12 md:py-20 md:space-y-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-mono text-2xl font-normal leading-tight text-charcoal sm:text-3xl md:text-4xl lg:text-5xl">
              Keep promises to future moments with calm, modern tools.
            </h2>
            <p className="mt-4 font-mono text-sm leading-relaxed text-gray-secondary sm:mt-6 sm:text-base md:text-lg">
              Capsule Note wraps thoughtful writing, secure storage, and dependable delivery into one
              experience grounded in brutalist design.
            </p>
          </div>
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featureList.map((feature, index) => {
              const bgColors = [
                "bg-bg-blue-light",
                "bg-bg-peach-light",
                "bg-bg-purple-light",
                "bg-bg-green-light",
                "bg-bg-yellow-pale",
                "bg-bg-pink-light",
              ]
              return (
                <Card
                  key={feature.title}
                  className={`h-full border-2 border-charcoal shadow-sm transition-all duration-fast hover:shadow-md hover:translate-x-0.5 hover:-translate-y-0.5 ${bgColors[index % bgColors.length]}`}
                  style={{ borderRadius: "2px" }}
                >
                  <CardHeader className="space-y-2 p-5 sm:space-y-3 sm:p-6">
                    <feature.icon className="h-6 w-6 text-charcoal sm:h-8 sm:w-8" strokeWidth={2} />
                    <CardTitle className="font-mono text-base font-normal uppercase tracking-wide sm:text-lg md:text-xl">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="font-mono text-xs leading-relaxed text-charcoal sm:text-sm">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              )
            })}
          </div>

          {/* Sign Up Prompt */}
          <div className="mx-auto max-w-3xl px-4 sm:px-0">
            <div
              className="bg-bg-yellow-pale border-2 border-charcoal p-6 text-center sm:p-8"
              style={{ borderRadius: "2px" }}
            >
              <p className="font-mono text-sm text-charcoal mb-3 sm:text-base sm:mb-4">
                <strong className="uppercase">Ready to schedule your letter?</strong>
              </p>
              <p className="font-mono text-xs text-gray-secondary mb-5 sm:text-sm sm:mb-6">
                Create a free account to securely store your letters in our encrypted vault and
                schedule deliveries to your future self.
              </p>
              <Link href="/sign-up">
                <Button size="lg" className="h-12 w-full text-base uppercase sm:h-auto sm:w-auto">
                  Create Free Account
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <HowItWorks />

        {/* Testimonial Section */}
        <section className="container px-4 py-12 sm:px-6 sm:py-16 md:py-20">
          <Card className="mx-auto max-w-4xl border-2 border-charcoal shadow-lg" style={{ borderRadius: "2px" }}>
            <CardHeader className="text-center p-5 sm:p-6">
              <Sparkles className="mx-auto h-10 w-10 text-charcoal sm:h-12 sm:w-12" strokeWidth={2} />
              <CardTitle className="font-mono text-2xl font-normal uppercase tracking-wide sm:text-3xl md:text-4xl">
                Your words age well here
              </CardTitle>
              <CardDescription className="font-mono text-sm leading-relaxed text-charcoal sm:text-base">
                "I scheduled a letter for my sister before she left for med school. It landed on her
                first overnight shift and she called me in tears. Capsule Note kept that moment from
                slipping through the cracks."
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center font-mono text-xs text-gray-secondary p-5 sm:text-sm sm:p-6">
              — Margo L., Capsule Note writer since 2021
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="container px-4 pb-12 pt-8 sm:px-6 sm:pb-16 sm:pt-10 md:pb-20 md:pt-12">
          <Card className="mx-auto max-w-3xl border-2 border-charcoal bg-duck-blue shadow-lg" style={{ borderRadius: "2px" }}>
            <CardHeader className="space-y-4 text-center p-5 sm:space-y-6 sm:p-6">
              <CardTitle className="font-mono text-2xl font-normal uppercase tracking-wide text-charcoal sm:text-3xl md:text-4xl">
                Open a letter in your future inbox
              </CardTitle>
              <CardDescription className="font-mono text-sm text-charcoal sm:text-base">
                Start for free, draft as many letters as you like, and only pay when something gets
                scheduled for delivery.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-stretch gap-3 p-5 sm:flex-row sm:items-center sm:justify-center sm:gap-4 sm:p-6">
              <Link href="/sign-up" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="h-12 w-full text-base uppercase sm:h-auto sm:w-auto">
                  Create your first letter
                </Button>
              </Link>
              <Link href="/sign-in" className="w-full sm:w-auto">
                <Button
                  variant="ghost"
                  size="lg"
                  className="h-12 w-full border-2 border-charcoal bg-transparent text-base uppercase text-charcoal hover:bg-charcoal hover:text-white sm:h-auto sm:w-auto"
                  style={{ borderRadius: "2px" }}
                >
                  I already have an account
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-charcoal bg-off-white py-6 sm:py-8">
        <div className="container px-4 flex flex-col items-center gap-3 text-center font-mono text-xs text-gray-secondary sm:gap-4 sm:text-sm md:flex-row md:justify-between md:text-left">
          <p className="max-w-md sm:max-w-none">
            © {new Date().getFullYear()} Capsule Note™ Time-Capsule Letters. Built with intention and
            privacy in mind.
          </p>
          <div className="flex gap-4 sm:gap-6">
            <Link href="/privacy" className="uppercase tracking-wide hover:opacity-70 transition-opacity">
              Privacy
            </Link>
            <Link href="/terms" className="uppercase tracking-wide hover:opacity-70 transition-opacity">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
