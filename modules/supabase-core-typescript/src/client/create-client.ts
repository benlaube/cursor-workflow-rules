/**
 * Client Factory
 * 
 * Creates Supabase clients with automatic environment detection (local vs production).
 * Provides consistent client creation across the application.
 * 
 * Dependencies: @supabase/supabase-js
 */

import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../types/database-types'

/**
 * Environment detection: Determines if running in local development.
 * Checks for localhost URLs or explicit environment flag.
 */
function isLocalEnvironment(): boolean {
  const url = process.env.SUPABASE_URL || ''
  return url.includes('localhost') || url.includes('127.0.0.1') || process.env.NODE_ENV === 'development'
}

/**
 * Creates a Supabase client with automatic environment detection.
 * Uses environment variables to determine local vs production configuration.
 * 
 * @param options - Optional client configuration
 * @returns Configured Supabase client instance
 * 
 * @example
 * ```typescript
 * const supabase = createClient()
 * const { data } = await supabase.from('profiles').select('*')
 * ```
 */
export function createClient(options?: {
  /** Custom Supabase URL (overrides env var) */
  url?: string
  /** Custom anon key (overrides env var) */
  anonKey?: string
  /** Service role key (use with caution, bypasses RLS) */
  serviceRoleKey?: string
  /** Database types for type safety */
  dbTypes?: Database
}): SupabaseClient<Database> {
  const url = options?.url || process.env.SUPABASE_URL
  const key = options?.serviceRoleKey || options?.anonKey || process.env.SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      'Missing Supabase configuration. Ensure SUPABASE_URL and SUPABASE_ANON_KEY are set in environment variables.'
    )
  }

  const isLocal = isLocalEnvironment()

  return createSupabaseClient<Database>(url, key, {
    auth: {
      persistSession: !isLocal, // Don't persist in local dev (cookies handled by SSR)
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        'x-client-info': 'supabase-core-typescript@1.0.0',
      },
    },
  })
}

/**
 * Creates a Supabase client with service role key (bypasses RLS).
 * WARNING: Only use in server-side contexts (API routes, Edge Functions).
 * Never expose service role key to client-side code.
 * 
 * @param options - Optional client configuration
 * @returns Supabase client with service role permissions
 * 
 * @example
 * ```typescript
 * // In API route or Edge Function only
 * const adminSupabase = createServiceRoleClient()
 * const { data } = await adminSupabase.from('users').select('*') // Bypasses RLS
 * ```
 */
export function createServiceRoleClient(options?: {
  /** Custom Supabase URL (overrides env var) */
  url?: string
  /** Custom service role key (overrides env var) */
  serviceRoleKey?: string
  /** Database types for type safety */
  dbTypes?: Database
}): SupabaseClient<Database> {
  const url = options?.url || process.env.SUPABASE_URL
  const key = options?.serviceRoleKey || process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'Missing Supabase service role configuration. Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
    )
  }

  return createSupabaseClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        'x-client-info': 'supabase-core-typescript@1.0.0-service-role',
      },
    },
  })
}

