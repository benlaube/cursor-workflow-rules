# Supabase Core Module

## Metadata
- **Module:** supabase-core-typescript
- **Version:** 1.0.0
- **Created:** 2025-01-27
- **Description:** Unified Supabase utilities module providing client factories, query builders, storage helpers, and real-time management

## Purpose

This module provides a comprehensive set of utilities for working with Supabase, including:

- **Client Factories** - Automatic environment detection (local vs production)
- **Query Builders** - Fluent API for common query patterns
- **Database Utilities** - Pagination, transactions, RLS helpers
- **Storage Helpers** - File upload/download with validation and image processing
- **Real-time Management** - Subscription lifecycle management
- **Error Handling** - Normalized error handling and retry logic
- **Caching** - Query result caching utilities

## Dependencies

- `@supabase/ssr` - Server-side Supabase client helpers
- `@supabase/supabase-js` - Supabase client library
- `next` (peer dependency) - For server-side utilities

## Installation

Copy this module to your project:

```bash
cp -r modules/supabase-core-typescript /path/to/your/project/lib/supabase-core
```

Install dependencies:

```bash
npm install @supabase/ssr @supabase/supabase-js
```

## Usage

### Client Creation

#### Basic Client (Client-Side)

```typescript
import { createClient } from '@/lib/supabase-core-typescript'

// Automatically detects local vs production environment
const supabase = createClient()

// Use in your components
const { data } = await supabase.from('posts').select('*')
```

#### Server-Side Client (API Routes, Server Components)

```typescript
import { createServerClient } from '@/lib/supabase-core-typescript'

// In API route or Server Component
export async function GET() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }
  
  // User is authenticated, RLS policies apply
  const { data } = await supabase.from('posts').select('*')
  return Response.json({ data })
}
```

#### Service Role Client (Server-Side Only)

```typescript
import { createServiceRoleClient } from '@/lib/supabase-core-typescript'

// WARNING: Only use in API routes or Edge Functions
// Bypasses RLS - use with caution!
const adminSupabase = createServiceRoleClient()
const { data } = await adminSupabase.from('users').select('*')
```

### Query Builder

```typescript
import { queryBuilder } from '@/lib/supabase-core-typescript'

const { data, error } = await queryBuilder(supabase, 'posts')
  .where('published', true)
  .orderBy('created_at', 'desc')
  .limit(10)
  .execute()
```

### Pagination

```typescript
import { paginate, parsePaginationParams } from '@/lib/supabase-core-typescript'

// From URL query params
const params = parsePaginationParams(searchParams, { page: 1, limit: 10 })

// Paginated query
const result = await paginate(
  supabase.from('posts').select('*').eq('published', true),
  params
)

// Returns: { data, total, page, limit, totalPages, hasNext, hasPrev }
```

### File Upload

```typescript
import { uploadFile } from '@/lib/supabase-core-typescript'

const result = await uploadFile(supabase, {
  bucket: 'user-uploads',
  path: 'avatars/user-123.jpg',
  file: file,
  contentType: 'image/jpeg',
}, {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png'],
})

// Returns: { path, publicUrl, signedUrl }
```

### Real-time Subscriptions

```typescript
import { createSubscriptionManager } from '@/lib/supabase-core-typescript'

const manager = createSubscriptionManager(supabase)

manager.subscribe({
  channel: 'posts-changes',
  table: 'posts',
  onInsert: (payload) => console.log('New post:', payload.new),
  onUpdate: (payload) => console.log('Updated post:', payload.new),
  onDelete: (payload) => console.log('Deleted post:', payload.old),
})

// Cleanup when done
manager.cleanup()
```

### Error Handling

```typescript
import { normalizeError, getUserFriendlyMessage, SUPABASE_ERROR_CODES } from '@/lib/supabase-core-typescript'

const { data, error } = await supabase.from('posts').insert({ title: 'New Post' })

if (error) {
  const normalized = normalizeError(error)
  
  if (normalized.code === SUPABASE_ERROR_CODES.UNIQUE_VIOLATION) {
    console.log('Duplicate entry')
  }
  
  const message = getUserFriendlyMessage(error)
  // Returns user-friendly message instead of technical error
}
```

### Retry Logic

```typescript
import { retryOperation } from '@/lib/supabase-core-typescript'

const { data, error } = await retryOperation(
  () => supabase.from('posts').select('*'),
  { maxRetries: 3, delayMs: 1000 }
)
```

### Caching

```typescript
import { globalCache, createCacheKey } from '@/lib/supabase-core-typescript'

const key = createCacheKey('posts', { published: true, limit: 10 })

// Check cache first
let data = globalCache.get(key)
if (!data) {
  const { data: freshData } = await supabase.from('posts').select('*').eq('published', true)
  data = freshData
  globalCache.set(key, data, 300) // Cache for 5 minutes
}
```

## Type Generation

Generate TypeScript types from your Supabase database schema:

```bash
# From local Supabase
supabase gen types typescript --local > types/database-types.ts

# From remote project
supabase gen types typescript --project-id <project-ref> > types/database-types.ts
```

Then use the generated types:

```typescript
import { Database } from '@/types/database-types'
import { createClient } from '@/lib/supabase-core-typescript'

const supabase = createClient<Database>()
// Now all queries are type-safe!
```

See `src/types/generate-types.ts` for detailed instructions.

## Features

### Core Features
- ✅ **Automatic Environment Detection** - Local vs production
- ✅ **Type-Safe Queries** - Full TypeScript support
- ✅ **Query Builder** - Fluent API for common patterns
- ✅ **Pagination** - Built-in pagination helpers
- ✅ **File Upload/Download** - With validation and image processing
- ✅ **Real-time Management** - Subscription lifecycle
- ✅ **Error Normalization** - Consistent error handling
- ✅ **Retry Logic** - Automatic retry for transient errors
- ✅ **Caching** - Query result caching
- ✅ **RLS Helpers** - Testing and management utilities

### Enhanced Features (NEW)
- ✅ **Automatic Error Handling** - Result-pattern wrappers for all operations
- ✅ **Automatic Logging** - Structured logging for all operations
- ✅ **Performance Monitoring** - Metrics collection and tracking
- ✅ **Health Checks** - Service health monitoring
- ✅ **Operation Interceptors** - Middleware-like functionality
- ✅ **Enhanced Client** - All-in-one client with logging and error handling
- ✅ **Safe Operations** - Type-safe error handling with Result types

See `ENHANCED_FEATURES.md` for detailed documentation on enhanced features.

## Enhanced Features

For robust integration with automatic error handling and logging, see:
- `ENHANCED_FEATURES.md` - Complete guide to enhanced features
- Enhanced client with automatic logging
- Safe operations with Result types
- Health checks and monitoring
- Operation interceptors

## Related Documentation

- `standards/architecture/supabase-local-setup.md` - Supabase setup guide
- `standards/architecture/supabase-ai-agent-guide.md` - Comprehensive AI Agent guide
- `standards/architecture/supabase-ssr-api-routes.md` - SSR integration guide
- `modules/backend-api/` - API handler module (uses supabase-core-typescript)
- `modules/auth-profile-sync/` - Auth module (uses supabase-core-typescript)
- `modules/error-handler/` - Error handling module (integrated with supabase-core-typescript)
- `modules/logger-module/` - Logging module (integrated with supabase-core-typescript)

## Integration with Other Modules

This module is designed to be used by other Supabase-related modules:

- `modules/backend-api/` - Uses `createServerClient` for authentication
- `modules/auth-profile-sync/` - Uses client factories and RLS helpers
- `modules/sitemap-module/` - Uses storage helpers for file uploads

## Best Practices

1. **Always use `createServerClient` in API routes** - Never use client-side `createClient` in server code
2. **Use query builder for complex queries** - Improves readability and type safety
3. **Validate files before upload** - Use `validateFile` or pass validation options to `uploadFile`
4. **Clean up subscriptions** - Always call `manager.cleanup()` when done
5. **Handle errors consistently** - Use `normalizeError` and `getUserFriendlyMessage`
6. **Cache frequently accessed data** - Use `globalCache` for query results
7. **Regenerate types after schema changes** - Keep types in sync with database

---

*Last Updated: 2025-01-27*

