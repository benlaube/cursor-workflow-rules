# Email Verification Flow v1.0

Description: Complete guide for implementing email verification with Supabase Auth.
Created: 2025-01-27
Last_Updated: 2025-01-27

---

## 1. Overview

Supabase Auth has built-in email verification. This guide shows how to:

- Configure email verification in Supabase
- Track verification status in profiles table
- Resend verification emails
- Handle verification in your application

**Version:** v1.0

---

## 2. Supabase Configuration

### 2.1 Enable Email Verification

In Supabase Dashboard:

1. Go to **Authentication** > **Settings**
2. Enable **"Enable email confirmations"**
3. Configure email templates (optional)

### 2.2 Email Template Customization

Supabase allows customizing email templates:

- **Confirmation Email** - Sent when user signs up
- **Magic Link Email** - For passwordless login
- **Password Reset Email** - For password recovery

Customize in: **Authentication** > **Email Templates**

---

## 3. Database Schema Updates

### 3.1 Add Verification Status to Profiles

Update your `profiles` table to track email verification:

```sql
-- Add email verification status column
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- Add email verification timestamp
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;

-- Add index for queries
CREATE INDEX IF NOT EXISTS idx_profiles_email_verified
ON public.profiles(email_verified);

COMMENT ON COLUMN public.profiles.email_verified IS 'Whether the user has verified their email address via Supabase Auth';
COMMENT ON COLUMN public.profiles.email_verified_at IS 'Timestamp when email was verified';
```

### 3.2 Update Profile Sync Trigger

Update the `handle_new_user()` function to sync email verification status:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, email_verified, email_verified_at)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    COALESCE((new.raw_user_meta_data->>'email_verified')::boolean, false),
    CASE
      WHEN (new.raw_user_meta_data->>'email_verified')::boolean = true
      THEN now()
      ELSE NULL
    END
  );
  return new;
END;
$$ LANGUAGE plpgsql security definer;
```

### 3.3 Create Trigger for Email Verification Updates

Create a trigger to update profiles when email is verified:

```sql
-- Function to sync email verification status
CREATE OR REPLACE FUNCTION public.handle_email_verification()
RETURNS trigger AS $$
BEGIN
  -- Update profile when email is verified
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE public.profiles
    SET
      email_verified = true,
      email_verified_at = NEW.email_confirmed_at
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql security definer;

-- Trigger on auth.users email confirmation
CREATE TRIGGER on_email_verified
AFTER UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW
WHEN (NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL)
EXECUTE FUNCTION public.handle_email_verification();
```

---

## 4. Frontend Implementation

### 4.1 Sign Up with Email Verification

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Sign up user (Supabase automatically sends verification email)
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'secure-password',
  options: {
    emailRedirectTo: 'https://yourapp.com/auth/callback',
  },
});

if (error) {
  console.error('Sign up error:', error);
} else {
  // User created, verification email sent
  // Show message: "Please check your email to verify your account"
}
```

### 4.2 Check Verification Status

```typescript
// Get current user
const {
  data: { user },
} = await supabase.auth.getUser();

// Check if email is verified
const isVerified = user?.email_confirmed_at !== null;

// Or check from profiles table
const { data: profile } = await supabase
  .from('profiles')
  .select('email_verified, email_verified_at')
  .eq('id', user?.id)
  .single();

if (profile?.email_verified) {
  // Email is verified
}
```

### 4.3 Resend Verification Email

```typescript
// Resend verification email
const { error } = await supabase.auth.resend({
  type: 'signup',
  email: 'user@example.com',
  options: {
    emailRedirectTo: 'https://yourapp.com/auth/callback',
  },
});

if (error) {
  console.error('Resend error:', error);
} else {
  // Verification email sent
}
```

### 4.4 Handle Verification Callback

```typescript
// In your auth callback route (e.g., app/auth/callback/route.ts)
import { createClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/';

  if (code) {
    const cookieStore = await cookies();
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        },
      },
    });

    // Exchange code for session (verifies email automatically)
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to app
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
```

---

## 5. API Route for Resending Verification

```typescript
// app/api/auth/resend-verification/route.ts
import { createApiHandler } from '@/lib/backend-api';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

export const POST = createApiHandler({
  bodySchema: z.object({
    email: z.string().email(),
  }),
  requireAuth: false, // Can be called by unauthenticated users
  handler: async ({ input }) => {
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: input.email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    });

    if (error) {
      throw new Error(`Failed to resend verification: ${error.message}`);
    }

    return { message: 'Verification email sent' };
  },
});
```

---

## 6. UI Components

### 6.1 Verification Status Badge

```typescript
// components/EmailVerificationBadge.tsx
'use client'

import { useUser } from '@/hooks/useUser'

export function EmailVerificationBadge() {
  const { user, profile } = useUser()

  if (!user || profile?.email_verified) {
    return null
  }

  return (
    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
      <p>
        Please verify your email address.
        <button onClick={handleResend} className="underline ml-1">
          Resend verification email
        </button>
      </p>
    </div>
  )
}
```

### 6.2 Protected Route with Verification Check

```typescript
// middleware.ts or in page component
import { createClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function requireVerifiedEmail() {
  const cookieStore = await cookies();
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email_confirmed_at) {
    redirect('/auth/verify-email');
  }
}
```

---

## 7. Best Practices

1. **Show Verification Prompt** - Display verification reminder for unverified users
2. **Rate Limit Resends** - Prevent abuse of resend functionality
3. **Clear Messaging** - Explain why verification is needed
4. **Graceful Degradation** - Allow some features for unverified users, restrict sensitive ones
5. **Auto-Refresh** - Check verification status periodically for users on verification page

---

## 8. Related Documentation

- `modules/auth-profile-sync/README.md` - Main auth module documentation
- `modules/auth-profile-sync/oauth-setup.md` - OAuth provider setup
- `standards/architecture/supabase-local-setup.md` - Supabase setup guide

---

_Last Updated: 2025-01-27_
