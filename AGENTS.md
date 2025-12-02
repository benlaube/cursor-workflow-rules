# AI Agent Context & Memory (AGENTS.md)

> **CRITICAL NOTE:** This file is for the **AI Developer Agent** (the entity writing code in the IDE) ONLY.
> - It is **NOT** accessible to runtime AI agents (e.g., chatbots embedded in the web app).
> - It contains build-time context, architectural decisions, and developer memory.
> - **Do not** store runtime secrets or user data here.

> **To the Developer Agent:** Read this file at the start of every session. It contains the high-level context, active goals, and persistent memory of the project. Update it when you complete major milestones or learn something new about the codebase.

---

## 1. Project Mission
**[One-Sentence Mission Statement Here]**
*Example: Build a scalable, AI-powered CRM that automates data enrichment for real estate professionals.*

## 2. Current Phase: [Phase Name, e.g., "Foundation"]
We are currently focusing on:
- [ ] Setting up the core infrastructure (Supabase, Next.js).
- [ ] Establishing coding standards.
- [ ] Building the first "vertical slice" (Auth + Profile).

## 3. Active Context (The "Now")
*What is being worked on right now? Keep this fresh.*
- **Latest Task:** [Insert Task]
- **Blocking Issues:** [Insert Blockers]
- **Next Up:** [Insert Next Steps]

## 4. System Architecture Highlights
*Quick reference for the agent. For full details, see `docs/TECH_STACK.md`.*

> **Action:** Read `docs/TECH_STACK.md` now to understand the allowed tools and libraries.

- **Frontend:** Next.js / React
- **Backend:** Supabase (Edge Functions, Postgres)
- **Auth:** Supabase Auth
- **Styling:** Tailwind CSS

## 5. Persistent Memory (Learnings & Patterns)
*Record things that are not obvious from code but are important.*
- "We decided to use `kebab-case` for all files."
- "Do not use the `fs` module in Edge Functions; use Supabase Storage."
- "When testing, always mock the database using `modules/testing-module`."

## 6. Standard Developer Lifecycle

Follow this lifecycle for all development work. Each step has a corresponding command and checklist.

### 6.1 Before Coding
**Command:** `pre_flight_check`  
**Checklist:** `docs/process/checklists/pre_flight_checklist_v1_0.md`

**Always run this first.** Validates:
- Git branch and working tree status
- Dependencies are installed
- Environment is configured
- Baseline tests and build pass

### 6.2 Launch Development Environment
**Command:** `launch_application_dev`  
**Standard:** `standards/deployment/application-launch.md`

After pre-flight passes, launch the dev environment. Handles:
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
**Command:** `pr_review_check`  
**Checklist:** `docs/process/checklists/pr_review_checklist_v1_0.md`

**Required before every PR.** Validates:
- Code quality (lint, format, types)
- Functionality (build, tests)
- Security (no secrets, input validation)
- Documentation (functions documented, CHANGELOG updated)

### 6.5 Periodic / Before Releases
**Commands:**
- `project_audit` - Full project structure validation
- `security_audit` - Security vulnerabilities scan
- `rls_policy_review` - Deep RLS policy analysis
- `full_project_health_check` - Run all audits together

**Checklists:**
- `docs/process/checklists/project_audit_checklist_v1_0.md`
- `docs/process/checklists/security_audit_checklist_v1_0.md`
- `docs/process/checklists/rls_policy_review_checklist_v1_0.md`

Run these:
- When onboarding a new repository
- Before major refactoring
- Before major releases
- Weekly/monthly for active projects

---

## 7. Agent Rules of Engagement

### 7.1 Pre-Flight (Before Any Coding)
1. **Always run `pre_flight_check`** before starting significant work
   - Ensures clean environment and baseline integrity
   - Prevents working on broken codebase

### 7.2 Standards First
2. **Check Standards First:** Look in `standards/` before guessing
   - Architecture decisions: `standards/architecture/`
   - Coding patterns: `standards/` (root level)
   - Database: `standards/database/`
   - Security: `standards/security/`

### 7.3 Project Onboarding
3. **For new repositories or major refactors, run `project_audit`**
   - Validates structure against standards
   - Identifies gaps and action items
   - Use `full_project_health_check` for comprehensive review

### 7.4 Pre-PR Validation
4. **Before merging, always run `pr_review_check`**
   - Ensures code quality and security
   - Validates documentation and changelog
   - Prevents broken code from entering main branch

### 7.5 Security-Sensitive Changes
5. **For security-sensitive changes, run `security_audit` and `rls_policy_review`**
   - Validates no secrets are committed
   - Checks RLS policies are secure
   - Ensures input validation and rate limiting

### 7.6 Documentation
6. **Update Docs:** If you change the architecture, update the docs
   - Update `standards/` if architecture changes
   - Update `CHANGELOG.md` for user-facing changes
   - See `standards/documentation.md` Section 7 for changelog guidelines

### 7.7 Safe Operations
7. **Safe Mode:** Do not delete data without confirmation
8. **Log Complex Logic:** If running a big migration, write to `/logs/migration_X.log` first

### 7.8 Temporal Awareness
9. **Temporal Awareness:** Always check the current date when responding to time-sensitive prompts
   - Use `date` command or system date functions
   - See `.cursor/rules/environment.mdc` Section 5 for details

---

## 8. Related Checklists & Commands

### 8.1 Checklists (Human-Readable Validation)
All checklists are located in `docs/process/checklists/`:

- **Pre-Flight:** `docs/process/checklists/pre_flight_checklist_v1_0.md`
  - Validates environment and repo state before coding
  - Related command: `pre_flight_check`

- **PR Review:** `docs/process/checklists/pr_review_checklist_v1_0.md`
  - Validates code quality, security, and documentation before PR
  - Related command: `pr_review_check`

- **Project Audit:** `docs/process/checklists/project_audit_checklist_v1_0.md`
  - Audits project structure, modules, database, and code hygiene
  - Related command: `project_audit`

- **Security Audit:** `docs/process/checklists/security_audit_checklist_v1_0.md`
  - Validates security posture (secrets, dependencies, RLS, API security)
  - Related command: `security_audit`
  - Related standard: `docs/process/security_audit_standards_v1_0.md`

- **RLS Policy Review:** `docs/process/checklists/rls_policy_review_checklist_v1_0.md`
  - Deep-dive RLS policy analysis and validation
  - Related command: `rls_policy_review`

### 8.2 Commands (Executable Workflows)
All commands are located in `.cursor/commands/`:

- **`pre_flight_check`** - Environment validation before coding
- **`launch_application_dev`** - Launch development environment
- **`pr_review_check`** - Pre-PR validation
- **`project_audit`** - Project structure and standards validation
- **`security_audit`** - Security vulnerabilities and secrets scan
- **`rls_policy_review`** - Deep RLS policy analysis
- **`full_project_health_check`** - Run all audits together (meta-command)
- **`verify_access_control`** - Access control validation

### 8.3 Standards (Governing Documents)
All standards are located in `standards/`:

- **Documentation:** `standards/documentation.md` - Documentation management rules
- **Project Structure:** `standards/project-structure.md` - File organization standards
- **Module Structure:** `standards/module-structure.md` - Module organization standards
- **Security:** `standards/security/access-control.md` - Access control and RLS standards
- **Database:** `standards/database/schema.md` - Database schema conventions
- **Architecture:** `standards/architecture/` - Architecture guides and patterns

---

## 9. Quick Reference: When to Use What

| Situation | Command | Checklist | Standard |
|-----------|---------|-----------|----------|
| Starting new task | `pre_flight_check` | `pre_flight_checklist_v1_0.md` | - |
| Launching dev env | `launch_application_dev` | - | `application-launch.md` |
| Before PR | `pr_review_check` | `pr_review_checklist_v1_0.md` | - |
| Onboarding repo | `project_audit` | `project_audit_checklist_v1_0.md` | `project-structure.md` |
| Security review | `security_audit` | `security_audit_checklist_v1_0.md` | `security_audit_standards_v1_0.md` |
| RLS deep dive | `rls_policy_review` | `rls_policy_review_checklist_v1_0.md` | `access-control.md` |
| Full health check | `full_project_health_check` | All checklists | All standards |

---

*Last Updated: 2025-11-25*
