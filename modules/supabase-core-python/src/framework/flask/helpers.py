"""
Flask Helpers

Flask-specific helpers for Supabase client creation and authentication.
"""

from typing import Optional
from flask import request, g
from supabase import Client

from ...client.create_client import create_client
from ...client.auth_client import create_authenticated_client, get_current_user


def get_supabase_client(require_auth: bool = False) -> Client:
    """
    Get Supabase client from Flask request context.
    Can extract JWT from Authorization header or cookie.
    Uses Flask's `g` object for caching.

    Example:
        ```python
        from flask import Flask, jsonify
        from supabase_core_python.framework.flask import get_supabase_client

        app = Flask(__name__)

        @app.route("/posts")
        def get_posts():
            # Basic client (no auth)
            supabase = get_supabase_client()

            # Authenticated client
            supabase = get_supabase_client(require_auth=True)

            response = supabase.table("posts").select("*").execute()
            return jsonify({"data": response.data})
        ```

    Args:
        require_auth: Whether authentication is required (default: False)

    Returns:
        Supabase client instance

    Raises:
        ValueError: If require_auth=True but no JWT found
    """
    # Cache client in Flask's g object
    cache_key = "supabase_client_auth" if require_auth else "supabase_client"
    if hasattr(g, cache_key):
        return getattr(g, cache_key)

    if not require_auth:
        client = create_client()
        setattr(g, cache_key, client)
        return client

    # Try to get JWT from various sources
    jwt_token = None

    # 1. Check Authorization header
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        jwt_token = auth_header[7:]

    # 2. Check cookie
    if not jwt_token:
        jwt_token = request.cookies.get("sb-access-token")

    if not jwt_token:
        raise ValueError("No JWT token found. User must be authenticated.")("No JWT token found. User must be authenticated.")

    client = create_authenticated_client(jwt_token)
    setattr(g, cache_key, client)
    return client

