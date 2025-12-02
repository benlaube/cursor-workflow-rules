"""
Integration tests for framework-specific integrations.

These tests verify that framework helpers work correctly with real Supabase instances.
"""

import pytest
import os


@pytest.mark.integration
@pytest.mark.skipif(
    not os.getenv("SUPABASE_URL") or not os.getenv("SUPABASE_ANON_KEY"),
    reason="Supabase environment variables not set",
)
class TestFastAPIIntegration:
    """Integration tests for FastAPI integration."""

    @pytest.mark.skipif(
        not pytest.importorskip("fastapi", reason="FastAPI not installed"),
        reason="FastAPI not installed",
    )
    def test_fastapi_dependency_injection(self):
        """Test FastAPI dependency injection with real Supabase."""
        from fastapi import FastAPI
        from supabase_core_python.framework.fastapi import get_supabase_client
        
        app = FastAPI()
        
        # Test basic client dependency
        client = get_supabase_client()
        
        assert client is not None
        
        # Verify it works
        response = client.table("_realtime").select("id").limit(1).execute()
        assert response is not None

    @pytest.mark.skipif(
        not pytest.importorskip("fastapi", reason="FastAPI not installed"),
        reason="FastAPI not installed",
    )
    def test_fastapi_authenticated_dependency(self):
        """Test FastAPI authenticated dependency with real JWT."""
        from fastapi import FastAPI, Header
        from supabase_core_python.framework.fastapi import get_authenticated_supabase
        
        jwt_token = os.getenv("SUPABASE_TEST_JWT")
        
        if not jwt_token:
            pytest.skip("SUPABASE_TEST_JWT not set")
        
        # Test authenticated dependency
        client = get_authenticated_supabase(authorization=f"Bearer {jwt_token}")
        
        assert client is not None
        
        # Verify authentication works
        from supabase_core_python import get_current_user
        user = get_current_user(client)
        
        assert user is not None


@pytest.mark.integration
@pytest.mark.skipif(
    not os.getenv("SUPABASE_URL") or not os.getenv("SUPABASE_ANON_KEY"),
    reason="Supabase environment variables not set",
)
class TestDjangoIntegration:
    """Integration tests for Django integration."""

    @pytest.mark.skipif(
        not pytest.importorskip("django", reason="Django not installed"),
        reason="Django not installed",
    )
    def test_django_helper(self):
        """Test Django helper with real Supabase."""
        from django.http import HttpRequest
        from supabase_core_python.framework.django import get_supabase_client
        
        request = HttpRequest()
        
        # Test basic client
        client = get_supabase_client(request, require_auth=False)
        
        assert client is not None
        
        # Verify it works
        response = client.table("_realtime").select("id").limit(1).execute()
        assert response is not None


@pytest.mark.integration
@pytest.mark.skipif(
    not os.getenv("SUPABASE_URL") or not os.getenv("SUPABASE_ANON_KEY"),
    reason="Supabase environment variables not set",
)
class TestFlaskIntegration:
    """Integration tests for Flask integration."""

    @pytest.mark.skipif(
        not pytest.importorskip("flask", reason="Flask not installed"),
        reason="Flask not installed",
    )
    def test_flask_helper(self):
        """Test Flask helper with real Supabase."""
        from flask import Flask
        from supabase_core_python.framework.flask import get_supabase_client
        
        app = Flask(__name__)
        
        with app.app_context():
            # Test basic client
            client = get_supabase_client(require_auth=False)
            
            assert client is not None
            
            # Verify it works
            response = client.table("_realtime").select("id").limit(1).execute()
            assert response is not None

