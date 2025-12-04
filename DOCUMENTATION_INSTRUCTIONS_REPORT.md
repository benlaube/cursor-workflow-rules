# Documentation Instructions Report

**Generated:** 12-04-2025 16:50:59 EST  
**Purpose:** Identify where AI agents are instructed on documentation creation, report saving, and commenting standards

---

## Summary

**Status:** ⚠️ **Gaps Found** - Some instructions exist but are scattered and incomplete

**Findings:**

- ✅ **Documentation Creation:** Well documented in multiple places
- ⚠️ **Audit Reports:** Instructions exist but are inconsistent across commands
- ⚠️ **One-Off Reports:** No clear standard for user-requested reports
- ⚠️ **Commenting Standards:** Partially documented, missing comprehensive code commenting standard

---

## 1. How/When to Create Documentation

### ✅ Well Documented

**Primary Sources:**

1. **`.cursor/rules/workflow-standards-documentation-maintenance.mdc`** (Section 1)
   - **When to Update Documentation:**
     - Feature Changes
     - Architecture Changes
     - Standards Updates
     - Process Changes
     - Module Changes
     - API Changes
     - Configuration Changes
     - Breaking Changes
   - **Location:** `.cursor/rules/workflow-standards-documentation-maintenance.mdc` lines 24-33

2. **`standards/project-planning/documentation-management.md`** (Section 1)
   - **Where:** All general project documentation must be stored in `/docs` directory
   - **Location:** `standards/project-planning/documentation-management.md` line 23

3. **`standards/project-planning/documentation-standards.md`**
   - **What:** Comprehensive guide on what documentation files should exist
   - **Location:** `standards/project-planning/documentation-standards.md` (entire file)

4. **`.cursor/rules/task-workflow.mdc`** (Section 2)
   - **When:** After completing a task, update documentation
   - **What:** CHANGELOG.md, standards/, module READMEs
   - **Location:** `.cursor/rules/task-workflow.mdc` Section 2

**Integration:**

- Referenced in `AGENTS.md` Section 7.6
- Auto-applied via `workflow-standards-documentation-maintenance.mdc` (alwaysApply: true)

---

## 2. When/How/Where to Save Audit Reports

### ⚠️ **INCONSISTENT - Needs Standardization**

**Current State:**

Different commands save reports to different locations:

1. **`logs/` directory** (Git-ignored):
   - `audit-security.md` → `logs/security_audit_<TIMESTAMP>.md`
   - `full-project-health-check.md` → `logs/project_health_<TIMESTAMP>.md`
   - `audit-access-control.md` → `logs/access_control_audit_<DATE>.md`
   - `audit-readmes.md` → `./logs/readme-audit-YYYY-MM-DD-HH-MM-SS.txt`

2. **`/docs/audit/` directory**:
   - `audit-database.md` → `/docs/audit/database_audit_<DATE>.md`

**Documentation:**

- **`standards/project-planning/project-structure.md`** (Section 3.4, line 46):
  - Defines `logs/` as: "**Git-ignored** folder for debug outputs, migration logs, and agent scratchpads"
  - **Location:** `standards/project-planning/project-structure.md` line 46

**Gap:** No clear standard for:

- When to use `logs/` vs `/docs/audit/`
- Where one-off user-requested reports should be saved
- Report naming conventions (some use `<TIMESTAMP>`, some use `<DATE>`)

**Recommendation:** Create standard in `standards/project-planning/documentation-management.md`:

- Audit reports → `logs/` (git-ignored, temporary)
- User-requested reports → Ask user or default to `logs/` with clear naming
- Historical/archived reports → `/docs/audit/` (if needed for reference)

---

## 3. How Detailed to Comment in Documents/Rules/Commands or Code

### ⚠️ **PARTIALLY DOCUMENTED - Missing Comprehensive Standard**

**Current State:**

### A. Database Comments (✅ Well Documented)

**Source:** `standards/database/schema.md` (Section C, lines 28-44)

**Requirement:**

- Every table and every column MUST have a `COMMENT ON` statement
- AI agents MUST generate comments when creating/modifying tables
- Comments are the "single source of truth" for AI agents

**Example:**

```sql
COMMENT ON TABLE users IS 'Core user profiles for authentication and application data.';
COMMENT ON COLUMN users.email IS 'Unique email address, verified via Supabase Auth.';
```

**Location:** `standards/database/schema.md` lines 28-44

### B. Code Comments (⚠️ Partially Documented)

**Mentioned in Checklists:**

1. **`standards/process/checklists/pr_review_checklist_v1_0.md`** (Section 4.1, lines 218-219):
   - "Do exported functions have comments?"
   - "JSDoc/Pydoc: Ensure exported functions have proper documentation"
   - **Location:** `standards/process/checklists/pr_review_checklist_v1_0.md` lines 218-219

2. **`standards/process/checklists/project_audit_checklist_v1_0.md`** (Section 4, line 91):
   - "Do all exported functions have JSDoc comments?"
   - **Location:** `standards/process/checklists/project_audit_checklist_v1_0.md` line 91

**User Rules:**

- "Every function should have a comment in the code base with a description and function dependancies."
- **Location:** User rules (not in standards file)

**Gap:** No comprehensive standard document for:

- What level of detail is required in code comments
- When to use JSDoc vs inline comments
- Comment format standards
- Documentation vs code commenting distinction

### C. Documentation/Rules/Commands Comments (⚠️ Not Explicitly Documented)

**Current Practice:**

- Rules and commands have metadata sections
- Documentation has metadata sections
- But no explicit standard on comment detail level within the content

**Gap:** No standard for:

- How detailed explanations should be in rules/commands
- When to include examples vs just descriptions
- Comment detail level in documentation files

---

## Recommendations

### 1. Create Report Location Standard

**Action:** Add section to `standards/project-planning/documentation-management.md`:

```markdown
## 8. Report Generation Standards

### 8.1 Report Locations

- **Audit Reports:** Save to `logs/` directory (git-ignored)
  - Format: `logs/{report_type}_{TIMESTAMP}.md`
  - Example: `logs/security_audit_12-04-2025_16-50-59.md`
- **User-Requested Reports:** Save to `logs/` by default, or ask user for location
  - Format: `logs/{user_request_description}_{TIMESTAMP}.md`
- **Historical/Archived Reports:** Save to `/docs/audit/` if needed for reference
  - Format: `/docs/audit/{report_type}_{DATE}.md`

### 8.2 Report Naming Conventions

- Use `MM-DD-YYYY_HH-MM-SS` format for timestamps in filenames
- Use descriptive names: `security_audit`, `database_audit`, `project_health`
- Always include timestamp to prevent overwrites
```

### 2. Create Code Commenting Standard

**Action:** Create `standards/process/code-commenting-standards.md`:

```markdown
# Code Commenting Standards

## 1. Function Comments

### Required for Exported Functions

- JSDoc format for TypeScript/JavaScript
- Pydoc format for Python
- Must include: description, parameters, return type, dependencies

### Optional for Internal Functions

- Brief inline comments for complex logic
- Explain "why" not "what"

## 2. Comment Detail Level

- **High Detail:** Public APIs, complex algorithms, business logic
- **Medium Detail:** Utility functions, helper methods
- **Low Detail:** Self-explanatory code (avoid redundant comments)

## 3. Database Comments

- See `standards/database/schema.md` Section C
- Every table and column MUST have COMMENT ON statement
```

### 3. Create Documentation Comment Detail Standard

**Action:** Add section to `standards/project-planning/documentation-management.md`:

```markdown
## 9. Documentation Detail Standards

### 9.1 Rules and Commands

- Include clear purpose statement
- Provide step-by-step instructions
- Include examples for complex operations
- Reference related files and standards

### 9.2 Standards Documents

- Comprehensive coverage of topic
- Include rationale (why, not just what)
- Provide examples and patterns
- Cross-reference related standards
```

---

## Related Files

- **Documentation Creation:**
  - `.cursor/rules/workflow-standards-documentation-maintenance.mdc`
  - `standards/project-planning/documentation-management.md`
  - `standards/project-planning/documentation-standards.md`
  - `.cursor/rules/task-workflow.mdc`

- **Report Locations:**
  - `standards/project-planning/project-structure.md` (defines `logs/` directory)
  - `.cursor/commands/audit-security.md` (uses `logs/`)
  - `.cursor/commands/audit-database.md` (uses `/docs/audit/`)

- **Commenting Standards:**
  - `standards/database/schema.md` (database comments)
  - `standards/process/checklists/pr_review_checklist_v1_0.md` (code comments mentioned)
  - User rules (function comments requirement)

---

## Conclusion

**Documentation Creation:** ✅ Well documented across multiple files

**Report Saving:** ⚠️ Inconsistent - needs standardization in `documentation-management.md`

**Commenting Standards:** ⚠️ Partially documented - needs comprehensive standard for code comments and documentation detail level

**Next Steps:**

1. Add report location standard to `documentation-management.md`
2. Create `code-commenting-standards.md` standard
3. Add documentation detail standards to `documentation-management.md`
