"""
FastAPI Dependencies

FastAPI-specific helpers for Supabase client creation and authentication.
"""

from typing import Optional
from fastapi import Header, HTTPException, Depends, Request
from supabase import Client

from ...client.create_client import create_client
from ...client.auth_client import create_authenticated_client, get_current_user


def get_supabase_client() -> Client:
    """
    FastAPI dependency for basic Supabase client (no authentication).

    Example:
        ```python
        from fastapi import FastAPI, Depends
        from supabase_core_python.framework.fastapi import get_supabase_client

        app = FastAPI()

        @app.get("/posts")
        async def get_posts(supabase: Client = Depends(get_supabase_client)):
            response = supabase.table("posts").select("*").execute()
            return response.data
        ```

    Returns:
        Supabase client instance
    """
    return create_client()


def get_authenticated_supabase(
    authorization: Optional[str] = Header(None),
) -> Client:
    """
    FastAPI dependency for authenticated Supabase client.
    Extracts JWT from Authorization header.

    Example:
        ```python
        from fastapi import FastAPI, Depends
        from supabase_core_python.framework.fastapi import get_authenticated_supabase

        app = FastAPI()

        @app.get("/profile")
        async def get_profile(supabase: Client = Depends(get_authenticated_supabase)):
            user = get_current_user(supabase)
            if not user:
                raise HTTPException(401, "Unauthorized")

            response = supabase.table("profiles").select("*").eq("id", user["id"]).execute()
            return response.data
        ```

    Args:
        authorization: Authorization header (Bearer token)

    Returns:
        Authenticated Supabase client instance

    Raises:
        HTTPException: If authorization header is missing or invalid
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")

    # Extract JWT from "Bearer <token>" format
    if authorization.startswith("Bearer "):
        jwt_token = authorization[7:]
    else:
        jwt_token = authorization

    try:
        return create_authenticated_client(jwt_token)
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

