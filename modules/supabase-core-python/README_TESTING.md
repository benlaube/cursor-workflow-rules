# Testing Guide for supabase-core-python

## Overview

This module includes a comprehensive test suite to verify functionality and API compatibility with supabase-py.

## Test Structure

```
tests/
├── __init__.py
├── conftest.py              # Pytest fixtures and configuration
├── test_client.py          # Client creation and authentication tests
├── test_query_builder.py    # Query builder tests
├── test_pagination.py       # Pagination tests
├── test_storage.py          # Storage upload/download tests
├── test_framework_integrations.py  # FastAPI/Django/Flask integration tests
└── test_utils.py            # Utility function tests
```

## Running Tests

### Install Dependencies

```bash
# Install core dependencies
pip install -r requirements.txt

# Install in development mode
pip install -e .

# Or install with test dependencies
pip install -e ".[all]"
```

### Run All Tests

```bash
pytest
```

### Run Specific Test Files

```bash
# Test client creation
pytest tests/test_client.py

# Test query builder
pytest tests/test_query_builder.py

# Test framework integrations
pytest tests/test_framework_integrations.py
```

### Run with Verbose Output

```bash
pytest -v
```

### Run with Coverage

```bash
pip install pytest-cov
pytest --cov=supabase_core_python --cov-report=html
```

## Test Categories

### Unit Tests (Fast, No External Dependencies)

These tests use mocks and don't require a real Supabase instance:

```bash
pytest -m unit
```

**Files:**
- `test_client.py` (with mocks)
- `test_query_builder.py`
- `test_pagination.py`
- `test_storage.py` (with mocks)
- `test_utils.py`

### Integration Tests (Require Supabase Instance)

These tests require a running Supabase instance (local or remote):

```bash
# Set environment variables
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Run integration tests
pytest -m integration
```

**Note:** Integration tests are not yet implemented. They should:
- Test with real Supabase instance
- Verify RLS policies work correctly
- Test actual storage operations
- Verify real-time subscriptions

### Framework Tests (Require Framework Installation)

These tests require the respective framework to be installed:

```bash
# Test FastAPI integration
pytest -m framework -k fastapi

# Test Django integration
pytest -m framework -k django

# Test Flask integration
pytest -m framework -k flask
```

## Mock Supabase Client

The test suite includes a comprehensive mock Supabase client in `conftest.py`:

```python
@pytest.fixture
def mock_supabase_client():
    """Creates a mock Supabase client for testing."""
    # Provides mocked:
    # - table() queries
    # - storage operations
    # - auth operations
    # - real-time channels
    # - RPC calls
```

## Known Test Limitations

### 1. Authentication Client Tests

**Issue:** The authentication client tests use mocks and may not reflect actual supabase-py behavior.

**Action:** These tests should be verified with:
- Real JWT tokens from Supabase Auth
- Actual RLS policy enforcement
- Real Supabase instance

### 2. Storage Upload/Download Tests

**Issue:** Storage tests use mocks and don't verify actual API compatibility.

**Action:** Integration tests should:
- Upload real files to Supabase Storage
- Verify file_options parameter works
- Test signed URL generation

### 3. Real-time Subscription Tests

**Issue:** Real-time tests are not yet implemented.

**Action:** Add integration tests that:
- Create real subscriptions
- Verify event callbacks work
- Test subscription cleanup

### 4. Pagination Count Tests

**Issue:** Count parameter may not work as expected in supabase-py.

**Action:** Verify with real queries:
- Test `count="exact"` parameter
- Verify where count is located in response
- Test with empty results

## Writing New Tests

### Example: Adding a New Test

```python
# tests/test_new_feature.py
import pytest
from supabase_core_python import new_feature

class TestNewFeature:
    """Tests for new feature."""
    
    def test_new_feature_basic(self, mock_supabase_client):
        """Test basic functionality."""
        result = new_feature(mock_supabase_client)
        assert result is not None
```

### Example: Integration Test

```python
# tests/test_integration.py
import pytest
import os
from supabase_core_python import create_client

@pytest.mark.integration
def test_real_query():
    """Test with real Supabase instance."""
    # Requires SUPABASE_URL and SUPABASE_ANON_KEY env vars
    supabase = create_client()
    response = supabase.table("posts").select("*").limit(1).execute()
    assert response.data is not None
```

## Continuous Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      - run: pip install -r requirements.txt
      - run: pip install -e .
      - run: pytest
```

## Test Coverage Goals

- **Unit Tests:** 80%+ coverage
- **Integration Tests:** All critical paths
- **Framework Tests:** All three frameworks (FastAPI, Django, Flask)

## Troubleshooting

### Tests Fail with Import Errors

**Problem:** Module not found errors.

**Solution:**
```bash
# Install in development mode
pip install -e .
```

### Framework Tests Skip

**Problem:** Framework tests are skipped.

**Solution:**
```bash
# Install the framework
pip install fastapi  # or django, flask
```

### Mock Client Doesn't Match Real API

**Problem:** Tests pass but real code fails.

**Solution:**
- Update mock client in `conftest.py`
- Add integration tests to verify
- Check supabase-py documentation for API changes

---

*Last Updated: 2025-01-27*

