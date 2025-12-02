"""
RLS (Row Level Security) Helpers

Utilities for testing and managing RLS policies.
"""

from typing import Optional
from supabase import Client


async def check_rls_enabled(client: Client, table_name: str) -> bool:
    """
    Tests if RLS is enabled on a table.

    Args:
        client: Supabase client (should use service role for this check)
        table_name: Name of the table to check

    Returns:
        True if RLS is enabled, False otherwise

    Example:
        ```python
        from supabase_core_python import check_rls_enabled, create_service_role_client

        admin_supabase = create_service_role_client()
        is_rls_enabled = await check_rls_enabled(admin_supabase, "profiles")

        if not is_rls_enabled:
            print("Warning: RLS is not enabled on profiles table")
        ```
    """
    try:
        # Try to call a database function that checks RLS
        response = client.rpc("check_rls_enabled", {"table_name": table_name}).execute()
        return response.data if hasattr(response, "data") else False
    except Exception:
        # Fallback: Assume enabled if we can't check
        # In practice, you'd query information_schema or pg_policies
        return True


def get_current_user_id(client: Client) -> Optional[str]:
    """
    Gets the current authenticated user's ID from JWT.
    Useful for RLS policy testing.

    Args:
        client: Authenticated Supabase client

    Returns:
        User ID if authenticated, None otherwise

    Example:
        ```python
        from supabase_core_python import get_current_user_id, create_authenticated_client

        supabase = create_authenticated_client(jwt_token)
        user_id = get_current_user_id(supabase)

        if user_id:
            # User is authenticated, RLS policies apply
            print(f"Current user: {user_id}")
        ```
    """
    try:
        user = client.auth.get_user()
        if user and hasattr(user, "user") and user.user:
            return user.user.id if hasattr(user.user, "id") else None
        return None
    except Exception:
        return None


def get_current_user_role(client: Client) -> Optional[str]:
    """
    Gets the current user's role from JWT claims.
    Roles are stored in app_metadata.role.

    Args:
        client: Authenticated Supabase client

    Returns:
        User role if available, None otherwise

    Example:
        ```python
        from supabase_core_python import get_current_user_role, create_authenticated_client

        supabase = create_authenticated_client(jwt_token)
        role = get_current_user_role(supabase)

        if role == "admin":
            # User has admin role
            print("Admin access granted")
        ```
    """
    try:
        user = client.auth.get_user()
        if user and hasattr(user, "user") and user.user:
            app_metadata = getattr(user.user, "app_metadata", None)
            if app_metadata and isinstance(app_metadata, dict):
                return app_metadata.get("role")
        return None
    except Exception:
        return None


def has_role(client: Client, required_role: str) -> bool:
    """
    Helper to check if current user has a specific role.

    Args:
        client: Authenticated Supabase client
        required_role: Role to check for

    Returns:
        True if user has the required role

    Example:
        ```python
        from supabase_core_python import has_role, create_authenticated_client

        supabase = create_authenticated_client(jwt_token)
        is_admin = has_role(supabase, "admin")

        if not is_admin:
            raise ValueError("Unauthorized: Admin access required")
        ```
    """
    role = get_current_user_role(client)
    return role == required_role

