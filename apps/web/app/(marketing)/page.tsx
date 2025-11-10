"use client"

import Link from "next/link"
import {
  ArrowRight,
  CalendarDays,
  Clock,
  HeartHandshake,
  Mail,
  PenSquare,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { LetterEditorForm, type LetterFormData } from "@/components/letter-editor-form"
import { Navbar } from "@/components/navbar"

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

const journey = [
  {
    title: "Set the moment",
    description: "Pick a milestone or create your own ritual.",
    detail: "Timezone awareness makes global deliveries effortless.",
    icon: CalendarDays,
  },
  {
    title: "Pour your heart out",
    description: "Write once inside a calm, distraction-free editor.",
    detail: "Prompts nudge you past writer's block without stealing your voice.",
    icon: PenSquare,
  },
  {
    title: "Let us deliver",
    description: "Email, premium paper mail, or both.",
    detail: "We notify you when it's sent and when it's opened.",
    icon: Send,
  },
]

const scenarios = [
  {
    title: "Personal rituals",
    points: [
      "Future-self check-ins to keep promises visible.",
      "Birthday time capsules for kids, partners, or friends.",
      "Milestone reflections to anchor career or health goals.",
    ],
  },
  {
    title: "Team moments",
    points: [
      "Welcome letters scheduled for a new teammate's Day 1.",
      "Leadership notes that unlock during launches or raises.",
      "Culture touchpoints after retreats, offsites, or reviews.",
    ],
  },
  {
    title: "Legacy drops",
    points: [
      "Share stories with loved ones after big life events.",
      "Send reminders to your future self to celebrate progress.",
      "Deliver gratitude letters long after the moment passes.",
    ],
  },
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container flex flex-col gap-8 px-4 pb-12 pt-16 text-center sm:gap-10 sm:px-6 sm:pb-16 sm:pt-20 md:pt-32">
          <div className="flex flex-col items-center gap-4 sm:gap-6">
            <Badge variant="outline" className="text-xs uppercase tracking-wide">
              Capsule Note™ Time-Capsule Letters
            </Badge>
            <div className="space-y-4 sm:space-y-6">
              <h1 className="font-mono text-3xl font-normal uppercase leading-tight tracking-wide text-charcoal sm:text-4xl md:text-5xl lg:text-6xl">
                Write it today.
              </h1>
              <h2 className="font-mono text-3xl font-normal uppercase leading-tight tracking-wide text-charcoal sm:text-4xl md:text-5xl lg:text-6xl">
                Deliver it when it matters.
              </h2>
              <p className="mx-auto max-w-3xl font-mono text-base leading-relaxed text-charcoal sm:text-lg md:text-xl">
                Capture the version of you that exists today and schedule it for the exact moment a
                future you—or someone you love—needs to hear it. Capsule Note keeps your words protected,
                patient, and perfectly timed.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-stretch gap-3 px-4 sm:flex-row sm:items-center sm:justify-center sm:gap-4 sm:px-0">
            <Link href="#write-letter" className="w-full sm:w-auto">
              <Button size="lg" className="h-12 w-full text-base uppercase sm:h-auto sm:w-auto">
                Start a Letter
              </Button>
            </Link>
            <Link href="#how-it-works" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="h-12 w-full text-base uppercase sm:h-auto sm:w-auto">
                See how it works
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          {/* Hidden for now - may use later */}
          {/* <div className="flex flex-col items-center gap-3 font-mono text-sm text-gray-secondary md:flex-row md:justify-center">
            <p>Encrypted vault • Scheduled deliveries with live status</p>
            <Separator orientation="vertical" className="hidden h-4 md:block" />
            <p>Physical letters printed, sealed, and mailed for you</p>
          </div> */}

          {/* Proof Points - Hidden for now - may use later */}
          {/* <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {proofHighlights.map((item) => (
              <Card
                key={item.label}
                className="border-charcoal shadow-md transition-all duration-fast hover:shadow-lg hover:translate-x-0.5 hover:-translate-y-0.5"
              >
                <CardHeader className="space-y-2">
                  <CardTitle className="font-mono text-4xl font-normal text-charcoal">
                    {item.value}
                  </CardTitle>
                  <CardDescription className="font-mono text-base font-normal uppercase tracking-wide text-charcoal">
                    {item.label}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-mono text-sm text-gray-secondary">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div> */}
        </section>

        {/* Try Letter Writing Section */}
        <section id="write-letter" className="container px-4 py-12 sm:px-6 sm:py-16 md:py-20">
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
        <section id="how-it-works" className="container px-4 py-12 sm:px-6 sm:py-16 md:py-20">
          <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
            <Card className="h-full border-2 border-charcoal bg-duck-blue shadow-lg" style={{ borderRadius: "2px" }}>
              <CardHeader className="p-5 sm:p-6">
                <Badge variant="secondary" className="w-fit uppercase tracking-wide text-xs">
                  How it works
                </Badge>
                <CardTitle className="font-mono text-2xl font-normal uppercase tracking-wide sm:text-3xl md:text-4xl">
                  A calm ritual in three beats
                </CardTitle>
                <CardDescription className="font-mono text-sm leading-relaxed text-charcoal sm:text-base">
                  Every Capsule Note letter follows the same dependable cadence so you can focus on the
                  message, not the logistics.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-5 sm:space-y-6 sm:p-6">
                {journey.map((step, index) => (
                  <div
                    key={step.title}
                    className="flex gap-3 border-2 border-charcoal bg-white p-4 sm:gap-4 sm:p-6"
                    style={{ borderRadius: "2px" }}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-charcoal bg-duck-yellow font-mono text-xl font-normal text-charcoal sm:h-14 sm:w-14 sm:text-2xl">
                      {index + 1}
                    </div>
                    <div className="space-y-1 text-left sm:space-y-2">
                      <div className="flex items-center gap-2">
                        <step.icon className="h-5 w-5 text-charcoal sm:h-6 sm:w-6" strokeWidth={2} />
                        <p className="font-mono text-xs font-normal uppercase tracking-wide text-charcoal sm:text-sm">
                          {step.title}
                        </p>
                      </div>
                      <p className="font-mono text-xs text-gray-secondary sm:text-sm">{step.description}</p>
                      <p className="font-mono text-xs text-gray-secondary sm:text-sm">{step.detail}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="h-full border-2 border-charcoal shadow-md" style={{ borderRadius: "2px" }}>
              <CardHeader className="p-5 sm:p-6">
                <CardTitle className="font-mono text-xl font-normal uppercase tracking-wide sm:text-2xl md:text-3xl">
                  Moments our writers plan ahead
                </CardTitle>
                <CardDescription className="font-mono text-xs leading-relaxed text-gray-secondary sm:text-sm">
                  Capsule Note letters show up exactly when emotions are highest and attention is lowest.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-5 sm:space-y-6 sm:p-6">
                {scenarios.map((scenario) => (
                  <div
                    key={scenario.title}
                    className="space-y-2 border-2 border-charcoal bg-off-white p-4 sm:space-y-3 sm:p-6"
                    style={{ borderRadius: "2px" }}
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <HeartHandshake className="h-5 w-5 text-charcoal sm:h-6 sm:w-6" strokeWidth={2} />
                      <p className="font-mono text-xs font-normal uppercase tracking-wide text-charcoal sm:text-sm">
                        {scenario.title}
                      </p>
                    </div>
                    <ul className="space-y-1.5 font-mono text-xs text-gray-secondary sm:space-y-2 sm:text-sm">
                      {scenario.points.map((point) => (
                        <li key={point} className="flex items-start gap-2">
                          <span className="mt-1.5 h-2 w-2 shrink-0 border-2 border-charcoal bg-charcoal sm:mt-2" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

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
