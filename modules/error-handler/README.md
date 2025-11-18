# Error Handler & Auto-Healing Module

Standardized error handling patterns and retry logic for robust applications.

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

