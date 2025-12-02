# Error Handler & Auto-Healing Module

Standardized error handling patterns, retry logic, and log analysis for robust applications.

## Usage

### Result Pattern
Avoid `try/catch` hell by using the `Result` type.

```typescript
import { safe } from './modules/error-handler';

const result = await safe(apiCall());
if (!result.ok) {
  console.error(result.error.message);
  return;
}
console.log(result.value);
```

### Auto-Healing (Retry)
Automatically recover from transient failures (e.g., network blips).

```typescript
import { withRetry } from './modules/error-handler/retry';

const result = await withRetry(
  () => fetch('https://api.example.com/data'),
  { retries: 3, delay: 1000 }
);
```

### Log Analysis
Analyze log files to extract errors and identify issues.

```typescript
import { analyzeLogs, categorizeError } from './modules/error-handler';

// Analyze logs in ./logs directory
const result = await analyzeLogs({ logDir: './logs', maxEntries: 100 });

if (result.ok) {
  for (const error of result.value) {
    const category = categorizeError(error);
    console.log(`${category}: ${error.message} at ${error.filePath}:${error.lineNumber}`);
  }
}
```

