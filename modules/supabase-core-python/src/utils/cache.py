"""
Cache Utilities

Utilities for caching Supabase query results.
"""

from typing import Any, Optional, Dict, Callable
import hashlib
import json
import time


class QueryCache:
    """
    Simple in-memory cache for Supabase query results.

    Example:
        ```python
        from supabase_core_python import QueryCache

        cache = QueryCache(ttl_seconds=300)  # 5 minute TTL

        def fetch_posts():
            return supabase.table("posts").select("*").execute()

        # Cache the result
        result = cache.get_or_set("posts:all", fetch_posts)
        ```
    """

    def __init__(self, ttl_seconds: int = 300):
        """
        Initialize cache.

        Args:
            ttl_seconds: Time-to-live for cached entries (default: 300 seconds)
        """
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.ttl_seconds = ttl_seconds

    def get(self, key: str) -> Optional[Any]:
        """
        Get cached value.

        Args:
            key: Cache key

        Returns:
            Cached value or None if not found/expired
        """
        if key not in self.cache:
            return None

        entry = self.cache[key]
        if time.time() > entry["expires_at"]:
            del self.cache[key]
            return None

        return entry["value"]

    def set(self, key: str, value: Any) -> None:
        """
        Set cached value.

        Args:
            key: Cache key
            value: Value to cache
        """
        self.cache[key] = {
            "value": value,
            "expires_at": time.time() + self.ttl_seconds,
        }

    def get_or_set(self, key: str, operation: Callable[[], Any]) -> Any:
        """
        Get cached value or execute operation and cache result.

        Args:
            key: Cache key
            operation: Function to execute if cache miss

        Returns:
            Cached or newly computed value
        """
        cached = self.get(key)
        if cached is not None:
            return cached

        result = operation()
        self.set(key, result)
        return result

    def clear(self) -> None:
        """Clear all cached entries."""
        self.cache.clear()

    def invalidate(self, key: str) -> None:
        """
        Invalidate a specific cache entry.

        Args:
            key: Cache key to invalidate
        """
        if key in self.cache:
            del self.cache[key]


# Global cache instance
global_cache = QueryCache()


def create_cache_key(*args: Any, **kwargs: Any) -> str:
    """
    Creates a cache key from arguments.

    Args:
        *args: Positional arguments
        **kwargs: Keyword arguments

    Returns:
        Cache key string

    Example:
        ```python
        from supabase_core_python import create_cache_key

        key = create_cache_key("posts", user_id=123, page=1)
        # Returns: "posts:user_id=123:page=1"
        ```
    """
    parts = []
    for arg in args:
        parts.append(str(arg))
    for key, value in sorted(kwargs.items()):
        parts.append(f"{key}={value}")

    # Create hash for long keys
    key_string = ":".join(parts)
    if len(key_string) > 200:
        key_string = hashlib.md5(key_string.encode()).hexdigest()

    return key_string

