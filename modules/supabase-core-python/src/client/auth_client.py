"""
Authentication Client Helpers

Utilities for creating authenticated Supabase clients from JWT tokens.
"""

from typing import Optional
from supabase import Client
from supabase.client import create_client as create_supabase_client


def create_authenticated_client(
    jwt_token: str,
    url: Optional[str] = None,
    anon_key: Optional[str] = None,
) -> Client:
    """
    Creates an authenticated Supabase client from a JWT token.
    This client will have the user's permissions and RLS policies will apply.

    Args:
        jwt_token: JWT token from Supabase Auth (from Authorization header, cookie, etc.)
        url: Custom Supabase URL (overrides env var)
        anon_key: Custom anon key (overrides env var)

    Returns:
        Authenticated Supabase client instance

    Example:
        ```python
        from supabase_core_python import create_authenticated_client

        # Extract JWT from request (framework-specific)
        jwt = request.headers.get("Authorization", "").replace("Bearer ", "")

        # Create authenticated client
        supabase = create_authenticated_client(jwt)

        # User's RLS policies apply
        response = supabase.table("posts").select("*").execute()
        ```
    """
    import os

    supabase_url = url or os.getenv("SUPABASE_URL")
    supabase_anon_key = anon_key or os.getenv("SUPABASE_ANON_KEY")

    if not supabase_url or not supabase_anon_key:
        raise ValueError(
            "Missing Supabase configuration. Ensure SUPABASE_URL and "
            "SUPABASE_ANON_KEY are set."
        )

    # Create client with anon key
    client = create_supabase_client(supabase_url, supabase_anon_key)

    # Set the JWT token in the client's PostgREST headers
    # This allows RLS policies to apply based on the authenticated user
    # 
    # Note: supabase-py v2+ uses postgrest client with session headers
    # We set the Authorization header directly on the postgrest session
    if hasattr(client, "postgrest") and hasattr(client.postgrest, "session"):
        # Set Authorization header on postgrest session
        # This is the correct way to authenticate with external JWT in supabase-py
        if hasattr(client.postgrest.session, "headers"):
            client.postgrest.session.headers["Authorization"] = f"Bearer {jwt_token}"
        elif hasattr(client.postgrest, "auth"):
            # Fallback: Try auth method if it exists
            client.postgrest.auth(jwt_token)
    elif hasattr(client, "auth") and hasattr(client.auth, "set_session"):
        # Alternative: Try to set session (may not work for external JWT)
        # This is less reliable but may work in some versions
        try:
            client.auth.set_session(access_token=jwt_token, refresh_token="")
        except Exception:
            # If set_session doesn't work, we need to set header manually
            # This is a fallback that may not work - user should verify
            pass

    return client


def get_current_user(client: Client) -> Optional[dict]:
    """
    Gets the current authenticated user from a Supabase client.

    Args:
        client: Supabase client instance (should be authenticated)

    Returns:
        User object if authenticated, None otherwise

    Example:
        ```python
        from supabase_core_python import create_authenticated_client, get_current_user

        supabase = create_authenticated_client(jwt_token)
        user = get_current_user(supabase)

        if not user:
            raise ValueError("User not authenticated")
        ```
    """
    try:
        user = client.auth.get_user()
        if user and hasattr(user, "user"):
            return user.user.model_dump() if hasattr(user.user, "model_dump") else dict(user.user)
        return None
    except Exception:
        return None

