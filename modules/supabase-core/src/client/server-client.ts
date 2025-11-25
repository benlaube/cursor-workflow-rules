/**
 * Server-Side Client Helpers
 * 
 * Utilities for creating authenticated Supabase clients in Next.js server contexts
 * (API routes, Server Components, Server Actions).
 * 
 * Dependencies: @supabase/ssr, next
 */

import { createServerClient as createSSRClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../../types/database-types'

/**
 * Creates an authenticated Supabase client for server-side operations.
 * Automatically handles JWT extraction, verification, and token refresh via cookies.
 * 
 * This is the recommended way to create Supabase clients in:
 * - Next.js API routes
 * - Server Components
 * - Server Actions
 * 
 * @param options - Optional client configuration
 * @returns Authenticated Supabase client instance
 * 
 * @example
 * ```typescript
 * // In API route
 * export async function GET() {
 *   const supabase = await createServerClient()
 *   const { data: { user } } = await supabase.auth.getUser()
 *   // User is authenticated, RLS policies apply
 * }
 * ```
 */
export async function createServerClient(options?: {
  /** Custom Supabase URL (overrides env var) */
  url?: string
  /** Custom anon key (overrides env var) */
  anonKey?: string
  /** Database types for type safety */
  dbTypes?: Database
}): Promise<SupabaseClient<Database>> {
  const url = options?.url || process.env.SUPABASE_URL
  const anonKey = options?.anonKey || process.env.SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase configuration. Ensure SUPABASE_URL and SUPABASE_ANON_KEY are set.'
    )
  }

  const cookieStore = await cookies()

  return createSSRClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options: cookieOptions }) =>
            cookieStore.set(name, value, cookieOptions)
          )
        } catch {
          // The `setAll` method can be called in a Server Component context
          // where cookies are read-only. This is handled by middleware.
        }
      },
    },
  })
}

/**
 * Gets the authenticated user from the server-side Supabase client.
 * Returns null if user is not authenticated.
 * 
 * @param supabase - Server-side Supabase client (from createServerClient)
 * @returns User object if authenticated, null otherwise
 * 
 * @example
 * ```typescript
 * const supabase = await createServerClient()
 * const user = await getServerUser(supabase)
 * if (!user) {
 *   return new Response('Unauthorized', { status: 401 })
 * }
 * ```
 */
export async function getServerUser(
  supabase: SupabaseClient<Database>
): Promise<{ id: string; email?: string; [key: string]: any } | null> {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

