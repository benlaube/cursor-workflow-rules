# Template Files

## Metadata

- **Created:** 2025-12-04
- **Last Updated:** 2025-12-04
- **Version:** 1.0
- **Description:** Reusable template files for common project artifacts, including AGENTS.md template and environment variable examples.

---

## Purpose

This directory contains **template files** that can be copied directly into new projects. These are starting points that should be adapted for each specific project.

---

## Available Templates

### `AGENTS-TEMPLATE.md`

**AI Developer Agent Context Template**

**Purpose:** Provides project context and memory for AI agents  
**Location in New Project:** Root directory (rename to `AGENTS.md`)

**Contains:**

- Project mission statement (placeholder to fill in)
- Current phase tracking
- Active context section
- System architecture highlights
- Persistent memory/learnings section
- Standard developer lifecycle
- Agent rules of engagement
- Related checklists & commands reference
- Quick reference table

**How to Use:**

1. Copy to project root
2. Rename to `AGENTS.md`
3. Fill in project-specific details:
   - Section 1: Project Mission
   - Section 2: Current Phase
   - Section 3: Active Context
   - Section 4: System Architecture Highlights
   - Section 5: Persistent Memory (add learnings as you go)
4. Keep Sections 6-9 as-is (lifecycle and references)

**Related Standards:**

- `standards/project-planning/documentation-management.md` - Documentation management rules

---

### `env.example`

**Environment Variables Template**

**Purpose:** Template for `.env.example` file  
**Location in New Project:** Root directory

**Contains:**

- Common environment variable patterns
- Supabase configuration variables
- Comments explaining each variable
- Security notes

**How to Use:**

1. Copy to project root as `.env.example`
2. Add project-specific variables
3. Document what each variable does
4. **Never include actual values** - use placeholders
5. Ensure `.env` is in `.gitignore`

**Related Standards:**

- `standards/configuration.md` - Configuration management standards
- `standards/architecture/supabase-local-setup.md` - Supabase setup guide

---

## Creating New Templates

When creating new template files:

### Requirements

1. **Add to this directory** (`templates/file-templates/`)
2. **Document in this README**
3. **Follow naming convention:** `{name}-TEMPLATE.{ext}` or `{name}.example`
4. **Include comments** explaining how to use the template
5. **Use placeholders** for project-specific values
6. **Update `STANDARDS_INTEGRATION_GUIDE.md`** to reference the new template

### Good Template Examples

- ✅ `AGENTS-TEMPLATE.md` - Clear placeholder sections
- ✅ `env.example` - Comments explaining each variable
- ✅ `README-TEMPLATE.md` - (Future) Standard README structure

### What Makes a Good Template

- **Clear placeholders** - Easy to identify what to replace
- **Helpful comments** - Explains purpose and usage
- **Minimal assumptions** - Works for most projects
- **Well documented** - This README explains how to use it

---

## Template Maintenance

### When to Update Templates

- New best practices emerge
- Standards change
- User feedback identifies gaps
- New common patterns identified

### How to Update

1. Update the template file
2. Update this README
3. Update related standards if needed
4. Update `STANDARDS_INTEGRATION_GUIDE.md` if usage changes
5. Update `CHANGELOG.md` with significant changes
6. Increment version in this README's metadata

---

## Related Documentation

- **`../project-planning/`** - Project planning standards
- **`STANDARDS_INTEGRATION_GUIDE.md` (root)** - Integration instructions
- **`QUICK_INTEGRATION.md` (root)** - Quick start guide
- **`standards/configuration.md`** - Configuration management

---

## For AI Agents

When an AI agent needs to:

- **Set up new project** → Copy templates from this directory
- **Create AGENTS.md** → Use `AGENTS-TEMPLATE.md`
- **Create .env.example** → Use `env.example`
- **Understand a template** → Read documentation in this README

**Important:** Templates should always be **copied and adapted**, never used as-is. Each project has unique requirements.

---

_These templates provide starting points for common project files. Always adapt them to your specific project needs._
