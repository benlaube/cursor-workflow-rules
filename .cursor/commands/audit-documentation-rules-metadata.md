# Audit Documentation & Rules Metadata

## Metadata
- **Status:** Active
- **Created:** 04-12-2025
- **Last Updated:** 04-12-2025 11:12:43 EST
- **Version:** 2.0.0
- **Description:** Command to audit and update metadata across all documentation and rule files by orchestrating the documentation-metadata and rule-metadata rules
- **Type:** Executable Command - Used by AI agents for periodic documentation audits
- **Applicability:** When performing periodic maintenance, after major updates, before releases, or when onboarding
- **Related Cursor Rules:** 
  - [documentation-metadata.mdc](../../.cursor/rules/documentation-metadata.mdc) - Validates .md file metadata
  - [rule-metadata.mdc](../../.cursor/rules/rule-metadata.mdc) - Validates .mdc file metadata
  - [documentation-dependency-tracking.mdc](../../.cursor/rules/documentation-dependency-tracking.mdc) - Tracks doc dependencies
- **Related Standards:** 
  - [process/cursor-rules-standards.md](../../standards/process/cursor-rules-standards.md) - Rule creation standards
  - [project-planning/documentation.md](../../standards/project-planning/documentation.md) - Documentation management standards
- **How to Use:** Run `audit-documentation-rules-metadata` to scan all documentation and rule files, then apply the appropriate metadata validation rules

---

## Purpose

Systematically review all documentation and rule files to ensure they have complete, accurate metadata. This command orchestrates two specialized rules:
- **`documentation-metadata.mdc`** - Validates `.md` files (docs, standards, commands)
- **`rule-metadata.mdc`** - Validates `.mdc` files (Cursor rules)

---

## When to Run

- **Periodic Maintenance:** Monthly or quarterly
- **After Major Updates:** When significant changes are made to multiple standards or rules
- **Before Releases:** As part of release preparation
- **Onboarding:** When adopting this standards library in a new project

---

## Command Invocation

Use this command name in your AI assistant:
```
audit-documentation-rules-metadata
```

---

## Execution Steps

When this command is invoked, the AI agent should:

### Step 1: Identify Target Files

1. **Documentation Files (`.md`):**
   - All files in `standards/` directory (recursive)
   - All files in `docs/` directory (recursive)
   - All files in `.cursor/commands/` directory

2. **Rule Files (`.mdc`):**
   - All files in `.cursor/rules/` directory

3. **Exclusions:**
   - `node_modules/`
   - Root-level `README.md` files (unless they contain standards)
   - Generated files
   - Archive directories

### Step 2: Apply Documentation Metadata Rule

For each `.md` file, apply the validation logic from `documentation-metadata.mdc`:

1. **Check for metadata section:**
   - Look for `## Metadata` section at the top
   - Verify all required fields are present

2. **Validate required fields:**
   - Status (Active|Deprecated|Draft|Review)
   - Created (DD-MM-YYYY format)
   - Last Updated (DD-MM-YYYY HH:MM:SS EST format)
   - Version (X.Y for standards/docs, X.Y.Z for commands)
   - Description (brief description of purpose)
   - Type (document type and audience)
   - Applicability (when/where document applies)
   - How to Use (brief instructions)

3. **Check optional fields:**
   - Dependencies (list of related files)
   - Related Cursor Commands
   - Related Cursor Rules
   - Related Standards

4. **Generate report:**
   - Mark as ✅ Complete, ⚠️ Incomplete, or ❌ Missing
   - List missing fields
   - Propose complete metadata

### Step 3: Apply Rule Metadata Rule

For each `.mdc` file, apply the validation logic from `rule-metadata.mdc`:

1. **Check for YAML frontmatter:**
   - Look for `---` delimited YAML block at the top
   - Verify all required fields are present

2. **Validate required fields:**
   - description (1-2 sentences with when to apply)
   - version (X.Y.Z semantic versioning)
   - lastUpdated (DD-MM-YYYY HH:MM:SS EST format)
   - globs (required, empty string or pattern, NO quotes)
   - alwaysApply (true/false)
   - type (one of 8 standard types, NO quotes)

3. **Check optional fields:**
   - relatedCommands (array of command filenames)
   - relatedRules (array of rule filenames)
   - relatedStandards (array of standard paths)

4. **Generate report:**
   - Mark as ✅ Complete, ⚠️ Incomplete, or ❌ Missing
   - List missing fields
   - Propose complete YAML frontmatter

### Step 4: Generate Combined Report

Create a comprehensive report with:

1. **Statistics:**
   - Total files audited (`.md` and `.mdc` separately)
   - Files with complete metadata
   - Files needing updates
   - Breakdown by file type

2. **Detailed File Reports:**
   - For each file, show current state and proposed updates
   - Categorize by completeness status
   - List missing or incorrect fields

3. **Dependencies Found:**
   - Extract file references from content
   - Categorize as: Commands, Rules, Standards, Modules, Other
   - Check for bidirectional references

### Step 5: Propose Updates (with Confirmation)

For each file with missing or incomplete metadata:

1. **Show current state:**
   - Display existing metadata (if any)
   - Highlight missing or incorrect fields

2. **Propose complete metadata:**
   - Show proposed complete metadata
   - Explain what was added/changed
   - Reference the appropriate rule for validation

3. **Wait for confirmation** before updating

4. **Update the file** if approved:
   - Add or update metadata section/frontmatter
   - Ensure proper formatting
   - Preserve all existing content

### Step 6: Cross-Reference Validation

After updating metadata:

1. **Verify all dependency links work**
2. **Check for bidirectional references:**
   - If File A references File B, does File B reference File A (if appropriate)?
3. **Identify orphaned documents:**
   - Documents that aren't referenced by any other documents
   - May need better integration

### Step 7: Generate Summary Report

Create a final report with:

1. **Overview Statistics:**
   - Total files audited (`.md` and `.mdc`)
   - Files with complete metadata (percentage)
   - Files updated
   - Files still needing attention

2. **Status Breakdown:**
   - Active: X files
   - Deprecated: X files
   - Draft: X files
   - Review Needed: X files

3. **Top Referenced Documents:**
   - Documents referenced by many others
   - Identify key "hub" documents

4. **Orphaned Documents:**
   - Documents not referenced by any other document
   - May need cross-references added

5. **Action Items:**
   - Files that need human review
   - Deprecated files that should be removed
   - Missing documentation identified

---

## Output Format

### Individual File Report

```markdown
### [File Path]

**Type:** Documentation (.md) | Rule (.mdc)
**Status:** ✅ Complete | ⚠️ Incomplete | ❌ Missing

**Current Metadata:**
- [List all fields with values or "Missing"]

**Proposed Updates:**
```markdown
[Show complete proposed metadata]
```

**Dependencies Found:**
- [file1.md](path) (referenced X times)
- [file2.mdc](path) (referenced X times)

**Recommendation:** [Update|Review|No action needed]
```

### Summary Report

```markdown
# Documentation & Rules Metadata Audit Report
**Generated:** 04-12-2025 11:12:43 EST

## Overview
- Total Files Audited: X
  - Documentation (.md): X files
  - Rules (.mdc): X files
- Files with Complete Metadata: X (XX%)
- Files Updated: X
- Files Needing Review: X

## Status Breakdown
- Active: X files
- Deprecated: X files
- Draft: X files
- Review Needed: X files

## Top Referenced Documents
1. [file-name.md](path) - Referenced by X documents
2. [file-name.mdc](path) - Referenced by X documents
...

## Orphaned Documents
- [file-name.md](path) - Not referenced by any other document

## Action Items
1. Review files with "Review Needed" status
2. Update deprecated files or remove if no longer relevant
3. Complete draft documents
4. Add cross-references for orphaned documents

## Next Steps
- Schedule next audit: [Suggested date]
- Follow up on action items
```

---

## Integration with Rules

This command orchestrates two specialized rules:

### `documentation-metadata.mdc`
- **Applies to:** `.md` files in `docs/`, `standards/`, `.cursor/commands/`
- **Validates:** Markdown metadata section format
- **Required fields:** Status, Created, Last Updated, Version, Description, Type, Applicability, How to Use
- **See:** `.cursor/rules/documentation-metadata.mdc` for complete validation requirements

### `rule-metadata.mdc`
- **Applies to:** `.mdc` files in `.cursor/rules/`
- **Validates:** YAML frontmatter format
- **Required fields:** description, version, lastUpdated, globs, alwaysApply, type
- **See:** `.cursor/rules/rule-metadata.mdc` for complete validation requirements

---

## Example Usage

**User invokes:**
```
audit-documentation-rules-metadata
```

**AI Agent responds:**
```
I'll audit all documentation and rule files for metadata completeness by applying the documentation-metadata and rule-metadata rules.

Scanning directories:
- standards/ (15 files)
- docs/ (3 files)
- .cursor/rules/ (8 files)
- .cursor/commands/ (8 files)

Total files to audit: 34
- Documentation (.md): 26 files
- Rules (.mdc): 8 files

[Applying documentation-metadata rule to .md files...]
[Applying rule-metadata rule to .mdc files...]

Audit complete! Here's the summary:
- 34 files audited
- 18 files have complete metadata (53%)
- 16 files need updates

Would you like me to:
1. Show detailed report for all files
2. Update files with missing metadata (I'll show you changes first)
3. Generate dependency graph
```

---

## Notes

- **Orchestration:** This command orchestrates the two rules; the rules contain the actual validation logic
- **Be Conservative:** When unsure about Status or Applicability, mark as "Review" and flag for human review
- **Preserve Content:** Never modify document content, only metadata
- **Verify Links:** After updating, verify all dependency links are valid
- **Incremental Updates:** Update files in batches, don't overwhelm the user with 30+ file changes at once
- **Temporal Awareness:** Use current EST date/time for "Last Updated" field: `TZ=America/New_York date "+%d-%m-%Y %H:%M:%S EST"`
- **Reference Rules:** Always refer to the appropriate rule for detailed validation requirements

---

## Adaptability for Projects

When using this command in other projects (outside this standards library):

1. **Adjust Target Directories:**
   - Use project-specific `docs/` location
   - May not have `.cursor/rules/` or `standards/` directories
   - Adapt to project's documentation structure

2. **Customize Metadata Fields:**
   - Projects may have additional metadata needs
   - Adapt field names to match project conventions
   - Keep core fields (Status, Created, Last Updated, Version, Description)

3. **Adjust Applicability Context:**
   - Tailor to project-specific workflows
   - Reference project-specific processes

---

## Related Files

- **Rules:**
  - [documentation-metadata.mdc](../../.cursor/rules/documentation-metadata.mdc) - Validates .md file metadata
  - [rule-metadata.mdc](../../.cursor/rules/rule-metadata.mdc) - Validates .mdc file metadata
  - [documentation-dependency-tracking.mdc](../../.cursor/rules/documentation-dependency-tracking.mdc) - Tracks doc dependencies
- **Standards:**
  - [cursor-rules-standards.md](../../standards/process/cursor-rules-standards.md) - Rule creation standards
  - [documentation.md](../../standards/project-planning/documentation.md) - Documentation management standards

