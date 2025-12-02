"""
Error Handler

Utilities for normalizing and handling Supabase errors.
"""

from dataclasses import dataclass
from typing import Optional, Dict, Any

# Common Supabase error codes
SUPABASE_ERROR_CODES: Dict[str, str] = {
    "PGRST116": "No rows returned",
    "23505": "Unique constraint violation",
    "23503": "Foreign key constraint violation",
    "42P01": "Table does not exist",
    "42501": "Insufficient privileges",
    "PGRST301": "JWT expired",
    "PGRST302": "JWT invalid",
}


@dataclass
class NormalizedError:
    """Normalized error structure."""

    message: str
    code: Optional[str] = None
    status_code: Optional[int] = None
    details: Optional[Dict[str, Any]] = None


def normalize_error(error: Any) -> NormalizedError:
    """
    Normalizes a Supabase error into a standard structure.

    Args:
        error: Error object from Supabase

    Returns:
        Normalized error structure

    Example:
        ```python
        from supabase_core_python import normalize_error

        try:
            response = supabase.table("posts").insert(data).execute()
        except Exception as e:
            normalized = normalize_error(e)
            print(f"Error: {normalized.message} (Code: {normalized.code})")
        ```
    """
    # Handle different error types
    if isinstance(error, dict):
        message = error.get("message", str(error))
        code = error.get("code") or error.get("error_code")
        status_code = error.get("status_code") or error.get("status")
        details = error.get("details") or error.get("hint")
    elif hasattr(error, "message"):
        message = str(error.message)
        code = getattr(error, "code", None)
        status_code = getattr(error, "status_code", None)
        details = getattr(error, "details", None)
    else:
        message = str(error)
        code = None
        status_code = None
        details = None

    return NormalizedError(
        message=message,
        code=code,
        status_code=status_code,
        details={"details": details} if details else None,
    )


def is_error_code(error: Any, code: str) -> bool:
    """
    Checks if an error matches a specific error code.

    Args:
        error: Error object
        code: Error code to check for

    Returns:
        True if error code matches
    """
    normalized = normalize_error(error)
    return normalized.code == code


def get_user_friendly_message(error: Any) -> str:
    """
    Gets a user-friendly error message from a Supabase error.

    Args:
        error: Error object

    Returns:
        User-friendly error message

    Example:
        ```python
        from supabase_core_python import get_user_friendly_message

        try:
            response = supabase.table("posts").insert(data).execute()
        except Exception as e:
            user_message = get_user_friendly_message(e)
            return {"error": user_message}
        ```
    """
    normalized = normalize_error(error)

    # Check if we have a friendly message for this error code
    if normalized.code and normalized.code in SUPABASE_ERROR_CODES:
        return SUPABASE_ERROR_CODES[normalized.code]

    # Return the error message
    return normalized.message

