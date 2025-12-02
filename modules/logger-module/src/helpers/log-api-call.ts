/**
 * API call logging helper.
 * 
 * Specialized function for logging API calls with automatic action mapping
 * based on HTTP method.
 */

import type { Logger } from '../logger';
import type { LogLevel } from '../types/logger';
import { logWithContext } from './log-with-context';

/**
 * Maps HTTP methods to action categories.
 */
const METHOD_TO_ACTION: Record<string, string> = {
  GET: 'api_query',
  POST: 'api_request',
  PUT: 'api_update',
  PATCH: 'api_update',
  DELETE: 'api_delete',
};

/**
 * Logs an API call with automatic action mapping.
 * 
 * @param logger - Logger instance
 * @param level - Log level
 * @param message - Log message
 * @param source - Source category (default: 'api')
 * @param endpoint - API endpoint path
 * @param method - HTTP method (GET, POST, PUT, PATCH, DELETE)
 * @param meta - Additional metadata (status, duration, etc.)
 */
export function logApiCall(
  logger: Logger,
  level: LogLevel,
  message: string,
  source: string = 'api',
  endpoint?: string,
  method?: string,
  meta?: Record<string, unknown>
): void {
  // Map HTTP method to action
  const action = method ? METHOD_TO_ACTION[method.toUpperCase()] || 'api_request' : 'api_request';
  
  // Log with context
  logWithContext(
    logger,
    level,
    message,
    source,
    action,
    'backend',
    {
      ...meta,
      ...(endpoint && { endpoint }),
      ...(method && { method }),
    }
  );
}

