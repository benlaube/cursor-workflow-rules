"""
Pagination Helpers

Utilities for implementing pagination in Supabase queries.
Provides consistent pagination patterns across the application.
"""

from typing import Generic, TypeVar, List, Dict, Any, Optional
from dataclasses import dataclass
from supabase import Client

T = TypeVar("T")


@dataclass
class PaginationParams:
    """Pagination parameters."""

    page: int  # Page number (1-indexed)
    limit: int  # Items per page


@dataclass
class PaginatedResponse(Generic[T]):
    """Paginated response."""

    data: List[T]  # Data items for current page
    total: int  # Total number of items
    page: int  # Current page number
    limit: int  # Items per page
    total_pages: int  # Total number of pages
    has_next: bool  # Whether there is a next page
    has_prev: bool  # Whether there is a previous page


def paginate(
    query: Any,  # Supabase query builder
    params: PaginationParams,
) -> PaginatedResponse[Dict[str, Any]]:
    """
    Paginates a Supabase query.

    Args:
        query: Supabase query builder (from client.table().select())
        params: Pagination parameters

    Returns:
        Paginated response with metadata

    Example:
        ```python
        from supabase_core_python import paginate, PaginationParams

        query = supabase.table("posts").select("*", count="exact")
        response = paginate(query, PaginationParams(page=1, limit=10))

        print(f"Total: {response.total}, Page: {response.page}")
        print(f"Has next: {response.has_next}")
        ```
    """
    page, limit = params.page, params.limit
    offset = (page - 1) * limit

    # Execute query with pagination
    response = query.range(offset, offset + limit - 1).execute()

    # Extract data and count
    data = response.data if hasattr(response, "data") else []
    total = response.count if hasattr(response, "count") else len(data)

    total_pages = (total + limit - 1) // limit  # Ceiling division

    return PaginatedResponse(
        data=data,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
        has_next=page < total_pages,
        has_prev=page > 1,
    )


def parse_pagination_params(
    search_params: Dict[str, Any],
    defaults: Optional[PaginationParams] = None,
) -> PaginationParams:
    """
    Creates pagination parameters from query string or dict.
    Useful for parsing pagination from URL query parameters.

    Args:
        search_params: URL search params or dict with page/limit
        defaults: Default pagination values (default: page=1, limit=10)

    Returns:
        Normalized pagination parameters

    Example:
        ```python
        from supabase_core_python import parse_pagination_params

        # From URL: ?page=2&limit=20
        params = parse_pagination_params({"page": "2", "limit": "20"})
        # Returns: PaginationParams(page=2, limit=20)
        ```
    """
    if defaults is None:
        defaults = PaginationParams(page=1, limit=10)

    page = int(search_params.get("page", defaults.page))
    limit = int(search_params.get("limit", defaults.limit))

    # Validate and clamp values
    page = max(1, page)
    limit = max(1, min(100, limit))  # Max 100 items per page

    return PaginationParams(page=page, limit=limit)

