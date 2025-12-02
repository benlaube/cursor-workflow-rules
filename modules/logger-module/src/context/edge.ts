/**
 * Edge runtime context implementation using request-scoped context.
 * 
 * Provides context propagation for edge runtimes (Vercel Edge, Cloudflare Workers, etc.).
 * Uses request-scoped storage or manual context passing since AsyncLocalStorage
 * is not available in edge runtimes.
 */

import type { LogContext, PartialLogContext } from '../types/context';

// Request-scoped context storage
// In edge runtimes, we use a simple object that can be passed around
let requestContext: LogContext | undefined;

/**
 * Sets log context for the current request scope.
 * 
 * Note: In edge runtimes, context is request-scoped and may not persist
 * across all async boundaries. Consider passing context explicitly for
 * complex async operations.
 * 
 * @param context - Partial context to merge with existing context
 */
export function setLogContext(context: PartialLogContext): void {
  requestContext = { ...requestContext, ...context };
}

/**
 * Gets the current log context.
 * 
 * @returns Current log context or undefined if not set
 */
export function getLogContext(): LogContext | undefined {
  return requestContext;
}

/**
 * Clears all log context for the current request scope.
 */
export function clearLogContext(): void {
  requestContext = undefined;
}

/**
 * Executes a function with temporary log context.
 * Context is automatically restored after the function completes.
 * 
 * @param context - Context to set temporarily
 * @param fn - Function to execute with the context
 * @returns Result of the function
 */
export function withLogContext<T>(
  context: PartialLogContext,
  fn: () => T
): T {
  const previous = requestContext;
  const mergedContext = { ...previous, ...context };
  
  try {
    requestContext = mergedContext;
    return fn();
  } finally {
    requestContext = previous;
  }
}

/**
 * Executes an async function with temporary log context.
 * 
 * Note: In edge runtimes, context may not propagate through all async
 * boundaries. Consider using explicit context passing for complex async operations.
 * 
 * @param context - Context to set temporarily
 * @param fn - Async function to execute with the context
 * @returns Promise that resolves to the result of the function
 */
export async function withLogContextAsync<T>(
  context: PartialLogContext,
  fn: () => Promise<T>
): Promise<T> {
  const previous = requestContext;
  const mergedContext = { ...previous, ...context };
  
  try {
    requestContext = mergedContext;
    return await fn();
  } finally {
    requestContext = previous;
  }
}

/**
 * Creates a context object that can be passed explicitly to async functions.
 * Useful for edge runtimes where automatic propagation may not work.
 * 
 * @param context - Context to create
 * @returns Context object
 */
export function createContext(context: PartialLogContext): LogContext {
  return { ...context } as LogContext;
}

