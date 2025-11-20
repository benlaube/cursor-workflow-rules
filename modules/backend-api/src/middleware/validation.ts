/**
 * Input validation middleware using Zod.
 * 
 * Validates request input (query params, body, etc.) against Zod schemas.
 * Returns standardized validation errors if validation fails.
 * 
 * Dependencies: zod
 */

import { z } from 'zod'
import type { NextRequest } from 'next/server'

/**
 * Validation error details.
 */
export interface ValidationError {
  field: string
  message: string
  code: string
}

/**
 * Parse and validate request body against a Zod schema.
 * 
 * @param request - Next.js request object
 * @param schema - Zod schema to validate against
 * @returns Parsed and validated data, or validation errors
 * 
 * @example
 * ```typescript
 * const schema = z.object({ name: z.string(), age: z.number() })
 * const result = await validateBody(request, schema)
 * if (!result.success) {
 *   return validationError(result.errors)
 * }
 * const { name, age } = result.data
 * ```
 */
export async function validateBody<T extends z.ZodTypeAny>(
  request: NextRequest,
  schema: T
): Promise<{ success: true; data: z.infer<T> } | { success: false; errors: ValidationError[] }> {
  try {
    const body = await request.json()
    const parsed = schema.parse(body)
    return { success: true, data: parsed }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationError[] = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      }))
      return { success: false, errors }
    }
    throw error
  }
}

/**
 * Parse and validate query parameters against a Zod schema.
 * 
 * @param request - Next.js request object
 * @param schema - Zod schema to validate against
 * @returns Parsed and validated data, or validation errors
 * 
 * @example
 * ```typescript
 * const schema = z.object({ page: z.coerce.number(), limit: z.coerce.number() })
 * const result = await validateQuery(request, schema)
 * if (!result.success) {
 *   return validationError(result.errors)
 * }
 * const { page, limit } = result.data
 * ```
 */
export function validateQuery<T extends z.ZodTypeAny>(
  request: NextRequest,
  schema: T
): { success: true; data: z.infer<T> } | { success: false; errors: ValidationError[] } {
  try {
    const url = new URL(request.url)
    const params = Object.fromEntries(url.searchParams.entries())
    const parsed = schema.parse(params)
    return { success: true, data: parsed }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationError[] = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      }))
      return { success: false, errors }
    }
    throw error
  }
}

