# Standard: Documentation_Management_v1.11

## Metadata
- **Status:** Active
- **Created:** 2025-11-15
- **Last Updated:** 04-12-2025 15:37:07 EST
- **Version:** 1.11
- **Description:** Standards for documentation management, organization, naming conventions, the three-layer system (Standards → Checklists → Commands), and documentation index guidelines.
- **Type:** Governing Standard - Defines requirements for documentation management
- **Applicability:** When creating, updating, or reorganizing documentation
- **Related Standards:**
  - [documentation-standards.md](./documentation-standards.md) - Comprehensive documentation file reference
  - [project-structure.md](../project-structure.md) - Overall project structure
- **How to Use:** Reference this standard when managing documentation files, organizing docs, or establishing documentation conventions

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
    (Note: Checklists located in `standards/process/checklists/` - see Section 4.4)
  /archive
    (deprecated files moved here)
```

**Note:** This shows the minimal required structure. Checklists are located in `standards/process/checklists/` (NOT in `/docs/standards/`). For complete subfolder structure, see `standards/project-planning/documentation-standards.md` Section 3.

## 4. Required Metadata for Every Documentation File

### 4.1 Standard Format (Standards & Guides)
Every documentation file must begin with:
```markdown
# Title_With_Version_Number_vX.X

## Metadata
- **Created:** MM-DD-YYYY
- **Last Updated:** MM-DD-YYYY HH:MM:SS EST
- **Version:** X.X
- **Description:** One sentence describing the purpose of this document.
```

### 4.2 Checklist Format
Checklists use a simplified format with Type declaration:
```markdown
# Checklist_Name_v1.0

**Type:** Checklist – used by Cursor commands and human devs to validate X before proceeding.

**Description:** Brief description of what this checklist validates.

**Created:** MM-DD-YYYY HH:MM

**Last_Updated:** MM-DD-YYYY HH:MM

**Related Command:** `.cursor/commands/command_name.md`

**Related Standard:** `standards/standard_name.md` or `docs/process/standard_name_v1_0.md`
```

### 4.3 Type Declarations
Every documentation file should declare its type:
- **Checklist:** Validation checklist used by commands and humans
- **Governing Standard:** Authoritative standard that defines requirements
- **Executable Command:** Cursor command file (`.cursor/commands/*.md`)
- **Process Guide:** Step-by-step process documentation
- **Architecture Guide:** Technical architecture documentation

### 4.4 File Type Locations
- **Checklists:** `standards/process/checklists/`
- **Process Standards:** `docs/process/` (for process-specific standards) or `standards/` (for domain standards like security)
- **Architecture Standards:** `standards/architecture/`
- **General Standards:** `standards/` (root)
- **Commands:** `.cursor/commands/`

## 5. Naming Conventions
- **Filenames:** `snake_case` (e.g., `api_design_overview_v1_2.md`).
  - **Exception:** Files in `docs/` may use `UPPER_SNAKE_CASE.md` for consistency with existing files.
- **Suffix:** Must include version number `_vX_X` (e.g., `_v1_0`, `_v1_2`).
- **Titles:** Inside the file, match the filename version (use underscores: `Title_With_Version_v1.0`).
- **Checklists:** Follow pattern `{purpose}_checklist_v{X}_{Y}.md` (e.g., `pre_flight_checklist_v1_0.md`).
- **Commands:** Follow pattern `{purpose}-{action}.md` (e.g., `pre-flight-check.md`, `project-audit.md`).
- **Standards:** Follow pattern `{topic}_standards_v{X}_{Y}.md` or `{topic}.md` (e.g., `standards/security/security-audit.md`).

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
    - See Section 12 below for complete documentation index guidelines.

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

## [1.0.0] - MM-DD-YYYY
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
   - **Example:** `standards/security/security-audit.md`

2. **Checklists** (`standards/process/checklists/*.md`)
   - **Purpose:** Provide validation checklists - comprehensive actionable items with execution steps
   - **Audience:** Developers and AI agents (validation tool)
   - **Example:** `standards/process/checklists/pr_review_checklist_v1_0.md`
   - **Relationship:** Each checklist references its related command

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
- **Source Checklist:** Link to `standards/process/checklists/` file
- **Related Standard:** Link to authoritative standard (if applicable)

**Note:** This file (`standards/project-planning/documentation-management.md`) is the governing rule for documentation management. For comprehensive file structure reference, see `standards/project-planning/documentation-standards.md`.

### 8.3 Master Reference: AGENTS.md

`AGENTS.md` serves as the master brain that:
- Documents the standard developer lifecycle
- Links to all checklists and commands
- Provides quick reference for when to use what
- See `AGENTS.md` Section 8 for complete reference

### 8.4 Example: Security Audit

**Standard:** `standards/security/security-audit.md`
- Comprehensive security requirements
- Detailed patterns and examples
- Authoritative source

**Checklist:** `standards/process/checklists/pr_review_checklist_v1_0.md` or `standards/security/security-audit-checklist.md`
- Comprehensive validation items with execution steps
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

**Example:** `modules/supabase-core-typescript/README.md` explains how to use the Supabase core utilities module.

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
- **Module structure validation** → Use `project-audit` command (validates against `standards/module-structure.md`)

## 10. AI Agent Navigation Guide

When an AI agent needs to:

1. **Use a module** → Read `modules/{module-name}/README.md`
2. **Create a module** → Read `standards/module-structure.md`
3. **Validate project** → Run `project-audit` command
4. **Check security** → Run `security_audit` command
5. **Understand lifecycle** → Read `AGENTS.md` Section 6
6. **Find all checklists** → See `AGENTS.md` Section 8.1
7. **Find all commands** → See `AGENTS.md` Section 8.2
8. **Find all standards** → See `AGENTS.md` Section 8.3
9. **Find comprehensive file structure** → See `standards/project-planning/documentation-standards.md` Section 3
10. **Find governing rules** → See `standards/project-planning/documentation-management.md` (this file)

## 11. File Locations Quick Reference

### 11.1 Process Documentation
- **Checklists:** `standards/process/checklists/`
- **Process Standards:** `docs/process/*_standards_v*.md` (if any exist) or `standards/` (for domain standards like security)
- **Process Guides:** `docs/process/*.md` (if any exist)

### 11.2 General Standards
- **Architecture:** `standards/architecture/`
- **Database:** `standards/database/`
- **Security:** `standards/security/`
- **Module Structure:** `standards/module-structure.md`
- **Project Structure:** `standards/project-structure.md`

### 11.3 Module Documentation
- **Module READMEs:** `modules/{module-name}/README.md`
- **Module Integration Guides:** `modules/{module-name}/INTEGRATION_GUIDE.md`

### 11.4 Commands
- **Cursor Commands:** `.cursor/commands/*.md`

### 11.5 Master Reference
- **AGENTS.md:** Root level - master brain with lifecycle and references

## 12. Documentation Index Guidelines

### 12.1 When to Create a Documentation Index

Create a documentation index (`docs/INDEX.md`) when:
- Documentation grows beyond 15 files in `/docs` root
- Multiple subdirectories exist (`/docs/architecture/`, `/docs/api/`, etc.)
- Team members struggle to find documents
- Onboarding new developers to documentation

**Alternative:** Update `README.md` with a "Documentation" section if documentation is minimal (<10 files).

### 12.2 Index Structure

A documentation index should follow this structure:

```markdown
# Documentation_Index_v1.0

## Metadata
- **Created:** MM-DD-YYYY
- **Last Updated:** MM-DD-YYYY
- **Version:** 1.0
- **Description:** Comprehensive index of all project documentation

## Quick Links
- [Tech Stack](TECH_STACK.md) - Technology stack and dependencies
- [Roadmap](roadmap/roadmap_v1_0.md) - Project roadmap and priorities
- [Architecture](architecture/ARCHITECTURE.md) - System architecture overview

## Documentation by Category

### Getting Started
- [Developer Setup](development/DEVELOPER_SETUP.md) - How to set up your dev environment
- [Quick Start](user/QUICK_START.md) - Quick start guide for new users
- [Contributing](development/CONTRIBUTING.md) - How to contribute to the project

### Architecture & Design
- [Architecture Overview](architecture/ARCHITECTURE.md)
- [Architecture Decisions](architecture/ARCHITECTURE_DECISIONS.md)
- [Component Diagrams](architecture/COMPONENT_DIAGRAMS/)

### API Documentation
- [API Reference](api/API_REFERENCE.md)
- [API Design](api/API_DESIGN.md)
- [Endpoint Documentation](api/endpoints/)

### Deployment & Operations
- [Deployment Guide](deployment/DEPLOYMENT.md)
- [Environment Variables](deployment/ENVIRONMENT_VARIABLES.md)
- [Monitoring](deployment/MONITORING.md)

### Security
- [Security Documentation](security/SECURITY.md)
- [Privacy Policy](security/PRIVACY.md)

## Documentation by Purpose

### For Developers
- [Developer Setup](development/DEVELOPER_SETUP.md)
- [Testing Guide](development/TESTING.md)
- [Tooling](development/TOOLING.md)
- [Troubleshooting](development/TROUBLESHOOTING.md)

### For Operators
- [Deployment Guide](deployment/DEPLOYMENT.md)
- [Monitoring](deployment/MONITORING.md)
- [Disaster Recovery](deployment/DISASTER_RECOVERY.md)

### For Users
- [User Guide](user/USER_GUIDE.md)
- [Quick Start](user/QUICK_START.md)
- [FAQ](user/FAQ.md)

## Recently Updated
- [Roadmap v1.1](roadmap/roadmap_v1_1.md) - Updated 2025-01-27
- [API Reference](api/API_REFERENCE.md) - Updated 2025-01-15
- [Deployment Guide](deployment/DEPLOYMENT.md) - Updated 2025-01-10

## All Documentation

### Root Level
- [Tech Stack](TECH_STACK.md)
- [Roadmap v1.1](roadmap/roadmap_v1_1.md)

### /architecture
- [Architecture Overview](architecture/ARCHITECTURE.md)
- [Architecture Decisions](architecture/ARCHITECTURE_DECISIONS.md)

### /development
- [Developer Setup](development/DEVELOPER_SETUP.md)
- [Contributing](development/CONTRIBUTING.md)
- [Testing](development/TESTING.md)

(... continue for all directories ...)
```

### 12.3 Index Organization Strategies

Choose one or more organizational strategies:

#### Strategy 1: By Category
Group documentation by topic (Architecture, API, Deployment, etc.)
- **Best for:** Technical documentation
- **Example:** Architecture docs, API docs, Deployment docs

#### Strategy 2: By Audience
Group by who needs the docs (Developers, Operators, Users)
- **Best for:** Multi-audience projects
- **Example:** Developer docs, User docs, Admin docs

#### Strategy 3: By Workflow
Group by typical workflows (Getting Started, Development, Deployment)
- **Best for:** Process-driven projects
- **Example:** Setup → Development → Testing → Deployment

#### Strategy 4: Alphabetical
Simple A-Z list with brief descriptions
- **Best for:** Small documentation sets
- **Example:** Simple alphabetical list

### 12.4 Index Maintenance

#### Update Frequency
- **After creating new documentation** - Add to index immediately
- **After archiving documentation** - Remove from active sections
- **Monthly review** - Verify all links work
- **Version changes** - Update version number in metadata

#### What to Include
- ✅ All active documentation files
- ✅ Brief descriptions for each file
- ✅ Relative links to documents
- ✅ "Recently Updated" section (optional but helpful)
- ❌ Archived documentation (unless in dedicated "Archive" section)
- ❌ Generated documentation (API docs, etc.) - link to generator

#### Link Format
Always use relative links:
```markdown
✅ Good: [API Reference](api/API_REFERENCE.md)
❌ Bad: [API Reference](/docs/api/API_REFERENCE.md)
❌ Bad: [API Reference](https://example.com/docs/api)
```

### 12.5 Alternative: Enhanced README

For smaller projects (<10 docs), enhance `README.md` instead:

```markdown
# Project Name

## Documentation

### Getting Started
- [Developer Setup](docs/development/DEVELOPER_SETUP.md)
- [Quick Start](docs/user/QUICK_START.md)

### Reference
- [Tech Stack](docs/TECH_STACK.md)
- [API Reference](docs/api/API_REFERENCE.md)
- [Architecture](docs/architecture/ARCHITECTURE.md)

### Operations
- [Deployment](docs/deployment/DEPLOYMENT.md)
- [Monitoring](docs/deployment/MONITORING.md)
```

### 12.6 Index vs README Decision Tree

```
Is documentation > 15 files?
├─ Yes → Create docs/INDEX.md
└─ No
   └─ Does documentation have multiple subdirectories?
      ├─ Yes → Create docs/INDEX.md
      └─ No → Use enhanced README.md with Documentation section
```

### 12.7 Best Practices

1. **Keep It Updated:** Dead links frustrate users
2. **Add Descriptions:** Brief one-line descriptions help navigation
3. **Use Categories:** Group related docs together
4. **Link from README:** Always link to INDEX.md from README.md
5. **Include Search Tip:** Mention that Cmd+F works in the index
6. **Version the Index:** Use semantic versioning (v1.0, v1.1)
7. **Cross-Reference:** Link to `standards/project-planning/documentation-standards.md` for complete list

### 12.8 Example Quick Link Section

Add this to your `README.md`:

```markdown
## 📚 Documentation

**Quick Links:**
- [Documentation Index](docs/INDEX.md) - Complete documentation catalog
- [Getting Started](docs/development/DEVELOPER_SETUP.md) - Set up your dev environment
- [Tech Stack](docs/TECH_STACK.md) - Technologies used in this project
```

---

# End of Standard – Documentation_Management_v1.11
