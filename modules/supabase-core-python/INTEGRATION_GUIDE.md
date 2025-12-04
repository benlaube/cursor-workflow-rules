# Supabase Core Python - Integration Guide

Complete guide for integrating the Supabase Core Python module into your Python backend project.

## Quick Start

### 1. Copy Module Files

Copy the entire `modules/supabase-core-typescript-python/` directory to your project:

```bash
# Option 1: Copy to lib directory
cp -r modules/supabase-core-typescript-python lib/supabase_core_python

# Option 2: Copy to src directory
cp -r modules/supabase-core-typescript-python src/supabase_core_python
```

### 2. Install Dependencies

```bash
pip install supabase pydantic httpx

# For your framework:
pip install fastapi  # or django, flask
```

### 3. Generate Database Types

```bash
supabase gen types python --local > lib/supabase_core_python/types/database_types.py
```

### 4. Set Environment Variables

Create `.env` file:

```bash
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

### 5. Use in Your Code

```python
from supabase_core_python import create_client

supabase = create_client()
response = supabase.table("posts").select("*").execute()
```

## Framework-Specific Integration

### FastAPI Integration

#### Step 1: Install FastAPI

```bash
pip install fastapi uvicorn
```

#### Step 2: Use Dependencies

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

### Django Integration

#### Step 1: Install Django

```bash
pip install django
```

#### Step 2: Use in Views

```python
from django.http import JsonResponse
from supabase_core_python.framework.django import get_supabase_client

def my_view(request):
    # Authenticated client
    supabase = get_supabase_client(request, require_auth=True)

    response = supabase.table("posts").select("*").execute()
    return JsonResponse({"data": response.data})
```

### Flask Integration

#### Step 1: Install Flask

```bash
pip install flask
```

#### Step 2: Use in Routes

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

## Advanced Usage

### Custom Error Handling

```python
from supabase_core_python import normalize_error, get_user_friendly_message

try:
    response = supabase.table("posts").insert(data).execute()
except Exception as e:
    normalized = normalize_error(e)
    user_message = get_user_friendly_message(e)
    # Log or handle error
```

### Retry Logic

```python
from supabase_core_python import with_retry, RetryConfig

def fetch_data():
    return supabase.table("posts").select("*").execute()

config = RetryConfig(max_retries=5, delay_ms=2000, exponential_backoff=True)
result = with_retry(fetch_data, config)
```

### Caching

```python
from supabase_core_python import QueryCache, create_cache_key

cache = QueryCache(ttl_seconds=300)

def fetch_posts():
    return supabase.table("posts").select("*").execute()

key = create_cache_key("posts", user_id=123)
result = cache.get_or_set(key, fetch_posts)
```

## Troubleshooting

### Import Errors

Ensure all dependencies are installed:

```bash
pip install -r requirements.txt
```

### Authentication Issues

Verify JWT extraction:

```python
# Check if JWT is being extracted correctly
jwt = request.headers.get("Authorization", "").replace("Bearer ", "")
print(f"JWT: {jwt[:20]}...")  # Print first 20 chars
```

### Type Generation

If types are missing:

```bash
# Ensure Supabase is running locally
supabase start

# Generate types
supabase gen types python --local > types/database_types.py
```

## Next Steps

- See `README.md` for complete API documentation
- Check framework-specific examples in `src/framework/`
- Review error handling patterns in `src/utils/error_handler.py`
