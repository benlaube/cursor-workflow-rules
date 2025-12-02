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
- **Enhanced Tracking (Phase 1)**: User/tenant IDs, request/response sizes, IP addresses, error categorization, performance metrics, business entity tracking

## Enhanced Tracking Features (Phase 1)

The logger module now includes enhanced tracking capabilities for better observability and debugging:

### User & Tenant Tracking
- **User ID**: Explicit `user_id` field (indexed in database)
- **Tenant ID**: Multi-tenant support with `tenant_id` field (indexed in database)
- Automatically captured from request context when using middleware

### Request/Response Metrics
- **Request Size**: Tracks request body size in bytes
- **Response Size**: Tracks response payload size in bytes
- **IP Address**: Client IP address (with proxy header support)
- Automatically captured by Express, Next.js, and Fastify middleware

### Error Categorization
- **Error Categories**: Automatically categorizes errors as:
  - `validation` - Input validation errors (400, 422)
  - `network` - Network/connection errors (503, 504)
  - `database` - Database query errors
  - `authentication` - Auth failures (401)
  - `authorization` - Permission errors (403)
  - `rate_limit` - Rate limiting (429)
  - `timeout` - Timeout errors (408)
  - `business_logic` - Business rule violations (409)
  - `unknown` - Unclassified errors
- **Error Fingerprinting**: Generates hash-based fingerprints for grouping similar errors
- Automatically applied when using `logger.error()`, `logger.fatal()`, or `logger.failure()`

### Performance Metrics
- **Duration**: Request/response duration in milliseconds
- **Memory Usage**: Heap usage, RSS, external memory (Node.js only)
- **Event Loop Lag**: Event loop delay tracking (Node.js only)
- **Database Query Metrics**: Query duration, row count, query type
- **API Call Metrics**: External API call duration, retries, status codes
- **Connection Pool Stats**: Active, idle, waiting connections
- Automatically captured by middleware and available via `createPerformanceMetrics()` helper

### Business Entity Tracking
- **Business Entity ID**: Track order IDs, customer IDs, transaction IDs, etc.
- **Business Entity Type**: Type of entity (order, customer, transaction, etc.)
- Set via context: `setLogContext({ businessEntity: { id: 'order-123', type: 'order' } })`

### Feature Flags
- **Feature Flags**: Track active feature flags for requests/operations
- Set via context: `setLogContext({ featureFlags: { newCheckout: true, darkMode: false } })`

### Usage Examples

```typescript
import { setupLogger, setLogContext } from './modules/logger-module';
import { createPerformanceMetrics } from './modules/logger-module/helpers';

const logger = setupLogger('my-app', {
  env: 'development',
  serviceName: 'api',
});

// Error logging with automatic categorization
try {
  await someOperation();
} catch (error) {
  // Error is automatically categorized and fingerprinted
  logger.error('Operation failed', error);
  // Logs include: error_category, error_fingerprint
}

// Business entity tracking
setLogContext({
  businessEntity: { id: 'order-12345', type: 'order' },
  featureFlags: { newCheckout: true },
});

logger.info('Processing order');
// Logs include: business_entity_id, business_entity_type, feature_flags

// Performance tracking
const startTime = Date.now();
await someAsyncOperation();
const metrics = await createPerformanceMetrics(Date.now() - startTime, {
  database: { queryDuration: 45, rowCount: 100 },
});

setLogContext({ performanceMetrics: metrics });
logger.info('Operation completed');
// Logs include: performance_metrics with duration, memory, database stats
```

### Database Schema

The enhanced fields are stored in the database with proper indexing:

```sql
-- Run the migration: migrations/logs-schema-v2.sql
ALTER TABLE logs 
  ADD COLUMN user_id UUID,
  ADD COLUMN tenant_id VARCHAR(255),
  ADD COLUMN ip_address INET,
  ADD COLUMN request_size INTEGER,
  ADD COLUMN response_size INTEGER,
  ADD COLUMN error_category VARCHAR(50),
  ADD COLUMN error_fingerprint VARCHAR(64),
  ADD COLUMN business_entity_id VARCHAR(255),
  ADD COLUMN business_entity_type VARCHAR(50),
  ADD COLUMN feature_flags JSONB,
  ADD COLUMN performance_metrics JSONB,
  ADD COLUMN correlation_id UUID;

-- Indexes are automatically created for efficient querying
```

## Enhanced Tracking Features (Phase 2)

Phase 2 adds advanced request/response tracking and context management:

### Enhanced Request/Response Context
- **Request Headers**: Automatically extracts and tracks relevant request headers (content-type, accept, user-agent, referer, origin)
- **Response Headers**: Tracks response headers (content-type, cache-control, etag, last-modified, expires, content-encoding)
- **Request Fingerprinting**: Generates hash-based fingerprints for duplicate request detection
- **Rate Limiting Info**: Extracts rate limit headers (x-ratelimit-limit, x-ratelimit-remaining, x-ratelimit-reset, retry-after)
- **Cache Status**: Detects cache hit/miss from CDN/proxy headers (cf-cache-status, x-cache-status)

### CPU Tracking
- **CPU Usage**: Tracks CPU time for operations (Node.js only)
- **CPU Metrics**: Integrated into performance metrics alongside memory and event loop lag

### Context Tags System
- **Flexible Tags**: Key-value tags for flexible categorization (already in Phase 1, enhanced usage)
- **Tag Merging**: Tags are automatically merged into log metadata with `tag_` prefix

### Usage Examples

```typescript
import { setupLogger, setLogContext } from './modules/logger-module';
import { 
  fingerprintRequest, 
  getCacheStatus, 
  getRateLimitInfo,
  createPerformanceMetrics,
  trackCpuUsage 
} from './modules/logger-module/helpers';

const logger = setupLogger('my-app', {
  env: 'development',
  serviceName: 'api',
});

// Enhanced request tracking (automatically done by middleware)
// Middleware now captures:
// - request_headers (content-type, accept, user-agent, etc.)
// - response_headers (content-type, cache-control, etag, etc.)
// - request_fingerprint (for duplicate detection)
// - rate_limit_info (limit, remaining, reset, retry-after)
// - cache_status (hit/miss, cache-control, etag)

// CPU tracking
const startCpu = process.cpuUsage();
const startTime = Date.now();
await someAsyncOperation();
const metrics = await createPerformanceMetrics(
  Date.now() - startTime,
  undefined,
  startCpu // Pass CPU usage at start
);
// metrics now includes cpuUsage

// Context tags
setLogContext({
  tags: {
    environment: 'production',
    region: 'us-east-1',
    deployment: 'v2.1.0',
  },
});
logger.info('Deployment started');
// Logs include: tag_environment, tag_region, tag_deployment

// Manual request fingerprinting
const fingerprint = fingerprintRequest(
  'POST',
  '/api/orders',
  { 'content-type': 'application/json', 'user-agent': '...' },
  { page: '1' }
);
// Returns: 'a1b2c3d4e5f6g7h8' (hash for duplicate detection)
```

### Database Storage

Phase 2 fields are stored in the `meta` JSONB column:
- `request_headers` - Relevant request headers
- `response_headers` - Relevant response headers  
- `request_fingerprint` - Request fingerprint hash
- `rate_limit_info` - Rate limiting information
- `cache_status` - Cache hit/miss status

These fields are automatically captured by middleware and don't require additional database schema changes (stored in existing `meta` JSONB field).

## Enhanced Tracking Features (Phase 3)

Phase 3 adds advanced features for cross-service tracing, compliance, and specialized integrations:

### Cross-Service Context Propagation
- **HTTP Header Propagation**: Automatically propagate context via HTTP headers (x-request-id, x-trace-id, x-correlation-id, etc.)
- **Message Queue Propagation**: Propagate context through message queue metadata (RabbitMQ, Kafka, etc.)
- **Context Extraction**: Extract context from incoming HTTP requests or messages
- **Context Injection**: Inject context into outgoing HTTP requests or messages

### Audit Logging
- **Separate Audit Stream**: Dedicated audit log handler for compliance requirements
- **Compliance Markers**: Mark logs with compliance standards (GDPR, HIPAA, PCI-DSS, etc.)
- **Data Retention**: Configurable retention periods (default: 7 years for compliance)
- **Audit Method**: `logger.audit()` method for explicit audit logging

### Performance Baselines
- **Baseline Tracking**: Track performance baselines for operations
- **Performance Comparison**: Compare current metrics against historical baselines
- **Degradation Detection**: Automatically detect performance degradation
- **Alert Thresholds**: Configure alerts based on P50, P95, P99 thresholds

### GraphQL Integration
- **Operation Logging**: Log GraphQL queries, mutations, and subscriptions
- **Resolver Logging**: Track individual resolver execution times
- **Apollo Server Plugin**: Ready-to-use plugin for Apollo Server
- **Error Tracking**: Track GraphQL errors with full context

### gRPC Integration
- **Call Logging**: Log gRPC service calls with metadata
- **Interceptor**: gRPC interceptor for automatic logging
- **Status Tracking**: Track gRPC status codes and messages
- **Performance Metrics**: Duration and error tracking for gRPC calls

### Usage Examples

```typescript
import { 
  setupLogger, 
  extractContextFromHeaders, 
  injectContextToHeaders,
  createAuditHandler,
  logGraphQLOperation,
  createGraphQLLoggingPlugin,
  updateBaseline,
  compareToBaseline,
} from './modules/logger-module';

const logger = setupLogger('my-app', {
  env: 'development',
  serviceName: 'api',
});

// Cross-service context propagation
// In incoming request handler:
const context = extractContextFromHeaders(req.headers);
setLogContext(context);

// In outgoing HTTP request:
const headers = injectContextToHeaders(getLogContext());
fetch(url, { headers });

// Audit logging
logger.audit('User accessed sensitive data', {
  userId: 'user-123',
  dataType: 'pii',
}, ['GDPR', 'HIPAA']);

// Performance baselines
updateBaseline('api_query', { duration: 150 });
const comparison = compareToBaseline('api_query', { duration: 300 });
if (comparison?.degraded) {
  logger.warn('Performance degraded', { comparison });
}

// GraphQL logging
import { createGraphQLLoggingPlugin } from './modules/logger-module/integrations/graphql';
const server = new ApolloServer({
  plugins: [createGraphQLLoggingPlugin(logger)],
});

// gRPC logging
import { createGRPCInterceptor } from './modules/logger-module/integrations/grpc';
const interceptor = createGRPCInterceptor(logger);
```

## Enhanced Tracking Features (Phase 4)

Phase 4 adds specialized integrations for common infrastructure components:

### Message Queue Logging
- **Operation Tracking**: Log publish, consume, ack, nack, reject operations
- **Context Propagation**: Automatically propagate context through message metadata
- **Performance Metrics**: Track message processing duration and retry counts
- **Queue System Support**: RabbitMQ, Kafka, and other message queue systems

### Database Query Logging
- **Automatic SQL Logging**: Track all database queries with parameters
- **Query Sanitization**: Automatically redact sensitive data from query parameters
- **Performance Tracking**: Query duration, row count, query type
- **Database System Support**: PostgreSQL, MySQL, MongoDB, etc.

### Cache Logging
- **Operation Tracking**: Log cache get, set, delete, invalidate, clear operations
- **Hit/Miss Detection**: Track cache hit rates and performance
- **Cache System Support**: Redis, Memcached, and other cache systems
- **TTL Tracking**: Monitor cache expiration and TTL values

### WebSocket Logging
- **Connection Tracking**: Log WebSocket connect, disconnect, message, error events
- **Message Tracking**: Track message sizes and counts
- **Connection Lifetime**: Monitor connection duration and health
- **Close Code Tracking**: Track WebSocket close codes and reasons

### Data Retention Policies
- **Automatic Retention**: Configurable retention periods by log level
- **Archive Before Delete**: Optional archival before deletion
- **Default Policies**: Sensible defaults (7 years for audit/fatal, 3 months for info, etc.)
- **Archive Filename Generation**: Automatic archive filename generation

### Usage Examples

```typescript
import {
  logMessageQueueOperation,
  logDatabaseQuery,
  logCacheOperation,
  logWebSocketOperation,
  getRetentionPolicy,
  shouldArchive,
} from './modules/logger-module';

// Message Queue logging
await logMessageQueueOperation(logger, {
  queueName: 'orders',
  routingKey: 'order.created',
  operation: 'publish',
  messageSize: 1024,
  queueSystem: 'rabbitmq',
}, 50);

// Database query logging
await logDatabaseQuery(logger, {
  query: 'SELECT * FROM users WHERE id = $1',
  params: [userId],
  queryType: 'SELECT',
  databaseSystem: 'postgres',
  tables: ['users'],
  duration: 45,
  rowCount: 1,
  success: true,
});

// Cache logging
await logCacheOperation(logger, {
  key: 'user:123',
  operation: 'get',
  result: 'hit',
  cacheSystem: 'redis',
  duration: 2,
  valueSize: 512,
});

// WebSocket logging
await logWebSocketOperation(logger, {
  connectionId: 'ws-123',
  operation: 'connect',
  duration: 3600000, // 1 hour
  messageCount: 150,
});

// Retention policies
const policy = getRetentionPolicy('error');
if (shouldArchive(logEntry.timestamp, 'error')) {
  // Archive log entry
}
```

## Enhanced Tracking Features (Phase 5)

Phase 5 adds advanced user context, geolocation, error correlation, and nested context support:

### Enhanced User/Session Context
- **User Agent Parsing**: Parse user agent into browser, OS, device type
- **Session Events**: Track login, logout, timeout, refresh, expired events
- **Session Duration**: Calculate and track session lifetime
- **Device Information**: Extract device type, model, screen size (browser)

### Geolocation (Privacy-Aware)
- **IP-Based Geolocation**: Get country, region, city from IP address
- **Privacy Modes**: Full, country-only, or none (respects user privacy)
- **IP Anonymization**: Automatically anonymize IP addresses based on privacy mode
- **Timezone Detection**: Extract timezone information

### Advanced Error Context
- **Error Correlation**: Link related errors across services using correlation IDs
- **Error Impact Scoring**: Calculate impact scores (0-100) based on frequency, user impact, service impact
- **Affected User Tracking**: Track how many users are affected by errors
- **Service Impact Analysis**: Identify which services are affected by errors

### Nested Context Support
- **Context Scopes**: Support for nested context scopes with automatic merging
- **Context Inheritance**: Better context merging strategies
- **Context Breadcrumbs**: Track context changes over time
- **Multiple Nesting Levels**: Support for deeply nested contexts

### Usage Examples

```typescript
import {
  parseUserAgent,
  createSessionInfo,
  getGeolocation,
  linkError,
  calculateErrorImpact,
  withNestedContext,
} from './modules/logger-module';

// User agent parsing
const uaInfo = parseUserAgent(req.headers['user-agent']);
// Returns: { browser: 'Chrome', os: 'macOS', deviceType: 'desktop', ... }

// Session tracking
const sessionInfo = createSessionInfo(
  sessionId,
  userId,
  startTime,
  'login',
  userAgent,
  ipAddress
);

// Geolocation (privacy-aware)
const geo = await getGeolocation(ipAddress, 'country-only');
// Returns: { country: 'US', ipAnonymized: true, ... }

// Error correlation
linkError(errorId, correlationId, 'api-service', userId);
const correlation = getErrorCorrelation(correlationId);
const impact = calculateErrorImpact(correlation, errorEntries);
// Returns: { score: 75, severity: 'high', affectedUsers: 150, ... }

// Nested context
withNestedContext({ component: 'payment' }, () => {
  withNestedContext({ action: 'process' }, () => {
    logger.info('Payment processing'); // Has both component and action
  });
});
```

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

### Log Viewer Service (Built-in)

The logger-module includes a built-in log viewer that can be integrated into your application or run standalone.

#### Option 1: Integrated into Express App (Recommended)

Add log viewer routes to your existing Express application:

```typescript
// app.ts or server.ts
import express from 'express';
import { setupLogger, createLogViewerRouter } from './modules/logger-module';
import { analyzeLogs, categorizeError } from './modules/error-handler';

const app = express();
const logger = setupLogger('api-server', {
  env: 'development',
  serviceName: 'my-api',
  enableFile: true,
});

// Add log viewer at /logs endpoint
app.use('/logs', createLogViewerRouter({
  logDir: './logs',
  logger,
  analyzeLogsFn: analyzeLogs,
  categorizeErrorFn: categorizeError,
  enableDatabase: true, // Optional: if using Supabase
  supabaseClient: supabase, // Optional: if using database logging
}));

app.listen(3000, () => {
  logger.info('Server started on port 3000');
  logger.info('Log viewer available at http://localhost:3000/logs');
});
```

**Available endpoints:**
- `GET /logs` - Get analyzed logs with summary
- `GET /logs/files` - List available log files
- `GET /logs/files/:filename` - Get specific log file content
- `GET /logs/summary` - Get summary statistics
- `GET /logs/database` - Query database logs (if enabled)

#### Option 2: Standalone Service (Separate Port)

Run log viewer as a separate service on a different port:

```typescript
// log-viewer.ts
import { startLogViewer } from './modules/logger-module/viewer/standalone';
import { analyzeLogs, categorizeError } from './modules/error-handler';

startLogViewer({
  port: 3001, // Different from main app
  logDir: './logs',
  analyzeLogsFn: analyzeLogs,
  categorizeErrorFn: categorizeError,
  enableDatabase: true,
  supabaseClient: supabase,
});

// Service runs at http://localhost:3001/logs
```

#### Option 3: Next.js API Routes

Create Next.js API routes for log viewing:

```typescript
// app/api/logs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAnalyzedLogs } from '../../../../modules/logger-module/viewer';
import { analyzeLogs, categorizeError } from '../../../../modules/error-handler';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const result = await getAnalyzedLogs({
    logDir: './logs',
    maxEntries: parseInt(searchParams.get('limit') || '100'),
    analyzeLogsFn: analyzeLogs,
    categorizeErrorFn: categorizeError,
  });
  
  return NextResponse.json(result);
}
```

**Usage Examples:**

```bash
# Get analyzed logs
curl http://localhost:3000/logs

# Get logs with limit
curl http://localhost:3000/logs?limit=50&minLevel=error

# List log files
curl http://localhost:3000/logs/files

# Get specific log file (last 100 lines)
curl http://localhost:3000/logs/files/session_abc123.log?lines=100

# Get summary
curl http://localhost:3000/logs/summary

# Query database logs
curl http://localhost:3000/logs/database?limit=100&level=error
```

**Note:** The log viewer requires the `error-handler` module for log analysis. If not available, provide `analyzeLogsFn` and `categorizeErrorFn` in options.

## Related Documentation

- [Module Structure Standards](../../standards/module-structure.md)
- [Supabase Integration](../../standards/architecture/supabase-local-setup.md)
- [Testing Module](../testing-module/README.md)
- [Error Handler Module](../error-handler/README.md) - Log analysis utilities

## Possible Enhancements

### Short-term Improvements

- **Log Compression** - Automatic compression of old log files
- **Log Rotation Policies** - More granular rotation policies (by size, time, or both)
- **Log Retention** - Automatic cleanup of old logs based on retention policies
- **Log Aggregation** - Aggregate logs from multiple services/instances
- **Performance Metrics** - Track logging performance (latency, throughput)
- **Custom Formatters** - Support for custom log formatters beyond JSON/pretty
- **Log Sampling** - Advanced sampling strategies (adaptive, priority-based)

### Medium-term Enhancements

- **Distributed Tracing** - Full OpenTelemetry integration with trace correlation
- **Log Correlation** - Correlate logs across services using trace IDs
- **Real-time Log Streaming** - WebSocket-based real-time log streaming
- **Log Search** - Full-text search across log files with indexing
- **Log Alerts** - Alert on error patterns or threshold breaches
- **Log Dashboards** - Pre-built dashboards for common log metrics
- **Log Export** - Export logs to external systems (Elasticsearch, Splunk, etc.)
- **Multi-tenant Logging** - Tenant isolation in multi-tenant applications

### Long-term Enhancements

- **AI-Powered Log Analysis** - Machine learning for anomaly detection
- **Predictive Logging** - Predict and log before errors occur
- **Log Playback** - Replay logs for debugging and testing
- **Log Visualization** - Advanced visualizations (timeline, heatmaps, etc.)
- **Compliance Logging** - Built-in compliance features (GDPR, HIPAA, etc.)
- **Log Encryption at Rest** - Encrypt log files on disk
- **Log Streaming to Cloud** - Direct streaming to cloud log services
- **Log Cost Optimization** - Optimize log storage costs with intelligent archiving
