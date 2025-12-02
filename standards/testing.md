# Rule: Testing_Standards_v1.0

## Metadata
- **Created:** 2025-01-27
- **Last Updated:** 2025-01-27
- **Version:** 1.0
- **Description:** Comprehensive testing standards covering TypeScript (Vitest), Python (pytest), E2E testing, and CI/CD integration with specific coverage requirements and best practices.

## When to Apply This Rule
Apply this rule when:
- Writing new tests for any module or application
- Setting up test infrastructure for a new project
- Reviewing test coverage and quality
- Integrating tests into CI/CD pipelines
- Creating test utilities or mocks

## 1. High-Level Goals
- **Reliability:** Tests must be deterministic and provide confidence in code quality
- **Speed:** Unit tests should run fast (< 1 second per test file)
- **Coverage:** Achieve 80%+ code coverage for unit tests, 100% for critical paths
- **Maintainability:** Tests should be easy to read, write, and maintain
- **Integration:** Tests must integrate seamlessly with development workflow and CI/CD

## 2. Testing Framework Standards

### 2.1 TypeScript/JavaScript Testing

#### Framework: Vitest
- **Primary Framework:** Vitest (already in use across the codebase)
- **Configuration:** Use `vitest.config.ts` at project root
- **Test Runner:** Vitest (Jest-compatible API)

#### Test File Naming
- **Unit Tests:** `*.test.ts` or `*.spec.ts`
- **Integration Tests:** `*.integration.test.ts` or place in `tests/integration/`
- **E2E Tests:** `*.e2e.test.ts` or place in `tests/e2e/`

#### Test Structure
- Mirror `src/` structure in `tests/` directory
- Example: `src/services/user-service.ts` → `tests/services/user-service.test.ts`
- Use `describe` blocks to group related tests
- Use `it` or `test` for individual test cases

#### Example Test Structure
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

  it('should create a user when valid data is provided', async () => {
    // Arrange
    const userData = { email: 'test@example.com', name: 'Test User' };
    mockSupabase.mockSuccess({ id: '123', ...userData });

    // Act
    const result = await userService.createUser(userData);

    // Assert
    expect(result).toBeDefined();
    expect(result.id).toBe('123');
    expect(mockSupabase.from).toHaveBeenCalledWith('users');
  });
});
```

### 2.2 Python Testing

#### Framework: pytest
- **Primary Framework:** pytest (used in `supabase-core-python` module)
- **Configuration:** Use `pytest.ini` or `pyproject.toml` for configuration
- **Test Discovery:** Automatically discovers `test_*.py` files

#### Test File Naming
- **Unit Tests:** `test_*.py`
- **Integration Tests:** `test_*_integration.py` or use markers
- **Fixtures:** `conftest.py` for shared fixtures

#### Test Markers
Use pytest markers to categorize tests:
```python
import pytest

@pytest.mark.unit
def test_user_creation():
    """Unit test - fast, no external dependencies."""
    pass

@pytest.mark.integration
def test_database_query():
    """Integration test - requires Supabase instance."""
    pass

@pytest.mark.framework
def test_fastapi_integration():
    """Framework-specific test."""
    pass
```

#### Example Test Structure
```python
import pytest
from supabase_core_python import create_client

class TestUserService:
    """Tests for user service functionality."""
    
    @pytest.mark.unit
    def test_normalize_email(self):
        """Test email normalization logic."""
        from supabase_core_python.utils import normalize_email
        assert normalize_email('Test@Example.COM') == 'test@example.com'
    
    @pytest.mark.integration
    def test_create_user(self, supabase_client):
        """Test user creation with real database."""
        response = supabase_client.table('users').insert({
            'email': 'test@example.com',
            'name': 'Test User'
        }).execute()
        assert response.data is not None
        assert response.data['email'] == 'test@example.com'
```

## 3. Test Organization Standards

### 3.1 Directory Structure

Follow `standards/project-structure.md` Section 3.2 for test organization:

```
/tests
  /unit              # Fast tests with mocks, no external dependencies
    /services
    /utils
    /components
  /integration       # Tests requiring real services (DB, APIs)
    /api
    /database
  /e2e               # Full browser-based tests (Playwright/Cypress)
    /auth
    /user-flows
```

### 3.2 Module Testing

Each module in `modules/` must have its own `tests/` directory following `standards/module-structure.md`:

```
modules/my-module/
├── index.ts
├── src/
│   └── my-service.ts
└── tests/
    └── my-service.test.ts
```

**Requirements:**
- Tests must mirror the module's source structure
- Each module must include unit tests for its core functionality
- Integration tests should be in a separate directory or clearly marked

### 3.3 Test Categories

#### Unit Tests
- **Location:** `tests/unit/` or `tests/*.test.ts` in modules
- **Speed:** Must run in < 1 second per test file
- **Dependencies:** No external services (use mocks)
- **Purpose:** Test individual functions, classes, and utilities

#### Integration Tests
- **Location:** `tests/integration/`
- **Speed:** May take longer (seconds to minutes)
- **Dependencies:** Require real services (Supabase, APIs)
- **Purpose:** Test module interactions, database operations, API calls

#### E2E Tests
- **Location:** `tests/e2e/`
- **Speed:** Slowest (minutes)
- **Dependencies:** Full application stack, browser
- **Purpose:** Test complete user workflows from browser perspective

## 4. Coverage Requirements

### 4.1 Unit Test Coverage

**Target:** 80%+ code coverage for all unit tests

**Focus Areas:**
- Business logic functions
- Utility functions
- Service classes
- Data transformation functions

**Exclusions (acceptable < 80%):**
- Simple getters/setters
- Type definitions
- Configuration files
- Error boundary components (test separately)

### 4.2 Integration Test Coverage

**Target:** All critical paths covered

**Required Coverage:**
- All API endpoints
- Database operations (CRUD)
- Authentication flows
- Module interactions
- Error handling paths

### 4.3 E2E Test Coverage

**Target:** All user-facing workflows

**Required Coverage:**
- User authentication (login, signup, logout)
- Primary user journeys
- Critical business workflows
- Error scenarios visible to users

### 4.4 Coverage Reporting

**Generate Coverage Reports:**
- **TypeScript:** Use `vitest --coverage` with `@vitest/coverage-v8`
- **Python:** Use `pytest --cov` with `pytest-cov`
- **Format:** Generate HTML reports for detailed analysis
- **CI Integration:** Report coverage metrics in CI/CD pipeline

**Example Vitest Configuration:**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/', '*.config.*'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
```

## 5. Testing Best Practices

### 5.1 Test Writing Guidelines

#### Test Naming
Use descriptive test names following the pattern: `should [expected behavior] when [condition]`

**Good Examples:**
```typescript
it('should return user data when valid ID is provided', () => {});
it('should throw error when email is invalid', () => {});
it('should filter results when search query is provided', () => {});
```

**Bad Examples:**
```typescript
it('test user', () => {});
it('works', () => {});
it('test1', () => {});
```

#### AAA Pattern (Arrange, Act, Assert)
Structure tests using the AAA pattern:

```typescript
it('should create a user when valid data is provided', async () => {
  // Arrange
  const mockSupabase = createMockSupabase();
  const userData = { email: 'test@example.com', name: 'Test' };
  mockSupabase.mockSuccess({ id: '123', ...userData });

  // Act
  const result = await createUser(mockSupabase, userData);

  // Assert
  expect(result.id).toBe('123');
  expect(mockSupabase.from).toHaveBeenCalledWith('users');
});
```

#### One Assertion Per Test
Prefer one assertion per test for clarity. When multiple assertions are needed, group related checks:

```typescript
// Good: Related assertions grouped
it('should return valid user object', () => {
  const user = getUser('123');
  expect(user).toBeDefined();
  expect(user.id).toBe('123');
  expect(user.email).toContain('@');
});

// Bad: Unrelated assertions
it('should do everything', () => {
  expect(getUser('123')).toBeDefined();
  expect(validateEmail('test@example.com')).toBe(true);
  expect(formatDate(new Date())).toBe('2025-01-27');
});
```

#### Test Edge Cases and Errors
Always test:
- **Happy path:** Normal operation with valid inputs
- **Error cases:** Invalid inputs, missing data, network failures
- **Edge cases:** Empty arrays, null values, boundary conditions
- **Security:** Unauthorized access, invalid permissions

### 5.2 Mocking Standards

#### Use Testing Module Utilities
Always use `modules/testing-module` utilities for common mocks:

```typescript
import { createMockSupabase, createMockLogger } from '@/modules/testing-module';

// For Supabase mocks
const mockSupabase = createMockSupabase();
mockSupabase.mockSuccess([{ id: '1', name: 'Test' }]);

// For Logger mocks
const mockLogger = createMockLogger();
expect(mockLogger.info).toHaveBeenCalledWith('User created');
```

#### Mock External Dependencies
- **Always mock:** External APIs, databases, file systems, network requests
- **Never mock:** The code under test
- **Verify interactions:** Check that mocks were called with correct parameters

#### Mock Verification
Verify mock interactions when behavior matters:

```typescript
it('should log error when database query fails', async () => {
  const mockLogger = createMockLogger();
  const mockSupabase = createMockSupabase();
  mockSupabase.mockError('Database connection failed');

  await userService.getUser('123');

  expect(mockLogger.error).toHaveBeenCalledWith(
    'Failed to fetch user',
    expect.any(Error)
  );
});
```

### 5.3 Test Data Management

#### Use Factories or Builders
Create test data using factories or builders:

```typescript
// Factory function
function createTestUser(overrides = {}) {
  return {
    id: '123',
    email: 'test@example.com',
    name: 'Test User',
    created_at: new Date(),
    ...overrides,
  };
}

// Usage
const user = createTestUser({ email: 'custom@example.com' });
```

#### Clean Up Test Data
Always clean up test data after tests:

```typescript
describe('UserService', () => {
  let testUserIds: string[] = [];

  afterEach(async () => {
    // Clean up test data
    for (const id of testUserIds) {
      await testDb.deleteUser(id);
    }
    testUserIds = [];
  });

  it('should create a user', async () => {
    const user = await userService.createUser({ email: 'test@example.com' });
    testUserIds.push(user.id);
  });
});
```

#### Isolated Test Databases
- Use separate test databases for integration tests
- Never use production data in tests
- Reset database state between test runs

### 5.4 Test Performance

#### Fast Unit Tests
- Unit tests must complete in < 1 second per test file
- Use mocks instead of real services
- Avoid file I/O, network calls, or database operations

#### Efficient Integration Tests
- Use test databases, not production
- Clean up data efficiently (bulk operations)
- Use transactions where possible for rollback

## 6. CI/CD Integration

### 6.1 Pre-commit Checks

**Required Checks:**
- Run unit tests (fast feedback)
- Lint test files
- Type-check test files

**Example Husky Pre-commit Hook:**
```bash
#!/bin/sh
# Run unit tests
npm run test:unit

# Lint test files
npm run lint:test

# Type check
npm run type-check
```

### 6.2 PR Requirements

**All PRs Must:**
- ✅ All tests pass (unit, integration, E2E)
- ✅ Coverage thresholds met (80%+ for unit tests)
- ✅ No new linting errors
- ✅ Type checking passes

**Test Execution:**
- **Unit tests:** Run on every commit
- **Integration tests:** Run on PR creation/update
- **E2E tests:** Run on PR merge to main (or staging)

### 6.3 CI Pipeline Standards

#### GitHub Actions Example
```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:integration
      env:
        DATABASE_URL: postgres://postgres:postgres@localhost:5432/test

  e2e-tests:
    runs-on: ubuntu-latest
    needs: integration-tests
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:e2e
```

### 6.4 Coverage Reporting

**Requirements:**
- Generate coverage reports in CI
- Track coverage trends over time
- Fail builds if coverage drops below threshold
- Report coverage in PR comments (optional but recommended)

## 7. Module-Specific Testing

### 7.1 Testing Module Utilities

The `modules/testing-module` provides standardized testing utilities:

#### createMockSupabase()
Mocks Supabase client for unit tests:

```typescript
import { createMockSupabase } from '@/modules/testing-module';

const mockSupabase = createMockSupabase();

// Mock successful response
mockSupabase.mockSuccess([{ id: '1', name: 'Test' }]);
const result = await mockSupabase.from('users').select('*');
expect(result.data).toEqual([{ id: '1', name: 'Test' }]);

// Mock error response
mockSupabase.mockError('Database connection failed');
const errorResult = await mockSupabase.from('users').select('*');
expect(errorResult.error).toBeDefined();
```

#### createMockLogger()
Mocks logger for testing logging behavior:

```typescript
import { createMockLogger } from '@/modules/testing-module';

const mockLogger = createMockLogger();
const service = new UserService(mockSupabase, mockLogger);

service.createUser({ email: 'test@example.com' });

expect(mockLogger.info).toHaveBeenCalledWith('User created', {
  userId: expect.any(String),
});
```

**Reference:** See `modules/testing-module/README.md` for complete usage examples.

### 7.2 Supabase Testing

#### Local Supabase for Integration Tests
Use local Supabase instance for integration tests:

```typescript
import { createClient } from '@supabase/supabase-js';

describe('UserService Integration', () => {
  let supabase: ReturnType<typeof createClient>;

  beforeAll(async () => {
    // Verify Supabase is running
    const status = await exec('supabase status');
    if (!status.includes('API URL')) {
      throw new Error('Supabase not running. Run: supabase start');
    }

    // Get local credentials
    const { data } = await exec('supabase status --output json');
    const config = JSON.parse(data);
    
    supabase = createClient(config.API_URL, config.anon_key);
  });

  it('should create a user in database', async () => {
    const result = await supabase
      .from('users')
      .insert({ email: 'test@example.com', name: 'Test' })
      .select()
      .single();

    expect(result.data).toBeDefined();
    expect(result.data.email).toBe('test@example.com');
  });
});
```

#### Testing RLS Policies
RLS policies must be tested with integration tests:

```typescript
describe('RLS Policies', () => {
  it('should prevent user A from accessing user B data', async () => {
    // Create two users
    const userA = await createTestUser({ email: 'userA@example.com' });
    const userB = await createTestUser({ email: 'userB@example.com' });

    // Sign in as user A
    const supabaseA = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${userA.token}`,
        },
      },
    });

    // Try to access user B's data
    const { data, error } = await supabaseA
      .from('user_profiles')
      .select('*')
      .eq('user_id', userB.id)
      .single();

    // Should return empty (RLS blocks access)
    expect(data).toBeNull();
    expect(error).toBeNull(); // RLS returns empty, not error
  });
});
```

**Reference:** See `standards/security/access-control.md` Section 4 for RLS testing strategies.

#### Mock Supabase in Unit Tests
Always mock Supabase client in unit tests:

```typescript
import { createMockSupabase } from '@/modules/testing-module';

describe('UserService Unit Tests', () => {
  it('should not make real database calls', async () => {
    const mockSupabase = createMockSupabase();
    const service = new UserService(mockSupabase);

    await service.getUser('123');

    // Verify mock was called, not real database
    expect(mockSupabase.from).toHaveBeenCalledWith('users');
  });
});
```

## 8. E2E Testing Standards

### 8.1 Framework Selection

**Recommended:** Playwright or Cypress

**Playwright Advantages:**
- Multi-browser support (Chromium, Firefox, WebKit)
- Fast execution
- Built-in waiting and auto-retry
- Good TypeScript support

**Cypress Advantages:**
- Excellent developer experience
- Time-travel debugging
- Great documentation
- Active community

### 8.2 E2E Test Structure

```
tests/e2e/
├── fixtures/
│   └── test-users.ts        # Test user credentials
├── helpers/
│   └── auth-helpers.ts      # Authentication helpers
├── auth/
│   ├── login.spec.ts
│   └── signup.spec.ts
└── user-flows/
    ├── create-post.spec.ts
    └── edit-profile.spec.ts
```

### 8.3 E2E Test Example (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test.describe('User Authentication', () => {
  test('should allow user to login', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Fill in credentials
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Welcome')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrong');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });
});
```

### 8.4 E2E Test Data

**Requirements:**
- Use dedicated test user accounts
- Document test credentials in `tests/e2e/fixtures/`
- Never use production data
- Clean up test data after test runs

## 9. Documentation Requirements

### 9.1 Test Documentation

#### Complex Test Logic
Add comments for complex test scenarios:

```typescript
it('should handle concurrent user updates', async () => {
  // This test verifies that the optimistic locking mechanism
  // prevents lost updates when two users edit the same record
  // simultaneously. We simulate this by creating two parallel
  // update operations and verifying only one succeeds.
  
  const user = await createTestUser();
  const update1 = updateUser(user.id, { name: 'User 1' });
  const update2 = updateUser(user.id, { name: 'User 2' });
  
  const [result1, result2] = await Promise.all([update1, update2]);
  
  // One should succeed, one should fail with version conflict
  expect([result1.success, result2.success].filter(Boolean).length).toBe(1);
});
```

#### Integration Test Environment Setup
Document required environment setup:

```typescript
/**
 * Integration tests for UserService.
 * 
 * Requirements:
 * - Supabase local instance running (run: supabase start)
 * - Test database seeded (run: npm run db:seed:test)
 * - Environment variables set in .env.test
 * 
 * @see standards/architecture/supabase-local-setup.md
 */
describe('UserService Integration', () => {
  // ...
});
```

#### E2E Test Credentials
Document test user setup:

```typescript
/**
 * E2E tests for user authentication flows.
 * 
 * Test Users (created in test database):
 * - test-user@example.com / password123 (standard user)
 * - admin@example.com / admin123 (admin user)
 * 
 * To create test users, run: npm run e2e:setup
 */
describe('Authentication E2E', () => {
  // ...
});
```

### 9.2 Coverage Reports

**Generate Reports:**
- HTML coverage reports for detailed analysis
- JSON reports for CI/CD integration
- Text reports for quick terminal feedback

**Track Coverage:**
- Monitor coverage trends over time
- Set minimum thresholds per module
- Alert when coverage drops below threshold

## 10. Related Standards and References

### 10.1 Standards References
- **Project Structure:** `standards/project-structure.md` (Section 3.2 - Test organization)
- **Module Structure:** `standards/module-structure.md` (Section 2 - Module testing requirements)
- **Security Testing:** `standards/security/access-control.md` (Section 4 - RLS testing)
- **Tech Stack:** `standards/tech-stack-document.md` (Testing tools section)

### 10.2 Module References
- **Testing Utilities:** `modules/testing-module/README.md`
- **Python Testing:** `modules/supabase-core-typescript-python/README_TESTING.md`

### 10.3 Workflow Integration
- **Pre-PR Validation:** `.cursor/commands/pr-review-check.md` (requires tests to pass)
- **Pre-Flight Check:** `.cursor/commands/pre-flight-check.md` (validates test setup)
- **Agent Workflow:** `AGENTS.md` (Section 6.4 - Pre-PR validation)

## 11. Common Patterns and Examples

### 11.1 Testing Async Functions

```typescript
it('should handle async operations', async () => {
  const mockSupabase = createMockSupabase();
  mockSupabase.mockSuccess({ id: '123' });

  const result = await userService.getUser('123');

  expect(result).toBeDefined();
  expect(result.id).toBe('123');
});
```

### 11.2 Testing Error Handling

```typescript
it('should handle database errors gracefully', async () => {
  const mockSupabase = createMockSupabase();
  mockSupabase.mockError('Connection timeout');

  await expect(userService.getUser('123')).rejects.toThrow('Failed to fetch user');
});
```

### 11.3 Testing with React Components

```typescript
import { render, screen } from '@testing-library/react';
import { UserProfile } from './UserProfile';

it('should display user name', () => {
  render(<UserProfile user={{ id: '1', name: 'Test User' }} />);
  
  expect(screen.getByText('Test User')).toBeInTheDocument();
});
```

### 11.4 Testing API Routes

```typescript
import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/users';

it('should return user data', async () => {
  const { req, res } = createMocks({
    method: 'GET',
    query: { id: '123' },
  });

  await handler(req, res);

  expect(res._getStatusCode()).toBe(200);
  const data = JSON.parse(res._getData());
  expect(data.id).toBe('123');
});
```

# End of Rule – Testing_Standards_v1.0

