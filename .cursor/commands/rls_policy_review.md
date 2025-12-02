---
description: Deep-dive review of Row Level Security (RLS) policies. Validates enablement, policy logic, mutation safety, role-based access, and leakage prevention.
globs: 
---

# RLS Policy Review Command

Use this command to perform a comprehensive review of database security, specifically Row Level Security (RLS) policies. This is a deep-dive analysis that checks policy logic, mutation safety, and security patterns.

**Source Checklist:** `docs/process/checklists/rls_policy_review_checklist_v1_0.md`

## Usage

@agent: When asked to "review RLS policies", "check database security", or "audit RLS", follow this procedure.

**Parameters:**
- `table`: (Optional) Specific table name to review. If not provided, reviews all tables.
- `suggest`: `true` or `false` (default: `true`). Generate suggested policy patterns for missing or weak policies.

---

## Execution Steps

### 1. Enumerate Tables with RLS
*Uses Supabase MCP or direct database connection*

1. **List All Tables:**
   - Query: `SELECT tablename FROM pg_tables WHERE schemaname = 'public'`
   - For each table, check RLS status: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = '<table>`

2. **Identify Tables Without RLS:**
   - List tables where `rowsecurity = false`
   - Warn: "⚠️ Table `<table>` does not have RLS enabled"

3. **Output:**
   - ✅ "RLS enabled on all public tables"
   - Or list tables without RLS

### 2. Policy Enumeration
1. **Get All Policies:**
   - Query: `SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check FROM pg_policies WHERE schemaname = 'public'`
   - Group by table

2. **Policy Analysis:**
   - For each policy, extract:
     - Policy name
     - Operation (SELECT, INSERT, UPDATE, DELETE, ALL)
     - `qual` (USING clause)
     - `with_check` (WITH CHECK clause)
     - Roles

### 3. Policy Logic Validation

#### 3.1 Tenancy Check
1. **Check for Tenant Enforcement:**
   - Look for `tenant_id` in policy conditions
   - Pattern: `tenant_id = (select tenant_id from auth_users where id = auth.uid())`
   - Report policies missing tenant checks on multi-tenant tables

#### 3.2 Ownership Check
1. **Check for User Ownership:**
   - Look for `user_id = auth.uid()` or `created_by = auth.uid()`
   - Report policies missing ownership checks

#### 3.3 Public Data Validation
1. **Check for `using (true)`:**
   - If found, verify it's ONLY for SELECT operations
   - Warn if `using (true)` is used for INSERT/UPDATE/DELETE
   - Pattern: `using (true)` should only appear in SELECT policies

#### 3.4 Recursion Check
1. **Check for Recursive Queries:**
   - Look for policies that query the same table they protect
   - Example: `using (id in (select id from same_table where ...))`
   - Warn about potential infinite recursion

### 4. Mutation Safety Validation

#### 4.1 UPDATE Scope Check
1. **Check WITH CHECK Clauses:**
   - Verify UPDATE policies have `WITH CHECK` clauses
   - Check if `WITH CHECK` prevents ownership changes
   - Pattern: `WITH CHECK (user_id = auth.uid())` prevents changing `user_id`
   - Report policies that allow ownership changes

#### 4.2 INSERT Integrity Check
1. **Check INSERT Policies:**
   - Verify INSERT policies force `user_id` to match `auth.uid()`
   - Pattern: `WITH CHECK (user_id = auth.uid())`
   - Report policies missing user_id enforcement

### 5. Role-Based Access Validation

#### 5.1 Source of Truth Check
1. **Check Role Sources:**
   - Look for policies using `auth.jwt() ->> 'role'` (✅ Secure)
   - Look for policies using `SELECT role FROM profiles WHERE id = auth.uid()` (❌ Insecure)
   - Report insecure role sources

2. **Pattern Matching:**
   - Secure: `(auth.jwt() ->> 'role') = 'admin'`
   - Insecure: `(SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'`

### 6. Leakage Prevention Check

#### 6.1 Error Message Analysis
1. **Check Error Handling:**
   - Verify RLS failures return empty sets `[]`, not detailed errors
   - This is typically handled at application level, but document expectation

#### 6.2 Views Security
1. **Check View Security:**
   - Query: `SELECT viewname, viewowner FROM pg_views WHERE schemaname = 'public'`
   - Check if views use `security_invoker`
   - Report views that may bypass RLS

### 7. Generate Policy Health Report

1. **Create Table Summary:**
   ```
   | Table | RLS Enabled | Policies | Tenant Check | Ownership Check | Mutation Safe | Role Source | Status |
   |-------|-------------|----------|--------------|-----------------|---------------|-------------|--------|
   | users | ✅          | 3        | ✅           | ✅              | ✅            | ✅          | ✅      |
   | posts | ✅          | 2        | ❌           | ✅              | ⚠️            | ✅          | ⚠️      |
   ```

2. **Generate Suggestions:**
   - If `suggest=true`, provide policy patterns for missing/weak policies
   - Include example SQL for fixing issues

---

## Output Format

### Success Case
```
✅ RLS Policy Review complete.

Summary:
- All tables have RLS enabled
- All policies enforce tenant isolation
- All policies enforce ownership
- Mutation policies are secure
- Role sources are secure (using auth.jwt())

Database security is strong.
```

### Failure Case
```
⚠️ RLS Policy Review found issues.

Issues Found:

**Tables Without RLS:**
- ❌ `public.audit_logs` - RLS not enabled

**Missing Tenant Checks:**
- ⚠️ `public.posts` - INSERT policy missing tenant_id check
- ⚠️ `public.comments` - UPDATE policy missing tenant_id check

**Missing Ownership Checks:**
- ⚠️ `public.posts` - UPDATE policy allows changing user_id

**Insecure Role Sources:**
- ❌ `public.admin_settings` - Policy uses `SELECT role FROM profiles` instead of `auth.jwt()`

**Mutation Safety Issues:**
- ⚠️ `public.posts` - UPDATE policy missing WITH CHECK clause

---

Suggested Fixes:

1. Enable RLS on `public.audit_logs`:
```sql
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
```

2. Add tenant check to `public.posts` INSERT policy:
```sql
CREATE POLICY "posts_insert_tenant" ON public.posts
  FOR INSERT
  WITH CHECK (
    tenant_id = (SELECT tenant_id FROM auth.users WHERE id = auth.uid())
  );
```

3. Fix ownership change prevention on `public.posts`:
```sql
ALTER POLICY "posts_update" ON public.posts
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```
```

---

## Integration with Other Commands

This command can be called:
- Standalone for deep RLS analysis
- As part of `security_audit` (deep mode)
- As part of `project_audit` (deep mode)
- As part of `full_project_health_check`

---

## Related Commands

- `security_audit` - General security audit (includes RLS check)
- `project_audit` - Full project audit (can include RLS review)
- `full_project_health_check` - Run all audits together

---

## Related Standards

- `standards/security/access-control.md` - Access control and RLS standards
- `standards/database/schema.md` - Database schema conventions

