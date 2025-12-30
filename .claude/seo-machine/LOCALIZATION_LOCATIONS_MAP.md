# Cultural References Location Map

**Quick reference: Where to find and fix each US-centric reference**

---

## File: apps/web/lib/seo/blog-content.ts

### Universities

| Line | Current Text | Type | Priority |
|------|-------------|------|----------|
| 71 | "UCLA and Stanford" | University | HIGH |
| 86 | "Dominican University" | University | HIGH |
| 684 | "University of Texas" | University | HIGH |
| 691 | "Michigan State University" | University | HIGH |
| 804 | "Dr. Hal Hershfield at UCLA" | University | HIGH |
| 901 | "Stanford marshmallow experiment" | Cultural reference | MEDIUM |
| 1374 | "University of Texas" | University | HIGH |

### Legal References

| Line | Current Text | Type | Priority |
|------|-------------|------|----------|
| 3049 | "RUFADAA in the United States" | US law | MEDIUM |

**Total changes needed**: 8 lines in blog-content.ts

---

## File: apps/web/lib/seo/guide-content.ts

### Holidays

| Line | Current Text | Type | Priority |
|------|-------------|------|----------|
| 746 | "around Thanksgiving" | US holiday | HIGH |

### Geography

| Line | Current Text | Type | Priority |
|------|-------------|------|----------|
| 220 | "1939 New York World's Fair" | US location | LOW |

**Total changes needed**: 2 lines in guide-content.ts

---

## File: apps/web/lib/seo/template-content.ts

### Holidays

| Line | Current Text | Type | Priority |
|------|-------------|------|----------|
| 278 | "between Christmas and New Year's Day" | US/Christian holiday | HIGH |

**Total changes needed**: 1 line in template-content.ts

---

## File: apps/web/lib/seo/prompt-content.ts

### Holidays

| Line | Current Text | Type | Priority |
|------|-------------|------|----------|
| 423 | "between Christmas and New Year's Day" | US/Christian holiday | HIGH |

**Total changes needed**: 1 line in prompt-content.ts

---

## Summary by File

| File | Total Changes | High Priority | Medium Priority | Low Priority |
|------|--------------|---------------|-----------------|--------------|
| blog-content.ts | 8 | 7 | 1 | 0 |
| guide-content.ts | 2 | 1 | 0 | 1 |
| template-content.ts | 1 | 1 | 0 | 0 |
| prompt-content.ts | 1 | 1 | 0 | 0 |
| **TOTAL** | **12** | **10** | **1** | **1** |

---

## Summary by Type

| Reference Type | Count | Priority | Estimated Time |
|---------------|-------|----------|---------------|
| Universities | 7 | HIGH | 6-8 hours |
| Holidays | 3 | HIGH | 2-3 hours |
| Legal | 1 | MEDIUM | 1-2 hours |
| Geography | 1 | LOW | 0.5 hour |
| **TOTAL** | **12** | — | **9.5-13.5 hours** |

---

## Implementation Checklist

### Phase 1: Universities (6-8 hours)

- [ ] **blog-content.ts:71** - UCLA and Stanford → Boğaziçi/İTÜ or generic
- [ ] **blog-content.ts:86** - Dominican University → remove
- [ ] **blog-content.ts:684** - University of Texas → generic
- [ ] **blog-content.ts:691** - Michigan State → remove
- [ ] **blog-content.ts:804** - UCLA → generic
- [ ] **blog-content.ts:901** - Stanford marshmallow → add context or keep
- [ ] **blog-content.ts:1374** - University of Texas → generic

### Phase 2: Holidays (2-3 hours)

- [ ] **guide-content.ts:746** - Thanksgiving → Ramazan/Kurban Bayramı
- [ ] **template-content.ts:278** - Christmas/New Year → Yılbaşı
- [ ] **prompt-content.ts:423** - Christmas/New Year → Yılbaşı

### Phase 3: Legal & Geography (1.5-2.5 hours)

- [ ] **blog-content.ts:3049** - RUFADAA → Turkish KVKK
- [ ] **guide-content.ts:220** - New York → add context (optional)

---

## Quick Search Commands

### Find all university references:
```bash
grep -n "University\|Stanford\|UCLA\|Harvard\|MIT" apps/web/lib/seo/blog-content.ts
```

### Find all holiday references:
```bash
grep -n "Thanksgiving\|Christmas\|New Year" apps/web/lib/seo/*.ts
```

### Find all affected Turkish translations:
```bash
grep -n "Üniversitesi\|Şükran Günü\|Noel" apps/web/lib/seo/*.ts
```

---

## Testing After Changes

```bash
# 1. Type check
pnpm typecheck

# 2. Build check
pnpm build

# 3. Preview affected pages
pnpm dev
# Then visit:
# - /blog/why-write-to-future-self (line 71)
# - /blog/journaling-mental-health (line 684, 691)
# - /blog/time-perception-psychology (line 804)
# - /blog/delayed-gratification-tips (line 901, 1374)
# - /guides/letter-timing-best-practices (line 746)
```

---

## Backup Before Starting

```bash
# Create backups
cp apps/web/lib/seo/blog-content.ts apps/web/lib/seo/blog-content.ts.backup
cp apps/web/lib/seo/guide-content.ts apps/web/lib/seo/guide-content.ts.backup
cp apps/web/lib/seo/template-content.ts apps/web/lib/seo/template-content.ts.backup
cp apps/web/lib/seo/prompt-content.ts apps/web/lib/seo/prompt-content.ts.backup

# If something goes wrong, restore:
# mv apps/web/lib/seo/*.backup apps/web/lib/seo/
```

---

## Priority Order (Recommended)

### Week 1: Quick Wins (4-6 hours)
1. Holiday references (3 files, 3 changes) - **Highest SEO impact**
2. Remove obscure universities (lines 86, 691) - **Easiest fixes**

### Week 2: University Localization (4-6 hours)
3. Stanford/UCLA references (lines 71, 804) - **High visibility**
4. University of Texas references (lines 684, 1374) - **Authority fix**
5. Stanford marshmallow (line 901) - **Cultural reference**

### Week 3: Legal & Polish (1-2 hours)
6. RUFADAA legal reference (line 3049) - **Accuracy**
7. New York reference (line 220) - **Optional polish**

---

**Total Estimated Time**: 9.5-13.5 hours
**Expected Impact**: +1,200 monthly searches, +15-25% engagement
**Risk Level**: Low (easy rollback, A/B testable)

