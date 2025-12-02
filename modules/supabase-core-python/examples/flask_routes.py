"""
Flask routes example using supabase-core-python.

This demonstrates how to integrate supabase-core-python with Flask.
"""

from flask import Flask, jsonify, request
from supabase_core_python.framework.flask import get_supabase_client
from supabase_core_python.client.auth_client import get_current_user
from supabase_core_python.database.query_builder import query_builder

app = Flask(__name__)


@app.route("/")
def root():
    """Public endpoint."""
    return jsonify({"message": "Supabase Core Python Flask Example"})


@app.route("/posts", methods=["GET"])
def get_posts():
    """
    Get all posts (public endpoint, no authentication required).
    
    Note: RLS policies will still apply if enabled.
    """
    try:
        # Get basic client (no auth required)
        supabase = get_supabase_client(require_auth=False)
        
        response = supabase.table("posts").select("*").limit(10).execute()
        
        return jsonify({"data": response.data, "count": len(response.data)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/profile", methods=["GET"])
def get_profile():
    """
    Get current user's profile (requires authentication).
    
    The JWT token is extracted from:
    1. Authorization header (Bearer token)
    2. Cookie (sb-access-token)
    
    The client is cached in Flask's `g` object for performance.
    """
    try:
        # Get authenticated client (cached in Flask's g object)
        supabase = get_supabase_client(require_auth=True)
        
        # Get current user
        user = get_current_user(supabase)
        if not user:
            return jsonify({"error": "User not authenticated"}), 401
        
        # Query user's profile
        response = (
            query_builder(supabase, "profiles")
            .where("id", user["id"])
            .single()
            .execute()
        )
        
        return jsonify({"user": user, "profile": response.data})
    except ValueError as e:
        # No JWT token found
        return jsonify({"error": str(e)}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/posts", methods=["POST"])
def create_post():
    """
    Create a new post (requires authentication).
    
    RLS policies will ensure users can only create posts they're allowed to.
    """
    try:
        # Get authenticated client
        supabase = get_supabase_client(require_auth=True)
        
        # Get current user
        user = get_current_user(supabase)
        if not user:
            return jsonify({"error": "User not authenticated"}), 401
        
        # Get post data from request JSON
        data = request.get_json()
        title = data.get("title") if data else None
        content = data.get("content") if data else None
        
        if not title or not content:
            return jsonify({"error": "Title and content required"}), 400
        
        # Insert post
        response = (
            supabase.table("posts")
            .insert({"title": title, "content": content, "user_id": user["id"]})
            .execute()
        )
        
        return jsonify({"message": "Post created", "data": response.data})
    except ValueError as e:
        return jsonify({"error": str(e)}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return jsonify({"status": "healthy"})


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)

