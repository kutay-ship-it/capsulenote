import type { Metadata } from "next"

import {
  Letter,
  LetterHeader,
  LetterTitle,
  LetterDate,
  LetterContent,
  LetterFooter
} from "@/components/ui/letter"

export const metadata: Metadata = {
  title: "Letter Components Demo",
  description: "Internal showcase of Capsule Note letter components and variants.",
  robots: { index: false, follow: false },
}

export default function DemoLetterPage() {
  return (
    <div className="min-h-screen bg-cream py-16 px-4">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Page Header */}
        <div className="text-center space-y-4">
          <h1 className="font-mono text-5xl font-normal text-charcoal uppercase tracking-wide">
            Letter Components
          </h1>
          <p className="font-mono text-lg text-gray-secondary uppercase">
            Physical letter aesthetics with MotherDuck brutalist style 🦆
          </p>
        </div>

        {/* Flat Letter Variant */}
        <section className="space-y-8">
          <h2 className="font-mono text-3xl text-charcoal uppercase border-b-2 border-charcoal pb-4">
            Flat Letter (Default)
          </h2>

          <Letter variant="flat" accentColor="yellow" showStamp>
            <LetterHeader>
              <LetterTitle>Dear Future Me</LetterTitle>
              <LetterDate>Written on November 9, 2025</LetterDate>
            </LetterHeader>

            <LetterContent>
              <p>
                I'm writing this letter to remind you of where you were today. Remember the
                excitement of building something new, the challenges you faced, and the dreams
                you're chasing right now.
              </p>

              <p>
                By the time you read this, I hope you've made progress on your goals. Whether
                you succeeded or learned from setbacks, I hope you're proud of the journey.
              </p>

              <p>
                Keep pushing forward. Keep being kind to yourself. Keep dreaming big.
              </p>
            </LetterContent>

            <LetterFooter>
              <p className="text-gray-secondary">
                With love from the past,<br />
                <span className="text-charcoal font-normal">— You</span>
              </p>
            </LetterFooter>
          </Letter>
        </section>

        {/* Different Accent Colors */}
        <section className="space-y-8">
          <h2 className="font-mono text-3xl text-charcoal uppercase border-b-2 border-charcoal pb-4">
            Accent Color Variants
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Blue Accent */}
            <Letter variant="flat" accentColor="blue" showStamp>
              <LetterHeader>
                <LetterTitle className="text-xl">Blue Accent</LetterTitle>
                <LetterDate>December 2025</LetterDate>
              </LetterHeader>
              <LetterContent>
                <p className="text-sm">
                  This letter uses the duck-blue accent color from the MotherDuck palette.
                  Notice the thin accent bar at the top and the duck stamp.
                </p>
              </LetterContent>
            </Letter>

            {/* Teal Accent */}
            <Letter variant="flat" accentColor="teal" showStamp>
              <LetterHeader>
                <LetterTitle className="text-xl">Teal Accent</LetterTitle>
                <LetterDate>January 2026</LetterDate>
              </LetterHeader>
              <LetterContent>
                <p className="text-sm">
                  The teal accent brings a fresh, vibrant feel to the letter while
                  maintaining the brutalist aesthetic.
                </p>
              </LetterContent>
            </Letter>

            {/* Lavender Accent */}
            <Letter variant="flat" accentColor="lavender" showStamp>
              <LetterHeader>
                <LetterTitle className="text-xl">Lavender Accent</LetterTitle>
                <LetterDate>February 2026</LetterDate>
              </LetterHeader>
              <LetterContent>
                <p className="text-sm">
                  Lavender creates a softer, more contemplative mood perfect for
                  personal reflections.
                </p>
              </LetterContent>
            </Letter>

            {/* Peach Accent */}
            <Letter variant="flat" accentColor="peach" showStamp>
              <LetterHeader>
                <LetterTitle className="text-xl">Peach Accent</LetterTitle>
                <LetterDate>March 2026</LetterDate>
              </LetterHeader>
              <LetterContent>
                <p className="text-sm">
                  The warm peach accent adds a friendly, approachable touch to your
                  future letters.
                </p>
              </LetterContent>
            </Letter>
          </div>
        </section>

        {/* Sealed Envelope */}
        <section className="space-y-8">
          <h2 className="font-mono text-3xl text-charcoal uppercase border-b-2 border-charcoal pb-4">
            Sealed Envelope Variant
          </h2>

          <Letter variant="sealed" accentColor="yellow" showStamp showPostmark />

          <Letter variant="sealed" accentColor="lime" showStamp />
        </section>

        {/* Open Letter (Interactive) */}
        <section className="space-y-8">
          <h2 className="font-mono text-3xl text-charcoal uppercase border-b-2 border-charcoal pb-4">
            Open Letter Variant (Interactive)
          </h2>

          <div className="text-center mb-8">
            <p className="font-mono text-sm text-gray-secondary uppercase">
              Click the envelope to flip between sealed and open states
            </p>
          </div>

          <Letter variant="open" accentColor="blue" showStamp>
            <LetterHeader>
              <LetterTitle>Surprise! ✨</LetterTitle>
              <LetterDate>To be opened on New Year's Day 2026</LetterDate>
            </LetterHeader>

            <LetterContent>
              <p>
                This is a special letter that was sealed and waiting for just the right
                moment. You clicked to open it, and here we are!
              </p>

              <p>
                The interactive envelope creates a delightful experience for letters that
                are scheduled to be opened at specific future dates.
              </p>
            </LetterContent>

            <LetterFooter>
              <p className="text-gray-secondary text-sm">
                Sealed with care on November 9, 2025 🦆
              </p>
            </LetterFooter>
          </Letter>
        </section>

        {/* Without Stamp */}
        <section className="space-y-8">
          <h2 className="font-mono text-3xl text-charcoal uppercase border-b-2 border-charcoal pb-4">
            Minimal Variant (No Stamp)
          </h2>

          <Letter variant="flat" accentColor="teal" showStamp={false}>
            <LetterHeader>
              <LetterTitle>Clean & Minimal</LetterTitle>
              <LetterDate>For a more subtle look</LetterDate>
            </LetterHeader>

            <LetterContent>
              <p>
                Sometimes you want a cleaner look without the decorative stamp. This
                variant maintains all the brutalist charm while keeping things simple.
              </p>

              <p>
                The lined paper effect and hard shadows still give it that physical
                letter feeling.
              </p>
            </LetterContent>
          </Letter>
        </section>

        {/* Features List */}
        <section className="space-y-8">
          <h2 className="font-mono text-3xl text-charcoal uppercase border-b-2 border-charcoal pb-4">
            Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white border-2 border-charcoal p-6" style={{ borderRadius: "2px" }}>
              <h3 className="font-mono text-xl text-charcoal uppercase mb-4">🎨 Three Variants</h3>
              <p className="font-mono text-sm text-gray-secondary">
                Flat, Sealed, and Open (interactive) variants for different use cases
              </p>
            </div>

            <div className="bg-white border-2 border-charcoal p-6" style={{ borderRadius: "2px" }}>
              <h3 className="font-mono text-xl text-charcoal uppercase mb-4">🌈 Six Accent Colors</h3>
              <p className="font-mono text-sm text-gray-secondary">
                Yellow, Blue, Teal, Lavender, Peach, and Lime from MotherDuck palette
              </p>
            </div>

            <div className="bg-white border-2 border-charcoal p-6" style={{ borderRadius: "2px" }}>
              <h3 className="font-mono text-xl text-charcoal uppercase mb-4">📮 Optional Stamp</h3>
              <p className="font-mono text-sm text-gray-secondary">
                Toggle the decorative duck stamp for clean or playful looks
              </p>
            </div>

            <div className="bg-white border-2 border-charcoal p-6" style={{ borderRadius: "2px" }}>
              <h3 className="font-mono text-xl text-charcoal uppercase mb-4">💫 Hover Effects</h3>
              <p className="font-mono text-sm text-gray-secondary">
                Smooth translation effects on hover following brutalist shadow pattern
              </p>
            </div>

            <div className="bg-white border-2 border-charcoal p-6" style={{ borderRadius: "2px" }}>
              <h3 className="font-mono text-xl text-charcoal uppercase mb-4">📝 Lined Paper</h3>
              <p className="font-mono text-sm text-gray-secondary">
                Subtle lined background effect creates authentic letter feeling
              </p>
            </div>

            <div className="bg-white border-2 border-charcoal p-6" style={{ borderRadius: "2px" }}>
              <h3 className="font-mono text-xl text-charcoal uppercase mb-4">🔧 Composable</h3>
              <p className="font-mono text-sm text-gray-secondary">
                Header, Title, Date, Content, and Footer components for flexibility
              </p>
            </div>
          </div>
        </section>

        {/* Code Example */}
        <section className="space-y-8">
          <h2 className="font-mono text-3xl text-charcoal uppercase border-b-2 border-charcoal pb-4">
            Usage Example
          </h2>

          <div className="bg-charcoal text-cream p-8 overflow-x-auto" style={{ borderRadius: "2px" }}>
            <pre className="font-mono text-sm">
              <code>{`import {
  Letter,
  LetterHeader,
  LetterTitle,
  LetterDate,
  LetterContent,
  LetterFooter
} from "@/components/ui/letter"

<Letter variant="flat" accentColor="yellow" showStamp>
  <LetterHeader>
    <LetterTitle>Dear Future Me</LetterTitle>
    <LetterDate>November 9, 2025</LetterDate>
  </LetterHeader>

  <LetterContent>
    <p>Your letter content goes here...</p>
  </LetterContent>

  <LetterFooter>
    <p>— Past You</p>
  </LetterFooter>
</Letter>`}</code>
            </pre>
          </div>
        </section>
      </div>
    </div>
  )
}
