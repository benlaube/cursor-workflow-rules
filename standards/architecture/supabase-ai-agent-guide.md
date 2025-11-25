# Supabase Modules: AI Agent Guide v1.0

## Metadata
- **Created:** 2025-01-27
- **Version:** 1.0
- **Description:** Comprehensive guide for AI Agents on how to use Supabase modules in this repository

---

## 1. Purpose

This guide helps AI Agents understand:
- **What Supabase modules exist** in this repository
- **When to use each module** (decision tree)
- **How to integrate modules together** (patterns)
- **Best practices** for Supabase development
- **Common pitfalls** and how to avoid them

**Target Audience:** AI Agents using this repository as a coding standard/guide.

---

## 2. Module Overview

### 2.1 Core Supabase Modules

| Module | Purpose | When to Use |
|--------|---------|-------------|
| `modules/auth-profile-sync/` | Auth system with profile sync | User authentication, profile management, email verification, OAuth, MFA |
| `modules/backend-api/` | Standardized API handlers | Next.js API routes requiring auth, validation, error handling |
| `modules/sitemap-module/` | Sitemap automation | Auto-generating sitemap.xml from database content |
| `modules/settings-manager/` | Encrypted settings storage | User-configurable secrets, runtime configuration, multi-tenant settings |

### 2.2 Supporting Standards

| Standard | Purpose | When to Reference |
|---------|---------|-------------------|
| `standards/architecture/supabase-local-setup.md` | Local development setup | Setting up Supabase locally, container management |
| `standards/architecture/supabase-secrets-management.md` | Secrets storage strategy | Deciding where to store secrets (`.env`, DB, Edge Functions) |
| `standards/architecture/supabase-ssr-api-routes.md` | SSR integration guide | Using Supabase SSR in Next.js API routes |
| `standards/architecture/supabase-edge-functions.md` | Edge Functions guide | When to use Edge Functions vs backend API |
| `standards/architecture/supabase-data-api.md` | PostgREST Data API guide | Understanding auto-generated REST endpoints, direct REST usage |
| `standards/architecture/supabase-multi-tenant-auth.md` | Multi-tenancy auth guide | Implementing multi-tenant authentication, tenant context management |
| `standards/architecture/supabase-database-functions.md` | Database functions guide | When to use DB functions vs Edge Functions, function patterns |

---

## 3. Decision Tree: Which Module to Use?

### 3.1 Authentication Flow

```
Need user authentication?
├─ Yes → Use `modules/auth-profile-sync/`
│   ├─ Email/password → See `email-verification.md`
│   ├─ OAuth (Google, GitHub) → See `oauth-setup.md`
│   ├─ MFA required → See `mfa-helpers.ts`
│   └─ Need dev user → See `dev-user-setup.md`
└─ No → Skip auth module
```

### 3.2 API Route Creation

```
Creating Next.js API route?
├─ Yes → Use `modules/backend-api/`
│   ├─ Needs auth? → Set `requireAuth: true`
│   ├─ Needs validation? → Provide Zod schema
│   └─ Needs error handling? → Automatic via handler
└─ No → Use Supabase client directly
```

### 3.3 Secrets Management

```
Need to store secrets?
├─ Static, build-time → `.env` file (see `supabase-secrets-management.md`)
├─ Edge Function only → Supabase Project Secrets
├─ User-configurable → `modules/settings-manager/`
└─ Runtime, multi-tenant → `modules/settings-manager/` with encryption
```

### 3.4 Sitemap Generation

```
Need sitemap.xml?
├─ Yes → Use `modules/sitemap-module/`
│   ├─ Database-driven content? → Use triggers + Edge Function
│   ├─ Static content? → Use build-time generation
│   └─ Hybrid? → Use both patterns
└─ No → Skip sitemap module
```

### 3.5 Data API Usage

```
Need to query database?
├─ Simple CRUD? → Use PostgREST Data API (auto-generated)
│   ├─ Create table → REST endpoints exist automatically
│   ├─ Use JavaScript client → `supabase.from('table').select()`
│   └─ Or use direct REST → `GET /rest/v1/table`
├─ Complex logic? → Use custom API routes (`modules/backend-api/`)
└─ See `supabase-data-api.md` for complete guide
```

### 3.6 Multi-Tenancy

```
Building multi-tenant app?
├─ Yes → See `supabase-multi-tenant-auth.md`
│   ├─ Store tenant_id in JWT app_metadata
│   ├─ Use RLS policies for tenant isolation
│   ├─ Create tenant_memberships table
│   └─ Implement tenant switching
└─ No → Skip multi-tenancy patterns
```

### 3.7 Database Functions vs Edge Functions

```
Need server-side logic?
├─ Simple data transformation? → Database Function
│   ├─ Triggers, RLS helpers, validation
│   └─ See `supabase-database-functions.md`
├─ External API calls? → Edge Function
│   ├─ OpenAI, email services, webhooks
│   └─ See `supabase-edge-functions.md`
└─ See `supabase-database-functions.md` for decision tree
```

---

## 4. Integration Patterns

### 4.1 Pattern: Using Auto-Generated Data API

**Use Case:** Simple CRUD operations that don't need custom logic.

**Key Insight:** When you create a table, REST endpoints are automatically available. No need to write custom API routes for basic operations.

**Example:**
```typescript
// Table: posts (created via migration)
// Auto-generated endpoints:
// - GET /rest/v1/posts
// - POST /rest/v1/posts
// - PATCH /rest/v1/posts?id=eq.1
// - DELETE /rest/v1/posts?id=eq.1

// Use via JavaScript client (recommended)
import { createClient } from '@/modules/supabase-core'

const supabase = createClient()

// List posts (uses GET /rest/v1/posts)
const { data: posts } = await supabase.from('posts').select('*')

// Create post (uses POST /rest/v1/posts)
const { data: newPost } = await supabase
  .from('posts')
  .insert({ title: 'New Post', content: '...' })
  .select()
  .single()
```

**When to Use:**
- ✅ Simple CRUD operations
- ✅ Standard filtering/sorting/pagination
- ✅ Relationship queries

**When NOT to Use:**
- ❌ Complex business logic
- ❌ Multi-step operations
- ❌ External API calls

**See:** `standards/architecture/supabase-data-api.md` for complete guide.

### 4.2 Pattern: Authenticated API Route with Database Query

**Use Case:** API route that requires authentication and queries user-specific data.

**Modules Used:**
- `modules/backend-api/` - Handler wrapper
- `modules/auth-profile-sync/` - Auth system (via Supabase SSR)

**Example:**
```typescript
// app/api/posts/route.ts
import { createApiHandler } from '@/modules/backend-api'
import { z } from 'zod'

export const GET = createApiHandler({
  querySchema: z.object({
    limit: z.coerce.number().default(10),
    page: z.coerce.number().default(1),
  }),
  requireAuth: true, // Automatically uses Supabase SSR
  handler: async ({ input, ctx }) => {
    // ctx.auth is guaranteed to exist when requireAuth: true
    // ctx.auth.supabase is an authenticated Supabase client
    // RLS policies automatically apply based on auth.uid()
    
    const { data, error } = await ctx.auth!.supabase
      .from('posts')
      .select('*')
      .eq('user_id', ctx.auth!.user.id) // Explicit filter (RLS also applies)
      .limit(input.limit)
      .offset((input.page - 1) * input.limit)

    if (error) throw error
    return data
  },
})
```

**Key Points:**
- `requireAuth: true` automatically authenticates via Supabase SSR
- `ctx.auth.supabase` is pre-authenticated, RLS policies apply
- No manual JWT parsing or token refresh needed

### 4.2 Pattern: User Sign-Up with Profile Creation

**Use Case:** User signs up, profile is automatically created via database trigger.

**Modules Used:**
- `modules/auth-profile-sync/` - Profile sync trigger

**Example:**
```typescript
// app/api/auth/signup/route.ts
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  const { email, password, full_name } = await request.json()
  
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  )

  // Sign up user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name, // Stored in user_metadata
      },
    },
  })

  if (authError) throw authError

  // Profile is automatically created by trigger in profile-sync.sql
  // No need to manually insert into profiles table
  
  return Response.json({ user: authData.user })
}
```

**Key Points:**
- Database trigger (`handle_new_user`) automatically creates profile
- Profile sync happens server-side, no race conditions
- RLS policies ensure users can only see their own profile

### 4.3 Pattern: Sitemap Auto-Regeneration

**Use Case:** Sitemap regenerates automatically when content changes.

**Modules Used:**
- `modules/sitemap-module/` - Sitemap automation

**Setup Steps:**
1. Apply `migrations/sitemap-schema.sql` to create job queue
2. Create triggers on content tables (see integration guide)
3. Deploy Edge Function `generate-sitemap`
4. Configure Next.js route to serve sitemap (see `nextjs-route-example.ts`)

**Example Trigger:**
```sql
-- Trigger on pages table
CREATE TRIGGER pages_sitemap_trigger
AFTER INSERT OR UPDATE OR DELETE ON pages
FOR EACH ROW
EXECUTE FUNCTION public.pages_sitemap_trigger();
```

**Key Points:**
- Triggers enqueue jobs, Edge Function processes them
- Decoupled design prevents over-triggering
- Sitemap stored in Supabase Storage, served via Next.js

### 4.4 Pattern: Multi-Tenant Query

**Use Case:** Querying data scoped to a specific tenant in a multi-tenant application.

**Modules Used:**
- `modules/supabase-core/` - Client creation
- RLS policies for tenant isolation

**Example:**
```typescript
// app/api/posts/route.ts
import { createApiHandler } from '@/modules/backend-api'
import { getServerUser } from '@/modules/supabase-core'

export const GET = createApiHandler({
  requireAuth: true,
  handler: async ({ ctx }) => {
    const user = ctx.auth!.user
    const tenantId = user.app_metadata?.tenant_id

    if (!tenantId) {
      throw new Error('No tenant context')
    }

    // RLS automatically filters by tenant_id from JWT
    // Explicit filter also added for clarity
    const { data, error } = await ctx.auth!.supabase
      .from('posts')
      .select('*')
      .eq('tenant_id', tenantId) // Explicit (RLS also enforces)
      .eq('status', 'published')

    if (error) throw error
    return data
  },
})
```

**Key Points:**
- Tenant ID comes from JWT `app_metadata.tenant_id`
- RLS policies automatically enforce tenant isolation
- Explicit `tenant_id` filter is good practice (even though RLS handles it)

**See:** `standards/architecture/supabase-multi-tenant-auth.md` for complete multi-tenancy guide.

### 4.5 Pattern: User-Configurable API Keys

**Use Case:** Admin UI for managing third-party API keys.

**Modules Used:**
- `modules/settings-manager/` - Encrypted settings storage

**Example:**
```typescript
// app/api/admin/settings/route.ts
import { SettingsManager } from '@/modules/settings-manager/settings-manager'
import { createApiHandler } from '@/modules/backend-api'
import { z } from 'zod'

export const POST = createApiHandler({
  requireAuth: true,
  bodySchema: z.object({
    key: z.string(),
    value: z.string(),
    isSecret: z.boolean().default(true),
  }),
  handler: async ({ input, ctx }) => {
    // Verify user is admin (using JWT claims from auth-profile-sync)
    const role = ctx.auth!.user.app_metadata?.role
    if (role !== 'admin') {
      throw new Error('Unauthorized')
    }

    // Save encrypted secret
    await SettingsManager.saveSetting({
      key: input.key,
      value: input.value,
      environment: 'production',
      category: 'api_keys',
      isSecret: input.isSecret,
      updatedBy: ctx.auth!.user.email!,
    })

    return { success: true }
  },
})
```

**Key Points:**
- Secrets encrypted at rest (AES-256-GCM)
- Audit trail tracks who changed what
- UI can mask secrets for display

---

## 5. Best Practices

### 5.1 Client Creation

**✅ DO:**
- Use `@supabase/ssr` `createServerClient()` in API routes
- Use `createClient()` from `@supabase/supabase-js` on client-side
- Read environment variables from `process.env.SUPABASE_URL` (not hardcoded)

**❌ DON'T:**
- Use client-side `createClient()` in API routes
- Hardcode Supabase URLs or keys
- Use `SUPABASE_SERVICE_ROLE_KEY` in client-side code

### 5.2 Authentication

**✅ DO:**
- Use `modules/backend-api/` handler with `requireAuth: true`
- Rely on RLS policies for data access control
- Use JWT claims (`app_metadata.role`) for role-based access

**❌ DON'T:**
- Manually parse JWT tokens in API routes
- Duplicate access checks in API layer (RLS handles it)
- Store roles in `profiles` table without syncing to JWT claims

### 5.3 Database Queries

**✅ DO:**
- Let RLS policies handle access control
- Use authenticated Supabase client (RLS applies automatically)
- Use transactions for multi-step operations

**❌ DON'T:**
- Use `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS (unless necessary)
- Query `auth.users` directly from frontend (use `profiles` table)
- Ignore RLS policies (they're your security layer)

### 5.4 Error Handling

**✅ DO:**
- Use `modules/backend-api/` for automatic error handling
- Use `modules/error-handler/` for standardized errors
- Log errors with context (user ID, request URL, etc.)

**❌ DON'T:**
- Expose sensitive error details to clients
- Ignore Supabase errors (they contain useful information)
- Return generic "Internal Server Error" without logging details

### 5.5 Secrets Management

**✅ DO:**
- Use `.env` for static, build-time secrets
- Use `modules/settings-manager/` for user-configurable secrets
- Use Supabase Project Secrets for Edge Function-only secrets
- Encrypt sensitive data at rest

**❌ DON'T:**
- Commit `.env` files to Git
- Store secrets in code
- Use `SUPABASE_SERVICE_ROLE_KEY` in client-side code
- Store encryption keys in the database

---

## 6. Common Patterns & Examples

### 6.1 Pattern: Protected Page with User Profile

```typescript
// app/dashboard/page.tsx
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch profile (RLS ensures user can only see their own)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return <div>Welcome, {profile?.full_name}</div>
}
```

### 6.2 Pattern: File Upload with Validation

```typescript
// app/api/upload/route.ts
import { createApiHandler } from '@/modules/backend-api'
import { z } from 'zod'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export const POST = createApiHandler({
  requireAuth: true,
  handler: async ({ ctx, input }) => {
    const formData = await ctx.request.formData()
    const file = formData.get('file') as File

    // Validate file
    if (!file) {
      throw new Error('File is required')
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('File too large')
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new Error('Invalid file type')
    }

    // Upload to Supabase Storage
    const { data, error } = await ctx.auth!.supabase.storage
      .from('user-uploads')
      .upload(`${ctx.auth!.user.id}/${file.name}`, file, {
        upsert: true,
      })

    if (error) throw error

    return { url: data.path }
  },
})
```

### 6.3 Pattern: Real-time Subscription

```typescript
// app/components/realtime-posts.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export function RealtimePosts() {
  const [posts, setPosts] = useState([])
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    // Initial fetch
    supabase
      .from('posts')
      .select('*')
      .then(({ data }) => setPosts(data || []))

    // Subscribe to changes
    const channel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPosts((prev) => [...prev, payload.new])
          } else if (payload.eventType === 'UPDATE') {
            setPosts((prev) =>
              prev.map((p) => (p.id === payload.new.id ? payload.new : p))
            )
          } else if (payload.eventType === 'DELETE') {
            setPosts((prev) => prev.filter((p) => p.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return <div>{/* Render posts */}</div>
}
```

---

## 7. Troubleshooting

### 7.1 "Authentication required" but user is logged in

**Problem:** API route returns 401 even though user is authenticated.

**Solutions:**
1. Check that `requireAuth: true` is set in handler config
2. Verify Supabase SSR is properly configured (see `supabase-ssr-api-routes.md`)
3. Check that cookies are being sent (browser DevTools → Network)
4. Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set correctly

### 7.2 RLS Policy Not Working

**Problem:** User can't access their own data despite RLS policy.

**Solutions:**
1. Verify RLS is enabled: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
2. Check policy uses `auth.uid()` correctly
3. Ensure using authenticated Supabase client (not service role key)
4. Test policy in Supabase Studio SQL Editor with `SET ROLE authenticated;`

### 7.3 Profile Not Created After Sign-Up

**Problem:** User signs up but `profiles` table has no row.

**Solutions:**
1. Verify `profile-sync.sql` migration was applied
2. Check trigger exists: `SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';`
3. Check trigger function: `SELECT * FROM pg_proc WHERE proname = 'handle_new_user';`
4. Review Supabase logs for trigger errors

### 7.4 Edge Function Not Receiving Secrets

**Problem:** Edge Function can't access environment variables.

**Solutions:**
1. Set secrets via Supabase CLI: `supabase secrets set KEY=value`
2. Or via Dashboard: Project Settings → Edge Functions → Secrets
3. Access in function: `Deno.env.get('KEY')`
4. Restart Edge Function after setting secrets

### 7.5 Port Conflicts with Local Supabase

**Problem:** `supabase start` fails with "port already in use".

**Solutions:**
1. Check if another Supabase project is using the port: `supabase status` in other projects
2. Use `supabase stop` in the conflicting project (NOT `docker stop $(docker ps -q)`)
3. Or change port in `supabase/config.toml`
4. See `supabase-local-setup.md` Section 10 for container isolation rules

---

## 8. Using Auto-Generated Data API

### 8.1 Understanding Auto-Generated Endpoints

**Key Concept:** Every table you create automatically gets REST API endpoints.

**Workflow:**
1. Create table via migration
2. Supabase auto-generates REST endpoints at `/rest/v1/table_name`
3. Use endpoints directly or via JavaScript client
4. No need to write custom API routes for basic CRUD

**Example:**
```typescript
// After creating 'posts' table via migration:
// These endpoints are automatically available:
// GET    /rest/v1/posts          # List posts
// GET    /rest/v1/posts?id=eq.1  # Get single post
// POST   /rest/v1/posts          # Create post
// PATCH  /rest/v1/posts?id=eq.1  # Update post
// DELETE /rest/v1/posts?id=eq.1  # Delete post

// Use via JavaScript client:
const { data } = await supabase.from('posts').select('*')
// This uses: GET /rest/v1/posts?select=*
```

### 8.2 When to Use Data API vs Custom Routes

**Use Data API (PostgREST) for:**
- ✅ Simple CRUD operations
- ✅ Filtering, sorting, pagination
- ✅ Relationship queries (joins)
- ✅ Any operation that maps directly to database queries

**Create Custom API Routes for:**
- ❌ Complex business logic
- ❌ Multi-step operations
- ❌ External API integrations
- ❌ Custom validation beyond database constraints

**See:** `standards/architecture/supabase-data-api.md` for complete guide with query parameters, examples, and best practices.

## 9. Multi-Tenancy Implementation

### 9.1 Quick Start

**For multi-tenant applications:**

1. **Add `tenant_id` to all tenant-scoped tables**
2. **Store active `tenant_id` in JWT `app_metadata`**
3. **Set up RLS policies** using `current_tenant_id()` helper
4. **Create `tenants` and `tenant_memberships` tables**

**Example RLS Policy:**
```sql
CREATE POLICY "Tenant isolation"
ON posts FOR ALL
USING (tenant_id = current_tenant_id())
WITH CHECK (tenant_id = current_tenant_id());
```

**Example: Getting Tenant Context:**
```typescript
const user = await getServerUser(supabase)
const tenantId = user?.app_metadata?.tenant_id
```

### 9.2 Complete Guide

See `standards/architecture/supabase-multi-tenant-auth.md` for:
- Tenant context management
- Auth API patterns (sign up, invite, switch tenant)
- RLS policy examples
- Frontend patterns
- Database schema templates

## 10. Type Generation Workflow

### 8.1 Generate Types from Database Schema

**Using Supabase CLI:**
```bash
# Generate types from local Supabase
supabase gen types typescript --local > types/database.types.ts

# Generate types from remote project
supabase gen types typescript --project-id <project-ref> > types/database.types.ts
```

### 8.2 Using Generated Types

```typescript
import { Database } from '@/types/database.types'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
)

// Now queries are type-safe
const { data } = await supabase
  .from('profiles')
  .select('id, email, full_name')
  // TypeScript knows available columns and types
```

### 8.3 When to Regenerate Types

- After running migrations that change schema
- After adding new tables or columns
- Before deploying to production
- As part of CI/CD pipeline

---

## 11. Testing Strategy

### 9.1 Unit Testing

**Use `modules/testing-module/` for mocking:**
```typescript
import { SupabaseMock } from '@/modules/testing-module'

const mockSupabase = new SupabaseMock()
mockSupabase.from('posts').select('*').mockReturnValue([{ id: '1', title: 'Test' }])
```

### 9.2 Integration Testing

**Test with local Supabase:**
1. Start local Supabase: `supabase start`
2. Run migrations: `supabase migration up`
3. Seed test data: `supabase db seed`
4. Run tests against local instance
5. Clean up: `supabase stop`

### 9.3 RLS Testing

**Test RLS policies:**
```typescript
// Test as authenticated user
const { data: { user } } = await supabase.auth.signInWithPassword({
  email: 'test@example.com',
  password: 'password',
})

// RLS should allow access
const { data } = await supabase.from('profiles').select('*').eq('id', user.id)

// RLS should deny access to other users' profiles
const { data: otherProfile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', 'other-user-id')
  .single()
// Should return null or error
```

---

## 12. Performance Optimization

### 10.1 Query Optimization

**✅ DO:**
- Use `.select()` to limit columns returned
- Use `.limit()` and `.range()` for pagination
- Add indexes on frequently queried columns
- Use `.single()` when expecting one row

**❌ DON'T:**
- Select all columns with `*` when you only need a few
- Fetch all rows when you only need a page
- Query without indexes on WHERE clauses

### 10.2 Caching Strategy

**For frequently accessed, rarely changing data:**
- Cache query results in Redis or in-memory cache
- Invalidate cache on updates
- Use Supabase real-time to invalidate cache on changes

### 10.3 Connection Pooling

**For high-traffic applications:**
- Use Supabase connection pooling (enabled by default)
- Configure pool size based on traffic
- Monitor connection usage in Supabase Dashboard

---

## 13. Security Checklist

Before deploying, verify:

- [ ] RLS is enabled on all tables
- [ ] RLS policies are tested and working
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is never exposed to client
- [ ] Secrets are stored in appropriate location (see `supabase-secrets-management.md`)
- [ ] JWT claims are used for roles (not database queries)
- [ ] File uploads are validated (size, type)
- [ ] User input is sanitized and validated (Zod schemas)
- [ ] Error messages don't expose sensitive information
- [ ] Environment variables are not committed to Git
- [ ] Edge Functions have proper authentication/authorization

---

## 14. Quick Reference

### 12.1 Module Decision Matrix

| Task | Module | Key File |
|------|--------|----------|
| User authentication | `auth-profile-sync` | `profile-sync.sql` |
| API route with auth | `backend-api` | `src/handler.ts` |
| Email verification | `auth-profile-sync` | `email-verification.md` |
| OAuth setup | `auth-profile-sync` | `oauth-setup.md` |
| MFA implementation | `auth-profile-sync` | `mfa-helpers.ts` |
| Sitemap generation | `sitemap-module` | `INTEGRATION_GUIDE.md` |
| Secrets storage | `settings-manager` | `settings-manager.ts` |
| Local Supabase setup | Standards | `supabase-local-setup.md` |
| Auto-generated REST API | Standards | `supabase-data-api.md` |
| Multi-tenant auth | Standards | `supabase-multi-tenant-auth.md` |
| Database functions | Standards | `supabase-database-functions.md` |

### 12.2 Common Commands

```bash
# Local Supabase
supabase start              # Start local Supabase
supabase stop               # Stop local Supabase
supabase status             # Check status and get credentials
supabase migration new <name> # Create new migration
supabase migration up      # Apply pending migrations
supabase db reset          # Reset database (destructive)

# Type Generation
supabase gen types typescript --local > types/database.types.ts

# Edge Functions
supabase functions new <name>  # Create new function
supabase functions serve       # Serve functions locally
supabase functions deploy <name> # Deploy function
```

---

## 15. Additional Resources

### 13.1 Supabase Official Documentation
- **Supabase Documentation:** https://supabase.com/docs
- **PostgREST Documentation:** https://postgrest.org/

### 13.2 Repository Documentation

**Setup & Configuration:**
- **Local Setup:** `standards/architecture/supabase-local-setup.md`
- **Secrets Management:** `standards/architecture/supabase-secrets-management.md`
- **SSR Integration:** `standards/architecture/supabase-ssr-api-routes.md`

**API & Features:**
- **Data API (PostgREST):** `standards/architecture/supabase-data-api.md` - Auto-generated REST endpoints
- **Edge Functions:** `standards/architecture/supabase-edge-functions.md` - When and how to use
- **Database Functions:** `standards/architecture/supabase-database-functions.md` - PostgreSQL functions vs Edge Functions

**Advanced Topics:**
- **Multi-Tenancy Auth:** `standards/architecture/supabase-multi-tenant-auth.md` - Multi-tenant authentication patterns
- **Auth Best Practices:** `modules/auth-profile-sync/supabase-auth-best-practices.md`

### 13.3 Key Workflows for AI Agents

**Creating Database Schema:**
1. Create table via migration
2. **REST endpoints are automatically generated** (`/rest/v1/table_name`)
3. Set up RLS policies
4. Use endpoints directly or via JavaScript client
5. See `supabase-data-api.md` for details

**Implementing Multi-Tenancy:**
1. Add `tenant_id` to all tenant-scoped tables
2. Create `tenants` and `tenant_memberships` tables
3. Store active `tenant_id` in JWT `app_metadata`
4. Set up RLS policies using `current_tenant_id()` helper
5. See `supabase-multi-tenant-auth.md` for complete guide

**Choosing Server-Side Logic:**
1. Simple data transformation? → Database Function
2. External API calls? → Edge Function
3. See `supabase-database-functions.md` for decision tree

---

*Last Updated: 2025-01-27*


