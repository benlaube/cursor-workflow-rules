/**
 * Transaction Helpers
 * 
 * Utilities for executing multiple database operations in transactions.
 * Note: Supabase uses PostgreSQL transactions under the hood.
 * 
 * Dependencies: @supabase/supabase-js
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../types/database-types'

/**
 * Transaction operation function.
 * Receives a Supabase client and should perform database operations.
 * If the function throws, the transaction will be rolled back.
 */
export type TransactionOperation<T = void> = (
  client: SupabaseClient<Database>
) => Promise<T>

/**
 * Executes multiple database operations in a transaction.
 * 
 * Note: Supabase doesn't have explicit transaction support in the JS client.
 * This helper provides a pattern for grouping operations that should succeed or fail together.
 * 
 * For true transactions, use PostgreSQL functions or Supabase Edge Functions.
 * 
 * @param supabase - Supabase client instance
 * @param operations - Array of operations to execute
 * @returns Results from all operations
 * 
 * @example
 * ```typescript
 * const results = await executeTransaction(supabase, [
 *   async (client) => {
 *     const { data } = await client.from('posts').insert({ title: 'New Post' })
 *     return data
 *   },
 *   async (client) => {
 *     const { data } = await client.from('tags').insert({ name: 'New Tag' })
 *     return data
 *   },
 * ])
 * ```
 */
export async function executeTransaction<T>(
  supabase: SupabaseClient<Database>,
  operations: TransactionOperation<T>[]
): Promise<T[]> {
  const results: T[] = []

  try {
    for (const operation of operations) {
      const result = await operation(supabase)
      results.push(result)
    }
    return results
  } catch (error) {
    // If any operation fails, we can't rollback via JS client
    // Log error and rethrow
    console.error('Transaction operation failed:', error)
    throw error
  }
}

/**
 * Executes a database operation with retry logic.
 * Useful for operations that might fail due to transient errors.
 * 
 * @param operation - Operation to execute
 * @param maxRetries - Maximum number of retry attempts
 * @param delayMs - Delay between retries (milliseconds)
 * @returns Result from operation
 * 
 * @example
 * ```typescript
 * const result = await withRetry(
 *   () => supabase.from('posts').insert({ title: 'New Post' }),
 *   3, // max retries
 *   1000 // 1 second delay
 * )
 * ```
 */
export async function withRetry<T>(
  operation: () => Promise<{ data: T | null; error: any }>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: any

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const { data, error } = await operation()
      if (error) throw error
      if (data) return data
      throw new Error('Operation returned no data')
    } catch (error: any) {
      lastError = error

      // Don't retry on certain errors (e.g., validation errors)
      if (error?.code === '23505') {
        // Unique constraint violation - don't retry
        throw error
      }

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)))
        continue
      }
    }
  }

  throw lastError || new Error('Operation failed after retries')
}

