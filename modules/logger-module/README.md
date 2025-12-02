# Logger Module

A comprehensive, universal logging system with multi-dimensional categorization, context propagation, and multi-destination output. Supports Node.js, Browser, and Edge runtimes with automatic environment detection and graceful degradation.

## Features

- **Universal Runtime Support**: Works in Node.js, Browser, and Edge runtimes
- **Multi-Dimensional Categorization**: `[source|action|component]` prefix on all logs
- **Context Propagation**: Automatic context inheritance across async boundaries
- **Multi-Destination Logging**: Console (colorized), File (Node.js only), Database (batched)
- **Distributed Tracing**: Request/trace ID generation and propagation
- **Security**: PII scrubbing, error sanitization, circular reference handling
- **Performance**: Log sampling, batched database writes, backpressure handling
- **Framework Integration**: Express, Next.js, Fastify, and Browser middleware

## Installation

```bash
npm install logger-module pino zod uuid
```

Optional dependencies:
```bash
npm install pino-pretty pino-roll @supabase/supabase-js
```

## Quick Start

### Basic Usage

```typescript
import { setupLogger } from './modules/logger-module';

const logger = setupLogger('my-service', {
  env: 'development',
  serviceName: 'my-app',
});

logger.info('Service started');
logger.error('Something went wrong', new Error('Database failed'));
```

### With Context

```typescript
import { setupLogger } from './modules/logger-module';
import { setLogContext } from './modules/logger-module/context';

const logger = setupLogger('my-service', {
  env: 'development',
  serviceName: 'my-app',
});

// Set context once
setLogContext({
  source: 'user',
  action: 'order_placed',
  component: 'backend',
});

// All subsequent logs automatically include [user|order_placed|backend]
logger.info('Processing order');
logger.debug('Validating order data');
```

## Using the Logger Interface

The logger module provides an `ILogger` interface for dependency injection and type safety:

```typescript
import type { ILogger } from './modules/logger-module';
import { setupLogger } from './modules/logger-module';

// Use ILogger for dependency injection
class UserService {
  constructor(private logger: ILogger) {}

  async login(userId: string) {
    this.logger.info('User login attempt', { userId });
    // ... login logic
    this.logger.success('User logged in', { userId });
  }
}

// Create logger and inject it
const logger = setupLogger('user-service', {
  env: 'development',
  serviceName: 'api',
});

const userService = new UserService(logger);
```

### Benefits

- **Type Safety**: Ensures all logger implementations match the expected API
- **Dependency Injection**: Easy to swap logger implementations or use mocks in tests
- **Testability**: Use `createMockLogger()` from testing-module for unit tests
- **Flexibility**: Can create custom logger implementations that implement `ILogger`

### Type Guard

Check if an object implements `ILogger`:

```typescript
import { isILogger } from './modules/logger-module';

if (isILogger(someObject)) {
  someObject.info('This is a logger');
}
```

## Runtime-Specific Usage

### Node.js

```typescript
import { setupLogger } from './modules/logger-module';

const logger = setupLogger('api-server', {
  env: process.env.NODE_ENV || 'development',
  serviceName: 'api',
  enableFile: true, // File logging enabled by default
  enableDatabase: true, // Opt-in database logging
  supabaseClient: supabase, // Supabase client for database logging
});
```

### Browser

```typescript
import { setupLogger } from './modules/logger-module';
import { setupBrowserLogging } from './modules/logger-module/middleware';

const logger = setupLogger('frontend', {
  env: 'production',
  serviceName: 'web-app',
  browserStorage: 'localStorage', // Store session ID in localStorage
});

// Set up automatic error logging
setupBrowserLogging(logger);
```

### Edge Runtime (Vercel Edge, Cloudflare Workers)

```typescript
import { setupLogger } from './modules/logger-module';

const logger = setupLogger('edge-function', {
  env: 'production',
  serviceName: 'edge-api',
  edgeOptimized: true, // Smaller batches, faster flush
});
```

## Framework Integration

### Express.js

```typescript
import express from 'express';
import { setupLogger } from './modules/logger-module';
import { createExpressMiddleware } from './modules/logger-module/middleware';

const app = express();
const logger = setupLogger('api', {
  env: 'production',
  serviceName: 'api',
});

app.use(createExpressMiddleware(logger));
```

### Next.js

```typescript
// middleware.ts
import { setupLogger } from './modules/logger-module';
import { createNextJsMiddleware } from './modules/logger-module/middleware';

const logger = setupLogger('nextjs-app', {
  env: process.env.NODE_ENV || 'development',
  serviceName: 'nextjs-app',
});

export default createNextJsMiddleware(logger);
```

```typescript
// app/api/route.ts
import { setupLogger } from './modules/logger-module';
import { withLogging } from './modules/logger-module/middleware';
import { NextRequest, NextResponse } from 'next/server';

const logger = setupLogger('api', {
  env: 'production',
  serviceName: 'api',
});

export const GET = withLogging(logger, async (req: NextRequest) => {
  return NextResponse.json({ message: 'Hello' });
});
```

### Fastify

```typescript
import Fastify from 'fastify';
import { setupLogger } from './modules/logger-module';
import { createFastifyPlugin } from './modules/logger-module/middleware';

const app = Fastify();
const logger = setupLogger('api', {
  env: 'production',
  serviceName: 'api',
});

app.register(createFastifyPlugin(logger));
```

## Configuration Options

```typescript
interface LoggerOptions {
  env: 'development' | 'production' | 'test';
  serviceName: string;
  runtime?: 'auto' | 'node' | 'browser' | 'edge';
  
  // Log Levels (per destination)
  level?: LogLevel;
  consoleLevel?: LogLevel;
  fileLevel?: LogLevel;
  databaseLevel?: LogLevel;
  
  // Handler Configuration
  enableConsole?: boolean;
  enableFile?: boolean;
  enableDatabase?: boolean;
  
  // Console Handler
  consoleFormat?: 'pretty' | 'json' | 'compact';
  
  // File Handler (Node.js only)
  logDir?: string;
  fileRotation?: {
    maxSize?: string;
    maxAge?: string;
    compress?: boolean;
    retention?: string;
  };
  
  // Database Handler
  supabaseClient?: SupabaseClient;
  persistLog?: (logEntry: LogEntry) => Promise<void>;
  batchSize?: number;
  flushInterval?: number;
  maxQueueSize?: number;
  retryConfig?: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
  };
  
  // Security
  piiPatterns?: RegExp[];
  scrubFields?: string[];
  sanitizeErrors?: boolean;
  
  // Performance
  samplingRate?: number;
  samplingLevels?: LogLevel[];
  
  // Tracing
  enableTracing?: boolean;
  opentelemetryEnabled?: boolean;
  
  // Browser-specific
  browserStorage?: 'localStorage' | 'sessionStorage' | 'memory';
  
  // Edge-specific
  edgeOptimized?: boolean;
}
```

## Advanced Usage

### Helper Functions

```typescript
import { logWithContext, logApiCall } from './modules/logger-module/helpers';

// Explicit context logging
logWithContext(
  logger,
  'info',
  'Order placed successfully',
  'bot',
  'order_placed',
  'tradestation_api',
  { orderId: '12345', symbol: 'MNQZ25' }
);

// API call logging with auto-action mapping
logApiCall(
  logger,
  'debug',
  'API Request: GET /api/orders',
  'bot',
  '/api/orders',
  'GET'
);
```

### Child Loggers

```typescript
import { createChildLogger } from './modules/logger-module/helpers';

const dbLogger = createChildLogger(logger, {
  component: 'database',
});

dbLogger.info('Query executed'); // Automatically includes component: 'database'
```

### Context Scoping

```typescript
import { withLogContext } from './modules/logger-module/context';

await withLogContextAsync(
  { source: 'user', action: 'order_query', component: 'backend' },
  async () => {
    // All logs in this scope automatically include the context
    logger.info('Fetching orders');
    logger.debug('Querying database');
  }
);
```

## Database Schema

The logger module includes a Supabase migration for the `logs` table. Run the migration:

```sql
-- See migrations/logs-schema.sql
```

The schema includes:
- Multi-dimensional categorization columns (source, action, component)
- Distributed tracing support (request_id, trace_id)
- Runtime identification (runtime: node/browser/edge)
- JSONB metadata column for flexible querying
- Comprehensive indexes for performance

## Testing

```typescript
import { createMockLogger } from './modules/logger-module/testing';

test('should log user login', () => {
  const mockLogger = createMockLogger();
  const service = new UserService(mockLogger);
  
  service.login('user-1');
  
  expect(mockLogger.info).toHaveBeenCalledWith('User logged in');
});
```

## Best Practices

1. **Use Context Propagation**: Set context at the beginning of request/operation, clear at the end
2. **Include Relevant Metadata**: Add context-specific information to logs
3. **Use Appropriate Log Levels**: DEBUG for diagnostics, INFO for general messages, ERROR for failures
4. **Enable Database Logging in Production**: Use batched database handler for production observability
5. **Configure PII Scrubbing**: Add custom patterns for sensitive data in your domain
6. **Use Sampling for High-Volume Logs**: Configure sampling for DEBUG/TRACE levels in production

## Troubleshooting

### Logs Not Appearing in Database

1. Check Supabase is running: `supabase status`
2. Verify `enableDatabase: true` in logger options
3. Check Supabase client is properly configured
4. Look for errors in console

### Missing Categories in Logs

1. Use `setLogContext()` to set context
2. Use `logWithContext()` for explicit context
3. Check middleware is setting context for HTTP requests

### Context Not Propagating

- **Node.js**: Uses AsyncLocalStorage (should work automatically)
- **Browser**: Uses AsyncContext (Chrome 126+) or WeakMap fallback
- **Edge**: Uses request-scoped context (may need explicit passing)

## Runtime-Specific Considerations

### Node.js
- Full feature set available
- File handler enabled by default
- Pretty console output
- CLI tools available

### Browser
- File handler automatically disabled
- JSON console output (pretty not available)
- Session ID stored in localStorage
- Database handler works via HTTP

### Edge Runtimes
- File handler automatically disabled
- JSON console output
- Smaller batch sizes (25 vs 50)
- Faster flush intervals (2s vs 5s)
- Memory-only session (request-scoped)

## Migration from Basic Logger

The logger module maintains backward compatibility with the existing `LoggerOptions` interface. New features are opt-in via optional configuration fields.

```typescript
// Old usage still works
const logger = setupLogger('my-service', {
  env: 'development',
  serviceName: 'my-app',
  persistLog: async (entry) => { /* ... */ },
});

// New features are optional
const logger = setupLogger('my-service', {
  env: 'development',
  serviceName: 'my-app',
  enableDatabase: true,
  supabaseClient: supabase,
  enableTracing: true,
});
```

## Related Documentation

- [Module Structure Standards](../../standards/module-structure.md)
- [Supabase Integration](../../standards/architecture/supabase-local-setup.md)
- [Testing Module](../testing-module/README.md)
