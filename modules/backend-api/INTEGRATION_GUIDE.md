# Backend API Module Integration Guide

Complete guide for integrating the Backend API Module into your Next.js project.

## Quick Start

### 1. Copy Module Files

Copy the entire `modules/backend-api/` directory to your project:

```bash
# Option 1: Copy to lib directory
cp -r modules/backend-api lib/backend-api

# Option 2: Copy to src directory
cp -r modules/backend-api src/lib/backend-api
```

### 2. Install Dependencies

```bash
npm install @supabase/ssr @supabase/supabase-js zod
```

### 3. Update Imports

Update import paths in `src/handler.ts` and `src/middleware/auth.ts` to match your project structure:

```typescript
// If you have a different Supabase client setup, adjust imports
// The module assumes standard Next.js + Supabase setup
```

### 4. Environment Variables

Ensure these are set in `.env.local`:

```bash
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
```

### 5. Create Your First Handler

```typescript
// app/api/example/route.ts
import { createApiHandler } from '@/lib/backend-api'
import { z } from 'zod'

export const GET = createApiHandler({
  querySchema: z.object({ name: z.string().optional() }),
  requireAuth: false,
  handler: async ({ input }) => {
    return { message: `Hello ${input.name || 'World'}` }
  },
})
```

## Advanced Usage

### Custom Error Handling

```typescript
import { AppError } from '@/lib/error-handler'

export const GET = createApiHandler({
  handler: async ({ ctx }) => {
    if (!ctx.auth) {
      throw new AppError('Unauthorized', 'UNAUTHORIZED', 401)
    }
    // ...
  },
})
```

### Rate Limiting

Add rate limiting middleware (future enhancement):

```typescript
// Currently, rate limiting should be handled at:
// 1. Next.js middleware level
// 2. Supabase Edge Functions
// 3. External service (Upstash, Redis)
```

### Multi-Tenant Support

```typescript
export const GET = createApiHandler({
  requireAuth: true,
  handler: async ({ ctx }) => {
    // Get tenant from user metadata or separate table
    const tenantId = ctx.auth!.user.user_metadata.tenant_id
    
    // Use tenantId in queries (RLS should also enforce this)
    const { data } = await ctx.auth!.supabase
      .from('posts')
      .select('*')
      .eq('tenant_id', tenantId)
    
    return data
  },
})
```

## Testing

### Unit Testing Handlers

```typescript
import { createApiHandler } from '@/lib/backend-api'
import { createMockRequest } from '@/lib/testing'

describe('API Handler', () => {
  it('should validate input', async () => {
    const handler = createApiHandler({
      bodySchema: z.object({ name: z.string() }),
      handler: async ({ input }) => input,
    })

    const request = createMockRequest({
      method: 'POST',
      body: { name: 'Test' },
    })

    const response = await handler(request)
    const data = await response.json()
    
    expect(data.data.name).toBe('Test')
  })
})
```

## Troubleshooting

### "Cannot read property 'getAll' of undefined"

**Issue:** Cookies API not available in the context.

**Solution:** Ensure you're using Next.js 14+ App Router. The `cookies()` function is only available in Server Components and Route Handlers.

### "SUPABASE_URL is not defined"

**Issue:** Environment variables not loaded.

**Solution:** Ensure `.env.local` exists and contains `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

### "User is null" even with valid token

**Issue:** Token might be expired or invalid.

**Solution:** Check that Supabase middleware is refreshing tokens. See `standards/architecture/supabase-local-setup.md` for middleware setup.

## Migration from Manual Handlers

### Before (Manual)

```typescript
export async function GET(request: Request) {
  try {
    // Manual JWT extraction
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Manual validation
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    if (isNaN(limit)) {
      return NextResponse.json({ error: 'Invalid limit' }, { status: 400 })
    }
    
    // Manual Supabase client creation
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    })
    
    // Business logic
    const { data } = await supabase.from('posts').select('*').limit(limit)
    
    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

### After (With Module)

```typescript
export const GET = createApiHandler({
  querySchema: z.object({ limit: z.coerce.number().default(10) }),
  requireAuth: true,
  handler: async ({ input, ctx }) => {
    const { data } = await ctx.auth!.supabase
      .from('posts')
      .select('*')
      .limit(input.limit)
    return data
  },
})
```

**Lines of code:** ~40 vs ~10  
**Complexity:** High vs Low  
**Maintainability:** Manual error handling vs Automatic

---

## Related Documentation

- `README.md` - Module overview and basic usage
- `standards/architecture/supabase-ssr-api-routes.md` - How Supabase SSR works
- `standards/security/access-control.md` - Security best practices

