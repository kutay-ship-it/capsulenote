#!/usr/bin/env python3
"""
Agent Validator - Validates Claude Code subagent files

Usage:
    validate_agent.py <agent-file-or-directory>

Examples:
    validate_agent.py .claude/agents/code-reviewer.md
    validate_agent.py .claude/agents/
    validate_agent.py ~/.claude/agents/
"""

import sys
import os
import re
from pathlib import Path
from typing import NamedTuple


class ValidationResult(NamedTuple):
    is_valid: bool
    errors: list[str]
    warnings: list[str]
    info: list[str]


def parse_frontmatter(content: str) -> tuple[dict | None, str]:
    """Parse YAML frontmatter from markdown content."""
    if not content.startswith('---'):
        return None, content

    parts = content.split('---', 2)
    if len(parts) < 3:
        return None, content

    frontmatter_text = parts[1].strip()
    body = parts[2].strip()

    # Simple YAML parsing for agent files
    frontmatter = {}
    for line in frontmatter_text.split('\n'):
        if ':' in line:
            key, _, value = line.partition(':')
            frontmatter[key.strip()] = value.strip()

    return frontmatter, body


def validate_name(name: str) -> list[str]:
    """Validate agent name field."""
    errors = []

    if not name:
        errors.append("Missing required field: name")
        return errors

    if not re.match(r'^[a-z][a-z0-9-]*$', name):
        errors.append(f"Name '{name}' must use only lowercase letters, numbers, and hyphens")

    if len(name) > 64:
        errors.append(f"Name '{name}' exceeds 64 character limit")

    return errors


def validate_description(description: str) -> tuple[list[str], list[str]]:
    """Validate agent description field."""
    errors = []
    warnings = []

    if not description:
        errors.append("Missing required field: description")
        return errors, warnings

    if len(description) < 20:
        warnings.append("Description is very short - consider adding more detail about when to use this agent")

    if len(description) > 1024:
        errors.append(f"Description exceeds 1024 character limit ({len(description)} chars)")

    # Check for trigger indicators
    trigger_patterns = [
        r'use\s+(proactively|when|for)',
        r'must\s+be\s+used',
        r'use\s+this\s+agent',
        r'trigger',
    ]

    has_trigger = any(re.search(p, description.lower()) for p in trigger_patterns)
    if not has_trigger:
        warnings.append("Description lacks trigger indicators (e.g., 'Use PROACTIVELY when...' or 'MUST BE USED before...')")

    # Check for TODO placeholders
    if '[TODO' in description or 'TODO:' in description:
        errors.append("Description contains TODO placeholder - please complete")

    return errors, warnings


def validate_tools(tools: str) -> tuple[list[str], list[str]]:
    """Validate tools field if present."""
    errors = []
    warnings = []

    if not tools:
        # Tools field is optional - omitting inherits all tools
        return errors, warnings

    known_tools = {
        'read', 'write', 'edit', 'glob', 'grep', 'bash',
        'websearch', 'webfetch', 'web_search', 'web_fetch',
        'agent', 'task', 'mcp',
    }

    tool_list = [t.strip().lower() for t in tools.split(',')]

    for tool in tool_list:
        if tool and tool not in known_tools and not tool.startswith('mcp:'):
            warnings.append(f"Unknown tool '{tool}' - verify it exists (may be MCP tool)")

    return errors, warnings


def validate_model(model: str) -> list[str]:
    """Validate model field if present."""
    warnings = []

    if not model:
        return warnings

    valid_models = {'sonnet', 'opus', 'haiku', 'inherit'}
    if model.lower() not in valid_models:
        warnings.append(f"Model '{model}' not recognized - valid options: {', '.join(valid_models)}")

    return warnings


def validate_body(body: str) -> tuple[list[str], list[str], list[str]]:
    """Validate agent body (system prompt)."""
    errors = []
    warnings = []
    info = []

    if not body or len(body.strip()) < 50:
        errors.append("System prompt is too short - provide detailed instructions")
        return errors, warnings, info

    # Check for TODO placeholders
    if '[TODO' in body or 'TODO:' in body:
        errors.append("System prompt contains TODO placeholders - please complete")

    # Check for role definition
    role_patterns = [
        r'you\s+are\s+(a|an)',
        r'your\s+role',
        r'as\s+(a|an)\s+\w+',
    ]
    has_role = any(re.search(p, body.lower()) for p in role_patterns)
    if not has_role:
        warnings.append("System prompt lacks role definition (e.g., 'You are a...')")

    # Check for action steps
    action_patterns = [
        r'when\s+invoked',
        r'step\s+\d',
        r'^\d+\.\s+',
        r'first,?\s+',
    ]
    has_actions = any(re.search(p, body.lower(), re.MULTILINE) for p in action_patterns)
    if not has_actions:
        warnings.append("System prompt lacks specific action steps (e.g., 'When invoked: 1. ...')")

    # Check for checklist or criteria
    has_checklist = '- [ ]' in body or '- [x]' in body
    has_criteria = any(word in body.lower() for word in ['checklist', 'criteria', 'requirements', 'verify', 'ensure'])

    if not has_checklist and not has_criteria:
        info.append("Consider adding a checklist or success criteria")

    # Check for output format
    has_output_format = any(phrase in body.lower() for phrase in [
        'output format', 'provide:', 'report:', 'format:',
        'for each', 'include:', 'organize',
    ])
    if not has_output_format:
        info.append("Consider specifying expected output format")

    # Body length check
    word_count = len(body.split())
    if word_count < 100:
        warnings.append(f"System prompt is short ({word_count} words) - consider adding more detail")
    elif word_count > 2000:
        warnings.append(f"System prompt is very long ({word_count} words) - consider being more concise")

    return errors, warnings, info


def validate_agent_file(file_path: Path) -> ValidationResult:
    """Validate a single agent file."""
    errors = []
    warnings = []
    info = []

    # Read file
    try:
        content = file_path.read_text()
    except Exception as e:
        return ValidationResult(False, [f"Cannot read file: {e}"], [], [])

    # Parse frontmatter
    frontmatter, body = parse_frontmatter(content)

    if frontmatter is None:
        errors.append("Missing or invalid YAML frontmatter (must start with ---)")
        return ValidationResult(False, errors, warnings, info)

    # Validate name
    name = frontmatter.get('name', '')
    errors.extend(validate_name(name))

    # Validate description
    description = frontmatter.get('description', '')
    desc_errors, desc_warnings = validate_description(description)
    errors.extend(desc_errors)
    warnings.extend(desc_warnings)

    # Validate tools (optional)
    tools = frontmatter.get('tools', '')
    tools_errors, tools_warnings = validate_tools(tools)
    errors.extend(tools_errors)
    warnings.extend(tools_warnings)

    # Validate model (optional)
    model = frontmatter.get('model', '')
    warnings.extend(validate_model(model))

    # Validate body
    body_errors, body_warnings, body_info = validate_body(body)
    errors.extend(body_errors)
    warnings.extend(body_warnings)
    info.extend(body_info)

    # Check filename matches name
    expected_filename = f"{name}.md"
    if name and file_path.name != expected_filename:
        warnings.append(f"Filename '{file_path.name}' doesn't match agent name '{name}' (expected '{expected_filename}')")

    return ValidationResult(len(errors) == 0, errors, warnings, info)


def validate_directory(dir_path: Path) -> dict[str, ValidationResult]:
    """Validate all agent files in a directory."""
    results = {}

    for file_path in dir_path.glob('*.md'):
        if file_path.name.startswith('.'):
            continue
        results[str(file_path)] = validate_agent_file(file_path)

    return results


def print_result(file_path: str, result: ValidationResult):
    """Print validation result for a file."""
    status = "✅ VALID" if result.is_valid else "❌ INVALID"
    print(f"\n{status}: {file_path}")

    if result.errors:
        print("  Errors:")
        for error in result.errors:
            print(f"    ❌ {error}")

    if result.warnings:
        print("  Warnings:")
        for warning in result.warnings:
            print(f"    ⚠️  {warning}")

    if result.info:
        print("  Suggestions:")
        for item in result.info:
            print(f"    💡 {item}")


def main():
    if len(sys.argv) < 2:
        print("Usage: validate_agent.py <agent-file-or-directory>")
        print("\nExamples:")
        print("  validate_agent.py .claude/agents/code-reviewer.md")
        print("  validate_agent.py .claude/agents/")
        print("  validate_agent.py ~/.claude/agents/")
        sys.exit(1)

    target = os.path.expanduser(sys.argv[1])
    path = Path(target)

    if not path.exists():
        print(f"❌ Path does not exist: {path}")
        sys.exit(1)

    if path.is_file():
        result = validate_agent_file(path)
        print_result(str(path), result)
        sys.exit(0 if result.is_valid else 1)

    elif path.is_dir():
        results = validate_directory(path)

        if not results:
            print(f"No .md files found in {path}")
            sys.exit(0)

        all_valid = True
        for file_path, result in results.items():
            print_result(file_path, result)
            if not result.is_valid:
                all_valid = False

        print(f"\n{'='*50}")
        valid_count = sum(1 for r in results.values() if r.is_valid)
        total_count = len(results)
        print(f"Summary: {valid_count}/{total_count} agents valid")

        sys.exit(0 if all_valid else 1)

    else:
        print(f"❌ Not a file or directory: {path}")
        sys.exit(1)


if __name__ == "__main__":
    main()