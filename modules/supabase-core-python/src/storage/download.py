"""
Storage Download Helpers

Utilities for downloading files from Supabase Storage.
"""

from dataclasses import dataclass
from typing import Optional
from supabase import Client


@dataclass
class DownloadConfig:
    """Download configuration."""

    bucket: str  # Bucket name
    path: str  # File path in bucket
    transform: Optional[dict] = None  # Optional transformation options


@dataclass
class DownloadResult:
    """Download result."""

    data: bytes  # File data as bytes
    content_type: str  # Content type
    size: int  # File size in bytes


def download_file(client: Client, config: DownloadConfig) -> DownloadResult:
    """
    Downloads a file from Supabase Storage.

    Args:
        client: Supabase client instance
        config: Download configuration

    Returns:
        Download result with file data

    Raises:
        ValueError: If download fails

    Example:
        ```python
        from supabase_core_python import download_file, DownloadConfig

        config = DownloadConfig(
            bucket="uploads",
            path="avatars/user1.png"
        )

        result = download_file(supabase, config)
        with open("downloaded.png", "wb") as f:
            f.write(result.data)
        ```
    """
    response = client.storage.from_(config.bucket).download(config.path).execute()

    if not response or (hasattr(response, "error") and response.error):
        error_msg = response.error if hasattr(response, "error") else "Unknown error"
        raise ValueError(f"Failed to download file: {error_msg}")

    # Extract data
    data = response if isinstance(response, bytes) else getattr(response, "data", b"")
    content_type = getattr(response, "content_type", "application/octet-stream")
    size = len(data)

    return DownloadResult(data=data, content_type=content_type, size=size)


def get_signed_url(
    client: Client,
    bucket: str,
    path: str,
    expires_in: int = 3600,
) -> str:
    """
    Generates a signed URL for a private file in Supabase Storage.
    The URL will expire after the specified number of seconds.

    Args:
        client: Supabase client instance
        bucket: Bucket name
        path: File path in bucket
        expires_in: Number of seconds the URL should be valid for (default: 3600)

    Returns:
        Signed URL string

    Raises:
        ValueError: If signed URL generation fails

    Example:
        ```python
        from supabase_core_python import get_signed_url

        url = get_signed_url(supabase, "private-uploads", "document.pdf", expires_in=1800)
        print(f"Signed URL (valid for 30 min): {url}")
        ```
    """
    response = (
        client.storage.from_(bucket)
        .create_signed_url(path, expires_in)
        .execute()
    )

    if not response or (hasattr(response, "error") and response.error):
        error_msg = response.error if hasattr(response, "error") else "Unknown error"
        raise ValueError(f"Failed to generate signed URL: {error_msg}")

    # Extract signed URL
    signed_url = response if isinstance(response, str) else getattr(response, "signed_url", "")
    if not signed_url:
        raise ValueError("No signed URL returned from Supabase")

    return signed_url

