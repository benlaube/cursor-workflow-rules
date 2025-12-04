# Backend_API_Module_Plan_v1.0

## Metadata

- **Created:** 2025-01-27
- **Last Updated:** 2025-01-27
- **Version:** 1.0
- **Description:** Plan and implementation guide for a standardized, type-safe backend framework for Next.js API routes or standalone Node.js services. Status: Implemented. Dependencies: Supabase, standard-error-handler, standard-logger. Implementation: See `modules/backend-api/`

## 1. Overview

A standardized, type-safe backend framework for Next.js API routes or standalone Node.js services.

## 2. Core Components

### A. Router & Handler Wrapper

A Higher-Order Function (HOF) to wrap API handlers.

- **What it does**:
  - Automatic Error Catching (wraps everything in `try/catch`).
  - Standardized JSON Response (`{ data, error, meta }`).
  - Request Logging (incoming method, URL, duration).
  - Input Validation (Zod integration).

### B. Middleware Chain

A pipeline for:

1. **Auth**: Verify Supabase JWT.
2. **Rate Limit**: Redis/Upstash based limiting.
3. **Context**: Inject `userId`, `tenantId` into request object.

### C. Controller / Service Pattern

Separation of business logic from HTTP transport.

- **Controller**: Parses Request -> Calls Service -> Returns Response.
- **Service**: Pure TypeScript classes containing business rules (DB calls, calculations).

## 3. Proposed Directory Structure

```text
modules/backend-api/
├── src/
│   ├── handler.ts          # The "createApiHandler" wrapper
│   ├── middleware/         # Auth, RateLimit, Validation
│   ├── response.ts         # Standard response formatting
│   └── context.ts          # Request context type definitions
└── index.ts                # Public exports
```

## 4. Example Usage

```typescript
import { createApiHandler } from '@modules/backend-api';
import { z } from 'zod';

export const GET = createApiHandler({
  schema: z.object({ limit: z.number() }),
  requireAuth: true,
  handler: async ({ input, ctx }) => {
    // Business logic here
    return db.users.findMany({ take: input.limit });
  },
});
```
