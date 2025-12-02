---
lastUpdated: '2025-12-01'
---
# Documentation_Structure_Guide_v1.0

**Type:** Process Guide – explains the documentation structure and how different types of documentation relate to each other.
 
**Description:** Guide explaining the three-layer documentation system (Standards → Checklists → Commands) and the distinction between module documentation and standards.

**Created:** 2025-11-25 17:40

**Last_Updated:** 2025-11-25 17:40

---

## 1. Three-Layer Documentation System

The project uses a three-layer system where each layer builds on the previous:

```
Standards (What Good Looks Like)
    ↓
Checklists (Validation Items)
    ↓
Commands (Executable Workflows)
```

### 1.1 Standards (`standards/` or `docs/process/*_standards_v*.md`)

**Purpose:** Define "what good looks like" - authoritative requirements

**Examples:**
- `standards/module-structure.md` - How to structure modules
- `standards/security/access-control.md` - RLS and access control requirements
- `docs/process/security_audit_standards_v1_0.md` - Comprehensive security requirements

**Characteristics:**
- Comprehensive and detailed
- Authoritative source of truth
- Include patterns, examples, and best practices
- Used as reference material

### 1.2 Checklists (`docs/process/checklists/*_checklist_v*.md`)

**Purpose:** Provide validation checklists - condensed actionable items

**Examples:**
- `docs/process/checklists/pre_flight_checklist_v1_0.md`
- `docs/process/checklists/security_audit_checklist_v1_0.md`

**Characteristics:**
- Condensed version of standards
- Actionable checkboxes
- Include Type declaration
- Reference related command and standard

### 1.3 Commands (`.cursor/commands/*.md`)

**Purpose:** Executable workflows that automate checklist validation

**Examples:**
- `.cursor/commands/pre_flight_check.md`
- `.cursor/commands/security_audit.md`

**Characteristics:**
- Step-by-step execution instructions
- Automated validation
- Reference source checklist
- Can call other commands

---

## 2. Module Documentation vs Standards

### 2.1 Module Documentation (`modules/*/README.md`)

**Location:** `modules/{module-name}/README.md`

**Purpose:** Usage guides for specific, reusable modules

**Content:**
- Installation instructions
- API documentation
- Usage examples
- Module-specific configuration
- Dependencies

**Example:** `modules/supabase-core/README.md` explains how to use the Supabase core utilities.

**When to Read:** When you want to use a specific module in your project

### 2.2 Standards (`standards/module-structure.md`)

**Location:** `standards/module-structure.md`

**Purpose:** Rules and patterns for creating and structuring modules

**Content:**
- Required directory structure
- Required files (README.md, index.ts, package.json)
- Naming conventions
- Module organization patterns

**Example:** `standards/module-structure.md` defines that every module must have a README.md, index.ts, and follow a specific structure.

**When to Read:** When creating a new module or refactoring an existing one

### 2.3 Key Distinction

| Question | Read This |
|----------|-----------|
| "How do I use the supabase-core module?" | `modules/supabase-core/README.md` |
| "How do I create a new module?" | `standards/module-structure.md` |
| "Does my module follow the standards?" | Run `project_audit` command |

---

## 3. File Locations Quick Reference

### 3.1 Process Documentation
- **Checklists:** `docs/process/checklists/`
- **Process Standards:** `docs/process/*_standards_v*.md`
- **Process Guides:** `docs/process/*.md` (like this file)

### 3.2 General Standards
- **Architecture:** `standards/architecture/`
- **Database:** `standards/database/`
- **Security:** `standards/security/`
- **Module Structure:** `standards/module-structure.md`
- **Project Structure:** `standards/project-structure.md`

### 3.3 Module Documentation
- **Module READMEs:** `modules/{module-name}/README.md`
- **Module Integration Guides:** `modules/{module-name}/INTEGRATION_GUIDE.md`

### 3.4 Commands
- **Cursor Commands:** `.cursor/commands/*.md`

### 3.5 Master Reference
- **AGENTS.md:** Root level - master brain with lifecycle and references

---

## 4. AI Agent Navigation

When an AI agent needs to:

1. **Use a module** → Read `modules/{module-name}/README.md`
2. **Create a module** → Read `standards/module-structure.md`
3. **Validate project** → Run `project_audit` command
4. **Check security** → Run `security_audit` command
5. **Understand lifecycle** → Read `AGENTS.md` Section 6
6. **Find all checklists** → See `AGENTS.md` Section 8.1
7. **Find all commands** → See `AGENTS.md` Section 8.2
8. **Find all standards** → See `AGENTS.md` Section 8.3

---

## 5. No Duplication Policy

**Rule:** Each piece of documentation exists in exactly one canonical location.

- ✅ Checklists: `docs/process/checklists/` (NOT in root `checklists/`)
- ✅ Standards: `standards/` or `docs/process/` (NOT duplicated)
- ✅ Module docs: `modules/{module-name}/README.md` (NOT in standards)

**If you find duplicates:**
1. Identify the canonical location (usually the newer, versioned one)
2. Delete the duplicate
3. Update all references to point to the canonical location

---

*This guide helps maintain clarity and prevent confusion about where documentation lives and what it's for.*

