/**
 * Enhanced Supabase Client
 * 
 * Wraps Supabase client with automatic error handling, logging, and monitoring.
 * 
 * Dependencies: @modules/logger-module, @modules/error-handler
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../types/database-types'
import { OperationInterceptor, createDefaultInterceptor } from './interceptor'
import { normalizeError, SUPABASE_ERROR_CODES } from '../utils/error-handler'

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

const safe = async <T>(promise: Promise<T>): Promise<Result<T, AppError>> => {
  try {
    const value = await promise
    return ok(value)
  } catch (e: any) {
    return err(e as AppError)
  }
}

const AppErrorClass = errorHandlerModule?.AppError || class AppError extends Error {
  constructor(message: string, public code?: string, public statusCode?: number) {
    super(message)
    this.name = 'AppError'
  }
}

/**
 * Enhanced client configuration.
 */
export interface EnhancedClientConfig {
  /** Base Supabase client */
  client: SupabaseClient<Database>
  /** Logger instance (optional) */
  logger?: any
  /** Enable automatic error handling */
  autoErrorHandling?: boolean
  /** Enable automatic logging */
  autoLogging?: boolean
  /** Enable performance monitoring */
  enableMetrics?: boolean
  /** Custom interceptors */
  interceptors?: OperationInterceptor
}

/**
 * Enhanced Supabase client with automatic error handling and logging.
 * 
 * @example
 * ```typescript
 * const baseClient = createClient()
 * const enhanced = createEnhancedClient({
 *   client: baseClient,
 *   logger: myLogger,
 *   autoErrorHandling: true,
 *   autoLogging: true,
 * })
 * 
 * // All operations are automatically logged and errors are normalized
 * const result = await enhanced.from('posts').select('*')
 * ```
 */
export class EnhancedSupabaseClient {
  private client: SupabaseClient<Database>
  private logger?: any
  private interceptor: OperationInterceptor
  private metrics: Map<string, { count: number; totalDuration: number; errors: number }> = new Map()

  constructor(config: EnhancedClientConfig) {
    this.client = config.client
    this.logger = config.logger

    // Setup interceptors
    if (config.interceptors) {
      this.interceptor = config.interceptors
    } else {
      this.interceptor = createDefaultInterceptor(config.logger)
    }

    // Add metrics interceptor if enabled
    if (config.enableMetrics) {
      this.interceptor.addInterceptor(async (ctx, op) => {
        const startTime = Date.now()
        try {
          const result = await op()
          const duration = Date.now() - startTime
          this.recordMetric(ctx.operation, duration, false)
          return result
        } catch (error) {
          const duration = Date.now() - startTime
          this.recordMetric(ctx.operation, duration, true)
          throw error
        }
      })
    }
  }

  /**
   * Records a metric for an operation.
   */
  private recordMetric(operation: string, duration: number, isError: boolean): void {
    const existing = this.metrics.get(operation) || { count: 0, totalDuration: 0, errors: 0 }
    this.metrics.set(operation, {
      count: existing.count + 1,
      totalDuration: existing.totalDuration + duration,
      errors: existing.errors + (isError ? 1 : 0),
    })
  }

  /**
   * Gets performance metrics.
   */
  getMetrics(): Record<string, { count: number; avgDuration: number; errorRate: number }> {
    const result: Record<string, any> = {}
    for (const [operation, metrics] of this.metrics.entries()) {
      result[operation] = {
        count: metrics.count,
        avgDuration: metrics.totalDuration / metrics.count,
        errorRate: metrics.errors / metrics.count,
      }
    }
    return result
  }

  /**
   * Resets metrics.
   */
  resetMetrics(): void {
    this.metrics.clear()
  }

  /**
   * Executes a query with automatic error handling and logging.
   */
  async executeQuery<T>(
    operation: string,
    resource: string,
    query: () => Promise<{ data: T | null; error: any }>
  ): Promise<Result<T, AppError>> {
    return this.interceptor.execute(
      { operation, resource },
      async () => {
        const result = await safe(query())

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
    )
  }

  /**
   * Gets the underlying Supabase client.
   */
  getClient(): SupabaseClient<Database> {
    return this.client
  }
}

/**
 * Creates an enhanced Supabase client with automatic error handling and logging.
 * 
 * @param config - Enhanced client configuration
 * @returns Enhanced client instance
 */
export function createEnhancedClient(config: EnhancedClientConfig): EnhancedSupabaseClient {
  return new EnhancedSupabaseClient(config)
}

