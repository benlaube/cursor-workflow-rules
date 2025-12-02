/**
 * Database query logging integration.
 * 
 * Provides utilities for automatic SQL query logging with parameters.
 */

import type { Logger } from '../logger';
import { setLogContext, getLogContext } from '../context';
import { createPerformanceMetrics, trackDatabaseQuery } from '../helpers/performance-tracking';

/**
 * Database query information.
 */
export interface DatabaseQueryInfo {
  /** SQL query string */
  query: string;
  /** Query parameters */
  params?: unknown[];
  /** Query type (SELECT, INSERT, UPDATE, DELETE, etc.) */
  queryType?: string;
  /** Database system (postgres, mysql, mongodb, etc.) */
  databaseSystem?: string;
  /** Table names involved */
  tables?: string[];
  /** Duration in milliseconds */
  duration: number;
  /** Number of rows affected/returned */
  rowCount?: number;
  /** Whether query was successful */
  success: boolean;
  /** Error (if any) */
  error?: Error;
}

/**
 * Logs a database query.
 * 
 * @param logger - Logger instance
 * @param info - Database query information
 */
export async function logDatabaseQuery(
  logger: Logger,
  info: DatabaseQueryInfo
): Promise<void> {
  const context = getLogContext() || {};
  
  // Create performance metrics with database query tracking
  const performanceMetrics = await createPerformanceMetrics(info.duration, {
    database: trackDatabaseQuery(
      info.duration,
      info.rowCount,
      info.queryType
    ),
  });
  
  // Set context for database query
  setLogContext({
    ...context,
    source: 'system',
    action: 'database_query',
    component: 'database',
    performanceMetrics,
    tags: {
      ...context.tags,
      query_type: info.queryType || 'unknown',
      database_system: info.databaseSystem || 'unknown',
      table_count: info.tables?.length || 0,
    },
  });
  
  // Sanitize query for logging (remove sensitive data from params)
  const sanitizedQuery = sanitizeQuery(info.query, info.params);
  
  const level = info.error || !info.success ? 'error' : 'debug';
  const message = `DB Query: ${info.queryType || 'UNKNOWN'} ${info.tables?.join(', ') || 'unknown tables'}`;
  
  logger[level](message, info.error, {
    database_query: {
      query: sanitizedQuery,
      queryType: info.queryType,
      databaseSystem: info.databaseSystem,
      tables: info.tables,
      duration: info.duration,
      rowCount: info.rowCount,
      success: info.success,
    },
  });
}

/**
 * Sanitizes query parameters for logging (removes sensitive data).
 */
function sanitizeQuery(query: string, params?: unknown[]): string {
  if (!params || params.length === 0) {
    return query;
  }
  
  // Replace parameter placeholders with sanitized values
  let sanitized = query;
  params.forEach((param, index) => {
    const placeholder = `$${index + 1}`;
    const sanitizedValue = sanitizeParam(param);
    sanitized = sanitized.replace(placeholder, sanitizedValue);
  });
  
  return sanitized;
}

/**
 * Sanitizes a single parameter value.
 */
function sanitizeParam(param: unknown): string {
  if (param === null || param === undefined) {
    return 'NULL';
  }
  
  if (typeof param === 'string') {
    // Check for potential sensitive data patterns
    if (/\b(password|secret|token|key|api[_-]?key)\b/i.test(param)) {
      return '[REDACTED]';
    }
    // Truncate long strings
    if (param.length > 100) {
      return `'${param.substring(0, 100)}...'`;
    }
    return `'${param}'`;
  }
  
  if (typeof param === 'number' || typeof param === 'boolean') {
    return String(param);
  }
  
  if (typeof param === 'object') {
    return '[OBJECT]';
  }
  
  return String(param);
}

