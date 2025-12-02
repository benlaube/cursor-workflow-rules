/**
 * Context-aware logging helper functions.
 * 
 * Provides utilities for logging with explicit context that merges
 * with thread-local context.
 */

import type { Logger } from '../logger';
import type { LogLevel } from '../types/logger';
import type { PartialLogContext } from '../types/context';
import { getLogContext, setLogContext, clearLogContext } from '../context';

/**
 * Logs a message with explicit context.
 * Merges provided context with thread-local context (thread-local takes precedence).
 * 
 * @param logger - Logger instance
 * @param level - Log level
 * @param message - Log message
 * @param source - Source category (user, bot, system, api)
 * @param action - Action category (order_placed, sync_orders, etc.)
 * @param component - Component category (frontend, backend, etc.)
 * @param meta - Additional metadata
 */
export function logWithContext<T extends Record<string, unknown> = Record<string, unknown>>(
  logger: Logger,
  level: LogLevel,
  message: string,
  source?: string,
  action?: string,
  component?: string,
  meta?: T
): void {
  // Get current context
  const currentContext = getLogContext() || {};
  
  // Merge with explicit context (explicit takes precedence)
  const mergedContext: PartialLogContext = {
    ...currentContext,
    ...(source && { source }),
    ...(action && { action }),
    ...(component && { component }),
  };
  
  // Set temporary context
  const previousContext = currentContext;
  setLogContext(mergedContext);
  
  try {
    // Log with merged context
    switch (level) {
      case 'trace':
        logger.trace(message, meta);
        break;
      case 'debug':
        logger.debug(message, meta);
        break;
      case 'info':
        logger.info(message, meta);
        break;
      case 'warn':
        logger.warn(message, meta);
        break;
      case 'error':
        logger.error(message, undefined, meta);
        break;
      case 'fatal':
        logger.fatal(message, undefined, meta);
        break;
      case 'user_action':
        logger.userAction(message, meta);
        break;
      case 'notice':
        logger.notice(message, meta);
        break;
      case 'success':
        logger.success(message, meta);
        break;
      case 'failure':
        logger.failure(message, undefined, meta);
        break;
    }
  } finally {
    // Restore previous context
    if (previousContext) {
      setLogContext(previousContext);
    } else {
      clearLogContext();
    }
  }
}

/**
 * Logs a background job/cron execution with normalized metadata.
 */
export function logJobEvent(
  logger: Logger,
  level: LogLevel,
  message: string,
  jobName: string,
  meta?: Record<string, unknown>
): void {
  logWithContext(
    logger,
    level,
    message,
    'system',
    'job_run',
    'backend',
    {
      job: jobName,
      ...(meta || {}),
    }
  );
}

/**
 * Logs an external service call with latency and retry metadata.
 */
export function logExternalServiceCall(
  logger: Logger,
  level: LogLevel,
  service: string,
  message: string,
  meta?: Record<string, unknown>
): void {
  logWithContext(
    logger,
    level,
    message,
    'system',
    'external_call',
    'backend',
    {
      external_service: service,
      latency_ms: (meta as any)?.latencyMs ?? (meta as any)?.durationMs,
      retries: (meta as any)?.retries,
      attempt: (meta as any)?.attempt,
      ...meta,
    }
  );
}
