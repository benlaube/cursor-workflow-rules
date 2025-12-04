# Testing Module Integration Guide v1.0

**Created:** 2025-01-27  
**Last Updated:** 2025-01-27  
**Purpose:** Complete step-by-step guide for integrating the testing module into your project

---

## 1. Overview

The testing module provides standardized mock utilities for testing applications in this ecosystem:

- **Supabase Client Mock** - Chainable mock for Supabase queries
- **Logger Mock** - Mock logger for testing logging behavior

This guide walks you through integrating these utilities into your project's test suite.

**For comprehensive testing standards, see:** [`standards/testing.md`](../../standards/testing.md)

---

## 2. Prerequisites

- TypeScript/JavaScript project
- Vitest testing framework (or willingness to set it up)
- Tests using Supabase client or logger module

---

## 3. Quick Start

### Option 1: Copy Module Files (Recommended)

Copy the entire `modules/testing-module/` directory to your project:

```bash
# Option 1: Copy to lib directory
cp -r modules/testing-module lib/testing-module

# Option 2: Copy to src directory
cp -r modules/testing-module src/lib/testing-module

# Option 3: Keep in modules directory (if using monorepo structure)
# No copying needed, just update import paths
```

### Option 2: Install as Dependency (Future)

```bash
npm install @your-org/testing-module
```

---

## 4. Step-by-Step Integration

### Step 1: Install Vitest (If Not Already Installed)

The testing module requires Vitest as a dependency:

```bash
npm install -D vitest @vitest/ui
```

Or with your preferred package manager:

```bash
yarn add -D vitest @vitest/ui
pnpm add -D vitest @vitest/ui
```

### Step 2: Configure Vitest

Create or update `vitest.config.ts` in your project root:

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true, // Enable global test functions (describe, it, expect)
    environment: 'node', // or 'jsdom' for React components
    setupFiles: ['./tests/setup.ts'], // Optional: test setup file
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Adjust to your project structure
      '@/modules': path.resolve(__dirname, './modules'), // If using modules directory
    },
  },
});
```

### Step 3: Update Package.json Scripts

Add test scripts to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Step 4: Update Import Paths

Update imports in the testing module to match your project structure:

**If copied to `lib/testing-module/`:**

```typescript
// No changes needed - imports will work as-is
import { createMockSupabase, createMockLogger } from '@/lib/testing-module';
```

**If copied to `src/lib/testing-module/`:**

```typescript
import { createMockSupabase, createMockLogger } from '@/lib/testing-module';
```

**If kept in `modules/testing-module/`:**

```typescript
import { createMockSupabase, createMockLogger } from '@/modules/testing-module';
```

### Step 5: Create Test Setup File (Optional)

Create `tests/setup.ts` for global test configuration:

```typescript
import { vi } from 'vitest';

// Global test setup
beforeEach(() => {
  // Reset mocks between tests
  vi.clearAllMocks();
});

// Global test teardown
afterEach(() => {
  // Clean up after tests
});
```

Update `vitest.config.ts` to use it:

```typescript
export default defineConfig({
  test: {
    setupFiles: ['./tests/setup.ts'],
  },
});
```

---

## 5. Usage Examples

### 5.1 Testing Services with Supabase

```typescript
// tests/services/user-service.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createMockSupabase } from '@/lib/testing-module';
import { UserService } from '@/services/user-service';

describe('UserService', () => {
  let mockSupabase: ReturnType<typeof createMockSupabase>;
  let userService: UserService;

  beforeEach(() => {
    mockSupabase = createMockSupabase();
    userService = new UserService(mockSupabase);
  });

  it('should fetch user by ID', async () => {
    // Arrange
    const userData = { id: '123', email: 'test@example.com', name: 'Test User' };
    mockSupabase.mockSuccess(userData);

    // Act
    const result = await userService.getUser('123');

    // Assert
    expect(result).toEqual(userData);
    expect(mockSupabase.from).toHaveBeenCalledWith('users');
    expect(mockSupabase.eq).toHaveBeenCalledWith('id', '123');
  });

  it('should handle database errors', async () => {
    // Arrange
    mockSupabase.mockError('Connection timeout');

    // Act & Assert
    await expect(userService.getUser('123')).rejects.toThrow();
    expect(mockSupabase.from).toHaveBeenCalledWith('users');
  });
});
```

### 5.2 Testing Services with Logger

```typescript
// tests/services/payment-service.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createMockLogger } from '@/lib/testing-module';
import { PaymentService } from '@/services/payment-service';

describe('PaymentService', () => {
  let mockLogger: ReturnType<typeof createMockLogger>;
  let paymentService: PaymentService;

  beforeEach(() => {
    mockLogger = createMockLogger();
    paymentService = new PaymentService(mockLogger);
  });

  it('should log payment processing', async () => {
    // Arrange
    const paymentData = { amount: 100, currency: 'USD' };

    // Act
    await paymentService.processPayment(paymentData);

    // Assert
    expect(mockLogger.info).toHaveBeenCalledWith('Processing payment', {
      amount: 100,
      currency: 'USD',
    });
    expect(mockLogger.success).toHaveBeenCalledWith('Payment processed successfully');
  });

  it('should log errors on failure', async () => {
    // Arrange
    const invalidPayment = { amount: -100 };

    // Act
    await expect(paymentService.processPayment(invalidPayment)).rejects.toThrow();

    // Assert
    expect(mockLogger.error).toHaveBeenCalledWith('Payment processing failed', expect.any(Error));
  });
});
```

### 5.3 Testing Services with Both Mocks

```typescript
// tests/services/order-service.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createMockSupabase, createMockLogger } from '@/lib/testing-module';
import { OrderService } from '@/services/order-service';

describe('OrderService', () => {
  let mockSupabase: ReturnType<typeof createMockSupabase>;
  let mockLogger: ReturnType<typeof createMockLogger>;
  let orderService: OrderService;

  beforeEach(() => {
    mockSupabase = createMockSupabase();
    mockLogger = createMockLogger();
    orderService = new OrderService(mockSupabase, mockLogger);
  });

  it('should create order and log success', async () => {
    // Arrange
    const orderData = { userId: '123', items: [{ id: 'item-1', quantity: 2 }] };
    const createdOrder = { id: 'order-456', ...orderData, status: 'pending' };
    mockSupabase.mockSuccess(createdOrder);

    // Act
    const result = await orderService.createOrder(orderData);

    // Assert
    expect(result).toEqual(createdOrder);
    expect(mockSupabase.from).toHaveBeenCalledWith('orders');
    expect(mockSupabase.insert).toHaveBeenCalledWith(orderData);
    expect(mockLogger.info).toHaveBeenCalledWith('Order created', {
      orderId: 'order-456',
      userId: '123',
    });
  });
});
```

### 5.4 Testing React Components (with jsdom)

For React component testing, configure Vitest with jsdom:

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom', // Enable DOM APIs
    globals: true,
  },
});
```

```typescript
// tests/components/UserProfile.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMockLogger } from '@/lib/testing-module';
import { UserProfile } from '@/components/UserProfile';

describe('UserProfile', () => {
  it('should render user information', () => {
    const mockLogger = createMockLogger();
    const user = { id: '123', name: 'Test User', email: 'test@example.com' };

    render(<UserProfile user={user} logger={mockLogger} />);

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });
});
```

---

## 6. Advanced Usage

### 6.1 Custom Mock Configuration

Extend the mocks for custom behavior:

```typescript
import { createMockSupabase } from '@/lib/testing-module';

describe('CustomService', () => {
  it('should handle custom query chains', () => {
    const mockSupabase = createMockSupabase();

    // Customize mock behavior
    mockSupabase.select.mockReturnValueOnce({
      eq: mockSupabase.eq,
      data: [{ id: '1' }],
      error: null,
    });

    const result = mockSupabase.from('custom').select('*');
    expect(result.data).toEqual([{ id: '1' }]);
  });
});
```

### 6.2 Testing Async Operations

```typescript
it('should handle async operations correctly', async () => {
  const mockSupabase = createMockSupabase();
  const userData = { id: '123', name: 'Test' };
  mockSupabase.mockSuccess(userData);

  // Use async/await
  const result = await mockSupabase.from('users').select('*').single();

  expect(result.data).toEqual(userData);
  expect(result.error).toBeNull();
});
```

### 6.3 Testing Error Scenarios

```typescript
it('should handle various error types', async () => {
  const mockSupabase = createMockSupabase();

  // Test connection errors
  mockSupabase.mockError('Connection timeout');
  let result = await mockSupabase.from('users').select('*');
  expect(result.error?.message).toBe('Connection timeout');

  // Test validation errors
  mockSupabase.mockError('Invalid query');
  result = await mockSupabase.from('users').select('*');
  expect(result.error?.message).toBe('Invalid query');
});
```

### 6.4 Verifying Mock Calls

```typescript
it('should verify all mock interactions', async () => {
  const mockSupabase = createMockSupabase();
  mockSupabase.mockSuccess([{ id: '123' }]);

  await mockSupabase
    .from('users')
    .select('id, name')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  // Verify all calls
  expect(mockSupabase.from).toHaveBeenCalledWith('users');
  expect(mockSupabase.select).toHaveBeenCalledWith('id, name');
  expect(mockSupabase.eq).toHaveBeenCalledWith('status', 'active');
  expect(mockSupabase.order).toHaveBeenCalled();
});
```

---

## 7. Integration with Existing Test Suites

### 7.1 Migrating from Jest

If you're migrating from Jest to Vitest:

1. **Update imports:**

   ```typescript
   // Before (Jest)
   import { describe, it, expect } from '@jest/globals';

   // After (Vitest)
   import { describe, it, expect } from 'vitest';
   ```

2. **Update mock functions:**

   ```typescript
   // Before (Jest)
   const mockFn = jest.fn();

   // After (Vitest)
   import { vi } from 'vitest';
   const mockFn = vi.fn();
   ```

3. **The testing module mocks work the same way** - no changes needed!

### 7.2 Integrating with Existing Mocks

If you already have custom mocks, you can use them alongside the testing module:

```typescript
import { createMockSupabase } from '@/lib/testing-module';
import { createCustomMock } from '@/tests/utils/custom-mocks';

describe('Service', () => {
  it('should work with both mocks', () => {
    const mockSupabase = createMockSupabase();
    const customMock = createCustomMock();

    // Use both as needed
  });
});
```

---

## 8. Testing Best Practices

### 8.1 Always Reset Mocks

```typescript
describe('Service', () => {
  let mockSupabase: ReturnType<typeof createMockSupabase>;

  beforeEach(() => {
    // Create fresh mocks for each test
    mockSupabase = createMockSupabase();
  });
});
```

### 8.2 Use Descriptive Test Names

```typescript
// Good
it('should return user data when valid ID is provided', () => {});

// Bad
it('test user', () => {});
```

### 8.3 Follow AAA Pattern

```typescript
it('should create a user', async () => {
  // Arrange
  const mockSupabase = createMockSupabase();
  const userData = { email: 'test@example.com' };
  mockSupabase.mockSuccess({ id: '123', ...userData });

  // Act
  const result = await createUser(mockSupabase, userData);

  // Assert
  expect(result.id).toBe('123');
});
```

### 8.4 Test Error Scenarios

```typescript
it('should handle database errors gracefully', async () => {
  const mockSupabase = createMockSupabase();
  mockSupabase.mockError('Connection failed');

  await expect(getUser(mockSupabase, '123')).rejects.toThrow();
});
```

---

## 9. Troubleshooting

### "Cannot find module '@/lib/testing-module'"

**Issue:** Import path not resolved.

**Solutions:**

1. Check `vitest.config.ts` has correct alias configuration
2. Verify the module files are in the expected location
3. Update import path to match your project structure

```typescript
// vitest.config.ts
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
    '@/lib': path.resolve(__dirname, './lib'),
  },
}
```

### "Mock functions not working"

**Issue:** Mocks not being called or returning unexpected values.

**Solutions:**

1. Ensure you're calling `mockSuccess()` or `mockError()` before using the mock
2. Reset mocks between tests using `beforeEach`
3. Verify you're using the mock instance, not creating new ones

```typescript
beforeEach(() => {
  mockSupabase = createMockSupabase(); // Create fresh mock
  mockSupabase.mockSuccess([]); // Set default behavior
});
```

### "Type errors with mock return values"

**Issue:** TypeScript complaining about mock types.

**Solutions:**

1. Use type assertions if needed:

   ```typescript
   const result = (await mockSupabase.from('users').select('*')) as { data: User[]; error: null };
   ```

2. Create typed helper functions:

   ```typescript
   function createTypedMock<T>() {
     const mock = createMockSupabase();
     return mock as unknown as SupabaseClient<T>;
   }
   ```

### "Tests passing but real code failing"

**Issue:** Mock doesn't match real Supabase API.

**Solutions:**

1. Verify mock behavior matches real Supabase client
2. Add integration tests to catch API mismatches
3. Update mock implementation if Supabase API changes

---

## 10. Configuration Options

### 10.1 TypeScript Configuration

Ensure your `tsconfig.json` includes test files:

```json
{
  "compilerOptions": {
    "types": ["vitest/globals"],
    "paths": {
      "@/*": ["./src/*"],
      "@/lib/*": ["./lib/*"]
    }
  },
  "include": ["src/**/*", "tests/**/*"]
}
```

### 10.2 Vitest Configuration

Full example `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/', '*.config.*'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/modules': path.resolve(__dirname, './modules'),
    },
  },
});
```

---

## 11. Migration from Manual Mocks

### Before (Manual Mock)

```typescript
// tests/mocks/supabase.ts
export const createMockSupabase = () => ({
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnValue({
      data: [],
      error: null,
    }),
  }),
});
```

### After (Using Testing Module)

```typescript
import { createMockSupabase } from '@/lib/testing-module';

// No manual mock code needed!
const mockSupabase = createMockSupabase();
mockSupabase.mockSuccess([{ id: '123' }]);
```

**Benefits:**

- ✅ Consistent mock API across projects
- ✅ Less boilerplate code
- ✅ Built-in helper methods (`mockSuccess`, `mockError`)
- ✅ Chainable query support

---

## 12. Related Documentation

- **Testing Standards:** [`standards/testing.md`](../../standards/testing.md) - Comprehensive testing standards and best practices
- **Module README:** [`modules/testing-module/README.md`](README.md) - Module overview and API reference
- **Module Structure:** [`standards/module-structure.md`](../../standards/module-structure.md) - Module organization standards
- **Project Structure:** [`standards/project-structure.md`](../../standards/project-structure.md) - Test directory organization

---

## 13. Summary

The testing module provides:

✅ **Standardized mocks** - Consistent API across all projects  
✅ **Easy integration** - Copy files and update imports  
✅ **TypeScript support** - Full type safety  
✅ **Vitest compatibility** - Works seamlessly with Vitest  
✅ **Helper methods** - `mockSuccess()` and `mockError()` for common scenarios

Follow the integration steps above to add standardized testing utilities to your project!

---

_Last Updated: 2025-01-27_
