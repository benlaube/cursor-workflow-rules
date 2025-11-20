# Auth Profile Sync Module

## Metadata
- **Module:** auth-profile-sync
- **Version:** 1.1
- **Created:** 2025-11-18
- **Last Updated:** 2025-01-27

## Purpose
This module automatically keeps a `public.profiles` table in sync with Supabase's private `auth.users` table. This is essential because `auth.users` is not queryable by your frontend for security reasons.

The module also provides comprehensive guides and helpers for:
- Email verification flows
- OAuth provider integration (Google, GitHub, etc.)
- Multi-Factor Authentication (MFA)

## Contents

### Core Files
- `profile-sync.sql`: PostgreSQL migration that:
  - Creates the `profiles` table (if missing)
  - Sets up Row Level Security (RLS) policies
  - Installs a secure database trigger to copy user data on signup

### Feature Guides
- `email-verification.md`: Complete guide for email verification
  - Database schema updates
  - Frontend implementation
  - API routes for resending verification
  - UI components

- `oauth-setup.md`: OAuth provider setup guide
  - Google, GitHub, and other provider configuration
  - Database schema for provider tracking
  - Frontend implementation examples
  - Provider management UI

- `mfa-helpers.ts`: MFA enrollment and verification helpers
  - TOTP enrollment and verification
  - Challenge and verification flows
  - Factor management

- `dev-user-setup.md`: Development user setup guide
  - Create default dev user with admin permissions
  - Role-based access control (RBAC) system
  - Automated setup script
  - Security considerations

- `supabase-auth-best-practices.md`: Guide for leveraging Supabase's built-in auth
  - What Supabase provides vs. what we add
  - Using JWT claims for roles (secure)
  - RLS policies with JWT
  - Best practices and anti-patterns

## Usage

### 1. Apply the Migration
Copy the contents of `profile-sync.sql` and run it in your Supabase SQL Editor or apply it via your migration tool.

### 2. Frontend Integration
When a user signs in, you can immediately query their profile:

```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single()
```

### 3. Email Verification
See `email-verification.md` for:
- Database schema updates for verification tracking
- Frontend sign-up and verification flows
- API routes for resending verification emails
- UI components for verification status

### 4. OAuth Providers
See `oauth-setup.md` for:
- Configuring Google, GitHub, and other providers
- Storing provider information in profiles
- Linking multiple providers to one account
- Provider management UI

### 5. Multi-Factor Authentication
See `mfa-helpers.ts` for:
- Enrolling TOTP authenticators
- Verifying MFA during sign-in
- Managing multiple MFA factors
- Syncing MFA status to profiles

### 6. Dev User Setup (Development Only)
See `dev-user-setup.md` for:
- Creating a default dev user with admin permissions
- Setting up role-based access control
- Automated setup script
- Security best practices

### 6. Customization
To add more fields (e.g., `phone_number` or `role`), edit the `handle_new_user` function in `profile-sync.sql` to map additional fields from `new.raw_user_meta_data`.

## Features

- ✅ **Automatic Profile Sync** - Profiles created automatically on user signup
- ✅ **Email Verification** - Track and manage email verification status
- ✅ **OAuth Integration** - Support for multiple OAuth providers
- ✅ **MFA Support** - TOTP-based multi-factor authentication
- ✅ **RLS Policies** - Secure access control at database level
- ✅ **Type-Safe Helpers** - TypeScript helpers for all features

## Related Documentation

- `standards/architecture/supabase-local-setup.md` - Supabase setup guide
- `standards/security/access-control.md` - RLS and security standards
- `modules/backend-api/` - API handler module with auth integration

