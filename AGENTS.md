# AI Agent Context & Memory (AGENTS.md)

## Metadata
- **Created:** 2025-01-27
- **Last Updated:** 04-12-2025 16:46:02 EST
- **Version:** 1.0
- **Description:** Project context and memory for AI Developer Agent

> **CRITICAL NOTE:** This file is for the **AI Developer Agent** (the entity writing code in the IDE) ONLY.
> - It is **NOT** accessible to runtime AI agents (e.g., chatbots embedded in the web app).
> - It contains build-time context, architectural decisions, and developer memory.
> - **Do not** store runtime secrets or user data here.

> **To the Developer Agent:** Read this file at the start of every session. It contains the high-level context, active goals, and persistent memory of the project. Update it when you complete major milestones or learn something new about the codebase.

---

## 1. Project Mission
**Build a comprehensive AI Agent Knowledge Base & Standards Library that provides reusable rules, standards, commands, checklists, and code modules to ensure consistent, secure, and efficient development across all projects.**

## 2. Current Phase: Maintenance & Enhancement
We are currently focusing on:
- [x] Core infrastructure established (rules, commands, checklists, standards)
- [x] Module library created (backend-api, auth-profile-sync, logger-module, etc.)
- [x] Documentation system implemented (AGENTS.md, STANDARDS_INTEGRATION_GUIDE.md, etc.)
- [ ] Continuous improvement of standards and modules
- [ ] Expanding module library based on common patterns
- [ ] Refining integration process based on usage feedback

## 3. Active Context (The "Now")
*What is being worked on right now? Keep this fresh - update at the start of each session.*

- **Latest Task:** Created Cursor rules standard and creation rule (cursor-rules-standards.md and cursor-rule-creation.mdc)
- **Blocking Issues:** None currently
- **Next Up:** Update existing rules to use new metadata structure (Type, relatedCommands, relatedRules, relatedStandards)
- **Context Notes:** New system defines 8 standard rule types and ensures all rules follow proper structure with enhanced metadata for better cross-referencing

## 4. System Architecture Highlights
*Quick reference for the agent. For full details, see `standards/project-planning/tech-stack-document.md`.*

> **Note:** This repository is a standards library, not a runtime application. It contains:
> - Documentation standards and guides
> - Reusable code modules
> - Cursor rules and commands
> - Integration templates

- **Purpose:** Template/standard library repository for integration into other projects
- **Modules:** TypeScript/JavaScript modules for common patterns (backend-api, logger-module, etc.)
- **Standards:** Comprehensive coding standards and architectural patterns
- **Documentation:** Integration guides, checklists, and process documentation

## 5. Persistent Memory (Learnings & Patterns)
*Record things that are not obvious from code but are important. Add entries as you discover them.*

**What to Record:**
- Architectural decisions and their rationale
- Naming conventions specific to this project
- Gotchas or common pitfalls
- Integration patterns that work well
- Things that differ from standard practices

**Current Learnings:**
- "This repository serves as a template/standard library - it's meant to be copied into other projects, not run as an application itself. See `STANDARDS_INTEGRATION_GUIDE.md` for integration instructions."
- "AGENTS.md is project-specific (this repository), while templates/file-templates/AGENTS-TEMPLATE.md is the template for other projects."
- "Rules in `.cursor/rules/` are auto-applied when this repository is integrated into other projects."
- "The workflow-standards-documentation-maintenance rule is specific to this repository and should be adapted or removed when integrating into other projects."
- "All documentation follows the standards defined in `standards/project-planning/documentation-management.md`."
- "Module READMEs should focus on usage, while standards focus on creation/structure patterns."
- "Documentation dependencies are tracked bidirectionally - when File A references File B, both files should reference each other (if appropriate). The documentation-dependency-tracking rule ensures this automatically."
- "Metadata in documentation files must include Dependencies field with markdown links - this enables easy navigation and ensures cross-reference integrity."
- "Cursor rules (`.mdc` files) use YAML frontmatter for metadata, while standards/docs use Markdown headers - they have different but complementary metadata structures."
- "Rules should declare their type from 8 standard types (Behavioral, Environment, Workflow, Project-Specific, Conditional, Error Recovery, Security, Documentation) to clarify purpose and audience."
- "Enhanced metadata fields (Type, Related Commands/Rules/Standards, How to Use) improve cross-referencing and make documentation more navigable for both AI agents and developers."
- "DRY (Don't Repeat Yourself) principle is enforced through `.cursor/rules/dry-principle.mdc` - every piece of knowledge has a single authoritative source. Commands reference rules, rules reference standards. Never duplicate content; always reference with 'See [file] Section X for details'. This prevents maintenance burden and ensures consistency."

## 6. Standard Developer Lifecycle

**Authoritative Rule:** `.cursor/rules/task-workflow.mdc` - Auto-applied workflow rule that orchestrates the complete development lifecycle.

Follow this lifecycle for all development work. Each step has a corresponding command and checklist. See `.cursor/rules/task-workflow.mdc` for complete workflow details including git operations, launch procedures, and Notion integration.

### 6.1 Before Coding
**Rule:** `pre-flight-check.mdc` (`.cursor/rules/pre-flight-check.mdc`) - Auto-applied  
**Checklist:** `standards/process/checklists/pre_flight_checklist_v1_0.md`

**Automatically validates before coding starts:**
- Git branch and working tree status
- Dependencies are installed
- Environment is configured
- Baseline tests and build pass

### 6.2 Launch Development Environment
**Script:** `./start_app.sh` (or `./scripts/start_dev.sh` for direct dev launch)  
**Command:** `create-start-scripts` (`.cursor/commands/create-start-scripts.md`) - Run this if `start_app.sh` doesn't exist  
**Standard:** `standards/deployment/application-launch.md`

After pre-flight passes, launch the dev environment:
- **If `start_app.sh` exists:** Run `./start_app.sh dev` (or `./start_app.sh` and select dev mode)
- **If `start_app.sh` doesn't exist:** Run `create-start-scripts` command to generate launch scripts
- Handles:
  - Stack detection (Node.js, Python, Docker)
  - Dependency installation
  - Port management
  - Supabase startup (if applicable)

### 6.3 While Coding
**Standards:** Review relevant files in `standards/` before implementing
- Follow coding standards in `standards/`
- Reference architecture docs in `standards/architecture/`
- Use module patterns from `standards/module-structure.md`

### 6.4 Before PR
**Rule:** `pr-review-check.mdc` (`.cursor/rules/pr-review-check.mdc`) - Auto-applied  
**Checklist:** `standards/process/checklists/pr_review_checklist_v1_0.md`

**Automatically validates before PR submission:**
- Code quality (lint, format, types)
- Functionality (build, tests)
- Security (no secrets, input validation)
- Documentation (functions documented, CHANGELOG updated)

### 6.5 Periodic / Before Releases
**Commands:**
- `project-audit` (`.cursor/commands/project-audit.md`) - Full project structure validation
- `security_audit` (`.cursor/commands/audit-security.mdc`) - Security vulnerabilities scan
- `full-project-health-check` - Run all audits together

**Checklists:**
- `standards/process/checklists/project_audit_checklist_v1_0.md`
- `standards/security/security-audit-checklist.md`

**Rules (Auto-Applied):**
- `.cursor/rules/supabase-rls-policy-review.mdc` - Deep RLS policy analysis (applies automatically when Supabase is detected)

Run these:
- When onboarding a new repository
- Before major refactoring
- Before major releases
- Weekly/monthly for active projects

---

## 7. Agent Rules of Engagement

> **What the AI Agent Reviews First:**
> 1. **AGENTS.md** (this file) - Read at start of every session for project context and memory
> 2. **`.cursor/rules/task-workflow.mdc`** - Auto-applied workflow rule that orchestrates the complete development lifecycle
> 3. **Auto-applied rules** - Rules marked with `alwaysApply: true` are automatically active
> 4. **Context-specific rules** - Rules that apply based on file patterns or operations being performed

### 7.1 Pre-Flight (Before Any Coding)
1. **Pre-flight validation runs automatically** (`.cursor/rules/pre-flight-check.mdc`)
   - Triggered by `.cursor/rules/task-workflow.mdc` Section 1
   - Auto-validates environment and baseline integrity
   - Prevents working on broken codebase
   - Self-heals common issues (dependencies, .env, linter)

### 7.2 Standards First
2. **Check Standards First:** Look in `standards/` before guessing
   - Architecture decisions: `standards/architecture/`
   - Coding patterns: `standards/` (root level)
   - Database: `standards/database/`
   - Security: `standards/security/`
   - **Documentation Index:** See `standards/project-planning/documentation-standards.md` for comprehensive documentation guide

### 7.3 Project Onboarding
3. **For new repositories or major refactors, run `project-audit`**
   - Validates structure against standards
   - Identifies gaps and action items
   - Use `full-project-health-check` for comprehensive review

### 7.4 Pre-PR Validation
4. **PR validation runs automatically before submission** (`.cursor/rules/pr-review-check.mdc`)
   - Auto-validates code quality and security
   - Checks documentation and changelog
   - Prevents broken code from entering main branch
   - Auto-fixes common issues when possible

### 7.5 Security-Sensitive Changes
5. **For security-sensitive changes, run `security_audit`**
   - Validates no secrets are committed
   - Checks RLS policies are secure (via `.cursor/rules/supabase-rls-policy-review.mdc` if Supabase detected)
   - Ensures input validation and rate limiting

### 7.6 Documentation
6. **Update Docs:** If you change the architecture, update the docs
   - Update `standards/` if architecture changes
   - Update `CHANGELOG.md` for user-facing changes
   - See `standards/project-planning/documentation-management.md` Section 7 for changelog guidelines
   - **Follow `.cursor/rules/workflow-standards-documentation-maintenance.mdc`** for comprehensive documentation update requirements
   - **See `standards/project-planning/documentation-management.md`** for complete documentation management standards

### 7.7 Safe Operations
7. **Safe Mode:** Do not delete data without confirmation
8. **Log Complex Logic:** If running a big migration, write to `/logs/migration_X.log` first

### 7.8 Temporal Awareness
9. **Temporal Awareness:** Always check the current date when responding to time-sensitive prompts
   - Use `date` command or system date functions
   - See `.cursor/rules/date-time.mdc` for details

---

## 8. Related Checklists & Commands

### 8.1 Checklists (Human-Readable Validation)
All checklists are located in `standards/process/checklists/`:

- **Pre-Flight:** `standards/process/checklists/pre_flight_checklist_v1_0.md`
  - Validates environment and repo state before coding
  - Related rule: `pre-flight-check.mdc` (`.cursor/rules/pre-flight-check.mdc`) - Auto-applied

- **PR Review:** `standards/process/checklists/pr_review_checklist_v1_0.md`
  - Validates code quality, security, and documentation before PR
  - Related rule: `pr-review-check.mdc` (`.cursor/rules/pr-review-check.mdc`) - Auto-applied

- **Linting:** `standards/process/checklists/linting_checklist_v1_0.md`
  - Validates code quality through linting at different stages
  - Related rule: `linting-behavior.mdc` (`.cursor/rules/linting-behavior.mdc`) - Auto-applied
  - Related standard: `standards/process/code-quality-linting-standards.md`

- **Project Audit:** `standards/process/checklists/project_audit_checklist_v1_0.md`
  - Audits project structure, modules, database, and code hygiene
  - Related command: `audit-project` (`.cursor/commands/audit-project.md`)

- **Security Audit:** `standards/security/security-audit-checklist.md`
  - Validates security posture (secrets, dependencies, RLS, API security)
  - Related command: `security_audit` (`.cursor/commands/audit-security.mdc`)

- **RLS Policy Review:** `.cursor/rules/supabase-rls-policy-review.mdc`
  - Deep-dive RLS policy analysis and validation
  - Auto-applied when Supabase is detected in the project
  - Related standard: `standards/security/access-control.md`

### 8.2 Commands (Executable Workflows)
All commands are located in `.cursor/commands/`:

- **`create-start-scripts`** (`.cursor/commands/create-start-scripts.md`) - Generate launch scripts (`start_app.sh` and `scripts/*.sh`)
- **`audit-project`** (`.cursor/commands/audit-project.md`) - Project structure and standards validation
- **`security_audit`** (`.cursor/commands/audit-security.mdc`) - Security vulnerabilities and secrets scan
- **`audit-documentation-rules-metadata`** (`.cursor/commands/audit-documentation-rules-metadata.md`) - Orchestrates metadata validation for all documentation and rule files
- **`audit-readmes`** (`.cursor/commands/audit-readmes.md`) - Validates all README.md files against structure and content standards
- **`full-project-health-check`** - Run all audits together (meta-command)
- **`verify_access_control`** - Access control validation

**Rules (Auto-Applied):**
- **`.cursor/rules/task-workflow.mdc`** - **CRITICAL:** Complete development lifecycle workflow from pre-flight to post-flight. Orchestrates all development phases including git operations, launch procedures, and task completion. **Read this first when starting any task.**
- **`.cursor/rules/pre-flight-check.mdc`** - Environment validation before coding starts (auto-applied at task start)
- **`.cursor/rules/pr-review-check.mdc`** - Pre-PR validation (auto-applied when completing tasks)
- **`.cursor/rules/linting-behavior.mdc`** - Linting behavior and expectations for AI agents (applies automatically)
- **`.cursor/rules/date-time.mdc`** - Date and time awareness for AI agents (applies automatically)
- **`.cursor/rules/supabase-rls-policy-review.mdc`** - Deep RLS policy analysis (applies automatically when Supabase detected)
- **`.cursor/rules/workflow-standards-documentation-maintenance.mdc`** - Documentation maintenance requirements (project-specific to Workflow Rules repository)
- **`.cursor/rules/documentation-dependency-tracking.mdc`** - Ensures documentation dependencies and cross-references are maintained when files are modified (applies automatically)
- **`.cursor/rules/cursor-rule-creation.mdc`** - Ensures Cursor rules follow proper structure and metadata standards (applies when creating/modifying rules)
- **`.cursor/rules/cursor-command-creation.mdc`** - Ensures Cursor commands follow proper structure and metadata standards (applies when creating/modifying commands)
- **`.cursor/rules/dry-principle.mdc`** - Enforces DRY (Don't Repeat Yourself) principle - single source of truth for all documentation and code (applies automatically)
- **`.cursor/rules/readme-standards.mdc`** - Ensures README.md files follow standard structure and content requirements (applies when creating/modifying README files)
- **Git Workflow Rules:**
  - **`.cursor/rules/git/git-branch-naming.mdc`** - Enforces branch naming conventions and prevents direct commits to main/master (applies when creating/validating branches)
  - **`.cursor/rules/git/git-commit-messages.mdc`** - Enforces Conventional Commits format and pre-commit security checks (applies when committing code)
  - **`.cursor/rules/git/git-pr-preparation.mdc`** - Validates branch and commits before PR, auto-generates PR description (applies when preparing PRs)
  - **`.cursor/rules/git/git-repository-hygiene.mdc`** - Monitors .gitignore patterns and tracked sensitive files (always active)
  - **`.cursor/rules/git/git-hooks-standards.mdc`** - Standards for configuring git hooks (applies when setting up repositories)
  - **`.cursor/rules/git/git-workflow-integration.mdc`** - Coordinates git operations and validates git status (always active)

### 8.3 Standards (Governing Documents)
All standards are located in `standards/`:

- **Documentation:** `standards/project-planning/documentation-management.md` - Documentation management rules
- **Documentation Index:** `standards/project-planning/documentation-standards.md` - Comprehensive documentation guide and index
- **Cursor Rules:** `standards/process/cursor-rules-standards.md` - Standards for creating and maintaining Cursor rules
- **Linting:** `standards/process/code-quality-linting-standards.md` - Linting requirements, tools, and policies
- **Project Structure:** `standards/project-planning/project-structure.md` - File organization standards
- **Module Structure:** `standards/module-structure.md` - Module organization standards
- **Security:** `standards/security/access-control.md` - Access control and RLS standards
- **Database:** `standards/database/schema.md` - Database schema conventions
- **Architecture:** `standards/architecture/` - Architecture guides and patterns

---

## 9. Quick Reference: When to Use What

| Situation | Command | Checklist | Standard |
|-----------|---------|-----------|----------|
| Starting new task | Auto (`.cursor/rules/task-workflow.mdc` → `pre-flight-check.mdc`) | `pre_flight_checklist_v1_0.md` | - |
| Launching dev env | `./start_app.sh dev` (or `create-start-scripts` if missing) | - | `application-launch.md` |
| Before PR | Auto (`.cursor/rules/pr-review-check.mdc`) | `pr_review_checklist_v1_0.md` | - |
| Lint check | Auto (`.cursor/rules/linting-behavior.mdc`) | `linting_checklist_v1_0.md` | `code-quality-linting-standards.md` |
| Onboarding repo | `audit-project` (`.cursor/commands/audit-project.md`) | `project_audit_checklist_v1_0.md` | `project-structure.md` |
| Security review | `security_audit` (`.cursor/commands/audit-security.mdc`) | `security-audit-checklist.md` | - |
| README review | `audit-readmes` (`.cursor/commands/audit-readmes.md`) | - | `readme-standards.mdc` |
| RLS deep dive | Auto (Supabase rule) | `.cursor/rules/supabase-rls-policy-review.mdc` | `access-control.md` |
| Full health check | `full-project-health-check` | All checklists | All standards |

**Note:** Commands are located in `.cursor/commands/`, checklists in `standards/process/checklists/`, and standards in `standards/`.

---

*Last Updated: 04-12-2025 16:46:02 EST*

**Maintenance:** Update the "Last Updated" date whenever you modify this file. See `.cursor/rules/workflow-standards-documentation-maintenance.mdc` for comprehensive documentation update requirements.
