"""
Tests for query builder utilities.
"""

import pytest
from supabase_core_python.database.query_builder import QueryBuilder


class TestQueryBuilder:
    """Tests for QueryBuilder class."""
    
    def test_query_builder_initialization(self, mock_supabase_client):
        """Test query builder initialization."""
        builder = QueryBuilder(mock_supabase_client, "posts")
        
        assert builder.client == mock_supabase_client
        assert builder.table == "posts"
        assert builder._select == "*"
    
    def test_query_builder_custom_select(self, mock_supabase_client):
        """Test query builder with custom select."""
        builder = QueryBuilder(mock_supabase_client, "posts", select="id, title")
        
        assert builder._select == "id, title"
    
    def test_query_builder_where(self, mock_supabase_client):
        """Test WHERE clause."""
        builder = QueryBuilder(mock_supabase_client, "posts")
        result = builder.where("published", True)
        
        assert result is builder  # Should return self for chaining
        # Verify eq was called on the query
        mock_supabase_client.table.return_value.eq.assert_called_with("published", True)
    
    def test_query_builder_where_not(self, mock_supabase_client):
        """Test WHERE NOT clause."""
        builder = QueryBuilder(mock_supabase_client, "posts")
        result = builder.where_not("deleted", True)
        
        assert result is builder
        mock_supabase_client.table.return_value.neq.assert_called_with("deleted", True)
    
    def test_query_builder_where_in(self, mock_supabase_client):
        """Test WHERE IN clause."""
        builder = QueryBuilder(mock_supabase_client, "posts")
        result = builder.where_in("id", [1, 2, 3])
        
        assert result is builder
        mock_supabase_client.table.return_value.in_.assert_called_with("id", [1, 2, 3])
    
    def test_query_builder_order_by(self, mock_supabase_client):
        """Test ORDER BY clause."""
        builder = QueryBuilder(mock_supabase_client, "posts")
        result = builder.order_by("created_at", "desc")
        
        assert result is builder
        mock_supabase_client.table.return_value.order.assert_called_with("created_at", desc=True)
    
    def test_query_builder_limit(self, mock_supabase_client):
        """Test LIMIT clause."""
        builder = QueryBuilder(mock_supabase_client, "posts")
        result = builder.limit(10)
        
        assert result is builder
        mock_supabase_client.table.return_value.limit.assert_called_with(10)
    
    def test_query_builder_execute(self, mock_supabase_client):
        """Test query execution."""
        builder = QueryBuilder(mock_supabase_client, "posts")
        response = builder.execute()
        
        assert response is not None
        assert hasattr(response, "data")
        mock_supabase_client.table.return_value.execute.assert_called_once()
    
    def test_query_builder_single(self, mock_supabase_client):
        """Test single result query."""
        builder = QueryBuilder(mock_supabase_client, "posts")
        response = builder.single()
        
        assert response is not None
        mock_supabase_client.table.return_value.single.assert_called_once()
    
    def test_query_builder_count(self, mock_supabase_client):
        """Test count query."""
        builder = QueryBuilder(mock_supabase_client, "posts")
        count = builder.count()
        
        assert count >= 0
        # Verify count query was executed
        mock_supabase_client.table.return_value.select.assert_called()
    
    def test_query_builder_chaining(self, mock_supabase_client):
        """Test method chaining."""
        builder = (
            QueryBuilder(mock_supabase_client, "posts")
            .where("published", True)
            .order_by("created_at", "desc")
            .limit(10)
        )
        
        assert builder is not None
        # Verify all methods were called
        mock_supabase_client.table.return_value.eq.assert_called()
        mock_supabase_client.table.return_value.order.assert_called()
        mock_supabase_client.table.return_value.limit.assert_called()

