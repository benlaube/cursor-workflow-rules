---
description: Run pre-flight checks before starting any coding task. Validates environment, git status, dependencies, and baseline integrity.
version: 1.0.0
lastUpdated: 2025-12-02
globs: 
---

# Pre-Flight Check Command

Use this command to validate your environment and repository state before starting any coding task. This is the **first command** you should run before making significant changes.

**Source Checklist:** `standards/development-checklists/pre-flight-checklist.md` (comprehensive pre-flight checklist)

## Usage

@agent: When starting a new task or before making significant changes, run this command first.

**Parameters:**
- `skip-tests`: `true` or `false` (default: `false`). Skip running tests (faster, but less thorough).

---

## Execution Steps

### 1. Git Status Validation
1. **Check Current Branch:**
   - Get current branch: `git branch --show-current`
   - Verify branch name follows format: `project-taskId-short-title`
   - If on `main` or `master`, warn: "⚠️ You are on main branch. Consider creating a feature branch."
   - If branch name doesn't match format, suggest: "Consider renaming to match format: `project-taskId-short-title`"

2. **Check Working Tree:**
   - Run: `git status --porcelain`
   - If there are uncommitted changes:
     - List them
     - Warn: "⚠️ Working tree is not clean. Consider committing or stashing changes before proceeding."
   - If clean: ✅ "Working tree is clean"

3. **Sync with Remote:**
   - Check if behind: `git fetch origin && git rev-list HEAD..origin/main --count`
   - If behind, warn: "⚠️ Local branch is behind origin/main. Run `git pull origin main` to sync."
   - If up to date: ✅ "Local branch is synced with origin/main"

### 2. Environment Validation
1. **Dependencies Check:**
   - **Node.js:** Check if `node_modules` exists and is recent
     - If missing or stale: Run `npm install` (or `yarn install` / `pnpm install` based on lockfile)
   - **Python:** Check if `.venv` exists
     - If missing: Create `.venv` and run `pip install -r requirements.txt`
   - ✅ "Dependencies are up to date"

2. **Configuration Check:**
   - Verify `.env` exists (or `.env.local` for Next.js)
   - If missing:
     - Check for `.env.example`
     - If exists, copy: `cp .env.example .env`
     - Warn: "⚠️ Created `.env` from `.env.example`. Please fill in required secrets."
   - Compare `.env` with `.env.example`:
     - List any missing keys from `.env.example` that aren't in `.env`
     - Warn about missing keys
   - ✅ "Configuration file exists and has required keys"

3. **Secrets Validation:**
   - Check if secrets are loaded (verify `settings-manager` or env vars are accessible)
   - For Supabase projects: Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set
   - ✅ "Secrets are properly configured"

### 3. Baseline Integrity
*Unless `skip-tests=true`*

1. **Tests:**
   - Run: `npm test` (or equivalent test command)
   - If tests fail:
     - Display failing tests
     - **ABORT:** "❌ Tests are failing. Fix tests before proceeding."
   - If pass: ✅ "All tests pass"

2. **Build:**
   - Run: `npm run build` (or equivalent build command)
   - If build fails:
     - Display build errors
     - **ABORT:** "❌ Build is failing. Fix build errors before proceeding."
   - If succeeds: ✅ "Project builds successfully"

3. **Linter:**
   - Run: `npm run lint` (or equivalent lint command)
   - If linter errors exist:
     - Display errors
     - Warn: "⚠️ Linter errors found. Consider fixing before adding new code."
     - Option to auto-fix: `npm run lint -- --fix` (if available)
   - If clean: ✅ "No linter errors"
   - **Reference:** See `standards/process/linting.md` Section 6.1 for detailed pre-flight lint requirements

### 4. Task Understanding
1. **Requirements Check:**
   - Prompt: "Do you understand the goal of this task?"
   - If unclear, suggest reviewing task description or requirements

2. **Documentation Review:**
   - Check if relevant standards exist in `standards/`
   - List relevant standards for the task
   - Suggest: "Review relevant standards before proceeding"

3. **Planning:**
   - Prompt: "Do you have a clear plan or todo list?"
   - If not, suggest creating a todo list

---

## Output

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

This command is referenced in `AGENTS.md` as the **first step** in the standard developer lifecycle. Always run this before starting significant coding work.

