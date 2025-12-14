# SEO Machine - Content Plan

> Target: 60 → 150+ indexed pages
> Strategy: Content clusters for topical authority

## Content Clusters

### Cluster 1: Future Self Psychology (8 posts)

| Slug | Status | Keywords | Words |
|------|--------|----------|-------|
| `science-of-future-self` | EXISTS (guide) | future self psychology | - |
| `psychological-benefits-journaling` | NEW | journaling benefits | 800+ |
| `time-perception-psychology` | NEW | temporal self | 800+ |
| `delayed-gratification-letters` | NEW | delayed gratification | 800+ |
| `identity-continuity-research` | NEW | identity continuity | 800+ |
| `nostalgia-psychology` | NEW | nostalgia effect | 800+ |
| `memory-consolidation-writing` | NEW | memory writing | 800+ |
| `self-compassion-future-self` | NEW | self compassion letter | 800+ |

### Cluster 2: Letter Writing Craft (7 posts)

| Slug | Status | Keywords | Words |
|------|--------|----------|-------|
| `letter-writing-tips` | EXISTS | letter writing tips | - |
| `how-to-write-meaningful-letter` | NEW | meaningful letter | 800+ |
| `letter-prompts-beginners` | NEW | letter prompts | 800+ |
| `overcoming-writers-block` | NEW | writers block letters | 800+ |
| `emotional-expression-writing` | NEW | emotional writing | 800+ |
| `letter-formatting-guide` | NEW | letter format | 800+ |
| `storytelling-letters` | NEW | storytelling letters | 800+ |

### Cluster 3: Life Events (8 posts)

| Slug | Status | Keywords | Words |
|------|--------|----------|-------|
| `new-year-letter-ideas` | EXISTS | new year letter | - |
| `graduation-letters-guide` | EXISTS | graduation letter | - |
| `wedding-anniversary-letters` | NEW | anniversary letter | 800+ |
| `birthday-milestone-letters` | NEW | milestone birthday letter | 800+ |
| `career-transition-letters` | NEW | career change letter | 800+ |
| `retirement-letters-future` | NEW | retirement letter self | 800+ |
| `pregnancy-baby-letters` | NEW | letter to baby | 800+ |
| `moving-new-chapter-letters` | NEW | moving letter | 800+ |

### Cluster 4: Privacy & Security (4 posts)

| Slug | Status | Keywords | Words |
|------|--------|----------|-------|
| `why-write-to-future-self` | EXISTS | why write future self | - |
| `physical-mail-vs-email` | EXISTS | physical vs email letter | - |
| `encryption-explained-simple` | NEW | encrypted letters | 800+ |
| `digital-legacy-planning` | NEW | digital legacy | 800+ |

### Cluster 5: Use Cases (3 posts)

| Slug | Status | Keywords | Words |
|------|--------|----------|-------|
| `therapy-journaling-letters` | NEW | therapeutic letter writing | 800+ |
| `corporate-team-building-letters` | NEW | team building letters | 800+ |
| `education-classroom-letters` | NEW | classroom letter activity | 800+ |

## New Blog Slugs (25 total)

```typescript
// Add to content-registry.ts blogSlugs array
export const blogSlugs = [
  // EXISTING (5)
  "why-write-to-future-self",
  "new-year-letter-ideas",
  "graduation-letters-guide",
  "physical-mail-vs-email",
  "letter-writing-tips",

  // NEW - Future Self Psychology (7)
  "psychological-benefits-journaling",
  "time-perception-psychology",
  "delayed-gratification-letters",
  "identity-continuity-research",
  "nostalgia-psychology",
  "memory-consolidation-writing",
  "self-compassion-future-self",

  // NEW - Letter Writing Craft (6)
  "how-to-write-meaningful-letter",
  "letter-prompts-beginners",
  "overcoming-writers-block",
  "emotional-expression-writing",
  "letter-formatting-guide",
  "storytelling-letters",

  // NEW - Life Events (6)
  "wedding-anniversary-letters",
  "birthday-milestone-letters",
  "career-transition-letters",
  "retirement-letters-future",
  "pregnancy-baby-letters",
  "moving-new-chapter-letters",

  // NEW - Privacy & Security (2)
  "encryption-explained-simple",
  "digital-legacy-planning",

  // NEW - Use Cases (3)
  "therapy-journaling-letters",
  "corporate-team-building-letters",
  "education-classroom-letters",
] as const
```

## New Guide Slugs (9 total)

```typescript
// Add to content-registry.ts guideSlugs array
export const guideSlugs = [
  // EXISTING (6)
  "how-to-write-letter-to-future-self",
  "science-of-future-self",
  "time-capsule-vs-future-letter",
  "privacy-security-best-practices",
  "letters-for-mental-health",
  "legacy-letters-guide",

  // NEW (9)
  "complete-beginners-guide",
  "letter-delivery-timing-guide",
  "physical-mail-delivery-guide",
  "template-customization-guide",
  "multiple-recipients-guide",
  "international-delivery-guide",
  "business-use-cases-guide",
  "family-history-letters-guide",
  "mental-health-journaling-guide",
] as const
```

## Comparison Pages (NEW CONTENT TYPE)

| Slug | Keywords | Target |
|------|----------|--------|
| `futureme-alternative` | futureme alternative, better than futureme | Competitor capture |
| `time-capsule-services` | digital time capsule, time capsule app | Category capture |
| `journaling-apps-comparison` | letter vs journal, day one alternative | Category capture |

## Use Case Pages (NEW CONTENT TYPE)

| Slug | Target Persona | Keywords |
|------|---------------|----------|
| `new-parents` | Parents with babies | letter to baby from parent |
| `college-students` | Ages 18-22 | college graduation letter |
| `milestone-birthdays` | 30th/40th/50th birthdays | 30th birthday letter self |
| `couples` | Married/engaged | anniversary letter template |
| `therapists` | Mental health pros | therapeutic letter exercise |
| `coaches` | Life coaches | coaching letter exercise |
| `teachers` | Educators | student reflection letter |
| `managers` | HR/corporate | employee recognition letter |

## Internal Linking Map

### Pillar → Cluster Links

```
/guides/how-to-write-letter-to-future-self (PILLAR)
├── /blog/why-write-to-future-self
├── /guides/science-of-future-self
├── /templates/self-reflection/*
├── /prompts/self-esteem
└── /blog/psychological-benefits-journaling

/templates/goals (PILLAR)
├── /blog/new-year-letter-ideas
├── /templates/goals/new-years-resolution
├── /templates/goals/five-year-vision
├── /prompts/new-year
└── /blog/delayed-gratification-letters

/guides/letters-for-mental-health (PILLAR)
├── /templates/gratitude/*
├── /templates/self-reflection/mindfulness-moment
├── /prompts/grief
├── /prompts/sobriety
└── /blog/therapy-journaling-letters
```

### Cross-Content Link Rules

1. **Blog post footer**: 2 related blogs + 1 template + 1 guide + CTA
2. **Guide footer**: 2 related guides + 2 templates + CTA
3. **Template footer**: 2 related templates + 1 guide + 1 blog + CTA
4. **Max density**: 1 internal link per 100 words

## Content Quality Checklist

Each new page MUST have:
- [ ] Title: 30-60 characters
- [ ] Description: 120-160 characters
- [ ] Content: 800+ words
- [ ] Internal links: 3+ links
- [ ] Schema markup: ArticleSchema/HowToSchema
- [ ] OG image: Auto-generated
- [ ] Bilingual: en + tr versions
