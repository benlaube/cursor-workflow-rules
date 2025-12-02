/**
 * Type Definitions
 * 
 * Type definitions for Supabase client utilities.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../types/database-types'

/**
 * Typed Supabase client with database schema.
 */
export type TypedSupabaseClient = SupabaseClient<Database>

/**
 * Client creation options.
 */
export interface ClientOptions {
  /** Custom Supabase URL (overrides env var) */
  url?: string
  /** Custom anon key (overrides env var) */
  anonKey?: string
  /** Service role key (use with caution) */
  serviceRoleKey?: string
  /** Database types for type safety */
  dbTypes?: Database
}

