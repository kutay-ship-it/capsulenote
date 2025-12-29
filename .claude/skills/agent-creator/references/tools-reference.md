# Tools Reference for Agents

Complete reference of tools available for Claude Code subagents. Use this to select appropriate tools for agent configurations.

## Core Tools

### Read
Read file contents from the filesystem.

**Use for**: Examining code, configuration files, documentation, any file content analysis.

**Example operations**:
- Reading source code files
- Examining configuration
- Reviewing documentation

### Write
Create new files or completely replace file contents.

**Use for**: Creating new files, generating output files, writing reports.

**Note**: Overwrites entire file content. For modifications, use Edit.

### Edit
Modify existing files with surgical precision.

**Use for**: Code changes, configuration updates, fixing bugs, refactoring.

**Note**: Preferred over Write for modifications to preserve file structure.

### Glob
Find files by pattern matching.

**Use for**: Discovering files, locating related code, finding files by extension.

**Example patterns**:
- `**/*.py` - All Python files
- `src/**/*.ts` - TypeScript files in src
- `**/test_*.py` - Test files

### Grep
Search file contents with regex patterns.

**Use for**: Finding code patterns, locating function usage, searching for text.

**Example searches**:
- Function definitions
- Import statements
- TODO comments
- Specific strings

### Bash
Execute shell commands.

**Use for**: Running tests, git operations, build commands, system operations.

**Common uses**:
- `git diff` - See changes
- `npm test` - Run tests
- `ls -la` - List files
- Build and compile commands

## Web Tools

### WebSearch
Search the web for information.

**Use for**: Research, finding documentation, current information lookup.

**Best for**:
- Technical documentation
- Best practices research
- Error message lookup
- Library comparison

### WebFetch
Retrieve content from specific URLs.

**Use for**: Downloading documentation, fetching API specs, reading web content.

**Best for**:
- Official documentation pages
- API reference pages
- GitHub README files

## MCP Tools

If MCP (Model Context Protocol) servers are configured, their tools are also available. Common MCP tools include:

- Database query tools
- API integration tools
- Custom service tools

Check `/mcp` or `/settings` for configured MCP servers and their tools.

---

## Tool Sets by Agent Type

### Read-Only Agents
For analysis without modification.

```yaml
tools: Read, Grep, Glob
```

**Best for**: Code review, security audit, architecture analysis, documentation review.

### Code Modification Agents
For making changes to code.

```yaml
tools: Read, Edit, Write, Bash, Grep, Glob
```

**Best for**: Bug fixing, refactoring, feature implementation, test creation.

### Research Agents
For gathering and synthesizing information.

```yaml
tools: Read, Grep, Glob, WebSearch, WebFetch
```

**Best for**: Documentation, research, learning, comparison tasks.

### Testing Agents
For test creation and execution.

```yaml
tools: Read, Write, Edit, Bash, Grep, Glob
```

**Best for**: Test writing, test running, coverage analysis.

### Build/Deploy Agents
For build and deployment operations.

```yaml
tools: Read, Bash, Grep, Glob
```

**Best for**: CI/CD operations, build processes, deployment tasks.

### Full Access Agents
For unrestricted operation (omit tools field).

```yaml
# No tools field = inherit all tools
```

**Best for**: Complex workflows, orchestration, general-purpose agents.

---

## Tool Selection Guidelines

### Principle of Least Privilege
Grant only the tools an agent actually needs.

**Benefits**:
- Prevents unintended modifications
- Makes agent purpose clearer
- Improves security
- Focuses agent behavior

### Read vs Write Access

**Read-only** (Read, Grep, Glob):
- Analysis tasks
- Review tasks
- Research tasks

**Write access** (+ Edit, Write, Bash):
- Creation tasks
- Modification tasks
- Automation tasks

### When to Include Bash

Include Bash when agent needs to:
- Run tests
- Execute build commands
- Use git operations
- Install dependencies
- Run scripts

Exclude Bash when:
- Pure analysis tasks
- Risk of unintended side effects
- Read-only review needed

### Web Tools Consideration

Include web tools when:
- Research is part of the task
- External documentation needed
- Current information required

Exclude web tools when:
- Working only with local code
- Speed is critical
- Offline operation needed

---

## Tool Combinations

### Minimal Read-Only
```yaml
tools: Read, Grep, Glob
```
For safe analysis without any modifications.

### Code Analysis
```yaml
tools: Read, Grep, Glob, Bash
```
For analysis with ability to run tests/commands.

### Code Development
```yaml
tools: Read, Edit, Write, Bash, Grep, Glob
```
For full development capability.

### Research and Analysis
```yaml
tools: Read, Grep, Glob, WebSearch, WebFetch
```
For research-heavy tasks.

### Documentation
```yaml
tools: Read, Write, Edit, Grep, Glob
```
For creating and updating documentation.

---

## Notes

### Inheriting All Tools
If you omit the `tools` field entirely, the agent inherits all tools available to the main Claude Code session, including any MCP tools.

```yaml
---
name: full-access-agent
description: General purpose agent with full tool access.
# No tools field = full access
---
```

### Tool Availability
Tool availability depends on:
1. Claude Code permissions
2. MCP server configuration
3. System capabilities

### Checking Available Tools
Use `/agents` command to see all available tools when configuring an agent through the interactive interface.