# audit-access-control

## Metadata
- **Status:** Active
- **Created:** 02-12-2025 00:00:00 EST
- **Last Updated:** 12-04-2025 14:32:51 EST
- **Version:** 1.0.0
- **Description:** Verify RLS and Endpoint Security (Deep Dive). Performs comprehensive access control audit of API endpoints and database RLS policies.
- **Type:** Executable Command
- **Audience:** AI agents performing security audits
- **Applicability:** When auditing access control, checking RLS policies, or verifying endpoint security
- **How to Use:** Run this command to perform deep dive into application's access control layers: API Endpoints and Database RLS
- **Dependencies:** None
- **Related Cursor Commands:** [audit-security.md](./audit-security.md), [audit-project.md](./audit-project.md)
- **Related Cursor Rules:** [supabase-rls-policy-review.mdc](../rules/supabase-rls-policy-review.mdc)
- **Related Standards:** [security/access-control.md](../../standards/security/access-control.md), [database/schema.md](../../standards/database/schema.md)

---

# Verify Access Control Command

Use this command to perform a deep dive into the application's access control layers: API Endpoints and Database RLS.

## Usage

@agent: When asked to "verify access", "check RLS", or "audit permissions", follow this procedure.

---

## Execution Steps

### 1. Generate the Access Matrix
1.  **Scan Schema:** Read `standards/database/schema.md` and any `.sql` files in `modules/` or `migrations/`.
2.  **Identify Tables:** List all public tables.
3.  **Identify Policies:** Extract RLS policies (`CREATE POLICY ...`).
4.  **Output:** Generate a Markdown table:
    ```markdown
    | Table | Operation | Policy Condition | Risk Level |
    | :--- | :--- | :--- | :--- |
    | `users` | SELECT | `id = auth.uid()` | 🟢 Safe |
    | `posts` | UPDATE | `using (true)` | 🔴 CRITICAL |
    ```

### 2. Endpoint vs. RLS Gap Analysis
1.  **Scan API:** Look at `src/app/api` or `supabase/functions`.
2.  **Identify Queries:** Find where `supabase.from('table')` is called.
3.  **Check Auth:**
    - Does the API check `supabase.auth.getUser()`?
    - OR does it rely solely on RLS? (This is acceptable *if* RLS is tight).
    - **Warning:** If `service_role` is used, flag immediately.

### 3. Automated Heuristics (Static Analysis)
- **Pattern:** `using (true)` on INSERT/UPDATE/DELETE? -> **FAIL**.
- **Pattern:** `auth.uid()` missing in a private table? -> **WARN**.
- **Pattern:** `security_definer` functions? -> **CHECK** (Ensure `SET search_path` is used).

### 4. Generate Test Plan
- Propose specific integration tests to verify the matrix.
- *Example:* "Create a test where User A tries to UPDATE User B's post. Expectation: Row not modified."

## Output Format
Produce a report in `logs/access_control_audit_<DATE>.md` containing:
1.  The Access Matrix.
2.  List of "Red Flags" (Critical risks).
3.  Gap Analysis (API vs DB).
4.  Recommended Fixes.
