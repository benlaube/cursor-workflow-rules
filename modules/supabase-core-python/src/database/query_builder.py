"""
Query Builder

Fluent API for common Supabase query patterns.
Provides type-safe, reusable query building utilities.
"""

from typing import Optional, Any, List
from supabase import Client


class QueryBuilder:
    """
    Fluent query builder for common patterns.

    Example:
        ```python
        from supabase_core_python import QueryBuilder

        query = QueryBuilder(supabase, "posts")
        response = (
            query
            .select("id, title, content")
            .where("published", True)
            .order_by("created_at", "desc")
            .limit(10)
            .execute()
        )
        ```
    """

    def __init__(self, client: Client, table: str, select: Optional[str] = None):
        """
        Initialize query builder.

        Args:
            client: Supabase client instance
            table: Table name
            select: Default select columns (default: "*")
        """
        self.client = client
        self.table = table
        self._select = select or "*"
        self._query = client.table(table).select(self._select)

    def where(self, column: str, value: Any) -> "QueryBuilder":
        """
        Add WHERE clause (equality).

        Args:
            column: Column name
            value: Value to match

        Returns:
            Self for method chaining
        """
        self._query = self._query.eq(column, value)
        return self

    def where_not(self, column: str, value: Any) -> "QueryBuilder":
        """
        Add WHERE clause (inequality).

        Args:
            column: Column name
            value: Value to not match

        Returns:
            Self for method chaining
        """
        self._query = self._query.neq(column, value)
        return self

    def where_in(self, column: str, values: List[Any]) -> "QueryBuilder":
        """
        Add WHERE IN clause.

        Args:
            column: Column name
            values: List of values to match

        Returns:
            Self for method chaining
        """
        self._query = self._query.in_(column, values)
        return self

    def where_like(self, column: str, pattern: str) -> "QueryBuilder":
        """
        Add WHERE LIKE clause (case-insensitive).

        Args:
            column: Column name
            pattern: Pattern to match (will be wrapped with %)

        Returns:
            Self for method chaining
        """
        self._query = self._query.ilike(column, f"%{pattern}%")
        return self

    def order_by(self, column: str, direction: str = "asc") -> "QueryBuilder":
        """
        Add ORDER BY clause.

        Args:
            column: Column name
            direction: "asc" or "desc" (default: "asc")

        Returns:
            Self for method chaining
        """
        ascending = direction.lower() == "asc"
        self._query = self._query.order(column, desc=not ascending)
        return self

    def limit(self, count: int) -> "QueryBuilder":
        """
        Add LIMIT clause.

        Args:
            count: Maximum number of results

        Returns:
            Self for method chaining
        """
        self._query = self._query.limit(count)
        return self

    def offset(self, count: int) -> "QueryBuilder":
        """
        Add OFFSET clause (for pagination).

        Args:
            count: Number of results to skip

        Returns:
            Self for method chaining
        """
        self._query = self._query.offset(count)
        return self

    def range(self, from_: int, to: int) -> "QueryBuilder":
        """
        Add RANGE clause (for pagination).

        Args:
            from_: Start index (inclusive)
            to: End index (inclusive)

        Returns:
            Self for method chaining
        """
        self._query = self._query.range(from_, to)
        return self

    def execute(self) -> Any:
        """
        Execute the query and return results.

        Returns:
            Query response with data and error
        """
        return self._query.execute()

    def single(self) -> Any:
        """
        Execute the query and return single result.

        Returns:
            Single row or None
        """
        return self._query.single().execute()

    def count(self) -> int:
        """
        Execute the query and return count.

        Returns:
            Number of matching rows
        """
        response = self._query.select("*", count="exact").limit(0).execute()
        return response.count if hasattr(response, "count") else 0


def query_builder(client: Client, table: str, select: Optional[str] = None) -> QueryBuilder:
    """
    Create a new query builder instance.

    Example:
        ```python
        from supabase_core_python import query_builder

        response = (
            query_builder(supabase, "posts")
            .where("published", True)
            .order_by("created_at", "desc")
            .limit(10)
            .execute()
        )
        ```

    Args:
        client: Supabase client instance
        table: Table name
        select: Columns to select (default: "*")

    Returns:
        QueryBuilder instance
    """
    return QueryBuilder(client, table, select)

