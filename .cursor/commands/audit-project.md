# audit-project

## Metadata
- **Status:** Active
- **Created:** 12-02-2025 00:00:00 EST
- **Last Updated:** 12-04-2025 14:32:51 EST
- **Version:** 1.0.0
- **Description:** Audit project structure, modules, database, code hygiene, and documentation against ai-agent-knowledge-base standards. Ideal when onboarding a repo into the "Workflow Rules" universe or before major refactoring.
- **Type:** Executable Command
- **Audience:** AI agents performing project audits
- **Applicability:** When onboarding a new repository, before major refactoring, before major releases, or for periodic health checks
- **How to Use:** Run this command to audit an existing project against the ai-agent-knowledge-base standards. Use `fix=true` to attempt automatic fixes, `deep=true` for comprehensive audit including RLS review
- **Dependencies:** None
- **Related Cursor Commands:** [full-project-health-check.md](./full-project-health-check.md), [audit-security.md](./audit-security.md), [pre-flight-check.md](./pre-flight-check.md)
- **Related Cursor Rules:** [supabase-rls-policy-review.mdc](../rules/supabase-rls-policy-review.mdc)
- **Related Standards:** [process/checklists/project_audit_checklist_v1_0.md](../../standards/process/checklists/project_audit_checklist_v1_0.md), [project-planning/project-structure.md](../../standards/project-planning/project-structure.md), [database/schema.md](../../standards/database/schema.md)

---

# Project Audit Command

Use this command to audit an existing project against the ai-agent-knowledge-base standards. Ideal when onboarding a repo into the "Workflow Rules" universe or before major refactoring.

**Source Checklist:** `standards/process/checklists/project_audit_checklist_v1_0.md`

## Usage

@agent: When asked to "audit the project", "check project structure", or "validate against standards", follow this procedure.

**Parameters:**
- `fix`: `true` or `false` (default: `false`). If true, attempt to fix minor issues (e.g., create missing directories).
- `deep`: `true` or `false` (default: `false`). If true, also apply RLS policy review rule (when Supabase detected) and run `security_audit` checks.

---

## Execution Steps

### 1. Project Structure Validation
1. **Check Root Directory Structure:**
   - Verify `src/` exists and contains app logic
   - Verify `docs/` exists
   - Verify `.cursor/` exists
   - If missing: Create with `fix=true`, or report as violation

2. **Configuration Files:**
   - Check `.env` is in `.gitignore`: `grep -q "^\.env$" .gitignore`
   - If not ignored: Warn and add to `.gitignore` if `fix=true`
   - Check `.env.example` exists
   - If missing: Create template if `fix=true`, or report as violation

3. **Output:**
   - ✅ "Project structure matches standards"
   - Or list violations

### 2. Module Usage Validation
1. **Module Location:**
   - Check if modules are in dedicated folder (`src/modules`, `modules/`, or `packages/`)
   - List all modules found

2. **Module Structure:**
   - For each module, verify:
     - `README.md` exists
     - `index.ts` (or `index.js`, `index.py`) exists
     - Database modules have `migrations/` directory
   - Report modules missing required files

3. **Output:**
   - ✅ "All modules follow structure standards"
   - Or list module violations

### 3. Database & Architecture Validation
*If `deep=true` and Supabase detected, apply `.cursor/rules/supabase-rls-policy-review.mdc` rule*

1. **Database Comments:**
   - If Supabase project: Use Supabase MCP to check table comments
   - Report tables without comments
   - Reference: `standards/database/schema.md`

2. **RLS Policies:**
   - Check if RLS is enabled on all public tables
   - If `deep=true` and Supabase detected, apply `.cursor/rules/supabase-rls-policy-review.mdc` rule automatically
   - Report tables without RLS

3. **Architecture Separation:**
   - Check for clear separation between:
     - Service Layer (business logic)
     - API Layer (routes/handlers)
   - Report violations (e.g., business logic in route handlers)

4. **Output:**
   - ✅ "Database and architecture follow standards"
   - Or list violations

### 4. Code Hygiene Validation
1. **File Size Check:**
   - Find files > 200 lines: `find . -type f -name "*.ts" -o -name "*.js" -o -name "*.py" | xargs wc -l | awk '$1 > 200'`
   - Report large files as refactoring candidates

2. **Magic Strings & Secrets:**
   - Scan for hardcoded secrets: `grep -rE "sk_live|ghp_|password.*=" . --exclude-dir={node_modules,.git}`
   - Report findings

3. **Documentation:**
   - Check exported functions have JSDoc/Pydoc comments
   - Sample check: `grep -r "^export.*function\|^def " src/ | wc -l` vs `grep -r "@param\|:param" src/ | wc -l`
   - Report undocumented functions

4. **Output:**
   - ✅ "Code hygiene is good"
   - Or list violations

### 5. Documentation Validation
1. **Required Files:**
   - Check `README.md` exists in root
   - Check `docs/ROADMAP.md` or roadmap files exist
   - Check `docs/ARCHITECTURE.md` or architecture docs exist
   - Report missing files

2. **Output:**
   - ✅ "Documentation is complete"
   - Or list missing documentation

### 6. Action Items Generation
1. **Compile Violations:**
   - Group by category (Structure, Modules, Database, Code, Docs)
   - Prioritize (Critical, High, Medium, Low)

2. **Generate Action Items:**
   - Format as markdown checklist
   - Ready to paste into GitHub issue

---

## Output Format

### Success Case
```
✅ Project audit complete.

Summary:
- Structure: ✅ Matches standards
- Modules: ✅ All modules follow structure
- Database: ✅ RLS enabled, tables documented
- Code Hygiene: ✅ No major issues
- Documentation: ✅ Complete

Project is compliant with ai-agent-knowledge-base standards.
```

### Failure Case
```
⚠️ Project audit found violations.

Issues Found:

**Structure:**
- ❌ `.cursor/` directory missing
- ❌ `.env` not in `.gitignore`

**Modules:**
- ❌ `modules/auth-module/` missing `README.md`
- ❌ `modules/data-module/` missing `migrations/` directory

**Database:**
- ❌ Table `public.users` missing RLS
- ❌ Table `public.posts` missing table comment

**Code Hygiene:**
- ⚠️ `src/utils/helpers.ts` is 450 lines (refactor candidate)
- ⚠️ Found 3 hardcoded API keys in `src/config.ts`

**Documentation:**
- ❌ Missing `docs/ARCHITECTURE.md`

---

Action Items (copy to GitHub issue):
- [ ] Create `.cursor/` directory structure
- [ ] Add `.env` to `.gitignore`
- [ ] Add `README.md` to `modules/auth-module/`
- [ ] Create `migrations/` in `modules/data-module/`
- [ ] Enable RLS on `public.users` table
- [ ] Add table comment to `public.posts`
- [ ] Refactor `src/utils/helpers.ts` (split into smaller modules)
- [ ] Move hardcoded keys to environment variables
- [ ] Create `docs/ARCHITECTURE.md`
```

---

## Deep Mode

If `deep=true`, this command will also:
1. Apply `.cursor/rules/supabase-rls-policy-review.mdc` rule automatically (if Supabase detected) for detailed RLS analysis
2. Call `security_audit` for security validation
3. Include results in the final report

---

## Related Commands

- `pre-flight-check` - Quick validation before coding
- `audit-security` - Security-specific audit
- `.cursor/rules/supabase-rls-policy-review.mdc` - Auto-applied RLS policy analysis (when Supabase detected)
- `full-project-health-check` - Run all audits together

---

## Integration with AGENTS.md

This command is referenced in `AGENTS.md` for:
- Onboarding new repositories
- Before major refactoring
- Periodic health checks

