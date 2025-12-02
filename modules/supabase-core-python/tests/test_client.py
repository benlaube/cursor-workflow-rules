"""
Tests for Supabase client creation and authentication.
"""

import pytest
import os
from unittest.mock import Mock, patch, MagicMock
from supabase_core_python.client.create_client import create_client, create_service_role_client
from supabase_core_python.client.auth_client import create_authenticated_client, get_current_user


class TestCreateClient:
    """Tests for basic client creation."""
    
    def test_create_client_with_env_vars(self, mock_env_vars):
        """Test creating client with environment variables."""
        with patch("supabase_core_python.client.create_client.create_supabase_client") as mock_create:
            mock_client = Mock()
            mock_create.return_value = mock_client
            
            client = create_client()
            
            assert client is not None
            mock_create.assert_called_once()
    
    def test_create_client_with_custom_params(self):
        """Test creating client with custom URL and key."""
        with patch("supabase_core_python.client.create_client.create_supabase_client") as mock_create:
            mock_client = Mock()
            mock_create.return_value = mock_client
            
            client = create_client(url="https://custom.supabase.co", anon_key="custom-key")
            
            assert client is not None
            mock_create.assert_called_once_with("https://custom.supabase.co", "custom-key")
    
    def test_create_client_missing_env_vars(self):
        """Test that missing environment variables raise error."""
        # Clear environment variables
        if "SUPABASE_URL" in os.environ:
            del os.environ["SUPABASE_URL"]
        if "SUPABASE_ANON_KEY" in os.environ:
            del os.environ["SUPABASE_ANON_KEY"]
        
        with pytest.raises(ValueError, match="Missing Supabase configuration"):
            create_client()


class TestCreateServiceRoleClient:
    """Tests for service role client creation."""
    
    def test_create_service_role_client_with_env_vars(self, mock_env_vars):
        """Test creating service role client with environment variables."""
        with patch("supabase_core_python.client.create_client.create_supabase_client") as mock_create:
            mock_client = Mock()
            mock_create.return_value = mock_client
            
            client = create_service_role_client()
            
            assert client is not None
            # Should use service role key
            mock_create.assert_called_once()
            args = mock_create.call_args[0]
            assert args[1] == "test-service-role-key"
    
    def test_create_service_role_client_missing_key(self):
        """Test that missing service role key raises error."""
        if "SUPABASE_SERVICE_ROLE_KEY" in os.environ:
            del os.environ["SUPABASE_SERVICE_ROLE_KEY"]
        
        with pytest.raises(ValueError, match="Missing.*SUPABASE_SERVICE_ROLE_KEY"):
            create_service_role_client()


class TestCreateAuthenticatedClient:
    """Tests for authenticated client creation."""
    
    def test_create_authenticated_client_with_jwt(self, mock_env_vars, sample_jwt_token):
        """Test creating authenticated client with JWT token."""
        with patch("supabase_core_python.client.auth_client.create_supabase_client") as mock_create:
            mock_client = Mock()
            mock_postgrest = Mock()
            mock_postgrest.session = Mock()
            mock_postgrest.session.headers = {}
            mock_client.postgrest = mock_postgrest
            mock_create.return_value = mock_client
            
            client = create_authenticated_client(sample_jwt_token)
            
            assert client is not None
            # Verify JWT was set in headers
            assert mock_postgrest.session.headers.get("Authorization") == f"Bearer {sample_jwt_token}"
    
    def test_create_authenticated_client_missing_config(self, sample_jwt_token):
        """Test that missing configuration raises error."""
        if "SUPABASE_URL" in os.environ:
            del os.environ["SUPABASE_URL"]
        
        with pytest.raises(ValueError, match="Missing Supabase configuration"):
            create_authenticated_client(sample_jwt_token)
    
    def test_create_authenticated_client_with_custom_params(self, sample_jwt_token):
        """Test creating authenticated client with custom URL and key."""
        with patch("supabase_core_python.client.auth_client.create_supabase_client") as mock_create:
            mock_client = Mock()
            mock_postgrest = Mock()
            mock_postgrest.session = Mock()
            mock_postgrest.session.headers = {}
            mock_client.postgrest = mock_postgrest
            mock_create.return_value = mock_client
            
            client = create_authenticated_client(
                sample_jwt_token,
                url="https://custom.supabase.co",
                anon_key="custom-key"
            )
            
            assert client is not None
            mock_create.assert_called_once_with("https://custom.supabase.co", "custom-key")


class TestGetCurrentUser:
    """Tests for getting current user."""
    
    def test_get_current_user_success(self, mock_supabase_client):
        """Test getting current user when authenticated."""
        user = get_current_user(mock_supabase_client)
        
        assert user is not None
        assert "id" in user
        assert "email" in user
    
    def test_get_current_user_not_authenticated(self):
        """Test getting current user when not authenticated."""
        mock_client = Mock()
        mock_client.auth.get_user.side_effect = Exception("Not authenticated")
        
        user = get_current_user(mock_client)
        
        assert user is None
    
    def test_get_current_user_no_user_attribute(self):
        """Test getting current user when response has no user attribute."""
        mock_client = Mock()
        mock_client.auth.get_user.return_value = Mock(spec=[])  # No user attribute
        
        user = get_current_user(mock_client)
        
        assert user is None

