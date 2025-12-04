# Integration Tests

Integration tests for `supabase-core-python` that require a real Supabase instance.

## Setup

### 1. Environment Variables

Set the following environment variables before running integration tests:

```bash
# Required
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_ANON_KEY="your-anon-key"

# Optional (for authentication tests)
export SUPABASE_TEST_JWT="your-jwt-token"

# Optional (for storage tests)
export SUPABASE_TEST_BUCKET="test-uploads"

# Optional (for admin tests)
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### 2. Local Supabase Setup (Recommended)

For local testing, use Supabase CLI:

```bash
# Start local Supabase
supabase start

# Get local credentials
supabase status

# Set environment variables
export SUPABASE_URL="http://localhost:54321"
export SUPABASE_ANON_KEY="<from supabase status>"
export SUPABASE_SERVICE_ROLE_KEY="<from supabase status>"
```

### 3. Create Test Resources

#### Storage Bucket

Create a test bucket in Supabase Storage:

```bash
# Via Supabase Dashboard or CLI
# Create bucket: test-uploads
# Set as public or configure policies
```

#### Test User (for JWT tests)

Create a test user and get JWT:

```python
from supabase import create_client

supabase = create_client(url, anon_key)
response = supabase.auth.sign_up({
    "email": "test@example.com",
    "password": "test-password"
})

# Get JWT from response
jwt = response.session.access_token
export SUPABASE_TEST_JWT="$jwt"
```

## Running Tests

### Run All Integration Tests

```bash
pytest tests/integration/ -v -m integration
```

### Run Specific Test Files

```bash
# Authentication tests
pytest tests/integration/test_auth_integration.py -v

# Storage tests
pytest tests/integration/test_storage_integration.py -v

# Query tests
pytest tests/integration/test_query_integration.py -v

# Framework tests
pytest tests/integration/test_framework_integration.py -v
```

### Run with Coverage

```bash
pytest tests/integration/ --cov=supabase_core_python --cov-report=html -m integration
```

## Test Files

- `test_auth_integration.py` - Authentication and JWT tests
- `test_storage_integration.py` - Storage upload/download tests
- `test_query_integration.py` - Query builder and pagination tests
- `test_framework_integration.py` - Framework-specific integration tests

## Known Limitations

1. **JWT Authentication**: Requires manual JWT token setup
2. **Storage Tests**: Require a test bucket to be created
3. **RLS Tests**: Require tables with RLS policies configured
4. **Pagination Count**: May fail if `count="exact"` doesn't work in supabase-py

## Troubleshooting

### Tests Skip with "Supabase environment variables not set"

Make sure you've set `SUPABASE_URL` and `SUPABASE_ANON_KEY`:

```bash
export SUPABASE_URL="..."
export SUPABASE_ANON_KEY="..."
```

### Storage Tests Fail

1. Create a test bucket in Supabase Storage
2. Set `SUPABASE_TEST_BUCKET` environment variable
3. Configure bucket policies (public or authenticated access)

### Authentication Tests Skip

1. Create a test user in Supabase Auth
2. Get the JWT token from the session
3. Set `SUPABASE_TEST_JWT` environment variable

### Framework Tests Skip

Install the required framework:

```bash
pip install fastapi  # For FastAPI tests
pip install django  # For Django tests
pip install flask   # For Flask tests
```

---

_Last Updated: 2025-01-27_
