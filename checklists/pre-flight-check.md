# Pre-Flight Checklist

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

