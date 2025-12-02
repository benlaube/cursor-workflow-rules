"""
Django Middleware and Helpers

Django-specific helpers for Supabase client creation and authentication.
"""

from typing import Optional
from django.http import HttpRequest
from supabase import Client

from ...client.create_client import create_client
from ...client.auth_client import create_authenticated_client, get_current_user


def get_supabase_client(request: HttpRequest, require_auth: bool = False) -> Client:
    """
    Get Supabase client from Django request.
    Can extract JWT from session, Authorization header, or cookie.

    Example:
        ```python
        from django.http import JsonResponse
        from supabase_core_python.framework.django import get_supabase_client

        def my_view(request):
            # Basic client (no auth)
            supabase = get_supabase_client(request)

            # Authenticated client
            supabase = get_supabase_client(request, require_auth=True)

            response = supabase.table("posts").select("*").execute()
            return JsonResponse({"data": response.data})
        ```

    Args:
        request: Django HttpRequest object
        require_auth: Whether authentication is required (default: False)

    Returns:
        Supabase client instance

    Raises:
        ValueError: If require_auth=True but no JWT found
    """
    if not require_auth:
        return create_client()

    # Try to get JWT from various sources
    jwt_token = None

    # 1. Check Authorization header
    auth_header = request.META.get("HTTP_AUTHORIZATION", "")
    if auth_header.startswith("Bearer "):
        jwt_token = auth_header[7:]

    # 2. Check session (if using Django session-based auth)
    if not jwt_token and hasattr(request, "session"):
        jwt_token = request.session.get("supabase_jwt")

    # 3. Check cookie
    if not jwt_token:
        jwt_token = request.COOKIES.get("sb-access-token")

    if not jwt_token:
        raise ValueError("No JWT token found. User must be authenticated.")

    return create_authenticated_client(jwt_token)

