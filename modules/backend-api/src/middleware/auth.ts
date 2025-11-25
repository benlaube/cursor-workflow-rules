/**
 * Authentication middleware using Supabase SSR.
 * 
 * This middleware leverages supabase-core's createServerClient to automatically handle:
 * - JWT extraction from cookies
 * - Token verification
 * - Token refresh
 * - User object creation
 * 
 * Dependencies: @modules/supabase-core
 */

import { createServerClient, getServerUser } from '@modules/supabase-core'
import type { User, SupabaseClient } from '@supabase/supabase-js'
import type { AuthContext } from '../context'

/**
 * Create an authenticated Supabase client using supabase-core SSR helpers.
 * 
 * This function uses supabase-core's createServerClient which handles:
 * - Reading cookies
 * - Creating Supabase client with cookie management
 * - Automatic token refresh
 * - Environment detection (local vs production)
 * 
 * @returns Authenticated Supabase client or null if not authenticated
 */
export async function createAuthenticatedClient(): Promise<SupabaseClient | null> {
  try {
    const supabase = await createServerClient()
    return supabase
  } catch (error) {
    console.error('Failed to create authenticated client:', error)
    return null
  }
}

/**
 * Authenticate the current request and return user context.
 * 
 * This is the main function to use in API handlers that require authentication.
 * It automatically:
 * - Extracts JWT from cookies
 * - Verifies the token
 * - Returns user and authenticated Supabase client
 * 
 * Uses supabase-core's createServerClient and getServerUser for consistent behavior.
 * 
 * @returns AuthContext with user and Supabase client, or null if not authenticated
 * 
 * @example
 * ```typescript
 * const auth = await authenticateRequest()
 * if (!auth) {
 *   return unauthorized()
 * }
 * // Use auth.user and auth.supabase
 * ```
 */
export async function authenticateRequest(): Promise<AuthContext | null> {
  const supabase = await createAuthenticatedClient()
  if (!supabase) {
    return null
  }

  const user = await getServerUser(supabase)
  if (!user) {
    return null
  }

  return {
    user: user as User,
    supabase,
  }
}

/**
 * Get the current user without creating a full auth context.
 * Useful for optional authentication checks.
 * 
 * @returns User object or null
 */
export async function getCurrentUser(): Promise<User | null> {
  const auth = await authenticateRequest()
  return auth?.user ?? null
}

