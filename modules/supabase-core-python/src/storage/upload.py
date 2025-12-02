"""
Storage Upload Helpers

Utilities for uploading files to Supabase Storage with validation and error handling.
"""

from dataclasses import dataclass
from typing import Optional, List, BinaryIO, Union
from pathlib import Path
from supabase import Client


@dataclass
class UploadConfig:
    """File upload configuration."""

    bucket: str  # Bucket name
    path: str  # File path in bucket
    file: Union[bytes, BinaryIO, str, Path]  # File object or path
    content_type: Optional[str] = None  # Content type (auto-detected if not provided)
    upsert: bool = True  # Whether to overwrite existing file
    cache_control: str = "3600"  # Cache control header
    metadata: Optional[dict] = None  # Custom metadata


@dataclass
class UploadResult:
    """Upload result."""

    path: str  # File path in bucket
    public_url: Optional[str] = None  # Full public URL (if bucket is public)
    signed_url: Optional[str] = None  # Signed URL (for private buckets)


@dataclass
class FileValidationOptions:
    """File validation options."""

    max_size: Optional[int] = None  # Maximum file size in bytes
    allowed_types: Optional[List[str]] = None  # Allowed MIME types


def validate_file(
    file: Union[bytes, BinaryIO, str, Path],
    options: FileValidationOptions,
) -> bool:
    """
    Validates a file before upload.

    Args:
        file: File to validate
        options: Validation options

    Returns:
        True if file is valid, raises ValueError otherwise

    Raises:
        ValueError: If file validation fails
    """
    # Get file size
    if isinstance(file, (str, Path)):
        file_path = Path(file)
        if not file_path.exists():
            raise ValueError(f"File not found: {file_path}")
        file_size = file_path.stat().st_size
    elif isinstance(file, bytes):
        file_size = len(file)
    elif hasattr(file, "read"):
        # BinaryIO - need to get size
        current_pos = file.tell()
        file.seek(0, 2)  # Seek to end
        file_size = file.tell()
        file.seek(current_pos)  # Restore position
    else:
        raise ValueError("Invalid file type")

    # Validate size
    if options.max_size and file_size > options.max_size:
        raise ValueError(
            f"File size ({file_size} bytes) exceeds limit of {options.max_size} bytes"
        )

    # Validate type (if file path provided)
    if options.allowed_types and isinstance(file, (str, Path)):
        import mimetypes

        mime_type, _ = mimetypes.guess_type(str(file))
        if mime_type and mime_type not in options.allowed_types:
            raise ValueError(
                f"File type '{mime_type}' is not allowed. "
                f"Allowed types: {', '.join(options.allowed_types)}"
            )

    return True


def upload_file(
    client: Client,
    config: UploadConfig,
    validation: Optional[FileValidationOptions] = None,
) -> UploadResult:
    """
    Uploads a file to Supabase Storage with optional validation.

    Args:
        client: Supabase client instance
        config: Upload configuration
        validation: Optional file validation options

    Returns:
        Upload result with path and URLs

    Raises:
        ValueError: If validation fails or upload fails

    Example:
        ```python
        from supabase_core_python import upload_file, UploadConfig, FileValidationOptions

        config = UploadConfig(
            bucket="uploads",
            path="avatars/user1.png",
            file="/path/to/image.png",
            content_type="image/png"
        )

        validation = FileValidationOptions(
            max_size=5 * 1024 * 1024,  # 5MB
            allowed_types=["image/png", "image/jpeg"]
        )

        result = upload_file(supabase, config, validation)
        print(f"Uploaded to: {result.public_url}")
        ```
    """
    # Validate file if options provided
    if validation:
        validate_file(config.file, validation)

    # Read file if path provided
    file_data = config.file
    if isinstance(file_data, (str, Path)):
        with open(file_data, "rb") as f:
            file_data = f.read()
    elif hasattr(file_data, "read"):
        # BinaryIO
        file_data = file_data.read()

    # Perform upload
    response = (
        client.storage.from_(config.bucket)
        .upload(
            config.path,
            file_data,
            file_options={
                "content-type": config.content_type,
                "cache-control": config.cache_control,
                "upsert": config.upsert,
            },
        )
        .execute()
    )

    if not response or (hasattr(response, "error") and response.error):
        error_msg = response.error if hasattr(response, "error") else "Unknown error"
        raise ValueError(f"Failed to upload file: {error_msg}")

    # Get public URL if bucket is public
    public_url = None
    try:
        public_url_response = (
            client.storage.from_(config.bucket).get_public_url(config.path)
        )
        public_url = public_url_response if isinstance(public_url_response, str) else None
    except Exception:
        # Bucket might be private, which is expected
        pass

    return UploadResult(path=config.path, public_url=public_url)

