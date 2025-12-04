# Error Handler & Auto-Healing Module

## Metadata

- **Module:** error-handler
- **Version:** 1.0.0
- **Created:** 2025-01-27
- **Last Updated:** 2025-01-27
- **Description:** Standardized error handling patterns, retry logic, circuit breaker, and log analysis for robust applications

## What It Does

This module provides a comprehensive error handling system that helps you build resilient applications by:

- **Eliminating try/catch hell** - Uses the Result pattern (inspired by Rust/Go) to handle errors explicitly
- **Automatic retry logic** - Recovers from transient failures (network blips, temporary service outages) with exponential backoff
- **Circuit breaker pattern** - Prevents cascading failures by stopping calls to failing services
- **Log analysis** - Automatically extracts and categorizes errors from log files for debugging and auto-healing

The module is designed to work seamlessly with the `logger-module` and integrates with the auto-healing runtime rules (`.cursor/rules/auto-heal.mdc`).

## Features

- ✅ **Result Pattern** - Type-safe error handling without try/catch blocks
- ✅ **Safe Promise Wrapper** - Converts promise rejections into Result types
- ✅ **Retry Logic** - Automatic retry with exponential backoff and configurable retry conditions
- ✅ **Circuit Breaker** - Prevents cascading failures in distributed systems
- ✅ **Log Analysis** - Parse and extract errors from log files
- ✅ **Error Categorization** - Automatically categorize errors as auto-fixable, propose-fix, or investigate
- ✅ **Stack Trace Parsing** - Extract file paths and line numbers from stack traces
- ✅ **Error Deduplication** - Group similar errors and count occurrences

## Installation

### Copy the Module

Copy this module to your project:

```bash
cp -r modules/error-handler /path/to/your/project/lib/error-handler
```

### Dependencies

The module has minimal dependencies. Install if needed:

```bash
# For Node.js file system operations (log-analyzer)
# No additional dependencies required - uses Node.js built-ins
```

**Note:** The module uses TypeScript and requires a TypeScript environment. It works in both Node.js and browser environments (log-analyzer is Node.js only).

## Quick Start

### 1. Import the Module

```typescript
import { safe, AppError, Result } from '@/lib/error-handler';
import { withRetry } from '@/lib/error-handler/retry';
import { CircuitBreaker } from '@/lib/error-handler/circuit-breaker';
```

### 2. Use Result Pattern for Error Handling

```typescript
import { safe } from '@/lib/error-handler';

// Instead of try/catch
const result = await safe(apiCall());
if (!result.ok) {
  console.error(result.error.message);
  return;
}
// Access result.value safely
console.log(result.value);
```

### 3. Add Retry Logic

```typescript
import { withRetry } from '@/lib/error-handler/retry';

const result = await withRetry(() => fetch('https://api.example.com/data'), {
  retries: 3,
  delay: 1000,
  shouldRetry: (e) => e.status === 503, // Only retry on 503 errors
});
```

## Usage

### Result Pattern

Avoid `try/catch` hell by using the `Result` type. This pattern forces you to check for errors explicitly before accessing values.

```typescript
import { safe, ok, err, AppError, Result } from '@/lib/error-handler';

// Wrap any promise
const result = await safe(apiCall());

// Check result
if (!result.ok) {
  console.error(result.error.message);
  console.error(result.error.code); // Error code
  console.error(result.error.statusCode); // HTTP status code
  return;
}

// Access value safely
console.log(result.value);

// Manual Result creation
const success = ok({ data: 'value' });
const failure = err(new AppError('Not found', 'NOT_FOUND', 404));
```

### AppError Class

Create structured errors with codes and status codes:

```typescript
import { AppError } from '@/lib/error-handler';

// Operational error (expected, can be handled)
throw new AppError('User not found', 'USER_NOT_FOUND', 404, true);

// Programmer error (bug, should crash)
throw new AppError('Undefined is not a function', 'PROGRAMMER_ERROR', 500, false);
```

### Auto-Healing (Retry)

Automatically recover from transient failures (e.g., network blips, temporary service outages).

```typescript
import { withRetry } from '@/lib/error-handler/retry';

// Basic retry (3 attempts, 1s delay, exponential backoff)
const result = await withRetry(() => fetch('https://api.example.com/data'), {
  retries: 3,
  delay: 1000,
});

// Custom retry configuration
const result = await withRetry(() => apiCall(), {
  retries: 5,
  delay: 500,
  backoffFactor: 2, // 500ms -> 1000ms -> 2000ms -> 4000ms
  shouldRetry: (error) => {
    // Only retry on network errors or 503
    return error.code === 'ECONNREFUSED' || error.status === 503;
  },
});

if (!result.ok) {
  console.error('Failed after retries:', result.error.message);
}
```

### Circuit Breaker

Prevents cascading failures by stopping calls to failing services.

```typescript
import { CircuitBreaker } from '@/lib/error-handler/circuit-breaker';

const breaker = new CircuitBreaker(
  5, // failureThreshold: Open after 5 failures
  10000 // resetTimeout: Try again after 10 seconds
);

try {
  const data = await breaker.execute(() => apiCall());
  console.log(data);
} catch (error) {
  // Circuit is open - service is failing
  console.error('Service unavailable');
}
```

### Log Analysis

Analyze log files to extract errors and identify issues.

```typescript
import { analyzeLogs, categorizeError } from '@/lib/error-handler';

// Analyze logs in ./logs directory
const result = await analyzeLogs({
  logDir: './logs',
  maxEntries: 100,
  timeRange: 3600000, // Last hour
  minLevel: 'error',
});

if (result.ok) {
  for (const error of result.value) {
    const category = categorizeError(error);
    console.log(`${category}: ${error.message}`);

    if (error.filePath && error.lineNumber) {
      console.log(`  at ${error.filePath}:${error.lineNumber}`);
    }

    if (error.count && error.count > 1) {
      console.log(`  (occurred ${error.count} times)`);
    }
  }
}
```

### Error Categorization

Automatically categorize errors for auto-healing strategies:

```typescript
import { categorizeError, LogError } from '@/lib/error-handler';

const error: LogError = {
  message: 'Module not found: ./utils',
  filePath: '/path/to/file.ts',
  lineNumber: 42,
};

const category = categorizeError(error);
// Returns: 'auto-fix' | 'propose-fix' | 'investigate'

switch (category) {
  case 'auto-fix':
    // Syntax errors, missing imports, type errors
    // Can be fixed automatically
    break;
  case 'propose-fix':
    // Logic errors, business rule violations
    // Need human review
    break;
  case 'investigate':
    // Unknown errors, complex failures
    // Require investigation
    break;
}
```

## Integration

### With Logger Module

The error-handler module integrates seamlessly with the logger-module:

```typescript
import { setupLogger } from '@/lib/logger-module';
import { safe, AppError } from '@/lib/error-handler';

const logger = setupLogger('my-service', {
  env: 'production',
  serviceName: 'api',
});

const result = await safe(apiCall());
if (!result.ok) {
  logger.error('API call failed', result.error);
}
```

### With Backend API Module

Use in Next.js API routes with the backend-api module:

```typescript
import { createApiHandler } from '@/lib/backend-api';
import { safe, AppError } from '@/lib/error-handler';

export const GET = createApiHandler({
  handler: async ({ ctx }) => {
    const result = await safe(databaseQuery());

    if (!result.ok) {
      throw new AppError(result.error.message, result.error.code, result.error.statusCode);
    }

    return result.value;
  },
});
```

### With Auto-Healing Rules

The module is designed to work with the auto-healing runtime rules (`.cursor/rules/auto-heal.mdc`):

- **Port conflicts** - Use retry logic for transient port issues
- **Database connections** - Use circuit breaker for failing database services
- **Network errors** - Use retry with exponential backoff
- **Log analysis** - Automatically analyze logs for errors

## API Reference

### Core Exports

- `AppError` - Structured error class with code and status code
- `Result<T, E>` - Result type for error handling
- `ok<T>(value: T)` - Create success result
- `err<E>(error: E)` - Create error result
- `safe<T>(promise: Promise<T>)` - Wrap promise in Result type

### Retry Module

- `withRetry<T>(operation, options)` - Retry operation with exponential backoff
- `RetryOptions` - Configuration interface

### Circuit Breaker Module

- `CircuitBreaker` - Circuit breaker class
- `execute<T>(operation)` - Execute operation through circuit breaker

### Log Analyzer Module

- `analyzeLogs(options)` - Analyze log files for errors
- `parseLogLine(line)` - Parse single log line
- `parseStackTrace(stackTrace)` - Extract file paths from stack trace
- `categorizeError(error)` - Categorize error for auto-healing
- `LogError` - Error interface
- `LogAnalyzerOptions` - Configuration interface

## Related Documentation

- `modules/logger-module/` - Logging module (integrated with error-handler)
- `modules/backend-api/` - API handler module (uses error-handler)
- `.cursor/rules/auto-heal.mdc` - Auto-healing runtime rules
- `standards/process/code-quality-linting-standards.md` - Code quality standards

## Possible Enhancements

### Short-term Improvements

- **Jitter for Retry** - Add random jitter to retry delays to prevent synchronized retries in distributed systems
- **Retry Metrics** - Track retry success rates and failure patterns
- **Circuit Breaker Metrics** - Monitor circuit breaker state changes and failure rates
- **Log Analysis UI** - Web interface for viewing analyzed logs
- **Error Aggregation** - Group similar errors across multiple log files

### Medium-term Enhancements

- **Distributed Circuit Breaker** - Share circuit breaker state across multiple instances (Redis-based)
- **Adaptive Retry** - Automatically adjust retry delays based on success rates
- **Error Prediction** - Machine learning to predict which errors are likely to occur
- **Auto-Fix Suggestions** - Generate code suggestions for auto-fixable errors
- **Error Correlation** - Correlate errors across different services

### Long-term Enhancements

- **Error Budget Tracking** - Track error rates against SLOs
- **Automated Rollback** - Automatically rollback deployments on error spikes
- **Error Pattern Detection** - Detect recurring error patterns and suggest fixes
- **Integration with Monitoring** - Export metrics to Prometheus, Datadog, etc.
- **Error Playbook Generation** - Automatically generate runbooks for common errors
