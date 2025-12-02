# Multi_Tenancy_Auth_API_Guide_v1.0

## Metadata
- **Created:** 2025-01-27
- **Last Updated:** 2025-01-27
- **Version:** 1.0
- **Description:** Comprehensive guide for implementing multi-tenant authentication with Supabase

---

## 1. Overview

This guide explains how to implement multi-tenant authentication using Supabase, including tenant context management, RLS policies, and auth API patterns.

### 1.1 Multi-Tenancy Concepts

**Tenant:** An isolated organization/workspace within your application (e.g., a company, team, or organization).

**Tenant Isolation:** Each tenant's data must be completely isolated from other tenants.

**Tenant Context:** The current tenant a user is operating within (users can belong to multiple tenants).

---

## 2. Architecture Patterns

### 2.1 Pattern 1: Tenant in JWT Claims (Recommended)

Store `tenant_id` in `app_metadata` so it's available in every JWT token.

**Benefits:**
- ✅ Tenant context available in every request
- ✅ RLS policies can use JWT claims directly
- ✅ No additional database queries needed
- ✅ Secure (can't be modified by user)

**Implementation:**

```typescript
// When user joins/creates tenant
import { createServiceRoleClient } from '@/modules/supabase-core-typescript'

const adminSupabase = createServiceRoleClient()

await adminSupabase.auth.admin.updateUserById(userId, {
  app_metadata: {
    tenant_id: tenantId,        // Current active tenant
    role: 'member',             // Tenant-specific role
    available_tenants: [        // All tenants user belongs to
      { id: tenantId, role: 'member' },
      { id: otherTenantId, role: 'admin' },
    ],
  },
})
```

**Accessing in Code:**

```typescript
// Get tenant from JWT
const getCurrentTenant = (user: User) => {
  return user.app_metadata?.tenant_id as string | undefined
}

// Get tenant role
const getTenantRole = (user: User) => {
  return user.app_metadata?.role as string | undefined
}
```

### 2.2 Pattern 2: Tenant Membership Table

Store tenant memberships in a separate table for more complex scenarios.

**When to Use:**
- Users belong to many tenants
- Need tenant-specific roles/permissions
- Need to track tenant membership history
- Need tenant metadata (joined date, status, etc.)

**Schema:**

```sql
-- Tenant membership table
CREATE TABLE tenant_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'member'
  status text NOT NULL DEFAULT 'active', -- 'active', 'invited', 'suspended'
  joined_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, tenant_id)
);

-- Index for lookups
CREATE INDEX idx_tenant_memberships_user_id ON tenant_memberships(user_id);
CREATE INDEX idx_tenant_memberships_tenant_id ON tenant_memberships(tenant_id);

-- RLS: Users can see their own memberships
ALTER TABLE tenant_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own memberships"
ON tenant_memberships FOR SELECT
USING (user_id = auth.uid());
```

### 2.3 Pattern 3: Hybrid Approach (Recommended for Complex Apps)

Combine JWT claims (for active tenant) with membership table (for all tenants).

**Benefits:**
- JWT provides fast access to current tenant
- Membership table provides full tenant list and history
- Best of both worlds

---

## 3. Tenant Context Management

### 3.1 Getting Current Tenant

```typescript
import { createServerClient, getServerUser } from '@/modules/supabase-core-typescript'

// In API route or Server Component
const supabase = await createServerClient()
const user = await getServerUser(supabase)

if (!user) {
  throw new Error('Unauthorized')
}

// Get tenant from JWT claims
const tenantId = user.app_metadata?.tenant_id as string | undefined

if (!tenantId) {
  throw new Error('No tenant context')
}
```

### 3.2 Setting Tenant Context

```typescript
// When user switches tenants
import { createServiceRoleClient } from '@/modules/supabase-core-typescript'

const adminSupabase = createServiceRoleClient()

async function switchTenant(userId: string, newTenantId: string) {
  // Verify user has access to this tenant
  const { data: membership } = await adminSupabase
    .from('tenant_memberships')
    .select('role')
    .eq('user_id', userId)
    .eq('tenant_id', newTenantId)
    .single()

  if (!membership) {
    throw new Error('User does not have access to this tenant')
  }

  // Update JWT claims with new tenant
  await adminSupabase.auth.admin.updateUserById(userId, {
    app_metadata: {
      tenant_id: newTenantId,
      role: membership.role,
    },
  })

  // User must refresh their session to get new JWT
  // Frontend should call: await supabase.auth.refreshSession()
}
```

### 3.3 Querying with Tenant Context

```typescript
// Helper function for tenant-scoped queries
async function queryWithTenant<T>(
  supabase: SupabaseClient<Database>,
  table: string,
  query: (query: any) => any
) {
  const user = await getServerUser(supabase)
  const tenantId = user?.app_metadata?.tenant_id

  if (!tenantId) {
    throw new Error('No tenant context')
  }

  // Explicit tenant filter (RLS also enforces this)
  return query(supabase.from(table).eq('tenant_id', tenantId))
}

// Usage
const { data: posts } = await queryWithTenant(supabase, 'posts', (q) =>
  q.select('*').eq('status', 'published')
)
```

---

## 4. RLS Policies for Multi-Tenancy

### 4.1 Basic Tenant Isolation Policy

```sql
-- Example: Posts table with tenant_id
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  title text NOT NULL,
  content text,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see posts from their current tenant
CREATE POLICY "Users can only access their tenant's posts"
ON posts FOR SELECT
USING (
  tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid
);

-- Policy: Users can only create posts in their current tenant
CREATE POLICY "Users can only create posts in their tenant"
ON posts FOR INSERT
WITH CHECK (
  tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid
);

-- Policy: Users can only update posts in their current tenant
CREATE POLICY "Users can only update posts in their tenant"
ON posts FOR UPDATE
USING (
  tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid
)
WITH CHECK (
  tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid
);

-- Policy: Users can only delete posts in their current tenant
CREATE POLICY "Users can only delete posts in their tenant"
ON posts FOR DELETE
USING (
  tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid
);
```

### 4.2 Helper Function for RLS

```sql
-- Helper function to get current tenant from JWT
CREATE OR REPLACE FUNCTION current_tenant_id()
RETURNS uuid AS $$
BEGIN
  RETURN (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::uuid;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Use in policies
CREATE POLICY "Users can only access their tenant's posts"
ON posts FOR SELECT
USING (tenant_id = current_tenant_id());
```

### 4.3 Role-Based Tenant Access

```sql
-- Policy: Admins can see all posts in tenant, members see only published
CREATE POLICY "Tenant-scoped post access with roles"
ON posts FOR SELECT
USING (
  tenant_id = current_tenant_id()
  AND (
    -- Admins see all
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR
    -- Members see only published
    status = 'published'
  )
);
```

---

## 5. Auth API Patterns

### 5.1 Sign Up with Tenant Creation

```typescript
// User signs up and creates a new tenant
import { createClient } from '@/modules/supabase-core-typescript'
import { createServiceRoleClient } from '@/modules/supabase-core-typescript'

const supabase = createClient()

// Step 1: User signs up
const { data: authData, error: authError } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      full_name: 'John Doe',
      tenant_name: 'My Company', // For tenant creation
    },
  },
})

if (authError) throw authError

// Step 2: Create tenant (using service role)
const adminSupabase = createServiceRoleClient()
const { data: tenant, error: tenantError } = await adminSupabase
  .from('tenants')
  .insert({
    name: authData.user.user_metadata.tenant_name,
    owner_id: authData.user.id,
  })
  .select()
  .single()

if (tenantError) throw tenantError

// Step 3: Update user with tenant context
await adminSupabase.auth.admin.updateUserById(authData.user.id, {
  app_metadata: {
    tenant_id: tenant.id,
    role: 'owner', // Tenant owner
  },
})

// Step 4: Create tenant membership record
await adminSupabase.from('tenant_memberships').insert({
  user_id: authData.user.id,
  tenant_id: tenant.id,
  role: 'owner',
  status: 'active',
})
```

### 5.2 Invite User to Tenant

```typescript
// Admin invites user to tenant
import { createServiceRoleClient } from '@/modules/supabase-core-typescript'

const adminSupabase = createServiceRoleClient()

async function inviteUserToTenant(
  inviterUserId: string,
  email: string,
  tenantId: string,
  role: 'admin' | 'member' = 'member'
) {
  // Verify inviter has permission (is admin/owner of tenant)
  const { data: inviterMembership } = await adminSupabase
    .from('tenant_memberships')
    .select('role')
    .eq('user_id', inviterUserId)
    .eq('tenant_id', tenantId)
    .single()

  if (!inviterMembership || !['owner', 'admin'].includes(inviterMembership.role)) {
    throw new Error('Insufficient permissions to invite users')
  }

  // Check if user already exists
  const { data: existingUsers } = await adminSupabase.auth.admin.listUsers()
  const existingUser = existingUsers.users.find((u) => u.email === email)

  if (existingUser) {
    // User exists, add to tenant
    await adminSupabase.from('tenant_memberships').insert({
      user_id: existingUser.id,
      tenant_id: tenantId,
      role,
      status: 'active',
    })

    // Send invitation email (custom implementation)
    await sendTenantInvitationEmail(email, tenantId)
  } else {
    // User doesn't exist, invite via Supabase Auth
    const { data: invitedUser, error } = await adminSupabase.auth.admin.inviteUserByEmail(
      email,
      {
        data: {
          tenant_id: tenantId,
          role,
        },
        app_metadata: {
          tenant_id: tenantId,
          role,
        },
      }
    )

    if (error) throw error

    // Create membership record
    await adminSupabase.from('tenant_memberships').insert({
      user_id: invitedUser.user.id,
      tenant_id: tenantId,
      role,
      status: 'invited', // Will change to 'active' when user accepts
    })
  }
}
```

### 5.3 Accept Tenant Invitation

```typescript
// User accepts invitation and sets tenant as active
import { createClient } from '@/modules/supabase-core-typescript'
import { createServiceRoleClient } from '@/modules/supabase-core-typescript'

const supabase = createClient()
const adminSupabase = createServiceRoleClient()

async function acceptTenantInvitation(userId: string, tenantId: string) {
  // Verify invitation exists
  const { data: membership, error: membershipError } = await adminSupabase
    .from('tenant_memberships')
    .select('*')
    .eq('user_id', userId)
    .eq('tenant_id', tenantId)
    .single()

  if (membershipError || !membership) {
    throw new Error('Invitation not found')
  }

  if (membership.status !== 'invited') {
    throw new Error('Invitation already accepted or invalid')
  }

  // Update membership status
  await adminSupabase
    .from('tenant_memberships')
    .update({ status: 'active' })
    .eq('id', membership.id)

  // Set as active tenant in JWT
  await adminSupabase.auth.admin.updateUserById(userId, {
    app_metadata: {
      tenant_id: tenantId,
      role: membership.role,
    },
  })

  // User must refresh session to get new JWT
  await supabase.auth.refreshSession()
}
```

### 5.4 List User's Tenants

```typescript
// Get all tenants a user belongs to
import { createServerClient, getServerUser } from '@/modules/supabase-core-typescript'

const supabase = await createServerClient()
const user = await getServerUser(supabase)

if (!user) throw new Error('Unauthorized')

// Query tenant memberships
const { data: memberships } = await supabase
  .from('tenant_memberships')
  .select('*,tenant:tenants(*)')
  .eq('user_id', user.id)
  .eq('status', 'active')

// Or get from JWT (if stored)
const availableTenants = user.app_metadata?.available_tenants || []
```

### 5.5 Switch Active Tenant

```typescript
// User switches to a different tenant
import { createClient } from '@/modules/supabase-core-typescript'
import { createServiceRoleClient } from '@/modules/supabase-core-typescript'

const supabase = createClient()
const adminSupabase = createServiceRoleClient()

async function switchTenant(userId: string, newTenantId: string) {
  // Verify user has access
  const { data: membership } = await adminSupabase
    .from('tenant_memberships')
    .select('role')
    .eq('user_id', userId)
    .eq('tenant_id', newTenantId)
    .eq('status', 'active')
    .single()

  if (!membership) {
    throw new Error('User does not have access to this tenant')
  }

  // Update JWT claims
  await adminSupabase.auth.admin.updateUserById(userId, {
    app_metadata: {
      tenant_id: newTenantId,
      role: membership.role,
    },
  })

  // Frontend must refresh session
  // await supabase.auth.refreshSession()
}
```

---

## 6. Database Schema for Multi-Tenancy

### 6.1 Tenants Table

```sql
CREATE TABLE tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL, -- URL-friendly identifier
  owner_id uuid NOT NULL REFERENCES auth.users(id),
  plan text DEFAULT 'free', -- 'free', 'pro', 'enterprise'
  status text DEFAULT 'active', -- 'active', 'suspended', 'cancelled'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE tenants IS 'Organizations/workspaces in the application';
COMMENT ON COLUMN tenants.owner_id IS 'User who created/owns this tenant';
COMMENT ON COLUMN tenants.plan IS 'Subscription plan for billing';
```

### 6.2 Tenant Memberships Table

```sql
CREATE TABLE tenant_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'member'
  status text NOT NULL DEFAULT 'active', -- 'active', 'invited', 'suspended'
  joined_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, tenant_id)
);

COMMENT ON TABLE tenant_memberships IS 'Many-to-many relationship between users and tenants';
COMMENT ON COLUMN tenant_memberships.role IS 'User role within this specific tenant';
COMMENT ON COLUMN tenant_memberships.status IS 'Membership status';

-- Indexes
CREATE INDEX idx_tenant_memberships_user_id ON tenant_memberships(user_id);
CREATE INDEX idx_tenant_memberships_tenant_id ON tenant_memberships(tenant_id);

-- RLS
ALTER TABLE tenant_memberships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own memberships"
ON tenant_memberships FOR SELECT
USING (user_id = auth.uid());
```

### 6.3 Tenant-Scoped Tables

Every tenant-scoped table must include `tenant_id`:

```sql
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE posts IS 'Blog posts, scoped to tenants';
COMMENT ON COLUMN posts.tenant_id IS 'Tenant that owns this post';

-- Index for tenant-scoped queries
CREATE INDEX idx_posts_tenant_id ON posts(tenant_id);
CREATE INDEX idx_posts_tenant_id_created_at ON posts(tenant_id, created_at);

-- RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their tenant's posts"
ON posts FOR ALL
USING (tenant_id = current_tenant_id())
WITH CHECK (tenant_id = current_tenant_id());
```

---

## 7. API Route Examples

### 7.1 Tenant-Scoped Query

```typescript
// app/api/posts/route.ts
import { createApiHandler } from '@/modules/backend-api'
import { z } from 'zod'

export const GET = createApiHandler({
  requireAuth: true,
  querySchema: z.object({
    limit: z.coerce.number().default(10),
    page: z.coerce.number().default(1),
  }),
  handler: async ({ input, ctx }) => {
    // Tenant context is automatically available from JWT
    // RLS policies ensure only tenant's posts are returned
    
    const { data, error } = await ctx.auth!.supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(input.limit)
      .offset((input.page - 1) * input.limit)

    if (error) throw error
    return data
  },
})
```

### 7.2 Create Tenant-Scoped Resource

```typescript
// app/api/posts/route.ts
export const POST = createApiHandler({
  requireAuth: true,
  bodySchema: z.object({
    title: z.string(),
    content: z.string(),
  }),
  handler: async ({ input, ctx }) => {
    const user = ctx.auth!.user
    const tenantId = user.app_metadata?.tenant_id

    if (!tenantId) {
      throw new Error('No tenant context')
    }

    // Tenant ID is automatically set (RLS enforces it)
    const { data, error } = await ctx.auth!.supabase
      .from('posts')
      .insert({
        ...input,
        tenant_id: tenantId, // Explicit (RLS also validates)
        user_id: user.id,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },
})
```

---

## 8. Frontend Patterns

### 8.1 Tenant Selector Component

```typescript
// components/tenant-selector.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/modules/supabase-core-typescript'

export function TenantSelector() {
  const [tenants, setTenants] = useState([])
  const [currentTenant, setCurrentTenant] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    loadTenants()
  }, [])

  async function loadTenants() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get all tenant memberships
    const { data } = await supabase
      .from('tenant_memberships')
      .select('*,tenant:tenants(*)')
      .eq('user_id', user.id)
      .eq('status', 'active')

    setTenants(data || [])
    setCurrentTenant(user.app_metadata?.tenant_id)
  }

  async function switchTenant(tenantId: string) {
    // Call API to switch tenant
    const response = await fetch('/api/tenant/switch', {
      method: 'POST',
      body: JSON.stringify({ tenant_id: tenantId }),
    })

    if (response.ok) {
      // Refresh session to get new JWT
      await supabase.auth.refreshSession()
      window.location.reload()
    }
  }

  return (
    <select
      value={currentTenant || ''}
      onChange={(e) => switchTenant(e.target.value)}
    >
      {tenants.map((membership) => (
        <option key={membership.tenant_id} value={membership.tenant_id}>
          {membership.tenant.name}
        </option>
      ))}
    </select>
  )
}
```

---

## 9. Best Practices

### 9.1 ✅ DO

- ✅ Store `tenant_id` in JWT `app_metadata` for fast access
- ✅ Use RLS policies for tenant isolation (database-level security)
- ✅ Always include `tenant_id` in tenant-scoped tables
- ✅ Use composite indexes on `(tenant_id, other_column)`
- ✅ Verify tenant access before operations
- ✅ Use helper function `current_tenant_id()` in RLS policies

### 9.2 ❌ DON'T

- ❌ Don't rely only on application-level filtering (use RLS)
- ❌ Don't allow users to modify `tenant_id` in requests
- ❌ Don't store tenant_id only in public tables (use JWT claims)
- ❌ Don't forget to index `tenant_id` columns
- ❌ Don't use `service_role` key in client-side code

---

## 10. AI Agent Instructions

### 10.1 When Implementing Multi-Tenancy

1. **Add `tenant_id` to all tenant-scoped tables**
2. **Create `tenants` table** for tenant metadata
3. **Create `tenant_memberships` table** for user-tenant relationships
4. **Set up RLS policies** using `current_tenant_id()` helper
5. **Store active `tenant_id` in JWT `app_metadata`**
6. **Create indexes** on `tenant_id` columns

### 10.2 When Creating Auth Flows

- **Sign Up:** Create tenant, set tenant_id in JWT
- **Invite:** Add to tenant_memberships, update JWT if needed
- **Switch Tenant:** Update JWT app_metadata, refresh session
- **Query:** RLS automatically filters by tenant_id from JWT

### 10.3 RLS Policy Template

```sql
-- Template for tenant-scoped table
CREATE POLICY "Tenant isolation policy"
ON <table_name> FOR ALL
USING (tenant_id = current_tenant_id())
WITH CHECK (tenant_id = current_tenant_id());
```

---

## 11. Related Documentation

- `standards/database/schema.md` - Multi-tenancy schema patterns
- `standards/security/access-control.md` - RLS standards
- `modules/auth-profile-sync/` - Auth system
- `standards/architecture/supabase-ai-agent-guide.md` - General Supabase guide

---

*Last Updated: 2025-01-27*

