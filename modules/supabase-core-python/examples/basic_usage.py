"""
Basic usage examples for supabase-core-python.

This file demonstrates common patterns for using the module.
"""

import os
from supabase_core_python import (
    create_client,
    create_authenticated_client,
    query_builder,
    paginate,
    PaginationParams,
    upload_file,
    UploadConfig,
    download_file,
    DownloadConfig,
)

# Set up environment variables (or use create_client with explicit params)
os.environ["SUPABASE_URL"] = "https://your-project.supabase.co"
os.environ["SUPABASE_ANON_KEY"] = "your-anon-key"


def example_basic_client():
    """Example: Create a basic Supabase client."""
    supabase = create_client()
    
    # Query data
    response = supabase.table("posts").select("*").limit(10).execute()
    print(f"Found {len(response.data)} posts")


def example_authenticated_client():
    """Example: Create an authenticated client from JWT."""
    # In a real app, extract JWT from request headers/cookies
    jwt_token = "your-jwt-token-here"
    
    supabase = create_authenticated_client(jwt_token)
    
    # RLS policies will apply based on the authenticated user
    response = supabase.table("posts").select("*").execute()
    print(f"User's posts: {response.data}")


def example_query_builder():
    """Example: Use query builder for fluent queries."""
    supabase = create_client()
    
    # Build query with method chaining
    response = (
        query_builder(supabase, "posts")
        .where("published", True)
        .where_not("deleted", True)
        .order_by("created_at", "desc")
        .limit(10)
        .execute()
    )
    
    print(f"Published posts: {response.data}")


def example_pagination():
    """Example: Paginate through results."""
    supabase = create_client()
    query = supabase.table("posts").select("*", count="exact")
    
    # Get first page
    result = paginate(query, PaginationParams(page=1, limit=10))
    
    print(f"Page {result.page}: {len(result.data)} items")
    print(f"Total: {result.total}")
    print(f"Has next: {result.has_next}")
    
    # Get next page
    if result.has_next:
        next_result = paginate(query, PaginationParams(page=2, limit=10))
        print(f"Page 2: {len(next_result.data)} items")


def example_file_upload():
    """Example: Upload a file to Supabase Storage."""
    supabase = create_client()
    
    config = UploadConfig(
        bucket="uploads",
        path="avatars/user1.png",
        file="/path/to/image.png",
        content_type="image/png",
    )
    
    result = upload_file(supabase, config)
    print(f"Uploaded to: {result.public_url}")


def example_file_download():
    """Example: Download a file from Supabase Storage."""
    supabase = create_client()
    
    config = DownloadConfig(
        bucket="uploads",
        path="avatars/user1.png",
    )
    
    result = download_file(supabase, config)
    print(f"Downloaded {len(result.data)} bytes")
    print(f"Content type: {result.content_type}")


if __name__ == "__main__":
    print("Basic usage examples for supabase-core-python")
    print("=" * 50)
    
    # Uncomment to run examples:
    # example_basic_client()
    # example_authenticated_client()
    # example_query_builder()
    # example_pagination()
    # example_file_upload()
    # example_file_download()

