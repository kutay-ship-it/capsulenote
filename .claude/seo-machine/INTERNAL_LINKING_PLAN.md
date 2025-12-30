# Internal Linking Optimization Plan

> **Created**: 2025-12-29
> **Status**: ✅ Complete
> **Objective**: Complete internal linking coverage across all content pages

## Executive Summary

Capsule Note has a sophisticated internal linking system (`internal-links.ts`) with content clustering and relationship mapping. However, several page types are missing internal link integration, leaving SEO value on the table.

---

## Current State Assessment

### Existing Infrastructure (Excellent)

**`apps/web/lib/seo/internal-links.ts`** (660 lines):
- 10 content clusters: future-self, letter-craft, life-events, privacy-security, use-cases, goals, relationships, mental-health, legacy, milestones
- Cluster relationship mapping for cross-linking
- Relevance scoring (high, medium, low)
- Bilingual support (EN/TR)
- Functions: `getRelatedContent()`, `toRelatedItems()`

**`apps/web/lib/seo/content-registry.ts`**:
- 29 blog posts
- 15 guide pages
- 8 template categories
- 8 prompt themes

**`apps/web/components/seo/related-content.tsx`**:
- RelatedContent component with compact/expanded variants
- Bilingual support
- Hover animations and neo-brutalist styling

### Page Coverage Audit

| Page Type | Has RelatedContent | Status |
|-----------|-------------------|--------|
| Blog detail `/blog/[slug]` | ✅ Yes | Complete |
| Guide detail `/guides/[slug]` | ✅ Yes | Complete |
| Template detail `/templates/[category]/[slug]` | ✅ Yes | Complete |
| Prompt theme `/prompts/[theme]` | ✅ Yes | ✅ Complete |
| Template category `/templates/[category]` | ✅ Yes | ✅ Complete |
| Prompts hub `/prompts` | ✅ Yes | ✅ Complete |

---

## Optimization Plan

### Priority 1: Add RelatedContent to Prompt Theme Pages

**File**: `apps/web/app/[locale]/(marketing-v3)/prompts/[theme]/page.tsx`

**Changes Required**:
1. Import `RelatedContent` component
2. Import `getRelatedContent`, `toRelatedItems` from internal-links
3. Call `getRelatedContent("prompt", themeInfo.id, undefined, locale)`
4. Render `<RelatedContent items={relatedItems} locale={locale} />` before closing

**Impact**: 8 prompt theme pages × 2 locales = 16 pages improved

### Priority 2: Add RelatedContent to Template Category Pages

**File**: `apps/web/app/[locale]/(marketing-v3)/templates/[category]/page.tsx`

**Changes Required**:
1. Import RelatedContent and internal-links functions
2. Call `getRelatedContent("template", category, category, locale)`
3. Render RelatedContent at bottom of page

**Impact**: 8 template categories × 2 locales = 16 pages improved

### Priority 3: Add Cross-Links to Prompts Hub Page

**File**: `apps/web/app/[locale]/(marketing-v3)/prompts/page.tsx`

**Changes Required**:
1. Add "Explore More" section linking to related blog posts and guides
2. Use existing cluster mappings to suggest relevant content

**Impact**: 1 hub page × 2 locales = 2 pages improved

---

## Implementation Strategy

### Approach: Use Specialized Agents

1. **internal-linker agent**: Primary agent for adding RelatedContent to pages
2. **seo-quality-checker agent**: Validation after implementation

### Files to Modify

1. `apps/web/app/[locale]/(marketing-v3)/prompts/[theme]/page.tsx`
2. `apps/web/app/[locale]/(marketing-v3)/templates/[category]/page.tsx`
3. `apps/web/app/[locale]/(marketing-v3)/prompts/page.tsx` (optional enhancement)

---

## Success Metrics

| Metric | Before | After | Target | Status |
|--------|--------|-------|--------|--------|
| Pages with RelatedContent | 3 types | 6 types | 6 types | ✅ Achieved |
| Internal links per content page | Variable | 4-6 links | 4-6 links | ✅ Achieved |
| TypeScript build | ✅ | ✅ | ✅ (no regressions) | ✅ Passed |

---

## Technical Notes

### Pattern to Follow (from blog detail page)

```typescript
// 1. Imports (add to top)
import { RelatedContent } from "@/components/seo/related-content"
import { getRelatedContent, toRelatedItems } from "@/lib/seo/internal-links"

// 2. In component body (before return)
const relatedLinks = getRelatedContent("prompt", themeInfo.id, undefined, locale === "tr" ? "tr" : "en")
const relatedItems = toRelatedItems(relatedLinks, locale === "tr" ? "tr" : "en")

// 3. In JSX (before closing </LegalPageLayout>)
<RelatedContent
  items={relatedItems}
  locale={locale}
/>
```

---

## Risk Assessment

- **Low Risk**: Adding RelatedContent is additive, doesn't modify existing functionality
- **No Breaking Changes**: Component and functions already tested on blog/guide pages
- **Rollback**: Simple git revert if needed

---

## Completion Summary

**Implementation Date**: 2025-12-29
**TypeScript Build**: ✅ Passed (0 errors)

### Files Modified:
1. `apps/web/app/[locale]/(marketing-v3)/prompts/[theme]/page.tsx` - Added RelatedContent with cluster-based links
2. `apps/web/app/[locale]/(marketing-v3)/templates/[category]/page.tsx` - Added RelatedContent with category context
3. `apps/web/app/[locale]/(marketing-v3)/prompts/page.tsx` - Added cross-links to guides, blog, templates

### Impact:
- **16 prompt theme pages** now have internal links (8 themes × 2 locales)
- **16 template category pages** now have internal links (8 categories × 2 locales)
- **2 prompts hub pages** now have strategic cross-links (EN + TR)
- **Total: 34 pages improved** with proper internal linking

---

**Last Updated**: 2025-12-29 (Complete)
