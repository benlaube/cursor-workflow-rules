# audit-docs

## Metadata
- **Status:** Active
- **Created:** 01-12-2025 00:00:00 EST
- **Last Updated:** 12-04-2025 14:32:51 EST
- **Version:** 1.1.0
- **Description:** Perform a complete audit of all documentation within the current project. Identify duplicates, inconsistencies, outdated materials, missing sections, and documentation that should be updated, merged, or archived. The goal is to eliminate documentation sprawl and ensure a clean, canonical documentation system.
- **Type:** Executable Command
- **Audience:** AI agents performing documentation audits
- **Applicability:** When starting work on a repo with unclear documentation, reorganizing a monorepo, integrating multiple services, preparing for major development sprint, after significant refactor work, or when documents seem duplicated or inconsistent
- **How to Use:** Run this command to perform complete documentation audit and generate structured report with inventory, duplicates, outdated docs, missing documentation, and recommended archival actions
- **Dependencies:** None
- **Related Cursor Commands:** [audit-readmes.md](./audit-readmes.md), [audit-documentation-rules-metadata.md](./audit-documentation-rules-metadata.md)
- **Related Cursor Rules:** [documentation-metadata.mdc](../rules/documentation-metadata.mdc)
- **Related Standards:** [project-planning/documentation.md](../../standards/project-planning/documentation.md)

---

## Purpose

This command instructs the Agent to perform a complete audit of all documentation within the current project. The Agent must identify duplicates, inconsistencies, outdated materials, missing sections, and documentation that should be updated, merged, or archived. The goal is to eliminate documentation sprawl and ensure a clean, canonical documentation system.

---

## Behavior Requirements

### A. Repository-Wide Documentation Scan

The Agent must:
A1. Search for **all documentation files** across the entire repository (README files, `/docs` folder, service-level docs, notes, architecture diagrams, markdown files, comments folders, and misc text files).
A2. Detect files with overlapping or redundant content.
A3. Identify conflicting versions or outdated materials.
A4. Identify missing documentation for existing code, services, or workflows.
A5. Identify orphaned or deprecated documentation.

---

## B. Audit Output Structure

The Agent must produce a structured audit in the following format:

### B1. Documentation Inventory

* A complete, enumerated list of all docs found
* Path references for each file
* Quick description of detected purpose

### B2. Duplicates & Redundancies

* Identify overlapping files
* Suggest merges or consolidations

### B3. Outdated or Inaccurate Docs

* Files with old version numbers
* Files referring to deprecated services
* Files that contradict current codebase

### B4. Missing Documentation

* Services or modules without READMEs
* API endpoints without reference
* Features with no explanation
* DB schemas without documentation

### B5. Recommended Archival Actions

For each outdated or irrelevant file:

* Path
* Reason for archive
* Proposed archive path (e.g., `/docs/archive/YYYY-MM-DD/`)

### B6. Documentation Update Plan

* Files needing updates (list)
* What must be changed in each
* Whether merge or rewrite is recommended
* Version bumps required

### B7. Notion-Ready Tasks

Each actionable item must be converted into tasks that can be added into Notion.
Examples:

* "Update service-X README to match new architecture."
* "Merge old architecture_diagram_v2.md with current doc."
* "Archive docs folder from legacy service."

---

## C. Guardrails

C1. The Agent must **never create new documentation** during DocsAudit.
C2. The Agent must only analyze — not modify — files.
C3. The output should clearly reference file paths but not modify files.
C4. The Agent must highlight all assumptions.
C5. If ambiguity exists, the Agent must ask for clarification **after** producing the audit.

---

## D. When to Use This Command

Use **DocsAudit** when:

* Starting work on a repo with unclear documentation
* Reorganizing a monorepo
* Integrating multiple services or agents
* Preparing for a major development sprint
* After significant refactor work
* When documents seem duplicated or inconsistent

---

## E. Versioning

* This doc is **Version 1.1**
* All future edits must increment the version number.
* The Agent must update the version number when modifying this file.
