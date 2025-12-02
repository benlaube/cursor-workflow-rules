# PR_Review_Checklist_v1.0

**Type:** Checklist – used by Cursor commands and human devs to validate code quality, functionality, security, and documentation before completing a task or submitting a PR.

**Description:** Checklist to verify code quality, functionality, security, and documentation before completing a task or submitting a PR.

**Created:** 2025-11-25 11:30

**Last_Updated:** 2025-11-25 11:30

**Related Command:** `.cursor/commands/pr_review_check.md`

---

Before marking a task as complete or submitting a PR, verify the following.

## 1. Code Quality
- [ ] **Linting:** Does the code pass the linter? (No new warnings/errors)
- [ ] **Formatting:** Is the code formatted according to project standards?
- [ ] **Type Safety:** Are there any type errors? (e.g., TypeScript, MyPy)
- [ ] **Complexity:** Are functions short and focused? (Refactor if > 200 lines)

## 2. Functionality & Testing
- [ ] **Build:** Does the project build successfully?
- [ ] **Unit Tests:** Did I add/update tests for new functionality?
- [ ] **Pass Rate:** Do all tests pass?
- [ ] **Edge Cases:** Did I consider error states and edge cases?

## 3. Security & Safety
- [ ] **Secrets:** Did I ensure NO secrets are committed? (Check `.env`, code comments)
- [ ] **Inputs:** Are inputs validated?
- [ ] **Dependencies:** Did I audit new dependencies?

## 4. Documentation
- [ ] **Docstrings:** Do exported functions have comments?
- [ ] **Standards:** Did I update `standards/` if I changed architecture?
- [ ] **Changelog:** Did I update `CHANGELOG.md` for user-facing changes? (See `standards/documentation.md` Section 7 for guidelines)
- [ ] **TODOs:** Did I clean up or track leftover TODOs?

## 5. Final Verification
- [ ] **Self-Healing:** Did I fix any port conflicts or environment issues I caused?
- [ ] **Clean Up:** Did I remove temporary debug logs?

---
*Automated by Cursor Replit-Mode Bundle*

