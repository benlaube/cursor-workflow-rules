# RLS_Policy_Review_Checklist_v1.0

**Type:** Checklist – used by Cursor commands and human devs to validate database security, specifically Row Level Security (RLS) policies, including enablement, policy logic, mutation safety, role-based access, and leakage prevention.

**Description:** Deep-dive checklist for reviewing database security, specifically Row Level Security (RLS) policies, including enablement, policy logic, mutation safety, role-based access, and leakage prevention.

**Created:** 2025-11-25 11:30

**Last_Updated:** 2025-11-25 11:30

**Related Command:** `.cursor/commands/rls_policy_review.md`

---

Use this deep-dive checklist when reviewing database security, specifically Row Level Security (RLS).

## 1. Enablement
- [ ] **RLS Enabled:** Is `ENABLE ROW LEVEL SECURITY` applied to the table?
- [ ] **No Bypasses:** Are we avoiding `BYPASSRLS` roles in the application logic?

## 2. Policy Logic (The "Where Clause")
- [ ] **Tenancy Check:** Does the policy strictly enforce `tenant_id`?
  - *Example:* `tenant_id = (select tenant_id from auth_users where id = auth.uid())`
- [ ] **Ownership Check:** Does the policy check `user_id = auth.uid()`?
- [ ] **Public Data:** If `using (true)` is present, is it strictly for SELECT (Read-Only)?
- [ ] **Recursion:** Avoid infinite recursion (e.g., querying the same table inside its own policy without careful structure).

## 3. Mutation Safety (Insert/Update/Delete)
- [ ] **UPDATE Scope:** Does the `WITH CHECK` clause prevent users from changing ownership?
  - *Risk:* User A changes `user_id` to User B, stealing the record.
- [ ] **INSERT Integrity:** Does the policy force `user_id` to match `auth.uid()`?

## 4. Role-Based Access (RBAC)
- [ ] **Source of Truth:** Are roles read from `auth.jwt()` (secure) or a public table (insecure)?
  - *Pass:* `(auth.jwt() ->> 'role') = 'admin'`
  - *Fail:* `(select role from profiles where id = auth.uid()) = 'admin'` (User can edit profile!).

## 5. Leakage Prevention
- [ ] **Error Messages:** ensure RLS failures return empty sets `[]`, not detailed permission errors (which reveal existence).
- [ ] **Views:** If using Views, do they inherit security (`security_invoker`)?

---
*Automated by Cursor Workflow Rules*

