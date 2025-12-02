# Rule: Documentation_Management_v1.5

## Metadata
- **Created:** 2025-11-17
- **Last Updated:** 2025-11-25
- **Version:** 1.7

## When to Apply This Rule
Apply this rule whenever documentation is created, updated, reorganized, or found to be inconsistent. This standard is enforced by the **Task Workflow Rule**.

## 1. Primary Documentation Location
- All general project documentation must be stored inside the `/docs` directory.
- `/docs` is the central source of truth for architecture, workflows, processes, and release planning.

## 2. Protected Files (Never Move or Rename)
The following files must remain in their exact original locations and names:
- `AGENTS.md`
- `.cursorrules`
- Root-level `README.md`
- Any markdown referenced by configuration files or tooling.

## 3. Required File Structure Under /docs
```
/docs
  Roadmap_vX.X.md
  /roadmap
    release_v1_0_0.md
  /specs
    feature_spec_template_v1_0.md
    component_specs/
  /process
    development_workflow_v1_0.md
    /checklists
      pre_flight_checklist_v1_0.md
      pr_review_checklist_v1_0.md
      project_audit_checklist_v1_0.md
      security_audit_checklist_v1_0.md
      rls_policy_review_checklist_v1_0.md
    security_audit_standards_v1_0.md
    (other process standards)
  /archive
    (deprecated files moved here)
```

## 4. Required Metadata for Every Documentation File

### 4.1 Standard Format (Standards & Guides)
Every documentation file must begin with:
```markdown
# Title_With_Version_Number_vX.X

## Metadata
- **Created:** YYYY-MM-DD
- **Last Updated:** YYYY-MM-DD
- **Version:** X.X
- **Description:** One sentence describing the purpose of this document.
```

### 4.2 Checklist Format
Checklists use a simplified format with Type declaration:
```markdown
# Checklist_Name_v1.0

**Type:** Checklist – used by Cursor commands and human devs to validate X before proceeding.

**Description:** Brief description of what this checklist validates.

**Created:** YYYY-MM-DD HH:MM

**Last_Updated:** YYYY-MM-DD HH:MM

**Related Command:** `.cursor/commands/command_name.md`
```

### 4.3 Type Declarations
Every documentation file should declare its type:
- **Checklist:** Validation checklist used by commands and humans
- **Governing Standard:** Authoritative standard that defines requirements
- **Executable Command:** Cursor command file (`.cursor/commands/*.md`)
- **Process Guide:** Step-by-step process documentation
- **Architecture Guide:** Technical architecture documentation

### 4.4 File Type Locations
- **Checklists:** `docs/process/checklists/`
- **Process Standards:** `docs/process/` (e.g., `security_audit_standards_v1_0.md`)
- **Architecture Standards:** `standards/architecture/`
- **General Standards:** `standards/` (root)
- **Commands:** `.cursor/commands/`

## 5. Naming Conventions
- **Filenames:** `snake_case` (e.g., `api_design_overview_v1_2.md`).
- **Suffix:** Must include version number `_vX_X` (e.g., `_v1_0`, `_v1_2`).
- **Titles:** Inside the file, match the filename version (use underscores: `Title_With_Version_v1.0`).
- **Checklists:** Follow pattern `{purpose}_checklist_v{X}_{Y}.md` (e.g., `pre_flight_checklist_v1_0.md`).
- **Commands:** Follow pattern `{purpose}_{action}.md` (e.g., `pre_flight_check.md`, `project_audit.md`).
- **Standards:** Follow pattern `{topic}_standards_v{X}_{Y}.md` (e.g., `security_audit_standards_v1_0.md`).

## 6. Documentation Maintenance & Cleanup Actions

### 6.1 When to Clean Up
- After a major release.
- When a feature spec is superseded by a newer version.
- When the `/docs` root becomes cluttered (>10 files).

### 6.2 Allowed Cleanup Actions
1.  **Archiving:**
    - Move outdated files to `/docs/archive/`.
    - Do **not** delete them unless they are empty or duplicates.
    - Append `_archived` to the filename if needed to avoid collision.
2.  **Consolidation:**
    - If multiple small docs describe the same topic, merge them into a single authoritative file and archive the originals.
3.  **Indexing:**
    - Maintain a `docs/INDEX.md` (or update `README.md`) if the number of docs is large, linking to current active specifications.

### 6.3 Forbidden Actions
- **Do not** delete `README.md` or `AGENTS.md`.
- **Do not** move files referenced by external tools without updating the tool config.
- **Do not** remove version numbers from filenames (they are crucial for history).

## 7. Changelog Management

### 7.1 CHANGELOG.md Purpose

The `CHANGELOG.md` file serves as a **user-facing summary** of notable changes to the project. It complements git history by providing:
- High-level summaries of major changes
- User-visible feature additions
- Breaking changes and migration notes
- Release notes format

**Git history** remains the source of truth for:
- Detailed technical changes
- Code diffs
- Commit-by-commit history
- Pull request reviews

### 7.2 When to Update CHANGELOG.md

Update `CHANGELOG.md` for:

- ✅ **New modules or major features** - When adding significant new functionality
- ✅ **Breaking changes** - When changes require migration or configuration updates
- ✅ **User-facing improvements** - Features that affect how the project is used
- ✅ **Major documentation additions** - New comprehensive guides or standards
- ✅ **Architecture changes** - Significant structural or design changes

Do **not** update for:
- ❌ Minor bug fixes (unless user-visible)
- ❌ Internal refactoring
- ❌ Documentation typo fixes
- ❌ Test additions

### 7.3 Changelog Format

Follow the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format:

```markdown
## [Unreleased]

### Added
- New feature description

### Changed
- Change description

### Fixed
- Bug fix description

## [1.0.0] - YYYY-MM-DD

### Added
- Initial release features
```

### 7.4 Update Process

1. **Add entries to `[Unreleased]` section** as work is completed
2. **Group changes by type** (Added, Changed, Fixed, etc.)
3. **Use clear, user-friendly language** (avoid technical jargon when possible)
4. **Link to related documentation** when helpful
5. **When releasing**, move `[Unreleased]` to a versioned section with date

### 7.5 Examples

**Good Entry:**
```markdown
### Added
- **Backend API Module** - Standardized API handler wrapper with Supabase SSR integration
  - Automatic error handling and input validation
  - Complete integration guide and examples
```

**Bad Entry:**
```markdown
### Added
- Fixed bug in handler.ts line 45
- Updated dependencies
```

## 8. Checklists, Commands, and Standards Relationship

### 8.1 Three-Layer Documentation System

The documentation system uses three layers that work together:

1. **Standards** (`docs/process/*_standards_v*.md` or `standards/*.md`)
   - **Purpose:** Define "what good looks like" - authoritative requirements
   - **Audience:** Developers and AI agents (reference material)
   - **Example:** `docs/process/security_audit_standards_v1_0.md`

2. **Checklists** (`docs/process/checklists/*_checklist_v*.md`)
   - **Purpose:** Provide validation checklists - condensed actionable items
   - **Audience:** Developers and AI agents (validation tool)
   - **Example:** `docs/process/checklists/security_audit_checklist_v1_0.md`
   - **Relationship:** Each checklist references its related standard and command

3. **Commands** (`.cursor/commands/*.md`)
   - **Purpose:** Executable workflows that automate checklist validation
   - **Audience:** AI agents (automated execution)
   - **Example:** `.cursor/commands/security_audit.md`
   - **Relationship:** Each command references its source checklist

### 8.2 Cross-References

Every checklist and command must include:
- **Related Command:** Link to `.cursor/commands/` file
- **Related Standard:** Link to authoritative standard (if applicable)
- **Type Declaration:** Clear statement of file purpose

Every command must include:
- **Source Checklist:** Link to `docs/process/checklists/` file
- **Related Standard:** Link to authoritative standard (if applicable)

### 8.3 Master Reference: AGENTS.md

`AGENTS.md` serves as the master brain that:
- Documents the standard developer lifecycle
- Links to all checklists and commands
- Provides quick reference for when to use what
- See `AGENTS.md` Section 8 for complete reference

### 8.4 Example: Security Audit

**Standard:** `docs/process/security_audit_standards_v1_0.md`
- Comprehensive security requirements
- Detailed patterns and examples
- Authoritative source

**Checklist:** `docs/process/checklists/security_audit_checklist_v1_0.md`
- Condensed validation items
- References the standard
- Links to command

**Command:** `.cursor/commands/security_audit.md`
- Automated execution steps
- References the checklist
- Can call other commands (e.g., `rls_policy_review`)

## 9. Module Documentation vs Standards

### 9.1 Module Documentation (`modules/*/README.md`)

**Purpose:** Usage guides for specific, reusable modules

**Location:** `modules/{module-name}/README.md`

**Content:**
- How to install and use the module
- API documentation
- Examples and code snippets
- Module-specific configuration
- Dependencies

**Example:** `modules/supabase-core/README.md` explains how to use the Supabase core utilities module.

**Audience:** Developers using the module in their projects

### 9.2 Standards (`standards/module-structure.md`)

**Purpose:** Rules and patterns for creating and structuring modules

**Location:** `standards/module-structure.md`

**Content:**
- Required directory structure
- Required files (README.md, index.ts, package.json)
- Naming conventions
- Module organization patterns
- When to create a module vs inline code

**Example:** `standards/module-structure.md` defines that every module must have a README.md, index.ts, and follow a specific structure.

**Audience:** Developers creating new modules or refactoring existing ones

### 9.3 Key Distinction

| Aspect | Module Docs | Standards |
|--------|-------------|-----------|
| **Question Answered** | "How do I use this module?" | "How do I create/structure modules?" |
| **Location** | `modules/*/README.md` | `standards/module-structure.md` |
| **Scope** | Specific to one module | Applies to all modules |
| **When to Read** | When using a module | When creating/refactoring modules |
| **Type** | Usage guide | Governing standard |

### 9.4 AI Agent Guidance

When an AI agent encounters:
- **Module usage question** → Read `modules/{module-name}/README.md`
- **Module creation question** → Read `standards/module-structure.md`
- **Module structure validation** → Use `project_audit` command (validates against `standards/module-structure.md`)

# End of Rule – Documentation_Management_v1.7
