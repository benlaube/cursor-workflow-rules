"""
Retry Utilities

Utilities for retrying Supabase operations with configurable retry logic.
"""

from dataclasses import dataclass
from typing import Callable, Any, Optional
import time


@dataclass
class RetryConfig:
    """Retry configuration."""

    max_retries: int = 3  # Maximum number of retry attempts
    delay_ms: int = 1000  # Delay between retries (milliseconds)
    exponential_backoff: bool = True  # Use exponential backoff
    should_retry: Optional[Callable[[Any], bool]] = None  # Function to determine if error should be retried


def with_retry(
    operation: Callable[[], Any],
    config: Optional[RetryConfig] = None,
) -> Any:
    """
    Retries a Supabase operation with configurable retry logic.

    Args:
        operation: Function that performs the Supabase operation
        config: Retry configuration (default: max_retries=3, delay_ms=1000)

    Returns:
        Result from operation

    Raises:
        Exception: Last error if all retries fail

    Example:
        ```python
        from supabase_core_python import with_retry, RetryConfig

        def fetch_posts():
            return supabase.table("posts").select("*").execute()

        # With default config
        result = with_retry(fetch_posts)

        # With custom config
        config = RetryConfig(max_retries=5, delay_ms=2000)
        result = with_retry(fetch_posts, config)
        ```
    """
    if config is None:
        config = RetryConfig()

    last_error = None

    for attempt in range(config.max_retries + 1):
        try:
            return operation()
        except Exception as error:
            last_error = error

            # Check if we should retry this error
            if config.should_retry and not config.should_retry(error):
                raise error

            # Don't retry on certain errors (e.g., validation errors)
            if hasattr(error, "code"):
                error_code = getattr(error, "code", None)
                if error_code in ["23505", "23503"]:  # Unique constraint, foreign key
                    raise error

            # Don't retry on last attempt
            if attempt < config.max_retries:
                # Calculate delay
                if config.exponential_backoff:
                    delay = config.delay_ms * (2 ** attempt)
                else:
                    delay = config.delay_ms

                time.sleep(delay / 1000.0)  # Convert ms to seconds
                continue

    # All retries failed
    raise last_error or Exception("Operation failed after retries")

