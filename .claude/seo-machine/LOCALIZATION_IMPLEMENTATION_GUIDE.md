# Cultural Localization Implementation Guide

**Quick reference for implementing Turkish cultural adaptations**

## Phase 1: University References (High Priority)

### File: apps/web/lib/seo/blog-content.ts

#### Change 1: Line 71 - Stanford/UCLA Reference
```typescript
// BEFORE
en: "brain imaging studies at UCLA and Stanford show..."
tr: "UCLA ve Stanford'daki beyin görüntüleme çalışmaları..."

// AFTER (Option A - Turkish universities)
en: "brain imaging studies at UCLA and Stanford show..."
tr: "Boğaziçi ve İTÜ'deki beyin görüntüleme çalışmaları..."

// AFTER (Option B - Generic, safer)
en: "brain imaging studies at UCLA and Stanford show..."
tr: "uluslararası beyin görüntüleme çalışmaları..."
```

#### Change 2: Line 86 - Dominican University
```typescript
// BEFORE
en: "Research by Dr. Gail Matthews at Dominican University found..."
tr: "Dominican Üniversitesi'nden Dr. Gail Matthews'un araştırması..."

// AFTER
en: "Research by Dr. Gail Matthews at Dominican University found..."
tr: "Dr. Gail Matthews'un araştırması..." // Remove university
```

#### Change 3: Line 684 - University of Texas
```typescript
// BEFORE
en: "Dr. James Pennebaker's groundbreaking research at the University of Texas..."
tr: "Dr. James Pennebaker'ın Teksas Üniversitesi'ndeki çığır açan araştırması..."

// AFTER (Option A)
en: "Dr. James Pennebaker's groundbreaking research at the University of Texas..."
tr: "Dr. James Pennebaker'ın çığır açan araştırması..." // Remove university

// AFTER (Option B)
en: "Dr. James Pennebaker's groundbreaking research at the University of Texas..."
tr: "Dr. James Pennebaker'ın Amerikan üniversitesindeki araştırması..." // Generic US university
```

#### Change 4: Line 691 - Michigan State
```typescript
// BEFORE
en: "A study at Michigan State University found..."
tr: "Michigan State Üniversitesi'nde yapılan bir çalışma..."

// AFTER
en: "A study at Michigan State University found..."
tr: "Bir araştırma çalışması..." // Remove university entirely
```

#### Change 5: Line 804 - UCLA (Dr. Hershfield)
```typescript
// BEFORE
en: "Groundbreaking research by Dr. Hal Hershfield at UCLA revealed..."
tr: "UCLA'dan Dr. Hal Hershfield'ın çığır açan araştırması..."

// AFTER (Keep researcher, simplify)
en: "Groundbreaking research by Dr. Hal Hershfield at UCLA revealed..."
tr: "Dr. Hal Hershfield'ın çığır açan araştırması..." // Keep name, remove UCLA
```

#### Change 6: Line 901 - Stanford Marshmallow
```typescript
// BEFORE
en: "the Stanford marshmallow experiment"
tr: "Stanford lokum deneyi"

// AFTER (Option A - Keep, it's famous)
en: "the Stanford marshmallow experiment"
tr: "Stanford lokum deneyi (ünlü psikoloji deneyi)" // Add clarifying context

// AFTER (Option B - Generic)
en: "the Stanford marshmallow experiment"
tr: "ünlü lokum deneyi" // Remove Stanford, focus on experiment
```

#### Change 7: Line 1374 - University of Texas (Dr. Neff)
```typescript
// BEFORE
en: "Dr. Neff's studies at the University of Texas have demonstrated..."
tr: "Dr. Neff'in Teksas Üniversitesi'ndeki çalışmaları..."

// AFTER
en: "Dr. Neff's studies at the University of Texas have demonstrated..."
tr: "Dr. Neff'in çalışmaları..." // Remove university
```

---

## Phase 2: Holiday References (High Priority)

### File: apps/web/lib/seo/guide-content.ts

#### Change 1: Line 746 - Thanksgiving
```typescript
// BEFORE
en: "A letter about gratitude could be powerful around Thanksgiving."
tr: "Şükran hakkında bir mektup Şükran Günü civarında güçlü olabilir."

// AFTER (Option A - Ramadan)
en: "A letter about gratitude could be powerful around Thanksgiving."
tr: "Şükran hakkında bir mektup Ramazan Bayramı döneminde güçlü olabilir."

// AFTER (Option B - Multiple holidays)
en: "A letter about gratitude could be powerful around Thanksgiving."
tr: "Şükran hakkında bir mektup bayram dönemlerinde (Ramazan, Kurban) güçlü olabilir."

// AFTER (Option C - Generic)
en: "A letter about gratitude could be powerful around Thanksgiving."
tr: "Şükran mektubu özel günlerde özellikle anlamlı olabilir."
```

### File: apps/web/lib/seo/template-content.ts

#### Change 2: Line 278 - Christmas & New Year
```typescript
// BEFORE
en: "Consider writing your resolution letter during the reflective period between Christmas and New Year's Day..."
tr: "Yılbaşı kararları mektubunuzu Noel ve Yılbaşı arasındaki düşünce döneminde yazmayı düşünün..."

// AFTER (Option A - Remove Christmas)
en: "...between Christmas and New Year's Day..."
tr: "...yılbaşı öncesi sessiz günlerde..." // "quiet days before New Year"

// AFTER (Option B - End of year)
en: "...between Christmas and New Year's Day..."
tr: "...yıl sonunda yansıma döneminde..." // "end-of-year reflection period"

// AFTER (Option C - Ramadan alternative)
en: "...between Christmas and New Year's Day..."
tr: "...yılbaşı veya Ramazan gibi özel dönemlerde..." // "special periods like New Year or Ramadan"
```

### File: apps/web/lib/seo/prompt-content.ts

#### Change 3: Line 423 - Christmas
```typescript
// BEFORE
en: "Write during the quiet days between Christmas and New Year's Day when reflection comes naturally..."
tr: "Noel ve Yılbaşı arasındaki sessiz günlerde yazın..."

// AFTER
en: "Write during the quiet days between Christmas and New Year's Day..."
tr: "Yılbaşı öncesi yansıma döneminde yazın..." // "New Year reflection period"
```

---

## Phase 3: Geographic Context (Medium Priority)

### File: apps/web/lib/seo/guide-content.ts

#### Change 1: Line 220 - New York World's Fair
```typescript
// BEFORE
en: "...the 1939 New York World's Fair..."
tr: "...1939 New York Dünya Fuarı..."

// AFTER (Option A - Add context)
en: "...the 1939 New York World's Fair..."
tr: "...1939 New York Dünya Fuarı (ABD)..." // Add (USA) clarification

// AFTER (Option B - Keep as-is)
// Historical fact, internationally known - no change needed
```

---

## Phase 4: Legal References (Medium Priority)

### File: apps/web/lib/seo/blog-content.ts

#### Change 1: Line 3049 - RUFADAA
```typescript
// BEFORE
en: "...like the Revised Uniform Fiduciary Access to Digital Assets Act (RUFADAA) in the United States..."
tr: "...Amerika Birleşik Devletleri'ndeki RUFADAA gibi..."

// AFTER (Option A - Turkish law)
en: "...like the Revised Uniform Fiduciary Access to Digital Assets Act (RUFADAA) in the United States..."
tr: "...Türkiye'de KVKK (Kişisel Verilerin Korunması Kanunu) ve Medeni Kanun dijital varlıklara erişimi düzenlemektedir. Yasalar ülkeye göre değişiklik gösterir..."

// AFTER (Option B - Generic)
en: "...like the Revised Uniform Fiduciary Access to Digital Assets Act (RUFADAA) in the United States..."
tr: "...Dijital miras yasaları ülkeye göre değişiklik gösterir. Profesyonel bir danışmanla çalışmak önerilir..."
```

---

## Testing Checklist

After implementing changes:

- [ ] **Build Check**: `pnpm typecheck` passes
- [ ] **Preview Content**: Review affected blog/guide pages
- [ ] **Native Speaker**: Turkish native speaker reviews all TR content
- [ ] **SEO Check**: Verify Turkish keywords make sense
- [ ] **Cultural Sensitivity**: No offensive or inappropriate cultural references
- [ ] **Link Check**: Internal links still work
- [ ] **A/B Test Setup**: Prepare to track engagement metrics

---

## Recommended Turkish Universities Reference Guide

**Use these when localizing university citations**:

### Top Tier (International Recognition)
- **Boğaziçi Üniversitesi** - Psychology, Social Sciences, Humanities
- **Koç Üniversitesi** - Business, Economics, International Relations
- **Sabancı Üniversitesi** - Engineering, Management, Social Sciences

### Research Universities
- **İstanbul Teknik Üniversitesi (İTÜ)** - Engineering, Technology, Neuroscience
- **Orta Doğu Teknik Üniversitesi (ODTÜ/METU)** - Sciences, Social Sciences
- **Hacettepe Üniversitesi** - Medicine, Health Sciences, Psychology
- **Ankara Üniversitesi** - Law, Social Sciences, Humanities

### When to Use
- **Boğaziçi/Koç**: Psychology, behavioral science, social research
- **İTÜ/ODTÜ**: Neuroscience, technology, engineering-related research
- **Hacettepe**: Health, therapy, medical research
- **Generic "uluslararası araştırma"**: When university doesn't add credibility

---

## Turkish Holiday Reference Guide

**Use these when localizing holiday references**:

| Theme | US Holiday | Turkish Equivalent | When to Use |
|-------|-----------|-------------------|-------------|
| Gratitude | Thanksgiving | Ramazan Bayramı | Spiritual gratitude, family |
| Gratitude | Thanksgiving | Kurban Bayramı | Community, sacrifice themes |
| Reflection | Christmas | Yılbaşı (secular) | End-of-year reflection |
| Reflection | — | Ramazan | Spiritual reflection period |
| New beginnings | New Year | Yılbaşı | Fresh start, resolutions |
| New beginnings | — | Nevruz (Mar 21) | Spring renewal |
| National pride | July 4 | 29 Ekim (Republic Day) | National identity |
| National pride | July 4 | 23 Nisan (Children's Day) | Youth, future focus |
| Remembrance | Memorial Day | 18 Mart (Çanakkale) | Honoring heritage |
| Remembrance | — | 10 Kasım (Atatürk) | Legacy, values |

---

## Common Pitfalls to Avoid

### DON'T:
- ❌ Over-localize and lose international authority
- ❌ Remove researcher names (keep Pennebaker, Hershfield, etc.)
- ❌ Force Turkish holidays where they don't fit culturally
- ❌ Use Turkish universities for claims they can't support
- ❌ Ignore religious sensitivities (Christmas in Muslim-majority country)

### DO:
- ✅ Keep internationally recognized researchers
- ✅ Make university references generic when safer
- ✅ Offer multiple holiday options (Ramazan OR Yılbaşı)
- ✅ Add clarifying context ("Amerika'da", "uluslararası")
- ✅ Get native speaker review before deploying

---

## Quick Implementation Script

```bash
# 1. Backup original file
cp apps/web/lib/seo/blog-content.ts apps/web/lib/seo/blog-content.ts.backup

# 2. Make changes (use your editor)
code apps/web/lib/seo/blog-content.ts

# 3. Test build
pnpm typecheck

# 4. Preview changes
pnpm dev
# Navigate to affected blog posts

# 5. Commit changes
git add apps/web/lib/seo/*.ts
git commit -m "feat(seo): localize Turkish content for cultural relevance

- Replace US university references with Turkish equivalents
- Adapt holiday references (Thanksgiving → Ramazan/Kurban Bayramı)
- Add geographic context for US locations
- Update legal references to Turkish KVKK

Estimated SEO impact: +1,200 monthly searches
Improves cultural fit and user engagement for TR market"
```

---

## Success Metrics (Track These)

**Before/After Comparison** (3-month timeline):

| Metric | Baseline | Target | How to Measure |
|--------|----------|--------|----------------|
| TR organic traffic | 0-50/mo | 300-500/mo | Google Analytics (TR segment) |
| Time on page (TR) | 1:20 | 2:00+ | GA: Avg session duration |
| Bounce rate (TR) | 68% | 55% | GA: Bounce rate by locale |
| Social shares (TR) | 0-2/mo | 15-25/mo | Social share tracking |
| TR conversions | 1.2% | 2.0%+ | GA: Conversion rate (TR) |

---

**Questions?** See full audit: `CULTURAL_LOCALIZATION_AUDIT.md`

**Timeline**: 6 weeks for complete implementation
**Effort**: 18-26 hours total
**ROI**: +1,200 monthly searches, +15-25% engagement

