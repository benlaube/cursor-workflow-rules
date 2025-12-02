# PR Review Checklist

**Type:** Comprehensive PR Review Checklist – used by Cursor commands and human devs to validate code quality, functionality, security, and documentation before completing a task or submitting a PR.

**Description:** Comprehensive checklist combining actionable validation items with detailed execution steps for PR review. Covers code quality, functionality, security, documentation, and final verification.

**Created:** 2025-11-25 11:30

**Last Updated:** 2025-12-02

**Version:** 1.1

**Related Command:** `.cursor/commands/pr-review-check.md`

---

## How to Use This Checklist

This checklist combines actionable validation items with detailed execution guidance. Use it to:
- Validate code before submitting PRs
- Ensure code quality and security standards
- Verify documentation and changelog updates
- Complete final verification steps

**Automated Checks:** The `pr-review-check.md` command performs many of these checks automatically. Use this checklist for manual verification and comprehensive review.

---

## 1. Code Quality Validation

### 1.1 Linting

**Checklist Items:**
- [ ] **Linting:** Does the code pass the linter? (No new warnings/errors)
- [ ] **Auto-Fix:** Attempt to auto-fix linting issues if possible
- [ ] **Review Errors:** Manually review any remaining linting errors

**Execution Steps:**
1. **Run Linter:**
   - Execute: `npm run lint` (or equivalent)
   - If errors found:
     - Display errors
     - If `auto-fix=true`, run: `npm run lint -- --fix`
     - If auto-fix succeeds: ✅ "Linter errors fixed"
     - If auto-fix fails or `auto-fix=false`: ❌ "Linter errors must be fixed manually"
   - If clean: ✅ "Code passes linter"
   - **Reference:** See `standards/process/linting.md` Section 6.2 for detailed PR review lint requirements
   - **Reference:** See `standards/process/linting.md` Section 6.2 for detailed PR review lint requirements

### 1.2 Formatting

**Checklist Items:**
- [ ] **Formatting:** Is the code formatted according to project standards?
- [ ] **Auto-Fix:** Attempt to auto-fix formatting issues if possible

**Execution Steps:**
1. **Check Formatting:**
   - Run: `npm run format:check` or `prettier --check .` (if available)
   - If not formatted:
     - If `auto-fix=true`, run: `npm run format` or `prettier --write .`
     - ✅ "Code formatted"
   - If formatted: ✅ "Code is properly formatted"

### 1.3 Type Safety

**Checklist Items:**
- [ ] **Type Safety:** Are there any type errors? (e.g., TypeScript, MyPy)
- [ ] **Fix Type Errors:** Resolve all type errors before PR

**Execution Steps:**
1. **Type Check:**
   - **TypeScript:** Run `tsc --noEmit` or `npm run type-check`
   - **Python:** Run `mypy .` or `pylint --errors-only`
   - If type errors: ❌ "Type errors found. Fix before PR."
   - If clean: ✅ "No type errors"

### 1.4 Complexity Check

**Checklist Items:**
- [ ] **Complexity:** Are functions short and focused? (Refactor if > 200 lines)
- [ ] **Review Large Functions:** Identify and refactor functions > 200 lines

**Execution Steps:**
1. **Find Large Functions:**
   - Scan for functions > 200 lines
   - Command: `find . -type f -name "*.ts" -o -name "*.js" | xargs grep -l "function\|^export.*function" | xargs wc -l | awk '$1 > 200'`
   - Report large functions as refactoring candidates
   - ⚠️ "Consider refactoring large functions (>200 lines)"

---

## 2. Functionality & Testing

### 2.1 Build Check

**Checklist Items:**
- [ ] **Build:** Does the project build successfully?
- [ ] **Fix Build Errors:** Resolve all build errors before PR

**Execution Steps:**
1. **Build Project:**
   - Run: `npm run build` (or equivalent)
   - If build fails:
     - Display build errors
     - ❌ "Build is failing. Fix before PR."
   - If succeeds: ✅ "Project builds successfully"

### 2.2 Test Coverage

**Checklist Items:**
- [ ] **Unit Tests:** Did I add/update tests for new functionality?
- [ ] **Pass Rate:** Do all tests pass?
- [ ] **Test Coverage:** Ensure new functionality has test coverage

**Execution Steps:**
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

### 2.3 Edge Cases

**Checklist Items:**
- [ ] **Edge Cases:** Did I consider error states and edge cases?
- [ ] **Error Handling:** Review error handling for async operations
- [ ] **Input Validation:** Verify input validation is in place

**Execution Steps:**
1. **Review Error Handling:**
   - Check for try-catch blocks in async operations
   - Check for input validation
   - ⚠️ "Review error handling and edge cases"

---

## 3. Security & Safety

### 3.1 Secrets Scan

**Checklist Items:**
- [ ] **Secrets:** Did I ensure NO secrets are committed? (Check `.env`, code comments)
- [ ] **Verify .gitignore:** Ensure sensitive files are in `.gitignore`
- [ ] **Remove Secrets:** Remove any hardcoded secrets found

**Execution Steps:**
1. **Check for Committed Secrets:**
   - Scan: `grep -rE "sk_live|ghp_|password.*=|api_key.*=" . --exclude-dir={node_modules,.git,dist}`
   - Check `.env` is not tracked: `git ls-files .env`
   - If secrets found: ❌ "Secrets found in code. Remove before PR."
   - If clean: ✅ "No secrets in code"

2. **Check .gitignore:**
   - Verify `.env`, `*.pem`, `*.key`, `logs/` are in `.gitignore`
   - If missing: ⚠️ "Add sensitive files to .gitignore"

### 3.2 Input Validation

**Checklist Items:**
- [ ] **Inputs:** Are inputs validated?
- [ ] **Validation Libraries:** Check for Zod (TypeScript) or Pydantic (Python) usage
- [ ] **API Routes:** Verify all API routes have input validation

**Execution Steps:**
1. **Check Input Validation:**
   - Review API routes for input validation
   - Check for Zod schemas, Pydantic models, or validation middleware
   - ⚠️ "Verify all inputs are validated"

### 3.3 Dependency Audit

**Checklist Items:**
- [ ] **Dependencies:** Did I audit new dependencies?
- [ ] **Vulnerabilities:** Check for critical/high vulnerabilities
- [ ] **Review New Packages:** Review any newly added dependencies

**Execution Steps:**
1. **Audit Dependencies:**
   - Run: `npm audit` (or `pip audit`)
   - If critical/high vulnerabilities: ⚠️ "Review dependency vulnerabilities"
   - If clean: ✅ "No critical dependency vulnerabilities"

---

## 4. Documentation

### 4.1 Function Documentation

**Checklist Items:**
- [ ] **Docstrings:** Do exported functions have comments?
- [ ] **JSDoc/Pydoc:** Ensure exported functions have proper documentation
- [ ] **Review Undocumented:** Review and document any undocumented exported functions

**Execution Steps:**
1. **Check Exported Functions:**
   - Scan exported functions for JSDoc/Pydoc comments
   - Report undocumented functions
   - ⚠️ "Some exported functions are missing documentation"

### 4.2 Standards Updates

**Checklist Items:**
- [ ] **Standards:** Did I update `standards/` if I changed architecture?
- [ ] **Architecture Changes:** Review git diff for architecture changes
- [ ] **Update Standards:** Update relevant standards files if architecture changed

**Execution Steps:**
1. **Check Architecture Changes:**
   - Review git diff for architecture changes
   - If architecture changed: ⚠️ "Architecture changed. Update `standards/` if needed."

### 4.3 Changelog

**Checklist Items:**
- [ ] **Changelog:** Did I update `CHANGELOG.md` for user-facing changes? (See `standards/documentation.md` Section 7 for guidelines)
- [ ] **User-Facing Changes:** Identify user-facing changes from git diff
- [ ] **Update Changelog:** Update CHANGELOG.md with timestamp and description

**Execution Steps:**
1. **Check CHANGELOG.md:**
   - If `update-changelog=true`:
     - Detect user-facing changes from git diff
     - If changes detected but CHANGELOG not updated:
       - Prompt: "User-facing changes detected. Update CHANGELOG.md?"
       - Reference: `standards/documentation.md` Section 7 for format
   - If updated: ✅ "CHANGELOG.md is up to date"

### 4.4 TODO Cleanup

**Checklist Items:**
- [ ] **TODOs:** Did I clean up or track leftover TODOs?
- [ ] **Review TODOs:** List and review all TODOs found
- [ ] **Track TODOs:** Track TODOs in issue tracker or remove if resolved

**Execution Steps:**
1. **Check for TODOs:**
   - Scan: `grep -r "TODO\|FIXME" . --exclude-dir={node_modules,.git,dist}`
   - If TODOs found:
     - List them
     - ⚠️ "Review and track TODOs before PR"

---

## 5. Final Verification

### 5.1 Self-Healing Check

**Checklist Items:**
- [ ] **Self-Healing:** Did I fix any port conflicts or environment issues I caused?
- [ ] **Port Conflicts:** Verify no port conflicts were introduced
- [ ] **Environment Issues:** Check for any environment-related issues

**Execution Steps:**
1. **Check for Port Conflicts:**
   - Verify no port conflicts were introduced
   - ✅ "No environment issues"

### 5.2 Clean Up

**Checklist Items:**
- [ ] **Clean Up:** Did I remove temporary debug logs?
- [ ] **Debug Code:** Remove console.log, debugger statements, and print statements
- [ ] **Production Code:** Ensure no debug code remains in production code

**Execution Steps:**
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

If `auto-fix=true`, the command will:
- Run `npm run lint -- --fix` to fix linting issues
- Run `npm run format` to fix formatting
- Attempt to add missing `.gitignore` entries
- **Note:** Will NOT fix type errors, test failures, or remove secrets (requires manual intervention)

---

## Related Commands

- `pre-flight-check` - Validate before starting work
- `security_audit` - Deep security review
- `project-audit` - Full project health check

---

## Integration with AGENTS.md

This checklist is referenced in `AGENTS.md` as the **required step** before submitting PRs. Always run this before marking a task complete or opening a PR.

---

*This is the comprehensive checklist for PR review validation. Use the `pr-review-check.md` command for automated checks, and this checklist for manual verification.*

