/**
 * Node.js context implementation using AsyncLocalStorage.
 * 
 * Provides thread-local-like context propagation for async operations
 * in Node.js using the native AsyncLocalStorage API.
 */

import { AsyncLocalStorage } from 'async_hooks';
import type { LogContext, PartialLogContext } from '../types/context';

const contextStore = new AsyncLocalStorage<LogContext>();

/**
 * Sets log context for the current async scope.
 * 
 * @param context - Partial context to merge with existing context
 */
export function setLogContext(context: PartialLogContext): void {
  const current = contextStore.getStore() || {};
  contextStore.enterWith({ ...current, ...context });
}

/**
 * Gets the current log context.
 * 
 * @returns Current log context or undefined if not set
 */
export function getLogContext(): LogContext | undefined {
  return contextStore.getStore();
}

/**
 * Clears all log context for the current async scope.
 */
export function clearLogContext(): void {
  contextStore.enterWith({});
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
  const current = contextStore.getStore() || {};
  const mergedContext = { ...current, ...context };
  
  return contextStore.run(mergedContext, fn);
}

/**
 * Executes an async function with temporary log context.
 * Context is automatically restored after the function completes.
 * 
 * @param context - Context to set temporarily
 * @param fn - Async function to execute with the context
 * @returns Promise that resolves to the result of the function
 */
export async function withLogContextAsync<T>(
  context: PartialLogContext,
  fn: () => Promise<T>
): Promise<T> {
  const current = contextStore.getStore() || {};
  const mergedContext = { ...current, ...context };
  
  return contextStore.run(mergedContext, fn);
}

