# Testing & Missing Items Checklist

## Status: ⚠️ **NEEDS TESTING & VERIFICATION**

**Date:** 2025-01-27

---

## 🔴 Critical Issues to Verify

### 1. Authentication Client (`src/client/auth_client.py`)

**Potential Issues:**
- ❓ **JWT Token Setting:** The `client.postgrest.auth(jwt_token)` method may not exist in supabase-py
- ❓ **Alternative Method:** `client.auth.set_session()` may not work as expected
- ❓ **Header Setting:** May need to set Authorization header directly on HTTP client

**What to Test:**
```python
# Test 1: Verify JWT authentication works
from supabase_core_python import create_authenticated_client

jwt = "valid-jwt-token"
supabase = create_authenticated_client(jwt)

# This should work with RLS policies
response = supabase.table("posts").select("*").execute()
# Verify: Does RLS apply? Can user only see their own posts?
```

**Action Needed:**
- [ ] Verify supabase-py API for setting JWT tokens
- [ ] Test with actual Supabase instance
- [ ] Fix authentication method if incorrect

**Reference:** Check supabase-py documentation for correct JWT authentication pattern.

---

### 2. Query Builder (`src/database/query_builder.py`)

**Potential Issues:**
- ❓ **API Mismatch:** supabase-py uses `.table()` not `.from()`
- ❓ **Method Chaining:** May not support fluent chaining as implemented
- ❓ **Return Types:** Response structure may differ from TypeScript version

**What to Test:**
```python
# Test 2: Verify query builder works
from supabase_core_python import query_builder

response = (
    query_builder(supabase, "posts")
    .where("published", True)
    .order_by("created_at", "desc")
    .limit(10)
    .execute()
)

# Verify: Does response have .data attribute? Is structure correct?
```

**Action Needed:**
- [ ] Test all query builder methods
- [ ] Verify response structure matches expectations
- [ ] Check if supabase-py supports method chaining

---

### 3. Storage Upload (`src/storage/upload.py`)

**Potential Issues:**
- ❓ **Upload API:** `client.storage.from_(bucket).upload()` may have different signature
- ❓ **File Options:** `file_options` parameter may not exist or be named differently
- ❓ **Response Structure:** Upload response may differ from expected

**What to Test:**
```python
# Test 3: Verify file upload works
from supabase_core_python import upload_file, UploadConfig

config = UploadConfig(
    bucket="uploads",
    path="test/file.txt",
    file=b"test content",
    content_type="text/plain"
)

result = upload_file(supabase, config)
# Verify: Does result have .path and .public_url?
```

**Action Needed:**
- [ ] Test upload with actual Supabase Storage
- [ ] Verify file_options parameter name and structure
- [ ] Test with different file types (bytes, file path, BinaryIO)

---

### 4. Storage Download (`src/storage/download.py`)

**Potential Issues:**
- ❓ **Download API:** `client.storage.from_(bucket).download()` may return different structure
- ❓ **Response Handling:** May need to handle response differently

**What to Test:**
```python
# Test 4: Verify file download works
from supabase_core_python import download_file, DownloadConfig

config = DownloadConfig(bucket="uploads", path="test/file.txt")
result = download_file(supabase, config)

# Verify: Is result.data bytes? Does result have .content_type?
```

**Action Needed:**
- [ ] Test download with actual files
- [ ] Verify response structure

---

### 5. Real-time Subscriptions (`src/realtime/subscription.py`)

**Potential Issues:**
- ❓ **Async Required:** supabase-py real-time may require async/await
- ❓ **Channel API:** `client.channel()` and `.on()` methods may differ
- ❓ **Subscription Management:** May need different cleanup approach

**What to Test:**
```python
# Test 5: Verify real-time subscriptions work
from supabase_core_python import SubscriptionManager, SubscriptionConfig

manager = SubscriptionManager(supabase)

manager.subscribe(SubscriptionConfig(
    channel="test-channel",
    table="posts",
    on_insert=lambda payload: print(payload)
))

# Verify: Does subscription actually receive events?
```

**Action Needed:**
- [ ] Test with actual Supabase real-time
- [ ] Verify if async is required
- [ ] Test subscription cleanup

---

### 6. Pagination (`src/database/pagination.py`)

**Potential Issues:**
- ❓ **Count Parameter:** `select("*", count="exact")` may not work in supabase-py
- ❓ **Response Structure:** Count may be in different location
- ❓ **Range Method:** `.range()` may have different signature

**What to Test:**
```python
# Test 6: Verify pagination works
from supabase_core_python import paginate, PaginationParams

query = supabase.table("posts").select("*", count="exact")
response = paginate(query, PaginationParams(page=1, limit=10))

# Verify: Does response have .total, .data, .has_next?
```

**Action Needed:**
- [ ] Test pagination with actual queries
- [ ] Verify count parameter works
- [ ] Test edge cases (empty results, last page, etc.)

---

### 7. Framework Integrations

#### FastAPI (`src/framework/fastapi/dependencies.py`)

**What to Test:**
```python
# Test 7a: FastAPI dependency injection
from fastapi import FastAPI, Depends
from supabase_core_python.framework.fastapi import get_authenticated_supabase

app = FastAPI()

@app.get("/test")
async def test(supabase = Depends(get_authenticated_supabase)):
    # Verify: Does dependency work? Is client authenticated?
    response = supabase.table("posts").select("*").execute()
    return response.data
```

**Action Needed:**
- [ ] Test FastAPI dependency injection
- [ ] Verify JWT extraction from headers
- [ ] Test error handling (missing token, invalid token)

#### Django (`src/framework/django/middleware.py`)

**What to Test:**
```python
# Test 7b: Django helper
from supabase_core_python.framework.django import get_supabase_client

def test_view(request):
    supabase = get_supabase_client(request, require_auth=True)
    # Verify: Does it extract JWT from request? Does it work?
    response = supabase.table("posts").select("*").execute()
    return JsonResponse({"data": response.data})
```

**Action Needed:**
- [ ] Test Django helper with actual request
- [ ] Verify JWT extraction from headers/session/cookies
- [ ] Test error handling

#### Flask (`src/framework/flask/helpers.py`)

**What to Test:**
```python
# Test 7c: Flask helper
from supabase_core_python.framework.flask import get_supabase_client

@app.route("/test")
def test():
    supabase = get_supabase_client(require_auth=True)
    # Verify: Does it extract JWT? Does caching work?
    response = supabase.table("posts").select("*").execute()
    return jsonify({"data": response.data})
```

**Action Needed:**
- [ ] Test Flask helper
- [ ] Verify JWT extraction
- [ ] Test Flask's `g` object caching

---

## 🟡 Missing Features

### 1. Unit Tests

**Missing:**
- ❌ No test files created
- ❌ No test framework setup (pytest, unittest)
- ❌ No mock Supabase client for testing

**Action Needed:**
- [ ] Create `tests/` directory
- [ ] Set up pytest or unittest
- [ ] Create mock Supabase client
- [ ] Write unit tests for all utilities

**Example Structure:**
```
tests/
├── test_client.py
├── test_query_builder.py
├── test_pagination.py
├── test_storage.py
├── test_realtime.py
├── test_utils.py
└── conftest.py  # pytest fixtures
```

---

### 2. Integration Tests

**Missing:**
- ❌ No integration tests with actual Supabase
- ❌ No framework-specific integration tests
- ❌ No end-to-end tests

**Action Needed:**
- [ ] Create integration test suite
- [ ] Test with local Supabase instance
- [ ] Test FastAPI integration
- [ ] Test Django integration
- [ ] Test Flask integration

---

### 3. Example Usage Files

**Missing:**
- ❌ No example FastAPI app
- ❌ No example Django views
- ❌ No example Flask routes
- ❌ No example scripts

**Action Needed:**
- [ ] Create `examples/fastapi_app.py`
- [ ] Create `examples/django_views.py`
- [ ] Create `examples/flask_routes.py`
- [ ] Create `examples/basic_usage.py`

---

### 4. Type Generation Helper

**Missing:**
- ❌ No script to automate type generation
- ❌ No instructions for CI/CD integration

**Action Needed:**
- [ ] Create `scripts/generate-types.sh`
- [ ] Create `scripts/generate-types.py`
- [ ] Document CI/CD integration

---

### 5. Error Handling Edge Cases

**Potential Issues:**
- ❓ Network errors
- ❓ Timeout handling
- ❓ Invalid JWT tokens
- ❓ Missing environment variables
- ❓ Supabase service unavailable

**Action Needed:**
- [ ] Test all error scenarios
- [ ] Add proper error messages
- [ ] Add retry logic where appropriate

---

## 🟢 What's Complete (But Needs Verification)

### ✅ Code Structure
- All files created
- Proper imports and exports
- Documentation in place

### ✅ Documentation
- README.md complete
- INTEGRATION_GUIDE.md complete
- COMPLETENESS_CHECK.md complete

### ✅ Configuration
- pyproject.toml configured
- requirements.txt complete
- Module structure follows Python best practices

---

## 📋 Testing Priority

### High Priority (Must Test Before Production)

1. **Authentication** - JWT token handling
2. **Query Builder** - Basic CRUD operations
3. **Framework Integrations** - At least one framework (FastAPI recommended)
4. **Error Handling** - Common error scenarios

### Medium Priority (Should Test)

5. **Storage Operations** - Upload/download
6. **Pagination** - With actual data
7. **Real-time** - Subscription management
8. **RLS Helpers** - Role checking

### Low Priority (Nice to Have)

9. **Caching** - Performance testing
10. **Retry Logic** - Edge cases
11. **All Frameworks** - Django and Flask if not using FastAPI

---

## 🔧 Quick Verification Steps

### Step 1: Install and Test Basic Client

```bash
# Install dependencies
pip install supabase pydantic httpx

# Test basic client creation
python -c "
from supabase_core_python import create_client
import os
os.environ['SUPABASE_URL'] = 'http://localhost:54321'
os.environ['SUPABASE_ANON_KEY'] = 'your-key'
client = create_client()
print('Client created:', client)
"
```

### Step 2: Test Query Builder

```bash
# Test query builder
python -c "
from supabase_core_python import query_builder, create_client
# ... test query builder
"
```

### Step 3: Test Framework Integration

```bash
# Test FastAPI (if using)
pip install fastapi uvicorn
# Run example FastAPI app
```

---

## 🐛 Known Issues to Fix

### Issue 1: Auth Client JWT Setting

**Problem:** `client.postgrest.auth()` may not exist in supabase-py

**Potential Fix:**
```python
# Option 1: Set header directly
client.postgrest.session.headers["Authorization"] = f"Bearer {jwt_token}"

# Option 2: Use auth session
client.auth.set_session(access_token=jwt_token, refresh_token="")

# Option 3: Create new client with custom headers
# (May need to check supabase-py source code)
```

**Action:** Research supabase-py source code for correct method.

---

### Issue 2: Storage Upload API

**Problem:** `file_options` parameter may not exist

**Potential Fix:**
```python
# May need to use different parameter structure
response = client.storage.from_(bucket).upload(
    path,
    file_data,
    file_options={"content-type": content_type}  # May need different structure
)
```

**Action:** Check supabase-py storage API documentation.

---

### Issue 3: Real-time Async

**Problem:** Real-time may require async/await

**Potential Fix:**
```python
# May need async version
import asyncio
from supabase import acreate_client

async def subscribe():
    client = await acreate_client(url, key)
    # ... async subscription code
```

**Action:** Check if sync version works or if async is required.

---

## 📝 Next Steps

1. **Immediate:**
   - [ ] Verify supabase-py API matches our implementation
   - [ ] Fix authentication client if needed
   - [ ] Test basic client creation and queries

2. **Short-term:**
   - [ ] Create unit tests
   - [ ] Test one framework integration (FastAPI)
   - [ ] Fix any API mismatches

3. **Long-term:**
   - [ ] Complete integration tests
   - [ ] Test all frameworks
   - [ ] Create example applications
   - [ ] Performance testing

---

## 🔍 Verification Checklist

Before considering this module production-ready:

- [ ] Authentication works with actual JWT tokens
- [ ] Query builder works with actual Supabase queries
- [ ] Storage upload/download works
- [ ] At least one framework integration tested (FastAPI recommended)
- [ ] Error handling tested
- [ ] Basic unit tests written
- [ ] Integration tests with local Supabase
- [ ] Documentation verified against actual usage

---

*Last Updated: 2025-01-27*

