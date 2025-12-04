# Standards_Integration_Guide_v1.2

## Metadata
- **Created:** 2025-11-25
- **Last Updated:** 04-12-2025 11:47:37 EST
- **Version:** 1.2
- **Description:** Guide explaining how to integrate the Cursor rules, commands, and standards from this repository into a new project, with step-by-step instructions for both developers and AI agents.

**Major Changes in v1.2:**
- Added Project Template with nested Cursor rules for role-based agent behavior
- Updated rule length guidelines (optimal: 100-300 lines, nested: 50-150 lines)
- Added 5 domain-specific nested rules (frontend, backend, database, testing, docs)
- Comprehensive template README with customization guide

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
- **`templates/project-template/`** - Complete project template with nested rules
- **`AGENTS.md`** - Project context and memory for AI agents

---

## 🚀 Quick Start: Use the Project Template (Recommended)

**The easiest way to start a new project is to use our complete project template.**

### What You Get

The template (`templates/project-template/`) includes:
- **Pre-configured directory structure** with best practices
- **Root-level rules** for general behavior (ai-interaction, environment, workflow)
- **Nested rules** that create domain-specific "roles" for your AI agent:
  - Frontend specialist when working in `src/frontend/`
  - Backend specialist when working in `src/backend/`
  - Database manager when working in `database/`
  - QA engineer when working in `tests/`
  - Technical writer when working in `docs/`

### How to Use

```bash
# Copy the template to your new project
cp -r templates/project-template/ /path/to/your/new-project/
cd /path/to/your/new-project/

# Customize the rules (see template README.md for guidance)
# - Update root rules in .cursor/rules/
# - Adapt nested rules in subdirectories
# - Create your standards/ directory
# - Create AGENTS.md with project context
```

**See `templates/project-template/README.md` for complete usage instructions and customization guide.**

### Benefits of Using the Template

✅ **Automatic role switching** - Agent behavior adapts by directory  
✅ **Focused guidance** - Agent sees only relevant rules for current work  
✅ **Reduced setup time** - Start with proven structure  
✅ **Consistent patterns** - Pre-configured best practices  
✅ **Scalable** - Easy to add new domains  

---

## Alternative: Manual Integration

If you prefer to manually integrate specific components, follow these steps:

## Quick Start: For AI Agents (Manual Integration)

If you are an AI agent setting up a new project, follow these steps:

### Step 1: Copy Essential Files

Copy these directories and files to your new project:

```bash
# From this repository root:
.cursor/
  ├── rules/              # Copy ALL files (including supabase-rls-policy-review.mdc)
  ├── commands/           # Copy ALL files (including full-project-health-check.md)
standards/process/checklists/ # Copy ALL files (NOTE: RLS policy review is now a rule, not a checklist)
templates/file-templates/AGENTS-TEMPLATE.md  # Copy and rename to AGENTS.md, then adapt
CHANGELOG.md              # Copy template (optional)
```

### Step 2: Verify Integration

After copying, verify the structure:

```bash
# In your new project:
ls -la .cursor/rules/     # Should show: ai-interaction-rules.md, environment.mdc, self-healing.mdc, task-workflow.mdc, supabase-rls-policy-review.mdc
ls -la .cursor/commands/  # Should show: launch.mdc, security-audit.mdc, verify-access-control.mdc, full-project-health-check.md, project-audit.md, etc.
ls -la standards/process/checklists/  # Should show: pre_flight_checklist_v1_0.md, pr_review_checklist_v1_0.md, project_audit_checklist_v1_0.md, linting_checklist_v1_0.md
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
- `ai-interaction-rules.mdc` - Core AI behavior directives
- `environment.mdc` - Runtime expectations and environment setup
- `auto-heal.mdc` - Automatic error recovery
- `task-workflow.mdc` - Development workflow integration
- `pre-flight-check.mdc` - Auto-validates environment before coding
- `pr-review-check.mdc` - Auto-validates code before PR submission
- `supabase-rls-policy-review.mdc` - Deep RLS policy analysis (auto-applied when Supabase detected)
- `linting-behavior.mdc` - Linting behavior and expectations
- `documentation-dependency-tracking.mdc` - Tracks doc dependencies
- `documentation-metadata.mdc` - Validates .md file metadata
- `rule-metadata.mdc` - Validates .mdc file metadata
- `cursor-rule-creation.mdc` - Ensures rules follow proper structure

**What These Do:**
- **Always Applied:** Rules with `alwaysApply: true` in frontmatter are automatically loaded by Cursor
- **Workflow Integration:** `pre-flight-check.mdc` and `pr-review-check.mdc` auto-trigger at workflow phases
- **Conditionally Applied:** Rules with `alwaysApply: false` apply only to matching file patterns
- **Context-Aware:** Rules guide the AI agent's behavior for every prompt
- **Self-Healing:** Rules enable automatic error recovery (port conflicts, missing dependencies, etc.)
- **Quality Gates:** Prevent starting work in broken environment or submitting broken code

**Adaptation Needed:**
- Review `environment.mdc` - Adapt Docker/Supabase sections if not using, verify package manager
- Review `task-workflow.mdc` - Verify checklist paths match your project structure
- Review `pre-flight-check.mdc` - Adapt validation steps for your tech stack
- Review `pr-review-check.mdc` - Adapt validation steps for your build/test setup
- Consider creating nested rules for domain-specific guidance (see project template)

### 2. Cursor Commands Integration

**Location:** `.cursor/commands/`

**Files to Copy:**
- `launch.md` - Standardized application launch procedure
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
- `process/git-repository-standards.md` - Branch naming and commit conventions
- `documentation.md` - Documentation management rules
- `security/security-audit.md` - Security audit standards (moved from docs/process/)
- `security/access-control.md` - Access control and RLS standards (if using Supabase)

**New Documentation Standards:**
- `standards/project-planning/documentation-standards.md` - Comprehensive guide to standard documentation files

### 4. Checklists Integration

**Location:** `standards/process/checklists/`

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
1. Copy `templates/file-templates/AGENTS-TEMPLATE.md` and rename to `AGENTS.md`
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

### Checklists (`standards/process/checklists/`)
- **Purpose:** Human-readable validation checklists
- **Used By:** Commands and human developers
- **Format:** Validation items with checkboxes
- **Location:** `standards/process/checklists/`

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
4. Copy templates/file-templates/AGENTS-TEMPLATE.md and rename to AGENTS.md, then adapt it for this project
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
- [ ] Copied `standards/process/checklists/` directory (all files, note: RLS review is now a rule)
- [ ] Copied `templates/file-templates/AGENTS-TEMPLATE.md` and renamed to `AGENTS.md`
- [ ] Copied `CHANGELOG.md` template (optional)

### Phase 2: Adaptation
- [ ] Updated `AGENTS.md` with project mission and context
- [ ] Reviewed `.cursor/rules/environment.mdc` for project-specific settings
- [ ] Reviewed `.cursor/commands/launch.mdc` for project-specific startup
- [ ] Removed or adapted Supabase-specific rules if not using Supabase
- [ ] Updated port numbers and stack detection if needed

### Phase 3: Standards Integration
- [ ] Decided on standards integration approach (Reference/Copy/Hybrid)
- [ ] Copied or referenced `standards/project-planning/project-structure.md`
- [ ] Copied or referenced `standards/database/schema.md` (if using databases)
- [ ] Copied or referenced `standards/process/git-repository-standards.md`
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

1. **Copy** `.cursor/rules/` (including auto-applied rules), `.cursor/commands/` (including meta-commands), `standards/process/checklists/`, and `AGENTS.md`
2. **Adapt** project-specific settings (ports, stack, Supabase usage)
3. **Reference or Copy** relevant standards (including new security standards location)
4. **Verify** rules are active and auto-applied rules trigger correctly
5. **Test** commands, meta-commands, and self-healing behavior
6. **Document** any project-specific adaptations

The AI agent will automatically use these rules for every prompt, with conditionally-applied rules triggering when specific conditions are met (e.g., Supabase detected). Commands orchestrate checklists and rules to ensure consistent, validated workflows.

---

*For questions or issues, refer to the main README.md or open an issue in this repository.*

