# AI Agent Context & Memory (AGENTS.md)

> **TEMPLATE NOTE:** This is a template file. When integrating this standards library into your project:
>
> 1. Copy this file to your project root as `AGENTS.md`
> 2. Customize all sections with your project-specific information
> 3. Remove this template note
> 4. Update the "Last Updated" date
> 5. See `STANDARDS_INTEGRATION_GUIDE.md` for complete integration instructions

## Metadata

- **Created:** [Date when you create your AGENTS.md]
- **Last Updated:** [Date]
- **Version:** 1.0
- **Description:** Project context and memory for AI Developer Agent

> **CRITICAL NOTE:** This file is for the **AI Developer Agent** (the entity writing code in the IDE) ONLY.
>
> - It is **NOT** accessible to runtime AI agents (e.g., chatbots embedded in the web app).
> - It contains build-time context, architectural decisions, and developer memory.
> - **Do not** store runtime secrets or user data here.

> **To the Developer Agent:** Read this file at the start of every session. It contains the high-level context, active goals, and persistent memory of the project. Update it when you complete major milestones or learn something new about the codebase.

---

## 1. Project Mission

**[One-Sentence Mission Statement Here]**

**Format:** Start with a verb (Build, Create, Develop) and be specific about the problem you're solving.

_Example: Build a scalable, AI-powered CRM that automates data enrichment for real estate professionals._
_Example: Create a multi-tenant SaaS platform for managing customer support tickets with AI-powered routing._

## 2. Current Phase: [Phase Name, e.g., "Foundation"]

We are currently focusing on:

- [ ] Setting up the core infrastructure (Supabase, Next.js).
- [ ] Establishing coding standards.
- [ ] Building the first "vertical slice" (Auth + Profile).

## 3. Active Context (The "Now")

_What is being worked on right now? Keep this fresh - update at the start of each session._

- **Latest Task:** [Insert Task - be specific, e.g., "Implementing user authentication flow with Supabase Auth"]
- **Blocking Issues:** [Insert Blockers - or "None currently" if clear]
- **Next Up:** [Insert Next Steps - what comes after current task]
- **Context Notes:** [Optional: Any important context for the current work]

## 4. System Architecture Highlights

_Quick reference for the agent. For full details, see `standards/tech-stack-document.md` or `docs/TECH_STACK.md` (create one if it doesn't exist)._

> **Action:** Create or read your tech stack documentation to understand allowed tools and libraries.

- **Frontend:** [Your frontend stack, e.g., Next.js / React]
- **Backend:** [Your backend stack, e.g., Supabase (Edge Functions, Postgres)]
- **Auth:** [Your auth solution, e.g., Supabase Auth]
- **Styling:** [Your styling solution, e.g., Tailwind CSS]

## 5. Persistent Memory (Learnings & Patterns)

_Record things that are not obvious from code but are important. Add entries as you discover them._

**What to Record:**

- Architectural decisions and their rationale
- Naming conventions specific to this project
- Gotchas or common pitfalls
- Integration patterns that work well
- Things that differ from standard practices

**Examples:**

- "[Example: We decided to use `kebab-case` for all files.]"
- "[Example: Do not use the `fs` module in Edge Functions; use Supabase Storage.]"
- "[Example: When testing, always mock the database using `modules/testing-module`.]"
- "[Example: All API routes must use the `backend-api` module wrapper for consistent error handling.]"

## 6. Standard Developer Lifecycle

Follow this lifecycle for all development work. Each step has a corresponding command and checklist.

### 6.1 Before Coding

**Command:** `pre-flight-check` (`.cursor/commands/pre-flight-check.md`)  
**Checklist:** `standards/process/checklists/pre-flight-checklist.md`

**Always run this first.** Validates:

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

**Command:** `pr-review-check` (`.cursor/commands/pr-review-check.md`)  
**Checklist:** `standards/process/checklists/pr-review-checklist.md`

**Required before every PR.** Validates:

- Code quality (lint, format, types)
- Functionality (build, tests)
- Security (no secrets, input validation)
- Documentation (functions documented, CHANGELOG updated)

### 6.5 Periodic / Before Releases

**Commands:**

- `project-audit` (`.cursor/commands/project-audit.md`) - Full project structure validation
- `security_audit` (`.cursor/commands/security-audit.mdc`) - Security vulnerabilities scan
- `full-project-health-check` - Run all audits together

**Checklists:**

- `standards/process/checklists/project-audit-checklist.md`
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

### 7.1 Pre-Flight (Before Any Coding)

1. **Always run `pre-flight-check`** (`.cursor/commands/pre-flight-check.md`) before starting significant work
   - Ensures clean environment and baseline integrity
   - Prevents working on broken codebase

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

4. **Before merging, always run `pr-review-check`**
   - Ensures code quality and security
   - Validates documentation and changelog
   - Prevents broken code from entering main branch

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
   - **Follow `.cursor/rules/workflow-standards-documentation-maintenance.mdc`** for comprehensive documentation update requirements (if applicable)
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

All checklists are located in `standards/process/checklists/` and `standards/security/`:

- **Pre-Flight:** `standards/process/checklists/pre-flight-checklist.md`
  - Validates environment and repo state before coding
  - Related command: `pre-flight-check` (`.cursor/commands/pre-flight-check.md`)

- **PR Review:** `standards/process/checklists/pr-review-checklist.md`
  - Validates code quality, security, and documentation before PR
  - Related command: `pr-review-check` (`.cursor/commands/pr-review-check.md`)

- **Project Audit:** `standards/process/checklists/project-audit-checklist.md`
  - Audits project structure, modules, database, and code hygiene
  - Related command: `project-audit` (`.cursor/commands/project-audit.md`)

- **Security Audit:** `standards/security/security-audit-checklist.md`
  - Validates security posture (secrets, dependencies, RLS, API security)
  - Related command: `security_audit` (`.cursor/commands/audit-security.mdc`)

- **RLS Policy Review:** `.cursor/rules/supabase-rls-policy-review.mdc`
  - Deep-dive RLS policy analysis and validation
  - Auto-applied when Supabase is detected in the project
  - Related standard: `standards/security/access-control.md`

### 8.2 Commands (Executable Workflows)

All commands are located in `.cursor/commands/`:

- **`pre-flight-check`** (`.cursor/commands/pre-flight-check.md`) - Environment validation before coding
- **`create-start-scripts`** (`.cursor/commands/create-start-scripts.md`) - Generate launch scripts (`start_app.sh` and `scripts/*.sh`)
- **`pr-review-check`** (`.cursor/commands/pr-review-check.md`) - Pre-PR validation
- **`project-audit`** (`.cursor/commands/project-audit.md`) - Project structure and standards validation
- **`security_audit`** (`.cursor/commands/security-audit.mdc`) - Security vulnerabilities and secrets scan
- **`full-project-health-check`** - Run all audits together (meta-command)
- **`verify_access_control`** - Access control validation

**Rules (Auto-Applied):**

- **`.cursor/rules/supabase-rls-policy-review.mdc`** - Deep RLS policy analysis (applies automatically when Supabase detected)
- **`.cursor/rules/workflow-standards-documentation-maintenance.mdc`** - Documentation maintenance requirements (if applicable to your project)

### 8.3 Standards (Governing Documents)

All standards are located in `standards/`:

- **Documentation:** `standards/project-planning/documentation-management.md` - Documentation management rules
- **Documentation Index:** `standards/project-planning/documentation-standards.md` - Comprehensive documentation guide and index
- **Project Structure:** `standards/project-structure.md` - File organization standards
- **Module Structure:** `standards/module-structure.md` - Module organization standards
- **Security:** `standards/security/access-control.md` - Access control and RLS standards
- **Database:** `standards/database/schema.md` - Database schema conventions
- **Architecture:** `standards/architecture/` - Architecture guides and patterns

---

## 9. Quick Reference: When to Use What

| Situation         | Command                                                     | Checklist                                                 | Standard                |
| ----------------- | ----------------------------------------------------------- | --------------------------------------------------------- | ----------------------- |
| Starting new task | `pre-flight-check` (`.cursor/commands/pre-flight-check.md`) | `standards/process/checklists/pre-flight-checklist.md`    | -                       |
| Launching dev env | `./start_app.sh dev` (or `create-start-scripts` if missing) | -                                                         | `application-launch.md` |
| Before PR         | `pr-review-check` (`.cursor/commands/pr-review-check.md`)   | `standards/process/checklists/pr-review-checklist.md`     | -                       |
| Onboarding repo   | `project-audit` (`.cursor/commands/project-audit.md`)       | `standards/process/checklists/project-audit-checklist.md` | `project-structure.md`  |
| Security review   | `security_audit` (`.cursor/commands/audit-security.mdc`)    | `standards/security/security-audit-checklist.md`          | -                       |
| RLS deep dive     | Auto (Supabase rule)                                        | `.cursor/rules/supabase-rls-policy-review.mdc`            | `access-control.md`     |
| Full health check | `full-project-health-check`                                 | All checklists                                            | All standards           |

**Note:** Commands are located in `.cursor/commands/`, checklists in `standards/process/checklists/` and `standards/security/`, and standards in `standards/`. Adjust paths if your project structure differs.

---

_Last Updated: [Update this date when you customize the template]_

**Maintenance:** Update the "Last Updated" date whenever you modify this file. See `.cursor/rules/workflow-standards-documentation-maintenance.mdc` for comprehensive documentation update requirements (if applicable).
