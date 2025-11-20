# OAuth Provider Setup Guide v1.0

Description: Complete guide for setting up OAuth providers (Google, GitHub, etc.) with Supabase Auth.
Created: 2025-01-27
Last_Updated: 2025-01-27

---

## 1. Overview

Supabase Auth supports OAuth providers out of the box. This guide covers:
- Configuring providers in Supabase Dashboard
- Frontend implementation
- Storing provider information in profiles
- Handling OAuth callbacks

**Version:** v1.0

---

## 2. Supported Providers

Supabase supports these OAuth providers:
- Google
- GitHub
- GitLab
- Bitbucket
- Azure
- Apple
- Discord
- Facebook
- Twitter/X
- Slack
- Spotify
- Twitch
- Zoom

---

## 3. Provider Configuration

### 3.1 Google OAuth Setup

**Step 1: Create Google OAuth Credentials**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** > **Create Credentials** > **OAuth client ID**
5. Configure:
   - **Application type:** Web application
   - **Authorized redirect URIs:** `https://<your-project-ref>.supabase.co/auth/v1/callback`
6. Copy **Client ID** and **Client Secret**

**Step 2: Configure in Supabase**

1. Go to Supabase Dashboard > **Authentication** > **Providers**
2. Enable **Google**
3. Paste **Client ID** and **Client Secret**
4. Save

### 3.2 GitHub OAuth Setup

**Step 1: Create GitHub OAuth App**

1. Go to GitHub > **Settings** > **Developer settings** > **OAuth Apps**
2. Click **New OAuth App**
3. Configure:
   - **Application name:** Your App Name
   - **Homepage URL:** `https://yourapp.com`
   - **Authorization callback URL:** `https://<your-project-ref>.supabase.co/auth/v1/callback`
4. Copy **Client ID** and generate **Client Secret**

**Step 2: Configure in Supabase**

1. Go to Supabase Dashboard > **Authentication** > **Providers**
2. Enable **GitHub**
3. Paste **Client ID** and **Client Secret**
4. Save

### 3.3 Other Providers

Follow similar pattern:
1. Create OAuth app in provider's developer console
2. Set callback URL to: `https://<your-project-ref>.supabase.co/auth/v1/callback`
3. Copy credentials to Supabase Dashboard
4. Enable provider

---

## 4. Database Schema Updates

### 4.1 Add Provider Information to Profiles

```sql
-- Add OAuth provider columns
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS auth_provider TEXT,
ADD COLUMN IF NOT EXISTS auth_provider_id TEXT,
ADD COLUMN IF NOT EXISTS providers TEXT[] DEFAULT '{}';

-- Add index for provider lookups
CREATE INDEX IF NOT EXISTS idx_profiles_auth_provider 
ON public.profiles(auth_provider);

COMMENT ON COLUMN public.profiles.auth_provider IS 'Primary OAuth provider (google, github, etc.) or email';
COMMENT ON COLUMN public.profiles.auth_provider_id IS 'Provider-specific user ID';
COMMENT ON COLUMN public.profiles.providers IS 'Array of all linked providers';
```

### 4.2 Update Profile Sync Trigger

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    avatar_url,
    email_verified,
    auth_provider,
    auth_provider_id,
    providers
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name'
    ),
    new.raw_user_meta_data->>'avatar_url',
    COALESCE((new.raw_user_meta_data->>'email_verified')::boolean, false),
    COALESCE(
      (SELECT provider FROM jsonb_array_elements(new.app_metadata->'providers') AS provider),
      'email'
    ),
    new.raw_user_meta_data->>'provider_id',
    ARRAY(SELECT jsonb_array_elements_text(new.app_metadata->'providers'))
  );
  return new;
END;
$$ LANGUAGE plpgsql security definer;
```

---

## 5. Frontend Implementation

### 5.1 Sign In with OAuth Provider

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Sign in with Google
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'https://yourapp.com/auth/callback',
    queryParams: {
      access_type: 'offline',
      prompt: 'consent',
    },
  },
})

if (error) {
  console.error('OAuth error:', error)
}
// User will be redirected to provider, then back to callback URL
```

### 5.2 Sign In with GitHub

```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'github',
  options: {
    redirectTo: 'https://yourapp.com/auth/callback',
    scopes: 'read:user user:email', // Request additional scopes
  },
})
```

### 5.3 Handle OAuth Callback

```typescript
// app/auth/callback/route.ts
import { createClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      return NextResponse.redirect(new URL('/auth/error', requestUrl.origin))
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin))
}
```

### 5.4 Link Additional Providers

```typescript
// Link a second provider to existing account
const { data, error } = await supabase.auth.linkIdentity({
  provider: 'github',
  options: {
    redirectTo: 'https://yourapp.com/auth/callback',
  },
})
```

### 5.5 Unlink Provider

```typescript
// Unlink a provider from account
const { data, error } = await supabase.auth.unlinkIdentity({
  provider: 'github',
  identityId: 'provider-user-id',
})
```

---

## 6. Get Provider Information

```typescript
// Get current user's identities (linked providers)
const { data: { user } } = await supabase.auth.getUser()

// Get identities from user object
const identities = user?.identities || []

// Or query from profiles table
const { data: profile } = await supabase
  .from('profiles')
  .select('auth_provider, providers')
  .eq('id', user?.id)
  .single()

console.log('Primary provider:', profile?.auth_provider)
console.log('All providers:', profile?.providers)
```

---

## 7. UI Components

### 7.1 OAuth Sign In Buttons

```typescript
// components/OAuthButtons.tsx
'use client'

import { createClient } from '@supabase/supabase-js'

export function OAuthButtons() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  const handleOAuth = async (provider: 'google' | 'github') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      console.error('OAuth error:', error)
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={() => handleOAuth('google')}
        className="w-full bg-white border border-gray-300 rounded px-4 py-2"
      >
        Sign in with Google
      </button>
      <button
        onClick={() => handleOAuth('github')}
        className="w-full bg-gray-900 text-white rounded px-4 py-2"
      >
        Sign in with GitHub
      </button>
    </div>
  )
}
```

### 7.2 Provider Management

```typescript
// components/ProviderManagement.tsx
'use client'

export function ProviderManagement() {
  const { user, profile } = useUser()

  const linkedProviders = profile?.providers || []
  const availableProviders = ['google', 'github', 'gitlab'].filter(
    p => !linkedProviders.includes(p)
  )

  return (
    <div>
      <h3>Linked Accounts</h3>
      {linkedProviders.map(provider => (
        <div key={provider}>
          {provider}
          <button onClick={() => unlinkProvider(provider)}>Unlink</button>
        </div>
      ))}

      <h3>Link New Account</h3>
      {availableProviders.map(provider => (
        <button key={provider} onClick={() => linkProvider(provider)}>
          Link {provider}
        </button>
      ))}
    </div>
  )
}
```

---

## 8. Best Practices

1. **Multiple Providers** - Allow users to link multiple providers for flexibility
2. **Provider Priority** - Use first provider as primary, allow switching
3. **Email Conflicts** - Handle cases where OAuth email matches existing email account
4. **Avatar Sync** - Use OAuth provider avatar if available
5. **Scope Requests** - Request minimal scopes needed, document why each is needed

---

## 9. Troubleshooting

### "Redirect URI mismatch"

**Issue:** Callback URL doesn't match provider configuration.

**Solution:** Ensure callback URL in provider console matches: `https://<project-ref>.supabase.co/auth/v1/callback`

### "Invalid client credentials"

**Issue:** Client ID or Secret incorrect.

**Solution:** Double-check credentials in Supabase Dashboard match provider console.

### "Provider not enabled"

**Issue:** Provider not enabled in Supabase Dashboard.

**Solution:** Go to Authentication > Providers and enable the provider.

---

## 10. Related Documentation

- `modules/auth-profile-sync/README.md` - Main auth module
- `modules/auth-profile-sync/email-verification.md` - Email verification
- `modules/auth-profile-sync/mfa-helpers.ts` - MFA implementation

---

*Last Updated: 2025-01-27*

