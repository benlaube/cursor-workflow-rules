"""
Image Processing Helpers

Utilities for image manipulation using Supabase Storage image transformations.
"""

from dataclasses import dataclass
from typing import Optional, Literal
from supabase import Client


@dataclass
class ImageTransformOptions:
    """Image transformation options."""

    width: Optional[int] = None  # Target width in pixels
    height: Optional[int] = None  # Target height in pixels
    resize: Optional[Literal["cover", "contain", "fill"]] = None  # Resize mode
    quality: Optional[int] = None  # Image quality (1-100)
    format: Optional[Literal["webp", "jpeg", "png"]] = None  # Image format


def get_image_url(
    client: Client,
    bucket: str,
    path: str,
    options: Optional[ImageTransformOptions] = None,
) -> str:
    """
    Gets a transformed image URL from Supabase Storage.
    Supabase automatically handles image transformations via URL parameters.

    Args:
        client: Supabase client instance
        bucket: Bucket name
        path: Image path in bucket
        options: Transformation options

    Returns:
        Transformed image URL

    Example:
        ```python
        from supabase_core_python import get_image_url, ImageTransformOptions

        options = ImageTransformOptions(
            width=200,
            height=200,
            resize="cover",
            quality=80
        )

        thumbnail_url = get_image_url(supabase, "uploads", "photo.jpg", options)
        ```
    """
    # Get base public URL
    base_url = client.storage.from_(bucket).get_public_url(path)

    if not options or not any([options.width, options.height, options.quality, options.format]):
        return base_url

    # Build transformation parameters
    params = []
    if options.width:
        params.append(f"width={options.width}")
    if options.height:
        params.append(f"height={options.height}")
    if options.resize:
        params.append(f"resize={options.resize}")
    if options.quality:
        params.append(f"quality={options.quality}")
    if options.format:
        params.append(f"format={options.format}")

    return f"{base_url}?{'&'.join(params)}"


def get_thumbnail_url(
    client: Client,
    bucket: str,
    path: str,
    size: int = 200,
) -> str:
    """
    Creates a thumbnail URL for an image.
    Convenience function for common thumbnail use case.

    Args:
        client: Supabase client instance
        bucket: Bucket name
        path: Image path in bucket
        size: Thumbnail size (square, in pixels)

    Returns:
        Thumbnail URL

    Example:
        ```python
        from supabase_core_python import get_thumbnail_url

        thumb_url = get_thumbnail_url(supabase, "uploads", "photo.jpg", 150)
        # Returns URL for 150x150 thumbnail
        ```
    """
    options = ImageTransformOptions(
        width=size,
        height=size,
        resize="cover",
        quality=80,
        format="webp",
    )
    return get_image_url(client, bucket, path, options)

