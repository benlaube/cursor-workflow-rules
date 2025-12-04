# Known Issues & API Verification Needed

## Critical: Supabase-py API Verification

The following implementations are based on assumptions about the supabase-py library API. **They need to be verified and potentially fixed** before production use.

---

## 1. Authentication Client (`src/client/auth_client.py`)

### Issue: JWT Token Setting Method

**Current Implementation:**

```python
if hasattr(client, "postgrest") and hasattr(client.postgrest, "auth"):
    client.postgrest.auth(jwt_token)
elif hasattr(client, "table"):
    client.auth.set_session(access_token=jwt_token, refresh_token="")
```

**Problem:**

- `client.postgrest.auth()` may not exist in supabase-py
- `client.auth.set_session()` may not work for setting JWT from external source
- May need to set Authorization header directly

**Potential Solutions:**

**Option A: Set Header Directly**

```python
# If supabase-py uses httpx or requests internally
if hasattr(client, "postgrest") and hasattr(client.postgrest, "session"):
    client.postgrest.session.headers["Authorization"] = f"Bearer {jwt_token}"
```

**Option B: Use Supabase Auth Session**

```python
# If supabase-py supports setting session from token
try:
    # Parse JWT to get user info
    import jwt
    decoded = jwt.decode(jwt_token, options={"verify_signature": False})
    client.auth.set_session(
        access_token=jwt_token,
        refresh_token="",  # May need actual refresh token
    )
except Exception:
    # Fallback: Set header directly
    pass
```

**Option C: Create Custom Client**

```python
# May need to create client with custom headers
from supabase import create_client
from postgrest import SyncPostgrestClient

# Create PostgREST client with auth header
postgrest = SyncPostgrestClient(
    base_url=f"{supabase_url}/rest/v1",
    headers={"Authorization": f"Bearer {jwt_token}"}
)
```

**Action Required:**

- [ ] Check supabase-py source code: <https://github.com/supabase/supabase-py>
- [ ] Test with actual JWT token
- [ ] Verify RLS policies apply after setting token
- [ ] Update implementation based on findings

---

## 2. Query Builder (`src/database/query_builder.py`)

### Issue: Method Chaining and API

**Current Implementation:**

```python
self._query = client.table(table).select(self._select)
self._query = self._query.eq(column, value)
```

**Potential Issues:**

- supabase-py may use different method names
- Method chaining may not work as expected
- Response structure may differ

**Verification Needed:**

```python
# Test actual supabase-py API
from supabase import create_client

client = create_client(url, key)
query = client.table("posts").select("*")
query = query.eq("published", True)  # Does this work?
response = query.execute()  # What does response look like?
```

**Action Required:**

- [ ] Test all query builder methods
- [ ] Verify response structure (`.data`, `.error`, `.count`)
- [ ] Check if methods return new query builder or modify in place

---

## 3. Storage Upload (`src/storage/upload.py`)

### Issue: Upload API Parameters

**Current Implementation:**

```python
response = (
    client.storage.from_(config.bucket)
    .upload(
        config.path,
        file_data,
        file_options={
            "content-type": config.content_type,
            "cache-control": config.cache_control,
            "upsert": config.upsert,
        },
    )
    .execute()
)
```

**Potential Issues:**

- `file_options` parameter may not exist
- Parameters may need to be passed differently
- `upsert` may be a separate parameter

**Verification Needed:**

```python
# Test actual supabase-py storage API
from supabase import create_client

client = create_client(url, key)
response = client.storage.from_("bucket").upload(
    "path/file.txt",
    b"content",
    # What parameters are actually supported?
)
```

**Action Required:**

- [ ] Check supabase-py storage documentation
- [ ] Test upload with different file types
- [ ] Verify response structure

---

## 4. Storage Download (`src/storage/download.py`)

### Issue: Download Response Structure

**Current Implementation:**

```python
response = client.storage.from_(config.bucket).download(config.path).execute()
data = response if isinstance(response, bytes) else getattr(response, "data", b"")
```

**Potential Issues:**

- Response may be bytes directly
- Response may be a custom object
- Content type may be in headers

**Action Required:**

- [ ] Test download with actual files
- [ ] Verify response structure
- [ ] Check how to get content type

---

## 5. Real-time Subscriptions (`src/realtime/subscription.py`)

### Issue: Async vs Sync

**Current Implementation:**

```python
channel = self.client.channel(config.channel)
channel = channel.on("postgres_changes", {...}, callback)
channel.subscribe()
```

**Potential Issues:**

- Real-time may require async/await
- Channel API may differ
- Subscription cleanup may need different approach

**Verification Needed:**

```python
# Test if sync version works
channel = client.channel("test")
channel.on("postgres_changes", {...}, callback)
channel.subscribe()

# Or if async is required:
import asyncio
from supabase import acreate_client

async def main():
    client = await acreate_client(url, key)
    channel = client.channel("test")
    # ...
```

**Action Required:**

- [ ] Check if sync real-time works
- [ ] If async required, create async version
- [ ] Test subscription and cleanup

---

## 6. Pagination (`src/database/pagination.py`)

### Issue: Count Parameter

**Current Implementation:**

```python
response = query.select("*", count="exact").limit(0).execute()
total = response.count if hasattr(response, "count") else 0
```

**Potential Issues:**

- `count="exact"` parameter may not work
- Count may be in different location (headers, metadata)
- May need to use `Prefer: count=exact` header

**Verification Needed:**

```python
# Test count parameter
query = client.table("posts").select("*", count="exact")
response = query.execute()
# Where is the count? response.count? response.headers? response.metadata?
```

**Action Required:**

- [ ] Test count parameter
- [ ] Verify where count is located in response
- [ ] Fix pagination if needed

---

## 7. RLS Helpers (`src/database/rls_helpers.py`)

### Issue: RLS Check Function

**Current Implementation:**

```python
response = client.rpc("check_rls_enabled", {"table_name": tableName}).execute()
```

**Potential Issues:**

- Database function `check_rls_enabled` may not exist
- May need to query `pg_policies` directly
- May need service role client

**Action Required:**

- [ ] Create database function or use direct query
- [ ] Test with actual Supabase instance
- [ ] Verify RLS checking works

---

## 8. Framework Integrations

### FastAPI: Missing Request Import

**Current Implementation:**

```python
from fastapi import Header, HTTPException, Depends, Request
```

**Issue:** `Request` is imported but not used. May need it for cookie extraction.

**Action Required:**

- [ ] Add cookie-based JWT extraction if needed
- [ ] Test with actual FastAPI app

### Django: Session JWT Storage

**Current Implementation:**

```python
jwt_token = request.session.get("supabase_jwt")
```

**Issue:** Django session may not have JWT by default. May need middleware to set it.

**Action Required:**

- [ ] Document how to store JWT in Django session
- [ ] Or remove session check if not standard

### Flask: Error Handling

**Fixed:** Missing error message in `raise ValueError` - now fixed.

---

## Testing Strategy

### Phase 1: API Verification (Critical)

1. **Test Basic Client Creation**

   ```python
   from supabase_core_python import create_client
   client = create_client()
   assert client is not None
   ```

2. **Test Authentication**

   ```python
   from supabase_core_python import create_authenticated_client
   # Get real JWT from Supabase Auth
   client = create_authenticated_client(jwt_token)
   # Verify RLS applies
   response = client.table("posts").select("*").execute()
   ```

3. **Test Query Builder**

   ```python
   from supabase_core_python import query_builder
   response = query_builder(client, "posts").where("id", 1).execute()
   assert response.data is not None
   ```

### Phase 2: Framework Testing

4. **Test FastAPI Integration**
   - Create minimal FastAPI app
   - Test dependency injection
   - Verify JWT extraction

5. **Test Django Integration**
   - Create Django view
   - Test helper function
   - Verify JWT extraction

6. **Test Flask Integration**
   - Create Flask route
   - Test helper function
   - Verify caching

### Phase 3: Edge Cases

7. **Error Scenarios**
   - Invalid JWT
   - Missing environment variables
   - Network errors
   - Supabase unavailable

8. **Storage Operations**
   - Upload large files
   - Download non-existent files
   - Image transformations

---

## Recommended Fix Order

1. **Authentication** (Highest Priority)
   - Without working auth, RLS won't work
   - Affects all framework integrations

2. **Query Builder** (High Priority)
   - Core functionality
   - Used by most features

3. **Framework Integration** (High Priority)
   - At least one framework (FastAPI recommended)
   - Needed for actual usage

4. **Storage** (Medium Priority)
   - Less critical for basic usage
   - Can be fixed after core features

5. **Real-time** (Low Priority)
   - Advanced feature
   - Can be async version if needed

---

## Resources for Verification

1. **Supabase-py Documentation:**
   - <https://github.com/supabase/supabase-py>
   - <https://supabase.com/docs/reference/python>

2. **Supabase-py Source Code:**
   - Check actual API methods
   - Verify parameter names
   - Check response structures

3. **Supabase-py Examples:**
   - Look for authentication examples
   - Check storage examples
   - Review real-time examples

---

_Last Updated: 2025-01-27_
