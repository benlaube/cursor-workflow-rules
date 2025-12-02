"""
Django views example using supabase-core-python.

This demonstrates how to integrate supabase-core-python with Django.
"""

from django.http import JsonResponse, HttpRequest
from django.views.decorators.http import require_http_methods
from supabase_core_python.framework.django.middleware import get_supabase_client
from supabase_core_python.client.auth_client import get_current_user
from supabase_core_python.database.query_builder import query_builder


@require_http_methods(["GET"])
def get_posts(request: HttpRequest):
    """
    Get all posts (public endpoint, no authentication required).
    
    Note: RLS policies will still apply if enabled.
    """
    try:
        # Get basic client (no auth required)
        supabase = get_supabase_client(request, require_auth=False)
        
        response = supabase.table("posts").select("*").limit(10).execute()
        
        return JsonResponse({"data": response.data, "count": len(response.data)})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@require_http_methods(["GET"])
def get_profile(request: HttpRequest):
    """
    Get current user's profile (requires authentication).
    
    The JWT token is extracted from:
    1. Authorization header (Bearer token)
    2. Django session (if stored)
    3. Cookie (sb-access-token)
    """
    try:
        # Get authenticated client
        supabase = get_supabase_client(request, require_auth=True)
        
        # Get current user
        user = get_current_user(supabase)
        if not user:
            return JsonResponse({"error": "User not authenticated"}, status=401)
        
        # Query user's profile
        response = (
            query_builder(supabase, "profiles")
            .where("id", user["id"])
            .single()
            .execute()
        )
        
        return JsonResponse({"user": user, "profile": response.data})
    except ValueError as e:
        # No JWT token found
        return JsonResponse({"error": str(e)}, status=401)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@require_http_methods(["POST"])
def create_post(request: HttpRequest):
    """
    Create a new post (requires authentication).
    
    RLS policies will ensure users can only create posts they're allowed to.
    """
    try:
        # Get authenticated client
        supabase = get_supabase_client(request, require_auth=True)
        
        # Get current user
        user = get_current_user(supabase)
        if not user:
            return JsonResponse({"error": "User not authenticated"}, status=401)
        
        # Get post data from request body
        import json
        data = json.loads(request.body)
        title = data.get("title")
        content = data.get("content")
        
        if not title or not content:
            return JsonResponse({"error": "Title and content required"}, status=400)
        
        # Insert post
        response = (
            supabase.table("posts")
            .insert({"title": title, "content": content, "user_id": user["id"]})
            .execute()
        )
        
        return JsonResponse({"message": "Post created", "data": response.data})
    except ValueError as e:
        return JsonResponse({"error": str(e)}, status=401)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@require_http_methods(["GET"])
def health_check(request: HttpRequest):
    """Health check endpoint."""
    return JsonResponse({"status": "healthy"})

