# Linting_Checklist_v1.0

**Type:** Checklist – used by Cursor commands and human devs to validate code quality through linting at different stages of development.

**Description:** Comprehensive linting checklist covering pre-flight light pass and PR review strict pass validation.

**Created:** 2025-12-02 12:00

**Last_Updated:** 2025-12-02 12:00

**Related Command:** `.cursor/commands/validate-code-quality.md`

**Related Standard:** `standards/process/code-quality-linting-standards.md`

---

## How to Use This Checklist

This checklist provides validation items for linting at different stages of development:

- **Pre-Flight (Light Pass):** Quick validation before starting work
- **PR Review (Strict Pass):** Comprehensive validation before PR submission

**Automated Checks:** The `validate-code-quality.md` command performs many of these checks automatically. Use this checklist for manual verification and comprehensive review.

---

## Pre-Flight Lint Checklist (Light Pass)

Before starting significant work, validate baseline linting state:

### Configuration
- [ ] **Linter Config:** Linter config files present (ESLint/Ruff/etc.) and not obviously broken
- [ ] **Config Valid:** Linter configuration is valid and loadable

### Baseline Check
- [ ] **Quick Lint:** Run a quick lint (or targeted `npm run lint` / `python -m ruff .` / similar) on current branch
- [ ] **No Existing Errors:** No **existing** error-level lint failures on the base branch or current working state
- [ ] **Existing Issues Documented:** If lint is already failing:
  - [ ] Note it in `PROJECT_AUDIT.md` or TODOs
  - [ ] Either fix it now or make sure you don't blame your new code for old lint failures

### Status
- [ ] **Baseline Clean:** Baseline linting state is acceptable for starting work
- [ ] **Ready to Proceed:** Can proceed with coding without blocking lint issues

---

## PR Review Lint Checklist (Strict Pass)

Before opening/updating a PR, ensure all linting requirements are met:

### Execution
- [ ] **Run Linter:** Run the project's main lint command(s) (e.g., `npm run lint`, `pnpm lint`, `python -m ruff .`)
- [ ] **Exit Code:** All linter commands exit with code 0 (no errors)
- [ ] **Type Check:** Type checking passes (e.g., `tsc --noEmit` for TypeScript)

### Error Handling
- [ ] **No Errors:** All error-level lint issues are resolved
- [ ] **No New Warnings:** No **new** warnings introduced by your changes (unless explicitly allowed and documented)
- [ ] **Existing Warnings:** Existing warnings are documented and acceptable

### Formatting
- [ ] **Auto-Format Applied:** All auto-formatting applied (`npm run lint -- --fix`, `prettier`, `black`, etc. as configured)
- [ ] **Formatting Consistent:** Code formatting is consistent with project standards

### Documentation
- [ ] **PR Description:** Lint result is reflected in your PR description or CI status if applicable
- [ ] **CI Status:** CI lint checks are passing (if applicable)

### Final Verification
- [ ] **All Checks Pass:** All linting checks pass without errors
- [ ] **Ready for Review:** Code is ready for PR review from linting perspective

---

## Quick Reference

### Common Lint Commands

**JavaScript/TypeScript:**
- `npm run lint` - Run linter
- `npm run lint -- --fix` - Auto-fix issues
- `tsc --noEmit` - Type check

**Python:**
- `python -m ruff .` - Run Ruff linter
- `python -m ruff . --fix` - Auto-fix issues
- `black .` - Format code

**Other:**
- Use project-specific lint commands as configured

### Integration Points

- **Pre-Flight:** Light lint pass validates baseline before starting work
- **PR Review:** Strict lint pass validates code quality before PR submission
- **Standalone:** Use `lint-check` command for independent validation

---

## Related Documentation

- **Linting Standard:** `standards/process/code-quality-linting-standards.md` - Comprehensive linting requirements and policies
- **Linting Rule:** `.cursor/rules/linting-behavior.mdc` - AI agent behavior expectations
- **Linting Command:** `.cursor/commands/validate-code-quality.md` - Standalone lint check command
- **Pre-Flight Check:** `.cursor/commands/pre-flight-check.md` - Includes light lint pass
- **PR Review Check:** `.cursor/commands/pr-review-check.md` - Includes full lint pass

---

*This checklist provides validation items for linting at different stages. For detailed requirements, see `standards/process/code-quality-linting-standards.md`. For automated execution, use `.cursor/commands/validate-code-quality.md`.*

