---
description: Enforce Git workflow standards including branch naming, commit messages, PR process, and repository hygiene.
version: 1.0.0
lastUpdated: 2025-01-27
globs: 
---

# Git Workflow Command

Use this command to validate and enforce Git workflow standards. Ensures branch naming, commit messages, PR process, and repository hygiene follow project standards.

**Source Standard:** `standards/git-flow.md` (Git Repository Standards v1.1)

## Usage

@agent: When asked to:
- Create a new branch
- Commit code
- Validate git state
- Prepare for PR
- Review git workflow compliance

**Parameters:**
- `action`: `validate` | `create-branch` | `validate-commit` | `prepare-pr` | `check-hygiene` (default: `validate`)
- `branch-name`: Required when `action=create-branch`. Must follow format `{type}/{context}-{short-desc}`
- `commit-message`: Required when `action=validate-commit`. Must follow Conventional Commits format

---

## Execution Steps

### 1. Git Status Validation (All Actions)

#### 1.1 Current Branch Check
1. **Get Current Branch:**
   - Run: `git branch --show-current`
   - If on `main` or `master`:
     - ⚠️ "You are on main branch. No direct commits allowed. Create a feature branch first."
     - If `action=create-branch`, proceed to branch creation
     - Otherwise, abort: "Cannot proceed on main branch"

2. **Branch Name Validation:**
   - Check if branch name follows format: `{type}/{context}-{short-desc}`
   - **Allowed Types:** `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `style`, `perf`
   - **Format Rules:**
     - Use `kebab-case` (lowercase with dashes)
     - Keep description short but descriptive (3-5 words)
     - No ticket numbers unless mandated by team policy
   - **Examples:**
     - ✅ Good: `feat/user-auth-login`, `fix/api-timeout-bug`, `docs/update-readme`
     - ❌ Bad: `MyFeature`, `fix_bug_123`, `Feat/Login`, `feature-123`
   - If invalid: ❌ "Branch name does not follow format. Expected: `{type}/{context}-{short-desc}`"
   - If valid: ✅ "Branch name follows standards"

#### 1.2 Working Tree Check
1. **Check Status:**
   - Run: `git status --porcelain`
   - If uncommitted changes:
     - List modified files
     - ⚠️ "Working tree has uncommitted changes"
     - For `action=create-branch`: Warn but allow (user may want to stash)
     - For `action=validate-commit`: ✅ "Ready to commit"
     - For `action=prepare-pr`: Check if changes are committed
   - If clean: ✅ "Working tree is clean"

#### 1.3 Sync with Remote
1. **Check if Behind:**
   - Run: `git fetch origin && git rev-list HEAD..origin/main --count`
   - If behind:
     - ⚠️ "Local branch is behind origin/main by {count} commits"
     - Suggest: "Run `git pull origin main` to sync before proceeding"
   - If up to date: ✅ "Local branch is synced with origin/main"

---

### 2. Create Branch Action (`action=create-branch`)

#### 2.1 Validate Branch Name
1. **Check Format:**
   - Verify `branch-name` parameter follows: `{type}/{context}-{short-desc}`
   - Validate type is allowed: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `style`, `perf`
   - If invalid: ❌ "Invalid branch name format. Expected: `{type}/{context}-{short-desc}`"
   - If valid: ✅ "Branch name is valid"

#### 2.2 Create Branch
1. **Sync Main:**
   - Run: `git checkout main && git pull origin main`
   - If fails: ❌ "Failed to sync main branch"
   - If succeeds: ✅ "Synced with origin/main"

2. **Create Branch:**
   - Run: `git checkout -b {branch-name}`
   - If fails: ❌ "Failed to create branch. Branch may already exist."
   - If succeeds: ✅ "Created branch: {branch-name}"

3. **Set Upstream:**
   - Run: `git push -u origin {branch-name}`
   - If fails: ⚠️ "Failed to push branch. You can push manually later."
   - If succeeds: ✅ "Pushed branch to remote"

#### 2.3 Output
```
✅ Branch created successfully.

Branch: {branch-name}
Upstream: origin/{branch-name}
Status: Ready for development

Next steps:
1. Make your changes
2. Commit using Conventional Commits format
3. Push: git push
4. Open PR when ready
```

---

### 3. Validate Commit Action (`action=validate-commit`)

#### 3.1 Commit Message Validation
1. **Check Format:**
   - Verify `commit-message` follows Conventional Commits format:
     ```
     <type>(<scope>): <subject>
     
     [optional body]
     
     [optional footer]
     ```
   - **Required Components:**
     - Type: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`
     - Subject: Short description (50 chars max, imperative mood)
   - **Optional Components:**
     - Scope: Context of change (e.g., `auth`, `api`, `ui`)
     - Body: Detailed explanation (WHY, not just WHAT)
     - Footer: Breaking changes, issue references

2. **Validate Type:**
   - Check if type matches branch type (if applicable)
   - If mismatch: ⚠️ "Commit type '{type}' doesn't match branch type. Consider aligning."
   - If valid: ✅ "Commit type is valid"

3. **Validate Subject:**
   - Check length: ≤ 50 characters
   - Check imperative mood: Should start with verb (add, fix, update, etc.)
   - **Bad Examples:**
     - "Fixed the bug" (past tense)
     - "Updates to user authentication" (too vague)
     - "misc changes" (not semantic)
   - **Good Examples:**
     - `feat(auth): add google oauth login support`
     - `fix(api): handle null response in user profile`
     - `docs(readme): update installation instructions`
   - If invalid: ❌ "Subject must be ≤50 chars, imperative mood, and descriptive"
   - If valid: ✅ "Commit message follows standards"

#### 3.2 Staged Changes Check
1. **Check Staged Files:**
   - Run: `git diff --cached --name-only`
   - If no staged files: ⚠️ "No files staged. Run `git add` first."
   - If staged: ✅ "Files staged for commit"

2. **Check for Secrets:**
   - Scan staged files: `git diff --cached | grep -iE "password|api_key|secret|token|sk_live|ghp_" | grep -v "^---\|^+++\|^-.*password.*="`
   - If secrets found: ❌ "Secrets detected in staged files. Remove before committing."
   - If clean: ✅ "No secrets in staged files"

3. **Check .env Files:**
   - Check if `.env` is staged: `git diff --cached --name-only | grep -E "^\.env$"`
   - If `.env` staged: ❌ ".env file is staged. Remove from staging: `git reset HEAD .env`"
   - If clean: ✅ ".env not staged"

#### 3.3 Output
```
✅ Commit message is valid.

Format: {type}({scope}): {subject}
Type: {type}
Scope: {scope} (optional)
Subject: {subject}

Ready to commit:
git commit -m "{commit-message}"
```

---

### 4. Prepare PR Action (`action=prepare-pr`)

#### 4.1 Branch Validation
1. **Check Branch:**
   - Verify not on `main` or `master`
   - Verify branch name follows format
   - If invalid: ❌ "Cannot create PR from this branch"
   - If valid: ✅ "Branch is ready for PR"

#### 4.2 Commit History Check
1. **Check Commits:**
   - Run: `git log origin/main..HEAD --oneline`
   - Count commits ahead: `git rev-list origin/main..HEAD --count`
   - If 0 commits: ⚠️ "No commits ahead of main. Nothing to PR."
   - If commits exist: ✅ "{count} commits ahead of main"

2. **Validate Commit Messages:**
   - Check each commit message follows Conventional Commits
   - List any invalid commit messages
   - If invalid: ⚠️ "Some commit messages don't follow standards. Consider amending."
   - If valid: ✅ "All commit messages follow standards"

#### 4.3 PR Title Generation
1. **Generate PR Title:**
   - Use the first commit message as PR title
   - Format: `{type}({scope}): {subject}`
   - If multiple commits, use the most significant (feat > fix > chore)
   - ✅ "PR Title: {title}"

#### 4.4 PR Description Template
1. **Generate Description:**
   - **Summary:** Extract from commit messages
   - **Type of Change:** Detect from commit types
   - **Test Plan:** Prompt user for testing steps
   - **Checklist:**
     - [ ] CI/CD checks pass
     - [ ] No secrets are exposed
     - [ ] Code follows style guide
     - [ ] Tests added/updated
     - [ ] Documentation updated
     - [ ] CHANGELOG.md updated (if user-facing)

#### 4.5 Output
```
✅ Ready to create PR.

Branch: {branch-name}
Commits: {count} ahead of main
PR Title: {title}

PR Description Template:
---
## Summary
{summary}

## Type of Change
{type}

## Test Plan
{user-provided}

## Checklist
- [ ] CI/CD checks pass
- [ ] No secrets are exposed
- [ ] Code follows style guide
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] CHANGELOG.md updated (if applicable)

---

Next steps:
1. Copy PR description above
2. Open PR on GitHub/GitLab
3. Use "Squash and Merge" when merging
```

---

### 5. Check Hygiene Action (`action=check-hygiene`)

#### 5.1 .gitignore Validation
1. **Check Required Excludes:**
   - Verify `.gitignore` exists
   - Check for required patterns:
     - `node_modules/`, `venv/`, `.venv/`
     - `.env`, `.env.local`, `.env.*.local`
     - `.DS_Store`, `Thumbs.db`
     - `*.log`, `npm-debug.log`
     - `*.pem`, `*.key`, `credentials.json`
     - `dist/`, `build/`, `.next/`
   - List missing patterns
   - If missing: ⚠️ "Add missing patterns to .gitignore"
   - If complete: ✅ ".gitignore includes required patterns"

#### 5.2 Tracked Files Check
1. **Check for Ignored Files:**
   - Run: `git ls-files | grep -E "\.env$|node_modules/|\.DS_Store"`
   - If found: ❌ "Sensitive files are tracked. Remove from git: `git rm --cached {file}`"
   - If clean: ✅ "No sensitive files tracked"

#### 5.3 Repository State
1. **Check for Stale Branches:**
   - List local branches: `git branch`
   - List merged branches: `git branch --merged main`
   - Suggest: "Consider deleting merged branches: `git branch -d {branch}`"
   - ✅ "Repository state is clean"

#### 5.4 Output
```
✅ Git Hygiene Check complete.

.gitignore: ✅ All required patterns present
Tracked Files: ✅ No sensitive files tracked
Repository: ✅ Clean state

Recommendations:
- Delete merged branches: {list}
- Review large files: {list}
```

---

## Output Format

### Success Case
```
✅ Git Workflow Validation complete.

Summary:
- Branch: ✅ Follows naming convention
- Working Tree: ✅ Clean
- Remote Sync: ✅ Up to date
- Commit Messages: ✅ Follow Conventional Commits
- Repository Hygiene: ✅ Compliant

Ready to proceed.
```

### Failure Case
```
❌ Git Workflow Validation failed.

Issues Found:
- Branch: ❌ Name doesn't follow format (expected: {type}/{context}-{short-desc})
- Working Tree: ⚠️ Uncommitted changes present
- Commit Message: ❌ Doesn't follow Conventional Commits format
- .gitignore: ⚠️ Missing required patterns

Action Required:
1. Rename branch or create new feature branch
2. Commit or stash changes
3. Use Conventional Commits format for commit messages
4. Update .gitignore with required patterns
```

---

## AI Agent Behavior

When using this command, AI agents must:

1. **Branch Creation:**
   - Always ask for task context to name the branch correctly
   - Never create branches on `main` or `master`
   - Always use the format: `{type}/{context}-{short-desc}`

2. **Commit Messages:**
   - Always write semantic commit messages
   - Never use "update code", "misc changes", or vague descriptions
   - Use imperative mood: "add feature" not "added feature"
   - Include scope when relevant: `feat(auth):` not just `feat:`

3. **PR Preparation:**
   - Auto-generate detailed PR description based on commits
   - Include test plan prompts
   - Reference relevant standards and checklists

4. **Validation:**
   - Always validate before committing
   - Check for secrets before staging
   - Verify .gitignore compliance

---

## Related Commands

- `pre-flight-check` - Includes git status validation
- `pr-review-check` - Validates code before PR submission
- `audit-project` - Full project health check including git hygiene

---

## Integration with Standards

This command enforces `standards/git-flow.md` (Git Repository Standards v1.1):
- Section B: Branching Strategy
- Section C: Commit Message Standards
- Section D: Pull Request Process
- Section E: .gitignore Standards
- Section F: AI Agent Behavior

---

## Examples

### Example 1: Create Feature Branch
```
@agent: Create a branch for adding user authentication
→ action=create-branch, branch-name=feat/user-auth-login
→ Validates format, syncs main, creates branch, pushes to remote
```

### Example 2: Validate Commit
```
@agent: Validate this commit message: "feat(auth): add google oauth login support"
→ action=validate-commit, commit-message="feat(auth): add google oauth login support"
→ Validates format, checks staged files, scans for secrets
```

### Example 3: Prepare PR
```
@agent: Prepare this branch for PR
→ action=prepare-pr
→ Validates branch, checks commits, generates PR title and description template
```

### Example 4: Check Hygiene
```
@agent: Check git repository hygiene
→ action=check-hygiene
→ Validates .gitignore, checks tracked files, reviews repository state
```

