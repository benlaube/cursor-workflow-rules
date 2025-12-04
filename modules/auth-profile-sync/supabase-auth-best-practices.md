# Supabase Auth Best Practices v1.0

Description: Guide for properly leveraging Supabase's built-in authentication features.
Created: 2025-01-27
Last_Updated: 2025-01-27

---

## 1. Overview

This guide explains how to properly use Supabase's built-in authentication features and avoid reinventing the wheel. Supabase provides a complete auth system - we should leverage it fully.

**Version:** v1.0

---

## 2. What Supabase Provides Out of the Box

### 2.1 Core Auth Features

Supabase Auth includes:

- ✅ **User Management** - `auth.users` table (managed by Supabase)
- ✅ **Email/Password Auth** - Built-in signup, signin, signout
- ✅ **OAuth Providers** - Google, GitHub, etc. (configure in Dashboard)
- ✅ **Magic Links** - Passwordless authentication
- ✅ **Email Verification** - Built-in confirmation flow
- ✅ **Password Reset** - Automatic email handling
- ✅ **MFA/2FA** - TOTP support
- ✅ **Session Management** - Automatic token refresh
- ✅ **JWT Tokens** - With custom claims via `app_metadata` and `user_metadata`

### 2.2 What We Add (Necessary Extensions)

We only add what Supabase doesn't provide:

- ✅ **Public Profiles Table** - Because `auth.users` is not queryable from frontend
- ✅ **Role-Based Access Control** - Using `app_metadata.role` in JWT claims
- ✅ **RLS Policies** - Database-level security
- ✅ **Profile Sync Trigger** - Auto-create profile when user signs up

---

## 3. Leveraging Supabase's Built-In Features

### 3.1 User Roles via JWT Claims

**✅ DO: Use `app_metadata` for roles (secure, in JWT)**

```typescript
// Setting role (via Admin API)
await supabase.auth.admin.updateUserById(userId, {
  app_metadata: {
    role: 'admin', // This becomes available in JWT
  },
});

// Checking role (from JWT)
const role = user.app_metadata?.role; // ✅ Secure, from JWT
```

**❌ DON'T: Store roles only in public tables (insecure)**

```typescript
// ❌ Bad: User could modify their own profile
const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id);

if (profile?.role === 'admin') {
  // ❌ Not secure!
  // ...
}
```

### 3.2 RLS Policies with JWT Claims

**✅ DO: Use `auth.jwt()` in RLS policies**

```sql
-- ✅ Good: Role from JWT (cannot be tampered with)
CREATE POLICY "Admins can see all"
  ON some_table FOR SELECT
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  );
```

**❌ DON'T: Query profiles table in RLS (insecure)**

```sql
-- ❌ Bad: User could modify their profile.role
CREATE POLICY "Admins can see all"
  ON some_table FOR SELECT
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );
```

### 3.3 Why We Have Both `profiles.role` and `app_metadata.role`

**Purpose of `profiles.role`:**

- Convenience for queries (e.g., "get all admins")
- UI display (showing user's role)
- Analytics/reporting

**Purpose of `app_metadata.role`:**

- **Source of truth** for security
- Available in JWT (cannot be tampered with)
- Used in RLS policies
- Used in API route authorization

**Best Practice:** Keep both in sync, but always check `app_metadata.role` for security decisions.

---

## 4. Using Supabase's Built-In Auth Methods

### 4.1 Email/Password (Built-In)

```typescript
// Sign up - Supabase handles everything
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password',
});

// Sign in - Supabase handles session
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'secure-password',
});

// Sign out - Supabase clears session
await supabase.auth.signOut();
```

**No custom code needed** - Supabase handles:

- Password hashing
- Session management
- Token refresh
- Cookie handling (with SSR)

### 4.2 OAuth (Built-In)

```typescript
// Sign in with Google - Supabase handles OAuth flow
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'https://yourapp.com/auth/callback',
  },
});
```

**No custom OAuth code needed** - Supabase handles:

- OAuth flow
- Token exchange
- User creation
- Provider linking

### 4.3 Magic Links (Built-In)

```typescript
// Passwordless login - Supabase sends email
const { data, error } = await supabase.auth.signInWithOtp({
  email: 'user@example.com',
});
```

**No custom email code needed** - Supabase handles:

- Email sending
- Token generation
- Link validation

### 4.4 MFA (Built-In)

```typescript
// Enroll MFA - Supabase generates TOTP secret
const { data, error } = await supabase.auth.mfa.enroll({
  factorType: 'totp',
  friendlyName: 'My Phone',
});
```

**No custom MFA code needed** - Supabase handles:

- TOTP secret generation
- QR code creation
- Verification

---

## 5. What We DON'T Build (Supabase Handles)

### 5.1 ❌ Don't Build Custom Auth

**Don't:**

- Build custom password hashing
- Build custom session management
- Build custom token generation
- Build custom OAuth flows

**Do:**

- Use Supabase's built-in methods
- Configure in Supabase Dashboard
- Use Supabase SSR for server-side auth

### 5.2 ❌ Don't Store Auth Data in Public Tables

**Don't:**

- Store passwords in `profiles` table
- Store tokens in `profiles` table
- Store session data in `profiles` table

**Do:**

- Let Supabase manage `auth.users`
- Store only public profile data in `profiles`
- Use Supabase's session management

### 5.3 ❌ Don't Bypass Supabase Auth

**Don't:**

- Create users directly in `auth.users` table
- Manually set JWT tokens
- Skip Supabase's auth flow

**Do:**

- Use Supabase Admin API for user management
- Use Supabase's auth methods
- Let Supabase handle JWT generation

---

## 6. Our Architecture (Leveraging Supabase)

### 6.1 User Flow

```
1. User signs up → Supabase creates auth.users record
2. Trigger fires → Creates public.profiles record
3. Admin sets role → Updates app_metadata.role (JWT claim)
4. User signs in → Supabase generates JWT with role
5. RLS policies → Check JWT claims for permissions
6. API routes → Check JWT claims for authorization
```

### 6.2 Data Storage

```
auth.users (Supabase managed)
├── id (UUID)
├── email
├── encrypted_password (Supabase handles)
├── app_metadata.role (JWT claim - source of truth)
└── user_metadata (public data)

public.profiles (Our extension)
├── id (references auth.users.id)
├── email (copy for querying)
├── full_name (public data)
├── role (convenience copy - not for security)
└── ... other public fields
```

### 6.3 Security Layers

```
1. Supabase Auth (Built-in)
   └── User authentication, session management

2. JWT Claims (Built-in)
   └── Role stored in app_metadata (secure)

3. RLS Policies (Our implementation)
   └── Check JWT claims for database access

4. API Authorization (Our implementation)
   └── Check JWT claims for endpoint access
```

---

## 7. Best Practices Summary

### 7.1 ✅ DO

- Use Supabase's built-in auth methods
- Store roles in `app_metadata.role` (JWT)
- Check JWT claims for security decisions
- Use RLS policies with `auth.jwt()`
- Let Supabase handle sessions and tokens
- Use Supabase SSR for server-side auth

### 7.2 ❌ DON'T

- Build custom auth systems
- Store roles only in public tables
- Query profiles table in RLS policies
- Bypass Supabase's auth flow
- Store sensitive data in public tables
- Manually manage sessions or tokens

---

## 8. Related Documentation

- `modules/auth-profile-sync/profile-sync.sql` - Profile sync trigger
- `modules/auth-profile-sync/dev-user-setup.md` - Dev user setup
- `standards/security/access-control.md` - RLS and security standards
- `modules/backend-api/` - API handler using Supabase SSR
- `standards/architecture/supabase-ssr-api-routes.md` - Supabase SSR guide

---

_Last Updated: 2025-01-27_
