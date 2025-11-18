# Testing Module

Standardized utilities for testing applications in this ecosystem.

## Usage

```typescript
import { createMockLogger, createMockSupabase } from './modules/testing-module';

test('should log user login', () => {
  const mockLogger = createMockLogger();
  const service = new UserService(mockLogger);
  
  service.login('user-1');
  
  expect(mockLogger.info).toHaveBeenCalledWith('User logged in');
});
```

