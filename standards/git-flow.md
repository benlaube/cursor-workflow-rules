# Git_Repository_Standards_v1.1

## Metadata

- **Created:** 2025-11-17
- **Last Updated:** 04-12-2025 12:42:51 EST
- **Version:** 1.2
- **Description:** Standards for Git usage, branching strategies, commit messages, and PR workflows. Adhering to this ensures history is readable and deployments are predictable.
- **Type:** Governing Standard - Defines requirements for Git workflow
- **Applicability:** All git operations throughout development lifecycle
- **Related Rules:**
  - [git-branch-naming.mdc](../../.cursor/rules/git/git-branch-naming.mdc) - Enforces branch naming conventions (Section B)
  - [git-commit-messages.mdc](../../.cursor/rules/git/git-commit-messages.mdc) - Enforces commit message standards (Section C)
  - [git-pr-preparation.mdc](../../.cursor/rules/git/git-pr-preparation.mdc) - PR preparation and validation (Section D)
  - [git-repository-hygiene.mdc](../../.cursor/rules/git/git-repository-hygiene.mdc) - Repository hygiene and .gitignore standards (Section E)
  - [git-hooks-standards.mdc](../../.cursor/rules/git/git-hooks-standards.mdc) - Git hooks configuration standards
  - [git-workflow-integration.mdc](../../.cursor/rules/git/git-workflow-integration.mdc) - Coordinates git operations and AI agent behavior (Sections A, F)

---

## A. When to Apply This Rule

Apply this rule whenever:

- Initializing a new repository.
- Creating a new branch.
- Committing code.
- Opening or reviewing a Pull Request.

---

## B. Branching Strategy

We use a simplified **Feature Branch Workflow**.

### B.1 Main Branches

- **`main`**: The production-ready state. Protected. No direct commits allowed.
- **`develop`** (Optional): For larger teams, acts as a staging ground.

### B.2 Feature Branches

All work happens on short-lived feature branches.

- **Format:** `{type}/{context}-{short-desc}`
- **Examples:**
  - `feat/user-auth-login`
  - `fix/api-timeout-bug`
  - `docs/update-readme`
  - `chore/bump-dependencies`

### B.3 Branch Lifecycle

1. Sync `main`: `git checkout main && git pull`
2. Create branch: `git checkout -b feat/my-feature`
3. Work & Commit.
4. Push: `git push -u origin feat/my-feature`
5. Open PR.
6. Merge (Squash & Merge recommended) & Delete branch.

---

## C. Commit Message Standards

We follow **Conventional Commits** to make history semantic and machine-readable.

### C.1 Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### C.2 Types

- **`feat`**: A new feature (correlates with MINOR in SemVer).
- **`fix`**: A bug fix (correlates with PATCH in SemVer).
- **`docs`**: Documentation only changes.
- **`style`**: Formatting, missing semi-colons, etc (no code change).
- **`refactor`**: A code change that neither fixes a bug nor adds a feature.
- **`perf`**: A code change that improves performance.
- **`test`**: Adding missing tests or correcting existing tests.
- **`chore`**: Build process or auxiliary tool changes.

### C.3 Examples

- `feat(auth): add google oauth login support`
- `fix(api): handle null response in user profile`
- `docs(readme): update installation instructions`

---

## D. Pull Request (PR) Process

### D.1 PR Title

Use the Conventional Commit format for the PR title.

- Bad: "Fixed the bug"
- Good: "fix(payment): resolve double-charge issue on retry"

### D.2 PR Description

Every PR must include:

- **Summary:** What changed?
- **Type of Change:** (Feature, Fix, Refactor)
- **Test Plan:** How was this tested? (Unit tests, Manual verification)
- **Screenshots/Logs:** (If UI or Logic change)

### D.3 Review Checklist

Before merging, the Reviewer (AI or Human) must verify:

- [ ] CI/CD checks pass.
- [ ] No secrets are exposed.
- [ ] Code follows style guide.
- [ ] `standards/process/checklists/pr_review_checklist_v1_0.md` has been followed.

---

## E. .gitignore Standards

### E.1 Universal Excludes

Every repo must exclude:

- `node_modules/`, `venv/`, `.env` (and all variants).
- OS files: `.DS_Store`, `Thumbs.db`.
- Editor files: `.vscode/`, `.idea/` (unless shared settings).
- Logs: `*.log`, `npm-debug.log`.

### E.2 Security

- Explicitly ignore `*.pem`, `*.key`, `credentials.json`.
- Ensure `.env` is in `.gitignore` before the first commit.

---

## F. AI Agent Behavior

- **Branch Creation:** Always ask for the task context to name the branch correctly.
- **Commit Messages:** Always write semantic commit messages. Never use "update code" or "misc changes".
- **PR Description:** Auto-generate a detailed PR description based on the diff.

---

## Related Cursor Rules

This standard is enforced by the following Cursor rules:

- **`git-branch-naming.mdc`** - Enforces branch naming conventions and prevents direct commits to main/master (Section B)
- **`git-commit-messages.mdc`** - Enforces Conventional Commits format and pre-commit security checks (Section C)
- **`git-pr-preparation.mdc`** - Validates branch and commits before PR, auto-generates PR description (Section D)
- **`git-repository-hygiene.mdc`** - Monitors .gitignore patterns and tracked sensitive files (Section E)
- **`git-hooks-standards.mdc`** - Standards for configuring git hooks (pre-commit, commit-msg, pre-push)
- **`git-workflow-integration.mdc`** - Coordinates git operations and validates git status (Sections A, F)

These rules automatically apply during git operations to ensure compliance with this standard.

# End of Rule – Git_Repository_Standards_v1.2
