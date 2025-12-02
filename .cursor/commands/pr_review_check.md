---
description: Validate code quality, functionality, security, and documentation before completing a task or submitting a PR.
globs: 
---

# PR Review Check Command

Use this command to validate that code is ready for PR submission. Ensures lint, build, tests pass, no secrets are committed, docs are updated, and changelog is current.

**Source Checklist:** `docs/process/checklists/pr_review_checklist_v1_0.md`

## Usage

@agent: When asked to "check before PR", "validate PR", or "review before merge", follow this procedure.

**Parameters:**
- `auto-fix`: `true` or `false` (default: `false`). Attempt to auto-fix linting and formatting issues.
- `update-changelog`: `true` or `false` (default: `true`). Prompt to update CHANGELOG.md if user-facing changes detected.

---

## Execution Steps

### 1. Code Quality Validation

#### 1.1 Linting
1. **Run Linter:**
   - Execute: `npm run lint` (or equivalent)
   - If errors found:
     - Display errors
     - If `auto-fix=true`, run: `npm run lint -- --fix`
     - If auto-fix succeeds: ✅ "Linter errors fixed"
     - If auto-fix fails or `auto-fix=false`: ❌ "Linter errors must be fixed manually"
   - If clean: ✅ "Code passes linter"

#### 1.2 Formatting
1. **Check Formatting:**
   - Run: `npm run format:check` or `prettier --check .` (if available)
   - If not formatted:
     - If `auto-fix=true`, run: `npm run format` or `prettier --write .`
     - ✅ "Code formatted"
   - If formatted: ✅ "Code is properly formatted"

#### 1.3 Type Safety
1. **Type Check:**
   - **TypeScript:** Run `tsc --noEmit` or `npm run type-check`
   - **Python:** Run `mypy .` or `pylint --errors-only`
   - If type errors: ❌ "Type errors found. Fix before PR."
   - If clean: ✅ "No type errors"

#### 1.4 Complexity Check
1. **Find Large Functions:**
   - Scan for functions > 200 lines
   - Command: `find . -type f -name "*.ts" -o -name "*.js" | xargs grep -l "function\|^export.*function" | xargs wc -l | awk '$1 > 200'`
   - Report large functions as refactoring candidates
   - ⚠️ "Consider refactoring large functions (>200 lines)"

### 2. Functionality & Testing

#### 2.1 Build Check
1. **Build Project:**
   - Run: `npm run build` (or equivalent)
   - If build fails:
     - Display build errors
     - ❌ "Build is failing. Fix before PR."
   - If succeeds: ✅ "Project builds successfully"

#### 2.2 Test Coverage
1. **Run Tests:**
   - Execute: `npm test` (or equivalent)
   - If tests fail:
     - Display failing tests
     - ❌ "Tests are failing. Fix before PR."
   - If pass: ✅ "All tests pass"

2. **Check for New Tests:**
   - Compare test files with changed source files
   - If new functionality added but no tests: ⚠️ "New functionality may need tests"
   - If tests exist: ✅ "Tests cover new functionality"

#### 2.3 Edge Cases
1. **Review Error Handling:**
   - Check for try-catch blocks in async operations
   - Check for input validation
   - ⚠️ "Review error handling and edge cases"

### 3. Security & Safety

#### 3.1 Secrets Scan
1. **Check for Committed Secrets:**
   - Scan: `grep -rE "sk_live|ghp_|password.*=|api_key.*=" . --exclude-dir={node_modules,.git,dist}`
   - Check `.env` is not tracked: `git ls-files .env`
   - If secrets found: ❌ "Secrets found in code. Remove before PR."
   - If clean: ✅ "No secrets in code"

2. **Check .gitignore:**
   - Verify `.env`, `*.pem`, `*.key`, `logs/` are in `.gitignore`
   - If missing: ⚠️ "Add sensitive files to .gitignore"

#### 3.2 Input Validation
1. **Check Input Validation:**
   - Review API routes for input validation
   - Check for Zod schemas, Pydantic models, or validation middleware
   - ⚠️ "Verify all inputs are validated"

#### 3.3 Dependency Audit
1. **Audit Dependencies:**
   - Run: `npm audit` (or `pip audit`)
   - If critical/high vulnerabilities: ⚠️ "Review dependency vulnerabilities"
   - If clean: ✅ "No critical dependency vulnerabilities"

### 4. Documentation

#### 4.1 Function Documentation
1. **Check Exported Functions:**
   - Scan exported functions for JSDoc/Pydoc comments
   - Report undocumented functions
   - ⚠️ "Some exported functions are missing documentation"

#### 4.2 Standards Updates
1. **Check Architecture Changes:**
   - Review git diff for architecture changes
   - If architecture changed: ⚠️ "Architecture changed. Update `standards/` if needed."

#### 4.3 Changelog
1. **Check CHANGELOG.md:**
   - If `update-changelog=true`:
     - Detect user-facing changes from git diff
     - If changes detected but CHANGELOG not updated:
       - Prompt: "User-facing changes detected. Update CHANGELOG.md?"
       - Reference: `standards/documentation.md` Section 7 for format
   - If updated: ✅ "CHANGELOG.md is up to date"

#### 4.4 TODO Cleanup
1. **Check for TODOs:**
   - Scan: `grep -r "TODO\|FIXME" . --exclude-dir={node_modules,.git,dist}`
   - If TODOs found:
     - List them
     - ⚠️ "Review and track TODOs before PR"

### 5. Final Verification

#### 5.1 Self-Healing Check
1. **Check for Port Conflicts:**
   - Verify no port conflicts were introduced
   - ✅ "No environment issues"

#### 5.2 Clean Up
1. **Check for Debug Code:**
   - Scan: `grep -r "console.log\|debugger\|print(" . --exclude-dir={node_modules,.git,dist}`
   - If debug code found: ⚠️ "Remove debug code before PR"

---

## Output Format

### Success Case
```
✅ PR Review Check complete – ready to PR.

Summary:
- Code Quality: ✅ Lint, format, types all pass
- Functionality: ✅ Build succeeds, all tests pass
- Security: ✅ No secrets, inputs validated
- Documentation: ✅ Functions documented, CHANGELOG updated
- Clean: ✅ No debug code, TODOs tracked

Ready to submit PR.
```

### Failure Case
```
❌ PR Review Check failed. Fix issues before PR.

Issues Found:

**Code Quality:**
- ❌ Linter: 5 errors in `src/utils/helpers.ts`
- ⚠️ Function `processData()` is 250 lines (refactor candidate)

**Functionality:**
- ❌ Build: TypeScript error in `src/api/routes.ts:45`
- ❌ Tests: 2 tests failing in `auth.test.ts`

**Security:**
- ❌ Found hardcoded API key in `src/config.ts:12`
- ⚠️ Missing input validation in `src/api/users.ts`

**Documentation:**
- ⚠️ Function `exportData()` missing JSDoc comment
- ⚠️ CHANGELOG.md not updated for user-facing changes

**Clean Up:**
- ⚠️ Found 3 `console.log()` statements in production code

---

Action Required:
1. Fix linter errors
2. Fix build errors
3. Fix failing tests
4. Remove hardcoded secrets
5. Add input validation
6. Document exported functions
7. Update CHANGELOG.md
8. Remove debug code
```

---

## Auto-Fix Capabilities

If `auto-fix=true`, this command will:
- Run `npm run lint -- --fix` to fix linting issues
- Run `npm run format` to fix formatting
- Attempt to add missing `.gitignore` entries
- **Note:** Will NOT fix type errors, test failures, or remove secrets (requires manual intervention)

---

## Related Commands

- `pre_flight_check` - Validate before starting work
- `security_audit` - Deep security review
- `project_audit` - Full project health check

---

## Integration with AGENTS.md

This command is referenced in `AGENTS.md` as the **required step** before submitting PRs. Always run this before marking a task complete or opening a PR.

