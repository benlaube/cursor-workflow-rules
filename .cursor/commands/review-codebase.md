# review-codebase

## Metadata
- **Status:** Active
- **Created:** 12-04-2025 14:32:51 EST
- **Last Updated:** 12-04-2025 14:32:51 EST
- **Version:** 1.0.0
- **Description:** Review the codebase completely to start a new project. Performs comprehensive codebase analysis to understand structure, patterns, and architecture before beginning new work.
- **Type:** Executable Command
- **Audience:** AI agents starting new projects or understanding existing codebases
- **Applicability:** When starting work on a new project, when onboarding to an existing codebase, or when needing comprehensive codebase understanding
- **How to Use:** Run this command to review the codebase completely before starting a new project
- **Dependencies:** None
- **Related Cursor Commands:** [audit-project.md](./audit-project.md), [review-all-docs.md](./review-all-docs.md)
- **Related Cursor Rules:** None
- **Related Standards:** [project-planning/project-structure.md](../../standards/project-planning/project-structure.md)

---

## Purpose

Review the codebase completely to start a new project. Performs comprehensive codebase analysis to understand structure, patterns, and architecture before beginning new work.

---

## When to Use

- When starting work on a new project
- When onboarding to an existing codebase
- When needing comprehensive codebase understanding
- Before making significant architectural changes

---

## Prerequisites

- [ ] Project repository is accessible
- [ ] Codebase is readable (not encrypted or obfuscated)
- [ ] Sufficient permissions to read project files

---

## Steps

### Step 1: Identify Project Structure

1. **Check Root Directory:**
   - Identify project type (Node.js, Python, mixed, etc.)
   - Locate configuration files (`package.json`, `pyproject.toml`, `requirements.txt`, etc.)
   - Identify main entry points

2. **Map Directory Structure:**
   - Document key directories (`src/`, `lib/`, `app/`, `components/`, etc.)
   - Identify module organization
   - Note any unusual patterns

### Step 2: Analyze Architecture

1. **Technology Stack:**
   - Identify frameworks and libraries
   - Check dependencies in `package.json` or `requirements.txt`
   - Note database systems (if any)

2. **Architecture Patterns:**
   - Identify architectural patterns (MVC, microservices, monolith, etc.)
   - Note separation of concerns
   - Identify service boundaries

### Step 3: Review Code Patterns

1. **Coding Conventions:**
   - Identify naming conventions
   - Check code style (indentation, formatting)
   - Note any linting/formatting tools configured

2. **Common Patterns:**
   - Identify frequently used patterns
   - Note design patterns in use
   - Check for consistency

### Step 4: Identify Key Components

1. **Core Modules:**
   - List main modules/services
   - Identify dependencies between modules
   - Note entry points

2. **Configuration:**
   - Review environment configuration
   - Check for configuration files
   - Note required environment variables

### Step 5: Document Findings

1. **Create Summary:**
   - Document project structure
   - List key technologies and patterns
   - Note any concerns or areas needing attention

2. **Generate Report:**
   - Create structured report of findings
   - Include recommendations for next steps
   - Note any questions or areas needing clarification

---

## Expected Output

### Success Case
```
✅ Codebase review complete.

Summary:
- Project Type: Node.js/Next.js application
- Architecture: Monolithic with modular structure
- Key Technologies: React, TypeScript, Supabase
- Main Entry Points: app/, src/
- Key Modules: auth, api, components

Recommendations:
- Review authentication flow
- Check database schema
- Review API routes
```

### Failure Case
```
❌ Codebase review incomplete.

Issues:
- Unable to access project files
- Project structure unclear
- Missing configuration files
```

---

## Validation

After reviewing codebase:

- [ ] Project structure documented
- [ ] Technology stack identified
- [ ] Architecture patterns understood
- [ ] Key components identified
- [ ] Findings documented
- [ ] Recommendations provided

---

## Related Files

- **Commands:**
  - [audit-project.md](./audit-project.md) - Comprehensive project audit
  - [review-all-docs.md](./review-all-docs.md) - Documentation review
- **Rules:**
  - None
- **Standards:**
  - [project-planning/project-structure.md](../../standards/project-planning/project-structure.md) - Project structure standards