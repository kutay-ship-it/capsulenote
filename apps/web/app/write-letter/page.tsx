"use client"

import { LetterEditorForm, type LetterFormData } from "@/components/letter-editor-form"

export default function WriteLetterPage() {
  const handleSubmit = (data: LetterFormData) => {
    console.log("Letter submitted:", data)
    // In a real app, this would save to the database
    alert(
      `Letter "${data.title}" scheduled for delivery on ${new Date(
        data.deliveryDate
      ).toLocaleDateString()}!`
    )
  }

  return (
    <div className="min-h-screen bg-cream py-16 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Page Header */}
        <div className="text-center space-y-4">
          <h1 className="font-mono text-5xl font-normal text-charcoal uppercase tracking-wide">
            Write Your Letter
          </h1>
          <p className="font-mono text-lg text-gray-secondary uppercase max-w-2xl mx-auto">
            Craft a message to your future self with our brutalist letter editor 🦆
          </p>
        </div>

        {/* Letter Editor */}
        <LetterEditorForm
          accentColor="yellow"
          onSubmit={handleSubmit}
          initialData={{
            title: "",
            body: "",
            recipientEmail: "",
            deliveryDate: "",
          }}
        />

        {/* Features Overview */}
        <section className="mt-16 space-y-8">
          <h2 className="font-mono text-3xl text-charcoal uppercase border-b-2 border-charcoal pb-4 text-center">
            Letter Editor Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div
              className="bg-white border-2 border-charcoal p-6 hover:-translate-x-1 hover:-translate-y-1 transition-all duration-300"
              style={{
                borderRadius: "2px",
                boxShadow: "-4px 4px 0px 0px rgb(56, 56, 56)",
              }}
            >
              <h3 className="font-mono text-xl text-charcoal uppercase mb-4">
                📝 Lined Paper Effect
              </h3>
              <p className="font-mono text-sm text-gray-secondary">
                Write on realistic lined paper with subtle horizontal guides that create
                an authentic letter-writing experience.
              </p>
            </div>

            <div
              className="bg-white border-2 border-charcoal p-6 hover:-translate-x-1 hover:-translate-y-1 transition-all duration-300"
              style={{
                borderRadius: "2px",
                boxShadow: "-4px 4px 0px 0px rgb(56, 56, 56)",
              }}
            >
              <h3 className="font-mono text-xl text-charcoal uppercase mb-4">
                📊 Real-time Stats
              </h3>
              <p className="font-mono text-sm text-gray-secondary">
                Track word count and character count as you write. See your writing
                progress with live feedback.
              </p>
            </div>

            <div
              className="bg-white border-2 border-charcoal p-6 hover:-translate-x-1 hover:-translate-y-1 transition-all duration-300"
              style={{
                borderRadius: "2px",
                boxShadow: "-4px 4px 0px 0px rgb(56, 56, 56)",
              }}
            >
              <h3 className="font-mono text-xl text-charcoal uppercase mb-4">
                🎯 Smart Validation
              </h3>
              <p className="font-mono text-sm text-gray-secondary">
                Comprehensive form validation ensures all fields are filled correctly before
                scheduling your letter.
              </p>
            </div>

            <div
              className="bg-white border-2 border-charcoal p-6 hover:-translate-x-1 hover:-translate-y-1 transition-all duration-300"
              style={{
                borderRadius: "2px",
                boxShadow: "-4px 4px 0px 0px rgb(56, 56, 56)",
              }}
            >
              <h3 className="font-mono text-xl text-charcoal uppercase mb-4">
                📅 Future Delivery
              </h3>
              <p className="font-mono text-sm text-gray-secondary">
                Choose any future date to receive your letter. Date picker prevents past
                dates automatically.
              </p>
            </div>

            <div
              className="bg-white border-2 border-charcoal p-6 hover:-translate-x-1 hover:-translate-y-1 transition-all duration-300"
              style={{
                borderRadius: "2px",
                boxShadow: "-4px 4px 0px 0px rgb(56, 56, 56)",
              }}
            >
              <h3 className="font-mono text-xl text-charcoal uppercase mb-4">
                🎨 Brutalist Design
              </h3>
              <p className="font-mono text-sm text-gray-secondary">
                MotherDuck-inspired design with hard shadows, 2px borders, and monospace
                typography for a unique writing experience.
              </p>
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="mt-16 space-y-8">
          <h2 className="font-mono text-3xl text-charcoal uppercase border-b-2 border-charcoal pb-4 text-center">
            Writing Tips
          </h2>

          <div
            className="bg-bg-yellow-pale border-2 border-charcoal p-8"
            style={{ borderRadius: "2px" }}
          >
            <ul className="space-y-4 font-mono text-sm text-charcoal">
              <li className="flex gap-4">
                <span className="text-duck-blue font-normal">💡</span>
                <span>
                  <strong className="uppercase">Be Specific:</strong> Include details about
                  your current situation, goals, and feelings. Future you will appreciate
                  the context.
                </span>
              </li>
              <li className="flex gap-4">
                <span className="text-duck-blue font-normal">💡</span>
                <span>
                  <strong className="uppercase">Ask Questions:</strong> Pose questions to
                  your future self about whether you achieved certain goals or made specific
                  changes.
                </span>
              </li>
              <li className="flex gap-4">
                <span className="text-duck-blue font-normal">💡</span>
                <span>
                  <strong className="uppercase">Express Gratitude:</strong> Thank your
                  present self for the efforts you're making today. It's a powerful reminder
                  of progress.
                </span>
              </li>
              <li className="flex gap-4">
                <span className="text-duck-blue font-normal">💡</span>
                <span>
                  <strong className="uppercase">Be Kind:</strong> Write with compassion.
                  Future you deserves kindness, regardless of outcomes.
                </span>
              </li>
              <li className="flex gap-4">
                <span className="text-duck-blue font-normal">💡</span>
                <span>
                  <strong className="uppercase">Set Intentions:</strong> Share your hopes
                  and dreams. What do you want to accomplish? What kind of person do you
                  want to become?
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Example Prompts */}
        <section className="mt-16 space-y-8">
          <h2 className="font-mono text-3xl text-charcoal uppercase border-b-2 border-charcoal pb-4 text-center">
            Letter Prompts
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div
              className="bg-white border-2 border-charcoal p-6"
              style={{ borderRadius: "2px" }}
            >
              <h3 className="font-mono text-lg text-charcoal uppercase mb-3 text-teal-primary">
                New Year Reflection
              </h3>
              <p className="font-mono text-sm text-gray-secondary mb-4">
                "Looking back at this year, what were my biggest wins and lessons? What do I
                hope to accomplish in the year ahead?"
              </p>
            </div>

            <div
              className="bg-white border-2 border-charcoal p-6"
              style={{ borderRadius: "2px" }}
            >
              <h3 className="font-mono text-lg text-charcoal uppercase mb-3 text-lavender">
                Career Goals
              </h3>
              <p className="font-mono text-sm text-gray-secondary mb-4">
                "Where am I in my career right now? Where do I want to be in 5 years? What
                steps am I taking to get there?"
              </p>
            </div>

            <div
              className="bg-white border-2 border-charcoal p-6"
              style={{ borderRadius: "2px" }}
            >
              <h3 className="font-mono text-lg text-charcoal uppercase mb-3 text-peach">
                Personal Growth
              </h3>
              <p className="font-mono text-sm text-gray-secondary mb-4">
                "What habits am I working on? What kind of person am I becoming? How have I
                grown in the past year?"
              </p>
            </div>

            <div
              className="bg-white border-2 border-charcoal p-6"
              style={{ borderRadius: "2px" }}
            >
              <h3 className="font-mono text-lg text-charcoal uppercase mb-3 text-lime">
                Life Milestones
              </h3>
              <p className="font-mono text-sm text-gray-secondary mb-4">
                "What important life events am I experiencing? How do I want to remember
                this moment? What am I learning?"
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
