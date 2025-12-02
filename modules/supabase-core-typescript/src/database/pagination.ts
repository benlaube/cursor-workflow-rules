/**
 * Pagination Helpers
 * 
 * Utilities for implementing pagination in Supabase queries.
 * Provides consistent pagination patterns across the application.
 * 
 * Dependencies: @supabase/supabase-js
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../types/database-types'

/**
 * Pagination parameters.
 */
export interface PaginationParams {
  /** Page number (1-indexed) */
  page: number
  /** Items per page */
  limit: number
}

/**
 * Paginated response.
 */
export interface PaginatedResponse<T> {
  /** Data items for current page */
  data: T[]
  /** Total number of items */
  total: number
  /** Current page number */
  page: number
  /** Items per page */
  limit: number
  /** Total number of pages */
  totalPages: number
  /** Whether there is a next page */
  hasNext: boolean
  /** Whether there is a previous page */
  hasPrev: boolean
}

/**
 * Paginates a Supabase query.
 * 
 * @param query - Supabase query builder (from .from().select())
 * @param params - Pagination parameters
 * @returns Paginated response with metadata
 * 
 * @example
 * ```typescript
 * const { data, total, page, limit } = await paginate(
 *   supabase.from('posts').select('*'),
 *   { page: 1, limit: 10 }
 * )
 * ```
 * 
 * Note: The query should include `count: 'exact'` in the select options for accurate total count.
 * Example: `supabase.from('posts').select('*', { count: 'exact' })`
 */
export async function paginate<T extends Record<string, any>>(
  query: ReturnType<SupabaseClient<Database>['from']>['select'],
  params: PaginationParams
): Promise<PaginatedResponse<T>> {
  const { page, limit } = params
  const offset = (page - 1) * limit

  // Get paginated data with count
  // Note: The query should already have count: 'exact' option set
  const { data, error, count } = await query.range(offset, offset + limit - 1)
  if (error) throw error
  
  const total = count ?? 0

  const totalPages = Math.ceil(total / limit)

  return {
    data: (data || []) as T[],
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }
}

/**
 * Creates pagination parameters from query string.
 * Useful for parsing pagination from URL query parameters.
 * 
 * @param searchParams - URL search params or object with page/limit
 * @param defaults - Default pagination values
 * @returns Normalized pagination parameters
 * 
 * @example
 * ```typescript
 * // From URL: ?page=2&limit=20
 * const params = parsePaginationParams(searchParams, { page: 1, limit: 10 })
 * // Returns: { page: 2, limit: 20 }
 * ```
 */
export function parsePaginationParams(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>,
  defaults: PaginationParams = { page: 1, limit: 10 }
): PaginationParams {
  let page: number
  let limit: number

  if (searchParams instanceof URLSearchParams) {
    page = parseInt(searchParams.get('page') || String(defaults.page), 10)
    limit = parseInt(searchParams.get('limit') || String(defaults.limit), 10)
  } else {
    const pageParam = searchParams.page
    const limitParam = searchParams.limit

    page = pageParam
      ? parseInt(Array.isArray(pageParam) ? pageParam[0] : pageParam, 10)
      : defaults.page
    limit = limitParam
      ? parseInt(Array.isArray(limitParam) ? limitParam[0] : limitParam, 10)
      : defaults.limit
  }

  // Validate and clamp values
  page = Math.max(1, page)
  limit = Math.max(1, Math.min(100, limit)) // Max 100 items per page

  return { page, limit }
}

