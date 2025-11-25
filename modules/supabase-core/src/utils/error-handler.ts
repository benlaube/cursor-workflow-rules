/**
 * Error Handler
 * 
 * Utilities for normalizing and handling Supabase errors consistently.
 * 
 * Dependencies: @supabase/supabase-js
 */

/**
 * Normalized Supabase error.
 */
export interface NormalizedError {
  /** Error code */
  code: string
  /** Human-readable error message */
  message: string
  /** Original error details */
  details?: any
  /** HTTP status code (if applicable) */
  statusCode?: number
}

/**
 * Common Supabase error codes.
 */
export const SUPABASE_ERROR_CODES = {
  // Auth errors
  INVALID_CREDENTIALS: 'invalid_credentials',
  USER_NOT_FOUND: 'user_not_found',
  EMAIL_NOT_CONFIRMED: 'email_not_confirmed',
  TOKEN_EXPIRED: 'token_expired',

  // Database errors
  UNIQUE_VIOLATION: '23505',
  FOREIGN_KEY_VIOLATION: '23503',
  NOT_NULL_VIOLATION: '23502',
  CHECK_VIOLATION: '23514',

  // RLS errors
  RLS_POLICY_VIOLATION: '42501',

  // Storage errors
  STORAGE_NOT_FOUND: 'storage_not_found',
  STORAGE_UNAUTHORIZED: 'storage_unauthorized',
} as const

/**
 * Normalizes a Supabase error into a consistent format.
 * 
 * @param error - Error from Supabase operation
 * @returns Normalized error object
 * 
 * @example
 * ```typescript
 * const { data, error } = await supabase.from('posts').insert({ title: 'New Post' })
 * if (error) {
 *   const normalized = normalizeError(error)
 *   console.error('Error:', normalized.message, normalized.code)
 * }
 * ```
 */
export function normalizeError(error: any): NormalizedError {
  // Handle PostgrestError
  if (error?.code && error?.message) {
    return {
      code: error.code,
      message: error.message,
      details: error.details,
      statusCode: error.status || 500,
    }
  }

  // Handle AuthError
  if (error?.status && error?.message) {
    return {
      code: error.status.toString(),
      message: error.message,
      details: error,
      statusCode: error.status,
    }
  }

  // Handle StorageError
  if (error?.error) {
    return {
      code: error.error || 'storage_error',
      message: error.message || 'Storage operation failed',
      details: error,
    }
  }

  // Handle generic Error
  if (error instanceof Error) {
    return {
      code: 'unknown_error',
      message: error.message,
      details: error,
    }
  }

  // Fallback
  return {
    code: 'unknown_error',
    message: String(error || 'An unknown error occurred'),
    details: error,
  }
}

/**
 * Checks if an error is a specific Supabase error code.
 * 
 * @param error - Error to check
 * @param code - Error code to match
 * @returns True if error matches the code
 * 
 * @example
 * ```typescript
 * if (isErrorCode(error, SUPABASE_ERROR_CODES.UNIQUE_VIOLATION)) {
 *   console.log('Duplicate entry detected')
 * }
 * ```
 */
export function isErrorCode(error: any, code: string): boolean {
  const normalized = normalizeError(error)
  return normalized.code === code
}

/**
 * Gets a user-friendly error message from a Supabase error.
 * 
 * @param error - Error from Supabase operation
 * @returns User-friendly message
 * 
 * @example
 * ```typescript
 * const message = getUserFriendlyMessage(error)
 * // Returns: "This email is already registered" instead of "23505: duplicate key value"
 * ```
 */
export function getUserFriendlyMessage(error: any): string {
  const normalized = normalizeError(error)

  // Map common error codes to user-friendly messages
  const friendlyMessages: Record<string, string> = {
    [SUPABASE_ERROR_CODES.UNIQUE_VIOLATION]: 'This record already exists',
    [SUPABASE_ERROR_CODES.FOREIGN_KEY_VIOLATION]: 'Referenced record does not exist',
    [SUPABASE_ERROR_CODES.NOT_NULL_VIOLATION]: 'Required field is missing',
    [SUPABASE_ERROR_CODES.INVALID_CREDENTIALS]: 'Invalid email or password',
    [SUPABASE_ERROR_CODES.EMAIL_NOT_CONFIRMED]: 'Please verify your email address',
    [SUPABASE_ERROR_CODES.TOKEN_EXPIRED]: 'Your session has expired. Please sign in again',
    [SUPABASE_ERROR_CODES.RLS_POLICY_VIOLATION]: 'You do not have permission to perform this action',
    [SUPABASE_ERROR_CODES.STORAGE_NOT_FOUND]: 'File not found',
    [SUPABASE_ERROR_CODES.STORAGE_UNAUTHORIZED]: 'You do not have permission to access this file',
  }

  return friendlyMessages[normalized.code] || normalized.message
}

