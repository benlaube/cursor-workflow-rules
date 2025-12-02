/**
 * Safe Operations Wrapper
 * 
 * Provides Result-pattern wrappers for all Supabase operations.
 * Automatically handles errors and returns Result types.
 * 
 * Dependencies: @modules/error-handler
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../types/database-types'
import { normalizeError, SUPABASE_ERROR_CODES } from '../utils/error-handler'

// Optional integration with error-handler module
// If error-handler is available, use Result types; otherwise use standard error handling
let errorHandlerModule: any = null
try {
  errorHandlerModule = require('@modules/error-handler')
} catch {
  // error-handler module not available, use fallback
}

type Result<T, E = any> = { ok: true; value: T } | { ok: false; error: E }
type AppError = Error & { code?: string; statusCode?: number }

const ok = <T>(value: T): Result<T, never> => ({ ok: true, value })
const err = <E>(error: E): Result<never, E> => ({ ok: false, error })

const safe = async <T>(promise: Promise<T>): Promise<Result<T, AppError>> => {
  try {
    const value = await promise
    return ok(value)
  } catch (e: any) {
    return err(e as AppError)
  }
}

// Use error-handler if available, otherwise use fallback
const AppErrorClass = errorHandlerModule?.AppError || class AppError extends Error {
  constructor(message: string, public code?: string, public statusCode?: number) {
    super(message)
    this.name = 'AppError'
  }
}

/**
 * Wraps a Supabase query operation in a Result type.
 * 
 * @param operation - Supabase query operation
 * @returns Result with data or error
 * 
 * @example
 * ```typescript
 * const result = await safeQuery(() => supabase.from('posts').select('*'))
 * if (!result.ok) {
 *   console.error('Query failed:', result.error.message)
 *   return
 * }
 * console.log('Posts:', result.value)
 * ```
 */
export async function safeQuery<T>(
  operation: () => Promise<{ data: T | null; error: any }>
): Promise<Result<T, AppError>> {
  const result = await safe(operation())

  if (!result.ok) {
    const normalized = normalizeError(result.error)
    return err(
      new AppErrorClass(
        normalized.message,
        normalized.code,
        normalized.statusCode || 500
      )
    )
  }

  const { data, error } = result.value

  if (error) {
    const normalized = normalizeError(error)
    return err(
      new AppErrorClass(
        normalized.message,
        normalized.code,
        normalized.statusCode || 500
      )
    )
  }

    if (data === null) {
      return err(new AppErrorClass('No data returned', 'NO_DATA', 404))
    }

  return ok(data)
}

/**
 * Wraps a Supabase mutation operation (insert, update, delete) in a Result type.
 * 
 * @param operation - Supabase mutation operation
 * @returns Result with data or error
 * 
 * @example
 * ```typescript
 * const result = await safeMutation(() => 
 *   supabase.from('posts').insert({ title: 'New Post' })
 * )
 * if (!result.ok) {
 *   if (result.error.code === SUPABASE_ERROR_CODES.UNIQUE_VIOLATION) {
 *     console.log('Duplicate entry')
 *   }
 *   return
 * }
 * console.log('Post created:', result.value)
 * ```
 */
export async function safeMutation<T>(
  operation: () => Promise<{ data: T | null; error: any }>
): Promise<Result<T, AppError>> {
  return safeQuery(operation)
}

/**
 * Wraps a Supabase storage operation in a Result type.
 * 
 * @param operation - Supabase storage operation
 * @returns Result with data or error
 * 
 * @example
 * ```typescript
 * const result = await safeStorage(() =>
 *   supabase.storage.from('uploads').upload('file.jpg', file)
 * )
 * if (!result.ok) {
 *   console.error('Upload failed:', result.error.message)
 *   return
 * }
 * console.log('File uploaded:', result.value.path)
 * ```
 */
export async function safeStorage<T>(
  operation: () => Promise<{ data: T | null; error: any }>
): Promise<Result<T, AppError>> {
  return safeQuery(operation)
}

/**
 * Wraps a Supabase auth operation in a Result type.
 * 
 * @param operation - Supabase auth operation
 * @returns Result with data or error
 * 
 * @example
 * ```typescript
 * const result = await safeAuth(() =>
 *   supabase.auth.signInWithPassword({ email, password })
 * )
 * if (!result.ok) {
 *   if (result.error.code === SUPABASE_ERROR_CODES.INVALID_CREDENTIALS) {
 *     console.log('Invalid credentials')
 *   }
 *   return
 * }
 * console.log('User signed in:', result.value.user)
 * ```
 */
export async function safeAuth<T>(
  operation: () => Promise<{ data: T | null; error: any }>
): Promise<Result<T, AppError>> {
  return safeQuery(operation)
}

/**
 * Creates a safe wrapper for a Supabase client that returns Result types.
 * 
 * @param client - Supabase client instance
 * @returns Object with safe operation methods
 * 
 * @example
 * ```typescript
 * const safeSupabase = createSafeClient(supabase)
 * 
 * const result = await safeSupabase.from('posts').select('*')
 * if (!result.ok) {
 *   // Handle error
 *   return
 * }
 * // Use result.value
 * ```
 */
export function createSafeClient(client: SupabaseClient<Database>) {
  return {
    /**
     * Safe query operation.
     */
    async query<T>(
      operation: () => Promise<{ data: T | null; error: any }>
    ): Promise<Result<T, AppError>> {
      return safeQuery(operation)
    },

    /**
     * Safe mutation operation.
     */
    async mutation<T>(
      operation: () => Promise<{ data: T | null; error: any }>
    ): Promise<Result<T, AppError>> {
      return safeMutation(operation)
    },

    /**
     * Safe storage operation.
     */
    async storage<T>(
      operation: () => Promise<{ data: T | null; error: any }>
    ): Promise<Result<T, AppError>> {
      return safeStorage(operation)
    },

    /**
     * Safe auth operation.
     */
    async auth<T>(
      operation: () => Promise<{ data: T | null; error: any }>
    ): Promise<Result<T, AppError>> {
      return safeAuth(operation)
    },
  }
}

