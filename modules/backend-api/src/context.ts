/**
 * Request context types for API handlers.
 * 
 * These types define the shape of data available to handlers after middleware processing.
 */

import type { User } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Authentication context provided by auth middleware.
 */
export interface AuthContext {
  /** Authenticated Supabase user */
  user: User
  /** Authenticated Supabase client (respects RLS) */
  supabase: SupabaseClient
}

/**
 * Request context available to handler functions.
 */
export interface RequestContext {
  /** Authentication context (only present if requireAuth: true) */
  auth?: AuthContext
  /** Tenant ID (for multi-tenant applications) */
  tenantId?: string
  /** Request metadata */
  request: {
    method: string
    url: string
    headers: Headers
  }
}

