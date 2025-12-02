# Commands and Rules Review Report

**Generated:** 2025-01-27  
**Purpose:** Comprehensive review of all commands and rules for conflicts, missing context, and file-specific application needs.

---

## Executive Summary

✅ **Overall Status:** Good structure with minor inconsistencies  
⚠️ **Issues Found:** 5 issues requiring fixes  
📝 **Recommendations:** 3 improvements suggested

---

## 1. Critical Issues (Must Fix)

### 1.1 Incorrect Checklist Path References in `task_workflow.mdc`

**Location:** `.cursor/rules/task_workflow.mdc`

**Issue:**
- Line 13 references: `checklists/pre-flight-check.md` ❌
- Line 25 references: `checklists/pr-review-check.md` ❌

**Correct Paths:**
- Should be: `docs/process/checklists/pre_flight_checklist_v1_0.md` ✅
- Should be: `docs/process/checklists/pr_review_checklist_v1_0.md` ✅

**Impact:** High - Rules reference non-existent files, breaking workflow

**Fix Required:**
```markdown
# Before
2.  **Run Pre-Flight:** Read and follow `checklists/pre-flight-check.md`.
1.  **Run Review:** Read and follow `checklists/pr-review-check.md`.

# After
2.  **Run Pre-Flight:** Read and follow `docs/process/checklists/pre_flight_checklist_v1_0.md`.
1.  **Run Review:** Read and follow `docs/process/checklists/pr_review_checklist_v1_0.md`.
```

---

## 2. Consistency Issues (Should Fix)

### 2.1 File Extension Inconsistency

**Issue:** Mixed use of `.md` and `.mdc` extensions

**Current State:**
- ✅ `.md`: `pre_flight_check.md`, `pr_review_check.md`, `project_audit.md`, `rls_policy_review.md`, `full_project_health_check.md`
- ⚠️ `.mdc`: `security-audit.mdc`, `launch.mdc`, `verify-access-control.mdc`

**Recommendation:**
- Standardize on `.md` for all command files (matches majority)
- OR standardize on `.mdc` if that's the intended format for Cursor commands
- **Note:** Rules use `.mdc` (which is correct), but commands should be consistent

**Action:** Decide on standard and rename files accordingly

---

### 2.2 Command Naming Inconsistency

**Issue:** Mixed naming conventions

**Current State:**
- ✅ Underscores: `pre_flight_check.md`, `pr_review_check.md`, `project_audit.md`, `rls_policy_review.md`
- ⚠️ Dashes: `security-audit.mdc`, `verify-access-control.mdc`
- ✅ No separator: `launch.mdc`, `full_project_health_check.md`

**Recommendation:**
- Standardize on underscores (`snake_case`) for all command files
- Rename: `security-audit.mdc` → `security_audit.md`
- Rename: `verify-access-control.mdc` → `verify_access_control.md`

**Rationale:** Underscores are more common in file naming and match the majority

---

### 2.3 Glob Pattern Inconsistency

**Issue:** Only one command specifies globs

**Current State:**
- `verify-access-control.mdc` has: `globs: "**/*.sql", "**/*.ts"`
- All other commands have: `globs:` (empty or not specified)

**Recommendation:**
- Either add appropriate globs to all commands that should be file-specific
- OR remove globs from `verify-access-control.mdc` if it should apply globally

**Analysis:**
- `verify-access-control.mdc` should probably have globs (it's SQL/TS specific)
- Other commands are workflow-based and should apply globally (no globs needed)

**Action:** Keep globs for `verify-access-control`, ensure others have empty globs field

---

## 3. Missing Context Issues

### 3.1 Command File Metadata

**Issue:** Some commands missing consistent frontmatter

**Current State:**
- Most commands have: `description`, `globs`
- Some missing: `alwaysApply` (though this may be intentional for commands)

**Recommendation:**
- Commands should NOT have `alwaysApply: true` (that's for rules)
- Ensure all commands have consistent frontmatter:
  ```yaml
  ---
  description: [Clear description]
  globs: [empty or specific patterns]
  ---
  ```

---

### 3.2 Cross-Reference Completeness

**Status:** ✅ Good - All commands reference their source checklists correctly

**Verified:**
- `pre_flight_check.md` → `docs/process/checklists/pre_flight_checklist_v1_0.md` ✅
- `pr_review_check.md` → `docs/process/checklists/pr_review_checklist_v1_0.md` ✅
- `project_audit.md` → `docs/process/checklists/project_audit_checklist_v1_0.md` ✅
- `security-audit.mdc` → `docs/process/checklists/security_audit_checklist_v1_0.md` ✅
- `rls_policy_review.md` → `docs/process/checklists/rls_policy_review_checklist_v1_0.md` ✅

---

## 4. File-Specific Application Analysis

### 4.1 Rules (Should Apply Globally)

**Status:** ✅ Correct

All rules in `.cursor/rules/` have `alwaysApply: true`:
- `environment.mdc` ✅
- `task_workflow.mdc` ✅
- `self_healing.mdc` ✅
- `ai-interaction-rules.mdc` ✅ (no frontmatter, but should apply globally)

**Recommendation:** Add frontmatter to `ai-interaction-rules.mdc`:
```yaml
---
description: AI Interaction Rules & Persona
globs: "**/*"
alwaysApply: true
---
```

---

### 4.2 Commands (Workflow-Based, Not File-Specific)

**Status:** ✅ Correct (mostly)

**Analysis:**
- Commands are workflow-based, not file-specific
- `verify-access-control.mdc` is the exception (has SQL/TS globs) - this is appropriate
- Other commands should apply globally (no globs needed)

**Recommendation:**
- Keep current approach for workflow commands
- `verify-access-control.mdc` correctly scoped to SQL/TS files

---

## 5. Duplication Analysis (Intentional vs. Problematic)

### 5.1 Container Management Rules

**Status:** ✅ Intentional Duplication (Good Practice)

**Locations:**
- `environment.mdc` Section 6
- `self_healing.mdc` Section 6
- `launch.mdc` Section "Container Isolation Rules"

**Analysis:** This is **intentional and good** - critical security rules should be repeated in context where they're needed.

**Recommendation:** Keep as-is. Consider adding a note: "See also: [other locations]" for cross-reference.

---

### 5.2 Checklist References

**Status:** ✅ Consistent (after fixes)

All commands correctly reference their source checklists. No problematic duplication.

---

## 6. Recommendations Summary

### High Priority (Fix Immediately)

1. **Fix `task_workflow.mdc` checklist paths** (Section 1.1)
   - Update line 13: `checklists/pre-flight-check.md` → `docs/process/checklists/pre_flight_checklist_v1_0.md`
   - Update line 25: `checklists/pr-review-check.md` → `docs/process/checklists/pr_review_checklist_v1_0.md`

### Medium Priority (Standardize)

2. **Standardize file extensions**
   - Decide: `.md` or `.mdc` for commands
   - Rename files to match standard

3. **Standardize naming convention**
   - Use underscores (`snake_case`) for all command files
   - Rename: `security-audit.mdc` → `security_audit.md`
   - Rename: `verify-access-control.mdc` → `verify_access_control.md`

4. **Add frontmatter to `ai-interaction-rules.mdc`**
   - Add consistent frontmatter with `alwaysApply: true`

### Low Priority (Nice to Have)

5. **Add cross-reference notes** for container management rules
   - Add "See also:" notes linking related sections

---

## 7. Verification Checklist

After fixes, verify:

- [ ] All checklist paths in rules/commands are correct
- [ ] All command files use consistent extension (`.md` or `.mdc`)
- [ ] All command files use consistent naming (`snake_case`)
- [ ] All rules have `alwaysApply: true` in frontmatter
- [ ] All commands have consistent frontmatter structure
- [ ] All cross-references between commands, checklists, and standards are valid

---

## 8. Related Files to Update

If renaming command files, also update:

- `AGENTS.md` Section 8.2 (command references)
- `INTEGRATION_GUIDE.md` (if it references specific filenames)
- Any other documentation referencing command filenames

---

**Next Steps:**
1. Fix critical path issues in `task_workflow.mdc`
2. Decide on file extension standard
3. Standardize naming conventions
4. Add frontmatter to `ai-interaction-rules.mdc`
5. Verify all cross-references

