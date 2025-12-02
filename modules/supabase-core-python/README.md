# Supabase Core Module (Python)

## Metadata
- **Module:** supabase-core-python
- **Version:** 1.0.0
- **Created:** 2025-01-27
- **Description:** Unified Supabase utilities module for Python backends (Django, FastAPI, Flask)

## Purpose

This module provides a comprehensive set of utilities for working with Supabase in Python backends, including:

- **Client Factories** - Automatic environment detection (local vs production)
- **Query Builders** - Fluent API for common query patterns
- **Database Utilities** - Pagination, transactions, RLS helpers
- **Storage Helpers** - File upload/download with validation and image processing
- **Real-time Management** - Subscription lifecycle management
- **Error Handling** - Normalized error handling and retry logic
- **Caching** - Query result caching utilities
- **Framework Integration** - Django, FastAPI, and Flask helpers

## Dependencies

- `supabase>=2.0.0` - Supabase Python client library
- `pydantic>=2.0.0` - Data validation
- `httpx>=0.24.0` - HTTP client

**Optional Framework Dependencies:**
- `django>=4.0.0` (for Django integration)
- `fastapi>=0.100.0` (for FastAPI integration)
- `flask>=2.0.0` (for Flask integration)

## Installation

Copy this module to your project:

```bash
cp -r modules/supabase-core-python /path/to/your/project/lib/supabase_core_python
```

Install dependencies:

```bash
pip install supabase pydantic httpx

# For framework-specific features:
pip install django  # Django
pip install fastapi  # FastAPI
pip install flask  # Flask
```

Or install with optional dependencies:

```bash
pip install -e ".[fastapi]"  # FastAPI
pip install -e ".[django]"   # Django
pip install -e ".[flask]"     # Flask
pip install -e ".[all]"       # All frameworks
```

## Usage

### Client Creation

#### Basic Client

```python
from supabase_core_python import create_client

# Automatically detects local vs production environment
supabase = create_client()

# Use in your code
response = supabase.table("posts").select("*").execute()
print(response.data)
```

#### Authenticated Client

```python
from supabase_core_python import create_authenticated_client

# Extract JWT from request (framework-specific)
jwt_token = request.headers.get("Authorization", "").replace("Bearer ", "")

# Create authenticated client
supabase = create_authenticated_client(jwt_token)

# User's RLS policies apply
response = supabase.table("posts").select("*").execute()
```

#### Service Role Client (Server-Side Only)

```python
from supabase_core_python import create_service_role_client

# WARNING: Only use in secure server-side contexts
# Bypasses RLS - use with caution!
admin_supabase = create_service_role_client()

response = admin_supabase.table("users").select("*").execute()
```

### Framework Integration

#### FastAPI

```python
from fastapi import FastAPI, Depends
from supabase_core_python.framework.fastapi import get_authenticated_supabase
from supabase_core_python import get_current_user
from supabase import Client

app = FastAPI()

@app.get("/posts")
async def get_posts(supabase: Client = Depends(get_authenticated_supabase)):
    user = get_current_user(supabase)
    if not user:
        return {"error": "Unauthorized"}, 401
    
    response = supabase.table("posts").select("*").execute()
    return {"data": response.data}
```

#### Django

```python
from django.http import JsonResponse
from supabase_core_python.framework.django import get_supabase_client

def my_view(request):
    # Authenticated client
    supabase = get_supabase_client(request, require_auth=True)
    
    response = supabase.table("posts").select("*").execute()
    return JsonResponse({"data": response.data})
```

#### Flask

```python
from flask import Flask, jsonify
from supabase_core_python.framework.flask import get_supabase_client

app = Flask(__name__)

@app.route("/posts")
def get_posts():
    # Authenticated client
    supabase = get_supabase_client(require_auth=True)
    
    response = supabase.table("posts").select("*").execute()
    return jsonify({"data": response.data})
```

### Query Builder

```python
from supabase_core_python import query_builder

response = (
    query_builder(supabase, "posts")
    .where("published", True)
    .order_by("created_at", "desc")
    .limit(10)
    .execute()
)

print(response.data)
```

### Pagination

```python
from supabase_core_python import paginate, PaginationParams

query = supabase.table("posts").select("*", count="exact")
response = paginate(query, PaginationParams(page=1, limit=10))

print(f"Total: {response.total}, Page: {response.page}")
print(f"Has next: {response.has_next}")
print(f"Data: {response.data}")
```

### Storage Upload

```python
from supabase_core_python import upload_file, UploadConfig, FileValidationOptions

config = UploadConfig(
    bucket="uploads",
    path="avatars/user1.png",
    file="/path/to/image.png",
    content_type="image/png"
)

validation = FileValidationOptions(
    max_size=5 * 1024 * 1024,  # 5MB
    allowed_types=["image/png", "image/jpeg"]
)

result = upload_file(supabase, config, validation)
print(f"Uploaded to: {result.public_url}")
```

### Real-time Subscriptions

```python
from supabase_core_python import SubscriptionManager, SubscriptionConfig

manager = SubscriptionManager(supabase)

manager.subscribe(SubscriptionConfig(
    channel="posts-changes",
    table="posts",
    on_insert=lambda payload: print(f"New post: {payload['new']}"),
    on_update=lambda payload: print(f"Updated post: {payload['new']}"),
    on_delete=lambda payload: print(f"Deleted post: {payload['old']}"),
))

# Later, cleanup
manager.cleanup()
```

### Error Handling

```python
from supabase_core_python import normalize_error, get_user_friendly_message

try:
    response = supabase.table("posts").insert(data).execute()
except Exception as e:
    normalized = normalize_error(e)
    user_message = get_user_friendly_message(e)
    print(f"Error: {user_message} (Code: {normalized.code})")
```

### Retry Logic

```python
from supabase_core_python import with_retry, RetryConfig

def fetch_posts():
    return supabase.table("posts").select("*").execute()

# With default config (3 retries, 1s delay)
result = with_retry(fetch_posts)

# With custom config
config = RetryConfig(max_retries=5, delay_ms=2000, exponential_backoff=True)
result = with_retry(fetch_posts, config)
```

### Caching

```python
from supabase_core_python import QueryCache, create_cache_key

cache = QueryCache(ttl_seconds=300)  # 5 minute TTL

def fetch_posts():
    return supabase.table("posts").select("*").execute()

# Cache the result
key = create_cache_key("posts", user_id=123, page=1)
result = cache.get_or_set(key, fetch_posts)
```

## Type Generation

Generate Python types from your Supabase schema:

```bash
# From local Supabase
supabase gen types python --local > lib/supabase_core_python/types/database_types.py

# From remote project
supabase gen types python --project-id <project-ref> > lib/supabase_core_python/types/database_types.py
```

## Environment Variables

Set these in your `.env` file or environment:

```bash
# Local Development
SUPABASE_URL_LOCAL=http://localhost:54321
SUPABASE_ANON_KEY_LOCAL=<your-local-anon-key>
SUPABASE_SERVICE_ROLE_KEY_LOCAL=<your-local-service-role-key>

# Production
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

## Comparison with TypeScript Version

| Feature | TypeScript | Python |
|---------|-----------|--------|
| Client Factories | ✅ | ✅ |
| Query Builder | ✅ | ✅ |
| Pagination | ✅ | ✅ |
| Storage Helpers | ✅ | ✅ |
| Real-time | ✅ | ✅ |
| Error Handling | ✅ | ✅ |
| Retry Logic | ✅ | ✅ |
| Caching | ✅ | ✅ |
| Framework Integration | Next.js | Django/FastAPI/Flask |
| SSR Support | ✅ (`@supabase/ssr`) | N/A (server-side only) |

## Framework-Specific Features

### FastAPI
- Dependency injection for Supabase clients
- Automatic JWT extraction from Authorization header
- Type-safe route handlers

### Django
- Middleware helpers for request-based client creation
- Session-based JWT storage support
- Cookie-based authentication

### Flask
- Request context caching (Flask's `g` object)
- Header and cookie-based JWT extraction
- Simple integration pattern

## Best Practices

1. **Use authenticated clients** for user-specific data (RLS policies apply)
2. **Use service role client** only in secure admin contexts
3. **Validate file uploads** before uploading to storage
4. **Use pagination** for large datasets
5. **Cache frequently accessed data** to reduce database load
6. **Handle errors gracefully** using the error normalization utilities
7. **Use retry logic** for transient failures

## Troubleshooting

### Import Errors

If you get import errors for framework-specific modules:

```bash
# Install the required framework
pip install fastapi  # or django, flask
```

### Authentication Issues

Ensure JWT tokens are properly extracted from requests:

```python
# FastAPI
jwt = request.headers.get("Authorization", "").replace("Bearer ", "")

# Django
jwt = request.META.get("HTTP_AUTHORIZATION", "").replace("Bearer ", "")

# Flask
jwt = request.headers.get("Authorization", "").replace("Bearer ", "")
```

### Type Generation

If types are not generated:

```bash
# Ensure Supabase CLI is installed
pip install supabase

# Generate types
supabase gen types python --local > types/database_types.py
```

## Related Modules

- `modules/supabase-core/` - TypeScript/Next.js version
- `modules/auth-profile-sync/` - Authentication and profile management
- `modules/backend-api/` - Standardized API handlers (TypeScript)

## License

ISC

