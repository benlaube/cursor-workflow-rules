# Logger Module

A comprehensive, universal logging system with multi-dimensional categorization, context propagation, and multi-destination output. Supports Node.js, Browser, and Edge runtimes with automatic environment detection and graceful degradation.

## Important: Integration vs Standalone

**The logger-module is a library that integrates INTO your application** - it does not run as a standalone service on its own port. It becomes part of your application's codebase and runs within your application process.

- ✅ **Integrated:** Import and use within your application code
- ✅ **No separate port:** Runs in the same process as your application
- ✅ **Framework middleware:** Use Express, Next.js, Fastify middleware for automatic logging
- ❌ **Not standalone:** Does not run as a separate service

If you need a standalone log viewer/analyzer, consider creating a separate service or using the log analysis utilities from `modules/error-handler/log-analyzer.ts`.

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

## Quick Launch / Integration Guide

### Step 1: Install Dependencies

```bash
npm install logger-module pino zod uuid
```

### Step 2: Set Up Logger in Your Application

The logger integrates directly into your application code. Choose the integration method that matches your framework:

**For Express.js:**
```typescript
// app.ts or server.ts
import express from 'express';
import { setupLogger } from './modules/logger-module';
import { createExpressMiddleware } from './modules/logger-module/middleware';

const app = express();
const logger = setupLogger('api-server', {
  env: process.env.NODE_ENV || 'development',
  serviceName: 'my-api',
  enableFile: true, // Writes to ./logs directory
  enableDatabase: true, // Optional: requires Supabase client
  supabaseClient: supabase, // If using database logging
});

// Add middleware for automatic request logging
app.use(createExpressMiddleware(logger));

// Your routes
app.get('/health', (req, res) => {
  logger.info('Health check requested');
  res.json({ status: 'ok' });
});

app.listen(3000, () => {
  logger.info('Server started on port 3000');
});
```

**For Next.js:**
```typescript
// middleware.ts (root of project)
import { setupLogger } from './modules/logger-module';
import { createNextJsMiddleware } from './modules/logger-module/middleware';

const logger = setupLogger('nextjs-app', {
  env: process.env.NODE_ENV || 'development',
  serviceName: 'my-nextjs-app',
  enableFile: true,
});

export default createNextJsMiddleware(logger);
```

**For Standalone Node.js Script:**
```typescript
// script.ts
import { setupLogger } from './modules/logger-module';

const logger = setupLogger('my-script', {
  env: 'development',
  serviceName: 'my-script',
  enableFile: true,
  logDir: './logs', // Default: ./logs
});

logger.info('Script started');
// Your script logic here
logger.info('Script completed');
```

### Step 3: Launch Your Application

The logger runs automatically when your application starts. No separate launch needed.

```bash
# For Express/Node.js
npm start
# or
node dist/server.js

# For Next.js
npm run dev
# or
npm run build && npm start
```

### Step 4: View Logs

Logs are written to multiple destinations:

1. **Console:** See logs in your terminal (colorized in development)
2. **File:** Check `./logs/session_*.log` files (Node.js only)
3. **Database:** Query Supabase `logs` table (if enabled)

**View file logs:**
```bash
# View latest log file
tail -f logs/session_*.log

# Or use log analyzer from error-handler module
import { analyzeLogs } from './modules/error-handler';
const result = await analyzeLogs({ logDir: './logs' });
```

### Configuration Summary

- **No separate port needed:** Logger runs in your application process
- **Log directory:** Defaults to `./logs` (configurable via `logDir` option)
- **File logging:** Enabled by default in Node.js, writes to `./logs/session_<session-id>.log`
- **Database logging:** Optional, requires Supabase client configuration
- **Console logging:** Always enabled (can be disabled via `enableConsole: false`)

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

### Logs Not Appearing

1. **Check log directory exists:**
   ```bash
   ls -la ./logs
   # If missing, create it: mkdir -p ./logs
   ```

2. **Verify logger is initialized:**
   - Check that `setupLogger()` is called before any logging
   - Ensure logger instance is passed to middleware or used in code

3. **Check file permissions:**
   - Ensure write permissions on `./logs` directory
   - On Unix/Mac: `chmod 755 ./logs`

### Logs Not Appearing in Database

1. Check Supabase is running: `supabase status`
2. Verify `enableDatabase: true` in logger options
3. Check Supabase client is properly configured
4. Look for errors in console
5. Verify database migration is applied (see `migrations/logs-schema.sql`)

### Missing Categories in Logs

1. Use `setLogContext()` to set context
2. Use `logWithContext()` for explicit context
3. Check middleware is setting context for HTTP requests

### Context Not Propagating

- **Node.js**: Uses AsyncLocalStorage (should work automatically)
- **Browser**: Uses AsyncContext (Chrome 126+) or WeakMap fallback
- **Edge**: Uses request-scoped context (may need explicit passing)

### Port Conflicts (Not Applicable)

**Note:** The logger-module does not use ports - it runs within your application process. If you see port conflicts, they're from your application server, not the logger.

For port conflict resolution, see `.cursor/rules/auto-heal.mdc` Section 1.

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

## Viewing and Analyzing Logs

### View Log Files Directly

```bash
# View latest log file (Unix/Mac)
tail -f logs/session_*.log

# View all log files
ls -lh logs/

# Search logs for errors
grep -i error logs/session_*.log

# View last 100 lines
tail -n 100 logs/session_*.log
```

### Using Log Analyzer (Recommended)

The `error-handler` module provides log analysis utilities:

```typescript
import { analyzeLogs, categorizeError } from './modules/error-handler';

// Analyze logs in ./logs directory
const result = await analyzeLogs({
  logDir: './logs',
  maxEntries: 1000,
  timeRange: 3600000, // Last hour
  minLevel: 'error',
});

if (result.ok) {
  for (const error of result.value) {
    const category = categorizeError(error);
    console.log(`${category}: ${error.message}`);
    if (error.filePath) {
      console.log(`  at ${error.filePath}:${error.lineNumber}`);
    }
    if (error.count && error.count > 1) {
      console.log(`  (occurred ${error.count} times)`);
    }
  }
}
```

### Query Database Logs (If Enabled)

If database logging is enabled, query the Supabase `logs` table:

```sql
-- Recent errors
SELECT * FROM logs 
WHERE level IN ('error', 'fatal')
ORDER BY timestamp DESC 
LIMIT 100;

-- Errors by component
SELECT component, COUNT(*) as count
FROM logs
WHERE level = 'error'
GROUP BY component
ORDER BY count DESC;

-- Errors with stack traces
SELECT message, stack_trace, file_path, line_number
FROM logs
WHERE level = 'error' AND stack_trace IS NOT NULL;
```

### Log Viewer Service (Optional)

If you need a standalone log viewer, you can create a simple Express service:

```typescript
// log-viewer.ts
import express from 'express';
import { analyzeLogs } from './modules/error-handler';

const app = express();
const PORT = process.env.LOG_VIEWER_PORT || 3001; // Different from main app

app.get('/api/logs', async (req, res) => {
  const result = await analyzeLogs({
    logDir: './logs',
    maxEntries: parseInt(req.query.limit as string) || 100,
  });
  
  if (result.ok) {
    res.json(result.value);
  } else {
    res.status(500).json({ error: result.error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Log viewer running on port ${PORT}`);
});
```

**Note:** This is optional - the logger-module itself doesn't need a separate service. This is only if you want a dedicated log viewing endpoint.

## Related Documentation

- [Module Structure Standards](../../standards/module-structure.md)
- [Supabase Integration](../../standards/architecture/supabase-local-setup.md)
- [Testing Module](../testing-module/README.md)
- [Error Handler Module](../error-handler/README.md) - Log analysis utilities
