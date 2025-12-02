"""
Tests for framework-specific integrations.
"""

import pytest
from unittest.mock import Mock, patch


class TestFastAPIIntegration:
    """Tests for FastAPI integration."""
    
    @pytest.mark.skipif(
        not pytest.importorskip("fastapi", reason="FastAPI not installed"),
        reason="FastAPI not installed",
    )
    def test_get_supabase_client(self):
        """Test FastAPI dependency for basic client."""
        from supabase_core_python.framework.fastapi.dependencies import get_supabase_client
        
        with patch("supabase_core_python.client.create_client.create_client") as mock_create:
            mock_client = Mock()
            mock_create.return_value = mock_client
            
            client = get_supabase_client()
            
            assert client is not None
            mock_create.assert_called_once()
    
    @pytest.mark.skipif(
        not pytest.importorskip("fastapi", reason="FastAPI not installed"),
        reason="FastAPI not installed",
    )
    def test_get_authenticated_supabase(self):
        """Test FastAPI dependency for authenticated client."""
        from fastapi import Header
        from supabase_core_python.framework.fastapi.dependencies import get_authenticated_supabase
        
        with patch(
            "supabase_core_python.client.auth_client.create_authenticated_client"
        ) as mock_create:
            mock_client = Mock()
            mock_create.return_value = mock_client
            
            # Test with Bearer token
            client = get_authenticated_supabase(authorization="Bearer test-token")
            
            assert client is not None
            mock_create.assert_called_with("test-token")
    
    @pytest.mark.skipif(
        not pytest.importorskip("fastapi", reason="FastAPI not installed"),
        reason="FastAPI not installed",
    )
    def test_get_authenticated_supabase_missing_header(self):
        """Test FastAPI dependency raises error when header missing."""
        from fastapi import HTTPException
        from supabase_core_python.framework.fastapi.dependencies import get_authenticated_supabase
        
        with pytest.raises(HTTPException, match="Authorization header required"):
            get_authenticated_supabase(authorization=None)


class TestDjangoIntegration:
    """Tests for Django integration."""
    
    @pytest.mark.skipif(
        not pytest.importorskip("django", reason="Django not installed"),
        reason="Django not installed",
    )
    def test_get_supabase_client_no_auth(self):
        """Test Django helper without authentication."""
        from django.http import HttpRequest
        from supabase_core_python.framework.django.middleware import get_supabase_client
        
        request = HttpRequest()
        
        with patch("supabase_core_python.client.create_client.create_client") as mock_create:
            mock_client = Mock()
            mock_create.return_value = mock_client
            
            client = get_supabase_client(request, require_auth=False)
            
            assert client is not None
            mock_create.assert_called_once()
    
    @pytest.mark.skipif(
        not pytest.importorskip("django", reason="Django not installed"),
        reason="Django not installed",
    )
    def test_get_supabase_client_with_auth_header(self):
        """Test Django helper with Authorization header."""
        from django.http import HttpRequest
        from supabase_core_python.framework.django.middleware import get_supabase_client
        
        request = HttpRequest()
        request.META["HTTP_AUTHORIZATION"] = "Bearer test-token"
        
        with patch(
            "supabase_core_python.client.auth_client.create_authenticated_client"
        ) as mock_create:
            mock_client = Mock()
            mock_create.return_value = mock_client
            
            client = get_supabase_client(request, require_auth=True)
            
            assert client is not None
            mock_create.assert_called_with("test-token")
    
    @pytest.mark.skipif(
        not pytest.importorskip("django", reason="Django not installed"),
        reason="Django not installed",
    )
    def test_get_supabase_client_missing_token(self):
        """Test Django helper raises error when token missing."""
        from django.http import HttpRequest
        from supabase_core_python.framework.django.middleware import get_supabase_client
        
        request = HttpRequest()
        
        with pytest.raises(ValueError, match="No JWT token found"):
            get_supabase_client(request, require_auth=True)


class TestFlaskIntegration:
    """Tests for Flask integration."""
    
    @pytest.mark.skipif(
        not pytest.importorskip("flask", reason="Flask not installed"),
        reason="Flask not installed",
    )
    def test_get_supabase_client_no_auth(self):
        """Test Flask helper without authentication."""
        from flask import Flask, g
        from supabase_core_python.framework.flask.helpers import get_supabase_client
        
        app = Flask(__name__)
        
        with app.app_context():
            with patch("supabase_core_python.client.create_client.create_client") as mock_create:
                mock_client = Mock()
                mock_create.return_value = mock_client
                
                client = get_supabase_client(require_auth=False)
                
                assert client is not None
                # Verify caching
                assert hasattr(g, "supabase_client")
                mock_create.assert_called_once()
    
    @pytest.mark.skipif(
        not pytest.importorskip("flask", reason="Flask not installed"),
        reason="Flask not installed",
    )
    def test_get_supabase_client_with_auth_header(self):
        """Test Flask helper with Authorization header."""
        from flask import Flask, request
        from supabase_core_python.framework.flask.helpers import get_supabase_client
        
        app = Flask(__name__)
        
        with app.test_request_context(headers={"Authorization": "Bearer test-token"}):
            with patch(
                "supabase_core_python.client.auth_client.create_authenticated_client"
            ) as mock_create:
                mock_client = Mock()
                mock_create.return_value = mock_client
                
                client = get_supabase_client(require_auth=True)
                
                assert client is not None
                mock_create.assert_called_with("test-token")
    
    @pytest.mark.skipif(
        not pytest.importorskip("flask", reason="Flask not installed"),
        reason="Flask not installed",
    )
    def test_get_supabase_client_missing_token(self):
        """Test Flask helper raises error when token missing."""
        from flask import Flask
        from supabase_core_python.framework.flask.helpers import get_supabase_client
        
        app = Flask(__name__)
        
        with app.test_request_context():
            with pytest.raises(ValueError, match="No JWT token found"):
                get_supabase_client(require_auth=True)

