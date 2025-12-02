"""
Pytest configuration and fixtures for supabase-core-python tests.
"""

import pytest
from unittest.mock import Mock, MagicMock
from typing import Dict, Any


@pytest.fixture
def mock_supabase_client():
    """
    Creates a mock Supabase client for testing.
    
    Returns:
        Mock Supabase client with common methods
    """
    client = Mock()
    
    # Mock table query builder
    mock_query = Mock()
    mock_query.select.return_value = mock_query
    mock_query.where.return_value = mock_query
    mock_query.eq.return_value = mock_query
    mock_query.neq.return_value = mock_query
    mock_query.in_.return_value = mock_query
    mock_query.gt.return_value = mock_query
    mock_query.gte.return_value = mock_query
    mock_query.lt.return_value = mock_query
    mock_query.lte.return_value = mock_query
    mock_query.like.return_value = mock_query
    mock_query.ilike.return_value = mock_query
    mock_query.is_.return_value = mock_query
    mock_query.order.return_value = mock_query
    mock_query.order_by.return_value = mock_query
    mock_query.limit.return_value = mock_query
    mock_query.range.return_value = mock_query
    mock_query.single.return_value = mock_query
    
    # Mock execute response
    mock_response = Mock()
    mock_response.data = [{"id": 1, "title": "Test"}]
    mock_response.count = 1
    mock_response.error = None
    mock_query.execute.return_value = mock_response
    mock_query.single.return_value.execute.return_value = mock_response
    
    # Mock table method
    client.table.return_value = mock_query
    
    # Mock storage
    mock_storage_bucket = Mock()
    mock_storage_bucket.upload.return_value = mock_storage_bucket
    mock_storage_bucket.download.return_value = mock_storage_bucket
    mock_storage_bucket.get_public_url.return_value = "https://example.com/file.txt"
    mock_storage_bucket.execute.return_value = {"path": "test/file.txt"}
    
    mock_storage = Mock()
    mock_storage.from_.return_value = mock_storage_bucket
    client.storage = mock_storage
    
    # Mock auth
    mock_auth = Mock()
    mock_auth_user = Mock()
    mock_auth_user.user = Mock()
    mock_auth_user.user.model_dump.return_value = {"id": "user-123", "email": "test@example.com"}
    mock_auth.get_user.return_value = mock_auth_user
    mock_auth.set_session.return_value = None
    client.auth = mock_auth
    
    # Mock postgrest (for auth header setting)
    mock_postgrest = Mock()
    mock_postgrest.session = Mock()
    mock_postgrest.session.headers = {}
    client.postgrest = mock_postgrest
    
    # Mock channel (for real-time)
    mock_channel = Mock()
    mock_channel.on.return_value = mock_channel
    mock_channel.subscribe.return_value = None
    client.channel.return_value = mock_channel
    client.remove_channel.return_value = None
    
    # Mock RPC
    mock_rpc = Mock()
    mock_rpc.execute.return_value = Mock(data=True, error=None)
    client.rpc.return_value = mock_rpc
    
    return client


@pytest.fixture
def mock_env_vars(monkeypatch):
    """
    Sets up mock environment variables for Supabase.
    
    Args:
        monkeypatch: Pytest monkeypatch fixture
    """
    monkeypatch.setenv("SUPABASE_URL", "https://test.supabase.co")
    monkeypatch.setenv("SUPABASE_ANON_KEY", "test-anon-key")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "test-service-role-key")


@pytest.fixture
def sample_jwt_token():
    """
    Returns a sample JWT token for testing.
    
    Note: This is not a real JWT, just for testing structure.
    """
    return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSJ9.test"


@pytest.fixture
def sample_upload_file(tmp_path):
    """
    Creates a temporary file for upload testing.
    
    Args:
        tmp_path: Pytest temporary path fixture
        
    Returns:
        Path to temporary file
    """
    test_file = tmp_path / "test.txt"
    test_file.write_text("Test content")
    return test_file

