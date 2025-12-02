"""
Tests for utility functions (error handling, retry, cache).
"""

import pytest
from unittest.mock import Mock, patch
from supabase_core_python.utils.error_handler import normalize_error, NormalizedError
from supabase_core_python.utils.retry import with_retry, RetryConfig


class TestErrorHandler:
    """Tests for error handling utilities."""
    
    def test_normalize_error_supabase_error(self):
        """Test normalizing Supabase-specific errors."""
        # Mock Supabase error
        mock_error = Mock()
        mock_error.message = "Database error"
        mock_error.code = "PGRST116"
        
        result = normalize_error(mock_error)
        
        assert isinstance(result, NormalizedError)
        assert result.message == "Database error"
        assert result.code == "PGRST116"
    
    def test_normalize_error_generic_exception(self):
        """Test normalizing generic exceptions."""
        error = ValueError("Generic error")
        
        result = normalize_error(error)
        
        assert isinstance(result, NormalizedError)
        assert result.message == "Generic error"


class TestRetry:
    """Tests for retry utilities."""
    
    def test_with_retry_success(self):
        """Test retry with successful operation."""
        def operation():
            return "success"
        
        result = with_retry(operation, RetryConfig(max_retries=3))
        
        assert result == "success"
    
    def test_with_retry_eventual_success(self):
        """Test retry with eventual success after failures."""
        attempts = [0]
        
        def operation():
            attempts[0] += 1
            if attempts[0] < 3:
                raise Exception("Temporary error")
            return "success"
        
        result = with_retry(operation, RetryConfig(max_retries=3, delay_ms=10))
        
        assert result == "success"
        assert attempts[0] == 3
    
    def test_with_retry_max_retries_exceeded(self):
        """Test retry when max retries exceeded."""
        def operation():
            raise Exception("Persistent error")
        
        with pytest.raises(Exception, match="Persistent error"):
            with_retry(operation, RetryConfig(max_retries=2, delay_ms=10))
    
    def test_with_retry_exponential_backoff(self):
        """Test retry with exponential backoff."""
        attempts = [0]
        
        def operation():
            attempts[0] += 1
            if attempts[0] < 2:
                raise Exception("Error")
            return "success"
        
        config = RetryConfig(max_retries=3, delay_ms=10, exponential_backoff=True)
        result = with_retry(operation, config)
        
        assert result == "success"

