# Auth Profile Sync Module

## Metadata
- **Module:** auth-profile-sync
- **Version:** 1.0
- **Created:** 2025-11-18

## Purpose
This module automatically keeps a `public.profiles` table in sync with Supabase's private `auth.users` table. This is essential because `auth.users` is not queryable by your frontend for security reasons.

## Contents
- `profile-sync.sql`: A robust PostgreSQL migration that:
  - Creates the `profiles` table (if missing).
  - Sets up Row Level Security (RLS) policies.
  - Installs a secure database trigger to copy user data on signup.

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

### 3. Customization
To add more fields (e.g., `phone_number` or `role`), edit the `handle_new_user` function in `profile-sync.sql` to map additional fields from `new.raw_user_meta_data`.

