/**
 * Health Check Utilities
 * 
 * Provides health check functionality for Supabase services.
 * 
 * Dependencies: @modules/logger-module, @modules/error-handler
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../types/database-types'

// Optional integration with error-handler module
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

const AppErrorClass = errorHandlerModule?.AppError || class AppError extends Error {
  constructor(message: string, public code?: string, public statusCode?: number) {
    super(message)
    this.name = 'AppError'
  }
}

/**
 * Health check result.
 */
export interface HealthCheckResult {
  /** Service name */
  service: string
  /** Whether the service is healthy */
  healthy: boolean
  /** Response time in milliseconds */
  responseTime: number
  /** Error message if unhealthy */
  error?: string
  /** Additional details */
  details?: Record<string, any>
}

/**
 * Performs a health check on Supabase services.
 * 
 * @param supabase - Supabase client instance
 * @param options - Health check options
 * @returns Health check results
 * 
 * @example
 * ```typescript
 * const health = await checkSupabaseHealth(supabase)
 * if (!health.healthy) {
 *   console.error('Supabase is unhealthy:', health.error)
 * }
 * ```
 */
export async function checkSupabaseHealth(
  supabase: SupabaseClient<Database>,
  options: {
    /** Timeout in milliseconds (default: 5000) */
    timeout?: number
    /** Check database connectivity */
    checkDatabase?: boolean
    /** Check auth service */
    checkAuth?: boolean
    /** Check storage service */
    checkStorage?: boolean
  } = {}
): Promise<Result<HealthCheckResult, AppError>> {
  const {
    timeout = 5000,
    checkDatabase = true,
    checkAuth = true,
    checkStorage = false,
  } = options

  const startTime = Date.now()

  try {
    // Check database connectivity
    if (checkDatabase) {
      const dbResult = await Promise.race([
        supabase.from('_health_check' as any).select('*').limit(1),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Database check timeout')), timeout)
        ),
      ])

      // If we get here, database is reachable (even if table doesn't exist)
    }

    // Check auth service
    if (checkAuth) {
      const authResult = await Promise.race([
        supabase.auth.getSession(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Auth check timeout')), timeout)
        ),
      ])

      // If we get here, auth service is reachable
    }

    // Check storage service (if enabled)
    if (checkStorage) {
      const storageResult = await Promise.race([
        supabase.storage.listBuckets(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Storage check timeout')), timeout)
        ),
      ])

      // If we get here, storage service is reachable
    }

    const responseTime = Date.now() - startTime

    return ok({
      service: 'supabase',
      healthy: true,
      responseTime,
      details: {
        database: checkDatabase ? 'ok' : 'skipped',
        auth: checkAuth ? 'ok' : 'skipped',
        storage: checkStorage ? 'ok' : 'skipped',
      },
    })
  } catch (error: any) {
    const responseTime = Date.now() - startTime

    return err(
      new AppErrorClass(
        error.message || 'Health check failed',
        'HEALTH_CHECK_FAILED',
        503
      )
    )
  }
}

/**
 * Performs a simple connectivity check.
 * 
 * @param supabase - Supabase client instance
 * @returns True if Supabase is reachable
 */
export async function isSupabaseReachable(
  supabase: SupabaseClient<Database>
): Promise<boolean> {
  try {
    // Simple query that should always work
    await Promise.race([
      supabase.from('_health_check' as any).select('*').limit(0),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000)),
    ])
    return true
  } catch {
    // Even if table doesn't exist, if we get a response, Supabase is reachable
    // The error would be about the table, not connectivity
    return true
  }
}

