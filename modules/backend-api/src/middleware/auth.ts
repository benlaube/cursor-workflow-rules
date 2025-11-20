/**
 * Authentication middleware using Supabase SSR.
 * 
 * This middleware leverages @supabase/ssr to automatically handle:
 * - JWT extraction from cookies
 * - Token verification
 * - Token refresh
 * - User object creation
 * 
 * Dependencies: @supabase/ssr, @supabase/supabase-js
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { User, SupabaseClient } from '@supabase/supabase-js'
import type { AuthContext } from '../context'

/**
 * Create an authenticated Supabase client using SSR helpers.
 * 
 * This function handles all the complexity of:
 * - Reading cookies
 * - Creating Supabase client with cookie management
 * - Automatic token refresh
 * 
 * @returns Authenticated Supabase client or null if not authenticated
 */
export async function createAuthenticatedClient(): Promise<SupabaseClient | null> {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
            // The middleware will handle cookie updates.
          }
        },
      },
    }
  )

  return supabase
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

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return {
    user,
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

