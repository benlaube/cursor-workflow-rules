# Supabase_SSR_Next_JS_API_Routes_v1.0

## Metadata

- **Created:** 2025-01-27
- **Last Updated:** 2025-01-27
- **Version:** 1.0
- **Description:** Guide explaining how Supabase's @supabase/ssr package simplifies API route handler creation in Next.js.

---

## 1. Purpose

This document explains how Supabase's `@supabase/ssr` package makes creating authenticated API routes in Next.js significantly easier by handling JWT extraction, verification, and session management automatically.

**Version:** v1.0

---

## 2. The Problem It Solves

**Without Supabase SSR, you would need to:**

1. Manually extract JWT from cookies or Authorization header
2. Verify the JWT signature
3. Handle token refresh logic
4. Parse user claims from the token
5. Manage session state

**With Supabase SSR, you get:**

- Automatic JWT extraction from cookies
- Built-in token verification
- Automatic token refresh
- Type-safe user object
- Seamless integration with Next.js App Router

---

## 3. Installation

```bash
npm install @supabase/ssr @supabase/supabase-js
```

---

## 4. Core Helper: `createServerClient()`

### 4.1 Basic Usage in API Routes

```typescript
// app/api/example/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Create authenticated Supabase client
  const cookieStore = await cookies();
  const supabase = createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });

  // Get authenticated user (automatically verifies JWT)
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // User is authenticated, proceed with business logic
  const { data } = await supabase.from('posts').select('*').eq('user_id', user.id);

  return NextResponse.json({ data });
}
```

### 4.2 Key Simplifications

**A. Automatic JWT Extraction**

- `createServerClient()` automatically reads JWT from cookies
- No need to manually parse `Authorization` header or cookies
- Handles both access token and refresh token

**B. Automatic Token Verification**

- JWT signature is verified automatically
- Invalid tokens return error immediately
- No need to manually verify with JWT library

**C. Automatic Token Refresh**

- If access token is expired, refresh token is used automatically
- New tokens are stored in cookies automatically
- Transparent to your code

**D. Type-Safe User Object**

- `getUser()` returns typed user object
- Includes `id`, `email`, `user_metadata`, etc.
- No manual JWT payload parsing

---

## 5. Integration with Backend API Module

The Backend API Module can leverage Supabase SSR to create a thin wrapper:

```typescript
// modules/backend-api/src/middleware/auth.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { User } from '@supabase/supabase-js';

export interface AuthContext {
  user: User;
  supabase: ReturnType<typeof createServerClient>;
}

/**
 * Authenticate request using Supabase SSR.
 * Returns user and Supabase client if authenticated, null otherwise.
 */
export async function authenticateRequest(): Promise<AuthContext | null> {
  const cookieStore = await cookies();
  const supabase = createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Ignore in Server Components (middleware handles refresh)
        }
      },
    },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return { user, supabase };
}
```

**Benefits:**

- Single function call to authenticate
- Returns both user and authenticated Supabase client
- Can be reused across all API routes
- Handles all JWT complexity internally

---

## 6. RLS Integration

**Key Insight:** Because Supabase SSR handles authentication, you can rely on RLS for data access control:

```typescript
// With authenticated Supabase client, RLS policies automatically apply
const { data } = await supabase.from('posts').select('*');
// RLS policies automatically filter based on auth.uid()
// No need for manual WHERE user_id = ? checks
```

**This means:**

- Less code in API handlers
- Security enforced at database level
- Consistent access control across all queries
- API layer focuses on business logic, not security

---

## 7. Error Handling

Supabase SSR errors are standardized:

```typescript
const {
  data: { user },
  error,
} = await supabase.auth.getUser();

if (error) {
  // error.name: 'AuthSessionMissingError' | 'AuthInvalidTokenError' | etc.
  // error.message: Human-readable message
  // error.status: HTTP status code
}
```

The Backend API Module can wrap these into standard error responses.

---

## 8. Comparison: Manual vs Supabase SSR

### Manual Implementation (Complex)

```typescript
// Manual JWT handling
const token = request.headers.get('Authorization')?.replace('Bearer ', '');
if (!token) return unauthorized();

const decoded = jwt.verify(token, JWT_SECRET);
if (decoded.exp < Date.now() / 1000) {
  // Need to refresh...
  const refreshToken = getRefreshTokenFromCookies();
  // More complex refresh logic...
}

const user = await getUserById(decoded.sub);
// Continue with business logic...
```

### Supabase SSR (Simple)

```typescript
const { user } = await authenticateRequest();
if (!user) return unauthorized();
// Continue with business logic...
```

**Lines of code:** ~50+ vs ~3
**Complexity:** High vs Low
**Maintenance:** Manual token refresh logic vs Automatic

---

## 9. Best Practices

1. **Always use `createServerClient()` in API routes** - Never use client-side `createClient()` in server code
2. **Rely on RLS for data security** - Don't duplicate access checks in API layer
3. **Handle errors gracefully** - Supabase SSR errors are clear and actionable
4. **Use typed user object** - Leverage TypeScript types from `@supabase/supabase-js`

---

## 10. Related Documentation

- `standards/architecture/backend-module-plan.md` - Backend API Module plan
- `standards/security/access-control.md` - RLS and security standards
- `standards/architecture/supabase-local-setup.md` - Supabase setup guide

---

_Last Updated: 2025-01-27_
