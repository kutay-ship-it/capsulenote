/**
 * SEO Quality Gates
 * Validates content meets minimum SEO standards before indexing
 */

export interface ContentQualityResult {
  passed: boolean
  score: number
  issues: string[]
  warnings: string[]
}

export interface ContentQualityInput {
  title: string
  description: string
  content: string
  internalLinks?: number
  hasSchema?: boolean
  hasImages?: boolean
  locale?: string
}

/**
 * Minimum quality thresholds for programmatic SEO pages
 */
export const QUALITY_THRESHOLDS = {
  minTitleLength: 30,
  maxTitleLength: 60,
  minDescriptionLength: 120,
  maxDescriptionLength: 160,
  minContentLength: 800,
  minUniqueContentRatio: 0.6,
  maxKeywordDensity: 0.025,
  minInternalLinks: 3,
  requiredSchema: true,
  requiredImages: 1,
}

/**
 * Calculate keyword density in content
 */
export function calculateKeywordDensity(content: string, keyword: string): number {
  const contentLower = content.toLowerCase()
  const keywordLower = keyword.toLowerCase()

  const words = contentLower.split(/\s+/).length
  const keywordMatches = contentLower.split(keywordLower).length - 1

  return words > 0 ? keywordMatches / words : 0
}

/**
 * Count words in content
 */
export function countWords(content: string): number {
  return content.trim().split(/\s+/).filter(Boolean).length
}

/**
 * Validate content against quality gates
 */
export function validateContentQuality(input: ContentQualityInput): ContentQualityResult {
  const issues: string[] = []
  const warnings: string[] = []
  let score = 100

  // Title validation
  if (input.title.length < QUALITY_THRESHOLDS.minTitleLength) {
    issues.push(`Title too short (${input.title.length} chars, min ${QUALITY_THRESHOLDS.minTitleLength})`)
    score -= 15
  } else if (input.title.length > QUALITY_THRESHOLDS.maxTitleLength) {
    warnings.push(`Title may be truncated (${input.title.length} chars, max ${QUALITY_THRESHOLDS.maxTitleLength})`)
    score -= 5
  }

  // Description validation
  if (input.description.length < QUALITY_THRESHOLDS.minDescriptionLength) {
    issues.push(`Description too short (${input.description.length} chars, min ${QUALITY_THRESHOLDS.minDescriptionLength})`)
    score -= 15
  } else if (input.description.length > QUALITY_THRESHOLDS.maxDescriptionLength) {
    warnings.push(`Description may be truncated (${input.description.length} chars, max ${QUALITY_THRESHOLDS.maxDescriptionLength})`)
    score -= 5
  }

  // Content length validation
  const wordCount = countWords(input.content)
  if (wordCount < QUALITY_THRESHOLDS.minContentLength) {
    issues.push(`Content too thin (${wordCount} words, min ${QUALITY_THRESHOLDS.minContentLength})`)
    score -= 25
  }

  // Internal links validation
  if (input.internalLinks !== undefined && input.internalLinks < QUALITY_THRESHOLDS.minInternalLinks) {
    warnings.push(`Low internal links (${input.internalLinks}, min ${QUALITY_THRESHOLDS.minInternalLinks})`)
    score -= 10
  }

  // Schema validation
  if (QUALITY_THRESHOLDS.requiredSchema && !input.hasSchema) {
    warnings.push("Missing structured data (schema.org)")
    score -= 10
  }

  // Image validation
  if (!input.hasImages) {
    warnings.push("No images found - consider adding visual content")
    score -= 5
  }

  return {
    passed: score >= 70 && issues.length === 0,
    score: Math.max(0, score),
    issues,
    warnings,
  }
}

/**
 * Check if a page should be indexed based on quality
 */
export function shouldIndexPage(input: ContentQualityInput): boolean {
  const result = validateContentQuality(input)
  return result.passed && result.score >= 70
}

/**
 * Generate a noindex meta tag if quality is too low
 */
export function getIndexingDirective(input: ContentQualityInput): "index" | "noindex" {
  return shouldIndexPage(input) ? "index" : "noindex"
}

/**
 * Content freshness scoring
 * Used for determining when to refresh content
 */
export interface ContentFreshnessInput {
  lastModified: Date
  pageViews30Days: number
  avgPosition: number
  positionTrend: "up" | "down" | "stable"
  ctr: number
  ctrbenchmark: number
}

export function calculateContentHealthScore(input: ContentFreshnessInput): number {
  const now = new Date()
  const daysSinceModified = Math.floor(
    (now.getTime() - input.lastModified.getTime()) / (1000 * 60 * 60 * 24)
  )

  // Freshness score (0-25)
  let freshnessScore = 25
  if (daysSinceModified > 365) freshnessScore = 5
  else if (daysSinceModified > 180) freshnessScore = 10
  else if (daysSinceModified > 90) freshnessScore = 15
  else if (daysSinceModified > 30) freshnessScore = 20

  // Position score (0-30)
  let positionScore = 30
  if (input.avgPosition > 50) positionScore = 5
  else if (input.avgPosition > 20) positionScore = 10
  else if (input.avgPosition > 10) positionScore = 20
  else if (input.avgPosition > 3) positionScore = 25

  // Position trend score (0-25)
  let trendScore = 15
  if (input.positionTrend === "up") trendScore = 25
  else if (input.positionTrend === "down") trendScore = 5

  // CTR score (0-20)
  let ctrScore = 10
  const ctrRatio = input.ctr / input.ctrbenchmark
  if (ctrRatio > 1.5) ctrScore = 20
  else if (ctrRatio > 1) ctrScore = 15
  else if (ctrRatio < 0.5) ctrScore = 5

  return freshnessScore + positionScore + trendScore + ctrScore
}

/**
 * Determine content action based on health score
 */
export function getContentAction(
  healthScore: number
): "no_action" | "refresh" | "major_rewrite" | "consider_removal" {
  if (healthScore > 80) return "no_action"
  if (healthScore > 60) return "refresh"
  if (healthScore > 40) return "major_rewrite"
  return "consider_removal"
}
