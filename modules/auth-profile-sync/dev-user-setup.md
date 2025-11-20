# Dev User Setup Guide v1.0

Description: Guide for creating a default development user with admin permissions for local development.
Created: 2025-01-27
Last_Updated: 2025-01-27

---

## 1. Overview

This guide explains how to set up a default development user with admin permissions for local development. This is useful for:
- Quick testing without creating accounts manually
- Consistent development environment setup
- Testing admin-only features

**⚠️ WARNING:** This should **ONLY** be used in development environments. Never run in production!

**Version:** v1.0

---

## 2. Prerequisites

- Supabase project set up (local or remote)
- `profile-sync.sql` migration applied
- Service role key available (for script-based setup)

---

## 3. Setup Methods

### Method 1: SQL Script (Manual)

**Step 1:** Apply the dev user schema updates:

```sql
-- Run dev-user-setup.sql in Supabase SQL Editor
-- This adds the 'role' column and admin policies
```

**Step 2:** Create the dev user manually:

```sql
-- Option A: Use Supabase Dashboard > Authentication > Users > Add User
-- Set email: dev@localhost
-- Set password: dev123456 (or your preferred password)
-- Mark email as confirmed

-- Option B: Use Supabase Admin API (see Method 2)
```

**Step 3:** Grant admin role:

```sql
-- Grant admin role to the dev user
SELECT public.grant_admin_role('dev@localhost');
```

### Method 2: Automated Script (Recommended)

**Step 1:** Install dependencies (if not already installed):

```bash
npm install @supabase/supabase-js
# or
yarn add @supabase/supabase-js
```

**Step 2:** Set environment variables:

```bash
# .env.local or .env
SUPABASE_URL=http://localhost:54321  # or your Supabase URL
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DEV_USER_EMAIL=dev@localhost
DEV_USER_PASSWORD=dev123456
DEV_USER_NAME=Dev User
```

**Step 3:** Run the setup script:

```bash
# Using tsx
npx tsx modules/auth-profile-sync/dev-user-setup.ts

# Using ts-node
node --loader ts-node/esm modules/auth-profile-sync/dev-user-setup.ts

# Or compile and run
tsc modules/auth-profile-sync/dev-user-setup.ts
node modules/auth-profile-sync/dev-user-setup.js
```

**Step 4:** Verify setup:

```sql
-- Check user was created
SELECT id, email, full_name, role 
FROM public.profiles 
WHERE email = 'dev@localhost';
```

---

## 4. Role System

### 4.1 Available Roles

The system supports role-based access control:

- **`user`** - Default role for regular users
- **`admin`** - Full access to all resources
- **Custom roles** - Add your own roles as needed

### 4.2 Role Storage

Roles are stored in the `profiles.role` column. For security, roles should also be stored in JWT claims via `app_metadata`:

```typescript
// When creating/updating user
await supabase.auth.admin.updateUserById(userId, {
  app_metadata: {
    role: 'admin', // This becomes available in auth.jwt()
  },
})
```

### 4.3 Checking Roles

**In Database (RLS Policies):**

```sql
-- Check if user is admin
SELECT public.is_admin();

-- Use in RLS policy
CREATE POLICY "Admins can see all"
  ON some_table FOR SELECT
  USING (public.is_admin());
```

**In Application Code:**

```typescript
// Get role from profile
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('id', user.id)
  .single()

if (profile?.role === 'admin') {
  // Admin access
}

// Or check JWT claims (more secure)
const role = user.app_metadata?.role
if (role === 'admin') {
  // Admin access
}
```

**In API Routes (Backend API Module):**

```typescript
import { createApiHandler } from '@/lib/backend-api'

export const GET = createApiHandler({
  requireAuth: true,
  handler: async ({ ctx }) => {
    const role = ctx.auth!.user.app_metadata?.role
    
    if (role !== 'admin') {
      return forbidden('Admin access required')
    }
    
    // Admin-only logic
  },
})
```

---

## 5. RLS Policies with Roles

### 5.1 Admin Access Policies

The `dev-user-setup.sql` script includes policies that allow admins to:
- See all profiles (not just their own)
- Update any profile
- Access admin-only resources

### 5.2 Example: Admin-Only Table

```sql
-- Create table with RLS
CREATE TABLE admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can see logs
CREATE POLICY "Only admins can view logs"
  ON admin_logs FOR SELECT
  USING (public.is_admin());

-- Only admins can insert logs
CREATE POLICY "Only admins can insert logs"
  ON admin_logs FOR INSERT
  WITH CHECK (public.is_admin());
```

---

## 6. Customization

### 6.1 Change Dev User Credentials

Edit environment variables before running the script:

```bash
DEV_USER_EMAIL=mydev@example.com
DEV_USER_PASSWORD=mySecurePassword123
DEV_USER_NAME=My Dev Account
```

### 6.2 Add Custom Roles

```sql
-- Add custom role column or use enum
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS custom_role TEXT;

-- Create role-specific policies
CREATE POLICY "Editors can edit content"
  ON content FOR UPDATE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'editor')
  );
```

### 6.3 Multiple Dev Users

Run the script multiple times with different emails:

```bash
DEV_USER_EMAIL=admin@localhost npx tsx dev-user-setup.ts
DEV_USER_EMAIL=editor@localhost npx tsx dev-user-setup.ts
```

Or modify the script to create multiple users.

---

## 7. Security Considerations

### 7.1 Never Use in Production

- The dev user script uses hardcoded credentials
- It bypasses normal signup flows
- It grants admin access automatically

### 7.2 Environment Detection

Add environment checks to prevent accidental production use:

```typescript
if (process.env.NODE_ENV === 'production') {
  throw new Error('Dev user setup cannot run in production')
}

if (!SUPABASE_URL.includes('localhost') && !SUPABASE_URL.includes('127.0.0.1')) {
  console.warn('⚠️  WARNING: Not a local Supabase instance!')
  // Add confirmation prompt
}
```

### 7.3 Role Verification

Always verify roles from JWT claims, not just database:

```typescript
// ✅ Good: Check JWT claim
const role = user.app_metadata?.role

// ❌ Bad: Only check database (user could modify profile)
const { data: profile } = await supabase.from('profiles').select('role')
```

---

## 8. Troubleshooting

### "User already exists"

**Issue:** Script fails because user already exists.

**Solution:** The script is idempotent - it will update existing users. If you get an error, check:
- User exists in `auth.users`
- Profile exists in `public.profiles`
- Service role key has correct permissions

### "Permission denied"

**Issue:** Cannot create user or update profile.

**Solution:**
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Check service role key has admin permissions
- Ensure RLS policies allow service role operations

### "Role not working"

**Issue:** Admin role doesn't grant expected access.

**Solution:**
- Verify role is set in both `profiles.role` and `app_metadata.role`
- Check RLS policies use `public.is_admin()` function
- Verify JWT includes role in claims

---

## 9. Integration with CI/CD

For automated testing, you can create test users in CI:

```yaml
# .github/workflows/test.yml
- name: Setup test users
  run: |
    npx tsx modules/auth-profile-sync/dev-user-setup.ts
  env:
    SUPABASE_URL: ${{ secrets.SUPABASE_TEST_URL }}
    SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_TEST_SERVICE_KEY }}
    DEV_USER_EMAIL: test@example.com
    DEV_USER_PASSWORD: test123456
```

---

## 10. Related Documentation

- `modules/auth-profile-sync/profile-sync.sql` - Base profile sync migration
- `modules/auth-profile-sync/README.md` - Main auth module documentation
- `standards/security/access-control.md` - RLS and security standards
- `modules/backend-api/` - API handler with role checking examples

---

*Last Updated: 2025-01-27*

