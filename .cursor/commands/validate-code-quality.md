---
description: Run lint checks independently or as part of pre-flight and PR review workflows. Validates code quality through linting tools.
version: 1.1.0
lastUpdated: 04-12-2025 13:08:13 EST
globs: 
---

# Lint Check Command

Use this command to run lint checks independently or as part of pre-flight and PR review workflows. This command can be called standalone or integrated into other validation commands.

**Source Checklist:** `standards/process/checklists/linting_checklist_v1_0.md`

**Related Standard:** `standards/process/code-quality-linting-standards.md`

## Usage

@agent: When asked to "check linting", "run linter", or "validate code quality", use this command.

**Parameters:**
- `auto-fix`: `true` or `false` (default: `false`). Attempt to auto-fix linting issues when possible.
- `scope`: `all`, `changed`, or `file:<path>` (default: `all`). Scope of files to lint.
- `strict`: `true` or `false` (default: `false`). Treat warnings as errors.

---

## Execution Steps

### 1. Detect Linter Configuration

1. **Check for Linter Config:**
   - **JavaScript/TypeScript:** Look for `.eslintrc.*`, `eslint.config.*`, or `package.json` with ESLint config
   - **Python:** Look for `ruff.toml`, `pyproject.toml` with Ruff config, or `setup.cfg` with Flake8
   - **Other:** Detect based on project structure and common patterns

2. **Verify Config Exists:**
   - If no config found: ⚠️ "No linter configuration found. Consider setting up ESLint/Ruff/etc."
   - If config found: ✅ "Linter configuration detected"

### 2. Determine Lint Command

1. **Detect Package Manager:**
   - Check for `package-lock.json` (npm), `yarn.lock` (yarn), `pnpm-lock.yaml` (pnpm)
   - Check for `requirements.txt` or `pyproject.toml` (Python)

2. **Determine Lint Command:**
   - **Node.js:** `npm run lint` (or `yarn lint`, `pnpm lint`)
   - **Python:** `python -m ruff .` (or `flake8 .`, `pylint .`)
   - **TypeScript:** `tsc --noEmit` (for type checking)

3. **Check for Auto-Fix:**
   - **Node.js:** `npm run lint -- --fix` (if available)
   - **Python:** `python -m ruff . --fix` (if available)

### 3. Run Linter

1. **Execute Lint Command:**
   - Run the determined lint command
   - Capture output and exit code

2. **Handle Results:**
   - If exit code 0: ✅ "Linter passed with no errors"
   - If exit code != 0:
     - Display lint errors/warnings
     - If `auto-fix=true`, proceed to auto-fix step
     - If `auto-fix=false`, report errors

### 4. Auto-Fix (if requested)

1. **Attempt Auto-Fix:**
   - If `auto-fix=true` and auto-fix command available:
     - Run auto-fix command (e.g., `npm run lint -- --fix`)
     - Re-run linter to verify fixes
     - Report results

2. **Report Auto-Fix Results:**
   - If all issues fixed: ✅ "All linting issues auto-fixed"
   - If some issues remain: ⚠️ "Some linting issues require manual fixes"
   - If auto-fix failed: ❌ "Auto-fix failed. Manual intervention required"

### 5. Scope Handling

1. **If `scope=changed`:**
   - Detect changed files: `git diff --name-only` or `git status --porcelain`
   - Run linter only on changed files
   - Report: "Linting changed files only"

2. **If `scope=file:<path>`:**
   - Run linter on specific file
   - Report: "Linting file: <path>"

3. **If `scope=all`:**
   - Run linter on entire project
   - Report: "Linting entire project"

### 6. Warnings Handling

1. **If `strict=true`:**
   - Treat warnings as errors
   - Fail if warnings present
   - Report: "Strict mode: warnings treated as errors"

2. **If `strict=false`:**
   - Report warnings but don't fail
   - Note: "Warnings present but not blocking"

---

## Output Format

### Success Case
```
✅ Lint check complete – code passes linter.

Summary:
- Linter: ESLint (configured)
- Scope: All files
- Errors: 0
- Warnings: 2 (non-blocking)
- Auto-fix: Not requested

Status: ✅ Pass
```

### Failure Case (with auto-fix)
```
⚠️ Lint check found issues. Auto-fix attempted.

Summary:
- Linter: ESLint (configured)
- Scope: All files
- Errors: 5 → 0 (auto-fixed)
- Warnings: 2 (non-blocking)
- Auto-fix: Applied

Status: ✅ Pass (after auto-fix)
```

### Failure Case (manual fix required)
```
❌ Lint check failed. Manual fixes required.

Issues Found:
- Errors: 3 in `src/utils/helpers.ts`
  - Line 45: Unused variable 'result'
  - Line 67: Missing return type
  - Line 89: Import not used

- Warnings: 2 in `src/api/routes.ts`
  - Line 12: Prefer const over let
  - Line 34: Console.log should be removed

Action Required:
1. Fix errors in `src/utils/helpers.ts`
2. Review warnings in `src/api/routes.ts`
3. Re-run lint check to verify

Status: ❌ Fail
```

---

## Self-Healing Actions

This command will automatically:
- Detect linter configuration
- Determine appropriate lint command based on project structure
- Attempt auto-fix if `auto-fix=true` and auto-fix is available
- Report clear, actionable error messages

---

## Integration with Other Commands

### Pre-Flight Check
- This command can be called as part of `pre-flight-check` for light lint validation
- See: `.cursor/commands/pre-flight-check.md` Section 3.3

### PR Review Check
- This command can be called as part of `pr-review-check` for full lint validation
- See: `.cursor/commands/pr-review-check.md` Section 1.1

---

## Related Commands

- `pre-flight-check` - Environment validation (includes light lint pass)
- `pr-review-check` - Pre-PR validation (includes full lint pass)
- `project-audit` - Full project health check

---

## Related Documentation

- **Linting Standard:** `standards/process/code-quality-linting-standards.md` - Comprehensive linting requirements
- **Linting Rule:** `.cursor/rules/linting-behavior.mdc` - AI agent behavior expectations
- **Linting Checklist:** `standards/process/checklists/linting_checklist_v1_0.md` - Validation checklist

---

## Integration with AGENTS.md

This command is referenced in `AGENTS.md` as part of the code quality validation workflow. It can be used standalone or as part of pre-flight and PR review processes.

