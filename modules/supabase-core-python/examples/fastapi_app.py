"""
FastAPI application example using supabase-core-python.

This demonstrates how to integrate supabase-core-python with FastAPI.
"""

from fastapi import FastAPI, Depends, HTTPException
from fastapi.responses import JSONResponse
from supabase_core_python.framework.fastapi import (
    get_supabase_client,
    get_authenticated_supabase,
)
from supabase_core_python.client.auth_client import get_current_user
from supabase_core_python.database.query_builder import query_builder

app = FastAPI(title="Supabase Core Python - FastAPI Example")


@app.get("/")
async def root():
    """Public endpoint."""
    return {"message": "Supabase Core Python FastAPI Example"}


@app.get("/posts")
async def get_posts(supabase=Depends(get_supabase_client)):
    """
    Get all posts (public endpoint, no authentication required).
    
    Note: RLS policies will still apply if enabled.
    """
    try:
        response = supabase.table("posts").select("*").limit(10).execute()
        return {"data": response.data, "count": len(response.data)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/profile")
async def get_profile(supabase=Depends(get_authenticated_supabase)):
    """
    Get current user's profile (requires authentication).
    
    The JWT token is automatically extracted from the Authorization header.
    """
    try:
        # Get current user
        user = get_current_user(supabase)
        if not user:
            raise HTTPException(status_code=401, detail="User not authenticated")
        
        # Query user's profile
        response = (
            query_builder(supabase, "profiles")
            .where("id", user["id"])
            .single()
            .execute()
        )
        
        return {"user": user, "profile": response.data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/posts")
async def create_post(
    title: str,
    content: str,
    supabase=Depends(get_authenticated_supabase),
):
    """
    Create a new post (requires authentication).
    
    RLS policies will ensure users can only create posts they're allowed to.
    """
    try:
        user = get_current_user(supabase)
        if not user:
            raise HTTPException(status_code=401, detail="User not authenticated")
        
        # Insert post
        response = (
            supabase.table("posts")
            .insert({"title": title, "content": content, "user_id": user["id"]})
            .execute()
        )
        
        return {"message": "Post created", "data": response.data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(app, host="0.0.0.0", port=8000)

