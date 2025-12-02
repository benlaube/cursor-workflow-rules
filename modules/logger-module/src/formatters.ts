/**
 * Log formatters for category prefixes and message formatting.
 * 
 * Formats log messages with [source|action|component] prefixes and
 * includes request/trace IDs when available.
 */

import { getLogContext } from './context';
import { getOpenTelemetryTraceId } from './tracing/opentelemetry';
import type { LogContext } from './types/context';

/**
 * Formats a category prefix from context dimensions.
 * 
 * @param source - Source category (user, bot, system, api)
 * @param action - Action category (order_placed, sync_orders, etc.)
 * @param component - Component category (frontend, backend, etc.)
 * @returns Formatted category string like "[source|action|component]"
 */
export function formatCategory(
  source?: string,
  action?: string,
  component?: string
): string {
  const parts = [source, action, component].filter(Boolean);
  return parts.length > 0 ? `[${parts.join('|')}]` : '';
}

/**
 * Formats a category prefix from a log context object.
 * 
 * @param context - Log context object
 * @returns Formatted category string
 */
export function formatCategoryFromContext(context?: LogContext): string {
  if (!context) {
    return '';
  }
  
  return formatCategory(context.source, context.action, context.component);
}

/**
 * Gets the current category from thread-local context.
 * 
 * @returns Formatted category string from current context
 */
export function getCurrentCategory(): string {
  const context = getLogContext();
  return formatCategoryFromContext(context);
}

/**
 * Formats a log message with category prefix and optional trace information.
 * 
 * @param message - Base log message
 * @param includeTrace - Whether to include trace/request IDs (default: false)
 * @returns Formatted message string
 */
export function formatMessage(message: string, includeTrace: boolean = false): string {
  const category = getCurrentCategory();
  const parts: string[] = [];
  
  if (category) {
    parts.push(category);
  }
  
  if (includeTrace) {
    const context = getLogContext();
    const traceIds: string[] = [];
    
    if (context?.requestId) {
      traceIds.push(`req:${context.requestId}`);
    }
    
    if (context?.traceId) {
      traceIds.push(`trace:${context.traceId}`);
    } else {
      // Try OpenTelemetry
      const otTraceId = getOpenTelemetryTraceId();
      if (otTraceId) {
        traceIds.push(`trace:${otTraceId}`);
      }
    }
    
    if (traceIds.length > 0) {
      parts.push(`(${traceIds.join(', ')})`);
    }
  }
  
  if (parts.length > 0) {
    return `${parts.join(' ')} - ${message}`;
  }
  
  return message;
}

/**
 * Formats a log level string for display.
 * 
 * @param level - Log level
 * @returns Formatted level string
 */
export function formatLogLevel(level: string): string {
  return level.toUpperCase().padEnd(7);
}

