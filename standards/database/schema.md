# Database_Schema_Conventions_v1.2

## Metadata
- **Created:** 2025-11-18
- **Last Updated:** 2025-11-18
- **Version:** 1.2

## A. Purpose of This Guide
This guide defines how every database should be structured across all development projects. It ensures consistency, clarity, performance, predictability, and AI-agent interoperability.

## B. Mandatory Documentation (Comments)
**Rule:** Every table and every column must have a comment description in the database itself.
- **Why**: This is the "single source of truth" for AI agents and developers.
- **How**:
  ```sql
  COMMENT ON TABLE users IS 'Core user profiles for authentication and application data.';
  COMMENT ON COLUMN users.email IS 'Unique email address, verified via Supabase Auth.';
  COMMENT ON COLUMN users.metadata IS 'JSONB blob for flexible user preferences (theme, notifications).';
  ```

**AI Agent Behavior**:
- When creating a table, the agent **must** generate `COMMENT ON` statements for the table and all columns.
- If modifying a table, update the comments if the purpose changes.

## C. Desired Output From AI Agents
Any time an AI agent uses this guide, their responses must produce:
1. **A clear, structured schema proposal** (Tables, Columns, Constraints, Indices, RLS).
2. **A database impact summary** (Changes, Backfilling, Downtime).
3. **Searchable schema explanations** (Natural-language descriptions).
4. **Safety review** (Secret handling, Multi-tenant isolation).

## D. Multi-Tenancy (Expanded)
Multi-tenancy requires consistent patterns to avoid chaos.
1. **Tenant Ownership**: Every tenant-scoped table must include `tenant_id`.
2. **Soft Boundaries**: Use composite unique constraints (e.g., `UNIQUE (tenant_id, slug)`).
3. **Hard Boundaries (Isolation)**: Implement RLS policies (e.g., `tenant_id = auth.uid()`).
4. **Tenant Indexing**: Every tenant-scoped table requires an index on `tenant_id`.

## E. Supabase Activity Tracking (Universal Audit Layer)
Every table in the system should automatically write to an `activity_log` table.
- **Structure**: `id`, `table_name`, `record_id`, `action`, `old_data`, `new_data`, `actor_id`, `created_at`.
- **Trigger**: Generic `log_activity()` trigger applied via `FOR EACH ROW`.

## F. Storage Rules for Migrations & Backups
1. **Migrations**: Stored in `/migrations` in timestamp format with reversible logic and comments.
2. **Backups**: Metadata in `/docs/operations/backups/`. Actual backups in external storage (S3/Supabase).

## G. AI Agent Schema Exploration Guide
1. **Exploration Commands**: Start with `information_schema` queries.
2. **Understanding Output**: Produce plain-language summaries and relationship maps.
3. **Natural Language Search**: Generate SQL from natural language prompts.
4. **Behavior Rules**: Never modify without instruction, always preview migrations, check RLS.

## H. Where This Guide Might Split Into Sub-Guides
This document serves as the "master overview" linking to sub-guides for Schema Design, Activity & Triggers, Exploration, Operations, and Multi-Tenancy.
