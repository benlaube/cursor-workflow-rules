/**
 * Request/Response Interceptor
 * 
 * Provides middleware-like functionality for Supabase operations.
 * Enables automatic logging, error handling, and performance monitoring.
 * 
 * Dependencies: @modules/logger-module, @modules/error-handler
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../types/database-types'

/**
 * Operation context for interceptors.
 */
export interface OperationContext {
  /** Operation name (e.g., 'select', 'insert', 'upload') */
  operation: string
  /** Table or resource name */
  resource?: string
  /** Additional metadata */
  metadata?: Record<string, any>
  /** Start time for performance tracking */
  startTime?: number
}

/**
 * Interceptor function type.
 */
export type Interceptor<T = any> = (
  context: OperationContext,
  operation: () => Promise<T>
) => Promise<T>

/**
 * Interceptor manager for Supabase operations.
 * 
 * @example
 * ```typescript
 * const interceptor = new OperationInterceptor(logger)
 * 
 * // Add logging interceptor
 * interceptor.addInterceptor(async (ctx, op) => {
 *   logger.info('Starting operation', { operation: ctx.operation, resource: ctx.resource })
 *   const result = await op()
 *   logger.info('Operation completed', { operation: ctx.operation, duration: Date.now() - ctx.startTime! })
 *   return result
 * })
 * 
 * // Use in operations
 * const result = await interceptor.execute(
 *   { operation: 'select', resource: 'posts' },
 *   () => supabase.from('posts').select('*')
 * )
 * ```
 */
export class OperationInterceptor {
  private interceptors: Interceptor[] = []

  /**
   * Adds an interceptor to the chain.
   * Interceptors are executed in the order they are added.
   */
  addInterceptor(interceptor: Interceptor): void {
    this.interceptors.push(interceptor)
  }

  /**
   * Removes an interceptor.
   */
  removeInterceptor(interceptor: Interceptor): void {
    const index = this.interceptors.indexOf(interceptor)
    if (index > -1) {
      this.interceptors.splice(index, 1)
    }
  }

  /**
   * Executes an operation through all interceptors.
   */
  async execute<T>(
    context: OperationContext,
    operation: () => Promise<T>
  ): Promise<T> {
    const ctx: OperationContext = {
      ...context,
      startTime: context.startTime || Date.now(),
    }

    // Build interceptor chain
    let chain = operation
    for (let i = this.interceptors.length - 1; i >= 0; i--) {
      const interceptor = this.interceptors[i]
      const next = chain
      chain = () => interceptor(ctx, () => next())
    }

    return chain()
  }

  /**
   * Clears all interceptors.
   */
  clear(): void {
    this.interceptors = []
  }
}

/**
 * Creates a default interceptor setup with logging and error handling.
 * 
 * @param logger - Logger instance (optional)
 * @returns Configured interceptor manager
 */
export function createDefaultInterceptor(logger?: any): OperationInterceptor {
  const interceptor = new OperationInterceptor()

  // Logging interceptor
  if (logger) {
    interceptor.addInterceptor(async (ctx, op) => {
      const startTime = Date.now()
      logger.info('Supabase operation started', {
        operation: ctx.operation,
        resource: ctx.resource,
        metadata: ctx.metadata,
      })

      try {
        const result = await op()
        const duration = Date.now() - startTime

        logger.info('Supabase operation completed', {
          operation: ctx.operation,
          resource: ctx.resource,
          duration: `${duration}ms`,
          success: true,
        })

        return result
      } catch (error: any) {
        const duration = Date.now() - startTime

        logger.error('Supabase operation failed', {
          operation: ctx.operation,
          resource: ctx.resource,
          duration: `${duration}ms`,
          error: error.message,
          errorCode: error.code,
          stack: error.stack,
        })

        throw error
      }
    })
  }

  return interceptor
}

