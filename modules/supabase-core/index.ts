/**
 * Supabase Core Module
 * 
 * Unified Supabase utilities module providing:
 * - Client factories (local vs production detection)
 * - Query builders (fluent API)
 * - Database utilities (pagination, transactions, RLS helpers)
 * - Storage helpers (upload, download, image processing)
 * - Real-time subscription management
 * - Error handling and retry logic
 * - Caching utilities
 * 
 * @module supabase-core
 */

// Client utilities
export { createClient, createServiceRoleClient } from './src/client/create-client'
export { createServerClient, getServerUser } from './src/client/server-client'
export type { ClientOptions, TypedSupabaseClient } from './src/client/types'

// Database utilities
export { QueryBuilder, queryBuilder } from './src/database/query-builder'
export { paginate, parsePaginationParams } from './src/database/pagination'
export type { PaginationParams, PaginatedResponse } from './src/database/pagination'
export { executeTransaction, withRetry } from './src/database/transaction-helpers'
export type { TransactionOperation } from './src/database/transaction-helpers'
export {
  checkRLSEnabled,
  getCurrentUserId,
  getCurrentUserRole,
  hasRole,
} from './src/database/rls-helpers'

// Storage utilities
export {
  validateFile,
  uploadFile,
  uploadFiles,
} from './src/storage/upload-helpers'
export type { UploadConfig, UploadResult, FileValidationOptions } from './src/storage/upload-helpers'
export {
  downloadFile,
  getSignedUrl,
  deleteFile,
} from './src/storage/download-helpers'
export type { DownloadConfig, DownloadResult } from './src/storage/download-helpers'
export { getImageUrl, getThumbnailUrl } from './src/storage/image-processing'
export type { ImageTransformOptions } from './src/storage/image-processing'

// Real-time utilities
export { SubscriptionManager, createSubscriptionManager } from './src/realtime/subscription-manager'
export type { SubscriptionConfig } from './src/realtime/subscription-manager'
export {
  createFilteredHandler,
  createDebouncedHandler,
  createConditionalHandler,
} from './src/realtime/event-handlers'
export type { PostgresChangePayload, EventHandler } from './src/realtime/event-handlers'

// Type generation
export { TYPE_GENERATION_INSTRUCTIONS, validateTypesFile } from './src/types/generate-types'

// Utility functions
export {
  normalizeError,
  isErrorCode,
  getUserFriendlyMessage,
  SUPABASE_ERROR_CODES,
} from './src/utils/error-handler'
export type { NormalizedError } from './src/utils/error-handler'
export { withRetry as retryOperation } from './src/utils/retry'
export type { RetryConfig } from './src/utils/retry'
export { QueryCache, globalCache, createCacheKey } from './src/utils/cache'

// Database types (placeholder - should be generated)
export type { Database } from './types/database-types'

// Enhanced features (automatic error handling, logging, monitoring)
export {
  OperationInterceptor,
  createDefaultInterceptor,
  EnhancedSupabaseClient,
  createEnhancedClient,
  checkSupabaseHealth,
  isSupabaseReachable,
  safeQuery,
  safeMutation,
  safeStorage,
  safeAuth,
  createSafeClient,
} from './src/core'
export type {
  OperationContext,
  Interceptor,
  EnhancedClientConfig,
  HealthCheckResult,
} from './src/core'

