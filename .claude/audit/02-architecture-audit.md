# Architecture Audit Report - Capsule Note

## Summary
| Severity | Count |
|----------|-------|
| Critical | 1 |
| High | 3 |
| Medium | 5 |
| Low | 4 |

---

## CRITICAL Issue

### Workers Import Directly from apps/web
**Files**:
- `workers/inngest/functions/deliver-email.ts:26`
- `workers/inngest/functions/deliver-mail.ts:14`

```typescript
const { decrypt } = await import("../../../apps/web/server/lib/encryption")
```

**Impact**: Breaks package encapsulation, creates implicit dependency

**Recommendation**: Extract to `packages/shared` or `packages/core`

---

## HIGH Issues

### Missing packages/ui Package
CLAUDE.md references `packages/ui` but directory does not exist. UI components duplicated in `apps/web/components/ui/`.

### Duplicate Code in Workers
`decryptLetter()` function duplicated in workers rather than imported from shared package.

### No Dedicated API Package
API routes scattered with no shared package for API utilities.

---

## MEDIUM Issues

### Missing PPR Configuration
Next.js 16 cacheComponents not enabled despite being referenced in config.

### Worker i18n Imports from apps/web
Workers have own i18n loader but share message files with apps/web. Extract to `packages/i18n`.

### Feature Flag Cache Not Distributed
In-memory cache won't work across serverless function instances. Consider Redis-backed cache.

---

## GOOD Patterns Found

### Server/Client Component Split
- All page.tsx files are async Server Components (no "use client")
- Data fetching done at page level with `Promise.all()` for parallel fetches
- Client components isolated to `_components/` subdirectories
- 40 "use client" files properly isolated

### Provider Abstraction Pattern
- Clean EmailProvider interface
- Factory pattern with feature flag integration
- Graceful fallback on initialization failure

### Error Handling
- ActionResult discriminated union pattern
- Worker error classification with retry logic
- Client error boundary with auto-retry

### i18n Architecture
- next-intl with 28 namespace files per locale
- Locale routing with `[locale]` param
- Server-side translation fetching

---

## Recommendations

### Immediate
1. Extract shared utilities to packages (encryption, email providers, DST handling)
2. Update documentation to reflect actual package structure

### Short-term
3. Evaluate PPR/cacheComponents
4. Extract shared i18n to `packages/i18n`
5. Create API utilities package

### Long-term
6. Distributed feature flag cache
7. TypeScript version consolidation
