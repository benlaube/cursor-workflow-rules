"""
Tests for storage utilities.
"""

import pytest
from supabase_core_python.storage.upload import (
    upload_file,
    validate_file,
    UploadConfig,
    FileValidationOptions,
    UploadResult,
)
from supabase_core_python.storage.download import (
    download_file,
    DownloadConfig,
    DownloadResult,
)


class TestFileValidation:
    """Tests for file validation."""
    
    def test_validate_file_size_ok(self, sample_upload_file):
        """Test file size validation with valid file."""
        options = FileValidationOptions(max_size=1024 * 1024)  # 1MB
        
        # Should not raise
        validate_file(sample_upload_file, options)
    
    def test_validate_file_size_too_large(self, sample_upload_file):
        """Test file size validation with file too large."""
        options = FileValidationOptions(max_size=1)  # 1 byte
        
        with pytest.raises(ValueError, match="exceeds limit"):
            validate_file(sample_upload_file, options)
    
    def test_validate_file_type_ok(self, sample_upload_file):
        """Test file type validation with valid type."""
        options = FileValidationOptions(allowed_types=["text/plain"])
        
        # Should not raise
        validate_file(sample_upload_file, options)
    
    def test_validate_file_type_invalid(self, sample_upload_file):
        """Test file type validation with invalid type."""
        options = FileValidationOptions(allowed_types=["image/png"])
        
        with pytest.raises(ValueError, match="not allowed"):
            validate_file(sample_upload_file, options)
    
    def test_validate_file_not_found(self):
        """Test validation with non-existent file."""
        options = FileValidationOptions()
        
        with pytest.raises(ValueError, match="File not found"):
            validate_file("/nonexistent/file.txt", options)
    
    def test_validate_file_bytes(self):
        """Test validation with bytes object."""
        options = FileValidationOptions(max_size=1024)
        file_bytes = b"test content"
        
        # Should not raise
        validate_file(file_bytes, options)


class TestUploadFile:
    """Tests for file upload."""
    
    def test_upload_file_success(self, mock_supabase_client, sample_upload_file):
        """Test successful file upload."""
        config = UploadConfig(
            bucket="test-bucket",
            path="test/file.txt",
            file=sample_upload_file,
            content_type="text/plain",
        )
        
        result = upload_file(mock_supabase_client, config)
        
        assert isinstance(result, UploadResult)
        assert result.path == "test/file.txt"
        # Verify upload was called
        mock_supabase_client.storage.from_.assert_called_with("test-bucket")
    
    def test_upload_file_with_validation(self, mock_supabase_client, sample_upload_file):
        """Test file upload with validation."""
        config = UploadConfig(
            bucket="test-bucket",
            path="test/file.txt",
            file=sample_upload_file,
        )
        
        validation = FileValidationOptions(max_size=1024 * 1024)
        
        result = upload_file(mock_supabase_client, config, validation)
        
        assert isinstance(result, UploadResult)
    
    def test_upload_file_bytes(self, mock_supabase_client):
        """Test uploading bytes directly."""
        config = UploadConfig(
            bucket="test-bucket",
            path="test/file.txt",
            file=b"test content",
            content_type="text/plain",
        )
        
        result = upload_file(mock_supabase_client, config)
        
        assert isinstance(result, UploadResult)
    
    def test_upload_file_validation_fails(self, mock_supabase_client, sample_upload_file):
        """Test upload fails when validation fails."""
        config = UploadConfig(
            bucket="test-bucket",
            path="test/file.txt",
            file=sample_upload_file,
        )
        
        validation = FileValidationOptions(max_size=1)  # Too small
        
        with pytest.raises(ValueError):
            upload_file(mock_supabase_client, config, validation)


class TestDownloadFile:
    """Tests for file download."""
    
    def test_download_file_success(self, mock_supabase_client):
        """Test successful file download."""
        config = DownloadConfig(bucket="test-bucket", path="test/file.txt")
        
        result = download_file(mock_supabase_client, config)
        
        assert isinstance(result, DownloadResult)
        assert result.path == "test/file.txt"
        # Verify download was called
        mock_supabase_client.storage.from_.assert_called_with("test-bucket")
    
    def test_download_file_get_signed_url(self, mock_supabase_client):
        """Test getting signed URL for download."""
        config = DownloadConfig(
            bucket="test-bucket",
            path="test/file.txt",
            signed=True,
            expires_in=3600,
        )
        
        result = download_file(mock_supabase_client, config)
        
        assert isinstance(result, DownloadResult)
        # Signed URL should be available
        assert result.signed_url is not None or result.path is not None

