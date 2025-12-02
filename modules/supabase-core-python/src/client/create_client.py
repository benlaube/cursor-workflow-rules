"""
Client Factory

Creates Supabase client instances with automatic environment detection
(local vs production).
"""

import os
from typing import Optional
from supabase import create_client as create_supabase_client, Client


def is_local_environment() -> bool:
    """Detect if running in local development environment."""
    return (
        os.getenv("ENVIRONMENT", "").lower() == "development"
        or os.getenv("NODE_ENV", "").lower() == "development"
        or os.getenv("DEBUG", "").lower() == "true"
        or os.getenv("SUPABASE_URL", "").startswith("http://localhost")
    )


def create_client(
    url: Optional[str] = None,
    anon_key: Optional[str] = None,
    service_role_key: Optional[str] = None,
) -> Client:
    """
    Creates a Supabase client instance for client-side or generic server-side use.
    Automatically detects local environment and uses local Supabase URL/keys if available.

    Args:
        url: Custom Supabase URL (overrides env var)
        anon_key: Custom anon key (overrides env var)
        service_role_key: Service role key (use with caution, bypasses RLS)

    Returns:
        Supabase client instance

    Example:
        ```python
        from supabase_core_python import create_client

        # Automatically detects local vs production environment
        supabase = create_client()

        # Use in your code
        response = supabase.table("posts").select("*").execute()
        ```
    """
    is_local = is_local_environment()

    supabase_url = url or (
        os.getenv("SUPABASE_URL_LOCAL") if is_local else os.getenv("SUPABASE_URL")
    )
    supabase_anon_key = anon_key or (
        os.getenv("SUPABASE_ANON_KEY_LOCAL") if is_local else os.getenv("SUPABASE_ANON_KEY")
    )
    supabase_service_role_key = service_role_key or (
        os.getenv("SUPABASE_SERVICE_ROLE_KEY_LOCAL")
        if is_local
        else os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    )

    if not supabase_url or not supabase_anon_key:
        raise ValueError(
            "Missing Supabase configuration. Ensure SUPABASE_URL and SUPABASE_ANON_KEY "
            "are set in your environment variables."
        )

    # Use service role key if provided, otherwise use anon key
    key = supabase_service_role_key or supabase_anon_key

    return create_supabase_client(supabase_url, key)


def create_service_role_client(
    url: Optional[str] = None,
    service_role_key: Optional[str] = None,
) -> Client:
    """
    Creates a Supabase client instance with the service role key.
    This client bypasses Row Level Security (RLS) and should ONLY be used in
    secure server-side contexts (e.g., admin API routes, background jobs).

    WARNING: Never expose the service role key to client-side code!

    Args:
        url: Custom Supabase URL (overrides env var)
        service_role_key: Custom service role key (overrides env var)

    Returns:
        Supabase client instance with service role

    Example:
        ```python
        from supabase_core_python import create_service_role_client

        # Only use in secure server-side contexts
        admin_supabase = create_service_role_client()

        # Bypasses RLS - use with caution!
        response = admin_supabase.table("users").select("*").execute()
        ```
    """
    is_local = is_local_environment()
    supabase_url = url or (
        os.getenv("SUPABASE_URL_LOCAL") if is_local else os.getenv("SUPABASE_URL")
    )
    service_key = service_role_key or (
        os.getenv("SUPABASE_SERVICE_ROLE_KEY_LOCAL")
        if is_local
        else os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    )

    if not supabase_url or not service_key:
        raise ValueError(
            "Missing Supabase configuration. Ensure SUPABASE_URL and "
            "SUPABASE_SERVICE_ROLE_KEY are set for service role client."
        )

    return create_supabase_client(supabase_url, service_key)

