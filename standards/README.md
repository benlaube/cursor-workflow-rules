# Standards Directory

## Metadata
- **Created:** 2025-12-04
- **Last Updated:** 2025-12-04
- **Version:** 1.0
- **Description:** Overview and navigation guide for all project standards, including organization, usage instructions, and metadata requirements.

---

## Purpose

This directory contains **governing standards** that define how to build, structure, and maintain projects. These are the authoritative rules that developers and AI agents must follow.

## What's a Standard?

A standard is an authoritative document that defines:
- **Requirements** - What must be done
- **Patterns** - How to do it correctly
- **Examples** - Reference implementations
- **Rationale** - Why it matters

---

## How Standards Are Organized

### Root Level Standards (Project-Wide)
- `module-structure.md` - How to structure reusable modules
- `configuration.md` - Configuration management patterns
- `process/git-repository-standards.md` - Git branching and commit conventions
- `testing.md` - Testing requirements and patterns
- `sitemap.md` - Sitemap generation standards
- `seo-automation.md` - SEO automation patterns

### `/project-planning`
Project planning and setup standards
- `documentation.md` - How to write and organize all documentation
- `documentation-standards.md` - Comprehensive guide to standard documentation files
- `project-structure.md` - Where files should live
- `tech-stack-document.md` - Tech stack documentation template

### `/templates`
Template files for common project artifacts
- `AGENTS-TEMPLATE.md` - AI agent context template
- `env.example` - Environment variables template

### Domain-Specific Standards (By Subfolder)

#### `/architecture`
Architecture patterns and technical design standards
- Supabase setup, edge functions, multi-tenancy, etc.
- Backend module planning
- Runtime AI agent patterns

#### `/database`
Database design and schema standards
- Schema conventions
- Settings management

#### `/security`
Security requirements and patterns
- Access control and RLS policies
- Security audit checklists

#### `/deployment`
Deployment and application launch standards
- Launch procedures
- Environment setup

#### `/process/checklists`
Validation checklists used by commands
- Pre-flight checklist
- PR review checklist
- Project audit checklist

#### `/process`
Development process standards
- Linting requirements and checklists

#### `/ui`
UI/UX standards and patterns
- Chat interface patterns

#### `/cms`
Content management standards
- Blog architecture

---

## Using Standards

### For Developers
1. **Before starting work:** Check relevant standards in this directory
2. **During development:** Follow the patterns and requirements
3. **Before PR:** Validate against checklists in `/process/checklists`

### For AI Agents
1. **Always check standards first** - Don't guess conventions
2. **Reference standards** when making architectural decisions
3. **Follow the three-layer system:**
   - **Standards** (this directory) → What good looks like
   - **Checklists** (`process/checklists/`) → How to validate
   - **Commands** (`.cursor/commands/`) → Automated workflows

---

## Standard Metadata Requirements

Every standard file must include metadata (per `documentation.md` Section 4.1):

```markdown
# Standard_Name_vX.X

## Metadata
- **Created:** YYYY-MM-DD
- **Last Updated:** YYYY-MM-DD
- **Version:** X.X
- **Description:** One sentence describing the purpose of this document.
```

---

## Related Documentation

- **Comprehensive Reference:** `standards/project-planning/documentation-standards.md` - List of what documentation files to create in projects
- **Master Reference:** `AGENTS.md` (root) - AI agent lifecycle and command mapping
- **Integration Guide:** `STANDARDS_INTEGRATION_GUIDE.md` (root) - How to use standards in new projects

---

## Standards vs Other Documentation Types

| Type | Location | Purpose | Example |
|------|----------|---------|---------|
| **Standard** | `standards/*.md` | Authoritative rules | `documentation.md` |
| **Checklist** | `standards/process/checklists/*.md` | Validation items | `pr_review_checklist_v1_0.md` |
| **Command** | `.cursor/commands/*.md` | Executable workflow | `pre-flight-check.md` |
| **Reference Guide** | `standards/project-planning/*.md` | Comprehensive reference | `documentation-standards.md` |
| **Module Docs** | `modules/*/README.md` | Usage guide | `logger-module/README.md` |

---

## Quick Navigation by Task

### Project Setup
- `project-planning/project-structure.md` - File organization
- `project-planning/documentation.md` - Documentation rules
- `project-planning/documentation-standards.md` - Documentation reference guide
- `project-planning/tech-stack-document.md` - Tech stack documentation template
- `configuration.md` - Configuration patterns
- `templates/` - Template files for new projects

### Development
- `process/git-repository-standards.md` - Git conventions
- `testing.md` - Testing requirements
- `process/code-quality-linting-standards.md` - Code quality linting standards
- `process/checklists/` - Validation checklists

### Architecture
- `architecture/` - Technical design patterns
- `module-structure.md` - Module organization

### Security
- `security/` - Security requirements and patterns

### Database
- `database/` - Schema and data standards

### Deployment
- `deployment/` - Launch and environment standards

---

## Contributing to Standards

When updating or creating standards:

1. **Follow the format** defined in `documentation.md`
2. **Include metadata** (Created, Last Updated, Version, Description)
3. **Use semantic versioning** (X.Y format for standards)
4. **Update CHANGELOG.md** for significant changes
5. **Cross-reference** related standards and docs
6. **Update this README** if adding new categories or standards

---

## Metadata Audit Status

The following files have been audited for proper metadata compliance:

✅ **Compliant Files:**
- `documentation.md` - Has metadata
- `tech-stack-document.md` - Has metadata
- `project-structure.md` - Has metadata

⚠️ **Needs Review:**
- Review other files to ensure metadata compliance

*Last audit: 2025-12-04*

---

## Notes

- This directory is part of the "Cursor - Workflow Rules : Coding Standards" repository
- Standards are designed to be reusable across multiple projects
- When integrating into new projects, adapt project-specific details (see `STANDARDS_INTEGRATION_GUIDE.md`)

---

*For questions about standards, refer to `AGENTS.md` Section 7 (Agent Rules of Engagement) or the comprehensive guide in `standards/project-planning/documentation-standards.md`.*

