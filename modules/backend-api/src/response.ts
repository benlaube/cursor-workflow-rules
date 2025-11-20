/**
 * Standardized API response formatting.
 * 
 * All API responses follow a consistent format: { data?, error?, meta? }
 * This makes error handling and response parsing predictable across all endpoints.
 */

import { NextResponse } from 'next/server'

/**
 * Standard API response structure.
 */
export interface ApiResponse<T = any> {
  /** Response data (present on success) */
  data?: T
  /** Error information (present on failure) */
  error?: {
    code: string
    message: string
    details?: any
  }
  /** Metadata (pagination, timestamps, etc.) */
  meta?: {
    timestamp?: string
    requestId?: string
    [key: string]: any
  }
}

/**
 * Create a successful API response.
 */
export function success<T>(
  data: T,
  meta?: ApiResponse['meta'],
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    },
    { status }
  )
}

/**
 * Create an error API response.
 */
export function error(
  code: string,
  message: string,
  details?: any,
  status: number = 400
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        details,
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  )
}

/**
 * Create an unauthorized response.
 */
export function unauthorized(message: string = 'Authentication required'): NextResponse<ApiResponse> {
  return error('UNAUTHORIZED', message, undefined, 401)
}

/**
 * Create a forbidden response.
 */
export function forbidden(message: string = 'Insufficient permissions'): NextResponse<ApiResponse> {
  return error('FORBIDDEN', message, undefined, 403)
}

/**
 * Create a not found response.
 */
export function notFound(resource: string = 'Resource'): NextResponse<ApiResponse> {
  return error('NOT_FOUND', `${resource} not found`, undefined, 404)
}

/**
 * Create a validation error response.
 */
export function validationError(details: any): NextResponse<ApiResponse> {
  return error('VALIDATION_ERROR', 'Invalid input', details, 422)
}

/**
 * Create an internal server error response.
 */
export function internalError(message: string = 'Internal server error'): NextResponse<ApiResponse> {
  return error('INTERNAL_ERROR', message, undefined, 500)
}

