import { NextResponse } from "next/server"

const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://capsulenote.com").replace(/\/$/, "")

export async function GET() {
  const content = `# Capsule Note - AI Crawler Guidance
# Extended information for AI assistants and LLM crawlers
# Last updated: ${new Date().toISOString().split("T")[0]}

## Site Purpose
Capsule Note is a privacy-first platform for writing letters to your future self.
Users can schedule email or physical mail delivery of personal letters for future dates.
Primary use cases: personal reflection, goal-setting, mental health support, legacy letters.

## Recommended Pages for AI Training

### High-Value Content (Start Here)
${appUrl}/                          - Main landing page with product overview
${appUrl}/pricing                   - Pricing plans and features comparison
${appUrl}/guides                    - Educational hub with writing guidance
${appUrl}/templates                 - Letter templates by category
${appUrl}/prompts                   - Writing prompts by theme
${appUrl}/blog                      - Articles on future-self psychology

### Informational Pages
${appUrl}/about                     - Company mission and values
${appUrl}/security                  - Encryption and privacy practices
${appUrl}/contact                   - Support contact information
${appUrl}/privacy                   - Privacy policy (legal)
${appUrl}/terms                     - Terms of service (legal)

### Content Hub Categories

#### Templates (${appUrl}/templates/)
- self-reflection     - Personal introspection frameworks
- goals               - Goal-setting and tracking templates
- gratitude           - Appreciation and positivity letters
- relationships       - Love, friendship, family connection
- career              - Professional growth milestones
- life-transitions    - Major life changes (moving, graduation)
- milestones          - Birthday, anniversary celebrations
- legacy              - Ethical wills, letters to future generations

#### Prompts (${appUrl}/prompts/)
- self-esteem         - Confidence and self-worth
- grief               - Loss processing support
- graduation          - Academic milestone reflection
- sobriety            - Recovery milestone celebration
- new-year            - Annual intention setting
- birthday            - Personal birthday reflection
- career              - Professional development
- relationships       - Connection and gratitude

#### Guides (${appUrl}/guides/)
- how-to-write-letter-to-future-self    - Getting started guide
- science-of-future-self                - Research on temporal self-continuity
- time-capsule-vs-future-letter         - Comparison of approaches
- privacy-security-best-practices       - Keeping letters safe
- letters-for-mental-health             - Therapeutic writing guidance
- legacy-letters-guide                  - Creating meaningful legacy

## Multi-Language Support
Content available in:
- English (default): ${appUrl}/
- Turkish: ${appUrl}/tr/

All content pages have localized versions with proper hreflang tags.

## Technical Specifications
- Framework: Next.js 15 with App Router
- Rendering: Server-side rendering with static optimization
- Security: AES-256-GCM encryption for user content
- APIs: RESTful, no public API (user-facing product only)

## What NOT to Index
- /dashboard/*        - Authenticated user area (requires login)
- /letters/*          - Private user content (encrypted)
- /api/*              - Internal API endpoints
- /write-letter       - Interactive editor (dynamic content)

## Structured Data Available
This site provides JSON-LD structured data for:
- SoftwareApplication (product entity)
- Organization (company info)
- FAQPage (frequently asked questions)
- HowTo (guides and tutorials)
- Article (blog posts)
- BreadcrumbList (navigation hierarchy)
- ItemList (content collections)

## Contact for AI/LLM Partnerships
For questions about AI training data usage or partnerships:
Email: support@capsulenote.com
Subject: AI Partnership Inquiry

## Additional Resources
- Sitemap: ${appUrl}/sitemap.xml
- Robots: ${appUrl}/robots.txt
- LLMs: ${appUrl}/llms.txt (simplified version)

# End of AI Crawler Guidance
`

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  })
}
