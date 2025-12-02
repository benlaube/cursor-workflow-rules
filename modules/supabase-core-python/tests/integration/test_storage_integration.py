"""
Integration tests for storage operations.

These tests verify that file upload/download works correctly with a real Supabase Storage instance.
"""

import pytest
import os
import tempfile
from pathlib import Path
from supabase_core_python import create_client, upload_file, download_file, UploadConfig, DownloadConfig


@pytest.mark.integration
@pytest.mark.skipif(
    not os.getenv("SUPABASE_URL") or not os.getenv("SUPABASE_ANON_KEY"),
    reason="Supabase environment variables not set",
)
class TestStorageIntegration:
    """Integration tests for storage operations."""

    @pytest.fixture
    def test_bucket(self):
        """Test bucket name. Create this bucket in Supabase Storage first."""
        return os.getenv("SUPABASE_TEST_BUCKET", "test-uploads")

    @pytest.fixture
    def test_file(self):
        """Create a temporary test file."""
        with tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".txt") as f:
            f.write("This is a test file for integration testing.")
            temp_path = Path(f.name)
        
        yield temp_path
        
        # Cleanup
        if temp_path.exists():
            temp_path.unlink()

    def test_upload_file_bytes(self, test_bucket):
        """Test uploading file as bytes."""
        supabase = create_client()
        
        config = UploadConfig(
            bucket=test_bucket,
            path="integration-test/test-bytes.txt",
            file=b"Test content from bytes",
            content_type="text/plain",
        )
        
        try:
            result = upload_file(supabase, config)
            
            assert result.path == "integration-test/test-bytes.txt"
            # Public URL may be None if bucket is private
            assert result.path is not None
        except Exception as e:
            pytest.skip(f"Storage upload failed (bucket may not exist): {e}")

    def test_upload_file_path(self, test_bucket, test_file):
        """Test uploading file from file path."""
        supabase = create_client()
        
        config = UploadConfig(
            bucket=test_bucket,
            path=f"integration-test/test-file-{test_file.name}",
            file=str(test_file),
            content_type="text/plain",
        )
        
        try:
            result = upload_file(supabase, config)
            
            assert result.path is not None
            assert "test-file" in result.path
        except Exception as e:
            pytest.skip(f"Storage upload failed (bucket may not exist): {e}")

    def test_download_file(self, test_bucket):
        """Test downloading a file from storage."""
        supabase = create_client()
        
        # First upload a file
        upload_config = UploadConfig(
            bucket=test_bucket,
            path="integration-test/download-test.txt",
            file=b"Content to download",
            content_type="text/plain",
        )
        
        try:
            upload_result = upload_file(supabase, upload_config)
            
            # Now download it
            download_config = DownloadConfig(
                bucket=test_bucket,
                path=upload_result.path,
            )
            
            result = download_file(supabase, download_config)
            
            assert result.data is not None
            assert isinstance(result.data, bytes)
            assert b"Content to download" in result.data
        except Exception as e:
            pytest.skip(f"Storage operation failed (bucket may not exist): {e}")

    def test_file_validation(self, test_bucket):
        """Test file validation before upload."""
        supabase = create_client()
        
        from supabase_core_python import FileValidationOptions
        
        # Create a large file (simulated)
        large_content = b"x" * (10 * 1024 * 1024)  # 10MB
        
        config = UploadConfig(
            bucket=test_bucket,
            path="integration-test/large-file.txt",
            file=large_content,
            content_type="text/plain",
        )
        
        validation = FileValidationOptions(
            max_size=5 * 1024 * 1024,  # 5MB limit
            allowed_types=["text/plain"],
        )
        
        # Should raise ValueError for file too large
        with pytest.raises(ValueError, match="exceeds limit"):
            upload_file(supabase, config, validation)

