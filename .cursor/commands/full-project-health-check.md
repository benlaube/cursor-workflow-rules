# full-project-health-check

## Metadata
- **Status:** Active
- **Created:** 12-02-2025 00:00:00 EST
- **Last Updated:** 12-04-2025 14:32:51 EST
- **Version:** 1.0.0
- **Description:** Run comprehensive project health check including project audit, security audit, and RLS policy review. Generates combined health report with all audit results.
- **Type:** Executable Command
- **Audience:** AI agents performing comprehensive project health checks
- **Applicability:** Before major releases, during project onboarding, as part of periodic health checks, or after major refactoring
- **How to Use:** Run this meta-command to run all project audits together. Use `fix=true` to attempt automatic fixes, `output=file` to save report to file
- **Dependencies:** None
- **Related Cursor Commands:** [audit-project.md](./audit-project.md), [audit-security.md](./audit-security.md), [pre-flight-check.md](./pre-flight-check.md)
- **Related Cursor Rules:** [supabase-rls-policy-review.mdc](../rules/supabase-rls-policy-review.mdc)
- **Related Standards:** [process/checklists/project_audit_checklist_v1_0.md](../../standards/process/checklists/project_audit_checklist_v1_0.md), [security/security-audit-checklist.md](../../standards/security/security-audit-checklist.md)

---

# Full Project Health Check Command

Use this meta-command to run all project audits together: project audit, security audit, and RLS policy review. Generates a combined health report.

**Related Commands:**
- `project-audit` - Project structure and standards validation
- `security_audit` - Security vulnerabilities and secrets scan

**Related Rules (Auto-Applied):**
- `.cursor/rules/supabase-rls-policy-review.mdc` - Deep RLS policy analysis (applies automatically when Supabase detected)

## Usage

@agent: When asked to "run full health check", "audit everything", or "comprehensive project review", follow this procedure.

**Parameters:**
- `fix`: `true` or `false` (default: `false`). Attempt to fix minor issues automatically.
- `output`: `console` (default) or `file`. If `file`, saves report to `logs/project_health_<TIMESTAMP>.md`.

---

## Execution Steps

### 1. Run Project Audit
1. **Execute:** Run `project-audit` command with `deep=true`
2. **Capture:** Store results for combined report
3. **Status:** Track pass/fail status

### 2. Run Security Audit
1. **Execute:** Run `security_audit` command
2. **Capture:** Store results for combined report
3. **Status:** Track pass/fail status

### 3. Run RLS Policy Review (If Supabase Detected)
1. **Check for Supabase:** Detect if `supabase/` directory exists or `SUPABASE_URL` env var is set
2. **If Supabase Detected:**
   - Apply `.cursor/rules/supabase-rls-policy-review.mdc` rule automatically
   - Capture results for combined report
   - Track pass/fail status
3. **If No Supabase:** Skip RLS review (not applicable)

### 4. Generate Combined Report

#### 4.1 Executive Summary
```
Project Health Check Report
Generated: <TIMESTAMP>

Overall Status: ✅ Healthy | ⚠️ Needs Attention | ❌ Critical Issues

Summary:
- Project Structure: ✅ | ⚠️ | ❌
- Security: ✅ | ⚠️ | ❌
- Database (RLS): ✅ | ⚠️ | ❌
```

#### 4.2 Detailed Sections
1. **Project Audit Results**
   - Structure violations
   - Module issues
   - Code hygiene problems
   - Documentation gaps

2. **Security Audit Results**
   - Secrets found
   - Dependency vulnerabilities
   - Configuration issues
   - API security concerns

3. **RLS Policy Review Results**
   - Tables without RLS
   - Policy logic issues
   - Mutation safety problems
   - Role-based access concerns

#### 4.3 Action Items
- Compile all action items from all three audits
- Prioritize by severity (Critical, High, Medium, Low)
- Group by category
- Format as markdown checklist ready for GitHub issue

#### 4.4 Recommendations
- Provide prioritized recommendations
- Suggest next steps
- Reference relevant standards and checklists

---

## Output Format

### Success Case
```
✅ Full Project Health Check complete.

Executive Summary:
- Overall Status: ✅ Healthy
- Project Structure: ✅ Compliant
- Security: ✅ No critical issues
- Database (RLS): ✅ All policies secure

All audits passed. Project is in good health.
```

### Failure Case
```
⚠️ Full Project Health Check found issues.

Executive Summary:
- Overall Status: ⚠️ Needs Attention
- Project Structure: ⚠️ 3 violations
- Security: ❌ 2 critical issues
- Database (RLS): ⚠️ 1 policy issue

---

Detailed Results:

**Project Audit:**
- ❌ Missing `.cursor/` directory
- ⚠️ Module `auth-module` missing README.md
- ⚠️ File `src/utils/helpers.ts` is 450 lines (refactor candidate)

**Security Audit:**
- ❌ Hardcoded API key found in `src/config.ts:12`
- ❌ `.env` file is tracked in git
- ⚠️ 2 high-severity dependency vulnerabilities

**RLS Policy Review:**
- ⚠️ Table `public.posts` missing tenant check in INSERT policy
- ⚠️ Table `public.audit_logs` missing RLS

---

Action Items (Priority: Critical → Low):

**Critical:**
- [ ] Remove hardcoded API key from `src/config.ts`
- [ ] Remove `.env` from git tracking
- [ ] Enable RLS on `public.audit_logs`

**High:**
- [ ] Fix 2 high-severity dependency vulnerabilities
- [ ] Add tenant check to `public.posts` INSERT policy

**Medium:**
- [ ] Create `.cursor/` directory structure
- [ ] Add README.md to `auth-module`

**Low:**
- [ ] Refactor `src/utils/helpers.ts` (split into smaller modules)

---

Recommendations:
1. Address critical security issues immediately
2. Run `security_audit` with `fix=true` to auto-fix gitignore
3. Review and implement RLS policy suggestions
4. Schedule follow-up audit after fixes
```

---

## Report File Format

If `output=file`, saves to `logs/project_health_<TIMESTAMP>.md`:

```markdown
# Project Health Check Report

**Generated:** 2025-11-25 14:30:00
**Overall Status:** ⚠️ Needs Attention

## Executive Summary
[Summary from above]

## 1. Project Audit Results
[Full project audit output]

## 2. Security Audit Results
[Full security audit output]

## 3. RLS Policy Review Results
[Full RLS review output]

## Action Items
[Compiled action items]

## Recommendations
[Prioritized recommendations]
```

---

## Integration with Other Commands

This command orchestrates:
- `project-audit` (with `deep=true`)
- `security_audit`
- `.cursor/rules/supabase-rls-policy-review.mdc` (auto-applied when Supabase detected)

Can be run:
- Before major releases
- During project onboarding
- As part of periodic health checks
- After major refactoring

---

## Related Commands

- `pre-flight-check` - Quick validation before coding
- `project-audit` - Standalone project audit
- `security_audit` - Standalone security audit
- `.cursor/rules/supabase-rls-policy-review.mdc` - Auto-applied RLS review (when Supabase detected)
- `pr-review-check` - Pre-PR validation

---

## Integration with AGENTS.md

This command is referenced in `AGENTS.md` for:
- Periodic health checks (weekly/monthly)
- Before major releases
- Project onboarding

