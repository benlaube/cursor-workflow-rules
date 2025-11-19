# Checklist: Project Audit

Use this checklist to audit an existing project against the `ai-agent-knowledge-base` standards.

## 1. Project Structure
- [ ] Does the root directory match `standards/project-structure.md`?
    - [ ] `src/` exists and contains app logic.
    - [ ] `docs/` exists.
    - [ ] `.cursor/` exists.
- [ ] Are configuration files in the right place?
    - [ ] `.env` is git-ignored.
    - [ ] `.env.example` exists.

## 2. Module Usage
- [ ] Are reusable modules located in a dedicated folder (e.g., `src/modules` or `packages/`)?
- [ ] Do modules follow `standards/module-structure.md`?
    - [ ] Each module has a `README.md`.
    - [ ] Each module has an `index.ts`.
    - [ ] Database modules have `migrations/`.

## 3. Database & Architecture
- [ ] Do all database tables have comments? (Check `standards/database/schema.md`)
- [ ] Are RLS policies enabled on all tables?
- [ ] Is there a clear separation between "Service Layer" (logic) and "API Layer" (routes)?

## 4. Code Hygiene
- [ ] Are there any files larger than 200 lines? (Candidate for refactoring)
- [ ] Are there any "magic strings" or hardcoded secrets?
- [ ] Do all exported functions have JSDoc comments?

## 5. Documentation
- [ ] Is there a `README.md` in the root?
- [ ] Is there a `docs/ROADMAP.md`?
- [ ] Is there a `docs/ARCHITECTURE.md`?

## 6. Action Items
List any violations found above and create tasks to fix them.

- [ ] Fix: ...
- [ ] Fix: ...
