# audit-database

## Metadata
- **Status:** Active
- **Created:** 12-04-2025 14:32:51 EST
- **Last Updated:** 12-04-2025 14:32:51 EST
- **Version:** 1.0.0
- **Description:** For the application's database ensure every table and field has an accurate description and if it's not set, then update it. If using Supabase as the data resource, use the Supabase CLI to access the database. Output a report for the user to view to /docs/audit. Ensure the report is dated.
- **Type:** Executable Command
- **Audience:** AI agents performing database audits
- **Applicability:** When auditing database schema, ensuring table and field descriptions are complete
- **How to Use:** Run this command to audit database tables and fields, ensuring all have accurate descriptions
- **Dependencies:** None
- **Related Cursor Commands:** [audit-project.md](./audit-project.md), [audit-security.md](./audit-security.md)
- **Related Cursor Rules:** [supabase-rls-policy-review.mdc](../rules/supabase-rls-policy-review.mdc)
- **Related Standards:** [database/schema.md](../../standards/database/schema.md)

---

## Purpose

For the application's database ensure every table and field has an accurate description and if it's not set, then update it.

If using Supabase as the data resource, than use the supbase CLI to access the database.  Output a report for the user to view to /docs/audit.  Ensure the report is dated.