# Testing Module

Standardized utilities for testing applications in this ecosystem.

**For comprehensive testing standards and best practices, see:** [`standards/testing.md`](../../standards/testing.md)

## Overview

This module provides reusable mock utilities for common dependencies used across the codebase:
- **Supabase Client Mock** - Chainable mock for Supabase queries
- **Logger Mock** - Mock logger for testing logging behavior

## Installation

This module is part of the project's internal modules. Import directly:

```typescript
import { createMockSupabase, createMockLogger } from '@/modules/testing-module';
// or
import { createMockSupabase, createMockLogger } from './modules/testing-module';
```

## Dependencies

- `vitest` - Testing framework (required)

## Usage

### createMockSupabase()

Creates a mock Supabase client that mimics the chainable API. Use this for unit tests that interact with Supabase.

#### Basic Usage

```typescript
import { describe, it, expect } from 'vitest';
import { createMockSupabase } from '@/modules/testing-module';
import { UserService } from '@/services/user-service';

describe('UserService', () => {
  it('should fetch user data', async () => {
    // Arrange
    const mockSupabase = createMockSupabase();
    const userData = { id: '123', email: 'test@example.com', name: 'Test User' };
    mockSupabase.mockSuccess([userData]);

    // Act
    const result = await mockSupabase.from('users').select('*').eq('id', '123').single();

    // Assert
    expect(result.data).toEqual(userData);
    expect(result.error).toBeNull();
    expect(mockSupabase.from).toHaveBeenCalledWith('users');
  });
});
```

#### Mocking Successful Responses

```typescript
const mockSupabase = createMockSupabase();

// Mock a successful query result
mockSupabase.mockSuccess([
  { id: '1', name: 'User 1' },
  { id: '2', name: 'User 2' },
]);

const { data } = await mockSupabase.from('users').select('*');
expect(data).toHaveLength(2);
```

#### Mocking Error Responses

```typescript
const mockSupabase = createMockSupabase();

// Mock a database error
mockSupabase.mockError('Connection timeout');

const { data, error } = await mockSupabase.from('users').select('*');
expect(data).toBeNull();
expect(error).toBeDefined();
expect(error.message).toBe('Connection timeout');
```

#### Testing Chained Queries

```typescript
const mockSupabase = createMockSupabase();
mockSupabase.mockSuccess([{ id: '123', email: 'test@example.com' }]);

// Test chained query methods
await mockSupabase
  .from('users')
  .select('*')
  .eq('email', 'test@example.com')
  .order('created_at', { ascending: false })
  .single();

expect(mockSupabase.from).toHaveBeenCalledWith('users');
expect(mockSupabase.eq).toHaveBeenCalledWith('email', 'test@example.com');
expect(mockSupabase.order).toHaveBeenCalled();
```

#### Testing Insert Operations

```typescript
const mockSupabase = createMockSupabase();

const newUser = { email: 'new@example.com', name: 'New User' };
const result = await mockSupabase.from('users').insert(newUser);

expect(mockSupabase.insert).toHaveBeenCalledWith(newUser);
expect(result.data).toBeDefined();
```

### createMockLogger()

Creates a mock logger that provides Vitest mock functions for all logger methods. Use this to test logging behavior without actually logging.

#### Basic Usage

```typescript
import { describe, it, expect } from 'vitest';
import { createMockLogger } from '@/modules/testing-module';
import { UserService } from '@/services/user-service';

describe('UserService', () => {
  it('should log user login', () => {
    // Arrange
    const mockLogger = createMockLogger();
    const service = new UserService(mockLogger);
    
    // Act
    service.login('user-1');
    
    // Assert
    expect(mockLogger.info).toHaveBeenCalledWith('User logged in', {
      userId: 'user-1',
    });
  });
});
```

#### Testing Different Log Levels

```typescript
const mockLogger = createMockLogger();
const service = new UserService(mockLogger);

// Test info logging
service.createUser({ email: 'test@example.com' });
expect(mockLogger.info).toHaveBeenCalled();

// Test error logging
await service.deleteUser('invalid-id');
expect(mockLogger.error).toHaveBeenCalledWith(
  'Failed to delete user',
  expect.any(Error)
);

// Test success logging
await service.updateUser('123', { name: 'Updated' });
expect(mockLogger.success).toHaveBeenCalledWith('User updated successfully');
```

#### Testing Logger with Metadata

```typescript
const mockLogger = createMockLogger();
const service = new UserService(mockLogger);

service.processPayment({ amount: 100, currency: 'USD' });

expect(mockLogger.info).toHaveBeenCalledWith('Payment processed', {
  amount: 100,
  currency: 'USD',
  timestamp: expect.any(Date),
});
```

#### Testing Logger Child Context

```typescript
const mockLogger = createMockLogger();
const childLogger = mockLogger.child({ requestId: 'req-123' });

// Verify child logger returns itself (for chaining)
expect(childLogger).toBe(mockLogger);
expect(mockLogger.child).toHaveBeenCalledWith({ requestId: 'req-123' });
```

## Complete Example

Here's a complete example showing how to use both mocks together:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { createMockSupabase, createMockLogger } from '@/modules/testing-module';
import { UserService } from '@/services/user-service';

describe('UserService', () => {
  let mockSupabase: ReturnType<typeof createMockSupabase>;
  let mockLogger: ReturnType<typeof createMockLogger>;
  let userService: UserService;

  beforeEach(() => {
    mockSupabase = createMockSupabase();
    mockLogger = createMockLogger();
    userService = new UserService(mockSupabase, mockLogger);
  });

  it('should create a user and log success', async () => {
    // Arrange
    const userData = { email: 'test@example.com', name: 'Test User' };
    const createdUser = { id: '123', ...userData, created_at: new Date() };
    mockSupabase.mockSuccess(createdUser);

    // Act
    const result = await userService.createUser(userData);

    // Assert
    expect(result).toEqual(createdUser);
    expect(mockSupabase.from).toHaveBeenCalledWith('users');
    expect(mockSupabase.insert).toHaveBeenCalledWith(userData);
    expect(mockLogger.info).toHaveBeenCalledWith('User created', {
      userId: '123',
      email: 'test@example.com',
    });
  });

  it('should handle database errors gracefully', async () => {
    // Arrange
    mockSupabase.mockError('Database connection failed');

    // Act & Assert
    await expect(userService.getUser('123')).rejects.toThrow('Failed to fetch user');
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Failed to fetch user',
      expect.any(Error)
    );
  });
});
```

## Best Practices

1. **Always use mocks in unit tests** - Never make real database calls in unit tests
2. **Verify mock interactions** - Check that mocks were called with correct parameters
3. **Reset mocks between tests** - Use `beforeEach` to create fresh mocks
4. **Test error scenarios** - Use `mockError()` to test error handling
5. **Use descriptive test names** - Follow the pattern: `should [expected behavior] when [condition]`

For more testing best practices and standards, see [`standards/testing.md`](../../standards/testing.md).

## Related Documentation

- **Integration Guide:** [`INTEGRATION_GUIDE.md`](INTEGRATION_GUIDE.md) - Complete step-by-step integration guide
- **Testing Standards:** [`standards/testing.md`](../../standards/testing.md) - Comprehensive testing standards and best practices
- **Module Structure:** [`standards/module-structure.md`](../../standards/module-structure.md) - Module organization standards
- **Project Structure:** [`standards/project-structure.md`](../../standards/project-structure.md) - Test directory organization

