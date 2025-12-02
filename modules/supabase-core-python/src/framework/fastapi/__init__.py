"""FastAPI integration for Supabase."""

from .dependencies import get_supabase_client, get_authenticated_supabase

__all__ = ["get_supabase_client", "get_authenticated_supabase"]

