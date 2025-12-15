---
name: agent-creator
description: Create high-quality Claude Code subagents with optimal system prompts, tool configurations, and behavioral patterns. Use when creating new agents/subagents, improving existing agents, designing specialized AI assistants, or when the user mentions "agent", "subagent", "assistant", or wants to automate specific workflows with dedicated AI personalities.
---

# Agent Creator

Create specialized subagents for Claude Code that excel at specific tasks through focused expertise, appropriate tool access, and clear behavioral guidance.

## What Makes an Effective Agent

Effective agents share these characteristics:

1. **Single, clear purpose** - One well-defined responsibility
2. **Specific trigger description** - Claude knows exactly when to delegate
3. **Actionable system prompt** - Concrete instructions, not vague guidance
4. **Appropriate tool restrictions** - Only tools needed for the task
5. **Proactive behavior** - Acts without waiting for explicit requests

## Agent File Structure

Agents are Markdown files with YAML frontmatter stored in:
- **Project agents**: `.claude/agents/` (shared via git)
- **User agents**: `~/.claude/agents/` (personal)

```markdown
---
name: agent-name
description: Clear description of purpose. Use PROACTIVELY when [specific triggers].
tools: Tool1, Tool2, Tool3
model: sonnet
---

System prompt content goes here.
```

### Required Fields

| Field | Purpose | Guidelines |
|-------|---------|------------|
| `name` | Unique identifier | Lowercase letters and hyphens only |
| `description` | Triggers automatic delegation | Include "PROACTIVELY" or "MUST BE USED" for eager activation |

### Optional Fields

| Field | Purpose | Options |
|-------|---------|---------|
| `tools` | Restrict tool access | Comma-separated list; omit to inherit all tools |
| `model` | Model selection | `sonnet`, `opus`, `haiku`, or `inherit` |

## Agent Creation Process

### Step 1: Define the Purpose

Answer these questions:
1. What specific task does this agent handle?
2. When should Claude automatically delegate to it?
3. What tools are required vs. unnecessary?
4. What distinguishes success from failure?

### Step 2: Write the Description

The description determines when Claude uses the agent. Include:
- **What** the agent does
- **When** to use it (specific triggers)
- **Proactive indicators** ("Use PROACTIVELY", "MUST BE USED")

**Weak description:**
```yaml
description: Helps with code
```

**Strong description:**
```yaml
description: Expert code reviewer. Use PROACTIVELY after any code changes to review for quality, security, and maintainability. MUST BE USED before committing changes.
```

### Step 3: Select Tools

Match tools to actual needs. See [references/tools-reference.md](references/tools-reference.md) for complete list.

**Common tool sets by agent type:**

| Agent Type | Recommended Tools |
|------------|-------------------|
| Read-only analysis | Read, Grep, Glob |
| Code modification | Read, Edit, Write, Bash, Grep, Glob |
| Testing | Read, Bash, Grep, Glob |
| Research | Read, Grep, Glob, WebSearch, WebFetch |
| Full access | Omit `tools` field |

### Step 4: Craft the System Prompt

Effective system prompts follow this structure:

```markdown
You are a [specific role] specializing in [domain].

When invoked:
1. [First action - be specific]
2. [Second action]
3. [Third action]

[Domain-specific guidance]:
- [Concrete instruction]
- [Concrete instruction]
- [Concrete instruction]

For each [task type], provide:
- [Required output element]
- [Required output element]
- [Required output element]

[Quality bar or success criteria]
```

## System Prompt Principles

### Be Specific, Not Generic

**Generic (avoid):**
```
Review the code and provide feedback.
```

**Specific (prefer):**
```
When invoked:
1. Run `git diff --staged` to see changes
2. Analyze each file for security vulnerabilities
3. Check error handling completeness
4. Verify edge case coverage

Provide feedback organized by severity:
- CRITICAL: Security issues, data loss risks
- WARNING: Logic errors, missing validations
- SUGGESTION: Style improvements, refactoring opportunities
```

### Include Concrete Actions

Define exactly what the agent should do first:

```markdown
When invoked:
1. Run `git status` to identify changed files
2. Read each modified file
3. Check test coverage with `npm test -- --coverage`
4. Generate report in structured format
```

### Define Success Criteria

End with clear quality standards:

```markdown
Only mark review complete when:
- All critical issues are addressed
- Test coverage exceeds 80%
- No security vulnerabilities remain
- Code follows project conventions
```

### Use Checklists for Complex Tasks

```markdown
Review checklist:
- [ ] Input validation implemented
- [ ] Error handling complete
- [ ] No hardcoded credentials
- [ ] Logging appropriate
- [ ] Tests cover edge cases
```

## Agent Patterns

For detailed patterns for different agent types, see [references/agent-patterns.md](references/agent-patterns.md).

Common patterns:
- **Reviewer agents** - Analyze without modifying
- **Builder agents** - Create new artifacts
- **Fixer agents** - Diagnose and repair issues
- **Research agents** - Gather and synthesize information
- **Workflow agents** - Orchestrate multi-step processes

## Complete Examples

See [references/examples.md](references/examples.md) for production-ready agent definitions.

## Validation Checklist

Before deploying an agent, verify:

- [ ] Name uses only lowercase letters and hyphens
- [ ] Description clearly states WHEN to use the agent
- [ ] Description includes proactive indicators if eager activation desired
- [ ] Tools list includes only necessary tools
- [ ] System prompt starts with clear role definition
- [ ] System prompt includes specific first actions
- [ ] System prompt defines success criteria
- [ ] Agent has been tested with representative tasks

## Common Mistakes to Avoid

1. **Vague descriptions** - Be specific about triggers
2. **Overly broad tools** - Restrict to what's needed
3. **Generic prompts** - Include concrete actions
4. **Missing first steps** - Define immediate actions
5. **No success criteria** - State what "done" looks like
6. **Overlapping agents** - Each agent should have unique purpose

## Using the Init Script

To create a new agent with proper structure:

```bash
python scripts/init_agent.py <agent-name> --path <directory>
```

Example:
```bash
python scripts/init_agent.py code-reviewer --path .claude/agents
```

This creates a properly structured agent file with TODO placeholders.

## Agent Organization Tips

### For Teams (Project Agents)
- Store in `.claude/agents/` for git tracking
- Use clear naming conventions
- Document agent purposes in team wiki
- Review agents during code review

### For Personal Use (User Agents)
- Store in `~/.claude/agents/`
- Create agents for repeated personal workflows
- Iterate based on actual usage