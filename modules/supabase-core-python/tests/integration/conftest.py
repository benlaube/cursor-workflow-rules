"""
Pytest configuration for integration tests.
"""

import pytest
import os


def pytest_configure(config):
    """Configure pytest markers."""
    config.addinivalue_line(
        "markers", "integration: marks tests as integration tests (require Supabase instance)"
    )


@pytest.fixture(scope="session")
def supabase_url():
    """Get Supabase URL from environment."""
    url = os.getenv("SUPABASE_URL")
    if not url:
        pytest.skip("SUPABASE_URL not set")
    return url


@pytest.fixture(scope="session")
def supabase_anon_key():
    """Get Supabase anon key from environment."""
    key = os.getenv("SUPABASE_ANON_KEY")
    if not key:
        pytest.skip("SUPABASE_ANON_KEY not set")
    return key


@pytest.fixture(scope="session")
def supabase_service_role_key():
    """Get Supabase service role key from environment."""
    return os.getenv("SUPABASE_SERVICE_ROLE_KEY")


@pytest.fixture(scope="session")
def test_jwt():
    """Get test JWT token from environment."""
    return os.getenv("SUPABASE_TEST_JWT")


@pytest.fixture(scope="session")
def test_bucket():
    """Get test bucket name from environment."""
    return os.getenv("SUPABASE_TEST_BUCKET", "test-uploads")

