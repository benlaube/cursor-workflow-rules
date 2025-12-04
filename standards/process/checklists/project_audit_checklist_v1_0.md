# Project Audit Checklist

**Type:** Comprehensive Project Audit Checklist – used by Cursor commands and human devs to validate project structure, modules, database, code hygiene, and documentation against ai-agent-knowledge-base standards.

**Description:** Comprehensive checklist to audit an existing project against the ai-agent-knowledge-base standards for structure, modules, database, code hygiene, and documentation.

**Created:** 2025-11-25 11:30

**Last Updated:** 2025-12-02

**Version:** 1.1

**Related Command:** `.cursor/commands/project-audit.md`

---

## How to Use This Checklist

Use this checklist to audit an existing project against the `ai-agent-knowledge-base` standards. This is ideal when:
- Onboarding a new repository into the "Workflow Rules" universe
- Before major refactoring
- Periodic health checks (weekly/monthly)

**Automated Checks:** The `project-audit.md` command performs many of these checks automatically. Use this checklist for manual verification and comprehensive review.

---

## 1. Project Structure

**Checklist Items:**
- [ ] Does the root directory match `standards/project-structure.md`?
    - [ ] `src/` exists and contains app logic.
    - [ ] `docs/` exists.
    - [ ] `.cursor/` exists.
- [ ] Are configuration files in the right place?
    - [ ] `.env` is git-ignored.
    - [ ] `.env.example` exists.

**Validation:**
- Check root directory structure against `standards/project-structure.md`
- Verify `.env` is in `.gitignore`: `grep -q "^\.env$" .gitignore`
- Verify `.env.example` exists

---

## 2. Module Usage

**Checklist Items:**
- [ ] Are reusable modules located in a dedicated folder (e.g., `src/modules` or `packages/`)?
- [ ] Do modules follow `standards/module-structure.md`?
    - [ ] Each module has a `README.md`.
    - [ ] Each module has an `index.ts` (or `index.js`, `index.py`).
    - [ ] Database modules have `migrations/`.

**Validation:**
- Check if modules are in dedicated folder (`src/modules`, `modules/`, or `packages/`)
- For each module, verify:
  - `README.md` exists
  - `index.ts` (or equivalent) exists
  - Database modules have `migrations/` directory

---

## 3. Database & Architecture

**Checklist Items:**
- [ ] Do all database tables have comments? (Check `standards/database/schema.md`)
- [ ] Are RLS policies enabled on all tables?
- [ ] Is there a clear separation between "Service Layer" (logic) and "API Layer" (routes)?

**Validation:**
- If Supabase project: Use Supabase MCP to check table comments
- Check for `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` in migrations
- Review code structure for clear separation of concerns

---

## 4. Code Hygiene

**Checklist Items:**
- [ ] Are there any files larger than 200 lines? (Candidate for refactoring)
- [ ] Are there any "magic strings" or hardcoded secrets?
- [ ] Do all exported functions have JSDoc comments?

**Validation:**
- Find files > 200 lines: `find . -type f -name "*.ts" -o -name "*.js" -o -name "*.py" | xargs wc -l | awk '$1 > 200'`
- Scan for hardcoded secrets: `grep -rE "sk_live|ghp_|password.*=" . --exclude-dir={node_modules,.git}`
- Check exported functions for JSDoc/Pydoc comments

---

## 5. Documentation

**Checklist Items:**
- [ ] Is there a `README.md` in the root?
- [ ] Is there a `docs/ROADMAP.md` or roadmap files?
- [ ] Is there a `docs/ARCHITECTURE.md` or architecture docs?

**Validation:**
- Check for required documentation files
- Verify documentation is up to date

---

## 6. Action Items

List any violations found above and create tasks to fix them.

- [ ] Fix: ...
- [ ] Fix: ...

---

*This is the comprehensive checklist for project audit validation. Use the `project-audit.md` command for automated checks, and this checklist for manual verification.*

