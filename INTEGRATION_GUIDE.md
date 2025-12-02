# Integration_Guide_v1.1

## Metadata
- **Created:** 2025-11-25
- **Last Updated:** 2025-12-02
- **Version:** 1.1
- **Description:** Guide explaining how to integrate the Cursor rules, commands, and standards from this repository into a new project, with step-by-step instructions for both developers and AI agents.

**Major Changes in v1.1:**
- Added auto-applied RLS policy review rule (replaces checklist)
- Added full-project-health-check meta-command
- Updated AGENTS.md lifecycle structure documentation
- Reorganized security standards location
- Added documentation standards reference

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
  ├── rules/              # Copy ALL files (including supabase-rls-policy-review.mdc)
  ├── commands/           # Copy ALL files (including full-project-health-check.md)
standards/development-checklists/ # Copy ALL files (NOTE: RLS policy review is now a rule, not a checklist)
templates/general/AGENTS-TEMPLATE.md  # Copy and rename to AGENTS.md, then adapt
CHANGELOG.md              # Copy template (optional)
```

### Step 2: Verify Integration

After copying, verify the structure:

```bash
# In your new project:
ls -la .cursor/rules/     # Should show: ai-interaction-rules.md, environment.mdc, self-healing.mdc, task-workflow.mdc, supabase-rls-policy-review.mdc
ls -la .cursor/commands/  # Should show: launch.mdc, security-audit.mdc, verify-access-control.mdc, full-project-health-check.md, project-audit.md, etc.
ls -la standards/development-checklists/  # Should show: pre-flight-checklist.md, pr-review-checklist.md, project-audit-checklist.md
ls -la standards/security/  # Should show: security-audit-checklist.md, access-control.md
# Note: RLS policy review is now at .cursor/rules/supabase-rls-policy-review.mdc (auto-applied when Supabase detected)
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
- `self-healing.mdc` - Automatic error recovery
- `task-workflow.mdc` - Pre-flight and post-flight procedures
- `supabase-rls-policy-review.mdc` - Deep RLS policy analysis (auto-applied when Supabase detected)

**What These Do:**
- **Always Applied:** Rules with `alwaysApply: true` in frontmatter are automatically loaded by Cursor
- **Conditionally Applied:** Rules like `supabase-rls-policy-review.mdc` are applied when specific conditions are met (e.g., Supabase detected)
- **Context-Aware:** Rules guide the AI agent's behavior for every prompt
- **Self-Healing:** Rules enable automatic error recovery (port conflicts, missing dependencies, etc.)

**Adaptation Needed:**
- Review `environment.mdc` Section 2 (Docker/Supabase) - remove or adapt if not using
- Review `environment.mdc` Section 4 (Dependency Management) - verify package manager matches
- Review `task-workflow.mdc` - verify checklist paths match your project structure

### 2. Cursor Commands Integration

**Location:** `.cursor/commands/`

**Files to Copy:**
- `launch.mdc` - Standardized application launch procedure
- `pre-flight-check.md` - Environment validation before coding
- `pr-review-check.md` - Pre-PR validation
- `project-audit.md` - Project structure and standards validation
- `security-audit.mdc` - Security audit checklist (if applicable)
- `full-project-health-check.md` - Meta-command to run all audits together
- `verify-access-control.mdc` - RLS policy verification (if using Supabase)
- `rls_policy_review.md` - RLS policy review command (references the rule)

**What These Do:**
- **Reusable Procedures:** Commands provide step-by-step instructions for complex tasks
- **Meta-Commands:** Commands like `full-project-health-check` orchestrate multiple other commands
- **Consistency:** Ensures the same process is followed every time
- **Self-Healing:** Commands include error recovery strategies
- **Rule Integration:** Commands can trigger auto-applied rules (e.g., RLS policy review)

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
- `documentation.md` - Documentation management rules
- `security/security-audit.md` - Security audit standards (moved from docs/process/)
- `security/access-control.md` - Access control and RLS standards (if using Supabase)

**New Documentation Standards:**
- `docs/DOCUMENTATION_STANDARDS.md` - Comprehensive guide to standard documentation files

### 4. Checklists Integration

**Location:** `standards/development-checklists/`

**Files to Copy:**
- `pre_flight_checklist_v1_0.md` - Pre-development checklist
- `pr_review_checklist_v1_0.md` - Pre-merge checklist
- `security_audit_checklist_v1_0.md` - Security review checklist (if applicable)
- `project_audit_checklist_v1_0.md` - Project structure audit checklist

**Note:** RLS policy review is now handled by `.cursor/rules/supabase-rls-policy-review.mdc` (auto-applied rule when Supabase detected), not a checklist.

**What These Do:**
- **Quality Assurance:** Ensure code quality before committing
- **Consistency:** Same checks for every task
- **Automation:** Can be referenced by AI agents automatically
- **Rule Integration:** Some validations are now handled by auto-applied rules

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
- Defines standard developer lifecycle with commands and checklists
- Maps commands to checklists and standards
- Provides quick reference table for common tasks

**New Structure (v1.1):**
- Section 6: Standard Developer Lifecycle (maps commands to checklists)
- Section 7: Agent Rules of Engagement
- Section 8: Related Checklists & Commands (organized reference)
- Section 9: Quick Reference Table (when to use what)

**Setup Steps:**
1. Copy `templates/general/AGENTS-TEMPLATE.md` and rename to `AGENTS.md`
2. Fill in Section 1: Project Mission
3. Update Section 2: Current Phase
4. Update Section 4: System Architecture Highlights
5. Add project-specific learnings to Section 5
6. Review Section 6-9 for lifecycle and command mapping structure

**Important:** This file should be updated regularly as the project evolves.

---

## 6. Understanding Rules, Checklists, and Commands

### Rules (`.cursor/rules/`)
- **Always Applied:** Rules with `alwaysApply: true` are loaded for every prompt
- **Conditionally Applied:** Rules like `supabase-rls-policy-review.mdc` apply when conditions are met
- **Purpose:** Guide AI agent behavior and decision-making
- **Location:** `.cursor/rules/`

### Checklists (`standards/development-checklists/`)
- **Purpose:** Human-readable validation checklists
- **Used By:** Commands and human developers
- **Format:** Validation items with checkboxes
- **Location:** `standards/development-checklists/`

### Commands (`.cursor/commands/`)
- **Purpose:** Executable workflows for complex tasks
- **Can Trigger:** Other commands, checklists, and rules
- **Meta-Commands:** Some commands orchestrate multiple other commands
- **Location:** `.cursor/commands/`

### Relationship
- Commands reference checklists for validation steps
- Commands can trigger auto-applied rules
- Rules guide AI agent behavior when executing commands
- See `AGENTS.md` Section 8 for complete mapping

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
4. Copy templates/general/AGENTS-TEMPLATE.md and rename to AGENTS.md, then adapt it for this project
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
- [ ] Copied `.cursor/rules/` directory (all 5 files, including supabase-rls-policy-review.mdc)
- [ ] Copied `.cursor/commands/` directory (all files, including full-project-health-check.md)
- [ ] Copied `standards/development-checklists/` directory (all files, note: RLS review is now a rule)
- [ ] Copied `templates/general/AGENTS-TEMPLATE.md` and renamed to `AGENTS.md`
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
- [ ] Verified auto-applied rules work (e.g., RLS policy review when Supabase detected)
- [ ] Tested launch command works correctly
- [ ] Tested self-healing rules (port conflicts, missing dependencies)
- [ ] Tested meta-commands (full-project-health-check)
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

### Auto-Applied Rules Not Working

**Symptom:** RLS policy review rule doesn't apply when Supabase is detected.

**Solution:**
1. Verify `supabase-rls-policy-review.mdc` is in `.cursor/rules/`
2. Check if `supabase/` directory exists or `SUPABASE_URL` env var is set
3. Restart Cursor to reload rules
4. Explicitly ask: "Review RLS policies" to trigger the rule

### Meta-Commands Not Working

**Symptom:** `full-project-health-check` fails or doesn't run all audits.

**Solution:**
1. Verify all referenced commands exist (project_audit, security_audit)
2. Check that referenced checklists exist
3. Verify rules are accessible (for auto-applied rules)
4. Review command file for correct paths and references

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

1. **Copy** `.cursor/rules/` (including auto-applied rules), `.cursor/commands/` (including meta-commands), `standards/development-checklists/`, and `AGENTS.md`
2. **Adapt** project-specific settings (ports, stack, Supabase usage)
3. **Reference or Copy** relevant standards (including new security standards location)
4. **Verify** rules are active and auto-applied rules trigger correctly
5. **Test** commands, meta-commands, and self-healing behavior
6. **Document** any project-specific adaptations

The AI agent will automatically use these rules for every prompt, with conditionally-applied rules triggering when specific conditions are met (e.g., Supabase detected). Commands orchestrate checklists and rules to ensure consistent, validated workflows.

---

*For questions or issues, refer to the main README.md or open an issue in this repository.*

