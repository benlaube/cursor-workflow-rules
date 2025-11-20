/**
 * Backend API Module
 * 
 * Standardized API handler wrapper for Next.js with Supabase SSR integration.
 * 
 * Provides:
 * - createApiHandler: Wrapper for API routes with auth, validation, error handling
 * - Authentication middleware using Supabase SSR
 * - Input validation with Zod
 * - Standardized response formatting
 * 
 * @module @modules/backend-api
 */

// Main handler
export { createApiHandler } from './src/handler'
export type { HandlerConfig } from './src/handler'

// Context types
export type { RequestContext, AuthContext } from './src/context'

// Response helpers
export {
  success,
  error,
  unauthorized,
  forbidden,
  notFound,
  validationError,
  internalError,
} from './src/response'
export type { ApiResponse } from './src/response'

// Auth middleware
export {
  authenticateRequest,
  getCurrentUser,
  createAuthenticatedClient,
} from './src/middleware/auth'

// Validation middleware
export {
  validateBody,
  validateQuery,
} from './src/middleware/validation'
export type { ValidationError } from './src/middleware/validation'

