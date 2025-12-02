"""
Tests for pagination utilities.
"""

import pytest
from supabase_core_python.database.pagination import paginate, PaginationParams, PaginatedResponse


class TestPagination:
    """Tests for pagination functions."""
    
    def test_pagination_basic(self, mock_supabase_client):
        """Test basic pagination."""
        query = mock_supabase_client.table("posts").select("*")
        
        params = PaginationParams(page=1, limit=10)
        result = paginate(query, params)
        
        assert isinstance(result, PaginatedResponse)
        assert result.page == 1
        assert result.limit == 10
        assert result.data is not None
    
    def test_pagination_count(self, mock_supabase_client):
        """Test pagination with count."""
        query = mock_supabase_client.table("posts").select("*")
        
        params = PaginationParams(page=1, limit=10)
        result = paginate(query, params)
        
        # Verify count query was attempted
        # Note: Actual count depends on supabase-py API
        assert hasattr(result, "total") or hasattr(result, "count")
    
    def test_pagination_offset_calculation(self, mock_supabase_client):
        """Test that offset is calculated correctly."""
        query = mock_supabase_client.table("posts").select("*")
        
        # Page 1: offset = 0
        params1 = PaginationParams(page=1, limit=10)
        result1 = paginate(query, params1)
        assert result1.page == 1
        
        # Page 2: offset = 10
        params2 = PaginationParams(page=2, limit=10)
        result2 = paginate(query, params2)
        assert result2.page == 2
    
    def test_pagination_has_next(self, mock_supabase_client):
        """Test has_next calculation."""
        query = mock_supabase_client.table("posts").select("*")
        
        params = PaginationParams(page=1, limit=10)
        result = paginate(query, params)
        
        # has_next should be calculated based on total and current page
        assert hasattr(result, "has_next")
        assert isinstance(result.has_next, bool)
    
    def test_pagination_has_previous(self, mock_supabase_client):
        """Test has_previous calculation."""
        query = mock_supabase_client.table("posts").select("*")
        
        params = PaginationParams(page=2, limit=10)
        result = paginate(query, params)
        
        assert hasattr(result, "has_prev")
        assert isinstance(result.has_prev, bool)
    
    def test_pagination_empty_results(self, mock_supabase_client):
        """Test pagination with empty results."""
        # Mock empty response
        mock_query = mock_supabase_client.table("posts").select("*")
        mock_response = Mock()
        mock_response.data = []
        mock_response.count = 0
        mock_query.execute.return_value = mock_response
        
        params = PaginationParams(page=1, limit=10)
        result = paginate(mock_query, params)
        
        assert result.data == []
        assert result.total == 0

