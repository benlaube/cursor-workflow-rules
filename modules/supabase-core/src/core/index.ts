/**
 * Core Enhanced Features
 * 
 * Provides enhanced Supabase client with automatic error handling, logging, and monitoring.
 */

export { OperationInterceptor, createDefaultInterceptor } from './interceptor'
export type { OperationContext, Interceptor } from './interceptor'
export { EnhancedSupabaseClient, createEnhancedClient } from './enhanced-client'
export type { EnhancedClientConfig } from './enhanced-client'
export { checkSupabaseHealth, isSupabaseReachable } from './health-check'
export type { HealthCheckResult } from './health-check'
export {
  safeQuery,
  safeMutation,
  safeStorage,
  safeAuth,
  createSafeClient,
} from './safe-operations'

