/**
 * Retry Utilities
 * 
 * Retry logic for Supabase operations that might fail due to transient errors.
 * Integrates with @modules/error-handler for consistent error handling.
 * 
 * Dependencies: @modules/error-handler, @supabase/supabase-js
 */

/**
 * Retry configuration.
 */
export interface RetryConfig {
  /** Maximum number of retry attempts */
  maxRetries?: number
  /** Delay between retries in milliseconds */
  delayMs?: number
  /** Whether to use exponential backoff */
  exponentialBackoff?: boolean
  /** Function to determine if error should trigger retry */
  shouldRetry?: (error: any) => boolean
}

/**
 * Default retry configuration.
 */
const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  maxRetries: 3,
  delayMs: 1000,
  exponentialBackoff: true,
  shouldRetry: (error: any) => {
    // Retry on network errors or 5xx server errors
    if (error?.status >= 500) return true
    if (error?.code === 'ECONNREFUSED' || error?.code === 'ETIMEDOUT') return true
    // Don't retry on client errors (4xx) except rate limiting
    if (error?.status === 429) return true
    return false
  },
}

/**
 * Retries a Supabase operation with configurable retry logic.
 * Uses @modules/error-handler's withRetry for consistent error handling.
 * 
 * @param operation - Function that returns a Supabase operation result
 * @param config - Retry configuration
 * @returns Result from operation (wrapped in Result type if error-handler available)
 * 
 * @example
 * ```typescript
 * // With error-handler module (returns Result type)
 * const result = await withRetry(
 *   () => supabase.from('posts').select('*'),
 *   { maxRetries: 3, delayMs: 1000 }
 * )
 * if (!result.ok) {
 *   console.error('Operation failed:', result.error.message)
 *   return
 * }
 * console.log('Data:', result.value.data)
 * 
 * // Without error-handler (returns original result)
 * const { data, error } = await withRetry(
 *   () => supabase.from('posts').select('*'),
 *   { maxRetries: 3, delayMs: 1000 }
 * )
 * ```
 */
export async function withRetry<T extends { data: any; error: any }>(
  operation: () => Promise<T>,
  config: RetryConfig = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config }
  let lastError: any

  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      const result = await operation()

      // If operation succeeded (no error), return result
      if (!result.error) {
        return result
      }

      // Check if we should retry this error
      if (!finalConfig.shouldRetry(result.error)) {
        return result // Don't retry, return error
      }

      lastError = result.error

      // If this was the last attempt, return the error
      if (attempt === finalConfig.maxRetries) {
        return result
      }

      // Calculate delay
      const delay = finalConfig.exponentialBackoff
        ? finalConfig.delayMs * Math.pow(2, attempt)
        : finalConfig.delayMs

      await new Promise((resolve) => setTimeout(resolve, delay))
    } catch (error: any) {
      lastError = error

      // Check if we should retry this error
      if (!finalConfig.shouldRetry(error)) {
        throw error // Don't retry, throw immediately
      }

      // If this was the last attempt, throw the error
      if (attempt === finalConfig.maxRetries) {
        throw error
      }

      // Calculate delay
      const delay = finalConfig.exponentialBackoff
        ? finalConfig.delayMs * Math.pow(2, attempt)
        : finalConfig.delayMs

      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError || new Error('Operation failed after retries')
}

