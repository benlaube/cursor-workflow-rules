# Enhanced Features Guide

## Overview

The `supabase-core-typescript` module now includes enhanced features for robust integration with automatic error handling, logging, and monitoring.

## Features

### 1. Automatic Error Handling

All operations can be wrapped in Result types for safe error handling:

```typescript
import { safeQuery, safeMutation, safeStorage, safeAuth } from '@/modules/supabase-core-typescript'

// Query with automatic error handling
const result = await safeQuery(() => supabase.from('posts').select('*'))
if (!result.ok) {
  console.error('Query failed:', result.error.message)
  return
}
console.log('Posts:', result.value)

// Mutation with automatic error handling
const createResult = await safeMutation(() =>
  supabase.from('posts').insert({ title: 'New Post' })
)
if (!createResult.ok) {
  if (createResult.error.code === '23505') {
    console.log('Duplicate entry')
  }
  return
}
```

### 2. Enhanced Client with Automatic Logging

Create an enhanced client that automatically logs all operations:

```typescript
import { createEnhancedClient, createClient } from '@/modules/supabase-core-typescript'
import { Logger } from '@/modules/logger-module'

const logger = new Logger({ env: 'production', serviceName: 'my-app' })
const baseClient = createClient()
const enhanced = createEnhancedClient({
  client: baseClient,
  logger,
  autoErrorHandling: true,
  autoLogging: true,
  enableMetrics: true,
})

// All operations are automatically logged
const { data } = await enhanced.getClient().from('posts').select('*')

// Get performance metrics
const metrics = enhanced.getMetrics()
console.log('Average query time:', metrics.select?.avgDuration)
```

### 3. Operation Interceptors

Add custom interceptors for logging, monitoring, or custom logic:

```typescript
import { OperationInterceptor, createClient } from '@/modules/supabase-core-typescript'

const interceptor = new OperationInterceptor()

// Add custom logging
interceptor.addInterceptor(async (ctx, op) => {
  console.log(`Starting ${ctx.operation} on ${ctx.resource}`)
  const result = await op()
  console.log(`Completed ${ctx.operation}`)
  return result
})

// Use in operations
const result = await interceptor.execute(
  { operation: 'select', resource: 'posts' },
  () => supabase.from('posts').select('*')
)
```

### 4. Health Checks

Monitor Supabase service health:

```typescript
import { checkSupabaseHealth, createClient } from '@/modules/supabase-core-typescript'

const supabase = createClient()
const health = await checkSupabaseHealth(supabase, {
  checkDatabase: true,
  checkAuth: true,
  checkStorage: true,
  timeout: 5000,
})

if (!health.ok) {
  console.error('Supabase is unhealthy:', health.error.message)
  // Trigger alerts, fallback logic, etc.
  return
}

console.log('Supabase is healthy:', health.value.responseTime, 'ms')
```

### 5. Safe Client Wrapper

Create a safe wrapper that returns Result types for all operations:

```typescript
import { createSafeClient, createClient } from '@/modules/supabase-core-typescript'

const supabase = createClient()
const safeSupabase = createSafeClient(supabase)

// All operations return Result types
const result = await safeSupabase.query(() =>
  supabase.from('posts').select('*')
)

if (!result.ok) {
  // Handle error
  return
}

// Use result.value safely
console.log('Posts:', result.value)
```

## Integration with Error Handler Module

The enhanced features integrate seamlessly with `@modules/error-handler`:

```typescript
import { safeQuery } from '@/modules/supabase-core-typescript'
import { AppError } from '@/modules/error-handler'

const result = await safeQuery(() => supabase.from('posts').select('*'))

if (!result.ok) {
  // result.error is an AppError instance
  if (result.error.code === 'USER_NOT_FOUND') {
    // Handle specific error
  }
  throw result.error // Or handle gracefully
}
```

## Integration with Logger Module

Automatic logging when using enhanced client:

```typescript
import { createEnhancedClient, createClient } from '@/modules/supabase-core-typescript'
import { Logger } from '@/modules/logger-module'

const logger = new Logger({
  env: process.env.NODE_ENV,
  serviceName: 'my-app',
  persistLog: async (logEntry) => {
    // Send to your logging service
    await fetch('https://logs.example.com', {
      method: 'POST',
      body: JSON.stringify(logEntry),
    })
  },
})

const enhanced = createEnhancedClient({
  client: createClient(),
  logger,
  autoLogging: true,
})

// All operations are automatically logged with:
// - Operation name
// - Resource name
// - Duration
// - Success/failure status
// - Error details (if failed)
```

## Performance Monitoring

Enable metrics collection to track operation performance:

```typescript
import { createEnhancedClient, createClient } from '@/modules/supabase-core-typescript'

const enhanced = createEnhancedClient({
  client: createClient(),
  enableMetrics: true,
})

// Perform operations
await enhanced.getClient().from('posts').select('*')
await enhanced.getClient().from('users').select('*')

// Get metrics
const metrics = enhanced.getMetrics()
console.log(metrics)
// {
//   select: {
//     count: 2,
//     avgDuration: 45.5,
//     errorRate: 0
//   }
// }
```

## Best Practices

1. **Use Safe Operations for Critical Code:**
   ```typescript
   // ✅ Good: Safe error handling
   const result = await safeQuery(() => supabase.from('posts').select('*'))
   if (!result.ok) {
     // Handle error
     return
   }
   ```

2. **Use Enhanced Client for Automatic Logging:**
   ```typescript
   // ✅ Good: Automatic logging and monitoring
   const enhanced = createEnhancedClient({
     client: createClient(),
     logger: myLogger,
     autoLogging: true,
     enableMetrics: true,
   })
   ```

3. **Monitor Health in Production:**
   ```typescript
   // ✅ Good: Health checks in production
   setInterval(async () => {
     const health = await checkSupabaseHealth(supabase)
     if (!health.ok) {
       // Alert monitoring system
     }
   }, 60000) // Every minute
   ```

4. **Use Interceptors for Custom Logic:**
   ```typescript
   // ✅ Good: Custom interceptors for specific needs
   interceptor.addInterceptor(async (ctx, op) => {
     // Add custom logic (rate limiting, caching, etc.)
     return op()
   })
   ```

---

*Last Updated: 2025-01-27*

