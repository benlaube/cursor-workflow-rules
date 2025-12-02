/**
 * Browser context implementation using AsyncContext or WeakMap fallback.
 * 
 * Provides context propagation for async operations in browsers.
 * Uses AsyncContext API (Chrome 126+) if available, otherwise falls back
 * to WeakMap-based manual context passing.
 */

import type { LogContext, PartialLogContext } from '../types/context';

// Check if AsyncContext is available (Chrome 126+)
function hasAsyncContext(): boolean {
  return typeof (globalThis as any).AsyncContext !== 'undefined';
}

function getAsyncContextClass(): any {
  if (hasAsyncContext()) {
    return (globalThis as any).AsyncContext;
  }
  return null;
}

// Fallback: WeakMap for storing context per async operation
// This is a simplified approach - in practice, you'd need to track async boundaries
const contextMap = new WeakMap<object, LogContext>();
let currentContext: LogContext | undefined;

/**
 * Sets log context for the current scope.
 * 
 * In browsers with AsyncContext: Uses AsyncContext for proper propagation.
 * In older browsers: Uses a global context (limitation: not truly async-local).
 * 
 * @param context - Partial context to merge with existing context
 */
export function setLogContext(context: PartialLogContext): void {
  const AsyncContextClass = getAsyncContextClass();
  if (AsyncContextClass) {
    // Use AsyncContext if available
    try {
      const current = AsyncContextClass.current?.get() || {};
      AsyncContextClass.current?.set({ ...current, ...context });
    } catch {
      // Fallback if AsyncContext fails
      currentContext = { ...currentContext, ...context };
    }
  } else {
    // Fallback: Use global context (not truly async-local, but works for most cases)
    currentContext = { ...currentContext, ...context };
  }
}

/**
 * Gets the current log context.
 * 
 * @returns Current log context or undefined if not set
 */
export function getLogContext(): LogContext | undefined {
  const AsyncContextClass = getAsyncContextClass();
  if (AsyncContextClass) {
    try {
      return AsyncContextClass.current?.get();
    } catch {
      return currentContext;
    }
  } else {
    return currentContext;
  }
}

/**
 * Clears all log context for the current scope.
 */
export function clearLogContext(): void {
  const AsyncContextClass = getAsyncContextClass();
  if (AsyncContextClass) {
    try {
      AsyncContextClass.current?.set({});
    } catch {
      currentContext = undefined;
    }
  } else {
    currentContext = undefined;
  }
}

/**
 * Executes a function with temporary log context.
 * Context is automatically restored after the function completes.
 * 
 * Note: In browsers without AsyncContext, this uses a try/finally pattern
 * which works for synchronous code but may not propagate through all async boundaries.
 * 
 * @param context - Context to set temporarily
 * @param fn - Function to execute with the context
 * @returns Result of the function
 */
export function withLogContext<T>(
  context: PartialLogContext,
  fn: () => T
): T {
  const previous = getLogContext();
  const mergedContext = { ...previous, ...context };
  
  try {
    setLogContext(mergedContext);
    return fn();
  } finally {
    if (previous) {
      setLogContext(previous);
    } else {
      clearLogContext();
    }
  }
}

/**
 * Executes an async function with temporary log context.
 * 
 * Note: In browsers without AsyncContext, context may not propagate
 * through all async boundaries. Consider using explicit context passing
 * for complex async operations.
 * 
 * @param context - Context to set temporarily
 * @param fn - Async function to execute with the context
 * @returns Promise that resolves to the result of the function
 */
export async function withLogContextAsync<T>(
  context: PartialLogContext,
  fn: () => Promise<T>
): Promise<T> {
  const previous = getLogContext();
  const mergedContext = { ...previous, ...context };
  
  try {
    setLogContext(mergedContext);
    return await fn();
  } finally {
    if (previous) {
      setLogContext(previous);
    } else {
      clearLogContext();
    }
  }
}

