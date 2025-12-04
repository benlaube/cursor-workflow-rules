# Code Quality Linting Standards v1.1

## Metadata

- **Created:** 2025-12-02
- **Last Updated:** 04-12-2025 13:08:13 EST
- **Version:** 1.1
- **Description:** Comprehensive linting standard defining linting requirements, tools, policies, and AI agent behavior expectations for maintaining code quality.

## When to Apply This Standard

Apply this standard when:

- Setting up linting for a new project
- Configuring linting tools (ESLint, TypeScript, Python linters, etc.)
- Reviewing code quality and linting policies
- Integrating linting into development workflows
- Defining AI agent behavior around linting

---

## 1. Purpose

Linting is our **first line of automated code quality defense**. It should:

- Catch obvious mistakes early (unused vars, bad imports, etc.)
- Enforce consistent style so humans don't burn energy on formatting
- Support, not replace, deeper reviews (tests, architecture decisions, security)

Linting rules are enforced by tools (ESLint, TypeScript compiler, Python linters, etc.) **and** by AI agent behavior described here.

---

## 2. When Linting Runs

Linting ties into the lifecycle like this:

### 2.1 Pre-Flight (`pre-flight-check`)

- Run a **light lint pass** to ensure the repo isn't already broken before you start work
- Goal: "Is the baseline clean enough to start?"
- See: `.cursor/commands/pre-flight-check.md` Section 3.3

### 2.2 PR Review (`pr-review-check`)

- Run a **full lint pass** and treat violations as blockers for merging
- Goal: "Is this branch clean enough for review/merge?"
- See: `.cursor/commands/pr-review-check.md` Section 1.1

### 2.3 Continuous / Local Usage

- Agents may run lint incrementally (per file or per change) while coding to catch issues early
- Use auto-fix capabilities when available to resolve issues immediately

---

## 3. Tools & Config

Per language/stack, use the project's standard tools:

### 3.1 JavaScript / TypeScript

- **ESLint** (with project's `.eslintrc.*`), plus TypeScript compiler (`tsc`) where applicable
- **Prettier** for formatting (if configured)
- **Commands:**
  - `npm run lint` - Run linter
  - `npm run lint -- --fix` - Auto-fix issues
  - `tsc --noEmit` - Type checking

### 3.2 Python

- Choice per project (e.g., Ruff, Flake8, Black for formatting)
- **Commands:**
  - `python -m ruff .` - Run Ruff linter
  - `python -m ruff . --fix` - Auto-fix issues
  - `black .` - Format code

### 3.3 Other Languages

- Use the canonical linter for that stack (e.g., `golangci-lint` for Go)

### 3.4 Configuration Rule

> The AI agent MUST respect existing linter configs in the repo and MUST NOT silently change them without an explicit task to do so.

---

## 4. Linting Rules – What "Passing" Means

For a **lint pass to be considered successful**:

### 4.1 No Errors

- All linter invocations exit with code 0
- No "error"-level issues are tolerated

### 4.2 Warnings Policy

- Warnings are **not** ignored by default
- Projects can choose one of:
  - **Strict:** Warnings treated as errors (recommended for new/AI-heavy code)
  - **Relaxed:** Warnings allowed but must not grow:
    - New code should not introduce additional warnings
- Each repo should document its lint strictness in `PROJECT_AUDIT.md` or its local lint rule file

### 4.3 Formatting

- Use auto-formatters (Prettier, Black, etc.) where configured
- AI agents should prefer **auto-format commands** over hand-formatting

---

## 5. AI Agent Behavior Around Linting

For Cursor/AI agents, the linting expectations are:

### 5.1 Before Implementing Big Changes

- As part of `pre-flight-check`, run a light lint or at least:
  - Confirm there are no glaring lint errors on the main branch or current base

### 5.2 While Coding

- Fix lint issues in the files you touch
- Do **not** start large lint-only refactors unless asked (e.g., "fix all ESLint issues in repo")

### 5.3 Before PR (`pr-review-check`)

- Run full lint against the relevant scope (project/app, not just a single file)
- Fix all errors; do not leave "I'll fix ESLint later" unless explicitly allowed by the user

### 5.4 Don't Fight the Config

- Use the existing ESLint/Ruff/Prettier rules as the source of truth
- If the user asks to change lint rules, propose minimal, rational changes and update the config + docs together

### 5.5 No Noisy "I'll Fix ESLint" Spam

- Don't repeatedly promise "let me fix those ESLint errors…" in chat
- Instead, quietly:
  - Run the linter
  - Fix violations in your edits
  - Report the final lint status once per major change

---

## 6. Embedded Checklist

Agents (and humans) can treat this as the single lint checklist. It's referenced by both `pre-flight-check` and `pr-review-check`.

### 6.1 Pre-Flight Lint Checklist (light)

Before starting significant work:

- [ ] Linter config files present (ESLint/Ruff/etc.) and not obviously broken
- [ ] Run a quick lint (or targeted `npm run lint` / `python -m ruff .` / similar) on current branch
- [ ] No **existing** error-level lint failures on the base branch or current working state
- [ ] If lint is already failing:
  - [ ] Note it in `PROJECT_AUDIT.md` or TODOs
  - [ ] Either fix it now or make sure you don't blame your new code for old lint failures

### 6.2 PR Review Lint Checklist (strict)

Before opening/updating a PR:

- [ ] Run the project's main lint command(s) (e.g., `npm run lint`, `pnpm lint`, `python -m ruff .`)
- [ ] All linter commands exit with code 0 (no errors)
- [ ] No **new** warnings introduced by your changes (unless explicitly allowed and documented)
- [ ] All auto-formatting applied (`npm run lint -- --fix`, `prettier`, `black`, etc. as configured)
- [ ] Lint result is reflected in your PR description or CI status if applicable

---

## 7. Integration with Other Standards

### 7.1 Pre-Flight Standard

- `pre-flight-check` must at minimum ensure:
  - Lint config exists
  - Baseline lint errors are understood (and ideally eliminated)
- See: `.cursor/commands/pre-flight-check.md`

### 7.2 PR Review Standard

- `pr-review-check` treats lint failures as PR blockers
- See: `.cursor/commands/pr-review-check.md`

### 7.3 Security Standard

- `security_audit` may include a "security lint" phase (e.g., extra rules for dangerous patterns, secret scanners), but that's defined in `standards/security/security-audit-checklist.md`
- See: `.cursor/commands/audit-security.mdc`

### 7.4 Task Workflow

- AI agents follow linting behavior expectations during development
- See: `.cursor/rules/task-workflow.mdc`

---

## 8. Related Documentation

- **Linting Rule:** `.cursor/rules/linting-behavior.mdc` - Auto-applied rule for AI agent behavior
- **Linting Command:** `.cursor/commands/validate-code-quality.md` - Standalone lint check command
- **Linting Checklist:** `standards/process/checklists/linting_checklist_v1_0.md` - Validation checklist
- **Pre-Flight Check:** `.cursor/commands/pre-flight-check.md` - Includes light lint pass
- **PR Review Check:** `.cursor/commands/pr-review-check.md` - Includes full lint pass

---

_This standard defines the linting requirements and policies. For AI agent behavior, see `.cursor/rules/linting-behavior.mdc`. For validation checklists, see `standards/process/checklists/linting_checklist_v1_0.md`._
