/**
 * Universal context API that auto-selects implementation based on runtime.
 * 
 * Provides a unified interface for context propagation across all runtime environments.
 */

import { getRuntime } from '../utils/environment';
import type { LogContext, PartialLogContext } from '../types/context';

// Import runtime-specific implementations
import * as nodeContext from './node';
import * as browserContext from './browser';
import * as edgeContext from './edge';

/**
 * Sets log context for the current async scope.
 * Automatically selects the appropriate implementation based on runtime.
 * 
 * @param context - Partial context to merge with existing context
 */
export function setLogContext(context: PartialLogContext): void {
  const runtime = getRuntime();
  
  if (runtime === 'node') {
    nodeContext.setLogContext(context);
  } else if (runtime === 'browser') {
    browserContext.setLogContext(context);
  } else {
    edgeContext.setLogContext(context);
  }
}

/**
 * Gets the current log context.
 * Automatically selects the appropriate implementation based on runtime.
 * 
 * @returns Current log context or undefined if not set
 */
export function getLogContext(): LogContext | undefined {
  const runtime = getRuntime();
  
  if (runtime === 'node') {
    return nodeContext.getLogContext();
  } else if (runtime === 'browser') {
    return browserContext.getLogContext();
  } else {
    return edgeContext.getLogContext();
  }
}

/**
 * Clears all log context for the current async scope.
 * Automatically selects the appropriate implementation based on runtime.
 */
export function clearLogContext(): void {
  const runtime = getRuntime();
  
  if (runtime === 'node') {
    nodeContext.clearLogContext();
  } else if (runtime === 'browser') {
    browserContext.clearLogContext();
  } else {
    edgeContext.clearLogContext();
  }
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
  const runtime = getRuntime();
  
  if (runtime === 'node') {
    return nodeContext.withLogContext(context, fn);
  } else if (runtime === 'browser') {
    return browserContext.withLogContext(context, fn);
  } else {
    return edgeContext.withLogContext(context, fn);
  }
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
  const runtime = getRuntime();
  
  if (runtime === 'node') {
    return nodeContext.withLogContextAsync(context, fn);
  } else if (runtime === 'browser') {
    return browserContext.withLogContextAsync(context, fn);
  } else {
    return edgeContext.withLogContextAsync(context, fn);
  }
}

