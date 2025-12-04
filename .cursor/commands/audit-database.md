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

For the application's database ensure every table and field has an accurate description and if it's not set, then update it. If using Supabase as the data resource, use the Supabase CLI to access the database. Output a report for the user to view to `/docs/audit`. Ensure the report is dated.

---

## When to Use

- When auditing database schema
- Ensuring table and field descriptions are complete
- Before database migrations
- As part of project audits

---

## Prerequisites

- [ ] Database access configured (Supabase CLI or direct connection)
- [ ] `/docs/audit` directory exists (or will be created)
- [ ] Sufficient permissions to read database schema

---

## Steps

### Step 1: Connect to Database

1. **If using Supabase:**
   - Verify Supabase CLI is installed: `supabase --version`
   - Check Supabase status: `supabase status`
   - Use Supabase MCP or CLI to access database

2. **If using direct connection:**
   - Verify connection string in `.env`
   - Test connection to database

### Step 2: Retrieve Schema Information

1. **List All Tables:**
   - Query database for all tables in public schema
   - Include system tables if relevant

2. **Get Table and Column Details:**
   - For each table, retrieve:
     - Table name
     - Column names and types
     - Existing comments/descriptions
     - Constraints and indexes

### Step 3: Check for Missing Descriptions

1. **Identify Tables Without Comments:**
   - Check `COMMENT ON TABLE` statements
   - List tables missing descriptions

2. **Identify Columns Without Comments:**
   - Check `COMMENT ON COLUMN` statements
   - List columns missing descriptions

### Step 4: Update Missing Descriptions

1. **For Each Table Missing Description:**
   - Analyze table purpose from schema and code
   - Generate appropriate description
   - Add `COMMENT ON TABLE` statement

2. **For Each Column Missing Description:**
   - Analyze column purpose from context
   - Generate appropriate description
   - Add `COMMENT ON COLUMN` statement

### Step 5: Generate Audit Report

1. **Create Report File:**
   - Create `/docs/audit/database_audit_<DATE>.md`
   - Include timestamp in filename and content

2. **Report Structure:**
   ```markdown
   # Database Audit Report
   
   **Generated:** DD-MM-YYYY HH:MM:SS EST
   
   ## Summary
   - Total Tables: X
   - Tables with Descriptions: X
   - Tables Missing Descriptions: X
   - Columns with Descriptions: X
   - Columns Missing Descriptions: X
   
   ## Tables Reviewed
   [List of tables with status]
   
   ## Actions Taken
   [List of descriptions added]
   ```

---

## Expected Output

### Success Case
```
✅ Database audit complete.

Summary:
- Tables Reviewed: 15
- Tables with Descriptions: 12
- Descriptions Added: 3
- Report: /docs/audit/database_audit_04-12-2025.md
```

### Failure Case
```
❌ Database audit failed.

Issues:
- Unable to connect to database
- Supabase CLI not available
- Insufficient permissions
```

---

## Validation

After auditing database:

- [ ] All tables reviewed
- [ ] Missing descriptions identified
- [ ] Descriptions added where needed
- [ ] Report generated with timestamp
- [ ] Report saved to `/docs/audit/`

---

## Related Files

- **Commands:**
  - [audit-project.md](./audit-project.md) - Comprehensive project audit
  - [audit-security.md](./audit-security.md) - Security audit
- **Rules:**
  - [supabase-rls-policy-review.mdc](../rules/supabase-rls-policy-review.mdc) - RLS policy review
- **Standards:**
  - [database/schema.md](../../standards/database/schema.md) - Database schema standards