/**
 * API Handler Wrapper
 * 
 * Provides a standardized way to create Next.js API route handlers with:
 * - Automatic error handling
 * - Input validation (Zod)
 * - Authentication (Supabase SSR)
 * - Standardized responses
 * - Request logging
 * 
 * Dependencies: @supabase/ssr, zod, next
 */

import type { NextRequest } from 'next/server'
import { z } from 'zod'
import { authenticateRequest } from './middleware/auth'
import { validateBody, validateQuery } from './middleware/validation'
import { success, error, unauthorized, validationError, internalError } from './response'
import type { RequestContext } from './context'

/**
 * Configuration options for API handler.
 */
export interface HandlerConfig<TInput = any, TOutput = any> {
  /** Zod schema for request body validation (POST/PUT/PATCH) */
  bodySchema?: z.ZodType<TInput>
  /** Zod schema for query parameter validation (GET) */
  querySchema?: z.ZodType<TInput>
  /** Require authentication for this endpoint */
  requireAuth?: boolean
  /** Handler function that processes the request */
  handler: (params: {
    input: TInput
    ctx: RequestContext
  }) => Promise<TOutput> | TOutput
}

/**
 * Create a Next.js API route handler with standardized error handling, validation, and auth.
 * 
 * This function wraps your handler logic with:
 * - Automatic try/catch error handling
 * - Input validation (body or query)
 * - Authentication (if requireAuth: true)
 * - Standardized response format
 * 
 * @param config - Handler configuration
 * @returns Next.js route handler function
 * 
 * @example
 * ```typescript
 * // GET handler with query validation
 * export const GET = createApiHandler({
 *   querySchema: z.object({ limit: z.coerce.number().default(10) }),
 *   requireAuth: true,
 *   handler: async ({ input, ctx }) => {
 *     const posts = await ctx.auth!.supabase
 *       .from('posts')
 *       .select('*')
 *       .limit(input.limit)
 *     return posts
 *   }
 * })
 * 
 * // POST handler with body validation
 * export const POST = createApiHandler({
 *   bodySchema: z.object({ title: z.string(), content: z.string() }),
 *   requireAuth: true,
 *   handler: async ({ input, ctx }) => {
 *     const { data } = await ctx.auth!.supabase
 *       .from('posts')
 *       .insert({ ...input, user_id: ctx.auth!.user.id })
 *     return data
 *   }
 * })
 * ```
 */
export function createApiHandler<TInput = any, TOutput = any>(
  config: HandlerConfig<TInput, TOutput>
) {
  return async (request: NextRequest): Promise<Response> => {
    const startTime = Date.now()

    try {
      // 1. Authentication
      let authContext = null
      if (config.requireAuth) {
        authContext = await authenticateRequest()
        if (!authContext) {
          return unauthorized('Authentication required')
        }
      }

      // 2. Input Validation
      let input: TInput | undefined
      
      if (config.bodySchema && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
        const validation = await validateBody(request, config.bodySchema)
        if (!validation.success) {
          return validationError(validation.errors)
        }
        input = validation.data
      } else if (config.querySchema && request.method === 'GET') {
        const validation = validateQuery(request, config.querySchema)
        if (!validation.success) {
          return validationError(validation.errors)
        }
        input = validation.data
      }

      // 3. Create request context
      const ctx: RequestContext = {
        auth: authContext ?? undefined,
        request: {
          method: request.method,
          url: request.url,
          headers: request.headers,
        },
      }

      // 4. Execute handler
      const result = await config.handler({
        input: input as TInput,
        ctx,
      })

      // 5. Return success response
      const duration = Date.now() - startTime
      return success(result, {
        duration: `${duration}ms`,
      })
    } catch (err: any) {
      // 6. Error handling
      const duration = Date.now() - startTime

      // Log error (in production, use proper logging service)
      console.error('API Handler Error:', {
        url: request.url,
        method: request.method,
        error: err.message,
        stack: err.stack,
        duration: `${duration}ms`,
      })

      // Return standardized error response
      if (err.statusCode) {
        return error(
          err.code || 'API_ERROR',
          err.message || 'An error occurred',
          err.details,
          err.statusCode
        )
      }

      // Unknown error
      return internalError('An unexpected error occurred')
    }
  }
}

