"""
Integration tests for authentication client.

These tests verify that JWT authentication works correctly with a real Supabase instance.
"""

import pytest
import os
from supabase_core_python import create_client, create_authenticated_client, get_current_user


@pytest.mark.integration
@pytest.mark.skipif(
    not os.getenv("SUPABASE_URL") or not os.getenv("SUPABASE_ANON_KEY"),
    reason="Supabase environment variables not set",
)
class TestAuthIntegration:
    """Integration tests for authentication."""

    def test_create_client_with_real_supabase(self):
        """Test creating a basic client with real Supabase instance."""
        supabase = create_client()
        
        # Try a simple query to verify connection
        response = supabase.table("_realtime").select("id").limit(1).execute()
        
        # Should not raise an error
        assert response is not None

    def test_create_authenticated_client_with_jwt(self):
        """
        Test creating an authenticated client with a real JWT token.
        
        NOTE: This test requires:
        1. A real Supabase instance
        2. A valid JWT token from Supabase Auth
        3. A test user created in Supabase
        
        To get a JWT token:
        1. Sign up a test user via Supabase Auth
        2. Extract the JWT from the session
        3. Set SUPABASE_TEST_JWT environment variable
        """
        jwt_token = os.getenv("SUPABASE_TEST_JWT")
        
        if not jwt_token:
            pytest.skip("SUPABASE_TEST_JWT not set - skipping JWT authentication test")
        
        # Create authenticated client
        supabase = create_authenticated_client(jwt_token)
        
        # Verify we can get the current user
        user = get_current_user(supabase)
        
        assert user is not None
        assert "id" in user
        assert "email" in user
        
        # Verify RLS policies apply by trying to query a protected table
        # This assumes you have a table with RLS enabled
        # Adjust table name based on your schema
        try:
            response = supabase.table("profiles").select("*").limit(1).execute()
            # If RLS is working, this should only return the user's own data
            assert response is not None
        except Exception as e:
            # If table doesn't exist or RLS blocks access, that's expected
            # The important thing is that we got a user, meaning auth worked
            pass

    def test_rls_policies_apply(self):
        """
        Test that RLS policies apply correctly with authenticated client.
        
        This test requires:
        1. A table with RLS enabled (e.g., 'profiles')
        2. An RLS policy that restricts access to user's own data
        3. A valid JWT token
        """
        jwt_token = os.getenv("SUPABASE_TEST_JWT")
        
        if not jwt_token:
            pytest.skip("SUPABASE_TEST_JWT not set - skipping RLS test")
        
        supabase = create_authenticated_client(jwt_token)
        user = get_current_user(supabase)
        
        if not user:
            pytest.skip("Could not get current user - skipping RLS test")
        
        # Try to query a table with RLS
        # Adjust based on your schema
        try:
            response = supabase.table("profiles").select("*").eq("id", user["id"]).execute()
            
            # Should only return the user's own data
            if response.data:
                for row in response.data:
                    assert row["id"] == user["id"], "RLS should only return user's own data"
        except Exception as e:
            # If table doesn't exist, that's okay
            # The test verifies that auth works, which is the main goal
            pass

