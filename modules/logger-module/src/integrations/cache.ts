/**
 * Cache logging integration.
 * 
 * Provides utilities for tracking cache operations (hit/miss/invalidate).
 */

import type { Logger } from '../logger';
import { setLogContext, getLogContext } from '../context';
import { createPerformanceMetrics } from '../helpers/performance-tracking';

/**
 * Cache operation types.
 */
export type CacheOperation = 'get' | 'set' | 'delete' | 'invalidate' | 'clear';

/**
 * Cache operation result.
 */
export type CacheResult = 'hit' | 'miss' | 'error' | 'success';

/**
 * Cache operation information.
 */
export interface CacheOperationInfo {
  /** Cache key */
  key: string;
  /** Operation type */
  operation: CacheOperation;
  /** Result */
  result: CacheResult;
  /** Cache system (redis, memcached, etc.) */
  cacheSystem?: string;
  /** Duration in milliseconds */
  duration: number;
  /** Value size in bytes (if applicable) */
  valueSize?: number;
  /** TTL in seconds (if applicable) */
  ttl?: number;
  /** Error (if any) */
  error?: Error;
}

/**
 * Logs a cache operation.
 * 
 * @param logger - Logger instance
 * @param info - Cache operation information
 */
export async function logCacheOperation(
  logger: Logger,
  info: CacheOperationInfo
): Promise<void> {
  const context = getLogContext() || {};
  
  // Create performance metrics
  const performanceMetrics = await createPerformanceMetrics(info.duration);
  
  // Set context for cache operation
  setLogContext({
    ...context,
    source: 'system',
    action: `cache_${info.operation}`,
    component: 'cache',
    performanceMetrics,
    cacheStatus: {
      hit: info.result === 'hit',
      miss: info.result === 'miss',
      status: info.result === 'hit' ? 'hit' : info.result === 'miss' ? 'miss' : 'unknown',
    },
    tags: {
      ...context.tags,
      cache_system: info.cacheSystem || 'unknown',
      cache_key: info.key,
      cache_result: info.result,
    },
  });
  
  const level = info.error || info.result === 'error' ? 'error' : 'debug';
  const message = `Cache ${info.operation}: ${info.key} (${info.result})`;
  
  logger[level](message, info.error, {
    cache: {
      key: info.key,
      operation: info.operation,
      result: info.result,
      cacheSystem: info.cacheSystem,
      duration: info.duration,
      valueSize: info.valueSize,
      ttl: info.ttl,
    },
  });
}

