# Logger Module

A standardized, structured logger based on Pino.

## Usage

```typescript
import { createLogger } from './modules/logger-module';

const logger = createLogger('my-service');

logger.info('Service started');
logger.error('Something went wrong', new Error('Database failed'));
```

## Features

- **Structured JSON logs** in production (for easy parsing by observability tools).
- **Pretty printing** in development.
- Standardized log levels.

