# Data Structures Reference

## Overview

This document describes the default data structures used throughout the `supabase-core-typescript` module.

## Core Data Structures

### 1. Result Pattern (Error Handling)

The **Result Pattern** is the primary data structure for safe error handling. It's a discriminated union type that forces explicit error checking.

```typescript
type Result<T, E = any> =
  | { ok: true; value: T } // Success case
  | { ok: false; error: E }; // Error case
```

**Usage:**

```typescript
const result = await safeQuery(() => supabase.from('posts').select('*'));

if (!result.ok) {
  // Handle error - result.error contains the error
  console.error(result.error.message);
  return;
}

// Success - result.value contains the data
console.log(result.value);
```

**Properties:**

- `ok: boolean` - Discriminator field (true = success, false = error)
- `value: T` - The successful result data (only present when `ok: true`)
- `error: E` - The error object (only present when `ok: false`)

**Benefits:**

- Type-safe error handling
- Forces explicit error checking
- No try/catch blocks needed
- Prevents accessing data when errors occur

---

### 2. Supabase Native Response Structure

All Supabase operations return this structure by default:

```typescript
{
  data: T | null; // The result data, or null if no data
  error: any | null; // Error object, or null if successful
}
```

**Usage:**

```typescript
const { data, error } = await supabase.from('posts').select('*');

if (error) {
  console.error('Error:', error.message);
  return;
}

console.log('Data:', data);
```

**Note:** The enhanced features wrap this in a `Result` type for safer handling.

---

### 3. OperationContext (Interceptors)

Context object passed to operation interceptors:

```typescript
interface OperationContext {
  operation: string; // Operation name (e.g., 'select', 'insert', 'upload')
  resource?: string; // Table or resource name (e.g., 'posts', 'users')
  metadata?: Record<string, any>; // Additional metadata
  startTime?: number; // Timestamp when operation started (for performance tracking)
}
```

**Usage:**

```typescript
interceptor.addInterceptor(async (ctx, op) => {
  console.log(`Operation: ${ctx.operation} on ${ctx.resource}`);
  const result = await op();
  const duration = Date.now() - (ctx.startTime || 0);
  console.log(`Completed in ${duration}ms`);
  return result;
});
```

---

### 4. HealthCheckResult

Result structure for health check operations:

```typescript
interface HealthCheckResult {
  service: string; // Service name (e.g., 'supabase')
  healthy: boolean; // Whether the service is healthy
  responseTime: number; // Response time in milliseconds
  error?: string; // Error message if unhealthy
  details?: Record<string, any>; // Additional details (e.g., which services were checked)
}
```

**Usage:**

```typescript
const health = await checkSupabaseHealth(supabase);

if (!health.ok) {
  console.error('Unhealthy:', health.error.message);
  return;
}

const result = health.value;
console.log(`Service: ${result.service}`);
console.log(`Healthy: ${result.healthy}`);
console.log(`Response Time: ${result.responseTime}ms`);
console.log(`Details:`, result.details);
```

**Note:** This is wrapped in a `Result` type, so check `health.ok` first.

---

### 5. PaginatedResponse

Structure for paginated query results:

```typescript
interface PaginatedResponse<T> {
  data: T[]; // Data items for current page
  total: number; // Total number of items across all pages
  page: number; // Current page number (1-indexed)
  limit: number; // Items per page
  totalPages: number; // Total number of pages
  hasNext: boolean; // Whether there is a next page
  hasPrev: boolean; // Whether there is a previous page
}
```

**Usage:**

```typescript
const result = await paginate(supabase.from('posts').select('*'), { page: 1, limit: 10 });

console.log(`Page ${result.page} of ${result.totalPages}`);
console.log(`Showing ${result.data.length} of ${result.total} items`);
console.log(`Has next: ${result.hasNext}`);
console.log(`Has previous: ${result.hasPrev}`);
```

---

### 6. PaginationParams

Input parameters for pagination:

```typescript
interface PaginationParams {
  page: number; // Page number (1-indexed)
  limit: number; // Items per page
}
```

**Usage:**

```typescript
const params: PaginationParams = { page: 1, limit: 10 };
const result = await paginate(query, params);
```

---

### 7. UploadResult

Result structure for file upload operations:

```typescript
interface UploadResult {
  path: string; // File path in bucket
  publicUrl?: string; // Full public URL (if bucket is public)
  signedUrl?: string; // Signed URL (for private buckets, valid for 1 hour)
}
```

**Usage:**

```typescript
const result = await uploadFile(supabase, {
  bucket: 'uploads',
  path: 'file.jpg',
  file: file,
});

console.log('Path:', result.path);
console.log('Public URL:', result.publicUrl);
console.log('Signed URL:', result.signedUrl);
```

---

### 8. DownloadResult

Result structure for file download operations:

```typescript
interface DownloadResult {
  data: Blob; // File data as Blob
  contentType: string; // Content type (e.g., 'image/jpeg')
  size: number; // File size in bytes
}
```

**Usage:**

```typescript
const result = await downloadFile(supabase, {
  bucket: 'uploads',
  path: 'file.jpg',
});

console.log('Size:', result.size, 'bytes');
console.log('Type:', result.contentType);
// Use result.data (Blob) as needed
```

---

### 9. Metrics Structure

Performance metrics collected by the enhanced client:

```typescript
Record<
  string,
  {
    count: number; // Number of operations
    avgDuration: number; // Average duration in milliseconds
    errorRate: number; // Error rate (0.0 to 1.0)
  }
>;
```

**Usage:**

```typescript
const metrics = enhanced.getMetrics();

console.log('Select operations:', metrics.select?.count);
console.log('Average duration:', metrics.select?.avgDuration, 'ms');
console.log('Error rate:', (metrics.select?.errorRate || 0) * 100, '%');
```

---

### 10. AppError Structure

Error structure used throughout the module:

```typescript
class AppError extends Error {
  code?: string; // Machine-readable error code (e.g., 'USER_NOT_FOUND')
  statusCode?: number; // HTTP status code (e.g., 404, 500)
  message: string; // Human-readable error message
}
```

**Usage:**

```typescript
const result = await safeQuery(() => supabase.from('posts').select('*'));

if (!result.ok) {
  const error = result.error; // AppError instance
  console.error('Code:', error.code);
  console.error('Status:', error.statusCode);
  console.error('Message:', error.message);
}
```

---

## Data Flow

### Standard Supabase Operation Flow

```
Supabase Operation
  ↓
{ data: T | null, error: any | null }
  ↓
Enhanced Wrapper (optional)
  ↓
Result<T, AppError>
  ↓
Your Code (check result.ok)
```

### Enhanced Client Flow

```
Enhanced Client Operation
  ↓
OperationInterceptor (logging, metrics)
  ↓
Supabase Operation
  ↓
{ data: T | null, error: any | null }
  ↓
Error Normalization
  ↓
Result<T, AppError>
  ↓
Metrics Recording
  ↓
Your Code
```

---

## Common Patterns

### Pattern 1: Safe Query with Result

```typescript
const result = await safeQuery(() => supabase.from('posts').select('*'));

if (!result.ok) {
  // Handle error
  return;
}

// Use result.value (type-safe)
const posts = result.value;
```

### Pattern 2: Direct Supabase Query

```typescript
const { data, error } = await supabase.from('posts').select('*');

if (error) {
  // Handle error
  return;
}

// Use data (may be null)
if (data) {
  const posts = data;
}
```

### Pattern 3: Enhanced Client with Logging

```typescript
const enhanced = createEnhancedClient({
  client: supabase,
  logger: myLogger,
  autoLogging: true,
});

// Operations are automatically logged
const { data } = await enhanced.getClient().from('posts').select('*');
```

---

## Type Safety

All data structures are fully typed with TypeScript:

- **Result types** preserve the generic type `T` through the operation
- **OperationContext** is strongly typed
- **HealthCheckResult** has explicit types for all fields
- **PaginatedResponse** preserves the item type `T`

This ensures compile-time type checking and prevents runtime errors.

---

_Last Updated: 2025-01-27_
