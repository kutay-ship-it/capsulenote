"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Sparkles, Target, Heart, Calendar } from "lucide-react"

interface Template {
    id: string
    title: string
    description: string
    category: "reflection" | "goal" | "gratitude" | "event"
    prompt: string
}

const templates: Template[] = [
    {
        id: "annual-check-in",
        title: "Annual Check-In",
        description: "Where am I? Where am I going?",
        category: "reflection",
        prompt: "<h2>Where am I right now?</h2><p>Describe your current situation, feelings, and surroundings...</p><h2>Where do I want to be?</h2><p>In one year, I hope to have...</p>"
    },
    {
        id: "year-in-review",
        title: "Year in Review",
        description: "Biggest wins and lessons learned.",
        category: "reflection",
        prompt: "<h2>My Biggest Wins</h2><p>This year, I am most proud of...</p><h2>Key Lessons</h2><p>The most important thing I learned was...</p>"
    },
    {
        id: "new-years-promises",
        title: "New Year's Promises",
        description: "What am I committing to?",
        category: "goal",
        prompt: "<h2>My Commitments</h2><p>This year, I promise myself to...</p><h2>Why this matters</h2><p>This is important because...</p>"
    },
    {
        id: "dream-life",
        title: "Dream Life Vision",
        description: "Where do I want to be in 5 years?",
        category: "goal",
        prompt: "<h2>5 Years From Now</h2><p>I wake up and...</p><h2>My Career</h2><p>I am working on...</p><h2>My Relationships</h2><p>I am surrounded by...</p>"
    },
    {
        id: "thank-you-self",
        title: "Thank You to Myself",
        description: "What am I proud of?",
        category: "gratitude",
        prompt: "<h2>Dear Me,</h2><p>I want to thank you for...</p><p>I am proud of you because...</p>"
    },
    {
        id: "advice-future-me",
        title: "Advice to Future Me",
        description: "What do I know now that I'll forget?",
        category: "event",
        prompt: "<h2>Remember this...</h2><p>If you are feeling lost, remember...</p><p>The most important thing right now is...</p>"
    }
]

interface TemplateSelectorProps {
    onSelect: (template: Template) => void
}

export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

    const filteredTemplates = selectedCategory
        ? templates.filter(t => t.category === selectedCategory)
        : templates

    const categories = [
        { id: "reflection", label: "Reflections", icon: Sparkles, color: "text-purple-500 bg-purple-50" },
        { id: "goal", label: "Goals", icon: Target, color: "text-blue-500 bg-blue-50" },
        { id: "gratitude", label: "Gratitude", icon: Heart, color: "text-pink-500 bg-pink-50" },
        { id: "event", label: "Life Events", icon: Calendar, color: "text-orange-500 bg-orange-50" },
    ]

    return (
        <div className="space-y-6">
            <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
                <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${selectedCategory === null
                            ? "bg-charcoal text-white"
                            : "bg-white text-stone-600 hover:bg-stone-100"
                        }`}
                >
                    All Templates
                </button>
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${selectedCategory === cat.id
                                ? "bg-charcoal text-white"
                                : "bg-white text-stone-600 hover:bg-stone-100"
                            }`}
                    >
                        <cat.icon className="w-4 h-4" />
                        {cat.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTemplates.map((template) => (
                    <motion.button
                        key={template.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => onSelect(template)}
                        className="text-left p-6 bg-white rounded-xl border border-stone-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all group"
                    >
                        <h3 className="font-serif text-lg font-medium text-charcoal mb-2 group-hover:text-teal-600 transition-colors">
                            {template.title}
                        </h3>
                        <p className="text-sm text-stone-500">
                            {template.description}
                        </p>
                    </motion.button>
                ))}
            </div>
        </div>
    )
}
