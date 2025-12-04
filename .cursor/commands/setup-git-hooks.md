# Command: setup-git-hooks

## Metadata
- **Version:** 1.0.0
- **Created:** 04-12-2025
- **Last Updated:** 04-12-2025 16:40:36 EST
- **Description:** Automatically sets up git hooks (Husky + lint-staged + commitlint) for enforcing code quality and commit standards
- **Type:** Executable Command - Automates git hooks configuration
- **Applicability:** When setting up new repositories or when git hooks are missing
- **Related Rules:**
  - [git-hooks-standards.mdc](../.cursor/rules/git/git-hooks-standards.mdc) - Git hooks configuration standards
  - [git-commit-messages.mdc](../.cursor/rules/git/git-commit-messages.mdc) - Commit message validation
  - [linting-behavior.mdc](../.cursor/rules/linting-behavior.mdc) - Linting behavior standards
- **Related Standards:**
  - [git-repository-standards.md](../standards/process/git-repository-standards.md) - Git workflow standards
  - [code-quality-linting-standards.md](../standards/process/code-quality-linting-standards.md) - Linting standards

---

## Purpose

Automates the complete setup of git hooks for:
- **Pre-commit:** Linting, formatting, and security checks (secrets scan, .env detection)
- **Commit-msg:** Conventional Commits format validation
- **Pre-push:** (Optional) Test execution and branch protection

---

## When to Use

Run this command when:
- Setting up a new repository
- Git hooks are missing or not configured
- Onboarding a new project to standards
- Pre-flight check detects missing hooks

---

## What This Command Does

### 1. **Install Dependencies**
Installs required packages:
- `husky` - Git hook manager
- `lint-staged` - Run linters on staged files only
- `@commitlint/cli` - Commit message validation
- `@commitlint/config-conventional` - Conventional Commits rules

### 2. **Initialize Husky**
- Creates `.husky/` directory
- Sets up git hook infrastructure
- Adds `prepare` script to package.json

### 3. **Create Pre-Commit Hook**
Creates `.husky/pre-commit` with:
- **Security checks:** Scan for secrets and .env files
- **Linting:** Run linters on staged files (auto-fix when possible)
- **Formatting:** Format code with Prettier/Black
- **Type checking:** Run TypeScript compiler

### 4. **Create Commit-Msg Hook**
Creates `.husky/commit-msg` with:
- Validates Conventional Commits format
- Checks commit type (feat, fix, docs, etc.)
- Enforces subject length (≤50 chars)
- Validates imperative mood

### 5. **Configure lint-staged**
Adds to `package.json`:
```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.md": ["markdownlint --fix", "prettier --write"],
    "*.{json,js}": ["prettier --write"]
  }
}
```

### 6. **Create .commitlintrc.json**
Configures commit message rules:
- Allowed types: feat, fix, docs, style, refactor, perf, test, chore
- Max subject length: 50 characters
- Max header length: 100 characters

---

## Implementation Steps

The agent should execute these steps:

### Step 1: Check if Hooks Already Exist
```bash
# Check for Husky
test -d .husky && echo "exists" || echo "missing"

# Check for dependencies
grep -q "husky" package.json && echo "installed" || echo "not installed"
```

### Step 2: Install Dependencies (if missing)
```bash
npm install --save-dev husky lint-staged @commitlint/cli @commitlint/config-conventional --legacy-peer-deps
```

### Step 3: Initialize Husky
```bash
npx husky init  # For Husky v9+
# OR
npx husky install  # For Husky v8
```

### Step 4: Add Prepare Script
```bash
npm pkg set scripts.prepare="husky"
```

### Step 5: Create Pre-Commit Hook
```bash
cat > .husky/pre-commit << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Security checks first (CRITICAL)
echo "🔐 Running security checks..."

# Check for .env files
if git diff --cached --name-only | grep -E "^\.env$"; then
  echo "❌ .env file is staged. Remove: git reset HEAD .env"
  exit 1
fi

# Scan for secrets
if git diff --cached | grep -iE "password|api_key|secret|token|sk_live|ghp_|AWS_SECRET" | grep -v "^---\|^+++\|^-.*password.*="; then
  echo "❌ Secrets detected in staged files."
  exit 1
fi

echo "✅ Security checks passed"

# Run lint-staged
echo "🔍 Running linters and formatters..."
npx lint-staged

echo "✅ Pre-commit checks complete"
EOF

chmod +x .husky/pre-commit
```

### Step 6: Create Commit-Msg Hook
```bash
cat > .husky/commit-msg << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no -- commitlint --edit $1
EOF

chmod +x .husky/commit-msg
```

### Step 7: Configure lint-staged in package.json
Add `lint-staged` configuration to package.json (see Section 5 above)

### Step 8: Create .commitlintrc.json
```bash
cat > .commitlintrc.json << 'EOF'
{
  "extends": ["@commitlint/config-conventional"],
  "rules": {
    "type-enum": [2, "always", ["feat", "fix", "docs", "style", "refactor", "perf", "test", "chore"]],
    "subject-max-length": [2, "always", 50],
    "subject-case": [0],
    "header-max-length": [2, "always", 100]
  }
}
EOF
```

### Step 9: Verify Installation
```bash
# Test hooks are executable
ls -la .husky/pre-commit .husky/commit-msg

# Verify prepare script
npm pkg get scripts.prepare

# Verify lint-staged config
npm pkg get lint-staged
```

---

## Success Criteria

After running this command, verify:
- [ ] `.husky/` directory exists with pre-commit and commit-msg hooks
- [ ] Hooks are executable (`chmod +x`)
- [ ] `package.json` has `prepare` script
- [ ] `package.json` has `lint-staged` configuration
- [ ] `.commitlintrc.json` exists
- [ ] Dependencies installed (husky, lint-staged, @commitlint/*)
- [ ] Test: Try committing with bad message → should fail
- [ ] Test: Try committing .env → should fail
- [ ] Test: Try committing with secrets → should fail

---

## Integration with Workflow

This command integrates with:

### `pre-flight-check` Command
- Pre-flight should verify hooks are installed
- If missing, automatically run this command
- See: `.cursor/commands/pre-flight-check.md`

### `git-commit-messages.mdc` Rule
- Hooks enforce the same standards as this rule
- Prevents non-compliant commits at commit-time

### `git-repository-hygiene.mdc` Rule
- Hooks enforce security checks from this rule
- Prevents .env and secrets at commit-time

---

## Related Files

- **Rules:**
  - [git-hooks-standards.mdc](../rules/git/git-hooks-standards.mdc) - Standards this command implements
  - [git-commit-messages.mdc](../rules/git/git-commit-messages.mdc) - Commit validation rules
  - [git-repository-hygiene.mdc](../rules/git/git-repository-hygiene.mdc) - Security checks
  - [linting-behavior.mdc](../rules/linting-behavior.mdc) - Linting expectations
  - [pre-flight-check.mdc](../rules/pre-flight-check.mdc) - Calls this if hooks missing
- **Commands:**
  - [pre-flight-check.md](./pre-flight-check.md) - Verifies hooks are installed
- **Standards:**
  - [git-repository-standards.md](../standards/process/git-repository-standards.md) - Git workflow standards
  - [code-quality-linting-standards.md](../standards/process/code-quality-linting-standards.md) - Linting standards

---

## How to Use

**AI agents should automatically run this command when:**
- Setting up a new repository
- Pre-flight check detects missing git hooks
- User requests git hooks setup

**Manual execution:**
```
Agent, run setup-git-hooks command
```

**Expected result:**
- Git hooks fully configured
- All checks automated
- Quality standards enforced at commit-time

