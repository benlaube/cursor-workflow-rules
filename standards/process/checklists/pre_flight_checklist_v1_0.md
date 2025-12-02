# Pre-Flight Checklist

**Type:** Comprehensive Pre-Flight Checklist – used by Cursor commands and human devs to validate environment and repo state before proceeding with coding tasks.

**Description:** Comprehensive checklist combining actionable validation items with detailed execution steps for pre-flight checks. Covers git status, environment validation, baseline integrity, and task understanding.

**Created:** 2025-11-25 11:30

**Last Updated:** 2025-12-02

**Version:** 1.1

**Related Command:** `.cursor/commands/pre-flight-check.md`

---

## How to Use This Checklist

This checklist combines actionable validation items with detailed execution guidance. Use it to:
- Validate environment before starting coding tasks
- Ensure clean git state and synced branches
- Verify dependencies and configuration
- Confirm baseline integrity (tests, build, linter)
- Understand task requirements

**Automated Checks:** The `pre-flight-check.md` command performs many of these checks automatically. Use this checklist for manual verification and comprehensive review.

**Important:** This is the **first command** you should run before making significant changes.

---

## 1. Git Status Validation

### 1.1 Branch Check

**Checklist Items:**
- [ ] **Branch:** Am I on the correct feature branch? (Format: `project-taskId-short-title`)
- [ ] **Main Branch:** Verify not on `main` or `master` branch
- [ ] **Branch Format:** Ensure branch name follows naming convention

**Execution Steps:**
1. **Check Current Branch:**
   - Get current branch: `git branch --show-current`
   - Verify branch name follows format: `project-taskId-short-title`
   - If on `main` or `master`, warn: "⚠️ You are on main branch. Consider creating a feature branch."
   - If branch name doesn't match format, suggest: "Consider renaming to match format: `project-taskId-short-title`"

### 1.2 Working Tree Check

**Checklist Items:**
- [ ] **Clean Tree:** Is the working tree clean? (`git status`)
- [ ] **Uncommitted Changes:** Review and commit or stash uncommitted changes
- [ ] **Clean State:** Ensure working tree is clean before proceeding

**Execution Steps:**
1. **Check Working Tree:**
   - Run: `git status --porcelain`
   - If there are uncommitted changes:
     - List them
     - Warn: "⚠️ Working tree is not clean. Consider committing or stashing changes before proceeding."
   - If clean: ✅ "Working tree is clean"

### 1.3 Sync with Remote

**Checklist Items:**
- [ ] **Sync:** Have I pulled the latest changes from `main`? (`git pull origin main`)
- [ ] **Behind Remote:** Check if local branch is behind origin/main
- [ ] **Up to Date:** Ensure local branch is synced with remote

**Execution Steps:**
1. **Sync with Remote:**
   - Check if behind: `git fetch origin && git rev-list HEAD..origin/main --count`
   - If behind, warn: "⚠️ Local branch is behind origin/main. Run `git pull origin main` to sync."
   - If up to date: ✅ "Local branch is synced with origin/main"

---

## 2. Environment Validation

### 2.1 Dependencies Check

**Checklist Items:**
- [ ] **Dependencies:** Are dependencies up to date? (`npm install`, `pip install`, etc.)
- [ ] **Node Modules:** Verify `node_modules` exists and is recent
- [ ] **Python Venv:** Verify `.venv` exists (for Python projects)
- [ ] **Install Dependencies:** Install missing or stale dependencies

**Execution Steps:**
1. **Dependencies Check:**
   - **Node.js:** Check if `node_modules` exists and is recent
     - If missing or stale: Run `npm install` (or `yarn install` / `pnpm install` based on lockfile)
   - **Python:** Check if `.venv` exists
     - If missing: Create `.venv` and run `pip install -r requirements.txt`
   - ✅ "Dependencies are up to date"

### 2.2 Configuration Check

**Checklist Items:**
- [ ] **Configuration:** Does `.env` exist and have the necessary keys? (Compare with `.env.example`)
- [ ] **Environment File:** Verify `.env` exists (or `.env.local` for Next.js)
- [ ] **Required Keys:** Compare `.env` with `.env.example` for missing keys
- [ ] **Create from Example:** Create `.env` from `.env.example` if missing

**Execution Steps:**
1. **Configuration Check:**
   - Verify `.env` exists (or `.env.local` for Next.js)
   - If missing:
     - Check for `.env.example`
     - If exists, copy: `cp .env.example .env`
     - Warn: "⚠️ Created `.env` from `.env.example`. Please fill in required secrets."
   - Compare `.env` with `.env.example`:
     - List any missing keys from `.env.example` that aren't in `.env`
     - Warn about missing keys
   - ✅ "Configuration file exists and has required keys"

### 2.3 Secrets Validation

**Checklist Items:**
- [ ] **Secrets:** Are secrets properly loaded via `settings-manager` or environment variables?
- [ ] **Secrets Accessible:** Verify secrets are accessible
- [ ] **Supabase Keys:** For Supabase projects, verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set

**Execution Steps:**
1. **Secrets Validation:**
   - Check if secrets are loaded (verify `settings-manager` or env vars are accessible)
   - For Supabase projects: Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set
   - ✅ "Secrets are properly configured"

---

## 3. Baseline Integrity

### 3.1 Tests

**Checklist Items:**
- [ ] **Tests:** Do the current tests pass? (Run the standard test command)
- [ ] **Test Failures:** Fix any failing tests before proceeding
- [ ] **Skip Tests:** Only skip if `skip-tests=true` parameter is set

**Execution Steps:**
*Unless `skip-tests=true`*

1. **Tests:**
   - Run: `npm test` (or equivalent test command)
   - If tests fail:
     - Display failing tests
     - **ABORT:** "❌ Tests are failing. Fix tests before proceeding."
   - If pass: ✅ "All tests pass"

### 3.2 Build

**Checklist Items:**
- [ ] **Build:** Does the project build/start without errors?
- [ ] **Build Errors:** Fix any build errors before proceeding
- [ ] **Build Success:** Verify project builds successfully

**Execution Steps:**
1. **Build:**
   - Run: `npm run build` (or equivalent build command)
   - If build fails:
     - Display build errors
     - **ABORT:** "❌ Build is failing. Fix build errors before proceeding."
   - If succeeds: ✅ "Project builds successfully"

### 3.3 Linter

**Checklist Items:**
- [ ] **Linter:** Are there existing linter errors? (Ideally, fix or note them before adding code)
- [ ] **Linter Errors:** Review and fix existing linter errors
- [ ] **Auto-Fix:** Attempt to auto-fix linter errors if possible

**Execution Steps:**
1. **Linter:**
   - Run: `npm run lint` (or equivalent lint command)
   - If linter errors exist:
     - Display errors
     - Warn: "⚠️ Linter errors found. Consider fixing before adding new code."
     - Option to auto-fix: `npm run lint -- --fix` (if available)
   - If clean: ✅ "No linter errors"
   - **Reference:** See `standards/process/linting.md` Section 6.1 for detailed pre-flight lint requirements
   - **Reference:** See `standards/process/linting.md` Section 6.1 for detailed pre-flight lint requirements

---

## 4. Task Understanding

### 4.1 Requirements Check

**Checklist Items:**
- [ ] **Requirements:** Do I understand the goal of this task?
- [ ] **Task Description:** Review task description or requirements
- [ ] **Clarify:** Ask for clarification if task is unclear

**Execution Steps:**
1. **Requirements Check:**
   - Prompt: "Do you understand the goal of this task?"
   - If unclear, suggest reviewing task description or requirements

### 4.2 Documentation Review

**Checklist Items:**
- [ ] **Docs:** Have I reviewed the relevant standards in `standards/`?
- [ ] **Relevant Standards:** Identify and review relevant standards
- [ ] **Standards Location:** Check `standards/` for relevant documentation

**Execution Steps:**
1. **Documentation Review:**
   - Check if relevant standards exist in `standards/`
   - List relevant standards for the task
   - Suggest: "Review relevant standards before proceeding"

### 4.3 Planning

**Checklist Items:**
- [ ] **Plan:** Do I have a clear plan or todo list?
- [ ] **Create Plan:** Create a todo list if one doesn't exist
- [ ] **Task Breakdown:** Break down task into manageable steps

**Execution Steps:**
1. **Planning:**
   - Prompt: "Do you have a clear plan or todo list?"
   - If not, suggest creating a todo list

---

## Output Format

### Success Case
```
✅ Pre-flight check complete – safe to start coding.

Summary:
- Git: Clean working tree, synced with origin/main
- Environment: Dependencies installed, .env configured
- Baseline: Tests pass, build succeeds, no linter errors
- Task: Ready to proceed
```

### Failure Case
```
❌ Pre-flight check failed. Please address the following:

Issues:
- Git: Working tree has uncommitted changes
- Tests: 2 tests failing in auth.test.ts
- Linter: 5 errors in src/utils/helpers.ts

Action required: Fix issues above before proceeding.
```

---

## Self-Healing Actions

This command will automatically:
- Install missing dependencies
- Create `.env` from `.env.example` if missing
- Attempt to auto-fix linter errors (if `--fix` flag available)

---

## Related Commands

- `launch_application_dev` - Launch development environment (runs after pre-flight)
- `pr-review-check` - Validate before submitting PR
- `project-audit` - Full project health check

---

## Integration with AGENTS.md

This checklist is referenced in `AGENTS.md` as the **first step** in the standard developer lifecycle. Always run this before starting significant coding work.

---

*This is the comprehensive checklist for pre-flight validation. Use the `pre-flight-check.md` command for automated checks, and this checklist for manual verification.*

