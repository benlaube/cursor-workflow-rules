# audit-command-metadata

## Metadata
- **Status:** Active
- **Created:** 12-04-2025 14:32:51 EST
- **Last Updated:** 12-04-2025 14:32:51 EST
- **Version:** 1.0.0
- **Description:** Review every Cursor Command file in .cursor/commands/**/*.md and ensure the metadata within the command file matches the required structure. Validates and fixes metadata ordering, missing fields, and timestamps.
- **Type:** Executable Command
- **Audience:** AI agents performing documentation audits
- **Applicability:** When auditing command files or before committing command changes
- **How to Use:** Run this command to audit all command files and automatically fix metadata violations
- **Dependencies:** None
- **Related Cursor Commands:** [audit-documentation-rules-metadata.md](./audit-documentation-rules-metadata.md), [validate-rule-metadata.md](./validate-rule-metadata.md)
- **Related Cursor Rules:** [cursor-command-creation.mdc](../rules/cursor-command-creation.mdc)
- **Related Standards:** [process/cursor-rules-standards.md](../../standards/process/cursor-rules-standards.md)

---

## Purpose

Review every Cursor Command file in `.cursor/commands/**/*.md` and ensure the metadata within the command file matches the required structure below.

## Required Metadata Structure

## Metadata
- **Status** — required — one of: Active, Draft, Review, Deprecated 
- **Created:**  MM-DD-YYYY HH:MM:SS EST
- **Last Updated:** MM-DD-YYYY HH:MM:SS EST
- **Version:** X.Y or X.Y.Z
- **Description:** Brief 1-3 sentence purpose of this document
- **Type:** Standard | SOP | Guide | Reference | Playbook
- **Audience:** Who should use this document
- **Applicability:** When/where this document applies
- **How to Use:**  Instructions for using this document
- **Dependencies:**  [Linked File](link)
- **Related Cursor Commands:** [Linked File](link)
- **Related Cursor Rules:** [Linked File](link)
- **Related Standards:** [Linked File](link)

## Agent Behavior

When a document violates the metadata schema:
- Correct the ordering.
- Fix missing required fields with placeholders.
- Update `Last Updated` automatically.
- Update 'Version' automatically.
- Do not modify the document body unless needed.
