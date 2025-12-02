/**
 * Performance monitoring utilities.
 * 
 * Provides built-in timing and counters for performance tracking.
 */

export interface PerformanceMetrics {
  [operation: string]: {
    count: number;
    totalDuration: number;
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
    errors: number;
    errorRate: number;
  };
}

class PerformanceMonitor {
  private metrics: Map<string, {
    count: number;
    totalDuration: number;
    minDuration: number;
    maxDuration: number;
    errors: number;
  }> = new Map();

  /**
   * Records a metric for an operation.
   */
  record(operation: string, duration: number, isError: boolean = false): void {
    const existing = this.metrics.get(operation) || {
      count: 0,
      totalDuration: 0,
      minDuration: Infinity,
      maxDuration: 0,
      errors: 0,
    };

    this.metrics.set(operation, {
      count: existing.count + 1,
      totalDuration: existing.totalDuration + duration,
      minDuration: Math.min(existing.minDuration, duration),
      maxDuration: Math.max(existing.maxDuration, duration),
      errors: existing.errors + (isError ? 1 : 0),
    });
  }

  /**
   * Gets all metrics.
   */
  getMetrics(): PerformanceMetrics {
    const result: PerformanceMetrics = {};

    for (const [operation, metrics] of this.metrics.entries()) {
      result[operation] = {
        count: metrics.count,
        totalDuration: metrics.totalDuration,
        avgDuration: metrics.totalDuration / metrics.count,
        minDuration: metrics.minDuration === Infinity ? 0 : metrics.minDuration,
        maxDuration: metrics.maxDuration,
        errors: metrics.errors,
        errorRate: metrics.errors / metrics.count,
      };
    }

    return result;
  }

  /**
   * Resets all metrics.
   */
  reset(): void {
    this.metrics.clear();
  }

  /**
   * Gets metrics for a specific operation.
   */
  getOperationMetrics(operation: string): PerformanceMetrics[string] | undefined {
    const all = this.getMetrics();
    return all[operation];
  }
}

// Singleton instance
let performanceMonitor: PerformanceMonitor | null = null;

/**
 * Gets the performance monitor instance.
 */
export function getPerformanceMonitor(): PerformanceMonitor {
  if (!performanceMonitor) {
    performanceMonitor = new PerformanceMonitor();
  }
  return performanceMonitor;
}

/**
 * Records a performance metric.
 */
export function recordMetric(operation: string, duration: number, isError: boolean = false): void {
  getPerformanceMonitor().record(operation, duration, isError);
}

/**
 * Gets all performance metrics.
 */
export function getMetrics(): PerformanceMetrics {
  return getPerformanceMonitor().getMetrics();
}

/**
 * Resets all performance metrics.
 */
export function resetMetrics(): void {
  getPerformanceMonitor().reset();
}

/**
 * Times an async operation and records the metric.
 */
export async function timeOperation<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - startTime;
    recordMetric(operation, duration, false);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    recordMetric(operation, duration, true);
    throw error;
  }
}

/**
 * Times a synchronous operation and records the metric.
 */
export function timeOperationSync<T>(
  operation: string,
  fn: () => T
): T {
  const startTime = Date.now();
  try {
    const result = fn();
    const duration = Date.now() - startTime;
    recordMetric(operation, duration, false);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    recordMetric(operation, duration, true);
    throw error;
  }
}

