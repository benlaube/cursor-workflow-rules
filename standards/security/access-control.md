# Access Control & RLS Standards v1.0

## Metadata
- **Created:** 2025-11-18
- **Version:** 1.0

## 1. Philosophy: Defense in Depth
We do not rely on a single layer of security. We use a "Swiss Cheese" model:
1.  **Endpoint Security:** Who can call this API? (Middleware/Edge Guard)
2.  **Data Security:** Who can see this row? (RLS Policies)
3.  **Field Security:** Who can see this column? (Select projection / Views)

## 2. Endpoint Security vs. RLS
| Feature | Endpoint Security (API) | RLS (Database) |
| :--- | :--- | :--- |
| **Location** | Next.js Middleware, Edge Function | PostgreSQL Policy |
| **Context** | "Is the user logged in?" | "Is this specific row theirs?" |
| **Failure** | 401 Unauthorized | Empty array `[]` (silent) or Error |
| **Usage** | Coarse-grained (Admin vs User) | Fine-grained (Tenant A vs Tenant B) |

**Rule:** Never skip RLS just because you have API authentication. APIs change; database data persists.

## 3. RLS Policy Standards

### 3.1 Default Deny
- Enable RLS on **ALL** tables immediately after creation.
- `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`

### 3.2 Standard Policies
Every table usually needs 3-4 policies:
1.  **Select:** `auth.uid() = user_id` (Own data) or `public = true` (Shared).
2.  **Insert:** `auth.uid() = user_id` (Create own).
3.  **Update:** `auth.uid() = user_id` (Edit own).
4.  **Delete:** `auth.uid() = user_id` (Delete own).

### 3.3 The `service_role` Trap
- **Problem:** The Supabase `service_role` key bypasses RLS.
- **Rule:** NEVER use `service_role` in client-side code.
- **Exception:** Edge Functions may use it for admin tasks, but must validate permissions manually.

## 4. Testing Access Control
RLS cannot be tested with simple unit mocks.

### 4.1 Integration Testing Strategy
To verify "User A cannot see User B":
1.  **Setup:** Create 2 test users in `auth.users`.
2.  **Act:** Sign in as User A (`supabase.auth.signInWithPassword`).
3.  **Query:** User A tries to `select *` from User B's records.
4.  **Assert:** Result must be `[]` (empty), NOT error.

## 5. The Access Matrix
Documentation must include an Access Matrix for critical modules.

| Table | Role: Anon | Role: Authenticated | Role: Admin |
| :--- | :--- | :--- | :--- |
| `profiles` | Read (Public fields) | Edit (Own) | Full |
| `invoices` | None | Read (Own) | Full |
| `audit_logs`| None | None | Read-Only |

## 6. Common Pitfalls (Anti-Patterns)
- **Bad:** `using (true)` on UPDATE policies (Allows anyone to overwrite!).
- **Bad:** `using (role = 'admin')` without verifying where `role` comes from (is it a secure claim or a user-editable column?).
- **Fix:** Always use `auth.jwt() -> 'app_metadata'` for roles, not a public table column.

