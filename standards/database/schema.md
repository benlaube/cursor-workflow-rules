# Database_Schema_Conventions_v1.2

## Metadata
- **Created:** 2025-11-18
- **Last Updated:** 2025-11-18
- **Version:** 1.2

## A. Purpose of This Guide

This guide defines how every database should be structured across all development projects. It ensures consistency, clarity, performance, predictability, and AI-agent interoperability. It also defines how schema docs are stored, how migrations are handled, and how agents should explore and understand the schema.

---

## B. Improvements Over v1.0

This version expands:
- Multi-tenancy design
- Supabase activity triggers
- AI schema exploration rules
- Documentation & backup expectations
- Desired output format for AI agents
- **New in v1.2:** Mandatory database comments (`COMMENT ON`)

---

## C. Mandatory Documentation (Comments)

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

---

## D. Desired Output From AI Agents

Any time an AI agent uses this guide, their responses must produce:

D.1 **A clear, structured schema proposal** if creating or modifying tables:
- Tables
- Columns & types
- Constraints
- Indices
- Relationships
- RLS (if applicable)
- Migration script (SQL or framework-based)
- Documentation stub in `/docs/schema/`

D.2 **A database impact summary** explaining:
- What changes
- Why it changes
- Whether backfilling is needed
- Whether downtime or backpressure is expected

D.3 **Searchable schema explanations**:
- Natural-language descriptions of important tables and relationships
- AI-generated entity glossary

D.4 **Activity log design** (if changed):
- Triggers, views, or functions created
- How agents should query and use the data

D.5 **Safety review**:
- Secret handling
- Multi-tenant isolation checks
- Data-loss prevention

---

## E. Multi-Tenancy (Expanded)

Multi-tenancy requires consistent patterns to avoid chaos.

E.1 Tenant Ownership
- Every tenant-scoped table must include `tenant_id`.
- `tenant_id` must always be the same type across tables (uuid recommended).

E.2 Soft Boundaries
- Use composite unique constraints such as:
  - `UNIQUE (tenant_id, slug)`
  - `UNIQUE (tenant_id, external_id)`

E.3 Hard Boundaries (Isolation)
- Implement RLS policies:
  - Example: `tenant_id = auth.uid()`
- Use policies for SELECT, INSERT, UPDATE, DELETE.
- Agents must generate RLS rules automatically.

E.4 Tenant Indexing
- Every tenant-scoped table requires an index on `tenant_id`.
- Composite indexes recommended:
  - `(tenant_id, created_at)`
  - `(tenant_id, status)`

E.5 Tenant Metadata Table
- Maintain a `tenants` table storing billing status, plan, limits.
- Agents should consult tenant-level metadata before allowing heavy operations.

---

## F. Supabase Activity Tracking (Universal Audit Layer)

Every table in the system should automatically write to an `activity_log` table for debugging, analytics, and compliance.

F.1 Activity Table Structure
- `id uuid DEFAULT gen_random_uuid()`
- `table_name text`
- `record_id uuid or bigint`
- `action text` ("INSERT", "UPDATE", "DELETE")
- `old_data jsonb`
- `new_data jsonb`
- `actor_id uuid NULL` (from JWT if available)
- `created_at timestamptz DEFAULT now()`

F.2 Activity Trigger Template
- A single function `log_activity()` generated once.
- Generic trigger applied to every table via `FOR EACH ROW`.

F.3 Why This Matters
- Helps with debugging AI agent migrations
- Ensures recoverability
- Enables natural-language search: "What changed on user X yesterday?"

---

## G. Documentation Standards for Database Projects

All database docs must live inside the repo.

G.1 Folder Structure
```
/docs/
  schema/
    tables/
    relationships/
    enums/
    triggers/
    migrations_summary/
  operations/
    backups/
    restore_procedures/
    maintenance/
```

G.2 What Must Be Documented
- Table dictionary (every table, columns, types, constraints)
- Architecture map (diagrams optional)
- Index strategy
- RLS rules
- Trigger list
- Activity log rules
- Migration history summary

---

## H. Storage Rules for Migrations & Backups

H.1 Migrations
- Stored in `/migrations` in timestamp format.
- Must include reversible logic when feasible.
- Must include comments.

H.2 Backups
- Not stored inside the repo.
- Store metadata in:
  - `/docs/operations/backups/backup_policy.md`
- Actual backups stored in: external storage (S3 or Supabase Storage) with:
  - Automated rotation
  - Offsite retention

H.3 Supabase-Specific
- Use `supabase db dump` for daily snapshots.
- Store metadata (not actual dumps) in version control.

---

## I. AI Agent Schema Exploration Guide

How AI agents should safely explore, understand, and search the schema.

I.1 Exploration Commands
- AI agents should begin any DB task by running:
  - `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`
  - `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'X';`
  - `SELECT * FROM pg_indexes WHERE tablename = 'X';`
  - `SELECT * FROM pg_constraint...` (for FK information)

I.2 Schema Understanding Output
AI agents must produce:
- Plain-language summaries of tables
- Relationship maps in text form
- Examples of expected queries

I.3 Natural Language Search Layer
Agents may generate SQL from natural language prompts:
- "Show me all tables that reference users"
- "Show me indices related to tenant performance"
- "Explain the purpose of the invoices table"

I.4 Behavior Rules
- Never modify schema without explicit instruction.
- Always produce a migration preview.
- Always check RLS rules before suggesting queries.

---

## J. Where This Guide Might Split Into Sub-Guides

This document may eventually split into:

J.1 **Database Schema Design Guide** (this file)
J.2 **Supabase Activity & Triggers Guide**
J.3 **AI Schema Exploration Guide**
J.4 **Database Operations Manual** (backups, maintenance)
J.5 **Multi-Tenancy Architecture Guide**

This doc remains the “master overview” that links to all sub-guides.

---

End of v1.2
