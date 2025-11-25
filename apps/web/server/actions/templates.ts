"use server"

import { unstable_cache } from "next/cache"
import { prisma } from "@/server/lib/db"

export type TemplateCategory = "reflection" | "goals" | "gratitude" | "future-self"

export interface LetterTemplate {
  id: string
  category: string
  title: string
  description: string | null
  promptText: string
  sortOrder: number
}

/**
 * Get all active letter templates, optionally filtered by category.
 * Results are cached for 60 seconds.
 */
export const getLetterTemplates = unstable_cache(
  async (category?: TemplateCategory): Promise<LetterTemplate[]> => {
    const templates = await prisma.letterTemplate.findMany({
      where: {
        isActive: true,
        ...(category && { category }),
      },
      select: {
        id: true,
        category: true,
        title: true,
        description: true,
        promptText: true,
        sortOrder: true,
      },
      orderBy: { sortOrder: "asc" },
    })

    return templates
  },
  ["letter-templates"],
  { revalidate: 60 }
)

/**
 * Get unique template categories
 */
export const getTemplateCategories = unstable_cache(
  async (): Promise<string[]> => {
    const results = await prisma.letterTemplate.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ["category"],
      orderBy: { sortOrder: "asc" },
    })

    return results.map((r) => r.category)
  },
  ["template-categories"],
  { revalidate: 60 }
)
