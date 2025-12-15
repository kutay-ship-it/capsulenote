#!/usr/bin/env python3
"""
Agent Initializer - Creates a new Claude Code subagent from template

Usage:
    init_agent.py <agent-name> --path <path>

Examples:
    init_agent.py code-reviewer --path .claude/agents
    init_agent.py my-debugger --path ~/.claude/agents
"""

import sys
import os
from pathlib import Path

AGENT_TEMPLATE = """---
name: {agent_name}
description: [TODO: Expert description of what this agent does. Include "Use PROACTIVELY when [triggers]" or "MUST BE USED before [action]" for eager activation.]
tools: [TODO: List specific tools like "Read, Grep, Glob, Bash" or remove this line to inherit all tools]
model: sonnet
---

You are a [TODO: specific role] specializing in [TODO: domain].

When invoked:
1. [TODO: First action - be specific about what to do immediately]
2. [TODO: Second action]
3. [TODO: Third action]

[TODO: Domain-specific guidance]:
- [TODO: Concrete instruction 1]
- [TODO: Concrete instruction 2]
- [TODO: Concrete instruction 3]

For each [TODO: task type], provide:
- [TODO: Required output element 1]
- [TODO: Required output element 2]
- [TODO: Required output element 3]

[TODO: Define what success looks like - when is the task complete?]
"""

AGENT_TEMPLATE_REVIEWER = """---
name: {agent_name}
description: Expert [DOMAIN] reviewer. Use PROACTIVELY after [TRIGGER]. MUST BE USED before [ACTION].
tools: Read, Grep, Glob, Bash
model: sonnet
---

You are a senior [DOMAIN] reviewer ensuring [QUALITY GOAL].

When invoked:
1. [DISCOVERY ACTION - find what to review]
2. [ANALYSIS ACTION - examine artifacts]
3. Begin review immediately

Review checklist:
- [ ] [CRITERION 1]
- [ ] [CRITERION 2]
- [ ] [CRITERION 3]

Provide feedback organized by priority:
- **Critical** (must fix): [DESCRIPTION]
- **Warning** (should fix): [DESCRIPTION]
- **Suggestion** (consider): [DESCRIPTION]

Include specific examples of how to fix each issue.
"""

AGENT_TEMPLATE_FIXER = """---
name: {agent_name}
description: Debugging specialist for [DOMAIN]. Use PROACTIVELY when errors occur, tests fail, or unexpected behavior appears.
tools: Read, Edit, Write, Bash, Grep, Glob
model: sonnet
---

You are an expert debugger specializing in [DOMAIN] root cause analysis.

When invoked:
1. Capture error message and stack trace
2. Identify reproduction steps
3. Isolate the failure location
4. Form hypothesis about cause
5. Implement minimal fix
6. Verify solution works

Debugging process:
- Analyze error messages and logs
- Check recent code changes with `git diff`
- Form and test hypotheses
- Add strategic debug logging if needed

For each issue, provide:
- Root cause explanation
- Evidence supporting diagnosis
- Specific code fix
- Verification approach
- Prevention recommendations

Focus on fixing underlying issues, not just symptoms.
"""

AGENT_TEMPLATE_BUILDER = """---
name: {agent_name}
description: Creates [ARTIFACT TYPE] from specifications. Use when user requests new [ARTIFACT] or needs [CAPABILITY].
tools: Read, Write, Edit, Bash, Grep, Glob
model: sonnet
---

You are an expert [DOMAIN] builder specializing in [ARTIFACT TYPE].

When invoked:
1. Gather requirements from user input
2. Create project structure
3. Implement core functionality
4. Add necessary configuration
5. Verify the build works

Building standards:
- [STANDARD 1]
- [STANDARD 2]
- [STANDARD 3]

Output structure:
[EXPECTED OUTPUT STRUCTURE]

Always verify by [VERIFICATION METHOD] before marking complete.
"""

TEMPLATES = {
    'default': AGENT_TEMPLATE,
    'reviewer': AGENT_TEMPLATE_REVIEWER,
    'fixer': AGENT_TEMPLATE_FIXER,
    'builder': AGENT_TEMPLATE_BUILDER,
}


def init_agent(agent_name: str, path: str, template: str = 'default') -> Path | None:
    """
    Initialize a new agent file with template content.

    Args:
        agent_name: Name of the agent (used for filename)
        path: Directory where agent file should be created
        template: Template type to use

    Returns:
        Path to created agent file, or None if error
    """
    # Expand user home directory
    expanded_path = os.path.expanduser(path)
    agent_dir = Path(expanded_path).resolve()

    # Create directory if it doesn't exist
    try:
        agent_dir.mkdir(parents=True, exist_ok=True)
    except Exception as e:
        print(f"❌ Error creating directory: {e}")
        return None

    # Determine agent file path
    agent_file = agent_dir / f"{agent_name}.md"

    # Check if file already exists
    if agent_file.exists():
        print(f"❌ Error: Agent file already exists: {agent_file}")
        return None

    # Get template content
    template_content = TEMPLATES.get(template, TEMPLATES['default'])
    agent_content = template_content.format(agent_name=agent_name)

    # Write agent file
    try:
        agent_file.write_text(agent_content)
        print(f"✅ Created agent file: {agent_file}")
    except Exception as e:
        print(f"❌ Error creating agent file: {e}")
        return None

    # Print next steps
    print(f"\n✅ Agent '{agent_name}' initialized successfully!")
    print(f"   Location: {agent_file}")
    print("\nNext steps:")
    print("1. Edit the file to complete the TODO placeholders")
    print("2. Update the description with specific triggers")
    print("3. Customize the tools list (or remove for full access)")
    print("4. Write a detailed system prompt")
    print("5. Test the agent with representative tasks")

    return agent_file


def main():
    if len(sys.argv) < 4 or sys.argv[2] != '--path':
        print("Usage: init_agent.py <agent-name> --path <path> [--template <type>]")
        print("\nAgent name requirements:")
        print("  - Lowercase letters, digits, and hyphens only")
        print("  - Will be used as filename: <agent-name>.md")
        print("\nTemplate types:")
        print("  - default  : Generic agent template")
        print("  - reviewer : Code/content reviewer pattern")
        print("  - fixer    : Debugger/fixer pattern")
        print("  - builder  : Creator/builder pattern")
        print("\nExamples:")
        print("  init_agent.py code-reviewer --path .claude/agents")
        print("  init_agent.py my-debugger --path ~/.claude/agents")
        print("  init_agent.py test-runner --path .claude/agents --template reviewer")
        sys.exit(1)

    agent_name = sys.argv[1]
    path = sys.argv[3]

    # Check for template argument
    template = 'default'
    if len(sys.argv) > 5 and sys.argv[4] == '--template':
        template = sys.argv[5]
        if template not in TEMPLATES:
            print(f"❌ Unknown template: {template}")
            print(f"   Available: {', '.join(TEMPLATES.keys())}")
            sys.exit(1)

    print(f"🚀 Initializing agent: {agent_name}")
    print(f"   Location: {path}")
    print(f"   Template: {template}")
    print()

    result = init_agent(agent_name, path, template)

    if result:
        sys.exit(0)
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()