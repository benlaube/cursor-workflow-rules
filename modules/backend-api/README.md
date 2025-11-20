# Backend API Module

Standardized API handler wrapper for Next.js with Supabase SSR integration, automatic error handling, input validation, and standardized responses.

## Features

- ✅ **Supabase SSR Integration** - Automatic JWT handling via `@supabase/ssr`
- ✅ **Input Validation** - Zod schema validation for body and query params
- ✅ **Authentication** - Built-in auth middleware using Supabase
- ✅ **Error Handling** - Automatic try/catch with standardized error responses
- ✅ **Type Safety** - Full TypeScript support with inferred types
- ✅ **Standardized Responses** - Consistent `{ data, error, meta }` format

## Dependencies

- `@supabase/ssr` - Server-side Supabase client helpers
- `@supabase/supabase-js` - Supabase client library
- `zod` - Schema validation
- `next` - Next.js framework

## Installation

Copy this module to your project:

```bash
cp -r modules/backend-api /path/to/your/project/lib/backend-api
```

Install dependencies:

```bash
npm install @supabase/ssr @supabase/supabase-js zod
```

## Usage

### Basic GET Handler

```typescript
// app/api/posts/route.ts
import { createApiHandler } from '@/lib/backend-api'
import { z } from 'zod'

export const GET = createApiHandler({
  querySchema: z.object({
    limit: z.coerce.number().default(10),
    page: z.coerce.number().default(1),
  }),
  requireAuth: true,
  handler: async ({ input, ctx }) => {
    // ctx.auth is guaranteed to exist when requireAuth: true
    const { data } = await ctx.auth!.supabase
      .from('posts')
      .select('*')
      .limit(input.limit)
      .offset((input.page - 1) * input.limit)

    return data
  },
})
```

### POST Handler with Body Validation

```typescript
// app/api/posts/route.ts
import { createApiHandler } from '@/lib/backend-api'
import { z } from 'zod'

export const POST = createApiHandler({
  bodySchema: z.object({
    title: z.string().min(1),
    content: z.string().min(1),
  }),
  requireAuth: true,
  handler: async ({ input, ctx }) => {
    const { data, error } = await ctx.auth!.supabase
      .from('posts')
      .insert({
        title: input.title,
        content: input.content,
        user_id: ctx.auth!.user.id,
      })
      .select()
      .single()

    if (error) throw error

    return data
  },
})
```

### Optional Authentication

```typescript
export const GET = createApiHandler({
  requireAuth: false, // Optional auth
  handler: async ({ ctx }) => {
    // ctx.auth may be null
    if (ctx.auth) {
      // User is authenticated
      return { message: `Hello ${ctx.auth.user.email}` }
    }
    // Public endpoint
    return { message: 'Hello guest' }
  },
})
```

## How Supabase SSR Simplifies This

The module leverages Supabase's `@supabase/ssr` package which:

1. **Automatic JWT Extraction** - No manual cookie/header parsing
2. **Token Verification** - Built-in JWT signature verification
3. **Token Refresh** - Automatic refresh token handling
4. **RLS Integration** - Database-level security reduces API code

**Without Supabase SSR**, you'd need ~50+ lines of JWT handling code.  
**With Supabase SSR**, it's handled in ~3 lines via `authenticateRequest()`.

See `standards/architecture/supabase-ssr-api-routes.md` for detailed explanation.

## Response Format

All responses follow a standard format:

**Success:**
```json
{
  "data": { ... },
  "meta": {
    "timestamp": "2025-01-27T12:00:00Z",
    "duration": "45ms"
  }
}
```

**Error:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [ ... ]
  },
  "meta": {
    "timestamp": "2025-01-27T12:00:00Z"
  }
}
```

## Integration with RLS

Because Supabase SSR handles authentication, you can rely on Row Level Security (RLS) for data access:

```typescript
// RLS policies automatically filter based on auth.uid()
const { data } = await ctx.auth.supabase
  .from('posts')
  .select('*')
  // No need for: .eq('user_id', ctx.auth.user.id)
  // RLS handles this automatically
```

This means:
- Less code in API handlers
- Security enforced at database level
- Consistent access control

## Error Handling

Errors are automatically caught and formatted:

```typescript
handler: async ({ input, ctx }) => {
  // Any thrown error is automatically caught
  // and converted to standardized error response
  if (!someCondition) {
    throw new Error('Something went wrong')
  }
  // Or use AppError from error-handler module
  throw new AppError('Not found', 'NOT_FOUND', 404)
}
```

## Related Documentation

- `standards/architecture/supabase-ssr-api-routes.md` - How Supabase SSR works
- `standards/architecture/backend-module-plan.md` - Original module plan
- `standards/security/access-control.md` - RLS and security standards

