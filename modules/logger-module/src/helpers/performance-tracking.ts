/**
 * Performance tracking utilities.
 * 
 * Provides helpers for capturing and tracking performance metrics.
 */

import type { PerformanceMetrics } from '../types/logger';
import { isNode } from '../utils/environment';

/**
 * Gets current memory usage (Node.js only).
 * 
 * @returns Memory usage object or undefined if not available
 */
export function getMemoryUsage(): PerformanceMetrics['memory'] | undefined {
  if (!isNode()) {
    return undefined;
  }
  
  try {
    const usage = require('process').memoryUsage();
    return {
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      rss: usage.rss,
    };
  } catch {
    return undefined;
  }
}

/**
 * Gets event loop lag (Node.js only).
 * 
 * @returns Event loop lag in milliseconds or undefined if not available
 */
export function getEventLoopLag(): Promise<number | undefined> {
  if (!isNode()) {
    return Promise.resolve(undefined);
  }
  
  return new Promise((resolve) => {
    const start = process.hrtime.bigint();
    setImmediate(() => {
      const delta = process.hrtime.bigint() - start;
      const lagMs = Number(delta) / 1_000_000; // Convert nanoseconds to milliseconds
      resolve(lagMs);
    });
  });
}

/**
 * Creates performance metrics object with current system metrics.
 * 
 * @param duration - Operation duration in milliseconds
 * @param additionalMetrics - Additional metrics to include
 * @returns Performance metrics object
 * 
 * @example
 * const metrics = await createPerformanceMetrics(150, {
 *   database: { queryDuration: 45, rowCount: 100 }
 * });
 */
export async function createPerformanceMetrics(
  duration: number,
  additionalMetrics?: Partial<PerformanceMetrics>
): Promise<PerformanceMetrics> {
  const metrics: PerformanceMetrics = {
    duration,
    ...additionalMetrics,
  };
  
  // Add memory usage if available
  if (isNode()) {
    const memory = getMemoryUsage();
    if (memory) {
      metrics.memory = memory;
    }
    
    // Add event loop lag
    const eventLoopLag = await getEventLoopLag();
    if (eventLoopLag !== undefined) {
      metrics.eventLoopLag = eventLoopLag;
    }
  }
  
  return metrics;
}

/**
 * Tracks database query performance.
 * 
 * @param queryDuration - Query duration in milliseconds
 * @param rowCount - Number of rows returned
 * @param queryType - Type of query (SELECT, INSERT, UPDATE, DELETE)
 * @returns Database performance metrics
 */
export function trackDatabaseQuery(
  queryDuration: number,
  rowCount?: number,
  queryType?: string
): PerformanceMetrics['database'] {
  return {
    queryDuration,
    rowCount,
    queryType,
  };
}

/**
 * Tracks external API call performance.
 * 
 * @param duration - API call duration in milliseconds
 * @param statusCode - HTTP status code
 * @param retries - Number of retries attempted
 * @returns API call performance metrics
 */
export function trackApiCall(
  duration: number,
  statusCode?: number,
  retries?: number
): PerformanceMetrics['apiCall'] {
  return {
    duration,
    statusCode,
    retries,
  };
}

/**
 * Tracks connection pool statistics.
 * 
 * @param active - Number of active connections
 * @param idle - Number of idle connections
 * @param waiting - Number of connections waiting
 * @returns Connection pool metrics
 */
export function trackConnectionPool(
  active: number,
  idle: number,
  waiting: number
): PerformanceMetrics['connectionPool'] {
  return {
    active,
    idle,
    waiting,
  };
}

