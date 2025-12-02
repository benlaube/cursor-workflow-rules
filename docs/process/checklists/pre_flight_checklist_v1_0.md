# Pre_Flight_Checklist_v1.0

**Type:** Checklist – used by Cursor commands and human devs to validate environment and repo state before proceeding with coding tasks.

**Description:** Pre-task environment and repo sanity checklist to run before coding.

**Created:** 2025-11-25 11:30

**Last_Updated:** 2025-11-25 11:30

**Related Command:** `.cursor/commands/pre_flight_check.md`

---

Before starting any coding task, run through this checklist to ensure a clean and stable environment.

## 1. Git Status
- [ ] **Branch:** Am I on the correct feature branch? (Format: `project-taskId-short-title`)
- [ ] **Clean Tree:** Is the working tree clean? (`git status`)
- [ ] **Sync:** Have I pulled the latest changes from `main`? (`git pull origin main`)

## 2. Environment Validation
- [ ] **Dependencies:** Are dependencies up to date? (`npm install`, `pip install`, etc.)
- [ ] **Configuration:** Does `.env` exist and have the necessary keys? (Compare with `.env.example`)
- [ ] **Secrets:** Are secrets properly loaded via `settings-manager` or environment variables?

## 3. Baseline Integrity
- [ ] **Tests:** Do the current tests pass? (Run the standard test command)
- [ ] **Build:** Does the project build/start without errors?
- [ ] **Linter:** Are there existing linter errors? (Ideally, fix or note them before adding code)

## 4. Task Understanding
- [ ] **Requirements:** Do I understand the goal of this task?
- [ ] **Docs:** Have I reviewed the relevant standards in `standards/`?
- [ ] **Plan:** Do I have a clear plan or todo list?

---
*Automated by Cursor Replit-Mode Bundle*

