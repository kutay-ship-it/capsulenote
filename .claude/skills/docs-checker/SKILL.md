---
name: docs-checker
description: Fetches and analyzes official documentation for technologies, libraries, and frameworks. Use when implementing features, debugging issues, or verifying best practices against official sources. Checks Next.js, React, Prisma, Stripe, Clerk, Inngest, and other technology documentation.
allowed-tools: WebFetch, Read, Grep, Glob
---

# Documentation Checker - Official Docs Research Skill

Automatically fetches and analyzes official documentation for accurate, up-to-date implementation guidance.

## When to Use This Skill

Activate this skill when:
- Implementing a new feature with external library/framework
- Debugging an issue and need to verify correct usage
- User asks to "check the docs" or "refer to official documentation"
- Migrating to a new version of a technology
- Validating current implementation against best practices
- User says "ultrathink" or requests thorough research

## Supported Technologies

### Primary Stack (DearMe Project)

| Technology | Documentation URL | Focus Areas |
|------------|------------------|-------------|
| Next.js 15 | https://nextjs.org/docs | App Router, Server Components, Server Actions, Routing |
| React 19 | https://react.dev | Hooks, Components, Concurrent Features |
| Prisma 5 | https://www.prisma.io/docs | Schema, Migrations, Client API, Best Practices |
| TypeScript | https://www.typescriptlang.org/docs | Type System, Advanced Types, Config |
| Clerk | https://clerk.com/docs | Authentication, Webhooks, User Management |
| Stripe | https://stripe.com/docs | Billing, Subscriptions, Webhooks, Checkout |
| Inngest | https://www.inngest.com/docs | Durable Functions, Workflows, Step Functions |
| Resend | https://resend.com/docs | Email API, Templates, Domains |
| Upstash Redis | https://upstash.com/docs | Redis, Rate Limiting, Caching |
| Tailwind CSS | https://tailwindcss.com/docs | Utility Classes, Configuration, Plugins |
| shadcn/ui | https://ui.shadcn.com | Components, Installation, Theming |
| Zod | https://zod.dev | Schema Validation, Type Inference |

### Extended Technologies

| Technology | Documentation URL |
|------------|------------------|
| Vercel | https://vercel.com/docs |
| PostgreSQL | https://www.postgresql.org/docs |
| Neon | https://neon.tech/docs |
| Postmark | https://postmarkapp.com/developer |
| Lob | https://docs.lob.com |
| React Email | https://react.email/docs |
| Vitest | https://vitest.dev |
| Playwright | https://playwright.dev/docs |
| Sentry | https://docs.sentry.io |
| PostHog | https://posthog.com/docs |

## Research Workflow

### Step 1: Identify Documentation Needed

**Questions to answer:**
- What specific feature/API are you implementing?
- What version are you using?
- Are there migration guides for version changes?
- What are the official examples?

### Step 2: Fetch Official Documentation

```typescript
// Use WebFetch to get documentation
// Example: Checking Prisma migration best practices
```

**URL Construction:**
- Next.js: `https://nextjs.org/docs/[section]/[page]`
- Prisma: `https://www.prisma.io/docs/[section]/[page]`
- Stripe: `https://stripe.com/docs/[section]/[page]`

**Key sections to check:**
- Getting Started / Quickstart
- API Reference
- Best Practices
- Migration Guides (for version changes)
- Examples / Recipes
- Troubleshooting / FAQ

### Step 3: Extract Relevant Information

**Look for:**
- ✅ Official recommended patterns
- ✅ Code examples that work
- ✅ Configuration options
- ✅ Breaking changes (in changelogs)
- ✅ Security considerations
- ✅ Performance best practices
- ⚠️ Deprecation warnings
- ❌ Known issues or limitations

### Step 4: Cross-Reference with Current Implementation

**Compare:**
1. Current code vs. official examples
2. Configuration vs. recommended settings
3. Dependencies vs. required versions
4. Patterns vs. best practices

**Document gaps:**
- Missing configurations
- Outdated patterns
- Deprecated APIs in use
- Security vulnerabilities

### Step 5: Provide Recommendations

**Format:**
```markdown
## Documentation Analysis: [Technology/Feature]

### Current Implementation
- [Describe what exists]
- [List patterns in use]

### Official Recommendations
- [What docs say should be done]
- [Best practices]
- [Security considerations]

### Gaps Identified
1. **Gap 1**: Current vs. Recommended
   - **Impact**: [Low/Medium/High]
   - **Fix**: [Specific steps]

2. **Gap 2**: ...

### Migration Plan
1. [Step-by-step plan to align with docs]
2. [Testing requirements]
3. [Rollback strategy]
```

## Common Documentation Queries

### Next.js Version Migration

**Research points:**
- Breaking changes in upgrade guide
- New features and capabilities
- Deprecated APIs
- Codemods available
- Performance improvements

**URLs to check:**
```
https://nextjs.org/docs/app/building-your-application/upgrading
https://nextjs.org/docs/app/building-your-application/routing
https://nextjs.org/docs/app/api-reference/next-config-js
```

### Prisma Migration Best Practices

**Research points:**
- Migration workflow (dev vs. prod)
- Schema best practices
- Index optimization
- Connection pooling
- Type safety patterns

**URLs to check:**
```
https://www.prisma.io/docs/orm/prisma-migrate
https://www.prisma.io/docs/orm/prisma-client/queries/crud
https://www.prisma.io/docs/orm/prisma-schema/data-model
```

### Stripe Subscription Setup

**Research points:**
- Checkout Session API
- Webhook event types
- Subscription lifecycle
- Idempotency
- Testing in development

**URLs to check:**
```
https://stripe.com/docs/billing/subscriptions/overview
https://stripe.com/docs/api/checkout/sessions
https://stripe.com/docs/webhooks
```

### Clerk Authentication Integration

**Research points:**
- Next.js App Router integration
- Webhook configuration
- User metadata
- Session management
- Multi-factor authentication

**URLs to check:**
```
https://clerk.com/docs/quickstarts/nextjs
https://clerk.com/docs/integrations/webhooks/overview
https://clerk.com/docs/users/metadata
```

### Inngest Durable Workflows

**Research points:**
- Function configuration
- Step functions API
- Sleep/delay patterns
- Error handling
- Retries and idempotency

**URLs to check:**
```
https://www.inngest.com/docs/learn/inngest-functions
https://www.inngest.com/docs/reference/functions/step-run
https://www.inngest.com/docs/guides/error-retries
```

## Advanced Research Techniques

### Finding Migration Guides

**Search pattern:**
```
https://[docs-url]/[upgrading|migration|changelog]
```

**Example:**
- Next.js: `/docs/app/building-your-application/upgrading`
- Prisma: `/docs/guides/upgrade-guides`
- React: `/blog/[year]/[month]/[day]/[post]` (for major releases)

### API Reference Deep Dive

**When to use:** Implementing specific function/method

**Pattern:**
1. Find function in API reference
2. Check all parameters and return types
3. Review examples
4. Check related functions
5. Look for TypeScript types

**Example: Prisma Client API**
```
https://www.prisma.io/docs/orm/reference/prisma-client-reference
```

### Security & Best Practices

**Check official security guides:**
- Next.js: Authentication, CSRF, XSS prevention
- Prisma: SQL injection prevention, connection security
- Stripe: Webhook verification, idempotency
- Clerk: Session security, token handling

**Pattern:**
```
https://[docs-url]/[security|best-practices]
```

### Breaking Changes Research

**Before any version upgrade:**

1. Check CHANGELOG or release notes
2. Search for "breaking changes"
3. Look for migration guides
4. Check if codemods exist
5. Review deprecated APIs list

**Example:**
```
https://github.com/vercel/next.js/releases
https://github.com/prisma/prisma/releases
```

## Error Resolution Workflow

### When You Encounter an Error

**Step 1: Search Official Docs**
```
https://[docs-url]/troubleshooting
https://[docs-url]/faq
```

**Step 2: Check GitHub Issues**
```
https://github.com/[org]/[repo]/issues?q=is%3Aissue+[error-message]
```

**Step 3: Review Discussions**
```
https://github.com/[org]/[repo]/discussions
```

**Step 4: Check Community Resources**
- Discord servers
- Stack Overflow
- Reddit communities

### Common Error Patterns

**Prisma Errors:**
```
P2002: Unique constraint violation
P2025: Record not found
P1001: Connection error
```
Docs: `https://www.prisma.io/docs/orm/reference/error-reference`

**Next.js Errors:**
```
NEXT_NOT_FOUND
NEXT_REDIRECT
Dynamic server usage errors
```
Docs: `https://nextjs.org/docs/messages/[error-code]`

**Stripe Errors:**
```
card_declined
invalid_request_error
authentication_required
```
Docs: `https://stripe.com/docs/error-codes`

## Version Compatibility Checking

### Dependency Matrix

**Check compatibility between:**
- Next.js ↔ React version
- Prisma ↔ PostgreSQL version
- Node.js ↔ Package versions
- TypeScript ↔ Library types

**Resources:**
- Next.js: Supports React 18.2+ and 19 RC
- Prisma: PostgreSQL 9.6+ (check specific version docs)
- Node.js: Check `engines` field in package.json

### Peer Dependency Research

**When adding new packages:**

1. Check package's `peerDependencies`
2. Verify compatibility with existing versions
3. Look for known issues with version combinations
4. Check if version constraints can be satisfied

## Documentation Quality Assessment

### Red Flags in Docs

⚠️ **Warning signs:**
- Last updated > 1 year ago
- No version specified
- Community docs (not official)
- Incomplete examples
- Deprecated without alternative

### Trusted Sources Priority

**Priority order:**
1. Official documentation website
2. Official GitHub repository (README, docs/)
3. Official blog/changelog
4. Verified community resources
5. Stack Overflow (with caution)

## Templates

### Documentation Analysis Report

```markdown
# Documentation Analysis: [Technology/Feature]

**Date:** [Date]
**Technology:** [Name] v[Version]
**Official Docs:** [URL]

## Current Implementation Status

### What We Have
- [List current implementation]
- [Dependencies in use]
- [Configuration]

### What Docs Recommend

#### Core Patterns
- [Pattern 1]: [Description]
- [Pattern 2]: [Description]

#### Best Practices
1. [Practice 1]
2. [Practice 2]

#### Security Considerations
- [Security point 1]
- [Security point 2]

## Gap Analysis

### Critical Gaps (Fix Immediately)
| Gap | Impact | Current | Recommended | Fix Effort |
|-----|--------|---------|-------------|------------|
| [Gap 1] | High | [What we do] | [What docs say] | [Hours] |

### Non-Critical Gaps (Future)
| Gap | Impact | Priority |
|-----|--------|----------|
| [Gap 1] | Low | P2 |

## Recommendations

### Immediate Actions
1. [Action 1]: [Reasoning]
2. [Action 2]: [Reasoning]

### Migration Plan
```typescript
// Step 1: [Description]
[Code example]

// Step 2: [Description]
[Code example]
```

### Testing Strategy
- [ ] Unit tests for [X]
- [ ] Integration tests for [Y]
- [ ] Manual verification of [Z]

## References
- [Doc URL 1]
- [Doc URL 2]
- [GitHub Issue/Discussion if relevant]
```

### Quick Reference Card

```markdown
# [Technology] Quick Reference

## Common Tasks

### Task 1: [Description]
```[language]
[Code snippet]
```
**Docs:** [URL]

### Task 2: [Description]
```[language]
[Code snippet]
```
**Docs:** [URL]

## Configuration

**Required:**
- `[config1]`: [Description]
- `[config2]`: [Description]

**Optional:**
- `[config3]`: [Description] (default: [value])

## Gotchas

⚠️ **Common Mistake 1**
- **Problem:** [What happens]
- **Solution:** [How to fix]
- **Docs:** [URL]

⚠️ **Common Mistake 2**
- **Problem:** [What happens]
- **Solution:** [How to fix]
- **Docs:** [URL]

## Version Compatibility

| This Project | Requires |
|--------------|----------|
| Next.js 15.x | React 18.2+ or 19 RC |
| Prisma 5.x | Node 18.17+ |
| [etc] | [etc] |
```

## Best Practices for Documentation Research

### 1. Always Check Versions

❌ **Bad:** Use examples from any version
✅ **Good:** Verify example matches your installed version

```bash
# Check installed versions
pnpm list next react prisma
```

### 2. Prefer Official Examples

❌ **Bad:** Use first Google result
✅ **Good:** Go to official docs → examples/recipes

### 3. Verify Freshness

❌ **Bad:** Use tutorial from 2020
✅ **Good:** Check "Last updated" date, prefer recent

### 4. Cross-Reference

❌ **Bad:** Implement from one source
✅ **Good:** Check docs + GitHub + changelog

### 5. Security First

❌ **Bad:** Skip security sections
✅ **Good:** Read security docs thoroughly for auth/payments

## Troubleshooting Documentation Research

### Docs Site Is Down

**Fallback strategy:**
1. Check GitHub repository docs/ folder
2. Use web archive (archive.org)
3. Check npm package README
4. Look for official API reference in repository

### Can't Find Specific Feature

**Research strategy:**
1. Search docs site (use site search)
2. Check API reference alphabetically
3. Look in examples/recipes
4. Search GitHub code for usage
5. Check GitHub issues/discussions

### Conflicting Information

**Resolution process:**
1. Check which source is more recent
2. Verify with official changelog
3. Test both approaches locally
4. Choose more actively maintained pattern

## Success Criteria

Effective documentation research should:
- ✅ Find official, current documentation
- ✅ Identify best practices and patterns
- ✅ Spot security considerations
- ✅ Discover breaking changes before they break
- ✅ Provide actionable implementation guidance
- ✅ Include working code examples
- ✅ Consider version compatibility
- ✅ Document gaps and migration paths

## Resources

- [Claude Code Skills Docs](https://code.claude.com/docs/en/skills)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [React Docs](https://react.dev)
- [MDN Web Docs](https://developer.mozilla.org)
