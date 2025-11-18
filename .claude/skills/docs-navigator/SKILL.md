---
name: docs-navigator
description: Navigate and manage DearMe project documentation. Use when you need to find specific documentation, understand the documentation structure, or add new documentation. Provides a centralized index of all project docs with clear categorization.
allowed-tools: Read, Grep, Glob
---

# Documentation Navigator - DearMe Project

Centralized index and navigation system for all project documentation.

## When to Use This Skill

Activate this skill when:
- Looking for specific documentation (architecture, workflows, guides)
- Need to understand where to add new documentation
- Want overview of what documentation exists
- Updating or refactoring documentation
- User asks "where is the documentation for X?"

## Documentation Structure

### 📁 **Root Documentation** (`/`)
**Purpose**: High-level guides for developers and stakeholders

| File | Purpose | Audience |
|------|---------|----------|
| `README.md` | Project overview, quick start | New developers |
| `CLAUDE.md` | Claude Code integration guide (UPDATED ✨) | Claude AI |
| `ARCHITECTURE.md` | System architecture, tech stack | Architects, senior devs |
| `DEPLOYMENT.md` | Deployment procedures | DevOps |
| `DEVELOPMENT.md` | Development workflow guide | Developers |
| `CONTRIBUTING.md` | Contribution guidelines | Contributors |
| `ENTERPRISE_IMPROVEMENTS.md` | Latest enterprise upgrades & audit | Stakeholders |
| `PHASE_IMPLEMENTATION.md` | Feature tracking | Project managers |
| `CUSTOMER_JOURNEY_AND_WORKFLOWS.md` | User flows | Product team |
| `ERROR_HANDLING_IMPLEMENTATION_SUMMARY.md` | General error patterns | Developers |
| `ERROR_HANDLING_QUICK_REFERENCE.md` | Quick error handling guide | Developers |
| `SERVER_CLIENT_REFACTOR_SUMMARY.md` | Refactor notes | Developers |
| `MOTHERDUCK_STYLEGUIDE.md` | **Design system reference** | Designers, Frontend devs |

### 📁 **Implementation Docs** (`/docs/`)
**Purpose**: Deep-dive technical documentation and guides

**Current Files:**
- `ENCRYPTION_KEY_ROTATION.md` - Key rotation procedures (SOC2/PCI-DSS compliance)

**Should contain:**
- Security implementations
- Operational procedures
- Compliance guides
- Production runbooks

### 📁 **Feature Documentation** (`/claudedocs/`)
**Purpose**: Active feature references, quick guides, and design docs

**Implementation Summaries:**
- `GDPR_AND_AUDIT_IMPLEMENTATION_SUMMARY.md` - GDPR compliance

**Quick References:**
- `AUDIT_LOGGING_QUICK_REFERENCE.md` - Audit system quick start
- `USAGE_TRACKING_QUICK_REFERENCE.md` - Usage tracking guide
- `ENTITLEMENTS_QUICK_START.md` - Entitlements system

**Design Documents:**
- `STRIPE_INTEGRATION_DESIGN.md` - Stripe architecture
- `SIMPLIFIED_LETTER_EDITOR_DESIGN.md` - Editor design
- `MAIL_CREDIT_PURCHASE_FLOW.md` - Mail credits flow

**Analysis:**
- `STRIPE_PAYMENT_ANALYSIS.md` - Payment system analysis

**Testing Guides:**
- `STRIPE_WEBHOOK_TESTING_GUIDE.md` - How to test webhooks

**Note**: Historical phase reports moved to `.archive/phase-reports/`

### 📁 **Claude AI Context** (`.claude/`)
**Purpose**: Claude Code integration files

**Structure:**
```
.claude/
├── skills/              # Reusable skills
│   ├── clerk-auth.md
│   ├── nextjs-15-react-19-patterns.md (UPDATED ✨)
│   ├── skill-creator/SKILL.md
│   ├── docs-checker/SKILL.md
│   └── docs-navigator/SKILL.md (NEW 🆕)
├── agents/              # Specialized agents
│   └── style-extractor.md
├── docs/                # Implementation details
│   ├── ANONYMOUS_CHECKOUT_FINAL_STATUS.md
│   ├── ANONYMOUS_CHECKOUT_TESTING_GUIDE.md
│   ├── INNGEST_WORKER_ERROR_HANDLING.md
│   ├── LETTER_CONFIRMATION_EMAIL_DESIGN.md
│   ├── EMAIL_SENDER_CONFIGURATION_DESIGN.md
│   ├── SUBSCRIBE_FLOW_DIAGRAM.md
│   ├── SUBSCRIBE_IMPLEMENTATION_CHECKLIST.md
│   ├── WORKER_ERROR_HANDLING_IMPLEMENTATION_SUMMARY.md
│   ├── WORKER_ERROR_HANDLING_QUICK_REFERENCE.md
│   └── nextjs-15-react-19-error-boundaries-comprehensive-guide.md
├── documents/           # Reference materials
│   ├── capsule-note-branding.md
│   ├── email-configuration-api.md
│   └── email-sender-configuration.md
└── todo/                # Task tracking
```

### 📁 **Sandbox Docs** (`/sandbox/`)
**Purpose**: UI/UX explorations and prototypes

- `UX_BEATS_PLAN.md` - UX patterns
- `dashboard_checklist_coach.md` - Dashboard design
- `landing_editor_prototype.md` - Landing page
- `full_landing_page.md` - Complete landing
- `entitlement_alignment.md` - Entitlement flows
- `SANCTUARY_EDITOR_README.md` - Split-panel editor prototype (moved from root)
- `FLOW_EDITOR_README.md` - Progressive writing editor (moved from root)

### 📁 **Archive** (`.archive/`)
**Purpose**: Historical documentation and completed implementation records

**Structure:**
```
.archive/
├── phase-reports/       # Historical phase implementations
│   ├── PHASE_0_IMPLEMENTATION_REPORT.md
│   ├── PHASE_3_USAGE_TRACKING_IMPLEMENTATION_SUMMARY.md
│   ├── PHASE_3_WEBHOOK_ENHANCEMENTS.md
│   ├── PHASE_8_TESTING_IMPLEMENTATION_SUMMARY.md
│   ├── STRIPE_PHASE2_IMPLEMENTATION_REPORT.md
│   └── STRIPE_PHASE_1C_1D_IMPLEMENTATION.md
├── anonymous-checkout/  # Detailed anonymous checkout implementation
│   ├── ANONYMOUS_CHECKOUT_DESIGN.md
│   └── ANONYMOUS_CHECKOUT_IMPLEMENTATION_COMPLETE.md
└── COMPREHENSIVE_ANALYSIS.md  # Original comprehensive analysis (Nov 17, 2025)
```

**Note**: Archive is gitignored and for reference only. Active documentation lives in main folders.

## Documentation Categories

### 🏗️ **Architecture & Design**
- **Primary**: `ARCHITECTURE.md`
- **Design Docs**: `claudedocs/STRIPE_INTEGRATION_DESIGN.md`, `claudedocs/SIMPLIFIED_LETTER_EDITOR_DESIGN.md`
- **Tech Stack**: See CLAUDE.md → Tech Stack section

### 🔒 **Security & Compliance**
- **Encryption**: `docs/ENCRYPTION_KEY_ROTATION.md`
- **GDPR**: `claudedocs/GDPR_AND_AUDIT_IMPLEMENTATION_SUMMARY.md`
- **Audit Logging**: `claudedocs/AUDIT_LOGGING_QUICK_REFERENCE.md`
- **Key Security**: CLAUDE.md → Critical Security Architecture

### 💳 **Payments & Billing**
- **Stripe Integration**: `claudedocs/STRIPE_INTEGRATION_DESIGN.md`
- **Payment Analysis**: `claudedocs/STRIPE_PAYMENT_ANALYSIS.md`
- **Webhook Testing**: `claudedocs/STRIPE_WEBHOOK_TESTING_GUIDE.md`
- **Mail Credits**: `claudedocs/MAIL_CREDIT_PURCHASE_FLOW.md`

### 🔐 **Authentication**
- **Clerk Integration**: `.claude/skills/clerk-auth.md`
- **User Sync**: CLAUDE.md → Clerk User Sync section

### 📨 **Email & Notifications**
- **Email Config**: `.claude/documents/email-sender-configuration.md`
- **Provider Abstraction**: CLAUDE.md → Provider Abstraction Pattern
- **Confirmation Emails**: `.claude/docs/LETTER_CONFIRMATION_EMAIL_DESIGN.md`

### 🛠️ **Workers & Jobs**
- **Inngest Error Handling**: `.claude/docs/INNGEST_WORKER_ERROR_HANDLING.md`
- **Worker Quick Ref**: `claudedocs/WORKER_ERROR_HANDLING_QUICK_REFERENCE.md`
- **Error Patterns**: `claudedocs/ERROR_HANDLING_IMPLEMENTATION_SUMMARY.md`

### 🎨 **UI/UX & Frontend**
- **React 19 Patterns**: `.claude/skills/nextjs-15-react-19-patterns.md`
- **Compliance Report**: `apps/web/NEXTJS_15_COMPLIANCE_REPORT.md`
- **Branding**: `.claude/documents/capsule-note-branding.md`
- **Sandbox**: All files in `/sandbox/`

### 🎨 **Design System & Styling**
- **Style Guide**: `MOTHERDUCK_STYLEGUIDE.md` - Complete design system (colors, typography, spacing, components)
- **Implementation**: `apps/web/tailwind.config.ts` - Tailwind config using MotherDuck palette
- **Global Styles**: `apps/web/styles/globals.css` - Custom styles and editor theme
- **Style Extractor Agent**: `.claude/agents/style-extractor.md` - Extract styles from websites
- **How it works**: The MotherDuck design system was extracted and adapted for DearMe's brutalist aesthetic

### 🧪 **Testing**
- **Webhook Testing**: `claudedocs/STRIPE_WEBHOOK_TESTING_GUIDE.md`
- **Anonymous Checkout Tests**: `.claude/docs/ANONYMOUS_CHECKOUT_TESTING_GUIDE.md`

### 📊 **Usage & Entitlements**
- **Usage Tracking**: `claudedocs/USAGE_TRACKING_QUICK_REFERENCE.md`
- **Entitlements**: `claudedocs/ENTITLEMENTS_QUICK_START.md`
- **Implementation**: `claudedocs/PHASE_3_USAGE_TRACKING_IMPLEMENTATION_SUMMARY.md`

## Quick Navigation Guide

### Finding Documentation

**By Topic:**
```bash
# Architecture decisions
cat ARCHITECTURE.md

# Security procedures
cat docs/ENCRYPTION_KEY_ROTATION.md

# Payment integration
cat claudedocs/STRIPE_INTEGRATION_DESIGN.md

# React patterns
cat .claude/skills/nextjs-15-react-19-patterns.md

# Worker error handling
cat claudedocs/WORKER_ERROR_HANDLING_QUICK_REFERENCE.md
```

**By Type:**
```bash
# Quick references
ls claudedocs/*QUICK_REFERENCE.md

# Implementation summaries
ls claudedocs/*IMPLEMENTATION*.md

# Design documents
ls claudedocs/*DESIGN.md

# Skills
ls .claude/skills/*/SKILL.md .claude/skills/*.md
```

### Adding New Documentation

**Decision Tree:**

1. **Is it a Claude AI skill?**
   - YES → `.claude/skills/[name]/SKILL.md` or `.claude/skills/[name].md`
   - Use skill-creator skill to generate proper format

2. **Is it a quick reference guide?**
   - YES → `claudedocs/[FEATURE]_QUICK_REFERENCE.md`
   - Use consistent naming: `FEATURE_QUICK_REFERENCE.md`

3. **Is it an implementation summary?**
   - YES → `claudedocs/[FEATURE]_IMPLEMENTATION_SUMMARY.md`
   - Include: What was built, why, how, testing, status

4. **Is it a design document?**
   - YES → `claudedocs/[FEATURE]_DESIGN.md`
   - Include: Problem, solution, architecture, trade-offs

5. **Is it a security/compliance procedure?**
   - YES → `docs/[PROCEDURE_NAME].md`
   - Follow encryption key rotation format

6. **Is it high-level architecture?**
   - YES → Update `ARCHITECTURE.md` or create new root-level doc

7. **Is it UI/UX exploration?**
   - YES → `sandbox/[feature_name].md`

## Documentation Best Practices

### File Naming Conventions

**Use SCREAMING_SNAKE_CASE for:**
- Implementation summaries: `FEATURE_IMPLEMENTATION_SUMMARY.md`
- Quick references: `FEATURE_QUICK_REFERENCE.md`
- Design docs: `FEATURE_DESIGN.md`
- Analysis: `FEATURE_ANALYSIS.md`

**Use kebab-case for:**
- Reference documents: `capsule-note-branding.md`
- Configuration: `email-configuration-api.md`

**Use PascalCase for:**
- Root guides: `CLAUDE.md`, `README.md`, `ARCHITECTURE.md`

### Document Structure

**Every documentation file should have:**

1. **Title** (# heading)
2. **Purpose** (what this doc covers)
3. **Table of Contents** (if >100 lines)
4. **Main Content** (organized with ## headings)
5. **Examples** (code snippets, diagrams)
6. **References** (links to related docs)
7. **Last Updated** (date stamp)

### Maintenance

**Review quarterly:**
- Remove obsolete implementation summaries (>6 months old, feature complete)
- Update quick references with new patterns
- Consolidate duplicate information
- Archive historical docs that are no longer relevant

**When feature complete:**
- Move implementation details to quick reference
- Archive phase implementation docs
- Update ARCHITECTURE.md with final design

## Common Documentation Queries

### "How do I implement X?"
1. Check quick reference: `claudedocs/X_QUICK_REFERENCE.md`
2. Check design doc: `claudedocs/X_DESIGN.md`
3. Check implementation summary: `claudedocs/X_IMPLEMENTATION_SUMMARY.md`
4. Check CLAUDE.md for code patterns

### "What's the architecture of Y?"
1. Check ARCHITECTURE.md
2. Check design doc: `claudedocs/Y_DESIGN.md`
3. Check CLAUDE.md for technical details

### "How do I test Z?"
1. Check testing guide: `claudedocs/Z_TESTING_GUIDE.md`
2. Check implementation summary for testing section
3. Check CLAUDE.md → Testing section

### "What are the patterns for React/Next.js?"
1. Read `.claude/skills/nextjs-15-react-19-patterns.md`
2. Check compliance report: `apps/web/NEXTJS_15_COMPLIANCE_REPORT.md`
3. Review CLAUDE.md → Next.js 15 & React 19 Patterns section

## Documentation Ownership

| Category | Owner | Update Frequency |
|----------|-------|------------------|
| CLAUDE.md | AI Team | As needed |
| Architecture | Tech Lead | Quarterly |
| Security | Security Team | Per change |
| Implementation Summaries | Feature Dev | Post-deployment |
| Quick References | Engineering | Monthly |
| Skills | AI/DevEx Team | As needed |

## Troubleshooting

### "I can't find documentation for X"
1. Use this skill to check all categories
2. Search in Grep: `grep -r "X" *.md .claude/**/*.md`
3. Check if it's in code comments instead
4. May need to create it (follow decision tree above)

### "Documentation conflicts"
1. CLAUDE.md is source of truth for current state
2. Implementation summaries are historical
3. Quick references should reflect current best practices
4. Raise conflict for team discussion

### "Too much documentation!"
**Consolidation strategy:**
1. Merge similar quick references
2. Archive completed implementation summaries
3. Link instead of duplicate
4. Use this navigator as single source of truth

## Meta: About This Skill

**Purpose**: Centralized documentation navigation
**Created**: 2025-11-18
**Last Updated**: 2025-11-18
**Maintainer**: Claude AI + Engineering Team

**When to update this skill:**
- New documentation added
- Documentation reorganized
- Categories changed
- Navigation patterns evolve

---

**Quick Start**: Use this skill anytime you're looking for documentation. It provides a comprehensive map of where everything lives in the DearMe project.
