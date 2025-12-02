"""
Supabase Core Module for Python

Unified Supabase utilities module providing:
- Client factories (local vs production detection)
- Query builders (fluent API)
- Database utilities (pagination, transactions, RLS helpers)
- Storage helpers (upload, download, image processing)
- Real-time subscription management
- Error handling and retry logic
- Caching utilities
- Framework-specific integrations (Django, FastAPI, Flask)
"""

__version__ = "1.0.0"

# Client utilities
from .client.create_client import create_client, create_service_role_client
from .client.auth_client import create_authenticated_client, get_current_user

# Database utilities
from .database.query_builder import QueryBuilder, query_builder
from .database.pagination import paginate, parse_pagination_params, PaginationParams, PaginatedResponse
from .database.rls_helpers import check_rls_enabled, get_current_user_id, get_current_user_role, has_role

# Storage utilities
from .storage.upload import upload_file, validate_file, UploadConfig, UploadResult
from .storage.download import download_file, get_signed_url, DownloadConfig, DownloadResult
from .storage.image_processing import get_image_url, get_thumbnail_url, ImageTransformOptions

# Real-time utilities
from .realtime.subscription import SubscriptionManager, SubscriptionConfig

# Utility functions
from .utils.error_handler import normalize_error, is_error_code, get_user_friendly_message, SUPABASE_ERROR_CODES, NormalizedError
from .utils.retry import with_retry, RetryConfig
from .utils.cache import QueryCache, global_cache, create_cache_key

# Framework-specific integrations (optional)
try:
    from .framework.fastapi.dependencies import get_supabase_client, get_authenticated_supabase
    __all_fastapi__ = ["get_supabase_client", "get_authenticated_supabase"]
except ImportError:
    __all_fastapi__ = []

try:
    from .framework.django.middleware import get_supabase_client as django_get_supabase_client
    __all_django__ = ["django_get_supabase_client"]
except ImportError:
    __all_django__ = []

try:
    from .framework.flask.helpers import get_supabase_client as flask_get_supabase_client
    __all_flask__ = ["flask_get_supabase_client"]
except ImportError:
    __all_flask__ = []

__all__ = [
    # Client
    "create_client",
    "create_service_role_client",
    "create_authenticated_client",
    "get_current_user",
    # Database
    "QueryBuilder",
    "query_builder",
    "paginate",
    "parse_pagination_params",
    "PaginationParams",
    "PaginatedResponse",
    "check_rls_enabled",
    "get_current_user_id",
    "get_current_user_role",
    "has_role",
    # Storage
    "upload_file",
    "validate_file",
    "UploadConfig",
    "UploadResult",
    "download_file",
    "get_signed_url",
    "DownloadConfig",
    "DownloadResult",
    "get_image_url",
    "get_thumbnail_url",
    "ImageTransformOptions",
    # Real-time
    "SubscriptionManager",
    "SubscriptionConfig",
    # Utils
    "normalize_error",
    "is_error_code",
    "get_user_friendly_message",
    "SUPABASE_ERROR_CODES",
    "NormalizedError",
    "with_retry",
    "RetryConfig",
    "QueryCache",
    "global_cache",
    "create_cache_key",
]

