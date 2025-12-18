import { templateCategories, templateDetailSlugs, type TemplateCategory } from "./content-registry"

export function encodeTemplateId(category: TemplateCategory, slug: string): string {
  return Buffer.from(`${category}:${slug}`, "utf8").toString("base64url")
}

export function decodeTemplateId(
  templateId: string
): { category: TemplateCategory; slug: string } | null {
  try {
    const decoded = Buffer.from(templateId, "base64url").toString("utf8")
    const [category, slug] = decoded.split(":", 2)

    if (!category || !slug) return null
    if (!templateCategories.includes(category as TemplateCategory)) return null

    const categorySlugs = templateDetailSlugs[category as TemplateCategory]
    if (categorySlugs && !categorySlugs.includes(slug)) return null

    return { category: category as TemplateCategory, slug }
  } catch {
    return null
  }
}

