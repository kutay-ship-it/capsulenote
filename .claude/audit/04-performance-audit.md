# Performance Audit Report

## Summary
- **Critical**: 4 issues
- **High**: 6 issues
- **Medium**: 5 issues
- **Low**: 3 issues

---

## CRITICAL Issues

### 1. Three.js Bloat (473 KB chunk)
**Impact**: Major FCP/LCP degradation
**Root Cause**: @react-three/drei, @react-three/fiber, three.js loaded globally
**Fix**: Dynamic import Three.js components

### 2. Framer Motion Bundle Impact (~60 KB gzipped)
Used in timeline, animations, unlock ceremonies
**Fix**: Code-split animation-heavy components

### 3. Large Main Chunk (432 KB)
**Fix**: Enable React Compiler optimization, review shared components

### 4. No Dynamic Imports Detected
0 files using `dynamic()` or `lazy()`
**Fix**: Add dynamic imports for heavy components

---

## DATABASE PERFORMANCE - CRITICAL

### 5. N+1 Query in `getLettersWithPreview()`
**File**: `apps/web/server/actions/redesign-dashboard.ts:287-317`
- 100 letters = 100 sequential crypto operations
- Worst case: 400 decryptions on page load
**Fix**: Batch decrypt or cache previews

### 6. Missing Select Optimization in `getLetter()`
**File**: `apps/web/server/actions/letters.ts:624-642`
Over-fetching encrypted mail content (sealedCiphertext)
**Fix**: Use `select` to exclude large fields

---

## HIGH Issues

### 7. No Query Result Caching
Only feature flags cached (60s)
**Fix**: Implement `unstable_cache` for lists

### 8. Entitlements Cache Stampede Risk
5-minute TTL with no stale-while-revalidate
**Fix**: Add background refresh

### 9. Missing Next.js Cache Headers
Pages use `force-dynamic` (no cache)
**Fix**: Use `revalidate` for semi-static pages

### 10. Redis Rate Limiting Overhead
Every action hits Redis (+5-10ms per request)
**Optimization**: Batch checks or use Edge Middleware

### 11. Limited React Optimization
Only 48 files use useMemo/useCallback/React.memo (of 200+ components)
**Fix**: Add memoization to list components

### 12. Missing Virtualization for Lists
Letters list renders ALL items in DOM
**Fix**: Use react-window or @tanstack/react-virtual

---

## Impact Estimates

### Critical Fixes
- Bundle Size: -500 KB gzipped (~40% reduction)
- FCP: -1.5s on 3G
- LCP: -2s on slow connections
- Database Load: -75% queries on letters page

### High Priority Fixes
- Cache Hit Rate: 60-80% for repeat visits
- Server Response Time: -200ms average

---

## Implementation Order

### Phase 1: Quick Wins (1-2 days)
1. Dynamic import Three.js
2. Add `select` optimization
3. Disable source maps in production

### Phase 2: Caching Layer (3-5 days)
4. Implement unstable_cache
5. Add stale-while-revalidate
6. Convert to `revalidate`

### Phase 3: Database Optimization (1 week)
7. Fix N+1 decryption
8. Consolidate parallel queries
9. Store preview text separately

### Phase 4: Component Performance (1 week)
10. Add virtualization
11. Add React.memo
12. Code-split Framer Motion
