/**
 * Query Builder
 * 
 * Fluent API for common Supabase query patterns.
 * Provides type-safe, reusable query building utilities.
 * 
 * Dependencies: @supabase/supabase-js
 */

import type { SupabaseClient, PostgrestFilterBuilder, PostgrestQueryBuilder } from '@supabase/supabase-js'
import type { Database } from '../../types/database-types'

/**
 * Query builder configuration.
 */
export interface QueryBuilderConfig {
  /** Supabase client instance */
  supabase: SupabaseClient<Database>
  /** Table name */
  table: keyof Database['public']['Tables']
  /** Default select columns */
  select?: string
}

/**
 * Fluent query builder for common patterns.
 * 
 * @example
 * ```typescript
 * const query = new QueryBuilder({ supabase, table: 'posts' })
 * const posts = await query
 *   .select('id, title, content')
 *   .where('published', true)
 *   .orderBy('created_at', 'desc')
 *   .limit(10)
 *   .execute()
 * ```
 */
export class QueryBuilder<T extends keyof Database['public']['Tables']> {
  private supabase: SupabaseClient<Database>
  private table: T
  private query: PostgrestFilterBuilder<
    Database['public']['Tables'][T]['Row'],
    Database['public']['Tables'][T]['Row'],
    any
  >

  constructor(config: QueryBuilderConfig) {
    this.supabase = config.supabase
    this.table = config.table as T
    this.query = this.supabase.from(this.table).select(config.select || '*')
  }

  /**
   * Add WHERE clause (equality).
   */
  where<K extends keyof Database['public']['Tables'][T]['Row']>(
    column: K,
    value: Database['public']['Tables'][T]['Row'][K]
  ): this {
    this.query = this.query.eq(column as string, value)
    return this
  }

  /**
   * Add WHERE clause (inequality).
   */
  whereNot<K extends keyof Database['public']['Tables'][T]['Row']>(
    column: K,
    value: Database['public']['Tables'][T]['Row'][K]
  ): this {
    this.query = this.query.neq(column as string, value)
    return this
  }

  /**
   * Add WHERE IN clause.
   */
  whereIn<K extends keyof Database['public']['Tables'][T]['Row']>(
    column: K,
    values: Database['public']['Tables'][T]['Row'][K][]
  ): this {
    this.query = this.query.in(column as string, values)
    return this
  }

  /**
   * Add WHERE LIKE clause (case-insensitive).
   */
  whereLike<K extends keyof Database['public']['Tables'][T]['Row']>(
    column: K,
    pattern: string
  ): this {
    this.query = this.query.ilike(column as string, `%${pattern}%`)
    return this
  }

  /**
   * Add ORDER BY clause.
   */
  orderBy<K extends keyof Database['public']['Tables'][T]['Row']>(
    column: K,
    direction: 'asc' | 'desc' = 'asc'
  ): this {
    this.query = this.query.order(column as string, { ascending: direction === 'asc' })
    return this
  }

  /**
   * Add LIMIT clause.
   */
  limit(count: number): this {
    this.query = this.query.limit(count)
    return this
  }

  /**
   * Add OFFSET clause (for pagination).
   */
  offset(count: number): this {
    this.query = this.query.range(count, count + (this.query as any).limit || 1000)
    return this
  }

  /**
   * Execute the query and return results.
   */
  async execute(): Promise<{
    data: Database['public']['Tables'][T]['Row'][]
    error: any
  }> {
    return await this.query
  }

  /**
   * Execute the query and return single result.
   */
  async single(): Promise<{
    data: Database['public']['Tables'][T]['Row'] | null
    error: any
  }> {
    return await this.query.single()
  }

  /**
   * Execute the query and return count.
   */
  async count(): Promise<number> {
    const { count, error } = await this.query.select('*', { count: 'exact', head: true })
    if (error) throw error
    return count || 0
  }
}

/**
 * Create a new query builder instance.
 * 
 * @example
 * ```typescript
 * const posts = await queryBuilder(supabase, 'posts')
 *   .where('published', true)
 *   .orderBy('created_at', 'desc')
 *   .limit(10)
 *   .execute()
 * ```
 */
export function queryBuilder<T extends keyof Database['public']['Tables']>(
  supabase: SupabaseClient<Database>,
  table: T,
  select?: string
): QueryBuilder<T> {
  return new QueryBuilder({ supabase, table, select })
}

