# Integration Guide: Applying Rules & Commands to New Projects

**Purpose:** This guide explains how to integrate the Cursor rules, commands, and standards from this repository into a new project. It provides step-by-step instructions for both developers and AI agents.

**Last Updated:** 2025-11-25

---

## Overview

This repository contains:
- **`.cursor/rules/`** - AI agent behavior rules (always applied)
- **`.cursor/commands/`** - Reusable commands for common tasks
- **`standards/`** - Coding standards and architectural patterns
- **`checklists/`** - Quality assurance checklists
- **`AGENTS.md`** - Project context and memory for AI agents

---

## Quick Start: For AI Agents

If you are an AI agent setting up a new project, follow these steps:

### Step 1: Copy Essential Files

Copy these directories and files to your new project:

```bash
# From this repository root:
.cursor/
  ├── rules/              # Copy ALL files
  ├── commands/           # Copy ALL files
checklists/               # Copy ALL files
AGENTS.md                 # Copy and adapt
CHANGELOG.md              # Copy template (optional)
```

### Step 2: Verify Integration

After copying, verify the structure:

```bash
# In your new project:
ls -la .cursor/rules/     # Should show: ai-interaction-rules.md, environment.mdc, self_healing.mdc, task_workflow.mdc
ls -la .cursor/commands/  # Should show: launch.mdc, security-audit.mdc, verify-access-control.mdc
ls -la checklists/        # Should show: pre-flight-check.md, pr-review-check.md, etc.
```

### Step 3: Adapt Project-Specific Content

1. **Update `AGENTS.md`:**
   - Replace placeholder mission statement
   - Update current phase and active context
   - Add project-specific architecture highlights
   - Update persistent memory with project learnings

2. **Review `.cursor/rules/environment.mdc`:**
   - Verify port numbers match your project (default: 3000 for Node, 8000 for Python)
   - Update Supabase setup instructions if not using Supabase
   - Adjust Docker/Supabase container management if not applicable

3. **Review `.cursor/commands/launch.mdc`:**
   - Verify stack detection matches your project (Node.js, Python, etc.)
   - Update default ports if different
   - Adjust Supabase startup if not using Supabase

### Step 4: Test Rules Are Active

Ask the AI agent:
> "What rules are currently active? Show me the environment rules."

The agent should reference `.cursor/rules/environment.mdc` and other rules.

---

## Detailed Integration Steps

### 1. Cursor Rules Integration

**Location:** `.cursor/rules/`

**Files to Copy:**
- `ai-interaction-rules.md` - Core AI behavior directives
- `environment.mdc` - Runtime expectations and environment setup
- `self_healing.mdc` - Automatic error recovery
- `task_workflow.mdc` - Pre-flight and post-flight procedures

**What These Do:**
- **Always Applied:** Rules with `alwaysApply: true` in frontmatter are automatically loaded by Cursor
- **Context-Aware:** Rules guide the AI agent's behavior for every prompt
- **Self-Healing:** Rules enable automatic error recovery (port conflicts, missing dependencies, etc.)

**Adaptation Needed:**
- Review `environment.mdc` Section 2 (Docker/Supabase) - remove or adapt if not using
- Review `environment.mdc` Section 4 (Dependency Management) - verify package manager matches
- Review `task_workflow.mdc` - verify checklist paths match your project structure

### 2. Cursor Commands Integration

**Location:** `.cursor/commands/`

**Files to Copy:**
- `launch.mdc` - Standardized application launch procedure
- `security-audit.mdc` - Security audit checklist (if applicable)
- `verify-access-control.mdc` - RLS policy verification (if using Supabase)

**What These Do:**
- **Reusable Procedures:** Commands provide step-by-step instructions for complex tasks
- **Consistency:** Ensures the same process is followed every time
- **Self-Healing:** Commands include error recovery strategies

**Adaptation Needed:**
- `launch.mdc`: Update stack detection, ports, and startup commands
- Remove Supabase-specific commands if not using Supabase
- Add project-specific commands as needed

### 3. Standards Integration

**Location:** `standards/`

**Options:**

**Option A: Reference (Recommended for Multiple Projects)**
- Keep this repository as a submodule or reference
- Point AI agent to this repository when needed
- Use for consistency across multiple projects

**Option B: Copy Relevant Standards**
- Copy only standards relevant to your project
- Adapt project-specific details
- Maintain local copy for offline access

**Option C: Hybrid**
- Copy critical standards (e.g., `project-structure.md`, `database/schema.md`)
- Reference others from this repository

**Recommended Standards to Copy:**
- `project-structure.md` - File organization rules
- `database/schema.md` - Database conventions (if using databases)
- `git-flow.md` - Branch naming and commit conventions
- `documentation.md` - Documentation standards

### 4. Checklists Integration

**Location:** `checklists/`

**Files to Copy:**
- `pre-flight-check.md` - Pre-development checklist
- `pr-review-check.md` - Pre-merge checklist
- `security-audit-check.md` - Security review checklist (if applicable)
- `rls-policy-review.md` - RLS policy review (if using Supabase)

**What These Do:**
- **Quality Assurance:** Ensure code quality before committing
- **Consistency:** Same checks for every task
- **Automation:** Can be referenced by AI agents automatically

**Adaptation Needed:**
- Update paths in checklists to match your project structure
- Remove Supabase-specific checks if not applicable
- Add project-specific checks as needed

### 5. AGENTS.md Integration

**Location:** Root directory

**What It Does:**
- Provides project context and memory for AI agents
- Records architectural decisions and learnings
- Guides AI agent behavior for project-specific patterns

**Setup Steps:**
1. Copy `AGENTS.md` template
2. Fill in Section 1: Project Mission
3. Update Section 2: Current Phase
4. Update Section 4: System Architecture Highlights
5. Add project-specific learnings to Section 5

**Important:** This file should be updated regularly as the project evolves.

---

## AI Agent Instructions for New Projects

When setting up a new project, instruct the AI agent as follows:

### Initial Setup Prompt

```
I want to integrate the workflow rules and standards from the repository at [URL or path].

Please:
1. Copy the .cursor/rules/ directory and all its files
2. Copy the .cursor/commands/ directory and all its files
3. Copy the checklists/ directory and all its files
4. Copy AGENTS.md and adapt it for this project
5. Review and adapt .cursor/rules/environment.mdc for this project's stack
6. Review and adapt .cursor/commands/launch.mdc for this project's startup process
7. Verify all rules are active by listing them
```

### Verification Prompt

```
Verify that all Cursor rules and commands are properly integrated:

1. List all files in .cursor/rules/
2. List all files in .cursor/commands/
3. Read .cursor/rules/environment.mdc and confirm it matches this project's stack
4. Read .cursor/commands/launch.mdc and confirm it matches this project's startup process
5. Confirm AGENTS.md has been adapted for this project
```

### Testing Prompt

```
Test that the rules are working:

1. Try to start the application using the launch command
2. Verify that the self-healing rules work (e.g., if a port is busy, it should be handled automatically)
3. Run the pre-flight checklist
4. Confirm that the AI agent references standards/ when making architectural decisions
```

---

## Integration Checklist

Use this checklist to ensure complete integration:

### Phase 1: File Copy
- [ ] Copied `.cursor/rules/` directory (all 4 files)
- [ ] Copied `.cursor/commands/` directory (all 3 files)
- [ ] Copied `checklists/` directory (all files)
- [ ] Copied `AGENTS.md` template
- [ ] Copied `CHANGELOG.md` template (optional)

### Phase 2: Adaptation
- [ ] Updated `AGENTS.md` with project mission and context
- [ ] Reviewed `.cursor/rules/environment.mdc` for project-specific settings
- [ ] Reviewed `.cursor/commands/launch.mdc` for project-specific startup
- [ ] Removed or adapted Supabase-specific rules if not using Supabase
- [ ] Updated port numbers and stack detection if needed

### Phase 3: Standards Integration
- [ ] Decided on standards integration approach (Reference/Copy/Hybrid)
- [ ] Copied or referenced `standards/project-structure.md`
- [ ] Copied or referenced `standards/database/schema.md` (if using databases)
- [ ] Copied or referenced `standards/git-flow.md`
- [ ] Copied or referenced other relevant standards

### Phase 4: Verification
- [ ] Verified rules are active (AI agent can reference them)
- [ ] Tested launch command works correctly
- [ ] Tested self-healing rules (port conflicts, missing dependencies)
- [ ] Verified checklists are accessible
- [ ] Confirmed AI agent references standards when making decisions

### Phase 5: Documentation
- [ ] Updated project README.md to reference this integration guide
- [ ] Documented any project-specific adaptations
- [ ] Added notes about which standards are referenced vs copied

---

## Troubleshooting

### Rules Not Being Applied

**Symptom:** AI agent doesn't reference rules or follow them.

**Solution:**
1. Verify files are in `.cursor/rules/` (not `.cursorrules/` or other location)
2. Check frontmatter includes `alwaysApply: true` for rules that should always apply
3. Restart Cursor to reload rules
4. Explicitly ask AI agent: "What rules are currently active?"

### Commands Not Working

**Symptom:** Launch command or other commands fail.

**Solution:**
1. Verify command files are in `.cursor/commands/`
2. Review command file for project-specific adaptations needed
3. Check that paths in commands match your project structure
4. Verify environment variables are set correctly

### Standards Not Being Referenced

**Symptom:** AI agent doesn't check standards before making decisions.

**Solution:**
1. Verify `standards/` directory exists and is accessible
2. Check `AGENTS.md` includes reference to standards
3. Explicitly instruct: "Before creating [component], check `standards/` first"
4. Verify `ai-interaction-rules.md` includes directive to check standards

---

## Best Practices

### 1. Keep Rules Updated

When this repository is updated, review changes and update your project's rules accordingly:

```bash
# If using git submodule:
git submodule update --remote

# If copying manually:
# Review changes in this repository and apply relevant updates
```

### 2. Project-Specific Adaptations

Document any project-specific adaptations in:
- `AGENTS.md` Section 5 (Persistent Memory)
- Project README.md
- Or create a `PROJECT_ADAPTATIONS.md` file

### 3. Regular Review

Periodically review:
- Are rules still relevant for your project?
- Are commands working correctly?
- Are standards being followed?
- Should new rules or commands be added?

### 4. Team Alignment

If working with a team:
- Ensure all team members have the same rules and commands
- Document any team-specific adaptations
- Keep rules in version control (they're already tracked in git)

---

## Advanced: Using as Git Submodule

For multiple projects, consider using this repository as a git submodule:

```bash
# In your new project:
git submodule add <repository-url> .workflow-standards

# Reference rules:
ln -s .workflow-standards/.cursor/rules .cursor/rules
ln -s .workflow-standards/.cursor/commands .cursor/commands
ln -s .workflow-standards/checklists checklists
```

**Note:** Cursor may not follow symlinks for rules. You may need to copy files instead of symlinking.

---

## Summary

To integrate these rules and commands into a new project:

1. **Copy** `.cursor/rules/`, `.cursor/commands/`, `checklists/`, and `AGENTS.md`
2. **Adapt** project-specific settings (ports, stack, Supabase usage)
3. **Reference or Copy** relevant standards
4. **Verify** rules are active and working
5. **Test** commands and self-healing behavior
6. **Document** any project-specific adaptations

The AI agent will automatically use these rules for every prompt, ensuring consistent behavior across all projects.

---

*For questions or issues, refer to the main README.md or open an issue in this repository.*

