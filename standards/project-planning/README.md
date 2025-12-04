# Project Planning Standards

## Metadata
- **Created:** 2025-12-04
- **Last Updated:** 2025-12-04
- **Version:** 1.0
- **Description:** Standards and guides for planning, structuring, and documenting new application development projects.

---

## Purpose

This directory contains standards specifically for **project planning and setup** - the foundational decisions and documentation that shape how a project is organized from day one.

**When to Use These Standards:**
- Starting a new project
- Auditing an existing project's structure
- Planning documentation for a new application
- Defining project tech stack and dependencies

---

## Contents

### Core Planning Standards

#### `documentation.md`
**The "HOW" - Governing Rules**
- Defines **how** to manage, organize, and format all documentation
- Metadata requirements for all documentation files
- Naming conventions (snake_case, versioning)
- File locations and organization
- Three-layer system (Standards → Checklists → Commands)
- **Use this when:** Creating or updating any documentation

#### `project-structure.md`
**File Organization Standards**
- Defines where files should live in a project
- Directory structure patterns (`/src`, `/tests`, `/docs`, `/config`)
- Naming conventions for files and folders
- Monolith vs monorepo structures
- **Use this when:** Organizing a new project or refactoring file structure

#### `tech-stack-document.md`
**Tech Stack Documentation Standard**
- Standard for creating and maintaining TECH_STACK.md files
- Mandatory for every project - prevents "stack drift" (conflicting dependencies)
- Defines required sections, version numbering, and maintenance workflow
- Includes complete example and best practices
- Single source of truth for all technology decisions
- **Use this when:** Starting a new project, documenting tech choices, or before installing new dependencies

#### `roadmap-standard.md`
**Roadmap Creation and Maintenance Standard**
- Standard for creating and maintaining project roadmaps
- Defines file location, naming, and versioning conventions
- Required sections and metadata format
- Best practices and example structures for different project sizes
- **Use this when:** Creating project roadmaps, tracking milestones, or planning quarterly priorities

#### `documentation-standards.md`
**The "WHAT" - Reference Guide**
- Lists **what** documentation files should exist in a project
- Complete `/docs` subfolder structure reference
- Priority matrix (MVP vs Production-ready docs)
- Application-type specific requirements (Web App, API, Library, Monorepo)
- **Use this when:** Planning which documentation to create

---

## Relationship Between Files

### documentation.md (GOVERNING RULES)
- Defines **metadata format**
- Defines **naming conventions**
- Defines **organization rules**
- Defines **three-layer system**

### documentation-standards.md (REFERENCE GUIDE)
- Lists **which files to create**
- Shows **folder structures**
- Provides **priority guidance**
- Gives **examples**

### project-structure.md (FILE ORGANIZATION)
- Defines **where code goes**
- Defines **where tests go**
- Defines **where config goes**
- Works with `documentation.md` for doc placement

### tech-stack-document.md (TECH DECISIONS)
- Template for **documenting choices**
- Prevents **inconsistent dependencies**
- Creates **single source of truth**

---

## Quick Start for New Projects

### Step 1: Define Structure
1. Read `project-structure.md`
2. Create directory structure (`/src`, `/tests`, `/docs`, etc.)
3. Set up `.gitignore` and essential root files

### Step 2: Document Tech Stack
1. Read `tech-stack-document.md`
2. Create `docs/TECH_STACK.md` in your project
3. Document all technology choices

### Step 3: Plan Documentation
1. Read `documentation-standards.md`
2. Identify which documentation files you need (MVP vs Full)
3. Create documentation structure

### Step 4: Follow Documentation Rules
1. Read `documentation.md`
2. Follow metadata requirements for all files
3. Follow naming conventions
4. Follow three-layer system (Standards → Checklists → Commands)

---

## Integration with Other Standards

### Related Standards
- **`../README.md`** - Overview of all standards
- **`../module-structure.md`** - How to structure reusable modules
- **`../process/git-repository-standards.md`** - Git branching and commit conventions
- **`../templates/`** - Template files for projects

### Related Documentation
- **`AGENTS.md` (root)** - AI agent context and lifecycle
- **`STANDARDS_INTEGRATION_GUIDE.md` (root)** - How to integrate standards into projects
- **`QUICK_INTEGRATION.md` (root)** - Quick start integration guide

---

## For AI Agents

When an AI agent needs to:
- **Plan a new project** → Read all files in this directory
- **Document something** → Check `documentation.md` first
- **Organize files** → Check `project-structure.md`
- **Document tech stack** → Use template from `tech-stack-document.md`
- **Plan docs** → Use checklist from `documentation-standards.md`

---

## Contributing

When updating these standards:
1. Follow metadata requirements from `documentation.md`
2. Use semantic versioning (X.Y format)
3. Update "Last Updated" date
4. Update `CHANGELOG.md` for significant changes
5. Cross-reference related standards

---

*These standards define the foundation for all project planning and setup. Start here when beginning a new project.*

