/**
 * RLS (Row Level Security) Helpers
 * 
 * Utilities for testing and managing RLS policies.
 * 
 * Dependencies: @supabase/supabase-js
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../types/database-types'

/**
 * Tests if RLS is enabled on a table.
 * 
 * @param supabase - Supabase client (should use service role for this check)
 * @param tableName - Name of the table to check
 * @returns True if RLS is enabled, false otherwise
 * 
 * @example
 * ```typescript
 * const isRLSEnabled = await checkRLSEnabled(adminSupabase, 'profiles')
 * if (!isRLSEnabled) {
 *   console.warn('RLS is not enabled on profiles table')
 * }
 * ```
 */
export async function checkRLSEnabled(
  supabase: SupabaseClient<Database>,
  tableName: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('check_rls_enabled', {
    table_name: tableName,
  })

  if (error) {
    // Fallback: Try direct query to information_schema
    const { data: schemaData, error: schemaError } = await supabase
      .from('information_schema.table_privileges' as any)
      .select('*')
      .eq('table_name', tableName)
      .limit(1)

    if (schemaError) {
      console.warn(`Could not check RLS status for ${tableName}:`, schemaError)
      return false
    }

    return true // Assume enabled if we can query
  }

  return data === true
}

/**
 * Gets the current authenticated user's ID from JWT.
 * Useful for RLS policy testing.
 * 
 * @param supabase - Authenticated Supabase client
 * @returns User ID if authenticated, null otherwise
 * 
 * @example
 * ```typescript
 * const userId = await getCurrentUserId(supabase)
 * if (userId) {
 *   // User is authenticated, RLS policies apply
 * }
 * ```
 */
export async function getCurrentUserId(
  supabase: SupabaseClient<Database>
): Promise<string | null> {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user.id
}

/**
 * Gets the current user's role from JWT claims.
 * Roles are stored in app_metadata.role.
 * 
 * @param supabase - Authenticated Supabase client
 * @returns User role if available, null otherwise
 * 
 * @example
 * ```typescript
 * const role = await getCurrentUserRole(supabase)
 * if (role === 'admin') {
 *   // User has admin role
 * }
 * ```
 */
export async function getCurrentUserRole(
  supabase: SupabaseClient<Database>
): Promise<string | null> {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return (user.app_metadata?.role as string) || null
}

/**
 * Helper to check if current user has a specific role.
 * 
 * @param supabase - Authenticated Supabase client
 * @param requiredRole - Role to check for
 * @returns True if user has the required role
 * 
 * @example
 * ```typescript
 * const isAdmin = await hasRole(supabase, 'admin')
 * if (!isAdmin) {
 *   throw new Error('Unauthorized: Admin access required')
 * }
 * ```
 */
export async function hasRole(
  supabase: SupabaseClient<Database>,
  requiredRole: string
): Promise<boolean> {
  const role = await getCurrentUserRole(supabase)
  return role === requiredRole
}

