# Audit Documentation Metadata

> **⚠️ DEPRECATED:** This command has been refactored and replaced.
> 
> **Use instead:** [`audit-documentation-rules-metadata.md`](./audit-documentation-rules-metadata.md)
> 
> The new command orchestrates two specialized rules:
> - `documentation-metadata.mdc` - Validates `.md` file metadata
> - `rule-metadata.mdc` - Validates `.mdc` file metadata
> 
> This file is kept for reference but should not be used. It will be removed in a future version.

## Metadata
- **Status:** Deprecated
- **Version:** 1.1.0
- **Last Updated:** 04-12-2025 11:12:43 EST
- **Created:** 04-12-2025
- **Description:** [DEPRECATED] Command to audit and update metadata across standards and documentation files. Use `audit-documentation-rules-metadata.md` instead.
- **Type:** Executable Command - Used by AI agents for periodic documentation audits
- **Related Cursor Rules:** [documentation-metadata.mdc, rule-metadata.mdc, documentation-dependency-tracking.mdc]
- **Related Standards:** [process/cursor-rules-standards.md, project-planning/documentation.md]
- **How to Use:** **DO NOT USE** - Use `audit-documentation-rules-metadata` command instead

## Purpose

Systematically review all documentation and standards files to ensure they have complete, accurate metadata. This helps maintain documentation quality and cross-reference integrity.

## When to Run

- **Periodic Maintenance:** Monthly or quarterly
- **After Major Updates:** When significant changes are made to multiple standards
- **Before Releases:** As part of release preparation
- **Onboarding:** When adopting this standards library in a new project

## Command Invocation

Use this command name in your AI assistant:
```
audit-documentation-metadata
```

## Required Metadata Fields

Each documentation file MUST have a metadata section at the top with these fields:

### For Standards, Docs, Commands (Markdown files):
```markdown
## Metadata
- **Status:** [Active|Deprecated|Draft|Review]
- **Created:** YYYY-MM-DD
- **Last Updated:** YYYY-MM-DD HH:MM:SS (or YYYY-MM-DD)
- **Version:** X.Y.Z (rules/commands) or X.Y (standards/docs)
- **Description:** Brief description of the document's purpose
- **Type:** [Document type] - Who should use this document
- **Applicability:** When/where this document applies
- **Related Cursor Commands:** List of related command files (optional)
- **Related Cursor Rules:** List of related rule files (optional)
- **Related Standards:** List of related standard files (optional)
- **Dependencies:** List of all related files (with links) - OR use the three "Related" fields above
- **How to Use:** Brief instructions on how to use this document
```

### For Cursor Rules (.mdc files):
```yaml
---
description: Brief one-sentence description
version: X.Y.Z
lastUpdated: YYYY-MM-DD
globs: "file/pattern" (optional)
alwaysApply: true/false
type: "Rule Type - Brief description"
relatedCommands: [command1.md, command2.md] (optional)
relatedRules: [rule1.mdc, rule2.mdc] (optional)
relatedStandards: [standard1.md, standard2.md] (optional)
---

[Then markdown content with "How to Use This Rule" section at end]
```

### Field Definitions

1. **Status**
   - `Active` - Currently in use and up to date
   - `Deprecated` - No longer recommended, but kept for reference
   - `Draft` - Work in progress, not yet finalized
   - `Review` - Needs review or updating

2. **Created**
   - Date when the document was first created
   - Format: `YYYY-MM-DD`

3. **Last Updated**
   - Date (and optionally time) when last modified
   - Format: `YYYY-MM-DD HH:MM:SS` or `YYYY-MM-DD`
   - Update this whenever content changes

4. **Version**
   - Rules/Commands: Semantic versioning `X.Y.Z`
   - Standards/Docs: `X.Y` format
   - See `.cursor/rules/environment.mdc` Section "Version Numbering Rules"

5. **Description**
   - One sentence summary of the document's purpose
   - Should clearly state what the document covers

6. **Type**
   - Document type and intended audience
   - Format: `[Type] - [Who should use it]`
   - Examples:
     - "Governing Standard - Defines requirements for developers and AI agents"
     - "Executable Command - Used by AI agents to automate workflows"
     - "Checklist - Used by developers and AI agents for validation"
     - "Auto-Applied Rule - Guides AI agent behavior automatically"
     - "Architecture Guide - Technical reference for developers"
     - "Process Guide - Step-by-step instructions for developers"

7. **Applicability**
   - When/where this standard or document applies
   - Examples:
     - "All code changes throughout development lifecycle"
     - "When setting up local Supabase environment"
     - "Before every PR submission"
     - "All database schema changes"
     - "Automatically when modifying `.cursor/rules/*.mdc` files"

8. **Related Cursor Commands** (Optional)
   - List of related command filenames (not full paths)
   - Format: `[command-name.md, other-command.md]`
   - Use markdown links in content:
     ```markdown
     - **Related Cursor Commands:**
       - [pre-flight-check.md](../../.cursor/commands/pre-flight-check.md) - Environment validation
     ```

9. **Related Cursor Rules** (Optional)
   - List of related rule filenames (not full paths)
   - Format: `[rule-name.mdc, other-rule.mdc]`
   - Use markdown links in content:
     ```markdown
     - **Related Cursor Rules:**
       - [linting-behavior.mdc](../../.cursor/rules/linting-behavior.mdc) - Linting behavior
     ```

10. **Related Standards** (Optional)
    - List of related standard paths (relative paths)
    - Format: `[process/standard.md, architecture/guide.md]`
    - Use markdown links in content:
      ```markdown
      - **Related Standards:**
        - [code-quality-linting-standards.md](../../standards/process/code-quality-linting-standards.md) - Linting requirements
      ```

11. **Dependencies** (Alternative to separate "Related" fields)
    - Comprehensive list of ALL related files with markdown links
    - Can be used instead of separate "Related Commands/Rules/Standards" fields
    - Format:
      ```markdown
      - **Dependencies:**
        - [command.md](../../.cursor/commands/command.md) - Brief description
        - [rule.mdc](../../.cursor/rules/rule.mdc) - Brief description
        - [standard.md](../../standards/standard.md) - Brief description
      ```

12. **How to Use**
    - Brief instructions on how to use this document
    - Should be clear and actionable
    - Examples:
      - "Run this command before starting any coding work"
      - "Reference this standard when creating new modules"
      - "This rule applies automatically when modifying TypeScript files"
      - "Follow this checklist before submitting a PR"

## Execution Steps

When this command is invoked, the AI agent should:

### Step 1: Identify Target Files

1. **Primary Targets:**
   - All files in `standards/` directory (recursive)
   - All files in `docs/` directory (recursive)
   - All files in `.cursor/rules/` directory
   - All files in `.cursor/commands/` directory

2. **File Types:**
   - `.md` (Markdown)
   - `.mdc` (Markdown with comments)

3. **Exclusions:**
   - `node_modules/`
   - `README.md` files (unless they contain standards)
   - Generated files
   - Archive directories

### Step 2: Read and Analyze Each File

For each file:

1. **Read the entire file**
2. **Check for existing metadata section**
3. **Identify all file references** in the content:
   - Look for patterns like `.cursor/commands/file.md`
   - Look for patterns like `standards/path/file.md`
   - Look for patterns like `modules/module-name/README.md`
   - Look for patterns like `[link text](path/to/file.md)`
4. **Determine applicability** from content:
   - Read introduction/purpose sections
   - Identify when this document should be used
5. **Check current status:**
   - Is content up to date?
   - Are there references to deprecated features?

### Step 3: Generate Metadata Report

Create a report for each file with:

1. **Current State:**
   - Does metadata section exist?
   - Which fields are present?
   - Which fields are missing?

2. **Proposed Metadata:**
   - Suggest values for missing fields
   - Suggest updates for incomplete fields

3. **Dependencies Found:**
   - List all file references found in content
   - Categorize as: Commands, Rules, Standards, Modules, Other

### Step 4: Update Files (with Confirmation)

For each file with missing or incomplete metadata:

1. **Propose changes** to the user:
   - Show current metadata (if any)
   - Show proposed complete metadata
   - Explain what was added/changed

2. **Wait for confirmation** before updating

3. **Update the file** if approved:
   - Add or update metadata section at the top
   - Ensure proper formatting
   - Preserve all existing content

### Step 5: Cross-Reference Validation

After updating metadata:

1. **Verify all dependency links work**
2. **Check for bidirectional references:**
   - If File A references File B, does File B reference File A (if appropriate)?
3. **Identify orphaned documents:**
   - Documents that aren't referenced by any other documents
   - May need better integration

### Step 6: Generate Summary Report

Create a final report with:

1. **Statistics:**
   - Total files audited
   - Files updated
   - Files with complete metadata
   - Files still needing attention

2. **Dependency Graph:**
   - Visual representation of how documents relate
   - Identify key "hub" documents (referenced by many others)

3. **Action Items:**
   - Files that need human review
   - Deprecated files that should be removed
   - Missing documentation identified

## Output Format

### Individual File Report

```markdown
### [File Path]

**Status:** ✅ Complete | ⚠️ Incomplete | ❌ Missing

**Current Metadata:**
- Status: [value or "Missing"]
- Created: [value or "Missing"]
- Last Updated: [value or "Missing"]
- Version: [value or "Missing"]
- Description: [value or "Missing"]
- Applicability: [value or "Missing"]
- Dependencies: [count] found in content

**Proposed Updates:**
```markdown
## Metadata
- **Status:** Active
- **Created:** 2025-01-15
- **Last Updated:** 2025-12-04
- **Version:** 1.2
- **Description:** [Proposed description]
- **Applicability:** [Proposed applicability]
- **Dependencies:**
  - [file1.md](./path/file1.md) - Relationship description
  - [file2.md](../path/file2.md) - Relationship description
```

**Dependencies Found:**
- `.cursor/commands/pre-flight-check.md` (referenced 2 times)
- `standards/process/code-quality-linting-standards.md` (referenced 1 time)

**Recommendation:** [Update|Review|No action needed]
```

### Summary Report

```markdown
# Documentation Metadata Audit Report
**Generated:** YYYY-MM-DD HH:MM:SS

## Overview
- Total Files Audited: X
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
2. [file-name.md](path) - Referenced by X documents
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

## Validation Rules

When determining metadata values:

### Status
- **Active:** File is current and regularly maintained
- **Deprecated:** Use this if:
  - File references deprecated features
  - File has been superseded by another document
  - File content is outdated but kept for historical reference
- **Draft:** Use this if:
  - File is incomplete
  - File has "TODO" or placeholder sections
- **Review:** Use this if:
  - Last updated date is > 6 months ago
  - File references may be outdated
  - File needs validation

### Applicability
Determine from:
- Document title and purpose
- Introduction or "When to Use" sections
- Context of content
- Related commands or workflows

Examples:
- For `linting.md`: "Applies to all code changes throughout the development lifecycle"
- For `supabase-local-setup.md`: "Required when setting up local Supabase development environment"
- For `pr-review-checklist.md`: "Required before every pull request submission"
- For `project-structure.md`: "Applies when organizing or creating new projects"

### Dependencies
Extract from:
- Explicit file paths mentioned in content
- Markdown links `[text](path)`
- "See also" or "Related" sections
- Command references (`.cursor/commands/...`)
- Rule references (`.cursor/rules/...`)
- Standard references (`standards/...`)

## Integration with Existing Standards

This command integrates with:

- **`standards/documentation.md`** - Follow documentation standards for metadata format
- **`.cursor/rules/environment.mdc`** - Follow version numbering rules
- **`.cursor/rules/workflow-standards-documentation-maintenance.mdc`** - Documentation maintenance requirements

## Example Usage

**User invokes:**
```
audit-documentation-metadata
```

**AI Agent responds:**
```
I'll audit all documentation and standards files for metadata completeness.

Scanning directories:
- standards/ (15 files)
- docs/ (3 files)
- .cursor/rules/ (5 files)
- .cursor/commands/ (8 files)

Total files to audit: 31

[Progress...]

Audit complete! Here's the summary:
- 31 files audited
- 12 files have complete metadata (39%)
- 19 files need updates

Would you like me to:
1. Show detailed report for all files
2. Update files with missing metadata (I'll show you changes first)
3. Generate dependency graph
```

## Notes

- **Be Conservative:** When unsure about Status or Applicability, mark as "Review" and flag for human review
- **Preserve Content:** Never modify document content, only metadata
- **Verify Links:** After updating, verify all dependency links are valid
- **Incremental Updates:** Update files in batches, don't overwhelm the user with 30+ file changes at once
- **Temporal Awareness:** Use current date for "Last Updated" field (use `date` command)

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

## Related Files

- **Standards:** `standards/documentation.md` - Documentation management standards
- **Rules:** `.cursor/rules/environment.mdc` - Version numbering rules
- **Rules:** `.cursor/rules/workflow-standards-documentation-maintenance.mdc` - Documentation maintenance requirements

