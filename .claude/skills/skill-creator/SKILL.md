---
name: skill-creator
description: Meta skill for creating new Claude Code skills. Use when the user requests to create a new skill, add capabilities, or needs to research and document new technologies or patterns. Creates properly formatted SKILL.md files with YAML frontmatter, supporting files, and follows best practices.
allowed-tools: Read, Write, Glob, Grep, WebFetch, Bash
---

# Skill Creator - Meta Skill for Generating Claude Code Skills

This skill helps you create new Claude Code skills following official best practices.

## When to Use This Skill

Activate this skill when:
- User explicitly asks to "create a skill" or "make a new skill"
- You need to document a new technology, pattern, or workflow for future reuse
- You're researching something and want to capture knowledge as a skill
- You want to add new capabilities to Claude Code's toolkit

## Skill Creation Workflow

### 1. Research Phase

If creating a skill about external technology/library:
```bash
# Use WebFetch to gather official documentation
# Example: Creating a skill for Prisma best practices
```

**Key sources to check:**
- Official documentation websites
- GitHub repositories (README, docs folders)
- API references
- Best practices guides

### 2. Design Phase

**Required decisions:**
- **Name**: lowercase, hyphens only, descriptive (max 64 chars)
  - Good: `prisma-migrations`, `typescript-testing`, `react-performance`
  - Bad: `skill1`, `MySkill`, `do_stuff`

- **Description**: Clear trigger terms + what it does (max 1024 chars)
  - Include: Purpose, when to activate, key capabilities
  - Example: "Implements comprehensive Prisma database migrations with zero-downtime deployments. Use when creating migrations, modifying schema, or handling production database changes."

- **Allowed Tools**: Restrict if needed for safety
  - Read-only: `Read, Grep, Glob`
  - Full access: omit field (default)
  - Custom: `Read, Write, Bash, WebFetch`

### 3. Structure Planning

```
skill-name/
├── SKILL.md (required)
├── reference.md (optional - API docs, quick reference)
├── examples.md (optional - code examples)
├── templates/ (optional - boilerplate code)
│   └── template.tsx
└── scripts/ (optional - helper scripts)
    └── setup.sh
```

### 4. Content Creation

**SKILL.md Template:**

```markdown
---
name: your-skill-name
description: What this skill does and when to use it. Be specific about trigger terms.
allowed-tools: Read, Write, Grep, Glob, Bash
---

# Skill Name - Brief Title

One-line summary of what this skill does.

## When to Use This Skill

- Bullet point triggers
- Specific use cases
- Keywords that should activate this

## Prerequisites

- List required packages/setup
- Environment variables needed
- Dependencies

## Core Concepts

### Concept 1
Explanation with examples

### Concept 2
More detailed guidance

## Step-by-Step Workflow

### Step 1: Initial Setup
```bash
# Commands or code examples
```

**Explanation:** Why this step matters

### Step 2: Main Task
```typescript
// Code examples with inline comments
```

**Key points:**
- Important consideration 1
- Important consideration 2

## Common Patterns

### Pattern Name
When to use, how to implement, example code

## Error Handling

### Common Error 1
**Symptom:** What you'll see
**Cause:** Why it happens
**Fix:** How to resolve

## Best Practices

1. **Practice 1**: Explanation
2. **Practice 2**: Explanation

## Examples

### Example 1: Basic Usage
Complete working example with context

### Example 2: Advanced Usage
More complex scenario

## References

- [Official Docs](https://example.com)
- [GitHub](https://github.com/example)
- [Additional Resources]

## Checklist

Before completing the task, verify:
- [ ] Code compiles/runs
- [ ] Examples work
- [ ] Best practices followed
- [ ] Error handling implemented
```

### 5. Validation

**Before saving, check:**
- [ ] YAML frontmatter is valid (name, description present)
- [ ] Name matches directory name
- [ ] Description includes trigger terms
- [ ] Content is well-structured with clear headings
- [ ] Examples are tested and work
- [ ] References are accurate and accessible

**Test YAML:**
```bash
head -n 10 .claude/skills/skill-name/SKILL.md
```

Should show valid YAML between `---` markers.

### 6. Testing

**After creation:**
1. Restart Claude Code or reload skills
2. Test activation by using trigger terms in description
3. Verify skill executes correctly
4. Check that allowed-tools restrictions work as expected

## Skill Types and Templates

### Research & Documentation Skill

**Purpose:** Capture knowledge about external libraries/frameworks

**Template structure:**
- Core Concepts
- API Reference
- Usage Patterns
- Common Issues
- Best Practices

**Example names:** `prisma-best-practices`, `stripe-webhooks`, `nextjs-routing`

### Workflow Automation Skill

**Purpose:** Automate repetitive development tasks

**Template structure:**
- Prerequisites
- Step-by-step workflow
- Configuration options
- Troubleshooting

**Example names:** `database-migration`, `component-generator`, `test-setup`

### Code Review Skill

**Purpose:** Check code quality, patterns, best practices

**Template structure:**
- Review criteria
- Pattern checklist
- Anti-patterns to avoid
- Scoring/grading system

**Example names:** `security-audit`, `performance-review`, `accessibility-check`

### Integration Skill

**Purpose:** Help integrate third-party services

**Template structure:**
- Setup instructions
- Configuration
- Authentication
- Common operations
- Error handling

**Example names:** `clerk-integration`, `stripe-setup`, `resend-email`

## Advanced Features

### Including Supporting Files

Reference from SKILL.md:
```markdown
## API Reference

See [API Documentation](./reference.md) for complete details.

## Code Templates

Use the following template for new components:

```typescript:templates/component.tsx
// Template content
```
```

### Tool Restrictions

For read-only analysis skills:
```yaml
allowed-tools: Read, Grep, Glob
```

For documentation skills:
```yaml
allowed-tools: Read, WebFetch
```

For full automation:
```yaml
# Omit allowed-tools to grant all access
```

### Dynamic Content

Skills can include placeholders:
```markdown
## Project-Specific Setup

Check `.env.example` for required variables:
[Use Read tool to examine .env.example]
```

Claude will execute the bracketed instruction when skill activates.

## Best Practices for Skill Creation

### 1. Specific Descriptions
❌ Bad: "Helps with database stuff"
✅ Good: "Implements Prisma migrations with rollback safety, zero-downtime deploys, and production safeguards. Use when modifying database schema or creating migrations."

### 2. Clear Triggers
Include keywords users might say:
- "migration", "schema change", "database update"
- "deploy", "production", "rollback"

### 3. Focused Scope
One skill = one capability
- Don't combine "testing" + "deployment" + "monitoring"
- Create separate skills: `test-runner`, `deploy-workflow`, `monitoring-setup`

### 4. Actionable Content
Each section should guide Claude to take specific actions
- Include commands to run
- Provide code snippets to use
- List files to check

### 5. Error Prevention
Document common mistakes and how to avoid them
- Prerequisites clearly stated
- Validation steps included
- Rollback procedures documented

## Skill Maintenance

### When to Update
- Technology version changes (Next.js 14 → 15)
- Best practices evolve
- New patterns discovered
- User feedback indicates confusion

### Versioning Strategy
Include version info in content:
```markdown
## Version Information

This skill targets:
- Next.js 15.x
- React 19.x
- Prisma 5.x

Last updated: 2024-11-18
```

## Example: Creating a New Skill

**User request:** "Create a skill for implementing rate limiting with Upstash Redis"

**Steps:**

1. **Research:**
   - WebFetch Upstash docs
   - WebFetch @upstash/ratelimit docs
   - Check existing rate limiting implementations

2. **Design:**
   - Name: `upstash-rate-limiting`
   - Description: "Implements rate limiting using Upstash Redis and @upstash/ratelimit. Use when adding rate limits to API routes, protecting endpoints from abuse, or implementing tiered request quotas."
   - Tools: Default (all)

3. **Create structure:**
```bash
mkdir -p .claude/skills/upstash-rate-limiting
```

4. **Write SKILL.md:**
   - Prerequisites (Upstash account, env vars)
   - Core concepts (sliding window, fixed window, token bucket)
   - Implementation steps
   - Middleware setup
   - Testing procedures
   - Examples (basic, advanced, multi-tier)

5. **Validate:**
```bash
head -n 10 .claude/skills/upstash-rate-limiting/SKILL.md
# Check YAML is valid
```

6. **Test:**
   - Ask Claude: "Add rate limiting to the API routes"
   - Verify skill activates
   - Check implementation works

## Troubleshooting

### Skill Not Activating

**Check:**
- Description includes trigger terms user said
- Name is lowercase with hyphens only
- YAML frontmatter is valid
- File is named SKILL.md exactly
- Directory structure is correct

**Debug:**
```bash
# Verify YAML
head -n 10 .claude/skills/skill-name/SKILL.md

# Check file exists
ls -la .claude/skills/skill-name/

# Restart Claude Code
```

### Skill Activates Wrong Time

**Fix:**
- Make description more specific
- Add negative triggers: "Do not use for X"
- Restrict scope in description

### Tool Restrictions Not Working

**Check:**
- `allowed-tools` field in YAML frontmatter
- Tool names match exactly (case-sensitive)
- No typos in tool names

## Resources

- [Official Skills Documentation](https://code.claude.com/docs/en/skills)
- [Skill Examples Repository](https://github.com/anthropics/claude-code-skills)
- Project Skills: `.claude/skills/`

## Success Criteria

A well-created skill should:
- ✅ Activate reliably when relevant
- ✅ Provide clear, actionable guidance
- ✅ Include working examples
- ✅ Handle errors gracefully
- ✅ Follow current best practices
- ✅ Be maintainable and updatable
